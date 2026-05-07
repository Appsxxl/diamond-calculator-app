import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import * as Haptics from "expo-haptics";

// ─── Types ────────────────────────────────────────────────────────────────────
interface YouTubeVideo {
  id: string;
  title: string;
  duration: string;
  views: string;
  age: string;
}

interface VimeoVideo {
  id: string;
  title: string;
  age: string;
}

// ─── Vimeo fallback (shown if live fetch fails) ──────────────────────────────
const VIMEO_FALLBACK: VimeoVideo[] = [
  { id: "1146526988", title: "JPP1 — Invitation",        age: "" },
  { id: "1146537304", title: "JPP2 — Presentation",      age: "" },
  { id: "1150833840", title: "JPP3 — Compensation Plan", age: "" },
];

// ─── Static YouTube fallback (shown while API loads) ─────────────────────────
const YOUTUBE_FALLBACK: YouTubeVideo[] = [
  {
    id: "HJv57bZsyus",
    title: "Mike Lang beantwortet die wichtigsten Diamanten-Fragen",
    duration: "",
    views: "",
    age: "",
  },
  {
    id: "gzK_3CmirAI",
    title: "Alle Antworten zu STIG International Diamonds | Patrick Stöger CEO",
    duration: "",
    views: "",
    age: "",
  },
  {
    id: "cP7iNzX1bTo",
    title: "Luxury Assets Home Ownership Diamond Plan",
    duration: "0:41",
    views: "31",
    age: "",
  },
  {
    id: "3FZkUEDsSkQ",
    title: "Ai is there! Do you have a PLAN B ↓ Save a Job! 🔥 Residual plan A",
    duration: "1:40",
    views: "20",
    age: "",
  },
];

const CHANNEL_ID = "UCXh1ElqY3LpawTWvCOW6pUA"; // Real channel ID for @wealthpreservation101
const CHANNEL_URL = "https://www.youtube.com/@wealthpreservation101";
const VIMEO_CHANNEL_URL = "https://vimeo.com/diamondsolution";

