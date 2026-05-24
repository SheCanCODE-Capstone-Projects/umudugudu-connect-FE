import { useAppSelector, useAppDispatch } from './redux';
import {
  fetchPenalties,
  fetchPenaltyById,
  createPenalty,
  createExemption,
  clearSelectedPenalty,
  clearMessages,
} from '@/store/slices/penaltiesSlice';
import type { PenaltySearchParams, AssignPenaltyPayload, ExemptionPayload } from '@/types';

export const usePenalties = () => {
  const dispatch = useAppDispatch();
  const { penalties, selectedPenalty, loading, error, successMessage } =
    useAppSelector((state) => state.penalties);

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

  const resetSelectedPenalty = () => {
    dispatch(clearSelectedPenalty());
  };

  const resetMessages = () => {
    dispatch(clearMessages());
  };

  return {
    penalties,
    selectedPenalty,
    loading,
    error,
    successMessage,
    searchPenalties,
    getPenaltyById,
    assignPenalty,
    exemptAbsence,
    resetSelectedPenalty,
    resetMessages,
  };
};