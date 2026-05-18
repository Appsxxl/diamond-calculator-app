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
  useWindowDimensions,
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
  thumbnail?: string;
}

// ─── Vimeo fallback (empty — avoids showing wrong-language content when fetch fails) ──
const VIMEO_FALLBACK: VimeoVideo[] = [];

// Keywords matched against video titles to select the right language version.
// Title format on Vimeo: "JPP1 - deutsch - Invitation DE"
// Word-boundary regex prevents short codes like "EN" matching inside other words.
const VIMEO_LANG_KEYWORDS: Record<string, string[]> = {
  en: ["english", "EN"],
  nl: ["nederlands", "dutch", "NL"],
  de: ["deutsch", "german", "DE"],
  fr: ["francais", "français", "french", "FR"],
  es: ["espanol", "español", "spanish", "ES"],
  it: ["italiano", "italian", "IT"],
  ru: ["русский", "russian", "RU"],
  zh: ["中文", "chinese", "mandarin", "ZH"],
  tl: ["filipino", "tagalog", "TL"],
  pt: ["portugues", "português", "portuguese", "PT"],
  ar: ["العربية", "arabic", "AR"],
  th: ["ไทย", "thai", "TH"],
  hi: ["हिंदी", "hindi", "HI"],
  vi: ["tiếng việt", "vietnamese", "VI"],
  sr: ["srpski", "serbian", "SRB"],
  hu: ["magyar", "hungarian", "HU"],
  ro: ["romanesc", "română", "romanian", "RO"],
  cs: ["cesky", "česky", "czech", "CZ"],
  sk: ["slovenský", "slovensky", "slovak", "SK"],
};

function matchKeywords(videos: VimeoVideo[], keywords: string[]): VimeoVideo[] {
  return videos.filter((v) =>
    keywords.some((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(v.title);
    })
  );
}

