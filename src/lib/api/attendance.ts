import api from './client';
import type { AttendanceRecord, AttendanceStatus, ApiResponse } from '@/types';

export const getActivityMembers = async (activityId: string): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>(`/activities/${activityId}/attendance`);
  return res.data.data;
};

export const saveAttendance = async (
  activityId: string,
  records: { citizenId: string; status: AttendanceStatus }[]
): Promise<AttendanceRecord[]> => {
  const res = await api.post<ApiResponse<AttendanceRecord[]>>(
    `/activities/${activityId}/attendance`,
    { records }
  );
  return res.data.data;
};
