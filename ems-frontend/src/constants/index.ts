export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "WorkSphere";
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const QUERY_STALE_TIME = 1000 * 60 * 5;   // 5 min
export const QUERY_GC_TIME    = 1000 * 60 * 10;  // 10 min

export const ACCESS_TOKEN_KEY  = "ems_access_token";
export const REFRESH_TOKEN_KEY = "ems_refresh_token";
export const USER_KEY          = "ems_user";

export const ROLES = {
  ADMIN:    "ADMIN",
  HR:       "HR",
  EMPLOYEE: "EMPLOYEE",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN:    "Administrator",
  HR:       "HR Manager",
  EMPLOYEE: "Employee",
};

export const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  ACTIVE:     "Active",
  ON_LEAVE:   "On Leave",
  INACTIVE:   "Inactive",
  TERMINATED: "Terminated",
};

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  PRESENT:  "Present",
  ABSENT:   "Absent",
  LATE:     "Late",
  HALF_DAY: "Half Day",
  HOLIDAY:  "Holiday",
  WEEKEND:  "Weekend",
};

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  CASUAL:        "Casual Leave",
  SICK:          "Sick Leave",
  EARNED:        "Earned Leave",
  MATERNITY:     "Maternity Leave",
  PATERNITY:     "Paternity Leave",
  UNPAID:        "Unpaid Leave",
  COMPENSATORY:  "Compensatory Leave",
};

export const LEAVE_STATUS_LABELS: Record<string, string> = {
  PENDING:   "Pending",
  APPROVED:  "Approved",
  REJECTED:  "Rejected",
  CANCELLED: "Cancelled",
};

export const PAYROLL_STATUS_LABELS: Record<string, string> = {
  DRAFT:     "Draft",
  PROCESSED: "Processed",
  PAID:      "Paid",
};

export const GENDER_OPTIONS = [
  { value: "MALE",   label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER",  label: "Other" },
];

export const BLOOD_GROUP_OPTIONS = [
  { value: "A+",  label: "A+" },
  { value: "A-",  label: "A-" },
  { value: "B+",  label: "B+" },
  { value: "B-",  label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+",  label: "O+" },
  { value: "O-",  label: "O-" },
];

export const LEAVE_TYPE_OPTIONS = [
  { value: "CASUAL",       label: "Casual Leave" },
  { value: "SICK",         label: "Sick Leave" },
  { value: "EARNED",       label: "Earned Leave" },
  { value: "MATERNITY",    label: "Maternity Leave" },
  { value: "PATERNITY",    label: "Paternity Leave" },
  { value: "UNPAID",       label: "Unpaid Leave" },
  { value: "COMPENSATORY", label: "Compensatory Leave" },
];

export const PAGINATION_LIMIT = 10;
export const PAGINATION_OPTIONS = [10, 20, 50, 100];

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
