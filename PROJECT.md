# Padhai Karo - Complete Project Documentation

## Vision

A study accountability mobile app where students create weekly plans, track focus sessions with real-time distraction detection, and have partners who can view their progress. Android-first, mock-mode enabled for Expo Go development.

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│                 React Native                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Zustand  │  │ React    │  │  SQLite   │ │
│  │ Stores   │  │ Query    │  │  (local)  │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│        │              │              │       │
│  ┌──────────────────────────────────────────┐│
│  │           Feature Modules               ││
│  │  auth · focus · planner · progress      ││
│  │  partner · settings                     ││
│  └──────────────────────────────────────────┘│
│        │                                     │
│  ┌──────────────────────────────────────────┐│
│  │        SQLite Database Layer            ││
│  │  8 tables · 5 repositories             ││
│  └──────────────────────────────────────────┘│
└──────────────────────────────────────────────┘
         ↕ HTTP/REST
┌──────────────────────────────────────────────┐
│              Express Backend                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │   JWT    │  │ Mongoose │  │  MongoDB  │ │
│  │   Auth   │  │  Models  │  │           │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│  7 route groups · 5 models · role middleware │
└──────────────────────────────────────────────┘
```

## Implementation Milestones

### Milestone 1: App Shell & Design System ✅ COMPLETE

| Task                                                                                                            | Status |
| --------------------------------------------------------------------------------------------------------------- | ------ |
| Install dependencies (zustand, react-query, expo-sqlite, date-fns, lucide, haptics, nativewind)                 | ✅     |
| Set up NativeWind/Tailwind CSS v4 (postcss, metro.config, global.css)                                           | ✅     |
| Create design system (theme.ts: colors, spacing, typography, radius, shadows)                                   | ✅     |
| Build UI primitives (Button, Card, Input, Badge, ProgressRing, TimerDisplay, Skeleton, EmptyState, SubjectChip) | ✅     |
| Set up navigation structure (tabs + stacks + modals)                                                            | ✅     |
| Build Home/Dashboard screen                                                                                     | ✅     |
| Build Weekly Planner screen                                                                                     | ✅     |
| Build Focus Session screen (timer, progress ring, interruption state)                                           | ✅     |
| Build Progress/Stats screen (daily/weekly charts, streak)                                                       | ✅     |
| Build Partner screen                                                                                            | ✅     |
| Build Settings screen                                                                                           | ✅     |
| Build Auth screens (login, register, onboarding)                                                                | ✅     |
| Add animations (screen transitions, pulse, press feedback)                                                      | ✅     |
| Add empty states and loading skeletons                                                                          | ✅     |

### Milestone 2: Local Persistence & Timer Logic ✅ COMPLETE

| Task                                                                                  | Status |
| ------------------------------------------------------------------------------------- | ------ |
| Set up expo-sqlite with schema + migrations                                           | ✅     |
| Create 8 SQLite tables (users, plans, tasks, sessions, events, profiles, sync, prefs) | ✅     |
| Build 5 repository layers (tasks, sessions, plans, sync-queue, settings)              | ✅     |
| Timestamp-based timer (Date.now() - actualStart)                                      | ✅     |
| Mock mode system (simulate start, interruption, resume, complete)                     | ✅     |
| Sync queue with outbox pattern                                                        | ✅     |
| Task state machine (planned → available → active → completed/missed)                  | ✅     |

### Milestone 3: Backend & Authentication ✅ COMPLETE

| Task                                                 | Status |
| ---------------------------------------------------- | ------ |
| Express server with TypeScript                       | ✅     |
| MongoDB connection (Mongoose)                        | ✅     |
| User model + JWT auth (register, login, me)          | ✅     |
| Role-based middleware (student/partner)              | ✅     |
| WeeklyPlan + StudyTask CRUD                          | ✅     |
| FocusSession + FocusEvent endpoints                  | ✅     |
| Partner connection system (invite code)              | ✅     |
| Progress/analytics endpoints (daily, weekly, streak) | ✅     |
| Sync endpoints (push/pull)                           | ✅     |
| React Query hooks for all API modules                | ✅     |

### Milestone 4: Native Focus Engine 🟡 IMPLEMENTED — DEV BUILD REQUIRED

Requires Expo dev build (not Expo Go).

| Task                                                 | Status                                                   |
| ---------------------------------------------------- | -------------------------------------------------------- |
| Create Expo development build                        | 🟡 EAS profile configured; local Android SDK unavailable |
| Android Usage Access permission flow                 | ✅                                                       |
| Foreground service for focus monitoring              | ✅                                                       |
| Foreground app detection (UsageStatsManager)         | ✅                                                       |
| Connect native events to React Native (EventEmitter) | ✅                                                       |
| Permission onboarding flow                           | ✅                                                       |
| Diagnostic screen (permissions, service status)      | ✅                                                       |
| Graceful failure handling                            | ✅ Expo Go fallback                                      |

### Milestone 5: Offline Sync Hardening 🟡 IMPLEMENTED — CONFLICT UI REMAINS

| Task                                       | Status                             |
| ------------------------------------------ | ---------------------------------- |
| Conflict resolution with merge dialog      | ⬜                                 |
| Exponential backoff for retries            | ✅                                 |
| Sync status indicators in UI               | 🟡 Dev status only                 |
| Test with airplane mode, network switching | 🟡 Runtime test required           |
| Data consistency checks                    | ✅ Server ownership and pull merge |

### Milestone 6: Partner & Accountability 🟡 IN PROGRESS

| Task                                       | Status                        |
| ------------------------------------------ | ----------------------------- |
| Encouragement messages (partner → student) | ✅ Persisted backend messages |
| Real-time partner notifications            | ⬜                            |
| Privacy settings per field                 | ⬜                            |
| Partner-specific analytics                 | ⬜                            |

### Milestone 7: Polish & Production 🟡 IN PROGRESS

| Task                                          | Status                                                  |
| --------------------------------------------- | ------------------------------------------------------- |
| Push notifications (expo-notifications)       | ✅ Local/system notifications                           |
| List virtualization (FlatList for long lists) | ⬜                                                      |
| Memoization (React.memo, useMemo)             | ⬜                                                      |
| Error boundaries                              | ⬜                                                      |
| Accessibility audit                           | ⬜                                                      |
| App icons and splash screen branding          | ⬜                                                      |
| Comprehensive testing                         | ⬜                                                      |
| Android build + deployment                    | 🟡 Prebuild and bundle pass; local SDK required for APK |

---

## File Inventory

### Frontend — 91 files

**Screens (18 files):**

- `src/app/_layout.tsx` — Root layout with providers
- `src/app/index.tsx` — Entry redirect
- `src/app/(auth)/index.tsx` — Role selection
- `src/app/(auth)/_layout.tsx` — Auth stack
- `src/app/(auth)/onboarding.tsx` — Walkthrough
- `src/app/(auth)/student/login.tsx` — Student login
- `src/app/(auth)/student/register.tsx` — Student register
- `src/app/(auth)/partner/login.tsx` — Partner login
- `src/app/(auth)/partner/register.tsx` — Partner register
- `src/app/(app)/_layout.tsx` — App stack with modals
- `src/app/(app)/(tabs)/_layout.tsx` — Tab navigator (role-aware)
- `src/app/(app)/(tabs)/home/index.tsx` — Dashboard
- `src/app/(app)/(tabs)/planner/index.tsx` — Weekly planner
- `src/app/(app)/(tabs)/focus/index.tsx` — Focus session
- `src/app/(app)/(tabs)/progress/index.tsx` — Analytics
- `src/app/(app)/(tabs)/partner/index.tsx` — Partner read-only view
- `src/app/(app)/settings/index.tsx` — Settings main
- `src/app/(app)/settings/distractions.tsx` — Distraction apps config
- `src/app/(app)/settings/permissions.tsx` — Notification permissions
- `src/app/(app)/settings/profile.tsx` — Edit profile
- `src/app/(app)/task/[id].tsx` — Task detail
- `src/app/(app)/task-create.tsx` — Create task modal
- `src/app/(app)/focus-result.tsx` — Session result
- `src/app/(app)/partner-connect.tsx` — Partner invite/connect
- `src/app/notifications/index.tsx` — Notifications list

**Components (19 files):**

- `src/components/ui/button.tsx` — Button with haptics
- `src/components/ui/card.tsx` — Card variants
- `src/components/ui/input.tsx` — Text input
- `src/components/ui/badge.tsx` — Status badges
- `src/components/ui/avatar.tsx` — Initial-based avatar
- `src/components/ui/modal.tsx` — Bottom sheet modal
- `src/components/ui/bottom-sheet.tsx` — Overlay sheet
- `src/components/ui/progress-ring.tsx` — SVG circular progress
- `src/components/ui/timer-display.tsx` — Timer format
- `src/components/ui/skeleton.tsx` — Shimmer loading
- `src/components/ui/empty-state.tsx` — Empty state placeholder
- `src/components/ui/subject-chip.tsx` — Subject tag
- `src/components/ui/animated.tsx` — AnimatedPressable, AnimatedEntrance
- `src/components/layout/screen-container.tsx` — Safe area wrapper
- `src/components/features/task-card.tsx` — Task with subject/time
- `src/components/features/week-calendar.tsx` — Day picker
- `src/components/features/day-schedule.tsx` — Timeline view
- `src/components/features/stats-card.tsx` — Stats display
- `src/components/features/partner-summary.tsx` — Partner progress card
- `src/components/features/interruption-banner.tsx` — Warning banner
- `src/components/focus/interruption-countdown.tsx` — Countdown timer
- `src/components/notifications/notification-center.tsx` — Notification list
- `src/components/dev/mock-controls.tsx` — Mock mode controls
- `src/components/dev/dev-tools.tsx` — Status bar

**Feature Modules (15 files):**

- `src/features/auth/store.ts` — Auth state + role
- `src/features/auth/api.ts` — Auth API
- `src/features/auth/hooks.ts` — useLogin, useRegister
- `src/features/focus/store.ts` — Session state machine
- `src/features/focus/api.ts` — Focus API
- `src/features/focus/hooks.ts` — Timer hook
- `src/features/focus/hooks-api.ts` — React Query hooks
- `src/features/planner/store.ts` — Plan state
- `src/features/planner/api.ts` — Plan + Task API
- `src/features/planner/hooks.ts` — usePlans, useTasks
- `src/features/progress/api.ts` — Progress API
- `src/features/progress/hooks.ts` — useDailyProgress, useStreak
- `src/features/partner/api.ts` — Partner API
- `src/features/partner/hooks.ts` — usePartnerProgress
- `src/features/settings/store.ts` — Settings state
- `src/features/settings/hooks.ts` — useSettings, useDistractionApps

**Services (4 files):**

- `src/services/api-client.ts` — HTTP client
- `src/services/session-lifecycle.ts` — Mock session flow
- `src/services/notifications.ts` — In-app notifications
- `src/services/sync.ts` — Sync queue processor

**Database (6 files):**

- `src/database/client.ts` — SQLite schema + migrations
- `src/database/repositories/tasks.ts` — Task CRUD
- `src/database/repositories/sessions.ts` — Session CRUD
- `src/database/repositories/plans.ts` — Plan CRUD
- `src/database/repositories/sync-queue.ts` — Sync queue ops
- `src/database/repositories/settings.ts` — Key-value prefs

**Other (14 files):**

- `src/hooks/use-color-scheme.ts`, `use-theme.ts`, `use-online-status.ts`, `use-time-interval.ts`
- `src/lib/cn.ts`, `date.ts`, `format.ts`, `haptics.ts`, `ids.ts`
- `src/types/models.ts`
- `src/constants/theme.ts`, `config.ts`, `defaults.ts`
- `src/providers/query-provider.tsx`
- `src/global.css`, `src/css.d.ts`

### Backend — 15 files

- `backend/src/index.ts` — Express server
- `backend/src/config/db.ts` — MongoDB connection
- `backend/src/middleware/auth.ts` — JWT + role middleware
- `backend/src/models/User.ts` — User schema
- `backend/src/models/WeeklyPlan.ts` — Plan schema
- `backend/src/models/StudyTask.ts` — Task schema
- `backend/src/models/FocusSession.ts` — Session schema
- `backend/src/models/FocusEvent.ts` — Event schema
- `backend/src/routes/auth.ts` — Register, login, me
- `backend/src/routes/plans.ts` — Plan CRUD + lock
- `backend/src/routes/tasks.ts` — Task CRUD
- `backend/src/routes/sessions.ts` — Session CRUD + events
- `backend/src/routes/partner.ts` — Invite, connect, progress
- `backend/src/routes/progress.ts` — Daily, weekly, streak
- `backend/src/routes/sync.ts` — Push/pull

### Config Files (10)

- `app.json` — Expo config
- `package.json` — Dependencies
- `tsconfig.json` — TypeScript strict + @/\* alias
- `metro.config.js` — NativeWind wrapper
- `postcss.config.mjs` — Tailwind CSS v4
- `nativewind-env.d.ts` — CSS types
- `backend/package.json` — Backend dependencies
- `backend/tsconfig.json` — Backend TypeScript
- `backend/.env.example` — Environment template

---

## API Endpoints

### Auth

| Method | Endpoint             | Auth | Role | Body                                     |
| ------ | -------------------- | ---- | ---- | ---------------------------------------- |
| POST   | `/api/auth/register` | No   | —    | name, email, password, role, inviteCode? |
| POST   | `/api/auth/login`    | No   | —    | email, password                          |
| GET    | `/api/auth/me`       | Yes  | any  | —                                        |

### Plans

| Method | Endpoint              | Auth | Role    | Body                        |
| ------ | --------------------- | ---- | ------- | --------------------------- |
| GET    | `/api/plans?week=`    | Yes  | student | —                           |
| GET    | `/api/plans/:id`      | Yes  | any     | —                           |
| POST   | `/api/plans`          | Yes  | student | weekStart, weekEnd, tasks[] |
| POST   | `/api/plans/:id/lock` | Yes  | student | —                           |
| PUT    | `/api/plans/:id`      | Yes  | student | fields                      |

### Tasks

| Method | Endpoint                   | Auth | Role    | Body                            |
| ------ | -------------------------- | ---- | ------- | ------------------------------- |
| GET    | `/api/tasks?date=&planId=` | Yes  | any     | —                               |
| GET    | `/api/tasks/:id`           | Yes  | any     | —                               |
| POST   | `/api/tasks`               | Yes  | student | title, subject, date, time, etc |
| PUT    | `/api/tasks/:id`           | Yes  | student | fields                          |
| DELETE | `/api/tasks/:id`           | Yes  | student | —                               |

### Sessions

| Method | Endpoint                     | Auth | Role    | Body                     |
| ------ | ---------------------------- | ---- | ------- | ------------------------ |
| GET    | `/api/sessions?limit=`       | Yes  | any     | —                        |
| GET    | `/api/sessions/active`       | Yes  | any     | —                        |
| POST   | `/api/sessions`              | Yes  | student | taskId, plannedStart/End |
| PUT    | `/api/sessions/:id`          | Yes  | student | status, fields           |
| PUT    | `/api/sessions/:id/complete` | Yes  | student | completionPercentage     |
| POST   | `/api/sessions/:id/events`   | Yes  | any     | eventType, timestamp     |
| GET    | `/api/sessions/:id/events`   | Yes  | any     | —                        |

### Partner

| Method | Endpoint                   | Auth | Role    | Body |
| ------ | -------------------------- | ---- | ------- | ---- |
| POST   | `/api/partner/invite`      | Yes  | any     | —    |
| POST   | `/api/partner/connect`     | Yes  | partner | code |
| GET    | `/api/partner/progress`    | Yes  | partner | —    |
| GET    | `/api/partner/sessions`    | Yes  | partner | —    |
| GET    | `/api/partner/tasks?date=` | Yes  | partner | —    |

### Progress

| Method | Endpoint                     | Auth | Role | Body |
| ------ | ---------------------------- | ---- | ---- | ---- |
| GET    | `/api/progress/daily?date=`  | Yes  | any  | —    |
| GET    | `/api/progress/weekly?week=` | Yes  | any  | —    |
| GET    | `/api/progress/streak`       | Yes  | any  | —    |

### Sync

| Method | Endpoint         | Auth | Role | Body       |
| ------ | ---------------- | ---- | ---- | ---------- |
| POST   | `/api/sync/push` | Yes  | any  | items[]    |
| POST   | `/api/sync/pull` | Yes  | any  | lastSyncAt |

---

## Session State Machine

```
                    ┌──────────┐
                    │   IDLE   │
                    └────┬─────┘
                         │ startSession()
                         ▼
                    ┌──────────┐
              ┌─────│  ACTIVE  │─────┐
              │     └────┬─────┘     │
              │          │           │
    pauseSession()  interruptSession()  completeSession()
              │          │           │
              ▼          ▼           ▼
         ┌────────┐ ┌──────────┐ ┌───────────┐
         │ PAUSED │ │INTERRUPTED│ │ COMPLETED │
         └────┬───┘ └────┬─────┘ └───────────┘
              │          │
   resumeSession()  resumeFromInterruption()
              │          │
              └────┬─────┘
                   ▼
              ┌──────────┐
              │  ACTIVE  │
              └──────────┘
```

## Timer Architecture

```
actualStart = Date.now()          // When session begins
focusedMs = totalFocusedMs +      // Accumulated focused time
  (status === 'active' ? Date.now() - lastResumeTimestamp : 0)
interruptedMs = totalInterruptedMs + // Accumulated interrupted time
  (status === 'interrupted' ? Date.now() - lastInterruptTimestamp : 0)
elapsed = focusedMs + interruptedMs
completion = (focusedMs / targetMs) * 100
```
