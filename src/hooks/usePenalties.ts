import { useAppSelector, useAppDispatch } from './redux';
import {
  fetchVillagePenalties,
  createPenalty,
  waiverPenalty,
  fetchMyPenalties,
  fetchIsiboPenalties,
  clearIsiboOverview,
  clearMessages,
} from '@/store/slices/penaltiesSlice';
import type { AssignPenaltyPayload } from '@/types';

export const usePenalties = () => {
  const dispatch = useAppDispatch();
  const {
    penalties,
    myPenalties,
    isiboOverview,
    loading,
    error,
    successMessage,
  } = useAppSelector((state) => state.penalties);

  const searchPenalties = () => {
    dispatch(fetchVillagePenalties());
  };

  const assignPenalty = (payload: AssignPenaltyPayload) => {
    dispatch(createPenalty(payload));
  };

  const waivePenalty = (id: string) => {
    dispatch(waiverPenalty(id));
  };

  const getMyPenalties = () => {
    dispatch(fetchMyPenalties());
  };

  const getIsiboPenalties = () => {
    dispatch(fetchIsiboPenalties());
  };

  const resetIsiboOverview = () => {
    dispatch(clearIsiboOverview());
  };

  const resetMessages = () => {
    dispatch(clearMessages());
  };

  return {
    penalties,
    myPenalties,
    isiboOverview,
    loading,
    error,
    successMessage,
    searchPenalties,
    assignPenalty,
    waivePenalty,
    getMyPenalties,
    getIsiboPenalties,
    resetIsiboOverview,
    resetMessages,
  };
};