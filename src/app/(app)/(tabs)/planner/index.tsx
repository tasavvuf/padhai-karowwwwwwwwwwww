import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubjectChip } from "@/components/ui/subject-chip";
import { useAuthStore } from "@/features/auth/store";
import { usePlanStore } from "@/features/planner/store";
import { useThemeColors } from "@/hooks/use-theme";
import {
    formatTimeShort,
    getDayName,
    getDayNameFull,
    getWeekDays,
    getWeekRange,
} from "@/lib/date";
import { getSubjectColor } from "@/lib/format";
import { addDays, format } from "date-fns";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
    CalendarDays,
    Check,
    ChevronRight,
    Lock,
    Plus,
    Unlock
} from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlannerScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuthStore();
  const isPartner = user?.role === "partner";
  const { tasks, currentPlan, lockPlan, unlockPlan, toggleTaskComplete } =
    usePlanStore();

  React.useEffect(() => {
    usePlanStore.getState().fetchPlanFromApi();
    usePlanStore.getState().fetchTasksFromApi();
  }, []);

  const today = new Date();
  const { start: weekStart } = getWeekRange(today);
  const weekDays = getWeekDays(weekStart);
  const [selectedDate, setSelectedDate] = useState(format(today, "yyyy-MM-dd"));

  const isLocked = currentPlan?.status === "locked";
  const selectedTasks = tasks.filter((t) => t.date === selectedDate);
  const totalMinutes = selectedTasks.reduce((a, t) => a + t.targetMinutes, 0);

  const handleToggleLock = () => {
    if (isPartner) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isLocked) {
      Alert.alert(
        "Unlock Schedule?",
        "Unlocking your schedule breaks the accountability contract. Are you sure you want to edit?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Unlock", style: "destructive", onPress: () => unlockPlan() },
        ],
      );
    } else {
      lockPlan();
      Alert.alert(
        "Plan Locked 🔒",
        "Your weekly Re-NEET commitments are locked. You cannot modify them now!",
      );
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View
        style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
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
              {isPartner ? "Student's Plan" : "Weekly Plan"}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.text3,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {format(weekStart, "MMM d")} -{" "}
              {format(addDays(weekStart, 6), "MMM d, yyyy")} · Re-NEET 2026
            </Text>
          </View>
          <Badge
            label={isLocked ? "Locked 🔒" : "Draft ✏️"}
            variant={isLocked ? "warning" : "default"}
            size="sm"
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 4,
            paddingVertical: 4,
          }}
        >
          {weekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isSelected = dateStr === selectedDate;
            const dayTasks = tasks.filter((t) => t.date === dateStr);
            const hasCompleted =
              dayTasks.length > 0 &&
              dayTasks.every((t) => t.status === "completed");

            return (
              <Pressable
                key={dateStr}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDate(dateStr);
                }}
                style={({ pressed }) => ({
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 22,
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  minWidth: 58,
                  shadowColor: isSelected ? colors.primary : "#3D5CF5",
                  shadowOffset: { width: 0, height: isSelected ? 6 : 2 },
                  shadowOpacity: isSelected ? 0.28 : 0.04,
                  shadowRadius: isSelected ? 12 : 6,
                  elevation: isSelected ? 4 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: isSelected ? "rgba(255,255,255,0.8)" : colors.text3,
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {getDayName(day)}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: isSelected ? "#FFFFFF" : colors.text,
                  }}
                >
                  {format(day, "d")}
                </Text>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor:
                      dayTasks.length === 0
                        ? "transparent"
                        : hasCompleted
                          ? isSelected
                            ? "#FFFFFF"
                            : colors.success
                          : isSelected
                            ? "rgba(255,255,255,0.6)"
                            : colors.primary,
                    marginTop: 6,
                  }}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
            {getDayNameFull(new Date(selectedDate + "T12:00:00"))}
          </Text>
          <Text
            style={{ fontSize: 13, color: colors.text3, fontWeight: "600" }}
          >
            {totalMinutes > 0
              ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m predefined`
              : "No tasks planned"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLocked && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: colors.borderLight,
              shadowColor: "#3D5CF5",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#FFF4E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={18} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
              >
                {isPartner
                  ? "Accountability Freeze Active"
                  : "Schedule Locked by Contract"}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.text3,
                  marginTop: 2,
                  lineHeight: 18,
                }}
              >
                {isPartner
                  ? "The student owns this schedule and it is read-only for partners."
                  : "Predefined study blocks are locked. Complete them to earn conversation time!"}
              </Text>
            </View>
          </View>
        )}

        {selectedTasks.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 50, gap: 12 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarDays size={32} color={colors.text3} />
            </View>
            <Text
              style={{ fontSize: 15, color: colors.text3, fontWeight: "600" }}
            >
              No tasks scheduled for this day
            </Text>
          </View>
        ) : (
          selectedTasks.map((task) => {
            const subjectColor = getSubjectColor(task.subject);
            const isCompleted = task.status === "completed";
            const isActive = task.status === "active";

            return (
              <Pressable
                key={task.id}
                onPress={() => {
                  if (!isPartner) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/task/${task.id}`);
                  }
                }}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                })}
              >
                <Card
                  variant="default"
                  padding={16}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    opacity: isCompleted ? 0.65 : 1,
                  }}
                >
                  <Pressable
                    disabled={isPartner}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleTaskComplete(task.id);
                    }}
                    style={({ pressed }) => ({
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      borderWidth: 1.8,
                      borderColor: isCompleted ? colors.success : colors.border,
                      backgroundColor: isCompleted
                        ? colors.success
                        : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: [{ scale: pressed && !isPartner ? 0.9 : 1 }],
                    })}
                  >
                    {isCompleted && (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </Pressable>

                  <View
                    style={{
                      width: 4,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: subjectColor,
                    }}
                  />

                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <SubjectChip subject={task.subject} />
                      {isCompleted && (
                        <Badge label="Done" variant="success" size="sm" />
                      )}
                      {isActive && (
                        <Badge label="Active" variant="primary" size="sm" />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: colors.text,
                        textDecorationLine: isCompleted
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {task.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.text3,
                        marginTop: 2,
                        fontWeight: "500",
                      }}
                    >
                      {formatTimeShort(task.startTime)} -{" "}
                      {formatTimeShort(task.endTime)} · {task.targetMinutes}m
                    </Text>
                  </View>

                  {!isPartner && (
                    <ChevronRight size={18} color={colors.text3} />
                  )}
                </Card>
              </Pressable>
            );
          })
        )}

        {!isPartner && !isLocked && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/task-create");
            }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 16,
              borderRadius: 20,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: colors.primary + "35",
              borderStyle: "dashed",
              marginTop: 4,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.primaryLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={16} color={colors.primary} strokeWidth={2.5} />
            </View>
            <Text
              style={{ fontSize: 15, fontWeight: "700", color: colors.primary }}
            >
              Add Study Block
            </Text>
          </Pressable>
        )}

        {!isPartner && (
          <View style={{ marginTop: 12 }}>
            <Button
              title={
                isLocked
                  ? "Unlock Week (Break Contract)"
                  : "Lock This Week Plan 🔒"
              }
              variant={isLocked ? "secondary" : "primary"}
              size="lg"
              icon={
                isLocked ? (
                  <Unlock size={18} color={colors.text} />
                ) : (
                  <Lock size={18} color="#FFFFFF" />
                )
              }
              onPress={handleToggleLock}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
