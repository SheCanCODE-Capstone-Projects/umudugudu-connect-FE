'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bell,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Home,
  Landmark,
  Loader2,
  Menu,
  ShieldCheck,
  Smartphone,
  UserRound,
  WalletCards,
  XCircle,
} from 'lucide-react';
import type { PaymentMethod, PenaltyStatus, UserRole } from '@/types';
import LogoutButton from '@/components/shared/LogoutButton';

const CURRENT_USER_KEY = 'umudugudu_current_user';
const PENALTIES_KEY = 'umudugudu_penalties';
const PAYMENTS_KEY = 'umudugudu_payments';
const USER_NOTIFICATIONS_KEY = 'umudugudu_user_notifications';
const CONTRIBUTIONS_KEY = 'umudugudu_contributions';

type CurrentUser = {
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
};

type PayableKind = 'PENALTY' | 'CONTRIBUTION';
type PayableStatus = PenaltyStatus | 'PENDING';
type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

type PayableItem = {
  id: string;
  kind: PayableKind;
  citizenEmail: string;
  citizenName: string;
  title: string;
  description: string;
  amountRwf: number;
  status: PayableStatus;
  issuedAt: string;
  dueAt?: string;
  paymentId?: string;
};

type PaymentRecord = {
  id: string;
  payableId: string;
  payableKind: PayableKind;
  payerEmail: string;
  payerName: string;
  amountRwf: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  externalTxId: string;
  initiatedAt: number;
  callbackAt?: number;
  paidAt?: string;
  failureReason?: string;
};

type UserNotification = {
  id: string;
  email: string;
  title: string;
  message: string;
  createdAt: number;
  isRead: boolean;
  kind?: 'financial';
  channel?: 'PUSH' | 'SMS';
};

const getJson = <T,>(storage: Storage, key: string, fallback: T) => {
  try {
    return JSON.parse(storage.getItem(key) ?? '') as T;
  } catch {
    return fallback;
  }
};

const formatRwf = (value: number) => new Intl.NumberFormat('en-RW').format(value);
const formatDate = (value: string | number) =>
  new Intl.DateTimeFormat('en-RW', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value));

const methodLabels: Record<PaymentMethod, string> = {
  MTN_MOMO: 'MTN MoMo',
  AIRTEL_MONEY: 'Airtel Money',
};

const methodAccents: Record<PaymentMethod, string> = {
  MTN_MOMO: 'border-yellow-300 bg-yellow-50 text-yellow-900',
  AIRTEL_MONEY: 'border-red-200 bg-red-50 text-red-700',
};

const buildDemoPenalties = (user: CurrentUser): PayableItem[] => [
  {
    id: 'demo-penalty-hygiene',
    kind: 'PENALTY',
    citizenEmail: user.email,
    citizenName: user.fullName,
    title: 'Community Hygiene Violation',
    description: 'Issued: Oct 24, 2023',
    amountRwf: 5000,
    status: 'UNPAID',
    issuedAt: '2023-10-24',
  },
  {
    id: 'demo-penalty-late-contribution',
    kind: 'PENALTY',
    citizenEmail: user.email,
    citizenName: user.fullName,
    title: 'Late Monthly Contribution Penalty',
    description: 'Issued: Nov 02, 2023',
    amountRwf: 2000,
    status: 'UNPAID',
    issuedAt: '2023-11-02',
  },
];

const buildDemoContributions = (user: CurrentUser): PayableItem[] => [
  {
    id: 'demo-contribution-security',
    kind: 'CONTRIBUTION',
    citizenEmail: user.email,
    citizenName: user.fullName,
    title: 'Monthly Security Fee',
    description: 'Period: Nov 2023',
    amountRwf: 3000,
    status: 'PENDING',
    issuedAt: '2023-11-01',
    dueAt: '2023-11-30',
  },
  {
    id: 'demo-contribution-sanitation',
    kind: 'CONTRIBUTION',
    citizenEmail: user.email,
    citizenName: user.fullName,
    title: 'Sanitation & Garbage',
    description: 'Period: Nov 2023',
    amountRwf: 4500,
    status: 'PENDING',
    issuedAt: '2023-11-01',
    dueAt: '2023-11-30',
  },
];

