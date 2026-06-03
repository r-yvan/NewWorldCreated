import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { storage } from "./storage";
import type { ApiResponse } from "@/types/api";
import type { AuthTokens } from "@/types/models";

export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// ===== Request interceptor: attach access token =====
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Response interceptor: transparent refresh on 401 =====
let isRefreshing = false;
let queue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function flushQueue(error: unknown, token: string | null): void {
  queue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  queue = [];
}

// Listeners notified when the session becomes invalid (forces logout).
type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}
function notifySessionExpired(): void {
  sessionExpiredListeners.forEach((l) => l());
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const refreshToken = storage.getRefreshToken();
    const isAuthRoute = original?.url?.includes("/auth/");

    if (
      status === 401 &&
      original &&
      !original._retry &&
      refreshToken &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        // Wait for the in-flight refresh to complete.
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token: string) => {
              original.headers = original.headers ?? {};
              (original.headers as Record<string, string>).Authorization =
                `Bearer ${token}`;
              resolve(apiClient(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post<ApiResponse<AuthTokens>>(
          `${API_URL}/api/auth/refresh-token`,
          { refreshToken },
        );
        const tokens = data.data;
        storage.setTokens(tokens);
        flushQueue(null, tokens.accessToken);
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization =
          `Bearer ${tokens.accessToken}`;
        return apiClient(original);
      } catch (refreshErr) {
        flushQueue(refreshErr, null);
        storage.clear();
        notifySessionExpired();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ===== Error normalisation helper =====
export interface NormalizedError {
  message: string;
  status?: number;
  errors: { field?: string; message: string }[];
}

export function normalizeError(error: unknown): NormalizedError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    return {
      message: data?.message || error.message || "Request failed",
      status: error.response?.status,
      errors: (data?.errors as { field?: string; message: string }[]) ?? [],
    };
  }
  return {
    message: error instanceof Error ? error.message : "Unexpected error",
    errors: [],
  };
}

// Unwrap the standard { success, message, data } envelope.
export function unwrap<T>(payload: ApiResponse<T>): T {
  return payload.data;
}
