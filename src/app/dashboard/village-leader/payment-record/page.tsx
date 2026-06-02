'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Loader2, RefreshCw, Search } from 'lucide-react';
import { exportPaymentsCsv, filterPaymentRecords, getVillagePayments, PaymentFilters, PaymentRecord } from '@/lib/api/payments';
import { getApiErrorMessage } from '@/lib/api/auth';

const PAGE_SIZE = 20;

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount);

const formatTimestamp = (value: string) => {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '-';
  return new Intl.DateTimeFormat('en-RW', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(time);
};

const statusClass = (status: string) => {
  const normalized = status.toUpperCase();
  if (normalized === 'PAID' || normalized === 'COMPLETED') return 'bg-emerald-50 text-emerald-700';
  if (normalized === 'FAILED' || normalized === 'CANCELLED') return 'bg-red-50 text-red-700';
  return 'bg-yellow-50 text-yellow-800';
};

const csvEscape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const buildCsv = (records: PaymentRecord[]) => {
  const header = ['Citizen ID', 'Citizen Name', 'Amount', 'Type', 'Payment Method', 'Village', 'Isibo', 'Timestamp'];
  const rows = records.map((record) => [
    record.citizenId ?? '',
    record.citizenName,
    record.amount,
    record.paymentType,
    record.paymentMethod,
    record.village ?? '',
    record.isibo ?? '',
    record.timestamp,
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export default function PaymentsDashboard() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<'timestamp-desc' | 'timestamp-asc' | 'amount-desc' | 'amount-asc'>('timestamp-desc');
  const [filters, setFilters] = useState<PaymentFilters>({
    search: '',
    from: '',
    to: '',
    isibo: '',
    paymentType: '',
    status: '',
  });

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getVillagePayments({ page: 0, size: 200 });
      setRecords(response.content);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to load payment records');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [filters, sort]);

  const isiboOptions = useMemo(
    () => Array.from(new Set(records.map((record) => record.isibo).filter(Boolean))).sort() as string[],
    [records]
  );

  const filteredRecords = useMemo(() => {
    const filtered = filterPaymentRecords(records, filters);
    return [...filtered].sort((a, b) => {
      if (sort === 'amount-asc') return a.amount - b.amount;
      if (sort === 'amount-desc') return b.amount - a.amount;
      const left = new Date(a.timestamp).getTime();
      const right = new Date(b.timestamp).getTime();
      return sort === 'timestamp-asc' ? left - right : right - left;
    });
  }, [records, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).getTime();
  const totalCollected = filteredRecords
    .filter((record) => new Date(record.timestamp).getTime() >= monthStart)
    .filter((record) => ['PAID', 'COMPLETED'].includes(record.status.toUpperCase()))
    .reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = filteredRecords
    .filter((record) => record.status.toUpperCase() === 'PENDING')
    .reduce((sum, record) => sum + record.amount, 0);

  const updateFilter = (key: keyof PaymentFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', from: '', to: '', isibo: '', paymentType: '', status: '' });
    setSort('timestamp-desc');
  };

  const handleExport = async () => {
    if (!filters.from || !filters.to) {
      toast.error('Select a date range before exporting');
      return;
    }

    try {
      setExporting(true);
      const hasOnlyDateFilters = !filters.search && !filters.isibo && !filters.paymentType && !filters.status;
      if (hasOnlyDateFilters) {
        const blob = await exportPaymentsCsv(filters.from, filters.to);
        downloadBlob(blob, `payment-reconciliation-${filters.from}-to-${filters.to}.csv`);
      } else {
        downloadBlob(new Blob([buildCsv(filteredRecords)], { type: 'text/csv;charset=utf-8' }), `payment-reconciliation-filtered.csv`);
      }
      toast.success('Payment export downloaded');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not export payment records');
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 text-gray-950">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-950">Payment Records</h1>
            <p className="mt-1 text-sm text-gray-500">Real-time mobile money records for village penalties and contributions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadPayments}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#008c3a] px-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:bg-emerald-300"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV
            </button>
          </div>
        </div>

        {error ? <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">Total Collected This Month</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">{formatAmount(totalCollected)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">Pending Amount</p>
            <p className="mt-2 text-2xl font-extrabold text-yellow-700">{formatAmount(pendingAmount)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">Total Transactions</p>
            <p className="mt-2 text-2xl font-extrabold text-gray-950">{filteredRecords.length}</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-6">
            <label className="lg:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Search</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={filters.search ?? ''}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Citizen, method, reference..."
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                />
              </span>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">From</span>
              <input
                type="date"
                value={filters.from ?? ''}
                onChange={(event) => updateFilter('from', event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">To</span>
              <input
                type="date"
                value={filters.to ?? ''}
                onChange={(event) => updateFilter('to', event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Isibo</span>
              <select
                value={filters.isibo ?? ''}
                onChange={(event) => updateFilter('isibo', event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All isibos</option>
                {isiboOptions.map((isibo) => <option key={isibo} value={isibo}>{isibo}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Type</span>
              <select
                value={filters.paymentType ?? ''}
                onChange={(event) => updateFilter('paymentType', event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All types</option>
                <option value="PENALTY">Penalty</option>
                <option value="CONTRIBUTION">Contribution</option>
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Status</span>
              <select
                value={filters.status ?? ''}
                onChange={(event) => updateFilter('status', event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Sort</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as typeof sort)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="timestamp-desc">Newest first</option>
                <option value="timestamp-asc">Oldest first</option>
                <option value="amount-desc">Amount high</option>
                <option value="amount-asc">Amount low</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <section className="mt-5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-extrabold text-gray-950">Recent Payments</h2>
            <span className="text-xs font-bold text-gray-500">
              Page {page + 1} of {pageCount}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Citizen Name</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment Type</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Loading payment records...
                    </td>
                  </tr>
                ) : visibleRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      No payment records match the current filters.
                    </td>
                  </tr>
                ) : (
                  visibleRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-950">
                        {record.citizenName}
                        {record.isibo ? <p className="mt-1 text-xs font-semibold text-gray-500">{record.isibo}</p> : null}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatAmount(record.amount)}</td>
                      <td className="px-4 py-3 text-gray-700">{record.paymentType}</td>
                      <td className="px-4 py-3 text-gray-700">{record.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(record.status)}`}>{record.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatTimestamp(record.timestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-gray-500">
              Showing {visibleRecords.length} of {filteredRecords.length} records
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0}
                className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                disabled={page >= pageCount - 1}
                className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
