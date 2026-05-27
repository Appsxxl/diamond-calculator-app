import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function ActivateScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [activated, setActivated] = useState(false);

  const { mutate: redeemCode, isPending } = trpc.activation.redeemCode.useMutation({
    onSuccess: () => {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setActivated(true);
    },
    onError: (err) => {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (Platform.OS === "web") {
        window.alert(err.message);
      } else {
        Alert.alert("Activation Failed", err.message);
      }
    },
  });

  const handleSubmit = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    redeemCode({ code: trimmed });
  };

  if (activated) {
    return (
      <ScreenContainer bgColor="#0f172a">
        <View style={S.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginRight: 12 }]}
          >
            <Text style={S.backArrow}>←</Text>
          </Pressable>
          <Text style={S.headerTitle}>Team Access</Text>
        </View>
        <View style={S.successContainer}>
          <View style={S.successBadge}>
            <Text style={S.successIcon}>★</Text>
            <Text style={S.successTitle}>Team Access Active</Text>
            <Text style={S.successSub}>
              You now have lifetime access to all features. Welcome to the team.
            </Text>
          </View>
          <TouchableOpacity
            style={S.doneBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={S.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer bgColor="#0f172a">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={S.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginRight: 12 }]}
          >
            <Text style={S.backArrow}>←</Text>
          </Pressable>
          <Text style={S.headerTitle}>Activate Team Access</Text>
        </View>

        <View style={S.body}>
          <Text style={S.desc}>
            Enter your team activation code to unlock lifetime access to all features.
          </Text>

          <View style={S.card}>
            <TextInput
              style={S.input}
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              placeholder="e.g. TEAM-DOUGLAS-2026"
              placeholderTextColor="#475569"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <TouchableOpacity
            style={[S.activateBtn, (!code.trim() || isPending) && S.activateBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={!code.trim() || isPending}
          >
            <Text style={S.activateBtnText}>
              {isPending ? "Verifying..." : "Activate"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const S = {
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backArrow: { fontSize: 22, color: "#e2e8f0" },
  headerTitle: { fontSize: 22, fontWeight: "700" as const, color: "#e2e8f0", flex: 1 },
  body: { paddingHorizontal: 24, paddingTop: 32, gap: 20 },
  desc: { fontSize: 16, color: "#94a3b8", lineHeight: 24 },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden" as const,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#f1f5f9",
    letterSpacing: 1.5,
  },
  activateBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center" as const,
  },
  activateBtnDisabled: { opacity: 0.4 },
  activateBtnText: { fontSize: 17, fontWeight: "700" as const, color: "#0f172a" },
  // Success state
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 32,
    alignItems: "center" as const,
  },
  successBadge: {
    backgroundColor: "rgba(245,158,11,0.1)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    borderRadius: 20,
    padding: 32,
    alignItems: "center" as const,
    gap: 12,
    width: "100%" as const,
  },
  successIcon: { fontSize: 48, color: "#f59e0b" },
  successTitle: { fontSize: 24, fontWeight: "700" as const, color: "#f59e0b", textAlign: "center" as const },
  successSub: { fontSize: 16, color: "#94a3b8", textAlign: "center" as const, lineHeight: 24 },
  doneBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: "center" as const,
  },
  doneBtnText: { fontSize: 17, fontWeight: "700" as const, color: "#0f172a" },
};
