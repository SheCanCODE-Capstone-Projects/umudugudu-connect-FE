'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCheck, ChevronDown, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  { value: '', label: 'Select your role' },
  { value: 'CITIZEN', label: 'Citizen' },
  { value: 'ISIBO_LEADER', label: 'Isibo Leader' },
  { value: 'VILLAGE_LEADER', label: 'Village Leader' },
  { value: 'ADMIN', label: 'Admin' }, 
];

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
      .regex(/^7[2389]\d{7}$/, 'Enter a valid Rwanda phone number, for example 788000000'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    role: z.enum(['CITIZEN', 'ISIBO_LEADER', 'VILLAGE_LEADER', 'ADMIN'], {
      errorMap: () => ({ message: 'Select your role' }),
    }),
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
      role: undefined,
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

  const onSubmit = async () => {
    toast.success('Account details validated successfully');
    router.push('/auth/login');
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
            <div className="grid grid-cols-[5.35rem_1fr] gap-2">
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-2 text-xs font-medium text-gray-950"
                aria-label="Rwanda phone code"
              >
                <span>RW +250</span>
                <ChevronDown className="h-3.5 w-3.5 text-emerald-800" strokeWidth={2.4} />
              </button>
              <input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                aria-invalid={errors.phoneNumber ? 'true' : 'false'}
                placeholder="788 000 000"
                className={inputClass(Boolean(errors.phoneNumber))}
                {...register('phoneNumber')}
              />
            </div>
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
            <label htmlFor="role" className="mb-2 block text-xs font-medium text-gray-950">
              User Role
            </label>
            <div className="relative">
              <select
                id="role"
                defaultValue=""
                aria-invalid={errors.role ? 'true' : 'false'}
                className={inputClass(Boolean(errors.role), 'appearance-none pr-10 font-medium')}
                {...register('role')}
              >
                {roles.map((role) => (
                  <option key={role.value || 'placeholder'} value={role.value} disabled={!role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                strokeWidth={2}
              />
            </div>
            {errors.role ? <p className="mt-1 text-xs font-medium text-red-600">{errors.role.message}</p> : null}
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
