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

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const unwrap = (value: unknown): unknown => {
  const body = asRecord(value);
  return 'data' in body ? body.data : value;
};

const stringValue = (source: Record<string, unknown>, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return fallback;
};

const numberValue = (source: Record<string, unknown>, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }
  return fallback;
};

const normalizeCitizenPenalty = (value: unknown): CitizenPenaltyView => {
  const row = asRecord(value);
  return {
    id: stringValue(row, ['id', 'penaltyId']),
    activityTitle: stringValue(row, ['activityTitle', 'title', 'activityName'], 'Community penalty'),
    amountRwf: numberValue(row, ['amountRwf', 'amount', 'amountRwfs']),
    status: (stringValue(row, ['status'], 'UNPAID') as CitizenPenaltyView['status']) || 'UNPAID',
    reason: stringValue(row, ['reason', 'description']) || undefined,
    paidAt: stringValue(row, ['paidAt', 'paymentDate']) || undefined,
    dueDate: stringValue(row, ['dueDate', 'dueAt', 'createdAt']) || undefined,
  };
};

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
  const response = await apiClient.get('/penalties/my');
  const data = unwrap(response.data);
  const body = asRecord(data);
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(body.content)
      ? body.content
      : Array.isArray(body.penalties)
        ? body.penalties
        : [];
  return rows.map(normalizeCitizenPenalty);
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
