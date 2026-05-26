'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut } from 'lucide-react';
const CURRENT_USER_KEY = 'umudugudu_current_user';
const PENDING_OTP_KEY = 'umudugudu_pending_otp_login';
const GOOGLE_OAUTH_STATE_KEY = 'umudugudu_google_oauth_state';

type LogoutButtonProps = {
  className?: string;
  showLabel?: boolean;
};

export function useRedirectLoggedOut() {
  const router = useRouter();

  useEffect(() => {
    const redirectIfLoggedOut = () => {
      if (!sessionStorage.getItem(CURRENT_USER_KEY)) {
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

  const logout = () => {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(PENDING_OTP_KEY);
    sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
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
