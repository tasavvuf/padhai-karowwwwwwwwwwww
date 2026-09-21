import { InterruptionCountdown } from "@/components/focus/interruption-countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useAuthStore } from "@/features/auth/store";
import { useFocusStore } from "@/features/focus/store";
import { usePlanStore } from "@/features/planner/store";
import { useThemeColors } from "@/hooks/use-theme";
import { formatDuration } from "@/lib/date";
import { getSubjectColor } from "@/lib/format";
import {
    cleanup,
    getInterruptionCountdown,
    mockCompleteSession,
    mockInterruptSession,
    mockResumeFromInterruption,
    mockStartSession,
} from "@/services/session-lifecycle";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
    CheckCircle2,
    Pause,
    Play,
    ShieldAlert,
    Smartphone
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function useTimestampTimer() {
  const { activeSession, events, isTimerRunning } = useFocusStore();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isTimerRunning) return;
    let frame: number;
    const tick = () => {
      setNow(Date.now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isTimerRunning]);

  if (!activeSession || !isTimerRunning) {
    return {
      elapsed: activeSession?.totalFocusedMs ?? 0,
      focused: activeSession?.totalFocusedMs ?? 0,
      interrupted: activeSession?.totalInterruptedMs ?? 0,
    };
  }

  const activeSegment = [...events]
    .reverse()
    .find(
      (event) => event.eventType === "start" || event.eventType === "resume",
    );
  const elapsedSinceStart = activeSegment ? now - activeSegment.timestamp : 0;
  const focused =
    activeSession.totalFocusedMs +
    (activeSession.status === "active" ? elapsedSinceStart : 0);
  const interrupted =
    activeSession.totalInterruptedMs +
    (activeSession.status === "interrupted" ? elapsedSinceStart : 0);

  return { elapsed: focused + interrupted, focused, interrupted };
}