function filterByLanguage(videos: VimeoVideo[], language: string): VimeoVideo[] {
  const keywords = VIMEO_LANG_KEYWORDS[language];
  if (keywords) {
    const matched = matchKeywords(videos, keywords);
    if (matched.length > 0) return matched;
  }
  // Fallback to English if no videos in the selected language
  if (language !== "en") {
    const enMatched = matchKeywords(videos, VIMEO_LANG_KEYWORDS["en"]);
    if (enMatched.length > 0) return enMatched;
  }
  return [];
}

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
  refreshBtn: string;
  comingSoonTitle: string;
  comingSoonDesc: string;
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
    refreshBtn: "↻ Refresh Videos",
    comingSoonTitle: "Videos Coming Soon",
    comingSoonDesc: "Presentations in your language are being prepared. Use the button below to view all available videos on Vimeo.",
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
    refreshBtn: "↻ Video's vernieuwen",
    comingSoonTitle: "Video's binnenkort beschikbaar",
    comingSoonDesc: "Presentaties in uw taal worden voorbereid. Gebruik de knop hieronder om alle beschikbare video's op Vimeo te bekijken.",
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
    refreshBtn: "↻ Videos aktualisieren",
    comingSoonTitle: "Videos kommen bald",
    comingSoonDesc: "Präsentationen in Ihrer Sprache werden vorbereitet. Klicken Sie unten, um alle verfügbaren Videos auf Vimeo anzusehen.",
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
    refreshBtn: "↻ Actualiser les vidéos",
    comingSoonTitle: "Vidéos bientôt disponibles",
    comingSoonDesc: "Des présentations dans votre langue sont en cours de préparation. Utilisez le bouton ci-dessous pour voir toutes les vidéos disponibles sur Vimeo.",
  },
  it: {
    title: "📺 VIDEO",
    subtitle: "Contenuti educativi e presentazioni ufficiali dell'azienda.",
    watchVideo: "▶ Guarda su YouTube",
    watchVimeo: "▶ Guarda su Vimeo",
    subscribeBtn: "🔔 Iscriviti al Canale",
    channelName: "Wealth Preservation",
    channelDesc: "La tua destinazione principale per padroneggiare l'arte della preservazione del patrimonio e la strategia finanziaria avanzata.",
    views: "visualizzazioni",
    latestVideos: "YOUTUBE — ULTIMI VIDEO",
    companyVideos: "DIAMOND SOLUTION — PRESENTAZIONI UFFICIALI",
    companyDesc: "Video ufficiali di Diamond Solution. Condividili con i prospect per spiegare il piano.",
    openError: "Impossibile aprire il video. Per favore riprova.",
    vimeoChannelBtn: "🎬 Visualizza Tutto su Vimeo",
    refreshBtn: "↻ Aggiorna Video",
    comingSoonTitle: "Video in arrivo",
    comingSoonDesc: "Le presentazioni nella tua lingua sono in preparazione. Usa il pulsante qui sotto per vedere tutti i video disponibili su Vimeo.",
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
    refreshBtn: "↻ Actualizar videos",
    comingSoonTitle: "Vídeos próximamente",
    comingSoonDesc: "Las presentaciones en su idioma están siendo preparadas. Use el botón de abajo para ver todos los vídeos disponibles en Vimeo.",
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
    refreshBtn: "↻ Обновить видео",
    comingSoonTitle: "Видео скоро появятся",
    comingSoonDesc: "Презентации на вашем языке готовятся. Нажмите кнопку ниже, чтобы посмотреть все доступные видео на Vimeo.",
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
    refreshBtn: "↻ 刷新视频",
    comingSoonTitle: "视频即将推出",
    comingSoonDesc: "您语言的演示文稿正在准备中。使用下方按钮查看Vimeo上的所有可用视频。",
  },
  tl: {
    title: "📺 MGA VIDEO",
    subtitle: "Pang-edukasyong nilalaman at opisyal na presentasyon ng kumpanya.",
    watchVideo: "▶ Panoorin sa YouTube",
    watchVimeo: "▶ Panoorin sa Vimeo",
    subscribeBtn: "🔔 Mag-subscribe sa Channel",
    channelName: "Wealth Preservation",
    channelDesc: "Ang iyong pangunahing destinasyon para sa sining ng pangangalaga ng kayamanan at advanced na estratehiya sa pananalapi.",
    views: "mga panonood",
    latestVideos: "YOUTUBE — PINAKABAGONG MGA VIDEO",
    companyVideos: "DIAMOND SOLUTION — OPISYAL NA MGA PRESENTASYON",
    companyDesc: "Opisyal na mga video ng Diamond Solution. Ibahagi ito sa mga prospect upang ipaliwanag ang plano.",
    openError: "Hindi mabuksan ang video. Pakisubukan muli.",
    vimeoChannelBtn: "🎬 Tingnan Lahat sa Vimeo",
    refreshBtn: "↻ I-refresh ang Mga Video",
    comingSoonTitle: "Mga Video — Paparating Na",
    comingSoonDesc: "Ang mga presentasyon sa iyong wika ay inihahanda. Gamitin ang button sa ibaba para makita lahat ng available na video sa Vimeo.",
  },
  pt: {
    title: "📺 VÍDEOS",
    subtitle: "Conteúdo educativo e apresentações oficiais da empresa.",
    watchVideo: "▶ Assistir no YouTube",
    watchVimeo: "▶ Assistir no Vimeo",
    subscribeBtn: "🔔 Inscrever-se no Canal",
    channelName: "Wealth Preservation",
    channelDesc: "O seu destino principal para dominar a arte da preservação de riqueza e estratégia financeira avançada.",
    views: "visualizações",
    latestVideos: "YOUTUBE — ÚLTIMOS VÍDEOS",
    companyVideos: "DIAMOND SOLUTION — APRESENTAÇÕES OFICIAIS",
    companyDesc: "Vídeos oficiais da Diamond Solution. Partilhe com potenciais clientes para explicar o plano.",
    openError: "Não foi possível abrir o vídeo. Por favor, tente novamente.",
    vimeoChannelBtn: "🎬 Ver Tudo no Vimeo",
    refreshBtn: "↻ Actualizar Vídeos",
    comingSoonTitle: "Vídeos em Breve",
    comingSoonDesc: "As apresentações no seu idioma estão a ser preparadas. Use o botão abaixo para ver todos os vídeos disponíveis no Vimeo.",
  },
  ar: {
    title: "📺 مقاطع الفيديو",
    subtitle: "محتوى تعليمي وعروض تقديمية رسمية للشركة.",
    watchVideo: "▶ شاهد على YouTube",
    watchVimeo: "▶ شاهد على Vimeo",
    subscribeBtn: "🔔 اشترك في القناة",
    channelName: "Wealth Preservation",
    channelDesc: "وجهتك المثالية لإتقان فن الحفاظ على الثروة والاستراتيجية المالية المتقدمة.",
    views: "مشاهدات",
    latestVideos: "يوتيوب — أحدث الفيديوهات",
    companyVideos: "DIAMOND SOLUTION — العروض الرسمية",
    companyDesc: "مقاطع فيديو رسمية من Diamond Solution. شاركها مع العملاء المحتملين لشرح الخطة.",
    openError: "تعذر فتح الفيديو. يرجى المحاولة مجدداً.",
    vimeoChannelBtn: "🎬 عرض الكل على Vimeo",
    refreshBtn: "↻ تحديث الفيديوهات",
    comingSoonTitle: "قريباً — مقاطع الفيديو",
    comingSoonDesc: "يتم إعداد العروض التقديمية بلغتك. استخدم الزر أدناه لمشاهدة جميع مقاطع الفيديو المتاحة على Vimeo.",
  },
  th: {
    title: "📺 วิดีโอ",
    subtitle: "เนื้อหาด้านการศึกษาและการนำเสนออย่างเป็นทางการของบริษัท",
    watchVideo: "▶ ดูบน YouTube",
    watchVimeo: "▶ ดูบน Vimeo",
    subscribeBtn: "🔔 สมัครสมาชิกช่อง",
    channelName: "Wealth Preservation",
    channelDesc: "จุดหมายปลายทางชั้นนำของคุณสำหรับการเรียนรู้ศิลปะการรักษาความมั่งคั่งและกลยุทธ์ทางการเงินขั้นสูง",
    views: "ครั้งที่ดู",
    latestVideos: "YOUTUBE — วิดีโอล่าสุด",
    companyVideos: "DIAMOND SOLUTION — การนำเสนออย่างเป็นทางการ",
    companyDesc: "วิดีโอทางการของ Diamond Solution แชร์กับผู้มีโอกาสเป็นลูกค้าเพื่ออธิบายแผน",
    openError: "ไม่สามารถเปิดวิดีโอได้ กรุณาลองอีกครั้ง",
    vimeoChannelBtn: "🎬 ดูทั้งหมดบน Vimeo",
    refreshBtn: "↻ รีเฟรชวิดีโอ",
    comingSoonTitle: "วิดีโอกำลังจะมาเร็วๆ นี้",
    comingSoonDesc: "การนำเสนอในภาษาของคุณกำลังอยู่ระหว่างการเตรียม ใช้ปุ่มด้านล่างเพื่อดูวิดีโอทั้งหมดที่มีบน Vimeo",
  },
  hi: {
    title: "📺 वीडियो",
    subtitle: "धन संरक्षण पर शैक्षिक सामग्री और आधिकारिक कंपनी प्रस्तुतियाँ।",
    watchVideo: "▶ YouTube पर देखें",
    watchVimeo: "▶ Vimeo पर देखें",
    subscribeBtn: "🔔 चैनल सब्सक्राइब करें",
    channelName: "Wealth Preservation",
    channelDesc: "धन संरक्षण की कला और उन्नत वित्तीय रणनीति में महारत हासिल करने के लिए आपका प्रमुख गंतव्य।",
    views: "व्यूज़",
    latestVideos: "YOUTUBE — नवीनतम वीडियो",
    companyVideos: "DIAMOND SOLUTION — आधिकारिक प्रस्तुतियाँ",
    companyDesc: "Diamond Solution के आधिकारिक वीडियो। योजना समझाने के लिए इन्हें संभावित ग्राहकों के साथ साझा करें।",
    openError: "वीडियो खोला नहीं जा सका। कृपया पुनः प्रयास करें।",
    vimeoChannelBtn: "🎬 Vimeo पर सभी देखें",
    refreshBtn: "↻ वीडियो अपडेट करें",
    comingSoonTitle: "वीडियो जल्द आ रहे हैं",
    comingSoonDesc: "आपकी भाषा में प्रस्तुतियाँ तैयार की जा रही हैं। Vimeo पर सभी उपलब्ध वीडियो देखने के लिए नीचे दिए बटन का उपयोग करें।",
  },
  vi: {
    title: "📺 VIDEO",
    subtitle: "Nội dung giáo dục về bảo toàn tài sản và các bài thuyết trình chính thức của công ty.",
    watchVideo: "▶ Xem trên YouTube",
    watchVimeo: "▶ Xem trên Vimeo",
    subscribeBtn: "🔔 Đăng ký Kênh",
    channelName: "Wealth Preservation",
    channelDesc: "Điểm đến hàng đầu của bạn để nắm vững nghệ thuật bảo toàn tài sản và chiến lược tài chính nâng cao.",
    views: "lượt xem",
    latestVideos: "YOUTUBE — VIDEO MỚI NHẤT",
    companyVideos: "DIAMOND SOLUTION — THUYẾT TRÌNH CHÍNH THỨC",
    companyDesc: "Video chính thức của Diamond Solution. Chia sẻ với khách hàng tiềm năng để giải thích kế hoạch.",
    openError: "Không thể mở video. Vui lòng thử lại.",
    vimeoChannelBtn: "🎬 Xem Tất Cả trên Vimeo",
    refreshBtn: "↻ Cập Nhật Video",
    comingSoonTitle: "Video Sắp Ra Mắt",
    comingSoonDesc: "Các bài thuyết trình bằng ngôn ngữ của bạn đang được chuẩn bị. Sử dụng nút bên dưới để xem tất cả video có sẵn trên Vimeo.",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getThumbUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function getVimeoThumbUrl(video: VimeoVideo) {
  return video.thumbnail ?? `https://vumbnail.com/${video.id}.jpg`;
}

function formatAge(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days < 7)   return `${days} days ago`;
  if (days < 30)  return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function formatVimeoAge(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function parseYouTubeXML(xml: string): YouTubeVideo[] {
  const out: YouTubeVideo[] = [];
  const entryRe = /<entry>(.*?)<\/entry>/gs;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml)) !== null) {
    const e = m[1];
    const id    = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = e.match(/<title>([^<]+)<\/title>/)?.[1];
    const pub   = e.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!id || !title) continue;
    out.push({
      id,
      title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
      duration: "",
      views: "",
      age: formatAge(pub),
    });
  }
  return out;
}

