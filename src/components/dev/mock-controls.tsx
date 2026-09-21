import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { useFocusStore } from "@/features/focus/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_APPS } from "@/constants/config";
import { Play, Pause, SkipForward, Wifi, WifiOff, Smartphone, Zap } from "lucide-react-native";

export function MockControls() {
  const colors = useThemeColors();
  const {
    activeSession,
    isMockMode,
    isTimerRunning,
    startSession,
    pauseSession,
    resumeSession,
    interruptSession,
    resumeFromInterruption,
    completeSession,
    setMockMode,
  } = useFocusStore();

  const [isOffline, setIsOffline] = useState(false);

  if (!isMockMode) return null;

  const isActive = activeSession?.status === "active";
  const isInterrupted = activeSession?.status === "interrupted";
  const isIdle = !activeSession || activeSession.status === "completed" || activeSession.status === "expired";

  return (
    <Card variant="outlined" padding={14} style={{ borderColor: colors.warning + "40" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Zap size={14} color={colors.warning} />
        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.warning, letterSpacing: 1 }}>
          DEVELOPER MODE
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {/* Start/Stop */}
        {isIdle && (
          <Pressable
            onPress={() =>
              startSession({
                id: "mock-task-1",
                targetMinutes: 30,
                plannedStart: Date.now(),
                plannedEnd: Date.now() + 30 * 60 * 1000,
                userId: "user-1",
              })
            }
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: colors.success + "20",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Play size={14} color={colors.success} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.success }}>Start Session</Text>
          </Pressable>
        )}

        {/* Pause/Resume */}
        {isActive && (
          <Pressable
            onPress={pauseSession}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: colors.warning + "20",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Pause size={14} color={colors.warning} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.warning }}>Pause</Text>
          </Pressable>
        )}

        {activeSession?.status === "paused" && (
          <Pressable
            onPress={resumeSession}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: colors.success + "20",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <SkipForward size={14} color={colors.success} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.success }}>Resume</Text>
          </Pressable>
        )}

        {/* Simulate Distraction */}
        {isActive && (
          <>
            {MOCK_APPS.slice(0, 3).map((app) => (
              <Pressable
                key={app.package}
                onPress={() => interruptSession(app.package, app.name)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: colors.danger + "20",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Smartphone size={14} color={colors.danger} />
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.danger }}>
                  {app.name}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        {/* Resume from interruption */}
        {isInterrupted && (
          <Pressable
            onPress={resumeFromInterruption}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: colors.primary + "20",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Play size={14} color={colors.primary} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>Return to Study</Text>
          </Pressable>
        )}

        {/* Complete */}
        {(isActive || isInterrupted) && (
          <Pressable
            onPress={completeSession}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: colors.accent + "20",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.accent }}>Complete</Text>
          </Pressable>
        )}

        {/* Offline toggle */}
        <Pressable
          onPress={() => setIsOffline(!isOffline)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: isOffline ? colors.danger + "20" : colors.surface3,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          {isOffline ? <WifiOff size={14} color={colors.danger} /> : <Wifi size={14} color={colors.text3} />}
          <Text style={{ fontSize: 12, fontWeight: "600", color: isOffline ? colors.danger : colors.text3 }}>
            {isOffline ? "Offline" : "Online"}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
