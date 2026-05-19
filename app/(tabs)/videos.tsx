import React, { useState, useEffect, useCallback, useRef } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
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

type VimeoCategory = "invitation" | "presentation" | "compensation" | "other";

interface VimeoVideo {
  id: string;
  title: string;
  age: string;
  thumbnail: string;
  category: VimeoCategory;
  langCode: string;
}

// ─── Static hardcoded Vimeo library (all 35 real videos) ─────────────────────
// These load instantly with no network request. Live fetch updates on top.
const STATIC_VIMEO: VimeoVideo[] = [
  // ── JPP1 Invitations ──────────────────────────────────────────────────────
  { id: "1146526552", title: "JPP1 - cesky - Invitation CZ",          age: "", thumbnail: "https://vumbnail.com/1146526552.jpg", category: "invitation",    langCode: "cs" },
  { id: "1146526795", title: "JPP1 - deutsch - Invitation DE",         age: "", thumbnail: "https://vumbnail.com/1146526795.jpg", category: "invitation",    langCode: "de" },
  { id: "1146526988", title: "JPP1 - english - Invitation EN",         age: "", thumbnail: "https://vumbnail.com/1146526988.jpg", category: "invitation",    langCode: "en" },
  { id: "1146527199", title: "JPP1 - espanol - Invitation ES",         age: "", thumbnail: "https://vumbnail.com/1146527199.jpg", category: "invitation",    langCode: "es" },
  { id: "1146527416", title: "JPP1 - francais - Invitation FR",        age: "", thumbnail: "https://vumbnail.com/1146527416.jpg", category: "invitation",    langCode: "fr" },
  { id: "1146527572", title: "JPP1 - italiano - Invitation IT",        age: "", thumbnail: "https://vumbnail.com/1146527572.jpg", category: "invitation",    langCode: "it" },
  { id: "1146527796", title: "JPP1 - polski - Invitation PL",          age: "", thumbnail: "https://vumbnail.com/1146527796.jpg", category: "invitation",    langCode: "pl" },
  { id: "1146528231", title: "JPP1 - romanesc - Invitation RO",        age: "", thumbnail: "https://vumbnail.com/1146528231.jpg", category: "invitation",    langCode: "ro" },
  { id: "1146541884", title: "JPP1 - slovensky - Invitation SK",       age: "", thumbnail: "https://vumbnail.com/1146541884.jpg", category: "invitation",    langCode: "sk" },
  { id: "1165938547", title: "JPP1 - Magyar - Invitation HU",          age: "", thumbnail: "https://vumbnail.com/1165938547.jpg", category: "invitation",    langCode: "hu" },
  { id: "1181491127", title: "DS JPP1 - srpski - Invitation SRB",      age: "", thumbnail: "https://vumbnail.com/1181491127.jpg", category: "invitation",    langCode: "sr" },
  // ── JPP2 Presentations ───────────────────────────────────────────────────
  { id: "1146536856", title: "JPP2 - deutsch - Presentation DE",       age: "", thumbnail: "https://vumbnail.com/1146536856.jpg", category: "presentation",  langCode: "de" },
  { id: "1146537304", title: "JPP2 - english - Presentation EN",       age: "", thumbnail: "https://vumbnail.com/1146537304.jpg", category: "presentation",  langCode: "en" },
  { id: "1146583828", title: "JPP2 - français - Presentation FR",      age: "", thumbnail: "https://vumbnail.com/1146583828.jpg", category: "presentation",  langCode: "fr" },
  { id: "1146611630", title: "JPP2 - italiano - Presentation IT",      age: "", thumbnail: "https://vumbnail.com/1146611630.jpg", category: "presentation",  langCode: "it" },
  { id: "1146629502", title: "JPP2 - portugues - Presentation PT",     age: "", thumbnail: "https://vumbnail.com/1146629502.jpg", category: "presentation",  langCode: "pt" },
  { id: "1149702808", title: "JPP2 - cesky - Presentation CZ",         age: "", thumbnail: "https://vumbnail.com/1149702808.jpg", category: "presentation",  langCode: "cs" },
  { id: "1149702929", title: "JPP2 - polski - Presentation PL",        age: "", thumbnail: "https://vumbnail.com/1149702929.jpg", category: "presentation",  langCode: "pl" },
  { id: "1149703004", title: "JPP2 - romanesc - Presentation RO",      age: "", thumbnail: "https://vumbnail.com/1149703004.jpg", category: "presentation",  langCode: "ro" },
  { id: "1149703047", title: "JPP2 - slovensky - Presentation SK",     age: "", thumbnail: "https://vumbnail.com/1149703047.jpg", category: "presentation",  langCode: "sk" },
  { id: "1149707800", title: "JPP2 - espanol - Presentation ES",       age: "", thumbnail: "https://vumbnail.com/1149707800.jpg", category: "presentation",  langCode: "es" },
  { id: "1165938936", title: "JPP2 - Magyar - Presentation HU",        age: "", thumbnail: "https://vumbnail.com/1165938936.jpg", category: "presentation",  langCode: "hu" },
  { id: "1181491297", title: "DS JPP2 - srpski - Presentation SRB",    age: "", thumbnail: "https://vumbnail.com/1181491297.jpg", category: "presentation",  langCode: "sr" },
  // ── JPP3 Compensation Plans ───────────────────────────────────────────────
  { id: "1150822555", title: "JPP3 - deutsch - Compensation Plan DE",  age: "", thumbnail: "https://vumbnail.com/1150822555.jpg", category: "compensation",  langCode: "de" },
  { id: "1150833840", title: "JPP3 - english - Compensation Plan EN",  age: "", thumbnail: "https://vumbnail.com/1150833840.jpg", category: "compensation",  langCode: "en" },
  { id: "1150834090", title: "JPP3 - espanol - Compensation Plan ES",  age: "", thumbnail: "https://vumbnail.com/1150834090.jpg", category: "compensation",  langCode: "es" },
  { id: "1150834370", title: "JPP3 - francais - Compensation Plan FR", age: "", thumbnail: "https://vumbnail.com/1150834370.jpg", category: "compensation",  langCode: "fr" },
  { id: "1150836568", title: "JPP3 - italiano - Compensation Plan IT", age: "", thumbnail: "https://vumbnail.com/1150836568.jpg", category: "compensation",  langCode: "it" },
  { id: "1154686191", title: "JPP3 - polski - Compensation Plan PL",   age: "", thumbnail: "https://vumbnail.com/1154686191.jpg", category: "compensation",  langCode: "pl" },
  { id: "1154687153", title: "JPP3 - slovenský - Compensation Plan SK",age: "", thumbnail: "https://vumbnail.com/1154687153.jpg", category: "compensation",  langCode: "sk" },
  { id: "1154691183", title: "JPP3 - cesky - Compensation Plan CZ",    age: "", thumbnail: "https://vumbnail.com/1154691183.jpg", category: "compensation",  langCode: "cs" },
  { id: "1155506716", title: "JPP3 - portugues - Compensation Plan PT",age: "", thumbnail: "https://vumbnail.com/1155506716.jpg", category: "compensation",  langCode: "pt" },
  { id: "1155507043", title: "JPP3 - romanesc - Compensation Plan RO", age: "", thumbnail: "https://vumbnail.com/1155507043.jpg", category: "compensation",  langCode: "ro" },
  { id: "1165939726", title: "JPP3 - magyar - Business Plan HU",       age: "", thumbnail: "https://vumbnail.com/1165939726.jpg", category: "compensation",  langCode: "hu" },
  { id: "1181492749", title: "DS JPP3 - srpski - Compensation Plan SRB",age:"", thumbnail: "https://vumbnail.com/1181492749.jpg", category: "compensation",  langCode: "sr" },
];

