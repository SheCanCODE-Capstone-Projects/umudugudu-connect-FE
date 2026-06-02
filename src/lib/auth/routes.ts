import { UserRole } from '@/types';

export const dashboardByRole: Record<UserRole, string> = {
  CITIZEN: '/dashboard/citizen',
  ISIBO_LEADER: '/dashboard/isibo-leader',
  VILLAGE_LEADER: '/dashboard/village-leader',
  ADMIN: '/dashboard/admin',
};

export function getDashboardPath(role?: UserRole | null) {
  return role ? dashboardByRole[role] : '/auth/login';
}

