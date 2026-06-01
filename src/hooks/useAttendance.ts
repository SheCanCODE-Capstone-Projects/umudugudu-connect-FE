import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getActivityAttendance, saveAttendance, syncAttendance } from '@/lib/api/attendance';
import type { AttendanceRecord, AttendanceStatus } from '@/types';

const OFFLINE_KEY = 'attendance_offline_queue';

type OfflineEntry = { activityId: string; records: { citizenId: string; status: AttendanceStatus }[] };

function getQueue(): OfflineEntry[] {
  try { return JSON.parse(localStorage.getItem(OFFLINE_KEY) ?? '[]'); } catch { return []; }
}
function setQueue(q: OfflineEntry[]) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(q));
}

export function useActivityAttendance(activityId: string) {
  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', activityId],
    queryFn: () => getActivityAttendance(activityId),
    enabled: !!activityId,
  });
}

export function useSaveAttendance(activityId: string) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (records: { citizenId: string; status: AttendanceStatus }[]) =>
      saveAttendance(activityId, records),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance', activityId] }),
    onError: (_err, records) => {
      const q = getQueue();
      q.push({ activityId, records });
      setQueue(q);
    },
  });

  // sync offline queue when back online
  useEffect(() => {
    const sync = async () => {
      const q = getQueue();
      if (!q.length) return;
      const remaining: OfflineEntry[] = [];
      for (const entry of q) {
        try {
          await syncAttendance(entry.activityId, entry.records);
          qc.invalidateQueries({ queryKey: ['attendance', entry.activityId] });
        } catch {
          remaining.push(entry);
        }
      }
      setQueue(remaining);
    };
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, [qc]);

  return mutation;
}
