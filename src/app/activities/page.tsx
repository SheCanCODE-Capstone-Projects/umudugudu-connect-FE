'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Bell, CalendarDays, MapPin, Plus, Send, UserRound } from 'lucide-react';
import { ActivityStatus, ActivityType, User, UserRole } from '@/types';
import { searchUsers } from '@/lib/api/users';
import { getStoredAuthUser } from '@/lib/auth/session';

const ACTIVITIES_KEY = 'umudugudu_activities';
const USER_NOTIFICATIONS_KEY = 'umudugudu_user_notifications';

type CurrentUser = {
  email: string;
  fullName: string;
  role: UserRole;
};

type StoredActivity = {
  id: string;
  type: ActivityType;
  title: string;
  scheduledAt: string;
  location: string;
  status: ActivityStatus;
  createdBy: string;
  createdAt: number;
};

type UserNotification = {
  id: string;
  email: string;
  title: string;
  message: string;
  createdAt: number;
  isRead: boolean;
  activityId?: string;
  channel?: 'PUSH' | 'SMS';
  deliveryDeadlineAt?: number;
};

const activityTypeLabels: Record<ActivityType, string> = {
  UMUGANDA: 'Umuganda',
  IMIHIGO: 'Imihigo',
  OTHER: 'Other',
};

const getJson = <T,>(storage: Storage, key: string, fallback: T) => {
  try {
    return JSON.parse(storage.getItem(key) ?? '') as T;
  } catch {
    return fallback;
  }
};

