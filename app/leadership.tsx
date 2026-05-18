import React from "react";
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import type { Language } from "@/lib/translations";

const PATRICK_PHOTO = require("../assets/images/patrick-stoeger.jpg");
const MICHAEL_PHOTO = require("../assets/images/michael-lang.jpg");

type LeaderText = {
  sectionTitle: string;
  sectionSub: string;
  patrickTitle: string;
  patrickRole: string;
  patrickBio: string[];
  michaelTitle: string;
  michaelRole: string;
  michaelBio: string[];
};

const TEXT: Record<Language, LeaderText> = {
  en: {
    sectionTitle: "Leadership",
    sectionSub: "The Visionaries Behind STIG International",
    patrickTitle: "Patrick Stoeger",
    patrickRole: "CEO & Co-Founder — STIG International",
    patrickBio: [
      "Patrick Stoeger founded STIG International in 2018, with a single conviction: that every family deserves access to real, certified diamonds as a vehicle for long-term financial security.",
      "Based in Dubai Silicon Oasis, UAE, he has built STIG into a global diamond solution platform operating across more than 180 countries. His leadership drives the company's mission to make wealth preservation through diamonds both accessible and transparent.",
    ],
    michaelTitle: "Michael Lang",
    michaelRole: "COO — Chief Operating Officer",
    michaelBio: [
      "Michael Lang oversees the operational backbone of STIG International — ensuring that every adviser, every client, and every diamond solution meets the standards the company was built on.",
      "With a focus on scalable systems and adviser excellence, Michael ensures that the growth Patrick envisions becomes the reality advisers experience every day.",
    ],
  },
  nl: {
    sectionTitle: "Leiderschap",
    sectionSub: "De Visionairen Achter STIG International",
    patrickTitle: "Patrick Stoeger",
    patrickRole: "CEO & Medeoprichter — STIG International",
    patrickBio: [
      "Patrick Stoeger richtte STIG International op in 2018, met één overtuiging: dat elke familie toegang verdient tot echte, gecertificeerde diamanten als middel voor financiële zekerheid op lange termijn.",
      "Gevestigd in Dubai Silicon Oasis, VAE, heeft hij STIG uitgebouwd tot een wereldwijd diamantoplossingsplatform dat actief is in meer dan 180 landen. Zijn leiderschap drijft de missie van het bedrijf om vermogensbehoud via diamanten toegankelijk en transparant te maken.",
    ],
    michaelTitle: "Michael Lang",
    michaelRole: "COO — Chief Operating Officer",
    michaelBio: [
      "Michael Lang overziet de operationele ruggengraat van STIG International — ervoor zorgen dat elke adviseur, elke klant en elke diamantoplossing voldoet aan de normen waarop het bedrijf is gebouwd.",
      "Met een focus op schaalbare systemen en excellentie voor adviseurs zorgt Michael dat de groei die Patrick voor ogen heeft, de realiteit wordt die adviseurs elke dag ervaren.",
    ],
  },
  de: {
    sectionTitle: "Führung",
    sectionSub: "Die Visionäre hinter STIG International",
    patrickTitle: "Patrick Stoeger",
    patrickRole: "CEO & Mitgründer — STIG International",
    patrickBio: [
      "Patrick Stoeger gründete STIG International im Jahr 2018 mit einer einzigen Überzeugung: dass jede Familie Zugang zu echten, zertifizierten Diamanten als Mittel zur langfristigen finanziellen Sicherheit verdient.",
      "Mit Sitz in Dubai Silicon Oasis, VAE, hat er STIG zu einer globalen Diamant-Lösungsplattform aufgebaut, die in mehr als 180 Ländern tätig ist. Seine Führung treibt die Mission des Unternehmens voran, Vermögenserhalt durch Diamanten zugänglich und transparent zu machen.",
    ],
    michaelTitle: "Michael Lang",
    michaelRole: "COO — Chief Operating Officer",
    michaelBio: [
      "Michael Lang überwacht das operative Rückgrat von STIG International — er stellt sicher, dass jeder Berater, jeder Kunde und jede Diamantlösung die Standards erfüllt, auf denen das Unternehmen aufgebaut wurde.",
      "Mit Fokus auf skalierbare Systeme und Beraterexzellenz stellt Michael sicher, dass das Wachstum, das Patrick anstrebt, zur Realität wird, die Berater täglich erleben.",
    ],
  },
  fr: {
    sectionTitle: "Direction",
    sectionSub: "Les Visionnaires derrière STIG International",
    patrickTitle: "Patrick Stoeger",
    patrickRole: "PDG & Co-Fondateur — STIG International",
    patrickBio: [
      "Patrick Stoeger a fondé STIG International en 2018 avec une seule conviction : que chaque famille mérite d'accéder à de vrais diamants certifiés comme véhicule de sécurité financière à long terme.",
      "Basé à Dubai Silicon Oasis, EAU, il a bâti STIG en une plateforme mondiale de solutions diamant opérant dans plus de 180 pays. Son leadership guide la mission de l'entreprise : rendre la préservation du patrimoine par les diamants à la fois accessible et transparente.",
    ],
    michaelTitle: "Michael Lang",
    michaelRole: "COO — Directeur des Opérations",
    michaelBio: [
      "Michael Lang supervise l'épine dorsale opérationnelle de STIG International — en s'assurant que chaque conseiller, chaque client et chaque solution diamant répond aux standards sur lesquels l'entreprise a été construite.",
      "Avec un focus sur les systèmes évolutifs et l'excellence des conseillers, Michael fait en sorte que la croissance qu'envisage Patrick devienne la réalité que les conseillers vivent chaque jour.",
    ],
  },
  es: {
    sectionTitle: "Liderazgo",
    sectionSub: "Los Visionarios detrás de STIG International",
    patrickTitle: "Patrick Stoeger",
    patrickRole: "CEO y Cofundador — STIG International",
    patrickBio: [
      "Patrick Stoeger fundó STIG International en 2018 con una sola convicción: que toda familia merece acceso a diamantes reales y certificados como vehículo para la seguridad financiera a largo plazo.",
      "Con sede en Dubai Silicon Oasis, EAU, ha convertido STIG en una plataforma global de soluciones de diamantes que opera en más de 180 países. Su liderazgo impulsa la misión de la empresa de hacer que la preservación de la riqueza a través de los diamantes sea accesible y transparente.",
    ],
    michaelTitle: "Michael Lang",
    michaelRole: "COO — Director de Operaciones",
    michaelBio: [
      "Michael Lang supervisa la columna vertebral operativa de STIG International, asegurando que cada asesor, cada cliente y cada solución de diamantes cumpla con los estándares sobre los que se construyó la empresa.",
      "Con un enfoque en sistemas escalables y excelencia para asesores, Michael asegura que el crecimiento que Patrick visualiza se convierta en la realidad que los asesores experimentan cada día.",
    ],
  },
  it: {
    sectionTitle: "Leadership",
    sectionSub: "I Visionari dietro STIG International",
    patrickTitle: "Patrick Stoeger",
    patrickRole: "CEO e Co-Fondatore — STIG International",
    patrickBio: [
      "Patrick Stoeger ha fondato STIG International nel 2018 con una sola convinzione: che ogni famiglia meriti l'accesso a diamanti veri e certificati come strumento per la sicurezza finanziaria a lungo termine.",
      "Con sede a Dubai Silicon Oasis, EAU, ha costruito STIG in una piattaforma globale di soluzioni diamante operante in più di 180 paesi. La sua leadership guida la missione dell'azienda di rendere la conservazione del patrimonio attraverso i diamanti accessibile e trasparente.",
    ],
    michaelTitle: "Michael Lang",
    michaelRole: "COO — Chief Operating Officer",
    michaelBio: [
      "Michael Lang supervisiona la spina dorsale operativa di STIG International, garantendo che ogni consulente, ogni cliente e ogni soluzione diamante rispetti gli standard su cui l'azienda è stata costruita.",
      "Con un focus su sistemi scalabili ed eccellenza dei consulenti, Michael assicura che la crescita immaginata da Patrick diventi la realtà vissuta dai consulenti ogni giorno.",
    ],
  },
  pt: {
    sectionTitle: "Liderança",
    sectionSub: "Os Visionários por trás da STIG International",
    patrickTitle: "Patrick Stoeger",
    patrickRole: "CEO e Co-Fundador — STIG International",
    patrickBio: [
      "Patrick Stoeger fundou a STIG International em 2018 com uma única convicção: que toda família merece acesso a diamantes reais e certificados como veículo para segurança financeira de longo prazo.",
      "Sediado em Dubai Silicon Oasis, EAU, ele construiu a STIG numa plataforma global de soluções em diamantes operando em mais de 180 países. Sua liderança impulsiona a missão da empresa de tornar a preservação de riqueza por meio de diamantes acessível e transparente.",
    ],
    michaelTitle: "Michael Lang",
    michaelRole: "COO — Diretor de Operações",
    michaelBio: [
      "Michael Lang supervisiona a espinha dorsal operacional da STIG International, garantindo que cada assessor, cada cliente e cada solução em diamantes atenda aos padrões sobre os quais a empresa foi construída.",
      "Com foco em sistemas escaláveis e excelência dos assessores, Michael garante que o crescimento que Patrick vislumbra se torne a realidade que os assessores vivenciam todos os dias.",
    ],
  },
  ru: {
    sectionTitle: "Руководство",
    sectionSub: "Визионеры за STIG International",
    patrickTitle: "Патрик Штёгер",
    patrickRole: "Генеральный директор и Сооснователь — STIG International",
    patrickBio: [
      "Патрик Штёгер основал STIG International в 2018 году с единственной убеждённостью: каждая семья заслуживает доступа к настоящим, сертифицированным бриллиантам как инструменту долгосрочной финансовой безопасности.",
      "Базируясь в Dubai Silicon Oasis, ОАЭ, он превратил STIG в глобальную платформу бриллиантовых решений, работающую более чем в 180 странах. Его лидерство продвигает миссию компании — сделать сохранение капитала через бриллианты доступным и прозрачным.",
    ],
    michaelTitle: "Михаэль Ланг",
    michaelRole: "Операционный директор — COO",
    michaelBio: [
      "Михаэль Ланг курирует операционный хребет STIG International, обеспечивая, чтобы каждый консультант, клиент и бриллиантовое решение соответствовали стандартам, заложенным в основу компании.",
      "Сфокусировавшись на масштабируемых системах и профессионализме консультантов, Михаэль гарантирует, что рост, задуманный Патриком, становится реальностью, которую консультанты переживают каждый день.",
    ],
  },
  zh: {
    sectionTitle: "领导团队",
    sectionSub: "STIG International 的远见卓识者",
    patrickTitle: "帕特里克·施托格",
    patrickRole: "CEO 兼联合创始人 — STIG International",
    patrickBio: [
      "帕特里克·施托格于2018年创立STIG International，秉持一个坚定信念：每个家庭都应有机会以真正经过认证的钻石作为实现长期财务安全的工具。",
      "总部位于阿联酋迪拜硅绿洲，他将STIG发展成为一个覆盖180多个国家的全球钻石解决方案平台。他的领导力推动公司使命——让通过钻石实现财富保值既触手可及，又透明可信。",
    ],
    michaelTitle: "迈克尔·朗",
    michaelRole: "COO — 首席运营官",
    michaelBio: [
      "迈克尔·朗负责监管STIG International的运营核心，确保每一位顾问、每一位客户以及每一个钻石解决方案都符合公司建立之初所设定的标准。",
      "凭借对可扩展系统和顾问卓越性的专注，迈克尔确保帕特里克所设想的增长成为顾问每天切实体验的现实。",
    ],
  },
  tl: {
    sectionTitle: "Pamumuno",
    sectionSub: "Ang mga Visionary sa likod ng STIG International",
    patrickTitle: "Patrick Stoeger",
    patrickRole: "CEO at Co-Founder — STIG International",
    patrickBio: [
      "Itinatag ni Patrick Stoeger ang STIG International noong 2018 na may isang paniniwala: na ang bawat pamilya ay may karapatang magkaroon ng access sa tunay at sertipikadong mga diamante bilang sasakyan para sa pangmatagalang seguridad pinansyal.",
      "Nakabase sa Dubai Silicon Oasis, UAE, itinayo niya ang STIG bilang isang pandaigdigang plataporma ng solusyon sa diamante na nag-ooperate sa mahigit 180 bansa. Ang kanyang pamumuno ang nagpapatakbo sa misyon ng kumpanya na gawing accessible at transparent ang pagpapanatili ng kayamanan sa pamamagitan ng mga diamante.",
    ],
    michaelTitle: "Michael Lang",
    michaelRole: "COO — Chief Operating Officer",
    michaelBio: [
      "Pinangangalagaan ni Michael Lang ang operational backbone ng STIG International — tinitiyak na ang bawat advisor, bawat kliyente, at bawat solusyon sa diamante ay nakakatugon sa mga pamantayang itinayo ng kumpanya.",
      "Sa pamamagitan ng pagtuon sa scalable systems at kahusayan ng advisor, tinitiyak ni Michael na ang paglago na inisip ni Patrick ay maging katotohanan na nararanasan ng mga advisor araw-araw.",
    ],
  },
  ar: {
    sectionTitle: "القيادة",
    sectionSub: "أصحاب الرؤية وراء STIG International",
    patrickTitle: "باتريك ستويغر",
    patrickRole: "الرئيس التنفيذي والمؤسس المشارك — STIG International",
    patrickBio: [
      "أسّس باتريك ستويغر شركة STIG International عام 2018، بقناعة واحدة راسخة: أن كل عائلة تستحق الوصول إلى الماس الحقيقي المعتمد كوسيلة لتحقيق الأمن المالي على المدى البعيد.",
      "ومن مقره في واحة دبي للسيليكون بالإمارات العربية المتحدة، حوّل باتريك STIG إلى منصة عالمية لحلول الماس تعمل في أكثر من 180 دولة. وتدفع قيادته مهمة الشركة نحو جعل الحفاظ على الثروة من خلال الماس في متناول الجميع وبشفافية تامة.",
    ],
    michaelTitle: "مايكل لانغ",
    michaelRole: "المدير التشغيلي — COO",
    michaelBio: [
      "يُشرف مايكل لانغ على العمود الفقري التشغيلي لشركة STIG International، ليضمن أن كل مستشار وكل عميل وكل حل ماسي يرقى إلى المعايير التي بُنيت عليها الشركة.",
      "بتركيزه على الأنظمة القابلة للتوسع وتميّز المستشارين، يضمن مايكل أن يتحول النمو الذي يتصوره باتريك إلى واقع يُعيشه المستشارون كل يوم.",
    ],
  },
  th: {
    sectionTitle: "ผู้นำ",
    sectionSub: "ผู้มีวิสัยทัศน์เบื้องหลัง STIG International",
    patrickTitle: "แพทริก สโตเกอร์",
    patrickRole: "ซีอีโอและผู้ร่วมก่อตั้ง — STIG International",
    patrickBio: [
      "แพทริก สโตเกอร์ก่อตั้ง STIG International ในปี 2018 ด้วยความเชื่อมั่นเพียงหนึ่งเดียว: ทุกครอบครัวสมควรได้รับการเข้าถึงเพชรแท้ที่ได้รับการรับรองเพื่อเป็นเครื่องมือในการสร้างความมั่นคงทางการเงินในระยะยาว",
      "ประจำอยู่ที่ Dubai Silicon Oasis สหรัฐอาหรับเอมิเรตส์ เขาได้สร้าง STIG ให้เป็นแพลตฟอร์มโซลูชันเพชรระดับโลกที่ดำเนินงานในกว่า 180 ประเทศ ความเป็นผู้นำของเขาขับเคลื่อนพันธกิจของบริษัทในการทำให้การรักษาความมั่งคั่งผ่านเพชรเป็นสิ่งที่เข้าถึงได้และโปร่งใส",
    ],
    michaelTitle: "ไมเคิล แลง",
    michaelRole: "ซีโอโอ — Chief Operating Officer",
    michaelBio: [
      "ไมเคิล แลงดูแลแกนหลักด้านการดำเนินงานของ STIG International เพื่อให้แน่ใจว่าที่ปรึกษาทุกคน ลูกค้าทุกราย และโซลูชันเพชรทุกชิ้นตรงตามมาตรฐานที่บริษัทได้สร้างขึ้น",
      "ด้วยความมุ่งเน้นในระบบที่ขยายได้และความเป็นเลิศของที่ปรึกษา ไมเคิลรับประกันว่าการเติบโตที่แพทริกจินตนาการไว้กลายเป็นความจริงที่ที่ปรึกษาได้สัมผัสทุกวัน",
    ],
  },
  hi: {
    sectionTitle: "नेतृत्व",
    sectionSub: "STIG International के पीछे के दूरदर्शी",
    patrickTitle: "पैट्रिक स्टोएगर",
    patrickRole: "सीईओ और सह-संस्थापक — STIG International",
    patrickBio: [
      "पैट्रिक स्टोएगर ने 2018 में STIG International की स्थापना एक दृढ़ विश्वास के साथ की: कि हर परिवार को दीर्घकालिक वित्तीय सुरक्षा के लिए वास्तविक, प्रमाणित हीरों तक पहुंच का अधिकार है।",
      "दुबई सिलिकॉन ओएसिस, UAE में स्थित, उन्होंने STIG को 180 से अधिक देशों में काम करने वाले एक वैश्विक हीरा समाधान प्लेटफॉर्म में बदल दिया है। उनका नेतृत्व कंपनी की उस मिशन को आगे बढ़ाता है जो हीरों के माध्यम से धन संरक्षण को सुलभ और पारदर्शी बनाती है।",
    ],
    michaelTitle: "माइकल लैंग",
    michaelRole: "सीओओ — मुख्य परिचालन अधिकारी",
    michaelBio: [
      "माइकल लैंग STIG International की परिचालन रीढ़ की देखरेख करते हैं — यह सुनिश्चित करते हुए कि हर सलाहकार, हर ग्राहक और हर हीरा समाधान उन मानकों को पूरा करे जिन पर कंपनी बनाई गई थी।",
      "स्केलेबल सिस्टम और सलाहकार उत्कृष्टता पर ध्यान देने के साथ, माइकल सुनिश्चित करते हैं कि पैट्रिक जो विकास की कल्पना करते हैं, वह वह वास्तविकता बने जिसे सलाहकार हर दिन अनुभव करते हैं।",
    ],
  },
  vi: {
    sectionTitle: "Lãnh Đạo",
    sectionSub: "Những Nhà Tư Tưởng đằng sau STIG International",
    patrickTitle: "Patrick Stoeger",
    patrickRole: "CEO và Đồng Sáng Lập — STIG International",
    patrickBio: [
      "Patrick Stoeger thành lập STIG International vào năm 2018 với một niềm tin duy nhất: rằng mọi gia đình đều xứng đáng được tiếp cận với kim cương thật, được chứng nhận như một phương tiện bảo đảm tài chính lâu dài.",
      "Có trụ sở tại Dubai Silicon Oasis, UAE, ông đã xây dựng STIG thành nền tảng giải pháp kim cương toàn cầu hoạt động tại hơn 180 quốc gia. Sự lãnh đạo của ông thúc đẩy sứ mệnh của công ty là làm cho việc bảo toàn tài sản thông qua kim cương vừa dễ tiếp cận vừa minh bạch.",
    ],
    michaelTitle: "Michael Lang",
    michaelRole: "COO — Giám đốc Vận hành",
    michaelBio: [
      "Michael Lang giám sát xương sống vận hành của STIG International — đảm bảo rằng mọi cố vấn, mọi khách hàng và mọi giải pháp kim cương đều đáp ứng các tiêu chuẩn mà công ty được xây dựng trên đó.",
      "Với trọng tâm vào các hệ thống có thể mở rộng và sự xuất sắc của cố vấn, Michael đảm bảo rằng sự tăng trưởng mà Patrick hình dung trở thành thực tế mà các cố vấn trải nghiệm mỗi ngày.",
    ],
  },
};

