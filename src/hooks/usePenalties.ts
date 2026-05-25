import { useAppSelector, useAppDispatch } from './redux';
import {
  fetchPenalties,
  fetchPenaltyById,
  createPenalty,
  createExemption,
  fetchMyPenalties,
  fetchIsiboPenalties,
  clearSelectedPenalty,
  clearIsiboOverview,
  clearMessages,
} from '@/store/slices/penaltiesSlice';
import type { PenaltySearchParams, AssignPenaltyPayload, ExemptionPayload } from '@/types';

export const usePenalties = () => {
  const dispatch = useAppDispatch();
  const {
    penalties,
    myPenalties,
    isiboOverview,
    selectedPenalty,
    loading,
    error,
    successMessage,
  } = useAppSelector((state) => state.penalties);

  const searchPenalties = (params: PenaltySearchParams) => {
    dispatch(fetchPenalties(params));
  };

  const getPenaltyById = (penaltyId: string) => {
    dispatch(fetchPenaltyById(penaltyId));
  };

  const assignPenalty = (payload: AssignPenaltyPayload) => {
    dispatch(createPenalty(payload));
  };

  const exemptAbsence = (payload: ExemptionPayload) => {
    dispatch(createExemption(payload));
  };

  const getMyPenalties = () => {
    dispatch(fetchMyPenalties());
  };

  const getIsiboPenalties = (isiboId: string) => {
    dispatch(fetchIsiboPenalties(isiboId));
  };

  const resetSelectedPenalty = () => {
    dispatch(clearSelectedPenalty());
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
    selectedPenalty,
    loading,
    error,
    successMessage,
    searchPenalties,
    getPenaltyById,
    assignPenalty,
    exemptAbsence,
    getMyPenalties,
    getIsiboPenalties,
    resetSelectedPenalty,
    resetIsiboOverview,
    resetMessages,
  };
};