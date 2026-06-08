/** Centralized API + app configuration. No hardcoded URLs scattered in the UI. */

export const DICTIONARY_API = {
  baseURL: "https://api.dictionaryapi.dev/api/v2",
  entriesPath: "/entries/en",
  timeout: 12000,
} as const;

export const ENTERPRISE_API = {
  // Simulated enterprise base URL used by the mock auth/dashboard service layer.
  baseURL: "https://mockapi.lexitech.local/api/v1",
  timeout: 10000,
} as const;

// Keys must be SecureStore-safe (alphanumerics plus ".", "-", "_" only) since
// the session is persisted with expo-secure-store on native devices.
export const STORAGE_KEYS = {
  history: "lexitech.search_history",
  theme: "lexitech.theme",
  session: "lexitech.session",
  analytics: "lexitech.analytics",
} as const;

export const APP_META = {
  name: "LexiTech Dictionary",
  company: "LexiTech Solutions Ltd",
  version: "1.0.0",
  location: "Kigali City",
} as const;
