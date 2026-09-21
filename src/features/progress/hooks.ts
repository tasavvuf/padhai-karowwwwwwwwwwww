import { useQuery } from "@tanstack/react-query";
import { progressApi } from "./api";

export function useDailyProgress(date?: string) {
  return useQuery({
    queryKey: ["progress", "daily", date],
    queryFn: () => progressApi.getDaily(date),
  });
}

export function useWeeklyProgress(week?: string) {
  return useQuery({
    queryKey: ["progress", "weekly", week],
    queryFn: () => progressApi.getWeekly(week),
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ["progress", "streak"],
    queryFn: progressApi.getStreak,
  });
}
