import api from './client';
import type { EmergencyReport, EmergencyType, ApiResponse } from '@/types';

// GET /api/v1/emergency
export const getEmergencies = async (): Promise<EmergencyReport[]> => {
  const res = await api.get<ApiResponse<EmergencyReport[]>>('/emergency');
  return res.data.data;
};

// POST /api/v1/emergency/report
export const reportEmergency = async (payload: {
  type:        EmergencyType;
  description: string;
  location?:   string;
}): Promise<EmergencyReport> => {
  const res = await api.post<ApiResponse<EmergencyReport>>('/emergency/report', payload);
  return res.data.data;
};

// POST /api/v1/emergency/{id}/broadcast
export const broadcastEmergency = async (id: string): Promise<EmergencyReport> => {
  const res = await api.post<ApiResponse<EmergencyReport>>(`/emergency/${id}/broadcast`);
  return res.data.data;
};