const formatActivityDate = (value: string) =>
  new Intl.DateTimeFormat('en-RW', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const buildActivityMessage = (activity: StoredActivity) =>
  `${activity.title} is scheduled for ${formatActivityDate(activity.scheduledAt)} at ${activity.location}.`;

export default function ActivitiesPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activities, setActivities] = useState<StoredActivity[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('UMUGANDA');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [citizenCount, setCitizenCount] = useState(0);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  useEffect(() => {
    const syncSelectedActivity = () => {
      setSelectedActivityId(new URLSearchParams(window.location.search).get('activityId'));
    };

    setCurrentUser(getStoredAuthUser() as CurrentUser | null);
    setActivities(
      getJson<StoredActivity[]>(localStorage, ACTIVITIES_KEY, []).sort((a, b) =>
        a.scheduledAt.localeCompare(b.scheduledAt)
      )
    );
    searchUsers({ role: 'CITIZEN' })
      .then((result) => setCitizenCount(result.content.length))
      .catch(() => setCitizenCount(0));
    syncSelectedActivity();
    window.addEventListener('popstate', syncSelectedActivity);

    return () => window.removeEventListener('popstate', syncSelectedActivity);
  }, []);

  const canCreateActivity = currentUser?.role === 'VILLAGE_LEADER';
  const selectedActivity = activities.find((activity) => activity.id === selectedActivityId) ?? null;

  const openActivityDetail = (activityId: string) => {
    window.history.pushState(null, '', `/activities?activityId=${activityId}`);
    setSelectedActivityId(activityId);
  };

  const closeActivityDetail = () => {
    window.history.pushState(null, '', '/activities');
    setSelectedActivityId(null);
  };

  const saveActivity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateActivity) {
      toast.error('Only village leaders can create activities.');
      return;
    }

    if (!title.trim() || !scheduledAt || !location.trim()) {
      toast.error('Add the activity name, date, time, and location.');
      return;
    }

    const activity: StoredActivity = {
      id: crypto.randomUUID(),
      type,
      title: title.trim(),
      scheduledAt,
      location: location.trim(),
      status: 'SCHEDULED',
      createdBy: currentUser.email ?? currentUser.fullName,
      createdAt: Date.now(),
    };

    const citizens = await searchUsers({ role: 'CITIZEN' }).then((result) => result.content).catch(() => [] as User[]);
    const channel: UserNotification['channel'] = navigator.onLine ? 'PUSH' : 'SMS';
    const activityMessage = buildActivityMessage(activity);
    const newNotifications: UserNotification[] = citizens.map((citizen) => ({
      id: crypto.randomUUID(),
      email: citizen.email ?? citizen.id,
      title: 'New activity created',
      message: activityMessage,
      createdAt: Date.now(),
      isRead: false,
      activityId: activity.id,
      channel,
      deliveryDeadlineAt: Date.now() + 2 * 60 * 1000,
    }));

    const nextActivities = [...activities, activity].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    const nextNotifications = [
      ...getJson<UserNotification[]>(localStorage, USER_NOTIFICATIONS_KEY, []),
      ...newNotifications,
    ];

    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(nextActivities));
    localStorage.setItem(USER_NOTIFICATIONS_KEY, JSON.stringify(nextNotifications));
    setActivities(nextActivities);
    setTitle('');
    setType('UMUGANDA');
    setScheduledAt('');
    setLocation('');
    toast.success(`Activity saved and ${channel === 'PUSH' ? 'push' : 'SMS'} notifications queued.`);
  };

  if (selectedActivityId) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            type="button"
            onClick={closeActivityDetail}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to activities
          </button>
        </div>

        {!selectedActivity ? (
          <div className="card py-12 text-center">
            <p className="font-medium text-gray-500">Activity not found.</p>
            <p className="mt-1 text-sm text-gray-400">The activity may have been removed from this device.</p>
          </div>
        ) : (
          <div className="card">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="badge-blue">{activityTypeLabels[selectedActivity.type]}</span>
                  <span className="badge-yellow">{selectedActivity.status}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedActivity.title}</h1>
              </div>
              <p className="text-sm text-gray-500">Created {new Date(selectedActivity.createdAt).toLocaleString()}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <CalendarDays className="mb-3 h-5 w-5 text-primary-700" />
                <p className="text-sm font-medium text-gray-500">Date and time</p>
                <p className="mt-1 font-semibold text-gray-900">{formatActivityDate(selectedActivity.scheduledAt)}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <MapPin className="mb-3 h-5 w-5 text-primary-700" />
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="mt-1 font-semibold text-gray-900">{selectedActivity.location}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <UserRound className="mb-3 h-5 w-5 text-primary-700" />
                <p className="text-sm font-medium text-gray-500">Created by</p>
                <p className="mt-1 font-semibold text-gray-900">{selectedActivity.createdBy}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="mt-1 text-sm text-gray-500">
            {canCreateActivity
              ? 'Create activities and notify citizens.'
              : 'View community activities created by village leaders.'}
          </p>
        </div>
        <span className="badge-blue w-fit">{activities.length} scheduled</span>
      </div>

      {canCreateActivity ? (
        <form onSubmit={saveActivity} className="card mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">Create Activity</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                Activity name
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="input-field"
                placeholder="Community clean-up"
              />
            </div>

            <div>
              <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(event) => setType(event.target.value as ActivityType)}
                className="input-field"
              >
                {Object.entries(activityTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="scheduledAt" className="mb-2 block text-sm font-medium text-gray-700">
                Date and time
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="input-field"
                placeholder="Village office"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <Bell className="h-4 w-4" />
              Citizens notified by push when online, SMS when offline.
            </p>
            <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              Save Activity
            </button>
          </div>
        </form>
      ) : null}

      <div className="card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            {currentUser?.role === 'CITIZEN' ? 'Leader-Created Activities' : 'Activity Schedule'}
          </h2>
          {canCreateActivity ? <span className="badge-green">{citizenCount} citizens</span> : null}
        </div>

        {activities.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <CalendarDays className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-500">No activities yet</p>
            <p className="mt-1 text-sm text-gray-400">
              {canCreateActivity
                ? 'Create the first village activity to notify citizens.'
                : 'New activities created by village leaders will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => openActivityDetail(activity.id)}
                className="block w-full rounded-lg border border-gray-100 bg-gray-50 p-4 text-left transition hover:border-primary-200 hover:bg-primary-50"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <span className="badge-blue">{activityTypeLabels[activity.type]}</span>
                      <span className="badge-yellow">{activity.status}</span>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                      {formatActivityDate(activity.scheduledAt)}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {activity.location}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary-700">View details</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
