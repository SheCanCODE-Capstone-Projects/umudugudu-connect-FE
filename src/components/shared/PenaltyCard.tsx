'use client';

import type { Penalty } from '@/types';

interface PenaltyCardProps {
  penalty: Penalty;
}

const STATUS_COLORS = {
  UNPAID: 'bg-red-100 text-red-700',
  PAID:   'bg-green-100 text-green-700',
  WAIVED: 'bg-gray-100 text-gray-700',
};

export const PenaltyCard = ({ penalty }: PenaltyCardProps) => {
  const formattedAmount = new Intl.NumberFormat('en-RW', {
    style:    'currency',
    currency: 'RWF',
  }).format(penalty.amountRwf);

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-gray-900">{penalty.citizenName}</p>
          <p className="text-sm text-gray-500">{penalty.activityTitle}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[penalty.status]}`}>
          {penalty.status}
        </span>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold text-gray-900">{formattedAmount}</p>
        {penalty.reason && (
          <p className="text-xs text-gray-400 italic">{penalty.reason}</p>
        )}
      </div>
    </div>
  );
};