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
import { useCalculator } from "@/lib/calculator-context";
import { t } from "@/lib/translations";
import { runCalculation, MonthResult, fmt, MonthData, CalculationParams } from "@/lib/calculator";

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
  }>();
  const { language, officeLocation } = useCalculator();
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

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
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

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
            <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 4 }}>Accounts under $3,550 will defer VIP activation to prioritize compound growth.</Text>
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

        {/* Calculate */}
        <TouchableOpacity style={S.calcBtn} onPress={handleCalculate}>
          <Text style={S.calcText}>⚡ {t(language, 'calculate').toUpperCase()}</Text>
        </TouchableOpacity>

        {/* Results */}
        {result && (
          <>
            {/* PDF Export Button */}
            <TouchableOpacity
              style={[S.calcBtn, { backgroundColor: '#0ea5e9', marginBottom: 8 }]}
              onPress={async () => {
                if (!result) return;
                setPdfLoading(true);
                try {                  // Office footer data
                  const officeData: Record<string, { name: string; address: string; reg: string }> = {
                    dubai: { name: 'Diamond Solution — Dubai Freezone', address: 'DMCC Business Centre, Jumeirah Lakes Towers, Dubai, UAE', reg: 'DMCC License No. 1007195 · SIRA Certified' },
                    vienna: { name: 'Diamond Solution — Vienna, Austria', address: 'Vienna, Austria', reg: 'EU Operations Office' },
                    manila: { name: 'Diamond Solution — Manila, Philippines', address: 'Manila, Philippines', reg: 'SEC Registration No. 2026030241228-02' },
                    florida: { name: 'Diamond Solution — Florida, USA', address: 'Florida, United States', reg: 'US Operations Office' },
                  };
                  const office = officeData[officeLocation] ?? officeData.dubai;
                  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

                  const tableRows = result.months.map(row => {
                    const md = monthData[row.month] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 };
                    const rowBg = row.month % 2 === 0 ? '#1e293b' : '#0f172a';
                    return `<tr style="background:${rowBg}">
                      <td>${row.month}</td>
                      <td>$${fmt(row.capStart)}</td>
                      <td>${fmt(row.deposit) !== '0' ? '$'+fmt(row.deposit) : '—'}</td>
                      <td>${md.opnP.toFixed(0)}%</td>
                      <td>${row.withdrawal > 0 ? '$'+fmt(row.withdrawal) : '—'}</td>
                      <td>${md.comp.toFixed(0)}%</td>
                      <td>${row.spName} (${row.totalRate.toFixed(1)}%)</td>
                      <td>$${fmt(row.grossYield)}</td>
                      <td>${row.vipStatus || '—'}</td>
                      <td><b>$${fmt(row.capEnd)}</b></td>
                    </tr>`;
                  }).join('');

                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Plan B Quotation</title>
                  <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, Helvetica, sans-serif; background: #0a0f1e; color: #e2e8f0; padding: 28px; font-size: 13px; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 20px; }
                    .logo { font-size: 26px; font-weight: 900; color: #f59e0b; letter-spacing: -1px; }
                    .logo span { color: #e2e8f0; }
                    .quotation-badge { background: #f59e0b; color: #0a0f1e; font-weight: 900; font-size: 14px; padding: 6px 16px; border-radius: 6px; letter-spacing: 1px; }
                    .meta { color: #94a3b8; font-size: 12px; margin-top: 4px; }
                    .client-block { background: #1e293b; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
                    .client-name { font-size: 18px; font-weight: 700; color: #fff; }
                    .client-meta { color: #94a3b8; font-size: 12px; margin-top: 4px; }
                    h2 { font-size: 13px; font-weight: 700; color: #f59e0b; letter-spacing: 1px; text-transform: uppercase; margin: 20px 0 10px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
                    .stat { background: #1e293b; border-radius: 8px; padding: 10px 14px; }
                    .stat-label { font-size: 11px; color: #94a3b8; margin-bottom: 3px; }
                    .stat-value { font-size: 15px; font-weight: 700; color: #fff; }
                    .green { color: #22c55e !important; }
                    .amber { color: #f59e0b !important; }
                    .sp-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
                    .sp-table th { background: #1e3a5f; color: #f59e0b; padding: 7px 8px; text-align: left; }
                    .sp-table td { padding: 6px 8px; border-bottom: 1px solid #334155; color: #e2e8f0; }
                    .sp-table tr:nth-child(even) td { background: #1e293b; }
                    table.breakdown { width: 100%; border-collapse: collapse; font-size: 11px; }
                    table.breakdown th { background: #1e3a5f; color: #f59e0b; padding: 6px 4px; text-align: center; }
                    table.breakdown td { padding: 4px; text-align: center; border-bottom: 1px solid #334155; }
                    .box { border: 1px solid #334155; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; background: #1e293b; }
                    .box-title { font-weight: 700; color: #38bdf8; margin-bottom: 6px; font-size: 13px; }
                    .box-body { color: #cbd5e1; font-size: 12px; line-height: 1.6; }
                    .disclaimer { margin-top: 24px; padding: 12px 16px; background: rgba(239,68,68,0.08); border-left: 4px solid #ef4444; border-radius: 4px; font-size: 11px; color: #94a3b8; line-height: 1.6; }
                    .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; }
                    .footer strong { color: #94a3b8; }
                  </style></head><body>

                  <div class="header">
                    <div>
                      <div class="logo">💎 Plan<span> B</span></div>
                      <div class="meta">Diamond Solution International</div>
                    </div>
                    <div style="text-align:right">
                      <div class="quotation-badge">QUOTATION</div>
                      <div class="meta" style="margin-top:6px">${today}</div>
                    </div>
                  </div>

                  ${clientName ? `<div class="client-block"><div class="client-name">${clientName}</div><div class="client-meta">Personal Investment Projection &nbsp;·&nbsp; ${office.name}</div></div>` : ''}

                  <h2>Investment Overview</h2>
                  <div class="summary-grid">
                    <div class="stat"><div class="stat-label">Initial Deposit</div><div class="stat-value">$${fmt(numVal(startAmount))}</div></div>
                    <div class="stat"><div class="stat-label">Projection Period</div><div class="stat-value">${years} ${parseInt(years) === 1 ? 'Year' : 'Years'}</div></div>
                    <div class="stat"><div class="stat-label">VIP Status</div><div class="stat-value ${vipEnabled ? 'amber' : ''}">${vipEnabled ? 'Active (+3.0%)' : 'Not Active'}</div></div>
                    <div class="stat"><div class="stat-label">Total In</div><div class="stat-value">$${fmt(result.totalIn)}</div></div>
                    <div class="stat"><div class="stat-label">Total Strategy Discounts</div><div class="stat-value green">$${fmt(result.totalOut)}</div></div>
                    <div class="stat"><div class="stat-label">Final Diamond Value</div><div class="stat-value green">$${fmt(result.finalCap)}</div></div>
                    <div class="stat"><div class="stat-label">Net Strategy Value</div><div class="stat-value ${result.netResult >= 0 ? 'green' : ''}">$${fmt(result.netResult)}</div></div>
                    <div class="stat"><div class="stat-label">ROC Break-Even</div><div class="stat-value">${result.rocMonth ? 'Month ' + result.rocMonth : 'Pending'}</div></div>
                    <div class="stat"><div class="stat-label">Max Monthly Discount</div><div class="stat-value amber">$${fmt(result.maxMonthlyOut)}</div></div>
                  </div>

                  <h2>Solution Plan Overview</h2>
                  <table class="sp-table">
                    <thead><tr><th>Plan</th><th>Deposit Range</th><th>Base Rate / Month</th><th>With VIP / Month</th><th>12-Month Total (no VIP)</th><th>12-Month Total (VIP)</th></tr></thead>
                    <tbody>
                      <tr><td>SP1</td><td>$100 – $999</td><td>2.2%</td><td>5.2%</td><td>26.4%</td><td>62.4%</td></tr>
                      <tr><td>SP2</td><td>$1,000 – $2,499</td><td>2.45%</td><td>5.45%</td><td>29.4%</td><td>65.4%</td></tr>
                      <tr><td>SP3</td><td>$2,500 – $4,999</td><td>2.7%</td><td>5.7%</td><td>32.4%</td><td>68.4%</td></tr>
                      <tr><td>SP4</td><td>$5,000 – $9,999</td><td>3.0%</td><td>6.0%</td><td>36.0%</td><td>72.0%</td></tr>
                      <tr><td>SP5</td><td>$10,000 – $19,999</td><td>3.1%</td><td>6.1%</td><td>37.2%</td><td>73.2%</td></tr>
                      <tr><td>SP6</td><td>$20,000 – $49,999</td><td>3.2%</td><td>6.2%</td><td>38.4%</td><td>74.4%</td></tr>
                      <tr><td>SP7</td><td>$50,000+</td><td>3.3%</td><td>6.3%</td><td>39.6%</td><td>75.6%</td></tr>
                    </tbody>
                  </table>

                  <div class="box">
                    <div class="box-title">🛡️ 100% Buyback Guarantee</div>
                    <div class="box-body">After exactly 12 months, the client has the contractual right to sell the GIA-certified diamonds back to Diamond Solution for 100% of the original deposit amount. The full principal capital is returned regardless of market conditions. This right must be exercised in the 11th month by notifying Diamond Solution of the chosen option: Home Delivery or 100% Buyback.</div>
                  </div>

                  <div class="box">
                    <div class="box-title">🏠 Inheritance &amp; Ownership Clause</div>
                    <div class="box-body">The diamonds are the legal property of the client through the Ownership Contract. The client may keep, sell, or transfer the diamonds to their children or next of kin. All ownership rights and associated contractual rights transfer automatically in accordance with the client's will or applicable inheritance laws.</div>
                  </div>

                  <div class="box">
                    <div class="box-title">🏦 Tax &amp; VAT Notice</div>
                    <div class="box-body">While stored in Dubai Freezone: 0% VAT and tax-efficient storage. If delivered to Europe: local import VAT may apply (e.g. 21% in Netherlands, 19% in Germany, 20% in Austria). Most clients keep diamonds in Dubai storage during the 12-month period for maximum efficiency. Please consult a licensed tax advisor in your country of residence.</div>
                  </div>

                  <h2>Monthly Breakdown</h2>
                  <table class="breakdown"><thead><tr><th>M</th><th>Diamonds</th><th>Deposit</th><th>Discount%</th><th>Available Value</th><th>Comp%</th><th>Plan</th><th>Discount Applied</th><th>Status</th><th>Total</th></tr></thead><tbody>${tableRows}</tbody></table>

                  <div class="disclaimer">⚠️ This document is generated by the Plan B mathematical simulation tool. It is for informational and illustrative purposes only. It does NOT constitute financial advice, an investment offer, or a guarantee of future results. All projections are based on current plan parameters and may change. Always review the official Diamond Solution contract documents and consult a licensed financial advisor before making any investment decision.</div>

                  <div class="footer">
                    <strong>${office.name}</strong><br/>
                    ${office.address}<br/>
                    ${office.reg}<br/>
                    <span style="color:#475569">Generated by Plan B App · ${today}</span>
                  </div>

                  </body></html>`;
                  const { uri } = await Print.printToFileAsync({ html, base64: false });
                  if (Platform.OS === 'web') {
                    const a = document.createElement('a');
                    a.href = uri; a.download = `plan-b-${clientName || 'report'}.pdf`; a.click();
                  } else if (Platform.OS === 'android') {
                    // Use IntentLauncher to avoid expo-sharing FilePermissionService crash on Android
                    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                      data: uri,
                      flags: 1,
                      type: 'application/pdf',
                    });
                  } else {
                    // iOS: use Print.printAsync to show native print/share sheet
                    await Print.printAsync({ uri });
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
              <Text style={S.sectionLabel}>{t(language, 'currentStatus').toUpperCase()}</Text>
              <View style={S.summaryGrid}>
                <SummaryItem label={t(language,'totalIn')} value={fmt(result.totalIn)} red />
                <SummaryItem label={t(language,'totalOut')} value={fmt(result.totalOut)} green={result.totalOut > 0} />
                <SummaryItem label={t(language,'finalBalance')} value={fmt(result.finalCap)} green />
                <SummaryItem label="Net Strategy Value" value={fmt(result.netResult)} green={result.netResult > 0} red={result.netResult < 0} />
                <SummaryItem label="Available Discounts" value={fmt(result.finalWallet + result.finalVipPot + result.finalCompPot)} />
                <SummaryItem label="Lifetime Pot Payments" value={result.totalVipPotPayments > 0 ? `-${fmt(result.totalVipPotPayments)}` : fmt(0)} red={result.totalVipPotPayments > 0} />
                <SummaryItem label="Max Monthly Discount" value={fmt(result.maxMonthlyOut)} green />
                <SummaryItem
                  label={t(language,'rocBreakEven')}
                  value={result.rocMonth
                    ? `M${result.rocMonth} (Y${Math.ceil(result.rocMonth / 12)}-M${((result.rocMonth - 1) % 12) + 1})`
                    : t(language,'waiting')}
                />
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
                  ? `${fmt(nextSp.threshold - result.finalCap)} away from ${nextSp.name} — base rate → ${nextSp.rate}%`
                  : null;
                const vipCountdownHint = vipEnabled && result.finalVipPot < 1000
                  ? `~${Math.ceil((1000 - result.finalVipPot) / 84)} months until VP pot self-funds next renewal (${fmt(result.finalVipPot)} of $1,000)`
                  : null;
                const withdrawalHint = result.totalOut > 0 && result.finalCap <= (parseFloat(startAmount) || 0)
                  ? 'High withdrawals are keeping capital flat — lower your discount % to grow into the next SP tier faster.'
                  : null;
                if (!spHint && !vipCountdownHint && !withdrawalHint) return null;
                return (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    {spHint && (
                      <View style={{ backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: 6, padding: 8, borderLeftWidth: 2, borderLeftColor: '#fbbf24' }}>
                        <Text style={{ color: '#fbbf24', fontSize: 11 }}>⬆ SP Upgrade Nearby: {spHint}</Text>
                      </View>
                    )}
                    {vipCountdownHint && (
                      <View style={{ backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 6, padding: 8, borderLeftWidth: 2, borderLeftColor: '#a78bfa' }}>
                        <Text style={{ color: '#a78bfa', fontSize: 11 }}>♦ VIP Renewal: {vipCountdownHint}</Text>
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

            {/* Monthly / Yearly Table */}
            <View style={S.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[S.sectionLabel, { flex: 1, marginBottom: 0 }]}>{t(language,'monthlyBreakdown').toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: viewMode === 'monthly' ? '#f59e0b' : '#64748b', fontSize: 11, fontWeight: 'bold' }}>Monthly</Text>
                  <Switch
                    value={viewMode === 'yearly'}
                    onValueChange={v => setViewMode(v ? 'yearly' : 'monthly')}
                    trackColor={{ false: '#334155', true: '#f59e0b' }}
                    thumbColor="#fff"
                  />
                  <Text style={{ color: viewMode === 'yearly' ? '#f59e0b' : '#64748b', fontSize: 11, fontWeight: 'bold' }}>Yearly</Text>
                </View>
              </View>
              {viewMode === 'yearly' ? (
                <YearlySummary result={result} />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <View>
                    <View style={S.tableHead}>
                      {["M","Available Value","Discount Applied","Diamonds","Status","Growth %","Plan","Strategy Discount %","Monthly Purchase","Total"].map(h => (
                        <Text key={h} style={[S.th, colWidth(h)]}>{h}</Text>
                      ))}
                    </View>
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
                            <Text style={{ width: 28,  color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>Y{row.yearNumber}</Text>
                            <Text style={{ width: 104, color: "#facc15", fontSize: 10, fontWeight: "bold" }}>{fmt(yearPayout)}</Text>
                            <Text style={{ width: 80,  color: "#4ade80", fontSize: 10, fontWeight: "bold" }}>{fmt(yearRebates)}</Text>
                            <Text style={{ width: 90,  color: "#e2e8f0", fontSize: 10 }}>{fmt(row.capEnd)}</Text>
                            <Text style={{ width: 100, color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>Year {row.yearNumber} Total</Text>
                            <Text style={{ width: 72,  color: "#94a3b8", fontSize: 10 }}>—</Text>
                            <Text style={{ width: 80,  color: "#94a3b8", fontSize: 10 }}>—</Text>
                            <Text style={{ width: 72,  color: "#94a3b8", fontSize: 10 }}>—</Text>
                            <Text style={{ width: 72,  color: "#60a5fa", fontSize: 10 }}>{fmt(yearDeposits)}</Text>
                            <Text style={{ width: 90,  color: "#4ade80", fontSize: 10, fontWeight: "bold" }}>{fmt(row.capEnd)}</Text>
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
                          <TableRow row={row} mData={getMonthData(row.month)} onUpdate={setMonthField} />
                          {yearSummary}
                        </React.Fragment>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

function colWidth(h: string) {
  if (h === "M" || h === "Year") return { width: 28 };
  if (h === "Available Value") return { width: 104 };
  if (h === "Diamonds" || h === "Total") return { width: 90 };
  if (h === "Status") return { width: 100 };
  if (h === "Discount Applied" || h === "Plan") return { width: 80 };
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
      {/* M */}
      <View style={{ width: 28, alignItems: 'center' }}>
        <Text style={[S.td, { color: "#94a3b8" }]}>{row.month}</Text>
        {row.isYearStart && (
          <Text style={{ color: "#f59e0b", fontSize: 7, fontWeight: "bold" }}>Y{row.yearNumber}</Text>
        )}
      </View>
      {/* Available Value — primary focus */}
      <View style={{ width: 104 }}>
        <Text style={[S.td, { color: "#64748b", fontSize: 9 }]}>Discount (Max:) {fmt(row.maxOut)}</Text>
        <Text style={[S.td, { color: "#facc15", fontWeight: "bold" }]}>{fmt(row.withdrawal)}</Text>
      </View>
      {/* Discount Applied */}
      <Text style={[S.td, { width: 80, color: "#4ade80" }]}>{fmt(row.grossYield)}</Text>
      {/* Diamonds */}
      <Text style={[S.td, { width: 90, color: "#e2e8f0" }]}>{fmt(row.capStart)}</Text>
      {/* Status */}
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
      {/* Growth % */}
      <TextInput
        style={[S.tdInput, { width: 72, color: "#a78bfa" }]}
        value={String(mData.comp)}
        onChangeText={v => onUpdate(row.month, "comp", parseFloat(v) || 0)}
        keyboardType="numeric"
      />
      {/* Plan */}
      <View style={{ width: 80 }}>
        <Text style={[S.td, { color: row.isNewVip ? "#ef4444" : "#22c55e", fontSize: 10, fontWeight: "bold" }]}>
          {row.spName} ({row.totalRate.toFixed(1)}%)
        </Text>
      </View>
      {/* Strategy Discount % */}
      <TextInput
        style={[S.tdInput, { width: 72, color: "#f59e0b" }]}
        value={String(mData.opnP)}
        onChangeText={v => onUpdate(row.month, "opnP", parseFloat(v) || 0)}
        keyboardType="numeric"
      />
      {/* Monthly Purchase */}
      <TextInput
        style={[S.tdInput, { width: 72, color: "#60a5fa" }]}
        value={String(mData.stort)}
        onChangeText={v => onUpdate(row.month, "stort", parseFloat(v) || 0)}
        keyboardType="numeric"
      />
      {/* Total */}
      <Text style={[S.td, { width: 90, color: row.capEnd >= row.capStart ? "#4ade80" : "#f87171", fontWeight: "bold" }]}>{fmt(row.capEnd)}</Text>
    </View>
  );
}

function YearlySummary({ result }: { result: ReturnType<typeof runCalculation> }) {
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
      diamonds: last.capEnd,
      selfFunded,
      firstActivation,
      total: last.capEnd,
    };
  });
  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#334155', paddingHorizontal: 4 }}>
        <Text style={{ width: 36, color: '#f59e0b', fontSize: 11, fontWeight: 'bold' }}>Year</Text>
        <Text style={{ flex: 1.2, color: '#facc15', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>Available Value</Text>
        <Text style={{ flex: 1, color: '#4ade80', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>Annual Discount Gained</Text>
        <Text style={{ flex: 1, color: '#e2e8f0', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>Diamonds</Text>
        <Text style={{ flex: 1, color: '#94a3b8', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>Status</Text>
        <Text style={{ flex: 1, color: '#4ade80', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>Total</Text>
      </View>
      {rows.map(r => (
        <View key={r.year} style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b', alignItems: 'center', paddingHorizontal: 4 }}>
          <Text style={{ width: 36, color: '#f59e0b', fontSize: 13, fontWeight: 'bold' }}>Y{r.year}</Text>
          <Text style={{ flex: 1.2, color: '#facc15', fontSize: 14, fontWeight: 'bold', textAlign: 'right' }}>{fmt(r.rebatePayout)}</Text>
          <Text style={{ flex: 1, color: '#4ade80', fontSize: 13, textAlign: 'right' }}>{fmt(r.rebate)}</Text>
          <Text style={{ flex: 1, color: '#e2e8f0', fontSize: 13, textAlign: 'right' }}>{fmt(r.diamonds)}</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {r.selfFunded ? (
              <View style={{ backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: '#22c55e' }}>
                <Text style={{ color: '#22c55e', fontSize: 8, fontWeight: 'bold' }}>SELF-FUNDED</Text>
              </View>
            ) : r.firstActivation ? (
              <View style={{ backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: '#ef4444' }}>
                <Text style={{ color: '#fca5a5', fontSize: 8, fontWeight: 'bold' }}>NEW VIP</Text>
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
  btnBlue: { backgroundColor: "#0ea5e9", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
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
