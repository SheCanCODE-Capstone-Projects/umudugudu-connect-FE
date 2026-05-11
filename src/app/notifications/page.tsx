'use client';

import { useEffect, useState } from 'react';

const CURRENT_USER_KEY = 'umudugudu_current_user';
const USER_NOTIFICATIONS_KEY = 'umudugudu_user_notifications';

type CurrentUser = {
  email: string;
  fullName: string;
  role: string;
};

type UserNotification = {
  id: string;
  email: string;
  title: string;
  message: string;
  createdAt: number;
  isRead: boolean;
};

const getCurrentUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY) ?? 'null') as CurrentUser | null;
  } catch {
    return null;
  }
};

const getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_NOTIFICATIONS_KEY) ?? '[]') as UserNotification[];
  } catch {
    return [];
  }
};

export default function NotificationsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (!user) return;

    const userNotifications = getNotifications()
      .filter((notification) => notification.email === user.email)
      .sort((a, b) => b.createdAt - a.createdAt);

    setNotifications(userNotifications);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {currentUser ? <span className="badge-blue">{currentUser.role}</span> : null}
      </div>

      <div className="card">
        {!currentUser ? (
          <div className="py-12 text-center">
            <p className="font-medium text-gray-500">Please log in to view notifications.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-2xl">!</span>
            </div>
            <p className="font-medium text-gray-500">No notifications yet</p>
            <p className="mt-1 text-sm text-gray-400">Role updates from admin will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article key={notification.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">{notification.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                  </div>
                  <span className={notification.isRead ? 'badge-green' : 'badge-yellow'}>
                    {notification.isRead ? 'Read' : 'New'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
