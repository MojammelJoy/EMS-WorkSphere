import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService, employeeService, departmentService, leaveService, attendanceService, payrollService, notificationService, dashboardService, auditService, documentService } from "@/services";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import type { LoginPayload, PaginationParams, ApplyLeavePayload, CreateEmployeePayload, CreateDepartmentPayload } from "@/types";

// ── Auth Hooks ──────────────────────────────────────────────────────
export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: ({ user, tokens }) => {
      setAuth(user, tokens);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate("/dashboard");
    },
    onError: () => toast.error("Invalid email or password."),
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();
      qc.clear();
      navigate("/login");
    },
  });
}

// ── Dashboard Hooks ─────────────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: dashboardService.getStats });
}
export function useAttendanceChart(range?: "week" | "month") {
  return useQuery({ queryKey: ["dashboard", "attendance-chart", range], queryFn: () => dashboardService.getAttendanceChart(range) });
}
export function useGrowthChart() {
  return useQuery({ queryKey: ["dashboard", "growth-chart"], queryFn: dashboardService.getGrowthChart });
}
export function useDeptDistribution() {
  return useQuery({ queryKey: ["dashboard", "dept-distribution"], queryFn: dashboardService.getDeptDistribution });
}
export function useLeaveChart() {
  return useQuery({ queryKey: ["dashboard", "leave-chart"], queryFn: dashboardService.getLeaveChart });
}
export function useActivities() {
  return useQuery({ queryKey: ["dashboard", "activities"], queryFn: dashboardService.getActivities });
}
export function useBirthdays() {
  return useQuery({ queryKey: ["dashboard", "birthdays"], queryFn: dashboardService.getBirthdays });
}
export function useHolidays() {
  return useQuery({ queryKey: ["dashboard", "holidays"], queryFn: dashboardService.getHolidays });
}
export function useAnnouncements() {
  return useQuery({ queryKey: ["dashboard", "announcements"], queryFn: dashboardService.getAnnouncements });
}

// ── Employee Hooks ──────────────────────────────────────────────────
export const employeeKeys = {
  all: ["employees"] as const,
  list: (p: PaginationParams) => ["employees", "list", p] as const,
  detail: (id: string) => ["employees", id] as const,
};

export function useEmployees(params?: PaginationParams) {
  return useQuery({ queryKey: employeeKeys.list(params ?? {}), queryFn: () => employeeService.list(params) });
}
export function useEmployee(id: string) {
  return useQuery({ queryKey: employeeKeys.detail(id), queryFn: () => employeeService.get(id), enabled: !!id });
}
export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeePayload) => employeeService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee created!"); },
    onError: () => toast.error("Failed to create employee."),
  });
}
export function useUpdateEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateEmployeePayload>) => employeeService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee updated!"); },
    onError: () => toast.error("Failed to update employee."),
  });
}
export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee removed."); },
    onError: () => toast.error("Failed to delete employee."),
  });
}

// ── Department Hooks ────────────────────────────────────────────────
export function useDepartments(params?: PaginationParams) {
  return useQuery({ queryKey: ["departments", params], queryFn: () => departmentService.list(params) });
}
export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentPayload) => departmentService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast.success("Department created!"); },
    onError: () => toast.error("Failed to create department."),
  });
}

// ── Attendance Hooks ────────────────────────────────────────────────
export function useAttendanceList(params?: PaginationParams & { date?: string; departmentId?: string }) {
  return useQuery({ queryKey: ["attendance", params], queryFn: () => attendanceService.list(params) });
}
export function useTodayAttendance() {
  return useQuery({ queryKey: ["attendance", "today"], queryFn: attendanceService.getTodayStatus });
}
export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ note, location }: { note?: string; location?: string }) => attendanceService.clockIn(note, location),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); toast.success("Clocked in successfully!"); },
  });
}
export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ note }: { note?: string }) => attendanceService.clockOut(note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); toast.success("Clocked out successfully!"); },
  });
}

// ── Leave Hooks ─────────────────────────────────────────────────────
export function useLeaveRequests(params?: PaginationParams & { status?: string }) {
  return useQuery({ queryKey: ["leave", params], queryFn: () => leaveService.list(params) });
}
export function useApplyLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplyLeavePayload) => leaveService.apply(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leave"] }); toast.success("Leave applied!"); },
    onError: () => toast.error("Failed to apply leave."),
  });
}
export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveService.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leave"] }); toast.success("Leave approved!"); },
  });
}
export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => leaveService.reject(id, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leave"] }); toast.success("Leave rejected."); },
  });
}

// ── Notification Hooks ──────────────────────────────────────────────
export function useNotifications(params?: { unreadOnly?: boolean; page?: number; limit?: number }) {
  return useQuery({ queryKey: ["notifications", params], queryFn: () => notificationService.list(params) });
}
export function useUnreadCount() {
  return useQuery({ queryKey: ["notifications", "unread-count"], queryFn: notificationService.getUnreadCount, refetchInterval: 30000 });
}
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ── Payroll Hooks ───────────────────────────────────────────────────
export function usePayrollList(params?: PaginationParams & { month?: number; year?: number }) {
  return useQuery({ queryKey: ["payroll", params], queryFn: () => payrollService.list(params) });
}
export function useMyPayslips() {
  return useQuery({ queryKey: ["payroll", "my"], queryFn: payrollService.getMyPayslips });
}

// ── Audit Log Hooks ─────────────────────────────────────────────────
export function useAuditLogs(params?: PaginationParams & { entity?: string; userId?: string }) {
  return useQuery({ queryKey: ["audit-logs", params], queryFn: () => auditService.list(params) });
}

// ── Document Hooks ──────────────────────────────────────────────────
export function useAllDocuments() {
  return useQuery({ queryKey: ["documents", "all"], queryFn: documentService.listAll });
}
export function useDocuments(employeeId: string) {
  return useQuery({ queryKey: ["documents", employeeId], queryFn: () => documentService.list(employeeId), enabled: !!employeeId });
}
export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, file, type, name }: { employeeId: string; file: File; type: string; name: string }) =>
      documentService.upload(employeeId, file, type, name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document uploaded!"); },
    onError: () => toast.error("Failed to upload document."),
  });
}
export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document deleted."); },
    onError: () => toast.error("Failed to delete document."),
  });
}

// ── UI Hooks ────────────────────────────────────────────────────────
export function useTheme() {
  const { theme, setTheme } = useUIStore();
  const toggleTheme = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);
  return { theme, setTheme, toggleTheme };
}

export function useSidebar() {
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, setSidebarMobileOpen } = useUIStore();
  return { collapsed: sidebarCollapsed, mobileOpen: sidebarMobileOpen, toggle: toggleSidebar, setMobileOpen: setSidebarMobileOpen };
}

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useClickOutside(handler: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler]);
  return ref;
}

export function usePermissions() {
  const { user } = useAuthStore();
  return {
    isAdmin: user?.role === "ADMIN",
    isHR: user?.role === "HR" || user?.role === "ADMIN",
    isEmployee: user?.role === "EMPLOYEE",
    can: (roles: string[]) => !!user && roles.includes(user.role),
  };
}
