import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Platform, KeyboardAvoidingView, Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const STORAGE_KEY = "sent_log";
const GOLD = "#e67e22";
const GREEN = "#22c55e";
const NAVY = "#0a1628";
const FONT = "ArialRoundedMTBold";

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

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function todayDMY(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function dmyToISO(dmy: string): string {
  const parts = dmy.split("/");
  if (parts.length !== 3) return "";
  const [dd, mm, yyyy] = parts;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

export interface LogToPipelineModalProps {
  visible: boolean;
  onClose: () => void;
  recipientName: string;
  letterTitle: string;
  letterCategory: string;
  onLogged?: () => void;
}

export function LogToPipelineModal({
  visible, onClose, recipientName, letterTitle, letterCategory, onLogged,
}: LogToPipelineModalProps) {
  const [name, setName] = useState(recipientName);
  const [followUp, setFollowUp] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(recipientName);
      setFollowUp("");
      setNotes("");
    }
  }, [visible, recipientName]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing: SentEntry[] = raw ? JSON.parse(raw) : [];
      const entry: SentEntry = {
        id: generateId(),
        letterTitle,
        letterType: letterCategory,
        recipientName: name.trim() || "—",
        recipientWhatsapp: "",
        sentAt: new Date().toISOString(),
        followUpDate: followUp.trim() ? dmyToISO(followUp.trim()) : "",
        followUpDone: false,
        outcome: "pending",
        notes: notes.trim(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onLogged?.();
      onClose();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" presentationStyle="overFullScreen" onRequestClose={onClose}>
      <Pressable style={S.overlay} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={S.sheet}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={S.handle} />
          <Text style={S.title}>📋  Log to Pipeline</Text>
          <Text style={S.sub}>This will be saved as a Pending entry in your Sent Log.</Text>

          <Text style={S.label}>LETTER</Text>
          <View style={S.readonlyRow}>
            <Text style={S.readonlyText}>{letterTitle}</Text>
            <View style={S.categoryChip}>
              <Text style={S.categoryChipText}>{letterCategory}</Text>
            </View>
          </View>

          <Text style={S.label}>RECIPIENT NAME</Text>
          <TextInput
            style={S.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor="#475569"
            selectionColor={GOLD}
            autoCapitalize="words"
          />

          <Text style={S.label}>FOLLOW-UP DATE (DD/MM/YYYY — optional)</Text>
          <TextInput
            style={S.input}
            value={followUp}
            onChangeText={setFollowUp}
            placeholder="Leave blank if not needed"
            placeholderTextColor="#475569"
            keyboardType="numbers-and-punctuation"
            selectionColor={GOLD}
          />

          <Text style={S.label}>NOTES (optional)</Text>
          <TextInput
            style={[S.input, S.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any notes about this outreach…"
            placeholderTextColor="#475569"
            multiline
            textAlignVertical="top"
            selectionColor={GOLD}
          />

          <View style={S.actions}>
            <TouchableOpacity style={S.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <Text style={S.saveBtnText}>{saving ? "Saving…" : "✓  Save to Pipeline"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.cancelBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={S.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#0d1a2f",
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: 1, borderColor: "#1e2d47",
    maxHeight: "85%",
    paddingHorizontal: 20, paddingBottom: 36,
  },
  handle: {
    width: 40, height: 4, backgroundColor: "#1e2d47",
    borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 4,
  },
  title: { color: "#f1f5f9", fontFamily: FONT, fontSize: 17, marginBottom: 4, marginTop: 8 },
  sub: { color: "#475569", fontFamily: FONT, fontSize: 12, marginBottom: 20, lineHeight: 18 },

  label: { color: "#475569", fontFamily: FONT, fontSize: 10, letterSpacing: 1.1, marginBottom: 6, marginTop: 14 },

  readonlyRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#0a1628", borderRadius: 10, borderWidth: 1,
    borderColor: "#1e2d47", paddingHorizontal: 14, paddingVertical: 11,
  },
  readonlyText: { color: "#94a3b8", fontFamily: FONT, fontSize: 13, flex: 1 },
  categoryChip: {
    backgroundColor: `${GREEN}22`, borderWidth: 1, borderColor: GREEN,
    borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3,
  },
  categoryChipText: { color: GREEN, fontFamily: FONT, fontSize: 10, letterSpacing: 0.5 },

  input: {
    backgroundColor: "#0a1628", borderRadius: 10, borderWidth: 1, borderColor: "#1e2d47",
    color: "#f1f5f9", fontFamily: FONT, fontSize: 13,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  notesInput: { minHeight: 80, textAlignVertical: "top" },

  actions: { gap: 10, marginTop: 22 },
  saveBtn: {
    backgroundColor: GREEN, borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
  },
  saveBtnText: { color: NAVY, fontFamily: FONT, fontSize: 15 },
  cancelBtn: {
    backgroundColor: "#1e2d47", borderRadius: 12,
    paddingVertical: 12, alignItems: "center",
  },
  cancelBtnText: { color: "#94a3b8", fontFamily: FONT, fontSize: 14 },
});
