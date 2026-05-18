import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet,
  ActivityIndicator, Linking, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { trpc } from "@/lib/trpc";
import type { Language } from "@/lib/translations";
import {
  buildHnwLetter,
  type HnwFormality,
  type HnwNetWorth,
  type HnwRelationship,
  type HnwAssetInterest,
} from "./templates/hnw";
import { resolveLogoForPdf, buildLetterHtml, formatLetterDate, loadLocalProfile } from "./shared";

const NAVY = "#0a1628";
const PURPLE = "#a855f7";
const PURPLE_DARK = "#7c3aed";
const FONT = "ArialRoundedMTBold";

type ScreenText = {
  back: string; title: string; sub: string;
  sectionRecipient: string; labelName: string; labelTitle: string; placeholderTitle: string;
  sectionRelationship: string;
  relCold: string; relWarm: string; relReferred: string; placeholderReferredBy: string;
  sectionAsset: string;
  assetRe: string; assetPort: string; assetWealth: string; assetRetire: string;
  sectionNetWorth: string; nw1: string; nw2: string; nw3: string;
  sectionFormality: string; formalityFormal: string; formalityUltra: string;
  sectionEmail: string; placeholderEmail: string;
  previewTitle: string; generate: string;
  copy: string; copied: string; email: string; pdf: string; exporting: string;
};

