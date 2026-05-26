'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePenalties } from '@/hooks/usePenalties';

export default function CitizenPenaltiesPage() {
  const router = useRouter();
  const { myPenalties, loading, error, getMyPenalties } = usePenalties();

  useEffect(() => {
    getMyPenalties();
  }, []);

  const formattedAmount = (amount: number) =>
    new Intl.NumberFormat('en-RW', {
      style:    'currency',
      currency: 'RWF',
    }).format(amount);

  const STATUS_COLORS = {
    UNPAID: 'bg-red-100 text-red-700',
    PAID:   'bg-green-100 text-green-700',
    WAIVED: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Penalties</h1>
        <p className="text-sm text-gray-500 mt-1">
          View all your outstanding and paid penalties
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading penalties...</div>
      ) : myPenalties.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          🎉 No penalties found — keep attending activities!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {myPenalties.map((penalty) => (
            <div
              key={penalty.id}
              className="border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-gray-900">{penalty.activityTitle}</p>
                  {penalty.reason && (
                    <p className="text-xs text-gray-400 italic">{penalty.reason}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[penalty.status]}`}>
                  {penalty.status}
                </span>
              </div>

              {/* Amount & Action */}
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-gray-900">
                  {formattedAmount(penalty.amountRwf)}
                </p>
                {penalty.status === 'UNPAID' && (
                  <button
                    onClick={() => router.push(`/dashboard/citizen/payments?penaltyId=${penalty.id}&amount=${penalty.amountRwf}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Pay Now
                  </button>
                )}
                {penalty.status === 'PAID' && penalty.paidAt && (
                  <p className="text-xs text-gray-400">
                    Paid on {new Date(penalty.paidAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}