'use client';

import { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useToggleUserActive } from '@/hooks/useAdmin';
import { UserSearchBar } from '@/components/shared/UserSearchBar';
import { UserRoleCard } from '@/components/shared/UserRoleCard';
import { useRedirectLoggedOut } from '@/components/shared/LogoutButton';
import type { User, UserRole, UserSearchParams } from '@/types';

export default function AdminUsersPage() {
  useRedirectLoggedOut();

  const { users, loading, error, successMessage, searchUsers, updateRole, resetMessages } = useUsers();
  const toggleActive = useToggleUserActive();

  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null);

  useEffect(() => { searchUsers({}); }, []);

  useEffect(() => {
    if (successMessage || error) {
      const t = setTimeout(() => resetMessages(), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, error]);

  const handleDeactivateClick = (user: User) => {
    if (user.isActive && user.role === 'VILLAGE_LEADER') {
      setConfirmDeactivate(user);
    } else {
      toggleActive.mutate({ userId: user.id, isActive: user.isActive });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User & Role Management</h1>
        <p className="text-sm text-gray-500 mt-1">Search, assign roles, and activate / deactivate users</p>
      </div>

      {successMessage && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-100 text-green-700 text-sm">{successMessage}</div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-700 text-sm">{error}</div>
      )}

      <div className="mb-6">
        <UserSearchBar onSearch={(p: UserSearchParams) => searchUsers(p)} loading={loading} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No users found</div>
      ) : (
        <div className="flex flex-col gap-4">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <UserRoleCard
                  user={user}
                  onAssignRole={(userId: string, role: UserRole) => updateRole({ userId, role })}
                />
              </div>
              <button
                onClick={() => handleDeactivateClick(user)}
                disabled={toggleActive.isPending}
                className={user.isActive ? 'btn-danger text-sm shrink-0' : 'btn-secondary text-sm shrink-0'}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation modal for Village Leader deactivation */}
      {confirmDeactivate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Confirm Deactivation</h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{confirmDeactivate.fullName}</strong> is a Village Leader and may have open
              activities. Deactivating will take effect on their next login. Continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDeactivate(null)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleActive.mutate({ userId: confirmDeactivate.id, isActive: true });
                  setConfirmDeactivate(null);
                }}
                className="btn-danger text-sm"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
