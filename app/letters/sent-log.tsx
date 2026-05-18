import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";

const NAVY = "#0a1628";
const GOLD = "#e67e22";
const GREEN = "#22c55e";
const BLUE = "#33C5FF";
const CARD_BG = "#0f1f38";
const FONT = "ArialRoundedMTBold";
const STORAGE_KEY = "sent_log";

interface SentEntry {
  id: string;
  letterTitle: string;
  letterType: string;
  recipientName: string;
  recipientWhatsapp: string;
  sentAt: string;
  followUpDate: string;
  followUpDone: boolean;
  outcome: "pending" | "responded" | "meeting" | "converted" | "no_response";
  notes: string;
}

type OutcomeType = SentEntry["outcome"];
type FilterType = "all" | OutcomeType;

const OUTCOME_COLORS: Record<OutcomeType, string> = {
  pending: "#64748b",
  responded: BLUE,
  meeting: "#f97316",
  converted: GREEN,
  no_response: "#ef4444",
};

const OUTCOME_LABELS: Record<OutcomeType, string> = {
  pending: "Pending",
  responded: "Responded",
  meeting: "Meeting",
  converted: "Converted",
  no_response: "No Response",
};

const OUTCOME_CYCLE: OutcomeType[] = ["pending", "responded", "meeting", "converted", "no_response"];

const LETTER_TYPES = ["Customer", "Advisor", "Real Estate", "HNW", "Personal"];

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function todayDMY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function dmyToISO(dmy: string): string {
  const parts = dmy.split("/");
  if (parts.length !== 3) return "";
  const [dd, mm, yyyy] = parts;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
}

function isoToDMY(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return "";
  }
}

function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function isOverdue(iso: string): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

function isSameMonth(iso: string, now: Date): boolean {
  try {
    const d = new Date(iso);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  } catch {
    return false;
  }
}

