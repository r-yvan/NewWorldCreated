import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { STORAGE_KEYS } from "@/constants/config";
import type { SearchHistoryItem } from "@/types";

interface HistoryContextValue {
  history: SearchHistoryItem[];
  isLoaded: boolean;
  addToHistory: (item: SearchHistoryItem) => void;
  removeFromHistory: (word: string) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

const MAX_HISTORY = 100;

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.history);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setHistory(parsed as SearchHistoryItem[]);
        }
      } catch {
        // Corrupt storage is non-fatal; start with an empty history.
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: SearchHistoryItem[]) => {
    void AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
  }, []);

  const addToHistory = useCallback(
    (item: SearchHistoryItem) => {
      setHistory((prev) => {
        // Prevent duplicates case-insensitively; move the latest to the top.
        const filtered = prev.filter((h) => h.word.toLowerCase() !== item.word.toLowerCase());
        const next = [item, ...filtered].slice(0, MAX_HISTORY);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeFromHistory = useCallback(
    (word: string) => {
      setHistory((prev) => {
        const next = prev.filter((h) => h.word.toLowerCase() !== word.toLowerCase());
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    void AsyncStorage.removeItem(STORAGE_KEYS.history);
  }, []);

  const value = useMemo<HistoryContextValue>(
    () => ({ history, isLoaded, addToHistory, removeFromHistory, clearHistory }),
    [history, isLoaded, addToHistory, removeFromHistory, clearHistory],
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
