'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MouseEvent, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Globe2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserRole } from '@/types';

const isValidEmail = (value: string) => z.string().email().safeParse(value).success;

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('250')) return digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
};

const isValidRwandaPhone = (value: string) => /^7[2389]\d{7}$/.test(normalizePhoneNumber(value));

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or phone number is required')
    .refine((value) => isValidEmail(value) || isValidRwandaPhone(value), {
      message: 'Enter a valid email address or Rwanda phone number',
    }),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const PENDING_OTP_KEY = 'umudugudu_pending_otp_login';
const REGISTERED_USERS_KEY = 'umudugudu_registered_users';
const CURRENT_USER_KEY = 'umudugudu_current_user';
const DEFAULT_API_URL = 'http://localhost:8080';
const GOOGLE_AUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

type StoredUser = {
  fullName?: string;
  email: string;
  phoneNumber?: string;
  role?: UserRole | null;
  password: string;
  isVerified?: boolean;
};

const dashboardByRole: Record<UserRole, string> = {
  CITIZEN: '/dashboard/citizen',
  ISIBO_LEADER: '/dashboard/isibo-leader',
  VILLAGE_LEADER: '/dashboard/village-leader',
  ADMIN: '/dashboard/admin',
};

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 3))}@${domain}`;
};

const maskPhoneNumber = (phoneNumber: string) =>
  `+250 ${phoneNumber.slice(0, 3)} *** ${phoneNumber.slice(-3)}`;

const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
};

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    /*
      Backend integration point:
      1. POST email-or-phone/password to login endpoint.
      2. Backend validates registered credentials.
      3. Backend sends login OTP only for ISIBO_LEADER and VILLAGE_LEADER users.
      4. Backend returns pending auth info, including user role.
    */
    const identifier = values.identifier.trim();
    const normalizedEmail = identifier.toLowerCase();
    const normalizedPhone = normalizePhoneNumber(identifier);
    const isPhoneLogin = isValidRwandaPhone(identifier);
    const registeredUser = getStoredUsers().find((user) => {
      const emailMatches = user.email === normalizedEmail;
      const phoneMatches = user.phoneNumber ? normalizePhoneNumber(user.phoneNumber) === normalizedPhone : false;

      return (isPhoneLogin ? phoneMatches : emailMatches) && user.password === values.password;
    });

    if (!registeredUser) {
      sessionStorage.removeItem(PENDING_OTP_KEY);
      setError('root', { type: 'manual', message: 'You have entered invalid login details' });
      toast.error('You have entered invalid login details');
      return;
    }

    if (registeredUser.isVerified === false) {
      sessionStorage.setItem(
        PENDING_OTP_KEY,
        JSON.stringify({
          purpose: 'registration',
          email: registeredUser.email,
          fullName: registeredUser.fullName ?? registeredUser.email,
          maskedEmail: maskEmail(registeredUser.email),
          contactLabel: maskEmail(registeredUser.email),
          role: registeredUser.role ?? 'CITIZEN',
          dashboardPath: '/auth/login',
          requestedAt: Date.now(),
        })
      );
      toast.error('Verify your account before login');
      router.push('/auth/otp-login');
      return;
    }

    const roleFromBackend = registeredUser.role;
    if (!roleFromBackend) {
      sessionStorage.removeItem(PENDING_OTP_KEY);
      sessionStorage.removeItem(CURRENT_USER_KEY);
      setError('root', {
        type: 'manual',
        message: 'Your account is waiting for admin role assignment',
      });
      toast.error('Your account is waiting for admin role assignment');
      return;
    }

    const dashboardPath = dashboardByRole[roleFromBackend];

    if (roleFromBackend === 'CITIZEN' || roleFromBackend === 'ADMIN') {
      sessionStorage.removeItem(PENDING_OTP_KEY);
      sessionStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify({
          email: registeredUser.email,
          fullName: registeredUser.fullName ?? registeredUser.email,
          role: roleFromBackend,
        })
      );
      toast.success('Login successful');
      router.push(dashboardPath);
      return;
    }

    sessionStorage.setItem(
      PENDING_OTP_KEY,
      JSON.stringify({
        email: registeredUser.email,
        fullName: registeredUser.fullName ?? registeredUser.email,
        maskedEmail: maskEmail(registeredUser.email),
        contactLabel: isPhoneLogin ? maskPhoneNumber(normalizedPhone) : maskEmail(registeredUser.email),
        role: roleFromBackend,
        dashboardPath,
        requestedAt: Date.now(),
      })
    );

    toast.success('OTP code sent to your registered contact');
    router.push('/auth/otp-login');
  };

  const startOtpLogin = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFocus('identifier');
    toast('Enter your registered email or phone number first');
  };

  const startGoogleLogin = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!googleClientId) {
      event.preventDefault();
      toast.error('Add NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local first');
      return;
    }

    sessionStorage.setItem('umudugudu_google_oauth_state', 'umudugudu-google-login');
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? `${apiUrl}/login/oauth2/code/google`;
  const googleLoginUrl = `${GOOGLE_AUTH_BASE_URL}?${new URLSearchParams({
    client_id: googleClientId ?? '',
    redirect_uri: googleRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state: 'umudugudu-google-login',
  }).toString()}`;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-11 w-full max-w-sm items-center gap-3 px-2 sm:max-w-md">
          <Link
            href="/"
            aria-label="Go back"
            className="grid h-7 w-7 place-items-center text-emerald-800 outline-1  outline-sky-500 transition hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.3} />
          </Link>
          <p className="text-sm font-bold text-emerald-800">Umudugudu Connect</p>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-sm flex-col px-1.5 pb-0 sm:max-w-md sm:px-4">
        <div className="flex flex-col items-center pt-1">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gradient-to-br from-[#06342f] via-[#045a45] to-[#081916] shadow-sm">
            <div className="absolute left-3 top-3 h-20 w-14 rotate-[-48deg] rounded-lg border border-emerald-300/20 bg-[#06231f] shadow-2xl">
              <div className="absolute inset-1 rounded-md bg-gradient-to-br from-[#0b4f42] via-[#042f2c] to-[#061313]" />
              <div className="absolute left-4 top-1 h-1 w-6 rounded-full bg-black/40" />
              <div className="absolute left-5 top-8 h-4 w-5 rounded-full bg-lime-400/70 shadow-[0_0_16px_rgba(132,204,22,0.65)]" />
              <div className="absolute bottom-5 right-0 h-5 w-8 rounded-sm bg-white" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/45 to-transparent" />
          </div>

          <h1 className="mt-4 text-center text-2xl font-extrabold leading-tight tracking-normal text-gray-950">
            Welcome Back
          </h1>
          <p className="mt-2 max-w-[21rem] text-center text-sm leading-5 text-gray-700">
            Sign in to access your community services and stay informed.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="mt-6 h-5 w-full bg-[linear-gradient(135deg,#d8e7e4_25%,transparent_25%),linear-gradient(225deg,#d8e7e4_25%,transparent_25%),linear-gradient(315deg,#d8e7e4_25%,transparent_25%),linear-gradient(45deg,#d8e7e4_25%,transparent_25%)] bg-[length:24px_24px] bg-[position:12px_0,12px_0,0_0,0_0]"
        />

        <form ref={formRef} className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="identifier" className="mb-2 block text-xs font-medium text-gray-950">
              Email or phone number
            </label>
            <input
              id="identifier"
              type="text"
              inputMode="email"
              autoComplete="username"
              aria-invalid={errors.identifier ? 'true' : 'false'}
              placeholder="name@community.rw or +250 788 000 000"
              className={`h-10 w-full rounded-md border bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-300 focus:ring-2 ${
                errors.identifier
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                  : 'border-gray-300 focus:border-emerald-700 focus:ring-emerald-100'
              }`}
              {...register('identifier')}
            />
            {errors.identifier ? (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.identifier.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-medium text-gray-950">
              Password
            </label>
            <input
              id="password"
              type="password"
              aria-invalid={errors.password ? 'true' : 'false'}
              placeholder="........"
              className={`h-10 w-full rounded-md border bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-300 focus:ring-2 ${
                errors.password
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                  : 'border-gray-300 focus:border-emerald-700 focus:ring-emerald-100'
              }`}
              {...register('password')}
            />
            {errors.password ? <p className="mt-1 text-xs font-medium text-red-600">{errors.password.message}</p> : null}
          </div>

          <div className="flex justify-end pt-1">
            <Link href="/auth/forgot-password" className="text-[10px] font-bold text-sky-800 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#008c3a] px-4 text-sm font-bold text-white shadow-sm  outline-1 outline-offset-2  outline-sky-500 transition hover:bg-emerald-800 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700"
          >
            <span>{isSubmitting ? 'Checking...' : 'Login'}</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
          </button>
          {errors.root ? (
            <p className="text-center text-xs font-semibold text-red-600">{errors.root.message}</p>
          ) : null}
        </form>

        <div className="my-6 flex items-center gap-4 px-8">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-medium text-gray-300">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <Link
          href="/auth/register"
          className="flex h-10 w-full items-center justify-center rounded-lg border border-emerald-700 bg-white text-xs font-bold text-emerald-800  outline-1 outline-offset-2  outline-sky-500 transition hover:bg-emerald-50"
        >
          Create an account
        </Link>

        <a
          href={googleLoginUrl}
          onClick={startGoogleLogin}
          className="mt-3 flex h-10 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-800 outline-1 outline-offset-2 outline-sky-500 transition hover:bg-gray-50 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-gray-500"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full border border-gray-200 text-sm font-extrabold text-blue-600">
            G
          </span>
          <span>Continue with Google</span>
        </a>

        <div className="mt-6 grid grid-cols-2 gap-3 pb-0">
          <button
            type="button"
            onClick={startOtpLogin}
            className="relative h-[7.25rem] overflow-hidden rounded-lg bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700"
          >
            <ShieldCheck className="h-6 w-6 text-emerald-800" strokeWidth={2.2} />
            <div className="absolute -bottom-7 -right-5 h-16 w-16 rounded-full bg-emerald-50" />
            <p className="absolute bottom-3 left-3 text-[10px] font-bold text-gray-800">Secure OTP Login</p>
          </button>

          <article className="relative h-[7.25rem] overflow-hidden rounded-lg bg-emerald-300 p-3 shadow-sm">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(167,243,208,0.95),rgba(74,222,128,0.72)),linear-gradient(155deg,transparent_0%,transparent_48%,rgba(255,255,255,0.22)_49%,transparent_60%)]" />
            <div className="absolute inset-x-5 top-7 h-12 rounded-sm bg-emerald-900/10 shadow-[36px_6px_0_rgba(6,78,59,0.08),72px_2px_0_rgba(6,78,59,0.06)]" />
            <Globe2 className="relative h-6 w-6 text-emerald-900" strokeWidth={3.4} />
            <p className="absolute bottom-3 left-3 text-[10px] font-bold text-emerald-950">United Community</p>
          </article>
        </div>
      </section>
    </main>
  );
}
