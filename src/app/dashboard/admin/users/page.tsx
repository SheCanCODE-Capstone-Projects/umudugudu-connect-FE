'use client';

import { useEffect } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { UserSearchBar } from '@/components/shared/UserSearchBar';
import { UserRoleCard } from '@/components/shared/UserRoleCard';
import type { UserRole, UserSearchParams } from '@/types';

export default function AdminUsersPage() {
  const {
    users,
    loading,
    error,
    successMessage,
    searchUsers,
    updateRole,
    resetMessages,
  } = useUsers();

  useEffect(() => {
    searchUsers({});
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => resetMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleSearch = (params: UserSearchParams) => {
    searchUsers(params);
  };

  const handleAssignRole = (userId: string, role: UserRole) => {
    updateRole({ userId, role });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search users and assign or update their roles
        </p>
      </div>

      {/* Success / Error Messages */}
      {successMessage && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-100 text-green-700 text-sm">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <UserSearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No users found</div>
      ) : (
        <div className="flex flex-col gap-4">
          {users.map((user) => (
            <UserRoleCard
              key={user.id}
              user={user}
              onAssignRole={handleAssignRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}