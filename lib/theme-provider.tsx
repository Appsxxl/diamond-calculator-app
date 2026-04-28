import { createContext, useContext, useEffect, useMemo } from "react";
import { View } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

// App is locked to dark navy theme — no light/dark toggle
const FIXED_SCHEME: ColorScheme = "dark";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Lock NativeWind to dark
    nativewindColorScheme.set("dark");
    // Apply CSS variables for web
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = "dark";
      root.classList.add("dark");
      const palette = SchemeColors["dark"];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary":    SchemeColors["dark"].primary,
        "color-background": SchemeColors["dark"].background,
        "color-surface":    SchemeColors["dark"].surface,
        "color-foreground": SchemeColors["dark"].foreground,
        "color-muted":      SchemeColors["dark"].muted,
        "color-border":     SchemeColors["dark"].border,
        "color-success":    SchemeColors["dark"].success,
        "color-warning":    SchemeColors["dark"].warning,
        "color-error":      SchemeColors["dark"].error,
      }),
    [],
  );

  const value = useMemo(
    () => ({
      colorScheme: FIXED_SCHEME,
      // setColorScheme is a no-op — theme is locked
      setColorScheme: (_scheme: ColorScheme) => {},
    }),
    [],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
