import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Platform, Image } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { DisclaimerFooter } from "@/components/disclaimer-footer";
import { useCalculator } from "@/lib/calculator-context";
import { t, Language } from "@/lib/translations";
import * as Haptics from "expo-haptics";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "nl", label: "NL", flag: "🇳🇱" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "tl", label: "Filipino", flag: "🇵🇭" },
  { code: "pt", label: "PT", flag: "🇵🇹" },
  { code: "ar", label: "عربي", flag: "🇸🇦" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "vi", label: "Việt", flag: "🇻🇳" },
];

const SP_LEVELS = [
  { sp: "SP1", range: "$110–$1K",   base: "2.2%",  vip: "5.2%" },
  { sp: "SP2", range: "$1K–2.5K",  base: "2.45%", vip: "5.45%" },
  { sp: "SP3", range: "$2.5K–5K", base: "2.7%",  vip: "5.7%" },
  { sp: "SP4", range: "$5K–$10K",   base: "3.0%",  vip: "6.0%" },
  { sp: "SP5", range: "$10K–$50K",  base: "3.1%",  vip: "6.1%" },
  { sp: "SP6", range: "$50K–$100K", base: "3.2%",  vip: "6.2%" },
  { sp: "SP7", range: "$100K+",     base: "3.3%",  vip: "6.3%" },
];

interface GoalCard {
  icon: string;
  titleKey: string;
  title: string;
  subtitleKey: string;
  subtitle: string;
  description: string;
  recommended: string;
  startAmount: number;
  vip: boolean;
}

const GOAL_CARDS: GoalCard[] = [
  {
    icon: "🎓",
    titleKey: "goalFamilyTitle",
    title: "Family & Legacy",
    subtitleKey: "goalFamilySubtitle",
    subtitle: "University Fund • Private Schooling",
    description: "Provide the best education and a safe future for your children. Your capital works through monthly plans to grow your family wealth while keeping your money accessible.",
    recommended: "$3,500 (SP3 + VIP)",
    startAmount: 3500,
    vip: true,
  },
  {
    icon: "🏠",
    titleKey: "goalHomeTitle",
    title: "Home & Property",
    subtitleKey: "goalHomeSubtitle",
    subtitle: "Home Down Payment • Renovations",
    description: "Build the funds you need for a new home or high-end renovations. Smart growth creates the cash needed for property deposits or major upgrades over 1 to 2 years.",
    recommended: "$25,000+ with VIP",
    startAmount: 25000,
    vip: true,
  },
  {
    icon: "🚗",
    titleKey: "goalLifestyleTitle",
    title: "Lifestyle & Passion",
    subtitleKey: "goalLifestyleSubtitle",
    subtitle: "Luxury Lease • World Trips",
    description: "Create a monthly income to pay for luxury travel and lifestyle goals. This plan generates cash you can spend every month without touching your original investment.",
    recommended: "$30,000+ (SP5 + VIP)",
    startAmount: 30000,
    vip: true,
  },
  {
    icon: "💰",
    titleKey: "goalFreedomTitle",
    title: "Freedom & Wealth",
    subtitleKey: "goalFreedomSubtitle",
    subtitle: "Financial Independence",
    description: "Reach total financial freedom faster. This high-level plan is built to help you live debt-free and gain full control over your time and wealth.",
    recommended: "$100,000+ (SP7 + VIP)",
    startAmount: 100000,
    vip: true,
  },
];

const TESTIMONIALS = [
  {
    name: "David H.",
    city: "London",
    sp: "SP6",
    months: 18,
    vip: true,
    avatar: "https://i.pravatar.cc/80?img=11",
    en: "After 18 months my portfolio is performing exactly as projected. This is serious wealth building — not speculation.",
    nl: "Na 18 maanden presteert mijn portefeuille precies zoals geprognosticeerd. Dit is serieuze vermogensopbouw — geen speculatie.",
    de: "Nach 18 Monaten entwickelt sich mein Portfolio genau wie prognostiziert. Das ist seriöser Vermögensaufbau — keine Spekulation.",
  },
  {
    name: "Sophie K.",
    city: "Zürich",
    sp: "SP4",
    months: 12,
    vip: true,
    avatar: "https://i.pravatar.cc/80?img=47",
    en: "The professionalism and transparency gave me confidence to grow my position after just 6 months. I wish I had started sooner.",
    nl: "De professionaliteit en transparantie gaven mij het vertrouwen om mijn positie na 6 maanden te vergroten. Ik wou dat ik eerder was begonnen.",
    de: "Die Professionalität und Transparenz gaben mir das Vertrauen, meine Position nach 6 Monaten auszubauen. Ich wünschte, ich hätte früher begonnen.",
  },
  {
    name: "Marco V.",
    city: "Amsterdam",
    sp: "SP5",
    months: 9,
    vip: true,
    avatar: "https://i.pravatar.cc/80?img=7",
    en: "I compared several alternatives. Nothing matched the combination of returns, structure, and personal guidance I found here.",
    nl: "Ik heb meerdere alternatieven vergeleken. Niets tipt aan de combinatie van rendement, structuur en persoonlijke begeleiding die ik hier vond.",
    de: "Ich habe mehrere Alternativen verglichen. Nichts kam an die Kombination aus Rendite, Struktur und persönlicher Beratung heran.",
  },
  {
    name: "Elena P.",
    city: "Dubai",
    sp: "SP7",
    months: 24,
    vip: true,
    avatar: "https://i.pravatar.cc/80?img=60",
    en: "My family's financial future is on a clear path. The monthly reports and adviser contact make all the difference.",
    nl: "De financiële toekomst van mijn gezin ligt nu op een helder pad. De maandelijkse rapportages en adviseurcontact maken het verschil.",
    de: "Die finanzielle Zukunft meiner Familie liegt auf einem klaren Kurs. Die monatlichen Berichte und der Beraterkontakt machen den Unterschied.",
  },
  {
    name: "Thomas R.",
    city: "Vienna",
    sp: "SP5",
    months: 14,
    vip: true,
    avatar: "https://i.pravatar.cc/80?img=33",
    en: "A high-end investment experience. Discreet, professional, and exactly what I needed to diversify my private wealth.",
    nl: "Een investering op topniveau. Discreet, professioneel en precies wat ik nodig had om mijn privévermogen te diversifiëren.",
    de: "Eine erstklassige Investmenterfahrung. Diskret, professionell und genau das, was ich zur Diversifizierung meines Privatvermögens benötigte.",
  },
];

