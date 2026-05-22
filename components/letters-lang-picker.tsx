import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Language } from "@/lib/translations";

const LABELS: Record<Language, string> = {
  en: "EN", nl: "NL", de: "DE", fr: "FR", es: "ES", it: "IT",
  pt: "PT", ru: "RU", zh: "ZH", tl: "TL", ar: "AR", th: "TH", hi: "HI", vi: "VI",
};

interface Props {
  languages: Language[];
  selected: Language;
  onSelect: (lang: Language) => void;
}

export function LettersLangPicker({ languages, selected, onSelect }: Props) {
  return (
    <View style={S.row}>
      {languages.map((lang) => {
        const active = lang === selected;
        return (
          <TouchableOpacity
            key={lang}
            onPress={() => onSelect(lang)}
            style={[S.chip, active && S.chipActive]}
            activeOpacity={0.7}
          >
            <Text style={[S.label, active && S.labelActive]}>{LABELS[lang]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const S = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: "#f59e0b55", backgroundColor: "#0f1f38",
  },
  chipActive: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  label: { color: "#f59e0b", fontSize: 12, fontWeight: "700", letterSpacing: 0.8 },
  labelActive: { color: "#0a1628" },
});
