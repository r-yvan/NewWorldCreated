import React, { createContext, useContext, useMemo } from "react";

import { useAuth } from "@/contexts/AuthContext";
import type { Permission, Role } from "@/types";

interface PermissionContextValue {
  role: Role | null;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  hasRole: (role: Role) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const value = useMemo<PermissionContextValue>(() => {
    const permissions = user?.permissions ?? [];
    return {
      role: user?.role ?? null,
      permissions,
      can: (permission) => permissions.includes(permission),
      canAny: (perms) => perms.some((p) => permissions.includes(p)),
      hasRole: (role) => user?.role === role,
    };
  }, [user]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions(): PermissionContextValue {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermissions must be used within PermissionProvider");
  return ctx;
}
