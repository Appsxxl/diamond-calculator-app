import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Share, Platform, KeyboardAvoidingView, ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { trpc } from "@/lib/trpc";
import { buildRealEstateLetter } from "./templates/realestate";
import { resolveLogoForPdf, buildLetterHtml, formatLetterDate, loadLocalProfile } from "./shared";
import type { RealEstateLetterType } from "./templates/realestate";
import type { Language } from "@/lib/translations";

const NAVY = "#0a1628";
const GOLD = "#e67e22";
const GREEN = "#065f46";
const FONT = "ArialRoundedMTBold";

type ScreenText = {
  back: string; title: string; sub: string;
  sectionType: string;
  typeReferral: string; typeReferralSub: string;
  typeJv: string; typeJvSub: string;
  sectionYou: string; autoSaved: string;
  placeholderName: string; placeholderCompany: string;
  placeholderMobile: string; placeholderEmail: string;
  sectionRecipient: string; placeholderRecipient: string;
  sectionPreview: string;
  btnCopy: string; btnCopied: string; btnShare: string; btnPdf: string;
  disclaimer: string;
};

const TX: Record<Language, ScreenText> = {
  en: {
    back: "← Back", title: "REAL ESTATE PARTNERS", sub: "Professional letters for real estate agents and property professionals.",
    sectionType: "LETTER TYPE",
    typeReferral: "Soft Referral Introduction", typeReferralSub: "Explore a mutual fit · No formal commitment · Open a relationship",
    typeJv: "Joint-Venture Proposal", typeJvSub: "Formal two-way referral · 30-min meeting request · Select partnership",
    sectionYou: "YOUR DETAILS", autoSaved: "(from profile)",
    placeholderName: "Your full name", placeholderCompany: "Company / organisation",
    placeholderMobile: "Mobile number", placeholderEmail: "Email / website",
    sectionRecipient: "REAL ESTATE PROFESSIONAL", placeholderRecipient: "Agent / professional's full name",
    sectionPreview: "LETTER PREVIEW",
    btnCopy: "📋  Copy", btnCopied: "✓ Copied!", btnShare: "📤  Share", btnPdf: "📄  PDF",
    disclaimer: "This letter is a professional outreach tool. It does not constitute a legally binding partnership agreement. Always comply with the regulations of your jurisdiction.",
  },
  nl: {
    back: "← Terug", title: "VASTGOEDPARTNERS", sub: "Professionele brieven voor vastgoedagenten en vastgoedprofessionals.",
    sectionType: "TYPE BRIEF",
    typeReferral: "Zachte Doorverwijsintroductie", typeReferralSub: "Verken wederzijdse aansluiting · Geen formele verplichting · Relatie openen",
    typeJv: "Joint-Venture Voorstel", typeJvSub: "Formele tweerichtingsdoorverwijzing · 30 minuten vergaderverzoek · Selectief partnerschap",
    sectionYou: "UW GEGEVENS", autoSaved: "(uit profiel)",
    placeholderName: "Uw volledige naam", placeholderCompany: "Bedrijf / organisatie",
    placeholderMobile: "Mobiel nummer", placeholderEmail: "E-mail / website",
    sectionRecipient: "VASTGOEDPROFESSIONAL", placeholderRecipient: "Volledige naam agent / professional",
    sectionPreview: "BRIEFVOORBEELD",
    btnCopy: "📋  Kopiëren", btnCopied: "✓ Gekopieerd!", btnShare: "📤  Delen", btnPdf: "📄  PDF",
    disclaimer: "Deze brief is een professioneel outreach-instrument. Het vormt geen juridisch bindende partnerschapsovereenkomst. Houd u altijd aan de regelgeving van uw rechtsgebied.",
  },
  de: {
    back: "← Zurück", title: "IMMOBILIENPARTNER", sub: "Professionelle Briefe für Immobilienmakler und Immobilienprofis.",
    sectionType: "BRIEFTYP",
    typeReferral: "Sanfte Empfehlungseinführung", typeReferralSub: "Gegenseitige Eignung erkunden · Keine formelle Verpflichtung · Beziehung aufbauen",
    typeJv: "Joint-Venture-Vorschlag", typeJvSub: "Formelle gegenseitige Empfehlung · 30-Minuten-Meetingbitte · Selektive Partnerschaft",
    sectionYou: "IHRE DATEN", autoSaved: "(aus Profil)",
    placeholderName: "Ihr vollständiger Name", placeholderCompany: "Unternehmen / Organisation",
    placeholderMobile: "Handynummer", placeholderEmail: "E-Mail / Website",
    sectionRecipient: "IMMOBILIENPROFI", placeholderRecipient: "Vollständiger Name des Maklers / Profis",
    sectionPreview: "BRIEFVORSCHAU",
    btnCopy: "📋  Kopieren", btnCopied: "✓ Kopiert!", btnShare: "📤  Teilen", btnPdf: "📄  PDF",
    disclaimer: "Dieser Brief ist ein professionelles Outreach-Instrument. Er stellt keine rechtlich bindende Partnerschaftsvereinbarung dar. Halten Sie sich stets an die Vorschriften Ihrer Gerichtsbarkeit.",
  },
  fr: {
    back: "← Retour", title: "PARTENAIRES IMMOBILIERS", sub: "Lettres professionnelles pour agents immobiliers et professionnels de l'immobilier.",
    sectionType: "TYPE DE LETTRE",
    typeReferral: "Introduction de Référence Douce", typeReferralSub: "Explorer une compatibilité mutuelle · Aucun engagement formel · Ouvrir une relation",
    typeJv: "Proposition Joint-Venture", typeJvSub: "Référence formelle bidirectionnelle · Demande de réunion 30 min · Partenariat sélectif",
    sectionYou: "VOS COORDONNÉES", autoSaved: "(depuis le profil)",
    placeholderName: "Votre nom complet", placeholderCompany: "Entreprise / organisation",
    placeholderMobile: "Numéro de portable", placeholderEmail: "E-mail / site web",
    sectionRecipient: "PROFESSIONNEL IMMOBILIER", placeholderRecipient: "Nom complet de l'agent / professionnel",
    sectionPreview: "APERÇU DE LA LETTRE",
    btnCopy: "📋  Copier", btnCopied: "✓ Copié!", btnShare: "📤  Partager", btnPdf: "📄  PDF",
    disclaimer: "Cette lettre est un outil de sensibilisation professionnel. Elle ne constitue pas un accord de partenariat juridiquement contraignant. Respectez toujours la réglementation de votre juridiction.",
  },
  es: {
    back: "← Volver", title: "SOCIOS INMOBILIARIOS", sub: "Cartas profesionales para agentes inmobiliarios y profesionales del sector.",
    sectionType: "TIPO DE CARTA",
    typeReferral: "Introducción de Referido Suave", typeReferralSub: "Explorar encaje mutuo · Sin compromiso formal · Abrir una relación",
    typeJv: "Propuesta Joint-Venture", typeJvSub: "Referido formal bidireccional · Solicitud de reunión 30 min · Asociación selectiva",
    sectionYou: "SUS DATOS", autoSaved: "(desde perfil)",
    placeholderName: "Su nombre completo", placeholderCompany: "Empresa / organización",
    placeholderMobile: "Número de móvil", placeholderEmail: "Email / sitio web",
    sectionRecipient: "PROFESIONAL INMOBILIARIO", placeholderRecipient: "Nombre completo del agente / profesional",
    sectionPreview: "VISTA PREVIA DE LA CARTA",
    btnCopy: "📋  Copiar", btnCopied: "✓ ¡Copiado!", btnShare: "📤  Compartir", btnPdf: "📄  PDF",
    disclaimer: "Esta carta es una herramienta de contacto profesional. No constituye un acuerdo de asociación legalmente vinculante. Cumpla siempre con las regulaciones de su jurisdicción.",
  },
  it: {
    back: "← Indietro", title: "PARTNER IMMOBILIARI", sub: "Lettere professionali per agenti immobiliari e professionisti del settore.",
    sectionType: "TIPO DI LETTERA",
    typeReferral: "Introduzione Referral Soft", typeReferralSub: "Esplorare un'adeguatezza reciproca · Nessun impegno formale · Aprire una relazione",
    typeJv: "Proposta Joint-Venture", typeJvSub: "Referral formale bidirezionale · Richiesta riunione 30 min · Partnership selettiva",
    sectionYou: "I TUOI DATI", autoSaved: "(dal profilo)",
    placeholderName: "Il tuo nome completo", placeholderCompany: "Azienda / organizzazione",
    placeholderMobile: "Numero di cellulare", placeholderEmail: "Email / sito web",
    sectionRecipient: "PROFESSIONISTA IMMOBILIARE", placeholderRecipient: "Nome completo dell'agente / professionista",
    sectionPreview: "ANTEPRIMA LETTERA",
    btnCopy: "📋  Copia", btnCopied: "✓ Copiato!", btnShare: "📤  Condividi", btnPdf: "📄  PDF",
    disclaimer: "Questa lettera è uno strumento di sensibilizzazione professionale. Non costituisce un accordo di partnership giuridicamente vincolante. Rispetta sempre la normativa della tua giurisdizione.",
  },
  pt: {
    back: "← Voltar", title: "PARCEIROS IMOBILIÁRIOS", sub: "Cartas profissionais para agentes imobiliários e profissionais do setor.",
    sectionType: "TIPO DE CARTA",
    typeReferral: "Introdução de Referência Suave", typeReferralSub: "Explorar compatibilidade mútua · Sem compromisso formal · Abrir uma relação",
    typeJv: "Proposta de Joint-Venture", typeJvSub: "Referência formal bidirecional · Pedido de reunião 30 min · Parceria seletiva",
    sectionYou: "OS SEUS DADOS", autoSaved: "(do perfil)",
    placeholderName: "O seu nome completo", placeholderCompany: "Empresa / organização",
    placeholderMobile: "Número de telemóvel", placeholderEmail: "Email / website",
    sectionRecipient: "PROFISSIONAL IMOBILIÁRIO", placeholderRecipient: "Nome completo do agente / profissional",
    sectionPreview: "PRÉ-VISUALIZAÇÃO DA CARTA",
    btnCopy: "📋  Copiar", btnCopied: "✓ Copiado!", btnShare: "📤  Partilhar", btnPdf: "📄  PDF",
    disclaimer: "Esta carta é uma ferramenta de contacto profissional. Não constitui um acordo de parceria juridicamente vinculativo. Cumpra sempre a regulamentação da sua jurisdição.",
  },
  ru: {
    back: "← Назад", title: "ПАРТНЁРЫ ПО НЕДВИЖИМОСТИ", sub: "Профессиональные письма для агентов и специалистов по недвижимости.",
    sectionType: "ТИП ПИСЬМА",
    typeReferral: "Мягкое Реферальное Знакомство", typeReferralSub: "Исследовать взаимное соответствие · Без формальных обязательств · Открыть отношения",
    typeJv: "Предложение о Совместном Предприятии", typeJvSub: "Формальная двусторонняя рекомендация · Запрос встречи на 30 мин · Избирательное партнёрство",
    sectionYou: "ВАШИ ДАННЫЕ", autoSaved: "(из профиля)",
    placeholderName: "Ваше полное имя", placeholderCompany: "Компания / организация",
    placeholderMobile: "Номер мобильного", placeholderEmail: "Email / веб-сайт",
    sectionRecipient: "СПЕЦИАЛИСТ ПО НЕДВИЖИМОСТИ", placeholderRecipient: "Полное имя агента / специалиста",
    sectionPreview: "ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР",
    btnCopy: "📋  Копировать", btnCopied: "✓ Скопировано!", btnShare: "📤  Поделиться", btnPdf: "📄  PDF",
    disclaimer: "Это письмо является профессиональным инструментом для общения. Оно не является юридически обязывающим соглашением о партнёрстве. Всегда соблюдайте законодательство вашей юрисдикции.",
  },
  zh: {
    back: "← 返回", title: "房地产合作伙伴", sub: "面向房地产经纪人和房产专业人士的专业信函。",
    sectionType: "信函类型",
    typeReferral: "软性推介介绍", typeReferralSub: "探索相互契合 · 无正式承诺 · 建立关系",
    typeJv: "合资提案", typeJvSub: "正式双向推介 · 申请30分钟会面 · 精选合作",
    sectionYou: "您的信息", autoSaved: "（来自资料）",
    placeholderName: "您的全名", placeholderCompany: "公司 / 组织",
    placeholderMobile: "手机号码", placeholderEmail: "电子邮件 / 网站",
    sectionRecipient: "房地产专业人士", placeholderRecipient: "经纪人/专业人士全名",
    sectionPreview: "信函预览",
    btnCopy: "📋  复制", btnCopied: "✓ 已复制！", btnShare: "📤  分享", btnPdf: "📄  PDF",
    disclaimer: "此信函是专业联络工具，不构成具有法律约束力的合作协议，请始终遵守您所在司法管辖区的法规。",
  },
  tl: {
    back: "← Bumalik", title: "MGA KASOSYO SA REAL ESTATE", sub: "Mga propesyonal na liham para sa mga ahente at propesyonal sa real estate.",
    sectionType: "URI NG LIHAM",
    typeReferral: "Malambot na Pagpapakilala sa Referral", typeReferralSub: "Tuklasin ang magkaparehong angkop · Walang pormal na pangako · Buksan ang relasyon",
    typeJv: "Panukala sa Joint-Venture", typeJvSub: "Pormal na dalawang-direksyong referral · Kahilingan sa 30-min na pagpupulong · Piling pakikipagsosyo",
    sectionYou: "IYONG MGA DETALYE", autoSaved: "(mula sa profile)",
    placeholderName: "Iyong buong pangalan", placeholderCompany: "Kumpanya / organisasyon",
    placeholderMobile: "Numero ng mobile", placeholderEmail: "Email / website",
    sectionRecipient: "PROPESYONAL SA REAL ESTATE", placeholderRecipient: "Buong pangalan ng ahente / propesyonal",
    sectionPreview: "PREVIEW NG LIHAM",
    btnCopy: "📋  Kopyahin", btnCopied: "✓ Nakopya!", btnShare: "📤  Ibahagi", btnPdf: "📄  PDF",
    disclaimer: "Ang liham na ito ay isang propesyonal na tool sa pakikipag-ugnayan. Hindi ito bumubuo ng isang legal na kasunduang pangkatuwiran. Palaging sumunod sa mga regulasyon ng iyong hurisdiksyon.",
  },
  ar: {
    back: "→ رجوع", title: "شركاء العقارات", sub: "رسائل احترافية لوكلاء العقارات والمحترفين في القطاع.",
    sectionType: "نوع الرسالة",
    typeReferral: "تعريف إحالة لطيف", typeReferralSub: "استكشاف الملاءمة المتبادلة · بلا التزام رسمي · فتح علاقة",
    typeJv: "اقتراح مشروع مشترك", typeJvSub: "إحالة رسمية ثنائية الاتجاه · طلب اجتماع 30 دقيقة · شراكة انتقائية",
    sectionYou: "بياناتك", autoSaved: "(من الملف)",
    placeholderName: "اسمك الكامل", placeholderCompany: "الشركة / المنظمة",
    placeholderMobile: "رقم الجوال", placeholderEmail: "البريد الإلكتروني / الموقع",
    sectionRecipient: "المحترف العقاري", placeholderRecipient: "الاسم الكامل للوكيل / المحترف",
    sectionPreview: "معاينة الرسالة",
    btnCopy: "📋  نسخ", btnCopied: "✓ تم النسخ!", btnShare: "📤  مشاركة", btnPdf: "📄  PDF",
    disclaimer: "هذه الرسالة أداة تواصل احترافية. لا تُشكّل اتفاقية شراكة ملزمة قانونياً. التزم دائماً بالأنظمة المعمول بها في نطاق اختصاصك.",
  },
  th: {
    back: "← กลับ", title: "พันธมิตรอสังหาริมทรัพย์", sub: "จดหมายระดับมืออาชีพสำหรับตัวแทนและผู้เชี่ยวชาญด้านอสังหาริมทรัพย์",
    sectionType: "ประเภทจดหมาย",
    typeReferral: "การแนะนำการส่งต่ออย่างอ่อนโยน", typeReferralSub: "สำรวจความเหมาะสมร่วมกัน · ไม่มีข้อผูกมัดอย่างเป็นทางการ · เปิดความสัมพันธ์",
    typeJv: "ข้อเสนอร่วมทุน", typeJvSub: "การส่งต่อสองทางอย่างเป็นทางการ · ขอประชุม 30 นาที · หุ้นส่วนแบบคัดสรร",
    sectionYou: "ข้อมูลของคุณ", autoSaved: "(จากโปรไฟล์)",
    placeholderName: "ชื่อเต็มของคุณ", placeholderCompany: "บริษัท / องค์กร",
    placeholderMobile: "หมายเลขมือถือ", placeholderEmail: "อีเมล / เว็บไซต์",
    sectionRecipient: "ผู้เชี่ยวชาญด้านอสังหาริมทรัพย์", placeholderRecipient: "ชื่อเต็มของตัวแทน / ผู้เชี่ยวชาญ",
    sectionPreview: "ตัวอย่างจดหมาย",
    btnCopy: "📋  คัดลอก", btnCopied: "✓ คัดลอกแล้ว!", btnShare: "📤  แชร์", btnPdf: "📄  PDF",
    disclaimer: "จดหมายนี้เป็นเครื่องมือสื่อสารระดับมืออาชีพ ไม่ถือเป็นข้อตกลงหุ้นส่วนที่มีผลผูกพันทางกฎหมาย โปรดปฏิบัติตามกฎระเบียบของเขตอำนาจศาลของคุณเสมอ",
  },
  hi: {
    back: "← वापस", title: "रियल एस्टेट साझेदार", sub: "रियल एस्टेट एजेंटों और संपत्ति पेशेवरों के लिए पेशेवर पत्र।",
    sectionType: "पत्र प्रकार",
    typeReferral: "सॉफ्ट रेफरल परिचय", typeReferralSub: "पारस्परिक उपयुक्तता का पता लगाएं · कोई औपचारिक प्रतिबद्धता नहीं · संबंध खोलें",
    typeJv: "संयुक्त उद्यम प्रस्ताव", typeJvSub: "औपचारिक द्विदिशात्मक रेफरल · 30 मिनट की बैठक अनुरोध · चुनिंदा साझेदारी",
    sectionYou: "आपका विवरण", autoSaved: "(प्रोफ़ाइल से)",
    placeholderName: "आपका पूरा नाम", placeholderCompany: "कंपनी / संगठन",
    placeholderMobile: "मोबाइल नंबर", placeholderEmail: "ईमेल / वेबसाइट",
    sectionRecipient: "रियल एस्टेट पेशेवर", placeholderRecipient: "एजेंट / पेशेवर का पूरा नाम",
    sectionPreview: "पत्र पूर्वावलोकन",
    btnCopy: "📋  कॉपी", btnCopied: "✓ कॉपी हो गया!", btnShare: "📤  साझा करें", btnPdf: "📄  PDF",
    disclaimer: "यह पत्र एक पेशेवर संपर्क उपकरण है। यह कानूनी रूप से बाध्यकारी साझेदारी समझौता नहीं है। हमेशा अपने क्षेत्राधिकार के नियमों का पालन करें।",
  },
  vi: {
    back: "← Quay lại", title: "ĐỐI TÁC BẤT ĐỘNG SẢN", sub: "Thư chuyên nghiệp cho các đại lý bất động sản và chuyên gia bất động sản.",
    sectionType: "LOẠI THƯ",
    typeReferral: "Giới Thiệu Referral Nhẹ Nhàng", typeReferralSub: "Khám phá sự phù hợp lẫn nhau · Không cam kết chính thức · Mở mối quan hệ",
    typeJv: "Đề Xuất Liên Doanh", typeJvSub: "Giới thiệu hai chiều chính thức · Yêu cầu họp 30 phút · Đối tác được lựa chọn",
    sectionYou: "THÔNG TIN CỦA BẠN", autoSaved: "(từ hồ sơ)",
    placeholderName: "Họ và tên đầy đủ", placeholderCompany: "Công ty / tổ chức",
    placeholderMobile: "Số điện thoại di động", placeholderEmail: "Email / trang web",
    sectionRecipient: "CHUYÊN GIA BẤT ĐỘNG SẢN", placeholderRecipient: "Họ và tên đầy đủ của đại lý / chuyên gia",
    sectionPreview: "XEM TRƯỚC THƯ",
    btnCopy: "📋  Sao chép", btnCopied: "✓ Đã sao chép!", btnShare: "📤  Chia sẻ", btnPdf: "📄  PDF",
    disclaimer: "Thư này là công cụ liên lạc chuyên nghiệp. Nó không cấu thành thỏa thuận đối tác có tính ràng buộc pháp lý. Luôn tuân thủ các quy định của khu vực pháp lý của bạn.",
  },
};

