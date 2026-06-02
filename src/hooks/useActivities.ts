import { useAppSelector, useAppDispatch } from './redux';
import {
  fetchActivities,
  fetchActivityById,
  addActivity,
  fetchActivityPerformance,
  clearSelectedActivity,
  clearPerformance,
  clearMessages,
} from '@/store/slices/activitiesSlice';
import type { ActivitySearchParams, CreateActivityPayload } from '@/types';

export const useActivities = () => {
  const dispatch = useAppDispatch();
  const { activities, selectedActivity, performance, loading, error, successMessage } =
    useAppSelector((state) => state.activities);

  const searchActivities = (params: ActivitySearchParams) => {
    dispatch(fetchActivities(params));
  };

  const getActivityById = (activityId: string) => {
    dispatch(fetchActivityById(activityId));
  };

  const createActivity = (payload: CreateActivityPayload) => {
    dispatch(addActivity(payload));
  };

  const getPerformance = (activityId: string) => {
    dispatch(fetchActivityPerformance(activityId));
  };

  const resetSelectedActivity = () => {
    dispatch(clearSelectedActivity());
  };

  const resetPerformance = () => {
    dispatch(clearPerformance());
  };

  const resetMessages = () => {
    dispatch(clearMessages());
  };

  return {
    activities,
    selectedActivity,
    performance,
    loading,
    error,
    successMessage,
    searchActivities,
    getActivityById,
    createActivity,
    getPerformance,
    resetSelectedActivity,
    resetPerformance,
    resetMessages,
  };
};
