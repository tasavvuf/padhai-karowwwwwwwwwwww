import { apiRequest, type PartnerProgressResponse } from "@/services/api-client";
import type { WeeklyProgressResponse } from "@/features/progress/api";

export const partnerApi = {
  invite: () =>
    apiRequest<{ inviteCode: string }>("/partner/invite", { method: "POST" }),
  connect: (code: string) =>
    apiRequest<{ message: string; studentName: string }>("/partner/connect", { method: "POST", body: { code } }),
  getProgress: () => apiRequest<PartnerProgressResponse>("/partner/progress"),
  getWeekly: () => apiRequest<WeeklyProgressResponse>("/partner/weekly"),
  getSessions: () =>
    apiRequest<{ sessions: unknown[] }>("/partner/sessions"),
  getTasks: (date?: string) => {
    const q = date ? `?date=${date}` : "";
    return apiRequest<{ tasks: unknown[] }>(`/partner/tasks${q}`);
  },
};
