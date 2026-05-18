import React from "react";
import {
  ScrollView, Text, TouchableOpacity, View, StyleSheet, Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { trpc } from "@/lib/trpc";
import type { Language } from "@/lib/translations";

const NAVY = "#0a1628";
const GOLD = "#e67e22";
const FONT = "ArialRoundedMTBold";

type HubText = {
  back: string; title: string; sub: string; profileBtn: string;
  cardCustomerTitle: string; cardCustomerSub: string; cardCustomerTemplates: string;
  cardAdvisorTitle: string; cardAdvisorSub: string; cardAdvisorTemplates: string;
  cardRealEstateTitle: string; cardRealEstateSub: string; cardRealEstateTemplates: string;
  cardHnwTitle: string; cardHnwSub: string; cardHnwTemplates: string;
  comingSoon: string;
};

const TX: Record<Language, HubText> = {
  en: {
    back: "← Back", title: "LETTERS & OUTREACH", sub: "Professional letter tools for every audience.",
    profileBtn: "⚙ Profile",
    cardCustomerTitle: "CUSTOMER LETTERS", cardCustomerSub: "Invitation · Presentation · Business Opportunity",
    cardCustomerTemplates: "3 templates · 14 languages",
    cardAdvisorTitle: "ADVISOR RECRUITING", cardAdvisorSub: "Passive Introduction · Active Invitation",
    cardAdvisorTemplates: "2 templates · 14 languages",
    cardRealEstateTitle: "REAL ESTATE PARTNERS", cardRealEstateSub: "Soft Referral Introduction · Joint-Venture Proposal",
    cardRealEstateTemplates: "2 templates · 14 languages",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Ultra-Premium Letter · Direct Email",
    cardHnwTemplates: "Full profile · 14 languages",
    comingSoon: "COMING SOON",
  },
  nl: {
    back: "← Terug", title: "BRIEVEN & OUTREACH", sub: "Professionele brieftools voor elk publiek.",
    profileBtn: "⚙ Profiel",
    cardCustomerTitle: "KLANTBRIEVEN", cardCustomerSub: "Uitnodiging · Presentatie · Zakelijke Kans",
    cardCustomerTemplates: "3 sjablonen · 14 talen",
    cardAdvisorTitle: "ADVISEUR WERVING", cardAdvisorSub: "Passieve Introductie · Actieve Uitnodiging",
    cardAdvisorTemplates: "2 sjablonen · 14 talen",
    cardRealEstateTitle: "VASTGOEDPARTNERS", cardRealEstateSub: "Zachte Introductie · Joint-Venture Voorstel",
    cardRealEstateTemplates: "2 sjablonen · 14 talen",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Ultra-Premium Brief · Directe E-mail",
    cardHnwTemplates: "Volledig profiel · 14 talen",
    comingSoon: "BINNENKORT",
  },
  de: {
    back: "← Zurück", title: "BRIEFE & OUTREACH", sub: "Professionelle Brieftools für jede Zielgruppe.",
    profileBtn: "⚙ Profil",
    cardCustomerTitle: "KUNDENBRIEFE", cardCustomerSub: "Einladung · Präsentation · Geschäftsmöglichkeit",
    cardCustomerTemplates: "3 Vorlagen · 14 Sprachen",
    cardAdvisorTitle: "BERATER REKRUTIERUNG", cardAdvisorSub: "Passive Einführung · Aktive Einladung",
    cardAdvisorTemplates: "2 Vorlagen · 14 Sprachen",
    cardRealEstateTitle: "IMMOBILIENPARTNER", cardRealEstateSub: "Sanfte Empfehlungseinführung · Joint-Venture-Vorschlag",
    cardRealEstateTemplates: "2 Vorlagen · 14 Sprachen",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Ultra-Premium Brief · Direkte E-Mail",
    cardHnwTemplates: "Vollständiges Profil · 14 Sprachen",
    comingSoon: "DEMNÄCHST",
  },
  fr: {
    back: "← Retour", title: "LETTRES & OUTREACH", sub: "Outils de lettres professionnels pour chaque audience.",
    profileBtn: "⚙ Profil",
    cardCustomerTitle: "LETTRES CLIENT", cardCustomerSub: "Invitation · Présentation · Opportunité commerciale",
    cardCustomerTemplates: "3 modèles · 14 langues",
    cardAdvisorTitle: "RECRUTEMENT CONSEILLER", cardAdvisorSub: "Introduction passive · Invitation active",
    cardAdvisorTemplates: "2 modèles · 14 langues",
    cardRealEstateTitle: "PARTENAIRES IMMOBILIERS", cardRealEstateSub: "Introduction référence · Proposition joint-venture",
    cardRealEstateTemplates: "2 modèles · 14 langues",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Lettre ultra-premium · Email direct",
    cardHnwTemplates: "Profil complet · 14 langues",
    comingSoon: "BIENTÔT",
  },
  es: {
    back: "← Volver", title: "CARTAS & OUTREACH", sub: "Herramientas de cartas profesionales para cada audiencia.",
    profileBtn: "⚙ Perfil",
    cardCustomerTitle: "CARTAS AL CLIENTE", cardCustomerSub: "Invitación · Presentación · Oportunidad de negocio",
    cardCustomerTemplates: "3 plantillas · 14 idiomas",
    cardAdvisorTitle: "RECLUTAMIENTO DE ASESORES", cardAdvisorSub: "Introducción pasiva · Invitación activa",
    cardAdvisorTemplates: "2 plantillas · 14 idiomas",
    cardRealEstateTitle: "SOCIOS INMOBILIARIOS", cardRealEstateSub: "Introducción de referido · Propuesta joint-venture",
    cardRealEstateTemplates: "2 plantillas · 14 idiomas",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Carta ultra-premium · Email directo",
    cardHnwTemplates: "Perfil completo · 14 idiomas",
    comingSoon: "PRÓXIMAMENTE",
  },
  it: {
    back: "← Indietro", title: "LETTERE & OUTREACH", sub: "Strumenti di lettere professionali per ogni pubblico.",
    profileBtn: "⚙ Profilo",
    cardCustomerTitle: "LETTERE AL CLIENTE", cardCustomerSub: "Invito · Presentazione · Opportunità commerciale",
    cardCustomerTemplates: "3 modelli · 14 lingue",
    cardAdvisorTitle: "RECLUTAMENTO CONSULENTI", cardAdvisorSub: "Introduzione passiva · Invito attivo",
    cardAdvisorTemplates: "2 modelli · 14 lingue",
    cardRealEstateTitle: "PARTNER IMMOBILIARI", cardRealEstateSub: "Introduzione referral · Proposta joint-venture",
    cardRealEstateTemplates: "2 modelli · 14 lingue",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Lettera ultra-premium · Email diretto",
    cardHnwTemplates: "Profilo completo · 14 lingue",
    comingSoon: "PROSSIMAMENTE",
  },
  pt: {
    back: "← Voltar", title: "CARTAS & OUTREACH", sub: "Ferramentas de cartas profissionais para cada público.",
    profileBtn: "⚙ Perfil",
    cardCustomerTitle: "CARTAS AO CLIENTE", cardCustomerSub: "Convite · Apresentação · Oportunidade de negócio",
    cardCustomerTemplates: "3 modelos · 14 idiomas",
    cardAdvisorTitle: "RECRUTAMENTO DE CONSULTORES", cardAdvisorSub: "Introdução passiva · Convite ativo",
    cardAdvisorTemplates: "2 modelos · 14 idiomas",
    cardRealEstateTitle: "PARCEIROS IMOBILIÁRIOS", cardRealEstateSub: "Introdução de referência · Proposta joint-venture",
    cardRealEstateTemplates: "2 modelos · 14 idiomas",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Carta ultra-premium · Email direto",
    cardHnwTemplates: "Perfil completo · 14 idiomas",
    comingSoon: "EM BREVE",
  },
  ru: {
    back: "← Назад", title: "ПИСЬМА & OUTREACH", sub: "Профессиональные письма для каждой аудитории.",
    profileBtn: "⚙ Профиль",
    cardCustomerTitle: "ПИСЬМА КЛИЕНТАМ", cardCustomerSub: "Приглашение · Презентация · Бизнес-возможность",
    cardCustomerTemplates: "3 шаблона · 14 языков",
    cardAdvisorTitle: "РЕКРУТИНГ СОВЕТНИКОВ", cardAdvisorSub: "Пассивное знакомство · Активное приглашение",
    cardAdvisorTemplates: "2 шаблона · 14 языков",
    cardRealEstateTitle: "ПАРТНЁРЫ ПО НЕДВИЖИМОСТИ", cardRealEstateSub: "Мягкое знакомство · Предложение СП",
    cardRealEstateTemplates: "2 шаблона · 14 языков",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Ультра-премиум письмо · Прямой email",
    cardHnwTemplates: "Полный профиль · 14 языков",
    comingSoon: "СКОРО",
  },
  zh: {
    back: "← 返回", title: "信函与推广", sub: "适用于各类受众的专业信函工具。",
    profileBtn: "⚙ 资料",
    cardCustomerTitle: "客户信函", cardCustomerSub: "邀请函 · 演示函 · 商业机会",
    cardCustomerTemplates: "3个模板 · 14种语言",
    cardAdvisorTitle: "顾问招募", cardAdvisorSub: "被动介绍 · 主动邀请",
    cardAdvisorTemplates: "2个模板 · 14种语言",
    cardRealEstateTitle: "房地产合作伙伴", cardRealEstateSub: "软性介绍 · 合资提案",
    cardRealEstateTemplates: "2个模板 · 14种语言",
    cardHnwTitle: "VIP / 高净值推广", cardHnwSub: "超高端信函 · 直接邮件",
    cardHnwTemplates: "完整资料 · 14种语言",
    comingSoon: "即将推出",
  },
  tl: {
    back: "← Bumalik", title: "MGA LIHAM & OUTREACH", sub: "Mga propesyonal na tool sa liham para sa bawat audience.",
    profileBtn: "⚙ Profile",
    cardCustomerTitle: "MGA LIHAM SA KLIYENTE", cardCustomerSub: "Imbitasyon · Presentasyon · Oportunidad sa Negosyo",
    cardCustomerTemplates: "3 template · 14 wika",
    cardAdvisorTitle: "PAGRE-RECRUIT NG ADVISER", cardAdvisorSub: "Passive na Pagpapakilala · Active na Imbitasyon",
    cardAdvisorTemplates: "2 template · 14 wika",
    cardRealEstateTitle: "MGA KASOSYO SA REAL ESTATE", cardRealEstateSub: "Malambot na Pagpapakilala · Panukala sa JV",
    cardRealEstateTemplates: "2 template · 14 wika",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Ultra-Premium na Liham · Direktang Email",
    cardHnwTemplates: "Buong profile · 14 wika",
    comingSoon: "PAPARATING",
  },
  ar: {
    back: "→ رجوع", title: "الرسائل والتواصل", sub: "أدوات رسائل احترافية لكل جمهور.",
    profileBtn: "⚙ الملف",
    cardCustomerTitle: "رسائل العملاء", cardCustomerSub: "دعوة · عرض تقديمي · فرصة عمل",
    cardCustomerTemplates: "3 قوالب · 14 لغة",
    cardAdvisorTitle: "استقطاب المستشارين", cardAdvisorSub: "تعريف سلبي · دعوة نشطة",
    cardAdvisorTemplates: "قالبان · 14 لغة",
    cardRealEstateTitle: "شركاء العقارات", cardRealEstateSub: "تعريف ترشيحي · اقتراح مشروع مشترك",
    cardRealEstateTemplates: "قالبان · 14 لغة",
    cardHnwTitle: "VIP / كبار العملاء", cardHnwSub: "رسالة فائقة الجودة · بريد مباشر",
    cardHnwTemplates: "ملف كامل · 14 لغة",
    comingSoon: "قريباً",
  },
  th: {
    back: "← กลับ", title: "จดหมายและการเข้าถึง", sub: "เครื่องมือจดหมายระดับมืออาชีพสำหรับทุกกลุ่มเป้าหมาย",
    profileBtn: "⚙ โปรไฟล์",
    cardCustomerTitle: "จดหมายถึงลูกค้า", cardCustomerSub: "คำเชิญ · การนำเสนอ · โอกาสทางธุรกิจ",
    cardCustomerTemplates: "3 แบบ · 14 ภาษา",
    cardAdvisorTitle: "การสรรหาที่ปรึกษา", cardAdvisorSub: "การแนะนำแบบพาสซีฟ · คำเชิญแบบแอคทีฟ",
    cardAdvisorTemplates: "2 แบบ · 14 ภาษา",
    cardRealEstateTitle: "พันธมิตรอสังหาริมทรัพย์", cardRealEstateSub: "การแนะนำอ่อนๆ · ข้อเสนอร่วมทุน",
    cardRealEstateTemplates: "2 แบบ · 14 ภาษา",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "จดหมายระดับสูงสุด · อีเมลตรง",
    cardHnwTemplates: "โปรไฟล์เต็ม · 14 ภาษา",
    comingSoon: "เร็วๆ นี้",
  },
  hi: {
    back: "← वापस", title: "पत्र और आउटरीच", sub: "हर दर्शक के लिए पेशेवर पत्र उपकरण।",
    profileBtn: "⚙ प्रोफ़ाइल",
    cardCustomerTitle: "क्लाइंट पत्र", cardCustomerSub: "आमंत्रण · प्रस्तुति · व्यापार अवसर",
    cardCustomerTemplates: "3 टेम्पलेट · 14 भाषाएं",
    cardAdvisorTitle: "सलाहकार भर्ती", cardAdvisorSub: "निष्क्रिय परिचय · सक्रिय आमंत्रण",
    cardAdvisorTemplates: "2 टेम्पलेट · 14 भाषाएं",
    cardRealEstateTitle: "रियल एस्टेट साझेदार", cardRealEstateSub: "सॉफ्ट परिचय · संयुक्त उद्यम प्रस्ताव",
    cardRealEstateTemplates: "2 टेम्पलेट · 14 भाषाएं",
    cardHnwTitle: "VIP / HNW आउटरीच", cardHnwSub: "अल्ट्रा-प्रीमियम पत्र · डायरेक्ट ईमेल",
    cardHnwTemplates: "पूर्ण प्रोफ़ाइल · 14 भाषाएं",
    comingSoon: "जल्द आ रहा है",
  },
  vi: {
    back: "← Quay lại", title: "THƯ & TIẾP CẬN", sub: "Công cụ thư chuyên nghiệp cho mọi đối tượng.",
    profileBtn: "⚙ Hồ sơ",
    cardCustomerTitle: "THƯ KHÁCH HÀNG", cardCustomerSub: "Lời mời · Thuyết trình · Cơ hội kinh doanh",
    cardCustomerTemplates: "3 mẫu · 14 ngôn ngữ",
    cardAdvisorTitle: "TUYỂN DỤNG TƯ VẤN VIÊN", cardAdvisorSub: "Giới thiệu bị động · Lời mời chủ động",
    cardAdvisorTemplates: "2 mẫu · 14 ngôn ngữ",
    cardRealEstateTitle: "ĐỐI TÁC BẤT ĐỘNG SẢN", cardRealEstateSub: "Giới thiệu nhẹ nhàng · Đề xuất liên doanh",
    cardRealEstateTemplates: "2 mẫu · 14 ngôn ngữ",
    cardHnwTitle: "VIP / HNW OUTREACH", cardHnwSub: "Thư siêu cao cấp · Email trực tiếp",
    cardHnwTemplates: "Hồ sơ đầy đủ · 14 ngôn ngữ",
    comingSoon: "SẮP RA MẮT",
  },
};

type TierCard = {
  icon: string;
  titleKey: keyof HubText;
  subKey: keyof HubText;
  templatesKey: keyof HubText;
  route: string;
  active: boolean;
  accentColor: string;
};

const TIERS: TierCard[] = [
  {
    icon: "✉️",
    titleKey: "cardCustomerTitle",
    subKey: "cardCustomerSub",
    templatesKey: "cardCustomerTemplates",
    route: "/client-letter",
    active: true,
    accentColor: GOLD,
  },
  {
    icon: "🤝",
    titleKey: "cardAdvisorTitle",
    subKey: "cardAdvisorSub",
    templatesKey: "cardAdvisorTemplates",
    route: "/letters/advisor-recruiting",
    active: true,
    accentColor: "#3b82f6",
  },
  {
    icon: "🏢",
    titleKey: "cardRealEstateTitle",
    subKey: "cardRealEstateSub",
    templatesKey: "cardRealEstateTemplates",
    route: "/letters/real-estate",
    active: true,
    accentColor: "#10b981",
  },
  {
    icon: "💎",
    titleKey: "cardHnwTitle",
    subKey: "cardHnwSub",
    templatesKey: "cardHnwTemplates",
    route: "/letters/hnw-outreach",
    active: true,
    accentColor: "#a855f7",
  },
];

export default function LettersHubScreen() {
  const router = useRouter();
  const { language } = useCalculator();
  const tx = TX[language] ?? TX.en;

  const profileQuery = trpc.advisor.getProfile.useQuery(undefined, { retry: false });
  const hasLogo = !!profileQuery.data?.logoUrl;
  const hasProfile = !!profileQuery.data?.adviserName;

  const handleCard = (tier: TierCard) => {
    if (!tier.active) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(tier.route as any);
  };

  return (
    <ScreenContainer bgColor={NAVY}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Header */}
        <View style={S.header}>
          <View style={S.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={S.backText}>{tx.back}</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TouchableOpacity
              style={S.helpBtn}
              onPress={() => router.push("/letters/help")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={S.helpBtnText}>?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={S.profileBtn}
              onPress={() => router.push("/letters/profile-setup")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {hasLogo && profileQuery.data?.logoUrl ? (
                <Image source={{ uri: profileQuery.data.logoUrl }} style={S.profileThumb} resizeMode="cover" />
              ) : null}
              <Text style={S.profileBtnText}>{tx.profileBtn}</Text>
            </TouchableOpacity>
            </View>
          </View>
          <Text style={S.title}>{tx.title}</Text>
          <Text style={S.sub}>{tx.sub}</Text>
        </View>

        {/* Profile nudge — shown if no profile is set yet */}
        {!profileQuery.isLoading && !hasProfile && (
          <TouchableOpacity
            style={S.nudge}
            onPress={() => router.push("/letters/profile-setup")}
            activeOpacity={0.85}
          >
            <Text style={S.nudgeIcon}>👤</Text>
            <View style={{ flex: 1 }}>
              <Text style={S.nudgeTitle}>Set up your profile</Text>
              <Text style={S.nudgeSub}>Add your name, company, and logo — pre-filled in every letter.</Text>
            </View>
            <Text style={S.nudgeArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Tier cards */}
        <View style={S.cards}>
          {TIERS.map((tier) => {
            const isActive = tier.active;
            return (
              <TouchableOpacity
                key={tier.route}
                style={[S.card, isActive ? { borderColor: tier.accentColor } : S.cardInactive]}
                onPress={() => handleCard(tier)}
                activeOpacity={isActive ? 0.85 : 1}
              >
                <View style={[S.cardIconBox, { backgroundColor: `${tier.accentColor}18` }]}>
                  <Text style={S.cardIcon}>{tier.icon}</Text>
                </View>

                <View style={S.cardBody}>
                  <View style={S.cardTitleRow}>
                    <Text style={[S.cardTitle, !isActive && S.cardTitleInactive]}>
                      {tx[tier.titleKey]}
                    </Text>
                    {!isActive && (
                      <View style={S.comingSoonBadge}>
                        <Text style={S.comingSoonText}>{tx.comingSoon}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[S.cardSub, !isActive && S.cardSubInactive]}>
                    {tx[tier.subKey]}
                  </Text>
                  <Text style={[S.cardMeta, !isActive && S.cardMetaInactive]}>
                    {tx[tier.templatesKey]}
                  </Text>
                </View>

                <Text style={[S.cardArrow, { color: tier.accentColor }, !isActive && S.cardArrowInactive]}>
                  ›
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2d47",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: { color: GOLD, fontFamily: FONT, fontSize: 14 },
  helpBtn: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: "#1e2d47",
    backgroundColor: "#0f1f38",
    alignItems: "center", justifyContent: "center",
  },
  helpBtnText: { color: "#64748b", fontFamily: FONT, fontSize: 13 },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e2d47",
    backgroundColor: "#0f1f38",
  },
  profileThumb: { width: 18, height: 18, borderRadius: 4 },
  profileBtnText: { color: "#94a3b8", fontFamily: FONT, fontSize: 12 },
  title: { color: "#fff", fontFamily: FONT, fontSize: 22, letterSpacing: 1.2, marginBottom: 6 },
  sub: { color: "#64748b", fontFamily: FONT, fontSize: 13, lineHeight: 19 },

  nudge: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#0f1f38",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nudgeIcon: { fontSize: 22 },
  nudgeTitle: { color: GOLD, fontFamily: FONT, fontSize: 13, marginBottom: 2 },
  nudgeSub: { color: "#64748b", fontFamily: FONT, fontSize: 11, lineHeight: 16 },
  nudgeArrow: { color: GOLD, fontSize: 20, fontFamily: FONT },

  cards: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },

  card: {
    backgroundColor: "#0f1f38",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardInactive: {
    borderColor: "#1e2d47",
    opacity: 0.55,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIcon: { fontSize: 26 },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  cardTitle: { color: "#f1f5f9", fontFamily: FONT, fontSize: 13, letterSpacing: 0.5, flex: 1 },
  cardTitleInactive: { color: "#64748b" },
  comingSoonBadge: {
    backgroundColor: "#1e2d47",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comingSoonText: { color: "#475569", fontFamily: FONT, fontSize: 9, letterSpacing: 0.5 },
  cardSub: { color: "#94a3b8", fontFamily: FONT, fontSize: 12, lineHeight: 17, marginBottom: 4 },
  cardSubInactive: { color: "#334155" },
  cardMeta: { color: "#475569", fontFamily: FONT, fontSize: 10, letterSpacing: 0.3 },
  cardMetaInactive: { color: "#1e2d47" },
  cardArrow: { fontSize: 22, fontFamily: FONT },
  cardArrowInactive: { color: "#1e2d47" },
});
