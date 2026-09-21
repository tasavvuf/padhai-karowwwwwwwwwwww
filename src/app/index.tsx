import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/features/auth/store";

export default function Index() {
  const router = useRouter();
  const { restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession().then((hasSession) => {
      if (hasSession) {
        router.replace("/(app)/(tabs)/home" as any);
      } else {
        router.replace("/(auth)/index" as any);
      }
    });
  }, [restoreSession, router]);

  return null;
}