const TX: Record<Language, ScreenText> = {
  en: {
    back: "← Back", title: "VIP / HNW OUTREACH", sub: "Ultra-premium letters for high-net-worth prospects.",
    sectionRecipient: "RECIPIENT", labelName: "Full Name", labelTitle: "Formal Title",
    placeholderTitle: "e.g. Mr. / Ms. / Dr. / Lord",
    sectionRelationship: "RELATIONSHIP",
    relCold: "Cold Contact", relWarm: "Warm Acquaintance", relReferred: "Referred by…",
    placeholderReferredBy: "Referrer's name",
    sectionAsset: "ASSET INTEREST",
    assetRe: "Real Estate", assetPort: "Investment Portfolio",
    assetWealth: "Wealth Preservation", assetRetire: "Retirement Planning",
    sectionNetWorth: "EST. NET WORTH",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "FORMALITY",
    formalityFormal: "Formal", formalityUltra: "Ultra-Formal",
    sectionEmail: "RECIPIENT EMAIL (optional — for Open in Mail)",
    placeholderEmail: "recipient@email.com",
    previewTitle: "LETTER PREVIEW", generate: "Generate Letter",
    copy: "Copy", copied: "Copied!", email: "Open in Mail", pdf: "Export PDF", exporting: "Exporting…",
  },
  nl: {
    back: "← Terug", title: "VIP / HNW OUTREACH", sub: "Ultra-premium brieven voor vermogende prospects.",
    sectionRecipient: "ONTVANGER", labelName: "Volledige Naam", labelTitle: "Formele Titel",
    placeholderTitle: "bijv. Dhr. / Mevr. / Dr.",
    sectionRelationship: "RELATIE",
    relCold: "Koud Contact", relWarm: "Warm Kennis", relReferred: "Doorverwezen door…",
    placeholderReferredBy: "Naam doorverwijzer",
    sectionAsset: "VERMOGENSINTERESSE",
    assetRe: "Vastgoed", assetPort: "Beleggingsportefeuille",
    assetWealth: "Vermogensbehoud", assetRetire: "Pensioenplanning",
    sectionNetWorth: "GESCHAT VERMOGEN",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "FORMALITEITSNIVEAU",
    formalityFormal: "Formeel", formalityUltra: "Ultra-Formeel",
    sectionEmail: "E-MAIL ONTVANGER (optioneel — voor E-mail openen)",
    placeholderEmail: "ontvanger@email.com",
    previewTitle: "BRIEFVOORBEELD", generate: "Brief Genereren",
    copy: "Kopiëren", copied: "Gekopieerd!", email: "E-mail openen", pdf: "PDF Exporteren", exporting: "Exporteren…",
  },
  de: {
    back: "← Zurück", title: "VIP / HNW OUTREACH", sub: "Ultra-Premium-Briefe für vermögende Interessenten.",
    sectionRecipient: "EMPFÄNGER", labelName: "Vollständiger Name", labelTitle: "Formelle Anrede",
    placeholderTitle: "z.B. Herr / Frau / Dr. / Prof.",
    sectionRelationship: "BEZIEHUNG",
    relCold: "Kein Kontakt", relWarm: "Bekannter", relReferred: "Empfohlen von…",
    placeholderReferredBy: "Name des Empfehlers",
    sectionAsset: "ANLAGEINTERESSE",
    assetRe: "Immobilien", assetPort: "Investmentportfolio",
    assetWealth: "Vermögenserhalt", assetRetire: "Ruhestandsplanung",
    sectionNetWorth: "GESCHÄTZTES VERMÖGEN",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "FORMALITÄTSNIVEAU",
    formalityFormal: "Formell", formalityUltra: "Ultra-Formell",
    sectionEmail: "EMPFÄNGER-E-MAIL (optional — für In E-Mail öffnen)",
    placeholderEmail: "empfaenger@email.com",
    previewTitle: "BRIEFVORSCHAU", generate: "Brief Erstellen",
    copy: "Kopieren", copied: "Kopiert!", email: "In E-Mail öffnen", pdf: "PDF Exportieren", exporting: "Exportieren…",
  },
  fr: {
    back: "← Retour", title: "VIP / HNW OUTREACH", sub: "Lettres ultra-premium pour prospects fortunés.",
    sectionRecipient: "DESTINATAIRE", labelName: "Nom Complet", labelTitle: "Titre Formel",
    placeholderTitle: "ex. M. / Mme / Dr. / Me",
    sectionRelationship: "RELATION",
    relCold: "Contact Froid", relWarm: "Connaissance", relReferred: "Référé par…",
    placeholderReferredBy: "Nom du référent",
    sectionAsset: "INTÉRÊT PATRIMONIAL",
    assetRe: "Immobilier", assetPort: "Portefeuille d'investissement",
    assetWealth: "Préservation du Patrimoine", assetRetire: "Planification Retraite",
    sectionNetWorth: "PATRIMOINE ESTIMÉ",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "NIVEAU DE FORMALITÉ",
    formalityFormal: "Formel", formalityUltra: "Ultra-Formel",
    sectionEmail: "E-MAIL DESTINATAIRE (optionnel — pour Ouvrir dans Mail)",
    placeholderEmail: "destinataire@email.com",
    previewTitle: "APERÇU DE LA LETTRE", generate: "Générer la Lettre",
    copy: "Copier", copied: "Copié!", email: "Ouvrir dans Mail", pdf: "Exporter PDF", exporting: "Export…",
  },
  es: {
    back: "← Volver", title: "VIP / HNW OUTREACH", sub: "Cartas ultra-premium para prospectos de alto patrimonio.",
    sectionRecipient: "DESTINATARIO", labelName: "Nombre Completo", labelTitle: "Título Formal",
    placeholderTitle: "ej. Sr. / Sra. / Dr. / Dra.",
    sectionRelationship: "RELACIÓN",
    relCold: "Contacto Frío", relWarm: "Conocido", relReferred: "Referido por…",
    placeholderReferredBy: "Nombre del referente",
    sectionAsset: "INTERÉS PATRIMONIAL",
    assetRe: "Bienes Raíces", assetPort: "Cartera de Inversión",
    assetWealth: "Preservación del Patrimonio", assetRetire: "Planificación Jubilación",
    sectionNetWorth: "PATRIMONIO ESTIMADO",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "NIVEL DE FORMALIDAD",
    formalityFormal: "Formal", formalityUltra: "Ultra-Formal",
    sectionEmail: "EMAIL DESTINATARIO (opcional — para Abrir en Correo)",
    placeholderEmail: "destinatario@email.com",
    previewTitle: "VISTA PREVIA", generate: "Generar Carta",
    copy: "Copiar", copied: "¡Copiado!", email: "Abrir en Correo", pdf: "Exportar PDF", exporting: "Exportando…",
  },
  it: {
    back: "← Indietro", title: "VIP / HNW OUTREACH", sub: "Lettere ultra-premium per prospect ad alto patrimonio.",
    sectionRecipient: "DESTINATARIO", labelName: "Nome Completo", labelTitle: "Titolo Formale",
    placeholderTitle: "es. Sig. / Sig.ra / Dott. / Prof.",
    sectionRelationship: "RELAZIONE",
    relCold: "Contatto Freddo", relWarm: "Conoscente", relReferred: "Riferito da…",
    placeholderReferredBy: "Nome del referente",
    sectionAsset: "INTERESSE PATRIMONIALE",
    assetRe: "Immobiliare", assetPort: "Portafoglio Investimenti",
    assetWealth: "Preservazione del Patrimonio", assetRetire: "Pianificazione Pensionistica",
    sectionNetWorth: "PATRIMONIO STIMATO",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "LIVELLO DI FORMALITÀ",
    formalityFormal: "Formale", formalityUltra: "Ultra-Formale",
    sectionEmail: "EMAIL DESTINATARIO (opzionale — per Apri in Mail)",
    placeholderEmail: "destinatario@email.com",
    previewTitle: "ANTEPRIMA LETTERA", generate: "Genera Lettera",
    copy: "Copia", copied: "Copiato!", email: "Apri in Mail", pdf: "Esporta PDF", exporting: "Esportazione…",
  },
  pt: {
    back: "← Voltar", title: "VIP / HNW OUTREACH", sub: "Cartas ultra-premium para prospects de alto patrimônio.",
    sectionRecipient: "DESTINATÁRIO", labelName: "Nome Completo", labelTitle: "Título Formal",
    placeholderTitle: "ex. Sr. / Sra. / Dr. / Prof.",
    sectionRelationship: "RELACIONAMENTO",
    relCold: "Contato Frio", relWarm: "Conhecido", relReferred: "Indicado por…",
    placeholderReferredBy: "Nome do indicador",
    sectionAsset: "INTERESSE PATRIMONIAL",
    assetRe: "Imóveis", assetPort: "Carteira de Investimentos",
    assetWealth: "Preservação do Patrimônio", assetRetire: "Planejamento de Aposentadoria",
    sectionNetWorth: "PATRIMÔNIO ESTIMADO",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "NÍVEL DE FORMALIDADE",
    formalityFormal: "Formal", formalityUltra: "Ultra-Formal",
    sectionEmail: "EMAIL DO DESTINATÁRIO (opcional — para Abrir no Mail)",
    placeholderEmail: "destinatario@email.com",
    previewTitle: "PRÉVIA DA CARTA", generate: "Gerar Carta",
    copy: "Copiar", copied: "Copiado!", email: "Abrir no Mail", pdf: "Exportar PDF", exporting: "Exportando…",
  },
  ru: {
    back: "← Назад", title: "VIP / HNW OUTREACH", sub: "Ультра-премиум письма для состоятельных клиентов.",
    sectionRecipient: "ПОЛУЧАТЕЛЬ", labelName: "Полное Имя", labelTitle: "Обращение",
    placeholderTitle: "напр. г-н / г-жа / д-р",
    sectionRelationship: "ТИП КОНТАКТА",
    relCold: "Холодный Контакт", relWarm: "Знакомый", relReferred: "Рекомендован…",
    placeholderReferredBy: "Имя рекомендателя",
    sectionAsset: "ИНТЕРЕС К АКТИВАМ",
    assetRe: "Недвижимость", assetPort: "Инвестиционный Портфель",
    assetWealth: "Сохранение Капитала", assetRetire: "Пенсионное Планирование",
    sectionNetWorth: "ОЦЕНОЧНЫЙ КАПИТАЛ",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "УРОВЕНЬ ФОРМАЛЬНОСТИ",
    formalityFormal: "Формальный", formalityUltra: "Ультра-Формальный",
    sectionEmail: "EMAIL ПОЛУЧАТЕЛЯ (необязательно — для открытия в почте)",
    placeholderEmail: "получатель@email.com",
    previewTitle: "ПРЕДПРОСМОТР ПИСЬМА", generate: "Создать Письмо",
    copy: "Копировать", copied: "Скопировано!", email: "Открыть в Почте", pdf: "Экспорт PDF", exporting: "Экспорт…",
  },
  zh: {
    back: "← 返回", title: "VIP / 高净值推广", sub: "针对高净值客户的超高端信函。",
    sectionRecipient: "收件人", labelName: "全名", labelTitle: "正式称谓",
    placeholderTitle: "如 先生 / 女士 / 博士",
    sectionRelationship: "关系类型",
    relCold: "冷接触", relWarm: "熟人", relReferred: "由…介绍",
    placeholderReferredBy: "介绍人姓名",
    sectionAsset: "资产兴趣",
    assetRe: "房地产", assetPort: "投资组合",
    assetWealth: "财富保值", assetRetire: "退休规划",
    sectionNetWorth: "预估净资产",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "正式程度",
    formalityFormal: "正式", formalityUltra: "极度正式",
    sectionEmail: "收件人邮箱（可选——用于邮件客户端打开）",
    placeholderEmail: "收件人@email.com",
    previewTitle: "信函预览", generate: "生成信函",
    copy: "复制", copied: "已复制！", email: "邮件打开", pdf: "导出PDF", exporting: "导出中…",
  },
  tl: {
    back: "← Bumalik", title: "VIP / HNW OUTREACH", sub: "Ultra-premium na liham para sa mga mataas na networth.",
    sectionRecipient: "TATANGGAP", labelName: "Buong Pangalan", labelTitle: "Pormal na Titulo",
    placeholderTitle: "hal. Gng. / Bb. / Dr.",
    sectionRelationship: "RELASYON",
    relCold: "Malamig na Kontak", relWarm: "Kilala", relReferred: "Inirekomenda ni…",
    placeholderReferredBy: "Pangalan ng nagrekumenda",
    sectionAsset: "INTERES SA ASSET",
    assetRe: "Real Estate", assetPort: "Portfolio ng Pamumuhunan",
    assetWealth: "Pangangalaga ng Kayamanan", assetRetire: "Pagpaplano ng Pagreretiro",
    sectionNetWorth: "TINATAYANG NET WORTH",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "ANTAS NG PORMALIDAD",
    formalityFormal: "Pormal", formalityUltra: "Ultra-Pormal",
    sectionEmail: "EMAIL NG TATANGGAP (opsyonal — para sa Buksan sa Mail)",
    placeholderEmail: "tatanggap@email.com",
    previewTitle: "PREVIEW NG LIHAM", generate: "Buuin ang Liham",
    copy: "Kopyahin", copied: "Nakopya!", email: "Buksan sa Mail", pdf: "I-export ang PDF", exporting: "Ine-export…",
  },
  ar: {
    back: "→ رجوع", title: "VIP / كبار العملاء", sub: "رسائل فائقة الجودة لكبار العملاء.",
    sectionRecipient: "المستلم", labelName: "الاسم الكامل", labelTitle: "اللقب الرسمي",
    placeholderTitle: "مثال: السيد / السيدة / الدكتور",
    sectionRelationship: "طبيعة العلاقة",
    relCold: "تواصل مبدئي", relWarm: "معرفة سابقة", relReferred: "موصى به من…",
    placeholderReferredBy: "اسم المُحيل",
    sectionAsset: "اهتمام الاستثمار",
    assetRe: "عقارات", assetPort: "محفظة استثمارية",
    assetWealth: "الحفاظ على الثروة", assetRetire: "تخطيط التقاعد",
    sectionNetWorth: "الثروة التقديرية",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "مستوى الرسمية",
    formalityFormal: "رسمي", formalityUltra: "رسمي للغاية",
    sectionEmail: "بريد المستلم (اختياري — لفتح في البريد)",
    placeholderEmail: "المستلم@email.com",
    previewTitle: "معاينة الرسالة", generate: "إنشاء الرسالة",
    copy: "نسخ", copied: "تم النسخ!", email: "فتح في البريد", pdf: "تصدير PDF", exporting: "جاري التصدير…",
  },
  th: {
    back: "← กลับ", title: "VIP / HNW OUTREACH", sub: "จดหมายระดับสูงสุดสำหรับลูกค้ามั่งคั่ง",
    sectionRecipient: "ผู้รับ", labelName: "ชื่อเต็ม", labelTitle: "คำนำหน้า",
    placeholderTitle: "เช่น นาย / นาง / ดร.",
    sectionRelationship: "ความสัมพันธ์",
    relCold: "ไม่รู้จัก", relWarm: "รู้จักกัน", relReferred: "ได้รับการแนะนำจาก…",
    placeholderReferredBy: "ชื่อผู้แนะนำ",
    sectionAsset: "ความสนใจด้านทรัพย์สิน",
    assetRe: "อสังหาริมทรัพย์", assetPort: "พอร์ตการลงทุน",
    assetWealth: "การรักษามูลค่าทรัพย์สิน", assetRetire: "การวางแผนเกษียณ",
    sectionNetWorth: "มูลค่าสินทรัพย์โดยประมาณ",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "ระดับความเป็นทางการ",
    formalityFormal: "เป็นทางการ", formalityUltra: "เป็นทางการสูงสุด",
    sectionEmail: "อีเมลผู้รับ (ไม่บังคับ — สำหรับเปิดใน Mail)",
    placeholderEmail: "ผู้รับ@email.com",
    previewTitle: "ตัวอย่างจดหมาย", generate: "สร้างจดหมาย",
    copy: "คัดลอก", copied: "คัดลอกแล้ว!", email: "เปิดใน Mail", pdf: "ส่งออก PDF", exporting: "กำลังส่งออก…",
  },
  hi: {
    back: "← वापस", title: "VIP / HNW आउटरीच", sub: "उच्च-नेटवर्थ प्रॉस्पेक्ट्स के लिए अल्ट्रा-प्रीमियम पत्र।",
    sectionRecipient: "प्राप्तकर्ता", labelName: "पूरा नाम", labelTitle: "औपचारिक शीर्षक",
    placeholderTitle: "जैसे श्री / श्रीमती / डॉ.",
    sectionRelationship: "संबंध",
    relCold: "नया संपर्क", relWarm: "परिचित", relReferred: "द्वारा रेफर…",
    placeholderReferredBy: "रेफरर का नाम",
    sectionAsset: "संपत्ति रुचि",
    assetRe: "रियल एस्टेट", assetPort: "निवेश पोर्टफोलियो",
    assetWealth: "धन संरक्षण", assetRetire: "सेवानिवृत्ति योजना",
    sectionNetWorth: "अनुमानित नेट वर्थ",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "औपचारिकता स्तर",
    formalityFormal: "औपचारिक", formalityUltra: "अति-औपचारिक",
    sectionEmail: "प्राप्तकर्ता ईमेल (वैकल्पिक — मेल में खोलने के लिए)",
    placeholderEmail: "प्राप्तकर्ता@email.com",
    previewTitle: "पत्र पूर्वावलोकन", generate: "पत्र उत्पन्न करें",
    copy: "कॉपी", copied: "कॉपी हो गया!", email: "मेल में खोलें", pdf: "PDF निर्यात", exporting: "निर्यात हो रहा है…",
  },
  vi: {
    back: "← Quay lại", title: "VIP / HNW OUTREACH", sub: "Thư siêu cao cấp cho khách hàng tài sản cao.",
    sectionRecipient: "NGƯỜI NHẬN", labelName: "Họ và Tên", labelTitle: "Danh Xưng Trang Trọng",
    placeholderTitle: "vd. Ông / Bà / Tiến sĩ",
    sectionRelationship: "MỐI QUAN HỆ",
    relCold: "Liên hệ Lạnh", relWarm: "Quen Biết", relReferred: "Được giới thiệu bởi…",
    placeholderReferredBy: "Tên người giới thiệu",
    sectionAsset: "QUAN TÂM TÀI SẢN",
    assetRe: "Bất Động Sản", assetPort: "Danh Mục Đầu Tư",
    assetWealth: "Bảo Toàn Tài Sản", assetRetire: "Kế Hoạch Hưu Trí",
    sectionNetWorth: "TÀI SẢN RÒNG ƯỚC TÍNH",
    nw1: "€1M – €5M", nw2: "€5M – €25M", nw3: "€25M+",
    sectionFormality: "MỨC ĐỘ TRANG TRỌNG",
    formalityFormal: "Trang Trọng", formalityUltra: "Cực Kỳ Trang Trọng",
    sectionEmail: "EMAIL NGƯỜI NHẬN (không bắt buộc — để mở trong Mail)",
    placeholderEmail: "nguoinhan@email.com",
    previewTitle: "XEM TRƯỚC THƯ", generate: "Tạo Thư",
    copy: "Sao Chép", copied: "Đã Sao Chép!", email: "Mở trong Mail", pdf: "Xuất PDF", exporting: "Đang Xuất…",
  },
};

