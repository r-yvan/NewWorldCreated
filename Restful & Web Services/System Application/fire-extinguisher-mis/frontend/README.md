# FEMS Frontend

Production-grade React + TypeScript frontend for the **Fire Extinguisher Management System (FEMS)**. Fully integrated with the FEMS backend API, with a monochromatic enterprise design system, dark/light theme, role-based access control, and complete CRUD across every backend module.

## Tech stack

- **React 18 + TypeScript + Vite**
- **React Router v6** (with code-splitting / lazy routes)
- **Tailwind CSS** design system (shadcn/ui-style components, hand-built)
- **Framer Motion** for micro-interactions, page/modal/drawer transitions
- **Formik + Yup** for forms and validation (mirrors backend rules)
- **Recharts** for monochromatic analytics (area, bar, donut)
- **Axios** API client with interceptors + transparent token refresh
- **lucide-react** + **@tabler/icons-react** icons

## Getting started

```bash
cd frontend
bun install            # or npm install
cp .env.example .env   # optional – defaults to http://localhost:5000
bun run dev            # starts Vite on http://localhost:3000
```

> The dev server runs on **port 3000** to match the backend's `CORS_ORIGIN`.
> Ensure the backend is running on `http://localhost:5000` and the database is
> migrated + seeded.

### Demo accounts (from backend seed)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@fems.com` | `Admin@123` |
| Inspector | `inspector@fems.com` | `Inspector@123` |
| User | `user@fems.com` | `User@123` |

The login screen includes one-click demo sign-in buttons.

## Scripts

```bash
bun run dev       # dev server (port 3000)
bun run build     # typecheck + production build
bun run preview   # preview the production build
bun run lint      # tsc --noEmit
```

## Architecture (feature-based)

```
src/
├── app/              # (router lives in App.tsx at src root)
├── components/
│   ├── ui/           # primitives: button, card, input, table, dialog, dropdown,
│   │                 #   tabs, tooltip, badge, select, skeleton, pagination…
│   ├── common/       # PageHeader, StatCard, StatusBadge, ConfirmDialog, guards…
│   ├── charts/       # ChartCard + Recharts wrappers
│   ├── form/         # Formik field components
│   └── layout/       # Sidebar, Topbar, UserMenu, Breadcrumbs, AppLayout
├── constants/        # nav config + enum option/colour maps
├── contexts/         # Auth, Theme, Toast
├── features/         # auth, dashboard, extinguishers, inspections,
│                     #   maintenance, users, reports, profile, misc
├── hooks/            # useApi, useDebounce, useOptions
├── lib/              # axios client, storage, utils
├── providers/        # AppProviders (Router + Theme + Toast + Auth)
├── services/         # typed API service per backend module
└── types/            # API envelope + DTO interfaces (mirror backend)
```

## Backend ↔ frontend mapping

| Backend module | Endpoints | Frontend |
| --- | --- | --- |
| Auth | register, login, logout, refresh-token, forgot/reset-password, me | Login/Register/Forgot/Reset pages, `AuthContext`, axios refresh |
| Users | CRUD, profile, change-password | Users page (admin) + Profile page |
| Extinguishers | CRUD + pagination/search/filter/sort | Extinguishers page + form dialog |
| Inspections | CRUD | Inspections page + schedule/update dialog |
| Maintenance | CRUD | Maintenance page + log dialog |
| Reports | dashboard, extinguishers, inspection-status, expired, maintenance-history, export pdf/csv | Dashboard + Reports page (tabs, charts, exports) |

## Security & RBAC

- Tokens stored in `localStorage`; access token attached via request interceptor.
- Response interceptor performs a **single-flight refresh** on `401` and replays
  queued requests; on refresh failure the session is cleared and the user is
  redirected to login.
- Route guards (`ProtectedRoute`, `PublicOnlyRoute`) + `RoleGate` enforce the
  same RBAC as the backend (ADMIN / INSPECTOR / USER). Navigation items and
  action buttons are hidden for unauthorized roles.

## Design system

Strict monochromatic (black / white / gray) palette via CSS variables, with
semantic status colors (emerald / amber / red / blue) reserved for badges,
alerts and validation. Full dark + light themes, consistent spacing, radii,
typography (Inter), soft shadows, and subtle motion (150–300ms).
