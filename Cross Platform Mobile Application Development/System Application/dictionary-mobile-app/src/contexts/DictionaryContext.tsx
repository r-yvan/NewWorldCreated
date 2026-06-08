import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import { useHistory } from "@/contexts/HistoryContext";
import { fetchWord } from "@/services/dictionary.service";
import { trackEvent } from "@/services/analytics.service";
import { findAudioUrl } from "@/services/dictionary.service";
import type { ApiError, DictionaryEntry, SearchHistoryItem } from "@/types";

interface DictionaryContextValue {
  word: string;
  entries: DictionaryEntry[];
  loading: boolean;
  error: ApiError | null;
  /** Has any search been attempted yet (controls the initial empty state). */
  hasSearched: boolean;
  search: (rawWord: string) => Promise<boolean>;
  retry: () => Promise<boolean>;
  reset: () => void;
}

const DictionaryContext = createContext<DictionaryContextValue | undefined>(undefined);

export function DictionaryProvider({ children }: { children: React.ReactNode }) {
  const { addToHistory } = useHistory();
  const [word, setWord] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const lastQuery = useRef("");
  const inFlight = useRef(false);

  const search = useCallback(
    async (rawWord: string): Promise<boolean> => {
      const query = rawWord.trim();
      if (!query) return false;
      // Prevent duplicate rapid submissions.
      if (inFlight.current) return false;

      inFlight.current = true;
      lastQuery.current = query;
      setLoading(true);
      setError(null);
      setHasSearched(true);
      setWord(query);

      try {
        const result = await fetchWord(query);
        setEntries(result);

        // Persist successful searches only.
        const item: SearchHistoryItem = {
          word: result[0]?.word ?? query,
          searchedAt: Date.now(),
          partsOfSpeech: Array.from(new Set(result.flatMap((e) => e.meanings.map((m) => m.partOfSpeech)))),
          hasAudio: !!findAudioUrl(result[0]),
        };
        addToHistory(item);
        void trackEvent({ type: "search", word: item.word, partsOfSpeech: item.partsOfSpeech });
        return true;
      } catch (err) {
        const apiError = err as ApiError;
        setEntries([]);
        setError(apiError);
        if (apiError.kind === "not-found") {
          void trackEvent({ type: "not-found", word: query });
        }
        return false;
      } finally {
        setLoading(false);
        inFlight.current = false;
      }
    },
    [addToHistory],
  );

  const retry = useCallback(() => search(lastQuery.current || word), [search, word]);

  const reset = useCallback(() => {
    setWord("");
    setEntries([]);
    setError(null);
    setHasSearched(false);
    lastQuery.current = "";
  }, []);

  const value = useMemo<DictionaryContextValue>(
    () => ({ word, entries, loading, error, hasSearched, search, retry, reset }),
    [word, entries, loading, error, hasSearched, search, retry, reset],
  );

  return <DictionaryContext.Provider value={value}>{children}</DictionaryContext.Provider>;
}

export function useDictionary(): DictionaryContextValue {
  const ctx = useContext(DictionaryContext);
  if (!ctx) throw new Error("useDictionary must be used within DictionaryProvider");
  return ctx;
}
