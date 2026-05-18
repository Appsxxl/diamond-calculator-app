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
import { buildAdvisorLetter, resolveLogoForPdf, buildLetterHtml, loadLocalProfile } from "./shared";
import type { AdvisorLetterType } from "./templates/advisor";
import type { Language } from "@/lib/translations";

const NAVY = "#0a1628";
const GOLD = "#e67e22";
const BLUE = "#1e40af";
const FONT = "ArialRoundedMTBold";

type ScreenText = {
  back: string; title: string; sub: string;
  sectionType: string;
  typePassive: string; typePassiveSub: string;
  typeActive: string; typeActiveSub: string;
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
    back: "← Back", title: "ADVISOR RECRUITING", sub: "Professional outreach letters for potential advisors. For partners only.",
    sectionType: "LETTER TYPE",
    typePassive: "Passive Introduction", typePassiveSub: "Soft intro · No commitment · Open a conversation",
    typeActive: "Active Invitation", typeActiveSub: "Direct ask · Meeting request · Clear opportunity",
    sectionYou: "YOUR DETAILS", autoSaved: "(from profile)",
    placeholderName: "Your full name", placeholderCompany: "Company / organisation",
    placeholderMobile: "Mobile number", placeholderEmail: "Email / website",
    sectionRecipient: "POTENTIAL ADVISOR", placeholderRecipient: "Recipient's full name",
    sectionPreview: "LETTER PREVIEW",
    btnCopy: "📋  Copy", btnCopied: "✓ Copied!", btnShare: "📤  Share", btnPdf: "📄  PDF",
    disclaimer: "This letter is a professional introduction tool. It does not constitute a financial offer or employment contract. Always comply with the regulations of your jurisdiction.",
  },
  nl: {
    back: "← Terug", title: "ADVISEUR WERVING", sub: "Professionele outreach-brieven voor potentiële adviseurs. Alleen voor partners.",
    sectionType: "TYPE BRIEF",
    typePassive: "Passieve Introductie", typePassiveSub: "Zachte intro · Geen verplichting · Gesprek openen",
    typeActive: "Actieve Uitnodiging", typeActiveSub: "Directe vraag · Vergaderverzoek · Duidelijke kans",
    sectionYou: "UW GEGEVENS", autoSaved: "(uit profiel)",
    placeholderName: "Uw volledige naam", placeholderCompany: "Bedrijf / organisatie",
    placeholderMobile: "Mobiel nummer", placeholderEmail: "E-mail / website",
    sectionRecipient: "POTENTIËLE ADVISEUR", placeholderRecipient: "Volledige naam ontvanger",
    sectionPreview: "BRIEFVOORBEELD",
    btnCopy: "📋  Kopiëren", btnCopied: "✓ Gekopieerd!", btnShare: "📤  Delen", btnPdf: "📄  PDF",
    disclaimer: "Deze brief is een professioneel introductiemiddel. Het vormt geen financieel aanbod of arbeidscontract. Houd u altijd aan de regelgeving van uw rechtsgebied.",
  },
  de: {
    back: "← Zurück", title: "BERATER REKRUTIERUNG", sub: "Professionelle Outreach-Briefe für potenzielle Berater. Nur für Partner.",
    sectionType: "BRIEFTYP",
    typePassive: "Passive Einführung", typePassiveSub: "Sanfte Einführung · Keine Verpflichtung · Gespräch eröffnen",
    typeActive: "Aktive Einladung", typeActiveSub: "Direktanfrage · Meetinganfrage · Klare Chance",
    sectionYou: "IHRE DATEN", autoSaved: "(aus Profil)",
    placeholderName: "Ihr vollständiger Name", placeholderCompany: "Unternehmen / Organisation",
    placeholderMobile: "Handynummer", placeholderEmail: "E-Mail / Website",
    sectionRecipient: "POTENZIELLER BERATER", placeholderRecipient: "Vollständiger Name des Empfängers",
    sectionPreview: "BRIEFVORSCHAU",
    btnCopy: "📋  Kopieren", btnCopied: "✓ Kopiert!", btnShare: "📤  Teilen", btnPdf: "📄  PDF",
    disclaimer: "Dieser Brief ist ein professionelles Einführungsinstrument. Er stellt kein Finanzangebot oder einen Arbeitsvertrag dar. Halten Sie sich stets an die Vorschriften Ihrer Gerichtsbarkeit.",
  },
  fr: {
    back: "← Retour", title: "RECRUTEMENT CONSEILLER", sub: "Lettres de sensibilisation professionnelles pour les conseillers potentiels. Réservé aux partenaires.",
    sectionType: "TYPE DE LETTRE",
    typePassive: "Introduction Passive", typePassiveSub: "Intro douce · Aucun engagement · Ouvrir une conversation",
    typeActive: "Invitation Active", typeActiveSub: "Demande directe · Demande de réunion · Opportunité claire",
    sectionYou: "VOS COORDONNÉES", autoSaved: "(depuis le profil)",
    placeholderName: "Votre nom complet", placeholderCompany: "Entreprise / organisation",
    placeholderMobile: "Numéro de portable", placeholderEmail: "E-mail / site web",
    sectionRecipient: "CONSEILLER POTENTIEL", placeholderRecipient: "Nom complet du destinataire",
    sectionPreview: "APERÇU DE LA LETTRE",
    btnCopy: "📋  Copier", btnCopied: "✓ Copié!", btnShare: "📤  Partager", btnPdf: "📄  PDF",
    disclaimer: "Cette lettre est un outil d'introduction professionnel. Elle ne constitue pas une offre financière ou un contrat de travail. Respectez toujours la réglementation de votre juridiction.",
  },
  es: {
    back: "← Volver", title: "RECLUTAMIENTO DE ASESORES", sub: "Cartas de contacto profesionales para asesores potenciales. Solo para socios.",
    sectionType: "TIPO DE CARTA",
    typePassive: "Introducción Pasiva", typePassiveSub: "Intro suave · Sin compromiso · Abrir conversación",
    typeActive: "Invitación Activa", typeActiveSub: "Solicitud directa · Solicitud de reunión · Oportunidad clara",
    sectionYou: "SUS DATOS", autoSaved: "(desde perfil)",
    placeholderName: "Su nombre completo", placeholderCompany: "Empresa / organización",
    placeholderMobile: "Número de móvil", placeholderEmail: "Email / sitio web",
    sectionRecipient: "ASESOR POTENCIAL", placeholderRecipient: "Nombre completo del destinatario",
    sectionPreview: "VISTA PREVIA DE LA CARTA",
    btnCopy: "📋  Copiar", btnCopied: "✓ ¡Copiado!", btnShare: "📤  Compartir", btnPdf: "📄  PDF",
    disclaimer: "Esta carta es una herramienta de introducción profesional. No constituye una oferta financiera ni un contrato laboral. Cumpla siempre con las regulaciones de su jurisdicción.",
  },
  it: {
    back: "← Indietro", title: "RECLUTAMENTO CONSULENTI", sub: "Lettere di sensibilizzazione professionale per potenziali consulenti. Solo per partner.",
    sectionType: "TIPO DI LETTERA",
    typePassive: "Introduzione Passiva", typePassiveSub: "Intro soft · Nessun impegno · Aprire una conversazione",
    typeActive: "Invito Attivo", typeActiveSub: "Richiesta diretta · Richiesta di incontro · Opportunità chiara",
    sectionYou: "I TUOI DATI", autoSaved: "(dal profilo)",
    placeholderName: "Il tuo nome completo", placeholderCompany: "Azienda / organizzazione",
    placeholderMobile: "Numero di cellulare", placeholderEmail: "Email / sito web",
    sectionRecipient: "POTENZIALE CONSULENTE", placeholderRecipient: "Nome completo del destinatario",
    sectionPreview: "ANTEPRIMA LETTERA",
    btnCopy: "📋  Copia", btnCopied: "✓ Copiato!", btnShare: "📤  Condividi", btnPdf: "📄  PDF",
    disclaimer: "Questa lettera è uno strumento di introduzione professionale. Non costituisce un'offerta finanziaria o un contratto di lavoro. Rispetta sempre la normativa della tua giurisdizione.",
  },
  pt: {
    back: "← Voltar", title: "RECRUTAMENTO DE CONSULTORES", sub: "Cartas de contacto profissionais para consultores potenciais. Apenas para parceiros.",
    sectionType: "TIPO DE CARTA",
    typePassive: "Introdução Passiva", typePassiveSub: "Intro suave · Sem compromisso · Abrir conversa",
    typeActive: "Convite Ativo", typeActiveSub: "Pedido direto · Pedido de reunião · Oportunidade clara",
    sectionYou: "OS SEUS DADOS", autoSaved: "(do perfil)",
    placeholderName: "O seu nome completo", placeholderCompany: "Empresa / organização",
    placeholderMobile: "Número de telemóvel", placeholderEmail: "Email / website",
    sectionRecipient: "CONSULTOR POTENCIAL", placeholderRecipient: "Nome completo do destinatário",
    sectionPreview: "PRÉ-VISUALIZAÇÃO DA CARTA",
    btnCopy: "📋  Copiar", btnCopied: "✓ Copiado!", btnShare: "📤  Partilhar", btnPdf: "📄  PDF",
    disclaimer: "Esta carta é uma ferramenta de introdução profissional. Não constitui uma oferta financeira nem um contrato de trabalho. Cumpra sempre a regulamentação da sua jurisdição.",
  },
  ru: {
    back: "← Назад", title: "РЕКРУТИНГ СОВЕТНИКОВ", sub: "Профессиональные письма для потенциальных советников. Только для партнёров.",
    sectionType: "ТИП ПИСЬМА",
    typePassive: "Пассивное Знакомство", typePassiveSub: "Мягкое введение · Без обязательств · Открыть диалог",
    typeActive: "Активное Приглашение", typeActiveSub: "Прямой запрос · Приглашение на встречу · Чёткая возможность",
    sectionYou: "ВАШИ ДАННЫЕ", autoSaved: "(из профиля)",
    placeholderName: "Ваше полное имя", placeholderCompany: "Компания / организация",
    placeholderMobile: "Номер мобильного", placeholderEmail: "Email / веб-сайт",
    sectionRecipient: "ПОТЕНЦИАЛЬНЫЙ СОВЕТНИК", placeholderRecipient: "Полное имя получателя",
    sectionPreview: "ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР",
    btnCopy: "📋  Копировать", btnCopied: "✓ Скопировано!", btnShare: "📤  Поделиться", btnPdf: "📄  PDF",
    disclaimer: "Это письмо является профессиональным инструментом для знакомства. Оно не является финансовым предложением или трудовым договором. Всегда соблюдайте законодательство вашей юрисдикции.",
  },
  zh: {
    back: "← 返回", title: "顾问招募", sub: "面向潜在顾问的专业推广信函。仅限合作伙伴。",
    sectionType: "信函类型",
    typePassive: "被动介绍", typePassiveSub: "温和介绍 · 无需承诺 · 开启对话",
    typeActive: "主动邀请", typeActiveSub: "直接邀约 · 会议请求 · 明确机会",
    sectionYou: "您的信息", autoSaved: "（来自资料）",
    placeholderName: "您的全名", placeholderCompany: "公司 / 组织",
    placeholderMobile: "手机号码", placeholderEmail: "电子邮件 / 网站",
    sectionRecipient: "潜在顾问", placeholderRecipient: "收件人全名",
    sectionPreview: "信函预览",
    btnCopy: "📋  复制", btnCopied: "✓ 已复制！", btnShare: "📤  分享", btnPdf: "📄  PDF",
    disclaimer: "此信函是专业介绍工具，不构成财务要约或劳动合同，请始终遵守您所在司法管辖区的法规。",
  },
  tl: {
    back: "← Bumalik", title: "PAGRE-RECRUIT NG ADVISER", sub: "Mga propesyonal na liham para sa mga potensyal na adviser. Para sa mga kasosyo lamang.",
    sectionType: "URI NG LIHAM",
    typePassive: "Passive na Pagpapakilala", typePassiveSub: "Malambot na intro · Walang pangako · Buksan ang usapan",
    typeActive: "Active na Imbitasyon", typeActiveSub: "Direktang kahilingan · Kahilingan sa pagpupulong · Malinaw na pagkakataon",
    sectionYou: "IYONG MGA DETALYE", autoSaved: "(mula sa profile)",
    placeholderName: "Iyong buong pangalan", placeholderCompany: "Kumpanya / organisasyon",
    placeholderMobile: "Numero ng mobile", placeholderEmail: "Email / website",
    sectionRecipient: "POTENSYAL NA ADVISER", placeholderRecipient: "Buong pangalan ng tatanggap",
    sectionPreview: "PREVIEW NG LIHAM",
    btnCopy: "📋  Kopyahin", btnCopied: "✓ Nakopya!", btnShare: "📤  Ibahagi", btnPdf: "📄  PDF",
    disclaimer: "Ang liham na ito ay isang propesyonal na tool sa pagpapakilala. Hindi ito bumubuo ng financial offer o employment contract. Palaging sumunod sa mga regulasyon ng iyong hurisdiksyon.",
  },
  ar: {
    back: "→ رجوع", title: "استقطاب المستشارين", sub: "رسائل تواصل احترافية للمستشارين المحتملين. للشركاء فقط.",
    sectionType: "نوع الرسالة",
    typePassive: "تعريف سلبي", typePassiveSub: "مقدمة لطيفة · بلا التزام · فتح حوار",
    typeActive: "دعوة نشطة", typeActiveSub: "طلب مباشر · طلب اجتماع · فرصة واضحة",
    sectionYou: "بياناتك", autoSaved: "(من الملف)",
    placeholderName: "اسمك الكامل", placeholderCompany: "الشركة / المنظمة",
    placeholderMobile: "رقم الجوال", placeholderEmail: "البريد الإلكتروني / الموقع",
    sectionRecipient: "المستشار المحتمل", placeholderRecipient: "الاسم الكامل للمستلم",
    sectionPreview: "معاينة الرسالة",
    btnCopy: "📋  نسخ", btnCopied: "✓ تم النسخ!", btnShare: "📤  مشاركة", btnPdf: "📄  PDF",
    disclaimer: "هذه الرسالة أداة تعريفية احترافية. لا تُشكّل عرضاً مالياً أو عقد عمل. التزم دائماً بالأنظمة المعمول بها في نطاق اختصاصك.",
  },
  th: {
    back: "← กลับ", title: "การสรรหาที่ปรึกษา", sub: "จดหมายเข้าถึงระดับมืออาชีพสำหรับที่ปรึกษาที่มีศักยภาพ สำหรับพาร์ทเนอร์เท่านั้น",
    sectionType: "ประเภทจดหมาย",
    typePassive: "การแนะนำแบบพาสซีฟ", typePassiveSub: "แนะนำอ่อนๆ · ไม่มีข้อผูกมัด · เปิดการสนทนา",
    typeActive: "คำเชิญแบบแอคทีฟ", typeActiveSub: "การขอโดยตรง · การขอประชุม · โอกาสที่ชัดเจน",
    sectionYou: "ข้อมูลของคุณ", autoSaved: "(จากโปรไฟล์)",
    placeholderName: "ชื่อเต็มของคุณ", placeholderCompany: "บริษัท / องค์กร",
    placeholderMobile: "หมายเลขมือถือ", placeholderEmail: "อีเมล / เว็บไซต์",
    sectionRecipient: "ที่ปรึกษาที่มีศักยภาพ", placeholderRecipient: "ชื่อเต็มของผู้รับ",
    sectionPreview: "ตัวอย่างจดหมาย",
    btnCopy: "📋  คัดลอก", btnCopied: "✓ คัดลอกแล้ว!", btnShare: "📤  แชร์", btnPdf: "📄  PDF",
    disclaimer: "จดหมายนี้เป็นเครื่องมือแนะนำระดับมืออาชีพ ไม่ถือเป็นข้อเสนอทางการเงินหรือสัญญาจ้างงาน โปรดปฏิบัติตามกฎระเบียบของเขตอำนาจศาลของคุณเสมอ",
  },
  hi: {
    back: "← वापस", title: "सलाहकार भर्ती", sub: "संभावित सलाहकारों के लिए पेशेवर आउटरीच पत्र। केवल भागीदारों के लिए।",
    sectionType: "पत्र प्रकार",
    typePassive: "निष्क्रिय परिचय", typePassiveSub: "सॉफ्ट परिचय · कोई प्रतिबद्धता नहीं · बातचीत खोलें",
    typeActive: "सक्रिय आमंत्रण", typeActiveSub: "प्रत्यक्ष अनुरोध · बैठक अनुरोध · स्पष्ट अवसर",
    sectionYou: "आपका विवरण", autoSaved: "(प्रोफ़ाइल से)",
    placeholderName: "आपका पूरा नाम", placeholderCompany: "कंपनी / संगठन",
    placeholderMobile: "मोबाइल नंबर", placeholderEmail: "ईमेल / वेबसाइट",
    sectionRecipient: "संभावित सलाहकार", placeholderRecipient: "प्राप्तकर्ता का पूरा नाम",
    sectionPreview: "पत्र पूर्वावलोकन",
    btnCopy: "📋  कॉपी", btnCopied: "✓ कॉपी हो गया!", btnShare: "📤  साझा करें", btnPdf: "📄  PDF",
    disclaimer: "यह पत्र एक पेशेवर परिचय उपकरण है। यह कोई वित्तीय प्रस्ताव या रोजगार अनुबंध नहीं है। हमेशा अपने क्षेत्राधिकार के नियमों का पालन करें।",
  },
  vi: {
    back: "← Quay lại", title: "TUYỂN DỤNG TƯ VẤN VIÊN", sub: "Thư tiếp cận chuyên nghiệp cho các tư vấn viên tiềm năng. Chỉ dành cho đối tác.",
    sectionType: "LOẠI THƯ",
    typePassive: "Giới Thiệu Bị Động", typePassiveSub: "Giới thiệu nhẹ nhàng · Không cam kết · Mở cuộc trò chuyện",
    typeActive: "Lời Mời Chủ Động", typeActiveSub: "Yêu cầu trực tiếp · Yêu cầu họp · Cơ hội rõ ràng",
    sectionYou: "THÔNG TIN CỦA BẠN", autoSaved: "(từ hồ sơ)",
    placeholderName: "Họ và tên đầy đủ", placeholderCompany: "Công ty / tổ chức",
    placeholderMobile: "Số điện thoại di động", placeholderEmail: "Email / trang web",
    sectionRecipient: "TƯ VẤN VIÊN TIỀM NĂNG", placeholderRecipient: "Họ và tên đầy đủ của người nhận",
    sectionPreview: "XEM TRƯỚC THƯ",
    btnCopy: "📋  Sao chép", btnCopied: "✓ Đã sao chép!", btnShare: "📤  Chia sẻ", btnPdf: "📄  PDF",
    disclaimer: "Thư này là công cụ giới thiệu chuyên nghiệp. Nó không cấu thành lời đề nghị tài chính hoặc hợp đồng lao động. Luôn tuân thủ các quy định của khu vực pháp lý của bạn.",
  },
};

