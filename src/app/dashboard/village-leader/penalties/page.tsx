'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePenalties } from '@/hooks/usePenalties';
import { PenaltyCard } from '@/components/shared/PenaltyCard';

export default function PenaltiesPage() {
  const router = useRouter();
  const {
    penalties,
    loading,
    error,
    successMessage,
    searchPenalties,
    resetMessages,
  } = usePenalties();

  useEffect(() => {
    searchPenalties();
  }, [];

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => resetMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penalties</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage penalties for absent citizens
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/village-leader/penalties/assign')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          + Assign Penalty
        </button>
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

      {/* Filter by status */}
      <div className="flex gap-2 mb-6">
        {(['UNPAID', 'PAID', 'WAIVED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => searchPenalties()}
            className="px-3 py-1 rounded-full text-xs font-medium border hover:bg-gray-50"
          >
            {status}
          </button>
        ))}
        <button
          onClick={() => searchPenalties()}
          className="px-3 py-1 rounded-full text-xs font-medium border hover:bg-gray-50"
        >
          ALL
        </button>
      </div>

      {/* Penalties List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading penalties...</div>
      ) : penalties.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No penalties found</div>
      ) : (
        <div className="flex flex-col gap-4">
          {penalties.map((penalty) => (
            <PenaltyCard key={penalty.id} penalty={penalty} />
          ))}
        </div>
      )}
    </div>
  );
}