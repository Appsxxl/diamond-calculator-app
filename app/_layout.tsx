import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform, Text } from "react-native";
import "@/lib/_core/nativewind-pressable";

// Prevent OPPO/ColorOS from injecting text-shadow or stroke on every Text node.
// CSS has no effect on native Android — this RN defaultProps approach covers the APK.
if (Platform.OS === "android") {
  const textDefaults = (Text as any).defaultProps ?? {};
  (Text as any).defaultProps = {
    ...textDefaults,
    style: [
      { textShadowColor: "transparent", textShadowRadius: 0, textShadowOffset: { width: 0, height: 0 } },
      textDefaults.style,
    ],
  };
}
import { ThemeProvider } from "@/lib/theme-provider";
import { CalculatorProvider } from "@/lib/calculator-context";
import { DisclaimerModal } from "@/components/disclaimer-modal";
import { OfflineBanner } from "@/components/offline-banner";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { initializePurchases } from "@/lib/purchases";

function AuthGate({ children }: { children: React.ReactNode }) {
  // Auth is optional — users can access the app without logging in.
  // Re-enable the redirect below once backend + email are fully configured.
  return <>{children}</>;
}

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  useEffect(() => {
    initializePurchases();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <CalculatorProvider>
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="auth/verify" />
                <Stack.Screen name="scenario-tool" />
                <Stack.Screen name="strategy-engineer" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="help-article" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="faq" />
                <Stack.Screen name="activate" />
                <Stack.Screen name="paywall" />
                <Stack.Screen name="admin" />
              </Stack>
            </AuthGate>
            <StatusBar style="auto" />
            <DisclaimerModal />
            <OfflineBanner />
          </CalculatorProvider>
        </QueryClientProvider>
      </trpc.Provider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );

  if (Platform.OS === "web") {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>
        {content}
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
