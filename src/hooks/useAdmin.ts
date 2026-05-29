import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminDashboard, getVillageDrillDown, getAuditLog, deactivateUser, activateUser } from '@/lib/api/admin';
import type { AuditLogParams } from '@/types';
import toast from 'react-hot-toast';

export const useAdminDashboard = () =>
  useQuery({ queryKey: ['admin-dashboard'], queryFn: getAdminDashboard });

export const useVillageDrillDown = (villageId: string | null) =>
  useQuery({
    queryKey: ['village-drilldown', villageId],
    queryFn: () => getVillageDrillDown(villageId!),
    enabled: !!villageId,
  });

export const useAuditLog = (params: AuditLogParams) =>
  useQuery({ queryKey: ['audit-log', params], queryFn: () => getAuditLog(params) });

export const useToggleUserActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      isActive ? deactivateUser(userId) : activateUser(userId),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(`${user.fullName} ${user.isActive ? 'activated' : 'deactivated'}`);
    },
    onError: () => toast.error('Failed to update user status'),
  });
};
