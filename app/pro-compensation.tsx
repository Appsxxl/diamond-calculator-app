import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { t, type Language } from "@/lib/translations";

// ─── Rank data ────────────────────────────────────────────────────────────────
interface Rank {
  key: string;
  pct: number;       // Infinity bonus %
  poolShares: number; // World Pools shares (0 = not eligible)
}

const RANKS: Rank[] = [
  { key: "proCompRankNone",        pct: 0,    poolShares: 0 },
  { key: "proCompRankSapphire",    pct: 0.03, poolShares: 0 },
  { key: "proCompRankEmerald",     pct: 0.06, poolShares: 0 },
  { key: "proCompRankDiamond",     pct: 0.09, poolShares: 0 },
  { key: "proCompRankBlueDiamond", pct: 0.12, poolShares: 1 },
  { key: "proCompRankGreenDiamond",pct: 0.15, poolShares: 2 },
  { key: "proCompRankPurpleDiamond",pct:0.18, poolShares: 3 },
  { key: "proCompRankElite",       pct: 0.21, poolShares: 4 },
  { key: "proCompRankDoubleElite", pct: 0.22, poolShares: 5 },
  { key: "proCompRankTripleElite", pct: 0.23, poolShares: 6 },
  { key: "proCompRankBlack",       pct: 0.24, poolShares: 7 },
];

const ACTIVITY_OPTIONS = [
  { key: "proCompActivity40", value: 0.40 },
  { key: "proCompActivity60", value: 0.60 },
  { key: "proCompActivity75", value: 0.75 },
  { key: "proCompActivity90", value: 0.90 },
];

const YEAR_OPTIONS = [
  { key: "proCompYears1", value: 1 },
  { key: "proCompYears2", value: 2 },
  { key: "proCompYears3", value: 3 },
  { key: "proCompYears5", value: 5 },
];

const AVG_PRESETS = [110, 150, 250, 400, 750, 1200];

