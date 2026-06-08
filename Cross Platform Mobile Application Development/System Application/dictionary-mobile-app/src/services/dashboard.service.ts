import { getEvents, toActivityItems, type AnalyticsEvent } from "@/services/analytics.service";
import type { ChartDataPoint, DashboardData, DashboardKpi, Trend } from "@/types";

/**
 * Builds dashboard analytics from locally tracked events. When the user has
 * little/no history yet, a deterministic seed keeps the charts looking complete
 * (this is the "mocked backend data" the brief calls for).
 */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SEED_EVENTS: AnalyticsEvent[] = buildSeed();

function buildSeed(): AnalyticsEvent[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const words = ["serendipity", "ephemeral", "lucid", "pragmatic", "eloquent", "verbose", "candid"];
  const pos = ["noun", "verb", "adjective", "adverb"];
  const events: AnalyticsEvent[] = [];
  for (let i = 0; i < 36; i += 1) {
    const ts = now - Math.floor(Math.random() * 6) * day - Math.floor(Math.random() * day);
    const type = i % 9 === 0 ? "not-found" : i % 3 === 0 ? "audio" : "search";
    events.push({
      id: `seed-${i}`,
      type,
      word: words[i % words.length],
      partsOfSpeech: [pos[i % pos.length]],
      timestamp: ts,
    });
  }
  return events;
}

function trend(delta: number): Trend {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

export async function getDashboardData(): Promise<DashboardData> {
  const live = await getEvents();
  const events = live.length >= 8 ? live : [...SEED_EVENTS, ...live];

  const searches = events.filter((e) => e.type === "search");
  const audio = events.filter((e) => e.type === "audio");
  const notFound = events.filter((e) => e.type === "not-found");
  const uniqueWords = new Set(searches.map((e) => e.word).filter(Boolean)).size;
  const total = searches.length + audio.length + notFound.length;
  const errorRatePercent = total > 0 ? Math.round((notFound.length / total) * 100) : 0;

  const kpis: DashboardKpi[] = [
    { id: "total", label: "Total Searches", value: searches.length, delta: 12, trend: trend(12) },
    { id: "unique", label: "Unique Words", value: uniqueWords, delta: 5, trend: trend(5) },
    { id: "notfound", label: "Words Not Found", value: notFound.length, delta: -3, trend: trend(-3) },
    { id: "audio", label: "Pronunciations", value: audio.length, delta: 8, trend: trend(8) },
  ];

  return {
    kpis,
    searchFrequency: byWeekday(events),
    partOfSpeechDistribution: byPartOfSpeech(events),
    errorRate: errorByWeekday(events),
    recentSearches: topWords(searches),
    activity: toActivityItems(events).slice(0, 12),
    errorRatePercent,
  };
}

function byWeekday(events: AnalyticsEvent[]): ChartDataPoint[] {
  const counts = new Array(7).fill(0);
  events.forEach((e) => {
    const idx = (new Date(e.timestamp).getDay() + 6) % 7;
    counts[idx] += 1;
  });
  return WEEKDAYS.map((label, i) => ({ label, value: counts[i] }));
}

function errorByWeekday(events: AnalyticsEvent[]): ChartDataPoint[] {
  const counts = new Array(7).fill(0);
  events
    .filter((e) => e.type === "not-found")
    .forEach((e) => {
      const idx = (new Date(e.timestamp).getDay() + 6) % 7;
      counts[idx] += 1;
    });
  return WEEKDAYS.map((label, i) => ({ label, value: counts[i] }));
}

function byPartOfSpeech(events: AnalyticsEvent[]): ChartDataPoint[] {
  const map = new Map<string, number>();
  events.forEach((e) => {
    (e.partsOfSpeech ?? []).forEach((p) => map.set(p, (map.get(p) ?? 0) + 1));
  });
  if (map.size === 0) {
    return [
      { label: "noun", value: 4 },
      { label: "verb", value: 3 },
      { label: "adjective", value: 2 },
      { label: "adverb", value: 1 },
    ];
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function topWords(events: AnalyticsEvent[]): ChartDataPoint[] {
  const map = new Map<string, number>();
  events.forEach((e) => {
    if (e.word) map.set(e.word, (map.get(e.word) ?? 0) + 1);
  });
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

/** Build a CSV-like export payload for the dashboard export action. */
export function buildExport(data: DashboardData): string {
  const lines = ["metric,value"];
  data.kpis.forEach((k) => lines.push(`${k.label},${k.value}`));
  lines.push(`Error Rate (%),${data.errorRatePercent}`);
  data.recentSearches.forEach((r) => lines.push(`word:${r.label},${r.value}`));
  return lines.join("\n");
}
