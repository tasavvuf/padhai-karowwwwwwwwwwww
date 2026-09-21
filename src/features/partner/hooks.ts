import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnerApi } from "./api";

export function usePartnerProgress() {
  return useQuery({
    queryKey: ["partner", "progress"],
    queryFn: partnerApi.getProgress,
  });
}

export function usePartnerSessions() {
  return useQuery({
    queryKey: ["partner", "sessions"],
    queryFn: partnerApi.getSessions,
  });
}

export function usePartnerWeeklyProgress() {
  return useQuery({
    queryKey: ["partner", "weekly"],
    queryFn: partnerApi.getWeekly,
  });
}

export function usePartnerTasks(date?: string) {
  return useQuery({
    queryKey: ["partner", "tasks", date],
    queryFn: () => partnerApi.getTasks(date),
  });
}

export function useInviteCode() {
  return useMutation({
    mutationFn: partnerApi.invite,
  });
}

export function useConnectPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: partnerApi.connect,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner"] }),
  });
}
