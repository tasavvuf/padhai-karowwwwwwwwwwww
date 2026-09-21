# Padhai Karo - AI Agent Guide

## Project Overview

**Padhai Karo** is a study accountability mobile app built with Expo SDK 57 + React Native + TypeScript. Two roles: **Student** (creates plans, starts focus sessions) and **Partner** (read-only view of student's progress).

## Critical Rules

1. **Read Expo v57 docs** at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
2. **Timer must be timestamp-based** (`Date.now()`), never JS `setInterval` for source of truth.
3. **Mock mode is first-class** — simulate focus sessions, interruptions, app switching in Expo Go.
4. **Focus monitoring** (Usage Access, foreground service) requires Expo dev build — Phase B.
5. **Use `src/` directory** with `@/*` path alias configured in tsconfig.
6. **TypeScript strict mode** — all code must pass `npx tsc --noEmit`.
7. **No comments** in code unless explicitly asked.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 57, React Native 0.86.3, React 19.2.3 |
| Language | TypeScript 6.0.3 (strict) |
| Navigation | expo-router (file-based) |
| State | Zustand (global) + @tanstack/react-query (server state) |
| Styling | NativeWind v5 + Tailwind CSS v4 (CSS-first) |
| Animations | react-native-reanimated 4.5.1 |
| Local DB | expo-sqlite (WAL mode) |
| Icons | lucide-react-native |
| Backend | Express + MongoDB (Mongoose) + JWT auth |

## Project Structure

```
padhaikarowwww/
├── src/
│   ├── app/                    # Expo Router pages
│   │   ├── _layout.tsx         # Root: providers + splash
│   │   ├── index.tsx           # Entry redirect → auth
│   │   ├── (auth)/             # Auth flow
│   │   │   ├── _layout.tsx     # Auth stack
│   │   │   ├── index.tsx       # Role selection (Student/Partner)
│   │   │   ├── onboarding.tsx  # App intro walkthrough
│   │   │   ├── student/        # Student auth
│   │   │   │   ├── login.tsx
│   │   │   │   └── register.tsx
│   │   │   └── partner/        # Partner auth
│   │   │       ├── login.tsx
│   │   │       └── register.tsx
│   │   ├── (app)/              # Main app (authenticated)
│   │   │   ├── _layout.tsx     # App stack with modals
│   │   │   ├── (tabs)/         # Bottom tab navigator
│   │   │   │   ├── _layout.tsx # Tab bar (role-aware)
│   │   │   │   ├── home/       # Dashboard
│   │   │   │   ├── planner/    # Weekly planner (student only)
│   │   │   │   ├── focus/      # Focus session (student only)
│   │   │   │   ├── progress/   # Analytics
│   │   │   │   └── partner/    # Partner/student view
│   │   │   ├── task/[id].tsx   # Task detail
│   │   │   ├── task-create.tsx # Create task modal
│   │   │   ├── focus-result.tsx# Session result
│   │   │   ├── partner-connect.tsx
│   │   │   └── settings/       # Settings
│   │   │       ├── index.tsx
│   │   │       ├── distractions.tsx
│   │   │       ├── permissions.tsx
│   │   │       └── profile.tsx
│   │   └── notifications/index.tsx
│   ├── components/
│   │   ├── ui/                 # Primitive UI components
│   │   ├── features/           # Feature-specific components
│   │   ├── focus/              # Focus session components
│   │   ├── layout/             # Layout wrappers
│   │   ├── notifications/      # Notification center
│   │   └── dev/                # Dev-only (mock controls, devtools)
│   ├── features/               # Feature modules
│   │   ├── auth/               # Store, API, hooks
│   │   ├── focus/              # Store, API, hooks
│   │   ├── planner/            # Store, API, hooks
│   │   ├── progress/           # API, hooks
│   │   ├── partner/            # API, hooks
│   │   └── settings/           # Store, hooks
│   ├── services/               # Cross-cutting services
│   ├── database/               # SQLite layer
│   ├── hooks/                  # Shared hooks
│   ├── lib/                    # Utilities
│   ├── providers/              # React Query, theme
│   ├── types/                  # TypeScript types
│   └── constants/              # Theme, config, defaults
├── backend/
│   └── src/
│       ├── index.ts            # Express server entry
│       ├── config/db.ts        # MongoDB connection
│       ├── middleware/auth.ts  # JWT + role middleware
│       ├── models/             # Mongoose schemas
│       └── routes/             # API routes
└── [config files]
```

## Design Tokens

```
Primary:     #1E3A5F  (deep navy)
Accent:      #D4A574  (warm amber)
Success:     #4A7C59  (sage green)
Warning:     #C4956A  (muted amber)
Danger:      #8B4049  (muted red)
Background:  #F8F6F3  (warm white)
Surface:     #F0EDE8  (cards)
Text:        #1A1A1A  (near black)
```

## Role-Based Access

**Student** sees: Home (full), Planner, Focus, Progress, Partner tab
**Partner** sees: Dashboard (read-only), Progress (read-only), Student (read-only), Sessions (read-only)

Partners cannot: create plans, start sessions, edit tasks, access planner/focus controls.

## Key Files to Know

| File | Purpose |
|---|---|
| `src/features/focus/store.ts` | Focus session state machine (start/pause/interrupt/resume/complete) |
| `src/services/session-lifecycle.ts` | Mock session lifecycle with haptics + notifications |
| `src/services/notifications.ts` | In-app notification system |
| `src/lib/haptics.ts` | Haptic pattern triggers |
| `src/database/client.ts` | SQLite schema + migrations |
| `src/services/api-client.ts` | HTTP client for backend |
| `src/features/auth/store.ts` | Auth state with role support |
| `src/constants/theme.ts` | All design tokens |

## Commands

```bash
# Frontend
npx tsc --noEmit          # Type check
npx expo start            # Dev server
npx expo export --platform android  # Bundle

# Backend
cd backend
npm run dev               # Dev server with hot reload
npm run build             # Compile TypeScript
```

## Common Pitfalls

1. **Timer drift** — Never use `setInterval` for elapsed time. Use `Date.now() - startTimestamp`.
2. **Route types** — expo-router may not recognize new routes. Use `as any` cast for route paths.
3. **SQLite bind params** — Use `(string | number | null)[]` not `unknown[]`.
4. **Model fields** — TypeScript uses camelCase (`createdAt`), SQL uses snake_case (`created_at`). Map in repositories.
5. **NativeWind** — CSS must be in `src/global.css` with `@import "tailwindcss"`.
