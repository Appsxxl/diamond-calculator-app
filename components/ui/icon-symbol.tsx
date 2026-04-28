// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  // Calculator / Scenario Tool
  "chart.bar.fill": "bar-chart",
  "chart.bar.xaxis": "bar-chart",
  // Strategy Engineer
  "brain.head.profile": "psychology",
  "lightbulb.fill": "lightbulb",
  // Settings
  "gearshape.fill": "settings",
  "gear": "settings",
  // Affiliate
  "person.2.fill": "people",
  "link": "link",
  "diamond.fill": "diamond",
  "star.fill": "star",
  "person.badge.plus": "person-add",
  // Partner Tools
  "briefcase.fill": "business-center",
  "person.3.fill": "groups",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
  // Compliance
  "shield.fill": "verified-user",
  "doc.text.fill": "description",
  // Videos
  "play.rectangle.fill": "smart-display",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