// Fetch YouTube RSS — tries rss2json first (CORS-safe), then direct/proxy XML
async function fetchYouTubeRSS(): Promise<YouTubeVideo[]> {
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  // Strategy 1: rss2json.com — no CORS issues, works on web & native
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`,
      { signal: AbortSignal.timeout(9000) }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.status === "ok" && Array.isArray(json.items) && json.items.length > 0) {
        const videos = json.items
          .map((item: any) => {
            const fromGuid = (item.guid ?? "").replace("yt:video:", "");
            const fromLink = ((item.link ?? "").split("v=")[1] ?? "").split("&")[0];
            const videoId  = fromGuid || fromLink;
            return { id: videoId, title: item.title ?? "", duration: "", views: "", age: formatAge(item.pubDate) };
          })
          .filter((v: YouTubeVideo) => v.id.length === 11);
        if (videos.length > 0) return videos;
      }
    }
  } catch { /* fall through */ }

  // Strategy 2: raw XML via direct fetch (native) or CORS proxies (web)
  const xmlSources: Array<() => Promise<string | null>> = Platform.OS !== "web"
    ? [() => fetch(RSS_URL, { signal: AbortSignal.timeout(8000) }).then(r => r.ok ? r.text() : null).catch(() => null)]
    : [
        () => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`, { signal: AbortSignal.timeout(8000) })
              .then(async r => { if (!r.ok) return null; return (await r.json()).contents ?? null; }).catch(() => null),
        () => fetch(`https://corsproxy.io/?${encodeURIComponent(RSS_URL)}`, { signal: AbortSignal.timeout(8000) })
              .then(r => r.ok ? r.text() : null).catch(() => null),
      ];

  for (const src of xmlSources) {
    const xml = await src();
    if (xml) {
      const parsed = parseYouTubeXML(xml);
      if (parsed.length > 0) return parsed;
    }
  }
  return [];
}

