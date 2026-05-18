import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
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
const STORAGE_KEY = "personal_letters";

interface PersonalLetter {
  id: string;
  title: string;
  category: string;
  body: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

type Category = "Prospect" | "Client" | "Partner" | "Follow-up" | "Other";

const CATEGORY_COLORS: Record<string, string> = {
  Prospect: BLUE,
  Client: GOLD,
  Partner: GREEN,
  "Follow-up": "#f97316",
  Other: "#94a3b8",
};

const CATEGORIES: Category[] = ["Prospect", "Client", "Partner", "Follow-up", "Other"];

const VARIABLES = ["{name}", "{amount}", "{city}", "{company}", "{date}", "{sp_level}"];

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function extractVariables(body: string): string[] {
  const matches = body.match(/\{[a-zA-Z_]+\}/g);
  if (!matches) return [];
  return [...new Set(matches)];
}

function fillVariables(body: string, values: Record<string, string>): string {
  let result = body;
  Object.entries(values).forEach(([key, val]) => {
    result = result.split(key).join(val || key);
  });
  return result;
}

export default function PersonalLettersScreen() {
  const router = useRouter();
  const { language } = useCalculator();

  const [letters, setLetters] = useState<PersonalLetter[]>([]);
  const [search, setSearch] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [fillModalVisible, setFillModalVisible] = useState(false);
  const [activeLetter, setActiveLetter] = useState<PersonalLetter | null>(null);
  const [fillAction, setFillAction] = useState<"copy" | "whatsapp">("copy");
  const [fillValues, setFillValues] = useState<Record<string, string>>({});
  const [fillWhatsapp, setFillWhatsapp] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<string>("Prospect");
  const [editBody, setEditBody] = useState("");
  const [editDraft, setEditDraft] = useState(true);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setLetters(JSON.parse(raw));
    } catch {}
  };

  const saveLetters = async (updated: PersonalLetter[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setLetters(updated);
    } catch {}
  };

  const openCreate = () => {
    setActiveLetter(null);
    setEditTitle("");
    setEditCategory("Prospect");
    setEditBody("");
    setEditDraft(true);
    setEditModalVisible(true);
  };

  const openEdit = (letter: PersonalLetter) => {
    setActiveLetter(letter);
    setEditTitle(letter.title);
    setEditCategory(letter.category);
    setEditBody(letter.body);
    setEditDraft(letter.isDraft);
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Title required", "Please enter a title for your letter.");
      return;
    }
    const now = new Date().toISOString();
    if (activeLetter) {
      const updated = letters.map((l) =>
        l.id === activeLetter.id
          ? { ...l, title: editTitle.trim(), category: editCategory, body: editBody, isDraft: editDraft, updatedAt: now }
          : l
      );
      await saveLetters(updated);
    } else {
      const newLetter: PersonalLetter = {
        id: generateId(),
        title: editTitle.trim(),
        category: editCategory,
        body: editBody,
        isDraft: editDraft,
        createdAt: now,
        updatedAt: now,
      };
      await saveLetters([newLetter, ...letters]);
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditModalVisible(false);
  };

  const handleDelete = (letter: PersonalLetter) => {
    Alert.alert("Delete Letter", `Delete "${letter.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await saveLetters(letters.filter((l) => l.id !== letter.id));
        },
      },
    ]);
  };

  const openFillModal = (letter: PersonalLetter, action: "copy" | "whatsapp") => {
    const vars = extractVariables(letter.body);
    if (vars.length === 0) {
      if (action === "copy") {
        executeCopy(letter.body);
      } else {
        executeWhatsApp(letter.body, "");
      }
      return;
    }
    setActiveLetter(letter);
    setFillAction(action);
    const initial: Record<string, string> = {};
    vars.forEach((v) => { initial[v] = ""; });
    setFillValues(initial);
    setFillWhatsapp("");
    setFillModalVisible(true);
  };

  const executeCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied!", "Letter copied to clipboard.");
  };

  const executeWhatsApp = (text: string, number: string) => {
    const encoded = encodeURIComponent(text);
    const url = number.trim()
      ? `https://wa.me/${number.trim().replace(/\D/g, "")}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open WhatsApp."));
  };

  const handleFillAction = () => {
    if (!activeLetter) return;
    const filled = fillVariables(activeLetter.body, fillValues);
    if (fillAction === "copy") {
      executeCopy(filled);
    } else {
      executeWhatsApp(filled, fillWhatsapp);
    }
    setFillModalVisible(false);
  };

  const insertVariable = (variable: string) => {
    setEditBody((prev) => prev + variable);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return letters;
    const q = search.toLowerCase();
    return letters.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.body.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }, [letters, search]);

  const drafts = filtered.filter((l) => l.isDraft);
  const ready = filtered.filter((l) => !l.isDraft);

  const renderCard = (letter: PersonalLetter) => (
    <View key={letter.id} style={S.card}>
      <View style={S.cardHeader}>
        <Text style={S.cardTitle} numberOfLines={1}>{letter.title}</Text>
        <View style={S.cardBadges}>
          {letter.isDraft && (
            <View style={S.draftBadge}>
              <Text style={S.draftBadgeText}>DRAFT</Text>
            </View>
          )}
          <View style={[S.catBadge, { backgroundColor: `${CATEGORY_COLORS[letter.category] ?? "#94a3b8"}22`, borderColor: CATEGORY_COLORS[letter.category] ?? "#94a3b8" }]}>
            <Text style={[S.catBadgeText, { color: CATEGORY_COLORS[letter.category] ?? "#94a3b8" }]}>{letter.category}</Text>
          </View>
        </View>
      </View>
      <Text style={S.cardDate}>Updated {formatDate(letter.updatedAt)}</Text>
      <Text style={S.cardPreview} numberOfLines={2}>{letter.body || "No content yet."}</Text>
      <View style={S.cardActions}>
        <TouchableOpacity style={S.actionBtn} onPress={() => openEdit(letter)}>
          <Text style={S.actionBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.actionBtn} onPress={() => openFillModal(letter, "copy")}>
          <Text style={S.actionBtnText}>📋 Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.actionBtn} onPress={() => openFillModal(letter, "whatsapp")}>
          <Text style={S.actionBtnText}>💬 WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.actionBtn, S.actionBtnDelete]} onPress={() => handleDelete(letter)}>
          <Text style={[S.actionBtnText, { color: "#ef4444" }]}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const fillVars = activeLetter ? extractVariables(activeLetter.body) : [];

  return (
    <ScreenContainer bgColor={NAVY}>
      <View style={S.header}>
        <View style={S.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={S.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.newBtn} onPress={openCreate}>
            <Text style={S.newBtnText}>+ New Letter</Text>
          </TouchableOpacity>
        </View>
        <Text style={S.screenTitle}>MY PERSONAL LETTERS</Text>
        <Text style={S.screenSub}>Custom letters saved to your device.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={S.searchWrap}>
          <TextInput
            style={S.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by title, body or category…"
            placeholderTextColor="#475569"
            selectionColor={GOLD}
          />
        </View>

        <View style={S.infoBox}>
          <Text style={S.infoTitle}>Variable shortcuts</Text>
          <Text style={S.infoText}>
            Use <Text style={S.infoVar}>{"{name}"}</Text>, <Text style={S.infoVar}>{"{amount}"}</Text>, <Text style={S.infoVar}>{"{city}"}</Text>, <Text style={S.infoVar}>{"{company}"}</Text>, <Text style={S.infoVar}>{"{date}"}</Text>, <Text style={S.infoVar}>{"{sp_level}"}</Text> in your letter body. Before copying or sending, you'll be prompted to fill them in.
          </Text>
        </View>

        {letters.length === 0 && (
          <View style={S.emptyState}>
            <Text style={S.emptyIcon}>✍️</Text>
            <Text style={S.emptyTitle}>No letters yet</Text>
            <Text style={S.emptySub}>Tap "+ New Letter" to create your first personal letter.</Text>
            <TouchableOpacity style={S.emptyBtn} onPress={openCreate}>
              <Text style={S.emptyBtnText}>+ New Letter</Text>
            </TouchableOpacity>
          </View>
        )}

        {letters.length > 0 && filtered.length === 0 && (
          <View style={S.emptyState}>
            <Text style={S.emptyIcon}>🔍</Text>
            <Text style={S.emptyTitle}>No results</Text>
            <Text style={S.emptySub}>Try a different search term.</Text>
          </View>
        )}

        {drafts.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionLabel}>DRAFTS</Text>
            {drafts.map(renderCard)}
          </View>
        )}

        {ready.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionLabel}>MY LETTERS</Text>
            {ready.map(renderCard)}
          </View>
        )}
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <Pressable style={S.modalOverlay} onPress={() => setEditModalVisible(false)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={S.modalSheet}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={S.modalHandle} />
            <Text style={S.modalTitle}>{activeLetter ? "Edit Letter" : "New Letter"}</Text>

            <Text style={S.fieldLabel}>TITLE</Text>
            <TextInput
              style={S.fieldInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Letter title…"
              placeholderTextColor="#475569"
              selectionColor={GOLD}
            />

            <Text style={S.fieldLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.chipScroll}>
              {CATEGORIES.map((cat) => {
                const active = editCategory === cat;
                const color = CATEGORY_COLORS[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[S.chip, { borderColor: color, backgroundColor: active ? `${color}33` : "transparent" }]}
                    onPress={() => setEditCategory(cat)}
                  >
                    <Text style={[S.chipText, { color: active ? color : "#94a3b8" }]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={S.fieldLabel}>STATUS</Text>
            <TouchableOpacity
              style={[S.toggleBtn, { borderColor: editDraft ? "#f97316" : GREEN, backgroundColor: editDraft ? "#f9731618" : "#22c55e18" }]}
              onPress={() => setEditDraft((d) => !d)}
            >
              <Text style={[S.toggleBtnText, { color: editDraft ? "#f97316" : GREEN }]}>
                {editDraft ? "Draft — not ready" : "Ready to send"}
              </Text>
            </TouchableOpacity>

            <Text style={S.fieldLabel}>INSERT VARIABLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.chipScroll}>
              {VARIABLES.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[S.chip, { borderColor: "#33C5FF", backgroundColor: "#33C5FF18" }]}
                  onPress={() => insertVariable(v)}
                >
                  <Text style={[S.chipText, { color: BLUE }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={S.fieldLabel}>LETTER BODY</Text>
            <TextInput
              style={[S.fieldInput, S.bodyInput]}
              value={editBody}
              onChangeText={setEditBody}
              placeholder="Write your letter here. Use {name}, {amount}, etc. for dynamic fields…"
              placeholderTextColor="#475569"
              multiline
              textAlignVertical="top"
              selectionColor={GOLD}
            />

            <View style={S.modalActions}>
              <TouchableOpacity style={S.saveBtn} onPress={handleSave}>
                <Text style={S.saveBtnText}>Save Letter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={S.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={fillModalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <Pressable style={S.modalOverlay} onPress={() => setFillModalVisible(false)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={S.modalSheet}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={S.modalHandle} />
            <Text style={S.modalTitle}>Fill Variables</Text>
            <Text style={S.fillSub}>Enter values for the variables detected in your letter.</Text>

            {fillVars.map((v) => (
              <View key={v}>
                <Text style={S.fieldLabel}>{v.toUpperCase()}</Text>
                <TextInput
                  style={S.fieldInput}
                  value={fillValues[v] ?? ""}
                  onChangeText={(val) => setFillValues((prev) => ({ ...prev, [v]: val }))}
                  placeholder={`Enter value for ${v}`}
                  placeholderTextColor="#475569"
                  selectionColor={GOLD}
                />
              </View>
            ))}

            {fillAction === "whatsapp" && (
              <>
                <Text style={S.fieldLabel}>WHATSAPP NUMBER (optional)</Text>
                <TextInput
                  style={S.fieldInput}
                  value={fillWhatsapp}
                  onChangeText={setFillWhatsapp}
                  placeholder="+1234567890 (leave blank to choose in WhatsApp)"
                  placeholderTextColor="#475569"
                  keyboardType="phone-pad"
                  selectionColor={GOLD}
                />
              </>
            )}

            <View style={S.modalActions}>
              <TouchableOpacity style={S.saveBtn} onPress={handleFillAction}>
                <Text style={S.saveBtnText}>
                  {fillAction === "whatsapp" ? "Open WhatsApp" : "Copy Letter"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setFillModalVisible(false)}>
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
  newBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  newBtnText: { color: "#fff", fontFamily: FONT, fontSize: 13 },
  screenTitle: { color: "#f1f5f9", fontFamily: FONT, fontSize: 20, letterSpacing: 1.1, marginBottom: 4 },
  screenSub: { color: "#64748b", fontFamily: FONT, fontSize: 12 },

  searchWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  searchInput: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e2d47",
    color: "#f1f5f9",
    fontFamily: FONT,
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  infoBox: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#0d1a2f",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e3a5f",
    padding: 12,
  },
  infoTitle: { color: BLUE, fontFamily: FONT, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 },
  infoText: { color: "#64748b", fontFamily: FONT, fontSize: 11, lineHeight: 17 },
  infoVar: { color: BLUE, fontFamily: FONT },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionLabel: {
    color: "#475569",
    fontFamily: FONT,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e2d47",
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 4 },
  cardTitle: { color: "#f1f5f9", fontFamily: FONT, fontSize: 14, flex: 1 },
  cardBadges: { flexDirection: "row", gap: 6, flexShrink: 0 },
  draftBadge: {
    backgroundColor: "#f9731622",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#f97316",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  draftBadgeText: { color: "#f97316", fontFamily: FONT, fontSize: 9, letterSpacing: 0.4 },
  catBadge: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  catBadgeText: { fontFamily: FONT, fontSize: 9, letterSpacing: 0.4 },
  cardDate: { color: "#475569", fontFamily: FONT, fontSize: 10, marginBottom: 6 },
  cardPreview: { color: "#94a3b8", fontFamily: FONT, fontSize: 12, lineHeight: 18, marginBottom: 12 },

  cardActions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionBtn: {
    backgroundColor: "#1e2d47",
    borderRadius: 8,
    paddingHorizontal: 10,
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
  fillSub: { color: "#64748b", fontFamily: FONT, fontSize: 12, marginBottom: 12, marginTop: -8 },

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
  bodyInput: { minHeight: 180, textAlignVertical: "top" },

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

  toggleBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleBtnText: { fontFamily: FONT, fontSize: 13 },

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
