import { StudyStreakCard } from "@/components/features/study-streak-card";
import { AnimatedEntrance } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useAuthStore } from "@/features/auth/store";
import { useFocusStore } from "@/features/focus/store";
import { usePlanStore } from "@/features/planner/store";
import { useThemeColors } from "@/hooks/use-theme";
import { formatDuration, formatTimeShort, getGreeting } from "@/lib/date";
import { getSubjectColor } from "@/lib/format";
import {
    partnerApi,
    type PartnerProgressResponse,
} from "@/services/api-client";
import { sendPartnerEncouragement } from "@/services/notifications";
import { mockStartSession } from "@/services/session-lifecycle";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
    Bell,
    Check,
    ChevronRight,
    Clock,
    Flame,
    Heart,
    Lock,
    Play,
    Plus,
    Send,
    Settings,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
} from "lucide-react-native";
import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeSession } = useFocusStore();
  const { tasks, toggleTaskComplete, selectedDate, currentPlan } =
    usePlanStore();
  const isPartner = user?.role === "partner";

  const [partnerData, setPartnerData] =
    React.useState<PartnerProgressResponse | null>(null);

  React.useEffect(() => {
    if (isPartner) {
      const fetchPartner = () => {
        partnerApi
          .progress()
          .then(setPartnerData)
          .catch(() => {});
      };
      fetchPartner();
      const interval = setInterval(fetchPartner, 4000);
      return () => clearInterval(interval);
    } else {
      usePlanStore.getState().fetchPlanFromApi();
      usePlanStore.getState().fetchTasksFromApi();
    }
  }, [isPartner]);

  const todayTasks = tasks.filter((t) => t.date === selectedDate);
  const completedTasks = todayTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const totalTasks = todayTasks.length;
  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const allCompleted = totalTasks > 0 && completedTasks === totalTasks;

  const partnerTasks =
    partnerData?.tasks && partnerData.tasks.length > 0
      ? partnerData.tasks
      : todayTasks;
  const partnerCompletedTasks = partnerData
    ? partnerData.today.tasksCompleted
    : completedTasks;
  const partnerTotalTasks = partnerData
    ? partnerData.today.tasksTotal
    : totalTasks;
  const partnerAllCompleted =
    partnerTotalTasks > 0 && partnerCompletedTasks === partnerTotalTasks;
  const partnerStudentName = partnerData?.student?.name ?? "your student";
  const partnerActiveSession = partnerData?.activeSession ?? activeSession;

  const nextActiveTask =
    todayTasks.find((t) => t.status !== "completed") ?? todayTasks[0];

  const handleStartTaskClock = (task: (typeof todayTasks)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = Date.now();
    mockStartSession({
      id: task.id,
      targetMinutes: task.targetMinutes,
      plannedStart: now,
      plannedEnd: now + task.targetMinutes * 60 * 1000,
      userId: user?.id ?? "",
      subject: task.subject,
      title: task.title,
    });
    router.push("/(app)/(tabs)/focus");
  };

  const handleSendNudge = async (message: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await partnerApi.sendMessage(message);
      sendPartnerEncouragement(user?.name ?? "Accountability partner", message);
      Alert.alert("Nudge Sent", `Sent to ${partnerStudentName}: "${message}"`);
    } catch {
      Alert.alert(
        "Message unavailable",
        "Connect to the internet and try again.",
      );
    }
  };

  const currentTimeStr = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isPartner) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedEntrance delay={0}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.text3,
                    fontWeight: "700",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                  }}
                >
                  Accountability Monitor
                </Text>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "800",
                    color: colors.text,
                    marginTop: 2,
                    letterSpacing: -0.5,
                  }}
                >
                  {partnerStudentName}'s NEET Prep
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => router.push("/notifications")}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#3D5CF5",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 2,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  })}
                >
                  <Bell size={20} color={colors.text} strokeWidth={2.2} />
                </Pressable>
                <Pressable
                  onPress={() => router.push("/(app)/settings")}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#3D5CF5",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 2,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  })}
                >
                  <Settings size={20} color={colors.text} strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
          </AnimatedEntrance>

          <AnimatedEntrance delay={80}>
            <View
              style={{
                backgroundColor: partnerAllCompleted ? "#EBF7F2" : "#FFF5E6",
                borderRadius: 28,
                padding: 22,
                borderWidth: 2,
                borderColor: partnerAllCompleted
                  ? colors.success
                  : colors.warning,
                marginBottom: 18,
                shadowColor: partnerAllCompleted
                  ? colors.success
                  : colors.warning,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                {partnerAllCompleted ? (
                  <ShieldCheck
                    size={26}
                    color={colors.success}
                    strokeWidth={2.4}
                  />
                ) : (
                  <ShieldAlert
                    size={26}
                    color={colors.warning}
                    strokeWidth={2.4}
                  />
                )}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: partnerAllCompleted ? colors.success : "#B5651D",
                    letterSpacing: -0.2,
                  }}
                >
                  {partnerAllCompleted
                    ? "DAILY VERDICT: SAFE TO TALK 🎉"
                    : "DAILY VERDICT: DO NOT REPLY ⛔"}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: colors.text,
                  lineHeight: 22,
                  fontWeight: "500",
                }}
              >
                {partnerAllCompleted
                  ? `${partnerStudentName} has completed all ${partnerTotalTasks} predefined study blocks today! She stayed disciplined. You are cleared to reply and call tonight.`
                  : `${partnerStudentName} has finished ${partnerCompletedTasks} of ${partnerTotalTasks} targets. The LDR rule is active: do not chat until her targets are marked complete!`}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 14,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: "rgba(0,0,0,0.06)",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Clock size={16} color={colors.text2} />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    {partnerCompletedTasks}/{partnerTotalTasks} Blocks Done
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    height: 16,
                    backgroundColor: colors.border,
                  }}
                />
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Flame size={16} color={colors.accent} />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    {partnerData
                      ? `${partnerData.today.focusedMinutes}m focused today`
                      : "Progress updating"}
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedEntrance>

          {partnerActiveSession && partnerActiveSession.status === "active" && (
            <AnimatedEntrance delay={120}>
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 28,
                  padding: 22,
                  marginBottom: 18,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "rgba(255,255,255,0.22)",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 9999,
                    }}
                  >
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 3.5,
                        backgroundColor: "#00D2D3",
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#FFFFFF",
                        fontWeight: "800",
                      }}
                    >
                      LIVE STUDY CLOCK
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: "600",
                    }}
                  >
                    {currentTimeStr}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 22, fontWeight: "800", color: "#FFFFFF" }}
                >
                  {(partnerActiveSession as any).subject ?? "Focus session"}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.85)",
                    marginTop: 2,
                    fontWeight: "500",
                  }}
                >
                  {(partnerActiveSession as any).title ?? "Study Session"} ·
                  Target:{" "}
                  {formatDuration(
                    partnerActiveSession.plannedEnd -
                      partnerActiveSession.plannedStart,
                  )}
                </Text>
              </View>
            </AnimatedEntrance>
          )}

          {partnerActiveSession &&
            partnerActiveSession.status === "interrupted" && (
              <AnimatedEntrance delay={120}>
                <View
                  style={{
                    backgroundColor: "#FFF0F3",
                    borderRadius: 28,
                    padding: 22,
                    marginBottom: 18,
                    borderWidth: 2,
                    borderColor: colors.danger,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Smartphone size={22} color={colors.danger} />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: colors.danger,
                      }}
                    >
                      DISTRACTION ALERT: APP SWITCH DETECTED
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}
                  >
                    {partnerStudentName} left the study clock and opened an app.
                    Her timer has halted.
                  </Text>
                </View>
              </AnimatedEntrance>
            )}

          <AnimatedEntrance delay={180}>
            <Card variant="elevated" padding={22} style={{ marginBottom: 18 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 19,
                      fontWeight: "800",
                      color: colors.text,
                      letterSpacing: -0.3,
                    }}
                  >
                    Today's Study Checklist
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.text3,
                      fontWeight: "500",
                      marginTop: 2,
                    }}
                  >
                    Locked Re-NEET Schedule
                  </Text>
                </View>
                <Badge
                  label={`${partnerCompletedTasks}/${partnerTotalTasks} Done`}
                  variant={partnerAllCompleted ? "success" : "warning"}
                  size="sm"
                />
              </View>

              <View style={{ gap: 4 }}>
                {partnerTasks.map((task, idx) => {
                  const subjectColor = getSubjectColor(task.subject);
                  const isDone = task.status === "completed";

                  return (
                    <View
                      key={task.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 12,
                        borderBottomWidth:
                          idx < partnerTasks.length - 1 ? 1 : 0,
                        borderBottomColor: colors.borderLight,
                        opacity: isDone ? 0.6 : 1,
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          borderWidth: 1.8,
                          borderColor: isDone ? colors.success : colors.border,
                          backgroundColor: isDone
                            ? colors.success
                            : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        {isDone && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>

                      <View
                        style={{
                          width: 4,
                          height: 28,
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
                            textDecorationLine: isDone
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {task.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.text3,
                            marginTop: 2,
                            fontWeight: "500",
                          }}
                        >
                          {formatTimeShort(task.startTime)} -{" "}
                          {formatTimeShort(task.endTime)} · {task.subject} (
                          {task.targetMinutes}m)
                        </Text>
                      </View>

                      <Badge
                        label={
                          isDone
                            ? "Done"
                            : task.status === "active"
                              ? "Active"
                              : "Pending"
                        }
                        variant={
                          isDone
                            ? "success"
                            : task.status === "active"
                              ? "primary"
                              : "default"
                        }
                        size="sm"
                      />
                    </View>
                  );
                })}
              </View>
            </Card>
          </AnimatedEntrance>

          <AnimatedEntrance delay={240}>
            <Card variant="default" padding={20}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <Send size={18} color={colors.primary} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  Send Push / Nudge to {partnerStudentName}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                {[
                  "📱 Get off Instagram and finish your targets!",
                  "💪 Keep going! Only 2 subjects left for tonight.",
                  "❤️ Finish your study blocks so we can talk tonight!",
                ].map((msg, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handleSendNudge(msg)}
                    style={({ pressed }) => ({
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 16,
                      backgroundColor: colors.surface2,
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.text,
                        fontWeight: "600",
                      }}
                    >
                      {msg}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          </AnimatedEntrance>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedEntrance delay={0}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.text3,
                  fontWeight: "700",
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                }}
              >
                {getGreeting()} · RE-NEET 2026
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "800",
                  color: colors.text,
                  marginTop: 2,
                  letterSpacing: -0.6,
                }}
              >
                {user?.name ?? "Accountability partner"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => router.push("/notifications")}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#3D5CF5",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 2,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                })}
              >
                <Bell size={20} color={colors.text} strokeWidth={2.2} />
              </Pressable>
              <Pressable
                onPress={() => router.push("/(app)/settings")}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#3D5CF5",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 2,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                })}
              >
                <Settings size={20} color={colors.text} strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={80}>
          <View
            style={{
              backgroundColor: allCompleted ? "#EBF7F2" : colors.surface,
              borderRadius: 24,
              padding: 18,
              borderWidth: 1.5,
              borderColor: allCompleted ? colors.success : colors.borderLight,
              marginBottom: 18,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              shadowColor: "#3D5CF5",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: allCompleted
                  ? colors.success + "20"
                  : colors.primaryLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {allCompleted ? (
                <Heart size={22} color={colors.success} fill={colors.success} />
              ) : (
                <Lock size={20} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: colors.text,
                  letterSpacing: -0.2,
                }}
              >
                {allCompleted
                  ? "Contract Cleared Tonight 🎉"
                  : "Accountability Rule Active 🔒"}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.text2,
                  marginTop: 2,
                  lineHeight: 18,
                }}
              >
                {allCompleted
                  ? "All daily targets are done! You earned your conversation time tonight."
                  : "If daily targets are not completed, no chatting tonight. Stay disciplined!"}
              </Text>
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={140}>
          <Pressable
            onPress={() => {
              if (nextActiveTask) {
                handleStartTaskClock(nextActiveTask);
              }
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.985 : 1 }],
              marginBottom: 20,
            })}
          >
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 32,
                padding: 24,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 14 },
                shadowOpacity: 0.35,
                shadowRadius: 26,
                elevation: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  {currentTimeStr}
                </Text>
                {activeSession?.status === "active" ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 9999,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#00D2D3",
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#FFFFFF",
                        fontWeight: "700",
                      }}
                    >
                      STUDY CLOCK LIVE
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 9999,
                    }}
                  >
                    <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#FFFFFF",
                        fontWeight: "700",
                      }}
                    >
                      START CLOCK
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ alignItems: "center", marginVertical: 12 }}>
                <ProgressRing
                  progress={completionPercent}
                  size={126}
                  strokeWidth={10}
                  showPercentage={true}
                  progressColor="#FFFFFF"
                  trackColor="rgba(255, 255, 255, 0.25)"
                  textColor="#FFFFFF"
                />
              </View>

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#FFFFFF",
                    letterSpacing: -0.3,
                  }}
                >
                  Overall Progress
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "rgba(255, 255, 255, 0.85)",
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  {completedTasks} of {totalTasks} daily Re-NEET blocks achieved
                </Text>
              </View>
            </View>
          </Pressable>
        </AnimatedEntrance>

        <AnimatedEntrance delay={200}>
          <StudyStreakCard />
        </AnimatedEntrance>

        <AnimatedEntrance delay={260}>
          <Card variant="elevated" padding={22} style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: colors.text,
                    letterSpacing: -0.4,
                  }}
                >
                  Today's Study Blocks
                </Text>
                <View
                  style={{
                    backgroundColor: colors.surface2,
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                    borderRadius: 9999,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.primary,
                    }}
                  >
                    {totalTasks}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push("/(app)/task-create")}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.28,
                  shadowRadius: 8,
                  elevation: 3,
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                })}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
              </Pressable>
            </View>

            <View style={{ gap: 4 }}>
              {todayTasks.map((task, index) => {
                const subjectColor = getSubjectColor(task.subject);
                const isCompleted = task.status === "completed";

                return (
                  <View
                    key={task.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: index < todayTasks.length - 1 ? 1 : 0,
                      borderBottomColor: colors.borderLight,
                      opacity: isCompleted ? 0.6 : 1,
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        toggleTaskComplete(task.id);
                      }}
                      style={({ pressed }) => ({
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        borderWidth: 1.8,
                        borderColor: isCompleted
                          ? colors.primary
                          : colors.surface3,
                        backgroundColor: isCompleted
                          ? colors.primary
                          : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        transform: [{ scale: pressed ? 0.9 : 1 }],
                      })}
                    >
                      {isCompleted && (
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      )}
                    </Pressable>

                    <View
                      style={{
                        width: 4,
                        height: 30,
                        borderRadius: 2,
                        backgroundColor: subjectColor,
                        marginRight: 12,
                      }}
                    />

                    <Pressable
                      onPress={() => router.push(`/task/${task.id}` as any)}
                      style={{ flex: 1 }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: colors.text,
                          letterSpacing: -0.2,
                          textDecorationLine: isCompleted
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {task.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.text3,
                          marginTop: 2,
                          fontWeight: "500",
                        }}
                      >
                        {formatTimeShort(task.startTime)} -{" "}
                        {formatTimeShort(task.endTime)} · {task.subject} (
                        {task.targetMinutes}m)
                      </Text>
                    </Pressable>

                    {!isCompleted ? (
                      <Pressable
                        onPress={() => handleStartTaskClock(task)}
                        style={({ pressed }) => ({
                          backgroundColor: colors.primaryLight,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 9999,
                          transform: [{ scale: pressed ? 0.94 : 1 }],
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: colors.primary,
                          }}
                        >
                          Start Clock
                        </Text>
                      </Pressable>
                    ) : (
                      <Badge label="Done" variant="success" size="sm" />
                    )}
                  </View>
                );
              })}
            </View>

            <Pressable
              onPress={() => router.push("/(app)/(tabs)/planner")}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: 9999,
                paddingVertical: 15,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 18,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.28,
                shadowRadius: 14,
                elevation: 4,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                View Full Weekly Plan
              </Text>
            </Pressable>
          </Card>
        </AnimatedEntrance>

        <AnimatedEntrance delay={320}>
          <Card variant="default" padding={20}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Lock size={16} color={colors.primary} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: colors.text,
                    }}
                  >
                    Weekly Plan: Locked 🔒
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.text3,
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  All 7 days predefined. No schedule edits permitted.
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/(app)/(tabs)/planner")}
                style={{ padding: 6 }}
              >
                <ChevronRight size={20} color={colors.text3} />
              </Pressable>
            </View>
          </Card>
        </AnimatedEntrance>
      </ScrollView>
    </SafeAreaView>
  );
}