const TESTIMONIAL_LABELS: Partial<Record<Language, { title: string; months: string }>> = {
  en: { title: "Client Testimonials", months: "mo." },
  nl: { title: "Klantervaringen",     months: "mnd." },
  de: { title: "Kundenstimmen",       months: "Mon." },
};

function getTestimonialQuote(item: typeof TESTIMONIALS[0], lang: Language): string {
  if (lang === "nl") return item.nl;
  if (lang === "de") return item.de;
  return item.en;
}

function getTestimonialLabel(lang: Language) {
  return TESTIMONIAL_LABELS[lang] ?? TESTIMONIAL_LABELS.en!;
}

const LEADERSHIP_TEXT: Record<Language, {
  sectionTitle: string;
  ceoTitle: string;
  cooTitle: string;
  patrickBio: string;
  michaelBio: string;
}> = {
  en: {
    sectionTitle: "Meet Our Leadership",
    ceoTitle: "CEO & Co-Founder",
    cooTitle: "COO",
    patrickBio: "Visionary entrepreneur and architect of the diamond investment model. Patrick built STIG International to give advisors and families access to a smarter, secure wealth-building solution.",
    michaelBio: "Operational leader driving STIG's global network. Michael ensures every advisor and client receives world-class service, consistency, and results they can count on.",
  },
  nl: {
    sectionTitle: "Ons Leiderschap",
    ceoTitle: "CEO & Medeoprichter",
    cooTitle: "COO",
    patrickBio: "Visionair ondernemer en architect van het diamantinvesteringsmodel. Patrick bouwde STIG International om adviseurs en families toegang te geven tot een slimmere, veilige vermogensopbouwoplossing.",
    michaelBio: "Operationeel leider van het wereldwijde STIG-netwerk. Michael zorgt dat elke adviseur en klant eersteklas service, consistentie en betrouwbare resultaten ontvangt.",
  },
  de: {
    sectionTitle: "Unser Führungsteam",
    ceoTitle: "CEO & Mitgründer",
    cooTitle: "COO",
    patrickBio: "Visionärer Unternehmer und Architekt des Diamant-Investitionsmodells. Patrick gründete STIG International, um Beratern und Familien Zugang zu einer intelligenten, sicheren Vermögensaufbaulösung zu ermöglichen.",
    michaelBio: "Operativer Leiter des globalen STIG-Netzwerks. Michael stellt sicher, dass jeder Berater und Kunde erstklassigen Service, Konsistenz und verlässliche Ergebnisse erhält.",
  },
  fr: {
    sectionTitle: "Notre Direction",
    ceoTitle: "PDG & Co-Fondateur",
    cooTitle: "Directeur des Opérations",
    patrickBio: "Entrepreneur visionnaire et architecte du modèle d'investissement diamant. Patrick a fondé STIG International pour donner aux conseillers et familles accès à une solution de création de patrimoine plus intelligente et sécurisée.",
    michaelBio: "Leader opérationnel du réseau mondial STIG. Michael garantit que chaque conseiller et client reçoit un service de classe mondiale, cohérence et résultats fiables.",
  },
  es: {
    sectionTitle: "Nuestro Liderazgo",
    ceoTitle: "CEO y Cofundador",
    cooTitle: "COO",
    patrickBio: "Emprendedor visionario y arquitecto del modelo de inversión en diamantes. Patrick fundó STIG International para dar a asesores y familias acceso a una solución de creación de riqueza más inteligente y segura.",
    michaelBio: "Líder operativo de la red global de STIG. Michael garantiza que cada asesor y cliente reciba servicio de clase mundial, coherencia y resultados confiables.",
  },
  it: {
    sectionTitle: "La Nostra Leadership",
    ceoTitle: "CEO e Co-Fondatore",
    cooTitle: "COO",
    patrickBio: "Imprenditore visionario e architetto del modello di investimento in diamanti. Patrick ha fondato STIG International per dare a consulenti e famiglie accesso a una soluzione di creazione di ricchezza più intelligente e sicura.",
    michaelBio: "Leader operativo della rete globale STIG. Michael garantisce che ogni consulente e cliente riceva un servizio di livello mondiale, coerenza e risultati affidabili.",
  },
  pt: {
    sectionTitle: "Nossa Liderança",
    ceoTitle: "CEO e Co-Fundador",
    cooTitle: "COO",
    patrickBio: "Empreendedor visionário e arquiteto do modelo de investimento em diamantes. Patrick fundou a STIG International para dar a assessores e famílias acesso a uma solução de criação de riqueza mais inteligente e segura.",
    michaelBio: "Líder operacional da rede global da STIG. Michael garante que cada assessor e cliente receba serviço de classe mundial, consistência e resultados confiáveis.",
  },
  ru: {
    sectionTitle: "Наше Руководство",
    ceoTitle: "Генеральный директор и Сооснователь",
    cooTitle: "Операционный директор",
    patrickBio: "Визионерский предприниматель и архитектор модели алмазных инвестиций. Патрик основал STIG International, чтобы дать консультантам и семьям доступ к более умному и безопасному решению для накопления капитала.",
    michaelBio: "Операционный лидер глобальной сети STIG. Михаэль обеспечивает, чтобы каждый консультант и клиент получал первоклассный сервис, последовательность и надёжные результаты.",
  },
  zh: {
    sectionTitle: "领导团队",
    ceoTitle: "首席执行官兼联合创始人",
    cooTitle: "首席运营官",
    patrickBio: "富有远见的企业家，钻石投资模式的架构师。Patrick创立了STIG International，为顾问和家庭提供更智慧、更安全的财富增值解决方案。",
    michaelBio: "STIG全球网络的运营领袖。Michael确保每位顾问和客户都能获得世界级的服务、一致性和可靠的回报。",
  },
  tl: {
    sectionTitle: "Ang Aming Pamumuno",
    ceoTitle: "CEO at Co-Founder",
    cooTitle: "COO",
    patrickBio: "Isang visionary na negosyante at arkitekto ng diamond investment model. Itinayo ni Patrick ang STIG International para bigyan ang mga advisor at pamilya ng mas matalinong paraan ng pagpapalago ng yaman.",
    michaelBio: "Operational na lider ng pandaigdigang network ng STIG. Tinitiyak ni Michael na ang bawat advisor at kliyente ay nakakatanggap ng world-class na serbisyo at maaasahang resulta.",
  },
  ar: {
    sectionTitle: "قيادتنا",
    ceoTitle: "الرئيس التنفيذي والمؤسس المشارك",
    cooTitle: "المدير التشغيلي",
    patrickBio: "رائد أعمال ذو رؤية ومهندس نموذج الاستثمار في الألماس. أسّس باتريك STIG International لمنح المستشارين والعائلات إمكانية الوصول إلى حل أذكى وأكثر أماناً لبناء الثروة.",
    michaelBio: "القائد التشغيلي للشبكة العالمية لـ STIG. يضمن مايكل حصول كل مستشار وعميل على خدمة عالمية المستوى واتساق ونتائج موثوقة.",
  },
  th: {
    sectionTitle: "ผู้นำของเรา",
    ceoTitle: "ซีอีโอและผู้ร่วมก่อตั้ง",
    cooTitle: "ซีโอโอ",
    patrickBio: "ผู้ประกอบการที่มีวิสัยทัศน์และสถาปนิกของโมเดลการลงทุนเพชร Patrick ก่อตั้ง STIG International เพื่อมอบโซลูชันการสร้างความมั่งคั่งที่ชาญฉลาดและปลอดภัยยิ่งขึ้นแก่ที่ปรึกษาและครอบครัว",
    michaelBio: "ผู้นำด้านปฏิบัติการของเครือข่ายทั่วโลกของ STIG Michael รับประกันว่าที่ปรึกษาและลูกค้าทุกคนจะได้รับบริการระดับโลก ความสอดคล้อง และผลลัพธ์ที่เชื่อถือได้",
  },
  hi: {
    sectionTitle: "हमारा नेतृत्व",
    ceoTitle: "सीईओ और सह-संस्थापक",
    cooTitle: "सीओओ",
    patrickBio: "दूरदर्शी उद्यमी और डायमंड निवेश मॉडल के वास्तुकार। Patrick ने STIG International की स्थापना सलाहकारों और परिवारों को एक समझदार, सुरक्षित संपत्ति-निर्माण समाधान तक पहुंच देने के लिए की।",
    michaelBio: "STIG के वैश्विक नेटवर्क के परिचालन नेता। Michael सुनिश्चित करते हैं कि प्रत्येक सलाहकार और ग्राहक को विश्व-स्तरीय सेवा, स्थिरता और भरोसेमंद परिणाम मिलें।",
  },
  vi: {
    sectionTitle: "Lãnh Đạo Của Chúng Tôi",
    ceoTitle: "CEO và Đồng Sáng Lập",
    cooTitle: "COO",
    patrickBio: "Doanh nhân có tầm nhìn và kiến trúc sư của mô hình đầu tư kim cương. Patrick thành lập STIG International để mang đến cho các cố vấn và gia đình một giải pháp xây dựng tài sản thông minh và an toàn hơn.",
    michaelBio: "Lãnh đạo vận hành của mạng lưới toàn cầu STIG. Michael đảm bảo rằng mọi cố vấn và khách hàng đều nhận được dịch vụ đẳng cấp thế giới, sự nhất quán và kết quả đáng tin cậy.",
  },
};

