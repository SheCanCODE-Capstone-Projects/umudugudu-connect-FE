'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sentEmail, setSentEmail] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setSentEmail(values.email);
    toast.success('Password reset request validated');
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-11 w-full max-w-sm items-center gap-3 px-2 sm:max-w-md">
          <Link
            href="/auth/login"
            aria-label="Back to login"
            className="grid h-7 w-7 place-items-center text-emerald-800  outline-1  outline-sky-500 transition hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.3} />
          </Link>
          <p className="text-sm font-bold text-emerald-800">Umudugudu Connect</p>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-sm flex-col px-2 pb-6 pt-10 sm:max-w-md sm:px-4">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-xl bg-emerald-800 text-white shadow-sm">
            <Mail className="h-8 w-8" strokeWidth={2.2} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold leading-tight tracking-normal text-gray-950">
            Forgot Password
          </h1>
          <p className="mt-2 max-w-[22rem] text-sm leading-6 text-gray-700">
            Enter your email address and we will prepare a password reset link for your account.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="mt-7 h-5 w-full bg-[linear-gradient(135deg,#d8e7e4_25%,transparent_25%),linear-gradient(225deg,#d8e7e4_25%,transparent_25%),linear-gradient(315deg,#d8e7e4_25%,transparent_25%),linear-gradient(45deg,#d8e7e4_25%,transparent_25%)] bg-[length:24px_24px] bg-[position:12px_0,12px_0,0_0,0_0]"
        />

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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

          {sentEmail ? (
            <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-left">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2.4} />
              <p className="text-xs font-medium leading-5 text-emerald-900">
                Reset instructions are ready for {sentEmail}. Please check your inbox when email service is connected.
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#008c3a] px-4 text-sm font-bold text-white shadow-sm  outline-1 outline-offset-2  outline-sky-500 transition hover:bg-emerald-800 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700"
          >
            <span>{isSubmitting ? 'Checking...' : 'Send reset link'}</span>
            <Send className="h-4 w-4" strokeWidth={2.8} />
          </button>
        </form>

        <Link
          href="/auth/login"
          className="mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-emerald-700 bg-white text-xs font-bold text-emerald-800  outline-1 outline-offset-2  outline-sky-500 transition hover:bg-emerald-50"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
