'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useActivities } from '@/hooks/useActivities';
import { PerformanceCard } from '@/components/shared/PerformanceCard';
import { AttendanceChart } from '@/components/charts/AttendanceChart';

export default function ActivityPerformancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    performance,
    loading,
    error,
    getPerformance,
    resetPerformance,
  } = useActivities();

  useEffect(() => {
    if (id) getPerformance(id);
    return () => resetPerformance();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Loading performance data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        {error}
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="text-center py-12 text-gray-400">
        No performance data found
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Activity Performance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {performance.activityTitle}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <PerformanceCard
          label="Total Invited"
          value={performance.totalInvited}
          color="blue"
        />
        <PerformanceCard
          label="Total Present"
          value={performance.totalPresent}
          color="green"
        />
        <PerformanceCard
          label="Total Absent"
          value={performance.totalAbsent}
          color="red"
        />
        <PerformanceCard
          label="Participation Rate"
          value={`${performance.participationRate}%`}
          subtitle={
            performance.participationRate >= 75
              ? '✅ Good'
              : performance.participationRate >= 50
              ? '⚠️ Average'
              : '❌ Low'
          }
          color={
            performance.participationRate >= 75
              ? 'green'
              : performance.participationRate >= 50
              ? 'yellow'
              : 'red'
          }
        />
      </div>

      {/* Chart & Table */}
      {performance.isiboBreakdown.length > 0 ? (
        <div className="border rounded-xl p-6 bg-white shadow-sm">
          <AttendanceChart data={performance.isiboBreakdown} />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          No isibo breakdown data available
        </div>
      )}
    </div>
  );
}