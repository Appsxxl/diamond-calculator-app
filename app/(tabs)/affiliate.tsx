import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { t } from "@/lib/translations";

const REFERRAL_BASE = "https://diamond-solution.net/user/register?reference=";
const STORAGE_KEY = "referral_code";

interface DiamondTier {
  rank: string;
  emoji: string;
  partnersNum: string;
  bonus: string;
}

// Official ranks from diamond-solution.net compensation plan
// Team Volume required: Emerald $50K, Diamond $250K, Blue Diamond $1M, Green $2.5M,
// Purple $5M, Elite $10M, Double Elite $50M, Triple Elite $150M, Black $500M
const DIAMOND_TIERS: DiamondTier[] = [
  { rank: "Emerald",              emoji: "💚", partnersNum: "2",    bonus: "$1,000"     },
  { rank: "Diamond",              emoji: "💎", partnersNum: "2",    bonus: "$5,000"     },
  { rank: "Blue Diamond",         emoji: "🔵", partnersNum: "2",    bonus: "$20,000"    },
  { rank: "Green Diamond",        emoji: "💚", partnersNum: "3",    bonus: "$50,000"    },
  { rank: "Purple Diamond",       emoji: "💜", partnersNum: "3",    bonus: "$100,000"   },
  { rank: "Diamond Elite",        emoji: "💎", partnersNum: "4",    bonus: "$150,000"   },
  { rank: "Double Diamond Elite", emoji: "👑", partnersNum: "4",    bonus: "$1,000,000" },
  { rank: "Triple Diamond Elite", emoji: "🏆", partnersNum: "4",    bonus: "$2,000,000" },
  { rank: "Black Diamond",        emoji: "⚫", partnersNum: "5",    bonus: "$5,000,000" },
];

