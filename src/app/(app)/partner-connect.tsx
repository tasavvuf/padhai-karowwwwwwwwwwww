import React, { useEffect, useState } from "react";
import { Alert, Share, View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Copy, Share2 } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useAuthStore } from "@/features/auth/store";
import { useConnectPartner, useInviteCode } from "@/features/partner/hooks";

export default function PartnerConnectScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuthStore();
  const [inviteCode, setInviteCode] = useState("");
  const [myCode, setMyCode] = useState("");
  const inviteMutation = useInviteCode();
  const connectMutation = useConnectPartner();
  const isStudent = user?.role === "student";

  const createInviteCode = async () => {
    try {
      const result = await inviteMutation.mutateAsync();
      setMyCode(result.inviteCode);
    } catch (error: any) {
      Alert.alert("Could not create code", error.message || "Please try again.");
    }
  };

  useEffect(() => {
    if (isStudent) createInviteCode();
  }, [isStudent]);

  const handleCopyCode = async () => {
    if (!myCode) return;
    await Clipboard.setStringAsync(myCode);
    Alert.alert("Code copied", "Share it with your accountability partner.");
  };

  const handleShareCode = async () => {
    if (!myCode) return;
    await Share.share({ message: `Connect with me on Padhai Karo using my invite code: ${myCode}` });
  };

  const handleConnect = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      Alert.alert("Enter an invite code", "Ask the student to generate and share their code.");
      return;
    }
    try {
      const result = await connectMutation.mutateAsync(code);
      Alert.alert("Connected", `You can now view ${result.studentName}'s progress.`);
      router.back();
    } catch (error: any) {
      Alert.alert("Could not connect", error.message || "Check the code and try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100, gap: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Button
            title=""
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={20} color={colors.text} />}
            onPress={() => router.back()}
          />
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, marginLeft: 8 }}>
            Connect Partner
          </Text>
        </View>

        {isStudent ? (
          <Card variant="elevated" padding={24}>
            <Text style={{ fontSize: 14, color: colors.text3, marginBottom: 8 }}>
              Share your code with your partner
            </Text>
            <View style={{ backgroundColor: colors.surface2, borderRadius: 12, padding: 20, alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 28, fontWeight: "800", color: colors.primary, letterSpacing: 4 }}>
                {inviteMutation.isPending ? "········" : myCode || "Unavailable"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button title="Copy Code" variant="secondary" size="md" icon={<Copy size={16} color={colors.text} />} onPress={handleCopyCode} disabled={!myCode} style={{ flex: 1 }} />
              <Button title="Share" variant="secondary" size="md" icon={<Share2 size={16} color={colors.text} />} onPress={handleShareCode} disabled={!myCode} style={{ flex: 1 }} />
            </View>
          </Card>
        ) : (
          <Card variant="default" padding={20}>
            <Text style={{ fontSize: 14, color: colors.text3, marginBottom: 12 }}>
              Enter the student&apos;s invite code
            </Text>
          <Input
            placeholder="XXXXXXXX"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
          <View style={{ marginTop: 12 }}>
              <Button title="Connect" size="md" loading={connectMutation.isPending} onPress={handleConnect} />
          </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
