'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage, registerUser } from '@/lib/api/auth';
import { getDashboardPath } from '@/lib/auth/routes';
import { PENDING_OTP_KEY, saveAuthSession } from '@/lib/auth/session';
import { maskEmail, normalizeRwandaPhone, isValidRwandaPhone } from '@/lib/utils/authFormat';
import { useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/store/slices/authSlice';

const DEFAULT_USER_ROLE = 'CITIZEN';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Full name is required')
      .min(3, 'Full name must be at least 3 characters')
      .regex(/^[A-Za-z\s'-]+$/, 'Full name can only contain letters, spaces, apostrophes, and hyphens'),
    phoneNumber: z
      .string()
      .trim()
      .min(1, 'Phone number is required')
      .refine(isValidRwandaPhone, 'Enter a valid 10-digit Rwanda phone number, for example 0788000000'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
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

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const inputClass = (hasError?: boolean, extra = '') =>
    `h-10 w-full rounded-md border bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
      hasError
        ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
        : 'border-gray-300 focus:border-emerald-700 focus:ring-emerald-100'
    } ${extra}`;

  const onSubmit = async (values: RegisterFormValues) => {
    const normalizedEmail = values.email.toLowerCase();

    try {
      const response = await registerUser({
        fullName: values.fullName,
        phoneNumber: normalizeRwandaPhone(values.phoneNumber),
        email: normalizedEmail,
        password: values.password,
      });

      if (response.auth) {
        saveAuthSession(response.auth);
        dispatch(setUser(response.auth.user));
        toast.success(response.message || 'Registration successful');
        router.push(getDashboardPath(response.auth.user.role));
        return;
      }

      sessionStorage.setItem(
        PENDING_OTP_KEY,
        JSON.stringify({
          purpose: 'registration',
          challengeId: response.challengeId,
          email: response.email ?? normalizedEmail,
          phoneNumber: response.phoneNumber ?? normalizeRwandaPhone(values.phoneNumber),
          fullName: response.fullName ?? values.fullName,
          maskedEmail: maskEmail(response.email ?? normalizedEmail),
          contactLabel: maskEmail(response.email ?? normalizedEmail),
          role: response.role ?? DEFAULT_USER_ROLE,
          dashboardPath: '/auth/login',
          requestedAt: Date.now(),
        })
      );
      toast.success(response.message || 'OTP code sent for account verification');
      router.push('/auth/otp-login');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Registration failed. Please check your details.'));
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-10 w-full max-w-sm items-center gap-5 px-4 sm:max-w-md">
          <Link
            href="/auth/login"
            aria-label="Back to login"
            className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-emerald-800 transition hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.4} />
          </Link>
          <p className="text-sm font-bold text-emerald-800">Umudugudu Connect</p>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-sm flex-col px-2 pb-3 sm:max-w-md sm:px-4">
        <div className="pt-0">
          <h1 className="text-2xl font-extrabold leading-tight tracking-normal text-gray-950">
            Create Account
          </h1>
          <p className="mt-3 max-w-[19rem] text-sm leading-6 text-gray-700">
            Join your local community digital platform for better communication and services.
          </p>
        </div>

        <form className="mt-14 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="fullName" className="mb-2 block text-xs font-medium text-gray-950">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              aria-invalid={errors.fullName ? 'true' : 'false'}
              placeholder="Enter your full name"
              className={inputClass(Boolean(errors.fullName))}
              {...register('fullName')}
            />
            {errors.fullName ? <p className="mt-1 text-xs font-medium text-red-600">{errors.fullName.message}</p> : null}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="mb-2 block text-xs font-medium text-gray-950">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              aria-invalid={errors.phoneNumber ? 'true' : 'false'}
              placeholder="0788000000"
              className={inputClass(Boolean(errors.phoneNumber))}
              onInput={(event) => {
                event.currentTarget.value = normalizeRwandaPhone(event.currentTarget.value).slice(0, 10);
              }}
              {...register('phoneNumber', {
                setValueAs: (value) => normalizeRwandaPhone(value),
              })}
            />
            {errors.phoneNumber ? <p className="mt-1 text-xs font-medium text-red-600">{errors.phoneNumber.message}</p> : null}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-medium text-gray-950">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              placeholder="name@example.com"
              className={inputClass(Boolean(errors.email))}
              {...register('email')}
            />
            {errors.email ? <p className="mt-1 text-xs font-medium text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-medium text-gray-950">
              Password
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
              Confirm Password
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
            className="mt-6 flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#007a2f] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            <span>{isSubmitting ? 'Checking...' : 'Register'}</span>
            <CheckCheck className="h-4 w-4" strokeWidth={3} />
          </button>
        </form>

        <p className="mt-auto pt-4 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold text-emerald-800 underline underline-offset-2">
            Login instead
          </Link>
        </p>
      </section>
    </main>
  );
}
