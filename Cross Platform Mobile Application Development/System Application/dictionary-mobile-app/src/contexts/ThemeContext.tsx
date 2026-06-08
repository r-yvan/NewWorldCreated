import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme as nwColorScheme } from "nativewind";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { STORAGE_KEYS } from "@/constants/config";
import { darkColors, lightColors, type ThemeColors } from "@/constants/theme";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedScheme = "light" | "dark";

interface ThemeContextValue {
  preference: ThemePreference;
  scheme: ResolvedScheme;
  colors: ThemeColors;
  isDark: boolean;
  setPreference: (pref: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [systemScheme, setSystemScheme] = useState<ResolvedScheme>("light");

  // Load persisted preference once.
  useEffect(() => {
    (async () => {
      const stored = (await AsyncStorage.getItem(STORAGE_KEYS.theme)) as ThemePreference | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreferenceState(stored);
      }
    })();
  }, []);

  const scheme: ResolvedScheme = preference === "system" ? systemScheme : preference;

  // Apply to NativeWind so `dark:` variants react to our preference.
  useEffect(() => {
    nwColorScheme.set(preference);
    if (preference === "system") {
      setSystemScheme(nwColorScheme.get() === "dark" ? "dark" : "light");
    }
  }, [preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    void AsyncStorage.setItem(STORAGE_KEYS.theme, pref);
  }, []);

  const toggle = useCallback(() => {
    setPreference(scheme === "dark" ? "light" : "dark");
  }, [scheme, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      scheme,
      isDark: scheme === "dark",
      colors: scheme === "dark" ? darkColors : lightColors,
      setPreference,
      toggle,
    }),
    [preference, scheme, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