export default function HnwOutreachScreen() {
  const router = useRouter();
  const { language } = useCalculator();
  const tx = TX[language] ?? TX.en;

  const [recipientName, setRecipientName] = useState("");
  const [formalAddress, setFormalAddress] = useState("");
  const [relationship, setRelationship] = useState<HnwRelationship>("cold");
  const [referredBy, setReferredBy] = useState("");
  const [assetInterest, setAssetInterest] = useState<HnwAssetInterest>("portfolio");
  const [netWorth, setNetWorth] = useState<HnwNetWorth>("5m-25m");
  const [formality, setFormality] = useState<HnwFormality>("formal");
  const [recipientEmail, setRecipientEmail] = useState("");

  const [adviserName, setAdviserName] = useState("");
  const [company, setCompany] = useState("");
  const [mobile, setMobile] = useState("");
  const [contact, setContact] = useState("");
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  const [letterText, setLetterText] = useState("");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const profileQuery = trpc.advisor.getProfile.useQuery(undefined, { retry: false });

  useEffect(() => {
    const p = profileQuery.data;
    if (p) {
      if (p.adviserName) setAdviserName(p.adviserName);
      if (p.companyName) setCompany(p.companyName);
      if (p.mobile) setMobile(p.mobile);
      if (p.contactInfo) setContact(p.contactInfo);
      if (p.logoUrl) setCustomLogoUrl(p.logoUrl);
      return;
    }
    if (!profileQuery.isLoading) {
      loadLocalProfile().then((local) => {
        if (local.adviserName) setAdviserName(local.adviserName);
        if (local.companyName) setCompany(local.companyName);
        if (local.mobile) setMobile(local.mobile);
        if (local.contactInfo) setContact(local.contactInfo);
        if (local.logoUrl) setCustomLogoUrl(local.logoUrl);
      });
    }
  }, [profileQuery.data, profileQuery.isLoading]);

  const generateLetter = useCallback(() => {
    if (!recipientName.trim()) return;
    const date = formatLetterDate(language);
    const text = buildHnwLetter(language, {
      recipientName: recipientName.trim(),
      formalAddress: formalAddress.trim() || "Mr./Ms.",
      relationship,
      referredBy: relationship === "referred" ? referredBy.trim() : undefined,
      assetInterest,
      netWorth,
      formality,
      adviserName: adviserName || "Your Adviser",
      company: company || "Your Company",
      mobile: mobile || "",
      contact: contact || "",
      date,
    });
    setLetterText(text);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [
    recipientName, formalAddress, relationship, referredBy,
    assetInterest, netWorth, formality,
    adviserName, company, mobile, contact, language,
  ]);

  const handleCopy = async () => {
    if (!letterText) return;
    await Clipboard.setStringAsync(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenInMail = () => {
    if (!letterText) return;
    const subject = encodeURIComponent(
      `Private Introduction – ${adviserName || "Your Adviser"}, ${company || ""}`.trim().replace(/,\s*$/, "")
    );
    const body = encodeURIComponent(letterText);
    const to = recipientEmail.trim() ? encodeURIComponent(recipientEmail.trim()) : "";
    Linking.openURL(`mailto:${to}?subject=${subject}&body=${body}`);
  };

  const handleExportPdf = async () => {
    if (!letterText) return;
    setExporting(true);
    try {
      const logoSrc = await resolveLogoForPdf(customLogoUrl);
      const date = formatLetterDate(language);
      const html = buildLetterHtml(letterText, logoSrc, recipientName || "VIP Recipient", date);
      if (Platform.OS === "web") {
        const win = window.open("", "_blank");
        if (win) { win.document.write(html); win.document.close(); win.print(); }
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
      }
    } finally {
      setExporting(false);
    }
  };

  const hasLetter = letterText.length > 0;

  return (
    <ScreenContainer bgColor={NAVY}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={S.backText}>{tx.back}</Text>
          </TouchableOpacity>
          <View style={[S.accentBar, { backgroundColor: PURPLE }]} />
          <Text style={S.title}>{tx.title}</Text>
          <Text style={S.sub}>{tx.sub}</Text>
        </View>

        <View style={S.body}>

          {/* Recipient */}
          <Text style={S.sectionLabel}>{tx.sectionRecipient}</Text>
          <View style={S.row}>
            <View style={{ flex: 1.8 }}>
              <Text style={S.fieldLabel}>{tx.labelName}</Text>
              <TextInput
                style={S.input}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="e.g. James Whitmore"
                placeholderTextColor="#334155"
              />
            </View>
            <View style={{ flex: 1.2 }}>
              <Text style={S.fieldLabel}>{tx.labelTitle}</Text>
              <TextInput
                style={S.input}
                value={formalAddress}
                onChangeText={setFormalAddress}
                placeholder={tx.placeholderTitle}
                placeholderTextColor="#334155"
              />
            </View>
          </View>

          {/* Relationship */}
          <Text style={S.sectionLabel}>{tx.sectionRelationship}</Text>
          <View style={S.pills}>
            {(["cold", "warm", "referred"] as HnwRelationship[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[S.pill, relationship === r && { backgroundColor: PURPLE_DARK, borderColor: PURPLE }]}
                onPress={() => setRelationship(r)}
              >
                <Text style={[S.pillText, relationship === r && S.pillTextActive]}>
                  {r === "cold" ? tx.relCold : r === "warm" ? tx.relWarm : tx.relReferred}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {relationship === "referred" && (
            <TextInput
              style={[S.input, { marginTop: 8 }]}
              value={referredBy}
              onChangeText={setReferredBy}
              placeholder={tx.placeholderReferredBy}
              placeholderTextColor="#334155"
            />
          )}

          {/* Asset Interest */}
          <Text style={S.sectionLabel}>{tx.sectionAsset}</Text>
          <View style={S.pills}>
            {(["real-estate", "portfolio", "wealth", "retirement"] as HnwAssetInterest[]).map((a) => (
              <TouchableOpacity
                key={a}
                style={[S.pill, assetInterest === a && { backgroundColor: PURPLE_DARK, borderColor: PURPLE }]}
                onPress={() => setAssetInterest(a)}
              >
                <Text style={[S.pillText, assetInterest === a && S.pillTextActive]}>
                  {a === "real-estate" ? tx.assetRe
                    : a === "portfolio" ? tx.assetPort
                    : a === "wealth" ? tx.assetWealth
                    : tx.assetRetire}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Net Worth */}
          <Text style={S.sectionLabel}>{tx.sectionNetWorth}</Text>
          <View style={S.pills}>
            {(["1m-5m", "5m-25m", "25m+"] as HnwNetWorth[]).map((n) => (
              <TouchableOpacity
                key={n}
                style={[S.pill, netWorth === n && { backgroundColor: PURPLE_DARK, borderColor: PURPLE }]}
                onPress={() => setNetWorth(n)}
              >
                <Text style={[S.pillText, netWorth === n && S.pillTextActive]}>
                  {n === "1m-5m" ? tx.nw1 : n === "5m-25m" ? tx.nw2 : tx.nw3}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Formality */}
          <Text style={S.sectionLabel}>{tx.sectionFormality}</Text>
          <View style={S.pills}>
            {(["formal", "ultra"] as HnwFormality[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[S.pill, formality === f && { backgroundColor: PURPLE_DARK, borderColor: PURPLE }]}
                onPress={() => setFormality(f)}
              >
                <Text style={[S.pillText, formality === f && S.pillTextActive]}>
                  {f === "formal" ? tx.formalityFormal : tx.formalityUltra}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Optional email */}
          <Text style={S.sectionLabel}>{tx.sectionEmail}</Text>
          <TextInput
            style={S.input}
            value={recipientEmail}
            onChangeText={setRecipientEmail}
            placeholder={tx.placeholderEmail}
            placeholderTextColor="#334155"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Generate button */}
          <TouchableOpacity
            style={[S.generateBtn, !recipientName.trim() && S.generateBtnDisabled]}
            onPress={generateLetter}
            activeOpacity={0.85}
            disabled={!recipientName.trim()}
          >
            <Text style={S.generateBtnText}>{tx.generate}</Text>
          </TouchableOpacity>

          {/* Letter preview + actions */}
          {hasLetter && (
            <>
              <Text style={S.sectionLabel}>{tx.previewTitle}</Text>
              <View style={S.preview}>
                <Text style={S.previewText}>{letterText}</Text>
              </View>

              <View style={S.actions}>
                <TouchableOpacity style={[S.actionBtn, { borderColor: PURPLE }]} onPress={handleCopy} activeOpacity={0.8}>
                  <Text style={[S.actionBtnText, { color: PURPLE }]}>{copied ? tx.copied : tx.copy}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[S.actionBtn, { borderColor: "#22c55e" }]} onPress={handleOpenInMail} activeOpacity={0.8}>
                  <Text style={[S.actionBtnText, { color: "#22c55e" }]}>{tx.email}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[S.actionBtn, { borderColor: "#f59e0b" }, exporting && S.actionBtnDisabled]}
                  onPress={handleExportPdf}
                  activeOpacity={0.8}
                  disabled={exporting}
                >
                  {exporting
                    ? <ActivityIndicator size="small" color="#f59e0b" />
                    : <Text style={[S.actionBtnText, { color: "#f59e0b" }]}>{tx.pdf}</Text>
                  }
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: "#1e2d47",
  },
  backText: { color: PURPLE, fontFamily: FONT, fontSize: 14, marginBottom: 12 },
  accentBar: { height: 3, width: 40, borderRadius: 2, marginBottom: 12 },
  title: { color: "#fff", fontFamily: FONT, fontSize: 20, letterSpacing: 1, marginBottom: 4 },
  sub: { color: "#64748b", fontFamily: FONT, fontSize: 12, lineHeight: 18 },

  body: { padding: 20, gap: 0 },

  sectionLabel: {
    color: PURPLE, fontFamily: FONT, fontSize: 10, letterSpacing: 1.2,
    marginTop: 20, marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 10 },
  fieldLabel: { color: "#64748b", fontFamily: FONT, fontSize: 10, marginBottom: 4 },
  input: {
    backgroundColor: "#0f1f38", borderRadius: 10, borderWidth: 1, borderColor: "#1e2d47",
    paddingHorizontal: 12, paddingVertical: 10,
    color: "#f1f5f9", fontFamily: FONT, fontSize: 13,
  },

  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: "#1e2d47",
    backgroundColor: "#0f1f38",
  },
  pillText: { color: "#64748b", fontFamily: FONT, fontSize: 12 },
  pillTextActive: { color: "#fff" },

  generateBtn: {
    marginTop: 24, backgroundColor: PURPLE, borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
  },
  generateBtnDisabled: { opacity: 0.4 },
  generateBtnText: { color: "#fff", fontFamily: FONT, fontSize: 14, letterSpacing: 0.5 },

  preview: {
    backgroundColor: "#0f1f38", borderRadius: 12, borderWidth: 1, borderColor: "#1e2d47",
    padding: 16,
  },
  previewText: { color: "#cbd5e1", fontFamily: FONT, fontSize: 12, lineHeight: 20 },

  actions: { flexDirection: "row", gap: 10, marginTop: 14, flexWrap: "wrap" },
  actionBtn: {
    flex: 1, minWidth: 90, paddingVertical: 12, borderRadius: 10, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontFamily: FONT, fontSize: 12 },
});
