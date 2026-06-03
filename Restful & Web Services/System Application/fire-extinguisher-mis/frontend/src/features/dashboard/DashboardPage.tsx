import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/types/models";
import { AdminDashboard } from "./AdminDashboard";
import { UserDashboard } from "./UserDashboard";

// Reports endpoints are restricted to ADMIN/INSPECTOR, so the USER role gets a
// tailored overview built from the resources they can access.
export default function DashboardPage() {
  const { hasRole } = useAuth();
  return hasRole(Role.ADMIN, Role.INSPECTOR) ? <AdminDashboard /> : <UserDashboard />;
}
