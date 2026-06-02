'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { getDashboardPath } from '@/lib/auth/routes';
import { GOOGLE_OAUTH_STATE_KEY, saveAuthSession } from '@/lib/auth/session';
import { useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/store/slices/authSlice';
import { User } from '@/types';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(searchParams.get('message') ?? 'Google login failed');
      router.replace('/auth/login');
      return;
    }

    const accessToken = searchParams.get('accessToken') ?? searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken') ?? '';
    const role = searchParams.get('role') as User['role'] | null;

    if (!accessToken || !role) {
      toast.error('Google login did not return a valid session');
      router.replace('/auth/login');
      return;
    }

    const user: User = {
      id: searchParams.get('userId') ?? '',
      fullName: searchParams.get('fullName') ?? searchParams.get('name') ?? searchParams.get('email') ?? 'Google user',
      email: searchParams.get('email') ?? undefined,
      phoneNumber: searchParams.get('phoneNumber') ?? '',
      role,
      villageId: searchParams.get('villageId') ?? '',
      isiboId: searchParams.get('isiboId') ?? undefined,
      isActive: true,
    };

    saveAuthSession({
      accessToken,
      refreshToken,
      user,
    });
    sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
    dispatch(setUser(user));
    toast.success('Google login successful');
    router.replace(getDashboardPath(role));
  }, [dispatch, router, searchParams]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-4 text-center text-sm font-semibold text-gray-600">
      Completing Google login...
    </main>
  );
}
