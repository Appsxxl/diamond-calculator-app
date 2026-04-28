import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { t } from "@/lib/translations";
import { calculateStrategy, fmt } from "@/lib/calculator";

function numVal(s: string, fallback = 0): number {
  const n = parseFloat(s);
  return isNaN(n) ? fallback : n;
}

export default function StrategyEngineerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ startDeposit?: string; vip?: string }>();
  const { language } = useCalculator();

  const [startDeposit, setStartDeposit] = useState(params.startDeposit ?? "10000");
  const [monthlyGoal, setMonthlyGoal] = useState("2000");
  const [targetYears, setTargetYears] = useState("5");
  const [vipEnabled, setVipEnabled] = useState(params.vip !== undefined ? params.vip === "1" : true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateStrategy> | null>(null);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const res = calculateStrategy(
          numVal(startDeposit, 10000),
          numVal(monthlyGoal, 2000),
          numVal(targetYears, 5),
          vipEnabled,
        );
        setResult(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  };

  const handleReset = () => {
    setStartDeposit("10000");
    setMonthlyGoal("2000");
    setTargetYears("5");
    setVipEnabled(true);
    setResult(null);
  };

  const applyPlan = (plan: "A" | "B" | "C" | "D") => {
    if (!result) return;
    const vipParam = vipEnabled ? "1" : "0";
    const goal = monthlyGoal;
    if (plan === "A") {
      const dep = result.planA_deposit === "MET" ? "0" : String(result.planA_deposit);
      router.push(`/scenario-tool?plan=A&startAmount=${startDeposit}&monthlyDeposit=${dep}&years=${targetYears}&vip=${vipParam}&goalAmount=${goal}`);
    } else if (plan === "B") {
      const yrs = result.planB_months !== null ? String(Math.ceil(result.planB_months / 12)) : targetYears;
      router.push(`/scenario-tool?plan=B&startAmount=${startDeposit}&monthlyDeposit=0&years=${yrs}&vip=${vipParam}&goalAmount=${goal}`);
    } else if (plan === "C") {
      router.push(`/scenario-tool?plan=C&startAmount=${result.planC_lumpSum}&monthlyDeposit=0&years=1&vip=${vipParam}&goalAmount=${goal}`);
    } else if (plan === "D") {
      router.push(`/scenario-tool?plan=D&startAmount=${result.planD_lumpSum}&monthlyDeposit=0&years=1&outP=75&vip=${vipParam}&goalAmount=${goal}`);
    }
  };

  // Build translated Plan B time string
  const planBTimeStr = (result: ReturnType<typeof calculateStrategy>) => {
    if (result.planB_months === null) return t(language, "sePlanBNotReachable");
    const yrs = result.planB_years;
    const mos = result.planB_remainingMonths;
    const yrLabel = yrs === 1 ? t(language, "sePlanBYear") : t(language, "sePlanBYears");
    const moLabel = mos === 1 ? t(language, "sePlanBMonth") : t(language, "sePlanBMonths");
    let str = "";
    if (yrs > 0) str += `${yrs} ${yrLabel}`;
    if (mos > 0) str += `${str ? " " : ""}${mos} ${moLabel}`;
    return `${str} (${t(language, "month")} ${result.planB_months})`;
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor="#0f172a">
      <ScrollView style={S.scroll} contentContainerStyle={S.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Text style={S.backText}>← {t(language, "back")}</Text>
          </TouchableOpacity>
          <Text style={S.title}>🧠 {t(language, "strategyEngineer")}</Text>
          <Text style={S.subtitle}>Plan B — {t(language, "seSubtitle")}</Text>
        </View>

        {/* Inputs */}
        <View style={S.card}>
          <Text style={S.label}>{t(language, "startDiamonds").toUpperCase()} $</Text>
          <TextInput
            style={S.input}
            value={startDeposit}
            onChangeText={setStartDeposit}
            keyboardType="numeric"
            placeholder="10000"
            placeholderTextColor="#555"
          />
        </View>

        <View style={S.card}>
          <Text style={S.label}>{t(language, "goal").toUpperCase()} $ / {t(language, "monthly")}</Text>
          <TextInput
            style={S.input}
            value={monthlyGoal}
            onChangeText={setMonthlyGoal}
            keyboardType="numeric"
            placeholder="2000"
            placeholderTextColor="#555"
          />
        </View>

        <View style={S.row}>
          <View style={[S.card, S.flex1, { marginRight: 5 }]}>
            <Text style={S.label}>{t(language, "years").toUpperCase()}</Text>
            <TextInput
              style={S.input}
              value={targetYears}
              onChangeText={setTargetYears}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor="#555"
            />
          </View>
          <View style={[S.card, { alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }]}>
            <Text style={S.label}>VIP</Text>
            <Switch
              value={vipEnabled}
              onValueChange={setVipEnabled}
              trackColor={{ false: "#333", true: "#f59e0b" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={S.calcBtn} onPress={handleCalculate} disabled={isCalculating}>
          {isCalculating
            ? <ActivityIndicator color="#0f172a" />
            : <Text style={S.calcText}>⚡ {t(language, "calculate").toUpperCase()}</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity style={S.resetBtn} onPress={handleReset}>
          <Text style={S.resetText}>{t(language, "reset")}</Text>
        </TouchableOpacity>

        {/* Results */}
        {result && (
          <>
            {/* Readiness */}
            <View style={S.card}>
              <Text style={S.sectionLabel}>{t(language, "seReadiness")}</Text>
              <View style={S.progressBar}>
                <View style={[S.progressFill, { width: `${Math.min(result.readiness, 100)}%` as any }]} />
              </View>
              <Text style={S.progressLabel}>
                {result.readiness}% — {t(language, "seReadinessLabel")}
              </Text>
            </View>

            {/* Plan A */}
            <View style={[S.card, { borderLeftWidth: 3, borderLeftColor: "#0ea5e9" }]}>
              <View style={S.planHeader}>
                <View style={[S.badge, { backgroundColor: "#0ea5e9" }]}>
                  <Text style={S.badgeText}>{t(language, "sePlanA")}</Text>
                </View>
                <Text style={S.planTitle}>{t(language, "sePlanATitle")}</Text>
              </View>
              <Text style={S.planDesc}>{t(language, "sePlanADesc")}</Text>
              <View style={S.resultBox}>
                <Text style={S.resultLabel}>{t(language, "sePlanALabel")}</Text>
                <Text style={[S.resultValue, { color: "#0ea5e9" }]}>
                  {result.planA_deposit === "MET"
                    ? t(language, "sePlanAMet")
                    : `${fmt(result.planA_deposit as number)} ${t(language, "sePlanAPerMonth")}`}
                </Text>
              </View>
              <TouchableOpacity style={[S.applyBtn, { borderColor: "#0ea5e9" }]} onPress={() => applyPlan("A")}>
                <Text style={[S.applyBtnText, { color: "#0ea5e9" }]}>
                  {t(language, "seApplyPlan")} A {t(language, "seApplyToScenario")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Plan B */}
            <View style={[S.card, { borderLeftWidth: 3, borderLeftColor: "#22c55e" }]}>
              <View style={S.planHeader}>
                <View style={[S.badge, { backgroundColor: "#22c55e" }]}>
                  <Text style={S.badgeText}>{t(language, "sePlanB")}</Text>
                </View>
                <Text style={S.planTitle}>{t(language, "sePlanBTitle")}</Text>
              </View>
              <Text style={S.planDesc}>{t(language, "sePlanBDesc")}</Text>
              <View style={S.resultBox}>
                <Text style={S.resultLabel}>{t(language, "sePlanBLabel")}</Text>
                <Text style={[
                  S.resultValue,
                  { color: result.planB_months !== null ? "#22c55e" : "#f87171", fontSize: result.planB_months !== null ? 18 : 14 }
                ]}>
                  {planBTimeStr(result)}
                </Text>
              </View>
              <TouchableOpacity style={[S.applyBtn, { borderColor: "#22c55e" }]} onPress={() => applyPlan("B")}>
                <Text style={[S.applyBtnText, { color: "#22c55e" }]}>
                  {t(language, "seApplyPlan")} B {t(language, "seApplyToScenario")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Plan C */}
            <View style={[S.card, { borderLeftWidth: 3, borderLeftColor: "#f59e0b" }]}>
              <View style={S.planHeader}>
                <View style={[S.badge, { backgroundColor: "#f59e0b" }]}>
                  <Text style={S.badgeText}>{t(language, "sePlanC")}</Text>
                </View>
                <Text style={S.planTitle}>{t(language, "sePlanCTitle")}</Text>
              </View>
              <Text style={S.planDesc}>{t(language, "sePlanCDesc")}</Text>
              <View style={S.resultBox}>
                <Text style={S.resultLabel}>{t(language, "sePlanCLabel")}</Text>
                <Text style={[S.resultValue, { color: "#f59e0b" }]}>
                  {fmt(result.planC_lumpSum)}
                </Text>
              </View>
              <TouchableOpacity style={[S.applyBtn, { borderColor: "#f59e0b" }]} onPress={() => applyPlan("C")}>
                <Text style={[S.applyBtnText, { color: "#f59e0b" }]}>
                  {t(language, "seApplyPlan")} C {t(language, "seApplyToScenario")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Plan D */}
            <View style={[S.card, { borderLeftWidth: 3, borderLeftColor: "#a78bfa" }]}>
              <View style={S.planHeader}>
                <View style={[S.badge, { backgroundColor: "#a78bfa" }]}>
                  <Text style={S.badgeText}>{t(language, "sePlanD")}</Text>
                </View>
                <Text style={S.planTitle}>{t(language, "sePlanDTitle")}</Text>
              </View>
              <Text style={S.planDesc}>{t(language, "sePlanDDesc")}</Text>
              <View style={S.resultBox}>
                <Text style={S.resultLabel}>{t(language, "sePlanDLabel")}</Text>
                <Text style={[S.resultValue, { color: "#a78bfa" }]}>
                  {fmt(result.planD_lumpSum)}
                </Text>
              </View>
              <TouchableOpacity style={[S.applyBtn, { borderColor: "#a78bfa" }]} onPress={() => applyPlan("D")}>
                <Text style={[S.applyBtnText, { color: "#a78bfa" }]}>
                  {t(language, "seApplyPlan")} D {t(language, "seApplyToScenario")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* SP Reference Table */}
            <View style={S.card}>
              <Text style={S.sectionLabel}>{t(language, "seSpReference")}</Text>
              {[
                { name: "SP1", range: "$0 – $999",          base: "2.2%", vip: "5.2%" },
                { name: "SP2", range: "$1,000 – $2,499",    base: "2.45%", vip: "5.45%" },
                { name: "SP3", range: "$2,500 – $4,999",    base: "2.7%", vip: "5.7%" },
                { name: "SP4", range: "$5,000 – $9,999",    base: "3.0%", vip: "6.0%" },
                { name: "SP5", range: "$10,000 – $49,999",  base: "3.1%", vip: "6.1%" },
                { name: "SP6", range: "$50,000 – $99,999",  base: "3.2%", vip: "6.2%" },
                { name: "SP7", range: "$100,000+",          base: "3.3%", vip: "6.3%" },
              ].map(sp => (
                <View key={sp.name} style={S.spRow}>
                  <Text style={S.spName}>{sp.name}</Text>
                  <Text style={S.spRange}>{sp.range}</Text>
                  <Text style={S.spBase}>{sp.base}</Text>
                  <Text style={S.spVip}>{sp.vip} {t(language, "seVipSuffix")}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 12 },
  header: { marginBottom: 10, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", marginBottom: 6 },
  backText: { color: "#60a5fa", fontSize: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 2 },
  card: { backgroundColor: "#1e293b", borderRadius: 12, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "stretch" },
  flex1: { flex: 1 },
  label: { color: "#f59e0b", fontSize: 13, fontWeight: "bold", marginBottom: 5, letterSpacing: 0.5 },
  input: { backgroundColor: "#0f172a", color: "#fff", borderRadius: 8, padding: 10, fontSize: 18, fontWeight: "bold", borderWidth: 1, borderColor: "#334155" },
  calcBtn: { backgroundColor: "#f59e0b", borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 6 },
  calcText: { color: "#0f172a", fontWeight: "bold", fontSize: 17, letterSpacing: 1 },
  resetBtn: { backgroundColor: "#1e293b", borderRadius: 12, padding: 10, alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  resetText: { color: "#94a3b8", fontWeight: "bold", fontSize: 15 },
  sectionLabel: { color: "#f59e0b", fontSize: 13, fontWeight: "bold", marginBottom: 6, letterSpacing: 0.5 },
  progressBar: { height: 10, backgroundColor: "#0f172a", borderRadius: 5, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: 10, backgroundColor: "#22c55e", borderRadius: 5 },
  progressLabel: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 12, letterSpacing: 1 },
  planTitle: { color: "#fff", fontWeight: "bold", fontSize: 17, flex: 1 },
  planDesc: { color: "#94a3b8", fontSize: 15, lineHeight: 22, marginBottom: 8 },
  resultBox: { backgroundColor: "#0f172a", borderRadius: 8, padding: 10 },
  resultLabel: { color: "#64748b", fontSize: 13, marginBottom: 3 },
  resultValue: { fontSize: 18, fontWeight: "bold" },
  spRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#0f172a" },
  spName: { color: "#f59e0b", fontWeight: "bold", fontSize: 14, width: 44 },
  spRange: { color: "#94a3b8", fontSize: 13, flex: 1 },
  spBase: { color: "#22c55e", fontWeight: "bold", fontSize: 14, width: 48 },
  spVip: { color: "#f59e0b", fontWeight: "bold", fontSize: 14, width: 68, textAlign: "right" },
  applyBtn: { marginTop: 10, borderWidth: 1, borderRadius: 8, padding: 10, alignItems: "center", backgroundColor: "#0f172a" },
  applyBtnText: { fontWeight: "bold", fontSize: 16, letterSpacing: 0.5 },
});
