/**
 * LANGUAGE SELECTOR — Bottom Nav Globe Icon
 * Allows instant language switching from anywhere in the app.
 */
import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { t, Language } from "@/lib/translations";

const LANGUAGES: { code: Language; label: string; flag: string; native: string }[] = [
  { code: "en", label: "English",    flag: "🇬🇧", native: "English"    },
  { code: "nl", label: "Dutch",      flag: "🇳🇱", native: "Nederlands" },
  { code: "de", label: "German",     flag: "🇩🇪", native: "Deutsch"    },
  { code: "fr", label: "French",     flag: "🇫🇷", native: "Français"   },
  { code: "es", label: "Spanish",    flag: "🇪🇸", native: "Español"    },
  { code: "ru", label: "Russian",    flag: "🇷🇺", native: "Русский"    },
  { code: "zh", label: "Chinese",    flag: "🇨🇳", native: "中文"        },
  { code: "tl", label: "Filipino",   flag: "🇵🇭", native: "Filipino"   },
  { code: "pt", label: "Portuguese", flag: "🇵🇹", native: "Português"  },
  { code: "ar", label: "Arabic",     flag: "🇸🇦", native: "العربية"    },
  { code: "th", label: "Thai",       flag: "🇹🇭", native: "ภาษาไทย"    },
  { code: "hi", label: "Hindi",      flag: "🇮🇳", native: "हिंदी"      },
  { code: "vi", label: "Vietnamese", flag: "🇻🇳", native: "Tiếng Việt" },
];

export default function LanguageScreen() {
  const { language, setLanguage } = useCalculator();

  const handleSelect = async (code: Language) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    await setLanguage(code);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor="#0d1a2a">
      <ScrollView style={S.scroll} contentContainerStyle={S.content}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerIcon}>🌐</Text>
          <View>
            <Text style={S.headerTitle}>LANGUAGE / TAAL / SPRACHE</Text>
            <Text style={S.headerSub}>Select your language · Kies uw taal · Wählen Sie Ihre Sprache</Text>
          </View>
        </View>

        {/* Active language indicator */}
        <View style={S.activeCard}>
          <Text style={S.activeLabel}>Currently Active</Text>
          <Text style={S.activeValue}>
            {LANGUAGES.find(l => l.code === language)?.flag}{" "}
            {LANGUAGES.find(l => l.code === language)?.native}
          </Text>
        </View>

        {/* Language grid */}
        <View style={S.grid}>
          {LANGUAGES.map(lang => {
            const isActive = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[S.langCard, isActive && S.langCardActive]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.75}
              >
                <Text style={S.langFlag}>{lang.flag}</Text>
                <Text style={[S.langNative, isActive && S.langNativeActive]}>
                  {lang.native}
                </Text>
                <Text style={S.langEnglish}>{lang.label}</Text>
                {isActive && (
                  <View style={S.checkBadge}>
                    <Text style={S.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info note */}
        <View style={S.infoBox}>
          <Text style={S.infoText}>
            💎 Your language preference is saved automatically and applies across the entire app — including the Strategy calculator, Adviser tools, and PDF exports.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  scroll:   { flex: 1, backgroundColor: "#0d1a2a" },
  content:  { padding: 16 },

  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginBottom: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: "#1a3550",
  },
  headerIcon:  { fontSize: 36 },
  headerTitle: { color: "#e67e22", fontSize: 15, fontWeight: "bold", letterSpacing: 1 },
  headerSub:   { color: "#64748b", fontSize: 11, marginTop: 3, lineHeight: 16 },

  activeCard: {
    backgroundColor: "#0f2035", borderRadius: 10, padding: 14,
    marginBottom: 18, borderLeftWidth: 3, borderLeftColor: "#33C5FF",
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  activeLabel: { color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  activeValue: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  grid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 10, marginBottom: 18,
  },
  langCard: {
    width: "30%", flexGrow: 1,
    backgroundColor: "#0f2035", borderRadius: 12,
    padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: "#1a3550",
    position: "relative",
  },
  langCardActive: {
    borderColor: "#e67e22", borderWidth: 2,
    backgroundColor: "rgba(230,126,34,0.08)",
  },
  langFlag:        { fontSize: 28, marginBottom: 6 },
  langNative:      { color: "#94a3b8", fontSize: 14, fontWeight: "bold", textAlign: "center" },
  langNativeActive:{ color: "#e67e22" },
  langEnglish:     { color: "#64748b", fontSize: 10, marginTop: 3, textAlign: "center" },
  checkBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "#e67e22", borderRadius: 10,
    width: 18, height: 18, alignItems: "center", justifyContent: "center",
  },
  checkText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

  infoBox: {
    backgroundColor: "#0f2035", borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: "#1a3550",
  },
  infoText: { color: "#64748b", fontSize: 12, lineHeight: 20 },
});
