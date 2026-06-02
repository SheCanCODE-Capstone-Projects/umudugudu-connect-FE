'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAppDispatch } from '@/hooks/redux';
import { clearAuthSession, hasAuthSession } from '@/lib/auth/session';
import { clearAuth } from '@/store/slices/authSlice';

type LogoutButtonProps = {
  className?: string;
  showLabel?: boolean;
};

export function useRedirectLoggedOut() {
  const router = useRouter();

  useEffect(() => {
    const redirectIfLoggedOut = () => {
      if (!hasAuthSession()) {
        router.replace('/auth/login');
      }
    };

    redirectIfLoggedOut();
    window.addEventListener('popstate', redirectIfLoggedOut);
    window.addEventListener('focus', redirectIfLoggedOut);
    window.addEventListener('pageshow', redirectIfLoggedOut);
    document.addEventListener('visibilitychange', redirectIfLoggedOut);

    return () => {
      window.removeEventListener('popstate', redirectIfLoggedOut);
      window.removeEventListener('focus', redirectIfLoggedOut);
      window.removeEventListener('pageshow', redirectIfLoggedOut);
      document.removeEventListener('visibilitychange', redirectIfLoggedOut);
    };
  }, [router]);
}

export default function LogoutButton({ className = '', showLabel = false }: LogoutButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const logout = () => {
    clearAuthSession();
    dispatch(clearAuth());
    router.replace('/auth/login');
  };

  return (
    <button
      type="button"
      onClick={logout}
      aria-label="Logout"
      className={
        className ||
        'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-bold text-red-600 transition hover:bg-red-50'
      }
    >
      <LogOut className="h-4 w-4" />
      {showLabel ? <span>Logout</span> : null}
    </button>
  );
}