// Fetch one page from the Vimeo v2 API — no auth needed
async function fetchVimeoPage(page: number): Promise<any[]> {
  const url = `https://vimeo.com/api/v2/diamondsolution/videos.json?page=${page}`;
  if (Platform.OS !== "web") {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) return res.json();
    } catch {}
    return [];
  }
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];
  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    } catch { /* try next */ }
  }
  return [];
}

async function openUrl(url: string, errorMsg: string) {
  try {
    if (Platform.OS === "web") { window.open(url, "_blank"); return; }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Error", errorMsg);
  }
}

// ─── YouTube Hook ─────────────────────────────────────────────────────────────
function useYouTubeVideos() {
  const [videos, setVideos]       = useState<YouTubeVideo[]>(YOUTUBE_FALLBACK);
  const [loading, setLoading]     = useState(true);
  const [liveLoaded, setLiveLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchYouTubeRSS().then(result => {
      if (cancelled) return;
      if (result.length > 0) {
        setVideos(result);
        setLiveLoaded(true);
      } else {
        setVideos(YOUTUBE_FALLBACK);
        setLiveLoaded(false);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refreshKey]);

  return { videos, loading, liveLoaded, refresh };
}

// ─── Vimeo Hook ───────────────────────────────────────────────────────────────
function useVimeoVideos(language: string) {
  const [allVideos, setAllVideos] = useState<VimeoVideo[]>(VIMEO_FALLBACK);
  const [loading, setLoading]     = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    async function fetchAll() {
      const collected: VimeoVideo[] = [];
      for (let page = 1; page <= 20; page++) {
        if (cancelled) return;
        const items = await fetchVimeoPage(page);
        if (!Array.isArray(items) || items.length === 0) break;
        for (const item of items) {
          collected.push({
            id: String(item.id),
            title: item.title ?? "",
            age: formatVimeoAge(item.upload_date),
            thumbnail: item.thumbnail_large ?? item.thumbnail_medium ?? undefined,
          });
        }
        if (items.length < 20) break;
      }
      if (!cancelled) {
        setAllVideos(collected.length > 0 ? collected : VIMEO_FALLBACK);
        setLoading(false);
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const videos = filterByLanguage(allVideos, language);
  return { videos, loading, refresh };
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VideosScreen() {
  const { language, partnerMode } = useCalculator();
  const tx = TEXT[language] ?? TEXT.en;
  const { videos: ytVideos, loading: ytLoading, liveLoaded: ytLive, refresh: refreshYT } = useYouTubeVideos();
  const { videos: vimeoVideos, loading: vimeoLoading, refresh: refreshVimeo } = useVimeoVideos(language);

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

  const handleRefreshYT = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refreshYT();
  }, [refreshYT]);

  const handleRefreshVimeo = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refreshVimeo();
  }, [refreshVimeo]);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <ScreenContainer bgColor="#0f172a">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[S.contentWrap, isLargeScreen && S.contentWrapLarge]}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>{tx.title}</Text>
          <Text style={S.headerSub}>{tx.subtitle}</Text>
        </View>

        {/* ── SECTION 1: YouTube Channel (always visible) ── */}
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
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[S.sectionLabel, { marginBottom: 0 }]}>{tx.latestVideos}</Text>
              {!ytLoading && (
                <Text style={{ fontSize: 10, marginTop: 3, color: ytLive ? "#22c55e" : "#64748b" }}>
                  {ytLive ? `✓ Live · ${ytVideos.length} videos` : `⚠ Showing cached · ${ytVideos.length} videos`}
                </Text>
              )}
            </View>
            <TouchableOpacity style={S.refreshBtn} onPress={handleRefreshYT} activeOpacity={0.8} disabled={ytLoading}>
              <Text style={S.refreshBtnText}>{ytLoading ? "Loading…" : tx.refreshBtn}</Text>
            </TouchableOpacity>
          </View>

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

        {/* ── SECTION 2: Diamond Solution Official Vimeo Videos (adviser mode only) ── */}
        {partnerMode && (
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

            {vimeoLoading ? (
              <ActivityIndicator color="#0ea5e9" style={{ marginVertical: 20 }} />
            ) : vimeoVideos.length === 0 ? (
              <View style={S.comingSoonBox}>
                <Text style={S.comingSoonIcon}>🎬</Text>
                <Text style={S.comingSoonTitle}>{tx.comingSoonTitle}</Text>
                <Text style={S.comingSoonDesc}>{tx.comingSoonDesc}</Text>
                <TouchableOpacity style={[S.vimeoChannelBtn, { marginTop: 18, width: "100%" }]} onPress={handleVimeoChannel} activeOpacity={0.85}>
                  <Text style={S.vimeoChannelBtnText}>{tx.vimeoChannelBtn}</Text>
                </TouchableOpacity>
              </View>
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
                      source={{ uri: getVimeoThumbUrl(video) }}
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

            <TouchableOpacity style={S.vimeoChannelBtn} onPress={handleVimeoChannel} activeOpacity={0.85}>
              <Text style={S.vimeoChannelBtnText}>{tx.vimeoChannelBtn}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={S.refreshBtn} onPress={handleRefreshVimeo} activeOpacity={0.8} disabled={vimeoLoading}>
              <Text style={S.refreshBtnText}>{vimeoLoading ? "..." : tx.refreshBtn}</Text>
            </TouchableOpacity>
          </View>
        )}

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  contentWrap: {
    width: "100%",
  },
  contentWrapLarge: {
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
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
    aspectRatio: 16 / 9,
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

  // Coming soon empty state
  comingSoonBox: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  comingSoonIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#94a3b8",
    marginBottom: 8,
    textAlign: "center",
  },
  comingSoonDesc: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    lineHeight: 19,
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
    aspectRatio: 16 / 9,
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

  // Refresh button
  refreshBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#334155",
    marginTop: 8,
    alignSelf: "flex-end",
  },
  refreshBtnText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
});
