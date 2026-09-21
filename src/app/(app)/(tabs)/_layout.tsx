import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/features/auth/store";
import { Colors } from "@/constants/theme";
import {
  Home,
  CalendarCheck,
  Timer,
  BarChart3,
  Users,
  ShieldCheck,
  UserCheck,
} from "lucide-react-native";

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { user } = useAuthStore();
  const isPartner = user?.role === "partner";

  if (isPartner) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: "transparent" },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text3,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
            borderTopWidth: 1,
            height: 66,
            paddingTop: 8,
            paddingBottom: 10,
            shadowColor: "#3D5CF5",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 14,
            elevation: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.2,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Monitor",
            tabBarIcon: ({ color, size }) => <ShieldCheck size={size} color={color} strokeWidth={2.2} />,
          }}
        />
        <Tabs.Screen
          name="planner"
          options={{
            title: "Her Plan",
            tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} strokeWidth={2.2} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Analytics",
            tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} strokeWidth={2.2} />,
          }}
        />
        <Tabs.Screen
          name="partner"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => <UserCheck size={size} color={color} strokeWidth={2.2} />,
          }}
        />
        <Tabs.Screen
          name="focus"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text3,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
          shadowColor: "#3D5CF5",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 14,
          elevation: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Plan",
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: "Focus Clock",
          tabBarIcon: ({ color, size }) => <Timer size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="partner"
        options={{
          title: "Partner",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
