import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SubjectChip } from "@/components/ui/subject-chip";
import { usePlanStore } from "@/features/planner/store";
import { useThemeColors } from "@/hooks/use-theme";
import { formatDurationShort, formatTimeShort } from "@/lib/date";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, BookOpen, Clock, Play } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TaskDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const task = usePlanStore((state) =>
    state.tasks.find((item) => item.id === id),
  );

  React.useEffect(() => {
    if (!task) usePlanStore.getState().fetchTasksFromApi();
  }, [task]);

  if (!task) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        <EmptyState
          icon={<BookOpen size={32} color={colors.primary} />}
          title="Task unavailable"
          description="This task may have been removed or is still loading."
        />
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
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
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
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: colors.text,
              letterSpacing: -0.3,
            }}
          >
            Task Details
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 4,
          }}
        >
          <SubjectChip subject={task.subject} size="md" />
          <Badge
            label={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            variant={
              task.status === "completed"
                ? "success"
                : task.status === "active"
                  ? "primary"
                  : "default"
            }
          />
          {task.priority === "high" && (
            <Badge label="High Priority" variant="danger" size="sm" />
          )}
        </View>

        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            color: colors.text,
            letterSpacing: -0.5,
          }}
        >
          {task.title}
        </Text>

        {/* Time Info */}
        <Card variant="default" padding={16}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Clock size={20} color={colors.primary} />
            <View>
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
              >
                {formatTimeShort(task.startTime)} -{" "}
                {formatTimeShort(task.endTime)}
              </Text>
              <Text style={{ fontSize: 13, color: colors.text3 }}>
                {formatDurationShort(task.targetMinutes * 60 * 1000)} planned
              </Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        {task.description && (
          <Card variant="default" padding={16}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <BookOpen
                size={20}
                color={colors.text3}
                style={{ marginTop: 2 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text2,
                  lineHeight: 22,
                  flex: 1,
                }}
              >
                {task.description}
              </Text>
            </View>
          </Card>
        )}

        {/* Start Focus */}
        {task.status === "active" && (
          <Button
            title="Start Focus Session"
            size="lg"
            icon={<Play size={20} color="#FFFFFF" />}
            onPress={() => router.push("/(app)/(tabs)/focus")}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
