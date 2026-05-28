import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Auth from "@/lib/_core/auth";
import { trpc } from "@/lib/trpc";

type Stage = "email" | "otp" | "done";

export default function LoginScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const requestMutation = trpc.auth.requestMagicLink.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();

  const utils = trpc.useUtils();

  async function handleSend() {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    try {
      await requestMutation.mutateAsync({ email: trimmed });
      setStage("otp");
    } catch (e: any) {
      setError(e?.message ?? "Failed to send — try again");
    }
  }

  async function handleVerify() {
    setError(null);
    const code = otp.trim();
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    try {
      const { sessionToken, user } = await verifyOtpMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        otp: code,
      });

      await Auth.setSessionToken(sessionToken);
      await Auth.setUserInfo({
        id: user.id,
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        lastSignedIn: new Date(user.lastSignedIn),
      });

      // Set cache directly so AuthGate sees the user before navigation
      utils.auth.me.setData(undefined, {
        id: user.id,
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        lastSignedIn: new Date(user.lastSignedIn),
        role: user.role as "user" | "admin",
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      setStage("done");
      router.replace("/(tabs)" as any);
    } catch (e: any) {
      setError(e?.message ?? "Invalid or expired code");
    }
  }

  const isLoading = requestMutation.isPending || verifyOtpMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        {/* Logo / title */}
        <View className="mb-10 items-center">
          <Text className="text-4xl font-bold text-foreground">Plan B</Text>
          <Text className="mt-2 text-base text-muted-foreground">Strategic Wealth Optimisation</Text>
        </View>

        {stage === "email" && (
          <>
            <Text className="mb-2 text-sm font-medium text-foreground">Email address</Text>
            <TextInput
              className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground"
              placeholder="you@example.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!isLoading}
            />
            {error && <Text className="mb-3 text-sm text-red-500">{error}</Text>}
            <TouchableOpacity
              className="items-center rounded-xl bg-primary py-4"
              onPress={handleSend}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-primary-foreground">
                  Send sign-in link
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {stage === "otp" && (
          <>
            <Text className="mb-1 text-sm text-muted-foreground text-center">
              Check your email at
            </Text>
            <Text className="mb-6 text-base font-semibold text-foreground text-center">
              {email}
            </Text>
            <Text className="mb-1 text-sm text-muted-foreground text-center">
              Click the link in your email, or enter the 6-digit code below:
            </Text>
            <TextInput
              className="my-4 rounded-xl border border-border bg-card px-4 py-4 text-3xl font-bold text-foreground text-center tracking-widest"
              placeholder="000000"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              onSubmitEditing={handleVerify}
              returnKeyType="done"
              editable={!isLoading}
            />
            {error && <Text className="mb-3 text-sm text-red-500 text-center">{error}</Text>}
            <TouchableOpacity
              className="items-center rounded-xl bg-primary py-4"
              onPress={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-primary-foreground">Verify code</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-4 items-center py-2"
              onPress={() => {
                setStage("email");
                setOtp("");
                setError(null);
              }}
            >
              <Text className="text-sm text-muted-foreground">Use a different email</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
