'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminDashboard, useVillageDrillDown } from '@/hooks/useAdmin';
import { formatRwf } from '@/lib/utils/format';
import LogoutButton, { useRedirectLoggedOut } from '@/components/shared/LogoutButton';

export default function AdminDashboard() {
  useRedirectLoggedOut();

  const { data, isLoading, error } = useAdminDashboard();
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);
  const [districtFilter, setDistrictFilter] = useState('');

  const { data: drillDown, isLoading: drillLoading } = useVillageDrillDown(selectedVillageId);

  const filtered = data?.villages.filter((v) =>
    districtFilter ? v.villageName.toLowerCase().includes(districtFilter.toLowerCase()) : true
  ) ?? [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/users" className="btn-secondary text-sm">
            Manage Users
          </Link>
          <Link href="/dashboard/admin/audit-log" className="btn-secondary text-sm">
            Audit Log
          </Link>
          <LogoutButton showLabel />
        </div>
      </div>

      {/* Summary KPIs */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading dashboard...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Failed to load dashboard data</div>
      ) : data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-gray-500">Avg Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-600">{data.totalAttendanceRate.toFixed(1)}%</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Total Payments Collected</p>
              <p className="text-2xl font-bold text-green-600">{formatRwf(data.totalCollectedRwf)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Open Service Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{data.totalOpenRequests}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter by village / district..."
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="input-field max-w-xs"
            />
          </div>

          {/* Village Table */}
          <div className="card overflow-x-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Village KPIs</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 pr-4">Village</th>
                  <th className="pb-2 pr-4">Attendance %</th>
                  <th className="pb-2 pr-4">Payments (RWF)</th>
                  <th className="pb-2 pr-4">Open Requests</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.villageId} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{v.villageName}</td>
                    <td className="py-3 pr-4">
                      <span className={v.attendanceRate < 60 ? 'badge-red' : 'badge-green'}>
                        {v.attendanceRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{formatRwf(v.paymentsCollectedRwf)}</td>
                    <td className="py-3 pr-4">
                      <span className={v.openServiceRequests > 5 ? 'badge-yellow' : 'badge-blue'}>
                        {v.openServiceRequests}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setSelectedVillageId(
                          selectedVillageId === v.villageId ? null : v.villageId
                        )}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {selectedVillageId === v.villageId ? 'Hide' : 'Drill down'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">No villages found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Drill-down panel */}
          {selectedVillageId && (
            <div className="card mt-4">
              {drillLoading ? (
                <p className="text-gray-400 text-sm">Loading village details...</p>
              ) : drillDown ? (
                <>
                  <h3 className="font-bold text-gray-900 mb-4">{drillDown.villageName} — Detail</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top Penalties</p>
                      {drillDown.topPenalties.length === 0 ? (
                        <p className="text-sm text-gray-400">None</p>
                      ) : (
                        <ul className="space-y-1">
                          {drillDown.topPenalties.map((p, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{p.citizenName}</span>
                              <span className="font-medium text-red-600">{formatRwf(p.amountRwf)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Low-Attendance Isibs</p>
                      {drillDown.lowAttendanceIsibs.length === 0 ? (
                        <p className="text-sm text-gray-400">None</p>
                      ) : (
                        <ul className="space-y-1">
                          {drillDown.lowAttendanceIsibs.map((isibo, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{isibo.isiboName}</span>
                              <span className="badge-red">{isibo.attendanceRate.toFixed(1)}%</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
