'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Globe2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async () => {
    toast.success('Login details validated successfully');
    router.push('/dashboard/citizen');
  };

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

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-medium text-gray-950">
              Email address
            </label>
            <input
              id="email"
              type="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              placeholder="e.g. name@community.rw"
              className={`h-10 w-full rounded-md border bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-300 focus:ring-2 ${
                errors.email
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                  : 'border-gray-300 focus:border-emerald-700 focus:ring-emerald-100'
              }`}
              {...register('email')}
            />
            {errors.email ? <p className="mt-1 text-xs font-medium text-red-600">{errors.email.message}</p> : null}
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

        <div className="mt-6 grid grid-cols-2 gap-3 pb-0">
          <article className="relative h-[7.25rem] overflow-hidden rounded-lg bg-white p-3 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-emerald-800" strokeWidth={2.2} />
            <div className="absolute -bottom-7 -right-5 h-16 w-16 rounded-full bg-emerald-50" />
            <p className="absolute bottom-3 left-3 text-[10px] font-bold text-gray-800">Secure OTP Login</p>
          </article>

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
