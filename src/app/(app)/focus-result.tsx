import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useFocusStore } from "@/features/focus/store";
import { usePlanStore } from "@/features/planner/store";
import { useThemeColors } from "@/hooks/use-theme";
import { formatDurationShort } from "@/lib/date";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FocusResultScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const activeSession = useFocusStore((state) => state.activeSession);
  const task = usePlanStore((state) =>
    state.tasks.find((item) => item.id === activeSession?.taskId),
  );
  const targetMs = activeSession
    ? activeSession.plannedEnd - activeSession.plannedStart
    : 0;
  const focusedMs = activeSession?.totalFocusedMs ?? 0;
  const interruptedMs = activeSession?.totalInterruptedMs ?? 0;
  const completion = activeSession?.completionPercentage ?? 0;
  const interruptionCount = activeSession?.interruptionCount ?? 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 100,
          gap: 24,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ width: "100%", flexDirection: "row", alignItems: "center" }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#2C3E8C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 10,
              elevation: 2,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Result Ring */}
        <View style={{ alignItems: "center", gap: 12 }}>
          <ProgressRing
            progress={completion}
            size={180}
            strokeWidth={12}
            label="completion"
          />
          <Badge
            label={
              completion >= 90
                ? "Excellent"
                : completion >= 70
                  ? "Good Effort"
                  : "Keep Trying"
            }
            variant={
              completion >= 90
                ? "success"
                : completion >= 70
                  ? "warning"
                  : "danger"
            }
            size="md"
          />
        </View>

        {/* Task Info */}
        <View style={{ alignItems: "center", gap: 4 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.text,
              letterSpacing: 2,
            }}
          >
            {(
              task?.subject ??
              activeSession?.subject ??
              "Focus session"
            ).toUpperCase()}
          </Text>
          <Text style={{ fontSize: 15, color: colors.text2 }}>
            {task?.title ?? activeSession?.title ?? "Completed session"}
          </Text>
          <Text style={{ fontSize: 13, color: colors.text3 }}>
            {activeSession
              ? `${new Date(activeSession.plannedStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(activeSession.plannedEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Session details unavailable"}
          </Text>
        </View>

        {/* Stats */}
        <Card variant="elevated" padding={20} style={{ width: "100%" }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ alignItems: "center", flex: 1 }}>
              <Clock
                size={20}
                color={colors.primary}
                style={{ marginBottom: 6 }}
              />
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: colors.text }}
              >
                {formatDurationShort(focusedMs)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text3 }}>Focused</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <View style={{ alignItems: "center", flex: 1 }}>
              <AlertTriangle
                size={20}
                color={colors.warning}
                style={{ marginBottom: 6 }}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.warning,
                }}
              >
                {formatDurationShort(interruptedMs)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text3 }}>
                Interrupted
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <View style={{ alignItems: "center", flex: 1 }}>
              <CheckCircle2
                size={20}
                color={colors.success}
                style={{ marginBottom: 6 }}
              />
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: colors.text }}
              >
                {interruptionCount}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text3 }}>Breaks</Text>
            </View>
          </View>
        </Card>

        {/* Summary */}
        <Card variant="default" padding={16} style={{ width: "100%" }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Session Summary
          </Text>
          <View style={{ gap: 10 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 14, color: colors.text2 }}>
                Planned duration
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: colors.text }}
              >
                {formatDurationShort(targetMs)}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 14, color: colors.text2 }}>
                Actual focused
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: colors.text }}
              >
                {formatDurationShort(focusedMs)}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 14, color: colors.text2 }}>
                Distraction time
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.warning,
                }}
              >
                {formatDurationShort(interruptedMs)}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 14, color: colors.text2 }}>
                Completion
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.success,
                }}
              >
                {completion}%
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={{ width: "100%", gap: 10 }}>
          <Button
            title="Back to Home"
            size="lg"
            onPress={() => router.replace("/(app)/(tabs)/home")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
