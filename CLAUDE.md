@AGENTS.md

# Padhai Karo - Full Project Context

## What This App Does

Study accountability app. Student creates weekly study plans, locks them, starts focus sessions. Timer tracks focused vs interrupted time. Partner (accountability buddy) can view read-only progress. Mock mode simulates the full flow in Expo Go without native Android modules.

## What Is Built (Complete)

### Frontend (91 source files)

**Design System:**
- Theme with light/dark colors, spacing, typography, radius, shadows
- 13 UI components: Button, Card, Input, Badge, ProgressRing, TimerDisplay, Skeleton, EmptyState, SubjectChip, Avatar, Modal, BottomSheet, Animated utilities
- 6 Feature components: TaskCard, WeekCalendar, DaySchedule, StatsCard, PartnerSummary, InterruptionBanner
- Screen container, notification center, interruption countdown

**Screens (18):**
- Role selection landing
- Student login + register
- Partner login + register
- Onboarding walkthrough
- Home dashboard (role-aware)
- Weekly planner
- Focus session (with mock controls + interruption countdown)
- Progress analytics
- Partner read-only view
- Settings (main + distractions + permissions + profile)
- Notifications list
- Focus result
- Partner connect
- Task create + task detail

**State Management:**
- Auth store (role-based: student/partner, login/logout)
- Focus store (session state machine: start → pause → interrupt → resume → complete)
- Planner store (weekly plans + tasks)
- Settings store (theme, notifications, distraction profile, session duration)

**Services:**
- API client (HTTP wrapper with auth headers)
- Session lifecycle manager (mock focus flow with haptics + notifications)
- Notification service (5 types: study_reminder, session_alert, partner_encouragement, interruption_warning, session_complete)
- Sync service (outbox pattern with retry)
- Haptic patterns (7 patterns + sequences)

**Database:**
- SQLite schema (8 tables: users, weekly_plans, study_tasks, focus_sessions, focus_events, distraction_profiles, sync_queue, app_preferences)
- 5 repositories: tasks, sessions, plans, sync-queue, settings

**API Layer:**
- 6 API modules: auth, planner, focus, progress, partner, settings
- React Query hooks for all entities
- Role-based route protection

### Backend (15 source files)

**Express + TypeScript + MongoDB:**
- User model with bcrypt + JWT auth
- WeeklyPlan, StudyTask, FocusSession, FocusEvent models
- 7 route groups: auth, plans, tasks, sessions, partner, progress, sync
- Role-based middleware (student-only routes)
- Invite code system for partner connection

## What Is NOT Built (Remaining)

### Phase 4: Native Focus Engine (requires Expo dev build)
- Android Usage Access permission flow
- Foreground service for focus monitoring
- Foreground app detection (UsageStatsManager)
- Native Kotlin module for session controller
- Permission onboarding flow
- Diagnostic screen (permissions, service status)
- Graceful failure handling

### Phase 5: Offline Sync Hardening
- Conflict resolution with merge dialog
- Exponential backoff for retries
- Sync status indicators in UI
- Data consistency checks

### Phase 6: Partner Polish
- Encouragement messages (send from partner to student)
- Real-time partner notifications
- Privacy settings per field
- Partner-specific analytics

### Phase 7: Production Polish
- List virtualization (FlatList for long lists)
- Memoization (React.memo, useMemo)
- Error boundaries
- Accessibility audit
- Analytics/tracking
- App icons and splash screen branding
- Push notifications (expo-notifications)

## Architecture Decisions

1. **Timestamp-based timer** — `Date.now() - actualStart`, never `setInterval`
2. **Configured distractions interrupt** — detect when distracting app opens, don't whitelist study apps
3. **Event-based session recording** — record events (start, pause, interrupt, resume, end), derive durations
4. **SQLite for local state, MongoDB for sync** — SQLite is source of truth for active session
5. **Mock mode as first-class** — permanent development tool, not a hack
6. **Android-first** — no iOS-specific code yet

## How to Deploy Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm install
npm run dev  # Development
npm run build && npm start  # Production
```

## How to Connect RN to Backend

Update `src/services/api-client.ts`:
```typescript
const BASE_URL = "http://YOUR_SERVER_IP:3000/api";
```

## Database Schema Summary

| Table | Purpose | Key Fields |
|---|---|---|
| users | User accounts | email, role (student/partner), inviteCode, partnerId |
| weekly_plans | Weekly study plans | userId, weekStart, status (draft→locked→active→completed) |
| study_tasks | Individual tasks | planId, subject, date, startTime, status |
| focus_sessions | Focus sessions | taskId, status, plannedStart/End, focused/interrupted ms |
| focus_events | Session events | sessionId, eventType, timestamp, app info |
| distraction_profiles | Blocked apps | userId, distractingApps[], allowedApps[] |
| sync_queue | Offline mutation queue | entityType, operation, payload, status, retries |
| app_preferences | Key-value settings | key, value |
