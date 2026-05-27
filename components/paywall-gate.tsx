import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useUserStatus } from "@/hooks/use-user-status";

type Props = {
  children: React.ReactNode;
};

export function PaywallGate({ children }: Props) {
  const router = useRouter();
  const { isExpired, isLoading } = useUserStatus();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#f59e0b" />
      </View>
    );
  }

  if (isExpired) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center", padding: 32 }}>
        <Text style={{ fontSize: 52, marginBottom: 20 }}>🔒</Text>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#f1f5f9", textAlign: "center", marginBottom: 10 }}>
          Trial Ended
        </Text>
        <Text style={{ fontSize: 16, color: "#94a3b8", textAlign: "center", lineHeight: 24, marginBottom: 32 }}>
          Subscribe to Pro to access all adviser tools, letters, and analytics.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#f59e0b",
            borderRadius: 14,
            paddingVertical: 16,
            paddingHorizontal: 40,
            marginBottom: 16,
          }}
          onPress={() => router.push("/paywall" as any)}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#0f172a" }}>View Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/activate" as any)} activeOpacity={0.7}>
          <Text style={{ fontSize: 14, color: "#64748b" }}>Have an activation code?</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}
