import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { DisclaimerFooter } from "@/components/disclaimer-footer";
import { useCalculator } from "@/lib/calculator-context";
import { t, Language } from "@/lib/translations";
import * as Haptics from "expo-haptics";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "nl", label: "NL", flag: "🇳🇱" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "tl", label: "Filipino", flag: "🇵🇭" },
  { code: "pt", label: "PT", flag: "🇵🇹" },
  { code: "ar", label: "عربي", flag: "🇸🇦" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "vi", label: "Việt", flag: "🇻🇳" },
];

const SP_LEVELS = [
  { sp: "SP1", range: "$0–$1K",     base: "2.2%",  vip: "5.2%" },
  { sp: "SP2", range: "$1K–2.5K",  base: "2.45%", vip: "5.45%" },
  { sp: "SP3", range: "$2.5K–5K", base: "2.7%",  vip: "5.7%" },
  { sp: "SP4", range: "$5K–$10K",   base: "3.0%",  vip: "6.0%" },
  { sp: "SP5", range: "$10K–$50K",  base: "3.1%",  vip: "6.1%" },
  { sp: "SP6", range: "$50K–$100K", base: "3.2%",  vip: "6.2%" },
  { sp: "SP7", range: "$100K+",     base: "3.3%",  vip: "6.3%" },
];

interface GoalCard {
  icon: string;
  titleKey: string;
  title: string;
  subtitleKey: string;
  subtitle: string;
  description: string;
  recommended: string;
  startAmount: number;
  vip: boolean;
}