// ─── Language → Vimeo langCode mapping ───────────────────────────────────────
const LANG_CODE_MAP: Record<string, string[]> = {
  en: ["en"],
  de: ["de"],
  fr: ["fr"],
  es: ["es"],
  it: ["it"],
  pt: ["pt"],
  nl: ["en"],   // no Dutch videos → English
  ru: ["en"],   // no Russian videos → English
  zh: ["en"],   // no Chinese videos → English
  tl: ["en"],   // no Filipino videos → English
  ar: ["en"],   // no Arabic videos → English
  th: ["en"],   // no Thai videos → English
  hi: ["en"],   // no Hindi videos → English
  vi: ["en"],   // no Vietnamese videos → English
};

function filterVimeoByLanguage(videos: VimeoVideo[], language: string): VimeoVideo[] {
  const targets = LANG_CODE_MAP[language] ?? ["en"];
  const matched = videos.filter(v => targets.includes(v.langCode));
  if (matched.length > 0) return matched;
  // Final fallback: English
  const en = videos.filter(v => v.langCode === "en");
  return en.length > 0 ? en : videos;
}

function parseLiveVimeoItem(item: any): VimeoVideo {
  const title: string = item.title ?? "";
  const titleLower = title.toLowerCase();

  let category: VimeoCategory = "other";
  if (/jpp3/.test(titleLower)) category = "compensation";
  else if (/jpp2/.test(titleLower)) category = "presentation";
  else if (/jpp1/.test(titleLower)) category = "invitation";

  const langMatch = title.match(/JPP\d\s*-\s*([A-Za-záàâäãåçéèêëíìîïóòôöõúùûüýÿñšžčśżąćńłőüÁÄÉÍÓÖÚÜ]+)/i);
  const langWord = langMatch ? langMatch[1].toLowerCase() : "";
  let langCode = "en";
  if (/deutsch/.test(langWord))           langCode = "de";
  else if (/english/.test(langWord))      langCode = "en";
  else if (/espanol|español/.test(langWord)) langCode = "es";
  else if (/français|francais/.test(langWord)) langCode = "fr";
  else if (/italiano/.test(langWord))     langCode = "it";
  else if (/portugues|português/.test(langWord)) langCode = "pt";
  else if (/cesky|česky/.test(langWord))  langCode = "cs";
  else if (/slovenský|slovensky/.test(langWord)) langCode = "sk";
  else if (/polski/.test(langWord))       langCode = "pl";
  else if (/romanesc|română/.test(langWord)) langCode = "ro";
  else if (/srpski/.test(langWord))       langCode = "sr";
  else if (/magyar/.test(langWord))       langCode = "hu";

  const days = item.upload_date
    ? Math.floor((Date.now() - new Date(item.upload_date).getTime()) / 86_400_000)
    : -1;
  let age = "";
  if (days === 0)       age = "Today";
  else if (days < 7)    age = `${days}d ago`;
  else if (days < 30)   age = `${Math.floor(days / 7)}w ago`;
  else if (days < 365)  age = `${Math.floor(days / 30)}mo ago`;
  else if (days >= 365) age = `${Math.floor(days / 365)}y ago`;

  return {
    id: String(item.id),
    title,
    age,
    thumbnail: item.thumbnail_large ?? item.thumbnail_medium ?? `https://vumbnail.com/${item.id}.jpg`,
    category,
    langCode,
  };
}

const VIMEO_CACHE_KEY = "vimeo_v3_cache";
const VIMEO_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const VIMEO_USERNAME = "diamondsolution";
const VIMEO_CHANNEL_URL = "https://vimeo.com/diamondsolution";

