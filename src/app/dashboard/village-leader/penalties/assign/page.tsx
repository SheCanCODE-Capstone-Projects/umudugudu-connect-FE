'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePenalties } from '@/hooks/usePenalties';
import { AssignPenaltyForm } from '@/components/forms/AssignPenaltyForm';
import type { AssignPenaltyPayload } from '@/types';

export default function AssignPenaltyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citizenId   = searchParams.get('citizenId')   ?? '';
  const activityId  = searchParams.get('activityId')  ?? '';
  const citizenName = searchParams.get('citizenName') ?? 'Unknown Citizen';

  const {
    loading,
    error,
    successMessage,
    assignPenalty,
    resetMessages,
  } = usePenalties();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        resetMessages();
        router.push('/dashboard/village-leader/penalties');
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

  const handleAssign = (payload: AssignPenaltyPayload) => {
    assignPenalty(payload);
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
          <h1 className="text-2xl font-bold text-gray-900">Assign Penalty</h1>
          <p className="text-sm text-gray-500 mt-1">
            Assign a penalty or mark absence as excused
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
        <AssignPenaltyForm
          citizenId={citizenId}
          activityId={activityId}
          citizenName={citizenName}
          onAssign={handleAssign}
          loading={loading}
        />
      </div>
    </div>
  );
}