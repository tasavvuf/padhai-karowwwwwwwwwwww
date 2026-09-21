import { NativeModule, requireOptionalNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

export interface FocusStatus {
  available: boolean;
  usageAccessGranted: boolean;
  monitoring: boolean;
  sessionId: string | null;
}

export interface FocusEvent {
  sessionId: string;
  packageName: string;
  appName: string;
  timestamp: number;
  isDistraction: boolean;
}

export type FocusEngineEvents = {
  onForegroundAppChanged(event: FocusEvent): void;
};

export interface FocusEngineModule extends NativeModule<FocusEngineEvents> {
  hasUsageAccess(): boolean;
  openUsageAccessSettings(): void;
  startMonitoring(
    sessionId: string,
    distractingPackages: string[],
  ): Promise<FocusStatus>;
  stopMonitoring(): Promise<FocusStatus>;
  getStatus(): FocusStatus;
}

const unavailable: FocusStatus = {
  available: false,
  usageAccessGranted: false,
  monitoring: false,
  sessionId: null,
};

const FocusEngine =
  Platform.OS === "android"
    ? requireOptionalNativeModule<FocusEngineModule>("FocusEngine")
    : null;

export function getFocusEngine(): FocusEngineModule | null {
  return FocusEngine;
}

export function getFocusEngineStatus(): FocusStatus {
  return FocusEngine?.getStatus() ?? unavailable;
}
