import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearAuthSession } from '@/lib/auth/session';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://umudugudu-connect-be-production.up.railway.app';
export const API_ROOT_URL = rawApiUrl.replace(/\/api(?:\/v1)?\/?$/, '').replace(/\/$/, '');
export const API_V1_URL = `${API_ROOT_URL}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_V1_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT on every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent token refresh on 401
let isRefreshing = false;
let queue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 403) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return apiClient(original); });
      }
      original._retry = true;
      isRefreshing     = true;
      try {
        const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error('Missing refresh token');
        const { data } = await axios.post(`${API_V1_URL}/auth/refresh`, { refreshToken });
        const accessToken = data.accessToken ?? data.data?.accessToken;
        if (!accessToken) throw new Error('Refresh response did not include accessToken');
        Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1, secure: true, sameSite: 'strict' });
        queue.forEach((p) => p.resolve(accessToken));
        queue = [];
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch (e) {
        queue.forEach((p) => p.reject(e));
        queue = [];
        clearAuthSession();
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 404 || status === 500) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
