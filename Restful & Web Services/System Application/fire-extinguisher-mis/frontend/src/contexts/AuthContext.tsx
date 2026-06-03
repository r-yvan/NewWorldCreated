import * as React from "react";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/auth.service";
import { storage } from "@/lib/storage";
import { onSessionExpired } from "@/lib/axios";
import type { Role, User } from "@/types/models";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(storage.getUser());
  const [isLoading, setIsLoading] = React.useState(true);

  const setUser = React.useCallback((u: User) => {
    setUserState(u);
    storage.setUser(u);
  }, []);

  const clearSession = React.useCallback(() => {
    storage.clear();
    setUserState(null);
  }, []);

  // Validate persisted session on mount.
  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!storage.getAccessToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authService.me();
        if (active) setUser(me);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [setUser, clearSession]);

  // React to forced logout from the axios refresh failure.
  React.useEffect(() => onSessionExpired(() => clearSession()), [clearSession]);

  const login = React.useCallback(
    async (payload: LoginPayload) => {
      const result = await authService.login(payload);
      storage.setTokens(result);
      setUser(result.user);
      return result.user;
    },
    [setUser]
  );

  const register = React.useCallback(
    async (payload: RegisterPayload) => {
      const result = await authService.register(payload);
      storage.setTokens(result);
      setUser(result.user);
      return result.user;
    },
    [setUser]
  );

  const logout = React.useCallback(async () => {
    const refreshToken = storage.getRefreshToken();
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // ignore network/logout errors
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshUser = React.useCallback(async () => {
    const me = await authService.me();
    setUser(me);
  }, [setUser]);

  const hasRole = React.useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
      hasRole,
    }),
    [user, isLoading, login, register, logout, refreshUser, setUser, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
