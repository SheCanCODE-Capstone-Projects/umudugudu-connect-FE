'use client';

import type { UserRole } from '@/types';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'CITIZEN',        label: 'Citizen'        },
  { value: 'ISIBO_LEADER',   label: 'Isibo Leader'   },
  { value: 'VILLAGE_LEADER', label: 'Village Leader' },
  { value: 'ADMIN',          label: 'Admin'          },
];

export const RoleSelector = ({ value, onChange, disabled }: RoleSelectorProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="role-selector"
        className="text-sm font-medium text-gray-700"
      >
        Select Role
      </label>
      <select
        id="role-selector"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as UserRole)}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};