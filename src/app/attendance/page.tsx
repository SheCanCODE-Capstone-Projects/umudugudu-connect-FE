'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useActivityMembers, useSaveAttendance } from '@/hooks/useAttendance';
import type { AttendanceStatus } from '@/types';

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  PRESENT: 'badge-green',
  ABSENT:  'badge-red',
  EXCUSED: 'badge-yellow',
};

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'EXCUSED'];

export default function AttendancePage() {
  const searchParams  = useSearchParams();
  const activityId    = searchParams.get('activityId') ?? '';

  const { data: members = [], isLoading, isError } = useActivityMembers(activityId);
  const { mutate: save, isPending }                 = useSaveAttendance(activityId);

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const up   = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener('online',  up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  // seed local state from fetched data
  useEffect(() => {
    if (members.length) {
      setStatuses(Object.fromEntries(members.map((m) => [m.citizenId, m.status])));
    }
  }, [members]);

  const toggle = (citizenId: string, status: AttendanceStatus) =>
    setStatuses((prev) => ({ ...prev, [citizenId]: status }));

  const handleSave = () => {
    const records = Object.entries(statuses).map(([citizenId, status]) => ({ citizenId, status }));
    save(records);
  };

  if (!activityId) {
    return (
      <div className="p-6">
        <div className="card text-center py-12 text-gray-500">
          No activity selected. Open this page from an activity.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        {!isOnline && (
          <span className="badge-yellow text-xs px-3 py-1 rounded-full">
            Offline — will sync when connected
          </span>
        )}
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Loading members…</p>}
      {isError   && <p className="text-red-500 text-sm">Failed to load members.</p>}

      {!isLoading && members.length === 0 && (
        <div className="card text-center py-12 text-gray-400 text-sm">No members found for this activity.</div>
      )}

      {members.length > 0 && (
        <>
          <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
            {members.map((member) => {
              const current = statuses[member.citizenId] ?? member.status;
              return (
                <div key={member.citizenId} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-medium text-gray-800">{member.citizenName}</span>
                  <div className="flex gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggle(member.citizenId, s)}
                        className={`text-xs px-3 py-1 rounded-full font-medium border transition-all
                          ${current === s
                            ? STATUS_STYLES[s] + ' border-transparent'
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                          }`}
                      >
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="btn-primary"
            >
              {isPending ? 'Saving…' : 'Save Attendance'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
