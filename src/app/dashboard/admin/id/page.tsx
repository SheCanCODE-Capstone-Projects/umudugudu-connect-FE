'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';
import { RoleSelector } from '@/components/forms/RoleSelector';
import type { UserRole } from '@/types';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    selectedUser,
    loading,
    error,
    successMessage,
    getUserById,
    updateRole,
    resetMessages,
    resetSelectedUser,
  } = useUsers();

  useEffect(() => {
    if (id) getUserById(id);
    return () => resetSelectedUser();
  }, [id]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => resetMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleRoleChange = (role: UserRole) => {
    if (selectedUser) {
      updateRole({ userId: selectedUser.id, role });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">Loading user...</div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="text-center py-12 text-gray-400">User not found</div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">User Detail</h1>
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

      {/* User Info Card */}
      <div className="border rounded-xl p-6 bg-white shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">Full Name</p>
          <p className="font-semibold text-gray-900">{selectedUser.fullName}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">Phone Number</p>
          <p className="text-gray-700">{selectedUser.phoneNumber}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">Village ID</p>
          <p className="text-gray-700">{selectedUser.villageId}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">Isibo ID</p>
          <p className="text-gray-700">{selectedUser.isiboId ?? '—'}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">Status</p>
          <span className={`text-xs px-2 py-1 rounded-full w-fit font-medium ${
            selectedUser.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {selectedUser.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Role Assignment */}
        <div className="border-t pt-4">
          <RoleSelector
            value={selectedUser.role}
            onChange={handleRoleChange}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}