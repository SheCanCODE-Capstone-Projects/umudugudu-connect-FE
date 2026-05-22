'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActivities } from '@/hooks/useActivities';
import { ActivityCard } from '@/components/shared/ActivityCard';

export default function ActivitiesPage() {
  const router = useRouter();
  const {
    activities,
    loading,
    error,
    successMessage,
    searchActivities,
    resetMessages,
  } = useActivities();

  useEffect(() => {
    searchActivities({});
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage Umuganda and Imihigo activities
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/village-leader/activities/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Create Activity
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

      {/* Activities Lists */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No activities found</div>
      ) : (
        <div className="flex flex-col gap-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}