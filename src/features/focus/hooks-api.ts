import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { focusApi } from "./api";

export function useSessions(limit?: number) {
  return useQuery({
    queryKey: ["sessions", limit],
    queryFn: () => focusApi.getSessions(limit),
  });
}

export function useActiveSession() {
  return useQuery({
    queryKey: ["sessions", "active"],
    queryFn: focusApi.getActiveSession,
    refetchInterval: 5000,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: focusApi.createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: Record<string, unknown> }) => focusApi.completeSession(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useSessionEvents(sessionId: string) {
  return useQuery({
    queryKey: ["sessions", sessionId, "events"],
    queryFn: () => focusApi.getEvents(sessionId),
    enabled: !!sessionId,
  });
}
