import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT on every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('accessToken');
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
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return apiClient(original); });
      }
      original._retry = true;
      isRefreshing     = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken });
        Cookies.set('accessToken', data.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
        queue.forEach((p) => p.resolve(data.accessToken));
        queue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch (e) {
        queue.forEach((p) => p.reject(e));
        queue = [];
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
