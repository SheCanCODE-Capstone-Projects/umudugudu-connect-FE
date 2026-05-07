'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;
const PENDING_RESET_KEY = 'umudugudu_pending_password_reset';
const REGISTERED_USERS_KEY = 'umudugudu_registered_users';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include an uppercase letter')
      .regex(/[a-z]/, 'Password must include a lowercase letter')
      .regex(/\d/, 'Password must include a number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

type PendingPasswordReset = {
  email: string;
  maskedEmail: string;
  requestedAt: number;
};

type StoredUser = {
  email: string;
  password: string;
  [key: string]: unknown;
};

const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const [otpError, setOtpError] = useState('');
  const [pendingReset, setPendingReset] = useState<PendingPasswordReset | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const storedReset = sessionStorage.getItem(PENDING_RESET_KEY);
    if (!storedReset) {
      toast.error('Request a reset OTP first');
      router.replace('/auth/forgot-password');
      return;
    }

    try {
      setPendingReset(JSON.parse(storedReset) as PendingPasswordReset);
    } catch {
      sessionStorage.removeItem(PENDING_RESET_KEY);
      toast.error('Request a reset OTP again');
      router.replace('/auth/forgot-password');
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
    setOtpError('');

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
    setOtpError('');
    focusInput(Math.min(pastedCode.length, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleResend = () => {
    if (!pendingReset) return;

    /*
      Backend integration point:
      POST pendingReset.email or a backend-issued challengeId to resend password reset OTP.
    */
    setOtp(Array(OTP_LENGTH).fill(''));
    setTimeLeft(RESEND_SECONDS);
    setOtpError('');
    focusInput(0);
    toast.success('A new reset code has been requested');
  };

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!pendingReset) {
      router.replace('/auth/forgot-password');
      return;
    }

    if (code.length !== OTP_LENGTH) {
      setOtpError('Enter the 6-digit reset code');
      focusInput(otp.findIndex((digit) => !digit) === -1 ? 0 : otp.findIndex((digit) => !digit));
      return;
    }

    /*
      Backend integration point:
      POST the entered OTP, challengeId/email, and new password.
      Backend verifies the OTP and saves the new password.
    */
    const users = getStoredUsers();
    const nextUsers = users.map((user) =>
      user.email === pendingReset.email ? { ...user, password: values.password } : user
    );

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextUsers));
    sessionStorage.removeItem(PENDING_RESET_KEY);
    toast.success('Password reset successfully. Login with your new password');
    router.push('/auth/login');
  };

  const inputClass = (hasError?: boolean, extra = '') =>
    `h-10 w-full rounded-md border bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-300 focus:ring-2 ${
      hasError
        ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
        : 'border-gray-300 focus:border-emerald-700 focus:ring-emerald-100'
    } ${extra}`;

  if (!pendingReset) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-4 text-center text-sm font-semibold text-gray-600">
        Preparing password reset...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-11 w-full max-w-sm items-center gap-3 px-2 sm:max-w-md">
          <Link
            href="/auth/forgot-password"
            aria-label="Back to forgot password"
            className="grid h-7 w-7 place-items-center text-emerald-800 outline-1 outline-sky-500 transition hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.3} />
          </Link>
          <p className="text-sm font-bold text-emerald-800">Umudugudu Connect</p>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-sm flex-col px-2 pb-6 pt-7 sm:max-w-md sm:px-4">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-xl bg-emerald-800 text-white shadow-sm">
            <LockKeyhole className="h-8 w-8" strokeWidth={2.2} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold leading-tight tracking-normal text-gray-950">
            Reset Password
          </h1>
          <p className="mt-2 max-w-[22rem] text-sm leading-6 text-gray-700">
            Enter the reset code sent to <span className="font-bold text-gray-950">{pendingReset.maskedEmail}</span>, then create your new password.
          </p>
        </div>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-950">Reset OTP code</label>
            <div className="grid grid-cols-6 gap-2">
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
                  aria-label={`Reset OTP digit ${index + 1}`}
                  aria-invalid={otpError ? 'true' : 'false'}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  className={`h-10 w-full rounded border bg-white text-center text-lg font-bold text-gray-950 outline-none transition focus:ring-2 ${
                    otpError
                      ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                      : 'border-gray-300 focus:border-emerald-700 focus:ring-emerald-100'
                  }`}
                />
              ))}
            </div>
            {otpError ? <p className="mt-2 text-xs font-semibold text-red-600">{otpError}</p> : null}
          </div>

          <div className="flex items-center justify-between rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-medium text-gray-950">
            <span className="flex items-center gap-1.5">
              <RotateCw className="h-3.5 w-3.5 text-gray-600" strokeWidth={2} />
              Resend in <span className="font-extrabold text-emerald-800">{formattedTime}</span>
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 0}
              className="font-bold text-emerald-800 transition hover:text-emerald-950 disabled:cursor-not-allowed disabled:text-emerald-300"
            >
              Resend Code
            </button>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-medium text-gray-950">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                aria-invalid={errors.password ? 'true' : 'false'}
                placeholder="........"
                className={inputClass(Boolean(errors.password), 'pr-11')}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-emerald-800"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password ? <p className="mt-1 text-xs font-medium text-red-600">{errors.password.message}</p> : null}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-xs font-medium text-gray-950">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              placeholder="........"
              className={inputClass(Boolean(errors.confirmPassword))}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#008c3a] px-4 text-sm font-bold text-white shadow-sm outline-1 outline-offset-2 outline-sky-500 transition hover:bg-emerald-800 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700"
          >
            <span>{isSubmitting ? 'Saving...' : 'Continue to login'}</span>
            <KeyRound className="h-4 w-4" strokeWidth={2.7} />
          </button>
        </form>
      </section>
    </main>
  );
}
