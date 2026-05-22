"use client";

import { useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Users,
  Building2,
  Pencil,
  Clock,
  ArrowLeft,
  Send,
  ChevronRight,
  Info,
} from "lucide-react";

// ── Design tokens (matched to Figma screenshots) ──────────────────────
const G = {
  green:       "#1C6B3A",
  teal:        "#1B6B5E",
  bgPage:      "#F0F2F5",
  bgCard:      "#FFFFFF",
  border:      "#E2E5EA",
  textPrimary: "#0F1923",
  textMuted:   "#6B7280",
  errorRed:    "#DC2626",
};

// ── Types ─────────────────────────────────────────────────────────────
type Screen     = "profile" | "request" | "track";
type StatusType = "Pending" | "Approved" | "Rejected" | "Info_required";

interface ChangeRequest {
  field:   string;
  oldVal:  string;
  newVal:  string;
  date:    string;
  status:  StatusType;
  comment: string | null;
}

// ── Nav bar ───────────────────────────────────────────────────────────
function NavBar({ active, setPage }: { active: string; setPage: (p: string) => void }) {
  const links = ["Home", "Contributions", "Services", "News"];
  return (
    <nav style={{
      background: G.bgCard, borderBottom: `1px solid ${G.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", height: 64,
    }}>
      <span style={{ fontWeight: 700, fontSize: 20, color: G.teal, letterSpacing: "-0.3px" }}>
        Umudugudu Connect
      </span>
      <div style={{ display: "flex", gap: 36 }}>
        {links.map(l => (
          <button key={l} onClick={() => setPage(l.toLowerCase())} style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 15,
            fontWeight: active === l.toLowerCase() ? 600 : 400,
            color:      active === l.toLowerCase() ? G.green : G.textMuted,
            borderBottom: active === l.toLowerCase()
              ? `2px solid ${G.green}` : "2px solid transparent",
            padding: "4px 0",
          }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: G.textMuted, display: "flex" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: G.green, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14,
        }}>BM</div>
      </div>
    </nav>
  );
}

// ── Info row with icon ────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 0", borderBottom: `1px solid ${G.border}`,
    }}>
      <div style={{ color: G.teal, flexShrink: 0, display: "flex" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: G.textPrimary }}>{value}</div>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────
function Badge({ status }: { status: StatusType }) {
  const map: Record<StatusType, { bg: string; color: string }> = {
    Pending:       { bg: "#FFF7ED", color: "#B45309" },
    Approved:      { bg: "#F0FDF4", color: "#15803D" },
    Rejected:      { bg: "#FEF2F2", color: "#B91C1C" },
    Info_required: { bg: "#EFF6FF", color: "#1D4ED8" },
  };
  const s = map[status];
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 12, fontWeight: 600,
      padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap",
    }}>{status.replace("_", " ")}</span>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: G.bgCard, borderRadius: 16, border: `1px solid ${G.border}`,
      padding: "24px 28px", ...style,
    }}>{children}</div>
  );
}

// ── Screen 1: View Profile ────────────────────────────────────────────
function ViewProfileScreen({
  onRequestChange,
  onViewRequests,
}: {
  onRequestChange: () => void;
  onViewRequests:  () => void;
}) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: G.textPrimary, marginBottom: 4 }}>
        My Profile
      </h1>
      <p style={{ color: G.textMuted, fontSize: 15, marginBottom: 32 }}>
        Nyarugenge District, Village of Indatwa.
      </p>

      <Card>
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{
            width: 68, height: 68, borderRadius: "50%",
            background: G.green, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 24, flexShrink: 0,
          }}>BM</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: G.textPrimary }}>Bwiza Marie</div>
            <span style={{
              background: "#F0FDF4", color: G.green, fontSize: 12, fontWeight: 600,
              padding: "2px 12px", borderRadius: 20, display: "inline-block", marginTop: 4,
            }}>Citizen</span>
          </div>
        </div>

        <InfoRow icon={<User size={18} />}      label="Full name" value="Bwiza Marie" />
        <InfoRow icon={<Phone size={18} />}     label="Phone"     value="+250 788 123 456" />
        <InfoRow icon={<MapPin size={18} />}    label="Village"   value="Indatwa" />
        <InfoRow icon={<Users size={18} />}     label="Isibo"     value="Isibo 2" />
        <InfoRow icon={<Building2 size={18} />} label="District"  value="Nyarugenge" />

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={onRequestChange} style={{
            background: G.green, color: "#fff", border: "none",
            borderRadius: 10, padding: "13px 0", fontWeight: 600, fontSize: 15,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}>
            <Pencil size={16} /> Request a change
          </button>
          <button onClick={onViewRequests} style={{
            background: "transparent", color: G.teal, border: `1.5px solid ${G.teal}`,
            borderRadius: 10, padding: "12px 0", fontWeight: 600, fontSize: 15,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}>
            <Clock size={16} /> My change requests
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Screen 2: Request a change ────────────────────────────────────────
function RequestChangeScreen({ onBack }: { onBack: () => void }) {
  const fields = ["Full name", "Phone number", "Village", "Isibo"];
  const currentValues: Record<string, string> = {
    "Full name":    "Bwiza Marie",
    "Phone number": "+250 788 123 456",
    "Village":      "Indatwa",
    "Isibo":        "Isibo 2",
  };

  const [field, setField]         = useState("Full name");
  const [newValue, setNewValue]   = useState("");
  const [reason, setReason]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched]     = useState(false);

  const hasError = touched && !newValue.trim();

  if (submitted) return (
    <div style={{ maxWidth: 480, margin: "100px auto", textAlign: "center", padding: "0 24px" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%", background: "#F0FDF4",
        margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={G.green}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 style={{ fontWeight: 700, fontSize: 24, color: G.textPrimary, marginBottom: 8 }}>
        Request submitted!
      </h2>
      <p style={{ color: G.textMuted, marginBottom: 36 }}>
        Your Village Leader has been notified and will approve or reject your change.
      </p>
      <button onClick={onBack} style={{
        background: G.green, color: "#fff", border: "none",
        borderRadius: 10, padding: "13px 40px",
        fontWeight: 600, fontSize: 15, cursor: "pointer",
      }}>Back to profile</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: G.teal, fontWeight: 600,
        fontSize: 15, cursor: "pointer", marginBottom: 28,
        display: "flex", alignItems: "center", gap: 6, padding: 0,
      }}>
        <ArrowLeft size={18} /> Back to profile
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, color: G.textPrimary }}>
        Request a change
      </h1>
      <p style={{ color: G.textMuted, marginBottom: 28 }}>
        Changes require approval from your Village Leader.
      </p>

      <div style={{
        background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10,
        padding: "12px 16px", marginBottom: 28, fontSize: 14, color: "#1D4ED8",
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        You will be notified once the leader has reviewed your request.
      </div>

      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14, color: G.textPrimary }}>
              Field to update
            </label>
            <select value={field}
              onChange={e => { setField(e.target.value); setNewValue(""); setTouched(false); }}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: `1.5px solid ${G.border}`, fontSize: 15,
                background: "#fff", color: G.textPrimary, boxSizing: "border-box",
              }}>
              {fields.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14, color: G.textPrimary }}>
              Current value
            </label>
            <input readOnly value={currentValues[field]} style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              border: `1.5px solid ${G.border}`, fontSize: 15,
              background: G.bgPage, color: G.textMuted, boxSizing: "border-box",
            }} />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14, color: G.textPrimary }}>
              New value
            </label>
            <input
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={`Enter the correct ${field.toLowerCase()}…`}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: `1.5px solid ${hasError ? G.errorRed : G.border}`,
                fontSize: 15, boxSizing: "border-box", color: G.textPrimary,
              }}
            />
            {hasError && (
              <p style={{ color: G.errorRed, fontSize: 13, marginTop: 5 }}>
                New value is required
              </p>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14, color: G.textPrimary }}>
              Reason{" "}
              <span style={{ fontWeight: 400, color: G.textMuted }}>(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Why do you need this updated?"
              rows={3}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: `1.5px solid ${G.border}`, fontSize: 15,
                resize: "vertical", boxSizing: "border-box", color: G.textPrimary,
              }}
            />
          </div>

          <button
            onClick={() => { setTouched(true); if (newValue.trim()) setSubmitted(true); }}
            style={{
              background: G.green, color: "#fff", border: "none",
              borderRadius: 10, padding: "13px 0", fontWeight: 600, fontSize: 15,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
            }}>
            <Send size={16} /> Submit request
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Screen 3: Track requests ──────────────────────────────────────────
function TrackRequestsScreen({ onBack }: { onBack: () => void }) {
  const requests: ChangeRequest[] = [
    { field: "Phone number", oldVal: "+250 788 000 000", newVal: "+250 788 123 456", date: "18 May 2026", status: "Pending",  comment: null },
    { field: "Full name",    oldVal: "Bwiza M",          newVal: "Bwiza Marie",      date: "2 Apr 2026",  status: "Approved", comment: "Verified — name updated." },
    { field: "Isibo",        oldVal: "Isibo 1",           newVal: "Isibo 2",          date: "10 Feb 2026", status: "Rejected", comment: "Your isibo assignment is correct per register." },
  ];

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: G.teal, fontWeight: 600,
        fontSize: 15, cursor: "pointer", marginBottom: 28,
        display: "flex", alignItems: "center", gap: 6, padding: 0,
      }}>
        <ArrowLeft size={18} /> Back to profile
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, color: G.textPrimary }}>
        Change requests
      </h1>
      <p style={{ color: G.textMuted, marginBottom: 28 }}>
        Track your submissions and leader responses.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {requests.map((r, i) => (
          <Card key={i} style={{ padding: "18px 22px" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: 10,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: G.textPrimary }}>{r.field}</div>
                <div style={{ fontSize: 13, color: G.textMuted, marginTop: 2 }}>Submitted {r.date}</div>
              </div>
              <Badge status={r.status} />
            </div>

            <div style={{
              display: "flex", gap: 8, alignItems: "center",
              fontSize: 13, color: G.textMuted,
              background: G.bgPage, borderRadius: 8, padding: "8px 12px",
            }}>
              <span style={{ textDecoration: "line-through" }}>{r.oldVal}</span>
              <ChevronRight size={14} />
              <span style={{ fontWeight: 600, color: G.textPrimary }}>{r.newVal}</span>
            </div>

            {r.comment && (
              <div style={{
                marginTop: 10,
                background: r.status === "Approved" ? "#F0FDF4" : "#FEF2F2",
                borderRadius: 8, padding: "8px 12px", fontSize: 13, color: G.textMuted,
                borderLeft: `3px solid ${r.status === "Approved" ? G.green : G.errorRed}`,
              }}>
                <span style={{ fontWeight: 600, color: G.textPrimary }}>Leader: </span>
                {r.comment}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [screen, setScreen]   = useState<Screen>("profile");
  const [navPage, setNavPage] = useState("home");

  return (
    <div style={{ minHeight: "100vh", background: G.bgPage, fontFamily: "system-ui, sans-serif" }}>
      <NavBar active={navPage} setPage={setNavPage} />
      {screen === "profile" && (
        <ViewProfileScreen
          onRequestChange={() => setScreen("request")}
          onViewRequests={()  => setScreen("track")}
        />
      )}
      {screen === "request" && <RequestChangeScreen onBack={() => setScreen("profile")} />}
      {screen === "track"   && <TrackRequestsScreen  onBack={() => setScreen("profile")} />}
    </div>
  );
}