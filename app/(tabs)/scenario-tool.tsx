import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Clipboard from "expo-clipboard";
import * as IntentLauncher from "expo-intent-launcher";
import { ScreenContainer } from "@/components/screen-container";
import { DisclaimerFooter, DisclaimerInline } from "@/components/disclaimer-footer";
import { useCalculator } from "@/lib/calculator-context";
import { t, Language } from "@/lib/translations";
import { runCalculation, MonthResult, fmt, MonthData, CalculationParams, createDefaultMonthData, getNetDeposit, getSPLevel } from "@/lib/calculator";

function numVal(s: string, fallback = 0): number {
  const n = parseFloat(s);
  return isNaN(n) ? fallback : n;
}

type PlanTier = {
  name: string;
  rate: string;
  color: string;
  nextTier: { name: string; threshold: number; rate: number } | null;
};

function getPlanTier(amount: number, vipActive: boolean): PlanTier {
  const v = vipActive ? ' (+3% VIP)' : '';
  if (amount >= 100000) return { name: 'SP7', rate: '3.3%' + v, color: '#22d3ee', nextTier: null };
  if (amount >= 50000)  return { name: 'SP6', rate: '3.2%' + v, color: '#a78bfa', nextTier: { name: 'SP7', threshold: 100000, rate: 3.3 } };
  if (amount >= 10000)  return { name: 'SP5', rate: '3.1%' + v, color: '#22c55e', nextTier: { name: 'SP6', threshold: 50000,  rate: 3.2 } };
  if (amount >= 5000)   return { name: 'SP4', rate: '3.0%' + v, color: '#f59e0b', nextTier: { name: 'SP5', threshold: 10000,  rate: 3.1 } };
  if (amount >= 2500)   return { name: 'SP3', rate: '2.7%' + v, color: '#fb923c', nextTier: { name: 'SP4', threshold: 5000,   rate: 3.0 } };
  if (amount >= 1000)   return { name: 'SP2', rate: '2.45%' + v, color: '#94a3b8', nextTier: { name: 'SP3', threshold: 2500,  rate: 2.7 } };
  return                       { name: 'SP1', rate: '2.2%' + v,  color: '#64748b', nextTier: { name: 'SP2', threshold: 1000,  rate: 2.45 } };
}

