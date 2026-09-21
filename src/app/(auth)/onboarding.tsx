import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { AnimatedEntrance } from "@/components/ui/animated";
import { CheckCircle2, Clock, Users, Shield } from "lucide-react-native";

const STEPS = [
  {
    icon: <Clock size={32} color="#FFFFFF" strokeWidth={2.2} />,
    title: "Plan Your Week",
    description: "Create a structured study schedule with specific subjects and time blocks.",
    color: "#3D5CF5",
  },
  {
    icon: <Shield size={32} color="#FFFFFF" strokeWidth={2.2} />,
    title: "Lock Your Plan",
    description: "Commit to your schedule. Once locked, the plan is set for the week.",
    color: "#FFA940",
  },
  {
    icon: <CheckCircle2 size={32} color="#FFFFFF" strokeWidth={2.2} />,
    title: "Stay Focused",
    description: "Start focus sessions. The app tracks your actual study time.",
    color: "#00C9A7",
  },
  {
    icon: <Users size={32} color="#FFFFFF" strokeWidth={2.2} />,
    title: "Stay Accountable",
    description: "Your partner can see your progress and cheer you on.",
    color: "#FF6B8B",
  },
];

export default function OnboardingScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.replace("/(auth)/index" as any);
    } else {
      setStep(step + 1);
    }
  };

  const current = STEPS[step];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 32,
            padding: 32,
            alignItems: "center",
            shadowColor: "#3D5CF5",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 4,
            gap: 28,
          }}
        >
          <AnimatedEntrance delay={0}>
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: current.color,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: current.color,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.28,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              {current.icon}
            </View>
          </AnimatedEntrance>

          <AnimatedEntrance delay={150}>
            <View style={{ alignItems: "center", gap: 10, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text, textAlign: "center", letterSpacing: -0.4 }}>
                {current.title}
              </Text>
              <Text style={{ fontSize: 15, color: colors.text2, textAlign: "center", lineHeight: 22, fontWeight: "500" }}>
                {current.description}
              </Text>
            </View>
          </AnimatedEntrance>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === step ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === step ? colors.primary : colors.surface3,
                }}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={{ padding: 24, gap: 14 }}>
        <Button title={isLast ? "Get Started" : "Next"} size="lg" onPress={handleNext} />
        {!isLast && (
          <Pressable onPress={() => router.replace("/(auth)/index" as any)}>
            <Text style={{ fontSize: 14, color: colors.text3, textAlign: "center", fontWeight: "600" }}>
              Skip
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
