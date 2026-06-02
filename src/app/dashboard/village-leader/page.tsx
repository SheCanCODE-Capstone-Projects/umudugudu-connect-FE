// 'use client';

import LogoutButton, { useRedirectLoggedOut } from '@/components/shared/LogoutButton';

// /**
//  * VillageLeader Dashboard — TODO: implement widgets.
//  * Use useQuery() for server state. useAppSelector() for auth state.
//  */
// export default function VillageLeaderDashboard() {
//   useRedirectLoggedOut();

//   return (
//     <div className="p-6">
//       <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <h1 className="text-2xl font-bold text-gray-900">VillageLeader Dashboard</h1>
//         <LogoutButton showLabel />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         {['Stat 1', 'Stat 2', 'Stat 3'].map((s) => (
//           <div key={s} className="card"><p className="text-sm text-gray-500">{s}</p><p className="text-2xl font-bold">—</p></div>
//         ))}
//       </div>
//       <div className="card"><p className="text-gray-400 text-sm text-center py-8">TODO: add VillageLeader dashboard widgets</p></div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type ActivityStatus = "COMPLETED" | "SCHEDULED" | "CANCELLED" | "ONGOING";
type NavTab = "dashboard" | "attendance" | "payments" | "penalties" | "requests" | "activities" | "reports" | "menu";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: ActivityStatus;
  icon: string;
}

interface QuickStat {
  label: string;
  value: string;
  sub: string;
  subColor: string;
  icon: string;
  href: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const RECENT_ACTIVITIES: Activity[] = [
  { id: "1", title: "Umuganda Community Work", description: "Monthly community cleanup drive", date: "Yesterday", time: "08:00 AM", status: "COMPLETED", icon: "🧹" },
  { id: "2", title: "Night Watch Briefing", description: "Security patrol coordination", date: "Today", time: "06:00 PM", status: "SCHEDULED", icon: "🛡️" },
  { id: "3", title: "Village Health Drive", description: "Malaria prevention distribution", date: "Tomorrow", time: "09:00 AM", status: "SCHEDULED", icon: "💊" },
  { id: "4", title: "Youth Sports Day", description: "Football tournament & games", date: "Jun 2", time: "02:00 PM", status: "SCHEDULED", icon: "⚽" },
];

const STATS: QuickStat[] = [
  { label: "PAYMENTS", value: "210k", sub: "RWF PENDING", subColor: "#e53e3e", icon: "💵", href: "/payments" },
  { label: "REQUESTS", value: "12", sub: "ACTIVE TICKETS", subColor: "#276749", icon: "📋", href: "/service-requests" },
  { label: "PENALTIES", value: "8", sub: "OUTSTANDING", subColor: "#c05621", icon: "⚠️", href: "/penalties" },
  { label: "REPORTS", value: "3", sub: "DUE THIS WEEK", subColor: "#2b6cb0", icon: "📊", href: "/reports" },
];

const STATUS_CONFIG: Record<ActivityStatus, { bg: string; color: string; label: string }> = {
  COMPLETED: { bg: "#c6f6d5", color: "#276749", label: "COMPLETED" },
  SCHEDULED: { bg: "#fef3c7", color: "#92400e", label: "SCHEDULED" },
  ONGOING:   { bg: "#bee3f8", color: "#2c5282", label: "ONGOING" },
  CANCELLED: { bg: "#fed7d7", color: "#9b2c2c", label: "CANCELLED" },
};

const NAV_ITEMS: { id: NavTab; label: string; icon: string; href: string }[] = [
  { id: "dashboard",  label: "Dashboard",  icon: "⊞",  href: "/dashboard" },
  { id: "attendance", label: "Attendance", icon: "👥", href: "/attendance" },
  { id: "payments",   label: "Payments",   icon: "💵", href: "/payments" },
  { id: "requests",   label: "Requests",   icon: "📋", href: "/service-requests" },
  { id: "menu",       label: "Menu",       icon: "☰",  href: "#" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ActivityStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.8px",
      padding: "4px 10px", borderRadius: 20,
      whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace",
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Broadcast Modal ─────────────────────────────────────────────────────────
function BroadcastModal({ onClose }: { onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!msg.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setMsg(""); onClose(); }, 1500);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "20px 20px 0 0",
        width: "100%", maxWidth: 480, padding: "28px 24px 40px",
        animation: "slideUp 0.25s ease",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a202c", fontFamily: "'Fraunces', serif" }}>📢 Broadcast Alert</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#718096" }}>✕</button>
        </div>
        <textarea
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Type your message to all village members…"
          rows={4}
          style={{
            width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10,
            padding: "12px 14px", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
            resize: "none", outline: "none", color: "#2d3748",
            transition: "border-color 0.2s",
          }}
        />
        <button onClick={handleSend} style={{
          marginTop: 14, width: "100%", background: sent ? "#276749" : "#2d6a4f",
          color: "#fff", border: "none", borderRadius: 10,
          padding: "13px 0", fontSize: 14, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          transition: "background 0.2s",
        }}>
          {sent ? "✓ Sent to all members!" : "Send Broadcast"}
        </button>
      </div>
    </div>
  );
}

