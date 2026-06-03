import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/common/PublicOnlyRoute";
import { UnauthorizedPage, NotFoundPage } from "@/features/misc/StatusPages";
import { Role } from "@/types/models";

// Code-split route components for performance.
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/features/auth/ResetPasswordPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const ExtinguishersPage = lazy(() => import("@/features/extinguishers/ExtinguishersPage"));
const InspectionsPage = lazy(() => import("@/features/inspections/InspectionsPage"));
const MaintenancePage = lazy(() => import("@/features/maintenance/MaintenancePage"));
const UsersPage = lazy(() => import("@/features/users/UsersPage"));
const ReportsPage = lazy(() => import("@/features/reports/ReportsPage"));
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage"));

export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected application routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/extinguishers" element={<ExtinguishersPage />} />
        <Route path="/inspections" element={<InspectionsPage />} />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute roles={[Role.ADMIN, Role.INSPECTOR]}>
              <MaintenancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={[Role.ADMIN, Role.INSPECTOR]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={[Role.ADMIN]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Redirects & fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
