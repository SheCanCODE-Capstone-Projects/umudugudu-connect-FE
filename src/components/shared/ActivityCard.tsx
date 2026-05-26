'use client';

import type { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
}

const TYPE_COLORS = {
  UMUGANDA: 'bg-green-100 text-green-700',
  IMIHIGO:  'bg-blue-100 text-blue-700',
  OTHER:    'bg-gray-100 text-gray-700',
};

const STATUS_COLORS = {
  SCHEDULED:   'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED:   'bg-green-100 text-green-700',
  CANCELLED:   'bg-red-100 text-red-700',
};

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const formattedDate = new Date(activity.scheduledAt).toLocaleDateString('en-RW', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
  });

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3">
<<<<<<< HEAD
=======

      {/* Header */}
>>>>>>> origin/main
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-base">{activity.title}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[activity.type]}`}>
            {activity.type}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[activity.status]}`}>
            {activity.status}
          </span>
        </div>
      </div>
<<<<<<< HEAD
=======

      {/* Details */}
>>>>>>> origin/main
      <div className="flex flex-col gap-1 text-sm text-gray-500">
        <p>📅 {formattedDate}</p>
        {activity.location && <p>📍 {activity.location}</p>}
      </div>
    </div>
  );
};