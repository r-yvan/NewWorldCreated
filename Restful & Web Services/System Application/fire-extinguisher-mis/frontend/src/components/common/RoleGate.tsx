import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types/models";

// Conditionally renders children only when the current user holds one of the
// allowed roles. Used to hide actions/controls per backend RBAC.
export function RoleGate({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
