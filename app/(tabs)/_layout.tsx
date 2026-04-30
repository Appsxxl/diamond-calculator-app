import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform, View, Text } from "react-native";
import { useCalculator } from "@/lib/calculator-context";

/**
 * TAB LAYOUT — Plan B Diamond Solution
 *
 * CLIENT TABS (always visible):
 *   🏠 Home         — Dashboard & goal cards
 *   📊 Strategy     — Client calculator (formerly Scenario)
 *   💡 Architect    — Plan B Strategy Engineer
 *   📺 Videos       — Content library
 *   🛡️ Compliance   — Legal & compliance docs
 *   ⚙️ Settings     — App preferences
 *   🌐 Language     — Globe icon: instant language switcher (all 13 languages)
 *
 * ADVISER TABS (partner mode only):
 *   🤝 Affiliate    — Private back-office: Referral Link + Call List + Pool
 *   💼 Advisers     — Full command centre: Revenue Model + Client Tools
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { partnerMode, language } = useCalculator();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight  = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   "#e67e22",  // Gold for active tab
        tabBarInactiveTintColor: "#64748b",
        headerShown:  false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop:       8,
          paddingBottom:    bottomPadding,
          height:           tabBarHeight,
          backgroundColor:  "#0f172a",
          borderTopColor:   "#1e293b",
          borderTopWidth:   0.5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      {/* ══ CLIENT-FACING TABS ════════════════════════════════════════════ */}

      {/* 🏠 Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />

      {/* 📊 Strategy — client-facing calculator */}
      <Tabs.Screen
        name="scenario-tool"
        options={{
          title: "Strategy",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
        }}
      />

      {/* 💡 Plan B Architect */}
      <Tabs.Screen
        name="strategy-engineer"
        options={{
          title: "Architect",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="lightbulb.fill" color={color} />,
        }}
      />

      {/* 📺 Videos */}
      <Tabs.Screen
        name="videos"
        options={{
          title: "Videos",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="play.rectangle.fill" color={color} />,
        }}
      />

      {/* 🛡️ Compliance */}
      <Tabs.Screen
        name="compliance"
        options={{
          title: "Compliance",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="shield.fill" color={color} />,
        }}
      />

      {/* ⚙️ Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
        }}
      />

      {/* 🌐 Language Selector — Globe icon, always visible */}
      <Tabs.Screen
        name="language"
        options={{
          title: "Language",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <IconSymbol size={24} name="globe" color={color} />
            </View>
          ),
        }}
      />

      {/* ══ ADVISER-ONLY TABS (partnerMode = true) ═══════════════════════ */}

      {/*
       * 🤝 AFFILIATE — Private Adviser Back-Office
       * Contains: Referral Link (pinned) + Call List + Global Pool
       * Separation: Private tools, never shown to clients
       */}
      <Tabs.Screen
        name="affiliate"
        options={{
          title: "Affiliate",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
          href: partnerMode ? undefined : null,
        }}
      />

      {/*
       * 💼 ADVISERS — Full Adviser Command Centre
       * Contains: Revenue Model + Property Optimizer + Savings + Asset Planner
       * Separation: Client-facing calculation tools for Advisers
       */}
      <Tabs.Screen
        name="partner-tools"
        options={{
          title: "Advisers",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="briefcase.fill" color={color} />,
          href: partnerMode ? undefined : null,
        }}
      />
    </Tabs>
  );
}
