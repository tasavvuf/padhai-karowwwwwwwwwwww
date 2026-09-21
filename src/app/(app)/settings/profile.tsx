import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme";
import { useAuthStore } from "@/features/auth/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { AnimatedEntrance } from "@/components/ui/animated";
import { ArrowLeft, User, Mail, Save } from "lucide-react-native";

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 800);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 24 }} keyboardShouldPersistTaps="handled">
        <AnimatedEntrance delay={0}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>Profile</Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={100}>
          <View style={{ alignItems: "center", gap: 12 }}>
            <Avatar name={user?.name ?? "User"} size={80} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.text3 }}>Tap to change photo</Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={200}>
          <View style={{ gap: 16 }}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={18} color={colors.text3} />}
            />
            <Input
              label="Email"
              value={user?.email ?? ""}
              editable={false}
              leftIcon={<Mail size={18} color={colors.text3} />}
            />
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={300}>
          <Button
            title="Save Changes"
            size="lg"
            loading={loading}
            icon={<Save size={18} color="#FFFFFF" />}
            onPress={handleSave}
          />
        </AnimatedEntrance>
      </ScrollView>
    </SafeAreaView>
  );
}
