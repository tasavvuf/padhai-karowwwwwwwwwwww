import { apiRequest } from "@/services/api-client";

export const authApi = {
  register: (data: { name: string; email: string; password: string; role: "student" | "partner"; inviteCode?: string }) =>
    apiRequest<{ user: unknown; token: string }>("/auth/register", { method: "POST", body: data }),
  login: (data: { email: string; password: string }) =>
    apiRequest<{ user: unknown; token: string }>("/auth/login", { method: "POST", body: data }),
  me: (token: string) =>
    apiRequest<{ user: unknown }>("/auth/me", { token }),
};
