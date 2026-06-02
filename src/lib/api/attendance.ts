import api from './client';
import type { AttendanceRecord, AttendanceStatus, ApiResponse } from '@/types';

// GET /api/activities/{activityId}/attendance
export const getActivityAttendance = async (activityId: string): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>(`/activities/${activityId}/attendance`);
  return res.data.data;
};

// POST /api/activities/{activityId}/attendance
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

// POST /api/activities/{activityId}/attendance/sync
export const syncAttendance = async (
  activityId: string,
  records: { citizenId: string; status: AttendanceStatus }[]
): Promise<AttendanceRecord[]> => {
  const res = await api.post<ApiResponse<AttendanceRecord[]>>(
    `/activities/${activityId}/attendance/sync`,
    { records }
  );
  return res.data.data;
};

// GET /api/isibos/{isiboId}/attendance
export const getIsiboAttendance = async (isiboId: string): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>(`/isibos/${isiboId}/attendance`);
  return res.data.data;
};

// GET /api/citizens/{citizenId}/attendance
export const getCitizenAttendance = async (citizenId: string): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>(`/citizens/${citizenId}/attendance`);
  return res.data.data;
};

// GET /api/activities/{activityId}/attendance/absent
export const getAbsentees = async (activityId: string): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>(`/activities/${activityId}/attendance/absent`);
  return res.data.data;
};