const buildDemoPayments = (user: CurrentUser): PaymentRecord[] => [
  {
    id: 'demo-payment-noise-complaint',
    payableId: 'demo-history-noise-complaint',
    payableKind: 'PENALTY',
    payerEmail: user.email,
    payerName: user.fullName,
    amountRwf: 7500,
    paymentMethod: 'MTN_MOMO',
    status: 'COMPLETED',
    externalTxId: 'MM-23091501',
    initiatedAt: new Date('2023-09-15T09:20:00').getTime(),
    callbackAt: new Date('2023-09-15T09:20:18').getTime(),
    paidAt: '2023-09-15T09:20:18',
  },
  {
    id: 'demo-payment-security-contribution',
    payableId: 'demo-history-security-contribution',
    payableKind: 'CONTRIBUTION',
    payerEmail: user.email,
    payerName: user.fullName,
    amountRwf: 3000,
    paymentMethod: 'MTN_MOMO',
    status: 'COMPLETED',
    externalTxId: 'MM-23100502',
    initiatedAt: new Date('2023-10-05T15:40:00').getTime(),
    callbackAt: new Date('2023-10-05T15:40:21').getTime(),
    paidAt: '2023-10-05T15:40:21',
  },
];

const normalizePenalty = (item: Partial<PayableItem>, user: CurrentUser): PayableItem => ({
  id: item.id ?? crypto.randomUUID(),
  kind: 'PENALTY',
  citizenEmail: item.citizenEmail ?? user.email,
  citizenName: item.citizenName ?? user.fullName,
  title: item.title ?? item.description ?? 'Community Penalty',
  description: item.description?.startsWith('Issued:') ? item.description : `Issued: ${formatDate(item.issuedAt ?? Date.now())}`,
  amountRwf: Number(item.amountRwf ?? 0),
  status: (item.status ?? 'UNPAID') as PenaltyStatus,
  issuedAt: item.issuedAt ?? new Date().toISOString(),
  paymentId: item.paymentId,
});

const createNotification = (
  email: string,
  title: string,
  message: string,
  channel: UserNotification['channel']
): UserNotification => ({
  id: crypto.randomUUID(),
  email,
  title,
  message,
  createdAt: Date.now(),
  isRead: false,
  kind: 'financial',
  channel,
});

