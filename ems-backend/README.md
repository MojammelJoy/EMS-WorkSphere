# WorkSphere — EMS Backend API
### Production-ready Enterprise Employee Management System

Node.js + Express + TypeScript + PostgreSQL + Prisma + Redis + Socket.IO

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Fill in .env values

# 3. Generate Prisma client
npm run db:generate

# 4. Run migrations
npm run db:migrate

# 5. Seed database (demo users)
npm run db:seed

# 6. Start dev server
npm run dev
```

API runs on **http://localhost:5000**

---

## 👤 Demo Credentials

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@company.com    | password123 |
| HR       | hr@company.com       | password123 |
| Employee | emp@company.com      | password123 |

---

## 📁 Architecture — Feature-Based + Clean Architecture

```
src/
├── app.ts              # Express app (middleware, routes)
├── server.ts           # HTTP server + Socket.IO + graceful shutdown
├── config/             # Environment config
├── constants/          # App-wide constants
├── types/              # Global TypeScript types
├── lib/                # Prisma, Redis, Cloudinary, Resend, Seed
├── utils/              # logger, apiError, asyncHandler, jwt, helpers, pagination
├── validators/         # All Zod schemas
├── middleware/         # auth, validate, error, upload, auditLog
├── services/           # notification.service (shared)
├── sockets/            # Socket.IO initialization + handlers
├── jobs/               # Inngest background jobs
├── routes/             # Central route registry
└── modules/
    ├── auth/           # Login, Logout, Refresh, ForgotPw, ResetPw
    ├── employees/      # CRUD + Avatar upload + Leave balance
    ├── departments/    # CRUD + caching
    ├── attendance/     # Clock In/Out + Monthly summary
    ├── leave/          # Apply, Approve, Reject, Balance
    ├── payroll/        # Process, Payslip, Mark paid
    ├── notifications/  # Real-time via Socket.IO
    ├── documents/      # Upload/Delete via Cloudinary
    ├── auditLogs/      # System activity log
    └── reports/        # Dashboard stats + Reports
```

---

## 🔗 API Endpoints

### Auth
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
PUT    /api/auth/change-password
GET    /api/auth/me
```

### Employees
```
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
POST   /api/employees/:id/avatar
```

### Departments
```
GET    /api/departments
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id
```

### Attendance
```
POST   /api/attendance/clock-in
POST   /api/attendance/clock-out
GET    /api/attendance/today
GET    /api/attendance
GET    /api/attendance/monthly/:employeeId
GET    /api/attendance/summary/:employeeId
```

### Leave
```
GET    /api/leave
POST   /api/leave
PATCH  /api/leave/:id/approve
PATCH  /api/leave/:id/reject
PATCH  /api/leave/:id/cancel
GET    /api/leave/balance/:employeeId
```

### Payroll
```
GET    /api/payroll
POST   /api/payroll/process
GET    /api/payroll/my
PATCH  /api/payroll/:id/paid
```

### Notifications
```
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
```

### Documents
```
GET    /api/documents/:employeeId
POST   /api/documents/:employeeId
DELETE /api/documents/:id
```

### Reports / Dashboard
```
GET    /api/dashboard/stats
GET    /api/reports/attendance?month=&year=
GET    /api/reports/payroll?month=&year=
GET    /api/reports/leave?year=
```

### Audit Logs
```
GET    /api/audit-logs
```

---

## 🔐 Auth Flow

```
POST /api/auth/login
  → Returns: { accessToken, user }
  → Sets httpOnly cookie: refreshToken

POST /api/auth/refresh
  → Reads refreshToken from cookie
  → Returns: { accessToken }

Authorization: Bearer <accessToken>   ← every protected request
```

---

## 🔴 Real-time (Socket.IO)

```js
// Client connection
const socket = io("http://localhost:5000", {
  auth: { token: accessToken }
});

// Listen for notifications
socket.on("notification:new", (notification) => {
  // show toast / update badge
});

// Mark as read
socket.emit("notification:read", notificationId);
```

---

## ⚙️ Background Jobs (Inngest)

| Job | Schedule | Description |
|---|---|---|
| Monthly Payroll | 1st of month 9AM | Auto-generates payroll for all active employees |
| Daily Attendance | Mon–Fri 8PM | Sends daily summary to admins |
| Birthday Notifications | Every day 8AM | Notifies all staff of birthdays |

---

## 🛡️ Security

- **Helmet** — HTTP security headers
- **CORS** — Origin whitelist
- **Rate Limiting** — 20/15min on auth, 300/15min on API
- **bcrypt** — Password hashing (rounds: 12)
- **httpOnly cookie** — Refresh token stored securely
- **Zod** — All request validation
- **express-mongo-sanitize** — NoSQL injection prevention

---

## 🛠 External Services

| Service | Purpose | Env Variable |
|---|---|---|
| **PostgreSQL** | Primary database | DATABASE_URL |
| **Redis** | Caching + sessions | REDIS_URL |
| **Cloudinary** | File/image storage | CLOUDINARY_* |
| **Resend** | Transactional email | RESEND_API_KEY |
| **Inngest** | Background jobs | INNGEST_* |

---

## 🔜 Next: Connect to Frontend

Update `ems-frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Remove the auth bypass in `src/routes/index.tsx` and the real login will work end-to-end.
