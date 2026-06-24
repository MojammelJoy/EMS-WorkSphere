# Nexus HR — EMS Frontend
### Production-ready Enterprise Employee Management System

Built with React 19 · TypeScript · Vite · Tailwind CSS · Shadcn/UI · TanStack Query

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server
npm run dev
```

Open **http://localhost:5173**

Demo credentials are shown on the login page.

---

## 📁 Architecture — Feature-Based

```
src/
├── app/              # Entry: App.tsx, providers, query client
├── components/       # Shared, reusable components
│   ├── ui/           # Primitive UI (Button, Input, Card, Badge…)
│   ├── layouts/      # Sidebar, Topbar, AppLayout
│   ├── shared/       # StatCard, PageHeader, DataTable, Pagination…
│   ├── charts/       # Recharts wrappers
│   ├── feedback/     # PageLoader, EmptyState, ErrorBoundary
│   └── forms/        # Form field wrappers
├── features/         # Feature modules (self-contained)
│   ├── auth/         # Login, ForgotPassword, ResetPassword
│   ├── dashboard/    # Executive dashboard
│   ├── employees/    # List, Profile, Add/Edit
│   ├── attendance/   # Daily table, Clock In/Out
│   ├── leave/        # Requests, Balance, Apply
│   ├── payroll/      # Table, Payslip viewer
│   ├── departments/  # Dept cards
│   ├── notifications/# Notification list
│   ├── reports/      # Report cards + charts
│   └── settings/     # Profile, Theme, Notifications, Security
├── hooks/            # Shared custom hooks (TanStack Query + UI)
├── services/         # API service layer (all axios calls)
├── routes/           # React Router v7 routes + guards
├── store/            # Zustand stores (auth, ui)
├── providers/        # Theme provider
├── types/            # Global TypeScript types
├── constants/        # App-wide constants
├── lib/              # axios instance, utils
└── styles/           # globals.css (Tailwind + Shadcn tokens)
```

---

## 🧱 Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.7 | Type safety |
| Vite | 6 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| Shadcn/UI | — | Component library |
| TanStack Query | 5 | Server state |
| React Router DOM | 7 | Routing |
| React Hook Form | 7 | Forms |
| Zod | 3 | Validation |
| Zustand | 5 | UI state |
| Axios | 1.7 | HTTP client |
| Recharts | 2 | Charts |
| Sonner | 1.7 | Toasts |
| date-fns | 4 | Date formatting |

---

## 🔐 Auth Flow

```
User logs in
  → POST /api/auth/login
  → JWT stored in Zustand (persisted to localStorage)
  → Axios interceptor: Authorization: Bearer <token>
  → 401 response: auto refresh → logout + redirect /login
```

**Role-based routes:**
- `ADMIN` → All routes
- `HR` → Employees, Attendance, Leave, Reports
- `EMPLOYEE` → Own Dashboard, Attendance, Leave

---

## 🎨 Design System

**Colors:**
- Primary: Indigo `#4f46e5`
- Success: Emerald `#10b981`
- Warning: Amber `#f59e0b`
- Destructive: Red `#ef4444`
- Sidebar: Dark navy (independent from main theme)

**Typography:** Inter (300–800)

**Components:** Rounded-xl cards, soft shadows, smooth transitions

---

## 📦 Adding More Shadcn Components

```bash
npx shadcn@latest add accordion
npx shadcn@latest add calendar
npx shadcn@latest add command
npx shadcn@latest add date-picker
npx shadcn@latest add table
```

---

## ⚡ Features Implemented

- [x] Login / Forgot Password / Reset Password
- [x] JWT auth + refresh token + persist
- [x] Role-based route guards (Admin / HR / Employee)
- [x] Collapsible sidebar with active states
- [x] Sticky topbar with notifications + profile dropdown
- [x] Dark / Light / System theme toggle
- [x] Executive Dashboard (6 stat cards, 4 charts, activities, birthdays, holidays, announcements)
- [x] Employee List (search, sort, pagination, status badges, actions)
- [x] Employee Profile (tabs: personal, employment, documents)
- [x] Add/Edit Employee (multi-section form with validation)
- [x] Attendance (Clock In/Out, daily table, stats)
- [x] Leave Management (apply form, approval workflow, balance, timeline)
- [x] Payroll (table, payslip viewer modal)
- [x] Departments (card grid)
- [x] Notifications (type icons, read/unread)
- [x] Reports (export cards + charts)
- [x] Settings (profile, theme, notifications, security)
- [x] Skeleton loaders, empty states, error boundary
- [x] Lazy loading + code splitting by route

---

## 🔜 Next Step: Backend

```
Node.js + Express + TypeScript
PostgreSQL + Prisma ORM
JWT + RBAC middleware
Cloudinary (file uploads)
Resend (email)
Socket.IO (real-time notifications)
Inngest (background jobs)
```
