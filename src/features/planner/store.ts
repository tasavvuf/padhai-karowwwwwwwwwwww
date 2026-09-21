import { getDatabase } from "@/database/client";
import { addToSyncQueue } from "@/database/repositories/sync-queue";
import { generateId } from "@/lib/ids";
import { plansApi, tasksApi } from "@/services/api-client";
import type {
    PlanStatus,
    StudyTask,
    TaskStatus,
    WeeklyPlan,
} from "@/types/models";
import { create } from "zustand";

function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getOffsetDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = getTodayDateStr();

function normalizeTask(raw: any): StudyTask {
  return {
    id: raw._id?.toString() || raw.id || generateId(),
    planId: raw.planId?.toString() || raw.planId || "",
    userId: raw.userId?.toString() || raw.userId || "",
    title: raw.title,
    subject: raw.subject,
    description: raw.description,
    date: raw.date,
    startTime: raw.startTime,
    endTime: raw.endTime,
    targetMinutes: raw.targetMinutes,
    priority: raw.priority || "medium",
    status: raw.status || "planned",
    completionThreshold: raw.completionThreshold || 0.8,
    allowedApps: raw.allowedApps,
    distractingApps: raw.distractingApps || [
      "Instagram",
      "WhatsApp",
      "YouTube",
    ],
    createdAt:
      typeof raw.createdAt === "string"
        ? new Date(raw.createdAt).getTime()
        : raw.createdAt || Date.now(),
    updatedAt:
      typeof raw.updatedAt === "string"
        ? new Date(raw.updatedAt).getTime()
        : raw.updatedAt || Date.now(),
  };
}

interface PlanState {
  currentPlan: WeeklyPlan | null;
  tasks: StudyTask[];
  selectedDate: string;
  isLoading: boolean;

  setCurrentPlan: (plan: WeeklyPlan | null) => void;
  setTasks: (tasks: StudyTask[]) => void;
  setSelectedDate: (date: string) => void;

