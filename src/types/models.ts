export type PlanStatus = "draft" | "ready" | "locked" | "active" | "completed";
export type TaskStatus = "planned" | "available" | "active" | "completed" | "missed" | "expired";
export type SessionStatus = "active" | "paused" | "interrupted" | "completed" | "expired" | "failed";
export type EventType = "start" | "pause" | "resume" | "end" | "interruption_start" | "interruption_end";
export type Priority = "low" | "medium" | "high";

export type UserRole = "student" | "partner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  timezone: string;
  createdAt: number;
  updatedAt: number;
}

export interface WeeklyPlan {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  status: PlanStatus;
  lockedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface StudyTask {
  id: string;
  planId: string;
  userId: string;
  title: string;
  subject: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  targetMinutes: number;
  category?: string;
  priority: Priority;
  status: TaskStatus;
  completionThreshold: number;
  allowedApps?: string[];
  distractingApps?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface FocusSession {
  id: string;
  taskId: string;
  userId: string;
  status: SessionStatus;
  plannedStart: number;
  plannedEnd: number;
  actualStart?: number;
  actualEnd?: number;
  totalFocusedMs: number;
  totalInterruptedMs: number;
  interruptionCount: number;
  completionPercentage: number;
  monitoringValid: boolean;
  subject?: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FocusEvent {
  id: string;
  sessionId: string;
  eventType: EventType;
  timestamp: number;
  appPackage?: string;
  appName?: string;
  metadata?: string;
  createdAt: number;
}

export interface DistractionProfile {
  id: string;
  userId: string;
  name: string;
  distractingApps: string[];
  allowedApps?: string[];
  isDefault: boolean;
  createdAt: number;
}

export interface PartnerConnection {
  id: string;
  studentId: string;
  partnerId: string;
  status: "pending" | "active" | "blocked";
  inviteCode?: string;
  privacySettings?: Record<string, unknown>;
  createdAt: number;
}

export interface DailyProgress {
  date: string;
  plannedMinutes: number;
  focusedMinutes: number;
  interruptedMinutes: number;
  completionPercentage: number;
  tasksTotal: number;
  tasksCompleted: number;
  tasksMissed: number;
  interruptionCount: number;
}

export interface WeeklyProgress {
  weekStart: string;
  weekEnd: string;
  totalPlannedMinutes: number;
  totalFocusedMinutes: number;
  totalInterruptedMinutes: number;
  overallCompletion: number;
  tasksTotal: number;
  tasksCompleted: number;
  tasksMissed: number;
  strongestDay: string;
  weakestDay: string;
  streak: number;
}
