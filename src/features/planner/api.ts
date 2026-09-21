import { apiRequest } from "@/services/api-client";

export const plannerApi = {
  getPlans: (week?: string) => {
    const q = week ? `?week=${week}` : "";
    return apiRequest<{ plans: unknown[] }>(`/plans${q}`);
  },
  getPlan: (id: string) =>
    apiRequest<{ plan: unknown }>(`/plans/${id}`),
  createPlan: (data: { weekStart: string; weekEnd: string; tasks?: unknown[] }) =>
    apiRequest<{ plan: unknown }>("/plans", { method: "POST", body: data }),
  lockPlan: (id: string) =>
    apiRequest<{ plan: unknown }>(`/plans/${id}/lock`, { method: "POST" }),
  updatePlan: (id: string, data: Record<string, unknown>) =>
    apiRequest<{ plan: unknown }>(`/plans/${id}`, { method: "PUT", body: data }),
};

export const tasksApi = {
  getTasks: (params?: { date?: string; planId?: string }) => {
    const q = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return apiRequest<{ tasks: unknown[] }>(`/tasks${q}`);
  },
  getTask: (id: string) =>
    apiRequest<{ task: unknown }>(`/tasks/${id}`),
  createTask: (data: Record<string, unknown>) =>
    apiRequest<{ task: unknown }>("/tasks", { method: "POST", body: data }),
  updateTask: (id: string, data: Record<string, unknown>) =>
    apiRequest<{ task: unknown }>(`/tasks/${id}`, { method: "PUT", body: data }),
  deleteTask: (id: string) =>
    apiRequest<{ message: string }>(`/tasks/${id}`, { method: "DELETE" }),
};