export default function SentLogScreen() {
  const router = useRouter();
  const { language } = useCalculator();

  const [entries, setEntries] = useState<SentEntry[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [activeEntry, setActiveEntry] = useState<SentEntry | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);

  const [editLetterTitle, setEditLetterTitle] = useState("");
  const [editLetterType, setEditLetterType] = useState("Customer");
  const [editRecipientName, setEditRecipientName] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editSentDate, setEditSentDate] = useState(todayDMY());
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  };

  const saveEntries = async (updated: SentEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setEntries(updated);
    } catch {}
  };

  const openLog = () => {
    setActiveEntry(null);
    setEditLetterTitle("");
    setEditLetterType("Customer");
    setEditRecipientName("");
    setEditWhatsapp("");
    setEditSentDate(todayDMY());
    setEditFollowUpDate("");
    setEditNotes("");
    setLogModalVisible(true);
  };

  const openEdit = (entry: SentEntry) => {
    setActiveEntry(entry);
    setEditLetterTitle(entry.letterTitle);
    setEditLetterType(entry.letterType);
    setEditRecipientName(entry.recipientName);
    setEditWhatsapp(entry.recipientWhatsapp);
    setEditSentDate(isoToDMY(entry.sentAt) || todayDMY());
    setEditFollowUpDate(isoToDMY(entry.followUpDate));
    setEditNotes(entry.notes);
    setLogModalVisible(true);
  };

  const handleSave = async () => {
    if (!editLetterTitle.trim()) {
      Alert.alert("Required", "Please enter a letter title.");
      return;
    }
    if (!editRecipientName.trim()) {
      Alert.alert("Required", "Please enter a recipient name.");
      return;
    }
    const sentISO = dmyToISO(editSentDate) || new Date().toISOString();
    const followISO = editFollowUpDate.trim() ? dmyToISO(editFollowUpDate) : "";

    if (activeEntry) {
      const updated = entries.map((e) =>
        e.id === activeEntry.id
          ? {
              ...e,
              letterTitle: editLetterTitle.trim(),
              letterType: editLetterType,
              recipientName: editRecipientName.trim(),
              recipientWhatsapp: editWhatsapp.trim(),
              sentAt: sentISO,
              followUpDate: followISO,
              notes: editNotes.trim(),
            }
          : e
      );
      await saveEntries(updated);
    } else {
      const newEntry: SentEntry = {
        id: generateId(),
        letterTitle: editLetterTitle.trim(),
        letterType: editLetterType,
        recipientName: editRecipientName.trim(),
        recipientWhatsapp: editWhatsapp.trim(),
        sentAt: sentISO,
        followUpDate: followISO,
        followUpDone: false,
        outcome: "pending",
        notes: editNotes.trim(),
      };
      await saveEntries([newEntry, ...entries]);
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogModalVisible(false);
  };

  const handleDelete = (entry: SentEntry) => {
    Alert.alert("Delete Entry", `Delete log for "${entry.recipientName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await saveEntries(entries.filter((e) => e.id !== entry.id));
        },
      },
    ]);
  };

  const cycleOutcome = async (entry: SentEntry) => {
    const idx = OUTCOME_CYCLE.indexOf(entry.outcome);
    const next = OUTCOME_CYCLE[(idx + 1) % OUTCOME_CYCLE.length];
    const updated = entries.map((e) => e.id === entry.id ? { ...e, outcome: next } : e);
    await saveEntries(updated);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const markFollowUpDone = async (entry: SentEntry) => {
    const updated = entries.map((e) => e.id === entry.id ? { ...e, followUpDone: true } : e);
    await saveEntries(updated);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const now = new Date();

  const stats = useMemo(() => {
    const total = entries.length;
    const thisMonth = entries.filter((e) => isSameMonth(e.sentAt, now)).length;
    const followUpsDue = entries.filter(
      (e) => e.followUpDate && !e.followUpDone && isOverdue(e.followUpDate)
    ).length;
    const converted = entries.filter((e) => e.outcome === "converted").length;
    return { total, thisMonth, followUpsDue, converted };
  }, [entries]);

  const overdueEntries = useMemo(
    () => entries.filter((e) => e.followUpDate && !e.followUpDone && isOverdue(e.followUpDate)),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    const base = filter === "all" ? entries : entries.filter((e) => e.outcome === filter);
    return [...base].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [entries, filter]);

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "responded", label: "Responded" },
    { key: "meeting", label: "Meeting" },
    { key: "converted", label: "Converted" },
  ];

  const renderEntry = (entry: SentEntry) => {
    const notesExpanded = expandedNotes.includes(entry.id);
    const outcomeColor = OUTCOME_COLORS[entry.outcome];
    const hasFollowUp = !!entry.followUpDate;
    const fuOverdue = hasFollowUp && !entry.followUpDone && isOverdue(entry.followUpDate);
    const fuUpcoming = hasFollowUp && !entry.followUpDone && !isOverdue(entry.followUpDate);
    const fuDone = hasFollowUp && entry.followUpDone;

    const fuColor = fuOverdue ? "#ef4444" : fuDone ? GREEN : "#f97316";

    return (
      <View key={entry.id} style={S.card}>
        <View style={S.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={S.recipientName}>{entry.recipientName}</Text>
            <Text style={S.letterTitle} numberOfLines={1}>{entry.letterTitle}</Text>
            <Text style={S.sentDate}>Sent {formatDisplayDate(entry.sentAt)} · {entry.letterType}</Text>
          </View>
          <TouchableOpacity
            style={[S.outcomeBadge, { backgroundColor: `${outcomeColor}22`, borderColor: outcomeColor }]}
            onPress={() => cycleOutcome(entry)}
          >
            <Text style={[S.outcomeBadgeText, { color: outcomeColor }]}>
              {OUTCOME_LABELS[entry.outcome]}
            </Text>
          </TouchableOpacity>
        </View>

        {hasFollowUp && (
          <View style={S.followUpRow}>
            <View style={[S.fuChip, { backgroundColor: `${fuColor}18`, borderColor: fuColor }]}>
              <Text style={[S.fuChipText, { color: fuColor }]}>
                {fuDone ? "✓ Follow-up done" : `Follow-up: ${formatDisplayDate(entry.followUpDate)}${fuOverdue ? " · OVERDUE" : ""}`}
              </Text>
            </View>
            {!entry.followUpDone && (
              <TouchableOpacity style={S.doneBtn} onPress={() => markFollowUpDone(entry)}>
                <Text style={S.doneBtnText}>✓ Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {entry.notes ? (
          <TouchableOpacity onPress={() => toggleNotes(entry.id)}>
            <Text style={S.notesText} numberOfLines={notesExpanded ? undefined : 2}>
              {entry.notes}
            </Text>
            {!notesExpanded && entry.notes.length > 80 && (
              <Text style={S.notesTap}>tap to expand</Text>
            )}
          </TouchableOpacity>
        ) : null}

        <View style={S.cardActions}>
          <TouchableOpacity style={S.actionBtn} onPress={() => openEdit(entry)}>
            <Text style={S.actionBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.actionBtn, S.actionBtnDelete]} onPress={() => handleDelete(entry)}>
            <Text style={[S.actionBtnText, { color: "#ef4444" }]}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer bgColor={NAVY}>
      <View style={S.header}>
        <View style={S.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={S.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.logBtn} onPress={openLog}>
            <Text style={S.logBtnText}>+ Log Sent</Text>
          </TouchableOpacity>
        </View>
        <Text style={S.screenTitle}>SENT LOG & PIPELINE</Text>
        <Text style={S.screenSub}>Track letters sent to prospects and clients.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={S.statsRow}>
          <View style={[S.statBox, { borderColor: BLUE }]}>
            <Text style={[S.statValue, { color: BLUE }]}>{stats.total}</Text>
            <Text style={S.statLabel}>Total Sent</Text>
          </View>
          <View style={[S.statBox, { borderColor: GOLD }]}>
            <Text style={[S.statValue, { color: GOLD }]}>{stats.thisMonth}</Text>
            <Text style={S.statLabel}>This Month</Text>
          </View>
          <View style={[S.statBox, { borderColor: "#ef4444" }]}>
            <Text style={[S.statValue, { color: "#ef4444" }]}>{stats.followUpsDue}</Text>
            <Text style={S.statLabel}>Follow-ups Due</Text>
          </View>
          <View style={[S.statBox, { borderColor: GREEN }]}>
            <Text style={[S.statValue, { color: GREEN }]}>{stats.converted}</Text>
            <Text style={S.statLabel}>Converted</Text>
          </View>
        </View>

        {overdueEntries.length > 0 && (
          <View style={S.overdueSection}>
            <View style={S.overdueHeader}>
              <Text style={S.overdueHeaderText}>OVERDUE FOLLOW-UPS</Text>
              <View style={S.overdueBadge}>
                <Text style={S.overdueBadgeText}>{overdueEntries.length}</Text>
              </View>
            </View>
            {overdueEntries.map((entry) => (
              <View key={`od-${entry.id}`} style={S.overdueCard}>
                <View style={{ flex: 1 }}>
                  <Text style={S.overdueRecipient}>{entry.recipientName}</Text>
                  <Text style={S.overdueDate}>Due: {formatDisplayDate(entry.followUpDate)}</Text>
                </View>
                <TouchableOpacity style={S.doneBtn} onPress={() => markFollowUpDone(entry)}>
                  <Text style={S.doneBtnText}>✓ Done</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.filterScroll}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const color = f.key === "all" ? GOLD : OUTCOME_COLORS[f.key as OutcomeType] ?? GOLD;
            return (
              <TouchableOpacity
                key={f.key}
                style={[S.filterChip, { borderColor: color, backgroundColor: active ? `${color}28` : "transparent" }]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[S.filterChipText, { color: active ? color : "#64748b" }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {entries.length === 0 && (
          <View style={S.emptyState}>
            <Text style={S.emptyIcon}>📬</Text>
            <Text style={S.emptyTitle}>No entries yet</Text>
            <Text style={S.emptySub}>Log your first sent letter to start tracking your pipeline.</Text>
            <TouchableOpacity style={S.emptyBtn} onPress={openLog}>
              <Text style={S.emptyBtnText}>+ Log Sent Letter</Text>
            </TouchableOpacity>
          </View>
        )}

        {entries.length > 0 && filteredEntries.length === 0 && (
          <View style={S.emptyState}>
            <Text style={S.emptyIcon}>🔍</Text>
            <Text style={S.emptyTitle}>No entries match this filter</Text>
            <Text style={S.emptySub}>Try a different filter above.</Text>
          </View>
        )}

        {filteredEntries.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionLabel}>
              {filter === "all" ? `ALL ENTRIES (${filteredEntries.length})` : `${OUTCOME_LABELS[filter as OutcomeType].toUpperCase()} (${filteredEntries.length})`}
            </Text>
            {filteredEntries.map(renderEntry)}
          </View>
        )}
      </ScrollView>

      <Modal visible={logModalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <Pressable style={S.modalOverlay} onPress={() => setLogModalVisible(false)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={S.modalSheet}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={S.modalHandle} />
            <Text style={S.modalTitle}>{activeEntry ? "Edit Entry" : "Log Sent Letter"}</Text>

            <Text style={S.fieldLabel}>LETTER TITLE</Text>
            <TextInput
              style={S.fieldInput}
              value={editLetterTitle}
              onChangeText={setEditLetterTitle}
              placeholder="e.g. Customer Invitation Letter"
              placeholderTextColor="#475569"
              selectionColor={GOLD}
            />

            <Text style={S.fieldLabel}>LETTER TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.chipScroll}>
              {LETTER_TYPES.map((lt) => {
                const active = editLetterType === lt;
                return (
                  <TouchableOpacity
                    key={lt}
                    style={[S.chip, { borderColor: GOLD, backgroundColor: active ? `${GOLD}28` : "transparent" }]}
                    onPress={() => setEditLetterType(lt)}
                  >
                    <Text style={[S.chipText, { color: active ? GOLD : "#64748b" }]}>{lt}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={S.fieldLabel}>RECIPIENT NAME</Text>
            <TextInput
              style={S.fieldInput}
              value={editRecipientName}
              onChangeText={setEditRecipientName}
              placeholder="Full name"
              placeholderTextColor="#475569"
              selectionColor={GOLD}
            />

            <Text style={S.fieldLabel}>WHATSAPP NUMBER (optional)</Text>
            <TextInput
              style={S.fieldInput}
              value={editWhatsapp}
              onChangeText={setEditWhatsapp}
              placeholder="+1234567890"
              placeholderTextColor="#475569"
              keyboardType="phone-pad"
              selectionColor={GOLD}
            />

            <Text style={S.fieldLabel}>SENT DATE (DD/MM/YYYY)</Text>
            <TextInput
              style={S.fieldInput}
              value={editSentDate}
              onChangeText={setEditSentDate}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#475569"
              keyboardType="numbers-and-punctuation"
              selectionColor={GOLD}
            />

            <Text style={S.fieldLabel}>FOLLOW-UP DATE (DD/MM/YYYY — optional)</Text>
            <TextInput
              style={S.fieldInput}
              value={editFollowUpDate}
              onChangeText={setEditFollowUpDate}
              placeholder="Leave blank if no follow-up needed"
              placeholderTextColor="#475569"
              keyboardType="numbers-and-punctuation"
              selectionColor={GOLD}
            />

            <Text style={S.fieldLabel}>NOTES</Text>
            <TextInput
              style={[S.fieldInput, S.notesInput]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Any notes about this outreach…"
              placeholderTextColor="#475569"
              multiline
              textAlignVertical="top"
              selectionColor={GOLD}
            />

            <View style={S.modalActions}>
              <TouchableOpacity style={S.saveBtn} onPress={handleSave}>
                <Text style={S.saveBtnText}>Save Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setLogModalVisible(false)}>
                <Text style={S.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2d47",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  backText: { color: GOLD, fontFamily: FONT, fontSize: 14 },
  logBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  logBtnText: { color: "#fff", fontFamily: FONT, fontSize: 13 },
  screenTitle: { color: "#f1f5f9", fontFamily: FONT, fontSize: 20, letterSpacing: 1.1, marginBottom: 4 },
  screenSub: { color: "#64748b", fontFamily: FONT, fontSize: 12 },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  statValue: { fontFamily: FONT, fontSize: 22, marginBottom: 2 },
  statLabel: { color: "#475569", fontFamily: FONT, fontSize: 9, letterSpacing: 0.5, textAlign: "center" },

  overdueSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#1a0909",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef4444",
    padding: 12,
  },
  overdueHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  overdueHeaderText: { color: "#ef4444", fontFamily: FONT, fontSize: 11, letterSpacing: 0.8, flex: 1 },
  overdueBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  overdueBadgeText: { color: "#fff", fontFamily: FONT, fontSize: 11 },
  overdueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#200e0e",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  overdueRecipient: { color: "#fca5a5", fontFamily: FONT, fontSize: 13 },
  overdueDate: { color: "#ef4444", fontFamily: FONT, fontSize: 10, marginTop: 2 },

  filterScroll: { paddingHorizontal: 16, paddingVertical: 14 },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipText: { fontFamily: FONT, fontSize: 12 },

  section: { paddingHorizontal: 16, paddingTop: 4 },
  sectionLabel: { color: "#475569", fontFamily: FONT, fontSize: 11, letterSpacing: 1.1, marginBottom: 10 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e2d47",
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  recipientName: { color: "#f1f5f9", fontFamily: FONT, fontSize: 15, marginBottom: 2 },
  letterTitle: { color: "#94a3b8", fontFamily: FONT, fontSize: 12, marginBottom: 3 },
  sentDate: { color: "#475569", fontFamily: FONT, fontSize: 10 },

  outcomeBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  outcomeBadgeText: { fontFamily: FONT, fontSize: 10, letterSpacing: 0.4, textAlign: "center" },

  followUpRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  fuChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flex: 1,
  },
  fuChipText: { fontFamily: FONT, fontSize: 10 },
  doneBtn: {
    backgroundColor: "#22c55e22",
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  doneBtnText: { color: GREEN, fontFamily: FONT, fontSize: 11 },

  notesText: { color: "#64748b", fontFamily: FONT, fontSize: 11, lineHeight: 17, marginBottom: 4 },
  notesTap: { color: "#475569", fontFamily: FONT, fontSize: 10, marginBottom: 6 },

  cardActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  actionBtn: {
    backgroundColor: "#1e2d47",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnDelete: { backgroundColor: "#1a0d0d" },
  actionBtnText: { color: "#94a3b8", fontFamily: FONT, fontSize: 11 },

  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 42, marginBottom: 12 },
  emptyTitle: { color: "#f1f5f9", fontFamily: FONT, fontSize: 17, marginBottom: 8 },
  emptySub: { color: "#64748b", fontFamily: FONT, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  emptyBtn: { backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 22, paddingVertical: 10 },
  emptyBtnText: { color: "#fff", fontFamily: FONT, fontSize: 14 },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modalSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0d1a2f",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: "#1e2d47",
    maxHeight: "90%",
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#1e2d47",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  modalTitle: { color: "#f1f5f9", fontFamily: FONT, fontSize: 17, marginBottom: 16, marginTop: 8 },

  fieldLabel: { color: "#475569", fontFamily: FONT, fontSize: 10, letterSpacing: 1.1, marginBottom: 6, marginTop: 14 },
  fieldInput: {
    backgroundColor: "#0a1628",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e2d47",
    color: "#f1f5f9",
    fontFamily: FONT,
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  notesInput: { minHeight: 100, textAlignVertical: "top" },

  chipScroll: { marginBottom: 4 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  chipText: { fontFamily: FONT, fontSize: 12 },

  modalActions: { gap: 10, marginTop: 20 },
  saveBtn: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontFamily: FONT, fontSize: 15 },
  cancelBtn: {
    backgroundColor: "#1e2d47",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: { color: "#94a3b8", fontFamily: FONT, fontSize: 14 },
});
