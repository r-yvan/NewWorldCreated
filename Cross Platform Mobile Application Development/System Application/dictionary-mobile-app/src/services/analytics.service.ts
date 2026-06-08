import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "@/constants/config";
import type { ActivityItem, ActivityType } from "@/types";

/**
 * Local analytics store. Every meaningful dictionary action is recorded so the
 * dashboard can derive real KPIs/charts instead of using static fake numbers.
 */
export interface AnalyticsEvent {
  id: string;
  type: ActivityType;
  word?: string;
  partsOfSpeech?: string[];
  timestamp: number;
}

const MAX_EVENTS = 500;

async function readEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.analytics);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

async function writeEvents(events: AnalyticsEvent[]): Promise<void> {
  const trimmed = events.slice(-MAX_EVENTS);
  await AsyncStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(trimmed));
}

export async function trackEvent(event: Omit<AnalyticsEvent, "id" | "timestamp">): Promise<void> {
  const events = await readEvents();
  events.push({
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  });
  await writeEvents(events);
}

export async function getEvents(): Promise<AnalyticsEvent[]> {
  return readEvents();
}

export async function clearEvents(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.analytics);
}

const ACTIVITY_TITLES: Record<ActivityType, string> = {
  search: "Word searched",
  audio: "Pronunciation played",
  "not-found": "Word not found",
  auth: "Account activity",
  export: "Data exported",
};

export function toActivityItems(events: AnalyticsEvent[]): ActivityItem[] {
  return [...events]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((e) => ({
      id: e.id,
      type: e.type,
      title: ACTIVITY_TITLES[e.type],
      description: e.word ? `"${e.word}"` : "System action",
      timestamp: e.timestamp,
    }));
}
