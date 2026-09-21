import type {
    FocusEvent,
    FocusSession,
    StudyTask,
    User,
    WeeklyPlan,
} from "@/types/models";
import Constants from "expo-constants";
import { Platform } from "react-native";

export function getBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return `http://${ip}:3000/api`;
    }
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://localhost:3000/api";
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let getAuthToken: (() => string | null) | null = null;

export function setAuthTokenGetter(getter: () => string | null) {
  getAuthToken = getter;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, token } = options;

  const authToken =
    token !== undefined ? token : getAuthToken ? getAuthToken() : null;

  const allHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (authToken) {
    allHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: allHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new ApiError(
      error.message || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return response.json();
}

// Auth
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: "student" | "partner";
    inviteCode?: string;
  }) =>
    apiRequest<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: data,
    }),
  login: (data: { email: string; password: string }) =>
    apiRequest<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: data,
    }),
  me: (token?: string | null) =>
    apiRequest<{ user: User }>("/auth/me", { token }),
};

// Plans
export const plansApi = {
  getForWeek: (weekStart: string, token?: string | null) =>
    apiRequest<{ plans: WeeklyPlan[] }>(`/plans?week=${weekStart}`, { token }),
  create: (
    data: { weekStart: string; weekEnd: string; tasks?: unknown[] },
    token?: string | null,
  ) =>
    apiRequest<{ plan: WeeklyPlan }>("/plans", {
      method: "POST",
      body: data,
      token,
    }),
  lock: (id: string, token?: string | null) =>
    apiRequest<{ plan: WeeklyPlan }>(`/plans/${id}/lock`, {
      method: "POST",
      token,
    }),
};

// Tasks
export const tasksApi = {
  getAll: (date?: string, token?: string | null) =>
    apiRequest<{ tasks: StudyTask[] }>(
      date ? `/tasks?date=${date}` : "/tasks",
      { token },
    ),
  create: (data: Partial<StudyTask>, token?: string | null) =>
    apiRequest<{ task: StudyTask }>("/tasks", {
      method: "POST",
      body: data,
      token,
    }),
  update: (id: string, data: Partial<StudyTask>, token?: string | null) =>
    apiRequest<{ task: StudyTask }>(`/tasks/${id}`, {
      method: "PUT",
      body: data,
      token,
    }),
  delete: (id: string, token?: string | null) =>
    apiRequest<{ message: string }>(`/tasks/${id}`, {
      method: "DELETE",
      token,
    }),
};

// Sessions
export const sessionsApi = {
  create: (data: Partial<FocusSession>, token?: string | null) =>
    apiRequest<{ session: FocusSession }>("/sessions", {
      method: "POST",
      body: data,
      token,
    }),
  update: (id: string, data: Partial<FocusSession>, token?: string | null) =>
    apiRequest<{ session: FocusSession }>(`/sessions/${id}`, {
      method: "PUT",
      body: data,
      token,
    }),
  complete: (
    id: string,
    data: {
      actualEnd?: number;
      totalFocusedMs?: number;
      completionPercentage?: number;
    },
    token?: string | null,
  ) =>
    apiRequest<{ session: FocusSession }>(`/sessions/${id}/complete`, {
      method: "PUT",
      body: data,
      token,
    }),
  sync: (id: string, events: unknown[], token?: string | null) =>
    apiRequest<{ message: string }>(`/sessions/${id}/sync`, {
      method: "POST",
      body: events,
      token,
    }),
  logEvent: (id: string, event: Partial<FocusEvent>, token?: string | null) =>
    apiRequest<{ event: FocusEvent }>(`/sessions/${id}/events`, {
      method: "POST",
      body: event,
      token,
    }),
  getForDate: (date: string, token?: string | null) =>
    apiRequest<{ sessions: FocusSession[] }>(`/sessions?date=${date}`, {
      token,
    }),
};

export const syncApi = {
  push: (
    items: Array<{
      entityType: string;
      entityId: string;
      operation: "create" | "update" | "delete";
      payload: Record<string, unknown>;
    }>,
  ) =>
    apiRequest<{
      results: Array<{
        entityType: string;
        entityId: string;
        status: "ok" | "error";
      }>;
      syncedAt: number;
    }>("/sync/push", { method: "POST", body: { items } }),
  pull: (lastSyncAt: number) =>
    apiRequest<{
      sessions: FocusSession[];
      tasks: StudyTask[];
      plans: WeeklyPlan[];
      pulledAt: number;
    }>("/sync/pull", {
      method: "POST",
      body: { lastSyncAt: new Date(lastSyncAt || 0).toISOString() },
    }),
};

export interface PartnerProgressResponse {
  student: {
    id: string;
    name: string;
    email: string;
  };
  today: {
    tasksCompleted: number;
    tasksTotal: number;
    focusedMinutes: number;
  };
  activeSession: {
    id: string;
    taskId: string;
    status: string;
    plannedStart: number;
    plannedEnd: number;
    totalFocusedMs: number;
    interruptionCount: number;
  } | null;
  tasks: StudyTask[];
}

// Partner
export const partnerApi = {
  invite: (token?: string | null) =>
    apiRequest<{ inviteCode: string }>("/partner/invite", {
      method: "POST",
      token,
    }),
  connect: (code: string, token?: string | null) =>
    apiRequest<{ message: string; studentName: string }>("/partner/connect", {
      method: "POST",
      body: { code },
      token,
    }),
  progress: (token?: string | null) =>
    apiRequest<PartnerProgressResponse>("/partner/progress", { token }),
  sessions: (token?: string | null) =>
    apiRequest<{ sessions: FocusSession[] }>("/partner/sessions", { token }),
  tasks: (date?: string, token?: string | null) =>
    apiRequest<{ tasks: StudyTask[] }>(
      date ? `/partner/tasks?date=${date}` : "/partner/tasks",
      { token },
    ),
  sendMessage: (message: string, token?: string | null) =>
    apiRequest<{ message: { id: string; message: string; createdAt: string } }>(
      "/partner/messages",
      { method: "POST", body: { message }, token },
    ),
  messages: (token?: string | null) =>
    apiRequest<{
      messages: Array<{
        id: string;
        fromUserId: string;
        toUserId: string;
        message: string;
        createdAt: string;
      }>;
    }>("/partner/messages", { token }),
};