export default function LeadershipScreen() {
  const router = useRouter();
  const { language } = useCalculator();
  const tx = TEXT[language] ?? TEXT.en;

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor="#0f172a">
      <ScrollView style={S.scroll} contentContainerStyle={S.content}>

        {/* Back */}
        <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
          <Text style={S.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>{tx.sectionTitle}</Text>
          <Text style={S.headerSub}>{tx.sectionSub}</Text>
          <View style={S.divider} />
        </View>

        {/* Patrick Stoeger */}
        <View style={[S.leaderCard, { borderTopColor: "#f59e0b" }]}>
          <View style={S.photoRow}>
            <Image source={PATRICK_PHOTO} style={S.photo} />
            <View style={S.nameBlock}>
              <Text style={S.leaderName}>{tx.patrickTitle}</Text>
              <View style={[S.roleBadge, { backgroundColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.3)" }]}>
                <Text style={[S.roleText, { color: "#f59e0b" }]}>{tx.patrickRole}</Text>
              </View>
              <View style={S.locationRow}>
                <Text style={S.locationText}>📍 Dubai Silicon Oasis, UAE</Text>
              </View>
              <View style={S.locationRow}>
                <Text style={S.locationText}>🌍 180+ Countries</Text>
              </View>
            </View>
          </View>
          <View style={S.bioBlock}>
            {tx.patrickBio.map((para, i) => (
              <Text key={i} style={S.bioText}>{para}</Text>
            ))}
          </View>
        </View>

        {/* Michael Lang */}
        <View style={[S.leaderCard, { borderTopColor: "#33C5FF" }]}>
          <View style={S.photoRow}>
            <Image source={MICHAEL_PHOTO} style={S.photo} />
            <View style={S.nameBlock}>
              <Text style={S.leaderName}>{tx.michaelTitle}</Text>
              <View style={[S.roleBadge, { backgroundColor: "rgba(51,197,255,0.12)", borderColor: "rgba(51,197,255,0.3)" }]}>
                <Text style={[S.roleText, { color: "#33C5FF" }]}>{tx.michaelRole}</Text>
              </View>
              <View style={S.locationRow}>
                <Text style={S.locationText}>🏢 STIG International</Text>
              </View>
            </View>
          </View>
          <View style={S.bioBlock}>
            {tx.michaelBio.map((para, i) => (
              <Text key={i} style={S.bioText}>{para}</Text>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer}>
          <Text style={S.footerText}>💎 STIG International</Text>
          <Text style={S.footerSub}>Certified Diamond Solutions · Est. 2018</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20 },
  backBtn: { marginBottom: 16 },
  backText: { color: "#64748b", fontSize: 15 },

  header: { alignItems: "center", marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", letterSpacing: 1 },
  headerSub: { fontSize: 14, color: "#94a3b8", marginTop: 6, textAlign: "center" },
  divider: { width: 48, height: 3, backgroundColor: "#f59e0b", borderRadius: 2, marginTop: 14 },

  leaderCard: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderTopWidth: 3,
    ...(Platform.OS === "web" ? { boxShadow: "0 4px 20px rgba(0,0,0,0.3)" } : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    }),
  },
  photoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  photo: {
    width: 100,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#334155",
  },
  nameBlock: { flex: 1, paddingTop: 4 },
  leaderName: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  roleBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, marginBottom: 10, alignSelf: "flex-start" },
  roleText: { fontSize: 12, fontWeight: "700", lineHeight: 16 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  locationText: { color: "#64748b", fontSize: 13 },

  bioBlock: { gap: 10 },
  bioText: { color: "#cbd5e1", fontSize: 14, lineHeight: 22 },

  footer: { alignItems: "center", paddingVertical: 16 },
  footerText: { color: "#f59e0b", fontSize: 16, fontWeight: "bold", letterSpacing: 1 },
  footerSub: { color: "#475569", fontSize: 13, marginTop: 4 },
});
