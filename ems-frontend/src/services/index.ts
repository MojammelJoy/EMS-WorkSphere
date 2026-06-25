import api from "@/lib/axios";
import type {
  AuthResponse, LoginPayload, ForgotPasswordPayload, ResetPasswordPayload,
  Employee, CreateEmployeePayload, PaginatedResponse, PaginationParams,
  Department, CreateDepartmentPayload,
  Attendance, AttendanceSummary,
  LeaveRequest, LeaveBalance, ApplyLeavePayload,
  Payroll, Notification, Document, AuditLog,
  DashboardStats, ActivityItem, BirthdayItem, HolidayItem, AnnouncementItem,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────
export const authService = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),
  logout: () =>
    api.post("/auth/logout").then((r) => r.data),
  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string }>("/auth/refresh", { refreshToken }).then((r) => r.data),
  me: () =>
    api.get<AuthResponse["user"]>("/auth/me").then((r) => r.data),
  forgotPassword: (data: ForgotPasswordPayload) =>
    api.post("/auth/forgot-password", data).then((r) => r.data),
  resetPassword: (data: ResetPasswordPayload) =>
    api.post("/auth/reset-password", data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.put("/auth/change-password", data).then((r) => r.data),
};

// ── Employees ─────────────────────────────────────────────────────────
export const employeeService = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Employee>>("/employees", { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<Employee>(`/employees/${id}`).then((r) => r.data),
  create: (data: CreateEmployeePayload) => {
    const parts = data.name.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName  = parts.slice(1).join(" ") || parts[0];
    return api.post<Employee>("/employees", { ...data, firstName, lastName }).then((r) => r.data);
  },
  update: (id: string, data: Partial<CreateEmployeePayload>) => {
    const payload: Record<string, unknown> = { ...data };
    if (data.name) {
      const parts = data.name.trim().split(/\s+/);
      payload.firstName = parts[0];
      payload.lastName  = parts.slice(1).join(" ") || parts[0];
    }
    return api.put<Employee>(`/employees/${id}`, payload).then((r) => r.data);
  },
  delete: (id: string) =>
    api.delete(`/employees/${id}`).then((r) => r.data),
  uploadAvatar: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return api.post<{ avatar: string }>(`/employees/${id}/avatar`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
  getAttendanceSummary: (id: string, month: number, year: number) =>
    api.get<AttendanceSummary>(`/employees/${id}/attendance-summary`, { params: { month, year } }).then((r) => r.data),
  getLeaveBalance: (id: string) =>
    api.get<LeaveBalance>(`/employees/${id}/leave-balance`).then((r) => r.data),
};

// ── Departments ───────────────────────────────────────────────────────
export const departmentService = {
  list: (params?: PaginationParams) =>
    api.get<Department[]>("/departments", { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<Department>(`/departments/${id}`).then((r) => r.data),
  create: (data: CreateDepartmentPayload) =>
    api.post<Department>("/departments", data).then((r) => r.data),
  update: (id: string, data: Partial<CreateDepartmentPayload>) =>
    api.put<Department>(`/departments/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`/departments/${id}`).then((r) => r.data),
};

// ── Attendance ────────────────────────────────────────────────────────
export const attendanceService = {
  list: (params?: PaginationParams & { date?: string; departmentId?: string }) =>
    api.get<PaginatedResponse<Attendance>>("/attendance", { params }).then((r) => r.data),
  clockIn: (note?: string, location?: string) =>
    api.post<Attendance>("/attendance/clock-in", { note, location }).then((r) => r.data),
  clockOut: (note?: string) =>
    api.post<Attendance>("/attendance/clock-out", { note }).then((r) => r.data),
  getTodayStatus: () =>
    api.get<Attendance | null>("/attendance/today").then((r) => r.data),
  getMonthly: (employeeId: string, month: number, year: number) =>
    api.get<Attendance[]>(`/attendance/monthly/${employeeId}`, { params: { month, year } }).then((r) => r.data),
};

// ── Leave ─────────────────────────────────────────────────────────────
export const leaveService = {
  list: (params?: PaginationParams & { status?: string; employeeId?: string }) =>
    api.get<PaginatedResponse<LeaveRequest>>("/leave", { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<LeaveRequest>(`/leave/${id}`).then((r) => r.data),
  apply: (data: ApplyLeavePayload) =>
    api.post<LeaveRequest>("/leave", data).then((r) => r.data),
  approve: (id: string) =>
    api.patch<LeaveRequest>(`/leave/${id}/approve`).then((r) => r.data),
  reject: (id: string, reason: string) =>
    api.patch<LeaveRequest>(`/leave/${id}/reject`, { reason }).then((r) => r.data),
  cancel: (id: string) =>
    api.patch<LeaveRequest>(`/leave/${id}/cancel`).then((r) => r.data),
  getBalance: (employeeId: string) =>
    api.get<LeaveBalance>(`/leave/balance/${employeeId}`).then((r) => r.data),
};

// ── Payroll ───────────────────────────────────────────────────────────
export const payrollService = {
  list: (params?: PaginationParams & { month?: number; year?: number; status?: string }) =>
    api.get<PaginatedResponse<Payroll>>("/payroll", { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<Payroll>(`/payroll/${id}`).then((r) => r.data),
  getMyPayslips: () =>
    api.get<Payroll[]>("/payroll/my").then((r) => r.data),
  downloadPayslip: (id: string) =>
    api.get<Blob>(`/payroll/${id}/payslip`, { responseType: "blob" }).then((r) => r.data),
  process: (month: number, year: number) =>
    api.post("/payroll/process", { month, year }).then((r) => r.data),
};

// ── Notifications ─────────────────────────────────────────────────────
export const notificationService = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<{ data: Notification[]; total: number; unreadCount: number }>("/notifications", { params }).then((r) => r.data),
  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    api.patch("/notifications/read-all").then((r) => r.data),
  getUnreadCount: () =>
    api.get<{ count: number }>("/notifications/unread-count").then((r) => r.data),
};

// ── Documents ─────────────────────────────────────────────────────────
export const documentService = {
  listAll: () =>
    api.get<Document[]>("/documents").then((r) => r.data),
  list: (employeeId: string) =>
    api.get<Document[]>(`/documents/${employeeId}`).then((r) => r.data),
  upload: (employeeId: string, file: File, type: string, name: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    fd.append("name", name);
    return api.post<Document>(`/documents/${employeeId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
  delete: (id: string) =>
    api.delete(`/documents/${id}`).then((r) => r.data),
};

// ── Audit Logs ────────────────────────────────────────────────────────
export const auditService = {
  list: (params?: PaginationParams & { entity?: string; userId?: string }) =>
    api.get<PaginatedResponse<AuditLog>>("/audit-logs", { params }).then((r) => r.data),
};

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () =>
    api.get<DashboardStats>("/dashboard/stats").then((r) => r.data),
  getAttendanceChart: (range?: "week" | "month") =>
    api.get("/dashboard/attendance-chart", { params: { range } }).then((r) => r.data),
  getGrowthChart: () =>
    api.get("/dashboard/growth-chart").then((r) => r.data),
  getDeptDistribution: () =>
    api.get("/dashboard/dept-distribution").then((r) => r.data),
  getLeaveChart: () =>
    api.get("/dashboard/leave-chart").then((r) => r.data),
  getActivities: () =>
    api.get<ActivityItem[]>("/dashboard/activities").then((r) => r.data),
  getBirthdays: () =>
    api.get<BirthdayItem[]>("/dashboard/birthdays").then((r) => r.data),
  getHolidays: () =>
    api.get<HolidayItem[]>("/dashboard/holidays").then((r) => r.data),
  getAnnouncements: () =>
    api.get<AnnouncementItem[]>("/dashboard/announcements").then((r) => r.data),
};
