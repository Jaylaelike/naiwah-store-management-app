# Project Context — store-app-antigrav

## Overview
- **Framework**: Next.js 16.1.1 (App Router) with React 19
- **UI Library**: shadcn/ui components (Radix primitives + Tailwind CSS v4)
- **Charts**: Recharts 3.6.0
- **State Management**: Zustand 5
- **Forms**: react-hook-form + zod validation
- **Styling**: Tailwind CSS v4, tw-animate-css, class-variance-authority
- **Icons**: lucide-react
- **Theming**: next-themes (dark/light/system), custom ThemeCustomizer

## Workspace Structure
```
store-app-antigrav/
├── app/                          # Root Next.js app (redirects to dashboard)
├── lib/                          # Shared utilities (fonts.ts, utils.ts)
├── pb_hooks/                     # PocketBase hooks (backend integration)
├── shadcn-dashboard-landing-template/
│   └── nextjs-version/           # ★ MAIN DASHBOARD APP
│       └── src/
│           ├── app/
│           │   ├── (auth)/       # Auth pages (sign-in, sign-up, forgot-password)
│           │   ├── (dashboard)/  # Dashboard route group
│           │   │   ├── dashboard/     # Main dashboard (cards + area chart + data table)
│           │   │   ├── dashboard-2/   # Business dashboard (metrics + charts + transactions)
│           │   │   ├── calendar/
│           │   │   ├── chat/
│           │   │   ├── mail/
│           │   │   ├── tasks/
│           │   │   ├── users/
│           │   │   ├── settings/
│           │   │   ├── faqs/
│           │   │   └── pricing/
│           │   └── landing/
│           ├── components/       # Shared components
│           │   ├── ui/           # shadcn/ui primitives (card, button, chart, table, tabs, etc.)
│           │   ├── app-sidebar.tsx   # ★ Sidebar navigation config
│           │   ├── nav-main.tsx
│           │   └── ...
│           ├── config/
│           ├── contexts/
│           ├── hooks/
│           └── lib/
```

## Key Patterns
1. **Dashboard Pages** live under `src/app/(dashboard)/` route group
2. **Sidebar Navigation** is configured in `app-sidebar.tsx` via `data.navGroups[]`
3. **Page Components** follow pattern: `page.tsx` imports from `./components/` and `./data/`
4. **Cards use** `<Card>` with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardFooter`
5. **Charts use** Recharts via shadcn `<ChartContainer>` wrapper
6. **Data Tables** use `@tanstack/react-table`
7. **Layout** wraps via `(dashboard)/layout.tsx` with `AppSidebar` + `SidebarInset`

## Backend Notes
- `pb_hooks/` suggests PocketBase as the backend/database (SQLite-based)
- No API routes currently exist in the nextjs-version
- Data is currently loaded from local JSON files

## Dependencies Available
- recharts (charts/graphs)
- @tanstack/react-table (data tables)
- date-fns (date formatting)
- zod (validation)
- zustand (state)
- sonner (toast notifications)
