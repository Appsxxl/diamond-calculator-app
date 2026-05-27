import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import {
  getAvailablePackages,
  purchasePackage,
  restorePurchases,
  type PurchasesPackage,
} from "@/lib/purchases";

const FEATURES = [
  "Unlimited strategy calculations",
  "Client letter generator (14 languages)",
  "Affiliate & Partner Tools",
  "Revenue model simulator",
  "Property & savings optimiser",
  "Pro Compensation calculator",
];

const FALLBACK_PRICES = { monthly: "$19.99", annual: "$149.99" };

export default function PaywallScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
  const [annualPkg, setAnnualPkg] = useState<PurchasesPackage | null>(null);
  const [packagesLoaded, setPackagesLoaded] = useState(false);

  const setPaidStatus = trpc.activation.setPaidStatus.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    getAvailablePackages().then(({ monthly, annual }) => {
      setMonthlyPkg(monthly);
      setAnnualPkg(annual);
      setPackagesLoaded(true);
    });
  }, []);

  const monthlyPrice = monthlyPkg?.product.priceString ?? FALLBACK_PRICES.monthly;
  const annualPrice = annualPkg?.product.priceString ?? FALLBACK_PRICES.annual;

  const isWeb = (Platform.OS as string) === "web";

  const handleSubscribe = async () => {
    if (isWeb) {
      Alert.alert("Mobile Only", "Subscriptions are available on the iOS and Android apps.");
      return;
    }

    const pkg = selected === "annual" ? annualPkg : monthlyPkg;
    if (!pkg) {
      Alert.alert("Not Available", "Products could not be loaded. Please check your connection and try again.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const hasPro = await purchasePackage(pkg);
      if (hasPro) {
        await setPaidStatus.mutateAsync();
        await utils.activation.getMyStatus.invalidate();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Welcome to Pro!",
          "Your subscription is now active. All features are unlocked.",
          [{ text: "Let's go!", onPress: () => router.back() }],
        );
      }
    } catch (err: any) {
      // RC throws with userCancelled = true when user dismisses — don't show error
      if (!err?.userCancelled) {
        Alert.alert("Purchase Failed", err?.message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (isWeb) return;
    setLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        await setPaidStatus.mutateAsync();
        await utils.activation.getMyStatus.invalidate();
        Alert.alert("Restored!", "Your Pro subscription has been restored.", [
          { text: "Done", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Nothing to Restore", "No active subscription found for this Apple/Google account.");
      }
    } catch (err: any) {
      Alert.alert("Restore Failed", err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer bgColor="#0f172a">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Header */}
        <View style={S.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginRight: 12 }]}
          >
            <Text style={S.backArrow}>←</Text>
          </Pressable>
          <Text style={S.headerTitle}>Pro Access</Text>
        </View>

        {/* Hero */}
        <View style={S.hero}>
          <Text style={S.heroIcon}>★</Text>
          <Text style={S.heroTitle}>Unlock Pro Access</Text>
          <Text style={S.heroSub}>Everything you need to grow your adviser business</Text>
        </View>

        {/* Features */}
        <View style={S.featuresCard}>
          {FEATURES.map((f) => (
            <View key={f} style={S.featureRow}>
              <Text style={S.featureCheck}>✓</Text>
              <Text style={S.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Plan selector */}
        <View style={S.section}>
          <Text style={S.sectionLabel}>CHOOSE YOUR PLAN</Text>

          {/* Annual */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelected("annual");
            }}
            style={[S.planCard, selected === "annual" && S.planCardSelected]}
          >
            <View style={S.planRow}>
              <View style={{ flex: 1 }}>
                <View style={S.planLabelRow}>
                  <Text style={[S.planName, selected === "annual" && S.planNameSelected]}>
                    Annual Plan
                  </Text>
                  <View style={S.saveBadge}>
                    <Text style={S.saveBadgeText}>SAVE 37%</Text>
                  </View>
                </View>
                <Text style={[S.planPrice, selected === "annual" && S.planPriceSelected]}>
                  {annualPrice} <Text style={S.planPriceSub}>/ year</Text>
                </Text>
                <Text style={S.planNote}>
                  {packagesLoaded && annualPkg
                    ? "Best value · billed annually"
                    : "$12.50 / month · billed annually"}
                </Text>
              </View>
              <View style={[S.radio, selected === "annual" && S.radioSelected]}>
                {selected === "annual" && <View style={S.radioDot} />}
              </View>
            </View>
          </Pressable>

          {/* Monthly */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelected("monthly");
            }}
            style={[S.planCard, selected === "monthly" && S.planCardSelected]}
          >
            <View style={S.planRow}>
              <View style={{ flex: 1 }}>
                <Text style={[S.planName, selected === "monthly" && S.planNameSelected]}>
                  Monthly Plan
                </Text>
                <Text style={[S.planPrice, selected === "monthly" && S.planPriceSelected]}>
                  {monthlyPrice} <Text style={S.planPriceSub}>/ month</Text>
                </Text>
                <Text style={S.planNote}>Billed monthly · cancel anytime</Text>
              </View>
              <View style={[S.radio, selected === "monthly" && S.radioSelected]}>
                {selected === "monthly" && <View style={S.radioDot} />}
              </View>
            </View>
          </Pressable>
        </View>

        {/* CTA */}
        <View style={S.ctaSection}>
          <TouchableOpacity
            style={[S.ctaBtn, loading && S.ctaBtnDisabled]}
            onPress={handleSubscribe}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={S.ctaBtnText}>
                {isWeb
                  ? "Available on iOS & Android"
                  : selected === "annual"
                  ? `Get Pro — ${annualPrice}/yr`
                  : `Get Pro — ${monthlyPrice}/mo`}
              </Text>
            )}
          </TouchableOpacity>

          {!isWeb && (
            <TouchableOpacity onPress={handleRestore} activeOpacity={0.7} disabled={loading}>
              <Text style={S.restoreText}>Restore Purchase</Text>
            </TouchableOpacity>
          )}

          <Text style={S.legalText}>
            Subscriptions auto-renew. Cancel anytime in your App Store or Play Store settings.
          </Text>
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
    paddingBottom: 20,
  },
  backArrow: { fontSize: 22, color: "#e2e8f0" },
  headerTitle: { fontSize: 20, fontWeight: "700" as const, color: "#e2e8f0", flex: 1 },
  hero: {
    alignItems: "center" as const,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 10,
  },
  heroIcon: { fontSize: 52, color: "#f59e0b" },
  heroTitle: { fontSize: 28, fontWeight: "800" as const, color: "#f1f5f9", textAlign: "center" as const },
  heroSub: { fontSize: 16, color: "#94a3b8", textAlign: "center" as const, lineHeight: 24 },
  featuresCard: {
    marginHorizontal: 24,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 20,
    gap: 14,
    marginBottom: 28,
  },
  featureRow: { flexDirection: "row" as const, alignItems: "flex-start" as const, gap: 12 },
  featureCheck: { fontSize: 16, color: "#f59e0b", fontWeight: "700" as const, marginTop: 1 },
  featureText: { fontSize: 16, color: "#e2e8f0", flex: 1, lineHeight: 22 },
  section: { paddingHorizontal: 24, gap: 12 },
  sectionLabel: { fontSize: 12, fontWeight: "700" as const, color: "#64748b", letterSpacing: 1.5 },
  planCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#334155",
    padding: 18,
  },
  planCardSelected: { borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.06)" },
  planRow: { flexDirection: "row" as const, alignItems: "center" as const },
  planLabelRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, marginBottom: 4 },
  planName: { fontSize: 17, fontWeight: "600" as const, color: "#94a3b8" },
  planNameSelected: { color: "#f1f5f9" },
  planPrice: { fontSize: 24, fontWeight: "700" as const, color: "#64748b" },
  planPriceSelected: { color: "#f59e0b" },
  planPriceSub: { fontSize: 14, fontWeight: "400" as const },
  planNote: { fontSize: 13, color: "#64748b", marginTop: 3 },
  saveBadge: {
    backgroundColor: "rgba(245,158,11,0.15)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  saveBadgeText: { fontSize: 11, fontWeight: "700" as const, color: "#f59e0b", letterSpacing: 0.5 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#475569",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  radioSelected: { borderColor: "#f59e0b" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#f59e0b" },
  ctaSection: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 16,
    alignItems: "center" as const,
  },
  ctaBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 16,
    paddingVertical: 18,
    width: "100%" as const,
    alignItems: "center" as const,
    minHeight: 56,
    justifyContent: "center" as const,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { fontSize: 17, fontWeight: "700" as const, color: "#0f172a" },
  restoreText: { fontSize: 14, color: "#64748b", fontWeight: "500" as const },
  legalText: { fontSize: 12, color: "#475569", textAlign: "center" as const, lineHeight: 18 },
};
