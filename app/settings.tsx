import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { t } from "@/lib/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import type { OfficeLocation } from "@/lib/calculator-context";

const OFFICES: { id: OfficeLocation; label: string; city: string; reg: string }[] = [
  { id: "dubai", label: "🇦🇪 Dubai, UAE", city: "Dubai Freezone", reg: "DMCC-1007195 · SIRA Certified" },
  { id: "vienna", label: "🇦🇹 Vienna, Austria", city: "Vienna", reg: "EU Operations" },
  { id: "manila", label: "🇵🇭 Manila, Philippines", city: "Manila", reg: "SEC 2026030241228-02" },
  { id: "florida", label: "🇺🇸 Florida, USA", city: "Florida", reg: "US Operations" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, clearCalculation, partnerMode, enablePartnerMode, disablePartnerMode, officeLocation, setOfficeLocation } = useCalculator();

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const languages = [
    { code: "en" as const, label: "EN" },
    { code: "nl" as const, label: "NL" },
    { code: "de" as const, label: "DE" },
    { code: "fr" as const, label: "FR" },
    { code: "es" as const, label: "ES" },
    { code: "ru" as const, label: "RU" },
    { code: "zh" as const, label: "中文" },
  ];

  const helpArticles = [
    { id: "1", titleKey: "helpArticle1Title", icon: "📖" },
    { id: "2", titleKey: "helpArticle2Title", icon: "🧠" },
    { id: "3", titleKey: "helpArticle3Title", icon: "📊" },
    { id: "4", titleKey: "helpArticle4Title", icon: "⚠️" },
  ];

  const handleLanguageChange = async (lang: typeof language) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await setLanguage(lang);
  };

  const handleClearHistory = async () => {
    const doDelete = async () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      try {
        await AsyncStorage.removeItem("calculator_history");
        clearCalculation();
      } catch (err) {
        console.error("Failed to clear history:", err);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(t(language, "clearHistoryConfirm"))) {
        await doDelete();
      }
    } else {
      Alert.alert(
        t(language, "clearHistory"),
        t(language, "clearHistoryConfirm"),
        [
          { text: t(language, "cancel"), style: "cancel" },
          { text: t(language, "delete"), style: "destructive", onPress: doDelete },
        ]
      );
    }
  };

  const handlePartnerToggle = () => {
    if (partnerMode) {
      // Disable partner mode
      if (Platform.OS === "web") {
        if (window.confirm("Disable Partner Mode? The Partner and Affiliate tabs will be hidden.")) {
          disablePartnerMode();
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        Alert.alert(
          "Disable Partner Mode",
          "The Partner and Affiliate tabs will be hidden.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Disable",
              style: "destructive",
              onPress: () => {
                disablePartnerMode();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              },
            },
          ]
        );
      }
    } else {
      // Show PIN modal to enable
      setPinInput("");
      setPinError(false);
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = () => {
    const success = enablePartnerMode(pinInput);
    if (success) {
      setShowPinModal(false);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setPinError(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const sectionTitle = (label: string) => (
    <Text style={S.sectionTitle}>{label}</Text>
  );

  return (
    <ScreenContainer bgColor="#0f172a">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={S.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginRight: 12 }]}
          >
            <Text style={S.backArrow}>←</Text>
          </Pressable>
          <Text style={S.headerTitle}>{t(language, "settings")}</Text>
        </View>

        {/* Language Section */}
        <View style={S.section}>
          {sectionTitle(t(language, "language"))}
          <View style={S.card}>
            {languages.map((lang, index) => (
              <Pressable
                key={lang.code}
                onPress={() => handleLanguageChange(lang.code)}
                style={({ pressed }) => [
                  S.listRow,
                  index < languages.length - 1 && S.listRowBorder,
                  pressed && S.listRowPressed,
                  language === lang.code && S.listRowActive,
                ]}
              >
                <Text style={[S.listLabel, language === lang.code && S.listLabelActive]}>
                  {lang.label}
                </Text>
                {language === lang.code && (
                  <Text style={S.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Office Location Section */}
        <View style={S.section}>
          {sectionTitle("🏢 OFFICE LOCATION")}
          <Text style={S.sectionDesc}>Selected office appears in PDF exports and compliance documents.</Text>
          <View style={S.card}>
            {OFFICES.map((office, index) => (
              <Pressable
                key={office.id}
                onPress={async () => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  await setOfficeLocation(office.id);
                }}
                style={({ pressed }) => [
                  S.listRow,
                  index < OFFICES.length - 1 && S.listRowBorder,
                  pressed && S.listRowPressed,
                  officeLocation === office.id && S.listRowActive,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[S.listLabel, officeLocation === office.id && S.listLabelActive]}>
                    {office.label}
                  </Text>
                  <Text style={S.listSub}>{office.reg}</Text>
                </View>
                {officeLocation === office.id && (
                  <Text style={S.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Partner Mode Section */}
        <View style={S.section}>
          {sectionTitle("🔐 PARTNER MODE")}
          <View style={S.card}>
            <View style={S.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={[S.listLabel, partnerMode && { color: "#f59e0b" }]}>
                  {partnerMode ? "🟢 Partner Mode Active" : "⚪ Partner Mode Off"}
                </Text>
                <Text style={S.listSub}>
                  {partnerMode
                    ? "Affiliate & Partner Tools tabs are visible"
                    : "Enter PIN to unlock Affiliate & Partner Tools"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handlePartnerToggle}
                style={[S.toggleBtn, partnerMode && S.toggleBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[S.toggleBtnText, partnerMode && S.toggleBtnTextActive]}>
                  {partnerMode ? "Disable" : "Enable"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={S.section}>
          {sectionTitle(t(language, "about"))}
          <View style={S.card}>
            <View style={S.aboutRow}>
              <Text style={S.aboutLabel}>{t(language, "appNameLabel")}</Text>
              <Text style={S.aboutValue}>Plan B</Text>
            </View>
            <View style={[S.aboutRow, S.listRowBorder]}>
              <Text style={S.aboutLabel}>{t(language, "versionLabel")}</Text>
              <Text style={S.aboutValue}>1.0.0</Text>
            </View>
            <View style={S.aboutRow}>
              <Text style={S.aboutLabel}>{t(language, "descriptionLabel")}</Text>
              <Text style={[S.aboutValue, { flex: 1 }]}>{t(language, "appDescription")}</Text>
            </View>
          </View>
        </View>

        {/* Help / Manual Section */}
        <View style={S.section}>
          {sectionTitle(t(language, "help"))}
          <View style={S.articleList}>
            {helpArticles.map((article, index) => (
              <TouchableOpacity
                key={article.id}
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: "/help-article", params: { id: article.id } })}
                style={[
                  S.articleRow,
                  index < helpArticles.length - 1 && S.articleRowBorder,
                  article.id === "4" && S.articleRowDisclaimer,
                ]}
              >
                <Text style={S.articleIcon}>{article.icon}</Text>
                <Text style={[S.articleTitle, article.id === "4" && S.articleTitleRed]}>
                  {t(language, article.titleKey)}
                </Text>
                <Text style={S.articleChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* FAQ Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: "/faq" })}
            style={[S.articleRow, { marginTop: 8, borderTopWidth: 0.5, borderTopColor: "#1e293b" }]}
          >
            <Text style={S.articleIcon}>❓</Text>
            <Text style={S.articleTitle}>FAQ — Frequently Asked Questions</Text>
            <Text style={S.articleChevron}>›</Text>
          </TouchableOpacity>
          {/* View Onboarding — always available, opens live URL */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              if (typeof window !== "undefined") {
                // Web: navigate directly within app
                window.location.href = "https://diamond-calculator-plan-b.pages.dev/onboarding";
              } else {
                // Native: open in browser or navigate in app
                try {
                  await Linking.openURL("https://diamond-calculator-plan-b.pages.dev/onboarding");
                } catch {
                  await AsyncStorage.removeItem("onboarding_seen");
                  router.replace({ pathname: "/onboarding" });
                }
              }
            }}
            style={[S.articleRow, { marginTop: 8, borderTopWidth: 0.5, borderTopColor: "#1e293b" }]}
          >
            <Text style={S.articleIcon}>💎</Text>
            <Text style={S.articleTitle}>{t(language, "viewOnboarding") || "View Introduction"}</Text>
            <Text style={S.articleChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={S.section}>
          {sectionTitle(t(language, "dataManagement"))}
          <TouchableOpacity
            onPress={handleClearHistory}
            activeOpacity={0.8}
            style={S.dangerBtn}
          >
            <Text style={S.dangerBtnText}>{t(language, "clearHistory")}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={S.modalOverlay}>
          <View style={S.modalBox}>
            <Text style={S.modalTitle}>🔐 Enter Partner PIN</Text>
            <Text style={S.modalDesc}>Enter your 4-digit PIN to unlock Partner Mode.</Text>
            <TextInput
              style={[S.pinInput, pinError && S.pinInputError]}
              value={pinInput}
              onChangeText={(v) => { setPinInput(v); setPinError(false); }}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              placeholder="• • • •"
              placeholderTextColor="#64748b"
              returnKeyType="done"
              onSubmitEditing={handlePinSubmit}
              autoFocus
            />
            {pinError && <Text style={S.pinErrorText}>Incorrect PIN. Please try again.</Text>}
            <View style={S.modalBtnRow}>
              <TouchableOpacity
                style={S.modalCancelBtn}
                onPress={() => setShowPinModal(false)}
                activeOpacity={0.8}
              >
                <Text style={S.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={S.modalConfirmBtn}
                onPress={handlePinSubmit}
                activeOpacity={0.8}
              >
                <Text style={S.modalConfirmText}>Unlock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const S = {
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backArrow: { fontSize: 22, color: "#e2e8f0" },
  headerTitle: { fontSize: 22, fontWeight: "700" as const, color: "#e2e8f0", flex: 1 },
  section: { paddingHorizontal: 24, paddingTop: 28 },
  sectionTitle: { fontSize: 13, fontWeight: "700" as const, color: "#64748b", letterSpacing: 1, marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: "#64748b", marginBottom: 10, lineHeight: 20 },
  card: { backgroundColor: "#1e293b", borderRadius: 14, borderWidth: 1, borderColor: "#334155", overflow: "hidden" as const },
  listRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: "#334155" },
  listRowPressed: { backgroundColor: "rgba(245,158,11,0.08)" },
  listRowActive: { backgroundColor: "rgba(245,158,11,0.06)" },
  listLabel: { fontSize: 17, fontWeight: "400" as const, color: "#e2e8f0" },
  listLabelActive: { fontWeight: "700" as const, color: "#f59e0b" },
  listSub: { fontSize: 13, color: "#64748b", marginTop: 2 },
  checkmark: { fontSize: 16, color: "#f59e0b" },
  toggleBtn: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  toggleBtnActive: { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "#ef4444" },
  toggleBtnText: { fontSize: 14, fontWeight: "bold" as const, color: "#94a3b8" },
  toggleBtnTextActive: { color: "#f87171" },
  aboutRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  aboutLabel: { fontSize: 14, color: "#64748b" },
  aboutValue: { fontSize: 16, fontWeight: "600" as const, color: "#e2e8f0" },
  articleList: { backgroundColor: "#1e293b", borderRadius: 14, borderWidth: 1, borderColor: "#334155", overflow: "hidden" as const },
  articleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: "transparent",
  },
  articleRowBorder: { borderBottomWidth: 1, borderBottomColor: "#334155" },
  articleRowDisclaimer: { backgroundColor: "rgba(239,68,68,0.06)" },
  articleIcon: { fontSize: 20, width: 28 },
  articleTitle: { fontSize: 16, fontWeight: "500" as const, color: "#e2e8f0", flex: 1 },
  articleTitleRed: { color: "#f87171", fontWeight: "600" as const },
  articleChevron: { fontSize: 18, color: "#64748b" },
  dangerBtn: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  dangerBtnText: { color: "#f87171", fontWeight: "bold" as const, fontSize: 17 },
  // PIN Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 24,
  },
  modalBox: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    width: "100%" as const,
    maxWidth: 360,
    gap: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" as const, color: "#e2e8f0", textAlign: "center" as const },
  modalDesc: { fontSize: 15, color: "#94a3b8", textAlign: "center" as const, lineHeight: 22 },
  pinInput: {
    backgroundColor: "#0f172a",
    borderWidth: 2,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 28,
    color: "#e2e8f0",
    textAlign: "center" as const,
    letterSpacing: 12,
  },
  pinInputError: { borderColor: "#ef4444" },
  pinErrorText: { fontSize: 14, color: "#f87171", textAlign: "center" as const },
  modalBtnRow: { flexDirection: "row" as const, gap: 12, marginTop: 4 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalCancelText: { color: "#94a3b8", fontWeight: "bold" as const, fontSize: 16 },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  modalConfirmText: { color: "#0f172a", fontWeight: "bold" as const, fontSize: 16 },
};
