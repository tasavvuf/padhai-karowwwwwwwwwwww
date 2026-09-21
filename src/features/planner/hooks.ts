import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plannerApi, tasksApi } from "./api";

export function usePlans(week?: string) {
  return useQuery({
    queryKey: ["plans", week],
    queryFn: () => plannerApi.getPlans(week),
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ["plans", id],
    queryFn: () => plannerApi.getPlan(id),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plannerApi.createPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}

export function useLockPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plannerApi.lockPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}

export function useTasks(params?: { date?: string; planId?: string }) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => tasksApi.getTasks(params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => tasksApi.updateTask(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