async function fetchVimeoLive(): Promise<VimeoVideo[]> {
  const collected: VimeoVideo[] = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://vimeo.com/api/v2/${VIMEO_USERNAME}/videos.json?page=${page}`;
    let data: any[] | null = null;

    if (Platform.OS !== "web") {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (res.ok) data = await res.json();
      } catch { /* fall through */ }
    } else {
      const proxies = [
        `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      ];
      for (const proxy of proxies) {
        try {
          const res = await fetch(proxy, { signal: AbortSignal.timeout(10000) });
          if (!res.ok) continue;
          const text = await res.text();
          const parsed = JSON.parse(text);
          // allorigins /get wraps in { contents: "..." }
          data = Array.isArray(parsed) ? parsed : (parsed.contents ? JSON.parse(parsed.contents) : null);
          if (Array.isArray(data) && data.length > 0) break;
          data = null;
        } catch { /* try next */ }
      }
    }

    if (!Array.isArray(data) || data.length === 0) break;
    data.forEach(item => collected.push(parseLiveVimeoItem(item)));
    if (data.length < 20) break;
  }
  return collected;
}

// ─── Static YouTube fallback ─────────────────────────────────────────────────
const YOUTUBE_FALLBACK: YouTubeVideo[] = [
  { id: "HJv57bZsyus", title: "Mike Lang beantwortet die wichtigsten Diamanten-Fragen", duration: "", views: "", age: "" },
  { id: "gzK_3CmirAI", title: "Alle Antworten zu STIG International Diamonds | Patrick Stöger CEO", duration: "", views: "", age: "" },
  { id: "cP7iNzX1bTo", title: "Luxury Assets Home Ownership Diamond Plan", duration: "0:41", views: "31", age: "" },
  { id: "3FZkUEDsSkQ", title: "Ai is there! Do you have a PLAN B ↓ Save a Job! 🔥 Residual plan A", duration: "1:40", views: "20", age: "" },
];

const CHANNEL_ID  = "UCXh1ElqY3LpawTWvCOW6pUA";
const CHANNEL_URL = "https://www.youtube.com/@wealthpreservation101";

// ─── Translations ─────────────────────────────────────────────────────────────
const TEXT: Record<string, {
  title: string; subtitle: string; watchVideo: string; watchVimeo: string;
  subscribeBtn: string; channelName: string; channelDesc: string; views: string;
  latestVideos: string; companyVideos: string; companyDesc: string;
  openError: string; vimeoChannelBtn: string; refreshBtn: string;
  catInvitation: string; catPresentation: string; catCompensation: string;
  allLanguages: string; yourLanguage: string;
}> = {
  en: {
    title: "📺 VIDEOS",
    subtitle: "Educational content on wealth preservation and official company presentations.",
    watchVideo: "▶ Watch on YouTube",
    watchVimeo: "▶ Watch on Vimeo",
    subscribeBtn: "🔔 Subscribe to Channel",
    channelName: "Wealth Preservation",
    channelDesc: "Your premier destination for mastering wealth preservation and advanced financial strategy.",
    views: "views",
    latestVideos: "YOUTUBE — LATEST VIDEOS",
    companyVideos: "DIAMOND SOLUTION — OFFICIAL PRESENTATIONS",
    companyDesc: "Official company videos. Share with prospects to explain the plan.",
    openError: "Could not open video. Please try again.",
    vimeoChannelBtn: "🎬 View All on Vimeo",
    refreshBtn: "↻ Refresh",
    catInvitation: "INVITATION",
    catPresentation: "PRESENTATION",
    catCompensation: "COMPENSATION PLAN",
    allLanguages: "ALL",
    yourLanguage: "YOUR LANGUAGE",
  },
  nl: {
    title: "📺 VIDEO'S", subtitle: "Educatieve content en officiële bedrijfspresentaties.",
    watchVideo: "▶ Bekijk op YouTube", watchVimeo: "▶ Bekijk op Vimeo",
    subscribeBtn: "🔔 Abonneer op Kanaal", channelName: "Wealth Preservation",
    channelDesc: "Uw beste bestemming voor vermogensbehoud en geavanceerde financiële strategie.",
    views: "weergaven", latestVideos: "YOUTUBE — NIEUWSTE VIDEO'S",
    companyVideos: "DIAMOND SOLUTION — OFFICIËLE PRESENTATIES",
    companyDesc: "Officiële bedrijfsvideo's. Deel met prospects om het plan uit te leggen.",
    openError: "Kon video niet openen. Probeer het opnieuw.",
    vimeoChannelBtn: "🎬 Alles bekijken op Vimeo", refreshBtn: "↻ Vernieuwen",
    catInvitation: "UITNODIGING", catPresentation: "PRESENTATIE", catCompensation: "COMPENSATIEPLAN",
    allLanguages: "ALLES", yourLanguage: "UW TAAL",
  },
  de: {
    title: "📺 VIDEOS", subtitle: "Bildungsinhalte und offizielle Unternehmenspräsentationen.",
    watchVideo: "▶ Auf YouTube ansehen", watchVimeo: "▶ Auf Vimeo ansehen",
    subscribeBtn: "🔔 Kanal abonnieren", channelName: "Wealth Preservation",
    channelDesc: "Ihr erstklassiges Ziel für Vermögenserhaltung und fortgeschrittene Finanzstrategie.",
    views: "Aufrufe", latestVideos: "YOUTUBE — NEUESTE VIDEOS",
    companyVideos: "DIAMOND SOLUTION — OFFIZIELLE PRÄSENTATIONEN",
    companyDesc: "Offizielle Unternehmensvideos. Teilen Sie diese mit Interessenten.",
    openError: "Video konnte nicht geöffnet werden. Bitte versuchen Sie es erneut.",
    vimeoChannelBtn: "🎬 Alle auf Vimeo ansehen", refreshBtn: "↻ Aktualisieren",
    catInvitation: "EINLADUNG", catPresentation: "PRÄSENTATION", catCompensation: "VERGÜTUNGSPLAN",
    allLanguages: "ALLE", yourLanguage: "IHRE SPRACHE",
  },
  fr: {
    title: "📺 VIDÉOS", subtitle: "Contenu éducatif et présentations officielles de l'entreprise.",
    watchVideo: "▶ Regarder sur YouTube", watchVimeo: "▶ Regarder sur Vimeo",
    subscribeBtn: "🔔 S'abonner à la chaîne", channelName: "Wealth Preservation",
    channelDesc: "Votre destination de premier choix pour la préservation du patrimoine.",
    views: "vues", latestVideos: "YOUTUBE — DERNIÈRES VIDÉOS",
    companyVideos: "DIAMOND SOLUTION — PRÉSENTATIONS OFFICIELLES",
    companyDesc: "Vidéos officielles. Partagez avec vos prospects pour expliquer le plan.",
    openError: "Impossible d'ouvrir la vidéo. Veuillez réessayer.",
    vimeoChannelBtn: "🎬 Tout voir sur Vimeo", refreshBtn: "↻ Actualiser",
    catInvitation: "INVITATION", catPresentation: "PRÉSENTATION", catCompensation: "PLAN DE COMPENSATION",
    allLanguages: "TOUS", yourLanguage: "VOTRE LANGUE",
  },
  es: {
    title: "📺 VIDEOS", subtitle: "Contenido educativo y presentaciones oficiales de la empresa.",
    watchVideo: "▶ Ver en YouTube", watchVimeo: "▶ Ver en Vimeo",
    subscribeBtn: "🔔 Suscribirse al Canal", channelName: "Wealth Preservation",
    channelDesc: "Su destino principal para la preservación de la riqueza y la estrategia financiera avanzada.",
    views: "vistas", latestVideos: "YOUTUBE — ÚLTIMOS VIDEOS",
    companyVideos: "DIAMOND SOLUTION — PRESENTACIONES OFICIALES",
    companyDesc: "Videos oficiales. Compártalos con prospectos para explicar el plan.",
    openError: "No se pudo abrir el video. Por favor, inténtelo de nuevo.",
    vimeoChannelBtn: "🎬 Ver todo en Vimeo", refreshBtn: "↻ Actualizar",
    catInvitation: "INVITACIÓN", catPresentation: "PRESENTACIÓN", catCompensation: "PLAN DE COMPENSACIÓN",
    allLanguages: "TODOS", yourLanguage: "SU IDIOMA",
  },
  ru: {
    title: "📺 ВИДЕО", subtitle: "Образовательный контент и официальные корпоративные презентации.",
    watchVideo: "▶ Смотреть на YouTube", watchVimeo: "▶ Смотреть на Vimeo",
    subscribeBtn: "🔔 Подписаться на канал", channelName: "Wealth Preservation",
    channelDesc: "Ваш лучший источник для освоения искусства сохранения капитала.",
    views: "просмотров", latestVideos: "YOUTUBE — ПОСЛЕДНИЕ ВИДЕО",
    companyVideos: "DIAMOND SOLUTION — ОФИЦИАЛЬНЫЕ ПРЕЗЕНТАЦИИ",
    companyDesc: "Официальные видео. Делитесь с потенциальными партнёрами.",
    openError: "Не удалось открыть видео.",
    vimeoChannelBtn: "🎬 Смотреть всё на Vimeo", refreshBtn: "↻ Обновить",
    catInvitation: "ПРИГЛАШЕНИЕ", catPresentation: "ПРЕЗЕНТАЦИЯ", catCompensation: "КОМПЕНСАЦИОННЫЙ ПЛАН",
    allLanguages: "ВСЕ", yourLanguage: "ВАШ ЯЗЫК",
  },
  zh: {
    title: "📺 视频", subtitle: "关于财富保值的教育内容和官方公司演示。",
    watchVideo: "▶ 在YouTube上观看", watchVimeo: "▶ 在Vimeo上观看",
    subscribeBtn: "🔔 订阅频道", channelName: "Wealth Preservation",
    channelDesc: "您掌握财富保值艺术和高级财务策略的首选目的地。",
    views: "次观看", latestVideos: "YOUTUBE — 最新视频",
    companyVideos: "DIAMOND SOLUTION — 官方演示",
    companyDesc: "官方视频。与潜在合作伙伴分享以解释计划。",
    openError: "无法打开视频，请重试。",
    vimeoChannelBtn: "🎬 在Vimeo上查看全部", refreshBtn: "↻ 刷新",
    catInvitation: "邀请", catPresentation: "介绍", catCompensation: "补偿方案",
    allLanguages: "全部", yourLanguage: "您的语言",
  },
  pt: {
    title: "📺 VÍDEOS", subtitle: "Conteúdo educativo e apresentações oficiais da empresa.",
    watchVideo: "▶ Assistir no YouTube", watchVimeo: "▶ Assistir no Vimeo",
    subscribeBtn: "🔔 Inscrever-se no Canal", channelName: "Wealth Preservation",
    channelDesc: "O seu destino principal para a preservação de riqueza e estratégia financeira avançada.",
    views: "visualizações", latestVideos: "YOUTUBE — ÚLTIMOS VÍDEOS",
    companyVideos: "DIAMOND SOLUTION — APRESENTAÇÕES OFICIAIS",
    companyDesc: "Vídeos oficiais. Partilhe com potenciais clientes para explicar o plano.",
    openError: "Não foi possível abrir o vídeo.",
    vimeoChannelBtn: "🎬 Ver Tudo no Vimeo", refreshBtn: "↻ Actualizar",
    catInvitation: "CONVITE", catPresentation: "APRESENTAÇÃO", catCompensation: "PLANO DE COMPENSAÇÃO",
    allLanguages: "TODOS", yourLanguage: "SEU IDIOMA",
  },
  ar: {
    title: "📺 مقاطع الفيديو", subtitle: "محتوى تعليمي وعروض تقديمية رسمية للشركة.",
    watchVideo: "▶ شاهد على YouTube", watchVimeo: "▶ شاهد على Vimeo",
    subscribeBtn: "🔔 اشترك في القناة", channelName: "Wealth Preservation",
    channelDesc: "وجهتك المثالية لإتقان فن الحفاظ على الثروة.",
    views: "مشاهدات", latestVideos: "يوتيوب — أحدث الفيديوهات",
    companyVideos: "DIAMOND SOLUTION — العروض الرسمية",
    companyDesc: "مقاطع فيديو رسمية. شاركها مع العملاء المحتملين.",
    openError: "تعذر فتح الفيديو.",
    vimeoChannelBtn: "🎬 عرض الكل على Vimeo", refreshBtn: "↻ تحديث",
    catInvitation: "دعوة", catPresentation: "عرض تقديمي", catCompensation: "خطة التعويض",
    allLanguages: "الكل", yourLanguage: "لغتك",
  },
  th: {
    title: "📺 วิดีโอ", subtitle: "เนื้อหาด้านการศึกษาและการนำเสนออย่างเป็นทางการของบริษัท",
    watchVideo: "▶ ดูบน YouTube", watchVimeo: "▶ ดูบน Vimeo",
    subscribeBtn: "🔔 สมัครสมาชิกช่อง", channelName: "Wealth Preservation",
    channelDesc: "จุดหมายปลายทางชั้นนำของคุณสำหรับการรักษาความมั่งคั่งและกลยุทธ์ทางการเงิน",
    views: "ครั้งที่ดู", latestVideos: "YOUTUBE — วิดีโอล่าสุด",
    companyVideos: "DIAMOND SOLUTION — การนำเสนออย่างเป็นทางการ",
    companyDesc: "วิดีโอทางการของ Diamond Solution",
    openError: "ไม่สามารถเปิดวิดีโอได้",
    vimeoChannelBtn: "🎬 ดูทั้งหมดบน Vimeo", refreshBtn: "↻ รีเฟรช",
    catInvitation: "คำเชิญ", catPresentation: "การนำเสนอ", catCompensation: "แผนค่าตอบแทน",
    allLanguages: "ทั้งหมด", yourLanguage: "ภาษาของคุณ",
  },
  hi: {
    title: "📺 वीडियो", subtitle: "धन संरक्षण पर शैक्षिक सामग्री और आधिकारिक कंपनी प्रस्तुतियाँ।",
    watchVideo: "▶ YouTube पर देखें", watchVimeo: "▶ Vimeo पर देखें",
    subscribeBtn: "🔔 चैनल सब्सक्राइब करें", channelName: "Wealth Preservation",
    channelDesc: "धन संरक्षण की कला में महारत हासिल करने के लिए आपका प्रमुख गंतव्य।",
    views: "व्यूज़", latestVideos: "YOUTUBE — नवीनतम वीडियो",
    companyVideos: "DIAMOND SOLUTION — आधिकारिक प्रस्तुतियाँ",
    companyDesc: "आधिकारिक वीडियो। संभावित ग्राहकों के साथ साझा करें।",
    openError: "वीडियो खोला नहीं जा सका।",
    vimeoChannelBtn: "🎬 Vimeo पर सभी देखें", refreshBtn: "↻ अपडेट",
    catInvitation: "आमंत्रण", catPresentation: "प्रस्तुति", catCompensation: "क्षतिपूर्ति योजना",
    allLanguages: "सभी", yourLanguage: "आपकी भाषा",
  },
  vi: {
    title: "📺 VIDEO", subtitle: "Nội dung giáo dục về bảo toàn tài sản và các bài thuyết trình chính thức.",
    watchVideo: "▶ Xem trên YouTube", watchVimeo: "▶ Xem trên Vimeo",
    subscribeBtn: "🔔 Đăng ký Kênh", channelName: "Wealth Preservation",
    channelDesc: "Điểm đến hàng đầu của bạn để bảo toàn tài sản và chiến lược tài chính nâng cao.",
    views: "lượt xem", latestVideos: "YOUTUBE — VIDEO MỚI NHẤT",
    companyVideos: "DIAMOND SOLUTION — THUYẾT TRÌNH CHÍNH THỨC",
    companyDesc: "Video chính thức. Chia sẻ với khách hàng tiềm năng.",
    openError: "Không thể mở video.",
    vimeoChannelBtn: "🎬 Xem Tất Cả trên Vimeo", refreshBtn: "↻ Cập Nhật",
    catInvitation: "LỜI MỜI", catPresentation: "THUYẾT TRÌNH", catCompensation: "KẾ HOẠCH BỒI THƯỜNG",
    allLanguages: "TẤT CẢ", yourLanguage: "NGÔN NGỮ CỦA BẠN",
  },
  tl: {
    title: "📺 MGA VIDEO", subtitle: "Pang-edukasyong nilalaman at opisyal na presentasyon ng kumpanya.",
    watchVideo: "▶ Panoorin sa YouTube", watchVimeo: "▶ Panoorin sa Vimeo",
    subscribeBtn: "🔔 Mag-subscribe sa Channel", channelName: "Wealth Preservation",
    channelDesc: "Ang iyong pangunahing destinasyon para sa pangangalaga ng kayamanan.",
    views: "mga panonood", latestVideos: "YOUTUBE — PINAKABAGONG MGA VIDEO",
    companyVideos: "DIAMOND SOLUTION — OPISYAL NA MGA PRESENTASYON",
    companyDesc: "Opisyal na mga video. Ibahagi sa mga prospect.",
    openError: "Hindi mabuksan ang video.",
    vimeoChannelBtn: "🎬 Tingnan Lahat sa Vimeo", refreshBtn: "↻ I-refresh",
    catInvitation: "IMBITASYON", catPresentation: "PRESENTASYON", catCompensation: "PLANO SA KOMPENSASYON",
    allLanguages: "LAHAT", yourLanguage: "IYONG WIKA",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getThumbUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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
    out.push({ id, title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"), duration: "", views: "", age: formatAge(pub) });
  }
  return out;
}

async function fetchYouTubeRSS(): Promise<YouTubeVideo[]> {
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  try {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`, { signal: AbortSignal.timeout(9000) });
    if (res.ok) {
      const json = await res.json();
      if (json.status === "ok" && Array.isArray(json.items) && json.items.length > 0) {
        const videos = json.items.map((item: any) => {
          const fromGuid = (item.guid ?? "").replace("yt:video:", "");
          const fromLink = ((item.link ?? "").split("v=")[1] ?? "").split("&")[0];
          const videoId  = fromGuid || fromLink;
          return { id: videoId, title: item.title ?? "", duration: "", views: "", age: formatAge(item.pubDate) };
        }).filter((v: YouTubeVideo) => v.id.length === 11);
        if (videos.length > 0) return videos;
      }
    }
  } catch { /* fall through */ }

  const xmlSources: Array<() => Promise<string | null>> = Platform.OS !== "web"
    ? [() => fetch(RSS_URL, { signal: AbortSignal.timeout(8000) }).then(r => r.ok ? r.text() : null).catch(() => null)]
    : [
        () => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`, { signal: AbortSignal.timeout(8000) }).then(async r => { if (!r.ok) return null; return (await r.json()).contents ?? null; }).catch(() => null),
        () => fetch(`https://corsproxy.io/?${encodeURIComponent(RSS_URL)}`, { signal: AbortSignal.timeout(8000) }).then(r => r.ok ? r.text() : null).catch(() => null),
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

// ─── YouTube Hook ─────────────────────────────────────────────────────────────
function useYouTubeVideos() {
  const [videos, setVideos]         = useState<YouTubeVideo[]>(YOUTUBE_FALLBACK);
  const [loading, setLoading]       = useState(true);
  const [liveLoaded, setLiveLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchYouTubeRSS().then(result => {
      if (cancelled) return;
      if (result.length > 0) { setVideos(result); setLiveLoaded(true); }
      else { setVideos(YOUTUBE_FALLBACK); setLiveLoaded(false); }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refreshKey]);

  return { videos, loading, liveLoaded, refresh };
}

// ─── Vimeo Hook ───────────────────────────────────────────────────────────────
// Shows static data instantly. Runs a background fetch to refresh.
function useVimeoVideos(language: string) {
  const [allVideos, setAllVideos]   = useState<VimeoVideo[]>(STATIC_VIMEO);
  const [refreshing, setRefreshing] = useState(false);
  const [liveLoaded, setLiveLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Try cache first
      try {
        const raw = await AsyncStorage.getItem(VIMEO_CACHE_KEY);
        if (raw && !cancelled) {
          const { data, ts } = JSON.parse(raw);
          if (Array.isArray(data) && data.length > 0 && Date.now() - ts < VIMEO_CACHE_TTL) {
            setAllVideos(data);
            setLiveLoaded(true);
            return; // cache is fresh, skip network
          }
        }
      } catch { /* skip */ }

      // Background live fetch
      if (!cancelled) setRefreshing(true);
      const live = await fetchVimeoLive();
      if (!cancelled) {
        setRefreshing(false);
        if (live.length > 0) {
          setAllVideos(live);
          setLiveLoaded(true);
          try {
            await AsyncStorage.setItem(VIMEO_CACHE_KEY, JSON.stringify({ data: live, ts: Date.now() }));
          } catch { /* ignore */ }
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filtered = filterVimeoByLanguage(allVideos, language);
  return { videos: filtered, refreshing, liveLoaded, refresh };
}

// ─── Category badge helper ────────────────────────────────────────────────────
function categoryLabel(cat: VimeoCategory, tx: typeof TEXT["en"]) {
  if (cat === "invitation")   return { label: tx.catInvitation,   color: "#0ea5e9" };
  if (cat === "presentation") return { label: tx.catPresentation, color: "#f59e0b" };
  if (cat === "compensation") return { label: tx.catCompensation, color: "#22c55e" };
  return { label: "VIDEO", color: "#64748b" };
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VideosScreen() {
  const { language, partnerMode } = useCalculator();
  const tx = TEXT[language] ?? TEXT.en;
  const { videos: ytVideos, loading: ytLoading, liveLoaded: ytLive, refresh: refreshYT } = useYouTubeVideos();
  const { videos: vimeoVideos, refreshing: vimeoRefreshing, liveLoaded: vimeoLive, refresh: refreshVimeo } = useVimeoVideos(language);
  const { width } = useWindowDimensions();

  // JPP1 = visible to all. JPP2 + JPP3 = adviser-only.
  const invitationVideos = vimeoVideos.filter(v => v.category === "invitation");
  const adviserVideos    = vimeoVideos.filter(v => v.category !== "invitation");
  const isLargeScreen = width >= 768;

  const openVimeo = useCallback(async (videoId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `https://vimeo.com/${videoId}`;
    try {
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
      }
    } catch {
      Linking.openURL(url).catch(() => Alert.alert("Error", tx.openError));
    }
  }, [tx.openError]);

  const openYouTube = useCallback((videoId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (Platform.OS === "web") { window.open(url, "_blank"); return; }
    Linking.openURL(url).catch(() => Alert.alert("Error", tx.openError));
  }, [tx.openError]);

  const openYTChannel = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "web") { window.open(CHANNEL_URL, "_blank"); return; }
    Linking.openURL(CHANNEL_URL);
  }, []);

  const openVimeoChannel = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = VIMEO_CHANNEL_URL;
    if (Platform.OS === "web") { window.open(url, "_blank"); return; }
    WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
  }, []);

  return (
    <ScreenContainer bgColor="#0f172a">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[S.contentWrap, isLargeScreen && S.contentWrapLarge]}>

          {/* ── Header ── */}
          <View style={S.header}>
            <Text style={S.headerTitle}>{tx.title}</Text>
            <Text style={S.headerSub}>{tx.subtitle}</Text>
          </View>

          {/* ══ SECTION 1: YouTube ══════════════════════════════════════════ */}
          <View style={S.sectionBlock}>
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

            <TouchableOpacity style={S.subscribeBtn} onPress={openYTChannel} activeOpacity={0.85}>
              <Text style={S.subscribeBtnText}>{tx.subscribeBtn}</Text>
            </TouchableOpacity>

            <View style={S.sectionTitleRow}>
              <Text style={S.sectionLabel}>{tx.latestVideos}</Text>
              {!ytLoading && (
                <Text style={[S.liveTag, { color: ytLive ? "#22c55e" : "#64748b" }]}>
                  {ytLive ? `● LIVE` : `● CACHED`}
                </Text>
              )}
              <TouchableOpacity style={S.refreshBtn} onPress={refreshYT} disabled={ytLoading}>
                <Text style={S.refreshBtnText}>{ytLoading ? "…" : tx.refreshBtn}</Text>
              </TouchableOpacity>
            </View>

            {ytLoading ? (
              <ActivityIndicator color="#f59e0b" style={{ marginVertical: 24 }} />
            ) : (
              ytVideos.map((video) => (
                <TouchableOpacity key={video.id} style={S.videoCard} onPress={() => openYouTube(video.id)} activeOpacity={0.85}>
                  <View style={S.thumbWrap}>
                    <Image source={{ uri: getThumbUrl(video.id) }} style={S.thumb} resizeMode="cover" />
                    {!!video.duration && (
                      <View style={S.durationBadge}>
                        <Text style={S.durationText}>{video.duration}</Text>
                      </View>
                    )}
                    <View style={S.playOverlay}>
                      <View style={S.ytPlayBtn}>
                        <Text style={S.playIcon}>▶</Text>
                      </View>
                    </View>
                  </View>
                  <View style={S.videoInfo}>
                    <Text style={S.videoTitle} numberOfLines={2}>{video.title}</Text>
                    {(!!video.views || !!video.age) && (
                      <View style={S.videoMeta}>
                        {!!video.views && <Text style={S.videoMetaText}>{video.views} {tx.views}</Text>}
                        {!!video.views && !!video.age && <Text style={S.videoMetaDot}>·</Text>}
                        {!!video.age && <Text style={S.videoMetaText}>{video.age}</Text>}
                      </View>
                    )}
                    <Text style={S.watchText}>{tx.watchVideo}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* ══ SECTION 2a: Invitation videos — visible to all ══════════════ */}
          <View style={S.sectionBlock}>
            <View style={S.sectionHeaderRow}>
              <View style={S.vimeoLogoWrap}>
                <Text style={S.vimeoLogoText}>💎</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={S.sectionTitleRow}>
                  <Text style={S.sectionLabel}>{tx.companyVideos}</Text>
                  {vimeoRefreshing && <ActivityIndicator size="small" color="#0ea5e9" style={{ marginLeft: 8 }} />}
                  {!vimeoRefreshing && (
                    <Text style={[S.liveTag, { color: vimeoLive ? "#22c55e" : "#64748b" }]}>
                      {vimeoLive ? `● LIVE` : `● STATIC`}
                    </Text>
                  )}
                </View>
                <Text style={S.sectionDesc}>{tx.companyDesc}</Text>
              </View>
            </View>

            {invitationVideos.map((video) => {
              const cat = categoryLabel(video.category, tx);
              return (
                <TouchableOpacity key={video.id} style={S.vimeoCard} onPress={() => openVimeo(video.id)} activeOpacity={0.85}>
                  <View style={S.vimeoThumbWrap}>
                    <Image source={{ uri: video.thumbnail }} style={S.vimeoThumb} resizeMode="cover" />
                    <View style={S.playOverlay}>
                      <View style={S.vimeoPlayBtn}>
                        <Text style={S.playIcon}>▶</Text>
                      </View>
                    </View>
                    <View style={[S.catBadge, { backgroundColor: cat.color + "22", borderColor: cat.color + "55" }]}>
                      <Text style={[S.catBadgeText, { color: cat.color }]}>{cat.label}</Text>
                    </View>
                  </View>
                  <View style={S.vimeoInfo}>
                    <Text style={S.vimeoTitle} numberOfLines={2}>{video.title}</Text>
                    <View style={S.vimeoMetaRow}>
                      {!!video.age && <Text style={S.vimeoAge}>{video.age}</Text>}
                      <Text style={S.watchVimeoText}>{tx.watchVimeo}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={S.vimeoFooterRow}>
              <TouchableOpacity style={S.vimeoChannelBtn} onPress={openVimeoChannel} activeOpacity={0.85}>
                <Text style={S.vimeoChannelBtnText}>{tx.vimeoChannelBtn}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.refreshBtn} onPress={refreshVimeo} disabled={vimeoRefreshing}>
                <Text style={S.refreshBtnText}>{vimeoRefreshing ? "…" : tx.refreshBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ══ SECTION 2b: Presentation + Plan — adviser only ══════════════ */}
          {partnerMode && (
            <View style={S.sectionBlock}>
              <View style={S.sectionTitleRow}>
                <Text style={S.sectionLabel}>ADVISER — PRESENTATIONS & COMPENSATION PLANS</Text>
                <View style={S.adviserBadge}>
                  <Text style={S.adviserBadgeText}>🔒 ADVISER</Text>
                </View>
              </View>
              <Text style={[S.sectionDesc, { marginBottom: 14 }]}>Full business presentation and compensation plan videos. Not visible to clients.</Text>

              {adviserVideos.map((video) => {
                const cat = categoryLabel(video.category, tx);
                return (
                  <TouchableOpacity key={video.id} style={S.vimeoCard} onPress={() => openVimeo(video.id)} activeOpacity={0.85}>
                    <View style={S.vimeoThumbWrap}>
                      <Image source={{ uri: video.thumbnail }} style={S.vimeoThumb} resizeMode="cover" />
                      <View style={S.playOverlay}>
                        <View style={S.vimeoPlayBtn}>
                          <Text style={S.playIcon}>▶</Text>
                        </View>
                      </View>
                      <View style={[S.catBadge, { backgroundColor: cat.color + "22", borderColor: cat.color + "55" }]}>
                        <Text style={[S.catBadgeText, { color: cat.color }]}>{cat.label}</Text>
                      </View>
                    </View>
                    <View style={S.vimeoInfo}>
                      <Text style={S.vimeoTitle} numberOfLines={2}>{video.title}</Text>
                      <View style={S.vimeoMetaRow}>
                        {!!video.age && <Text style={S.vimeoAge}>{video.age}</Text>}
                        <Text style={S.watchVimeoText}>{tx.watchVimeo}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  contentWrap: { width: "100%" },
  contentWrapLarge: { maxWidth: 720, alignSelf: "center", width: "100%" },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#f1f5f9", letterSpacing: 0.5, marginBottom: 6 },
  headerSub: { fontSize: 14, color: "#94a3b8", lineHeight: 20 },

  sectionBlock: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#1e293b", marginBottom: 4 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: "#64748b", letterSpacing: 1.2 },
  sectionDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 18, marginTop: 2 },
  liveTag: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },

  vimeoLogoWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(14,165,233,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "rgba(14,165,233,0.3)", marginTop: 2 },
  vimeoLogoText: { fontSize: 22 },

  vimeoCard: { backgroundColor: "#1e293b", borderRadius: 14, overflow: "hidden", marginBottom: 14, borderWidth: 1, borderColor: "#334155" },
  vimeoThumbWrap: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#0f172a", position: "relative" },
  vimeoThumb: { width: "100%", height: "100%" },
  vimeoInfo: { padding: 12 },
  vimeoTitle: { fontSize: 15, fontWeight: "700", color: "#f1f5f9", lineHeight: 20, marginBottom: 6 },
  vimeoMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  vimeoAge: { fontSize: 12, color: "#64748b" },
  watchVimeoText: { fontSize: 13, color: "#0ea5e9", fontWeight: "700" },

  catBadge: { position: "absolute", top: 8, left: 8, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1 },
  catBadgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },

  vimeoPlayBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(14,165,233,0.9)", alignItems: "center", justifyContent: "center" },

  vimeoFooterRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  vimeoChannelBtn: { flex: 1, backgroundColor: "#0c1a2e", borderRadius: 10, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#0ea5e9" },
  vimeoChannelBtnText: { color: "#0ea5e9", fontWeight: "bold", fontSize: 14 },

  channelCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: "#334155", marginBottom: 12 },
  channelLogoWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#f59e0b" },
  channelLogoText: { fontSize: 26 },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 16, fontWeight: "bold", color: "#f1f5f9" },
  channelHandle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  channelDesc: { fontSize: 13, color: "#94a3b8", marginTop: 4, lineHeight: 18 },

  subscribeBtn: { backgroundColor: "#ef4444", borderRadius: 10, paddingVertical: 13, alignItems: "center", marginBottom: 20 },
  subscribeBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16, letterSpacing: 0.3 },

  videoCard: { backgroundColor: "#1e293b", borderRadius: 14, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "#334155" },
  thumbWrap: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#0f172a", position: "relative" },
  thumb: { width: "100%", height: "100%" },
  durationBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.85)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  durationText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  playOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  ytPlayBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(239,68,68,0.9)", alignItems: "center", justifyContent: "center" },
  playIcon: { color: "#fff", fontSize: 20, marginLeft: 3 },
  videoInfo: { padding: 14, gap: 6 },
  videoTitle: { fontSize: 16, fontWeight: "bold", color: "#f1f5f9", lineHeight: 22 },
  videoMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  videoMetaText: { fontSize: 13, color: "#64748b" },
  videoMetaDot: { fontSize: 13, color: "#334155" },
  watchText: { fontSize: 14, color: "#f59e0b", fontWeight: "bold", marginTop: 4 },

  adviserBadge: { backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(245,158,11,0.35)" },
  adviserBadgeText: { color: "#f59e0b", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  refreshBtn: { backgroundColor: "#1e293b", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#334155" },
  refreshBtnText: { color: "#64748b", fontSize: 12, fontWeight: "600" },
});
