'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Grid2X2,
  Home,
  Megaphone,
  Menu,
  ShieldAlert,
  UserRound,
  WalletCards,
} from 'lucide-react';
import type { ActivityStatus, ActivityType, PenaltyStatus, UserRole } from '@/types';

const CURRENT_USER_KEY = 'umudugudu_current_user';
const ACTIVITIES_KEY = 'umudugudu_activities';
const USER_NOTIFICATIONS_KEY = 'umudugudu_user_notifications';
const PENALTIES_KEY = 'umudugudu_penalties';

type CurrentUser = {
  email: string;
  fullName: string;
  role: UserRole;
  cell?: string;
  sector?: string;
};

type StoredActivity = {
  id: string;
  type: ActivityType;
  title: string;
  scheduledAt: string;
  location: string;
  status: ActivityStatus;
};

type UserNotification = {
  id: string;
  email: string;
  title: string;
  message: string;
  createdAt: number;
  isRead: boolean;
  activityId?: string;
};

type StoredPenalty = {
  id: string;
  citizenId?: string;
  citizenEmail?: string;
  amountRwf: number;
  status: PenaltyStatus;
};

const getJson = <T,>(storage: Storage, key: string, fallback: T) => {
  try {
    return JSON.parse(storage.getItem(key) ?? '') as T;
  } catch {
    return fallback;
  }
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-RW', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const formatRwf = (value: number) => `${new Intl.NumberFormat('en-RW').format(value)} RWF`;

export default function CitizenDashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activities, setActivities] = useState<StoredActivity[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [penalties, setPenalties] = useState<StoredPenalty[]>([]);

  useEffect(() => {
    const user = getJson<CurrentUser | null>(sessionStorage, CURRENT_USER_KEY, null);
    const now = new Date().getTime();

    setCurrentUser(user);
    setActivities(
      getJson<StoredActivity[]>(localStorage, ACTIVITIES_KEY, [])
        .filter((activity) => activity.status !== 'CANCELLED' && new Date(activity.scheduledAt).getTime() >= now)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    );

    setNotifications(
      getJson<UserNotification[]>(localStorage, USER_NOTIFICATIONS_KEY, [])
        .filter((notification) => !user || notification.email === user.email)
        .sort((a, b) => b.createdAt - a.createdAt)
    );

    setPenalties(
      getJson<StoredPenalty[]>(localStorage, PENALTIES_KEY, []).filter(
        (penalty) => !user || penalty.citizenEmail === user.email || penalty.citizenId === user.email
      )
    );
  }, []);

  const upcomingActivity = activities[0];
  const unreadNotifications = notifications.filter((notification) => !notification.isRead);
  const latestNotifications = notifications.slice(0, 2);
  const unpaidAmount = useMemo(
    () =>
      penalties
        .filter((penalty) => penalty.status === 'UNPAID')
        .reduce((total, penalty) => total + penalty.amountRwf, 0),
    [penalties]
  );

  const displayName = currentUser?.fullName?.trim() || 'Citizen';
  // const locationLabel = [currentUser?.cell ?? 'Rugando Cell', currentUser?.sector ?? 'Kimihurura']
    // .filter(Boolean)
    // .join(', ');

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24 text-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-11 w-full max-w-md items-center justify-between px-4 lg:max-w-none lg:px-8">
          <button type="button" aria-label="Open menu" className="grid h-8 w-8 place-items-center text-gray-700">
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-extrabold text-emerald-800">Umudugudu Connect</p>
          <Link
            href="/notifications"
            aria-label="View notifications"
            className="relative grid h-8 w-8 place-items-center text-gray-700"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 ? (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            ) : null}
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-md px-4 pt-4 lg:max-w-none lg:px-8 lg:pt-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Hello, {displayName}</p>
            {/* <p className="mt-1 text-xs text-gray-500">{locationLabel}</p> */}
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-emerald-700 bg-emerald-50 text-emerald-800">
            <UserRound className="h-5 w-5" />
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-8">
          <div className="bg-[#008c3a] p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CalendarDays className="h-4 w-4" />
              Upcoming Activity
            </div>
            <h1 className="mt-2 text-base font-extrabold">
              {upcomingActivity?.title ?? 'No community activity scheduled'}
            </h1>
          </div>
          <div className="space-y-4 p-4">
            {upcomingActivity ? (
              <>
                <div>
                  <p className="text-xs font-medium text-gray-500">Date and Time</p>
                  <p className="mt-1 text-sm font-extrabold text-gray-950">
                    {formatDateTime(upcomingActivity.scheduledAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Location</p>
                  <p className="mt-1 text-sm font-extrabold text-gray-950">{upcomingActivity.location}</p>
                </div>
                <Link
                  href={`/activities?activityId=${upcomingActivity.id}`}
                  className="flex h-10 w-full items-center justify-center rounded-md bg-[#006d2d] text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  View Details
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">When your village leader creates an activity, it will appear here.</p>
                <Link
                  href="/activities"
                  className="flex h-10 w-full items-center justify-center rounded-md bg-[#006d2d] text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  View Activities
                </Link>
              </>
            )}
          </div>
        </section>

        <div
          aria-hidden="true"
          className="my-5 h-5 w-full bg-[linear-gradient(135deg,#d8e7e4_25%,transparent_25%),linear-gradient(225deg,#d8e7e4_25%,transparent_25%),linear-gradient(315deg,#d8e7e4_25%,transparent_25%),linear-gradient(45deg,#d8e7e4_25%,transparent_25%)] bg-[length:22px_22px] bg-[position:11px_0,11px_0,0_0,0_0] lg:col-span-12"
        />

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-4 lg:row-start-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">My Penalties</p>
              <p className={`mt-1 text-sm font-extrabold ${unpaidAmount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {formatRwf(unpaidAmount)}
              </p>
              <span className={unpaidAmount > 0 ? 'badge-red mt-2 inline-block' : 'badge-green mt-2 inline-block'}>
                {unpaidAmount > 0 ? 'UNPAID BALANCE' : 'NO BALANCE'}
              </span>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
              <WalletCards className="h-5 w-5" />
            </div>
          </div>
          <Link
            href={unpaidAmount > 0 ? '/payments' : '/penalties'}
            className="mt-5 flex h-10 w-full items-center justify-center rounded-md border border-[#006d2d] text-sm font-bold text-[#006d2d] transition hover:bg-emerald-50"
          >
            {unpaidAmount > 0 ? 'Pay Outstanding' : 'View Penalties'}
          </Link>
        </section>

        <section className="mt-5 lg:col-span-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-950">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            <Link href="/service-requests" className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50">
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-emerald-100 text-emerald-800">
                <ClipboardList className="h-5 w-5" />
              </span>
              <span className="mt-3 block text-xs font-medium leading-4">Service Request</span>
            </Link>
            <Link href="/emergency" className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition hover:border-red-300 hover:bg-red-50">
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-red-50 text-red-600">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <span className="mt-3 block text-xs font-medium leading-4">Emergency</span>
            </Link>
            <Link href="/notifications" className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition hover:border-sky-300 hover:bg-sky-50">
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-sky-100 text-sky-700">
                <Megaphone className="h-5 w-5" />
              </span>
              <span className="mt-3 block text-xs font-medium leading-4">Announce</span>
            </Link>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-950">Notifications</h2>
            <Link href="/notifications" className="text-xs font-bold text-emerald-700">
              View all
            </Link>
          </div>
          {latestNotifications.length === 0 ? (
            <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">No notifications yet.</p>
          ) : (
            <div className="space-y-2">
              {latestNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.activityId ? `/activities?activityId=${notification.activityId}` : '/notifications'}
                  className="block rounded-md border border-gray-100 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <div className="flex items-start gap-3">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">{notification.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">{notification.message}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2 text-[10px] font-semibold lg:max-w-none lg:px-8">
          <Link href="/dashboard/citizen" className="flex flex-col items-center justify-center gap-1 text-emerald-800">
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link href="/activities" className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <CalendarDays className="h-5 w-5" />
            Activities
          </Link>
          <Link href="/service-requests" className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <Grid2X2 className="h-5 w-5" />
            Services
          </Link>
          <Link href="/payments" className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <CreditCard className="h-5 w-5" />
            Pay
          </Link>
        </div>
      </nav>
    </main>
  );
}
