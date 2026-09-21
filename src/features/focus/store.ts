import { create } from "zustand";
import type { FocusSession, FocusEvent, SessionStatus } from "@/types/models";
import { generateId } from "@/lib/ids";

import { usePlanStore } from "@/features/planner/store";
import { sessionsApi, tasksApi } from "@/services/api-client";
import { getDatabase } from "@/database/client";

interface FocusState {
  activeSession: FocusSession | null;
  events: FocusEvent[];
  elapsedMs: number;
  isTimerRunning: boolean;
  isMockMode: boolean;

  startSession: (task: {
    id: string;
    targetMinutes: number;
    plannedStart: number;
    plannedEnd: number;
    userId: string;
    subject?: string;
    title?: string;
  }) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  interruptSession: (appPackage: string, appName: string) => void;
  resumeFromInterruption: () => void;
  completeSession: () => void;
  expireSession: () => void;
  setElapsed: (ms: number) => void;
  setMockMode: (enabled: boolean) => void;
  reset: () => void;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  activeSession: null,
  events: [],
  elapsedMs: 0,
  isTimerRunning: false,
  isMockMode: __DEV__,

  startSession: (task) => {
    const now = Date.now();
    const session: FocusSession = {
      id: generateId(),
      taskId: task.id,
      userId: task.userId,
      status: "active",
      plannedStart: task.plannedStart,
      plannedEnd: task.plannedEnd,
      actualStart: now,
      totalFocusedMs: 0,
      totalInterruptedMs: 0,
      interruptionCount: 0,
      completionPercentage: 0,
      monitoringValid: true,
      subject: task.subject,
      title: task.title,
      createdAt: now,
      updatedAt: now,
    };

    const event: FocusEvent = {
      id: generateId(),
      sessionId: session.id,
      eventType: "start",
      timestamp: now,
      createdAt: now,
    };

    usePlanStore.getState().updateTaskStatus(task.id, "active");

    sessionsApi.create({
      taskId: task.id,
      plannedStart: task.plannedStart,
      plannedEnd: task.plannedEnd,
      status: "active",
    }).then((res) => {
      const backendId = (res.session as any)._id || res.session.id;
      if (backendId) {
        set((state) => (state.activeSession?.id === session.id ? {
          activeSession: { ...state.activeSession, id: backendId }
        } : state));
      }
    }).catch(() => {});

    getDatabase().then((db) => {
      db.runAsync(
        `INSERT OR REPLACE INTO focus_sessions (id, task_id, user_id, status, planned_start, planned_end, actual_start, total_focused_ms, total_interrupted_ms, interruption_count, completion_percentage, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [session.id, session.taskId, session.userId, session.status, session.plannedStart, session.plannedEnd, session.actualStart ?? null, 0, 0, 0, 0, now, now]
      ).catch(() => {});
    }).catch(() => {});

    set({
      activeSession: session,
      events: [event],
      elapsedMs: 0,
      isTimerRunning: true,
    });
  },

  pauseSession: () => {
    const { activeSession, events } = get();
    if (!activeSession || activeSession.status !== "active") return;

    const now = Date.now();
    const activeSegment = [...events].reverse().find((item) => item.eventType === "start" || item.eventType === "resume");
    const totalFocusedMs = activeSession.totalFocusedMs + (activeSegment ? now - activeSegment.timestamp : 0);
    const event: FocusEvent = {
      id: generateId(),
      sessionId: activeSession.id,
      eventType: "pause",
      timestamp: now,
      createdAt: now,
    };

    sessionsApi.update(activeSession.id, { status: "paused", totalFocusedMs }).catch(() => {});
    sessionsApi.logEvent(activeSession.id, event).catch(() => {});

    getDatabase().then((db) => {
      db.runAsync(
        `UPDATE focus_sessions SET status = 'paused', total_focused_ms = ?, updated_at = ? WHERE id = ?`,
        [totalFocusedMs, now, activeSession.id]
      ).catch(() => {});
    }).catch(() => {});

    set({
      activeSession: { ...activeSession, status: "paused", totalFocusedMs, updatedAt: now },
      events: [...events, event],
      isTimerRunning: false,
    });
  },

  resumeSession: () => {
    const { activeSession, events } = get();
    if (!activeSession || activeSession.status !== "paused") return;

    const now = Date.now();
    const event: FocusEvent = {
      id: generateId(),
      sessionId: activeSession.id,
      eventType: "resume",
      timestamp: now,
      createdAt: now,
    };

    sessionsApi.update(activeSession.id, { status: "active" }).catch(() => {});
    sessionsApi.logEvent(activeSession.id, event).catch(() => {});

    getDatabase().then((db) => {
      db.runAsync(
        `UPDATE focus_sessions SET status = 'active', updated_at = ? WHERE id = ?`,
        [now, activeSession.id]
      ).catch(() => {});
    }).catch(() => {});

    set({
      activeSession: { ...activeSession, status: "active", updatedAt: now },
      events: [...events, event],
      isTimerRunning: true,
    });
  },

  interruptSession: (appPackage, appName) => {
    const { activeSession, events } = get();
    if (!activeSession || activeSession.status !== "active") return;

    const now = Date.now();
    const startEvent = [...events].reverse().find((event) => event.eventType === "start" || event.eventType === "resume");
    if (startEvent) {
      activeSession.totalFocusedMs += now - startEvent.timestamp;
    }

    const event: FocusEvent = {
      id: generateId(),
      sessionId: activeSession.id,
      eventType: "interruption_start",
      timestamp: now,
      appPackage,
      appName,
      createdAt: now,
    };

    const newInterruptionCount = activeSession.interruptionCount + 1;

    sessionsApi.update(activeSession.id, {
      status: "interrupted",
      interruptionCount: newInterruptionCount,
      totalFocusedMs: activeSession.totalFocusedMs,
    }).catch(() => {});
    sessionsApi.logEvent(activeSession.id, event).catch(() => {});

    getDatabase().then((db) => {
      db.runAsync(
        `UPDATE focus_sessions SET status = 'interrupted', interruption_count = ?, total_focused_ms = ?, updated_at = ? WHERE id = ?`,
        [newInterruptionCount, activeSession.totalFocusedMs, now, activeSession.id]
      ).catch(() => {});
    }).catch(() => {});

    set({
      activeSession: {
        ...activeSession,
        status: "interrupted",
        interruptionCount: newInterruptionCount,
        updatedAt: now,
      },
      events: [...events, event],
      isTimerRunning: false,
    });
  },

  resumeFromInterruption: () => {
    const { activeSession, events } = get();
    if (!activeSession || activeSession.status !== "interrupted") return;

    const now = Date.now();
    const interruptionStart = [...events].reverse().find(
      (e) => e.eventType === "interruption_start" && !events.some((l) => l.eventType === "interruption_end" && l.timestamp > e.timestamp)
    );

    if (interruptionStart) {
      activeSession.totalInterruptedMs += now - interruptionStart.timestamp;
    }

    const event: FocusEvent = {
      id: generateId(),
      sessionId: activeSession.id,
      eventType: "interruption_end",
      timestamp: now,
      createdAt: now,
    };

    const resumeEvent: FocusEvent = {
      id: generateId(),
      sessionId: activeSession.id,
      eventType: "resume",
      timestamp: now,
      createdAt: now,
    };

    sessionsApi.update(activeSession.id, {
      status: "active",
      totalInterruptedMs: activeSession.totalInterruptedMs,
    }).catch(() => {});
    sessionsApi.logEvent(activeSession.id, event).catch(() => {});
    sessionsApi.logEvent(activeSession.id, resumeEvent).catch(() => {});

    getDatabase().then((db) => {
      db.runAsync(
        `UPDATE focus_sessions SET status = 'active', total_interrupted_ms = ?, updated_at = ? WHERE id = ?`,
        [activeSession.totalInterruptedMs, now, activeSession.id]
      ).catch(() => {});
    }).catch(() => {});

    set({
      activeSession: { ...activeSession, status: "active", updatedAt: now },
      events: [...events, event, resumeEvent],
      isTimerRunning: true,
    });
  },

  completeSession: () => {
    const { activeSession, events } = get();
    if (!activeSession) return;

    const now = Date.now();
    const activeSegment = [...events].reverse().find((item) => item.eventType === "start" || item.eventType === "resume");
    const focusedTime = activeSession.totalFocusedMs + (activeSession.status === "active" && activeSegment ? now - activeSegment.timestamp : 0);
    const targetMs = activeSession.plannedEnd - activeSession.plannedStart;
    const completion = Math.min((focusedTime / targetMs) * 100, 100);

    const event: FocusEvent = {
      id: generateId(),
      sessionId: activeSession.id,
      eventType: "end",
      timestamp: now,
      createdAt: now,
    };

    usePlanStore.getState().updateTaskStatus(activeSession.taskId, "completed");

    sessionsApi.complete(activeSession.id, {
      actualEnd: now,
      totalFocusedMs: focusedTime,
      completionPercentage: completion,
    }).catch(() => {});

    tasksApi.update(activeSession.taskId, { status: "completed" }).catch(() => {});

    getDatabase().then((db) => {
      db.runAsync(
        `UPDATE focus_sessions SET status = 'completed', actual_end = ?, total_focused_ms = ?, completion_percentage = ?, updated_at = ? WHERE id = ?`,
        [now, focusedTime, completion, now, activeSession.id]
      ).catch(() => {});
      db.runAsync(
        `UPDATE study_tasks SET status = 'completed', updated_at = ? WHERE id = ?`,
        [now, activeSession.taskId]
      ).catch(() => {});
    }).catch(() => {});

    set({
      activeSession: {
        ...activeSession,
        status: "completed",
        actualEnd: now,
        totalFocusedMs: focusedTime,
        completionPercentage: completion,
        updatedAt: now,
      },
      events: [...events, event],
      isTimerRunning: false,
    });
  },

  expireSession: () => {
    const { activeSession, events } = get();
    if (!activeSession) return;

    const now = Date.now();
    const event: FocusEvent = {
      id: generateId(),
      sessionId: activeSession.id,
      eventType: "end",
      timestamp: now,
      createdAt: now,
    };

    sessionsApi.update(activeSession.id, {
      status: "expired",
      actualEnd: now,
    }).catch(() => {});

    getDatabase().then((db) => {
      db.runAsync(
        `UPDATE focus_sessions SET status = 'expired', actual_end = ?, updated_at = ? WHERE id = ?`,
        [now, now, activeSession.id]
      ).catch(() => {});
    }).catch(() => {});

    set({
      activeSession: {
        ...activeSession,
        status: "expired",
        actualEnd: now,
        updatedAt: now,
      },
      events: [...events, event],
      isTimerRunning: false,
    });
  },

  setElapsed: (ms) => set({ elapsedMs: ms }),

  setMockMode: (enabled) => set({ isMockMode: enabled }),

  reset: () =>
    set({
      activeSession: null,
      events: [],
      elapsedMs: 0,
      isTimerRunning: false,
    }),
}));
