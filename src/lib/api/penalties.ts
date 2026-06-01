import apiClient from './client';
import type {
  Penalty,
  AssignPenaltyPayload,
  CitizenPenaltyView,
  IsiboPenaltyOverview,
  ApiResponse,
  PageResponse,
} from '@/types';

// PUT /api/v1/penalties/{id}/waive
export const waivePenalty = async (id: string): Promise<Penalty> => {
  const response = await apiClient.put<ApiResponse<Penalty>>(`/penalties/${id}/waive`);
  return response.data.data;
};

// POST /api/v1/penalties
export const assignPenalty = async (payload: AssignPenaltyPayload): Promise<Penalty> => {
  const response = await apiClient.post<ApiResponse<Penalty>>('/penalties', payload);
  return response.data.data;
};

// GET /api/v1/penalties/village
export const getVillagePenalties = async (): Promise<PageResponse<Penalty>> => {
  const response = await apiClient.get<ApiResponse<PageResponse<Penalty>>>('/penalties/village');
  return response.data.data;
};

// GET /api/v1/penalties/my
export const getMyPenalties = async (): Promise<CitizenPenaltyView[]> => {
  const response = await apiClient.get<ApiResponse<CitizenPenaltyView[]>>('/penalties/my');
  return response.data.data;
};

// GET /api/v1/penalties/isibo
export const getIsiboPenalties = async (): Promise<IsiboPenaltyOverview> => {
  const response = await apiClient.get<ApiResponse<IsiboPenaltyOverview>>('/penalties/isibo');
  return response.data.data;
};