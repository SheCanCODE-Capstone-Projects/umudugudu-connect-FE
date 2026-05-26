import apiClient from './client';
import type {
  Activity,
  CreateActivityPayload,
  ActivitySearchParams,
<<<<<<< HEAD
  ActivityPerformance,
=======
>>>>>>> origin/main
  ApiResponse,
  PageResponse,
} from '@/types';

// Get all activities
export const getActivities = async (
  params: ActivitySearchParams
): Promise<PageResponse<Activity>> => {
  const response = await apiClient.get<ApiResponse<PageResponse<Activity>>>('/activities', {
    params,
  });
  return response.data.data;
};

// Get single activity by ID
export const getActivityById = async (activityId: string): Promise<Activity> => {
  const response = await apiClient.get<ApiResponse<Activity>>(`/activities/${activityId}`);
  return response.data.data;
};

// Create a new activity
export const createActivity = async (
  payload: CreateActivityPayload
): Promise<Activity> => {
  const response = await apiClient.post<ApiResponse<Activity>>('/activities', payload);
  return response.data.data;
<<<<<<< HEAD
};

// Get activity performance dashboard
export const getActivityPerformance = async (
  activityId: string
): Promise<ActivityPerformance> => {
  const response = await apiClient.get<ApiResponse<ActivityPerformance>>(
    `/activities/${activityId}/performance`
  );
  return response.data.data;
=======
>>>>>>> origin/main
};