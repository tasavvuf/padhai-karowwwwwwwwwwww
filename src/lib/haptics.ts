import * as Haptics from "expo-haptics";

export type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

const patternMap: Record<HapticPattern, () => Promise<void>> = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
};

export async function triggerHaptic(pattern: HapticPattern): Promise<void> {
  try {
    await patternMap[pattern]();
  } catch {
    // Haptics not available on web/simulator
  }
}

export async function triggerHapticSequence(
  patterns: HapticPattern[],
  intervalMs: number = 100
): Promise<void> {
  for (const pattern of patterns) {
    await triggerHaptic(pattern);
    if (patterns.indexOf(pattern) < patterns.length - 1) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
}

export async function triggerInterruptionHaptic(): Promise<void> {
  await triggerHapticSequence(["warning", "light", "warning"], 150);
}

export async function triggerSessionCompleteHaptic(): Promise<void> {
  await triggerHapticSequence(["success", "light", "success", "medium"], 120);
}

export async function triggerSessionStartHaptic(): Promise<void> {
  await triggerHapticSequence(["light", "medium"], 100);
}

export async function triggerCountdownHaptic(remaining: number): Promise<void> {
  if (remaining <= 3) {
    await triggerHaptic("heavy");
  } else if (remaining <= 5) {
    await triggerHaptic("medium");
  } else {
    await triggerHaptic("light");
  }
}
