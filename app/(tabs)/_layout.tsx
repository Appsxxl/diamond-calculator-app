import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useCalculator } from "@/lib/calculator-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { partnerMode } = useCalculator();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#64748b",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "#0f172a",
          borderTopColor: "#1e293b",
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scenario-tool"
        options={{
          title: "Scenario",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="strategy-engineer"
        options={{
          title: "Strategy",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="lightbulb.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="affiliate"
        options={{
          title: "Advisers",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.2.fill" color={color} />,
          href: partnerMode ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="partner-tools"
        options={{
          title: "Advisers",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="briefcase.fill" color={color} />,
          href: partnerMode ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: "Videos",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="play.rectangle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="compliance"
        options={{
          title: "Compliance",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="shield.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