export default function PaymentsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [penalties, setPenalties] = useState<PayableItem[]>([]);
  const [contributions, setContributions] = useState<PayableItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<PayableItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    const user = getJson<CurrentUser | null>(sessionStorage, CURRENT_USER_KEY, null);
    setCurrentUser(user);

    if (!user) return;

    const storedPenalties = getJson<PayableItem[]>(localStorage, PENALTIES_KEY, []);
    const storedContributions = getJson<PayableItem[]>(localStorage, CONTRIBUTIONS_KEY, []);
    const storedPayments = getJson<PaymentRecord[]>(localStorage, PAYMENTS_KEY, []);

    const normalizedPenalties =
      storedPenalties.length > 0
        ? storedPenalties.map((penalty) => normalizePenalty(penalty, user))
        : buildDemoPenalties(user);
    const normalizedContributions = storedContributions.length > 0 ? storedContributions : buildDemoContributions(user);
    const normalizedPayments = storedPayments.length > 0 ? storedPayments : buildDemoPayments(user);

    if (storedPenalties.length === 0) localStorage.setItem(PENALTIES_KEY, JSON.stringify(normalizedPenalties));
    if (storedContributions.length === 0) localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(normalizedContributions));
    if (storedPayments.length === 0) localStorage.setItem(PAYMENTS_KEY, JSON.stringify(normalizedPayments));

    setPenalties(normalizedPenalties);
    setContributions(normalizedContributions);
    setPayments(normalizedPayments.sort((a, b) => b.initiatedAt - a.initiatedAt));
  }, []);

  const isLeader = currentUser?.role === 'VILLAGE_LEADER' || currentUser?.role === 'ISIBO_LEADER' || currentUser?.role === 'ADMIN';
  const citizenPenalties = penalties.filter((item) => !currentUser || isLeader || item.citizenEmail === currentUser.email);
  const citizenContributions = contributions.filter((item) => !currentUser || isLeader || item.citizenEmail === currentUser.email);
  const visiblePayments = payments.filter((payment) => !currentUser || isLeader || payment.payerEmail === currentUser.email);

  const unpaidPenalties = citizenPenalties.filter((item) => item.status === 'UNPAID');
  const pendingContributions = citizenContributions.filter((item) => item.status === 'PENDING');
  const completedPayments = visiblePayments.filter((payment) => payment.status === 'COMPLETED');
  const failedPayments = visiblePayments.filter((payment) => payment.status === 'FAILED');

  const totalOutstanding = useMemo(
    () =>
      [...unpaidPenalties, ...pendingContributions].reduce((total, item) => total + item.amountRwf, 0),
    [unpaidPenalties, pendingContributions]
  );

  const syncPayments = (nextPayments: PaymentRecord[]) => {
    const sorted = nextPayments.sort((a, b) => b.initiatedAt - a.initiatedAt);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(sorted));
    setPayments(sorted);
  };

  const syncPayables = (nextPenalties: PayableItem[], nextContributions: PayableItem[]) => {
    localStorage.setItem(PENALTIES_KEY, JSON.stringify(nextPenalties));
    localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(nextContributions));
    setPenalties(nextPenalties);
    setContributions(nextContributions);
  };

  const startPayment = () => {
    if (!currentUser || !selectedItem || isProcessing) return;

    const payment: PaymentRecord = {
      id: crypto.randomUUID(),
      payableId: selectedItem.id,
      payableKind: selectedItem.kind,
      payerEmail: currentUser.email,
      payerName: currentUser.fullName,
      amountRwf: selectedItem.amountRwf,
      paymentMethod: selectedMethod,
      status: 'PENDING',
      externalTxId: `MM-${Date.now().toString().slice(-8)}`,
      initiatedAt: Date.now(),
    };

    syncPayments([payment, ...payments]);
    setActivePaymentId(payment.id);
    toast.success(`${methodLabels[selectedMethod]} prompt sent to your phone.`);
  };

  const completeCallback = (status: 'COMPLETED' | 'FAILED', failureReason?: string) => {
    if (!currentUser || !selectedItem || !activePaymentId) return;

    setIsProcessing(true);
    window.setTimeout(() => {
      const callbackAt = Date.now();
      const nextPayments = getJson<PaymentRecord[]>(localStorage, PAYMENTS_KEY, []).map((payment) =>
        payment.id === activePaymentId
          ? {
              ...payment,
              status,
              callbackAt,
              paidAt: status === 'COMPLETED' ? new Date(callbackAt).toISOString() : undefined,
              failureReason,
            }
          : payment
      );

      const nextPenalties =
        status === 'COMPLETED' && selectedItem.kind === 'PENALTY'
          ? penalties.map((item) =>
              item.id === selectedItem.id ? { ...item, status: 'PAID' as const, paymentId: activePaymentId } : item
            )
          : penalties;
      const nextContributions =
        status === 'COMPLETED' && selectedItem.kind === 'CONTRIBUTION'
          ? contributions.map((item) =>
              item.id === selectedItem.id ? { ...item, status: 'PAID' as const, paymentId: activePaymentId } : item
            )
          : contributions;

      const channel: UserNotification['channel'] = navigator.onLine ? 'PUSH' : 'SMS';
      const notifications = getJson<UserNotification[]>(localStorage, USER_NOTIFICATIONS_KEY, []);
      const notification =
        status === 'COMPLETED'
          ? createNotification(
              currentUser.email,
              'Payment confirmation',
              `${methodLabels[selectedMethod]} payment of ${formatRwf(selectedItem.amountRwf)} RWF for ${selectedItem.title} was received.`,
              channel
            )
          : createNotification(
              currentUser.email,
              'Payment failed',
              `${methodLabels[selectedMethod]} payment for ${selectedItem.title} failed: ${failureReason}.`,
              channel
            );

      syncPayments(nextPayments);
      syncPayables(nextPenalties, nextContributions);
      localStorage.setItem(USER_NOTIFICATIONS_KEY, JSON.stringify([notification, ...notifications]));
      setIsProcessing(false);
      setActivePaymentId(null);
      setSelectedItem(null);
      setActiveTab('pending');

      if (status === 'COMPLETED') {
        toast.success('Payment callback received. Status changed to PAID.');
      } else {
        toast.error(`Payment failed: ${failureReason}`);
      }
    }, 1800);
  };

  const renderPayableCard = (item: PayableItem) => (
    <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold leading-5 text-gray-950">{item.title}</h3>
          <p className="mt-1 text-xs font-semibold text-gray-500">{item.description}</p>
          {isLeader ? <p className="mt-1 text-xs font-semibold text-gray-500">{item.citizenName}</p> : null}
        </div>
        <span className={item.status === 'UNPAID' ? 'badge-red shrink-0' : 'badge-yellow shrink-0'}>{item.status}</span>
      </div>
      <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-4">
        <p className="text-xl font-medium text-gray-950">
          {formatRwf(item.amountRwf)} <span className="text-xs text-gray-500">RWF</span>
        </p>
        {!isLeader ? (
          <button
            type="button"
            onClick={() => {
              setSelectedItem(item);
              setSelectedMethod('MTN_MOMO');
              setActivePaymentId(null);
            }}
            className="h-10 rounded-md bg-[#008c3a] px-5 text-sm font-extrabold text-white transition hover:bg-emerald-800"
          >
            Pay Now
          </button>
        ) : null}
      </div>
    </article>
  );

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#f8fafc] p-6 text-gray-950">
        <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <WalletCards className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-500">Please log in to view payments.</p>
        </div>
      </main>
    );
  }

  if (isLeader) {
    return (
      <main className="min-h-screen bg-[#f8fafc] p-6 text-gray-950">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mobile Money Payments</h1>
              <p className="mt-1 text-sm text-gray-500">Track citizen penalties, contributions, callbacks, and failures.</p>
            </div>
            <LogoutButton showLabel />
          </div>

          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Outstanding</p>
              <p className="mt-2 text-2xl font-extrabold text-gray-950">{formatRwf(totalOutstanding)} RWF</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Paid</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-700">{completedPayments.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Failures</p>
              <p className="mt-2 text-2xl font-extrabold text-red-600">{failedPayments.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Callbacks</p>
              <p className="mt-2 text-2xl font-extrabold text-gray-950">{visiblePayments.filter((p) => p.callbackAt).length}</p>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">Leader Payment Visibility</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="py-3 pr-3">Citizen</th>
                    <th className="py-3 pr-3">Item</th>
                    <th className="py-3 pr-3">Method</th>
                    <th className="py-3 pr-3">Amount</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 pr-3">Callback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visiblePayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center font-semibold text-gray-400">
                        No mobile money transactions yet.
                      </td>
                    </tr>
                  ) : (
                    visiblePayments.map((payment) => {
                      const item = [...penalties, ...contributions].find((payable) => payable.id === payment.payableId);
                      return (
                        <tr key={payment.id}>
                          <td className="py-3 pr-3 font-semibold text-gray-900">{payment.payerName}</td>
                          <td className="py-3 pr-3 text-gray-600">{item?.title ?? payment.payableKind}</td>
                          <td className="py-3 pr-3 text-gray-600">{methodLabels[payment.paymentMethod]}</td>
                          <td className="py-3 pr-3 font-semibold text-gray-900">{formatRwf(payment.amountRwf)} RWF</td>
                          <td className="py-3 pr-3">
                            <span
                              className={
                                payment.status === 'COMPLETED'
                                  ? 'badge-green'
                                  : payment.status === 'FAILED'
                                    ? 'badge-red'
                                    : 'badge-yellow'
                              }
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-gray-600">
                            {payment.callbackAt ? `${formatDate(payment.callbackAt)} (${Math.round((payment.callbackAt - payment.initiatedAt) / 1000)}s)` : 'Waiting'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24 text-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-12 w-full max-w-md items-center justify-between px-4 lg:max-w-none lg:px-8">
          <button type="button" aria-label="Open menu" className="grid h-8 w-8 place-items-center text-emerald-800">
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-extrabold text-emerald-800">Umudugudu Connect</p>
          <Link href="/notifications" aria-label="View notifications" className="grid h-8 w-8 place-items-center text-emerald-800">
            <Bell className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[300px] px-0 pt-4 sm:max-w-md sm:px-4 lg:max-w-md">
        <div className="rounded-b-lg rounded-t-sm bg-[#008c3a] p-3 text-white shadow-sm">
          <p className="text-xs font-extrabold uppercase text-emerald-100">Total Outstanding</p>
          <p className="mt-2 text-2xl font-extrabold">{formatRwf(totalOutstanding)} <span className="text-xs">RWF</span></p>
          <p className="mt-1 text-xs font-semibold text-emerald-100">Includes penalties & community contributions</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-bold">
            <CalendarClock className="h-4 w-4" />
            Next due: Nov 30 (Security)
          </div>
        </div>

        <div className="mt-6 flex border-b border-gray-200 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`h-10 flex-1 border-b-2 ${activeTab === 'pending' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-500'}`}
          >
            Pending Payments
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              document.getElementById('transaction-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`h-10 flex-1 border-b-2 ${activeTab === 'history' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-500'}`}
          >
            History
          </button>
        </div>

        {activeTab === 'pending' ? (
          <div className="mt-5 space-y-8">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h1 className="text-base font-medium text-gray-950">Penalties</h1>
                <span className="rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700">
                  {unpaidPenalties.length} Outstanding
                </span>
              </div>
              <div className="space-y-3">
                {unpaidPenalties.length > 0 ? (
                  unpaidPenalties.map(renderPayableCard)
                ) : (
                  <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-500">No unpaid penalties.</p>
                )}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-medium text-gray-950">Community Payments</h2>
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                  <CalendarClock className="h-4 w-4" />
                  Schedule
                </span>
              </div>
              <div className="space-y-3">{pendingContributions.map(renderPayableCard)}</div>
            </section>
          </div>
        ) : null}

          <section id="transaction-history" className={activeTab === 'pending' ? 'mt-10 border-t border-gray-200 pt-6' : 'mt-6'}>
            <h2 className="mb-3 text-base font-medium text-gray-950">Transaction History</h2>
            {visiblePayments.length === 0 ? (
              <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-500">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {visiblePayments.map((payment) => {
                  const item = [...penalties, ...contributions].find((payable) => payable.id === payment.payableId);
                  const fallbackTitle =
                    payment.payableId === 'demo-history-noise-complaint'
                      ? 'Noise Complaint - Level 1'
                      : payment.payableId === 'demo-history-security-contribution'
                        ? 'Oct Security Contribution'
                        : payment.payableKind;
                  return (
                    <article key={payment.id} className="flex items-center gap-3 rounded-lg bg-white/70 p-3 shadow-sm">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                          payment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : payment.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {payment.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> : payment.status === 'FAILED' ? <XCircle className="h-5 w-5" /> : <Loader2 className="h-5 w-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-xs font-extrabold text-gray-700">{item?.title ?? fallbackTitle}</h3>
                        <p className="mt-1 text-xs font-medium text-gray-500">
                          {formatDate(payment.initiatedAt)} - Mobile Money
                        </p>
                        {payment.failureReason ? <p className="mt-1 text-xs font-semibold text-red-600">{payment.failureReason}</p> : null}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-700">{formatRwf(payment.amountRwf)} RWF</p>
                        <span className={payment.status === 'COMPLETED' ? 'badge-green mt-1 inline-block' : payment.status === 'FAILED' ? 'badge-red mt-1 inline-block' : 'badge-yellow mt-1 inline-block'}>
                          {payment.status === 'COMPLETED' ? 'PAID' : payment.status}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
      </section>

      {selectedItem ? (
        <div className="fixed inset-0 z-30 bg-gray-950/50 px-4 py-6">
          <div className="mx-auto max-w-md rounded-lg bg-white p-4 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                setActivePaymentId(null);
              }}
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-800"
              disabled={isProcessing}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-100 text-emerald-800">
                <Smartphone className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-gray-950">Mobile Money Payment</h2>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  Pay {formatRwf(selectedItem.amountRwf)} RWF for {selectedItem.title}.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {(['MTN_MOMO', 'AIRTEL_MONEY'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  disabled={!!activePaymentId}
                  className={`rounded-lg border p-3 text-left text-sm font-extrabold transition ${
                    selectedMethod === method ? methodAccents[method] : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <CreditCard className="mb-2 h-5 w-5" />
                  {methodLabels[method]}
                </button>
              ))}
            </div>

            {!activePaymentId ? (
              <button
                type="button"
                onClick={startPayment}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#008c3a] text-sm font-extrabold text-white transition hover:bg-emerald-800"
              >
                <WalletCards className="h-5 w-5" />
                Send Phone Prompt
              </button>
            ) : (
              <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <div className="flex items-start gap-2 text-sm font-semibold text-emerald-900">
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  <p>Payment prompt initiated. Callback is expected within 30 seconds after phone confirmation.</p>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => completeCallback('COMPLETED')}
                    disabled={isProcessing}
                    className="h-10 rounded-md bg-emerald-700 px-3 text-xs font-extrabold text-white disabled:opacity-60"
                  >
                    Confirm Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => completeCallback('FAILED', 'Insufficient funds')}
                    disabled={isProcessing}
                    className="h-10 rounded-md bg-red-600 px-3 text-xs font-extrabold text-white disabled:opacity-60"
                  >
                    Insufficient Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => completeCallback('FAILED', 'Network error')}
                    disabled={isProcessing}
                    className="h-10 rounded-md border border-gray-300 px-3 text-xs font-extrabold text-gray-700 disabled:opacity-60"
                  >
                    Network Error
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2 text-[10px] font-semibold lg:max-w-none lg:px-8">
          <Link href="/dashboard/citizen" className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link href="/activities" className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <CalendarDays className="h-5 w-5" />
            Activities
          </Link>
          <Link href="/payments" className="flex flex-col items-center justify-center gap-1 text-emerald-800">
            <Landmark className="h-5 w-5" />
            Payments
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