export default function FocusScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeSession, isTimerRunning, pauseSession, resumeSession } =
    useFocusStore();
  const { tasks, selectedDate } = usePlanStore();

  const todayTasks = tasks.filter((t) => t.date === selectedDate);
  const pendingTasks = todayTasks.filter((t) => t.status !== "completed");
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    pendingTasks[0]?.id ?? todayTasks[0]?.id ?? "",
  );

  const selectedTask =
    todayTasks.find((t) => t.id === selectedTaskId) ?? todayTasks[0];

  const { focused, interrupted } = useTimestampTimer();
  const [countdown, setCountdown] = useState(0);
  const [interruptedApp, setInterruptedApp] = useState("");
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    usePlanStore.getState().fetchTasksFromApi();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getInterruptionCountdown());
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1500 }),
          withTiming(1, { duration: 1500 }),
        ),
        -1,
        true,
      );
    }
  }, [isTimerRunning, pulseAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const handleStart = useCallback(() => {
    if (!selectedTask) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = Date.now();
    mockStartSession({
      id: selectedTask.id,
      targetMinutes: selectedTask.targetMinutes,
      plannedStart: now,
      plannedEnd: now + selectedTask.targetMinutes * 60 * 1000,
      userId: user?.id ?? "",
      subject: selectedTask.subject,
      title: selectedTask.title,
    });
  }, [selectedTask, user?.id]);

  const handleDistractionTrigger = useCallback((appName: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setInterruptedApp(appName);
    mockInterruptSession(`com.${appName.toLowerCase()}.android`, appName);
  }, []);

  const handleResume = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mockResumeFromInterruption();
    setCountdown(0);
  }, []);

  const handleComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    mockCompleteSession();
    router.push("/(app)/focus-result" as any);
  }, [router]);

  const targetMs = activeSession
    ? activeSession.plannedEnd - activeSession.plannedStart
    : (selectedTask?.targetMinutes ?? 120) * 60 * 1000;
  const progress = Math.min((focused / targetMs) * 100, 100);

  const isActive = activeSession?.status === "active";
  const isInterrupted = activeSession?.status === "interrupted";
  const isPaused = activeSession?.status === "paused";
  const isIdle =
    !activeSession ||
    activeSession.status === "completed" ||
    activeSession.status === "expired";

  const remainingMs = Math.max(targetMs - focused, 0);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "800",
                color: colors.text,
                letterSpacing: -0.5,
              }}
            >
              Study Clock
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.text3,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              Predefined Re-NEET focus timer
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.primaryLight,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.primary,
              }}
            />
            <Text
              style={{ fontSize: 12, color: colors.primary, fontWeight: "700" }}
            >
              Anti-Distraction
            </Text>
          </View>
        </View>

        {isIdle ? (
          <View style={{ gap: 20 }}>
            <Card variant="elevated" padding={22}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: colors.text,
                  letterSpacing: -0.3,
                  marginBottom: 4,
                }}
              >
                Choose Predefined Task
              </Text>
              <Text
                style={{ fontSize: 13, color: colors.text2, marginBottom: 16 }}
              >
                Timer duration is predefined from your locked weekly plan.
              </Text>

              <View style={{ gap: 10, marginBottom: 20 }}>
                {todayTasks.map((t) => {
                  const isSelected = t.id === (selectedTask?.id ?? "");
                  const isDone = t.status === "completed";
                  const subjectColor = getSubjectColor(t.subject);

                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedTaskId(t.id);
                      }}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 14,
                        borderRadius: 20,
                        backgroundColor: isSelected
                          ? colors.primaryLight
                          : colors.surface2,
                        borderWidth: 1.5,
                        borderColor: isSelected
                          ? colors.primary
                          : "transparent",
                        opacity: isDone ? 0.6 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      })}
                    >
                      <View
                        style={{
                          width: 4,
                          height: 32,
                          borderRadius: 2,
                          backgroundColor: subjectColor,
                          marginRight: 12,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: colors.text,
                          }}
                        >
                          {t.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.text3,
                            marginTop: 2,
                            fontWeight: "500",
                          }}
                        >
                          {t.subject} · Predefined: {t.targetMinutes} mins
                        </Text>
                      </View>
                      <Badge
                        label={isDone ? "Done" : `${t.targetMinutes}m`}
                        variant={
                          isDone
                            ? "success"
                            : isSelected
                              ? "primary"
                              : "default"
                        }
                        size="sm"
                      />
                    </Pressable>
                  );
                })}
              </View>

              <Button
                title={
                  selectedTask
                    ? `Start Clock (${selectedTask.targetMinutes}m)`
                    : "Start Focus Clock"
                }
                size="lg"
                onPress={handleStart}
                icon={<Play size={20} color="#FFFFFF" fill="#FFFFFF" />}
              />
            </Card>

            <Card variant="default" padding={18}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#FFF4E5",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldAlert size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    Partner Distraction Rule
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.text2,
                      marginTop: 2,
                      lineHeight: 18,
                    }}
                  >
                    If you open Instagram or talk during this session, the clock
                    halts and logs an interruption for your partner.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ) : (
          <View style={{ alignItems: "center", gap: 20, width: "100%" }}>
            {isInterrupted && countdown > 0 ? (
              <InterruptionCountdown
                secondsLeft={countdown}
                appName={interruptedApp}
              />
            ) : (
              <>
                {isInterrupted && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: colors.danger + "20",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 9999,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.danger,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: colors.danger,
                      }}
                    >
                      TIMER HALTED: LEFT TO {interruptedApp.toUpperCase()}
                    </Text>
                  </View>
                )}
                {isActive && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: colors.success + "18",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 9999,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.success,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: colors.success,
                      }}
                    >
                      SESSION ACTIVE · DO NOT DISTRACT
                    </Text>
                  </View>
                )}
                {isPaused && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: colors.warning + "20",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 9999,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.warning,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: colors.warning,
                      }}
                    >
                      TIMER PAUSED
                    </Text>
                  </View>
                )}

                <View style={{ alignItems: "center", gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: colors.text,
                      letterSpacing: -0.4,
                    }}
                  >
                    {activeSession?.subject ??
                      selectedTask?.subject ??
                      "Focus session"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.text2,
                      fontWeight: "500",
                    }}
                  >
                    {activeSession?.title ?? selectedTask?.title ?? "Session"} ·
                    Target: {formatDuration(targetMs)}
                  </Text>
                </View>

                <Animated.View
                  style={[
                    {
                      alignItems: "center",
                      justifyContent: "center",
                      marginVertical: 10,
                    },
                    pulseStyle,
                  ]}
                >
                  <ProgressRing
                    progress={progress}
                    size={260}
                    strokeWidth={14}
                    showPercentage={false}
                    progressColor={
                      isInterrupted ? colors.danger : colors.primary
                    }
                    trackColor={colors.surface2}
                  />
                  <View style={{ position: "absolute", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 48,
                        fontWeight: "300",
                        color: isInterrupted ? colors.danger : colors.text,
                        fontVariant: ["tabular-nums"],
                        letterSpacing: 1,
                      }}
                    >
                      {formatDuration(focused)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.text3,
                        marginTop: 4,
                        fontWeight: "600",
                      }}
                    >
                      Remaining: {formatDuration(remainingMs)}
                    </Text>
                  </View>
                </Animated.View>

                <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                  <Card
                    variant="default"
                    padding={14}
                    style={{ flex: 1, alignItems: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: colors.success,
                      }}
                    >
                      {formatDuration(focused)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.text3,
                        fontWeight: "600",
                        marginTop: 2,
                      }}
                    >
                      Focused
                    </Text>
                  </Card>
                  <Card
                    variant="default"
                    padding={14}
                    style={{ flex: 1, alignItems: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: colors.danger,
                      }}
                    >
                      {activeSession?.interruptionCount ?? 0}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.text3,
                        fontWeight: "600",
                        marginTop: 2,
                      }}
                    >
                      Distractions
                    </Text>
                  </Card>
                  <Card
                    variant="default"
                    padding={14}
                    style={{ flex: 1, alignItems: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: colors.primary,
                      }}
                    >
                      {Math.round(progress)}%
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.text3,
                        fontWeight: "600",
                        marginTop: 2,
                      }}
                    >
                      Target Met
                    </Text>
                  </Card>
                </View>

                <Card
                  variant="elevated"
                  padding={18}
                  style={{ width: "100%", gap: 10 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Smartphone size={18} color={colors.danger} />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: colors.text,
                      }}
                    >
                      Simulate Distraction (Auto-Stop Timer)
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.text3 }}>
                    Test the distraction shield. Opening these apps halts the
                    timer and alerts your partner.
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    <Pressable
                      onPress={() => handleDistractionTrigger("Instagram")}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 10,
                        backgroundColor: "#FFEBEF",
                        borderRadius: 12,
                        alignItems: "center",
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: colors.danger,
                        }}
                      >
                        Instagram
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDistractionTrigger("WhatsApp")}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 10,
                        backgroundColor: "#E6FAF5",
                        borderRadius: 12,
                        alignItems: "center",
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: colors.success,
                        }}
                      >
                        WhatsApp
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDistractionTrigger("YouTube")}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 10,
                        backgroundColor: "#FFF5E6",
                        borderRadius: 12,
                        alignItems: "center",
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: colors.warning,
                        }}
                      >
                        YouTube
                      </Text>
                    </Pressable>
                  </View>
                </Card>

                <View style={{ width: "100%", gap: 12, marginTop: 8 }}>
                  {isInterrupted ? (
                    <Button
                      title="Back to Study (Resume Timer)"
                      size="lg"
                      variant="primary"
                      onPress={handleResume}
                      icon={<Play size={20} color="#FFFFFF" fill="#FFFFFF" />}
                    />
                  ) : isActive ? (
                    <Button
                      title="Pause Clock"
                      variant="secondary"
                      size="lg"
                      icon={<Pause size={20} color={colors.text} />}
                      onPress={pauseSession}
                    />
                  ) : (
                    <Button
                      title="Resume Study Clock"
                      size="lg"
                      variant="primary"
                      icon={<Play size={20} color="#FFFFFF" fill="#FFFFFF" />}
                      onPress={resumeSession}
                    />
                  )}

                  <Button
                    title="Mark Task Completed & Finish"
                    variant="ghost"
                    size="md"
                    icon={<CheckCircle2 size={18} color={colors.success} />}
                    onPress={handleComplete}
                  />
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