export default function AffiliateScreen() {
  const { language } = useCalculator();
  const [referralCode, setReferralCode] = useState("");
  const [editingCode, setEditingCode] = useState(false);
  const [tempCode, setTempCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) setReferralCode(val);
    });
  }, []);

  const fullLink = referralCode
    ? `${REFERRAL_BASE}${referralCode}`
    : "";

  const handleCopy = useCallback(async () => {
    if (!fullLink) {
      Alert.alert(t(language, "noReferralCode"), t(language, "setReferralCode"));
      return;
    }
    await Clipboard.setStringAsync(fullLink);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [fullLink, language]);

  const handleShare = useCallback(async () => {
    if (!fullLink) {
      Alert.alert(t(language, "noReferralCode"), t(language, "setReferralCode"));
      return;
    }
    if (Platform.OS === "web") {
      if (navigator.share) {
        await navigator.share({ title: "Plan B", url: fullLink });
      } else {
        await Clipboard.setStringAsync(fullLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
      return;
    }
    await Clipboard.setStringAsync(fullLink);
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(t(language, "linkCopied"), fullLink);
  }, [fullLink, language]);

  const handleSaveCode = useCallback(async () => {
    const trimmed = tempCode.trim();
    setReferralCode(trimmed);
    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
    setEditingCode(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [tempCode]);

  const handleRegister = () => {
    // If a referral code is set, open the registration page with the affiliate link
    const url = fullLink || "https://diamond-solution.net/user/register";
    Linking.openURL(url);
  };

  const commissions = [
    {
      pct: "10%",
      color: "#22c55e",
      title: t(language, "commission1Title"),
      desc: t(language, "commission1Desc"),
    },
    {
      pct: "5%",
      color: "#0ea5e9",
      title: t(language, "commission2Title"),
      desc: t(language, "commission2Desc"),
    },
    {
      pct: "3%",
      color: "#f59e0b",
      title: t(language, "commission3Title"),
      desc: t(language, "commission3Desc"),
    },
  ];

  const steps = [
    t(language, "howItWorksStep1"),
    t(language, "howItWorksStep2"),
    t(language, "howItWorksStep3"),
    t(language, "howItWorksStep4"),
    t(language, "howItWorksStep5"),
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor="#0f172a">
      <ScrollView style={S.scroll} contentContainerStyle={S.content}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerIcon}>🤝</Text>
          <Text style={S.headerTitle}>{t(language, "affiliateTitle")}</Text>
          <Text style={S.headerSub}>{t(language, "affiliateSubtitle")}</Text>
        </View>

        {/* Referral Code Section */}
        <View style={S.card}>
          <Text style={S.cardLabel}>{t(language, "referralCode")}</Text>
          {editingCode ? (
            <View style={S.editRow}>
              <TextInput
                style={S.codeInput}
                value={tempCode}
                onChangeText={setTempCode}
                placeholder="e.g. appsxxl"
                placeholderTextColor="#475569"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSaveCode}
              />
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
                {referralCode || t(language, "noReferralCode")}
              </Text>
              <TouchableOpacity
                style={S.editBtn}
                onPress={() => {
                  setTempCode(referralCode);
                  setEditingCode(true);
                }}
              >
                <Text style={S.editBtnText}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={S.codeHint}>{t(language, "referralCodeHint")}</Text>
        </View>

        {/* Referral Link Section */}
        <View style={S.card}>
          <Text style={S.cardLabel}>{t(language, "yourReferralLink")}</Text>
          <View style={S.linkBox}>
            <Text style={S.linkText} numberOfLines={2}>
              {fullLink || `${REFERRAL_BASE}[${t(language, "referralCode")}]`}
            </Text>
          </View>
          <View style={S.linkButtons}>
            <TouchableOpacity
              style={[S.linkBtn, { backgroundColor: copied ? "#22c55e" : "#0ea5e9" }]}
              onPress={handleCopy}
            >
              <Text style={S.linkBtnText}>
                {copied ? `✓ ${t(language, "linkCopied")}` : `📋 ${t(language, "copyLink")}`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.linkBtn, { backgroundColor: "#1e3a5f", borderWidth: 1, borderColor: "#334155" }]} onPress={handleShare}>
              <Text style={[S.linkBtnText, { color: "#94a3b8" }]}>🔗 {t(language, "shareLink")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register CTA */}
        <TouchableOpacity style={S.registerCard} onPress={handleRegister} activeOpacity={0.85}>
          <Text style={S.registerIcon}>🌐</Text>
          <View style={S.registerText}>
            <Text style={S.registerTitle}>{t(language, "registerNow")}</Text>
            {referralCode ? (
              <Text style={[S.registerSub, { color: "#22c55e" }]}>
                🔗 {t(language, "withYourReferralCode")}: {referralCode}
              </Text>
            ) : (
              <Text style={[S.registerSub, { color: "#f59e0b" }]}>
                ⚠️ {t(language, "setCodeFirst")}
              </Text>
            )}
          </View>
          <Text style={S.registerArrow}>→</Text>
        </TouchableOpacity>

        {/* Commission Structure */}
        <View style={S.card}>
          <Text style={S.sectionTitle}>{t(language, "commissionStructure")}</Text>
          {commissions.map(c => (
            <View key={c.pct} style={S.commissionRow}>
              <View style={[S.commissionBadge, { backgroundColor: c.color }]}>
                <Text style={S.commissionPct}>{c.pct}</Text>
              </View>
              <View style={S.commissionInfo}>
                <Text style={S.commissionLevel}>{c.title}</Text>
                <Text style={S.commissionDesc}>{c.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* How It Works */}
        <View style={S.card}>
          <Text style={S.sectionTitle}>{t(language, "howItWorks")}</Text>
          {steps.map((step, i) => (
            <View key={i} style={S.stepRow}>
              <View style={S.stepNum}>
                <Text style={S.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={S.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Diamond Bonus Plan */}
        <View style={S.card}>
          <Text style={S.sectionTitle}>{t(language, "diamondBonusPlan")}</Text>
          <Text style={S.diamondBonusDesc}>{t(language, "diamondBonusDesc")}</Text>

          {/* Table Header */}
          <View style={[S.tierRow, S.tierHeader]}>
            <Text style={[S.tierRank, S.tierHeaderText]}>{t(language, "rankHeader")}</Text>
            <Text style={[S.tierReq, S.tierHeaderText]}>{t(language, "partnersHeader")}</Text>
            <Text style={[S.tierBonus, S.tierHeaderText]}>{t(language, "bonusHeader")}</Text>
          </View>

          {DIAMOND_TIERS.map((tier, idx) => (
            <View key={tier.rank} style={[S.tierRow, idx % 2 === 0 ? S.tierEven : S.tierOdd]}>
              <Text style={S.tierRank}>
                {tier.emoji} {tier.rank}
              </Text>
              <Text style={S.tierReq}>{tier.partnersNum}</Text>
              <Text style={[S.tierBonus, { color: "#22c55e" }]}>{tier.bonus}</Text>

            </View>
          ))}

          <View style={S.totalRow}>
            <Text style={S.totalLabel}>{t(language, "totalPotentialBonuses")}</Text>
            <Text style={S.totalValue}>$8,326,000</Text>
          </View>

          <View style={S.giaNote}>
            <Text style={S.giaIcon}>💎</Text>
            <Text style={S.giaText}>{t(language, "giaNote")}</Text>
          </View>
        </View>

        {/* Action Alert Note */}
        <View style={S.alertCard}>
          <Text style={S.alertIcon}>🔔</Text>
          <View style={S.alertText}>
            <Text style={S.alertTitle}>{t(language, "actionAlertTitle")}</Text>
            <Text style={S.alertDesc}>{t(language, "actionAlertDesc")}</Text>
          </View>
        </View>

        {/* Pro Compensation Calculator Button */}
        <TouchableOpacity
          style={S.proCompBtn}
          onPress={() => router.push("/pro-compensation")}
          activeOpacity={0.8}
        >
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

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16 },

  header: { alignItems: "center", marginBottom: 20 },
  headerIcon: { fontSize: 44, marginBottom: 8 },
  // fontWeight "bold" = 700, universally supported on Android; "900" causes font substitution
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff", letterSpacing: 1, includeFontPadding: false },
  headerSub: { fontSize: 15, color: "#94a3b8", marginTop: 4, textAlign: "center", lineHeight: 22, includeFontPadding: false },

  card: { backgroundColor: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 12 },
  cardLabel: { color: "#64748b", fontSize: 13, fontWeight: "bold", letterSpacing: 0.8, marginBottom: 8, textTransform: "uppercase", includeFontPadding: false },

  // Referral Code
  editRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  codeInput: { flex: 1, backgroundColor: "#0f172a", borderRadius: 8, padding: 10, color: "#fff", fontSize: 16, borderWidth: 1, borderColor: "#334155" },
  saveBtn: { backgroundColor: "#22c55e", borderRadius: 8, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold", includeFontPadding: false },
  cancelBtn: { backgroundColor: "#334155", borderRadius: 8, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold", includeFontPadding: false },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  codeValue: { color: "#f59e0b", fontSize: 18, fontWeight: "bold", letterSpacing: 1, includeFontPadding: false },
  codePlaceholder: { color: "#475569", fontSize: 14, includeFontPadding: false },
  editBtn: { padding: 6 },
  editBtnText: { fontSize: 18 },
  codeHint: { color: "#475569", fontSize: 14, lineHeight: 20, includeFontPadding: false },

  // Link
  linkBox: { backgroundColor: "#0f172a", borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  linkText: { color: "#94a3b8", fontSize: 15, lineHeight: 22, includeFontPadding: false },
  linkButtons: { flexDirection: "row", gap: 8 },
  linkBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  linkBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold", includeFontPadding: false },

  // Register CTA
  registerCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "center", borderLeftWidth: 3, borderLeftColor: "#22c55e" },
  registerIcon: { fontSize: 24, marginRight: 12 },
  registerText: { flex: 1 },
  registerTitle: { color: "#22c55e", fontSize: 16, fontWeight: "bold", includeFontPadding: false },
  registerSub: { color: "#64748b", fontSize: 14, marginTop: 2, includeFontPadding: false },
  registerArrow: { color: "#22c55e", fontSize: 18, fontWeight: "bold", includeFontPadding: false },

  // Commission
  sectionTitle: { color: "#f59e0b", fontSize: 15, fontWeight: "bold", letterSpacing: 0.5, marginBottom: 14, includeFontPadding: false },
  commissionRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  commissionBadge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 },
  commissionPct: { color: "#fff", fontSize: 16, fontWeight: "bold", includeFontPadding: false },
  commissionInfo: { flex: 1 },
  commissionLevel: { color: "#fff", fontSize: 16, fontWeight: "bold", includeFontPadding: false },
  commissionDesc: { color: "#64748b", fontSize: 14, marginTop: 2, lineHeight: 20, includeFontPadding: false },

  // How It Works
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#0ea5e9", alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 1 },
  stepNumText: { color: "#fff", fontSize: 13, fontWeight: "bold", includeFontPadding: false },
  stepText: { flex: 1, color: "#94a3b8", fontSize: 16, lineHeight: 24, includeFontPadding: false },

  // Diamond Bonus Table
  diamondBonusDesc: { color: "#64748b", fontSize: 15, lineHeight: 22, marginBottom: 14, includeFontPadding: false },
  tierRow: { flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#0f172a" },
  tierHeader: { borderBottomColor: "#334155", borderBottomWidth: 1, marginBottom: 2 },
  tierHeaderText: { color: "#64748b", fontSize: 13, fontWeight: "bold" },
  tierEven: { backgroundColor: "rgba(30,41,59,0.5)" },
  tierOdd: { backgroundColor: "transparent" },
  tierRank: { flex: 2, color: "#fff", fontSize: 14, fontWeight: "bold", includeFontPadding: false },
  tierReq: { flex: 1, color: "#94a3b8", fontSize: 14, textAlign: "center", includeFontPadding: false },
  tierBonus: { flex: 1, fontSize: 14, fontWeight: "bold", textAlign: "right", includeFontPadding: false },

  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: "#334155" },
  totalLabel: { color: "#64748b", fontSize: 14, fontWeight: "bold", includeFontPadding: false },
  totalValue: { color: "#22c55e", fontSize: 16, fontWeight: "bold", includeFontPadding: false },
  giaNote: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(245,158,11,0.09)", borderRadius: 8, padding: 10, marginTop: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.27)" },
  giaIcon: { fontSize: 20, marginRight: 8, marginTop: 1 },
  giaText: { flex: 1, color: "#f59e0b", fontSize: 14, lineHeight: 20, includeFontPadding: false },

  // Alert Card
  alertCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "flex-start", borderLeftWidth: 3, borderLeftColor: "#f59e0b" },
  alertIcon: { fontSize: 22, marginRight: 12, marginTop: 2 },
  alertText: { flex: 1 },
  alertTitle: { color: "#f59e0b", fontSize: 16, fontWeight: "bold", marginBottom: 4, includeFontPadding: false },
  alertDesc: { color: "#94a3b8", fontSize: 15, lineHeight: 22, includeFontPadding: false },
  proCompBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0ea5e9",
    marginTop: 4,
  },
  proCompBtnIcon: { fontSize: 28, marginRight: 12 },
  proCompBtnText: { flex: 1 },
  proCompBtnTitle: { color: "#fff", fontSize: 17, fontWeight: "bold", includeFontPadding: false },
  proCompBtnSub: { color: "#94a3b8", fontSize: 15, marginTop: 2, includeFontPadding: false },
  proCompBtnArrow: { color: "#0ea5e9", fontSize: 20, fontWeight: "bold" },
});