const GOAL_CARDS: GoalCard[] = [
  {
    icon: "🎓",
    titleKey: "goalFamilyTitle",
    title: "Family & Legacy",
    subtitleKey: "goalFamilySubtitle",
    subtitle: "University Fund • Private Schooling",
    description: "Secure high-tier education and long-term security for your next generation. Capital is utilized for monthly SP plans, allowing you to grow your family legacy while maintaining asset liquidity.",
    recommended: "$3,500 (SP3 + VIP)",
    startAmount: 3500,
    vip: true,
  },
  {
    icon: "🏠",
    titleKey: "goalHomeTitle",
    title: "Home & Property",
    subtitleKey: "goalHomeSubtitle",
    subtitle: "Home Down Payment • Renovations",
    description: "Strategic compounding creates a liquidity bridge, ideal for property deposits or large-scale home upgrades over a 12–24 month horizon.",
    recommended: "$25,000+ with VIP",
    startAmount: 25000,
    vip: true,
  },
  {
    icon: "🚗",
    titleKey: "goalLifestyleTitle",
    title: "Lifestyle & Passion",
    subtitleKey: "goalLifestyleSubtitle",
    subtitle: "Luxury Lease • World Trips",
    description: "Designed to generate recurring cash flow to offset lifestyle expenses without depleting principal capital. Approx. $1,830/month at SP5 + VIP.",
    recommended: "$30,000+ (SP5 + VIP)",
    startAmount: 30000,
    vip: true,
  },
  {
    icon: "💰",
    titleKey: "goalFreedomTitle",
    title: "Freedom & Wealth",
    subtitleKey: "goalFreedomSubtitle",
    subtitle: "Financial Independence",
    description: "Optimized for maximum efficiency. Accelerate the transition to debt-free living through high-tier strategic engineering at SP7 level.",
    recommended: "$100,000+ (SP7 + VIP)",
    startAmount: 100000,
    vip: true,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { language, setLanguage, partnerMode } = useCalculator();
  const [explainCard, setExplainCard] = useState<GoalCard | null>(null);

  const handleLang = (code: Language) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(code);
  };

  const handleCalculate = (card: GoalCard) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/strategy-engineer?startDeposit=${card.startAmount}&vip=${card.vip ? 1 : 0}`);
  };

  const toolDescriptions: Record<Language, { tool1: string; tool2: string }> = {
    en: {
      tool1: "Simulate your wealth growth month-by-month. Configure deposits, withdrawals, compound percentages, VIP status, and track your goal progress.",
      tool2: "Goal planning calculator. Enter your start deposit and monthly income goal — get 4 strategic plans (A/B/C/D) with exact amounts and timelines.",
    },
    nl: {
      tool1: "Simuleer uw vermogensgroei maand voor maand. Configureer stortingen, opnames, samengestelde percentages en VIP-status.",
      tool2: "Doelplanningscalculator. Voer uw startbedrag en maandelijks inkomensdoel in — ontvang 4 strategische plannen (A/B/C/D).",
    },
    de: {
      tool1: "Simulieren Sie Ihr Vermögenswachstum Monat für Monat. Konfigurieren Sie Einzahlungen, Abhebungen, Zinseszinsprozentsätze und VIP-Status.",
      tool2: "Zielplanungsrechner. Geben Sie Ihre Starteinlage und Ihr monatliches Einkommensziel ein — erhalten Sie 4 strategische Pläne (A/B/C/D).",
    },
    fr: {
      tool1: "Simulez votre croissance de richesse mois par mois. Configurez les dépôts, retraits, pourcentages composés et statut VIP.",
      tool2: "Calculateur de planification d'objectifs. Entrez votre dépôt de départ et votre objectif de revenu mensuel — obtenez 4 plans stratégiques (A/B/C/D).",
    },
    es: {
      tool1: "Simule su crecimiento de riqueza mes a mes. Configure depósitos, retiros, porcentajes compuestos y estado VIP.",
      tool2: "Calculadora de planificación de objetivos. Ingrese su depósito inicial y el objetivo de ingresos mensuales — obtenga 4 planes estratégicos (A/B/C/D).",
    },
    ru: {
      tool1: "Симулируйте рост капитала помесячно. Настройте депозиты, выводы, реинвестирование и VIP-статус.",
      tool2: "Калькулятор планирования целей. Введите начальный депозит и ежемесячную цель — получите 4 стратегических плана (A/B/C/D).",
    },
    zh: {
      tool1: "逐月模拟您的财富增长。配置存款、提款、复利百分比和VIP状态。",
      tool2: "目标规划计算器。输入您的初始存款和每月收入目标 — 获得4个战略计划（A/B/C/D）。",
    },
  };

  const desc = toolDescriptions[language] || toolDescriptions.en;

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor="#0f172a">
      <ScrollView style={S.scroll} contentContainerStyle={S.content}>

        {/* Language selector */}
        <View style={S.langRow}>
          {LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[S.langBtn, language === l.code && S.langBtnActive]}
              onPress={() => handleLang(l.code)}
            >
              <Text style={[S.langText, language === l.code && S.langTextActive]}>{l.flag} {l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hero */}
        <View style={S.hero}>
          <Text style={S.heroIcon}>💎</Text>
          <Text style={S.heroTitle}>{t(language, "welcomeTitle")}</Text>
          <Text style={S.heroSub}>{t(language, "welcomeSubtitle")}</Text>
        </View>

        {/* Goal Cards Section */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>{t(language, "goalCards")}</Text>
          <Text style={S.sectionSub}>{t(language, "goalCardsSubtitle")}</Text>
        </View>

        <View style={S.goalGrid}>
          {GOAL_CARDS.map((card) => (
            <View key={card.titleKey} style={S.goalCard}>
              <Text style={S.goalIcon}>{card.icon}</Text>
              <Text style={S.goalTitle}>{t(language, card.titleKey)}</Text>
              <Text style={S.goalSubtitle}>{t(language, card.subtitleKey)}</Text>
              <Text style={S.goalRecommended}>⭐ {t(language, card.titleKey.replace('Title', 'Rec'))}</Text>
              <View style={S.goalButtons}>
                <TouchableOpacity
                  style={S.explainBtn}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExplainCard(card);
                  }}
                >
                  <Text style={S.explainBtnText}>{t(language, "explanation")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={S.calcBtn}
                  onPress={() => handleCalculate(card)}
                >
                  <Text style={S.calcBtnText}>{t(language, "calculateGoal")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Tool 1: Strategy Engineer */}
        <TouchableOpacity style={[S.toolCard, { borderTopColor: "#f59e0b" }]} onPress={() => router.push("/strategy-engineer")} activeOpacity={0.85}>
          <View style={[S.toolBadge, { backgroundColor: "#f59e0b" }]}>
            <Text style={[S.toolBadgeText, { color: "#0f172a" }]}>TOOL 1</Text>
          </View>
          <Text style={S.toolTitle}>🧠 {t(language, "strategyEngineer")}</Text>
          <Text style={S.toolDesc}>{desc.tool2}</Text>
          <View style={S.toolFeatures}>
            {["Plan A", "Plan B", "Plan C", "Plan D"].map(f => (
              <View key={f} style={[S.featureTag, { backgroundColor: "rgba(245,158,11,0.13)", borderColor: "rgba(245,158,11,0.27)" }]}>
                <Text style={[S.featureText, { color: "#f59e0b" }]}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={[S.toolArrow, { borderTopColor: "rgba(245,158,11,0.2)" }]}>
            <Text style={[S.toolArrowText, { color: "#f59e0b" }]}>{t(language, "strategyEngineer")} →</Text>
          </View>
        </TouchableOpacity>

        {/* Tool 2: Scenario Tool */}
        <TouchableOpacity style={S.toolCard} onPress={() => router.push("/scenario-tool")} activeOpacity={0.85}>
          <View style={[S.toolBadge, { backgroundColor: "#33C5FF" }]}>
            <Text style={S.toolBadgeText}>TOOL 2</Text>
          </View>
          <Text style={S.toolTitle}>📊 {t(language, "scenarioTool")}</Text>
          <Text style={S.toolDesc}>{desc.tool1}</Text>
          <View style={S.toolFeatures}>
            {["SP1–SP7", "VIP", "Bulk ops", "Monthly table", "Goal tracker"].map(f => (
              <View key={f} style={S.featureTag}>
                <Text style={S.featureText}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={S.toolArrow}>
            <Text style={S.toolArrowText}>{t(language, "scenarioTool")} →</Text>
          </View>
        </TouchableOpacity>

        {/* Affiliate Link — only visible in Partner Mode */}
        {partnerMode && (
          <TouchableOpacity style={S.affiliateCard} onPress={() => router.push("/affiliate")} activeOpacity={0.85}>
            <Text style={S.affiliateIcon}>🤝</Text>
            <View style={S.affiliateTextBlock}>
              <Text style={S.affiliateTitle}>{t(language, "affiliateTitle")}</Text>
              <Text style={S.affiliateSub}>{t(language, "affiliateSubtitle")}</Text>
            </View>
            <Text style={S.affiliateArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* SP Reference Table */}
        <View style={S.refCard}>
          <Text style={S.refTitle}>{t(language, "spLevelOverview")}</Text>
          <View style={S.vipBanner}>
            <Text style={S.vipBannerText}>⭐ {t(language, "vipInfo")}</Text>
          </View>
          <View style={[S.refItem, { borderBottomColor: "#334155", borderBottomWidth: 1, marginBottom: 4 }]}>
            <Text style={[S.refSp, { color: "#64748b" }]}>SP</Text>
            <Text style={[S.refRange, { color: "#64748b" }]}>Range</Text>
            <Text style={[S.refRate, { color: "#64748b" }]}>{t(language, "baseRate")}</Text>
            <Text style={[S.refVip, { color: "#64748b" }]}>{t(language, "vipRate")}</Text>
          </View>
          {SP_LEVELS.map(item => (
            <View key={item.sp} style={S.refItem}>
              <Text style={S.refSp}>{item.sp}</Text>
              <Text style={S.refRange}>{item.range}</Text>
              <Text style={S.refRate}>{item.base}</Text>
              <Text style={S.refVip}>{item.vip}</Text>
            </View>
          ))}
        </View>

        {/* Settings link */}
        <TouchableOpacity style={S.settingsLink} onPress={() => router.push("/settings")}>
          <Text style={S.settingsText}>⚙️ {t(language, "settings")}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Explanation Modal */}
      <Modal visible={!!explainCard} transparent animationType="fade" onRequestClose={() => setExplainCard(null)}>
        <View style={S.modalOverlay}>
          <View style={S.modalBox}>
            <Text style={S.modalIcon}>{explainCard?.icon}</Text>
            <Text style={S.modalTitle}>{explainCard ? t(language, explainCard.titleKey) : ''}</Text>
            <Text style={S.modalSubtitle}>{explainCard ? t(language, explainCard.subtitleKey) : ''}</Text>
            <Text style={S.modalDesc}>{explainCard ? t(language, explainCard.titleKey.replace('Title', 'Desc')) : ''}</Text>
            <View style={S.modalRecommendedRow}>
              <Text style={S.modalRecommendedLabel}>{t(language, 'recommended') || 'Recommended Start:'}</Text>
              <Text style={S.modalRecommendedValue}>{explainCard ? t(language, explainCard.titleKey.replace('Title', 'Rec')) : ''}</Text>
            </View>
            <TouchableOpacity style={S.modalClose} onPress={() => setExplainCard(null)}>
              <Text style={S.modalCloseText}>✕ Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={S.modalCalcBtn}
              onPress={() => {
                setExplainCard(null);
                if (explainCard) handleCalculate(explainCard);
              }}
            >
              <Text style={S.modalCalcBtnText}>{t(language, "calculateGoal")} →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <DisclaimerFooter />
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16 },
  langRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 5, marginBottom: 16 },
  langBtn: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#334155" },
  langBtnActive: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  langText: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
  langTextActive: { color: "#0f172a" },
  hero: { alignItems: "center", marginBottom: 20 },
  heroIcon: { fontSize: 44, marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: "bold", color: "#fff", letterSpacing: 1 },
  heroSub: { fontSize: 15, color: "#94a3b8", marginTop: 4, textAlign: "center" },

  // Goal Cards
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: "#f59e0b", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 },
  sectionSub: { color: "#64748b", fontSize: 14, marginTop: 2 },
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  goalCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 14, width: "48%", borderTopWidth: 2, borderTopColor: "#33C5FF" },
  goalIcon: { fontSize: 28, marginBottom: 6 },
  goalTitle: { color: "#fff", fontSize: 15, fontWeight: "bold", marginBottom: 3 },
  goalSubtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 6, lineHeight: 18 },
  goalRecommended: { color: "#f59e0b", fontSize: 13, fontWeight: "600", marginBottom: 10 },
  goalButtons: { gap: 6 },
  explainBtn: { backgroundColor: "#33C5FF", borderRadius: 6, paddingVertical: 7, alignItems: "center" },
  explainBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold", letterSpacing: 0.5 },
  calcBtn: { backgroundColor: "#1e3a5f", borderRadius: 6, paddingVertical: 7, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  calcBtnText: { color: "#94a3b8", fontSize: 13, fontWeight: "bold", letterSpacing: 0.5 },

  // Tool Cards
  toolCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 10, borderTopWidth: 3, borderTopColor: "#33C5FF" },
  toolBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  toolBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 12, letterSpacing: 1 },
  toolTitle: { fontSize: 17, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  toolDesc: { fontSize: 15, color: "#94a3b8", lineHeight: 22, marginBottom: 10 },
  toolFeatures: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  featureTag: { backgroundColor: "rgba(14,165,233,0.13)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(14,165,233,0.27)" },
  featureText: { color: "#33C5FF", fontSize: 13, fontWeight: "600" },
  toolArrow: { borderTopWidth: 1, borderTopColor: "rgba(14,165,233,0.2)", paddingTop: 10 },
  toolArrowText: { color: "#33C5FF", fontWeight: "bold", fontSize: 14 },

  // Affiliate Card
  affiliateCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", borderLeftWidth: 3, borderLeftColor: "#22c55e" },
  affiliateIcon: { fontSize: 26, marginRight: 12 },
  affiliateTextBlock: { flex: 1 },
  affiliateTitle: { color: "#22c55e", fontSize: 16, fontWeight: "bold" },
  affiliateSub: { color: "#94a3b8", fontSize: 14, marginTop: 2 },
  affiliateArrow: { color: "#22c55e", fontSize: 18, fontWeight: "bold" },

  // SP Reference
  refCard: { backgroundColor: "#1e293b", borderRadius: 12, padding: 12, marginBottom: 8 },
  refTitle: { color: "#f59e0b", fontSize: 13, fontWeight: "bold", letterSpacing: 0.5, marginBottom: 8 },
  vipBanner: { backgroundColor: "rgba(245,158,11,0.09)", borderRadius: 8, padding: 8, marginBottom: 10, borderWidth: 1, borderColor: "rgba(245,158,11,0.27)" },
  vipBannerText: { color: "#f59e0b", fontSize: 14, fontWeight: "600", textAlign: "center" },
  refItem: { flexDirection: "row", alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#0f172a" },
  refSp: { color: "#f59e0b", fontWeight: "bold", fontSize: 14, width: 44 },
  refRange: { color: "#94a3b8", fontSize: 13, flex: 1 },
  refRate: { color: "#22c55e", fontWeight: "bold", fontSize: 14, width: 52 },
  refVip: { color: "#f59e0b", fontWeight: "bold", fontSize: 14, width: 64, textAlign: "right" },

  settingsLink: { alignItems: "center", paddingVertical: 12 },
  settingsText: { color: "#64748b", fontSize: 15 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalBox: { backgroundColor: "#1e293b", borderRadius: 20, padding: 24, width: "100%", maxWidth: 400 },
  modalIcon: { fontSize: 40, textAlign: "center", marginBottom: 10 },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  modalSubtitle: { color: "#33C5FF", fontSize: 15, textAlign: "center", marginBottom: 12 },
  modalDesc: { color: "#94a3b8", fontSize: 15, lineHeight: 22, marginBottom: 14 },
  modalRecommendedRow: { backgroundColor: "rgba(245,158,11,0.09)", borderRadius: 8, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: "rgba(245,158,11,0.27)" },
  modalRecommendedLabel: { color: "#94a3b8", fontSize: 13, marginBottom: 2 },
  modalRecommendedValue: { color: "#f59e0b", fontSize: 16, fontWeight: "bold" },
  modalClose: { alignItems: "center", paddingVertical: 10, marginBottom: 8 },
  modalCloseText: { color: "#64748b", fontSize: 15 },
  modalCalcBtn: { backgroundColor: "#33C5FF", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  modalCalcBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
