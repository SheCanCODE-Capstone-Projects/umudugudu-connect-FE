'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuditLog } from '@/hooks/useAdmin';
import { formatDateTime } from '@/lib/utils/format';
import { useRedirectLoggedOut } from '@/components/shared/LogoutButton';
import type { AuditActionType, AuditLogParams } from '@/types';

const ACTION_LABELS: Record<AuditActionType, string> = {
  ROLE_CHANGE:        'Role Change',
  PENALTY_ASSIGNED:   'Penalty Assigned',
  PAYMENT_CONFIRMED:  'Payment Confirmed',
  EMERGENCY_REPORTED: 'Emergency Reported',
  USER_DEACTIVATED:   'User Deactivated',
  USER_ACTIVATED:     'User Activated',
};

const ACTION_TYPES = Object.keys(ACTION_LABELS) as AuditActionType[];

export default function AuditLogPage() {
  useRedirectLoggedOut();
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [actionType, setActionType] = useState<AuditActionType | ''>('');
  const [page, setPage] = useState(0);

  const params: AuditLogParams = {
    ...(userId.trim() && { userId: userId.trim() }),
    ...(actionType && { actionType }),
    page,
    size: 20,
  };

  const { data, isLoading, error } = useAuditLog(params);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">System Audit Log</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Filter by user ID..."
          value={userId}
          onChange={(e) => { setUserId(e.target.value); setPage(0); }}
          className="input-field max-w-xs"
        />
        <select
          value={actionType}
          onChange={(e) => { setActionType(e.target.value as AuditActionType | ''); setPage(0); }}
          className="input-field max-w-xs"
        >
          <option value="">All action types</option>
          {ACTION_TYPES.map((t) => (
            <option key={t} value={t}>{ACTION_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading audit log...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">Failed to load audit log</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Timestamp</th>
                <th className="pb-2 pr-4">Acting User</th>
                <th className="pb-2 pr-4">Action</th>
                <th className="pb-2 pr-4">Target</th>
                <th className="pb-2 pr-4">Before</th>
                <th className="pb-2">After</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {formatDateTime(entry.createdAt)}
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900">{entry.actingUserName}</td>
                  <td className="py-3 pr-4">
                    <span className="badge-blue">{ACTION_LABELS[entry.actionType]}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{entry.targetEntity}</td>
                  <td className="py-3 pr-4 text-gray-400">{entry.beforeValue ?? '—'}</td>
                  <td className="py-3 text-gray-700">{entry.afterValue ?? '—'}</td>
                </tr>
              ))}
              {data?.content.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No entries found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page + 1 >= data.totalPages}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