export default function RealEstateScreen() {
  const router = useRouter();
  const { language } = useCalculator();
  const tx = TX[language] ?? TX.en;

  const [letterType, setLetterType] = useState<RealEstateLetterType>("referral");
  const [recipientName, setRecipientName] = useState("");
  const [adviserName, setAdviserName] = useState("");
  const [adviserCompany, setAdviserCompany] = useState("");
  const [adviserMobile, setAdviserMobile] = useState("");
  const [adviserContact, setAdviserContact] = useState("");
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  const profileQuery = trpc.advisor.getProfile.useQuery(undefined, { retry: false });

  useEffect(() => {
    const p = profileQuery.data;
    if (p) {
      if (p.adviserName)  setAdviserName(p.adviserName);
      if (p.companyName)  setAdviserCompany(p.companyName);
      if (p.mobile)       setAdviserMobile(p.mobile);
      if (p.contactInfo)  setAdviserContact(p.contactInfo);
      if (p.logoUrl)      setCustomLogoUrl(p.logoUrl);
      return;
    }
    if (!profileQuery.isLoading) {
      loadLocalProfile().then((local) => {
        if (local.adviserName)  setAdviserName(local.adviserName);
        if (local.companyName)  setAdviserCompany(local.companyName);
        if (local.mobile)       setAdviserMobile(local.mobile);
        if (local.contactInfo)  setAdviserContact(local.contactInfo);
        if (local.logoUrl)      setCustomLogoUrl(local.logoUrl);
      });
    }
  }, [profileQuery.data, profileQuery.isLoading]);

  const date = formatLetterDate(language);
  const letter = buildRealEstateLetter(language, letterType, recipientName, adviserName, adviserCompany, adviserMobile, adviserContact, date);

  const handleCopy = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [letter]);

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try { await Share.share({ message: letter }); } catch { /* cancelled */ }
  }, [letter]);

  const handlePdf = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPdfLoading(true);
    try {
      const logoSrc = await resolveLogoForPdf(customLogoUrl);
      const docName = recipientName.trim() || "———";
      const html = buildLetterHtml(letter, logoSrc, docName, date);

      if (Platform.OS === "web") {
        const iframe = document.createElement("iframe");
        iframe.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;border:0;";
        document.body.appendChild(iframe);
        const iDoc = iframe.contentDocument ?? (iframe.contentWindow as any)?.document;
        if (iDoc) {
          iDoc.open(); iDoc.write(html); iDoc.close();
          const orig = document.title;
          document.title = `RE Partner Letter - ${docName} - ${date}`;
          setTimeout(() => {
            (iframe.contentWindow as any)?.focus();
            (iframe.contentWindow as any)?.print();
            setTimeout(() => {
              document.title = orig;
              if (document.body.contains(iframe)) document.body.removeChild(iframe);
            }, 1000);
          }, 300);
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        const safeName = recipientName.trim().replace(/[^a-zA-Z0-9]/g, "_") || "RE_Partner";
        const dest = `${FileSystem.documentDirectory}REPartnerLetter_${safeName}.pdf`;
        await FileSystem.moveAsync({ from: uri, to: dest });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(dest, { mimeType: "application/pdf", dialogTitle: "Share Letter PDF" });
        } else {
          await Print.printAsync({ html });
        }
      }
    } catch { /* cancelled */ }
    finally { setPdfLoading(false); }
  }, [letter, customLogoUrl, recipientName, date]);

  const TYPE_OPTIONS: { key: RealEstateLetterType; icon: string; label: string; sub: string }[] = [
    { key: "referral", icon: "🏢", label: tx.typeReferral, sub: tx.typeReferralSub },
    { key: "jv",       icon: "🤝", label: tx.typeJv,      sub: tx.typeJvSub       },
  ];

  return (
    <ScreenContainer bgColor={NAVY}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

          {/* Header */}
          <View style={S.header}>
            <View style={S.headerTopRow}>
              <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={S.backText}>{tx.back}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.profileBtn} onPress={() => router.push("/letters/profile-setup")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={S.profileBtnText}>⚙ Profile</Text>
              </TouchableOpacity>
            </View>
            <Text style={S.screenTitle}>{tx.title}</Text>
            <Text style={S.screenSub}>{tx.sub}</Text>
          </View>

          {/* Type selector */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>{tx.sectionType}</Text>
            {TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[S.typeRow, letterType === opt.key && S.typeRowActive]}
                onPress={() => { if (Platform.OS !== "web") Haptics.selectionAsync(); setLetterType(opt.key); }}
                activeOpacity={0.8}
              >
                <Text style={S.typeIcon}>{opt.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[S.typeLabel, letterType === opt.key && S.typeLabelActive]}>{opt.label}</Text>
                  <Text style={S.typeSub}>{opt.sub}</Text>
                </View>
                {letterType === opt.key && <Text style={S.typeCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Adviser info */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>{tx.sectionYou}{"  "}<Text style={S.savedNote}>{tx.autoSaved}</Text></Text>
            <TextInput style={S.input} placeholder={tx.placeholderName} placeholderTextColor="#475569" value={adviserName} onChangeText={setAdviserName} />
            <TextInput style={S.input} placeholder={tx.placeholderCompany} placeholderTextColor="#475569" value={adviserCompany} onChangeText={setAdviserCompany} />
            <TextInput style={S.input} placeholder={tx.placeholderMobile} placeholderTextColor="#475569" value={adviserMobile} onChangeText={setAdviserMobile} keyboardType="phone-pad" />
            <TextInput style={S.input} placeholder={tx.placeholderEmail} placeholderTextColor="#475569" value={adviserContact} onChangeText={setAdviserContact} keyboardType="email-address" autoCapitalize="none" />
          </View>

          {/* Recipient */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>{tx.sectionRecipient}</Text>
            <TextInput style={S.input} placeholder={tx.placeholderRecipient} placeholderTextColor="#475569" value={recipientName} onChangeText={setRecipientName} autoCapitalize="words" />
          </View>

          {/* Preview */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>{tx.sectionPreview}</Text>
            <View style={S.previewCard}>
              <View style={S.previewGoldBar} />
              <Text style={S.previewText}>{letter}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={S.actionRow}>
            <TouchableOpacity style={[S.actionBtn, S.copyBtn]} onPress={handleCopy} activeOpacity={0.85}>
              <Text style={S.actionBtnText}>{copied ? tx.btnCopied : tx.btnCopy}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.actionBtn, S.shareBtn]} onPress={handleShare} activeOpacity={0.85}>
              <Text style={S.actionBtnText}>{tx.btnShare}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.actionBtn, S.pdfBtn]} onPress={handlePdf} disabled={pdfLoading} activeOpacity={0.85}>
              {pdfLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={S.actionBtnText}>{tx.btnPdf}</Text>}
            </TouchableOpacity>
          </View>

          <Text style={S.disclaimer}>{tx.disclaimer}</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  backText: { color: GOLD, fontFamily: FONT, fontSize: 14 },
  profileBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#1e2d47", backgroundColor: "#0f1f38" },
  profileBtnText: { color: "#94a3b8", fontFamily: FONT, fontSize: 12 },
  screenTitle: { fontSize: 22, fontFamily: FONT, color: "#f1f5f9", letterSpacing: 1.2, marginBottom: 6 },
  screenSub: { fontSize: 13, color: "#64748b", lineHeight: 18, fontFamily: FONT },

  section: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  sectionLabel: { fontSize: 10, fontFamily: FONT, color: "#475569", letterSpacing: 1.4, marginBottom: 10 },
  savedNote: { color: "#334155", fontSize: 10, letterSpacing: 0 },

  typeRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#1e2d47", backgroundColor: "#0f1f38", marginBottom: 8 },
  typeRowActive: { borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.08)" },
  typeIcon: { fontSize: 20 },
  typeLabel: { color: "#94a3b8", fontFamily: FONT, fontSize: 14, marginBottom: 2 },
  typeLabelActive: { color: "#6ee7b7" },
  typeSub: { color: "#475569", fontFamily: FONT, fontSize: 11 },
  typeCheck: { color: "#10b981", fontFamily: FONT, fontSize: 16 },

  input: { backgroundColor: "#0f1f38", borderWidth: 1, borderColor: "#1e2d47", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: "#e2e8f0", fontFamily: FONT, fontSize: 14, marginBottom: 8 },

  previewCard: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", marginTop: 4 },
  previewGoldBar: { height: 3, backgroundColor: GOLD },
  previewText: { fontSize: 13, color: "#1e293b", lineHeight: 21, fontFamily: FONT, padding: 16 },

  actionRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 20 },
  actionBtn: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  copyBtn: { backgroundColor: GOLD },
  shareBtn: { backgroundColor: "#065f46", borderWidth: 1, borderColor: "#10b981" },
  pdfBtn: { backgroundColor: "#1e40af", borderWidth: 1, borderColor: "#3b82f6" },
  actionBtnText: { color: "#fff", fontFamily: FONT, fontSize: 15 },

  disclaimer: { marginHorizontal: 16, marginTop: 16, fontSize: 11, color: "#334155", fontFamily: FONT, lineHeight: 16 },
});