// ─── Translations ─────────────────────────────────────────────────────────────
const TEXT: Record<string, {
  title: string;
  subtitle: string;
  watchVideo: string;
  watchVimeo: string;
  subscribeBtn: string;
  channelName: string;
  channelDesc: string;
  views: string;
  latestVideos: string;
  companyVideos: string;
  companyDesc: string;
  openError: string;
  vimeoChannelBtn: string;
}> = {
  en: {
    title: "📺 VIDEOS",
    subtitle: "Educational content on wealth preservation and official company presentations.",
    watchVideo: "▶ Watch on YouTube",
    watchVimeo: "▶ Watch on Vimeo",
    subscribeBtn: "🔔 Subscribe to Channel",
    channelName: "Wealth Preservation",
    channelDesc: "Your premier destination for mastering the art of wealth preservation and advanced financial strategy.",
    views: "views",
    latestVideos: "YOUTUBE — LATEST VIDEOS",
    companyVideos: "DIAMOND SOLUTION — OFFICIAL PRESENTATIONS",
    companyDesc: "Official company videos from Diamond Solution. Share these with prospects to explain the plan.",
    openError: "Could not open video. Please try again.",
    vimeoChannelBtn: "🎬 View All on Vimeo",
  },
  nl: {
    title: "📺 VIDEO'S",
    subtitle: "Educatieve content en officiële bedrijfspresentaties.",
    watchVideo: "▶ Bekijk op YouTube",
    watchVimeo: "▶ Bekijk op Vimeo",
    subscribeBtn: "🔔 Abonneer op Kanaal",
    channelName: "Wealth Preservation",
    channelDesc: "Uw beste bestemming voor vermogensbehoud en geavanceerde financiële strategie.",
    views: "weergaven",
    latestVideos: "YOUTUBE — NIEUWSTE VIDEO'S",
    companyVideos: "DIAMOND SOLUTION — OFFICIËLE PRESENTATIES",
    companyDesc: "Officiële bedrijfsvideo's van Diamond Solution. Deel deze met prospects om het plan uit te leggen.",
    openError: "Kon video niet openen. Probeer het opnieuw.",
    vimeoChannelBtn: "🎬 Alles bekijken op Vimeo",
  },
  de: {
    title: "📺 VIDEOS",
    subtitle: "Bildungsinhalte und offizielle Unternehmenspräsentationen.",
    watchVideo: "▶ Auf YouTube ansehen",
    watchVimeo: "▶ Auf Vimeo ansehen",
    subscribeBtn: "🔔 Kanal abonnieren",
    channelName: "Wealth Preservation",
    channelDesc: "Ihr erstklassiges Ziel für Vermögenserhaltung und fortgeschrittene Finanzstrategie.",
    views: "Aufrufe",
    latestVideos: "YOUTUBE — NEUESTE VIDEOS",
    companyVideos: "DIAMOND SOLUTION — OFFIZIELLE PRÄSENTATIONEN",
    companyDesc: "Offizielle Unternehmensvideos von Diamond Solution. Teilen Sie diese mit Interessenten.",
    openError: "Video konnte nicht geöffnet werden. Bitte versuchen Sie es erneut.",
    vimeoChannelBtn: "🎬 Alle auf Vimeo ansehen",
  },
  fr: {
    title: "📺 VIDÉOS",
    subtitle: "Contenu éducatif et présentations officielles de l'entreprise.",
    watchVideo: "▶ Regarder sur YouTube",
    watchVimeo: "▶ Regarder sur Vimeo",
    subscribeBtn: "🔔 S'abonner à la chaîne",
    channelName: "Wealth Preservation",
    channelDesc: "Votre destination de premier choix pour la préservation du patrimoine et la stratégie financière avancée.",
    views: "vues",
    latestVideos: "YOUTUBE — DERNIÈRES VIDÉOS",
    companyVideos: "DIAMOND SOLUTION — PRÉSENTATIONS OFFICIELLES",
    companyDesc: "Vidéos officielles de Diamond Solution. Partagez-les avec vos prospects pour expliquer le plan.",
    openError: "Impossible d'ouvrir la vidéo. Veuillez réessayer.",
    vimeoChannelBtn: "🎬 Tout voir sur Vimeo",
  },
  es: {
    title: "📺 VIDEOS",
    subtitle: "Contenido educativo y presentaciones oficiales de la empresa.",
    watchVideo: "▶ Ver en YouTube",
    watchVimeo: "▶ Ver en Vimeo",
    subscribeBtn: "🔔 Suscribirse al Canal",
    channelName: "Wealth Preservation",
    channelDesc: "Su destino principal para dominar el arte de la preservación de la riqueza y la estrategia financiera avanzada.",
    views: "vistas",
    latestVideos: "YOUTUBE — ÚLTIMOS VIDEOS",
    companyVideos: "DIAMOND SOLUTION — PRESENTACIONES OFICIALES",
    companyDesc: "Videos oficiales de Diamond Solution. Compártalos con prospectos para explicar el plan.",
    openError: "No se pudo abrir el video. Por favor, inténtelo de nuevo.",
    vimeoChannelBtn: "🎬 Ver todo en Vimeo",
  },
  ru: {
    title: "📺 ВИДЕО",
    subtitle: "Образовательный контент и официальные корпоративные презентации.",
    watchVideo: "▶ Смотреть на YouTube",
    watchVimeo: "▶ Смотреть на Vimeo",
    subscribeBtn: "🔔 Подписаться на канал",
    channelName: "Wealth Preservation",
    channelDesc: "Ваш лучший источник для освоения искусства сохранения капитала и продвинутых финансовых стратегий.",
    views: "просмотров",
    latestVideos: "YOUTUBE — ПОСЛЕДНИЕ ВИДЕО",
    companyVideos: "DIAMOND SOLUTION — ОФИЦИАЛЬНЫЕ ПРЕЗЕНТАЦИИ",
    companyDesc: "Официальные видео Diamond Solution. Делитесь ими с потенциальными партнёрами.",
    openError: "Не удалось открыть видео. Пожалуйста, попробуйте снова.",
    vimeoChannelBtn: "🎬 Смотреть всё на Vimeo",
  },
  zh: {
    title: "📺 视频",
    subtitle: "关于财富保值的教育内容和官方公司演示。",
    watchVideo: "▶ 在YouTube上观看",
    watchVimeo: "▶ 在Vimeo上观看",
    subscribeBtn: "🔔 订阅频道",
    channelName: "Wealth Preservation",
    channelDesc: "您掌握财富保值艺术和高级财务策略的首选目的地。",
    views: "次观看",
    latestVideos: "YOUTUBE — 最新视频",
    companyVideos: "DIAMOND SOLUTION — 官方演示",
    companyDesc: "Diamond Solution的官方视频。与潜在合作伙伴分享以解释计划。",
    openError: "无法打开视频，请重试。",
    vimeoChannelBtn: "🎬 在Vimeo上查看全部",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getThumbUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Vimeo thumbnail via oEmbed (no API key needed)
function getVimeoThumbUrl(videoId: string) {
  return `https://vumbnail.com/${videoId}.jpg`;
}

async function openUrl(url: string, errorMsg: string) {
  try {
    if (Platform.OS === "web") {
      window.open(url, "_blank");
      return;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", errorMsg);
    }
  } catch {
    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      Alert.alert("Error", errorMsg);
    }
  }
}

// ─── YouTube Auto-Sync Hook ───────────────────────────────────────────────────
// Uses YouTube RSS feed (no API key required) to auto-fetch latest videos.
// New videos published to the channel appear automatically — no code changes needed.
function useYouTubeVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>(YOUTUBE_FALLBACK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchFeed() {
      setLoading(true);
      try {
        const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
        // On web, use a CORS proxy; on native, fetch directly
        const fetchUrl = Platform.OS === "web"
          ? `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`
          : RSS_URL;

        const res = await fetch(fetchUrl, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error("RSS fetch failed");

        let xmlText: string;
        if (Platform.OS === "web") {
          const json = await res.json();
          xmlText = json.contents as string;
        } else {
          xmlText = await res.text();
        }

        // Parse XML entries
        const parsed: YouTubeVideo[] = [];
        const entryRegex = /<entry>(.*?)<\/entry>/gs;
        let match: RegExpExecArray | null;
        while ((match = entryRegex.exec(xmlText)) !== null) {
          const entry = match[1];
          const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
          const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
          const pubMatch = entry.match(/<published>([^<]+)<\/published>/);
          if (!idMatch || !titleMatch) continue;

          const pubDate = pubMatch ? new Date(pubMatch[1]) : new Date();
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - pubDate.getTime()) / 86400000);
          const age = diffDays === 0 ? "Today"
            : diffDays < 7 ? `${diffDays} days ago`
            : diffDays < 30 ? `${Math.floor(diffDays / 7)} weeks ago`
            : diffDays < 365 ? `${Math.floor(diffDays / 30)} months ago`
            : `${Math.floor(diffDays / 365)} years ago`;

          parsed.push({
            id: idMatch[1],
            title: titleMatch[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
            duration: "",
            views: "",
            age,
          });
        }

        if (!cancelled && parsed.length > 0) {
          setVideos(parsed);
        } else if (!cancelled) {
          setVideos(YOUTUBE_FALLBACK);
        }
      } catch {
        if (!cancelled) setVideos(YOUTUBE_FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFeed();
    return () => { cancelled = true; };
  }, []);

  return { videos, loading };
}

// Auto-fetches all public videos from vimeo.com/diamondsolution on every load.
// No API key needed — uses the public RSS feed.
function useVimeoVideos() {
  const [videos, setVideos] = useState<VimeoVideo[]>(VIMEO_FALLBACK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchFeed() {
      setLoading(true);
      try {
        const RSS_URL = "https://vimeo.com/diamondsolution/videos/rss";
        const fetchUrl = Platform.OS === "web"
          ? `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`
          : RSS_URL;

        const res = await fetch(fetchUrl, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error("RSS fetch failed");

        let xmlText: string;
        if (Platform.OS === "web") {
          const json = await res.json();
          xmlText = json.contents as string;
        } else {
          xmlText = await res.text();
        }

        const parsed: VimeoVideo[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match: RegExpExecArray | null;
        while ((match = itemRegex.exec(xmlText)) !== null) {
          const item = match[1];
          const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
          const linkMatch = item.match(/vimeo\.com\/(\d+)/);
          const pubMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/);
          if (!titleMatch || !linkMatch) continue;

          const pubDate = pubMatch ? new Date(pubMatch[1]) : new Date();
          const diffDays = Math.floor((Date.now() - pubDate.getTime()) / 86400000);
          const age = diffDays === 0 ? "Today"
            : diffDays < 7  ? `${diffDays}d ago`
            : diffDays < 30 ? `${Math.floor(diffDays / 7)}w ago`
            : diffDays < 365 ? `${Math.floor(diffDays / 30)}mo ago`
            : `${Math.floor(diffDays / 365)}y ago`;

          parsed.push({
            id: linkMatch[1],
            title: titleMatch[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim(),
            age,
          });
        }

        if (!cancelled) setVideos(parsed.length > 0 ? parsed : VIMEO_FALLBACK);
      } catch {
        if (!cancelled) setVideos(VIMEO_FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFeed();
    return () => { cancelled = true; };
  }, []);

  return { videos, loading };
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VideosScreen() {
  const { language } = useCalculator();
  const tx = TEXT[language] ?? TEXT.en;
  const { videos: ytVideos, loading: ytLoading } = useYouTubeVideos();
  const { videos: vimeoVideos, loading: vimeoLoading } = useVimeoVideos();

  const handleYouTubePress = useCallback((videoId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openUrl(`https://www.youtube.com/watch?v=${videoId}`, tx.openError);
  }, [tx.openError]);

  const handleVimeoPress = useCallback((videoId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openUrl(`https://vimeo.com/${videoId}`, tx.openError);
  }, [tx.openError]);

  const handleSubscribe = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openUrl(CHANNEL_URL, tx.openError);
  }, [tx.openError]);

  const handleVimeoChannel = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openUrl(VIMEO_CHANNEL_URL, tx.openError);
  }, [tx.openError]);

  return (
    <ScreenContainer bgColor="#0f172a">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>{tx.title}</Text>
          <Text style={S.headerSub}>{tx.subtitle}</Text>
        </View>

        {/* ── SECTION 1: Diamond Solution Official Vimeo Videos ── */}
        <View style={S.sectionBlock}>
          <View style={S.sectionHeaderRow}>
            <View style={S.vimeoLogoWrap}>
              <Text style={S.vimeoLogoText}>💎</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.sectionLabel}>{tx.companyVideos}</Text>
              <Text style={S.sectionDesc}>{tx.companyDesc}</Text>
            </View>
          </View>

          {/* Vimeo video cards — live from vimeo.com/diamondsolution */}
          {vimeoLoading ? (
            <ActivityIndicator color="#0ea5e9" style={{ marginVertical: 20 }} />
          ) : (
            vimeoVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={S.vimeoCard}
                onPress={() => handleVimeoPress(video.id)}
                activeOpacity={0.85}
              >
                <View style={S.vimeoThumbWrap}>
                  <Image
                    source={{ uri: getVimeoThumbUrl(video.id) }}
                    style={S.vimeoThumb}
                    resizeMode="cover"
                  />
                  <View style={S.playOverlay}>
                    <View style={[S.playBtn, { backgroundColor: "rgba(26,35,126,0.9)" }]}>
                      <Text style={S.playIcon}>▶</Text>
                    </View>
                  </View>
                </View>
                <View style={S.vimeoInfo}>
                  <Text style={S.vimeoTitle}>{video.title}</Text>
                  {video.age ? <Text style={S.watchVimeoText}>{video.age}</Text> : null}
                  <Text style={[S.watchVimeoText, { color: "#0ea5e9" }]}>{tx.watchVimeo}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Vimeo channel link */}
          <TouchableOpacity style={S.vimeoChannelBtn} onPress={handleVimeoChannel} activeOpacity={0.85}>
            <Text style={S.vimeoChannelBtnText}>{tx.vimeoChannelBtn}</Text>
          </TouchableOpacity>
        </View>

        {/* ── SECTION 2: YouTube Channel ── */}
        <View style={S.sectionBlock}>
          {/* Channel Card */}
          <View style={S.channelCard}>
            <View style={S.channelLogoWrap}>
              <Text style={S.channelLogoText}>📺</Text>
            </View>
            <View style={S.channelInfo}>
              <Text style={S.channelName}>{tx.channelName}</Text>
              <Text style={S.channelHandle}>@wealthpreservation101</Text>
              <Text style={S.channelDesc} numberOfLines={2}>{tx.channelDesc}</Text>
            </View>
          </View>

          {/* Subscribe Button */}
          <TouchableOpacity style={S.subscribeBtn} onPress={handleSubscribe} activeOpacity={0.85}>
            <Text style={S.subscribeBtnText}>{tx.subscribeBtn}</Text>
          </TouchableOpacity>

          {/* YouTube Videos */}
          <Text style={[S.sectionLabel, { marginTop: 20, marginBottom: 12 }]}>{tx.latestVideos}</Text>

          {ytLoading ? (
            <ActivityIndicator color="#f59e0b" style={{ marginVertical: 20 }} />
          ) : (
            ytVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={S.videoCard}
                onPress={() => handleYouTubePress(video.id)}
                activeOpacity={0.85}
              >
                <View style={S.thumbWrap}>
                  <Image
                    source={{ uri: getThumbUrl(video.id) }}
                    style={S.thumb}
                    resizeMode="cover"
                  />
                  <View style={S.durationBadge}>
                    <Text style={S.durationText}>{video.duration}</Text>
                  </View>
                  <View style={S.playOverlay}>
                    <View style={S.playBtn}>
                      <Text style={S.playIcon}>▶</Text>
                    </View>
                  </View>
                </View>
                <View style={S.videoInfo}>
                  <Text style={S.videoTitle} numberOfLines={2}>{video.title}</Text>
                  <View style={S.videoMeta}>
                    <Text style={S.videoMetaText}>{video.views} {tx.views}</Text>
                    <Text style={S.videoMetaDot}>·</Text>
                    <Text style={S.videoMetaText}>{video.age}</Text>
                  </View>
                  <Text style={S.watchText}>{tx.watchVideo}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f1f5f9",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
  },

  // Section blocks
  sectionBlock: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748b",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 18,
  },

  // Vimeo logo
  vimeoLogoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a237e22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#3949ab",
    marginTop: 2,
  },
  vimeoLogoText: { fontSize: 22 },

  // Language tabs
  langTabScroll: { marginBottom: 14 },
  langTabRow: { flexDirection: "row", gap: 8, paddingRight: 8 },
  langTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  langTabActive: {
    backgroundColor: "#3949ab",
    borderColor: "#5c6bc0",
  },
  langTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  langTabTextActive: {
    color: "#fff",
  },

  // Vimeo card
  vimeoCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  vimeoThumbWrap: {
    width: "100%",
    height: 180,
    backgroundColor: "#0f172a",
    position: "relative",
  },
  vimeoThumb: { width: "100%", height: "100%" },
  vimeoInfo: { padding: 12, gap: 6 },
  vimeoTitleRow: { flexDirection: "row", alignItems: "center" },
  typeBadgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  vimeoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#f1f5f9",
    lineHeight: 21,
  },
  watchVimeoText: {
    fontSize: 13,
    color: "#5c6bc0",
    fontWeight: "bold",
    marginTop: 2,
  },

  // Vimeo channel button
  vimeoChannelBtn: {
    backgroundColor: "#1a237e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#3949ab",
  },
  vimeoChannelBtnText: {
    color: "#c5cae9",
    fontWeight: "bold",
    fontSize: 15,
  },

  // YouTube channel card
  channelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
  },
  channelLogoWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  channelLogoText: { fontSize: 26 },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 16, fontWeight: "bold", color: "#f1f5f9" },
  channelHandle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  channelDesc: { fontSize: 13, color: "#94a3b8", marginTop: 4, lineHeight: 18 },

  // Subscribe button
  subscribeBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  subscribeBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  // YouTube video card
  videoCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  thumbWrap: {
    width: "100%",
    height: 200,
    backgroundColor: "#0f172a",
    position: "relative",
  },
  thumb: { width: "100%", height: "100%" },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  playOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(239,68,68,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { color: "#fff", fontSize: 20, marginLeft: 3 },
  videoInfo: { padding: 14, gap: 6 },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f1f5f9",
    lineHeight: 22,
  },
  videoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  videoMetaText: { fontSize: 13, color: "#64748b" },
  videoMetaDot: { fontSize: 13, color: "#334155" },
  watchText: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "bold",
    marginTop: 4,
  },
});
