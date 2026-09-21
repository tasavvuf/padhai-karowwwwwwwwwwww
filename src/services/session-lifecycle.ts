import { useFocusStore } from "@/features/focus/store";
import {
    triggerCountdownHaptic,
    triggerHaptic,
    triggerInterruptionHaptic,
    triggerSessionCompleteHaptic,
} from "@/lib/haptics";
import {
    startNativeFocusMonitoring,
    stopNativeFocusMonitoring,
} from "./focus-engine";
import {
    sendInterruptionWarning,
    sendSessionAlert,
    sendSessionComplete,
} from "./notifications";

const INTERRUPTION_COUNTDOWN_SECONDS = 10;
const SESSION_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes grace period

let countdownInterval: ReturnType<typeof setInterval> | null = null;
let expiryTimeout: ReturnType<typeof setTimeout> | null = null;
let interruptionInterval: ReturnType<typeof setInterval> | null = null;
let interruptionSecondsLeft = 0;

export function startInterruptionCountdown(
  appName: string,
  onExpired: () => void,
  onTick?: (secondsLeft: number) => void,
): void {
  stopInterruptionCountdown();
  interruptionSecondsLeft = INTERRUPTION_COUNTDOWN_SECONDS;

  interruptionInterval = setInterval(() => {
    interruptionSecondsLeft--;
    onTick?.(interruptionSecondsLeft);
    triggerCountdownHaptic(interruptionSecondsLeft);

    if (interruptionSecondsLeft <= 0) {
      stopInterruptionCountdown();
      onExpired();
    }
  }, 1000);
}

export function stopInterruptionCountdown(): void {
  if (interruptionInterval) {
    clearInterval(interruptionInterval);
    interruptionInterval = null;
  }
  interruptionSecondsLeft = 0;
}

export function getInterruptionCountdown(): number {
  return interruptionSecondsLeft;
}

export function startSessionExpiryCheck(
  plannedEndMs: number,
  onExpire: () => void,
): void {
  stopSessionExpiryCheck();
  const remaining = plannedEndMs + SESSION_EXPIRY_BUFFER_MS - Date.now();

  if (remaining <= 0) {
    onExpire();
    return;
  }

  expiryTimeout = setTimeout(() => {
    onExpire();
    sendSessionAlert("Your session has expired. Great effort today!");
  }, remaining);
}

export function stopSessionExpiryCheck(): void {
  if (expiryTimeout) {
    clearTimeout(expiryTimeout);
    expiryTimeout = null;
  }
}

export function mockStartSession(task: {
  id: string;
  targetMinutes: number;
  plannedStart: number;
  plannedEnd: number;
  userId: string;
  subject?: string;
  title?: string;
}): void {
  const store = useFocusStore.getState();
  store.startSession(task);
  void startNativeFocusMonitoring(
    useFocusStore.getState().activeSession?.id ?? task.id,
  );
  triggerSessionCompleteHaptic().catch(() => {});
  sendSessionAlert("Focus session started. Stay focused!");

  startSessionExpiryCheck(task.plannedEnd, () => {
    void stopNativeFocusMonitoring();
    store.expireSession();
  });
}

export function mockInterruptSession(
  appPackage: string,
  appName: string,
): void {
  const store = useFocusStore.getState();
  if (!store.activeSession || store.activeSession.status !== "active") return;

  triggerInterruptionHaptic();
  store.interruptSession(appPackage, appName);

  startInterruptionCountdown(
    appName,
    () => {
      // If user doesn't return within countdown, session stays interrupted
      sendSessionAlert(`Session paused. You spent too long on ${appName}.`);
    },
    (secondsLeft) => {
      sendInterruptionWarning(appName, secondsLeft);
    },
  );
}

export function mockResumeFromInterruption(): void {
  const store = useFocusStore.getState();
  if (!store.activeSession || store.activeSession.status !== "interrupted")
    return;

  stopInterruptionCountdown();
  store.resumeFromInterruption();
  triggerHaptic("success");
  sendSessionAlert("Welcome back! Focus timer resumed.");
}

export function mockCompleteSession(): void {
  const store = useFocusStore.getState();
  if (!store.activeSession) return;

  stopInterruptionCountdown();
  stopSessionExpiryCheck();
  void stopNativeFocusMonitoring();
  store.completeSession();
  triggerSessionCompleteHaptic();

  const session = useFocusStore.getState().activeSession;
  if (session) {
    sendSessionComplete(
      session.subject ?? session.title ?? "Focus session",
      Math.round(session.totalFocusedMs / 60000),
      session.completionPercentage,
    );
  }
}

export function cleanup(): void {
  stopInterruptionCountdown();
  stopSessionExpiryCheck();
  void stopNativeFocusMonitoring();
}
