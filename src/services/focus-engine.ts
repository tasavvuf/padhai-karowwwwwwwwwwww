import { useFocusStore } from "@/features/focus/store";
import { useSettingsStore } from "@/features/settings/store";
import { Platform } from "react-native";
import {
    getFocusEngine,
    type FocusEngineModule,
    type FocusEvent,
    type FocusStatus,
} from "../../modules/focus-engine";

let subscription: { remove: () => void } | null = null;

export function getNativeFocusStatus(): FocusStatus {
  if (Platform.OS !== "android")
    return {
      available: false,
      usageAccessGranted: false,
      monitoring: false,
      sessionId: null,
    };
  return (
    getFocusEngine()?.getStatus() ?? {
      available: false,
      usageAccessGranted: false,
      monitoring: false,
      sessionId: null,
    }
  );
}

export function openNativeUsageAccessSettings(): void {
  getFocusEngine()?.openUsageAccessSettings();
}

export async function startNativeFocusMonitoring(
  sessionId: string,
): Promise<FocusStatus> {
  const engine = getFocusEngine();
  if (!engine) return getNativeFocusStatus();
  subscription?.remove();
  subscription = (
    engine as FocusEngineModule & {
      addListener: (
        eventName: "onForegroundAppChanged",
        listener: (event: FocusEvent) => void,
      ) => { remove: () => void };
    }
  ).addListener("onForegroundAppChanged", (event: FocusEvent) => {
    const activeSession = useFocusStore.getState().activeSession;
    if (!activeSession) return;
    if (activeSession.status === "active" && event.isDistraction) {
      useFocusStore.getState().interruptSession(event.packageName, event.appName);
    } else if (activeSession.status === "interrupted" && !event.isDistraction) {
      useFocusStore.getState().resumeFromInterruption();
    }
  });
  return engine.startMonitoring(
    sessionId,
    useSettingsStore.getState().distractionProfile.distractingApps,
  );
}

export async function stopNativeFocusMonitoring(): Promise<FocusStatus> {
  subscription?.remove();
  subscription = null;
  return getFocusEngine()?.stopMonitoring() ?? getNativeFocusStatus();
}
