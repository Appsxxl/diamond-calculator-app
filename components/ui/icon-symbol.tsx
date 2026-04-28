import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, Platform, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chart.bar.fill": "bar-chart",
  "chart.bar.xaxis": "bar-chart",
  "brain.head.profile": "psychology",
  "lightbulb.fill": "lightbulb",
  "gearshape.fill": "settings",
  "gear": "settings",
  "person.2.fill": "people",
  "link": "link",
  "diamond.fill": "diamond",
  "star.fill": "star",
  "person.badge.plus": "person-add",
  "briefcase.fill": "business-center",
  "person.3.fill": "groups",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
  "shield.fill": "verified-user",
  "doc.text.fill": "description",
  "play.rectangle.fill": "smart-display",
} as IconMapping;

// Web-safe icon using Google Material Icons CSS class (CDN loaded)
function WebIcon({ name, size, color }: { name: string; size: number; color: string }) {
  return (
    <span
      className="material-icons"
      style={{
        fontSize: size,
        color: color as string,
        fontFamily: "Material Icons",
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 1,
        letterSpacing: "normal",
        textTransform: "none",
        display: "inline-block",
        whiteSpace: "nowrap",
        wordWrap: "normal",
        direction: "ltr",
        WebkitFontFeatureSettings: "'liga'",
        WebkitFontSmoothing: "antialiased",
        userSelect: "none",
      }}
    >
      {name}
    </span>
  );
}

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
  const iconName = MAPPING[name];

  if (Platform.OS === "web") {
    return <WebIcon name={iconName} size={size} color={color as string} />;
  }

  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
