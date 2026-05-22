'use client';

import type { User, UserRole } from '@/types';

interface UserRoleCardProps {
  user: User;
  onAssignRole: (userId: string, role: UserRole) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN:        'Citizen',
  ISIBO_LEADER:   'Isibo Leader',
  VILLAGE_LEADER: 'Village Leader',
  ADMIN:          'Admin',
};

const ROLE_COLORS: Record<UserRole, string> = {
  CITIZEN:        'bg-gray-100 text-gray-700',
  ISIBO_LEADER:   'bg-blue-100 text-blue-700',
  VILLAGE_LEADER: 'bg-green-100 text-green-700',
  ADMIN:          'bg-red-100 text-red-700',
};

export const UserRoleCard = ({ user, onAssignRole }: UserRoleCardProps) => {
  return (
    <div className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white shadow-sm">

      {/* User Info */}
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-gray-900">{user.fullName}</p>
        <p className="text-sm text-gray-500">{user.phoneNumber}</p>
        <span className={`text-xs px-2 py-1 rounded-full w-fit font-medium ${ROLE_COLORS[user.role]}`}>
          {ROLE_LABELS[user.role]}
        </span>
      </div>

      {/* Role Selector */}
      <div className="flex flex-col gap-2 sm:items-end">
        <label className="text-xs text-gray-500">Assign new role</label>
        <select
          aria-label={`Assign role for ${user.fullName}`}
          defaultValue={user.role}
          onChange={(e) => onAssignRole(user.id, e.target.value as UserRole)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};