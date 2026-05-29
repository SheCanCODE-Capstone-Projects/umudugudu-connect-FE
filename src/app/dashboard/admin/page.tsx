'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserRole } from '@/types';
import LogoutButton, { useRedirectLoggedOut } from '@/components/shared/LogoutButton';

const REGISTERED_USERS_KEY = 'umudugudu_registered_users';
const USER_NOTIFICATIONS_KEY = 'umudugudu_user_notifications';

const assignableRoles: Array<{ value: UserRole; label: string }> = [
  { value: 'CITIZEN', label: 'Citizen' },
  { value: 'ISIBO_LEADER', label: 'Isibo Leader' },
  { value: 'VILLAGE_LEADER', label: 'Village Leader' },
  { value: 'ADMIN', label: 'Admin' },
];

const roleLabels: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  ISIBO_LEADER: 'Isibo Leader',
  VILLAGE_LEADER: 'Village Leader',
  ADMIN: 'Admin',
};

type StoredUser = {
  fullName: string;
  phoneNumber: string;
  email: string;
  role: UserRole | null;
  password: string;
  registeredAt?: number;
  roleAssignedAt?: number;
};

type UserNotification = {
  id: string;
  email: string;
  title: string;
  message: string;
  createdAt: number;
  isRead: boolean;
};

const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
};

const getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_NOTIFICATIONS_KEY) ?? '[]') as UserNotification[];
  } catch {
    return [];
  }
};

export default function AdminDashboard() {
  useRedirectLoggedOut();

  const [users, setUsers] = useState<StoredUser[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});

  useEffect(() => {
    const storedUsers = getStoredUsers();
    setUsers(storedUsers);
    setSelectedRoles(
      Object.fromEntries(
        storedUsers.map((user) => [user.email, user.role ?? 'CITIZEN'])
      ) as Record<string, UserRole>
    );
  }, []);

  const assignRole = (email: string) => {
    const nextRole = selectedRoles[email];
    const targetUser = users.find((user) => user.email === email);
    if (!targetUser || !nextRole) return;

    const nextUsers = users.map((user) =>
      user.email === email
        ? {
            ...user,
            role: nextRole,
            roleAssignedAt: Date.now(),
          }
        : user
    );

    const nextNotifications = [
      ...getNotifications(),
      {
        id: crypto.randomUUID(),
        email,
        title: 'Role assigned',
        message: `Admin assigned your account role as ${roleLabels[nextRole]}.`,
        createdAt: Date.now(),
        isRead: false,
      },
    ];

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextUsers));
    localStorage.setItem(USER_NOTIFICATIONS_KEY, JSON.stringify(nextNotifications));
    setUsers(nextUsers);
    toast.success(`${targetUser.fullName} is now ${roleLabels[nextRole]}`);
  };

  const adminUsers = users.filter((user) => user.role === 'ADMIN').length;
  const leaderUsers = users.filter((user) => user.role === 'ISIBO_LEADER' || user.role === 'VILLAGE_LEADER').length;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <LogoutButton showLabel />        
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-gray-500">Registered users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Leaders</p>
          <p className="text-2xl font-bold">{leaderUsers}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-bold">{adminUsers}</p>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Manage User Roles</h2>
          <span className="badge-blue">{users.length} users</span>
        </div>

        {users.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No registered users yet.</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.email}
                className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-[1fr_12rem_7rem]"
              >
                <div>
                  <p className="font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                  <span className={user.role ? 'badge-green mt-2 inline-block' : 'badge-yellow mt-2 inline-block'}>
                    {user.role ? roleLabels[user.role] : 'Waiting for role'}
                  </span>
                </div>

                <select
                  value={selectedRoles[user.email] ?? 'CITIZEN'}
                  onChange={(event) =>
                    setSelectedRoles((roles) => ({
                      ...roles,
                      [user.email]: event.target.value as UserRole,
                    }))
                  }
                  className="input-field h-10"
                >
                  {assignableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                <button type="button" onClick={() => assignRole(user.email)} className="btn-primary h-10">
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
