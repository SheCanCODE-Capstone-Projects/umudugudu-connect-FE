'use client';

import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useMyRequests, useMyQueue, useAllQueue, useSubmitRequest, useReviewRequest } from '@/hooks/useServiceRequests';
import { formatDate } from '@/lib/utils/format';
import type { RequestType, RequestStatus, ServiceRequest } from '@/types';

const REQUEST_TYPES: { value: RequestType; label: string }[] = [
  { value: 'UBUDEHE',    label: 'Ubudehe Update' },
  { value: 'ASSISTANCE', label: 'Assistance' },
  { value: 'DOCUMENT',   label: 'Document' },
  { value: 'OTHER',      label: 'Other' },
];

const STATUS_STYLE: Record<RequestStatus, string> = {
  PENDING:       'badge-yellow',
  INFO_REQUIRED: 'badge-blue',
  APPROVED:      'badge-green',
  REJECTED:      'badge-red',
};

// ─── Citizen: Submit form (US-5.1) ────────────────────────────────
function SubmitForm() {
  const { mutate, isPending } = useSubmitRequest();
  const [type, setType]       = useState<RequestType>('UBUDEHE');
  const [desc, setDesc]       = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) { setError('Description is required'); return; }
    setError('');
    mutate({ type, description: desc }, { onSuccess: () => setDesc('') });
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 max-w-lg">
      <h2 className="text-lg font-bold text-gray-900">Submit a Request</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as RequestType)} className="input-field">
          {REQUEST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          placeholder="Describe your request…"
          className="input-field resize-none"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? 'Submitting…' : 'Submit Request'}
      </button>
    </form>
  );
}

// ─── Citizen: My requests list (US-5.3) ───────────────────────────
function MyRequests() {
  const { data: requests = [], isLoading } = useMyRequests();

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!requests.length) return <p className="text-sm text-gray-400 text-center py-8">No requests submitted yet.</p>;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="card space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{REQUEST_TYPES.find((t) => t.value === r.type)?.label ?? r.type}</span>
            <span className={STATUS_STYLE[r.status]}>{r.status.replace('_', ' ')}</span>
          </div>
          <p className="text-sm text-gray-600">{r.description}</p>
          <p className="text-xs text-gray-400">Submitted {formatDate(r.createdAt)}</p>
          {r.response && (
            <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
              <span className="font-medium">Leader response: </span>{r.response}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Leader: Review queue (US-5.2) ────────────────────────────────
function ReviewQueue({ role }: { role: 'ISIBO_LEADER' | 'VILLAGE_LEADER' | 'ADMIN' }) {
  const isibo   = useMyQueue();
  const all     = useAllQueue();
  const { data: requests = [], isLoading } = role === 'ISIBO_LEADER' ? isibo : all;
  const { mutate: review, isPending }      = useReviewRequest();
  const [selected, setSelected]            = useState<ServiceRequest | null>(null);
  const [response, setResponse]            = useState('');

  const handleAction = (action: 'APPROVE' | 'REJECT' | 'INFO_REQUIRED') => {
    if (!selected) return;
    review(
      { id: selected.id, action, response },
      { onSuccess: () => { setSelected(null); setResponse(''); } }
    );
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!requests.length) return <p className="text-sm text-gray-400 text-center py-8">No pending requests.</p>;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="card space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{r.citizenName}</p>
              <p className="text-xs text-gray-500">{REQUEST_TYPES.find((t) => t.value === r.type)?.label} · {formatDate(r.createdAt)}</p>
            </div>
            <span className={STATUS_STYLE[r.status]}>{r.status}</span>
          </div>
          <p className="text-sm text-gray-700">{r.description}</p>

          {selected?.id === r.id ? (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={2}
                placeholder="Add a comment or response…"
                className="input-field resize-none text-sm"
              />
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => handleAction('APPROVE')}      disabled={isPending} className="btn-primary text-sm py-1.5">Approve</button>
                <button onClick={() => handleAction('REJECT')}       disabled={isPending} className="btn-danger text-sm py-1.5">Reject</button>
                <button onClick={() => handleAction('INFO_REQUIRED')} disabled={isPending} className="btn-secondary text-sm py-1.5">Request Info</button>
                <button onClick={() => setSelected(null)} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setSelected(r)} className="btn-secondary text-sm py-1.5">Review</button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function ServiceRequestsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const isLeader  = user?.role === 'VILLAGE_LEADER' || user?.role === 'ISIBO_LEADER' || user?.role === 'ADMIN';
  const isCitizen = user?.role === 'CITIZEN';

  const [tab, setTab] = useState<'submit' | 'my'>('submit');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Service Requests</h1>

      {isCitizen && (
        <>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab('submit')} className={tab === 'submit' ? 'btn-primary' : 'btn-secondary'}>
              New Request
            </button>
            <button onClick={() => setTab('my')} className={tab === 'my' ? 'btn-primary' : 'btn-secondary'}>
              My Requests
            </button>
          </div>
          {tab === 'submit' ? <SubmitForm /> : <MyRequests />}
        </>
      )}

      {isLeader && (
        <>
          <p className="text-sm text-gray-500 mb-4">Review and action pending requests from citizens in your area.</p>
          <ReviewQueue role={user!.role as 'ISIBO_LEADER' | 'VILLAGE_LEADER' | 'ADMIN'} />
        </>
      )}
    </div>
  );
}
