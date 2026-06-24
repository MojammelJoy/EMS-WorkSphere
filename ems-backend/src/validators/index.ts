import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────
export const loginSchema = z.object({
  body: z.object({
    email:    z.string().email("Invalid email"),
    password: z.string().min(6, "Password min 6 chars"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email() }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token:           z.string().min(1),
    password:        z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword:     z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string(),
  }).refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

// ── Department ────────────────────────────────────────────────────
export const createDepartmentSchema = z.object({
  body: z.object({
    name:        z.string().min(2, "Name required"),
    code:        z.string().min(2).max(10).toUpperCase(),
    description: z.string().optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name:        z.string().min(2).optional(),
    description: z.string().optional(),
  }),
  params: z.object({ id: z.string().cuid() }),
});

// ── Employee ──────────────────────────────────────────────────────
const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
const employmentTypeEnum = z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]);

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName:      z.string().min(2, "First name required"),
    lastName:       z.string().min(2, "Last name required"),
    email:          z.string().email("Invalid email"),
    phone:          z.string().optional(),
    gender:         genderEnum,
    dateOfBirth:    z.string().datetime().optional(),
    address:        z.string().optional(),
    nid:            z.string().optional(),
    bloodGroup:     z.string().optional(),
    designation:    z.string().min(2, "Designation required"),
    departmentId:   z.string().cuid("Invalid department"),
    managerId:      z.string().cuid().optional(),
    joiningDate:    z.string().datetime(),
    employmentType: employmentTypeEnum.optional(),
    salary:         z.number().positive("Salary must be positive"),
    emergencyContact: z.object({
      name:     z.string().min(2),
      relation: z.string().min(2),
      phone:    z.string().min(10),
    }).optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    firstName:      z.string().min(2).optional(),
    lastName:       z.string().min(2).optional(),
    phone:          z.string().optional(),
    gender:         genderEnum.optional(),
    dateOfBirth:    z.string().datetime().optional(),
    address:        z.string().optional(),
    nid:            z.string().optional(),
    bloodGroup:     z.string().optional(),
    designation:    z.string().min(2).optional(),
    departmentId:   z.string().cuid().optional(),
    managerId:      z.string().cuid().optional(),
    employmentType: employmentTypeEnum.optional(),
    salary:         z.number().positive().optional(),
    status:         z.enum(["ACTIVE","ON_LEAVE","INACTIVE","TERMINATED"]).optional(),
  }),
  params: z.object({ id: z.string() }),
});

// ── Attendance ────────────────────────────────────────────────────
export const clockInSchema = z.object({
  body: z.object({
    note:     z.string().optional(),
    location: z.string().optional(),
  }),
});

export const clockOutSchema = z.object({
  body: z.object({ note: z.string().optional() }),
});

// ── Leave ─────────────────────────────────────────────────────────
export const applyLeaveSchema = z.object({
  body: z.object({
    leaveType: z.enum(["CASUAL","SICK","EARNED","MATERNITY","PATERNITY","UNPAID","COMPENSATORY"]),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
    endDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
    reason:    z.string().min(10, "Reason min 10 characters"),
  }),
});

export const rejectLeaveSchema = z.object({
  body:   z.object({ reason: z.string().min(5, "Provide rejection reason") }),
  params: z.object({ id: z.string() }),
});

// ── Payroll ───────────────────────────────────────────────────────
export const processPayrollSchema = z.object({
  body: z.object({
    month: z.number().int().min(1).max(12),
    year:  z.number().int().min(2020),
  }),
});

// ── Pagination Query ──────────────────────────────────────────────
export const paginationSchema = z.object({
  query: z.object({
    page:      z.string().regex(/^\d+$/).optional(),
    limit:     z.string().regex(/^\d+$/).optional(),
    search:    z.string().optional(),
    sortBy:    z.string().optional(),
    sortOrder: z.enum(["asc","desc"]).optional(),
  }),
});
