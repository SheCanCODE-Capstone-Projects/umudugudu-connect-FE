'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Megaphone,
  Send,
  Users,
  MapPin,
  Clock,
  Info,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Home,
  Bell,
  Grid2X2,
  UserRound,
} from 'lucide-react';

type Target = 'all' | 'specific';

export default function AnnouncementsPage() {
  const [title, setTitle]         = useState('');
  const [message, setMessage]     = useState('');
  const [target, setTarget]       = useState<Target>('all');
  const [isibo, setIsibo]         = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [touched, setTouched]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const titleError   = touched && !title.trim();
  const messageError = touched && !message.trim();
  const isiboError   = touched && target === 'specific' && !isibo.trim();

  const handleSend = () => {
    setTouched(true);
    if (!title.trim() || !message.trim()) return;
    if (target === 'specific' && !isibo.trim()) return;
    setSubmitted(true);
  };

  // ── Success screen ────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f8fafc] pb-24 text-gray-950">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-10 w-full max-w-md items-center justify-between px-4 lg:max-w-none lg:px-8">
            <div className="flex items-center gap-3">
              <Link href="/notifications" className="grid h-8 w-8 place-items-center text-emerald-800">
                <ChevronLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-sm font-extrabold text-emerald-800">Send Announcement</h1>
            </div>
          </div>
        </header>

        {/* Success message */}
        <div className="mx-auto flex max-w-md flex-col items-center px-4 pt-24 text-center lg:max-w-none lg:px-8">
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-emerald-50">
            <CheckCircle className="h-10 w-10 text-emerald-700" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Announcement Sent!</h2>
          <p className="mt-2 text-sm font-semibold text-gray-500">
            {target === 'all'
              ? 'All citizens in your village will receive a push notification and SMS fallback within 2 minutes.'
              : `Citizens in ${isibo} will receive a push notification and SMS fallback within 2 minutes.`}
          </p>
          {scheduled && schedDate && (
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              Scheduled for: {new Date(schedDate).toLocaleString()}
            </p>
          )}
          <Link
            href="/notifications"
            className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-emerald-700 px-6 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Back to Notifications
          </Link>
        </div>

        {/* Bottom nav */}
        <BottomNav />
      </main>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24 text-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-10 w-full max-w-md items-center justify-between px-4 lg:max-w-none lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="grid h-8 w-8 place-items-center text-emerald-800">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-sm font-extrabold text-emerald-800">Send Announcement</h1>
          </div>
          <Megaphone className="h-5 w-5 text-emerald-700" />
        </div>
      </header>

      <section className="mx-auto w-full max-w-md px-4 py-5 lg:max-w-none lg:px-8">

        {/* Info banner */}
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-xs font-semibold text-blue-700">
            Citizens will receive a push notification and SMS fallback within 2 minutes of sending.
          </p>
        </div>

        {/* Form card */}
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Announcement title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Umuganda this Saturday"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-600 ${
                titleError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            {titleError && (
              <p className="mt-1 text-xs font-semibold text-red-600">Title is required</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Message
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your announcement here…"
              rows={4}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-600 ${
                messageError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            {messageError && (
              <p className="mt-1 text-xs font-semibold text-red-600">Message is required</p>
            )}
          </div>

          {/* Target */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">
              Send to
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTarget('all')}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-bold transition ${
                  target === 'all'
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                }`}
              >
                <Users className="h-4 w-4" /> All citizens
              </button>
              <button
                onClick={() => setTarget('specific')}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-bold transition ${
                  target === 'specific'
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                }`}
              >
                <MapPin className="h-4 w-4" /> Specific isibo
              </button>
            </div>

            {target === 'specific' && (
              <div className="mt-3">
                <input
                  value={isibo}
                  onChange={e => setIsibo(e.target.value)}
                  placeholder="Enter isibo name…"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-600 ${
                    isiboError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                />
                {isiboError && (
                  <p className="mt-1 text-xs font-semibold text-red-600">Isibo name is required</p>
                )}
              </div>
            )}
          </div>

          {/* Schedule toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Schedule for later</p>
                <p className="text-xs font-semibold text-gray-500">
                  Queue the announcement for a future time
                </p>
              </div>
              <button
                onClick={() => setScheduled(!scheduled)}
                className={`transition ${scheduled ? 'text-emerald-700' : 'text-gray-400'}`}
              >
                {scheduled
                  ? <ToggleRight className="h-8 w-8" />
                  : <ToggleLeft  className="h-8 w-8" />
                }
              </button>
            </div>

            {scheduled && (
              <input
                type="datetime-local"
                value={schedDate}
                onChange={e => setSchedDate(e.target.value)}
                className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-600"
              />
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800"
          >
            {scheduled && schedDate ? (
              <><Clock className="h-4 w-4" /> Schedule Announcement</>
            ) : (
              <><Send className="h-4 w-4" /> Send to All Now</>
            )}
          </button>
        </div>
      </section>

      {/* Bottom nav */}
      <BottomNav />
    </main>
  );
}

// ── Bottom nav (matches teammate's style) ─────────────────────────────
function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2 text-[10px] font-semibold lg:max-w-none lg:px-8">
        <Link href="/dashboard/citizen" className="flex flex-col items-center justify-center gap-1 text-gray-500">
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
  );
}