export default function ScenarioToolScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    plan?: string;
    startAmount?: string;
    monthlyDeposit?: string;
    years?: string;
    outP?: string;
    vip?: string;
    goalAmount?: string;
    // Property Optimizer params
    source?: string;
    propWithdrawal?: string;
    propWithdrawalFrom?: string;
  }>();
  const { language, officeLocation } = useCalculator();
  const { width: screenWidth } = useWindowDimensions();
  // Compute table column widths: 96% of screen, minus outer content padding (32) and card padding (24)
  const TW = Math.max(Math.round(Math.min(screenWidth * 0.96, 1450) - 56), 788);
  const cw = {
    num:      Math.round(TW * 0.036),
    avail:    Math.round(TW * 0.134),
    disc:     Math.round(TW * 0.102),
    diamonds: Math.round(TW * 0.115),
    status:   Math.round(TW * 0.128),
    comp:     Math.round(TW * 0.092),
    plan:     Math.round(TW * 0.102),
    strat:    Math.round(TW * 0.092),
    monthly:  Math.round(TW * 0.092),
    total:    Math.round(TW * 0.115),
  };
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [autosaved, setAutosaved] = useState(false);

  const [clientName, setClientName] = useState("");
  const [startAmount, setStartAmount] = useState("3000");
  const [years, setYears] = useState("5");
  const [goal, setGoal] = useState("3500");
  const [inputErrors, setInputErrors] = useState<{ startAmount?: string; years?: string }>({});
  const [vipEnabled, setVipEnabled] = useState(false);

  // Bulk deposit
  const [bulkStortVal, setBulkStortVal] = useState("");
  const [bulkStortTo, setBulkStortTo] = useState("");
  // Annual deposit
  const [annualVal, setAnnualVal] = useState("");
  // Bulk withdrawal
  const [bulkOpnVal, setBulkOpnVal] = useState("");
  const [bulkOpnFrom, setBulkOpnFrom] = useState("");
  // Bulk out%
  const [bulkOpnPVal, setBulkOpnPVal] = useState("");
  const [bulkOpnPFrom, setBulkOpnPFrom] = useState("");

  const [manualVip, setManualVip] = useState(false);
  const vipExplicitlyOff = useRef(false);

  // Load persisted backup on mount (runs once).
  // Skip if we arrived with external params — the params effects will own state.
  useEffect(() => {
    if (params.plan || params.source === 'property') {
      setHydrated(true);
      return;
    }
    AsyncStorage.getItem('plan_b_scenario_backup').then(raw => {
      if (raw) {
        try {
          const s = JSON.parse(raw);
          if (s.clientName   != null) setClientName(s.clientName);
          if (s.startAmount  != null) setStartAmount(s.startAmount);
          if (s.years        != null) setYears(s.years);
          if (s.goal         != null) setGoal(s.goal);
          if (s.vipEnabled   != null) setVipEnabled(s.vipEnabled);
          if (s.manualVip    != null) setManualVip(s.manualVip);
          if (s.monthData    != null) setMonthData(s.monthData);
          if (s.bulkStortVal != null) setBulkStortVal(s.bulkStortVal);
          if (s.bulkStortTo  != null) setBulkStortTo(s.bulkStortTo);
          if (s.annualVal    != null) setAnnualVal(s.annualVal);
          if (s.bulkOpnVal   != null) setBulkOpnVal(s.bulkOpnVal);
          if (s.bulkOpnFrom  != null) setBulkOpnFrom(s.bulkOpnFrom);
          if (s.bulkOpnPVal  != null) setBulkOpnPVal(s.bulkOpnPVal);
          if (s.bulkOpnPFrom != null) setBulkOpnPFrom(s.bulkOpnPFrom);
          if (s.bulkCompVal  != null) setBulkCompVal(s.bulkCompVal);
          if (s.bulkCompFrom != null) setBulkCompFrom(s.bulkCompFrom);
          if (s.bulkCompTo   != null) setBulkCompTo(s.bulkCompTo);
        } catch {}
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-trigger VIP when initial purchase >= $3,550 (only if user hasn't explicitly turned it off)
  const autoVip = numVal(startAmount) >= 3550 && vipEnabled;
  useEffect(() => {
    if (numVal(startAmount) >= 3550 && !vipExplicitlyOff.current) {
      setVipEnabled(true);
      setManualVip(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAmount]);

  // Plan Coach: tier detection & upsell
  const planTier = getPlanTier(numVal(startAmount), autoVip);
  const upsellGap = planTier.nextTier ? planTier.nextTier.threshold - numVal(startAmount) : 0;
  const showUpsell = planTier.nextTier !== null && upsellGap > 0 && upsellGap <= 2000;

  const [monthData, setMonthData] = useState<Record<number, MonthData>>({});
  const [result, setResult] = useState<ReturnType<typeof runCalculation> | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [showMarginMechanics, setShowMarginMechanics] = useState(true);

  // Auto-recalculate when startAmount changes so Goal Reached updates immediately
  useEffect(() => {
    const start = numVal(startAmount);
    if (start <= 0) return;
    setResult(runCalculation({
      startAmount: getNetDeposit(start),
      years: numVal(years, 5),
      goal: numVal(goal, 3500),
      vipEnabled,
      manualVip,
      monthData,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAmount]);

  // Bulk compounding (reset support)
  const [bulkCompVal, setBulkCompVal] = useState("");
  const [bulkCompFrom, setBulkCompFrom] = useState("");
  const [bulkCompTo, setBulkCompTo] = useState("");

  // Tracks which maturity banners the user has dismissed
  const [hiddenMaturityMonths, setHiddenMaturityMonths] = useState<Set<number>>(new Set());
  const [allBannersHidden, setAllBannersHidden] = useState(false);
  const hideMaturityBanner = useCallback((month: number) =>
    setHiddenMaturityMonths(prev => new Set([...prev, month])), []);

  const tableHeaderScrollRef = useRef<ScrollView>(null);
  const tableBodyScrollRef = useRef<ScrollView>(null);

  // Auto-fill from Strategy Engineer when navigated with plan params
  useEffect(() => {
    if (!params.plan) return;
    // Full reset — clear every bulk/override field so no stale data from a previous session leaks in
    setAnnualVal(""); setBulkOpnVal(""); setBulkOpnFrom("");
    setBulkOpnPVal(""); setBulkOpnPFrom("");
    setBulkStortVal(""); setBulkStortTo("");
    setBulkCompVal(""); setBulkCompFrom(""); setBulkCompTo("");
    setManualVip(false);
    const newMonthData: Record<number, MonthData> = {};
    const yrs = parseFloat(params.years ?? "5") || 5;
    const totalM = yrs * 12;
    if (params.startAmount) setStartAmount(params.startAmount);
    if (params.years) setYears(String(yrs));
    if (params.goalAmount) setGoal(params.goalAmount);
    if (params.vip !== undefined) setVipEnabled(params.vip === "1");
    // Apply monthly deposit to all months
    const dep = parseFloat(params.monthlyDeposit ?? "0") || 0;
    if (dep > 0) {
      for (let m = 1; m <= totalM; m++) {
        newMonthData[m] = { stort: dep, opn: 0, opnP: 0, comp: 100 };
      }
      setBulkStortVal(String(dep));
      setBulkStortTo(String(totalM));
    }
    // Apply out%: all months for Asset Goal Planner, month 1 only for Plan D
    const outP = parseFloat(params.outP ?? "0") || 0;
    if (outP > 0) {
      const applyTo = params.plan === 'property' ? totalM : 1;
      for (let m = 1; m <= applyTo; m++) {
        newMonthData[m] = { ...(newMonthData[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), opnP: outP };
      }
      if (params.plan === 'property') {
        setBulkOpnPVal(String(outP));
        setBulkOpnPFrom("1");
      }
    }
    setMonthData(newMonthData);
    // Auto-run calculation immediately with the new plan data
    const vipOn = params.vip === "1";
    const startAmt = parseFloat(params.startAmount ?? "3000") || 3000;
    setResult(runCalculation({
      startAmount: getNetDeposit(startAmt),
      years: yrs,
      goal: parseFloat(params.goalAmount ?? "3500") || 3500,
      vipEnabled: vipOn || startAmt >= 3550,
      manualVip: false,
      monthData: newMonthData,
    }));
    const planLabels: Record<string, string> = {
      A: "Plan A — Monthly Top-Up Strategy",
      B: "Plan B — Wait & Grow Strategy",
      C: "Plan C — One-Year Lump Sum Strategy",
      D: "Plan D — Instant Payout Strategy",
      property: "Asset Goal Planner",
    };
    setAppliedBanner(`✅ ${t(language, 'appliedFromStrategy')}: ${planLabels[params.plan ?? ""] ?? params.plan}`);
    // Auto-dismiss banner after 5 seconds
    const timer = setTimeout(() => setAppliedBanner(null), 5000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.plan, params.startAmount, params.monthlyDeposit, params.years, params.outP, params.vip, params.goalAmount]);

  // Auto-fill from Property Optimizer / Asset Goal Planner
  useEffect(() => {
    if (params.source !== "property") return;
    // Full reset — wipe every bulk/override field so previous session data doesn't bleed in
    setAnnualVal(""); setBulkOpnVal(""); setBulkOpnFrom("");
    setBulkOpnPVal(""); setBulkOpnPFrom("");
    setBulkStortVal(""); setBulkStortTo("");
    setBulkCompVal(""); setBulkCompFrom(""); setBulkCompTo("");
    setManualVip(false);
    const newMonthData: Record<number, MonthData> = {};
    const yrs = parseFloat(params.years ?? "10") || 10;
    const totalM = yrs * 12;
    const withdrawal = parseFloat(params.propWithdrawal ?? "0") || 0;
    const fromMonth = parseInt(params.propWithdrawalFrom ?? "61") || 61;
    const outPct = parseFloat(params.outP ?? "0") || 0;
    const startAmt = parseFloat(params.startAmount ?? "0") || 0;
    const vipOn = params.vip === "1" || startAmt >= 3550;
    if (params.startAmount) setStartAmount(params.startAmount);
    setYears(String(yrs));
    if (params.vip !== undefined) setVipEnabled(vipOn);
    // Apply fixed withdrawal from a specific month onwards (Property Optimizer)
    if (withdrawal > 0) {
      for (let m = fromMonth; m <= totalM; m++) {
        newMonthData[m] = { stort: 0, opn: withdrawal, opnP: 0, comp: 100 };
      }
    }
    // Apply out% to all months (Asset Goal Planner)
    if (outPct > 0) {
      for (let m = 1; m <= totalM; m++) {
        newMonthData[m] = { stort: 0, opn: 0, opnP: outPct, comp: 100 };
      }
    }
    setMonthData(newMonthData);
    // Run calculation immediately — avoids blank screen when startAmount didn't change
    setResult(runCalculation({
      startAmount: getNetDeposit(startAmt),
      years: yrs,
      goal: numVal(goal, 3500),
      vipEnabled: vipOn,
      manualVip: false,
      monthData: newMonthData,
    }));
    const spLabel = startAmt > 0 ? `$${startAmt.toLocaleString()}` : "";
    const vipLabel = vipOn ? " + VIP" : "";
    if (outPct > 0) {
      setAppliedBanner(`🏡 Asset Goal Planner: ${spLabel}${vipLabel} — ${outPct}% out/mo · ${yrs}y`);
    } else {
      setAppliedBanner(`🏠 Property Optimizer: ${spLabel}${vipLabel} — $${withdrawal.toLocaleString()}/mo from Y5`);
    }
    const timer = setTimeout(() => setAppliedBanner(null), 8000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.source, params.startAmount, params.propWithdrawal, params.propWithdrawalFrom, params.vip, params.years, params.outP]);

  const totalMonths = numVal(years, 1) * 12;

  const getMonthData = useCallback((m: number): MonthData => {
    return monthData[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 };
  }, [monthData]);

  const setMonthField = useCallback((m: number, field: keyof MonthData, value: number) => {
    setMonthData(prev => ({
      ...prev,
      [m]: { ...(prev[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), [field]: value },
    }));
  }, []);

  const applyBulkStort = () => {
    const val = numVal(bulkStortVal);
    const to = numVal(bulkStortTo, totalMonths);
    setMonthData(prev => {
      const next = { ...prev };
      for (let m = 1; m <= Math.min(to, totalMonths); m++) {
        next[m] = { ...(next[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), stort: val };
      }
      return next;
    });
  };

  const applyAnnual = () => {
    const val = numVal(annualVal);
    setMonthData(prev => {
      const next = { ...prev };
      for (let m = 13; m <= totalMonths; m += 12) {
        next[m] = { ...(next[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), stort: val };
      }
      return next;
    });
  };

  const applyBulkOpn = () => {
    const val = numVal(bulkOpnVal);
    const from = numVal(bulkOpnFrom, 1);
    setMonthData(prev => {
      const next = { ...prev };
      for (let m = from; m <= totalMonths; m++) {
        next[m] = { ...(next[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), opn: val };
      }
      return next;
    });
  };

  const applyBulkOpnP = () => {
    const val = numVal(bulkOpnPVal);
    const from = numVal(bulkOpnPFrom, 1);
    setMonthData(prev => {
      const next = { ...prev };
      for (let m = from; m <= totalMonths; m++) {
        next[m] = { ...(next[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), opnP: val };
      }
      return next;
    });
  };


  const handleReset = () => {
    AsyncStorage.removeItem('plan_b_scenario_backup').catch(() => {});
    setAutosaved(false);
    setClientName(""); setStartAmount("3000"); setYears("5"); setGoal("3500");
    setVipEnabled(false); setManualVip(false); setMonthData({}); setResult(null);
    setBulkStortVal(""); setBulkStortTo(""); setAnnualVal("");
    setBulkOpnVal(""); setBulkOpnFrom(""); setBulkOpnPVal(""); setBulkOpnPFrom("");
    setBulkCompVal(""); setBulkCompFrom(""); setBulkCompTo("");
  };

  const handleCalculate = async () => {
    const errors: { startAmount?: string; years?: string } = {};
    const amt = parseFloat(startAmount);
    const yrs = parseFloat(years);
    if (!startAmount || isNaN(amt) || amt <= 0) errors.startAmount = "Enter a valid deposit amount";
    if (!years || isNaN(yrs) || yrs <= 0 || yrs > 30) errors.years = "Enter years between 1 and 30";
    setInputErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 0));
    const params: CalculationParams = {
      startAmount: getNetDeposit(numVal(startAmount, 3000)),
      years: numVal(years, 5),
      goal: numVal(goal, 3500),
      vipEnabled,
      manualVip,
      monthData,
    };
    const res = runCalculation(params);
    setResult(res);
    setCalculating(false);
  };

  const vipShadow = useMemo(() => {
    if (!result || vipEnabled || autoVip) return null;
    if (result.goalReachedMonth !== null) return null;
    const start = numVal(startAmount);
    if (start < 1000) return null;
    const shadow = runCalculation({
      startAmount: getNetDeposit(start),
      years: numVal(years, 5),
      goal: numVal(goal, 3500),
      vipEnabled: true,
      manualVip: false,
      monthData,
    });
    return shadow.maxMonthlyOut > result.maxMonthlyOut ? shadow : null;
  }, [result, vipEnabled, autoVip, startAmount, years, goal, monthData]);

  const vipRecoveryMonth = useMemo(() => {
    if (!result || !vipShadow) return null;
    let cumDiff = -1000;
    for (let i = 0; i < Math.min(result.months.length, vipShadow.months.length); i++) {
      cumDiff += vipShadow.months[i].grossYield - result.months[i].grossYield;
      if (cumDiff >= 0) return i + 1;
    }
    return null;
  }, [result, vipShadow]);

  const handleCompareWithVip = () => {
    setVipEnabled(true);
    setResult(runCalculation({
      startAmount: getNetDeposit(numVal(startAmount, 3000)),
      years: numVal(years, 5),
      goal: numVal(goal, 3500),
      vipEnabled: true,
      manualVip: false,
      monthData,
    }));
  };

  // Autosave — debounced 600ms, skips before hydration is confirmed
  useEffect(() => {
    if (!hydrated) return;
    const backup = {
      clientName, startAmount, years, goal, vipEnabled, manualVip, monthData,
      bulkStortVal, bulkStortTo, annualVal, bulkOpnVal, bulkOpnFrom,
      bulkOpnPVal, bulkOpnPFrom, bulkCompVal, bulkCompFrom, bulkCompTo,
    };
    const timer = setTimeout(() => {
      AsyncStorage.setItem('plan_b_scenario_backup', JSON.stringify(backup))
        .then(() => { setAutosaved(true); setTimeout(() => setAutosaved(false), 2000); })
        .catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, clientName, startAmount, years, goal, vipEnabled, manualVip, monthData,
      bulkStortVal, bulkStortTo, annualVal, bulkOpnVal, bulkOpnFrom,
      bulkOpnPVal, bulkOpnPFrom, bulkCompVal, bulkCompFrom, bulkCompTo]);

  const goalProgress = result ? result.goalProgress : 0;

  if (!hydrated) return <ScreenContainer bgColor="#0f172a" edges={["top", "left", "right"]} />;

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor="#0f172a">
      <ScrollView style={S.scroll} contentContainerStyle={S.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Text style={S.backText}>← {t(language, 'back')}</Text>
          </TouchableOpacity>
          <Text style={S.title}>💎 Plan B</Text>
          <Text style={S.subtitle}>{t(language, 'welcomeSubtitle')}</Text>
        </View>

        {/* Applied Banner */}
        {appliedBanner && (
          <View style={S.appliedBanner}>
            <Text style={S.appliedBannerText}>{appliedBanner}</Text>
            <TouchableOpacity onPress={() => setAppliedBanner(null)}>
              <Text style={S.appliedBannerClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Goal bar */}
        <View style={S.card}>
          <View style={S.row}>
            <Text style={S.label}>{t(language, 'goal').toUpperCase()} $</Text>
            <TextInput style={S.goalInput} value={goal} onChangeText={setGoal} keyboardType="numeric" placeholderTextColor="#666" />
            <TouchableOpacity style={S.resetBtn} onPress={handleReset}>
              <Text style={S.resetText}>{t(language, 'reset')}</Text>
            </TouchableOpacity>
          </View>
          <View style={S.progressBar}>
            <View style={[S.progressFill, { width: `${Math.min(goalProgress, 100)}%` as any }]} />
          </View>
          <View style={S.row}>
            <Text style={S.progressLabel}>{Math.round(goalProgress)}%</Text>
            {autosaved && (
              <Text style={{ color: "#22c55e", fontSize: 10, fontWeight: "bold", marginLeft: 6 }}>💾 Autosaved</Text>
            )}
            {result?.goalReached && (
              <View style={S.goalBadge}><Text style={S.goalBadgeText}>{t(language, 'goalReached')}</Text></View>
            )}
          </View>
        </View>

        {/* Client & VIP */}
        <View style={S.card}>
          <View style={S.row}>
            <View style={S.flex1}>
              <Text style={S.label}>{t(language, 'clientName').toUpperCase()}</Text>
              <TextInput style={S.input} value={clientName} onChangeText={setClientName} placeholder={t(language, 'clientName')} placeholderTextColor="#555" />
            </View>
            <View style={S.vipBox}>
              <Text style={S.label}>{t(language, 'vipStatus').toUpperCase()}</Text>
              <Switch
                value={vipEnabled}
                onValueChange={(v) => { vipExplicitlyOff.current = !v; setVipEnabled(v); }}
                trackColor={{ false: "#333", true: "#f59e0b" }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Start & Years */}
        <View style={S.row}>
          <View style={[S.card, S.flex1, { marginRight: 5 }]}>
            <Text style={S.label}>{t(language, 'startDiamonds').toUpperCase()} $</Text>
            <TextInput style={S.bigInput} value={startAmount} onChangeText={v => { setStartAmount(v); setInputErrors(e => ({ ...e, startAmount: undefined })); }} keyboardType="numeric" placeholderTextColor="#555" />
            {numVal(startAmount) > 0 && numVal(startAmount) < 110
              ? <Text style={{ color: '#ef4444', fontSize: 10, marginTop: 4, fontWeight: 'bold' }}>⚠️ SP1 Minimum is $110</Text>
              : numVal(startAmount) >= 110
                ? (() => {
                    const gross = numVal(startAmount);
                    const net = getNetDeposit(gross);
                    const fee = gross - net;
                    const vipFee = autoVip ? 1000 : 0;
                    const netDiamonds = net - vipFee;
                    return (
                      <View style={{ marginTop: 6, backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 6, padding: 7, borderWidth: 1, borderColor: '#334155' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#94a3b8', fontSize: 10 }}>{t(language, 'grossDeposit')}</Text>
                          <Text style={{ color: '#e2e8f0', fontSize: 10, fontWeight: 'bold' }}>${gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                          <Text style={{ color: '#94a3b8', fontSize: 10 }}>{t(language, 'accessFee')}</Text>
                          <Text style={{ color: '#ef4444', fontSize: 10 }}>−${fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        {autoVip && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                            <Text style={{ color: '#94a3b8', fontSize: 10 }}>{t(language, 'vipActivationFee')}</Text>
                            <Text style={{ color: '#ef4444', fontSize: 10 }}>−$1,000.00</Text>
                          </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 3 }}>
                          <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: 'bold' }}>{t(language, 'netInvestedDiamonds')}</Text>
                          <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: 'bold' }}>${netDiamonds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                      </View>
                    );
                  })()
                : null
            }
            {inputErrors.startAmount && (
              <Text style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>⚠️ {inputErrors.startAmount}</Text>
            )}

            {/* Plan tier badge */}
            {(() => {
              const vipSuffix = ' (+3% VIP)';
              const hasVip = planTier.rate.endsWith(vipSuffix);
              const baseRate = hasVip ? planTier.rate.slice(0, -vipSuffix.length) : planTier.rate;
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7 }}>
                  <View style={{
                    backgroundColor: planTier.color + '22',
                    borderRadius: 12,
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                    borderWidth: 1,
                    borderColor: planTier.color,
                    flexDirection: 'row',
                    alignItems: 'baseline',
                  }}>
                    <Text style={{ color: planTier.color, fontSize: 10, fontWeight: 'bold', letterSpacing: 0.4 }}>
                      {t(language, 'planPrefix') + ' ' + planTier.name + ' · ' + baseRate}
                    </Text>
                    {hasVip && (
                      <Text style={{ color: planTier.color, fontSize: 8.5, fontWeight: 'bold', opacity: 0.85, marginLeft: 1 }}>
                        {vipSuffix}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })()}

            {/* Upsell tip */}
            {showUpsell && (
              <View style={{
                backgroundColor: 'rgba(253,224,71,0.12)',
                borderRadius: 7,
                padding: 9,
                marginTop: 7,
                borderWidth: 1.5,
                borderColor: '#FDE047',
              }}>
                <Text style={{ color: '#FDE047', fontSize: 10, fontWeight: 'bold', lineHeight: 15 }}>
                  {t(language, 'upsellTipGeneric')
                    .replace('{amount}', fmt(upsellGap))
                    .replace('{plan}', `${planTier.nextTier!.name} (${planTier.nextTier!.rate}%)`)}
                </Text>
              </View>
            )}

            {autoVip ? (
              <View style={{
                backgroundColor: 'rgba(16,185,129,0.15)',
                borderRadius: 8,
                padding: 10,
                marginTop: 10,
                borderWidth: 1.5,
                borderColor: '#10b981',
                alignItems: 'center',
              }}>
                <Text style={{ color: '#10b981', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.8 }}>{t(language, 'vipAutoActiveTitle')}</Text>
                <Text style={{ color: '#6ee7b7', fontSize: 10, marginTop: 4, textAlign: 'center' }}>{t(language, 'vipAutoActiveFee')}</Text>
                <View style={{ marginTop: 6, backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: '#f59e0b', fontSize: 10, fontWeight: 'bold' }}>{t(language, 'vipRateApplied')}</Text>
                </View>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                  <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: 'bold', flex: 1 }}>{t(language, 'manualVipLabel')}</Text>
                  <Switch value={manualVip} onValueChange={setManualVip} trackColor={{ false: "#333", true: "#33C5FF" }} thumbColor="#fff" />
                </View>
                <View style={{ backgroundColor: 'rgba(51,197,255,0.1)', borderRadius: 6, padding: 8, marginTop: 6, borderLeftWidth: 2, borderLeftColor: '#33C5FF' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 10, lineHeight: 14 }}>{t(language, 'manualVipNote')}</Text>
                </View>
              </>
            )}
          </View>
          <View style={[S.card, S.flex1, { marginLeft: 5 }]}>
            <Text style={S.label}>{t(language, 'years').toUpperCase()}</Text>
            <TextInput style={S.bigInput} value={years} onChangeText={v => { setYears(v); setInputErrors(e => ({ ...e, years: undefined })); }} keyboardType="numeric" placeholderTextColor="#555" />
            {inputErrors.years && (
              <Text style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>⚠️ {inputErrors.years}</Text>
            )}
          </View>
        </View>

        {/* Bulk Deposit */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language, 'deposit').toUpperCase()}</Text>
          <View style={S.bulkRow}>
            <TextInput style={S.bulkInput} value={bulkStortVal} onChangeText={setBulkStortVal} placeholder={t(language,'extraAmounts')} placeholderTextColor="#555" keyboardType="numeric" />
            <TextInput style={S.bulkSmall} value={bulkStortTo} onChangeText={setBulkStortTo} placeholder={t(language,'till')} placeholderTextColor="#555" keyboardType="numeric" />
            <TouchableOpacity style={S.btnBlue} onPress={applyBulkStort}><Text style={S.btnText}>{t(language,'ok')}</Text></TouchableOpacity>
          </View>
          {numVal(bulkStortVal) > 0 && numVal(bulkStortVal) < 110
            ? <Text style={{ color: '#ef4444', fontSize: 10, marginTop: 4, fontWeight: 'bold' }}>⚠️ SP1 Minimum is $110</Text>
            : numVal(bulkStortVal) >= 110
              ? <Text style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>${numVal(bulkStortVal).toLocaleString()} → Net: ${getNetDeposit(numVal(bulkStortVal)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              : null
          }
          <Text style={S.sectionLabel}>{t(language,'extraAmounts').toUpperCase()} {t(language,'annual').toUpperCase()} {t(language,'oneTime').toUpperCase()}</Text>
          <View style={S.bulkRow}>
            <TextInput style={S.bulkInput} value={annualVal} onChangeText={setAnnualVal} placeholder={t(language,'extraAmounts')} placeholderTextColor="#555" keyboardType="numeric" />
            <TouchableOpacity style={S.btnAmber} onPress={applyAnnual}><Text style={S.btnTextDark}>{t(language,'set')}</Text></TouchableOpacity>
          </View>
        </View>

        {/* Bulk Withdrawal */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language,'withdrawal').toUpperCase()}</Text>
          <View style={S.bulkRow}>
            <TextInput style={S.bulkInput} value={bulkOpnVal} onChangeText={setBulkOpnVal} placeholder={t(language,'monthlyAmount')} placeholderTextColor="#555" keyboardType="numeric" />
            <TextInput style={S.bulkSmall} value={bulkOpnFrom} onChangeText={setBulkOpnFrom} placeholder={t(language,'from')} placeholderTextColor="#555" keyboardType="numeric" />
            <TouchableOpacity style={S.btnBlue} onPress={applyBulkOpn}><Text style={S.btnText}>{t(language,'ok')}</Text></TouchableOpacity>
          </View>
          <Text style={S.sectionLabel}>{t(language,'outPercentage').toUpperCase()}</Text>
          <View style={S.bulkRow}>
            <TextInput style={S.bulkSmall} value={bulkOpnPVal} onChangeText={setBulkOpnPVal} placeholder="%" placeholderTextColor="#555" keyboardType="numeric" />
            <TextInput style={S.bulkSmall} value={bulkOpnPFrom} onChangeText={setBulkOpnPFrom} placeholder={t(language,'from')} placeholderTextColor="#555" keyboardType="numeric" />
            <TouchableOpacity style={S.btnAmber} onPress={applyBulkOpnP}><Text style={S.btnTextDark}>{t(language,'set')}</Text></TouchableOpacity>
          </View>
        </View>

        {/* Active Compounding Info */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>⚡ {t(language, 'compoundPercentage').toUpperCase()}</Text>
          <Text style={{ color: "#64748b", fontSize: 11, lineHeight: 16 }}>
            {t(language, 'activeCompInfo')}
          </Text>
        </View>

        {/* Calculate */}
        <TouchableOpacity style={[S.calcBtn, calculating && { opacity: 0.7 }]} onPress={handleCalculate} disabled={calculating}>
          {calculating
            ? <ActivityIndicator color="#0f172a" />
            : <Text style={S.calcText}>⚡ {t(language, 'calculate').toUpperCase()}</Text>}
        </TouchableOpacity>

        {/* Results */}
        {result && (
          <>
            {/* PDF Export Button */}
            <TouchableOpacity
              style={[S.calcBtn, { backgroundColor: '#33C5FF', marginBottom: 8, opacity: pdfLoading ? 0.6 : 1 }]}
              disabled={pdfLoading}
              onPress={async () => {
                if (!result) return;
                setPdfLoading(true);
                try {
                  const officeData: Record<string, { name: string; address: string; reg: string }> = {
                    dubai: { name: 'Diamond Solution — Dubai Freezone', address: 'DMCC Business Centre, Jumeirah Lakes Towers, Dubai, UAE', reg: 'DMCC License No. 1007195 · SIRA Certified' },
                    vienna: { name: 'Diamond Solution — Vienna, Austria', address: 'Vienna, Austria', reg: 'EU Operations Office' },
                    manila: { name: 'Diamond Solution — Manila, Philippines', address: 'Manila, Philippines', reg: 'SEC Registration No. 2026030241228-02' },
                    florida: { name: 'Diamond Solution — Florida, USA', address: 'Florida, United States', reg: 'US Operations Office' },
                  };
                  const office = officeData[officeLocation] ?? officeData.dubai;
                  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                  const pdfFilename = `PlanB_${(clientName || 'Strategy').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}_${new Date().toISOString().split('T')[0]}`;
                  const totalYears = Math.round(result.months.length / 12);
                  const totalMonths = result.months.length;
                  const maxRebateMonth = result.months.reduce((best, r) => r.grossYield > best.grossYield ? r : best, result.months[0]);
                  const firstDeposit = result.months[0]?.deposit ?? 0;
                  const depositMonths = result.months.filter(m => m.deposit > 0).length;
                  const depositLabel = firstDeposit > 0
                    ? `${fmt(firstDeposit)}${depositMonths > 1 ? ` <span style="font-size:10px;color:#0369a1">(active ${depositMonths} months)</span>` : ''}`
                    : 'None';

                  // Build monthly table rows — grouped by year if > 5 years
                  let tableBody = '';
                  if (totalYears <= 5) {
                    let cumulative = 0;
                    tableBody = result.months.map(row => {
                      cumulative += row.grossYield;
                      const isManualVipRow = row.isNewVip && !row.isVipSelfFunded;
                      const bg = isManualVipRow ? '#fef3c7' : row.month % 2 === 0 ? '#f8fafc' : '#ffffff';
                      const border = isManualVipRow ? ';border-top:2px solid #f59e0b;border-bottom:2px solid #f59e0b' : '';
                      const depColor = row.deposit > 0 ? '#0369a1' : '#94a3b8';
                      const vipBadge = isManualVipRow
                        ? '<br><span style="font-size:9px;color:#92400e;font-weight:700;background:#fde68a;padding:1px 5px;border-radius:3px;white-space:nowrap">+ $1,000 Manual VIP Fee</span>'
                        : '';
                      return `<tr style="background:${bg}${border}">
                        <td style="text-align:center;color:#1e293b;font-weight:${isManualVipRow ? '700' : '400'}">${row.month}</td>
                        <td style="text-align:right;color:${depColor};font-weight:${row.deposit > 0 ? '600' : '400'}">${row.deposit > 0 ? fmt(row.deposit) : '$0'}${vipBadge}</td>
                        <td style="text-align:right;color:#16a34a;font-weight:600">${fmt(row.grossYield)}</td>
                        <td style="text-align:right;color:#16a34a">${fmt(cumulative)}</td>
                        <td style="text-align:right;color:#1e3a5f;font-weight:600">${fmt(row.capEnd)}</td>
                      </tr>`;
                    }).join('');
                  } else {
                    // Group by year
                    let cumulative = 0;
                    const years_map: Record<number, { rebates: number; deposits: number; finalVal: number; months: number; hasManualVip: boolean }> = {};
                    result.months.forEach(row => {
                      const yr = Math.ceil(row.month / 12);
                      if (!years_map[yr]) years_map[yr] = { rebates: 0, deposits: 0, finalVal: 0, months: 0, hasManualVip: false };
                      years_map[yr].rebates += row.grossYield;
                      years_map[yr].deposits += row.deposit;
                      years_map[yr].finalVal = row.capEnd;
                      years_map[yr].months = row.month;
                      if (row.isNewVip && !row.isVipSelfFunded) years_map[yr].hasManualVip = true;
                    });
                    tableBody = Object.entries(years_map).map(([yr, data]) => {
                      cumulative += data.rebates;
                      const bg = data.hasManualVip ? '#fef3c7' : parseInt(yr) % 2 === 0 ? '#f8fafc' : '#ffffff';
                      const border = data.hasManualVip ? ';border-top:2px solid #f59e0b;border-bottom:2px solid #f59e0b' : '';
                      const depColor = data.deposits > 0 ? '#0369a1' : '#94a3b8';
                      const vipBadge = data.hasManualVip
                        ? '<br><span style="font-size:9px;color:#92400e;font-weight:700;background:#fde68a;padding:1px 5px;border-radius:3px;white-space:nowrap">+ $1,000 Manual VIP Fee</span>'
                        : '';
                      return `<tr style="background:${bg}${border}">
                        <td style="text-align:center;color:#1e293b;font-weight:600">Year ${yr} (Month ${(parseInt(yr)-1)*12+1}–${data.months})</td>
                        <td style="text-align:right;color:${depColor};font-weight:${data.deposits > 0 ? '600' : '400'}">${data.deposits > 0 ? fmt(data.deposits) : '$0'}${vipBadge}</td>
                        <td style="text-align:right;color:#16a34a;font-weight:600">${fmt(data.rebates)}</td>
                        <td style="text-align:right;color:#16a34a">${fmt(cumulative)}</td>
                        <td style="text-align:right;color:#1e3a5f;font-weight:600">${fmt(data.finalVal)}</td>
                      </tr>`;
                    }).join('');
                  }

                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
                  <title>${pdfFilename}</title>
                  <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    @page { size: A4; margin: 20mm 15mm; }
                    body { font-family: Arial, Helvetica, sans-serif; background: #ffffff; color: #1e293b; font-size: 12px; line-height: 1.5; }
                    
                    /* Header */
                    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 3px solid #1e3a5f; margin-bottom: 18px; }
                    .logo-area { display: flex; align-items: center; gap: 10px; }
                    .logo-emoji { font-size: 32px; }
                    .logo-text { font-size: 22px; font-weight: 900; color: #1e3a5f; letter-spacing: -0.5px; }
                    .logo-sub { font-size: 10px; color: #64748b; margin-top: 2px; }
                    .doc-title { text-align: right; }
                    .doc-title-main { font-size: 14px; font-weight: 900; color: #1e3a5f; letter-spacing: 1px; text-transform: uppercase; }
                    .doc-meta { font-size: 10px; color: #64748b; margin-top: 3px; }
                    .gia-seal { display:inline-flex; flex-direction:column; align-items:center; border:2px solid #0284c7; border-radius:8px; padding:6px 12px; background:#f0f9ff; margin-right: 12px; }
                    .gia-seal-icon { font-size:14px; margin-bottom:2px; }
                    .gia-seal-title { font-size:9px; font-weight:900; color:#0369a1; letter-spacing:1.2px; text-transform:uppercase; }
                    .gia-seal-sub { font-size:7.5px; color:#64748b; margin-top:1px; }

                    /* Client block */
                    .client-block { background: #f1f5f9; border-left: 4px solid #33C5FF; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; }
                    .client-name { font-size: 17px; font-weight: 700; color: #1e3a5f; }
                    .client-meta { font-size: 10px; color: #64748b; margin-top: 3px; }

                    /* Section titles */
                    .section-title { font-size: 11px; font-weight: 700; color: #1e3a5f; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1.5px solid #33C5FF; padding-bottom: 5px; margin: 18px 0 10px; }

                    /* Parameters grid */
                    .params-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
                    .param-row { display: flex; flex-direction: column; }
                    .param-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                    .param-value { font-size: 14px; font-weight: 700; color: #1e3a5f; margin-top: 2px; }

                    /* Summary grid */
                    .summary-box { border: 1.5px solid #1e3a5f; border-radius: 8px; padding: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; background: #fff; }
                    .stat { padding: 8px 12px; border-radius: 6px; background: #f8fafc; }
                    .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
                    .stat-value { font-size: 15px; font-weight: 700; color: #1e3a5f; }
                    .green { color: #16a34a !important; }
                    .blue { color: #33C5FF !important; }

                    /* Table */
                    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 18px; }
                    thead tr { background: #1e3a5f; }
                    thead th { color: #ffffff; padding: 8px 10px; text-align: left; font-weight: 700; letter-spacing: 0.5px; }
                    thead th:not(:first-child) { text-align: right; }
                    tbody td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }

                    /* Guarantee box */
                    .guarantee-box { background: #f0fdf4; border: 1.5px solid #16a34a; border-radius: 8px; padding: 14px 18px; margin-bottom: 14px; }
                    .guarantee-title { font-size: 12px; font-weight: 700; color: #16a34a; margin-bottom: 6px; }
                    .guarantee-item { font-size: 11px; color: #166534; margin-bottom: 4px; padding-left: 12px; position: relative; }
                    .guarantee-item::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 700; }

                    /* Disclaimer */
                    .disclaimer { margin-top: 14px; padding: 10px 14px; background: #fefce8; border-left: 3px solid #ca8a04; border-radius: 4px; font-size: 10px; color: #78350f; line-height: 1.6; }

                    /* Footer */
                    .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
                  </style></head><body>

                  <!-- HEADER -->
                  <div class="header">
                    <div class="logo-area">
                      <div class="logo-emoji">💎</div>
                      <div>
                        <div class="logo-text">Plan B</div>
                        <div class="logo-sub">Diamond Solution International</div>
                      </div>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;">
                      <div class="gia-seal">
                        <div class="gia-seal-icon">🔒</div>
                        <div class="gia-seal-title">GIA Verified</div>
                        <div class="gia-seal-sub">Plan B Integrity</div>
                      </div>
                      <div class="doc-title">
                        <div class="doc-title-main">Personal Strategy Roadmap</div>
                        <div class="doc-meta">Date: ${today}</div>
                        <div class="doc-meta">${office.name}</div>
                      </div>
                    </div>
                  </div>

                  <!-- CLIENT BLOCK -->
                  ${clientName ? `<div class="client-block">
                    <div class="client-name">${clientName}</div>
                    <div class="client-meta">Prepared for: ${totalYears}-Year Plan B Strategy &nbsp;·&nbsp; ${office.reg}</div>
                  </div>` : ''}

                  <!-- STRATEGY PARAMETERS -->
                  <div class="section-title">Strategy Parameters</div>
                  <div class="params-box">
                    <div class="param-row">
                      <div class="param-label">Initial Diamond Purchase</div>
                      <div class="param-value">${fmt(numVal(startAmount))}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">Strategy Duration</div>
                      <div class="param-value">${totalYears} Years (${totalMonths} Months)</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">Monthly Diamond Purchases</div>
                      <div class="param-value" style="font-weight:700">${depositLabel}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">VIP Status</div>
                      <div class="param-value" style="color:${vipEnabled ? '#33C5FF' : '#64748b'}">${vipEnabled ? 'Active (+3% Monthly Discount)' : 'Standard'}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">VIP Activation Fee</div>
                      <div class="param-value" style="color:${vipEnabled ? '#f59e0b' : '#64748b'}">${vipEnabled ? '$1,000 (Paid Manually)' : 'None'}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label" style="font-weight:700">Transaction Fees</div>
                      <div class="param-value" style="font-weight:700;color:#f59e0b">$5 flat + 1.25% applied to all deposits</div>
                    </div>
                  </div>

                  <!-- STRATEGY SUMMARY -->
                  <div class="section-title">Strategy Summary — ${totalYears} Year Period</div>
                  <div class="summary-box">
                    <div class="stat">
                      <div class="stat-label">Total Purchase Amount${result.totalVipCost > 0 ? ' *' : ''}</div>
                      <div class="stat-value">${fmt(result.totalIn + result.totalVipCost)}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Total Strategy Discounts</div>
                      <div class="stat-value green">${fmt(result.totalOut)}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Total 💎 Assets</div>
                      <div class="stat-value green">${fmt(result.finalCap)}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Net Strategy Value</div>
                      <div class="stat-value green">${(() => { const adj = result.netResult - result.totalVipCost; const base = result.totalIn + result.totalVipCost; return fmt(adj) + ' (' + (base > 0 ? (adj / base * 100).toFixed(1) : '0.0') + '%)'; })()}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Purchase Offset Point</div>
                      <div class="stat-value blue">${result.rocMonth ? 'Month ' + result.rocMonth + ' (Year ' + Math.ceil(result.rocMonth/12) + ')' : 'Pending'}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Max Monthly Discount (Month ${result.maxMonthlyOutMonth})</div>
                      <div class="stat-value green">${fmt(result.maxMonthlyOut)}</div>
                    </div>
                  </div>
                  ${result.totalVipCost > 0 ? '<p style="font-size:9px;color:#64748b;margin:4px 0 0 2px">* Total Purchase Amount includes the initial purchase, monthly contributions, and the manual $1,000 VIP activation fee.</p>' : ''}

                  <!-- MONTHLY DISCOUNT SCHEDULE -->
                  <div class="section-title">Monthly Discount Schedule ${totalYears > 5 ? '(Grouped by Year)' : ''}</div>
                  <table>
                    <thead>
                      <tr>
                        <th>${totalYears > 5 ? 'Period' : 'Month'}</th>
                        <th style="text-align:right">${totalYears > 5 ? 'Annual Deposits ($)' : 'Monthly Deposit ($)'}</th>
                        <th style="text-align:right">${totalYears > 5 ? 'Annual Discount Gained ($)' : 'Monthly Discount ($)'}</th>
                        <th style="text-align:right">Cumulative Discounts ($)</th>
                        <th style="text-align:right">Total Asset Value ($)</th>
                      </tr>
                    </thead>
                    <tbody>${tableBody}</tbody>
                  </table>

                  <!-- SECURITY & GUARANTEES -->
                  <div class="section-title">Security & Guarantees</div>
                  <div class="guarantee-box">
                    <div class="guarantee-title">🛡️ Your Protections</div>
                    <div class="guarantee-item">Contractual 100% Buyback Guarantee on completion of the ${totalYears}-year strategy period.</div>
                    <div class="guarantee-item">Ownership of physical, GIA-certified diamonds — legally yours.</div>
                    <div class="guarantee-item">Diamonds stored in secure Dubai Freezone or delivered to your home.</div>
                    <div class="guarantee-item">All ownership rights transferable to your children or next of kin.</div>
                  </div>

                  <!-- DISCLAIMER -->
                  <div class="disclaimer">
                    ⚠️ <strong>Mathematical Calculation Only:</strong> This document provides mathematical calculations for illustrative purposes and is not financial advice. All projections are based on current plan parameters and may vary. Always review the official Diamond Solution contract documents.
                  </div>

                  <!-- FOOTER -->
                  <div class="footer">
                    <span><strong>${office.name}</strong> · ${office.address} · ${office.reg}</span>
                    <span>Generated by Plan B App · ${today} · ${pdfFilename}.pdf</span>
                  </div>

                  </body></html>`;

                  if (Platform.OS === 'web') {
                    // Web: open in new window and trigger browser print dialog
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(html);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                      }, 500);
                    }
                  } else {
                    const { uri } = await Print.printToFileAsync({ html, base64: false });
                    if (Platform.OS === 'android') {
                      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                        data: uri,
                        flags: 1,
                        type: 'application/pdf',
                      });
                    } else {
                      await Print.printAsync({ uri });
                    }
                  }
                } catch (e) {
                  Alert.alert(t(language,'pdfError'), String(e));
                } finally {
                  setPdfLoading(false);
                }
              }}
            >
              <Text style={[S.calcText, { color: '#fff' }]}>
                {pdfLoading ? `⏳ ${t(language,'pdfGenerating')}` : `📄 ${t(language,'exportPdf').toUpperCase()}`}
              </Text>
            </TouchableOpacity>

            {/* Copy Result Button */}
            <TouchableOpacity
              style={[S.calcBtn, { backgroundColor: copied ? '#22c55e' : '#1e293b', borderWidth: 1, borderColor: copied ? '#22c55e' : '#334155', marginBottom: 8 }]}
              onPress={async () => {
                const deposit = numVal(startAmount);
                const net = getNetDeposit(deposit);
                const sp = getSPLevel(net);
                const vipLabel = vipEnabled ? ' +VIP' : '';
                const lines = [
                  '💎 Plan B — Strategy Result',
                  `──────────────────────────`,
                  `Deposit:        $${deposit.toLocaleString()}`,
                  `Net capital:    $${net.toLocaleString()}`,
                  `Plan:           ${sp.name}${vipLabel} (${(sp.baseRate + (vipEnabled ? 3 : 0)).toFixed(1)}%/mo)`,
                  `Duration:       ${years} year${numVal(years) !== 1 ? 's' : ''}`,
                  ``,
                  `Monthly goal:   $${numVal(goal).toLocaleString()}`,
                  result.goalReachedMonth
                    ? `Goal reached:   Month ${result.goalReachedMonth} (Year ${Math.ceil(result.goalReachedMonth / 12)})`
                    : `Goal reached:   Not within period`,
                  `Peak discount:  $${result.maxMonthlyOut.toLocaleString()} (Month ${result.maxMonthlyOutMonth})`,
                  ``,
                  `Total invested: $${result.totalIn.toLocaleString()}`,
                  `Total out:      $${result.totalOut.toLocaleString()}`,
                  `Final balance:  $${result.finalCap.toLocaleString()}`,
                  `Net result:     $${result.netResult.toLocaleString()}`,
                  result.rocMonth ? `Break-even:     Month ${result.rocMonth}` : '',
                  ``,
                  `Plan B Diamond · Adviser Pro v2.1`,
                  `Projections are illustrative only — not a guarantee of returns.`,
                ].filter(l => l !== undefined).join('\n');
                await Clipboard.setStringAsync(lines);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
            >
              <Text style={[S.calcText, { color: copied ? '#fff' : '#94a3b8', fontSize: 13 }]}>
                {copied ? '✅ Copied to clipboard' : '📋 Copy Result'}
              </Text>
            </TouchableOpacity>

            {/* Summary Cards */}
            <View style={[S.card, { borderWidth: 1, borderColor: 'rgba(51,197,255,0.22)' }]}>
              <Text style={S.sectionLabel}>{t(language, 'strategySummaryLabel').replace('{years}', String(Math.round(result.months.length / 12)))}</Text>

              {/* 🎯 Target Monthly Goal — always visible, prominent */}
              <View style={{
                backgroundColor: result.goalReachedMonth ? "rgba(34,197,94,0.12)" : "rgba(30,58,95,0.6)",
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: result.goalReachedMonth ? "#22c55e" : "#334155",
              }}>
                <Text style={{ color: "#f59e0b", fontSize: 11, fontWeight: "bold", letterSpacing: 0.5, marginBottom: 4 }}>
                  {t(language, 'targetMonthlyGoal')}
                </Text>
                <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 6 }}>
                  {fmt(numVal(goal))}
                </Text>
                {result.goalReachedMonth ? (
                  <Text style={{ color: "#22c55e", fontSize: 13, fontWeight: "bold" }}>
                    {t(language, 'goalReachedText')
                      .replace('{month}', String(result.goalReachedMonth))
                      .replace('{year}', String(Math.ceil(result.goalReachedMonth / 12)))}
                  </Text>
                ) : (
                  <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                    {t(language, 'goalNotReachedText').replace('{amount}', fmt(result.maxMonthlyOut))}
                  </Text>
                )}
              </View>

              {/* ── VIP Opportunity Nudge ── */}
              {vipShadow && (
                <View style={{ backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: "#f59e0b" }}>
                  <Text style={{ color: "#f59e0b", fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>
                    {t(language, 'stratVipNudgeTitle')}
                  </Text>
                  <Text style={{ color: "#fbbf24", fontSize: 14, fontWeight: "bold", marginBottom: 4, lineHeight: 20 }}>
                    {t(language, 'stratVipNudgeDesc')
                      .replace('{currentResult}', fmt(result.maxMonthlyOut))
                      .replace('{vipResult}', fmt(vipShadow.maxMonthlyOut))
                      .replace('{diff}', fmt(vipShadow.maxMonthlyOut - result.maxMonthlyOut))}
                  </Text>
                  {vipRecoveryMonth && (
                    <Text style={{ color: "#94a3b8", fontSize: 11, lineHeight: 16, marginBottom: 10 }}>
                      {t(language, 'stratVipPotential').replace('{month}', String(vipRecoveryMonth))}
                    </Text>
                  )}
                  <TouchableOpacity style={{ backgroundColor: "#f59e0b", borderRadius: 8, paddingVertical: 10, alignItems: "center" }} onPress={handleCompareWithVip} activeOpacity={0.85}>
                    <Text style={{ color: "#0f172a", fontSize: 13, fontWeight: "bold" }}>{t(language, 'stratCompareVip')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {(() => {
                const vipFee = result.totalVipCost;
                const displayTotalIn = result.totalIn + vipFee;
                const displayNetResult = result.netResult - vipFee;
                const displayNetPct = displayTotalIn > 0 ? (displayNetResult / displayTotalIn * 100).toFixed(1) : '0.0';
                return (
              <View style={S.summaryGrid}>
                {/* Total Purchase Amount — 3-line breakdown */}
                <View style={{ backgroundColor: 'rgba(245,158,11,0.09)', borderRadius: 8, padding: 9, width: '48%', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.38)' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>{t(language, 'totalIn')}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>{t(language, 'assetCapital')}</Text>
                    <Text style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 'bold' }}>{fmt(result.totalIn)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>{t(language, 'vipAccessFeeLabel')}</Text>
                    <Text style={{ color: vipFee > 0 ? '#f87171' : '#64748b', fontSize: 11, fontWeight: 'bold' }}>
                      {vipFee > 0 ? `-${fmt(vipFee)}` : '—'}
                    </Text>
                  </View>
                  <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(245,158,11,0.35)', paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'totalOutlayLabel')}</Text>
                    <Text style={{ color: '#f59e0b', fontSize: 14, fontWeight: 'bold' }}>{fmt(displayTotalIn)}</Text>
                  </View>
                </View>
                <SummaryItem label={t(language,'totalOut')} value={fmt(result.totalOut)} green={result.totalOut > 0} />
                <View style={{ backgroundColor: 'rgba(245,158,11,0.09)', borderRadius: 8, padding: 8, width: '48%', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.38)' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t(language, 'finalBalance')}</Text>
                  <Text style={{ color: '#f59e0b', fontSize: 16, fontWeight: 'bold' }}>{fmt(result.finalCap)}</Text>
                </View>
                <SummaryItem
                  label={t(language, 'netResult')}
                  value={`${fmt(displayNetResult)} (${displayNetPct}%)`}
                  green={displayNetResult >= 0}
                  red={displayNetResult < 0}
                />
                <SummaryItem label={t(language, 'availableRebates')} value={fmt(result.finalWallet + result.finalVipPot + result.finalCompPot)} />
                <SummaryItem label={t(language, 'maxMonthlyDiscountLabel').replace('{month}', String(result.maxMonthlyOutMonth))} value={fmt(result.maxMonthlyOut)} green />
                <SummaryItem
                  label={t(language,'rocBreakEven')}
                  value={result.rocMonth
                    ? `M${result.rocMonth} (Y${Math.ceil(result.rocMonth / 12)}-M${((result.rocMonth - 1) % 12) + 1})`
                    : t(language,'waiting')}
                />
              </View>
                );
              })()}

              {/* ── Brand Authority Row ── */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ backgroundColor: 'rgba(51,197,255,0.1)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(51,197,255,0.28)' }}>
                    <Text style={{ color: '#33C5FF', fontSize: 9, fontWeight: 'bold' }}>{t(language, 'giaVerifiedBadge')}</Text>
                  </View>
                  <Text style={{ color: '#334155', fontSize: 9 }}>{t(language, 'dataSecure')}</Text>
                </View>
                <Text style={{ color: 'rgba(245,158,11,0.65)', fontSize: 9, fontWeight: 'bold', fontStyle: 'italic' }}>{t(language, 'integrityBadge')}</Text>
              </View>

              {(() => {
                const spTiers = [
                  { threshold: 1000,   name: 'SP2', rate: 2.45 },
                  { threshold: 2500,   name: 'SP3', rate: 2.7  },
                  { threshold: 5000,   name: 'SP4', rate: 3.0  },
                  { threshold: 10000,  name: 'SP5', rate: 3.1  },
                  { threshold: 50000,  name: 'SP6', rate: 3.2  },
                  { threshold: 100000, name: 'SP7', rate: 3.3  },
                ];
                const nextSp = spTiers.find(t => result.finalCap < t.threshold && result.finalCap >= t.threshold * 0.8);
                const spHint = nextSp
                  ? `Add ${fmt(nextSp.threshold - result.finalCap)} to unlock ${nextSp.name} (${nextSp.rate}% base/mo)`
                  : null;
                const vipCountdownHint = vipEnabled && result.finalVipPot < 1000
                  ? t(language, 'vipRenewalHint')
                      .replace('{months}', String(Math.ceil((1000 - result.finalVipPot) / 84)))
                      .replace('{amount}', fmt(result.finalVipPot))
                  : null;
                const withdrawalHint = result.totalOut > 0 && result.finalCap <= (parseFloat(startAmount) || 0)
                  ? t(language, 'withdrawalHintText')
                  : null;
                if (!spHint && !vipCountdownHint && !withdrawalHint) return null;
                return (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    {spHint && (
                      <View style={{ backgroundColor: 'rgba(251,191,36,0.88)', borderRadius: 6, padding: 8, borderLeftWidth: 2, borderLeftColor: '#92400e' }}>
                        <Text style={{ color: '#1e293b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'spUpgradeNearby')} {spHint}</Text>
                      </View>
                    )}
                    {vipCountdownHint && (
                      <View style={{ backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 6, padding: 8, borderLeftWidth: 2, borderLeftColor: '#a78bfa' }}>
                        <Text style={{ color: '#a78bfa', fontSize: 11 }}>{t(language, 'vipRenewalLabel')} {vipCountdownHint}</Text>
                      </View>
                    )}
                    {withdrawalHint && (
                      <View style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 6, padding: 8, borderLeftWidth: 2, borderLeftColor: '#f87171' }}>
                        <Text style={{ color: '#f87171', fontSize: 11 }}>⚠ {withdrawalHint}</Text>
                      </View>
                    )}
                  </View>
                );
              })()}
            </View>

            {/* Buyback Guarantee Note */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 10, marginTop: -8, marginBottom: 4 }}>
              <Text style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", fontStyle: "italic" }}>
                {t(language, 'buybackNote')}
              </Text>
            </View>

            {/* Company Margin Mechanics — toggle */}
            <TouchableOpacity
              onPress={() => setShowMarginMechanics(v => !v)}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                marginHorizontal: 16, marginBottom: showMarginMechanics ? 0 : 8, marginTop: 4,
                paddingHorizontal: 14, paddingVertical: 10,
                backgroundColor: '#0D0D0D', borderRadius: 10,
                borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)',
              }}
            >
              <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.2 }}>
                {t(language, 'companyMarginTitle')}
              </Text>
              <Text style={{ color: 'rgba(212,175,55,0.7)', fontSize: 16 }}>
                {showMarginMechanics ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {showMarginMechanics && <CompanyMarginMechanics language={language} />}

            {/* Monthly / Yearly Table */}
            <View style={[S.card, { overflow: 'visible', flexGrow: 1, flexShrink: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text style={[S.sectionLabel, { flex: 1, marginBottom: 0 }]}>{t(language,'monthlyBreakdown').toUpperCase()}</Text>
                {(() => {
                  const bannerCount = result?.months.filter(m => m.maturedSum > 0).length ?? 0;
                  return bannerCount > 0 ? (
                    <TouchableOpacity
                      onPress={() => setAllBannersHidden(v => !v)}
                      style={{ backgroundColor: allBannersHidden ? '#1e293b' : 'rgba(34,197,94,0.12)', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: allBannersHidden ? '#334155' : '#22c55e', flexDirection: 'row', alignItems: 'center', gap: 5 }}
                    >
                      <Text style={{ color: allBannersHidden ? '#64748b' : '#22c55e', fontSize: 10, fontWeight: 'bold' }}>
                        {allBannersHidden ? t(language, 'showBanners') : t(language, 'hideBanners')}
                      </Text>
                      <View style={{ backgroundColor: allBannersHidden ? '#334155' : '#22c55e', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                        <Text style={{ color: allBannersHidden ? '#94a3b8' : '#052e16', fontSize: 9, fontWeight: 'bold' }}>{bannerCount}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null;
                })()}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: viewMode === 'monthly' ? '#f59e0b' : '#64748b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'monthly')}</Text>
                  <Switch
                    value={viewMode === 'yearly'}
                    onValueChange={v => setViewMode(v ? 'yearly' : 'monthly')}
                    trackColor={{ false: '#334155', true: '#f59e0b' }}
                    thumbColor="#fff"
                  />
                  <Text style={{ color: viewMode === 'yearly' ? '#f59e0b' : '#64748b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'yearly')}</Text>
                </View>
              </View>
              {viewMode === 'yearly' ? (
                <YearlySummary result={result} language={language} />
              ) : (
                /* overflow:visible so sticky child can escape the card's border-radius stacking context */
                <View style={{ overflow: 'visible' }}>
                  {/* Sticky header — position:sticky pins it to the page scroll top */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    ref={tableHeaderScrollRef}
                    style={Platform.select({
                      web: { position: 'sticky' as any, top: 0, zIndex: 10, backgroundColor: '#1a2744' } as any,
                      default: { backgroundColor: '#1a2744', zIndex: 10 },
                    })}
                  >
                    <View style={[S.tableHead, { width: TW }]}>
                      {([
                        { tKey: "monthHeader",   w: cw.num      },
                        { tKey: "withdrawal",    w: cw.avail    },
                        { tKey: "discountApplied", w: cw.disc   },
                        { tKey: "startDiamonds", w: cw.diamonds },
                        { tKey: "vipStatus",     w: cw.status   },
                        { tKey: "activeCompAbbr", w: cw.comp    },
                        { tKey: "planPrefix",    w: cw.plan     },
                        { tKey: "outPercentage", w: cw.strat    },
                        { tKey: "deposit",       w: cw.monthly  },
                        { tKey: "finalBalance",  w: cw.total    },
                      ]).map(h => (
                        <Text key={h.tKey} style={[S.th, { width: h.w }]}>{t(language, h.tKey)}</Text>
                      ))}
                    </View>
                  </ScrollView>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator
                    ref={tableBodyScrollRef}
                    onScroll={(e) => {
                      tableHeaderScrollRef.current?.scrollTo({ x: e.nativeEvent.contentOffset.x, animated: false });
                    }}
                    scrollEventThrottle={16}
                    style={{ width: '100%' as any }}
                    contentContainerStyle={{ minWidth: TW }}
                  >
                  <View style={{ width: TW }}>
                    {result.months.map((row) => {
                      const isLastOfYear = row.month % 12 === 0;
                      let yearSummary = null;
                      if (isLastOfYear) {
                        const yearStart = row.month - 11;
                        const yearMonths = result.months.slice(yearStart - 1, row.month);
                        const yearPayout  = yearMonths.reduce((s, r) => s + r.withdrawal, 0);
                        const yearRebates = yearMonths.reduce((s, r) => s + r.grossYield, 0);
                        const yearDeposits = yearMonths.reduce((s, r) => s + r.deposit, 0);
                        yearSummary = (
                          <View style={{ backgroundColor: "#0f1e35", flexDirection: "row", paddingVertical: 6, paddingHorizontal: 4, borderTopWidth: 1, borderBottomWidth: 2, borderColor: "#f59e0b" }}>
                            <Text style={{ width: cw.num,      color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>Y{row.yearNumber}</Text>
                            <Text style={{ width: cw.avail,    color: "#facc15", fontSize: 10, fontWeight: "bold" }}>{fmt(yearPayout)}</Text>
                            <Text style={{ width: cw.disc,     color: "#4ade80", fontSize: 10, fontWeight: "bold" }}>{fmt(yearRebates)}</Text>
                            <Text style={{ width: cw.diamonds, color: "#e2e8f0", fontSize: 10 }}>{fmt(row.capEnd)}</Text>
                            <Text style={{ width: cw.status,   color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>{t(language, 'yearTotal').replace('{year}', String(row.yearNumber))}</Text>
                            <Text style={{ width: cw.comp,     color: "#94a3b8", fontSize: 10 }}>—</Text>
                            <Text style={{ width: cw.plan,     color: "#94a3b8", fontSize: 10 }}>—</Text>
                            <Text style={{ width: cw.strat,    color: "#94a3b8", fontSize: 10 }}>—</Text>
                            <Text style={{ width: cw.monthly,  color: "#60a5fa", fontSize: 10 }}>{fmt(yearDeposits)}</Text>
                            <Text style={{ width: cw.total,    color: "#4ade80", fontSize: 10, fontWeight: "bold" }}>{fmt(row.capEnd)}</Text>
                          </View>
                        );
                      }
                      return (
                        <React.Fragment key={row.month}>
                          {row.isYearStart && (
                            <View style={S.yearRow}>
                              <Text style={S.yearText}>── {t(language, 'year')} {row.yearNumber} ──</Text>
                            </View>
                          )}
                          {row.isSpUpgrade && (
                            <View style={{ backgroundColor: "rgba(245,158,11,0.15)", flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 4, borderLeftWidth: 2, borderLeftColor: "#f59e0b" }}>
                              <Text style={{ color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>{t(language, 'spUpgradeRow').replace('{plan}', row.spName).replace('{rate}', String(row.spBaseRate))}</Text>
                            </View>
                          )}
                          {row.isGoalReached && (
                            <View style={{ backgroundColor: "rgba(34,197,94,0.15)", flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 4, borderLeftWidth: 2, borderLeftColor: "#22c55e" }}>
                              <Text style={{ color: "#22c55e", fontSize: 10, fontWeight: "bold" }}>{t(language, 'goalReachedInTable').replace('{month}', String(row.month))}</Text>
                            </View>
                          )}
                          {row.isNewVip && !row.isVipSelfFunded && (
                            <View style={{ backgroundColor: row.isManualVip ? "rgba(51,197,255,0.15)" : "rgba(245,158,11,0.18)", flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 4, borderLeftWidth: 2, borderLeftColor: row.isManualVip ? "#33C5FF" : "#f59e0b" }}>
                              <Text style={{ color: row.isManualVip ? "#33C5FF" : "#f59e0b", fontSize: 10, fontWeight: "bold" }}>
                                {row.isManualVip
                                  ? `💳 Month ${row.month} — VIP Activation: $1,000 paid manually (external fee — deposit ~$1,016 gross to cover)`
                                  : `⚠️ Month ${row.month} — VIP Activation: $1,000 deducted from deposit`}
                              </Text>
                            </View>
                          )}
                          {/* Maturity banner — shown in the month contracts actually expire */}
                          {row.maturedSum > 0 && !allBannersHidden && !hiddenMaturityMonths.has(row.month) && (() => {
                            const freed = Math.round(row.maturedSum);
                            const alreadySet = getMonthData(row.month).opn === freed;
                            const bannerKey = row.maturedCount > 1 ? 'contractsMatured' : 'contractMatured';
                            return (
                              <View style={{ width: TW, backgroundColor: "rgba(34,197,94,0.12)", flexDirection: "row", alignItems: "center", paddingVertical: 5, paddingHorizontal: 8, borderLeftWidth: 3, borderLeftColor: "#22c55e", gap: 6 }}>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                  <Text style={{ color: "#22c55e", fontSize: 10, fontWeight: "bold" }} numberOfLines={1}>
                                    {t(language, bannerKey).replace('{month}', String(row.month)).replace('{amount}', fmt(freed))}
                                  </Text>
                                  <Text style={{ color: "#64748b", fontSize: 9, marginTop: 1 }} numberOfLines={1}>
                                    {t(language, 'diamondDeliveryHint')}
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() => {
                                    const newOpn = alreadySet ? 0 : freed;
                                    const newMonthData = {
                                      ...monthData,
                                      [row.month]: { ...(monthData[row.month] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), opn: newOpn },
                                    };
                                    setMonthData(newMonthData);
                                    setResult(runCalculation({
                                      startAmount: getNetDeposit(numVal(startAmount, 3000)),
                                      years: numVal(years, 5),
                                      goal: numVal(goal, 3500),
                                      vipEnabled,
                                      manualVip,
                                      monthData: newMonthData,
                                    }));
                                  }}
                                  style={{ backgroundColor: alreadySet ? "#78350f" : "#166534", borderRadius: 5, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: alreadySet ? "#f59e0b" : "#22c55e", flexShrink: 0 }}
                                >
                                  <Text style={{ color: alreadySet ? "#fef3c7" : "#bbf7d0", fontSize: 10, fontWeight: "bold" }}>
                                    {alreadySet ? t(language, 'undoTakeOut') : t(language, 'takeOut')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })()}
                          <TableRow row={row} mData={getMonthData(row.month)} onUpdate={setMonthField} cw={cw} />
                          {yearSummary}
                        </React.Fragment>
                      );
                    })}
                  </View>
                  </ScrollView>
                </View>
              )}
            </View>
          {/* Disclaimer — shown only after results are visible */}
          <DisclaimerInline />
        </>
        )}

        <View style={{ height: 20 }} />
        <DisclaimerFooter />
      </ScrollView>
    </ScreenContainer>
  );
}

function ActiveCompoundingCell({ grossYield, withdrawal, vipFee = 0, colW = 72 }: { grossYield: number; withdrawal: number; vipFee?: number; colW?: number }) {
  const pct = grossYield > 0
    ? Math.max(0, Math.round((grossYield - withdrawal - vipFee) / grossYield * 100))
    : 100;
  const color = pct === 100 ? '#4ade80' : pct >= 75 ? '#a3e635' : pct >= 50 ? '#fbbf24' : pct >= 25 ? '#f97316' : '#f87171';
  const barW = Math.max(20, Math.round(colW * 0.55));
  const fillW = Math.max(0, Math.round((pct / 100) * barW));
  return (
    <View style={{ width: colW, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 }}>
      <Text style={{ color, fontWeight: 'bold', fontSize: 11 }}>{pct}%</Text>
      <View style={{ width: barW, height: 3, backgroundColor: '#1e3a5f', borderRadius: 2, marginTop: 2 }}>
        <View style={{ width: fillW, height: 3, backgroundColor: color, borderRadius: 2 }} />
      </View>
    </View>
  );
}

// colWidth kept as no-op; header now uses inline cw widths

function getRowStyle(row: MonthResult) {
  if (row.isNewVip && !row.isVipSelfFunded) return S.tableRowManualVip;
  if (row.vipStatus && row.vipStatus.includes('VIP')) return S.tableRowVip;
  if (row.withdrawal > 0) return S.tableRowWithdrawal;
  if (row.capEnd > row.capStart) return S.tableRowGrowing;
  return row.month % 2 === 0 ? S.tableRowAlt : S.tableRow;
}

type CW = { num: number; avail: number; disc: number; diamonds: number; status: number; comp: number; plan: number; strat: number; monthly: number; total: number };

function TableRow({ row, mData, onUpdate, cw }: { row: MonthResult; mData: MonthData; onUpdate: (m: number, f: keyof MonthData, v: number) => void; cw: CW }) {
  const rowStyle = getRowStyle(row);
  return (
    <View style={[S.tableRow, rowStyle]}>
      {/* # */}
      <View style={{ width: cw.num, alignItems: 'center' }}>
        <Text style={[S.td, { color: "#94a3b8" }]}>{row.month}</Text>
        {row.isYearStart && (
          <Text style={{ color: "#f59e0b", fontSize: 7, fontWeight: "bold" }}>Y{row.yearNumber}</Text>
        )}
      </View>
      {/* Available Value */}
      <View style={{ width: cw.avail }}>
        <Text style={[S.td, { color: "#facc15", fontWeight: "bold" }]}>{fmt(row.withdrawal)}</Text>
      </View>
      {/* Discount Applied */}
      <View style={{ width: cw.disc, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[S.td, { color: "#4ade80" }]}>{fmt(row.grossYield)}</Text>
        <Text style={{ color: row.isVipActive ? "#fbbf24" : "#64748b", fontSize: 8 }}>
          {getSPLevel(row.grossYield).name}{row.isVipActive ? ' +VIP' : ''}
        </Text>
      </View>
      {/* Diamonds */}
      <Text style={[S.td, { width: cw.diamonds, color: "#e2e8f0" }]}>{fmt(row.capStart)}</Text>
      {/* VIP Status */}
      <View style={{ width: cw.status, alignItems: "center", justifyContent: "center", gap: 2 }}>
        {row.vipStatus ? (
          <View style={{ backgroundColor: row.isNewVip ? "#7f1d1d" : "#1e3a5f", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: row.isNewVip ? "#ef4444" : "#3b82f6" }}>
            <Text style={{ color: row.isNewVip ? "#fca5a5" : "#fde68a", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>{row.vipStatus}</Text>
          </View>
        ) : (
          <Text style={{ color: "#334155", fontSize: 9 }}>—</Text>
        )}
        {row.vipPot > 0 ? (
          <Text style={{ color: "#fbbf24", fontSize: 8, textAlign: "center" }}>💰 {fmt(row.vipPot)}</Text>
        ) : null}
      </View>
      {/* Active Compounding */}
      <ActiveCompoundingCell grossYield={row.grossYield} withdrawal={row.withdrawal} vipFee={row.isVipActive ? 84 : 0} colW={cw.comp} />
      {/* Plan */}
      <View style={{ width: cw.plan, alignItems: 'center' }}>
        <Text style={[S.td, { color: row.isNewVip ? "#ef4444" : "#22c55e", fontSize: 10, fontWeight: "bold" }]}>
          {row.spName} ({row.totalRate.toFixed(1)}%)
        </Text>
      </View>
      {/* Strategy Discount % */}
      <View style={{ width: cw.strat, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TextInput
          style={[S.tdInput, { width: Math.round(cw.strat * 0.72), color: "#f59e0b" }]}
          value={String(mData.opnP)}
          onChangeText={v => onUpdate(row.month, "opnP", parseFloat(v) || 0)}
          keyboardType="numeric"
        />
        <Text style={{ color: '#f59e0b', fontSize: 11, marginLeft: 2 }}>%</Text>
      </View>
      {/* Monthly Purchase */}
      <View style={{ width: cw.monthly, alignItems: 'center' }}>
        <TextInput
          style={[S.tdInput, { width: Math.round(cw.monthly * 0.85), color: "#60a5fa" }]}
          value={String(mData.stort)}
          onChangeText={v => onUpdate(row.month, "stort", parseFloat(v) || 0)}
          keyboardType="numeric"
        />
      </View>
      {/* Total Assets */}
      <Text style={[S.td, { width: cw.total, color: row.capEnd >= row.capStart ? "#4ade80" : "#f87171", fontWeight: "bold" }]}>{fmt(row.capEnd)}</Text>
    </View>
  );
}

function YearlySummary({ result, language }: { result: ReturnType<typeof runCalculation>; language: Language }) {
  const numYears = Math.ceil(result.months.length / 12);
  const rows = Array.from({ length: numYears }, (_, i) => {
    const y = i + 1;
    const yearMonths = result.months.filter(m => m.yearNumber === y);
    const last = yearMonths[yearMonths.length - 1];
    const selfFunded = yearMonths.some(m => m.isVipSelfFunded);
    const firstActivation = yearMonths.some(m => m.isNewVip && !m.isVipSelfFunded);
    return {
      year: y,
      rebatePayout: yearMonths.reduce((s, m) => s + m.withdrawal, 0),
      rebate: yearMonths.reduce((s, m) => s + m.grossYield, 0),
      deposits: yearMonths.reduce((s, m) => s + m.deposit, 0),
      selfFunded,
      firstActivation,
      total: last.capEnd,
    };
  });
  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#334155', paddingHorizontal: 4 }}>
        <Text style={{ width: 36, color: '#f59e0b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'year')}</Text>
        <Text style={{ flex: 1.2, color: '#facc15', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{t(language, 'withdrawal')}</Text>
        <Text style={{ flex: 1, color: '#4ade80', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{t(language, 'annualDiscountGained')}</Text>
        <Text style={{ flex: 1, color: '#60a5fa', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{t(language, 'annualAssetGrowth')}</Text>
        <Text style={{ flex: 1, color: '#94a3b8', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{t(language, 'vipStatus')}</Text>
        <Text style={{ flex: 1, color: '#4ade80', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>Total Assets</Text>
      </View>
      {rows.map(r => (
        <View key={r.year} style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b', alignItems: 'center', paddingHorizontal: 4 }}>
          <Text style={{ width: 36, color: '#f59e0b', fontSize: 13, fontWeight: 'bold' }}>Y{r.year}</Text>
          <Text style={{ flex: 1.2, color: '#facc15', fontSize: 14, fontWeight: 'bold', textAlign: 'right' }}>{fmt(r.rebatePayout)}</Text>
          <Text style={{ flex: 1, color: '#4ade80', fontSize: 13, textAlign: 'right' }}>{fmt(r.rebate)}</Text>
          <Text style={{ flex: 1, color: r.deposits > 0 ? '#60a5fa' : '#475569', fontSize: 13, textAlign: 'right' }}>{r.deposits > 0 ? fmt(r.deposits) : '—'}</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {r.selfFunded ? (
              <View style={{ backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: '#22c55e' }}>
                <Text style={{ color: '#22c55e', fontSize: 8, fontWeight: 'bold' }}>{t(language, 'vipSelfFunded')}</Text>
              </View>
            ) : r.firstActivation ? (
              <View style={{ backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: '#ef4444' }}>
                <Text style={{ color: '#fca5a5', fontSize: 8, fontWeight: 'bold' }}>{t(language, 'newVip')}</Text>
              </View>
            ) : (
              <Text style={{ color: '#64748b', fontSize: 10 }}>—</Text>
            )}
          </View>
          <Text style={{ flex: 1, color: '#4ade80', fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>{fmt(r.total)}</Text>
        </View>
      ))}
    </View>
  );
}

function CompanyMarginMechanics({ language }: { language: Language }) {
  const GOLD       = '#D4AF37';
  const GOLD_DIM   = 'rgba(212,175,55,0.5)';
  const GOLD_GLOW  = 'rgba(212,175,55,0.18)';
  const GOLD_FAINT = 'rgba(212,175,55,0.07)';
  const ONYX       = '#0D0D0D';
  const ff         = Platform.OS === 'web' ? 'Trebuchet MS, sans-serif' : undefined;

  const flowSteps = [
    { icon: '⛏',  topLine: t(language, 'directRoughTopLine'), label: t(language, 'sourcingLabel'),  sub: t(language, 'ofSalePrice'),    value: '~10%', highlight: true  },
    { icon: '💎', topLine: t(language, 'internalCutTopLine'), label: t(language, 'giaCertLabel'),   sub: t(language, 'processingCost'), value: '~15%', highlight: false },
    { icon: '💼',  topLine: t(language, 'b2bGlobalTopLine'),   label: t(language, 'b2bSaleCardLabel'), sub: t(language, 'realizedValue'), value: '100%', highlight: true  },
  ];

  return (
    <View style={{ backgroundColor: ONYX, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: GOLD_DIM, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <View style={{ borderBottomWidth: 0.5, borderBottomColor: GOLD, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: GOLD, fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5, fontFamily: ff, flex: 1 }}>
          {t(language, 'companyMarginTitle')}
        </Text>
        <Text style={{ color: GOLD_DIM, fontSize: 11, fontFamily: ff }}>{t(language, 'b2bSupplyChainLabel')}</Text>
      </View>

      <View style={{ padding: 16 }}>

        {/* ── 1. Side-by-side comparison ── */}
        <View style={{ flexDirection: 'row', alignItems: 'stretch', marginBottom: 18, gap: 8 }}>

          {/* LEFT: Traditional Chain */}
          <View style={{ flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.04)', overflow: 'hidden' }}>
            <View style={{ backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 8, paddingVertical: 6 }}>
              <Text style={{ color: '#f87171', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.8, textAlign: 'center', fontFamily: ff }}>
                {t(language, 'traditionalMarket').toUpperCase()}
              </Text>
            </View>
            <View style={{ padding: 10, position: 'relative', minHeight: 76 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, opacity: 0.36 }}>
                {[
                  { icon: '🏛️', label: t(language, 'nodeDealer') },
                  { icon: '📈', label: t(language, 'nodeExchange') },
                  { icon: '🏭', label: t(language, 'nodeWholesale') },
                  { icon: '🚛', label: t(language, 'nodeDist') },
                  { icon: '🏪', label: t(language, 'nodeRetail') },
                  { icon: '🏬', label: t(language, 'nodeStore') },
                  { icon: '👤', label: t(language, 'nodeClient') },
                ].map((node, i) => (
                  <View key={i} style={{ alignItems: 'center', width: 30 }}>
                    <Text style={{ fontSize: 15 }}>{node.icon}</Text>
                    <Text style={{ color: '#64748b', fontSize: 7, textAlign: 'center', fontFamily: ff }}>{node.label}</Text>
                  </View>
                ))}
              </View>
              {/* Red dashed overlay */}
              <View style={[{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(239,68,68,0.07)',
                alignItems: 'center', justifyContent: 'center', borderRadius: 8,
              }, Platform.OS === 'web' ? { borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)' } as any : { borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)' }]}>
                <Text style={{ color: '#f87171', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                <Text style={{ color: '#f87171', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, fontFamily: ff, textAlign: 'center', lineHeight: 14, marginTop: 1 }}>
                  700%{'\n'}{t(language, 'priceBloatLabel')}
                </Text>
              </View>
            </View>
          </View>

          {/* VS divider */}
          <View style={{ width: 26, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 1, flex: 1, backgroundColor: GOLD_DIM }} />
            <Text style={{ color: GOLD, fontSize: 10, fontWeight: 'bold', fontFamily: ff, paddingVertical: 4 }}>VS</Text>
            <View style={{ width: 1, flex: 1, backgroundColor: GOLD_DIM }} />
          </View>

          {/* RIGHT: Direct model quick view */}
          <View style={{ flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: GOLD, backgroundColor: GOLD_FAINT, overflow: 'hidden' }}>
            <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 8, paddingVertical: 6 }}>
              <Text style={{ color: GOLD, fontSize: 10, fontWeight: 'bold', letterSpacing: 0.8, textAlign: 'center', fontFamily: ff }}>
                {t(language, 'ourDirectModel')}
              </Text>
            </View>
            <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', flex: 1 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>⛏</Text>
                <Text style={{ color: GOLD_DIM, fontSize: 8, fontFamily: ff }}>{t(language, 'roughLabel')}</Text>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: ff }}>~10%</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={[{ backgroundColor: '#22c55e', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, marginBottom: 3 }, Platform.OS === 'web' ? { boxShadow: '0 0 8px rgba(34,197,94,0.5)' } as any : {}]}>
                  <Text style={{ color: '#0f172a', fontSize: 9, fontWeight: 'bold', fontFamily: ff }}>~75%</Text>
                </View>
                <Text style={{ color: '#22c55e', fontSize: 7, fontWeight: 'bold', fontFamily: ff, marginBottom: 2 }}>{t(language, 'netMarginLabel')}</Text>
                <Text style={{ color: GOLD, fontSize: 18 }}>→</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>💼</Text>
                <Text style={{ color: GOLD_DIM, fontSize: 8, fontFamily: ff }}>Business to Business</Text>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: ff }}>100%</Text>
              </View>
            </View>
          </View>

        </View>

        {/* ── 2. Mine-to-Market detailed flow ── */}
        <Text style={{ color: GOLD, fontSize: 12, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 10, fontFamily: ff }}>
          {t(language, 'mineToMarketEff').toUpperCase()}
        </Text>

        {/* 3-step flow — $9K badge on connector before B2B Sale */}
        <View style={{ flexDirection: 'row', alignItems: 'stretch', marginBottom: 12, justifyContent: 'space-between', gap: 6 }}>
          {flowSteps.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                flex: 1, alignItems: 'center',
                backgroundColor: step.highlight ? GOLD_GLOW : GOLD_FAINT,
                borderRadius: 10,
                borderWidth: step.highlight ? 1 : 0.5,
                borderColor: step.highlight ? GOLD : GOLD_DIM,
                paddingHorizontal: 10, paddingVertical: 16,
              }}>
                <Text style={{ fontSize: 29, marginBottom: 6 }}>{step.icon}</Text>
                <Text style={{ color: step.highlight ? GOLD : '#94a3b8', fontSize: 12, fontWeight: 'bold', textAlign: 'center', fontFamily: ff, letterSpacing: 0.3 }}>
                  {step.topLine}
                </Text>
                <Text style={{ color: step.highlight ? GOLD : '#94a3b8', fontSize: 12, fontWeight: 'bold', textAlign: 'center', fontFamily: ff, letterSpacing: 0.3 }}>
                  {step.label}
                </Text>
                <Text style={{ color: GOLD_DIM, fontSize: 11, textAlign: 'center', fontFamily: ff, marginTop: 3 }}>{step.sub}</Text>
                {step.value && (
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 6, textAlign: 'center', fontFamily: ff }}>
                    {step.value}
                  </Text>
                )}
              </View>
              {i < flowSteps.length - 1 && (
                i === 1 ? (
                  <View style={{ alignItems: 'center', paddingHorizontal: 2 }}>
                    <View style={[{ backgroundColor: '#22c55e', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, marginBottom: 1 }, Platform.OS === 'web' ? { boxShadow: '0 0 8px rgba(34,197,94,0.45)' } as any : {}]}>
                      <Text style={{ color: '#0f172a', fontSize: 9, fontWeight: 'bold', fontFamily: ff }}>~75%</Text>
                    </View>
                    <Text style={{ color: '#22c55e', fontSize: 7, fontWeight: 'bold', fontFamily: ff, marginBottom: 2 }}>{t(language, 'marginLabel')}</Text>
                    <Text style={{ color: GOLD, fontSize: 20 }}>›</Text>
                  </View>
                ) : (
                  <Text style={{ color: GOLD, fontSize: 22, paddingHorizontal: 2, alignSelf: 'center' }}>›</Text>
                )
              )}
            </View>
          ))}
        </View>

        {/* Margin Pool equation */}
        <View style={{ backgroundColor: GOLD_GLOW, borderRadius: 8, borderWidth: 0.5, borderColor: GOLD, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: GOLD, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 7, textAlign: 'center', fontFamily: ff }}>
            {t(language, 'operationalMarginPool').toUpperCase()}
          </Text>
          <Text style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 19, textAlign: 'center', fontFamily: ff }}>
            {t(language, 'b2bBulkRevenue')} {t(language, 'minusOpCosts')}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6, fontFamily: ff }}>
            {t(language, 'resultingMarginFunds') + '  '}
            <Text style={{ color: GOLD, fontWeight: 'bold' }}>[1] {t(language, 'operationalProfitLabel')}</Text>
            {'   '}
            <Text style={{ color: '#60a5fa', fontWeight: 'bold' }}>[2] {t(language, 'b2bTradingLabel')}</Text>
            {'   '}
            <Text style={{ color: '#4ade80', fontWeight: 'bold' }}>[3] {t(language, 'customerDiscountsLabel')}</Text>
          </Text>
        </View>

        {/* ── 3. Margin breakdown + Yield bridge ── */}
        <View style={[{ borderRadius: 8, padding: 14, marginBottom: 18 }, Platform.OS === 'web' ? { borderStyle: 'dashed', borderWidth: 1, borderColor: GOLD } as any : { borderWidth: 1, borderColor: GOLD }]}>
          {/* Cost breakdown table */}
          <View style={{ marginBottom: 10 }}>
            {[
              { icon: '⛏', label: t(language, 'roughCostRow'),  pct: '~10%', color: '#94a3b8' },
              { icon: '💎', label: t(language, 'cutGiaRow'),     pct: '~15%', color: '#94a3b8' },
              { icon: '💼', label: t(language, 'b2bSaleRow'),    pct: '100%', color: '#e2e8f0' },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={{ fontSize: 14, width: 22 }}>{row.icon}</Text>
                <Text style={{ color: row.color, fontSize: 12, flex: 1, fontFamily: ff }}>{row.label}</Text>
                <Text style={{ color: row.color, fontSize: 12, fontWeight: 'bold', fontFamily: ff }}>{row.pct}</Text>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: GOLD_DIM, marginVertical: 6 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, width: 22 }}>💰</Text>
              <Text style={{ color: '#22c55e', fontSize: 13, fontWeight: 'bold', flex: 1, fontFamily: ff }}>{t(language, 'netOperatingMargin')}</Text>
              <Text style={{ color: '#22c55e', fontSize: 16, fontWeight: 'bold', fontFamily: ff }}>~75%</Text>
            </View>
          </View>
          {/* Bridge sentence */}
          <View style={{ borderTopWidth: 0.5, borderTopColor: GOLD_DIM, paddingTop: 10 }}>
            <Text style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 19, fontFamily: ff }}>
              {t(language, 'marginBridgeIntro') + ' '}
              <Text style={{ color: GOLD, fontWeight: 'bold' }}>{t(language, 'marginBridgeHL')}</Text>
              {'. ' + t(language, 'marginBridgeOutro')}
            </Text>
          </View>
        </View>

        {/* ── 4. Capital Velocity bold stat (replaces Q1–Q4 bar) ── */}
        <View style={{ backgroundColor: GOLD_GLOW, borderRadius: 10, borderWidth: 1, borderColor: GOLD_DIM, padding: 16, marginBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ alignItems: 'center', minWidth: 60 }}>
            <Text style={{ color: GOLD, fontSize: 42, fontWeight: 'bold', fontFamily: ff, lineHeight: 46 }}>4×</Text>
            <Text style={{ color: GOLD_DIM, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, fontFamily: ff, textAlign: 'center' }}>{t(language, 'annualRotationLabel')}</Text>
          </View>
          <View style={{ width: 1, height: 52, backgroundColor: GOLD_DIM }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 'bold', fontFamily: ff, marginBottom: 4 }}>
              {t(language, 'capitalRotationStat')}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 17, fontFamily: ff }}>
              {t(language, 'capitalRotationDesc')}{' '}
              <Text style={{ color: '#4ade80', fontWeight: 'bold' }}>{t(language, 'consistentRebates')}</Text>
              {' ' + t(language, 'regardlessCycle')}
            </Text>
            <Text style={{ color: GOLD, fontSize: 11, fontWeight: 'bold', fontFamily: ff, marginTop: 5 }}>
              300% minimum — 4 cycles / 12 months
            </Text>
          </View>
        </View>

        {/* ── 5. Transparency Note (fontSize 15) ── */}
        <View style={{ borderTopWidth: 0.5, borderTopColor: GOLD_DIM, paddingTop: 13 }}>
          <Text style={{ color: GOLD, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6, fontFamily: ff }}>
            {t(language, 'transparencyNoteTitle')}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 15, lineHeight: 22, fontStyle: 'italic', fontFamily: ff }}>
            {t(language, 'transparencyNoteBody')}
          </Text>
        </View>

      </View>
    </View>
  );
}

function SummaryItem({ label, value, green, red }: { label: string; value: string; green?: boolean; red?: boolean }) {
  return (
    <View style={S.summaryItem}>
      <Text style={S.summaryLabel}>{label}</Text>
      <Text style={[S.summaryValue, green ? { color: "#4ade80" } : red ? { color: "#f87171" } : { color: "#e2e8f0" }]}>{value}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0f172a", width: '100%' as any },
  content: { padding: 16, width: '100%' as any, ...Platform.select({ web: { width: '96%' as any, maxWidth: 1450, alignSelf: 'center' as const } }) },
  header: { marginBottom: 10, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", marginBottom: 6 },
  backText: { color: "#60a5fa", fontSize: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 2 },
  card: { backgroundColor: "#1e293b", borderRadius: 12, padding: 12, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex1: { flex: 1 },
  label: { color: "#f59e0b", fontSize: 15, fontWeight: "bold", marginBottom: 3, letterSpacing: 0.5 },
  input: { backgroundColor: "#0f172a", color: "#fff", borderRadius: 8, padding: 10, fontSize: 16, borderWidth: 1, borderColor: "#334155" },
  bigInput: { backgroundColor: "#0f172a", color: "#fff", borderRadius: 8, padding: 8, fontSize: 20, fontWeight: "bold", borderWidth: 1, borderColor: "#334155" },
  goalInput: { flex: 1, backgroundColor: "#0f172a", color: "#f59e0b", borderRadius: 8, padding: 8, fontSize: 18, fontWeight: "bold", borderWidth: 1, borderColor: "#f59e0b" },
  resetBtn: { backgroundColor: "#dc2626", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  resetText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  progressBar: { height: 6, backgroundColor: "#0f172a", borderRadius: 3, marginTop: 6, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#22c55e", borderRadius: 3 },
  progressLabel: { color: "#22c55e", fontSize: 13, fontWeight: "bold", marginTop: 3 },
  goalBadge: { backgroundColor: "#22c55e", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3, marginLeft: 8 },
  goalBadgeText: { color: "#0f172a", fontWeight: "bold", fontSize: 13 },
  vipBox: { alignItems: "center", marginLeft: 12 },
  sectionLabel: { color: "#f59e0b", fontSize: 15, fontWeight: "bold", marginBottom: 5, marginTop: 4, letterSpacing: 0.5 },
  bulkRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 },
  bulkInput: { flex: 1, backgroundColor: "#0f172a", color: "#fff", borderRadius: 6, padding: 7, fontSize: 15, borderWidth: 1, borderColor: "#334155" },
  bulkSmall: { width: 64, backgroundColor: "#0f172a", color: "#fff", borderRadius: 6, padding: 7, fontSize: 15, borderWidth: 1, borderColor: "#334155" },
  btnBlue: { backgroundColor: "#33C5FF", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  btnAmber: { backgroundColor: "#f59e0b", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  btnPurple: { backgroundColor: "#a78bfa", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  btnTextDark: { color: "#0f172a", fontWeight: "bold", fontSize: 14 },
  calcBtn: { backgroundColor: "#f59e0b", borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 8 },
  calcText: { color: "#0f172a", fontWeight: "bold", fontSize: 17, letterSpacing: 1 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  summaryItem: { backgroundColor: "#0f172a", borderRadius: 8, padding: 8, width: "48%" },
  summaryLabel: { color: "#94a3b8", fontSize: 13, marginBottom: 2 },
  summaryValue: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  tableHead: { flexDirection: "row", backgroundColor: "#1a2744", paddingVertical: 7, borderBottomWidth: 1.5, borderBottomColor: "#f59e0b" },
  th: { color: "#f59e0b", fontSize: 10, fontWeight: "bold", paddingHorizontal: 3, textAlign: "center", letterSpacing: 0.3 },
  tableRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#0f172a", paddingVertical: 3, backgroundColor: "#0f172a" },
  tableRowAlt: { backgroundColor: "#1a2744" },
  tableRowManualVip: { backgroundColor: "rgba(245,158,11,0.12)", borderLeftWidth: 2, borderLeftColor: "#f59e0b" },
  tableRowVip: { backgroundColor: "#0f1e3d" },
  tableRowWithdrawal: { backgroundColor: "#0f172a" },
  tableRowGrowing: { backgroundColor: "#0a1f0a" },
  td: { fontSize: 13, paddingHorizontal: 3, textAlign: "center", color: "#e2e8f0" },
  tdInput: { backgroundColor: "#0f172a", borderRadius: 3, paddingHorizontal: 3, paddingVertical: 2, fontSize: 13, textAlign: "center", borderWidth: 1, borderColor: "#334155" },
  yearRow: { backgroundColor: "#1e3a5f", paddingVertical: 3, paddingHorizontal: 8 },
  yearText: { color: "#60a5fa", fontSize: 13, fontWeight: "bold", textAlign: "center" },
  appliedBanner: { backgroundColor: "#14532d", borderRadius: 10, padding: 10, marginBottom: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#22c55e" },
  appliedBannerText: { color: "#86efac", fontSize: 15, fontWeight: "600", flex: 1, lineHeight: 22 },
  appliedBannerClose: { color: "#86efac", fontSize: 18, paddingLeft: 8 },
});
