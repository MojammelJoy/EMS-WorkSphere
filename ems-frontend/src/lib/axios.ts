import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/constants";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
  withCredentials: true,
});

/* ── Request: attach access token ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Response: unwrap envelope + 401 → refresh ── */
api.interceptors.response.use(
  (res) => {
    if (res.data?.success === true && "data" in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  async (error: AxiosError) => {
    const original = error.config as RetryConfig;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL ?? "/api"}/auth/refresh`, { refreshToken });
        const accessToken = data?.data?.accessToken ?? data?.accessToken;
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = "/login?session=expired";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
