/**
 * AFFILIATE SCREEN — Private Adviser Back-Office
 *
 * Purpose: Daily back-office tools for the Adviser.
 * Contains: Referral Link (pinned) → Call List → Global Pool
 * Separate from: partner-tools.tsx (Revenue Model + Client Tools)
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  TextInput, Alert, Platform, Linking, FlatList, Modal,
  KeyboardAvoidingView, Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { router } from "expo-router";
import { t } from "@/lib/translations";

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

// ─── Constants ─────────────────────────────────────────────────────────────
const REFERRAL_BASE    = "https://diamond-solution.net/user/register?reference=";
const REFERRAL_KEY     = "referral_code";
const PARTNERS_KEY     = "partner_list";
const NAVY             = "#0d1a2a";
const GOLD             = "#e67e22";
const GREEN            = "#22c55e";
const BLUE             = "#33C5FF";
const CARD_BG          = "#0f2035";
const BORDER           = "#1a3550";
const RED              = "#ef4444";

// ─── Real back-office pool data (update when back office updates) ──────────
const POOL_DEFAULTS = {
  pool1Total: "73908",  pool1Members: "14", pool1Parts: "1",
  pool2Total: "73908",  pool2Members: "3",  pool2Parts: "1",
  pool3Total: "297522", pool3Members: "0",  pool3Parts: "1",
};

// ─── Types ─────────────────────────────────────────────────────────────────
interface Partner {
  id: string;
  name: string;
  whatsapp: string;
  country: string;
  startDate: string; // DD/MM/YYYY
  amount: number;
  contactMoments?: string[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt  = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtM = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}K`
  : `$${n.toFixed(0)}`;

function parseDate(s: string): Date {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
}
function monthsElapsed(dateStr: string): number {
  const start = parseDate(dateStr);
  const now   = new Date();
  return Math.max(0,
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())
  );
}
function daysBetween(dateStr: string): number {
  const diff = Date.now() - parseDate(dateStr).getTime();
  return Math.floor(diff / 86_400_000);
}
function formatDDMMYYYY(d: Date): string {
  return [d.getDate(), d.getMonth() + 1, d.getFullYear()]
    .map(v => String(v).padStart(2, "0")).join("/");
}
function getSPLabel(amount: number): string {
  if (amount >= 100_000) return "SP7 (6.3%)";
  if (amount >= 50_000)  return "SP6 (6.1%)";
  if (amount >= 25_000)  return "SP5 (6.1%)";
  if (amount >= 10_000)  return "SP4 (6.0%)";
  if (amount >= 5_000)   return "SP3 (5.5%)";
  if (amount >= 2_500)   return "SP2 (4.5%)";
  return "SP1 (3.3%)";
}

function getAlerts(p: Partner): string[] {
  const alerts: string[] = [];
  const days   = daysBetween(p.startDate);
  const months = monthsElapsed(p.startDate);
  const rebate = p.amount * 0.033;

  if (rebate >= 100)                          alerts.push(`💰 Monthly rebate ~${fmt(rebate)}/mo`);
  if (days  >= 80  && days  <= 100)          alerts.push("📋 90-Day check-in due");
  if (months === 11)                          alerts.push("⚠️ Month 11 — contract renewal soon");
  if (months >= 11 && months < 12)           alerts.push("📝 Prepare renewal documents");
  if (months >= 12)                          alerts.push("🔄 12-Month: Strategy review");

  // Compounding Review trigger
  const growth = Math.pow(1 + 0.033 * 0.5, months);
  const portfolioGrowthPct = ((growth - 1) * 100);
  if (months >= 6  && portfolioGrowthPct >= 10) alerts.push(`📈 Compounding Review +${portfolioGrowthPct.toFixed(0)}% (Mo.${months})`);
  if (months >= 12 && portfolioGrowthPct >= 20) alerts.push("💎 Portfolio milestone — new strategy opportunity!");

  return alerts;
}

const BLANK_FORM = { name: "", whatsapp: "", country: "", startDate: formatDDMMYYYY(new Date()), amount: "" };

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AffiliateScreen() {
  const { language } = useCalculator();

  // ── Referral Code state ──────────────────────────────────────────────────
  const [referralCode, setReferralCode] = useState("");
  const [editingCode,  setEditingCode]  = useState(false);
  const [tempCode,     setTempCode]     = useState("");
  const [copied,       setCopied]       = useState(false);

  // ── Call List state ──────────────────────────────────────────────────────
  const [partners,       setPartners]       = useState<Partner[]>([]);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [form,           setForm]           = useState(BLANK_FORM);
  const [search,         setSearch]         = useState("");

  // ── Pool state ───────────────────────────────────────────────────────────
  const [pool1Total,   setPool1Total]   = useState(POOL_DEFAULTS.pool1Total);
  const [pool1Members, setPool1Members] = useState(POOL_DEFAULTS.pool1Members);
  const [pool1Parts,   setPool1Parts]   = useState(POOL_DEFAULTS.pool1Parts);
  const [pool2Total,   setPool2Total]   = useState(POOL_DEFAULTS.pool2Total);
  const [pool2Members, setPool2Members] = useState(POOL_DEFAULTS.pool2Members);
  const [pool2Parts,   setPool2Parts]   = useState(POOL_DEFAULTS.pool2Parts);
  const [pool3Total,   setPool3Total]   = useState(POOL_DEFAULTS.pool3Total);
  const [pool3Members, setPool3Members] = useState(POOL_DEFAULTS.pool3Members);
  const [pool3Parts,   setPool3Parts]   = useState(POOL_DEFAULTS.pool3Parts);

  // ── Load data ───────────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(REFERRAL_KEY).then(v => { if (v) setReferralCode(v); });
    AsyncStorage.getItem(PARTNERS_KEY).then(v => { if (v) setPartners(JSON.parse(v)); });
  }, []);

  const savePartners = useCallback(async (list: Partner[]) => {
    setPartners(list);
    await AsyncStorage.setItem(PARTNERS_KEY, JSON.stringify(list));
  }, []);

  // ── Referral handlers ────────────────────────────────────────────────────
  const fullLink = referralCode ? `${REFERRAL_BASE}${referralCode}` : "";

  const handleCopyLink = useCallback(async () => {
    if (!fullLink) { Alert.alert("No code", "Set your referral code first."); return; }
    await Clipboard.setStringAsync(fullLink);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [fullLink]);

  const handleSaveCode = useCallback(async () => {
    const trimmed = tempCode.trim();
    setReferralCode(trimmed);
    await AsyncStorage.setItem(REFERRAL_KEY, trimmed);
    setEditingCode(false);
  }, [tempCode]);

  // ── Call List handlers ────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingPartner(null);
    setForm(BLANK_FORM);
    setShowAddModal(true);
  };
  const openEdit = (p: Partner) => {
    setEditingPartner(p);
    setForm({ name: p.name, whatsapp: p.whatsapp, country: p.country, startDate: p.startDate, amount: String(p.amount) });
    setShowAddModal(true);
  };
  const handleDelete = (id: string) => {
    Alert.alert("Remove", "Remove this member from your list?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => savePartners(partners.filter(p => p.id !== id)) },
    ]);
  };
  const handleSaveForm = async () => {
    if (!form.name.trim()) { Alert.alert("Name required"); return; }
    const partner: Partner = {
      id: editingPartner?.id ?? Date.now().toString(),
      name: form.name.trim(),
      whatsapp: form.whatsapp.trim(),
      country: form.country.trim(),
      startDate: form.startDate || formatDDMMYYYY(new Date()),
      amount: parseFloat(form.amount) || 0,
    };
    const updated = editingPartner
      ? partners.map(p => p.id === partner.id ? partner : p)
      : [...partners, partner];
    await savePartners(updated);
    setShowAddModal(false);
  };

  // ── Computed values ──────────────────────────────────────────────────────
  const totalAlerts = useMemo(() => partners.reduce((s, p) => s + getAlerts(p).length, 0), [partners]);
  const totalPortfolio = useMemo(() => partners.reduce((s, p) => {
    const months = monthsElapsed(p.startDate);
    let pf = p.amount;
    for (let m = 0; m < months; m++) pf += pf * 0.033 * 0.5;
    return s + pf;
  }, 0), [partners]);
  const totalMonthlyResidual = useMemo(() => partners.reduce((s, p) => {
    const months = monthsElapsed(p.startDate);
    let pf = p.amount;
    for (let m = 0; m < months; m++) pf += pf * 0.033 * 0.5;
    return s + pf * 0.033 * 0.5 * 0.10;
  }, 0), [partners]);
  const compoundingReviewCount = useMemo(() =>
    partners.filter(p => {
      const months = monthsElapsed(p.startDate);
      const growth = ((Math.pow(1 + 0.033 * 0.5, months) - 1) * 100);
      return months >= 6 && growth >= 10;
    }).length, [partners]);

  const pool1Payout = (parseFloat(pool1Total) || 0) / Math.max(parseFloat(pool1Members) || 1, 1) * (parseFloat(pool1Parts) || 1);
  const pool2Payout = (parseFloat(pool2Total) || 0) / Math.max(parseFloat(pool2Members) || 1, 1) * (parseFloat(pool2Parts) || 1);
  const pool3Payout = (parseFloat(pool3Members) || 0) === 0 ? 0 :
    (parseFloat(pool3Total) || 0) / Math.max(parseFloat(pool3Members) || 1, 1) * (parseFloat(pool3Parts) || 1);
  const totalPoolPayout = pool1Payout + pool2Payout + pool3Payout;

  const filteredPartners = useMemo(() =>
    partners.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase())),
    [partners, search]);

  // ── Render partner card ──────────────────────────────────────────────────
  const renderPartner = useCallback(({ item }: { item: Partner }) => {
    const alerts  = getAlerts(item);
    const months  = monthsElapsed(item.startDate);
    const spLabel = getSPLabel(item.amount);
    const hasCompoundingReview = alerts.some(a => a.includes("Compounding Review"));
    return (
      <View style={[S.partnerCard, hasCompoundingReview && { borderLeftColor: "#f97316", borderLeftWidth: 3 }]}>
        <View style={S.partnerHeader}>
          <View style={{ flex: 1 }}>
            <Text style={S.partnerName}>{item.name}</Text>
            <Text style={S.partnerMeta}>{item.country} · Mo.{months} · {spLabel}</Text>
          </View>
          <View style={S.partnerBadge}>
            <Text style={[S.partnerBadgeText, { color: GOLD }]}>{fmt(item.amount)}</Text>
          </View>
        </View>

        {alerts.length > 0 && (
          <View style={S.alertsBox}>
            {alerts.map((a, i) => (
              <Text key={i} style={[S.alertText, a.includes("Compounding") && { color: "#f97316" }]}>{a}</Text>
            ))}
          </View>
        )}

        <View style={S.partnerActions}>
          {item.whatsapp ? (
            <TouchableOpacity style={S.waBtn}
              onPress={() => Linking.openURL(`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`)}>
              <Text style={S.waBtnText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={S.editPartnerBtn} onPress={() => openEdit(item)}>
            <Text style={S.editPartnerBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Text style={S.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [partners]);

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor={NAVY}>
      <ScrollView style={S.scroll} contentContainerStyle={S.content}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <View style={S.pageHeader}>
          <Text style={S.pageHeaderIcon}>💼</Text>
          <View style={{ flex: 1 }}>
            <Text style={S.pageHeaderTitle}>ADVISER BACK-OFFICE</Text>
            <Text style={S.pageHeaderSub}>Private tools — not visible to clients</Text>
          </View>
          {totalAlerts > 0 && (
            <View style={S.alertBadge}>
              <Text style={S.alertBadgeText}>{totalAlerts}</Text>
            </View>
          )}
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 1. REFERRAL LINK — PINNED MASTER HEADER                        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={S.referralCard}>
          <Text style={S.sectionLabel}>🔗 YOUR ADVISER REFERRAL LINK</Text>

          {editingCode ? (
            <View style={S.editRow}>
              <TextInput style={[S.input, { flex: 1 }]} value={tempCode} onChangeText={setTempCode}
                placeholder="Enter your referral code" placeholderTextColor="#2a4a6a"
                autoCapitalize="none" autoCorrect={false} returnKeyType="done"
                onSubmitEditing={handleSaveCode} autoFocus />
              <TouchableOpacity style={[S.smallBtn, { backgroundColor: GREEN }]} onPress={handleSaveCode}>
                <Text style={S.smallBtnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.smallBtn, { backgroundColor: CARD_BG }]} onPress={() => setEditingCode(false)}>
                <Text style={[S.smallBtnText, { color: "#64748b" }]}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={S.codeRow}>
              <View style={{ flex: 1 }}>
                <Text style={referralCode ? S.codeValue : S.codePlaceholder} numberOfLines={2}>
                  {fullLink || "No referral code set — tap ✏️ to add"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => { setTempCode(referralCode); setEditingCode(true); }} style={{ padding: 6 }}>
                <Text style={{ fontSize: 20 }}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={S.linkBtnRow}>
            <TouchableOpacity style={[S.linkBtn, { backgroundColor: copied ? GREEN : BLUE }]} onPress={handleCopyLink}>
              <Text style={S.linkBtnText}>{copied ? "✓ Copied!" : "📋 Copy Link"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[S.linkBtn, { backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER }]}
              onPress={() => fullLink ? Linking.openURL(fullLink) : Alert.alert("No code", "Set your referral code first.")}>
              <Text style={[S.linkBtnText, { color: "#94a3b8" }]}>🌐 Open</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 2. CALL LIST DASHBOARD                                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={S.card}>
          <View style={S.cardHeaderRow}>
            <Text style={S.sectionLabel}>📋 CALL LIST DASHBOARD</Text>
            <TouchableOpacity style={S.addBtn} onPress={openAdd}>
              <Text style={S.addBtnText}>+ Add Member</Text>
            </TouchableOpacity>
          </View>

          {/* Live Residual Summary */}
          {partners.length > 0 && (
            <View style={S.residualSummary}>
              <View style={S.residualRow}>
                {[
                  { label: "Members", value: String(partners.length), color: BLUE },
                  { label: "Portfolio Value", value: fmtM(totalPortfolio), color: GOLD },
                  { label: "Your 10%/mo", value: fmtM(totalMonthlyResidual), color: GREEN },
                  { label: "Review Calls", value: String(compoundingReviewCount), color: "#f97316" },
                ].map(s => (
                  <View key={s.label} style={S.residualStat}>
                    <Text style={S.residualStatLabel}>{s.label}</Text>
                    <Text style={[S.residualStatValue, { color: s.color }]}>{s.value}</Text>
                  </View>
                ))}
              </View>
              {compoundingReviewCount > 0 && (
                <Text style={S.reviewCallNote}>
                  📞 {compoundingReviewCount} client{compoundingReviewCount > 1 ? "s" : ""} ready for a Compounding Review — ideal moment to discuss strategy expansion.
                </Text>
              )}
            </View>
          )}

          {/* Search */}
          {partners.length > 2 && (
            <TextInput style={[S.input, { marginBottom: 10 }]} value={search} onChangeText={setSearch}
              placeholder="Search by name or country…" placeholderTextColor="#2a4a6a" />
          )}

          {/* Partner cards */}
          {filteredPartners.length === 0 ? (
            <View style={S.emptyState}>
              <Text style={S.emptyIcon}>👥</Text>
              <Text style={S.emptyTitle}>No members yet</Text>
              <Text style={S.emptyDesc}>Add your first client or partner to start tracking their portfolio growth and contact moments.</Text>
              <TouchableOpacity style={[S.addBtn, { marginTop: 12 }]} onPress={openAdd}>
                <Text style={S.addBtnText}>+ Add First Member</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredPartners.map(item => (
              <View key={item.id}>{renderPartner({ item })}</View>
            ))
          )}
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 3. GLOBAL POOL BONUS                                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={[S.card, { borderColor: "#1a2a4a", borderWidth: 1 }]}>
          <Text style={S.sectionLabel}>🌍 GLOBAL POOL BONUS</Text>
          <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18, marginBottom: 14 }}>
            Enter values from your back office for accurate real-time payouts. Formula: Pool Total ÷ Members × Your Parts.
          </Text>

          {/* Pool cards */}
          {[
            { label: "Pool 1 — Blue Diamond 🔵", color: BLUE, rank: "Min: Blue Diamond · Max 6 parts",
              total: pool1Total, setTotal: setPool1Total,
              members: pool1Members, setMembers: setPool1Members,
              parts: pool1Parts, setParts: setPool1Parts, payout: pool1Payout },
            { label: "Pool 2 — Purple Diamond 💜", color: "#a855f7", rank: "Min: Purple Diamond · Max 4 parts",
              total: pool2Total, setTotal: setPool2Total,
              members: pool2Members, setMembers: setPool2Members,
              parts: pool2Parts, setParts: setPool2Parts, payout: pool2Payout },
            { label: "Pool 3 — Double Diamond Elite 👑", color: "#f59e0b", rank: "Min: Double Diamond Elite · Max 2 parts",
              total: pool3Total, setTotal: setPool3Total,
              members: pool3Members, setMembers: setPool3Members,
              parts: pool3Parts, setParts: setPool3Parts,
              payout: pool3Payout, zeroMembers: (parseFloat(pool3Members) || 0) === 0 },
          ].map(pool => (
            <View key={pool.label} style={[S.poolCard, { borderLeftColor: pool.color }]}>
              <Text style={[S.poolName, { color: pool.color }]}>{pool.label}</Text>
              <Text style={S.poolRank}>{pool.rank}</Text>
              <View style={S.poolInputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.poolInputLabel}>Pool Total ($)</Text>
                  <TextInput style={S.poolInput} value={pool.total} onChangeText={pool.setTotal}
                    keyboardType="numeric" placeholderTextColor="#2a4a6a" placeholder="From back office" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.poolInputLabel}>Total Members</Text>
                  <TextInput style={S.poolInput} value={pool.members} onChangeText={pool.setMembers}
                    keyboardType="numeric" placeholderTextColor="#2a4a6a" placeholder="From back office" />
                </View>
                <View style={{ width: 64 }}>
                  <Text style={S.poolInputLabel}>My Parts</Text>
                  <TextInput style={S.poolInput} value={pool.parts} onChangeText={pool.setParts}
                    keyboardType="numeric" placeholderTextColor="#2a4a6a" placeholder="1" />
                </View>
              </View>
              <View style={S.poolPayoutRow}>
                <Text style={{ color: "#64748b", fontSize: 12 }}>Your Payout:</Text>
                <Text style={[S.poolPayoutValue, { color: GREEN }]}>
                  {pool.zeroMembers ? "No members yet" : fmtM(pool.payout) + "/mo"}
                </Text>
              </View>
            </View>
          ))}

          {/* Total */}
          <View style={S.poolTotal}>
            <Text style={S.poolTotalLabel}>Total Pool Payout (All 3)</Text>
            <Text style={[S.poolTotalValue, { color: GREEN }]}>{fmtM(totalPoolPayout)}/mo</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 4. COMMISSION STRUCTURE                                         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>💼 COMMISSION STRUCTURE</Text>
          {[
            { pct: "10%", color: GREEN,    title: "Direct Residual (Level 1)", desc: "10% of every monthly diamond purchase your direct client makes — recurring, every month for the life of their contract." },
            { pct: "5%",  color: BLUE,     title: "Level 2 Override",           desc: "5% of every purchase made by clients introduced by your direct advisers — builds automatically as your team grows." },
            { pct: "3%",  color: GOLD,     title: "Level 3 Override",           desc: "3% deep network override — pure passive income from your extended network with no direct management required." },
          ].map(c => (
            <View key={c.pct} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.color, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>{c.pct}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>{c.title}</Text>
                <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2, lineHeight: 18 }}>{c.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 5. DIAMOND RANK BONUS PLAN                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>🏆 DIAMOND RANK BONUS PLAN</Text>
          <View style={{ flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 4 }}>
            <Text style={{ flex: 2, color: "#64748b", fontSize: 11, fontWeight: "bold" }}>Rank</Text>
            <Text style={{ flex: 1, color: "#64748b", fontSize: 11, fontWeight: "bold", textAlign: "center" }}>Partners</Text>
            <Text style={{ flex: 1, color: "#64748b", fontSize: 11, fontWeight: "bold", textAlign: "right" }}>One-Time Bonus</Text>
          </View>
          {DIAMOND_TIERS.map((tier, idx) => (
            <View key={tier.rank} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: NAVY, backgroundColor: idx % 2 === 0 ? "rgba(15,32,53,0.5)" : "transparent" }}>
              <Text style={{ flex: 2, color: "#fff", fontSize: 13, fontWeight: "bold" }}>{tier.emoji} {tier.rank}</Text>
              <Text style={{ flex: 1, color: "#64748b", fontSize: 13, textAlign: "center" }}>{tier.partnersNum}</Text>
              <Text style={{ flex: 1, color: GREEN, fontSize: 13, fontWeight: "bold", textAlign: "right" }}>{tier.bonus}</Text>
            </View>
          ))}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: BORDER }}>
            <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "bold" }}>Total Potential Rank Bonuses</Text>
            <Text style={{ color: GREEN, fontSize: 15, fontWeight: "bold" }}>$8,326,000</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 6. HOW IT WORKS                                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>📋 HOW IT WORKS</Text>
          {[
            "Register as a Real Estate Agent or Adviser on diamond-solution.net",
            "Set your referral code and share your link with your network",
            "Client purchases physical diamonds — you earn 10% of their monthly rebate re-use, every month",
            "Build your team of advisers to unlock Level 2 (5%) and Level 3 (3%) overrides",
            "Reach $1M Team Volume to unlock the Blue Diamond Global Pool Bonus",
          ].map((step, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: BLUE, alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 1 }}>
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, color: "#94a3b8", fontSize: 13, lineHeight: 20 }}>{step}</Text>
            </View>
          ))}
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 7. REGISTER CTA                                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={{ backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 14, flexDirection: "row", alignItems: "center", borderLeftWidth: 3, borderLeftColor: GREEN }}
          onPress={() => Linking.openURL(fullLink || "https://diamond-solution.net/user/register")}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>🌐</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: GREEN, fontSize: 15, fontWeight: "bold" }}>Register as Adviser</Text>
            <Text style={{ color: referralCode ? GREEN : GOLD, fontSize: 13, marginTop: 2 }}>
              {referralCode ? `🔗 With code: ${referralCode}` : "⚠️ Set your referral code first"}
            </Text>
          </View>
          <Text style={{ color: GREEN, fontSize: 18, fontWeight: "bold" }}>→</Text>
        </TouchableOpacity>

        {/* ── PRO COMPENSATION PLAN BUTTON ─── */}
        <TouchableOpacity
          style={{ backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginBottom: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: BLUE }}
          onPress={() => router.push("/pro-compensation")}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 28, marginRight: 12 }}>📊</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>{t(language, "proCompBtn")}</Text>
            <Text style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{t(language, "proCompSubtitle")}</Text>
          </View>
          <Text style={{ color: BLUE, fontSize: 20, fontWeight: "bold" }}>→</Text>
        </TouchableOpacity>

        {/* Security Badge Bar */}
        <View style={S.badgeBar}>
          {["💎 GIA Certified", "🔒 AES-256", "✅ 3DS2 Verified", "🛡️ Lloyd's Insured"].map(b => (
            <View key={b} style={S.badge}><Text style={S.badgeText}>{b}</Text></View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Add/Edit Member Modal ─────────────────────────────────────── */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={S.modalOverlay}>
            <ScrollView style={S.modalSheet} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={S.modalTitle}>{editingPartner ? "Edit Member" : "Add Member"}</Text>

              {[
                { label: "Full Name *", key: "name",     placeholder: "John Smith",         type: "default" as const },
                { label: "WhatsApp",    key: "whatsapp", placeholder: "+31 6 12345678",     type: "phone-pad" as const },
                { label: "Country",     key: "country",  placeholder: "Netherlands",        type: "default" as const },
                { label: "Start Date (DD/MM/YYYY)", key: "startDate", placeholder: "29/04/2026", type: "default" as const },
              ].map(field => (
                <View key={field.key}>
                  <Text style={S.inputLabel}>{field.label}</Text>
                  <TextInput style={S.input} value={(form as any)[field.key]}
                    onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                    placeholder={field.placeholder} placeholderTextColor="#64748b"
                    keyboardType={field.type} returnKeyType="next" />
                </View>
              ))}

              <Text style={S.inputLabel}>Initial Purchase Amount ($)</Text>
              <View style={S.chipRow}>
                {["2500","5000","10000","25000","50000","100000"].map(v => (
                  <Pressable key={v} onPress={() => setForm(f => ({ ...f, amount: v }))}
                    style={[S.chip, form.amount === v && S.chipActive]}>
                    <Text style={[S.chipText, form.amount === v && S.chipTextActive]}>
                      ${parseInt(v).toLocaleString()}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput style={S.input} value={form.amount}
                onChangeText={v => setForm(f => ({ ...f, amount: v }))}
                keyboardType="numeric" placeholder="Custom amount" placeholderTextColor="#64748b" />

              {form.amount ? (
                <View style={[S.poolCard, { borderLeftColor: GOLD, marginTop: 8 }]}>
                  <Text style={{ color: GOLD, fontSize: 12, fontWeight: "bold" }}>
                    Plan: {getSPLabel(parseFloat(form.amount) || 0)} · Est. rebate: {fmt((parseFloat(form.amount) || 0) * 0.033)}/mo
                  </Text>
                </View>
              ) : null}

              <View style={[S.linkBtnRow, { marginTop: 16 }]}>
                <TouchableOpacity style={[S.linkBtn, { backgroundColor: GOLD, flex: 2 }]} onPress={handleSaveForm}>
                  <Text style={S.linkBtnText}>{editingPartner ? "Save Changes" : "Add Member"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[S.linkBtn, { backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER }]}
                  onPress={() => setShowAddModal(false)}>
                  <Text style={[S.linkBtnText, { color: "#94a3b8" }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  scroll:   { flex: 1, backgroundColor: NAVY },
  content:  { padding: 16 },

  pageHeader:     { flexDirection: "row", alignItems: "center", marginBottom: 18, gap: 12 },
  pageHeaderIcon: { fontSize: 32 },
  pageHeaderTitle:{ color: GOLD, fontSize: 17, fontWeight: "bold", letterSpacing: 1 },
  pageHeaderSub:  { color: "#64748b", fontSize: 11, marginTop: 2 },
  alertBadge:     { backgroundColor: RED, borderRadius: 12, minWidth: 24, height: 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  alertBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  // Referral card — pinned header
  referralCard:  { backgroundColor: "#0a1628", borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 2, borderColor: BLUE },
  sectionLabel:  { color: GOLD, fontSize: 13, fontWeight: "bold", letterSpacing: 0.8, marginBottom: 10, textTransform: "uppercase" },
  editRow:       { flexDirection: "row", gap: 8, marginBottom: 10 },
  codeRow:       { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  codeValue:     { color: "#94a3b8", fontSize: 12, lineHeight: 18, flex: 1 },
  codePlaceholder:{ color: "#2a4a6a", fontSize: 13, flex: 1 },
  linkBtnRow:    { flexDirection: "row", gap: 8 },
  linkBtn:       { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  linkBtnText:   { color: "#fff", fontSize: 13, fontWeight: "bold" },
  smallBtn:      { width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  smallBtnText:  { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Card
  card:           { backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 14 },
  cardHeaderRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  addBtn:         { backgroundColor: BLUE, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText:     { color: "#fff", fontSize: 13, fontWeight: "bold" },

  // Residual summary
  residualSummary: { backgroundColor: "rgba(34,197,94,0.06)", borderRadius: 8, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: "rgba(34,197,94,0.15)" },
  residualRow:     { flexDirection: "row", gap: 6, marginBottom: 6 },
  residualStat:    { flex: 1, alignItems: "center" },
  residualStatLabel:{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 },
  residualStatValue:{ fontSize: 13, fontWeight: "bold", marginTop: 2 },
  reviewCallNote:  { color: "#f97316", fontSize: 11, lineHeight: 16 },

  // Search & empty
  emptyState: { alignItems: "center", paddingVertical: 28 },
  emptyIcon:  { fontSize: 40, marginBottom: 10 },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  emptyDesc:  { color: "#64748b", fontSize: 13, lineHeight: 20, textAlign: "center" },

  // Partner card
  partnerCard:     { backgroundColor: NAVY, borderRadius: 10, padding: 12, marginBottom: 10 },
  partnerHeader:   { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  partnerName:     { color: "#fff", fontSize: 15, fontWeight: "bold" },
  partnerMeta:     { color: "#64748b", fontSize: 12, marginTop: 2 },
  partnerBadge:    { alignItems: "flex-end" },
  partnerBadgeText:{ fontSize: 14, fontWeight: "bold" },
  alertsBox:       { backgroundColor: "rgba(230,126,34,0.08)", borderRadius: 6, padding: 8, marginBottom: 8 },
  alertText:       { color: "#e67e22", fontSize: 12, lineHeight: 18 },
  partnerActions:  { flexDirection: "row", gap: 8 },
  waBtn:           { flex: 2, backgroundColor: "#15803d", borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  waBtnText:       { color: "#fff", fontSize: 13, fontWeight: "bold" },
  editPartnerBtn:  { flex: 1, backgroundColor: CARD_BG, borderRadius: 8, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderColor: BORDER },
  editPartnerBtnText:{ color: "#94a3b8", fontSize: 13 },
  deleteBtn:       { width: 36, backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  deleteBtnText:   { fontSize: 16 },

  // Pool
  poolCard:      { backgroundColor: NAVY, borderRadius: 10, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
  poolName:      { fontSize: 13, fontWeight: "bold", marginBottom: 2 },
  poolRank:      { color: "#2a4a6a", fontSize: 10, marginBottom: 10 },
  poolInputRow:  { flexDirection: "row", gap: 8, marginBottom: 8 },
  poolInputLabel:{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 },
  poolInput:     { backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 8, color: "#fff", fontSize: 13 },
  poolPayoutRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: CARD_BG, borderRadius: 6, padding: 8 },
  poolPayoutValue:{ fontSize: 16, fontWeight: "bold" },
  poolTotal:     { backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 8, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "rgba(34,197,94,0.2)" },
  poolTotalLabel:{ color: "#64748b", fontSize: 13, fontWeight: "bold" },
  poolTotalValue:{ fontSize: 20, fontWeight: "bold" },

  // Badge bar
  badgeBar:  { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14, justifyContent: "center" },
  badge:     { backgroundColor: CARD_BG, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: BORDER },
  badgeText: { color: "#64748b", fontSize: 10, fontWeight: "bold" },

  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet:   { backgroundColor: "#0f172a", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "90%" },
  modalTitle:   { color: GOLD, fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  inputLabel:   { color: "#64748b", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, marginTop: 10 },
  input:        { backgroundColor: NAVY, borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 10, color: "#fff", fontSize: 14 },
  chipRow:      { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  chip:         { backgroundColor: CARD_BG, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: BORDER },
  chipActive:   { backgroundColor: GOLD, borderColor: GOLD },
  chipText:     { color: "#64748b", fontSize: 12 },
  chipTextActive:{ color: "#fff", fontWeight: "bold" },
});
