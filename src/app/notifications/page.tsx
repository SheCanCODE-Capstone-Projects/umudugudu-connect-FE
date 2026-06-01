'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  CreditCard,
  FileText,
  Grid2X2,
  Home,
  Info,
  Megaphone,
  Settings,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { getStoredAuthUser } from '@/lib/auth/session';

const USER_NOTIFICATIONS_KEY = 'umudugudu_user_notifications';

type CurrentUser = {
  email: string;
  fullName: string;
  role: string;
};

type NotificationKind = 'emergency' | 'community' | 'financial' | 'services' | 'document' | 'info';

type UserNotification = {
  id: string;
  email: string;
  title: string;
  message: string;
  createdAt: number;
  isRead: boolean;
  activityId?: string;
  kind?: NotificationKind;
};

const getJson = <T,>(storage: Storage, key: string, fallback: T) => {
  try {
    return JSON.parse(storage.getItem(key) ?? '') as T;
  } catch {
    return fallback;
  }
};

const inferKind = (notification: UserNotification): NotificationKind => {
  if (notification.kind) return notification.kind;

  const content = `${notification.title} ${notification.message}`.toLowerCase();
  if (content.includes('emergency') || content.includes('alert') || content.includes('water') || content.includes('fire')) {
    return 'emergency';
  }
  if (content.includes('payment') || content.includes('paid') || content.includes('receipt') || content.includes('penalty')) {
    return 'financial';
  }
  if (content.includes('service') || content.includes('request') || content.includes('resolved')) {
    return 'services';
  }
  if (content.includes('document') || content.includes('minutes') || content.includes('available')) {
    return 'document';
  }
  if (content.includes('umuganda') || content.includes('activity') || notification.activityId) {
    return 'community';
  }
  return 'info';
};

const getRelativeTime = (createdAt: number) => {
  const diffMinutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return `${Math.floor(diffHours / 24)}d ago`;
};

const getFallbackNotifications = (email: string): UserNotification[] => {
  const now = Date.now();

  return [
    {
      id: 'demo-emergency-water',
      email,
      title: 'Water Maintenance Alert',
      message: 'Scheduled water supply interruption in Cell A from 2 PM to 6 PM today.',
      createdAt: now - 2 * 60 * 1000,
      isRead: false,
      kind: 'emergency',
    },
    {
      id: 'demo-umuganda-reminder',
      email,
      title: 'Umuganda Reminder',
      message: 'Do not forget the monthly Umuganda this Saturday at 8:00 AM. Meet at the community hall.',
      createdAt: now - 60 * 60 * 1000,
      isRead: false,
      kind: 'community',
    },
    {
      id: 'demo-payment-confirmation',
      email,
      title: 'Payment Confirmation',
      message: 'Your security contribution has been successfully processed. Receipt #RC-9021.',
      createdAt: now - 3 * 60 * 60 * 1000,
      isRead: false,
      kind: 'financial',
    },
    {
      id: 'demo-service-resolved',
      email,
      title: 'Service Status: Resolved',
      message: 'Your request for street light repair has been completed. Please rate the service.',
      createdAt: now - 5 * 60 * 60 * 1000,
      isRead: false,
      kind: 'services',
    },
    {
      id: 'demo-document-available',
      email,
      title: 'New Document Available',
      message: 'The minutes from the last community meeting are now available for review.',
      createdAt: now - 26 * 60 * 60 * 1000,
      isRead: true,
      kind: 'document',
    },
  ];
};

const kindStyles: Record<
  NotificationKind,
  {
    label: string;
    icon: typeof Bell;
    iconClass: string;
    cardClass: string;
    titleClass: string;
    badgeClass: string;
  }
