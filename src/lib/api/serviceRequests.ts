import api from './client';
import type { ServiceRequest, RequestType, ApiResponse, PageResponse } from '@/types';

export const getMyRequests = async (): Promise<ServiceRequest[]> => {
  const res = await api.get<ApiResponse<PageResponse<ServiceRequest>>>('/service-requests/my');
  return res.data.data.content;
};

// Isibo Leader queue
export const getMyQueue = async (): Promise<ServiceRequest[]> => {
  const res = await api.get<ApiResponse<PageResponse<ServiceRequest>>>('/service-requests/queue');
  return res.data.data.content;
};

// Village Leader / Admin — all queues
export const getAllQueue = async (): Promise<ServiceRequest[]> => {
  const res = await api.get<ApiResponse<PageResponse<ServiceRequest>>>('/service-requests/queue/all');
  return res.data.data.content;
};

export const submitRequest = async (payload: {
  type: RequestType;
  description: string;
}): Promise<ServiceRequest> => {
  const res = await api.post<ApiResponse<ServiceRequest>>('/service-requests', payload);
  return res.data.data;
};

export const reviewRequest = async (
  id: string,
  payload: { action: 'APPROVE' | 'REJECT' | 'INFO_REQUIRED'; response: string }
): Promise<ServiceRequest> => {
  const res = await api.put<ApiResponse<ServiceRequest>>(`/service-requests/${id}/review`, payload);
  return res.data.data;
};
