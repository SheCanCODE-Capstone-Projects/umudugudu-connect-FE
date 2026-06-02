'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, RefreshCw, Smartphone, X } from 'lucide-react';
import { usePenalties } from '@/hooks/usePenalties';
import { getApiErrorMessage } from '@/lib/api/auth';
import { initiatePenaltyPayment, MobileMoneyProvider } from '@/lib/api/payments';
import { normalizeRwandaPhone } from '@/lib/utils/authFormat';
import type { CitizenPenaltyView } from '@/types';

const POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 5000;

const providerLabels: Record<MobileMoneyProvider, string> = {
  MTN: 'MTN Mobile Money',
  AIRTEL: 'Airtel Money',
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value?: string) => {
  if (!value) return '-';
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '-';
  return new Intl.DateTimeFormat('en-RW', { month: 'short', day: '2-digit', year: 'numeric' }).format(time);
};

function PaymentModal({
  penalty,
  phoneNumber,
  provider,
  isSubmitting,
  onPhoneNumberChange,
  onProviderChange,
  onClose,
  onSubmit,
}: {
  penalty: CitizenPenaltyView;
  phoneNumber: string;
  provider: MobileMoneyProvider;
  isSubmitting: boolean;
  onPhoneNumberChange: (value: string) => void;
  onProviderChange: (value: MobileMoneyProvider) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-gray-950/50 px-3 py-4 sm:place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-950">Pay Penalty</h2>
            <p className="mt-1 text-sm text-gray-500">Confirm the mobile money prompt on your phone.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close payment modal"
            className="grid h-8 w-8 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase text-gray-500">Penalty ID</p>
          <p className="mt-1 break-all text-sm font-bold text-gray-950">{penalty.id}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Amount</p>
              <p className="mt-1 text-sm font-bold text-gray-950">{formatAmount(penalty.amountRwf)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Status</p>
              <p className="mt-1 text-sm font-bold text-red-700">{penalty.status}</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-xs font-semibold text-gray-700">Payment method</label>
          <div className="grid grid-cols-2 gap-2">
            {(['MTN', 'AIRTEL'] as MobileMoneyProvider[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onProviderChange(option)}
                disabled={isSubmitting}
                className={`h-11 rounded-md border text-sm font-bold transition ${
                  provider === option
                    ? option === 'MTN'
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-900'
                      : 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {providerLabels[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="payment-phone" className="mb-2 block text-xs font-semibold text-gray-700">
            Phone Number
          </label>
          <input
            id="payment-phone"
            type="tel"
            inputMode="numeric"
            value={phoneNumber}
            onChange={(event) => onPhoneNumberChange(normalizeRwandaPhone(event.target.value).slice(0, 10))}
            placeholder="0788000000"
            readOnly={isSubmitting}
            className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#008c3a] px-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
          {isSubmitting ? 'Sending prompt...' : `Pay with ${providerLabels[provider]}`}
        </button>
      </form>
    </div>
  );
}

export default function CitizenPenaltiesPage() {
  const { myPenalties, loading, error, getMyPenalties } = usePenalties();
  const [selectedPenalty, setSelectedPenalty] = useState<CitizenPenaltyView | null>(null);
  const [provider, setProvider] = useState<MobileMoneyProvider>('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncingPenaltyId, setSyncingPenaltyId] = useState<string | null>(null);

  useEffect(() => {
    getMyPenalties();
  }, []);

  const unpaidPenalties = useMemo(() => myPenalties.filter((penalty) => penalty.status === 'UNPAID'), [myPenalties]);
  const paidPenalties = useMemo(() => myPenalties.filter((penalty) => penalty.status !== 'UNPAID'), [myPenalties]);

  const pollPenaltyStatus = async (penaltyId: string) => {
    setSyncingPenaltyId(penaltyId);
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
      getMyPenalties();
    }
    setSyncingPenaltyId(null);
    toast('Payment request is still being processed. Refresh later if it is not marked paid yet.');
  };

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPenalty || isSubmitting) return;

    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Enter a valid Rwanda phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await initiatePenaltyPayment({
        penaltyId: selectedPenalty.id,
        amount: selectedPenalty.amountRwf,
        phoneNumber,
        provider,
      });
      toast.success(response.message || 'Mobile money prompt sent');
      setSelectedPenalty(null);
      getMyPenalties();
      void pollPenaltyStatus(selectedPenalty.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Payment initiation failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 text-gray-950">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Penalties</h1>
            <p className="mt-1 text-sm text-gray-500">Pay outstanding penalties with MTN Mobile Money or Airtel Money.</p>
          </div>
          <button
            type="button"
            onClick={getMyPenalties}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error ? <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm font-semibold text-gray-400">
            Loading penalties...
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-950">Unpaid Penalties</h2>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  {unpaidPenalties.length} unpaid
                </span>
              </div>
              <div className="grid gap-3">
                {unpaidPenalties.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm font-semibold text-gray-500">
                    No unpaid penalties found.
                  </div>
                ) : (
                  unpaidPenalties.map((penalty) => (
                    <article key={penalty.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-bold text-gray-950">{penalty.activityTitle}</h3>
                          <p className="mt-1 text-sm text-gray-600">{penalty.reason || 'Penalty payment required'}</p>
                          <p className="mt-2 text-xs font-semibold text-gray-500">Due date: {formatDate(penalty.dueDate)}</p>
                        </div>
                        <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                          {syncingPenaltyId === penalty.id ? 'SYNCING' : penalty.status}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xl font-extrabold text-gray-950">{formatAmount(penalty.amountRwf)}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPenalty(penalty);
                            setProvider('MTN');
                          }}
                          className="h-10 rounded-md bg-[#008c3a] px-5 text-sm font-bold text-white transition hover:bg-emerald-800"
                        >
                          Pay Now
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-gray-950">Other Penalties</h2>
              <div className="grid gap-3">
                {paidPenalties.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm font-semibold text-gray-500">
                    No paid or waived penalties yet.
                  </div>
                ) : (
                  paidPenalties.map((penalty) => (
                    <article key={penalty.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-950">{penalty.activityTitle}</h3>
                          <p className="mt-1 text-sm text-gray-600">{penalty.reason || '-'}</p>
                          {penalty.paidAt ? <p className="mt-2 text-xs font-semibold text-gray-500">Paid: {formatDate(penalty.paidAt)}</p> : null}
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{penalty.status}</span>
                      </div>
                      <p className="mt-4 border-t border-gray-100 pt-4 text-lg font-extrabold text-gray-950">
                        {formatAmount(penalty.amountRwf)}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </section>

      {selectedPenalty ? (
        <PaymentModal
          penalty={selectedPenalty}
          phoneNumber={phoneNumber}
          provider={provider}
          isSubmitting={isSubmitting}
          onPhoneNumberChange={setPhoneNumber}
          onProviderChange={setProvider}
          onClose={() => setSelectedPenalty(null)}
          onSubmit={submitPayment}
        />
      ) : null}
    </main>
  );
}
