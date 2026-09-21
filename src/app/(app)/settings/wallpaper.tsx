import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useThemeColors, useIsDark } from "@/hooks/use-theme";
import { useSettingsStore } from "@/features/settings/store";
import {
  WALLPAPER_PRESETS,
  resolveWallpaperSource,
  type WallpaperItem,
} from "@/constants/wallpapers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedEntrance } from "@/components/ui/animated";
import {
  ArrowLeft,
  Check,
  Eye,
  RotateCcw,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  X,
  Layers,
} from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2;

export default function WallpaperScreen() {
  const colors = useThemeColors();
  const isDark = useIsDark();
  const router = useRouter();

  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const wallpaperDim = useSettingsStore((s) => s.wallpaperDim);
  const wallpaperBlur = useSettingsStore((s) => s.wallpaperBlur);
  const setWallpaper = useSettingsStore((s) => s.setWallpaper);
  const setWallpaperDim = useSettingsStore((s) => s.setWallpaperDim);
  const setWallpaperBlur = useSettingsStore((s) => s.setWallpaperBlur);
  const resetWallpaper = useSettingsStore((s) => s.resetWallpaper);

  const [previewItem, setPreviewItem] = useState<WallpaperItem | null>(null);

  const currentPreset = WALLPAPER_PRESETS.find((w) => w.id === wallpaper);
  const isCustomActive = wallpaper && wallpaper !== "none";

  const handleSelectWallpaper = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWallpaper(id);
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetWallpaper();
  };

  const dimPresets = [
    { label: "Light", value: 0.2 },
    { label: "Medium", value: 0.38 },
    { label: "Deep", value: 0.58 },
    { label: "Focus", value: 0.75 },
  ];

  const blurPresets = [
    { label: "Crisp (0)", value: 0 },
    { label: "Soft (4)", value: 4 },
    { label: "Frosted (10)", value: 10 },
  ];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isCustomActive ? "transparent" : colors.background,
      }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnimatedEntrance delay={0}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 4,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#3D5CF5",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 26, fontWeight: "800", color: colors.text }}
              >
                Background Wallpaper
              </Text>
              <Text style={{ fontSize: 13, color: colors.text2, marginTop: 2 }}>
                Personalize your whole app background locally
              </Text>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Current Active Wallpaper Status Banner */}
        <AnimatedEntrance delay={80}>
          <Card
            variant="elevated"
            padding={16}
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: colors.surface2,
                  borderWidth: 2,
                  borderColor: isCustomActive ? colors.primary : colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {currentPreset ? (
                  <Image
                    source={currentPreset.source}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <ImageIcon size={24} color={colors.text3} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    {currentPreset?.title ?? "Default Clean Theme"}
                  </Text>
                  <Badge
                    label={isCustomActive ? "Active" : "Default"}
                    variant={isCustomActive ? "success" : "default"}
                    size="sm"
                  />
                </View>
                <Text
                  style={{ fontSize: 12, color: colors.text3, marginTop: 2 }}
                >
                  {currentPreset?.subtitle ??
                    "Using default clean minimalist background"}
                </Text>
              </View>

              {isCustomActive && (
                <Pressable
                  onPress={handleReset}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: colors.danger + "15",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <RotateCcw size={14} color={colors.danger} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: colors.danger,
                    }}
                  >
                    Reset
                  </Text>
                </Pressable>
              )}
            </View>
          </Card>
        </AnimatedEntrance>

        {/* Wallpaper Customization Controls */}
        {isCustomActive && (
          <AnimatedEntrance delay={140}>
            <Card variant="default" padding={16} style={{ gap: 14 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Sliders size={18} color={colors.primary} />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Overlay & Contrast
                </Text>
              </View>

              {/* Dimming */}
              <View style={{ gap: 6 }}>
                <Text
                  style={{ fontSize: 13, color: colors.text2, fontWeight: "600" }}
                >
                  Dimming (Better text readability)
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {dimPresets.map((preset) => {
                    const isSelected =
                      Math.abs(wallpaperDim - preset.value) < 0.05;
                    return (
                      <Pressable
                        key={preset.label}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setWallpaperDim(preset.value);
                        }}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 12,
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.surface2,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: isSelected ? "700" : "500",
                            color: isSelected ? colors.white : colors.text2,
                          }}
                        >
                          {preset.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Blur */}
              <View style={{ gap: 6 }}>
                <Text
                  style={{ fontSize: 13, color: colors.text2, fontWeight: "600" }}
                >
                  Background Softness
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {blurPresets.map((preset) => {
                    const isSelected = wallpaperBlur === preset.value;
                    return (
                      <Pressable
                        key={preset.label}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setWallpaperBlur(preset.value);
                        }}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 12,
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.surface2,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: isSelected ? "700" : "500",
                            color: isSelected ? colors.white : colors.text2,
                          }}
                        >
                          {preset.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Card>
          </AnimatedEntrance>
        )}

        {/* Wallpaper Grid */}
        <AnimatedEntrance delay={180}>
          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Sparkles size={18} color={colors.accent} />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Visual Previews ({WALLPAPER_PRESETS.length})
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.text3 }}>
                Tap thumbnail to apply
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "space-between",
              }}
            >
              {WALLPAPER_PRESETS.map((item, index) => {
                const isSelected = wallpaper === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectWallpaper(item.id)}
                    style={{
                      width: CARD_WIDTH,
                      borderRadius: 20,
                      overflow: "hidden",
                      backgroundColor: colors.surface,
                      borderWidth: isSelected ? 2.5 : 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                      shadowColor: isSelected ? colors.primary : "#3D5CF5",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.22 : 0.06,
                      shadowRadius: 12,
                      elevation: isSelected ? 5 : 2,
                    }}
                  >
                    {/* Visual Thumbnail */}
                    <View
                      style={{
                        width: "100%",
                        height: 140,
                        backgroundColor: colors.surface2,
                        position: "relative",
                      }}
                    >
                      <Image
                        source={item.source}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />

                      {/* Selection Checkmark */}
                      {isSelected && (
                        <View
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: colors.primary,
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                          }}
                        >
                          <Check size={16} color={colors.white} strokeWidth={3} />
                        </View>
                      )}

                      {/* Fullscreen Preview Action Button */}
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setPreviewItem(item);
                        }}
                        style={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 5,
                          borderRadius: 10,
                          backgroundColor: "rgba(0,0,0,0.65)",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Eye size={12} color="#FFF" />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: "#FFF",
                          }}
                        >
                          Preview
                        </Text>
                      </Pressable>
                    </View>

                    {/* Meta */}
                    <View style={{ padding: 12, gap: 3 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: colors.text,
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.text3,
                        }}
                        numberOfLines={1}
                      >
                        {item.subtitle}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </AnimatedEntrance>
      </ScrollView>

      {/* Fullscreen Preview Modal */}
      {previewItem && (
        <Modal
          visible={true}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setPreviewItem(null)}
        >
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <Image
              source={previewItem.source}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            {/* Scrim Overlay */}
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark ? "#0D111D" : "#EFF2F9",
                  opacity: wallpaperDim,
                },
              ]}
            />

            <SafeAreaView
              style={{
                flex: 1,
                justifyContent: "space-between",
                padding: 20,
              }}
            >
              {/* Modal Top Bar */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "700", color: "#FFF" }}
                  >
                    {previewItem.title}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setPreviewItem(null)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={20} color="#FFF" />
                </Pressable>
              </View>

              {/* Sample Mock App Card */}
              <View style={{ gap: 12 }}>
                <Card
                  variant="elevated"
                  padding={18}
                  style={{ borderRadius: 24 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: colors.primary + "15",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Layers size={22} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: colors.text,
                        }}
                      >
                        Live UI Preview
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.text3,
                          marginTop: 2,
                        }}
                      >
                        This is how your tasks & cards will look
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Apply Button */}
                <Button
                  title={
                    wallpaper === previewItem.id
                      ? "Currently Active"
                      : "Set as Background Wallpaper"
                  }
                  variant={wallpaper === previewItem.id ? "secondary" : "primary"}
                  icon={
                    wallpaper === previewItem.id ? (
                      <Check size={18} color={colors.text} />
                    ) : (
                      <Sparkles size={18} color="#FFF" />
                    )
                  }
                  onPress={() => {
                    handleSelectWallpaper(previewItem.id);
                    setPreviewItem(null);
                  }}
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
