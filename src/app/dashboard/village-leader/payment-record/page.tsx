"use client";

import { useState, useEffect } from "react";
import { getPayments } from "@/lib/api/payments";


// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentType = "penalty" | "contribution";
type PaymentMethod = "mobile_money" | "cash" | "bank";
const PAGE_SIZE = 6;
interface Payment {
  id: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  createdAt: string;
  status?: string;

  citizen?: {
    firstName: string;
    lastName: string;
  };

  village?: {
    name: string;
  };
}


// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAmount(n: number) {
    return `RWF ${n.toLocaleString()}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-RW", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function methodLabel(m: PaymentMethod) {
    return { mobile_money: "Mobile Money", cash: "Cash", bank: "Bank Transfer" }[m];
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon }: { label: string; value: string; accent: string; icon: string }) {
    return (
        <div className={`stat-card ${accent}`}>
            <span className="stat-icon">{icon}</span>
            <div>
                <p className="stat-label">{label}</p>
                <p className="stat-value">{value}</p>
            </div>
        </div>
    );
}

function Badge({ type }: { type: PaymentType }) {
    return (
        <span className={`badge badge-${type}`}>
            {type === "penalty" ? "⚠ Penalty" : "✦ Contribution"}
        </span>
    );
}

function StatusPill({ status }: { status: "paid" | "pending" }) {
    return (
        <span className={`status-pill status-${status}`}>
            {status === "paid" ? "● Paid" : "○ Pending"}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentsDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);

        const data = await getPayments();

        setPayments(data.data || data);
      } catch (err) {
        console.error(err);
        setError("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="p-8">
        Loading payment records...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        {error}
      </div>
    );
  }

  const filtered = payments.filter((p) => {
    const ts = new Date(p.createdAt);

    if (dateFrom && ts < new Date(dateFrom)) {
      return false;
    }

    if (dateTo && ts > new Date(`${dateTo}T23:59:59`)) {
      return false;
    }

    return true;
  });

  const totalCollected = filtered.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const totalPending = filtered
    .filter((payment) => payment.status === "PENDING")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalTransactions = filtered.length;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );


    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0b0f1a;
          --surface: #111827;
          --surface2: #1a2235;
          --border: #1e2d45;
          --accent: #00e5a0;
          --accent2: #ff6b6b;
          --accent3: #fbbf24;
          --text: #e2e8f0;
          --muted: #64748b;
          --radius: 12px;
        }

        body { background: var(--bg); color: var(--text); font-family: 'Sora', sans-serif; }

        .page {
          min-height: 100vh;
          padding: 32px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Header */
        .header { margin-bottom: 32px; }
        .header-eyebrow {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--accent);
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 8px;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        .header p { color: var(--muted); font-size: 14px; }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 100%;
        }
        .stat-card.green::before { background: var(--accent); }
        .stat-card.red::before { background: var(--accent2); }
        .stat-card.yellow::before { background: var(--accent3); }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-icon { font-size: 28px; }
        .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .stat-value { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
        .stat-card.green .stat-value { color: var(--accent); }
        .stat-card.red .stat-value { color: var(--accent2); }
        .stat-card.yellow .stat-value { color: var(--accent3); }

        /* Filters */
        .filters {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-end;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .filter-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 160px; }
        .filter-group label { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
        .filter-group input, .filter-group select {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          padding: 10px 12px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .filter-group input:focus, .filter-group select:focus {
          border-color: var(--accent);
        }
        .filter-group select option { background: var(--surface2); }
        .btn-reset {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          border-radius: 8px;
          padding: 10px 16px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-reset:hover { border-color: var(--accent2); color: var(--accent2); }

        /* Table */
        .table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .table-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .table-title { font-size: 13px; font-weight: 600; color: var(--text); }
        .table-count {
          font-size: 11px;
          color: var(--muted);
          font-family: 'JetBrains Mono', monospace;
          background: var(--surface2);
          padding: 4px 10px;
          border-radius: 20px;
        }
        table { width: 100%; border-collapse: collapse; }
        thead th {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 500;
          padding: 14px 20px;
          text-align: left;
          border-bottom: 1px solid var(--border);
          background: var(--surface2);
        }
        tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: var(--surface2); }
        tbody td {
          padding: 14px 20px;
          font-size: 13px;
          vertical-align: middle;
        }
        .citizen-name { font-weight: 500; color: var(--text); }
        .citizen-isibo { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .amount-cell {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }
        .method-cell { color: var(--muted); font-size: 12px; }
        .ts-cell { font-size: 12px; color: var(--muted); }

        /* Badges */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        .badge-penalty { background: rgba(255,107,107,0.15); color: var(--accent2); border: 1px solid rgba(255,107,107,0.25); }
        .badge-contribution { background: rgba(0,229,160,0.12); color: var(--accent); border: 1px solid rgba(0,229,160,0.2); }

        .status-pill {
          font-size: 11px;
          font-weight: 500;
        }
        .status-paid { color: var(--accent); }
        .status-pending { color: var(--accent3); }

        /* Empty state */
        .empty {
          padding: 48px 20px;
          text-align: center;
          color: var(--muted);
        }
        .empty-icon { font-size: 36px; margin-bottom: 12px; }
        .empty p { font-size: 14px; }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
        }
        .pagination-info { font-size: 12px; color: var(--muted); }
        .pagination-btns { display: flex; gap: 8px; }
        .btn-page {
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 12px;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-page:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-page:not(:disabled):hover { border-color: var(--accent); color: var(--accent); }
        .btn-page.active { background: var(--accent); color: #000; border-color: var(--accent); font-weight: 600; }

        @media (max-width: 700px) {
          .stats-grid { grid-template-columns: 1fr; }
          .filters { flex-direction: column; }
          thead { display: none; }
          tbody tr { display: block; padding: 12px 0; }
          tbody td { display: flex; justify-content: space-between; padding: 6px 20px; }
          tbody td::before { content: attr(data-label); color: var(--muted); font-size: 11px; }
        }
      `}</style>

            <div className="page">
                {/* Header */}
                <div className="header">

                    <h1>Payment Records</h1>
                    <p>Real-time overview of all penalties and contributions across your village</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <StatCard label="Collected This Month" value={formatAmount(totalCollected)} accent="green" icon="💰" />
                    <StatCard label="Pending Amount" value={formatAmount(totalPending)} accent="red" icon="⏳" />
                    <StatCard label="Total Transactions" value={String(totalTransactions)} accent="yellow" icon="📋" />
                </div>

              

                {/* Table */}
                <div className="table-wrap">
                    <div className="table-header">
                        <span className="table-title">Transaction History</span>
                        <span className="table-count">{filtered.length} records</span>
                    </div>

                    {paginated.length === 0 ? (
                        <div className="empty">
                            <div className="empty-icon">🔍</div>
                            <p>No records match your filters.</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Citizen</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
  {paginated.map((p) => (
    <tr key={p.id}>
      <td>
        {p.citizen?.firstName ?? "-"}{" "}
        {p.citizen?.lastName ?? ""}
      </td>

      <td>
        RWF {p.amount.toLocaleString()}
      </td>

      <td>
        {p.paymentType}
      </td>

      <td>
        {p.paymentMethod}
      </td>

      <td>
        {p.status ?? "N/A"}
      </td>

      <td>
        {new Date(p.createdAt).toLocaleString()}
      </td>
    </tr>
  ))}
</tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <span className="pagination-info">
                                Page {page} of {totalPages} · Showing {paginated.length} of {filtered.length}
                            </span>
                            <div className="pagination-btns">
                                <button className="btn-page" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`btn-page ${page === i + 1 ? "active" : ""}`}
                                        onClick={() => setPage(i + 1)}
                                    >{i + 1}</button>
                                ))}
                                <button className="btn-page" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}