import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, AlignLeft } from "lucide-react-native";
import { format, addDays } from "date-fns";

const SUBJECTS = ["Biology", "Physics", "Chemistry", "Mathematics", "English", "History", "Revision", "Other"];

export default function TaskCreateScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { date: format(d, "yyyy-MM-dd"), label: format(d, "EEE d") };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text, letterSpacing: -0.3 }}>
            New Task
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 13, color: colors.text2, fontWeight: "600", marginBottom: 10, marginLeft: 4 }}>
            Subject
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {SUBJECTS.map((s) => {
              const isSelected = subject === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSubject(s);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 9999,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    shadowColor: isSelected ? colors.primary : "#2C3E8C",
                    shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                    shadowOpacity: isSelected ? 0.25 : 0.04,
                    shadowRadius: isSelected ? 8 : 4,
                    elevation: isSelected ? 3 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: isSelected ? "#FFFFFF" : colors.text,
                    }}
                  >
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Input
          label="Title"
          placeholder="e.g., Human Physiology"
          value={title}
          onChangeText={setTitle}
          leftIcon={<BookOpen size={18} color={colors.text3} />}
        />

        <Input
          label="Description (optional)"
          placeholder="Notes about this session..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          leftIcon={<AlignLeft size={18} color={colors.text3} />}
        />

        <View>
          <Text style={{ fontSize: 13, color: colors.text2, fontWeight: "600", marginBottom: 10, marginLeft: 4 }}>
            Date
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {dates.map((d) => {
              const isSelected = selectedDate === d.date;
              return (
                <Pressable
                  key={d.date}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDate(d.date);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 18,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    alignItems: "center",
                    minWidth: 64,
                    shadowColor: isSelected ? colors.primary : "#2C3E8C",
                    shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                    shadowOpacity: isSelected ? 0.25 : 0.04,
                    shadowRadius: isSelected ? 8 : 4,
                    elevation: isSelected ? 3 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: isSelected ? "#FFFFFF" : colors.text,
                    }}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Start Time"
              placeholder="09:00"
              value={startTime}
              onChangeText={setStartTime}
              leftIcon={<Clock size={18} color={colors.text3} />}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="End Time"
              placeholder="11:00"
              value={endTime}
              onChangeText={setEndTime}
              leftIcon={<Clock size={18} color={colors.text3} />}
            />
          </View>
        </View>

        <Button
          title="Add Task"
          size="lg"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.back();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
