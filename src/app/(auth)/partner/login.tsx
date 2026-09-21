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
import { Mail, Lock, ArrowLeft, Users } from "lucide-react-native";

export default function PartnerLoginScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("tasavvuf@ldr.com");
  const [password, setPassword] = useState("partner123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await login(email.trim(), password);
      router.replace("/(app)/(tabs)/home" as any);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Invalid credentials. Please try again.");
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
                  backgroundColor: "#FFF4E5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={20} color={colors.accent} />
              </View>
            </View>
          </AnimatedEntrance>

          <AnimatedEntrance delay={100}>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 32, fontWeight: "800", color: colors.text, letterSpacing: -0.5 }}>
                Partner Sign In
              </Text>
              <Text style={{ fontSize: 15, color: colors.text2, lineHeight: 22, fontWeight: "500" }}>
                Support someone's study journey
              </Text>
            </View>
          </AnimatedEntrance>

          <AnimatedEntrance delay={200}>
            <Card variant="elevated" padding={24} style={{ gap: 16 }}>
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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.text3} />}
              />
              <Button
                title="Sign In"
                size="lg"
                loading={loading}
                onPress={handleLogin}
              />
            </Card>
          </AnimatedEntrance>

          <AnimatedEntrance delay={350}>
            <View style={{ alignItems: "center" }}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(auth)/partner/register" as any);
                }}
              >
                <Text style={{ fontSize: 14, color: colors.text2, fontWeight: "500" }}>
                  Don't have an account?{" "}
                  <Text style={{ color: colors.accent, fontWeight: "700" }}>Sign Up</Text>
                </Text>
              </Pressable>
            </View>
          </AnimatedEntrance>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
