import axios, { AxiosError, AxiosInstance } from "axios";

import { DICTIONARY_API, ENTERPRISE_API } from "@/constants/config";
import type { ApiError } from "@/types";

/**
 * Dictionary client — talks to the public Free Dictionary API.
 * No authentication is attached; dictionary search works independently.
 */
export const dictionaryClient: AxiosInstance = axios.create({
  baseURL: DICTIONARY_API.baseURL,
  timeout: DICTIONARY_API.timeout,
  headers: { Accept: "application/json" },
});

dictionaryClient.interceptors.request.use((config) => {
  // Lightweight request tracing; useful while debugging on device.
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[dictionary] → ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

dictionaryClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeAxiosError(error)),
);

/**
 * Enterprise client — used by the MOCK auth/dashboard service layer.
 * A bearer token getter + refresh hook can be registered at runtime.
 */
export const enterpriseClient: AxiosInstance = axios.create({
  baseURL: ENTERPRISE_API.baseURL,
  timeout: ENTERPRISE_API.timeout,
  headers: { "Content-Type": "application/json" },
});

let accessTokenGetter: () => string | null = () => null;
let tokenRefresher: (() => Promise<string | null>) | null = null;

export function registerAuthBridge(opts: {
  getToken: () => string | null;
  refresh: () => Promise<string | null>;
}) {
  accessTokenGetter = opts.getToken;
  tokenRefresher = opts.refresh;
}

enterpriseClient.interceptors.request.use((config) => {
  const token = accessTokenGetter();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

enterpriseClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    // Token refresh mechanism for the mock auth flow.
    if (error.response?.status === 401 && original && !original._retry && tokenRefresher) {
      original._retry = true;
      const fresh = await tokenRefresher();
      if (fresh) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${fresh}`;
        return enterpriseClient(original);
      }
    }
    return Promise.reject(normalizeAxiosError(error));
  },
);

/** Convert any Axios failure into a predictable, UI-friendly ApiError. */
export function normalizeAxiosError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axErr = error as AxiosError;
    if (axErr.code === "ECONNABORTED") {
      return { kind: "timeout", message: "The request timed out. Please try again.", status: 408 };
    }
    if (axErr.response) {
      const status = axErr.response.status;
      if (status === 404) {
        return { kind: "not-found", message: "Word not found.", status };
      }
      return {
        kind: "unknown",
        message: `Request failed with status ${status}.`,
        status,
      };
    }
    return {
      kind: "network",
      message: "Network error. Check your connection and try again.",
    };
  }
  return { kind: "unknown", message: "Something went wrong. Please try again." };
}
