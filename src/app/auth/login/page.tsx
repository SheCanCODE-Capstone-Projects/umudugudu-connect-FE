'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MouseEvent, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Globe2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage, getGoogleLoginUrl, loginUser } from '@/lib/api/auth';
import { getDashboardPath } from '@/lib/auth/routes';
import { GOOGLE_OAUTH_STATE_KEY, PENDING_OTP_KEY, saveAuthSession } from '@/lib/auth/session';
import { maskEmail, maskPhoneNumber, normalizeLoginPhone, isValidLoginRwandaPhone } from '@/lib/utils/authFormat';
import { useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/store/slices/authSlice';

const isValidEmail = (value: string) => z.string().email().safeParse(value).success;

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or phone number is required')
    .refine((value) => isValidEmail(value) || isValidLoginRwandaPhone(value), {
      message: 'Enter a valid email address or Rwanda phone number',
    }),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
    const identifier = values.identifier.trim();
    const normalizedPhone = normalizeLoginPhone(identifier);
    const isPhoneLogin = isValidLoginRwandaPhone(identifier);

    try {
      const response = await loginUser({
        email: isPhoneLogin ? undefined : identifier.toLowerCase(),
        phoneNumber: isPhoneLogin ? normalizedPhone : undefined,
        password: values.password,
      });

      if (response.auth) {
        saveAuthSession(response.auth);
        dispatch(setUser(response.auth.user));
        sessionStorage.removeItem(PENDING_OTP_KEY);
        toast.success(response.message || 'Login successful');
        router.push(getDashboardPath(response.auth.user.role));
        return;
      }

      const roleFromBackend = response.role;
      const dashboardPath = getDashboardPath(roleFromBackend);

      sessionStorage.removeItem(PENDING_OTP_KEY);
      sessionStorage.setItem(
        PENDING_OTP_KEY,
        JSON.stringify({
          purpose: 'login',
          challengeId: response.challengeId,
          email: response.email ?? identifier.toLowerCase(),
          phoneNumber: response.phoneNumber ?? (isPhoneLogin ? normalizedPhone : undefined),
          fullName: response.fullName ?? response.email ?? identifier,
          maskedEmail: maskEmail(response.email ?? identifier.toLowerCase()),
          contactLabel: isPhoneLogin ? maskPhoneNumber(normalizedPhone) : maskEmail(response.email ?? identifier.toLowerCase()),
          role: roleFromBackend,
          dashboardPath,
          requestedAt: Date.now(),
        })
      );
      toast.success(response.message || 'OTP code sent to your registered contact');
      router.push('/auth/otp-login');
    } catch (error) {
      const message = getApiErrorMessage(error, 'You have entered invalid login details');
      sessionStorage.removeItem(PENDING_OTP_KEY);
      setError('root', { type: 'manual', message });
      toast.error(message);
    }
  };

  const startOtpLogin = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFocus('identifier');
    toast('Enter your registered email or phone number first');
  };

  const startGoogleLogin = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, 'umudugudu-google-login');

    setIsGoogleLoading(true);
    window.location.assign(googleLoginUrl);
  };

  const googleLoginUrl = getGoogleLoginUrl();

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-11 w-full max-w-sm items-center gap-3 px-2 sm:max-w-md">
          <Link
            href="/"
            aria-label="Go back"
            className="grid h-7 w-7 place-items-center text-emerald-800 outline-1  outline-sky-500 transition hover:bg-emerald-50"
          >
            { <ArrowLeft className="h-5 w-5" strokeWidth={2.3} /> }
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
          <span>{isGoogleLoading ? 'Opening Google...' : 'Continue with Google'}</span>
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
