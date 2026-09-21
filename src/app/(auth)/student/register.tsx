import React, { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/hooks/use-theme";
import { useAuthStore } from "@/features/auth/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedEntrance } from "@/components/ui/animated";
import { User, Mail, Lock, ArrowLeft, BookOpen } from "lucide-react-native";

export default function StudentRegisterScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { register } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Required", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: "student",
      });
      router.replace("/(app)/(tabs)/home" as any);
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 28 }}>
          <AnimatedEntrance delay={0}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
                  shadowColor: "#3D5CF5",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  elevation: 2,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                })}
              >
                <ArrowLeft size={20} color={colors.text} strokeWidth={2.2} />
              </Pressable>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.primaryLight,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={20} color={colors.primary} />
              </View>
            </View>
          </AnimatedEntrance>

          <AnimatedEntrance delay={100}>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 32, fontWeight: "800", color: colors.text, letterSpacing: -0.5 }}>
                Student Sign Up
              </Text>
              <Text style={{ fontSize: 15, color: colors.text2, lineHeight: 22, fontWeight: "500" }}>
                Start your focus journey today
              </Text>
            </View>
          </AnimatedEntrance>

          <AnimatedEntrance delay={200}>
            <Card variant="elevated" padding={24} style={{ gap: 16 }}>
              <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                leftIcon={<User size={18} color={colors.text3} />}
              />
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={colors.text3} />}
              />
              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.text3} />}
              />
              <Button
                title="Create Account"
                size="lg"
                loading={loading}
                onPress={handleRegister}
              />
            </Card>
          </AnimatedEntrance>

          <AnimatedEntrance delay={350}>
            <View style={{ alignItems: "center" }}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
              >
                <Text style={{ fontSize: 14, color: colors.text2, fontWeight: "500" }}>
                  Already have an account?{" "}
                  <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign In</Text>
                </Text>
              </Pressable>
            </View>
          </AnimatedEntrance>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
