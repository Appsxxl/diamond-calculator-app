import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Auth from "@/lib/_core/auth";
import { trpc } from "@/lib/trpc";

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; sessionToken?: string; user?: string }>();
  const [status, setStatus] = useState<"verifying" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verifyTokenMutation = trpc.auth.verifyToken.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    async function run() {
      try {
        // Path A: server already issued a session (passed as query param)
        if (params.sessionToken) {
          await Auth.setSessionToken(params.sessionToken);
          if (params.user) {
            try {
              const decoded =
                typeof atob !== "undefined"
                  ? atob(params.user)
                  : Buffer.from(params.user, "base64").toString("utf-8");
              const userData = JSON.parse(decoded);
              const userInfo = {
                id: userData.id,
                openId: userData.openId,
                name: userData.name,
                email: userData.email,
                loginMethod: userData.loginMethod,
                lastSignedIn: new Date(userData.lastSignedIn ?? Date.now()),
              };
              await Auth.setUserInfo(userInfo);
              utils.auth.me.setData(undefined, {
                ...userInfo,
                role: (userData.role ?? "user") as "user" | "admin",
                updatedAt: new Date(),
                createdAt: new Date(),
              });
            } catch {}
          }
          router.replace("/(tabs)" as any);
          return;
        }

        // Path B: raw token from email link — verify via tRPC
        if (params.token) {
          const { sessionToken, user } = await verifyTokenMutation.mutateAsync({
            token: params.token,
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
          router.replace("/(tabs)" as any);
          return;
        }

        setStatus("error");
        setErrorMsg("No token found in link");
      } catch (e: any) {
        setStatus("error");
        setErrorMsg(e?.message ?? "Link is invalid or expired");
      }
    }

    run();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center gap-4 px-6">
        {status === "verifying" && (
          <>
            <ActivityIndicator size="large" />
            <Text className="text-base text-foreground">Signing you in…</Text>
          </>
        )}
        {status === "error" && (
          <>
            <Text className="text-xl font-bold text-red-500">Link expired</Text>
            <Text className="text-center text-base text-muted-foreground">{errorMsg}</Text>
            <Text
              className="mt-4 text-sm text-primary underline"
              onPress={() => router.replace("/login" as any)}
            >
              Back to sign in
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