// ─── Create Activity Modal ────────────────────────────────────────────────────
function CreateActivityModal({ onClose, onCreated }: { onClose: () => void; onCreated: (a: Activity) => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title || !date || !time) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    onCreated({
      id: String(Date.now()),
      title,
      description: "Village activity",
      date: new Date(date).toLocaleDateString("en-RW", { month: "short", day: "numeric" }),
      time,
      status: "SCHEDULED",
      icon: "📅",
    });
    setSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "20px 20px 0 0",
        width: "100%", maxWidth: 480, padding: "28px 24px 40px",
        animation: "slideUp 0.25s ease",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a202c", fontFamily: "'Fraunces', serif" }}>⊕ Create Activity</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#718096" }}>✕</button>
        </div>
        {[
          { label: "Activity Title", value: title, set: setTitle, type: "text", placeholder: "e.g. Umuganda Community Work" },
          { label: "Date", value: date, set: setDate, type: "date", placeholder: "" },
          { label: "Time", value: time, set: setTime, type: "time", placeholder: "" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#718096", letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{f.label}</label>
            <input
              type={f.type} value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              style={{
                width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10,
                padding: "11px 14px", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                outline: "none", color: "#2d3748", background: "#f7fafc",
              }}
            />
          </div>
        ))}
        <button onClick={handleCreate} style={{
          marginTop: 8, width: "100%", background: saving ? "#276749" : "#2d6a4f",
          color: "#fff", border: "none", borderRadius: 10,
          padding: "13px 0", fontSize: 14, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          opacity: (!title || !date || !time) ? 0.5 : 1,
        }}>
          {saving ? "Creating…" : "Create Activity"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VillageLeaderDashboard() {
  const [activeNav, setActiveNav] = useState<NavTab>("dashboard");
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(RECENT_ACTIVITIES);

  const handleCreated = (a: Activity) => {
    setActivities(prev => [a, ...prev]);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green: #2d6a4f;
          --green-dark: #1b4332;
          --green-light: #d8f3dc;
          --accent: #52b788;
          --bg: #f0f4f1;
          --surface: #ffffff;
          --border: #e2e8e4;
          --text: #1a202c;
          --muted: #718096;
          --radius: 16px;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .shell {
          max-width: 480px;
          margin: 0 auto;
          min-height: 100dvh;
          background: var(--bg);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* Top bar */
        .topbar {
          background: var(--surface);
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #52b788, #2d6a4f);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700; color: #fff;
          font-family: 'Fraunces', serif;
          flex-shrink: 0;
        }
        .brand-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--green-dark);
          font-family: 'Fraunces', serif;
          letter-spacing: -0.3px;
        }
        .bell-btn {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 16px;
          position: relative;
          transition: background 0.2s;
        }
        .bell-btn::after {
          content: '';
          position: absolute;
          top: 6px; right: 7px;
          width: 7px; height: 7px;
          background: #e53e3e;
          border-radius: 50%;
          border: 1.5px solid var(--surface);
        }
        .bell-btn:hover { background: var(--green-light); }

        /* Scroll area */
        .scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px 20px 100px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Greeting */
        .greeting {
          animation: fadeIn 0.4s ease both;
        }
        .greeting-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          font-family: 'Fraunces', serif;
        }
        .greeting-sub {
          font-size: 13px;
          color: var(--muted);
          margin-top: 2px;
        }

        /* Card */
        .card {
          background: var(--surface);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          padding: 18px;
          animation: fadeIn 0.4s ease both;
        }

        /* Attendance card */
        .attendance-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .attendance-label {
          font-size: 12px;
          color: var(--muted);
          letter-spacing: 0.5px;
          font-family: 'DM Mono', monospace;
        }
        .attendance-icon { font-size: 22px; }
        .attendance-rate {
          font-size: 28px;
          font-weight: 700;
          color: var(--green);
          font-family: 'Fraunces', serif;
          display: inline;
        }
        .attendance-delta {
          font-size: 13px;
          color: var(--accent);
          font-weight: 500;
          margin-left: 8px;
        }
        .progress-bar-wrap {
          margin-top: 14px;
          background: var(--green-light);
          border-radius: 99px;
          height: 6px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          width: 84%;
          background: linear-gradient(90deg, var(--accent), var(--green));
          border-radius: 99px;
          transition: width 0.6s ease;
        }

        /* Stats 2-col grid */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          animation: fadeIn 0.5s ease both;
          animation-delay: 0.05s;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          text-decoration: none;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .stat-card:active { transform: scale(0.97); }
        .stat-icon { font-size: 20px; margin-bottom: 10px; }
        .stat-label-text {
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
          margin-bottom: 6px;
        }
        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          font-family: 'Fraunces', serif;
        }
        .stat-sub {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.8px;
          margin-top: 4px;
          font-family: 'DM Mono', monospace;
        }

        /* Divider ornament */
        .divider-ornament {
          display: flex;
          align-items: center;
          gap: 6px;
          animation: fadeIn 0.4s ease both;
          animation-delay: 0.1s;
        }
        .ornament-line {
          flex: 1;
          height: 1px;
          background: repeating-linear-gradient(
            90deg, var(--green-light) 0px, var(--green-light) 8px,
            transparent 8px, transparent 14px
          );
        }
        .ornament-diamond { color: var(--accent); font-size: 14px; }

        /* Section header */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .section-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
          font-family: 'DM Mono', monospace;
        }
        .view-all {
          font-size: 13px;
          color: var(--green);
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
        }
        .view-all:hover { text-decoration: underline; }

        /* Quick actions */
        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: fadeIn 0.5s ease both;
          animation-delay: 0.15s;
        }
        .btn-primary {
          background: var(--green);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 15px 20px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s;
          width: 100%;
        }
        .btn-primary:hover { background: var(--green-dark); }
        .btn-primary:active { transform: scale(0.98); }
        .btn-secondary {
          background: transparent;
          color: var(--green);
          border: 1.5px solid var(--green);
          border-radius: 12px;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s;
          width: 100%;
        }
        .btn-secondary:hover { background: var(--green-light); }
        .btn-secondary:active { transform: scale(0.98); }
        .btn-outline-danger {
          background: transparent;
          color: #c53030;
          border: 1.5px solid #feb2b2;
          border-radius: 12px;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s;
          width: 100%;
        }
        .btn-outline-danger:hover { background: #fff5f5; }

        /* Activity list */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: fadeIn 0.5s ease both;
          animation-delay: 0.2s;
        }
        .activity-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: transform 0.15s;
          cursor: pointer;
        }
        .activity-item:hover { transform: translateX(3px); }
        .activity-emoji {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--green-light);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .activity-info { flex: 1; min-width: 0; }
        .activity-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .activity-meta {
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
        }

        /* Nav bar */
        .nav-bar {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 480px;
          background: var(--surface);
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 8px 0 12px;
          z-index: 50;
        }
        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.2s;
          text-decoration: none;
          border: none;
          background: none;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-icon { font-size: 18px; line-height: 1; }
        .nav-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        .nav-item.active .nav-label { color: var(--green); font-weight: 700; }
        .nav-item.active .nav-icon { filter: none; }
        .nav-item:not(.active) .nav-label { color: var(--muted); }
        .nav-active-dot {
          width: 4px; height: 4px;
          background: var(--green);
          border-radius: 50%;
          margin-top: 2px;
        }

        /* Privilege banner */
        .privilege-banner {
          background: linear-gradient(135deg, var(--green-dark), var(--green));
          border-radius: var(--radius);
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          animation: fadeIn 0.5s ease both;
          animation-delay: 0.25s;
        }
        .privilege-icon { font-size: 28px; }
        .privilege-text h4 {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          font-family: 'Fraunces', serif;
          margin-bottom: 2px;
        }
        .privilege-text p { font-size: 12px; color: rgba(255,255,255,0.75); }
      `}</style>

      <div className="shell">
        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-brand">
            <div className="avatar">M</div>
            <span className="brand-name">Umudugudu Connect</span>
          </div>
          <button className="bell-btn" aria-label="Notifications">🔔</button>
        </div>

        {/* Scroll Area */}
        <div className="scroll-area">

          {/* Greeting */}
          <div className="greeting">
            <p className="greeting-name">Muraho, Village Leader</p>
            <p className="greeting-sub">Here is your Umudugudu&apos;s status for today.</p>
          </div>

          {/* Attendance Card */}
          <div className="card">
            <div className="attendance-header">
              <span className="attendance-label">Attendance Rate</span>
              <span className="attendance-icon">👥</span>
            </div>
            <div>
              <span className="attendance-rate">84%</span>
              <span className="attendance-delta">↑ +2% from last month</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" />
            </div>
          </div>

          {/* Quick Stats 2×2 */}
          <div className="stats-grid">
            {STATS.map(s => (
              <Link href={s.href} key={s.label} className="stat-card" style={{ textDecoration: "none" }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-label-text">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
              </Link>
            ))}
          </div>

          {/* Ornament Divider */}
          <div className="divider-ornament">
            <div className="ornament-line" />
            <span className="ornament-diamond">◆</span>
            <div className="ornament-line" />
          </div>

          {/* Quick Actions */}
          <div>
            <div className="section-header">
              <span className="section-title">Quick Actions</span>
            </div>
            <div className="quick-actions">
              <button className="btn-primary" onClick={() => setShowCreateActivity(true)}>
                ⊕ &nbsp;Create Activity
              </button>
              <button className="btn-secondary" onClick={() => setShowBroadcast(true)}>
                📢 &nbsp;Broadcast Alert
              </button>
              <Link href="/payments/export" style={{ textDecoration: "none" }}>
                <button className="btn-secondary" style={{ width: "100%" }}>
                  ⬇ &nbsp;Export Payment CSV
                </button>
              </Link>
              <Link href="/dashboard/village-leader/payment-record" style={{ textDecoration: "none" }}>
                <button className="btn-secondary" style={{ width: "100%" }}>
                  💵 &nbsp;View Payment Records
                </button>
              </Link>
              <button className="btn-outline-danger">
                ⚠️ &nbsp;Issue Penalty
              </button>
            </div>
          </div>

          {/* Privilege Banner */}
          <div className="privilege-banner">
            <span className="privilege-icon">🏅</span>
            <div className="privilege-text">
              <h4>Village Leader Access</h4>
              <p>Full financial transparency · Activity management · Alerts & reporting</p>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <div className="section-header">
              <span className="section-title">Recent Activities</span>
              <Link href="/activities" className="view-all">View All</Link>
            </div>
            <div className="activity-list">
              {activities.map(a => (
                <div className="activity-item" key={a.id}>
                  <div className="activity-emoji">{a.icon}</div>
                  <div className="activity-info">
                    <div className="activity-title">{a.title}</div>
                    <div className="activity-meta">{a.date}, {a.time}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </div>

        </div>{/* end scroll-area */}

        {/* Bottom Nav */}
        <nav className="nav-bar">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activeNav === item.id && <div className="nav-active-dot" />}
            </button>
          ))}
        </nav>

        {/* Modals */}
        {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} />}
        {showCreateActivity && (
          <CreateActivityModal
            onClose={() => setShowCreateActivity(false)}
            onCreated={handleCreated}
          />
        )}
      </div>
    </>
  );
}