> = {
  emergency: {
    label: 'Emergency',
    icon: Megaphone,
    iconClass: 'bg-red-600 text-white',
    cardClass: 'border-red-100 bg-red-100',
    titleClass: 'text-red-700',
    badgeClass: 'bg-red-600 text-white',
  },
  community: {
    label: 'Community',
    icon: CalendarDays,
    iconClass: 'bg-emerald-700 text-white',
    cardClass: 'border-gray-200 bg-white',
    titleClass: 'text-gray-950',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  financial: {
    label: 'Financial',
    icon: CreditCard,
    iconClass: 'bg-sky-400 text-sky-950',
    cardClass: 'border-gray-200 bg-white',
    titleClass: 'text-gray-950',
    badgeClass: 'bg-sky-100 text-sky-800',
  },
  services: {
    label: 'Services',
    icon: UsersRound,
    iconClass: 'bg-yellow-500 text-yellow-950',
    cardClass: 'border-gray-200 bg-white',
    titleClass: 'text-gray-950',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  document: {
    label: 'Document',
    icon: FileText,
    iconClass: 'bg-gray-200 text-gray-500',
    cardClass: 'border-gray-100 bg-gray-100',
    titleClass: 'text-gray-500',
    badgeClass: 'bg-gray-200 text-gray-600',
  },
  info: {
    label: 'Info',
    icon: Info,
    iconClass: 'bg-gray-200 text-gray-600',
    cardClass: 'border-gray-200 bg-white',
    titleClass: 'text-gray-950',
    badgeClass: 'bg-gray-100 text-gray-700',
  },
};

export default function NotificationsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [openNotificationId, setOpenNotificationId] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredAuthUser() as CurrentUser | null;
    setCurrentUser(user);

    if (!user) return;

    const allNotifications = getJson<UserNotification[]>(localStorage, USER_NOTIFICATIONS_KEY, []);
    const storedNotifications = allNotifications
      .filter((notification) => notification.email === user.email)
      .sort((a, b) => b.createdAt - a.createdAt);

    if (storedNotifications.length > 0) {
      setNotifications(storedNotifications);
      return;
    }

    const fallbackNotifications = getFallbackNotifications(user.email);
    localStorage.setItem(USER_NOTIFICATIONS_KEY, JSON.stringify([...allNotifications, ...fallbackNotifications]));
    setNotifications(fallbackNotifications);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const emergencyNotifications = notifications.filter((notification) => inferKind(notification) === 'emergency');
  const regularNotifications = notifications.filter((notification) => inferKind(notification) !== 'emergency');

  const dashboardHref = currentUser?.role === 'CITIZEN' ? '/dashboard/citizen' : '/auth/login';

  const markAllAsRead = () => {
    if (!currentUser) return;

    const allNotifications = getJson<UserNotification[]>(localStorage, USER_NOTIFICATIONS_KEY, []);
    const nextStoredNotifications = allNotifications.map((notification) =>
      notification.email === currentUser.email ? { ...notification, isRead: true } : notification
    );
    const nextNotifications = notifications.map((notification) => ({ ...notification, isRead: true }));

    localStorage.setItem(USER_NOTIFICATIONS_KEY, JSON.stringify(nextStoredNotifications));
    setNotifications(nextNotifications);
  };

  const readNotification = (notificationId: string) => {
    if (!currentUser) return;

    setOpenNotificationId((activeId) => (activeId === notificationId ? null : notificationId));

    const allNotifications = getJson<UserNotification[]>(localStorage, USER_NOTIFICATIONS_KEY, []);
    const nextStoredNotifications = allNotifications.map((notification) =>
      notification.email === currentUser.email && notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );
    const nextNotifications = notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification
    );

    localStorage.setItem(USER_NOTIFICATIONS_KEY, JSON.stringify(nextStoredNotifications));
    setNotifications(nextNotifications);
  };

  const renderNotification = (notification: UserNotification) => {
    const kind = inferKind(notification);
    const style = kindStyles[kind];
    const Icon = style.icon;
    const isOpen = openNotificationId === notification.id;

    return (
      <article
        key={notification.id}
        className={`rounded-lg border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${style.cardClass} ${
          notification.isRead ? 'opacity-70' : ''
        }`}
      >
        <button type="button" onClick={() => readNotification(notification.id)} className="w-full text-left">
          <div className="flex items-start gap-3">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${style.iconClass}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className={`text-sm font-extrabold leading-5 ${style.titleClass}`}>{notification.title}</h2>
                <span className="shrink-0 text-xs font-semibold text-gray-500">
                  {getRelativeTime(notification.createdAt)}
                </span>
              </div>
              <p className={`mt-1 text-xs font-semibold leading-5 text-gray-700 ${isOpen ? '' : 'line-clamp-2'}`}>
                {notification.message}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${style.badgeClass}`}>
                  {style.label}
                </span>
                <span className={notification.isRead ? 'badge-green' : 'badge-yellow'}>
                  {notification.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
            </div>
          </div>
        </button>

        {isOpen ? (
          <div className="mt-3 border-t border-black/5 pt-3">
            <p className="text-xs font-semibold leading-5 text-gray-600">
              Received {new Date(notification.createdAt).toLocaleString()}
            </p>
            {notification.activityId ? (
              <Link
                href={`/activities?activityId=${notification.activityId}`}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-emerald-700 px-3 text-xs font-bold text-white transition hover:bg-emerald-800"
              >
                View activity
              </Link>
            ) : null}
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24 text-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-10 w-full max-w-md items-center justify-between px-4 lg:max-w-none lg:px-8">
          <div className="flex items-center gap-3">
            <Link href={dashboardHref} aria-label="Go back" className="grid h-8 w-8 place-items-center text-emerald-800">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-sm font-extrabold text-emerald-800">Notifications</h1>
          </div>
          <button type="button" aria-label="Notification settings" className="grid h-8 w-8 place-items-center text-gray-700">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-md px-4 lg:max-w-none lg:px-8">
        {!currentUser ? (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Please log in to view notifications.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2">
              <p className="text-sm font-semibold text-gray-700">{unreadCount} Unread</p>
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-sm font-bold text-emerald-700 disabled:text-gray-300"
              >
                Mark all as read
              </button>
            </div>

            {emergencyNotifications.length > 0 ? (
              <section className="mt-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-red-600">
                  <Megaphone className="h-4 w-4" />
                  Emergency Alerts
                </div>
                <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                  {emergencyNotifications.map(renderNotification)}
                </div>
              </section>
            ) : null}

            <div
              aria-hidden="true"
              className="my-5 h-5 w-full bg-[linear-gradient(135deg,#e5ecea_25%,transparent_25%),linear-gradient(225deg,#e5ecea_25%,transparent_25%),linear-gradient(315deg,#e5ecea_25%,transparent_25%),linear-gradient(45deg,#e5ecea_25%,transparent_25%)] bg-[length:16px_16px] bg-[position:8px_0,8px_0,0_0,0_0]"
            />

            <section className="mt-4">
              <h2 className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-gray-700">Earlier Today</h2>
              {regularNotifications.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                  <Bell className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 xl:grid-cols-3">
                  {regularNotifications.map(renderNotification)}
                </div>
              )}
            </section>

            <section className="mt-5 overflow-hidden rounded-lg border border-emerald-900/10 bg-emerald-800 p-4 text-white shadow-sm">
              <div className="max-w-[14rem]">
                <p className="text-xs font-semibold uppercase text-emerald-100">Stay Connected</p>
                <p className="mt-1 text-base font-extrabold leading-5">Your voice matters in building a stronger Umudugudu.</p>
              </div>
            </section>
          </>
        )}
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2 text-[10px] font-semibold lg:max-w-none lg:px-8">
          <Link href={dashboardHref} className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link href="/notifications" className="flex flex-col items-center justify-center gap-1 text-emerald-800">
            <Bell className="h-5 w-5" />
            Alerts
          </Link>
          <Link href="/service-requests" className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <Grid2X2 className="h-5 w-5" />
            Services
          </Link>
          <Link href="/dashboard/citizen" className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <UserRound className="h-5 w-5" />
            Profile
          </Link>
        </div>
      </nav>
    </main>
  );
}
