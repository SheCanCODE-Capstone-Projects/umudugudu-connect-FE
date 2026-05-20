'use client';

import { useState } from 'react';
import type { CreateActivityPayload, ActivityType } from '@/types';

interface ActivityFormProps {
  onSubmit: (payload: CreateActivityPayload) => void;
  loading?: boolean;
  villageId: string;
}

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'UMUGANDA', label: 'Umuganda' },
  { value: 'IMIHIGO',  label: 'Imihigo'  },
  { value: 'OTHER',    label: 'Other'    },
];

export const ActivityForm = ({ onSubmit, loading, villageId }: ActivityFormProps) => {
  const [title,       setTitle]       = useState('');
  const [type,        setType]        = useState<ActivityType>('UMUGANDA');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location,    setLocation]    = useState('');
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim())       newErrors.title       = 'Title is required';
    if (!scheduledAt.trim()) newErrors.scheduledAt = 'Date and time is required';
    if (!location.trim())    newErrors.location    = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ title, type, scheduledAt, location, villageId });
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">Activity Title</label>
        <input
          id="title"
          type="text"
          placeholder="e.g. Monthly Umuganda - Sector Cleanup"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Type */}
      <div className="flex flex-col gap-1">
        <label htmlFor="type" className="text-sm font-medium text-gray-700">Activity Type</label>
        <select
          id="type"
          aria-label="Select activity type"
          value={type}
          onChange={(e) => setType(e.target.value as ActivityType)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Date & Time */}
      <div className="flex flex-col gap-1">
        <label htmlFor="scheduledAt" className="text-sm font-medium text-gray-700">Date & Time</label>
        <input
          id="scheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.scheduledAt && <p className="text-xs text-red-500">{errors.scheduledAt}</p>}
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1">
        <label htmlFor="location" className="text-sm font-medium text-gray-700">Location</label>
        <input
          id="location"
          type="text"
          placeholder="e.g. Sector Office Grounds"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 w-fit"
      >
        {loading ? 'Creating...' : 'Create Activity'}
      </button>
    </div>
  );
};