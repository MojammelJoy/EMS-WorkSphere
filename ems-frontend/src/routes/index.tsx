import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { AppLayout } from "@/components/layouts/app-layout";
import { PageLoader } from "@/components/feedback/page-loader";
import type { UserRole } from "@/types";

// Lazy pages
const LoginPage         = lazy(() => import("@/features/auth/pages/login-page"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/forgot-password-page"));
const ResetPasswordPage  = lazy(() => import("@/features/auth/pages/reset-password-page"));

const DashboardPage     = lazy(() => import("@/features/dashboard/pages/dashboard-page"));
const EmployeeListPage  = lazy(() => import("@/features/employees/pages/employee-list-page"));
const EmployeeProfilePage = lazy(() => import("@/features/employees/pages/employee-profile-page"));
const AddEmployeePage   = lazy(() => import("@/features/employees/pages/add-employee-page"));
const DepartmentsPage   = lazy(() => import("@/features/departments/pages/departments-page"));
const AttendancePage    = lazy(() => import("@/features/attendance/pages/attendance-page"));
const LeavePage         = lazy(() => import("@/features/leave/pages/leave-page"));
const PayrollPage       = lazy(() => import("@/features/payroll/pages/payroll-page"));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/notifications-page"));
const ReportsPage       = lazy(() => import("@/features/reports/pages/reports-page"));
const DocumentsPage     = lazy(() => import("@/features/documents/pages/documents-page"));
const AuditPage         = lazy(() => import("@/features/audit/pages/audit-page"));
const SettingsPage      = lazy(() => import("@/features/settings/pages/settings-page"));
const NotFoundPage      = lazy(() => import("@/pages/not-found-page"));

// ── Guards ─────────────────────────────────────────────────────────
function PrivateRoute() {
  const { isAuthenticated } = useAuthStore();
  const { pathname } = useLocation();
  return isAuthenticated ? <Outlet /> : <Navigate to={`/login?redirect=${pathname}`} replace />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { user } = useAuthStore();
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicRoute />}>
        <Route path="/login"           element={<S><LoginPage /></S>} />
        <Route path="/forgot-password" element={<S><ForgotPasswordPage /></S>} />
        <Route path="/reset-password"  element={<S><ResetPasswordPage /></S>} />
      </Route>

      {/* Protected */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={<S><DashboardPage /></S>} />

          {/* Employees — Admin + HR */}
          <Route element={<RoleRoute roles={["ADMIN", "HR"]} />}>
            <Route path="/employees"        element={<S><EmployeeListPage /></S>} />
            <Route path="/employees/new"    element={<S><AddEmployeePage /></S>} />
            <Route path="/employees/:id"    element={<S><EmployeeProfilePage /></S>} />
            <Route path="/employees/:id/edit" element={<S><AddEmployeePage /></S>} />
            <Route path="/departments"      element={<S><DepartmentsPage /></S>} />
          </Route>

          <Route path="/attendance"    element={<S><AttendancePage /></S>} />
          <Route path="/leave"         element={<S><LeavePage /></S>} />

          {/* Payroll — Admin only */}
          <Route element={<RoleRoute roles={["ADMIN"]} />}>
            <Route path="/payroll"     element={<S><PayrollPage /></S>} />
          </Route>

          <Route path="/notifications" element={<S><NotificationsPage /></S>} />
          <Route path="/documents"     element={<S><DocumentsPage /></S>} />

          {/* Reports — Admin + HR */}
          <Route element={<RoleRoute roles={["ADMIN", "HR"]} />}>
            <Route path="/reports"     element={<S><ReportsPage /></S>} />
          </Route>

          {/* Audit — Admin only */}
          <Route element={<RoleRoute roles={["ADMIN"]} />}>
            <Route path="/audit"       element={<S><AuditPage /></S>} />
          </Route>

          <Route path="/settings"      element={<S><SettingsPage /></S>} />
        </Route>
      </Route>

      <Route path="*" element={<S><NotFoundPage /></S>} />
    </Routes>
  );
}
