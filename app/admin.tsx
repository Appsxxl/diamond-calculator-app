import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

const TRIAL_DAYS = 7;

function daysLeft(trialStartedAt: Date | string | null, status: string | null): number | null {
  if (status === "team" || status === "paid") return null;
  if (!trialStartedAt) return TRIAL_DAYS;
  const start = new Date(trialStartedAt);
  const used = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return Math.max(0, TRIAL_DAYS - used);
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    team:    { label: "★ TEAM",    bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
    paid:    { label: "PRO",       bg: "rgba(34,197,94,0.15)",  color: "#4ade80" },
    trial:   { label: "TRIAL",     bg: "rgba(148,163,184,0.15)", color: "#94a3b8" },
    expired: { label: "EXPIRED",   bg: "rgba(239,68,68,0.15)",  color: "#f87171" },
  };
  const s = status ?? "trial";
  const cfg = map[s] ?? map["trial"];
  return (
    <View style={{ backgroundColor: cfg.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.color, letterSpacing: 0.5 }}>
        {cfg.label}
      </Text>
    </View>
  );
}

function HelpCard() {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          backgroundColor: "#1e293b", borderRadius: 12, borderWidth: 1, borderColor: "#334155",
          paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <Text style={{ color: "#94a3b8", fontSize: 14, fontWeight: "600" }}>How to use this panel</Text>
        <Text style={{ color: "#64748b", fontSize: 16 }}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ backgroundColor: "#1e293b", borderRadius: 12, borderWidth: 1, borderColor: "#334155",
          borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 16, gap: 14 }}>

          <HelpSection title="Stats bar">
            <HelpRow label="Total" text="Every registered user." />
            <HelpRow label="Team" text="Users on the Team plan (activated a team code)." />
            <HelpRow label="Pro" text="Users with an active paid subscription." />
            <HelpRow label="Active" text="Users still within their 7-day free trial." />
            <HelpRow label="Expired" text="Trial ended, no subscription or team code." />
          </HelpSection>

          <HelpSection title="Users tab — badges">
            <HelpRow label="★ TEAM" text="Has a valid team activation code — full access." />
            <HelpRow label="PRO" text="Paying subscriber via the App Store / Google Play." />
            <HelpRow label="TRIAL" text="Free trial running, X days left shown." />
            <HelpRow label="EXPIRED" text="Trial over — user sees the paywall." />
            <HelpRow label="ADMIN" text="Can access this admin panel." />
          </HelpSection>

          <HelpSection title="Codes tab — giving someone team access">
            <HelpRow label="1. Create a code" text='Type a code (e.g. TEAM-FRED-01) and optionally note who it is for, then tap "Create Code".' />
            <HelpRow label="2. Share it" text="Send the code to your user. They enter it in the app under Settings → Activate." />
            <HelpRow label="3. Track it" text='Once redeemed the code shows "USED" and the user appears with a ★ TEAM badge.' />
            <HelpRow label="Naming tip" text="Use a pattern like TEAM-NAME-01 so you can identify codes at a glance." />
          </HelpSection>

          <HelpSection title="Local dev — OTP not arriving?">
            <HelpRow label="" text="When RESEND_API_KEY is not set, the OTP is printed to the server terminal (the [0] lines) instead of emailed. Check the terminal for the 6-digit code." />
          </HelpSection>

        </View>
      )}
    </View>
  );
}

function HelpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "#f59e0b", fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" }}>{title}</Text>
      {children}
    </View>
  );
}

function HelpRow({ label, text }: { label: string; text: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {label ? <Text style={{ color: "#e2e8f0", fontSize: 13, fontWeight: "600", minWidth: 70 }}>{label}</Text> : null}
      <Text style={{ color: "#94a3b8", fontSize: 13, flex: 1 }}>{text}</Text>
    </View>
  );
}