export default function AdvisorRecruitingScreen() {
  const router = useRouter();
  const { language } = useCalculator();
  const tx = TX[language] ?? TX.en;

  const [letterType, setLetterType] = useState<AdvisorLetterType>("passive");
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

  const date = new Date().toLocaleDateString(language === "ar" ? "ar-SA" : language === "zh" ? "zh-CN" : language === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  const letter = buildAdvisorLetter(language, letterType, recipientName, adviserName, adviserCompany, adviserMobile, adviserContact, date);

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
          document.title = `Advisor Letter - ${docName} - ${date}`;
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
        const safeName = recipientName.trim().replace(/[^a-zA-Z0-9]/g, "_") || "Advisor";
        const dest = `${FileSystem.documentDirectory}AdvisorLetter_${safeName}.pdf`;
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

  const TYPE_OPTIONS: { key: AdvisorLetterType; icon: string; label: string; sub: string }[] = [
    { key: "passive", icon: "🤝", label: tx.typePassive, sub: tx.typePassiveSub },
    { key: "active",  icon: "🎯", label: tx.typeActive,  sub: tx.typeActiveSub  },
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
              <TouchableOpacity
                style={S.profileBtn}
                onPress={() => router.push("/letters/profile-setup")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
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
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setLetterType(opt.key);
                }}
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
  typeRowActive: { borderColor: BLUE, backgroundColor: "rgba(30,64,175,0.1)" },
  typeIcon: { fontSize: 20 },
  typeLabel: { color: "#94a3b8", fontFamily: FONT, fontSize: 14, marginBottom: 2 },
  typeLabelActive: { color: "#93c5fd" },
  typeSub: { color: "#475569", fontFamily: FONT, fontSize: 11 },
  typeCheck: { color: BLUE, fontFamily: FONT, fontSize: 16 },

  input: { backgroundColor: "#0f1f38", borderWidth: 1, borderColor: "#1e2d47", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: "#e2e8f0", fontFamily: FONT, fontSize: 14, marginBottom: 8 },

  previewCard: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", marginTop: 4 },
  previewGoldBar: { height: 3, backgroundColor: GOLD },
  previewText: { fontSize: 13, color: "#1e293b", lineHeight: 21, fontFamily: FONT, padding: 16 },

  actionRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 20 },
  actionBtn: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  copyBtn: { backgroundColor: GOLD },
  shareBtn: { backgroundColor: BLUE, borderWidth: 1, borderColor: "#3b82f6" },
  pdfBtn: { backgroundColor: "#065f46", borderWidth: 1, borderColor: "#10b981" },
  actionBtnText: { color: "#fff", fontFamily: FONT, fontSize: 15 },

  disclaimer: { marginHorizontal: 16, marginTop: 16, fontSize: 11, color: "#334155", fontFamily: FONT, lineHeight: 16 },
});
