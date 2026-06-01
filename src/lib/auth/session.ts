import Cookies from 'js-cookie';
import { AuthResponse, User } from '@/types';

export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const AUTH_USER_KEY = 'umudugudu_auth_user';
export const PENDING_OTP_KEY = 'umudugudu_pending_otp_login';
export const PENDING_RESET_KEY = 'umudugudu_pending_password_reset';
export const GOOGLE_OAUTH_STATE_KEY = 'umudugudu_google_oauth_state';

const cookieOptions = {
  expires: 7,
  secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
  sameSite: 'strict' as const,
};

export function saveAuthSession(auth: Pick<AuthResponse, 'accessToken' | 'refreshToken' | 'user'>) {
  Cookies.set(ACCESS_TOKEN_KEY, auth.accessToken, cookieOptions);
  if (auth.refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, auth.refreshToken, cookieOptions);
  }
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user));
}

export function getStoredAuthUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch {
    return null;
  }
}

export function hasAuthSession() {
  return Boolean(Cookies.get(ACCESS_TOKEN_KEY));
}

export function clearAuthSession() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(PENDING_OTP_KEY);
  sessionStorage.removeItem(PENDING_RESET_KEY);
  sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
}

