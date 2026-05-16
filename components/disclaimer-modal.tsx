import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCalculator } from "@/lib/calculator-context";

const STORAGE_KEY = "disclaimer_accepted_v1";

const DISCLAIMER: Record<string, { title: string; body: string[]; btn: string }> = {
  en: {
    title: "Important Disclaimer",
    body: [
      "The projections, calculations, and strategies shown in this app are for illustrative purposes only and do not constitute financial advice.",
      "• Past performance does not guarantee future results.",
      "• Diamond contract yields are variable and not guaranteed.",
      "• All projections assume consistent monthly rebates which may vary.",
      "• This tool helps advisers illustrate potential scenarios — it does not promise specific investment returns.",
      "By continuing, you confirm that you understand these projections are estimates only and that you will use this tool responsibly as a planning aid.",
    ],
    btn: "I Understand & Accept",
  },
  nl: {
    title: "Belangrijke Disclaimer",
    body: [
      "De prognoses, berekeningen en strategieën in deze app zijn uitsluitend bedoeld ter illustratie en vormen geen financieel advies.",
      "• In het verleden behaalde resultaten bieden geen garantie voor de toekomst.",
      "• Diamantcontractopbrengsten zijn variabel en niet gegarandeerd.",
      "• Alle prognoses gaan uit van consistente maandelijkse kortingen die kunnen variëren.",
      "• Dit instrument helpt adviseurs mogelijke scenario's te illustreren — het garandeert geen specifiek beleggingsrendement.",
      "Door verder te gaan, bevestigt u dat u begrijpt dat deze prognoses slechts schattingen zijn en dat u dit instrument verantwoord gebruikt als planningshulpmiddel.",
    ],
    btn: "Ik Begrijp & Accepteer",
  },
  de: {
    title: "Wichtiger Haftungsausschluss",
    body: [
      "Die in dieser App dargestellten Prognosen, Berechnungen und Strategien dienen ausschließlich der Veranschaulichung und stellen keine Finanzberatung dar.",
      "• Vergangene Ergebnisse sind keine Garantie für zukünftige Ergebnisse.",
      "• Diamantvertragserträge sind variabel und nicht garantiert.",
      "• Alle Prognosen setzen konsistente monatliche Vergütungen voraus, die variieren können.",
      "• Dieses Tool hilft Beratern, mögliche Szenarien darzustellen — es verspricht keine bestimmten Anlageerträge.",
      "Durch Fortfahren bestätigen Sie, dass Sie verstehen, dass diese Prognosen nur Schätzungen sind, und dass Sie dieses Tool verantwortungsbewusst als Planungshilfe verwenden.",
    ],
    btn: "Ich Verstehe & Akzeptiere",
  },
  fr: {
    title: "Avertissement Important",
    body: [
      "Les projections, calculs et stratégies présentés dans cette application sont fournis à titre indicatif uniquement et ne constituent pas un conseil financier.",
      "• Les performances passées ne garantissent pas les résultats futurs.",
      "• Les rendements des contrats Diamant sont variables et non garantis.",
      "• Toutes les projections supposent des remises mensuelles constantes, qui peuvent varier.",
      "• Cet outil aide les conseillers à illustrer des scénarios potentiels — il ne promet pas de rendements d'investissement spécifiques.",
      "En continuant, vous confirmez que vous comprenez que ces projections ne sont que des estimations et que vous utiliserez cet outil de manière responsable comme aide à la planification.",
    ],
    btn: "Je Comprends & J'accepte",
  },
  es: {
    title: "Aviso Legal Importante",
    body: [
      "Las proyecciones, cálculos y estrategias que se muestran en esta aplicación son solo ilustrativos y no constituyen asesoramiento financiero.",
      "• El rendimiento pasado no garantiza resultados futuros.",
      "• Los rendimientos de los contratos de Diamante son variables y no están garantizados.",
      "• Todas las proyecciones suponen descuentos mensuales consistentes que pueden variar.",
      "• Esta herramienta ayuda a los asesores a ilustrar escenarios potenciales — no promete retornos de inversión específicos.",
      "Al continuar, confirma que entiende que estas proyecciones son solo estimaciones y que usará esta herramienta de manera responsable como ayuda de planificación.",
    ],
    btn: "Entiendo & Acepto",
  },
  ru: {
    title: "Важный Отказ от Ответственности",
    body: [
      "Прогнозы, расчёты и стратегии, представленные в этом приложении, носят исключительно иллюстративный характер и не являются финансовой консультацией.",
      "• Прошлые результаты не гарантируют будущих результатов.",
      "• Доходность по алмазным контрактам является переменной и не гарантируется.",
      "• Все прогнозы предполагают стабильные ежемесячные скидки, которые могут меняться.",
      "• Этот инструмент помогает консультантам иллюстрировать потенциальные сценарии — он не гарантирует конкретной доходности инвестиций.",
      "Продолжая, вы подтверждаете, что понимаете: данные прогнозы являются лишь оценками, и вы будете использовать этот инструмент ответственно как вспомогательное средство планирования.",
    ],
    btn: "Я Понимаю & Принимаю",
  },
  zh: {
    title: "重要免责声明",
    body: [
      "本应用程序中显示的预测、计算和策略仅供说明之用，不构成财务建议。",
      "• 过去的业绩不能保证未来的结果。",
      "• 钻石合约收益率是可变的，无法保证。",
      "• 所有预测均假设每月回扣保持一致，实际情况可能有所不同。",
      "• 本工具帮助顾问说明潜在场景——并不承诺特定的投资回报。",
      "继续使用即表示您确认了解这些预测仅为估算，并将负责任地将本工具用作规划辅助工具。",
    ],
    btn: "我理解并接受",
  },
};

export function DisclaimerModal() {
  const { language } = useCalculator();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val !== "true") setVisible(true);
    });
  }, []);

  const accept = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const tx = DISCLAIMER[language] ?? DISCLAIMER.en;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={S.overlay}>
        <View style={S.card}>
          <Text style={S.logo}>💎</Text>
          <Text style={S.title}>⚠️  {tx.title}</Text>
          <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
            {tx.body.map((line, i) => (
              <Text key={i} style={[S.body, line.startsWith("•") && S.bullet]}>
                {line}
              </Text>
            ))}
          </ScrollView>
          <TouchableOpacity style={S.btn} onPress={accept} activeOpacity={0.85}>
            <Text style={S.btnText}>{tx.btn}</Text>
          </TouchableOpacity>
          <Text style={S.version}>Plan B Diamond · Adviser Pro</Text>
        </View>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 480,
    borderWidth: 1,
    borderColor: "#e67e22",
    ...Platform.select({
      ios: { shadowColor: "#e67e22", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 12 },
    }),
  },
  logo: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    color: "#f59e0b",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  scroll: {
    maxHeight: 320,
    marginBottom: 20,
  },
  body: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  bullet: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 19,
    paddingLeft: 4,
  },
  btn: {
    backgroundColor: "#e67e22",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  version: {
    color: "#334155",
    fontSize: 10,
    textAlign: "center",
  },
});
