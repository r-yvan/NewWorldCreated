/**
 * Centralized TypeScript interfaces.
 * Dictionary types mirror the Free Dictionary API response shape exactly.
 * Enterprise types model the mock auth / dashboard contracts.
 */

/* -------------------------------------------------------------------------- */
/*                          Free Dictionary API types                         */
/* -------------------------------------------------------------------------- */

export interface License {
  name: string;
  url: string;
}

export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  origin?: string;
  meanings: Meaning[];
  license?: License;
  sourceUrls?: string[];
}

/** The Free Dictionary API returns an array of entries. */
export type DictionaryApiResponse = DictionaryEntry[];

/** Shape returned by the API when a word is not found (HTTP 404). */
export interface DictionaryNotFoundResponse {
  title: string;
  message: string;
  resolution: string;
}

export type ApiErrorKind = "not-found" | "network" | "timeout" | "malformed" | "unknown";

export interface ApiError {
  kind: ApiErrorKind;
  message: string;
  status?: number;
}

/* -------------------------------------------------------------------------- */
/*                          Search history types                              */
/* -------------------------------------------------------------------------- */

export interface SearchHistoryItem {
  word: string;
  searchedAt: number;
  partsOfSpeech: string[];
  hasAudio: boolean;
}

/* -------------------------------------------------------------------------- */
/*                          Auth / RBAC types (mock)                          */
/* -------------------------------------------------------------------------- */

export type Role = "student" | "examiner" | "admin";

export type Permission =
  | "dictionary.search"
  | "dictionary.audio.play"
  | "history.view"
  | "history.clear"
  | "dashboard.view"
  | "settings.manage";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  avatarColor: string;
  createdAt: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

/* -------------------------------------------------------------------------- */
/*                          Dashboard / analytics types                       */
/* -------------------------------------------------------------------------- */

export type Trend = "up" | "down" | "flat";

export interface DashboardKpi {
  id: string;
  label: string;
  value: number;
  unit?: string;
  delta: number;
  trend: Trend;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export type ActivityType = "search" | "audio" | "not-found" | "auth" | "export";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: number;
}

export interface DashboardData {
  kpis: DashboardKpi[];
  searchFrequency: ChartDataPoint[];
  partOfSpeechDistribution: ChartDataPoint[];
  errorRate: ChartDataPoint[];
  recentSearches: ChartDataPoint[];
  activity: ActivityItem[];
  errorRatePercent: number;
}
