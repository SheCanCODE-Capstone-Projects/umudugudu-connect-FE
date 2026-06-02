import axios, { AxiosError } from 'axios';
import { AuthResponse, User, UserRole } from '@/types';
import apiClient, { API_ROOT_URL } from './client';

export type AuthPurpose = 'registration' | 'login';

export type PendingOtpChallenge = {
  purpose: AuthPurpose;
  challengeId?: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  maskedEmail: string;
  contactLabel?: string;
  role?: UserRole | null;
  dashboardPath: string;
  requestedAt: number;
};

export type PendingPasswordReset = {
  challengeId?: string;
  email: string;
  maskedEmail: string;
  requestedAt: number;
};

export type AuthFlowResponse = {
  message: string;
  requiresOtp: boolean;
  challengeId?: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  role?: UserRole | null;
  auth?: AuthResponse;
};

type RegisterPayload = {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email?: string;
  phoneNumber?: string;
  password: string;
};

type ResetPasswordPayload = {
  email: string;
  otp: string;
  password: string;
  challengeId?: string;
};

const endpointGroups = {
  register: '/auth/register',
  loginEmail: '/auth/login/email',
  loginPhone: '/auth/login/phone',
  verifyRegistrationEmailOtp: '/auth/email-otp/verify',
  verifyRegistrationPhoneOtp: '/auth/phone-otp/verify',
  verifyLoginOtp: '/auth/login/verify-otp',
  requestPhoneOtp: '/auth/otp/request',
  resendEmailOtp: '/auth/email/resend-otp',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  googleAuthorize: '/auth/oauth2/authorize/google',
  me: '/auth/me',
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || parts[0] || '',
  };
};

function unwrapResponse<T>(payload: unknown): T {
  const value = payload as { data?: T };
  return value && typeof value === 'object' && 'data' in value ? (value.data as T) : (payload as T);
}

function getString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value) return value;
  }
  return undefined;
}

function normalizeAuthResponse(payload: unknown): AuthFlowResponse {
  const body = unwrapResponse<Record<string, unknown>>(payload) ?? {};
  const rawUser = (body.user ?? body.account ?? body.profile) as (Partial<User> & Record<string, unknown>) | undefined;
  const accessToken = getString(body, ['accessToken', 'access_token', 'token', 'jwt']);
  const refreshToken = getString(body, ['refreshToken', 'refresh_token']);
  const role = (rawUser?.role ?? body.role) as UserRole | null | undefined;
  const firstName = typeof rawUser?.firstName === 'string' ? rawUser.firstName : '';
  const lastName = typeof rawUser?.lastName === 'string' ? rawUser.lastName : '';
  const fullName = getString(body, ['fullName', 'name']) ?? [firstName, lastName].filter(Boolean).join(' ');
  const user = rawUser && accessToken
    ? ({
        id: String(rawUser.id ?? body.userId ?? ''),
        fullName: String(rawUser.fullName ?? rawUser.name ?? fullName ?? rawUser.email ?? body.email ?? ''),
        email: String(rawUser.email ?? body.email ?? ''),
        phoneNumber: String(rawUser.phoneNumber ?? body.phoneNumber ?? ''),
        role: role ?? 'CITIZEN',
        villageId: String(rawUser.villageId ?? body.villageId ?? ''),
        isiboId: rawUser.isiboId,
        isActive: rawUser.isActive ?? true,
      } as User)
    : undefined;

  return {
    message: getString(body, ['message']) ?? 'Request completed successfully',
    requiresOtp: Boolean(body.requiresOtp ?? body.otpRequired ?? body.requiresVerification ?? (!accessToken && (body.challengeId || body.otpSent))),
    challengeId: getString(body, ['challengeId', 'otpId', 'verificationId', 'requestId']),
    email: getString(body, ['email']) ?? (typeof rawUser?.email === 'string' ? rawUser.email : undefined),
    phoneNumber: getString(body, ['phoneNumber', 'phone']),
    fullName: fullName || (typeof rawUser?.fullName === 'string' ? rawUser.fullName : undefined),
    role,
    auth: accessToken && user
      ? {
          accessToken,
          refreshToken: refreshToken ?? '',
          tokenType: 'Bearer',
          expiresIn: Number(body.expiresIn ?? 0),
          user,
        }
      : undefined,
  };
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string; data?: { message?: string } }>;
    return axiosError.response?.data?.message ?? axiosError.response?.data?.data?.message ?? axiosError.response?.data?.error ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export async function registerUser(payload: RegisterPayload) {
  const name = splitFullName(payload.fullName);
  const { data } = await apiClient.post(endpointGroups.register, {
    firstName: name.firstName,
    lastName: name.lastName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    password: payload.password,
  });
  return normalizeAuthResponse(data);
}

export async function loginUser(payload: LoginPayload) {
  const { data } = payload.phoneNumber
    ? await apiClient.post(endpointGroups.loginPhone, {
        phoneNumber: payload.phoneNumber,
        password: payload.password,
      })
    : await apiClient.post(endpointGroups.loginEmail, {
        email: payload.email,
        password: payload.password,
      });
  return normalizeAuthResponse(data);
}

export async function verifyOtp(pending: PendingOtpChallenge, otp: string) {
  const endpoint =
    pending.purpose === 'login'
      ? endpointGroups.verifyLoginOtp
      : pending.phoneNumber
        ? endpointGroups.verifyRegistrationPhoneOtp
        : endpointGroups.verifyRegistrationEmailOtp;
  const payload = pending.phoneNumber && pending.purpose === 'registration'
    ? { phoneNumber: pending.phoneNumber, otp }
    : { email: pending.email, otp };
  const { data } = await apiClient.post(endpoint, payload);
  return normalizeAuthResponse(data);
}

export async function resendOtp(pending: PendingOtpChallenge) {
  const { data } = pending.phoneNumber && pending.purpose === 'registration'
    ? await apiClient.post(endpointGroups.requestPhoneOtp, { phoneNumber: pending.phoneNumber })
    : await apiClient.post(endpointGroups.resendEmailOtp, { email: pending.email });
  return normalizeAuthResponse(data);
}

export async function requestPasswordReset(email: string) {
  const { data } = await apiClient.post(endpointGroups.forgotPassword, { email });
  return normalizeAuthResponse(data);
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data } = await apiClient.post(endpointGroups.resetPassword, {
    email: payload.email,
    otp: payload.otp,
    token: payload.challengeId,
    password: payload.password,
    newPassword: payload.password,
  });
  return normalizeAuthResponse(data);
}

export async function getCurrentUser() {
  const { data } = await apiClient.get(endpointGroups.me);
  return normalizeAuthResponse({ user: unwrapResponse(data) }).auth?.user ?? (unwrapResponse(data) as User);
}

export async function getGoogleAuthorizeUrl() {
  const { data } = await apiClient.get(endpointGroups.googleAuthorize);
  const body = unwrapResponse<Record<string, unknown>>(data) ?? {};
  return getString(body, ['url', 'authorizationUrl', 'redirectUrl', 'authUrl']) ?? (typeof data === 'string' ? data : undefined);
}

export function getGoogleLoginUrl() {
  if (typeof window === 'undefined') return `${API_ROOT_URL}/api/v1${endpointGroups.googleAuthorize}`;

  const callbackUrl = new URL('/auth/google/callback', window.location.origin);
  return `${API_ROOT_URL}/api/v1${endpointGroups.googleAuthorize}?${new URLSearchParams({
    redirect_uri: callbackUrl.toString(),
    state: 'umudugudu-google-login',
  }).toString()}`;
}
