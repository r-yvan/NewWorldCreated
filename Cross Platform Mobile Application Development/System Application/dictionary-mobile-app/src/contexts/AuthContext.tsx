import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";

import { STORAGE_KEYS } from "@/constants/config";
import { registerAuthBridge } from "@/lib/http";
import * as authService from "@/services/auth.service";
import type { AuthSession, Role, User } from "@/types";

interface AuthContextValue {
  session: AuthSession | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (email: string, token: string, password: string) => Promise<void>;
  updateProfile: (changes: Partial<Pick<User, "name" | "email">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Cross-platform secure persistence: SecureStore on native, AsyncStorage on web. */
async function persistSession(session: AuthSession | null): Promise<void> {
  const value = session ? JSON.stringify(session) : null;
  if (Platform.OS === "web") {
    if (value) await AsyncStorage.setItem(STORAGE_KEYS.session, value);
    else await AsyncStorage.removeItem(STORAGE_KEYS.session);
    return;
  }
  if (value) await SecureStore.setItemAsync(STORAGE_KEYS.session, value);
  else await SecureStore.deleteItemAsync(STORAGE_KEYS.session);
}

async function loadSession(): Promise<AuthSession | null> {
  try {
    const raw =
      Platform.OS === "web"
        ? await AsyncStorage.getItem(STORAGE_KEYS.session)
        : await SecureStore.getItemAsync(STORAGE_KEYS.session);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const sessionRef = useRef<AuthSession | null>(null);

  const applySession = useCallback(async (next: AuthSession | null) => {
    sessionRef.current = next;
    setSession(next);
    await persistSession(next);
  }, []);

  // Register the token getter + refresh hook with the enterprise axios client.
  useEffect(() => {
    registerAuthBridge({
      getToken: () => sessionRef.current?.tokens.accessToken ?? null,
      refresh: async () => {
        if (!sessionRef.current) return null;
        const refreshed = await authService.refreshSession(sessionRef.current);
        await applySession(refreshed);
        return refreshed.tokens.accessToken;
      },
    });
  }, [applySession]);

  // Restore persisted session on cold start.
  useEffect(() => {
    (async () => {
      const restored = await loadSession();
      if (restored) {
        // Refresh tokens if expired.
        if (restored.tokens.expiresAt < Date.now()) {
          const refreshed = await authService.refreshSession(restored);
          await applySession(refreshed);
        } else {
          sessionRef.current = restored;
          setSession(restored);
        }
      }
      setIsInitializing(false);
    })();
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const next = await authService.login(email, password);
      await applySession(next);
    },
    [applySession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role: Role) => {
      const next = await authService.register(name, email, password, role);
      await applySession(next);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await applySession(null);
  }, [applySession]);

  const requestPasswordReset = useCallback(async (email: string) => {
    const { token } = await authService.requestPasswordReset(email);
    return token;
  }, []);

  const resetPassword = useCallback(async (email: string, token: string, password: string) => {
    await authService.resetPassword(email, token, password);
  }, []);

  const updateProfile = useCallback(
    async (changes: Partial<Pick<User, "name" | "email">>) => {
      if (!sessionRef.current) return;
      const updated = await authService.updateProfile(sessionRef.current.user, changes);
      await applySession({ ...sessionRef.current, user: updated });
    },
    [applySession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      isInitializing,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      updateProfile,
    }),
    [session, isInitializing, login, register, logout, requestPasswordReset, resetPassword, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