  fetchTasksFromApi: (date?: string) => Promise<void>;
  fetchPlanFromApi: (weekStart?: string) => Promise<void>;
  addTask: (
    task: Omit<StudyTask, "id" | "createdAt" | "updatedAt">,
  ) => Promise<StudyTask>;
  updateTask: (id: string, updates: Partial<StudyTask>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  lockPlan: () => Promise<void>;
  unlockPlan: () => void;
  updatePlanStatus: (status: PlanStatus) => void;
  getTasksForDate: (date: string) => StudyTask[];
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  currentPlan: null,
  tasks: [],
  selectedDate: today,
  isLoading: false,

  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  setTasks: (tasks) => set({ tasks }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchTasksFromApi: async (date?: string) => {
    set({ isLoading: true });
    try {
      const res = await tasksApi.getAll(date);
      if (res?.tasks && Array.isArray(res.tasks)) {
        const normalized = res.tasks.map(normalizeTask);
        set({ tasks: normalized, isLoading: false });

        try {
          const db = await getDatabase();
          for (const t of normalized) {
            await db.runAsync(
              `INSERT OR REPLACE INTO study_tasks 
               (id, plan_id, user_id, title, subject, description, date, start_time, end_time, target_minutes, priority, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                t.id,
                t.planId,
                t.userId,
                t.title,
                t.subject,
                t.description ?? null,
                t.date,
                t.startTime,
                t.endTime,
                t.targetMinutes,
                t.priority,
                t.status,
                t.createdAt,
                t.updatedAt,
              ],
            );
          }
        } catch {}
        return;
      }
    } catch {
      try {
        const db = await getDatabase();
        const rows = await db.getAllAsync<any>(
          date
            ? "SELECT * FROM study_tasks WHERE date = ?"
            : "SELECT * FROM study_tasks",
          date ? [date] : [],
        );
        if (rows && rows.length > 0) {
          const localTasks = rows.map((r: any) => ({
            id: r.id,
            planId: r.plan_id,
            userId: r.user_id,
            title: r.title,
            subject: r.subject,
            description: r.description,
            date: r.date,
            startTime: r.start_time,
            endTime: r.end_time,
            targetMinutes: r.target_minutes,
            priority: r.priority,
            status: r.status,
            completionThreshold: r.completion_threshold ?? 0.8,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
          set({ tasks: localTasks });
        }
      } catch {}
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPlanFromApi: async (weekStart?: string) => {
    try {
      const week = weekStart || getOffsetDateStr(0);
      const res = await plansApi.getForWeek(week);
      if (res?.plans && res.plans.length > 0) {
        const raw = res.plans[0] as any;
        const normalized: WeeklyPlan = {
          id: raw._id?.toString() || raw.id,
          userId: raw.userId?.toString() || raw.userId,
          weekStart: raw.weekStart,
          weekEnd: raw.weekEnd,
          status: raw.status,
          lockedAt: raw.lockedAt ? new Date(raw.lockedAt).getTime() : undefined,
          createdAt: new Date(raw.createdAt).getTime(),
          updatedAt: new Date(raw.updatedAt).getTime(),
        };
        set({ currentPlan: normalized });
      }
    } catch {}
  },

  addTask: async (taskData) => {
    const now = Date.now();
    const localTask: StudyTask = {
      ...taskData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ tasks: [...state.tasks, localTask] }));

    try {
      const res = await tasksApi.create(taskData);
      if (res?.task) {
        const serverTask = normalizeTask(res.task);
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === localTask.id ? serverTask : t,
          ),
        }));
        return serverTask;
      }
    } catch {}

    return localTask;
  },

  updateTask: async (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t,
      ),
    }));

    try {
      await tasksApi.update(id, updates);
    } catch {
      await addToSyncQueue(
        "study_task",
        id,
        "update",
        updates as Record<string, unknown>,
      ).catch(() => {});
    }
  },

  removeTask: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      await tasksApi.delete(id);
    } catch {
      await addToSyncQueue("study_task", id, "delete", {}).catch(() => {});
    }
  },

  lockPlan: async () => {
    const { currentPlan } = get();
    if (currentPlan) {
      set({
        currentPlan: {
          ...currentPlan,
          status: "locked",
          lockedAt: Date.now(),
          updatedAt: Date.now(),
        },
      });

      try {
        if (currentPlan.id) {
          await plansApi.lock(currentPlan.id);
        }
      } catch {
        await addToSyncQueue("weekly_plan", currentPlan.id, "update", {
          status: "locked",
          lockedAt: currentPlan.lockedAt,
        }).catch(() => {});
      }
    }
  },

  unlockPlan: () => {
    const { currentPlan } = get();
    if (currentPlan) {
      set({
        currentPlan: {
          ...currentPlan,
          status: "draft",
          updatedAt: Date.now(),
        },
      });
    }
  },

  updatePlanStatus: (status) => {
    const { currentPlan } = get();
    if (currentPlan) {
      set({
        currentPlan: { ...currentPlan, status, updatedAt: Date.now() },
      });
    }
  },

  getTasksForDate: (date) => {
    return get().tasks.filter((t) => t.date === date);
  },

  updateTaskStatus: async (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: Date.now() } : t,
      ),
    }));

    try {
      await tasksApi.update(id, { status });
    } catch {
      await addToSyncQueue("study_task", id, "update", { status }).catch(
        () => {},
      );
    }
  },

  toggleTaskComplete: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const nextStatus: TaskStatus =
      task.status === "completed" ? "planned" : "completed";

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: nextStatus, updatedAt: Date.now() } : t,
      ),
    }));

    try {
      await tasksApi.update(id, { status: nextStatus });
    } catch {
      await addToSyncQueue("study_task", id, "update", {
        status: nextStatus,
      }).catch(() => {});
    }
  },
}));
