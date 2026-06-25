export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

export const ROLES = {
  ADMIN: "ADMIN",
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
} as const;

export const JWT = {
  ACCESS_EXPIRES_IN: "15m",
  REFRESH_EXPIRES_IN: "7d",
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 60 * 5,
  LONG: 60 * 60,
  DAY: 60 * 60 * 24,
} as const;

export const CACHE_KEYS = {
  EMPLOYEES: "employees",
  EMPLOYEE: (id: string) => `employee:${id}`,
  DEPARTMENTS: "departments",
  DEPARTMENT: (id: string) => `department:${id}`,
  LEAVE_BALANCE: (id: string) => `leave_balance:${id}`,
  DASHBOARD_STATS: "dashboard:stats",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const CLOUDINARY = {
  AVATAR_FOLDER: "ems/avatars",
  DOCUMENTS_FOLDER: "ems/documents",
} as const;

export const LEAVE_DEFAULTS = {
  casual:       12,
  sick:         14,
  earned:       20,
  maternity:    90,
  paternity:    10,
  unpaid:       999,
  compensatory: 0,
} as const;

export const ATTENDANCE = {
  STANDARD_HOURS: 8,
  LATE_THRESHOLD_MINUTES: 15,
  HALF_DAY_HOURS: 4,
} as const;
