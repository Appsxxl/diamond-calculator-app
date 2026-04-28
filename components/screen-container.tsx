import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply. Defaults to ["top", "left", "right"].
   * Bottom is typically handled by Tab Bar.
   */
  edges?: Edge[];
  /**
   * Tailwind className for the content area.
   */
  className?: string;
  /**
   * Additional className for the outer container (background layer).
   * NOTE: On Android APK builds, arbitrary Tailwind values like bg-[#0f172a] may not resolve.
   * Use the bgColor prop for a guaranteed native background color instead.
   */
  containerClassName?: string;
  /**
   * Additional className for the SafeAreaView (content layer).
   */
  safeAreaClassName?: string;
  /**
   * Explicit background color for the outer container.
   * Use this instead of containerClassName when you need a specific color on native Android.
   * e.g. bgColor="#0f172a"
   *
   * When provided, ALL layers (outer View, SafeAreaView, inner content View) will use this
   * explicit color via the `style` prop — bypassing NativeWind CSS variables entirely.
   * This is required for correct rendering on Android APK builds.
   */
  bgColor?: string;
}

/**
 * A container component that properly handles SafeArea and background colors.
 *
 * The outer View extends to full screen (including status bar area) with the background color,
 * while the inner SafeAreaView ensures content is within safe bounds.
 *
 * IMPORTANT: When bgColor is provided, all layers use explicit style props (not NativeWind
 * className) to ensure correct color rendering on Android APK builds where CSS variables
 * (var(--color-*)) are not supported.
 *
 * Usage:
 * ```tsx
 * <ScreenContainer className="p-4" bgColor="#0f172a">
 *   <Text style={{ color: "#fff" }}>Welcome</Text>
 * </ScreenContainer>
 * ```
 */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  bgColor,
  style,
  ...props
}: ScreenContainerProps) {
  if (bgColor) {
    // When bgColor is explicitly provided, bypass NativeWind CSS variables entirely.
    // Use only React Native `style` props so Android APK renders the correct color.
    return (
      <View
        style={{ flex: 1, backgroundColor: bgColor }}
        {...props}
      >
        <SafeAreaView
          edges={edges}
          style={[{ flex: 1, backgroundColor: bgColor }, style]}
        >
          <View style={{ flex: 1, backgroundColor: bgColor }}>{children}</View>
        </SafeAreaView>
      </View>
    );
  }

  // Default path: use NativeWind className (works on web and when ThemeProvider vars are set)
  return (
    <View
      className={cn("flex-1", "bg-background", containerClassName)}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={style}
      >
        <View className={cn("flex-1", className)}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
