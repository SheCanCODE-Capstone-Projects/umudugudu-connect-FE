import apiClient from './client';
import type {
  Penalty,
  AssignPenaltyPayload,
  ExemptionPayload,
  PenaltySearchParams,
  CitizenPenaltyView,
  IsiboPenaltyOverview,
  ApiResponse,
  PageResponse,
} from '@/types';

// Get all penalties
export const getPenalties = async (
  params: PenaltySearchParams
): Promise<PageResponse<Penalty>> => {
  const response = await apiClient.get<ApiResponse<PageResponse<Penalty>>>('/penalties', {
    params,
  });
  return response.data.data;
};

// Get single penalty by ID
export const getPenaltyById = async (penaltyId: string): Promise<Penalty> => {
  const response = await apiClient.get<ApiResponse<Penalty>>(`/penalties/${penaltyId}`);
  return response.data.data;
};

// Assign penalty to absent citizen
export const assignPenalty = async (
  payload: AssignPenaltyPayload
): Promise<Penalty> => {
  const response = await apiClient.post<ApiResponse<Penalty>>('/penalties', payload);
  return response.data.data;
};

// Mark absence as excused
export const markExemption = async (
  payload: ExemptionPayload
): Promise<void> => {
  await apiClient.post('/penalties/exemption', payload);
};

// Get citizen's own penalties (US-3.2)
export const getMyCitizenPenalties = async (): Promise<CitizenPenaltyView[]> => {
  const response = await apiClient.get<ApiResponse<CitizenPenaltyView[]>>(
    '/penalties/my-penalties'
  );
  return response.data.data;
};

// Get isibo penalty overview (US-3.3)
export const getIsiboPenalties = async (
  isiboId: string
): Promise<IsiboPenaltyOverview> => {
  const response = await apiClient.get<ApiResponse<IsiboPenaltyOverview>>(
    `/penalties/isibo/${isiboId}`
  );
  return response.data.data;
};