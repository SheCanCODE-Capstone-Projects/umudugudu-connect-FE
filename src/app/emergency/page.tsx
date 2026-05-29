'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  AlertTriangle,
  Droplets,
  HeartPulse,
  Flame,
  ShieldAlert,
  MapPin,
  CheckCircle,
  Home,
  Bell,
  Grid2X2,
  UserRound,
  Radio,
} from 'lucide-react';

type EmergencyType = 'Flood' | 'Health' | 'Fire' | 'Security';

const emergencyTypes: {
  type: EmergencyType;
  icon: React.ReactNode;
}[] = [
  { type: 'Flood',    icon: <Droplets  className="h-6 w-6 mx-auto mb-1" /> },
  { type: 'Health',   icon: <HeartPulse className="h-6 w-6 mx-auto mb-1" /> },
  { type: 'Fire',     icon: <Flame      className="h-6 w-6 mx-auto mb-1" /> },
  { type: 'Security', icon: <ShieldAlert className="h-6 w-6 mx-auto mb-1" /> },
];

export default function EmergencyPage() {
  const [selected, setSelected]       = useState<EmergencyType | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation]       = useState('');
  const [useManual, setUseManual]     = useState(false);
  const [touched, setTouched]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const typeError = touched && !selected;
  const descError = touched && !description.trim();

  const handleReport = () => {
    setTouched(true);
    if (!selected || !description.trim()) return;
    setSubmitted(true);
  };

  // ── Success screen ────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f8fafc] pb-24 text-gray-950">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-10 w-full max-w-md items-center px-4 lg:max-w-none lg:px-8">
            <Link href="/notifications" className="grid h-8 w-8 place-items-center text-emerald-800">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="ml-3 text-sm font-extrabold text-emerald-800">Report Emergency</h1>
          </div>
        </header>

        <div className="mx-auto flex max-w-md flex-col items-center px-4 pt-24 text-center lg:max-w-none lg:px-8">
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-emerald-50">
            <CheckCircle className="h-10 w-10 text-emerald-700" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Emergency Reported!</h2>
          <p className="mt-2 text-sm font-semibold text-gray-500">
            Your Village Leader has been alerted and will respond within 60 seconds. Stay safe.
          </p>

          {/* Report summary */}
          <div className="mt-6 w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-gray-400">
              Report Summary
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Type:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800">
                  {selected}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-gray-500">Details:</span>
                <span className="text-xs font-semibold text-gray-900">{description}</span>
              </div>
              {location && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Location:</span>
                  <span className="text-xs font-semibold text-gray-900">{location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Status:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-700">
                  <Radio className="h-3 w-3" /> Alerting Village Leader…
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/notifications"
            className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-emerald-700 px-6 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Back to Notifications
          </Link>
        </div>

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
            <h1 className="text-sm font-extrabold text-emerald-800">Report Emergency</h1>
          </div>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
      </header>

      <section className="mx-auto w-full max-w-md px-4 py-5 lg:max-w-none lg:px-8">

        {/* Page title + subtitle — matches Figma */}
        <div className="mb-4">
          <h2 className="text-base font-extrabold text-gray-900">Report an Emergency</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">
            Provide critical details to alert local authorities immediately. Your safety is our priority.
          </p>
        </div>

        {/* Zigzag divider — matches Figma */}
        <div
          aria-hidden="true"
          className="my-4 h-5 w-full bg-[linear-gradient(135deg,#e5ecea_25%,transparent_25%),linear-gradient(225deg,#e5ecea_25%,transparent_25%),linear-gradient(315deg,#e5ecea_25%,transparent_25%),linear-gradient(45deg,#e5ecea_25%,transparent_25%)] bg-[length:16px_16px] bg-[position:8px_0,8px_0,0_0,0_0]"
        />

        {/* Form card */}
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          {/* Emergency type — icon on top, label below, matches Figma */}
          <div>
            <label className="mb-3 block text-xs font-extrabold uppercase tracking-widest text-gray-500">
              Select Emergency Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {emergencyTypes.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => setSelected(type)}
                  className={`flex flex-col items-center rounded-lg border py-4 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-md ${
                    selected === type
                      ? 'border-emerald-700 bg-white text-emerald-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                  }`}
                >
                  <span className={selected === type ? 'text-emerald-700' : 'text-gray-400'}>
                    {icon}
                  </span>
                  {type}
                </button>
              ))}
            </div>
            {typeError && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                Please select an emergency type
              </p>
            )}
          </div>

          {/* Situation details */}
          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-gray-500">
              Situation Details
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what is happening and who is involved…"
              rows={4}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-600 ${
                descError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            {descError && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                Please describe the situation
              </p>
            )}
          </div>

          {/* Location confirmation — matches Figma map section */}
          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-gray-500">
              Location Confirmation
            </label>

            {/* Map placeholder */}
            {!useManual && (
              <div className="relative mb-3 overflow-hidden rounded-lg border border-gray-200">
                <div className="h-32 w-full bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-200 flex items-center justify-center">
                  {/* Simulated map tiles */}
                  <div className="absolute inset-0 grid grid-cols-3 opacity-40">
                    <div className="bg-emerald-300 border border-emerald-400" />
                    <div className="bg-green-200 border border-green-300" />
                    <div className="bg-emerald-300 border border-emerald-400" />
                  </div>
                  {/* Pin */}
                  <div className="relative z-10 flex flex-col items-center">
                    <MapPin className="h-8 w-8 text-red-600 drop-shadow-md" />
                  </div>
                </div>
                {/* Location label at bottom — matches Figma */}
                <div className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span className="text-xs font-semibold text-gray-700">
                    Nyarugenge Sector, Kigali, Rwanda
                  </span>
                </div>
              </div>
            )}

            {/* Enter location manually — matches Figma button */}
            {useManual ? (
              <div className="space-y-2">
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Type your location…"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  onClick={() => setUseManual(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-xs font-bold text-gray-600 transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  <MapPin className="h-4 w-4" /> Use GPS instead
                </button>
              </div>
            ) : (
              <button
                onClick={() => setUseManual(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-xs font-bold text-gray-600 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <MapPin className="h-4 w-4" /> Enter Location Manually
              </button>
            )}
          </div>

          {/* Report Now button — green, matches Figma */}
          <button
            onClick={handleReport}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800"
          >
            <Radio className="h-4 w-4" /> Report Now
          </button>

          {/* Warning text below button — matches Figma */}
          <p className="text-center text-xs font-semibold text-gray-400">
            False reporting is a punishable offense under Article 142.
          </p>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

// ── Bottom nav ────────────────────────────────────────────────────────
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