function getGoalSP(amount: number): { sp: string; base: number } {
  if (amount >= 100000) return { sp: "SP7", base: 3.3 };
  if (amount >= 50000)  return { sp: "SP6", base: 3.2 };
  if (amount >= 10000)  return { sp: "SP5", base: 3.1 };
  if (amount >= 5000)   return { sp: "SP4", base: 3.0 };
  if (amount >= 2500)   return { sp: "SP3", base: 2.7 };
  if (amount >= 1000)   return { sp: "SP2", base: 2.45 };
  return { sp: "SP1", base: 2.2 };
}

function getGoalProjection(amount: number, vip: boolean, years: number) {
  const { sp, base } = getGoalSP(amount);
  const totalRate = base + (vip ? 3 : 0);
  const rateDecimal = totalRate / 100;
  const rebateNow = Math.round(amount * rateDecimal);
  const months = years * 12;
  const portfolioAfter = amount * Math.pow(1 + rateDecimal * 0.5, months);
  const rebateAfter = Math.round(portfolioAfter * rateDecimal);
  return { sp, base, totalRate, rebateNow, rebateAfter };
}

export default function HomeScreen() {
  const router = useRouter();
  const { language, setLanguage, partnerMode } = useCalculator();
  const [explainCard, setExplainCard] = useState<GoalCard | null>(null);
  const [goalYears, setGoalYears] = useState<3 | 5>(5);

  const handleLang = (code: Language) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(code);
  };

  const handleCalculate = (card: GoalCard) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/scenario-tool?plan=goal&startAmount=${card.startAmount}&vip=${card.vip ? 1 : 0}&goalAmount=${card.startAmount}&years=${goalYears}`);
  };

  const toolDescriptions: Record<Language, { tool1: string; tool2: string }> = {
    en: {
      tool1: "Simulate your wealth growth month-by-month. Configure deposits, withdrawals, compound percentages, VIP status, and track your goal progress.",
      tool2: "Goal planning calculator. Enter your start deposit and monthly income goal — get 4 strategic plans (A/B/C/D) with exact amounts and timelines.",
    },
    nl: {
      tool1: "Simuleer uw vermogensgroei maand voor maand. Configureer stortingen, opnames, samengestelde percentages en VIP-status.",
      tool2: "Doelplanningscalculator. Voer uw startbedrag en maandelijks inkomensdoel in — ontvang 4 strategische plannen (A/B/C/D).",
    },
    de: {
      tool1: "Simulieren Sie Ihr Vermögenswachstum Monat für Monat. Konfigurieren Sie Einzahlungen, Abhebungen, Zinseszinsprozentsätze und VIP-Status.",
      tool2: "Zielplanungsrechner. Geben Sie Ihre Starteinlage und Ihr monatliches Einkommensziel ein — erhalten Sie 4 strategische Pläne (A/B/C/D).",
    },
    fr: {
      tool1: "Simulez votre croissance de richesse mois par mois. Configurez les dépôts, retraits, pourcentages composés et statut VIP.",
      tool2: "Calculateur de planification d'objectifs. Entrez votre dépôt de départ et votre objectif de revenu mensuel — obtenez 4 plans stratégiques (A/B/C/D).",
    },
    es: {
      tool1: "Simule su crecimiento de riqueza mes a mes. Configure depósitos, retiros, porcentajes compuestos y estado VIP.",
      tool2: "Calculadora de planificación de objetivos. Ingrese su depósito inicial y el objetivo de ingresos mensuales — obtenga 4 planes estratégicos (A/B/C/D).",
    },
    it: {
      tool1: "Simula la crescita del tuo patrimonio mese per mese. Configura depositi, prelievi, percentuali di capitalizzazione e stato VIP.",
      tool2: "Calcolatore di pianificazione obiettivi. Inserisci il deposito iniziale e l'obiettivo mensile — ottieni 4 piani strategici (A/B/C/D).",
    },
    ru: {
      tool1: "Симулируйте рост капитала помесячно. Настройте депозиты, выводы, реинвестирование и VIP-статус.",
      tool2: "Калькулятор планирования целей. Введите начальный депозит и ежемесячную цель — получите 4 стратегических плана (A/B/C/D).",
    },
    zh: {
      tool1: "逐月模拟您的财富增长。配置存款、提款、复利百分比和VIP状态。",
      tool2: "目标规划计算器。输入您的初始存款和每月收入目标 — 获得4个战略计划（A/B/C/D）。",
    },
    tl: {
      tool1: "Simulate your wealth growth month-by-month with deposit, withdrawal and VIP settings.",
      tool2: "Goal planning calculator. Get 4 strategic plans (A/B/C/D) with exact amounts.",
    },
    pt: {
      tool1: "Simule o seu crescimento de riqueza mês a mês com depósitos, retiradas e VIP.",
      tool2: "Calculadora de objectivos. Obtenha 4 planos estratégicos (A/B/C/D).",
    },
    ar: {
      tool1: "محاكاة نمو ثروتك شهراً بشهر مع الودائع والسحوبات وحالة VIP.",
      tool2: "حاسبة تخطيط الأهداف. احصل على 4 خطط استراتيجية (A/B/C/D).",
    },
    th: {
      tool1: "จำลองการเติบโตของความมั่งคั่งทีละเดือน พร้อมการฝากเงินและสถานะ VIP",
      tool2: "เครื่องคำนวณการวางแผนเป้าหมาย รับ 4 แผนกลยุทธ์ (A/B/C/D)",
    },
    hi: {
      tool1: "महीने दर महीने अपनी संपत्ति वृद्धि का अनुकरण करें। जमा, निकासी और VIP स्थिति कॉन्फ़िगर करें।",
      tool2: "लक्ष्य योजना कैलकुलेटर। 4 रणनीतिक योजनाएं (A/B/C/D) प्राप्त करें।",
    },
    vi: {
      tool1: "Mô phỏng tăng trưởng tài sản hàng tháng với cài đặt nạp tiền, rút tiền và VIP.",
      tool2: "Máy tính lập kế hoạch mục tiêu. Nhận 4 kế hoạch chiến lược (A/B/C/D).",
    },
  };

  const desc = toolDescriptions[language] || toolDescriptions.en;

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor="#0f172a">
      <ScrollView style={S.scroll} contentContainerStyle={S.content}>

        {/* Language selector */}
        <View style={S.langRow}>
          {LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[S.langBtn, language === l.code && S.langBtnActive]}
              onPress={() => handleLang(l.code)}
            >
              <Text style={[S.langText, language === l.code && S.langTextActive]}>{l.flag} {l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hero */}
        <View style={S.hero}>
          <Text style={S.heroIcon}>💎</Text>
          <Text style={S.heroTitle}>{t(language, "welcomeTitle")}</Text>
          <Text style={S.heroSub}>{t(language, "welcomeSubtitle")}</Text>
          <Text style={S.heroTagline}>{t(language, "familyIncomeTagline")}</Text>
        </View>

        {/* Leadership Section */}
        <View style={S.leaderSection}>
          <View style={S.leaderHeaderRow}>
            <View>
              <Text style={S.leaderSectionTitle}>
                {LEADERSHIP_TEXT[language]?.sectionTitle ?? LEADERSHIP_TEXT.en.sectionTitle}
              </Text>
              <Text style={S.leaderSectionSub}>STIG International</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/leadership")} style={S.leaderMoreBtn}>
              <Text style={S.leaderMoreText}>Full Bio →</Text>
            </TouchableOpacity>
          </View>
          <View style={S.leaderRow}>
            {/* Patrick Stoeger */}
            <TouchableOpacity style={[S.leaderCard, { borderTopColor: "#f59e0b" }]} onPress={() => router.push("/leadership")} activeOpacity={0.85}>
              <Image source={require("../../assets/images/patrick-stoeger.jpg")} style={S.leaderPhoto} />
              <Text style={S.leaderName}>Patrick Stoeger</Text>
              <View style={[S.leaderBadge, { backgroundColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.3)" }]}>
                <Text style={[S.leaderBadgeText, { color: "#f59e0b" }]}>
                  {LEADERSHIP_TEXT[language]?.ceoTitle ?? LEADERSHIP_TEXT.en.ceoTitle}
                </Text>
              </View>
              <Text style={S.leaderBio}>
                {LEADERSHIP_TEXT[language]?.patrickBio ?? LEADERSHIP_TEXT.en.patrickBio}
              </Text>
            </TouchableOpacity>
            {/* Michael Lang */}
            <TouchableOpacity style={[S.leaderCard, { borderTopColor: "#33C5FF" }]} onPress={() => router.push("/leadership")} activeOpacity={0.85}>
              <Image source={require("../../assets/images/michael-lang.jpg")} style={S.leaderPhoto} />
              <Text style={S.leaderName}>Michael Lang</Text>
              <View style={[S.leaderBadge, { backgroundColor: "rgba(51,197,255,0.12)", borderColor: "rgba(51,197,255,0.3)" }]}>
                <Text style={[S.leaderBadgeText, { color: "#33C5FF" }]}>
                  {LEADERSHIP_TEXT[language]?.cooTitle ?? LEADERSHIP_TEXT.en.cooTitle}
                </Text>
              </View>
              <Text style={S.leaderBio}>
                {LEADERSHIP_TEXT[language]?.michaelBio ?? LEADERSHIP_TEXT.en.michaelBio}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Testimonials */}
        <View style={S.testimonialSection}>
          <Text style={S.testimonialSectionTitle}>{getTestimonialLabel(language).title}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={286}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 10, paddingRight: 4 }}
          >
            {TESTIMONIALS.map((item) => (
              <View key={item.name} style={S.testimonialCard}>
                <Text style={S.testimonialQuoteMark}>"</Text>
                <Text style={S.testimonialQuote}>{getTestimonialQuote(item, language)}</Text>
                <View style={S.testimonialDivider} />
                <View style={S.testimonialMeta}>
                  <View style={S.testimonialPersonRow}>
                    <Image
                      source={{ uri: item.avatar }}
                      style={S.testimonialAvatar}
                    />
                    <View>
                      <Text style={S.testimonialName}>{item.name}</Text>
                      <Text style={S.testimonialCity}>{item.city}</Text>
                    </View>
                  </View>
                  <View style={S.testimonialBadges}>
                    <View style={S.testimonialSpBadge}>
                      <Text style={S.testimonialSpText}>{item.sp}</Text>
                    </View>
                    <Text style={S.testimonialMonthsText}>{item.months} {getTestimonialLabel(language).months}</Text>
                    {item.vip && (
                      <View style={S.testimonialVipBadge}>
                        <Text style={S.testimonialVipText}>⭐ VIP</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Goal Cards Section */}
        <View style={[S.sectionHeader, { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }]}>
          <View style={{ flex: 1 }}>
            <Text style={S.sectionTitle}>{t(language, "goalCards")}</Text>
            <Text style={S.sectionSub}>{t(language, "goalCardsSubtitle")}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 5 }}>
            {([3, 5] as const).map(y => (
              <TouchableOpacity
                key={y}
                style={[S.yearBtn, goalYears === y && S.yearBtnActive]}
                onPress={() => setGoalYears(y)}
              >
                <Text style={[S.yearBtnText, goalYears === y && S.yearBtnTextActive]}>{y}Y</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={S.goalGrid}>
          {GOAL_CARDS.map((card) => {
            const proj = getGoalProjection(card.startAmount, card.vip, goalYears);
            return (
              <View key={card.titleKey} style={S.goalCard}>
                <Text style={S.goalIcon}>{card.icon}</Text>
                <Text style={S.goalTitle}>{t(language, card.titleKey)}</Text>
                <Text style={S.goalSubtitle}>{t(language, card.subtitleKey)}</Text>
                <Text style={S.goalRecommended}>⭐ {t(language, card.titleKey.replace('Title', 'Rec'))}</Text>

                {/* Plan example */}
                <View style={S.goalPlanBox}>
                  <Text style={S.goalPlanRate}>
                    {proj.sp} · {proj.base}% + 3% VIP = {proj.totalRate}%
                  </Text>
                  <View style={S.goalPlanRow}>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text style={S.goalPlanLabel}>Now</Text>
                      <Text style={S.goalPlanNow}>${proj.rebateNow.toLocaleString()}/mo</Text>
                    </View>
                    <View style={S.goalPlanDivider} />
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text style={S.goalPlanLabel}>After {goalYears}Y</Text>
                      <Text style={S.goalPlanAfter}>${proj.rebateAfter.toLocaleString()}/mo</Text>
                    </View>
                  </View>
                </View>

                <View style={S.goalButtons}>
                  <TouchableOpacity
                    style={S.explainBtn}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExplainCard(card);
                    }}
                  >
                    <Text style={S.explainBtnText}>{t(language, "explanation")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={S.calcBtn}
                    onPress={() => handleCalculate(card)}
                  >
                    <Text style={S.calcBtnText}>{t(language, "calculateGoal")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Tool 1: Strategy Engineer */}
        <TouchableOpacity style={[S.toolCard, { borderTopColor: "#f59e0b" }]} onPress={() => router.push("/strategy-engineer")} activeOpacity={0.85}>
          <View style={[S.toolBadge, { backgroundColor: "#f59e0b" }]}>
            <Text style={[S.toolBadgeText, { color: "#0f172a" }]}>TOOL 1</Text>
          </View>
          <Text style={S.toolTitle}>🧠 {t(language, "strategyEngineer")}</Text>
          <Text style={S.toolDesc}>{desc.tool2}</Text>
          <View style={S.toolFeatures}>
            {["Plan A", "Plan B", "Plan C", "Plan D"].map(f => (
              <View key={f} style={[S.featureTag, { backgroundColor: "rgba(245,158,11,0.13)", borderColor: "rgba(245,158,11,0.27)" }]}>
                <Text style={[S.featureText, { color: "#f59e0b" }]}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={[S.toolArrow, { borderTopColor: "rgba(245,158,11,0.2)" }]}>
            <Text style={[S.toolArrowText, { color: "#f59e0b" }]}>{t(language, "strategyEngineer")} →</Text>
          </View>
        </TouchableOpacity>

        {/* Tool 2: Scenario Tool */}
        <TouchableOpacity style={S.toolCard} onPress={() => router.push("/scenario-tool")} activeOpacity={0.85}>
          <View style={[S.toolBadge, { backgroundColor: "#33C5FF" }]}>
            <Text style={S.toolBadgeText}>TOOL 2</Text>
          </View>
          <Text style={S.toolTitle}>📊 {t(language, "scenarioTool")}</Text>
          <Text style={S.toolDesc}>{desc.tool1}</Text>
          <View style={S.toolFeatures}>
            {["SP1–SP7", "VIP", "Bulk ops", "Monthly table", "Goal tracker"].map(f => (
              <View key={f} style={S.featureTag}>
                <Text style={S.featureText}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={S.toolArrow}>
            <Text style={S.toolArrowText}>{t(language, "scenarioTool")} →</Text>
          </View>
        </TouchableOpacity>

        {/* Affiliate Link — only visible in Partner Mode */}
        {partnerMode && (
          <TouchableOpacity style={S.affiliateCard} onPress={() => router.push("/affiliate")} activeOpacity={0.85}>
            <Text style={S.affiliateIcon}>🤝</Text>
            <View style={S.affiliateTextBlock}>
              <Text style={S.affiliateTitle}>{t(language, "affiliateTitle")}</Text>
              <Text style={S.affiliateSub}>{t(language, "affiliateSubtitle")}</Text>
            </View>
            <Text style={S.affiliateArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* SP Reference Table */}
        <View style={S.refCard}>
          <Text style={S.refTitle}>{t(language, "spLevelOverview")}</Text>
          <View style={S.vipBanner}>
            <Text style={S.vipBannerText}>⭐ {t(language, "vipInfo")}</Text>
          </View>
          <View style={[S.refItem, { borderBottomColor: "#334155", borderBottomWidth: 1, marginBottom: 4 }]}>
            <Text style={[S.refSp, { color: "#64748b" }]}>SP</Text>
            <Text style={[S.refRange, { color: "#64748b" }]}>Range</Text>
            <Text style={[S.refRate, { color: "#64748b" }]}>{t(language, "baseRate")}</Text>
            <Text style={[S.refVip, { color: "#64748b" }]}>{t(language, "vipRate")}</Text>
          </View>
          {SP_LEVELS.map(item => (
            <View key={item.sp} style={S.refItem}>
              <Text style={S.refSp}>{item.sp}</Text>
              <Text style={S.refRange}>{item.range}</Text>
              <Text style={S.refRate}>{item.base}</Text>
              <Text style={S.refVip}>{item.vip}</Text>
            </View>
          ))}
        </View>

        {/* View Introduction + Settings links */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 24, paddingVertical: 12 }}>
          <TouchableOpacity onPress={() => router.push("/onboarding")}>
            <Text style={S.settingsText}>💎 {t(language, "viewOnboarding") || "View Introduction"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Text style={S.settingsText}>⚙️ {t(language, "settings")}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Explanation Modal */}
      <Modal visible={!!explainCard} transparent animationType="fade" onRequestClose={() => setExplainCard(null)}>
        <View style={S.modalOverlay}>
          <View style={S.modalBox}>
            <Text style={S.modalIcon}>{explainCard?.icon}</Text>
            <Text style={S.modalTitle}>{explainCard ? t(language, explainCard.titleKey) : ''}</Text>
            <Text style={S.modalSubtitle}>{explainCard ? t(language, explainCard.subtitleKey) : ''}</Text>
            <Text style={S.modalDesc}>{explainCard ? t(language, explainCard.titleKey.replace('Title', 'Desc')) : ''}</Text>
            <View style={S.modalRecommendedRow}>
              <Text style={S.modalRecommendedLabel}>{t(language, 'recommended') || 'Recommended Start:'}</Text>
              <Text style={S.modalRecommendedValue}>{explainCard ? t(language, explainCard.titleKey.replace('Title', 'Rec')) : ''}</Text>
            </View>
            <TouchableOpacity style={S.modalClose} onPress={() => setExplainCard(null)}>
              <Text style={S.modalCloseText}>✕ Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={S.modalCalcBtn}
              onPress={() => {
                setExplainCard(null);
                if (explainCard) handleCalculate(explainCard);
              }}
            >
              <Text style={S.modalCalcBtnText}>{t(language, "calculateGoal")} →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <DisclaimerFooter />
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16 },
  langRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 5, marginBottom: 16 },
  langBtn: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#334155" },
  langBtnActive: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  langText: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
  langTextActive: { color: "#0f172a" },
  hero: { alignItems: "center", marginBottom: 20 },
  heroIcon: { fontSize: 44, marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: "bold", color: "#fff", letterSpacing: 1 },
  heroSub: { fontSize: 15, color: "#94a3b8", marginTop: 4, textAlign: "center" },
  heroTagline: { fontSize: 17, fontWeight: "700", color: "#f59e0b", marginTop: 10, textAlign: "center", paddingHorizontal: 16, lineHeight: 24 },

  // Leadership Section
  leaderSection: { marginBottom: 24 },
  leaderHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  leaderSectionTitle: { color: "#f59e0b", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5, marginBottom: 2 },
  leaderSectionSub: { color: "#33C5FF", fontSize: 13, fontWeight: "600", letterSpacing: 1 },
  leaderMoreBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: "#334155" },
  leaderMoreText: { color: "#64748b", fontSize: 12, fontWeight: "600" },
  leaderRow: { flexDirection: "row", gap: 10 },
  leaderCard: { flex: 1, backgroundColor: "#1e293b", borderRadius: 14, padding: 14, borderTopWidth: 2, alignItems: "center" },
  leaderPhoto: { width: 72, height: 86, borderRadius: 10, marginBottom: 10, backgroundColor: "#334155" },
  leaderName: { color: "#fff", fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  leaderBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, marginBottom: 8 },
  leaderBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3, textAlign: "center" },
  leaderBio: { color: "#94a3b8", fontSize: 11, lineHeight: 16, textAlign: "center" },

  // Goal Cards
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: "#f59e0b", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 },
  sectionSub: { color: "#64748b", fontSize: 14, marginTop: 2 },
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  goalCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 14, width: "48%", borderTopWidth: 2, borderTopColor: "#33C5FF" },
  goalIcon: { fontSize: 28, marginBottom: 6 },
  goalTitle: { color: "#fff", fontSize: 15, fontWeight: "bold", marginBottom: 3 },
  goalSubtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 6, lineHeight: 18 },
  goalRecommended: { color: "#f59e0b", fontSize: 13, fontWeight: "600", marginBottom: 10 },
  yearBtn: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 7, borderWidth: 1, borderColor: "#334155", backgroundColor: "#1e293b" },
  yearBtnActive: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  yearBtnText: { color: "#64748b", fontSize: 12, fontWeight: "bold" },
  yearBtnTextActive: { color: "#0f172a" },

  goalPlanBox: { backgroundColor: "rgba(15,23,42,0.9)", borderRadius: 8, padding: 8, marginBottom: 8, borderWidth: 1, borderColor: "#1e3a5f" },
  goalPlanRate: { color: "#64748b", fontSize: 9, fontWeight: "600", letterSpacing: 0.2, marginBottom: 6, textAlign: "center" },
  goalPlanRow: { flexDirection: "row", alignItems: "center" },
  goalPlanLabel: { color: "#475569", fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 },
  goalPlanNow: { color: "#f59e0b", fontSize: 12, fontWeight: "bold" },
  goalPlanAfter: { color: "#22c55e", fontSize: 12, fontWeight: "bold" },
  goalPlanDivider: { width: 1, height: 28, backgroundColor: "#1e3a5f", marginHorizontal: 6 },

  goalButtons: { gap: 6 },
  explainBtn: { backgroundColor: "#33C5FF", borderRadius: 6, paddingVertical: 7, alignItems: "center" },
  explainBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold", letterSpacing: 0.5 },
  calcBtn: { backgroundColor: "#1e3a5f", borderRadius: 6, paddingVertical: 7, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  calcBtnText: { color: "#94a3b8", fontSize: 13, fontWeight: "bold", letterSpacing: 0.5 },

  // Tool Cards
  toolCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 10, borderTopWidth: 3, borderTopColor: "#33C5FF" },
  toolBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  toolBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 12, letterSpacing: 1 },
  toolTitle: { fontSize: 17, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  toolDesc: { fontSize: 15, color: "#94a3b8", lineHeight: 22, marginBottom: 10 },
  toolFeatures: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  featureTag: { backgroundColor: "rgba(14,165,233,0.13)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(14,165,233,0.27)" },
  featureText: { color: "#33C5FF", fontSize: 13, fontWeight: "600" },
  toolArrow: { borderTopWidth: 1, borderTopColor: "rgba(14,165,233,0.2)", paddingTop: 10 },
  toolArrowText: { color: "#33C5FF", fontWeight: "bold", fontSize: 14 },

  // Affiliate Card
  affiliateCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", borderLeftWidth: 3, borderLeftColor: "#22c55e" },
  affiliateIcon: { fontSize: 26, marginRight: 12 },
  affiliateTextBlock: { flex: 1 },
  affiliateTitle: { color: "#22c55e", fontSize: 16, fontWeight: "bold" },
  affiliateSub: { color: "#94a3b8", fontSize: 14, marginTop: 2 },
  affiliateArrow: { color: "#22c55e", fontSize: 18, fontWeight: "bold" },

  // SP Reference
  refCard: { backgroundColor: "#1e293b", borderRadius: 12, padding: 12, marginBottom: 8 },
  refTitle: { color: "#f59e0b", fontSize: 13, fontWeight: "bold", letterSpacing: 0.5, marginBottom: 8 },
  vipBanner: { backgroundColor: "rgba(245,158,11,0.09)", borderRadius: 8, padding: 8, marginBottom: 10, borderWidth: 1, borderColor: "rgba(245,158,11,0.27)" },
  vipBannerText: { color: "#f59e0b", fontSize: 14, fontWeight: "600", textAlign: "center" },
  refItem: { flexDirection: "row", alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#0f172a" },
  refSp: { color: "#f59e0b", fontWeight: "bold", fontSize: 14, width: 44 },
  refRange: { color: "#94a3b8", fontSize: 13, flex: 1 },
  refRate: { color: "#22c55e", fontWeight: "bold", fontSize: 14, width: 52 },
  refVip: { color: "#f59e0b", fontWeight: "bold", fontSize: 14, width: 64, textAlign: "right" },

  settingsLink: { alignItems: "center", paddingVertical: 12 },
  settingsText: { color: "#64748b", fontSize: 15 },

  // Testimonials
  testimonialSection:     { marginBottom: 24 },
  testimonialSectionTitle:{ color: "#f59e0b", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5, marginBottom: 12 },
  testimonialCard:        { width: 276, backgroundColor: "#1e293b", borderRadius: 16, padding: 18, borderTopWidth: 2, borderTopColor: "#f59e0b" },
  testimonialQuoteMark:   { color: "#f59e0b", fontSize: 44, fontWeight: "bold", lineHeight: 44, marginBottom: 2, opacity: 0.55 },
  testimonialQuote:       { color: "#cbd5e1", fontSize: 13, lineHeight: 21, fontStyle: "italic", marginBottom: 16 },
  testimonialDivider:     { height: 1, backgroundColor: "#334155", marginBottom: 14 },
  testimonialMeta:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  testimonialPersonRow:   { flexDirection: "row", alignItems: "center", gap: 9 },
  testimonialAvatar:      { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: "#f59e0b", backgroundColor: "#334155" },
  testimonialName:        { color: "#fff", fontSize: 13, fontWeight: "bold" },
  testimonialCity:        { color: "#64748b", fontSize: 11, marginTop: 2 },
  testimonialBadges:      { alignItems: "flex-end", gap: 4 },
  testimonialSpBadge:     { backgroundColor: "rgba(51,197,255,0.13)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(51,197,255,0.3)" },
  testimonialSpText:      { color: "#33C5FF", fontSize: 10, fontWeight: "bold" },
  testimonialMonthsText:  { color: "#64748b", fontSize: 10 },
  testimonialVipBadge:    { backgroundColor: "rgba(245,158,11,0.13)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(245,158,11,0.3)" },
  testimonialVipText:     { color: "#f59e0b", fontSize: 10, fontWeight: "bold" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalBox: { backgroundColor: "#1e293b", borderRadius: 20, padding: 24, width: "100%", maxWidth: 400 },
  modalIcon: { fontSize: 40, textAlign: "center", marginBottom: 10 },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  modalSubtitle: { color: "#33C5FF", fontSize: 15, textAlign: "center", marginBottom: 12 },
  modalDesc: { color: "#94a3b8", fontSize: 15, lineHeight: 22, marginBottom: 14 },
  modalRecommendedRow: { backgroundColor: "rgba(245,158,11,0.09)", borderRadius: 8, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: "rgba(245,158,11,0.27)" },
  modalRecommendedLabel: { color: "#94a3b8", fontSize: 13, marginBottom: 2 },
  modalRecommendedValue: { color: "#f59e0b", fontSize: 16, fontWeight: "bold" },
  modalClose: { alignItems: "center", paddingVertical: 10, marginBottom: 8 },
  modalCloseText: { color: "#64748b", fontSize: 15 },
  modalCalcBtn: { backgroundColor: "#33C5FF", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  modalCalcBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
