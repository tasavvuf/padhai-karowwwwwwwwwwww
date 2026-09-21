import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./store";
import { authApi } from "./api";

export function useLogin() {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user as any, data.token);
    },
  });
}

export function useRegister() {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data.user as any, data.token);
    },
  });
}

export function useMe() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(token!),
    enabled: !!token,
  });
}
