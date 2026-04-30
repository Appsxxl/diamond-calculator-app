import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Print from "expo-print";
import * as IntentLauncher from "expo-intent-launcher";
import { ScreenContainer } from "@/components/screen-container";
import { DisclaimerFooter, DisclaimerInline } from "@/components/disclaimer-footer";
import { useCalculator } from "@/lib/calculator-context";
import { t } from "@/lib/translations";
import { runCalculation, MonthResult, fmt, MonthData, CalculationParams, createDefaultMonthData } from "@/lib/calculator";

function numVal(s: string, fallback = 0): number {
  const n = parseFloat(s);
  return isNaN(n) ? fallback : n;
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
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [globalCompPct, setGlobalCompPct] = useState(100);

  const applyGlobalComp = useCallback((pct: number) => {
    setGlobalCompPct(pct);
    setMonthData(prev => {
      const updated = { ...prev };
      for (let m = 1; m <= (numVal(years) * 12); m++) {
        updated[m] = { ...(updated[m] ?? createDefaultMonthData()), comp: pct };
      }
      return updated;
    });
  }, [years]);

  const [clientName, setClientName] = useState("");
  const [startAmount, setStartAmount] = useState("10000");
  const [years, setYears] = useState("5");
  const [goal, setGoal] = useState("2000");
  const [vipEnabled, setVipEnabled] = useState(true);

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
  // Bulk compound%
  const [bulkCompVal, setBulkCompVal] = useState("");
  const [bulkCompFrom, setBulkCompFrom] = useState("");
  const [bulkCompTo, setBulkCompTo] = useState("");

  const [monthData, setMonthData] = useState<Record<number, MonthData>>({});
  const [result, setResult] = useState<ReturnType<typeof runCalculation> | null>(null);

  // Auto-fill from Strategy Engineer when navigated with plan params
  useEffect(() => {
    if (!params.plan) return;
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
    }
    // Apply out% to month 1 for Plan D
    const outP = parseFloat(params.outP ?? "0") || 0;
    if (outP > 0) {
      newMonthData[1] = { ...(newMonthData[1] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), opnP: outP };
    }
    setMonthData(newMonthData);
    setResult(null);
    const planLabels: Record<string, string> = {
      A: "Plan A — Monthly Top-Up Strategy",
      B: "Plan B — Wait & Grow Strategy",
      C: "Plan C — One-Year Lump Sum Strategy",
      D: "Plan D — Instant Payout Strategy",
    };
    setAppliedBanner(`✅ ${t(language, 'appliedFromStrategy')}: ${planLabels[params.plan ?? ""] ?? params.plan}`);
    // Auto-dismiss banner after 5 seconds
    const timer = setTimeout(() => setAppliedBanner(null), 5000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.plan, params.startAmount, params.monthlyDeposit, params.years, params.outP, params.vip, params.goalAmount]);

  // Auto-fill from Property Optimizer
  useEffect(() => {
    if (params.source !== "property") return;
    const newMonthData: Record<number, MonthData> = {};
    const yrs = parseFloat(params.years ?? "10") || 10;
    const totalM = yrs * 12;
    const withdrawal = parseFloat(params.propWithdrawal ?? "0") || 0;
    const fromMonth = parseInt(params.propWithdrawalFrom ?? "61") || 61;
    const outPct = parseFloat(params.outP ?? "0") || 0;
    if (params.startAmount) setStartAmount(params.startAmount);
    setYears(String(yrs));
    if (params.vip !== undefined) setVipEnabled(params.vip === "1");
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
    setResult(null);
    const spLabel = params.startAmount ? `$${parseFloat(params.startAmount).toLocaleString()}` : "";
    const vipLabel = params.vip === "1" ? " + VIP" : "";
    if (outPct > 0) {
      setAppliedBanner(`🏡 Asset Goal Planner: ${spLabel}${vipLabel} — ${outPct}% out/mo · ${yrs}y`);
    } else {
      setAppliedBanner(`🏠 Property Optimizer: ${spLabel}${vipLabel} — $${withdrawal.toLocaleString()}/mo withdrawal from Year 5`);
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

  const applyBulkComp = () => {
    const val = numVal(bulkCompVal);
    const from = numVal(bulkCompFrom, 1);
    const to = numVal(bulkCompTo, totalMonths);
    setMonthData(prev => {
      const next = { ...prev };
      for (let m = from; m <= Math.min(to, totalMonths); m++) {
        next[m] = { ...(next[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), comp: val };
      }
      return next;
    });
  };

  const handleReset = () => {
    setClientName(""); setStartAmount("10000"); setYears("5"); setGoal("2000");
    setVipEnabled(true); setMonthData({}); setResult(null);
    setBulkStortVal(""); setBulkStortTo(""); setAnnualVal("");
    setBulkOpnVal(""); setBulkOpnFrom(""); setBulkOpnPVal(""); setBulkOpnPFrom("");
    setBulkCompVal(""); setBulkCompFrom(""); setBulkCompTo("");
  };

  const handleCalculate = () => {
    const params: CalculationParams = {
      startAmount: numVal(startAmount, 10000),
      years: numVal(years, 5),
      goal: numVal(goal, 2000),
      vipEnabled,
      monthData,
    };
    const res = runCalculation(params);
    setResult(res);
  };

  const goalProgress = result ? result.goalProgress : 0;

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
            {result?.goalReached && (
              <View style={S.goalBadge}><Text style={S.goalBadgeText}>🎯 GOAL REACHED!</Text></View>
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
              <Switch value={vipEnabled} onValueChange={setVipEnabled} trackColor={{ false: "#333", true: "#f59e0b" }} thumbColor="#fff" />
            </View>
          </View>
        </View>

        {/* Start & Years */}
        <View style={S.row}>
          <View style={[S.card, S.flex1, { marginRight: 5 }]}>
            <Text style={S.label}>{t(language, 'startDiamonds').toUpperCase()} $</Text>
            <TextInput style={S.bigInput} value={startAmount} onChangeText={setStartAmount} keyboardType="numeric" placeholderTextColor="#555" />
          </View>
          <View style={[S.card, S.flex1, { marginLeft: 5 }]}>
            <Text style={S.label}>{t(language, 'years').toUpperCase()}</Text>
            <TextInput style={S.bigInput} value={years} onChangeText={setYears} keyboardType="numeric" placeholderTextColor="#555" />
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

        {/* Bulk Compound */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language,'compoundPercentage').toUpperCase()}</Text>
          <View style={S.bulkRow}>
            <TextInput style={S.bulkSmall} value={bulkCompVal} onChangeText={setBulkCompVal} placeholder="%" placeholderTextColor="#555" keyboardType="numeric" />
            <TextInput style={S.bulkSmall} value={bulkCompFrom} onChangeText={setBulkCompFrom} placeholder={t(language,'from')} placeholderTextColor="#555" keyboardType="numeric" />
            <TextInput style={S.bulkSmall} value={bulkCompTo} onChangeText={setBulkCompTo} placeholder={t(language,'till')} placeholderTextColor="#555" keyboardType="numeric" />
            <TouchableOpacity style={S.btnPurple} onPress={applyBulkComp}><Text style={S.btnText}>{t(language,'set')}</Text></TouchableOpacity>
          </View>
        </View>

        {/* Global Rebate Re-Use % quick presets */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>🔄 {t(language, 'compoundPercentage').toUpperCase()} — QUICK PRESETS</Text>
          <Text style={{ color: "#64748b", fontSize: 11, marginBottom: 8 }}>
            Apply one rebate re-use % to all months instantly.
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {[0, 25, 50, 75, 100].map(pct => (
              <TouchableOpacity
                key={pct}
                style={{ flex: 1, backgroundColor: globalCompPct === pct ? "#f59e0b" : "#1e293b", borderRadius: 8, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: globalCompPct === pct ? "#f59e0b" : "#334155" }}
                onPress={() => applyGlobalComp(pct)}
              >
                <Text style={{ color: globalCompPct === pct ? "#0f172a" : "#64748b", fontWeight: "bold", fontSize: 14 }}>{pct}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculate */}
        <TouchableOpacity style={S.calcBtn} onPress={handleCalculate}>
          <Text style={S.calcText}>⚡ {t(language, 'calculate').toUpperCase()}</Text>
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
                  const totalYears = Math.round(result.months.length / 12);
                  const totalMonths = result.months.length;
                  const maxRebateMonth = result.months.reduce((best, r) => r.grossYield > best.grossYield ? r : best, result.months[0]);

                  // Build monthly table rows — grouped by year if > 5 years
                  let tableBody = '';
                  if (totalYears <= 5) {
                    let cumulative = 0;
                    tableBody = result.months.map(row => {
                      cumulative += row.grossYield;
                      const bg = row.month % 2 === 0 ? '#f8fafc' : '#ffffff';
                      return `<tr style="background:${bg}">
                        <td style="text-align:center;color:#1e293b">${row.month}</td>
                        <td style="text-align:right;color:#16a34a;font-weight:600">$${fmt(row.grossYield)}</td>
                        <td style="text-align:right;color:#16a34a">$${fmt(cumulative)}</td>
                        <td style="text-align:right;color:#1e3a5f;font-weight:600">$${fmt(row.capEnd)}</td>
                      </tr>`;
                    }).join('');
                  } else {
                    // Group by year
                    let cumulative = 0;
                    const years_map: Record<number, { rebates: number; finalVal: number; months: number }> = {};
                    result.months.forEach(row => {
                      const yr = Math.ceil(row.month / 12);
                      if (!years_map[yr]) years_map[yr] = { rebates: 0, finalVal: 0, months: 0 };
                      years_map[yr].rebates += row.grossYield;
                      years_map[yr].finalVal = row.capEnd;
                      years_map[yr].months = row.month;
                    });
                    tableBody = Object.entries(years_map).map(([yr, data]) => {
                      cumulative += data.rebates;
                      const bg = parseInt(yr) % 2 === 0 ? '#f8fafc' : '#ffffff';
                      return `<tr style="background:${bg}">
                        <td style="text-align:center;color:#1e293b;font-weight:600">Year ${yr} (Month ${(parseInt(yr)-1)*12+1}–${data.months})</td>
                        <td style="text-align:right;color:#16a34a;font-weight:600">$${fmt(data.rebates)}</td>
                        <td style="text-align:right;color:#16a34a">$${fmt(cumulative)}</td>
                        <td style="text-align:right;color:#1e3a5f;font-weight:600">$${fmt(data.finalVal)}</td>
                      </tr>`;
                    }).join('');
                  }

                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
                  <title>Plan B — Personal Strategy Roadmap</title>
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
                    <div class="doc-title">
                      <div class="doc-title-main">Personal Strategy Roadmap</div>
                      <div class="doc-meta">Date: ${today}</div>
                      <div class="doc-meta">${office.name}</div>
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
                      <div class="param-value">$${fmt(numVal(startAmount))}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">Strategy Duration</div>
                      <div class="param-value">${totalYears} Years (${totalMonths} Months)</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">Monthly Diamond Purchases</div>
                      <div class="param-value">${result.months[0]?.deposit > 0 ? '$'+fmt(result.months[0].deposit) : 'None'}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">VIP Status</div>
                      <div class="param-value" style="color:${vipEnabled ? '#33C5FF' : '#64748b'}">${vipEnabled ? 'Active (+3% Monthly Rebate)' : 'Standard'}</div>
                    </div>
                  </div>

                  <!-- STRATEGY SUMMARY -->
                  <div class="section-title">Strategy Summary — ${totalYears} Year Period</div>
                  <div class="summary-box">
                    <div class="stat">
                      <div class="stat-label">Total Purchase Amount</div>
                      <div class="stat-value">$${fmt(result.totalIn)}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Total Rebates Distributed</div>
                      <div class="stat-value green">$${fmt(result.totalOut)}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Final Diamond Value</div>
                      <div class="stat-value green">$${fmt(result.finalCap)}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Total Strategy Benefit</div>
                      <div class="stat-value green">$${fmt(result.netResult)} (${result.totalIn > 0 ? (result.netResult / result.totalIn * 100).toFixed(1) : '0.0'}%)</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Purchase Offset Point</div>
                      <div class="stat-value blue">${result.rocMonth ? 'Month ' + result.rocMonth + ' (Year ' + Math.ceil(result.rocMonth/12) + ')' : 'Pending'}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">Max Monthly Rebate (Month ${totalMonths})</div>
                      <div class="stat-value green">$${fmt(result.maxMonthlyOut)}</div>
                    </div>
                  </div>

                  <!-- MONTHLY REBATE SCHEDULE -->
                  <div class="section-title">Monthly Rebate Schedule ${totalYears > 5 ? '(Grouped by Year)' : ''}</div>
                  <table>
                    <thead>
                      <tr>
                        <th>${totalYears > 5 ? 'Period' : 'Month'}</th>
                        <th style="text-align:right">${totalYears > 5 ? 'Annual Rebate ($)' : 'Monthly Rebate ($)'}</th>
                        <th style="text-align:right">Cumulative Rebates ($)</th>
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
                    <span>Generated by Plan B App · ${today}</span>
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

            {/* Summary Cards */}
            <View style={S.card}>
              <Text style={S.sectionLabel}>{`STRATEGY SUMMARY — ${Math.round(result.months.length / 12)} YEAR STRATEGY`}</Text>
              {result.goalReachedMonth && (
                <View style={{ backgroundColor: "rgba(34,197,94,0.12)", borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>🎯</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#22c55e", fontSize: 13, fontWeight: "bold" }}>
                      Goal Reached at Month {result.goalReachedMonth} (Year {Math.ceil(result.goalReachedMonth / 12)})
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 11 }}>
                      Target Monthly Rebate achieved — client strategy is on track
                    </Text>
                  </View>
                </View>
              )}
              <View style={S.summaryGrid}>
                <SummaryItem label={t(language,'totalIn')} value={fmt(result.totalIn)} />
                <SummaryItem label={t(language,'totalOut')} value={fmt(result.totalOut)} green={result.totalOut > 0} />
                <SummaryItem label={t(language,'finalBalance')} value={fmt(result.finalCap)} green />
                <SummaryItem
                  label="Total Purchase Benefit"
                  value={`${fmt(result.netResult)} (${result.totalIn > 0 ? (result.netResult / result.totalIn * 100).toFixed(1) : '0.0'}%)`}
                  green={result.netResult >= 0}
                  red={result.netResult < 0}
                />
                <SummaryItem label="Available Rebates" value={fmt(result.finalWallet + result.finalVipPot + result.finalCompPot)} />
                <SummaryItem label="VIP Access Fee" value={result.totalVipCost > 0 ? `-${fmt(result.totalVipCost)}` : fmt(0)} red={result.totalVipCost > 0} />
                <SummaryItem label={`MAX MONTHLY REBATE (Month ${result.months.length})`} value={fmt(result.maxMonthlyOut)} green />
                <SummaryItem
                  label={t(language,'rocBreakEven')}
                  value={result.rocMonth
                    ? `M${result.rocMonth} (Y${Math.ceil(result.rocMonth / 12)}-M${((result.rocMonth - 1) % 12) + 1})`
                    : t(language,'waiting')}
                />
              </View>
            </View>

            {/* Buyback Guarantee Note */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 10, marginTop: -8, marginBottom: 4 }}>
              <Text style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", fontStyle: "italic" }}>
                {"All physical diamonds are protected by a contractual 100% Buyback Guarantee upon completion of the strategy period."}
              </Text>
            </View>

            {/* Monthly Table */}
            <View style={S.card}>
              <Text style={S.sectionLabel}>{t(language,'monthlyBreakdown').toUpperCase()}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                  <View style={S.tableHead}>
                    {["M","Diamonds","Monthly Purchase","Rebate %","Rebate Payout","Growth %","Plan","Rebate","Status","Total"].map(h => (
                      <Text key={h} style={[S.th, colWidth(h)]}>{h}</Text>
                    ))}
                  </View>
                  {result.months.map((row, idx) => {
                    // Year summary: collect all months of this year
                    const isLastOfYear = row.month % 12 === 0;
                    let yearSummary = null;
                    if (isLastOfYear) {
                      const yearStart = row.month - 11;
                      const yearMonths = result.months.slice(yearStart - 1, row.month);
                      const yearRebates = yearMonths.reduce((s, r) => s + r.grossYield, 0);
                      const yearDeposits = yearMonths.reduce((s, r) => s + r.deposit, 0);
                      yearSummary = (
                        <View style={{ backgroundColor: "#0f1e35", flexDirection: "row", paddingVertical: 6, paddingHorizontal: 4, borderTopWidth: 1, borderBottomWidth: 2, borderColor: "#f59e0b" }}>
                          <Text style={{ width: 28, color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>Y{row.yearNumber}</Text>
                          <Text style={{ width: 96, color: "#94a3b8", fontSize: 10 }}>{fmt(row.capEnd)}</Text>
                          <Text style={{ width: 72, color: "#60a5fa", fontSize: 10 }}>{fmt(yearDeposits)}</Text>
                          <Text style={{ width: 72, color: "#94a3b8", fontSize: 10 }}>—</Text>
                          <Text style={{ width: 100, color: "#94a3b8", fontSize: 10 }}>—</Text>
                          <Text style={{ width: 72, color: "#94a3b8", fontSize: 10 }}>—</Text>
                          <Text style={{ width: 72, color: "#94a3b8", fontSize: 10 }}>—</Text>
                          <Text style={{ width: 72, color: "#4ade80", fontSize: 10, fontWeight: "bold" }}>{fmt(yearRebates)}</Text>
                          <Text style={{ width: 100, color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>Year {row.yearNumber} Total</Text>
                          <Text style={{ width: 96, color: "#4ade80", fontSize: 10, fontWeight: "bold" }}>{fmt(row.capEnd)}</Text>
                        </View>
                      );
                    }
                    return (
                      <React.Fragment key={row.month}>
                        {row.isYearStart && (
                          <View style={S.yearRow}>
                            <Text style={S.yearText}>── Year {row.yearNumber} ──</Text>
                          </View>
                        )}
                        {row.isSpUpgrade && (
                          <View style={{ backgroundColor: "rgba(245,158,11,0.15)", flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 4, borderLeftWidth: 2, borderLeftColor: "#f59e0b" }}>
                            <Text style={{ color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>⬆️ SP UPGRADE → {row.spName} ({row.spBaseRate}% base)</Text>
                          </View>
                        )}
                        {row.isGoalReached && (
                          <View style={{ backgroundColor: "rgba(34,197,94,0.15)", flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 4, borderLeftWidth: 2, borderLeftColor: "#22c55e" }}>
                            <Text style={{ color: "#22c55e", fontSize: 10, fontWeight: "bold" }}>🎯 TARGET MONTHLY REBATE REACHED — Month {row.month}</Text>
                          </View>
                        )}
                        <TableRow row={row} mData={getMonthData(row.month)} onUpdate={setMonthField} />
                        {yearSummary}
                      </React.Fragment>
                    );
                  })}
                </View>
              </ScrollView>
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

function colWidth(h: string) {
  if (h === "M") return { width: 28 };
  if (h === "Diamonds" || h === "Total") return { width: 96 };
  if (h === "Withdrawal" || h === "Status") return { width: 100 };
  return { width: 72 };
}

function getRowStyle(row: MonthResult) {
  if (row.vipStatus && row.vipStatus.includes('VIP')) return S.tableRowVip;
  if (row.withdrawal > 0) return S.tableRowWithdrawal;
  if (row.capEnd > row.capStart) return S.tableRowGrowing;
  return row.month % 2 === 0 ? S.tableRowAlt : S.tableRow;
}

function TableRow({ row, mData, onUpdate }: { row: MonthResult; mData: MonthData; onUpdate: (m: number, f: keyof MonthData, v: number) => void }) {
  const rowStyle = getRowStyle(row);
  return (
    <View style={[S.tableRow, rowStyle]}>
      <Text style={[S.td, { width: 28, color: "#94a3b8" }]}>{row.month}</Text>
      <Text style={[S.td, { width: 96, color: "#e2e8f0" }]}>{fmt(row.capStart)}</Text>
      <TextInput
        style={[S.tdInput, { width: 72, color: "#60a5fa" }]}
        value={String(mData.stort)}
        onChangeText={v => onUpdate(row.month, "stort", parseFloat(v) || 0)}
        keyboardType="numeric"
      />
      <TextInput
        style={[S.tdInput, { width: 72, color: "#f59e0b" }]}
        value={String(mData.opnP)}
        onChangeText={v => onUpdate(row.month, "opnP", parseFloat(v) || 0)}
        keyboardType="numeric"
      />
      <View style={{ width: 100 }}>
        <Text style={[S.td, { color: "#94a3b8", fontSize: 9 }]}>Max:{fmt(row.maxOut)}</Text>
        <Text style={[S.td, { color: row.withdrawal > 0 ? "#4ade80" : "#94a3b8" }]}>{fmt(row.withdrawal)}</Text>
      </View>
      <TextInput
        style={[S.tdInput, { width: 72, color: "#a78bfa" }]}
        value={String(mData.comp)}
        onChangeText={v => onUpdate(row.month, "comp", parseFloat(v) || 0)}
        keyboardType="numeric"
      />
      <View style={{ width: 72 }}>
        <Text style={[S.td, { color: row.isNewVip ? "#ef4444" : "#22c55e", fontSize: 10, fontWeight: "bold" }]}>
          {row.spName} ({row.totalRate.toFixed(1)}%)
        </Text>
      </View>
      <Text style={[S.td, { width: 72, color: "#4ade80" }]}>{fmt(row.grossYield)}</Text>
      <View style={{ width: 100 }}>
        {row.vipStatus ? (
          <View style={{ backgroundColor: row.isNewVip ? "#7f1d1d" : "#1e3a5f", borderRadius: 4, paddingHorizontal: 3, paddingVertical: 1, marginBottom: 2, alignSelf: "center" }}>
            <Text style={{ color: row.isNewVip ? "#fca5a5" : "#fde68a", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>{row.vipStatus}</Text>
          </View>
        ) : null}
        <Text style={[S.td, { color: "#94a3b8", fontSize: 9 }]}>W:{fmt(row.wallet)}</Text>
        <Text style={[S.td, { color: "#fbbf24", fontSize: 9 }]}>VP:{fmt(row.vipPot)}</Text>
        <Text style={[S.td, { color: "#c4b5fd", fontSize: 9 }]}>P:{fmt(row.compPot)}</Text>
      </View>
      <Text style={[S.td, { width: 96, color: row.capEnd >= row.capStart ? "#4ade80" : "#f87171", fontWeight: "bold" }]}>{fmt(row.capEnd)}</Text>
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
  scroll: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 12 },
  header: { marginBottom: 10, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", marginBottom: 6 },
  backText: { color: "#60a5fa", fontSize: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 2 },
  card: { backgroundColor: "#1e293b", borderRadius: 12, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex1: { flex: 1 },
  label: { color: "#f59e0b", fontSize: 13, fontWeight: "bold", marginBottom: 3, letterSpacing: 0.5 },
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
  sectionLabel: { color: "#f59e0b", fontSize: 13, fontWeight: "bold", marginBottom: 5, marginTop: 4, letterSpacing: 0.5 },
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
  tableHead: { flexDirection: "row", backgroundColor: "#0f172a", paddingVertical: 5 },
  th: { color: "#f59e0b", fontSize: 12, fontWeight: "bold", paddingHorizontal: 3, textAlign: "center" },
  tableRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#0f172a", paddingVertical: 3, backgroundColor: "#0f172a" },
  tableRowAlt: { backgroundColor: "#1a2744" },
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
