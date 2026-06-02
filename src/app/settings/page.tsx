'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Bell,
  BellOff,
  AlertTriangle,
  CalendarDays,
  Megaphone,
  CreditCard,
  FileText,
  CheckCircle,
  Home,
  Grid2X2,
  UserRound,
} from 'lucide-react';

type PrefKey =
  | 'emergency'
  | 'activity'
  | 'announcements'
  | 'penalties'
  | 'requests'
  | 'documents';

interface NotifPref {
  key:         PrefKey;
  label:       string;
  description: string;
  icon:        React.ReactNode;
  iconClass:   string;
  locked:      boolean;
}

const prefs: NotifPref[] = [
  {
    key:         'emergency',
    label:       'Emergency Alerts',
    description: 'Urgent alerts from your Village Leader. Cannot be turned off.',
    icon:        <AlertTriangle className="h-5 w-5" />,
    iconClass:   ' text-red-600',
    locked:      true,
  },
  {
    key:         'activity',
    label:       'Activity Reminders',
    description: 'Reminders for Umuganda and Imihigo activities.',
    icon:        <CalendarDays className="h-5 w-5" />,
    iconClass:   ' text-emerald-700',
    locked:      false,
  },
  {
    key:         'announcements',
    label:       'Village Announcements',
    description: 'General news and messages from your Village Leader.',
    icon:        <Megaphone className="h-5 w-5" />,
    iconClass:   'text-blue-600',
    locked:      false,
  },
  {
    key:         'penalties',
    label:       'Penalty Notifications',
    description: 'Alerts when a penalty is assigned to your account.',
    icon:        <CreditCard className="h-5 w-5" />,
    iconClass:   'text-amber-600',
    locked:      false,
  },
  {
    key:         'requests',
    label:       'Service Request Updates',
    description: 'Status changes on your submitted service requests.',
    icon:        <FileText className="h-5 w-5" />,
    iconClass:   'text-purple-600',
    locked:      false,
  },
  {
    key:         'documents',
    label:       'Document Notifications',
    description: 'Alerts when new community documents are available.',
    icon:        <Bell className="h-5 w-5" />,
    iconClass:   'text-gray-600',
    locked:      false,
  },
];

export default function SettingsPage() {
  const [enabled, setEnabled] = useState<Record<PrefKey, boolean>>({
    emergency:     true,
    activity:      true,
    announcements: true,
    penalties:     true,
    requests:      false,
    documents:     false,
  });

  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (key: PrefKey, locked: boolean) => {
    if (locked) return;
    setSaved(false);
    setEnabled(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate save delay
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 800);
  };

  const enabledCount  = Object.values(enabled).filter(Boolean).length;
  const disabledCount = Object.values(enabled).filter(v => !v).length;

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24 text-gray-950">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-10 w-full max-w-md items-center justify-between px-4 lg:max-w-none lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="grid h-8 w-8 place-items-center text-emerald-800"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-sm font-extrabold text-emerald-800">
              Notification Preferences
            </h1>
          </div>
          <Bell className="h-5 w-5 text-emerald-700" />
        </div>
      </header>

      <section className="mx-auto w-full max-w-md px-4 py-5 lg:max-w-none lg:px-8">

        {/* Page title */}
        <div className="mb-4">
          <h2 className="text-base font-extrabold text-gray-900">
            Notification Settings
          </h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">
            Choose which notifications you receive. Emergency alerts are always on for your safety.
          </p>
        </div>

        {/* Summary bar */}
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100">
              <Bell className="h-3.5 w-3.5 text-emerald-700" />
            </span>
            <span className="text-xs font-extrabold text-emerald-700">
              {enabledCount} on
            </span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-gray-100">
              <BellOff className="h-3.5 w-3.5 text-gray-500" />
            </span>
            <span className="text-xs font-extrabold text-gray-500">
              {disabledCount} off
            </span>
          </div>
        </div>

        {/* Preferences list */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {prefs.map((pref, index) => (
            <div
              key={pref.key}
              className={`flex items-center gap-4 px-5 py-4 transition ${
                index < prefs.length - 1 ? 'border-b border-gray-100' : ''
              } ${pref.locked ? 'opacity-90' : 'hover:bg-gray-50'}`}
            >
              {/* Icon */}
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${pref.iconClass} bg-transparent`}>
                {pref.icon}
              </span>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-gray-900">{pref.label}</p>
                  {pref.locked && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700">
                      Always on
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs font-semibold text-gray-500">
                  {pref.description}
                </p>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggle(pref.key, pref.locked)}
                disabled={pref.locked}
                aria-label={`Toggle ${pref.label}`}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                  enabled[pref.key]
                    ? 'bg-emerald-600'
                    : 'bg-gray-200'
                } ${pref.locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    enabled[pref.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p className="text-xs font-semibold text-blue-700">
            Even if you turn off Activity Reminders, you will still receive Emergency Alerts
            regardless of your preferences.
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:opacity-70"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving…
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" /> Save Preferences
            </>
          )}
        </button>

        {/* Success message */}
        {saved && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs font-extrabold text-emerald-700">
              Preferences saved successfully!
            </p>
          </div>
        )}
      </section>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2 text-[10px] font-semibold lg:max-w-none lg:px-8">
          <Link
            href="/dashboard/citizen"
            className="flex flex-col items-center justify-center gap-1 text-gray-500"
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link
            href="/notifications"
            className="flex flex-col items-center justify-center gap-1 text-emerald-800"
          >
            <Bell className="h-5 w-5" />
            Alerts
          </Link>
          <Link
            href="/service-requests"
            className="flex flex-col items-center justify-center gap-1 text-gray-500"
          >
            <Grid2X2 className="h-5 w-5" />
            Services
          </Link>
          <Link
            href="/dashboard/citizen"
            className="flex flex-col items-center justify-center gap-1 text-gray-500"
          >
            <UserRound className="h-5 w-5" />
            Profile
          </Link>
        </div>
      </nav>
    </main>
  );
}