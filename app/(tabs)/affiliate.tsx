import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  TextInput, Alert, Platform, Linking, Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { t } from "@/lib/translations";

// ─── Constants ────────────────────────────────────────────────
const REFERRAL_BASE = "https://diamond-solution.net/user/register?reference=";
const STORAGE_KEY = "referral_code";
const NAVY = "#0d1a2a";
const GOLD = "#e67e22";
const GREEN = "#22c55e";
const BLUE = "#33C5FF";
const CARD_BG = "#0f2035";
const BORDER = "#1a3550";

// ─── Mock Backend Data ─────────────────────────────────────────
// fetchDailyStats() — replace with real API call when backend is ready
// Expected shape: { globalTurnover: number, pool1Parts: number, pool2Parts: number, pool3Parts: number }
const fetchDailyStats = async (): Promise<{
  globalTurnover: number;
  pool1Parts: number; // Blue Diamond — max 6
  pool2Parts: number; // Pink Diamond — max 4
  pool3Parts: number; // Black Diamond — max 2
}> => {
  // MOCK: Replace with: const res = await fetch("https://api.diamond-solution.net/stats/daily");
  return {
    globalTurnover: 10_000_000, // $10M demo value
    pool1Parts: 4,              // 4 of 6 Blue Diamond parts filled
    pool2Parts: 2,              // 2 of 4 Pink Diamond parts filled
    pool3Parts: 1,              // 1 of 2 Black Diamond parts filled
  };
};

const POOL_MAX = { pool1: 6, pool2: 4, pool3: 2 };
const BLUE_DIAMOND_THRESHOLD = 1_000_000;

// ─── Tier Table ───────────────────────────────────────────────
const DIAMOND_TIERS = [
  { rank: "Emerald",              emoji: "💚", partnersNum: "2", bonus: "$1,000"     },
  { rank: "Diamond",              emoji: "💎", partnersNum: "2", bonus: "$5,000"     },
  { rank: "Blue Diamond",         emoji: "🔵", partnersNum: "2", bonus: "$20,000"    },
  { rank: "Green Diamond",        emoji: "💚", partnersNum: "3", bonus: "$50,000"    },
  { rank: "Purple Diamond",       emoji: "💜", partnersNum: "3", bonus: "$100,000"   },
  { rank: "Diamond Elite",        emoji: "💎", partnersNum: "4", bonus: "$150,000"   },
  { rank: "Double Diamond Elite", emoji: "👑", partnersNum: "4", bonus: "$1,000,000" },
  { rank: "Triple Diamond Elite", emoji: "🏆", partnersNum: "4", bonus: "$2,000,000" },
  { rank: "Black Diamond",        emoji: "⚫", partnersNum: "5", bonus: "$5,000,000" },
];

// ─── Helpers ──────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(0)}`;

const numVal = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;

// ─── Revenue Timeline Calculator ─────────────────────────────
function calcTimeline(
  dbSize: number,
  convRate: number,
  avgPurchase: number,
  rebateReuseP: number,
  myParts: number,
  stats: { globalTurnover: number; pool1Parts: number; pool2Parts: number; pool3Parts: number }
) {
  const clients = Math.floor(dbSize * (convRate / 100));
  const teamVolume = clients * avgPurchase;
  const monthlyRebate = avgPurchase * 0.033; // avg 3.3% base rebate
  const clientMonthlyPurchase = monthlyRebate * (rebateReuseP / 100); // rebate re-used as purchase
  const directResidual10pct = clientMonthlyPurchase * 0.10 * clients; // 10% of each client's monthly purchase

  // Pool payouts — only if Blue Diamond ($1M threshold)
  const poolUnlocked = teamVolume >= BLUE_DIAMOND_THRESHOLD;
  const pool1Payout = poolUnlocked
    ? (stats.globalTurnover * 0.01) / Math.max(stats.pool1Parts, 1) * myParts
    : 0;
  const pool2Payout = poolUnlocked
    ? (stats.globalTurnover * 0.01) / Math.max(stats.pool2Parts, 1) * myParts
    : 0;
  const pool3Payout = poolUnlocked
    ? (stats.globalTurnover * 0.01) / Math.max(stats.pool3Parts, 1) * myParts
    : 0;

  const milestones = [1, 3, 6, 12, 24, 36, 48, 60];
  const timeline = milestones.map(month => {
    // Residual grows as clients build up their rebate re-use habit (ramp over 6 months)
    const rampFactor = Math.min(month / 6, 1);
    const monthlyTotal = directResidual10pct * rampFactor + (poolUnlocked ? pool1Payout + pool2Payout + pool3Payout : 0);
    const cumulative = monthlyTotal * month;
    return { month, monthlyTotal, cumulative };
  });

  return {
    clients,
    teamVolume,
    directResidual10pct,
    poolUnlocked,
    pool1Payout,
    pool2Payout,
    pool3Payout,
    totalMonthlyPeak: directResidual10pct + (poolUnlocked ? pool1Payout + pool2Payout + pool3Payout : 0),
    timeline,
  };
}

