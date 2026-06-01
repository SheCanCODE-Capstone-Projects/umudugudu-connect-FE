'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, LogIn, RotateCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage, PendingOtpChallenge, resendOtp, verifyOtp } from '@/lib/api/auth';
import { getDashboardPath } from '@/lib/auth/routes';
import { PENDING_OTP_KEY, saveAuthSession } from '@/lib/auth/session';
import { useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/store/slices/authSlice';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function OtpLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState('');
  const [pendingLogin, setPendingLogin] = useState<PendingOtpChallenge | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const storedLogin = sessionStorage.getItem(PENDING_OTP_KEY);
    if (!storedLogin) {
      toast.error('Please log in before verifying OTP');
      router.replace('/auth/login');
      return;
    }

    try {
      setPendingLogin(JSON.parse(storedLogin) as PendingOtpChallenge);
    } catch {
      sessionStorage.removeItem(PENDING_OTP_KEY);
      toast.error('Please log in again');
      router.replace('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft]);

  const code = otp.join('');
  const formattedTime = `00:${String(timeLeft).padStart(2, '0')}`;

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedCode = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedCode) return;

    const nextOtp = Array(OTP_LENGTH).fill('');
    pastedCode.split('').forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);
    setError('');
    focusInput(Math.min(pastedCode.length, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleResend = async () => {
    if (!pendingLogin) return;

    try {
      setIsResending(true);
      const response = await resendOtp(pendingLogin);
      const nextPending = {
        ...pendingLogin,
        challengeId: response.challengeId ?? pendingLogin.challengeId,
        requestedAt: Date.now(),
      };
      sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(nextPending));
      setPendingLogin(nextPending);
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeLeft(RESEND_SECONDS);
      setError('');
      focusInput(0);
      toast.success(response.message || 'A new code has been requested');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not resend OTP code'));
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async () => {
    if (!pendingLogin) {
      router.replace('/auth/login');
      return;
    }

    if (code.length !== OTP_LENGTH) {
      setError('Enter the 6-digit verification code');
      focusInput(otp.findIndex((digit) => !digit) === -1 ? 0 : otp.findIndex((digit) => !digit));
      return;
    }

    try {
      setIsVerifying(true);
      const response = await verifyOtp(pendingLogin, code);
      sessionStorage.removeItem(PENDING_OTP_KEY);

      if (response.auth) {
        saveAuthSession(response.auth);
        dispatch(setUser(response.auth.user));
        toast.success(response.message || 'Login verified successfully');
        router.push(getDashboardPath(response.auth.user.role));
        return;
      }

      if (pendingLogin.purpose === 'registration') {
        toast.success(response.message || 'Account verified successfully');
        router.push('/auth/login');
        return;
      }

      setError('Verification succeeded but no session token was returned');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Invalid or expired verification code'));
    } finally {
      setIsVerifying(false);
    }
  };

  if (!pendingLogin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-4 text-center text-sm font-semibold text-gray-600">
        Preparing OTP verification...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-950">
      <section className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col overflow-hidden px-3 pb-8 pt-3 sm:max-w-md">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60 [background-image:linear-gradient(45deg,transparent_46%,#dbe7e4_47%,#dbe7e4_53%,transparent_54%),linear-gradient(-45deg,transparent_46%,#dbe7e4_47%,#dbe7e4_53%,transparent_54%)] [background-size:50px_50px]"
        />

        <div className="relative z-10">
          <Link
            href="/auth/login"
            aria-label="Back to login"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/80 text-gray-950  outline-1  outline-sky-500 transition hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.4} />
          </Link>

          <div className="relative mt-9 h-40 overflow-hidden rounded-lg bg-slate-700 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_62%,rgba(45,212,191,0.5),transparent_24%),linear-gradient(145deg,rgba(15,23,42,0.48),rgba(15,118,110,0.26)),linear-gradient(135deg,rgba(255,255,255,0.14)_0_1px,transparent_1px_32px)]" />
            <div className="absolute left-8 top-20 h-14 w-56 -rotate-[28deg] rounded-[1.6rem] border border-white/25 bg-gray-900 shadow-2xl">
              <div className="absolute inset-1 rounded-[1.35rem] border border-white/10 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950" />
              <div className="absolute left-14 top-8 h-2 w-24 rounded-full bg-cyan-300/40 blur-sm" />
              <div className="absolute right-5 top-2 h-1 w-10 rounded-full bg-black/70" />
              <div className="absolute inset-x-8 top-9 h-px bg-cyan-200/20" />
            </div>
            <div className="absolute left-1/2 top-8 flex h-20 w-16 -translate-x-1/2 items-center justify-center rounded-tl-2xl rounded-tr-md rounded-bl-md rounded-br-2xl bg-gradient-to-br from-lime-300 via-emerald-500 to-green-700 shadow-[0_0_28px_rgba(45,212,191,0.55)]">
              <div className="absolute inset-1 rounded-tl-xl rounded-tr rounded-bl rounded-br-xl border border-white/30" />
              <ShieldCheck className="relative h-8 w-8 text-white/90" strokeWidth={2.4} />
            </div>
            <div className="absolute left-1/2 top-[6.2rem] h-12 w-28 -translate-x-1/2 rounded-full border border-cyan-200/40 bg-cyan-300/10 blur-[1px]" />
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-xl font-extrabold tracking-normal text-gray-950">
              {pendingLogin.purpose === 'registration' ? 'Verify Account' : 'Verify Identity'}
            </h1>
            <p className="mt-3 text-sm text-gray-900">
              Code sent to <span className="font-bold">{pendingLogin.contactLabel ?? pendingLogin.maskedEmail}</span>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                value={digit}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={`OTP digit ${index + 1}`}
                aria-invalid={error ? 'true' : 'false'}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className={`h-10 w-full rounded border bg-white text-center text-lg font-bold text-gray-950 outline-none transition focus:ring-2 ${
                  error
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                    : 'border-gray-300 focus:border-emerald-700 focus:ring-emerald-100'
                }`}
              />
            ))}
          </div>

          {error ? <p className="mt-2 text-center text-xs font-semibold text-red-600">{error}</p> : null}

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-medium text-gray-950">
            <RotateCw className="h-3.5 w-3.5 text-gray-600" strokeWidth={2} />
            <span>
              {isResending ? 'Requesting...' : <>Resend in <span className="font-extrabold text-emerald-800">{formattedTime}</span></>}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isVerifying}
            className="mt-5 flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#008c3a] px-4 text-sm font-bold text-white shadow-sm  outline-1 outline-offset-2  outline-sky-500 transition hover:bg-emerald-800 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700"
          >
            <span>{isVerifying ? 'Verifying...' : pendingLogin.purpose === 'registration' ? 'Verify Account' : 'Verify & Login'}</span>
            <LogIn className="h-4 w-4" strokeWidth={2.7} />
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={timeLeft > 0 || isResending}
            className="mt-3 flex h-10 w-full items-center justify-center rounded-lg border border-emerald-700 bg-white/80 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:text-emerald-300"
          >
            Resend Code
          </button>

          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className="h-4 w-4 rotate-45 bg-emerald-800/20" />
            ))}
          </div>

          <p className="mt-7 text-center text-[10px] font-bold text-gray-300">
            Official Umudugudu Connect Verification Service
          </p>
        </div>
      </section>
    </main>
  );
}