function fmtCurrency(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

// ─── Selector row ─────────────────────────────────────────────────────────────
function SelectorRow<T extends { key: string; value: T["value"] }>({
  options,
  selected,
  onSelect,
  language,
  renderLabel,
}: {
  options: T[];
  selected: T["value"];
  onSelect: (v: T["value"]) => void;
  language: string;
  renderLabel?: (opt: T) => string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.selectorScroll}>
      <View style={S.selectorRow}>
        {options.map((opt) => {
          const isActive = opt.value === selected;
          const label = renderLabel ? renderLabel(opt) : t(language as Language, opt.key);
          return (
            <Pressable
              key={opt.key}
              onPress={() => onSelect(opt.value)}
              style={[S.selectorChip, isActive && S.selectorChipActive]}
            >
              <Text style={[S.selectorChipText, isActive && S.selectorChipTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────
function ResultRow({ label, value, valueColor = "#22c55e", isTotal = false }: {
  label: string;
  value: string;
  valueColor?: string;
  isTotal?: boolean;
}) {
  return (
    <View style={[S.resultRow, isTotal && S.resultRowTotal]}>
      <Text style={[S.resultLabel, isTotal && S.resultLabelTotal]}>{label}</Text>
      <Text style={[S.resultValue, { color: valueColor }, isTotal && S.resultValueTotal]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProCompensationScreen() {
  const { language } = useCalculator();
  const lang = language as Language;

  // Inputs
  const [rankIdx, setRankIdx] = useState(0);
  const [teamSize, setTeamSize] = useState("100");
  const [avgValue, setAvgValue] = useState("110");
  const [activityRate, setActivityRate] = useState(0.60);
  const [poolShareValue, setPoolShareValue] = useState("");

  // Growth projection
  const [growthRate, setGrowthRate] = useState("5");
  const [projYears, setProjYears] = useState(1);
  const [projResult, setProjResult] = useState<{ low: number; high: number } | null>(null);

  const rank = RANKS[rankIdx];
  const teamNum = Math.max(0, parseInt(teamSize) || 0);
  const avgNum = Math.max(110, parseFloat(avgValue) || 110);
  const poolShareNum = Math.max(0, parseFloat(poolShareValue) || 0);

  // ── Calculations ──────────────────────────────────────────────────────────
  const active = Math.round(teamNum * activityRate);
  const volume = active * avgNum;

  const unilevel = volume * 0.20 * 0.18;
  const infinity = volume * rank.pct;
  const matchLow = volume * 0.30 * 0.05;
  const matchHigh = volume * 0.60 * 0.05;
  const poolsTotal = rank.poolShares * poolShareNum;

  const totalLow = unilevel + infinity + matchLow + poolsTotal;
  const totalHigh = unilevel + infinity + matchHigh + poolsTotal;

  const calculateProjection = useCallback(() => {
    const rate = (parseFloat(growthRate) || 0) / 100;
    const months = projYears * 12;
    const factor = Math.pow(1 + rate, months);
    setProjResult({
      low: Math.round(totalLow * factor),
      high: Math.round(totalHigh * factor),
    });
  }, [growthRate, projYears, totalLow, totalHigh]);

  return (
    <ScreenContainer bgColor="#0f172a">
      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn} hitSlop={12}>
            <Text style={S.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={S.title}>{t(language, "proCompTitle")}</Text>
          <Text style={S.subtitle}>{t(language, "proCompSubtitle")}</Text>
        </View>

        {/* ── Rank ── */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language, "proCompRank")}</Text>
          <SelectorRow
            options={RANKS.map((r, i) => ({ key: r.key, value: i }))}
            selected={rankIdx}
            onSelect={(v) => setRankIdx(v as number)}
            language={language}
          />
          {rank.poolShares > 0 && (
            <View style={S.rankBadge}>
              <Text style={S.rankBadgeText}>
                🌊 {t(language, "proCompWorldPoolsShares")}: {rank.poolShares}
              </Text>
            </View>
          )}
        </View>

        {/* ── Team Size ── */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language, "proCompTeam")}</Text>
          <TextInput
            style={S.input}
            value={teamSize}
            onChangeText={setTeamSize}
            keyboardType="numeric"
            returnKeyType="done"
            placeholderTextColor="#475569"
            placeholder="100"
          />
          <Text style={S.hint}>Active: {active.toLocaleString()} members</Text>
        </View>

        {/* ── Avg Monthly Value ── */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language, "proCompAvg")}</Text>
          <TextInput
            style={S.input}
            value={avgValue}
            onChangeText={(v) => {
              setAvgValue(v);
            }}
            onBlur={() => {
              const n = parseFloat(avgValue) || 0;
              if (n < 110) setAvgValue("110");
            }}
            keyboardType="numeric"
            returnKeyType="done"
            placeholderTextColor="#475569"
            placeholder="110"
          />
          <Text style={S.hint}>{t(language, "proCompAvgMin")}</Text>
          {/* Quick presets */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={S.selectorRow}>
              {AVG_PRESETS.map((p) => {
                const isActive = parseFloat(avgValue) === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setAvgValue(String(p))}
                    style={[S.selectorChip, isActive && S.selectorChipActive]}
                  >
                    <Text style={[S.selectorChipText, isActive && S.selectorChipTextActive]}>
                      ${p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ── Activity Rate ── */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language, "proCompActivity")}</Text>
          <SelectorRow
            options={ACTIVITY_OPTIONS}
            selected={activityRate}
            onSelect={(v) => setActivityRate(v as number)}
            language={language}
          />
        </View>

        {/* ── World Pools (Blue Diamond+) ── */}
        {rank.poolShares > 0 && (
          <View style={S.card}>
            <Text style={S.sectionLabel}>{t(language, "proCompWorldPools")}</Text>
            <TextInput
              style={S.input}
              value={poolShareValue}
              onChangeText={setPoolShareValue}
              keyboardType="numeric"
              returnKeyType="done"
              placeholderTextColor="#475569"
              placeholder="0"
            />
            <Text style={S.hint}>{t(language, "proCompWorldPoolsHint")}</Text>
            <Text style={S.hint}>
              {rank.poolShares} share{rank.poolShares > 1 ? "s" : ""} × {fmtCurrency(poolShareNum)} = {fmtCurrency(poolsTotal)}
            </Text>
          </View>
        )}

        {/* ── Results ── */}
        <View style={S.resultsCard}>
          <Text style={S.resultsSectionTitle}>{t(language, "proCompResults")}</Text>

          <ResultRow
            label={t(language, "proCompVolume")}
            value={fmtCurrency(volume)}
            valueColor="#94a3b8"
          />
          <View style={S.divider} />
          <ResultRow
            label={t(language, "proCompUnilevel")}
            value={fmtCurrency(unilevel)}
          />
          <ResultRow
            label={t(language, "proCompInfinity")}
            value={fmtCurrency(infinity)}
          />
          <ResultRow
            label={t(language, "proCompMatching")}
            value={`${fmtCurrency(matchLow)} – ${fmtCurrency(matchHigh)}`}
          />
          {rank.poolShares > 0 && (
            <ResultRow
              label={t(language, "proCompPools")}
              value={fmtCurrency(poolsTotal)}
              valueColor="#38bdf8"
            />
          )}
          <View style={S.divider} />
          <ResultRow
            label={t(language, "proCompTotal")}
            value={`${fmtCurrency(totalLow)} – ${fmtCurrency(totalHigh)}`}
            valueColor="#f59e0b"
            isTotal
          />
        </View>

        {/* ── Growth Projection ── */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language, "proCompGrowth")}</Text>

          <Text style={S.inputLabel}>{t(language, "proCompGrowthRate")}</Text>
          <TextInput
            style={S.input}
            value={growthRate}
            onChangeText={setGrowthRate}
            keyboardType="numeric"
            returnKeyType="done"
            placeholderTextColor="#475569"
            placeholder="5"
          />

          <Text style={[S.inputLabel, { marginTop: 12 }]}>{t(language, "proCompGrowthYears")}</Text>
          <SelectorRow
            options={YEAR_OPTIONS}
            selected={projYears}
            onSelect={(v) => { setProjYears(v as number); setProjResult(null); }}
            language={language}
          />

          <TouchableOpacity style={S.calcBtn} onPress={calculateProjection}>
            <Text style={S.calcBtnText}>{t(language, "proCompGrowthCalc")}</Text>
          </TouchableOpacity>

          {projResult && (
            <View style={S.projResult}>
              <Text style={S.projResultLabel}>{t(language, "proCompGrowthResult")}</Text>
              <Text style={S.projResultValue}>
                {fmtCurrency(projResult.low)} – {fmtCurrency(projResult.high)} / month
              </Text>
            </View>
          )}

          <Text style={S.growthNote}>{t(language, "proCompGrowthNote")}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  scroll: { padding: 16 },

  header: { alignItems: "center", marginBottom: 20 },
  backBtn: { alignSelf: "flex-start", marginBottom: 12 },
  backText: { color: "#38bdf8", fontSize: 17, fontWeight: "bold", includeFontPadding: false },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", textAlign: "center", includeFontPadding: false },
  subtitle: { color: "#94a3b8", fontSize: 15, textAlign: "center", marginTop: 4, includeFontPadding: false },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
    includeFontPadding: false,
  },
  inputLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    includeFontPadding: false,
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
    includeFontPadding: false,
  },
  hint: {
    color: "#475569",
    fontSize: 14,
    marginTop: 4,
    includeFontPadding: false,
  },

  selectorScroll: { marginTop: 2 },
  selectorRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  selectorChip: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  selectorChipActive: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  selectorChipText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
  },
  selectorChipTextActive: {
    color: "#fff",
  },

  rankBadge: {
    backgroundColor: "rgba(14,165,233,0.12)",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.3)",
  },
  rankBadgeText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "bold",
    includeFontPadding: false,
  },

  resultsCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#22c55e44",
  },
  resultsSectionTitle: {
    color: "#22c55e",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 12,
    includeFontPadding: false,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  resultRowTotal: {
    paddingTop: 10,
  },
  resultLabel: {
    color: "#94a3b8",
    fontSize: 15,
    flex: 1,
    includeFontPadding: false,
  },
  resultLabelTotal: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultValue: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
    includeFontPadding: false,
  },
  resultValueTotal: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 6,
  },

  calcBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 14,
  },
  calcBtnText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "bold",
    includeFontPadding: false,
  },

  projResult: {
    backgroundColor: "rgba(245,158,11,0.1)",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    alignItems: "center",
  },
  projResultLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "bold",
    includeFontPadding: false,
  },
  projResultValue: {
    color: "#f59e0b",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
    includeFontPadding: false,
  },

  growthNote: {
    color: "#475569",
    fontSize: 14,
    marginTop: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
});
