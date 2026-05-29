import apiClient from './client';
import type {
  AdminDashboardData,
  VillageDrillDown,
  AuditLogEntry,
  AuditLogParams,
  ApiResponse,
  PageResponse,
  User,
} from '@/types';

export const getAdminDashboard = async (): Promise<AdminDashboardData> => {
  const res = await apiClient.get<ApiResponse<AdminDashboardData>>('/admin/dashboard');
  return res.data.data;
};

export const getVillageDrillDown = async (villageId: string): Promise<VillageDrillDown> => {
  const res = await apiClient.get<ApiResponse<VillageDrillDown>>(`/admin/villages/${villageId}`);
  return res.data.data;
};

export const getAuditLog = async (params: AuditLogParams): Promise<PageResponse<AuditLogEntry>> => {
  const res = await apiClient.get<ApiResponse<PageResponse<AuditLogEntry>>>('/admin/audit-log', { params });
  return res.data.data;
};

export const deactivateUser = async (userId: string): Promise<User> => {
  const res = await apiClient.patch<ApiResponse<User>>(`/users/${userId}/deactivate`);
  return res.data.data;
};

export const activateUser = async (userId: string): Promise<User> => {
  const res = await apiClient.patch<ApiResponse<User>>(`/users/${userId}/activate`);
  return res.data.data;
};
