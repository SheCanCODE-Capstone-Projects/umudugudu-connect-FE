import { useAppSelector, useAppDispatch } from './redux';
import {
  fetchActivities,
  fetchActivityById,
  addActivity,
<<<<<<< HEAD
  fetchActivityPerformance,
  clearSelectedActivity,
  clearPerformance,
=======
  clearSelectedActivity,
>>>>>>> origin/main
  clearMessages,
} from '@/store/slices/activitiesSlice';
import type { ActivitySearchParams, CreateActivityPayload } from '@/types';

export const useActivities = () => {
  const dispatch = useAppDispatch();
<<<<<<< HEAD
  const { activities, selectedActivity, performance, loading, error, successMessage } =
=======
  const { activities, selectedActivity, loading, error, successMessage } =
>>>>>>> origin/main
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

<<<<<<< HEAD
  const getPerformance = (activityId: string) => {
    dispatch(fetchActivityPerformance(activityId));
  };

=======
>>>>>>> origin/main
  const resetSelectedActivity = () => {
    dispatch(clearSelectedActivity());
  };

<<<<<<< HEAD
  const resetPerformance = () => {
    dispatch(clearPerformance());
  };

=======
>>>>>>> origin/main
  const resetMessages = () => {
    dispatch(clearMessages());
  };

  return {
    activities,
    selectedActivity,
<<<<<<< HEAD
    performance,
=======
>>>>>>> origin/main
    loading,
    error,
    successMessage,
    searchActivities,
    getActivityById,
    createActivity,
<<<<<<< HEAD
    getPerformance,
    resetSelectedActivity,
    resetPerformance,
=======
    resetSelectedActivity,
>>>>>>> origin/main
    resetMessages,
  };
};