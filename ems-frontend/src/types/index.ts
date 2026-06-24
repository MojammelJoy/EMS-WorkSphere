/* ═══════════════════════════════════════
   WORKSPHERE — Global TypeScript Types
═══════════════════════════════════════ */

// ── Auth ─────────────────────────────
export type UserRole = "ADMIN" | "HR" | "EMPLOYEE";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  employeeId?: string;
  departmentId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

// ── Employee ──────────────────────────
export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "TERMINATED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  bloodGroup?: BloodGroup;
  dateOfBirth?: string;
  designation: string;
  departmentId: string;
  department: Department;
  managerId?: string;
  manager?: Pick<Employee, "id" | "name" | "avatar">;
  status: EmployeeStatus;
  joiningDate: string;
  salary: number;
  avatar?: string;
  coverImage?: string;
  address?: string;
  nid?: string;
  emergencyContact?: EmergencyContact;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  bloodGroup?: BloodGroup;
  dateOfBirth?: string;
  designation: string;
  departmentId: string;
  managerId?: string;
  joiningDate: string;
  salary: number;
  address?: string;
  nid?: string;
  emergencyContact?: EmergencyContact;
}

// ── Department ────────────────────────
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  manager?: Pick<Employee, "id" | "name" | "avatar">;
  parentDepartmentId?: string;
  employeeCount: number;
  createdAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
}

// ── Attendance ────────────────────────
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "HOLIDAY" | "WEEKEND";

export interface Attendance {
  id: string;
  employeeId: string;
  employee: Pick<Employee, "id" | "name" | "avatar" | "designation" | "department">;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workingHours?: number;
  overtime?: number;
  note?: string;
  location?: string;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  totalDays: number;
  attendanceRate: number;
}

// ── Leave ─────────────────────────────
export type LeaveType = "CASUAL" | "SICK" | "EARNED" | "MATERNITY" | "PATERNITY" | "UNPAID" | "COMPENSATORY";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee: Pick<Employee, "id" | "name" | "avatar" | "designation" | "department">;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedById?: string;
  approvedBy?: Pick<Employee, "id" | "name">;
  rejectionReason?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  year: number;
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  earned: { total: number; used: number; remaining: number };
  maternity: { total: number; used: number; remaining: number };
  paternity: { total: number; used: number; remaining: number };
  unpaid: { total: number; used: number; remaining: number };
  compensatory: { total: number; used: number; remaining: number };
}

export interface ApplyLeavePayload {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

// ── Payroll ───────────────────────────
export type PayrollStatus = "DRAFT" | "PROCESSED" | "PAID";

export interface Payroll {
  id: string;
  employeeId: string;
  employee: Pick<Employee, "id" | "name" | "designation" | "department" | "employeeId">;
  month: number;
  year: number;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transport: number;
  bonus: number;
  overtime: number;
  grossSalary: number;
  taxDeduction: number;
  providentFund: number;
  loanDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paidAt?: string;
  createdAt: string;
}

// ── Notification ──────────────────────
export type NotificationType =
  | "LEAVE_REQUEST"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "PAYSLIP_GENERATED"
  | "ANNOUNCEMENT"
  | "BIRTHDAY"
  | "SYSTEM";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ── Document ──────────────────────────
export type DocumentType = "CONTRACT" | "NDA" | "CERTIFICATE" | "ID_PROOF" | "PAYSLIP" | "OTHER";

export interface Document {
  id: string;
  employeeId: string;
  name: string;
  type: DocumentType;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

// ── Audit Log ─────────────────────────
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ── Dashboard ─────────────────────────
export interface DashboardStats {
  totalEmployees: number;
  totalEmployeesDelta: number;
  presentToday: number;
  attendanceRate: number;
  onLeave: number;
  onLeaveDelta: number;
  monthlyPayroll: number;
  payrollDelta: number;
  newHires: number;
  newHiresDelta: number;
  totalDepartments: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  avatar?: string;
  action: string;
  entity: string;
  time: string;
  type: "create" | "update" | "delete" | "approve" | "reject";
}

export interface BirthdayItem {
  employeeId: string;
  name: string;
  avatar?: string;
  department: string;
  date: string;
  daysUntil: number;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  day: string;
  type: "public" | "optional";
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  tag: string;
  postedAt: string;
  postedBy: string;
}

// ── API ───────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ── UI Helpers ────────────────────────
export type ThemeMode = "light" | "dark" | "system";

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