// ─── Main Component ───────────────────────────────────────────
export default function AffiliateScreen() {
  const { language } = useCalculator();
  const [referralCode, setReferralCode] = useState("");
  const [editingCode, setEditingCode] = useState(false);
  const [tempCode, setTempCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Projected Revenue Model inputs
  const [dbSize, setDbSize] = useState("200");
  const [convRate, setConvRate] = useState("10");
  const [avgPurchase, setAvgPurchase] = useState("10000");
  const [rebateReuse, setRebateReuse] = useState("50");
  const [myParts, setMyParts] = useState("1");
  const [calcResult, setCalcResult] = useState<ReturnType<typeof calcTimeline> | null>(null);

  // Live stats from backend (mock)
  const [stats, setStats] = useState({
    globalTurnover: 10_000_000,
    pool1Parts: 4,
    pool2Parts: 2,
    pool3Parts: 1,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => { if (val) setReferralCode(val); });
    fetchDailyStats().then(setStats);
  }, []);

  const fullLink = referralCode ? `${REFERRAL_BASE}${referralCode}` : "";

  const handleCopy = useCallback(async () => {
    if (!fullLink) { Alert.alert("No referral code", "Please set your referral code first."); return; }
    await Clipboard.setStringAsync(fullLink);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [fullLink]);

  const handleShare = useCallback(async () => {
    if (!fullLink) { Alert.alert("No referral code", "Please set your referral code first."); return; }
    if (Platform.OS === "web") {
      if (navigator.share) { await navigator.share({ title: "Plan B", url: fullLink }); }
      else { await Clipboard.setStringAsync(fullLink); setCopied(true); setTimeout(() => setCopied(false), 2500); }
      return;
    }
    await Clipboard.setStringAsync(fullLink);
    Alert.alert("Link Copied", fullLink);
  }, [fullLink]);

  const handleSaveCode = useCallback(async () => {
    const trimmed = tempCode.trim();
    setReferralCode(trimmed);
    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
    setEditingCode(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [tempCode]);

  const handleCalculate = useCallback(() => {
    const result = calcTimeline(
      numVal(dbSize), numVal(convRate), numVal(avgPurchase),
      numVal(rebateReuse), numVal(myParts), stats
    );
    setCalcResult(result);
  }, [dbSize, convRate, avgPurchase, rebateReuse, myParts, stats]);

  // Pool progress toward $1M
  const teamVolume = useMemo(() => {
    const clients = Math.floor(numVal(dbSize) * (numVal(convRate) / 100));
    return clients * numVal(avgPurchase);
  }, [dbSize, convRate, avgPurchase]);
  const poolProgress = Math.min(teamVolume / BLUE_DIAMOND_THRESHOLD, 1);

  const milestoneLabels: Record<number, string> = { 1: "Mo.1", 3: "Mo.3", 6: "Mo.6", 12: "Yr.1", 24: "Yr.2", 36: "Yr.3", 48: "Yr.4", 60: "Yr.5" };

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor={NAVY}>
      <ScrollView style={S.scroll} contentContainerStyle={S.content}>

        {/* ── Header ── */}
        <View style={S.header}>
          <Text style={S.headerIcon}>💎</Text>
          <Text style={S.headerTitle}>REAL ESTATE AGENTS & ADVISERS</Text>
          <Text style={S.headerSub}>Professional Revenue Model — Plan B Diamond Solution</Text>
        </View>

        {/* ── Referral Code ── */}
        <View style={S.card}>
          <Text style={S.cardLabel}>YOUR REFERRAL CODE</Text>
          {editingCode ? (
            <View style={S.editRow}>
              <TextInput style={S.codeInput} value={tempCode} onChangeText={setTempCode}
                placeholder="e.g. appsxxl" placeholderTextColor="#2a4a6a"
                autoCapitalize="none" autoCorrect={false} returnKeyType="done"
                onSubmitEditing={handleSaveCode} />
              <TouchableOpacity style={S.saveBtn} onPress={handleSaveCode}>
                <Text style={S.saveBtnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setEditingCode(false)}>
                <Text style={S.cancelBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={S.codeRow}>
              <Text style={referralCode ? S.codeValue : S.codePlaceholder}>
                {referralCode || "No code set"}
              </Text>
              <TouchableOpacity style={S.editBtn} onPress={() => { setTempCode(referralCode); setEditingCode(true); }}>
                <Text style={S.editBtnText}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={S.linkBox}>
            <Text style={S.linkText} numberOfLines={2}>
              {fullLink || `${REFERRAL_BASE}[your-code]`}
            </Text>
          </View>
          <View style={S.linkButtons}>
            <TouchableOpacity style={[S.linkBtn, { backgroundColor: copied ? GREEN : BLUE }]} onPress={handleCopy}>
              <Text style={S.linkBtnText}>{copied ? "✓ Copied!" : "📋 Copy Link"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.linkBtn, { backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER }]} onPress={handleShare}>
              <Text style={[S.linkBtnText, { color: "#94a3b8" }]}>🔗 Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── PROJECTED REVENUE MODEL ── */}
        <View style={[S.card, { borderColor: GOLD, borderWidth: 1 }]}>
          <Text style={S.sectionTitle}>📊 PROJECTED REVENUE MODEL</Text>
          <Text style={S.sectionDesc}>
            Model your residual income from clients' monthly diamond purchases. The 10% Direct Residual updates automatically with your inputs.
          </Text>

          {/* Inputs */}
          <View style={S.inputGrid}>
            <View style={S.inputBlock}>
              <Text style={S.inputLabel}>Database Size</Text>
              <TextInput style={S.input} value={dbSize} onChangeText={setDbSize}
                keyboardType="numeric" placeholderTextColor="#2a4a6a" />
            </View>
            <View style={S.inputBlock}>
              <Text style={S.inputLabel}>Conversion Rate (%)</Text>
              <TextInput style={S.input} value={convRate} onChangeText={setConvRate}
                keyboardType="numeric" placeholderTextColor="#2a4a6a" />
            </View>
            <View style={S.inputBlock}>
              <Text style={S.inputLabel}>Average Product Purchase ($)</Text>
              <TextInput style={S.input} value={avgPurchase} onChangeText={setAvgPurchase}
                keyboardType="numeric" placeholderTextColor="#2a4a6a" />
            </View>
            <View style={S.inputBlock}>
              <Text style={S.inputLabel}>Rebate Re-Use %</Text>
              <TextInput style={S.input} value={rebateReuse} onChangeText={setRebateReuse}
                keyboardType="numeric" placeholderTextColor="#2a4a6a" />
            </View>
            <View style={S.inputBlock}>
              <Text style={S.inputLabel}>My Pool Parts</Text>
              <TextInput style={S.input} value={myParts} onChangeText={setMyParts}
                keyboardType="numeric" placeholderTextColor="#2a4a6a" />
            </View>
          </View>

          <TouchableOpacity style={S.calcBtn} onPress={handleCalculate}>
            <Text style={S.calcBtnText}>⚡ CALCULATE PROJECTED REVENUE</Text>
          </TouchableOpacity>

          {/* Results */}
          {calcResult && (
            <>
              {/* Summary Row */}
              <View style={S.summaryRow}>
                <View style={S.summaryBox}>
                  <Text style={S.summaryLabel}>Est. Clients</Text>
                  <Text style={[S.summaryValue, { color: BLUE }]}>{calcResult.clients}</Text>
                </View>
                <View style={S.summaryBox}>
                  <Text style={S.summaryLabel}>Team Volume</Text>
                  <Text style={[S.summaryValue, { color: GOLD }]}>{fmt(calcResult.teamVolume)}</Text>
                </View>
                <View style={S.summaryBox}>
                  <Text style={S.summaryLabel}>Peak Monthly</Text>
                  <Text style={[S.summaryValue, { color: GREEN }]}>{fmt(calcResult.totalMonthlyPeak)}</Text>
                </View>
              </View>

              {/* 10% Direct Residual note */}
              <View style={S.residualNote}>
                <Text style={S.residualTitle}>💰 10% Direct Residual Income</Text>
                <Text style={S.residualDesc}>
                  Every time a client uses their monthly rebate to purchase more diamonds, you earn 10% of that purchase — every month, for the life of their contract.
                </Text>
                <Text style={[S.residualValue, { color: GREEN }]}>
                  Monthly Residual (at peak): {fmt(calcResult.directResidual10pct)}
                </Text>
              </View>

              {/* 5-Year Timeline Table */}
              <Text style={[S.sectionTitle, { marginTop: 16 }]}>📈 5-YEAR GROWTH TIMELINE</Text>
              <View style={S.timelineTable}>
                <View style={S.timelineHeader}>
                  <Text style={[S.timelineCell, S.timelineHeaderText, { flex: 1.2 }]}>Period</Text>
                  <Text style={[S.timelineCell, S.timelineHeaderText]}>Monthly Income</Text>
                  <Text style={[S.timelineCell, S.timelineHeaderText]}>Cumulative</Text>
                </View>
                {calcResult.timeline.map(row => (
                  <View key={row.month} style={S.timelineRow}>
                    <Text style={[S.timelineCell, { flex: 1.2, color: GOLD, fontWeight: "bold" }]}>
                      {milestoneLabels[row.month]}
                    </Text>
                    <Text style={[S.timelineCell, { color: GREEN, fontWeight: "bold" }]}>
                      {fmt(row.monthlyTotal)}
                    </Text>
                    <Text style={[S.timelineCell, { color: "#fff" }]}>
                      {fmt(row.cumulative)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* ── GLOBAL POOL BONUS PATH ── */}
        <View style={[S.card, { borderColor: "#3b82f6", borderWidth: 1 }]}>
          <Text style={S.sectionTitle}>🌍 GLOBAL POOL BONUS PATH</Text>
          <Text style={S.sectionDesc}>
            Unlock the 3-Pool Global Bonus at <Text style={{ color: GOLD, fontWeight: "bold" }}>Blue Diamond Rank ($1,000,000 Team Volume)</Text>. Three pools, each worth 1% of global turnover.
          </Text>

          {/* Progress Bar toward $1M */}
          <View style={S.progressBlock}>
            <View style={S.progressHeader}>
              <Text style={S.progressLabel}>Your Team Volume Progress</Text>
              <Text style={[S.progressLabel, { color: poolProgress >= 1 ? GREEN : GOLD }]}>
                {fmt(teamVolume)} / $1M
              </Text>
            </View>
            <View style={S.progressBar}>
              <View style={[S.progressFill, { width: `${Math.round(poolProgress * 100)}%` as any, backgroundColor: poolProgress >= 1 ? GREEN : BLUE }]} />
            </View>
            <Text style={S.progressSub}>
              {poolProgress >= 1
                ? "🔵 BLUE DIAMOND QUALIFIED — Global Pool Active!"
                : `${(BLUE_DIAMOND_THRESHOLD - teamVolume).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} to unlock`}
            </Text>
          </View>

          {/* Live Stats from backend */}
          <View style={S.statsRow}>
            <View style={S.statBox}>
              <Text style={S.statLabel}>Global Turnover</Text>
              <Text style={[S.statValue, { color: GOLD }]}>{fmt(stats.globalTurnover)}</Text>
            </View>
            <View style={S.statBox}>
              <Text style={S.statLabel}>Pool 1 Parts</Text>
              <Text style={[S.statValue, { color: BLUE }]}>{stats.pool1Parts}/{POOL_MAX.pool1}</Text>
            </View>
            <View style={S.statBox}>
              <Text style={S.statLabel}>Pool 2 Parts</Text>
              <Text style={[S.statValue, { color: "#ec4899" }]}>{stats.pool2Parts}/{POOL_MAX.pool2}</Text>
            </View>
            <View style={S.statBox}>
              <Text style={S.statLabel}>Pool 3 Parts</Text>
              <Text style={[S.statValue, { color: "#6b7280" }]}>{stats.pool3Parts}/{POOL_MAX.pool2}</Text>
            </View>
          </View>

          {/* 3 Pools */}
          {[
            { name: "Pool 1 — Blue Diamond", color: BLUE, maxParts: 6, parts: stats.pool1Parts, payout: (stats.globalTurnover * 0.01) / Math.max(stats.pool1Parts, 1) },
            { name: "Pool 2 — Pink Diamond", color: "#ec4899", maxParts: 4, parts: stats.pool2Parts, payout: (stats.globalTurnover * 0.01) / Math.max(stats.pool2Parts, 1) },
            { name: "Pool 3 — Black Diamond", color: "#9ca3af", maxParts: 2, parts: stats.pool3Parts, payout: (stats.globalTurnover * 0.01) / Math.max(stats.pool3Parts, 1) },
          ].map(pool => (
            <View key={pool.name} style={[S.poolCard, { borderLeftColor: pool.color }]}>
              <View style={S.poolHeader}>
                <Text style={[S.poolName, { color: pool.color }]}>{pool.name}</Text>
                <Text style={S.poolFormula}>1% Global Turnover ÷ {pool.maxParts} max parts</Text>
              </View>
              <View style={S.poolRow}>
                <View>
                  <Text style={S.poolLabel}>Per Part (1 part)</Text>
                  <Text style={[S.poolValue, { color: GREEN }]}>{fmt(pool.payout)}/mo</Text>
                </View>
                <View>
                  <Text style={S.poolLabel}>Active Parts</Text>
                  <Text style={[S.poolValue, { color: pool.color }]}>{pool.parts}/{pool.maxParts}</Text>
                </View>
                <View>
                  <Text style={S.poolLabel}>Pool Total</Text>
                  <Text style={[S.poolValue, { color: GOLD }]}>{fmt(stats.globalTurnover * 0.01)}/mo</Text>
                </View>
              </View>
            </View>
          ))}

          <View style={S.poolNote}>
            <Text style={S.poolNoteText}>
              🔒 <Text style={{ fontWeight: "bold" }}>Formula:</Text> (Global Turnover × 1%) ÷ Total Qualified Parts × Your Parts{"\n"}
              Hard Gate: Minimum $1,000,000 Team Volume required (Blue Diamond Rank).
            </Text>
          </View>
        </View>

        {/* ── COMMISSION STRUCTURE ── */}
        <View style={S.card}>
          <Text style={S.sectionTitle}>💼 COMMISSION STRUCTURE</Text>
          {[
            { pct: "10%", color: GREEN, title: "Direct Residual (Level 1)", desc: "10% of every monthly diamond purchase your direct client makes — recurring, every month." },
            { pct: "5%", color: BLUE, title: "Level 2 Override", desc: "5% of every purchase made by clients introduced by your direct advisers." },
            { pct: "3%", color: GOLD, title: "Level 3 Override", desc: "3% deep network override — builds passive income as your team grows." },
          ].map(c => (
            <View key={c.pct} style={S.commissionRow}>
              <View style={[S.commissionBadge, { backgroundColor: c.color }]}>
                <Text style={S.commissionPct}>{c.pct}</Text>
              </View>
              <View style={S.commissionInfo}>
                <Text style={S.commissionTitle}>{c.title}</Text>
                <Text style={S.commissionDesc}>{c.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── DIAMOND RANK PLAN ── */}
        <View style={S.card}>
          <Text style={S.sectionTitle}>🏆 DIAMOND RANK BONUS PLAN</Text>
          <View style={[S.tierRow, S.tierHeader]}>
            <Text style={[S.tierRank, S.tierHeaderText]}>Rank</Text>
            <Text style={[S.tierReq, S.tierHeaderText]}>Partners</Text>
            <Text style={[S.tierBonus, S.tierHeaderText]}>One-Time Bonus</Text>
          </View>
          {DIAMOND_TIERS.map((tier, idx) => (
            <View key={tier.rank} style={[S.tierRow, idx % 2 === 0 ? S.tierEven : {}]}>
              <Text style={S.tierRank}>{tier.emoji} {tier.rank}</Text>
              <Text style={S.tierReq}>{tier.partnersNum}</Text>
              <Text style={[S.tierBonus, { color: GREEN }]}>{tier.bonus}</Text>
            </View>
          ))}
          <View style={S.totalRow}>
            <Text style={S.totalLabel}>Total Potential Rank Bonuses</Text>
            <Text style={S.totalValue}>$8,326,000</Text>
          </View>
        </View>

        {/* ── HOW IT WORKS ── */}
        <View style={S.card}>
          <Text style={S.sectionTitle}>📋 HOW IT WORKS</Text>
          {[
            "Register as a Real Estate Agent or Adviser on diamond-solution.net",
            "Set your referral code and share your link with your network",
            "Client purchases physical diamonds — you earn 10% of their monthly rebate re-use, every month",
            "Build your team of advisers to unlock Level 2 (5%) and Level 3 (3%) overrides",
            "Reach $1M Team Volume to unlock the Blue Diamond Global Pool Bonus",
          ].map((step, i) => (
            <View key={i} style={S.stepRow}>
              <View style={S.stepNum}>
                <Text style={S.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={S.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* ── REGISTER CTA ── */}
        <TouchableOpacity style={S.registerCard} onPress={() => Linking.openURL(fullLink || "https://diamond-solution.net/user/register")} activeOpacity={0.85}>
          <Text style={S.registerIcon}>🌐</Text>
          <View style={S.registerText}>
            <Text style={S.registerTitle}>Register as Adviser</Text>
            <Text style={[S.registerSub, { color: referralCode ? GREEN : GOLD }]}>
              {referralCode ? `🔗 With code: ${referralCode}` : "⚠️ Set your referral code first"}
            </Text>
          </View>
          <Text style={S.registerArrow}>→</Text>
        </TouchableOpacity>

        {/* ── SECURITY BADGE BAR ── */}
        <View style={S.badgeBar}>
          {["💎 GIA Certified", "🔒 AES-256", "✅ 3DS2 Verified", "🛡️ Lloyd's Insured"].map(b => (
            <View key={b} style={S.badge}>
              <Text style={S.badgeText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Pro Compensation Button */}
        <TouchableOpacity style={S.proCompBtn} onPress={() => router.push("/pro-compensation")} activeOpacity={0.8}>
          <Text style={S.proCompBtnIcon}>📊</Text>
          <View style={S.proCompBtnText}>
            <Text style={S.proCompBtnTitle}>{t(language, "proCompBtn")}</Text>
            <Text style={S.proCompBtnSub}>{t(language, "proCompSubtitle")}</Text>
          </View>
          <Text style={S.proCompBtnArrow}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: NAVY },
  content: { padding: 16 },

  header: { alignItems: "center", marginBottom: 24, paddingTop: 8 },
  headerIcon: { fontSize: 44, marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: GOLD, letterSpacing: 1.5, textAlign: "center" },
  headerSub: { fontSize: 13, color: "#64748b", marginTop: 6, textAlign: "center", lineHeight: 20 },

  card: { backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardLabel: { color: "#64748b", fontSize: 11, fontWeight: "bold", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" },

  // Referral
  editRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  codeInput: { flex: 1, backgroundColor: NAVY, borderRadius: 8, padding: 10, color: "#fff", fontSize: 16, borderWidth: 1, borderColor: BORDER },
  saveBtn: { backgroundColor: GREEN, borderRadius: 8, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelBtn: { backgroundColor: "#1a2a3a", borderRadius: 8, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  codeValue: { color: GOLD, fontSize: 18, fontWeight: "bold", letterSpacing: 1 },
  codePlaceholder: { color: "#2a4a6a", fontSize: 14 },
  editBtn: { padding: 6 },
  editBtnText: { fontSize: 18 },
  linkBox: { backgroundColor: NAVY, borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  linkText: { color: "#64748b", fontSize: 13, lineHeight: 20 },
  linkButtons: { flexDirection: "row", gap: 8 },
  linkBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  linkBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },

  // Section
  sectionTitle: { color: GOLD, fontSize: 14, fontWeight: "bold", letterSpacing: 0.8, marginBottom: 8 },
  sectionDesc: { color: "#64748b", fontSize: 13, lineHeight: 20, marginBottom: 14 },

  // Projected Revenue inputs
  inputGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  inputBlock: { minWidth: "45%", flex: 1 },
  inputLabel: { color: "#64748b", fontSize: 11, fontWeight: "bold", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: NAVY, borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 10, color: "#fff", fontSize: 15, fontWeight: "bold" },
  calcBtn: { backgroundColor: GOLD, borderRadius: 10, padding: 14, alignItems: "center", marginBottom: 14 },
  calcBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold", letterSpacing: 0.5 },

  // Results
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  summaryBox: { flex: 1, backgroundColor: NAVY, borderRadius: 8, padding: 10, alignItems: "center" },
  summaryLabel: { color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "bold" },
  residualNote: { backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "rgba(34,197,94,0.2)", marginBottom: 8 },
  residualTitle: { color: GREEN, fontSize: 13, fontWeight: "bold", marginBottom: 6 },
  residualDesc: { color: "#64748b", fontSize: 12, lineHeight: 18, marginBottom: 6 },
  residualValue: { fontSize: 14, fontWeight: "bold" },

  // Timeline table
  timelineTable: { borderRadius: 8, overflow: "hidden", marginBottom: 8 },
  timelineHeader: { flexDirection: "row", backgroundColor: "#0a1520", paddingVertical: 8, paddingHorizontal: 10 },
  timelineHeaderText: { color: "#64748b", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  timelineRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
  timelineCell: { flex: 1, fontSize: 13, textAlign: "right" },

  // Pool Progress
  progressBlock: { marginBottom: 14 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { color: "#64748b", fontSize: 12, fontWeight: "bold" },
  progressBar: { height: 8, backgroundColor: NAVY, borderRadius: 4, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: "100%", borderRadius: 4 },
  progressSub: { color: "#64748b", fontSize: 11, textAlign: "center", marginTop: 4 },

  // Stats row
  statsRow: { flexDirection: "row", gap: 6, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: NAVY, borderRadius: 8, padding: 8, alignItems: "center" },
  statLabel: { color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 },
  statValue: { fontSize: 13, fontWeight: "bold" },

  // Pool cards
  poolCard: { backgroundColor: NAVY, borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 3 },
  poolHeader: { marginBottom: 8 },
  poolName: { fontSize: 13, fontWeight: "bold" },
  poolFormula: { color: "#2a4a6a", fontSize: 11, marginTop: 2 },
  poolRow: { flexDirection: "row", justifyContent: "space-between" },
  poolLabel: { color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 },
  poolValue: { fontSize: 14, fontWeight: "bold" },
  poolNote: { backgroundColor: "rgba(230,126,34,0.08)", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "rgba(230,126,34,0.2)", marginTop: 8 },
  poolNoteText: { color: "#64748b", fontSize: 11, lineHeight: 18 },

  // Commission
  commissionRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  commissionBadge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 },
  commissionPct: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  commissionInfo: { flex: 1 },
  commissionTitle: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  commissionDesc: { color: "#64748b", fontSize: 12, marginTop: 2, lineHeight: 18 },

  // Tier table
  tierRow: { flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: NAVY },
  tierHeader: { borderBottomColor: BORDER, borderBottomWidth: 1, marginBottom: 2 },
  tierHeaderText: { color: "#64748b", fontSize: 11, fontWeight: "bold" },
  tierEven: { backgroundColor: "rgba(15,32,53,0.5)" },
  tierRank: { flex: 2, color: "#fff", fontSize: 13, fontWeight: "bold" },
  tierReq: { flex: 1, color: "#64748b", fontSize: 13, textAlign: "center" },
  tierBonus: { flex: 1, fontSize: 13, fontWeight: "bold", textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: BORDER },
  totalLabel: { color: "#64748b", fontSize: 13, fontWeight: "bold" },
  totalValue: { color: GREEN, fontSize: 15, fontWeight: "bold" },

  // Steps
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: BLUE, alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 1 },
  stepNumText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  stepText: { flex: 1, color: "#94a3b8", fontSize: 13, lineHeight: 20 },

  // Register
  registerCard: { backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 14, flexDirection: "row", alignItems: "center", borderLeftWidth: 3, borderLeftColor: GREEN },
  registerIcon: { fontSize: 24, marginRight: 12 },
  registerText: { flex: 1 },
  registerTitle: { color: GREEN, fontSize: 15, fontWeight: "bold" },
  registerSub: { fontSize: 13, marginTop: 2 },
  registerArrow: { color: GREEN, fontSize: 18, fontWeight: "bold" },

  // Security Badge Bar
  badgeBar: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14, justifyContent: "center" },
  badge: { backgroundColor: CARD_BG, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: BORDER },
  badgeText: { color: "#64748b", fontSize: 11, fontWeight: "bold" },

  // Pro Compensation
  proCompBtn: { backgroundColor: CARD_BG, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: BLUE },
  proCompBtnIcon: { fontSize: 28, marginRight: 12 },
  proCompBtnText: { flex: 1 },
  proCompBtnTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  proCompBtnSub: { color: "#64748b", fontSize: 13, marginTop: 2 },
  proCompBtnArrow: { color: BLUE, fontSize: 20, fontWeight: "bold" },
});
