import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { t } from "@/lib/translations";

const CARD_ICONS = [
  require("@/assets/onboarding/rebates.png"),
  require("@/assets/onboarding/protection.png"),
  require("@/assets/onboarding/diamond.png"),
  require("@/assets/onboarding/legacy.png"),
];

const CARD_ACCENT_COLORS = ["#F59E0B", "#38BDF8", "#A78BFA", "#34D399"];

// Short one-liner shown on the card face — keyed by language
const CARD_SHORT_KEYS = [
  "onboardingCard1Short",
  "onboardingCard2Short",
  "onboardingCard3Short",
  "onboardingCard4Short",
];

// Fallback English shorts if translation key missing
const CARD_SHORT_EN = [
  "Monthly cash rebate paid directly to your account.",
  "100% Buyback Guarantee — your capital is fully protected.",
  "GIA-certified. Laser-engraved. Ethically sourced. Fully yours from day one.",
  "Your diamonds. Your legacy. Pass them to future generations.",
];

const CARD_KEYS = [
  { title: "onboardingCard1Title", desc: "onboardingCard1Desc", shortIdx: 0 },
  { title: "onboardingCard2Title", desc: "onboardingCard2Desc", shortIdx: 1 },
  { title: "onboardingCard3Title", desc: "onboardingCard3Desc", shortIdx: 2 },
  { title: "onboardingCard4Title", desc: "onboardingCard4Desc", shortIdx: 3 },
];

const LANGUAGES = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "nl", flag: "🇳🇱", label: "NL" },
  { code: "de", flag: "🇩🇪", label: "DE" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "ru", flag: "🇷🇺", label: "RU" },
  { code: "zh", flag: "🇨🇳", label: "ZH" },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { language, setLanguage } = useCalculator();
  const [tooltip, setTooltip] = useState<number | null>(null);

  const tr = (key: string) => t(language, key);

  const handleCTA = async () => {
    await AsyncStorage.setItem("onboarding_seen", "1");
    router.replace("/(tabs)");
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("onboarding_seen", "1");
    router.replace("/(tabs)");
  };

  const handleLang = (code: string) => {
    setLanguage(code as "en" | "nl" | "de" | "fr" | "es" | "ru" | "zh");
  };

  return (
    <ScreenContainer bgColor="#0a0f1e" edges={["top", "left", "right"]}>
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selector */}
        <View style={S.langRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                S.langBtn,
                language === lang.code && S.langBtnActive,
              ]}
              onPress={() => handleLang(lang.code)}
              activeOpacity={0.75}
            >
              <Text style={S.langFlag}>{lang.flag}</Text>
              <Text style={[S.langLabel, language === lang.code && S.langLabelActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Header */}
        <View style={S.header}>
          <View style={S.logoRow}>
            <Text style={S.logoEmoji}>💎</Text>
            <Text style={S.logoLabel}>Plan B</Text>
          </View>
          <Text style={S.headline}>{tr("onboardingHeadline")}</Text>
          {(() => {
            const full = tr("onboardingSubheadline");
            const hl = tr("onboardingSubheadlineHL");
            const parts = full.split(hl);
            if (parts.length < 2) return <Text style={S.subheadline}>{full}</Text>;
            return (
              <Text style={S.subheadline}>
                {parts[0]}
                <Text style={{ color: "#f59e0b", fontWeight: "bold" }}>{hl}</Text>
                {parts[1]}
              </Text>
            );
          })()}

        </View>

        {/* Benefit Cards */}
        <View style={S.cardsContainer}>
          {CARD_KEYS.map((card, idx) => {
            const shortText = tr(CARD_SHORT_KEYS[idx]) || CARD_SHORT_EN[idx];
            return (
              <TouchableOpacity
                key={idx}
                style={[S.card, { borderLeftColor: CARD_ACCENT_COLORS[idx] }]}
                onPress={() => setTooltip(tooltip === idx ? null : idx)}
                activeOpacity={0.85}
              >
                <View style={S.cardLeft}>
                  <View style={[S.iconCircle, { backgroundColor: CARD_ACCENT_COLORS[idx] + "22" }]}>
                    <Image
                      source={CARD_ICONS[idx]}
                      style={S.cardIcon}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={S.cardRight}>
                  <View style={S.cardTitleRow}>
                    <Text style={[S.cardTitle, { color: CARD_ACCENT_COLORS[idx] }]}>
                      {tr(card.title)}
                    </Text>
                    <Text style={S.infoIcon}>ⓘ</Text>
                  </View>
                  <Text style={S.cardDesc}>{shortText}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={S.ctaBtn} onPress={handleCTA} activeOpacity={0.85}>
          <Text style={S.ctaText}>{tr("onboardingCTA")}</Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity style={S.skipBtn} onPress={handleSkip}>
          <Text style={S.skipText}>{tr("onboardingSkip")}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tooltip Modal */}
      <Modal
        visible={tooltip !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltip(null)}
      >
        <Pressable style={S.modalOverlay} onPress={() => setTooltip(null)}>
          <View style={S.tooltipBox}>
            {tooltip !== null && (
              <>
                <Text style={[S.tooltipTitle, { color: CARD_ACCENT_COLORS[tooltip] }]}>
                  {tr(CARD_KEYS[tooltip].title)}
                </Text>
                <Text style={S.tooltipDesc}>{tr(CARD_KEYS[tooltip].desc)}</Text>
                <TouchableOpacity style={S.tooltipClose} onPress={() => setTooltip(null)}>
                  <Text style={S.tooltipCloseText}>✕ Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#0a0f1e",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  langRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 16,
    paddingBottom: 8,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#131c30",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  langBtnActive: {
    backgroundColor: "#0c4a6e",
    borderColor: "#38bdf8",
  },
  langFlag: {
    fontSize: 14,
  },
  langLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#64748b",
  },
  langLabelActive: {
    color: "#38bdf8",
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  logoText: {
    fontSize: 28,
    color: "#33C5FF",
  },
  logoEmoji: {
    fontSize: 36,
  },
  logoLabel: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 2,
  },
  headline: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 32,
  },
  subheadline: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 10,
  },
  subheadline2: {
    fontSize: 15,
    color: "#CBD5E1",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "bold",
  },
  cardsContainer: {
    gap: 14,
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#131c30",
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  cardLeft: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIcon: {
    width: 38,
    height: 38,
  },
  cardRight: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    lineHeight: 22,
  },
  infoIcon: {
    fontSize: 18,
    color: "#475569",
    marginLeft: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 20,
  },
  ctaBtn: {
    backgroundColor: "#38BDF8",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0a0f1e",
    letterSpacing: 0.3,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
  },
  skipText: {
    fontSize: 15,
    color: "#475569",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  tooltipBox: {
    backgroundColor: "#131c30",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 24,
  },
  tooltipDesc: {
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 22,
    marginBottom: 20,
  },
  tooltipClose: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 8,
  },
  tooltipCloseText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "bold",
  },
});
