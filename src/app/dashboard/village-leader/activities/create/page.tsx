'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActivities } from '@/hooks/useActivities';
import { useAppSelector } from '@/hooks/redux';
import { ActivityForm } from '@/components/forms/ActivityForm';
import type { CreateActivityPayload } from '@/types';

export default function CreateActivityPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const {
    loading,
    error,
    successMessage,
    createActivity,
    resetMessages,
  } = useActivities();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        resetMessages();
        router.push('/dashboard/village-leader/activities');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => resetMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = (payload: CreateActivityPayload) => {
    createActivity(payload);
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Activity</h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule a new Umuganda or Imihigo activity
          </p>
        </div>
      </div>

      {/* Success / Error Messages */}
      {successMessage && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-100 text-green-700 text-sm">
          ✅ {successMessage} — redirecting...
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        <ActivityForm
          onSubmit={handleSubmit}
          loading={loading}
          villageId={user?.villageId ?? ''}
        />
      </div>
    </div>
  );
}