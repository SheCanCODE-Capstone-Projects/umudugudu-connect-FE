import { useAppSelector, useAppDispatch } from './redux';
import {
  fetchActivities,
  fetchActivityById,
  addActivity,
  clearSelectedActivity,
  clearMessages,
} from '@/store/slices/activitiesSlice';
import type { ActivitySearchParams, CreateActivityPayload } from '@/types';

export const useActivities = () => {
  const dispatch = useAppDispatch();
  const { activities, selectedActivity, loading, error, successMessage } =
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

  const resetSelectedActivity = () => {
    dispatch(clearSelectedActivity());
  };

  const resetMessages = () => {
    dispatch(clearMessages());
  };

  return {
    activities,
    selectedActivity,
    loading,
    error,
    successMessage,
    searchActivities,
    getActivityById,
    createActivity,
    resetSelectedActivity,
    resetMessages,
  };
};