export default function AdminScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "codes" | "events" | "diag">("users");
  const [newCode, setNewCode] = useState("");
  const [newCodeFor, setNewCodeFor] = useState("");
  const [creating, setCreating] = useState(false);

  // Send code via email modal
  const [sendModal, setSendModal] = useState<{ code: string; email: string } | null>(null);
  const [sending, setSending] = useState(false);

  // Event form state
  const [evtTitle, setEvtTitle]     = useState("");
  const [evtDesc, setEvtDesc]       = useState("");
  const [evtDate, setEvtDate]       = useState("");
  const [evtTime, setEvtTime]       = useState("");
  const [evtTZ, setEvtTZ]           = useState("UTC+8");
  const [evtLink, setEvtLink]       = useState("");
  const [evtType, setEvtType]       = useState<"zoom" | "webinar" | "event">("zoom");
  const [creatingEvt, setCreatingEvt] = useState(false);

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } =
    trpc.activation.listUsers.useQuery();
  const { data: codes = [], isLoading: codesLoading, refetch: refetchCodes } =
    trpc.activation.listCodes.useQuery();
  const { data: adminEvents = [], isLoading: eventsLoading, refetch: refetchEvents } =
    trpc.activation.listEvents.useQuery();

  const { data: diagData, isLoading: diagLoading, refetch: refetchDiag, error: diagError } =
    trpc.system.diagnostics.useQuery(undefined, { enabled: tab === "diag", retry: 1, staleTime: 0 });

  const [pingMs, setPingMs] = useState<number | null>(null);
  useEffect(() => {
    if (tab !== "diag") return;
    const start = Date.now();
    refetchDiag().then(() => setPingMs(Date.now() - start));
  }, [tab]);

  const createCode = trpc.activation.createCode.useMutation({
    onSuccess: () => {
      setNewCode("");
      setNewCodeFor("");
      setCreating(false);
      refetchCodes();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (e) => {
      setCreating(false);
      Alert.alert("Error", e.message);
    },
  });

  const createEvent = trpc.activation.createEvent.useMutation({
    onSuccess: () => {
      setEvtTitle(""); setEvtDesc(""); setEvtDate(""); setEvtTime("");
      setEvtLink(""); setEvtType("zoom"); setCreatingEvt(false);
      refetchEvents();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (e) => { setCreatingEvt(false); Alert.alert("Error", e.message); },
  });

  const deleteEvent = trpc.activation.deleteEvent.useMutation({
    onSuccess: () => refetchEvents(),
    onError: (e) => Alert.alert("Error", e.message),
  });

  const sendCodeEmail = trpc.activation.sendCodeEmail.useMutation({
    onSuccess: (_, vars) => {
      setSendModal(null);
      setSending(false);
      refetchCodes();
      Alert.alert("✅ Sent!", `Activation code emailed to ${vars.email}.`);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (e) => {
      setSending(false);
      Alert.alert("Error", e.message);
    },
  });

  const handleSendCode = () => {
    if (!sendModal?.email.trim() || !sendModal?.code) return;
    setSending(true);
    sendCodeEmail.mutate({ email: sendModal.email.trim().toLowerCase(), code: sendModal.code });
  };

  const handleExport = async () => {
    const headers = "ID,Email,Name,Status,Activation Code,Joined\n";
    const rows = users.map((u) => [
      u.id,
      `"${u.email ?? ""}"`,
      `"${(u.name ?? "").replace(/"/g, '""')}"`,
      u.status ?? "trial",
      u.activationCode ?? "",
      new Date(u.createdAt).toLocaleDateString("en-GB"),
    ].join(","));
    const csv = headers + rows.join("\n");
    try {
      await Share.share({ message: csv, title: "Plan B — Users Export" });
    } catch {
      Alert.alert("Export failed", "Could not open share sheet.");
    }
  };

  const handleCreateEvent = () => {
    if (!evtTitle.trim() || !evtDate.trim() || !evtTime.trim()) {
      Alert.alert("Missing fields", "Title, date and time are required.");
      return;
    }
    // Parse DD/MM/YYYY HH:MM → ISO
    const [d, m, y] = evtDate.trim().split("/");
    const iso = `${y}-${m?.padStart(2,"0")}-${d?.padStart(2,"0")}T${evtTime.trim()}:00`;
    if (isNaN(new Date(iso).getTime())) { Alert.alert("Invalid date", "Use DD/MM/YYYY and HH:MM"); return; }
    setCreatingEvt(true);
    createEvent.mutate({
      title: evtTitle.trim(),
      description: evtDesc.trim() || undefined,
      eventDate: new Date(iso).toISOString(),
      timezone: evtTZ.trim() || "UTC",
      link: evtLink.trim() || undefined,
      type: evtType,
    });
  };

  const handleCreateCode = () => {
    const code = newCode.trim().toUpperCase();
    if (!code) return;
    setCreating(true);
    createCode.mutate({ code, description: newCodeFor.trim() || undefined });
  };

  // Stats
  const total = users.length;
  const teamCount = users.filter((u) => u.status === "team").length;
  const paidCount = users.filter((u) => u.status === "paid").length;
  const expiredCount = users.filter((u) => {
    if (u.status === "team" || u.status === "paid") return false;
    return (daysLeft(u.trialStartedAt, u.status) ?? 0) === 0;
  }).length;
  const activeTrialCount = total - teamCount - paidCount - expiredCount;

  const usedCodes = codes.filter((c) => c.usedBy !== null).length;
  const freeCodes = codes.filter((c) => c.usedBy === null);

  return (
    <ScreenContainer bgColor="#0f172a">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Header */}
        <View style={S.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginRight: 12 }]}>
            <Text style={S.backArrow}>←</Text>
          </Pressable>
          <Text style={S.headerTitle}>Admin Panel</Text>
          <TouchableOpacity onPress={() => { refetchUsers(); refetchCodes(); }} activeOpacity={0.7}>
            <Text style={{ color: "#64748b", fontSize: 14 }}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={S.statsRow}>
          <StatCard label="Total" value={total} />
          <StatCard label="Team" value={teamCount} color="#f59e0b" />
          <StatCard label="Pro" value={paidCount} color="#4ade80" />
          <StatCard label="Active" value={activeTrialCount} />
          <StatCard label="Expired" value={expiredCount} color="#f87171" />
        </View>

        {/* How to use */}
        <HelpCard />

        {/* Tab switcher */}
        <View style={S.tabRow}>
          <TouchableOpacity style={[S.tabBtn, tab === "users" && S.tabBtnActive]} onPress={() => setTab("users")} activeOpacity={0.8}>
            <Text style={[S.tabLabel, tab === "users" && S.tabLabelActive]}>Users ({total})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.tabBtn, tab === "codes" && S.tabBtnActive]} onPress={() => setTab("codes")} activeOpacity={0.8}>
            <Text style={[S.tabLabel, tab === "codes" && S.tabLabelActive]}>Codes ({usedCodes}/{codes.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.tabBtn, tab === "events" && S.tabBtnActive]} onPress={() => setTab("events")} activeOpacity={0.8}>
            <Text style={[S.tabLabel, tab === "events" && S.tabLabelActive]}>Events ({adminEvents.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.tabBtn, tab === "diag" && S.tabBtnActive]} onPress={() => setTab("diag")} activeOpacity={0.8}>
            <Text style={[S.tabLabel, tab === "diag" && S.tabLabelActive]}>📡 Diag</Text>
          </TouchableOpacity>
        </View>

        {/* Users tab */}
        {tab === "users" && (
          <View style={S.section}>
            {/* Export button */}
            <TouchableOpacity
              onPress={handleExport}
              activeOpacity={0.8}
              style={{ backgroundColor: "#1e293b", borderRadius: 10, borderWidth: 1, borderColor: "#334155",
                paddingVertical: 11, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
              <Text style={{ color: "#94a3b8", fontSize: 14, fontWeight: "600" }}>⬇ Export CSV Backup</Text>
            </TouchableOpacity>

            {usersLoading ? (
              <ActivityIndicator color="#f59e0b" style={{ marginTop: 24 }} />
            ) : users.length === 0 ? (
              <Text style={S.emptyText}>No users yet.</Text>
            ) : (
              users.map((user) => {
                const left = daysLeft(user.trialStartedAt, user.status);
                const isExpired = left === 0 && user.status !== "team" && user.status !== "paid";
                const canSend = !!user.email && user.status !== "team" && user.status !== "paid";
                return (
                  <View key={user.id} style={S.userCard}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={S.userName} numberOfLines={1}>
                        {user.name ?? user.email ?? `User #${user.id}`}
                      </Text>
                      {user.email && user.name && (
                        <Text style={S.userEmail} numberOfLines={1}>{user.email}</Text>
                      )}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                        <StatusBadge status={isExpired ? "expired" : (user.status ?? "trial")} />
                        {user.activationCode && (
                          <Text style={S.codeChip}>{user.activationCode}</Text>
                        )}
                        {left !== null && !isExpired && (
                          <Text style={S.trialDays}>{left}d left</Text>
                        )}
                        {user.role === "admin" && (
                          <Text style={{ fontSize: 11, color: "#64748b", fontWeight: "600" }}>ADMIN</Text>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 8 }}>
                      <Text style={S.joinDate}>
                        {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                      </Text>
                      {canSend && (
                        <TouchableOpacity
                          onPress={() => setSendModal({ email: user.email!, code: freeCodes[0]?.code ?? "" })}
                          activeOpacity={0.7}
                          style={{ backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 7, borderWidth: 1,
                            borderColor: "rgba(245,158,11,0.3)", paddingHorizontal: 10, paddingVertical: 5 }}>
                          <Text style={{ fontSize: 12, color: "#f59e0b", fontWeight: "700" }}>📧 Send Code</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Codes tab */}
        {tab === "codes" && (
          <View style={S.section}>

            {/* Create new code */}
            <View style={S.createCard}>
              <Text style={S.createTitle}>Create Activation Code</Text>
              <TextInput
                style={S.input}
                value={newCode}
                onChangeText={(v) => setNewCode(v.toUpperCase())}
                placeholder="e.g. TEAM-FRED-D01"
                placeholderTextColor="#475569"
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TextInput
                style={[S.input, { marginTop: 10 }]}
                value={newCodeFor}
                onChangeText={setNewCodeFor}
                placeholder="For (e.g. Fred van der Berg)"
                placeholderTextColor="#475569"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[S.createBtn, (!newCode.trim() || creating) && S.createBtnDisabled]}
                onPress={handleCreateCode}
                activeOpacity={0.85}
                disabled={!newCode.trim() || creating}
              >
                {creating ? (
                  <ActivityIndicator color="#0f172a" size="small" />
                ) : (
                  <Text style={S.createBtnText}>Create Code</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Code list */}
            {codesLoading ? (
              <ActivityIndicator color="#f59e0b" style={{ marginTop: 16 }} />
            ) : codes.length === 0 ? (
              <Text style={S.emptyText}>No codes yet.</Text>
            ) : (
              codes.map((code) => (
                <View key={code.id} style={S.codeCard}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={S.codeText}>{code.code}</Text>
                    {code.description ? (
                      <Text style={S.codeDesc}>{code.description}</Text>
                    ) : null}
                    <Text style={S.codeDate}>
                      Created {new Date(code.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <View style={[S.usedBadge, code.usedBy ? S.usedBadgeUsed : S.usedBadgeFree]}>
                      <Text style={[S.usedBadgeText, code.usedBy ? S.usedBadgeTextUsed : S.usedBadgeTextFree]}>
                        {code.usedBy ? "USED" : "FREE"}
                      </Text>
                    </View>
                    {!code.usedBy && (
                      <TouchableOpacity
                        onPress={() => setSendModal({ code: code.code, email: "" })}
                        activeOpacity={0.7}
                        style={{ backgroundColor: "rgba(14,165,233,0.12)", borderRadius: 7, borderWidth: 1,
                          borderColor: "rgba(14,165,233,0.3)", paddingHorizontal: 10, paddingVertical: 5 }}>
                        <Text style={{ fontSize: 12, color: "#38bdf8", fontWeight: "700" }}>📧 Send</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Events tab */}
        {tab === "events" && (
          <View style={S.section}>
            {/* Create event form */}
            <View style={S.createCard}>
              <Text style={S.createTitle}>Add Zoom Call / Event</Text>
              {[
                { label: "Title *", value: evtTitle, set: setEvtTitle, placeholder: "Weekly Zoom Call" },
                { label: "Description", value: evtDesc, set: setEvtDesc, placeholder: "Optional details" },
                { label: "Date (DD/MM/YYYY) *", value: evtDate, set: setEvtDate, placeholder: "02/06/2026" },
                { label: "Time (HH:MM) *", value: evtTime, set: setEvtTime, placeholder: "14:00" },
                { label: "Timezone", value: evtTZ, set: setEvtTZ, placeholder: "UTC+8" },
                { label: "Join Link (Zoom/URL)", value: evtLink, set: setEvtLink, placeholder: "https://zoom.us/j/..." },
              ].map(f => (
                <TextInput key={f.label} style={[S.input, { marginTop: 8 }]}
                  value={f.value} onChangeText={f.set}
                  placeholder={f.placeholder} placeholderTextColor="#475569"
                  autoCorrect={false} autoCapitalize="none" />
              ))}

              {/* Type picker */}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                {(["zoom", "webinar", "event"] as const).map(t => (
                  <TouchableOpacity key={t} onPress={() => setEvtType(t)} activeOpacity={0.8}
                    style={{ flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center",
                      backgroundColor: evtType === t ? "#f59e0b" : "#0f172a",
                      borderWidth: 1, borderColor: evtType === t ? "#f59e0b" : "#334155" }}>
                    <Text style={{ color: evtType === t ? "#0f172a" : "#64748b", fontSize: 12, fontWeight: "700", textTransform: "capitalize" }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[S.createBtn, (creatingEvt || !evtTitle.trim()) && S.createBtnDisabled]}
                onPress={handleCreateEvent} activeOpacity={0.85}
                disabled={creatingEvt || !evtTitle.trim()}>
                {creatingEvt
                  ? <ActivityIndicator color="#0f172a" size="small" />
                  : <Text style={S.createBtnText}>Add Event</Text>}
              </TouchableOpacity>
            </View>

            {/* Event list */}
            {eventsLoading ? (
              <ActivityIndicator color="#f59e0b" style={{ marginTop: 16 }} />
            ) : adminEvents.length === 0 ? (
              <Text style={S.emptyText}>No events yet.</Text>
            ) : (
              adminEvents.map(ev => (
                <View key={ev.id} style={[S.codeCard, { flexDirection: "column", gap: 6 }]}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={S.codeText}>{ev.type === "zoom" ? "📹" : ev.type === "webinar" ? "🎓" : "📅"} {ev.title}</Text>
                      {ev.description ? <Text style={S.codeDesc}>{ev.description}</Text> : null}
                      <Text style={S.codeDate}>{new Date(ev.eventDate).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"2-digit", hour:"2-digit", minute:"2-digit" })} {ev.timezone}</Text>
                      {ev.link ? <Text style={[S.codeDesc, { color: "#60a5fa" }]} numberOfLines={1}>{ev.link}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => Alert.alert("Delete Event", `Remove "${ev.title}"?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deleteEvent.mutate({ id: ev.id }) },
                    ])} style={{ padding: 6 }}>
                      <Text style={{ fontSize: 18, color: "#ef4444" }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Diagnostics tab */}
        {tab === "diag" && (
          <View style={[S.section, { gap: 10 }]}>

            {/* Server status card */}
            <View style={S.createCard}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={S.createTitle}>Server Status</Text>
                <TouchableOpacity onPress={() => { const s = Date.now(); refetchDiag().then(() => setPingMs(Date.now() - s)); }} activeOpacity={0.7}>
                  <Text style={{ color: "#64748b", fontSize: 13 }}>Refresh</Text>
                </TouchableOpacity>
              </View>
              {diagLoading ? (
                <ActivityIndicator color="#f59e0b" />
              ) : diagError ? (
                <View style={{ backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" }}>
                  <Text style={{ color: "#f87171", fontSize: 13, fontWeight: "700" }}>❌ Server Unreachable</Text>
                  <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{diagError.message}</Text>
                  <Text style={{ color: "#64748b", fontSize: 11, marginTop: 8, lineHeight: 17 }}>
                    Possible causes:{"\n"}• Railway service is sleeping (free tier cold start ~30s){"\n"}• Wrong API URL in EXPO_PUBLIC_API_BASE_URL{"\n"}• Server crashed — check Railway Logs tab
                  </Text>
                </View>
              ) : diagData ? (
                <View style={{ gap: 8 }}>
                  <View style={{ backgroundColor: "rgba(74,222,128,0.08)", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 20 }}>✅</Text>
                    <Text style={{ color: "#4ade80", fontSize: 14, fontWeight: "700" }}>Server Online</Text>
                    {pingMs !== null && <Text style={{ color: "#64748b", fontSize: 12 }}>{pingMs}ms</Text>}
                  </View>
                  {[
                    { label: "Server Time", value: new Date(diagData.serverTime).toLocaleString() },
                    { label: "Uptime", value: `${diagData.uptimeMinutes} minutes` },
                    { label: "Environment", value: diagData.env },
                    { label: "Node.js", value: diagData.nodeVersion },
                  ].map(row => (
                    <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#1e293b" }}>
                      <Text style={{ color: "#64748b", fontSize: 13 }}>{row.label}</Text>
                      <Text style={{ color: "#e2e8f0", fontSize: 13, fontWeight: "600" }}>{row.value}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {/* Common issues */}
            <View style={S.createCard}>
              <Text style={[S.createTitle, { marginBottom: 14 }]}>Common Issues & Fixes</Text>
              {[
                {
                  icon: "🔄", title: "App shows stale or missing data",
                  fix: "Go to Settings → Diagnostics → Refresh Everything. This clears all cached queries and reloads from the server.",
                },
                {
                  icon: "😴", title: "Server takes 20–30s to respond",
                  fix: "Railway free tier sleeps after inactivity. First request wakes it up. Upgrade to a paid Railway plan to keep it always-on.",
                },
                {
                  icon: "🔐", title: "Admin panel not visible in Settings",
                  fix: "OWNER_OPEN_ID in Railway must match your login email exactly. Open Settings once after setting it — claimAdmin runs automatically.",
                },
                {
                  icon: "📧", title: "OTP emails not arriving",
                  fix: "Check FROM_EMAIL and RESEND_API_KEY in Railway variables. In dev, the OTP prints to the server terminal instead.",
                },
                {
                  icon: "📹", title: "YouTube shows only 4 old videos",
                  fix: "The server-side RSS proxy may be slow. Pull to refresh on the Videos tab. If it persists, check Railway logs for errors in the feed router.",
                },
                {
                  icon: "⚪", title: "Blank screen or app frozen",
                  fix: "Force-close and reopen the app. If that fails, go to Settings → Diagnostics → Refresh Everything to reset all query state.",
                },
              ].map((item, i) => (
                <View key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottomWidth: i < 5 ? 1 : 0, borderBottomColor: "#1e293b" }}>
                  <Text style={{ color: "#e2e8f0", fontSize: 14, fontWeight: "700", marginBottom: 4 }}>{item.icon} {item.title}</Text>
                  <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>→ {item.fix}</Text>
                </View>
              ))}
            </View>

          </View>
        )}

      </ScrollView>

      {/* Send Code via Email Modal */}
      <Modal
        visible={sendModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => !sending && setSendModal(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 24 }}
          onPress={() => { if (!sending) setSendModal(null); }}
        >
          <Pressable onPress={() => {}}>
            <View style={{ backgroundColor: "#1e293b", borderRadius: 18, borderWidth: 1, borderColor: "#334155", padding: 20, gap: 0 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#f1f5f9", marginBottom: 16 }}>📧 Send Activation Code</Text>

              {/* Email field */}
              <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Recipient Email</Text>
              <TextInput
                style={S.input}
                value={sendModal?.email ?? ""}
                onChangeText={(v) => setSendModal((prev) => prev ? { ...prev, email: v } : prev)}
                placeholder="member@email.com"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!sending}
              />

              {/* Code picker */}
              <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", marginTop: 16, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Select Code {sendModal?.code ? `— ${sendModal.code}` : "(tap to select)"}
              </Text>
              {freeCodes.length === 0 ? (
                <View style={{ backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" }}>
                  <Text style={{ color: "#f87171", fontSize: 13 }}>No free codes available. Create one in the Codes tab first.</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {freeCodes.map((c) => {
                      const selected = sendModal?.code === c.code;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => setSendModal((prev) => prev ? { ...prev, code: c.code } : prev)}
                          activeOpacity={0.8}
                          style={{ borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5,
                            backgroundColor: selected ? "#f59e0b" : "#0f172a",
                            borderColor: selected ? "#f59e0b" : "#334155" }}>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: selected ? "#0f172a" : "#94a3b8", letterSpacing: 0.5 }}>{c.code}</Text>
                          {c.description ? (
                            <Text style={{ fontSize: 11, color: selected ? "rgba(0,0,0,0.5)" : "#475569", marginTop: 2 }}>{c.description}</Text>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}

              {/* Send button */}
              <TouchableOpacity
                style={[S.createBtn, { marginTop: 20 },
                  (!sendModal?.email.trim() || !sendModal?.code || sending || freeCodes.length === 0) && S.createBtnDisabled]}
                onPress={handleSendCode}
                activeOpacity={0.85}
                disabled={!sendModal?.email.trim() || !sendModal?.code || sending || freeCodes.length === 0}>
                {sending
                  ? <ActivityIndicator color="#0f172a" size="small" />
                  : <Text style={S.createBtnText}>Send Activation Code</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { if (!sending) setSendModal(null); }} style={{ marginTop: 12, alignItems: "center" }}>
                <Text style={{ color: "#64748b", fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </ScreenContainer>
  );
}

function StatCard({ label, value, color = "#e2e8f0" }: { label: string; value: number; color?: string }) {
  return (
    <View style={S.statCard}>
      <Text style={[S.statValue, { color }]}>{value}</Text>
      <Text style={S.statLabel}>{label}</Text>
    </View>
  );
}

const S = {
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backArrow: { fontSize: 22, color: "#e2e8f0" },
  headerTitle: { fontSize: 22, fontWeight: "700" as const, color: "#e2e8f0", flex: 1 },
  statsRow: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 12,
    alignItems: "center" as const,
    gap: 2,
  },
  statValue: { fontSize: 22, fontWeight: "700" as const },
  statLabel: { fontSize: 10, color: "#64748b", fontWeight: "600" as const, letterSpacing: 0.5 },
  tabRow: {
    flexDirection: "row" as const,
    marginHorizontal: 24,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  tabBtn: { flex: 1, borderRadius: 9, paddingVertical: 10, alignItems: "center" as const },
  tabBtnActive: { backgroundColor: "#0f172a" },
  tabLabel: { fontSize: 14, fontWeight: "600" as const, color: "#64748b" },
  tabLabelActive: { color: "#e2e8f0" },
  section: { paddingHorizontal: 16, gap: 8 },
  emptyText: { color: "#64748b", fontSize: 15, textAlign: "center" as const, marginTop: 24 },
  // User cards
  userCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 14,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
  },
  userName: { fontSize: 15, fontWeight: "600" as const, color: "#e2e8f0" },
  userEmail: { fontSize: 13, color: "#64748b" },
  codeChip: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: "600" as const,
    backgroundColor: "rgba(245,158,11,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trialDays: { fontSize: 11, color: "#94a3b8", fontWeight: "500" as const },
  joinDate: { fontSize: 12, color: "#475569" },
  // Create card
  createCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 16,
    gap: 0,
    marginBottom: 8,
  },
  createTitle: { fontSize: 15, fontWeight: "700" as const, color: "#e2e8f0", marginBottom: 12 },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#f1f5f9",
  },
  createBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center" as const,
    marginTop: 12,
    minHeight: 46,
    justifyContent: "center" as const,
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { fontSize: 15, fontWeight: "700" as const, color: "#0f172a" },
  // Code cards
  codeCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  codeText: { fontSize: 15, fontWeight: "700" as const, color: "#e2e8f0", letterSpacing: 0.5 },
  codeDesc: { fontSize: 13, color: "#94a3b8" },
  codeDate: { fontSize: 12, color: "#475569" },
  usedBadge: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
  },
  usedBadgeUsed: { backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" },
  usedBadgeFree: { backgroundColor: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.25)" },
  usedBadgeText: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.5 },
  usedBadgeTextUsed: { color: "#f87171" },
  usedBadgeTextFree: { color: "#4ade80" },
};
