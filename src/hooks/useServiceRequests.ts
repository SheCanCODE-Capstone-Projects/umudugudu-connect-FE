import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyRequests, getPendingRequests, submitRequest, reviewRequest } from '@/lib/api/serviceRequests';
import type { RequestType } from '@/types';

export function useMyRequests() {
  return useQuery({ queryKey: ['service-requests', 'my'], queryFn: getMyRequests });
}

export function usePendingRequests() {
  return useQuery({ queryKey: ['service-requests', 'pending'], queryFn: getPendingRequests });
}

export function useSubmitRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: RequestType; description: string }) => submitRequest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-requests', 'my'] }),
  });
}

export function useReviewRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, response }: { id: string; action: 'APPROVE' | 'REJECT' | 'INFO_REQUIRED'; response: string }) =>
      reviewRequest(id, { action, response }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-requests', 'pending'] }),
  });
}
