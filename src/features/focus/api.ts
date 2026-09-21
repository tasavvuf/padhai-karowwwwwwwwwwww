import { apiRequest } from "@/services/api-client";

export const focusApi = {
  getSessions: (limit?: number) => {
    const q = limit ? `?limit=${limit}` : "";
    return apiRequest<{ sessions: unknown[] }>(`/sessions${q}`);
  },
  getActiveSession: () =>
    apiRequest<{ session: unknown }>("/sessions/active"),
  createSession: (data: Record<string, unknown>) =>
    apiRequest<{ session: unknown }>("/sessions", { method: "POST", body: data }),
  updateSession: (id: string, data: Record<string, unknown>) =>
    apiRequest<{ session: unknown }>(`/sessions/${id}`, { method: "PUT", body: data }),
  completeSession: (id: string, data?: Record<string, unknown>) =>
    apiRequest<{ session: unknown }>(`/sessions/${id}/complete`, { method: "PUT", body: data }),
  addEvent: (sessionId: string, data: Record<string, unknown>) =>
    apiRequest<{ event: unknown }>(`/sessions/${sessionId}/events`, { method: "POST", body: data }),
  getEvents: (sessionId: string) =>
    apiRequest<{ events: unknown[] }>(`/sessions/${sessionId}/events`),
};
