import React from "react";
import { Image, ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/hooks/use-theme";
import { useAuthStore } from "@/features/auth/store";
import { AnimatedEntrance } from "@/components/ui/animated";
import { BookOpen, Users, ChevronRight } from "lucide-react-native";

export default function RoleSelectScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { setSelectedRole } = useAuthStore();
  const authBackground = "#0E61E8";

  const handleSelect = (role: "student" | "partner") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(role);
    router.push(`/(auth)/${role}/login` as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: authBackground }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <AnimatedEntrance delay={0}>
          <View style={{ marginHorizontal: -24, marginBottom: 26, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden", backgroundColor: authBackground }}>
            <Image
              source={require("../../../assets/images/authpage.jpg")}
              accessibilityLabel="Students studying together"
              resizeMode="cover"
              style={{ width: "100%", height: 286 }}
            />
          </View>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 38, fontWeight: "800", color: colors.white, letterSpacing: -0.5 }}>
              Padhai Karo
            </Text>
            <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.84)", lineHeight: 24, fontWeight: "500" }}>
              Plan it. Lock it. Focus on it.{"\n"}Measure it. Improve it.
            </Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={150}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.72)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 32, marginBottom: 14 }}>
            Choose your role
          </Text>
        </AnimatedEntrance>

        <View style={{ gap: 16 }}>
          <AnimatedEntrance delay={250}>
            <Pressable
              onPress={() => handleSelect("student")}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 24,
                padding: 22,
                gap: 16,
                shadowColor: "#2C3E8C",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.06,
                shadowRadius: 16,
                elevation: 3,
                borderWidth: 1.5,
                borderColor: pressed ? colors.primary : colors.borderLight,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: colors.primaryLight,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={28} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 19, fontWeight: "800", color: colors.text, letterSpacing: -0.3 }}>
                  Student
                </Text>
                <Text style={{ fontSize: 13, color: colors.text2, marginTop: 3, fontWeight: "500" }}>
                  Create plans, track focus, improve daily
                </Text>
              </View>
              <ChevronRight size={20} color={colors.text3} />
            </Pressable>
          </AnimatedEntrance>

          <AnimatedEntrance delay={350}>
            <Pressable
              onPress={() => handleSelect("partner")}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 24,
                padding: 22,
                gap: 16,
                shadowColor: "#2C3E8C",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.06,
                shadowRadius: 16,
                elevation: 3,
                borderWidth: 1.5,
                borderColor: pressed ? colors.accent : colors.borderLight,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: "#FFF4E5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={28} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 19, fontWeight: "800", color: colors.text, letterSpacing: -0.3 }}>
                  Partner
                </Text>
                <Text style={{ fontSize: 13, color: colors.text2, marginTop: 3, fontWeight: "500" }}>
                  Support someone's study journey, send cheer
                </Text>
              </View>
              <ChevronRight size={20} color={colors.text3} />
            </Pressable>
          </AnimatedEntrance>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
