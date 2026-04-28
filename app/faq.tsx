import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { t } from "@/lib/translations";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FaqItem = { q: string; a: string };

function getFaqItems(lang: string): FaqItem[] {
  const data: Record<string, FaqItem[]> = {
    en: [
      {
        q: "What exactly is Plan B?",
        a: "Plan B is a structured program that allows you to own physical GIA-certified diamonds while receiving monthly rebates (cash flow). It is designed as a stable, tangible asset that works alongside your real estate and other investments — not instead of them.",
      },
      {
        q: "How do the monthly rebates work?",
        a: "You choose a Solution Plan (SP1 to SP7) based on your deposit amount. Every month you receive a rebate between 2.2% and 6.3% (with VIP).\n\nExample: A $10,000 deposit at SP4 + VIP gives you approximately $600 per month for 12 months. Rebates are paid while you own the diamonds.",
      },
      {
        q: "What is the 100% Buyback Guarantee?",
        a: "After exactly 12 months, you have the contractual right to sell the diamonds back to the company for 100% of your original deposit. You get your full capital returned — no matter what happens to diamond prices.",
      },
      {
        q: "Are the diamonds real and physical?",
        a: "Yes. Every diamond is:\n• Certified by GIA (Gemological Institute of America)\n• Conflict-free (Kimberley Process)\n• Sourced through direct mining contracts\n\nYou can choose home delivery or secure storage in Dubai Freezone.",
      },
      {
        q: "How does inheritance work?",
        a: "The diamonds are your legal property through the Ownership Contract. You can pass them on to your next of kin. The ownership and all rights transfer automatically according to your will or local inheritance laws.",
      },
      {
        q: "Is this affected by stock markets, crypto, or forex?",
        a: "No. This is a physical commodity (diamonds). Its value and your rebates are not linked to financial markets, interest rates, or geopolitical events.",
      },
      {
        q: "What about taxes and VAT?",
        a: "While stored in Dubai Freezone: 0% VAT and tax-efficient.\n\nIf delivered to Europe: Local import VAT may apply (e.g. 21% in Netherlands, 19% in Germany).\n\nMost clients keep the diamonds in Dubai storage during the 12-month period for maximum efficiency.",
      },
      {
        q: "Can I start small and grow?",
        a: "Yes. You can begin with as little as $100 (SP1). Every rebate above $100 can start a new 12-month cycle, allowing compounding.",
      },
      {
        q: "Who is this suitable for?",
        a: "People who already own real estate or have savings and want:\n• Monthly cash flow\n• Capital protection\n• A physical legacy asset\n• Diversification outside traditional markets",
      },
      {
        q: "Is this financial advice?",
        a: "No. This app is a mathematical simulation and calculation tool only. It is not financial advice. Always consult a licensed financial advisor and review all legal documents before making any investment.",
      },
      {
        q: "What happens after 11 months?",
        a: "In the 11th month of your 12-month cycle, you must inform Diamond Solution of your decision:\n\nOption 1 – Home Delivery: Request physical delivery of your GIA-certified diamonds to your address. A shipment fee + full insurance will apply (exact amount depends on your country).\n\nOption 2 – 100% Buyback: Sell the diamonds back and receive 100% of your original deposit returned.\n\nAfter the buyback, you can withdraw the full amount or immediately start a new 12-month cycle with the returned capital.",
      },
      {
        q: "How can I deposit or withdraw money?",
        a: "We accept the following payment methods:\n• Bank Transfer (IBAN)\n• Credit / Debit Card\n• Crypto (USDT or BTC)\n\nA small processing fee applies to all transactions (deposits and withdrawals). Exact fees are shown during the transaction process.",
      },
      {
        q: "What is the minimum and maximum investment?",
        a: "The minimum investment is $100 (SP1). There is no official maximum — the highest standard tier is SP7 at $50,000+. Many clients start with SP4 ($5,000–$10,000) for the optimal balance of rebate rate and flexibility.\n\nYou can also run multiple Solution Plans simultaneously to scale your total position.",
      },
      {
        q: "What is Diamond Solution and where is it based?",
        a: "Diamond Solution is a physical diamond trading and ownership company registered in multiple jurisdictions:\n\n• Dubai, UAE — DMCC License No. 1007195 (Dubai Multi Commodities Centre)\n• Philippines — SEC Registration No. 2026030241228-02\n• SIRA Certified (Security Industry Regulatory Agency, Dubai)\n\nOperations are based in Dubai Freezone, with offices in Vienna, Manila, and Florida.",
      },
      {
        q: "How do I track my diamonds and rebates?",
        a: "All your diamonds, rebates, and contract details are accessible through the Diamond Solution client portal at diamond-solution.net.\n\nYou can log in at any time to view:\n• Your current diamond holdings and GIA certificate numbers\n• Monthly rebate history and upcoming payments\n• Your contract start date and 12-month end date\n• VIP status and compound pot balance",
      },
      {
        q: "Can I have multiple Solution Plans at the same time?",
        a: "Yes. You can run multiple Solution Plans simultaneously. Each plan runs its own independent 12-month cycle with its own rebate rate, VIP status, and buyback date.\n\nThis is a common strategy for clients who want to:\n• Stagger their buyback dates (e.g. one plan per quarter)\n• Diversify across different SP tiers\n• Reinvest rebates into new plans as they accumulate",
      },
      {
        q: "What happens if I want to exit before 12 months?",
        a: "The 100% Buyback Guarantee applies after the full 12-month period. Early exit before 12 months is possible but may result in a partial buyback at a reduced rate, depending on the terms of your specific contract.\n\nFor this reason, it is strongly recommended to only invest capital you do not need access to for at least 12 months. Always review your Ownership Contract for the exact early exit conditions.",
      },
      {
        q: "Is my investment insured or protected?",
        a: "Your investment is protected in several ways:\n\n• 100% Buyback Guarantee — contractual obligation to repurchase at full value after 12 months\n• Physical asset — you own real, tangible GIA-certified diamonds, not a financial product\n• Dubai Freezone storage — secure, insured vault storage in one of the world's most regulated free trade zones\n• Legal ownership — the Ownership Contract makes the diamonds your legal property\n\nNote: This is not a bank deposit and is not covered by government deposit insurance schemes.",
      },
      {
        q: "What is the VIP3 Bonus and how does it work?",
        a: "The VIP3 Bonus is an additional reward available to clients who hold a VIP plan at the SP3 level ($2,000–$5,000) or higher.\n\nHow it works:\n• You must have an active VIP subscription ($1,000/year)\n• Your capital must be at SP3 or above\n• The VIP3 Bonus adds an extra monthly credit on top of your standard VIP rebate\n\nBenefits of VIP3:\n• Higher effective monthly yield\n• Faster capital compounding\n• Priority access to new Diamond Solution programs\n\nThe VIP3 Bonus is automatically applied in the calculator when you enable VIP at SP3+ levels. You can see the exact monthly impact in the Scenario Tool by enabling VIP and setting your deposit to $2,000 or more.",
      },
    ],
    nl: [
      {
        q: "Wat is Plan B precies?",
        a: "Plan B is een gestructureerd programma waarmee u fysieke GIA-gecertificeerde diamanten kunt bezitten terwijl u maandelijkse kortingen (cashflow) ontvangt. Het is ontworpen als een stabiel, tastbaar bezit dat naast uw vastgoed en andere investeringen werkt — niet in plaats daarvan.",
      },
      {
        q: "Hoe werken de maandelijkse kortingen?",
        a: "U kiest een Oplossingsplan (SP1 t/m SP7) op basis van uw stortingsbedrag. Elke maand ontvangt u een korting tussen 2,2% en 6,3% (met VIP).\n\nVoorbeeld: Een storting van $10.000 bij SP4 + VIP geeft u ongeveer $600 per maand gedurende 12 maanden.",
      },
      {
        q: "Wat is de 100% Terugkoopgarantie?",
        a: "Na precies 12 maanden heeft u het contractuele recht om de diamanten terug te verkopen aan het bedrijf voor 100% van uw oorspronkelijke storting. U krijgt uw volledige kapitaal terug — ongeacht wat er met de diamantprijzen gebeurt.",
      },
      {
        q: "Zijn de diamanten echt en fysiek?",
        a: "Ja. Elke diamant is:\n• Gecertificeerd door GIA (Gemological Institute of America)\n• Conflictvrij (Kimberley Proces)\n• Ingekocht via directe mijncontracten\n\nU kunt kiezen voor thuisbezorging of veilige opslag in Dubai Vrijzone.",
      },
      {
        q: "Hoe werkt erfenis?",
        a: "De diamanten zijn uw wettelijk eigendom via het Eigendomscontract. U kunt ze doorgeven aan uw naaste familie. Het eigendom en alle rechten worden automatisch overgedragen volgens uw testament of lokale erfrecht.",
      },
      {
        q: "Wordt dit beïnvloed door aandelenmarkten, crypto of forex?",
        a: "Nee. Dit is een fysieke grondstof (diamanten). De waarde en uw kortingen zijn niet gekoppeld aan financiële markten, rentetarieven of geopolitieke gebeurtenissen.",
      },
      {
        q: "Hoe zit het met belastingen en btw?",
        a: "Opgeslagen in Dubai Vrijzone: 0% btw en fiscaal efficiënt.\n\nBij levering in Europa: Lokale invoer-btw kan van toepassing zijn (bijv. 21% in Nederland, 19% in Duitsland).\n\nDe meeste klanten bewaren de diamanten in Dubai-opslag gedurende de 12-maandsperiode.",
      },
      {
        q: "Kan ik klein beginnen en groeien?",
        a: "Ja. U kunt beginnen met slechts $100 (SP1). Elke korting boven $100 kan een nieuwe 12-maandscyclus starten, waardoor samengestelde groei mogelijk is.",
      },
      {
        q: "Voor wie is dit geschikt?",
        a: "Mensen die al vastgoed bezitten of spaargeld hebben en willen:\n• Maandelijkse cashflow\n• Kapitaalbescherming\n• Een fysiek erfgoedbezit\n• Diversificatie buiten traditionele markten",
      },
      {
        q: "Is dit financieel advies?",
        a: "Nee. Deze app is uitsluitend een wiskundig simulatie- en rekenhulpmiddel. Het is geen financieel advies. Raadpleeg altijd een erkend financieel adviseur en bekijk alle juridische documenten voordat u een investering doet.",
      },
      {
        q: "Wat gebeurt er na 11 maanden?",
        a: "In de 11e maand van uw 12-maandscyclus moet u Diamond Solution informeren over uw beslissing:\n\nOptie 1 – Thuisbezorging: Vraag fysieke levering van uw GIA-gecertificeerde diamanten aan uw adres. Een verzendkosten + volledige verzekering zijn van toepassing (exact bedrag afhankelijk van uw land).\n\nOptie 2 – 100% Terugkoop: Verkoop de diamanten terug en ontvang 100% van uw oorspronkelijke storting terug.\n\nNa de terugkoop kunt u het volledige bedrag opnemen of direct een nieuwe 12-maandscyclus starten.",
      },
      {
        q: "Hoe kan ik geld storten of opnemen?",
        a: "Wij accepteren de volgende betaalmethoden:\n• Bankoverschrijving (IBAN)\n• Credit- / Debetkaart\n• Crypto (USDT of BTC)\n\nEen kleine verwerkingsvergoeding is van toepassing op alle transacties. Exacte kosten worden getoond tijdens het transactieproces.",
      },
      {
        q: "Wat is de minimale en maximale investering?",
        a: "De minimale investering is $100 (SP1). Er is geen officieel maximum — de hoogste standaardtier is SP7 bij $50.000+. Veel klanten beginnen met SP4 ($5.000–$10.000) voor de optimale balans tussen kortingspercentage en flexibiliteit.\n\nU kunt ook meerdere Oplossingsplannen tegelijkertijd uitvoeren om uw totale positie te schalen.",
      },
      {
        q: "Wat is Diamond Solution en waar is het gevestigd?",
        a: "Diamond Solution is een bedrijf voor fysieke diamanthandel en -eigendom, geregistreerd in meerdere rechtsgebieden:\n\n• Dubai, VAE — DMCC Licentie Nr. 1007195\n• Filipijnen — SEC Registratie Nr. 2026030241228-02\n• SIRA Gecertificeerd (Security Industry Regulatory Agency, Dubai)\n\nOperaties zijn gebaseerd in Dubai Vrijzone, met kantoren in Wenen, Manilla en Florida.",
      },
      {
        q: "Hoe volg ik mijn diamanten en kortingen?",
        a: "Al uw diamanten, kortingen en contractdetails zijn toegankelijk via het Diamond Solution klantenportaal op diamond-solution.net.\n\nU kunt op elk moment inloggen om te bekijken:\n• Uw huidige diamantbezit en GIA-certificaatnummers\n• Maandelijkse kortingsgeschiedenis en aankomende betalingen\n• Uw contractstartdatum en 12-maands einddatum\n• VIP-status en samengesteld pot-saldo",
      },
      {
        q: "Kan ik meerdere Oplossingsplannen tegelijkertijd hebben?",
        a: "Ja. U kunt meerdere Oplossingsplannen tegelijkertijd uitvoeren. Elk plan heeft zijn eigen onafhankelijke 12-maandscyclus met eigen kortingspercentage, VIP-status en terugkoopdatum.\n\nDit is een veelgebruikte strategie voor klanten die:\n• Hun terugkoopdatums willen spreiden (bijv. één plan per kwartaal)\n• Willen diversifiëren over verschillende SP-niveaus\n• Kortingen willen herinvesteren in nieuwe plannen",
      },
      {
        q: "Wat gebeurt er als ik eerder dan 12 maanden wil uitstappen?",
        a: "De 100% Terugkoopgarantie geldt na de volledige 12-maandsperiode. Vroeg uitstappen vóór 12 maanden is mogelijk maar kan resulteren in een gedeeltelijke terugkoop tegen een verlaagd tarief, afhankelijk van de voorwaarden van uw specifieke contract.\n\nOm deze reden wordt het sterk aanbevolen alleen kapitaal te investeren waartoe u gedurende minimaal 12 maanden geen toegang nodig heeft.",
      },
      {
        q: "Is mijn investering verzekerd of beschermd?",
        a: "Uw investering is op meerdere manieren beschermd:\n\n• 100% Terugkoopgarantie — contractuele verplichting om tegen volledige waarde terug te kopen na 12 maanden\n• Fysiek bezit — u bezit echte, tastbare GIA-gecertificeerde diamanten, geen financieel product\n• Dubai Vrijzone opslag — veilige, verzekerde kluisopslag\n• Juridisch eigendom — het Eigendomscontract maakt de diamanten uw wettelijk eigendom\n\nNoot: Dit is geen bankdeposito en valt niet onder overheidsgarantieregelingen.",
      },
      {
        q: "Wat is de VIP3 Bonus en hoe werkt het?",
        a: "De VIP3 Bonus is een extra beloning voor klanten met een VIP-plan op SP3-niveau ($2.000–$5.000) of hoger.\n\nHoe het werkt:\n• U moet een actief VIP-abonnement hebben ($1.000/jaar)\n• Uw kapitaal moet op SP3 of hoger zijn\n• De VIP3 Bonus voegt een extra maandelijks tegoed toe bovenop uw standaard VIP-korting\n\nVoordelen van VIP3:\n• Hogere effectieve maandelijkse opbrengst\n• Snellere kapitaalgroei door samengestelde rente\n• Prioriteitstoegang tot nieuwe Diamond Solution-programma's\n\nDe VIP3 Bonus wordt automatisch toegepast in de calculator wanneer u VIP inschakelt op SP3+ niveaus.",
      },
    ],
    de: [
      {
        q: "Was genau ist Plan B?",
        a: "Plan B ist ein strukturiertes Programm, das es Ihnen ermöglicht, physische GIA-zertifizierte Diamanten zu besitzen und gleichzeitig monatliche Rückvergütungen (Cashflow) zu erhalten. Es ist als stabiles, greifbares Vermögen konzipiert, das neben Ihren Immobilien und anderen Investitionen funktioniert — nicht statt ihnen.",
      },
      {
        q: "Wie funktionieren die monatlichen Rückvergütungen?",
        a: "Sie wählen einen Lösungsplan (SP1 bis SP7) basierend auf Ihrem Einzahlungsbetrag. Jeden Monat erhalten Sie eine Rückvergütung zwischen 2,2% und 6,3% (mit VIP).\n\nBeispiel: Eine Einzahlung von $10.000 bei SP4 + VIP gibt Ihnen etwa $600 pro Monat für 12 Monate.",
      },
      {
        q: "Was ist die 100% Rückkaufgarantie?",
        a: "Nach genau 12 Monaten haben Sie das vertragliche Recht, die Diamanten für 100% Ihrer ursprünglichen Einzahlung an das Unternehmen zurückzuverkaufen. Sie erhalten Ihr gesamtes Kapital zurück — egal was mit den Diamantpreisen passiert.",
      },
      {
        q: "Sind die Diamanten echt und physisch?",
        a: "Ja. Jeder Diamant ist:\n• Zertifiziert von GIA (Gemological Institute of America)\n• Konfliktfrei (Kimberley-Prozess)\n• Über direkte Bergbauverträge bezogen\n\nSie können zwischen Hauslieferung oder sicherer Lagerung in der Dubai Freizone wählen.",
      },
      {
        q: "Wie funktioniert die Vererbung?",
        a: "Die Diamanten sind Ihr rechtliches Eigentum durch den Eigentumsvertrag. Sie können sie an Ihre nächsten Angehörigen weitergeben. Das Eigentum und alle Rechte werden automatisch gemäß Ihrem Testament oder lokalem Erbrecht übertragen.",
      },
      {
        q: "Wird dies von Aktienmärkten, Krypto oder Forex beeinflusst?",
        a: "Nein. Dies ist eine physische Ware (Diamanten). Ihr Wert und Ihre Rückvergütungen sind nicht mit Finanzmärkten, Zinssätzen oder geopolitischen Ereignissen verknüpft.",
      },
      {
        q: "Was ist mit Steuern und Mehrwertsteuer?",
        a: "Bei Lagerung in der Dubai Freizone: 0% MwSt. und steuereffizient.\n\nBei Lieferung nach Europa: Lokale Einfuhr-MwSt. kann anfallen (z.B. 21% in den Niederlanden, 19% in Deutschland).\n\nDie meisten Kunden lagern die Diamanten während der 12-monatigen Laufzeit in Dubai.",
      },
      {
        q: "Kann ich klein anfangen und wachsen?",
        a: "Ja. Sie können mit nur $100 (SP1) beginnen. Jede Rückvergütung über $100 kann einen neuen 12-Monats-Zyklus starten und ermöglicht so Zinseszinseffekte.",
      },
      {
        q: "Für wen ist das geeignet?",
        a: "Menschen, die bereits Immobilien besitzen oder Ersparnisse haben und möchten:\n• Monatlichen Cashflow\n• Kapitalschutz\n• Ein physisches Erbschaftsvermögen\n• Diversifikation außerhalb traditioneller Märkte",
      },
      {
        q: "Ist das eine Finanzberatung?",
        a: "Nein. Diese App ist ausschließlich ein mathematisches Simulations- und Berechnungswerkzeug. Es ist keine Finanzberatung. Konsultieren Sie immer einen zugelassenen Finanzberater und prüfen Sie alle rechtlichen Dokumente, bevor Sie eine Investition tätigen.",
      },
      {
        q: "Was passiert nach 11 Monaten?",
        a: "Im 11. Monat Ihres 12-Monats-Zyklus müssen Sie Diamond Solution über Ihre Entscheidung informieren:\n\nOption 1 – Hauslieferung: Beantragen Sie die physische Lieferung Ihrer GIA-zertifizierten Diamanten an Ihre Adresse. Versandkosten + Vollversicherung fallen an (genaue Höhe abhängig von Ihrem Land).\n\nOption 2 – 100% Rückkauf: Verkaufen Sie die Diamanten zurück und erhalten Sie 100% Ihrer ursprünglichen Einzahlung zurück.\n\nNach dem Rückkauf können Sie den Gesamtbetrag abheben oder sofort einen neuen 12-Monats-Zyklus starten.",
      },
      {
        q: "Wie kann ich Geld einzahlen oder abheben?",
        a: "Wir akzeptieren folgende Zahlungsmethoden:\n• Banküberweisung (IBAN)\n• Kredit- / Debitkarte\n• Krypto (USDT oder BTC)\n\nEine kleine Bearbeitungsgebühr gilt für alle Transaktionen. Genaue Gebühren werden während des Transaktionsprozesses angezeigt.",
      },
      {
        q: "Was ist die Mindest- und Höchstinvestition?",
        a: "Die Mindestinvestition beträgt $100 (SP1). Es gibt kein offizielles Maximum — die höchste Standardstufe ist SP7 bei $50.000+. Viele Kunden beginnen mit SP4 ($5.000–$10.000) für die optimale Balance aus Rückvergütungsrate und Flexibilität.\n\nSie können auch mehrere Lösungspläne gleichzeitig ausführen, um Ihre Gesamtposition zu skalieren.",
      },
      {
        q: "Was ist Diamond Solution und wo ist es ansässig?",
        a: "Diamond Solution ist ein Unternehmen für physischen Diamantenhandel und -eigentum, das in mehreren Rechtsgebieten registriert ist:\n\n• Dubai, VAE — DMCC-Lizenz Nr. 1007195\n• Philippinen — SEC-Registrierung Nr. 2026030241228-02\n• SIRA-zertifiziert (Security Industry Regulatory Agency, Dubai)\n\nDer Betrieb basiert in der Dubai Freizone, mit Büros in Wien, Manila und Florida.",
      },
      {
        q: "Wie verfolge ich meine Diamanten und Rückvergütungen?",
        a: "Alle Ihre Diamanten, Rückvergütungen und Vertragsdetails sind über das Diamond Solution Kundenportal unter diamond-solution.net zugänglich.\n\nSie können sich jederzeit anmelden, um Folgendes einzusehen:\n• Ihren aktuellen Diamantenbestand und GIA-Zertifikatsnummern\n• Monatliche Rückvergütungshistorie und bevorstehende Zahlungen\n• Ihr Vertragsstartdatum und 12-Monats-Enddatum\n• VIP-Status und Zinseszins-Topf-Saldo",
      },
      {
        q: "Kann ich mehrere Lösungspläne gleichzeitig haben?",
        a: "Ja. Sie können mehrere Lösungspläne gleichzeitig ausführen. Jeder Plan läuft in seinem eigenen unabhängigen 12-Monats-Zyklus mit eigener Rückvergütungsrate, VIP-Status und Rückkaufdatum.\n\nDies ist eine häufige Strategie für Kunden, die:\n• Ihre Rückkaufdaten staffeln möchten (z.B. ein Plan pro Quartal)\n• Über verschiedene SP-Stufen diversifizieren möchten\n• Rückvergütungen in neue Pläne reinvestieren möchten",
      },
      {
        q: "Was passiert, wenn ich vor 12 Monaten aussteigen möchte?",
        a: "Die 100% Rückkaufgarantie gilt nach der vollen 12-monatigen Laufzeit. Ein vorzeitiger Ausstieg vor 12 Monaten ist möglich, kann aber zu einem Teilrückkauf zu einem reduzierten Satz führen, abhängig von den Bedingungen Ihres spezifischen Vertrags.\n\nAus diesem Grund wird dringend empfohlen, nur Kapital zu investieren, auf das Sie mindestens 12 Monate lang keinen Zugriff benötigen.",
      },
      {
        q: "Ist meine Investition versichert oder geschützt?",
        a: "Ihre Investition ist auf mehrere Arten geschützt:\n\n• 100% Rückkaufgarantie — vertragliche Verpflichtung zum Rückkauf zum vollen Wert nach 12 Monaten\n• Physisches Vermögen — Sie besitzen echte, greifbare GIA-zertifizierte Diamanten, kein Finanzprodukt\n• Dubai Freizone Lagerung — sichere, versicherte Tresorspeicherung\n• Rechtliches Eigentum — der Eigentumsvertrag macht die Diamanten zu Ihrem rechtlichen Eigentum\n\nHinweis: Dies ist keine Bankeinlage und wird nicht durch staatliche Einlagensicherungssysteme abgedeckt.",
      },
      {
        q: "Was ist der VIP3-Bonus und wie funktioniert er?",
        a: "Der VIP3-Bonus ist eine zusätzliche Belohnung für Kunden mit einem VIP-Plan auf SP3-Ebene ($2.000–$5.000) oder höher.\n\nFunktionsweise:\n• Sie müssen ein aktives VIP-Abonnement haben ($1.000/Jahr)\n• Ihr Kapital muss auf SP3 oder höher sein\n• Der VIP3-Bonus fügt eine zusätzliche monatliche Gutschrift über Ihre Standard-VIP-Rückvergütung hinaus hinzu\n\nVorteile von VIP3:\n• Höhere effektive monatliche Rendite\n• Schnelleres Kapitalwachstum durch Zinseszins\n• Prioritätszugang zu neuen Diamond Solution-Programmen\n\nDer VIP3-Bonus wird im Rechner automatisch angewendet, wenn Sie VIP auf SP3+-Ebenen aktivieren.",
      },
    ],
    fr: [
      {
        q: "Qu'est-ce que Plan B exactement?",
        a: "Plan B est un programme structuré qui vous permet de posséder des diamants physiques certifiés GIA tout en recevant des remises mensuelles (flux de trésorerie). Il est conçu comme un actif stable et tangible qui fonctionne aux côtés de vos biens immobiliers et autres investissements — pas à leur place.",
      },
      {
        q: "Comment fonctionnent les remises mensuelles?",
        a: "Vous choisissez un Plan de Solution (SP1 à SP7) en fonction de votre montant de dépôt. Chaque mois vous recevez une remise entre 2,2% et 6,3% (avec VIP).\n\nExemple: Un dépôt de $10 000 à SP4 + VIP vous donne environ $600 par mois pendant 12 mois.",
      },
      {
        q: "Qu'est-ce que la Garantie de Rachat à 100%?",
        a: "Après exactement 12 mois, vous avez le droit contractuel de revendre les diamants à la société pour 100% de votre dépôt initial. Vous récupérez l'intégralité de votre capital — peu importe ce qui arrive aux prix des diamants.",
      },
      {
        q: "Les diamants sont-ils réels et physiques?",
        a: "Oui. Chaque diamant est:\n• Certifié par GIA (Gemological Institute of America)\n• Sans conflit (Processus de Kimberley)\n• Sourcé via des contrats miniers directs\n\nVous pouvez choisir la livraison à domicile ou le stockage sécurisé dans la zone franche de Dubaï.",
      },
      {
        q: "Comment fonctionne l'héritage?",
        a: "Les diamants sont votre propriété légale via le Contrat de Propriété. Vous pouvez les transmettre à vos proches. La propriété et tous les droits sont automatiquement transférés selon votre testament ou les lois successorales locales.",
      },
      {
        q: "Est-ce affecté par les marchés boursiers, la crypto ou le forex?",
        a: "Non. Il s'agit d'une marchandise physique (diamants). Sa valeur et vos remises ne sont pas liées aux marchés financiers, aux taux d'intérêt ou aux événements géopolitiques.",
      },
      {
        q: "Qu'en est-il des taxes et de la TVA?",
        a: "Stocké dans la zone franche de Dubaï: 0% TVA et fiscalement efficace.\n\nSi livré en Europe: La TVA d'importation locale peut s'appliquer (ex. 21% aux Pays-Bas, 19% en Allemagne).\n\nLa plupart des clients gardent les diamants en stockage à Dubaï pendant la période de 12 mois.",
      },
      {
        q: "Puis-je commencer petit et grandir?",
        a: "Oui. Vous pouvez commencer avec seulement $100 (SP1). Chaque remise supérieure à $100 peut démarrer un nouveau cycle de 12 mois, permettant la capitalisation.",
      },
      {
        q: "Pour qui est-ce adapté?",
        a: "Les personnes qui possèdent déjà des biens immobiliers ou ont des économies et souhaitent:\n• Un flux de trésorerie mensuel\n• Une protection du capital\n• Un actif patrimonial physique\n• Une diversification en dehors des marchés traditionnels",
      },
      {
        q: "Est-ce un conseil financier?",
        a: "Non. Cette application est uniquement un outil de simulation mathématique et de calcul. Ce n'est pas un conseil financier. Consultez toujours un conseiller financier agréé et examinez tous les documents juridiques avant tout investissement.",
      },
      {
        q: "Que se passe-t-il après 11 mois?",
        a: "Au 11e mois de votre cycle de 12 mois, vous devez informer Diamond Solution de votre décision:\n\nOption 1 – Livraison à domicile: Demandez la livraison physique de vos diamants certifiés GIA à votre adresse. Des frais d'expédition + une assurance complète s'appliquent (montant exact selon votre pays).\n\nOption 2 – Rachat à 100%: Revendez les diamants et recevez 100% de votre dépôt initial remboursé.\n\nAprès le rachat, vous pouvez retirer le montant total ou démarrer immédiatement un nouveau cycle de 12 mois.",
      },
      {
        q: "Comment puis-je déposer ou retirer de l'argent?",
        a: "Nous acceptons les méthodes de paiement suivantes:\n• Virement bancaire (IBAN)\n• Carte de crédit / débit\n• Crypto (USDT ou BTC)\n\nDes frais de traitement minimes s'appliquent à toutes les transactions. Les frais exacts sont affichés pendant le processus de transaction.",
      },
      {
        q: "Quel est l'investissement minimum et maximum?",
        a: "L'investissement minimum est de $100 (SP1). Il n'y a pas de maximum officiel — le niveau standard le plus élevé est SP7 à $50 000+. De nombreux clients commencent avec SP4 ($5 000–$10 000) pour l'équilibre optimal entre taux de remise et flexibilité.\n\nVous pouvez également gérer plusieurs Plans de Solution simultanément pour augmenter votre position totale.",
      },
      {
        q: "Qu'est-ce que Diamond Solution et où est-il basé?",
        a: "Diamond Solution est une société de commerce et de propriété de diamants physiques enregistrée dans plusieurs juridictions:\n\n• Dubaï, EAU — Licence DMCC No. 1007195\n• Philippines — Enregistrement SEC No. 2026030241228-02\n• Certifié SIRA (Security Industry Regulatory Agency, Dubaï)\n\nLes opérations sont basées dans la Zone Franche de Dubaï, avec des bureaux à Vienne, Manille et Floride.",
      },
      {
        q: "Comment puis-je suivre mes diamants et remises?",
        a: "Tous vos diamants, remises et détails de contrat sont accessibles via le portail client Diamond Solution sur diamond-solution.net.\n\nVous pouvez vous connecter à tout moment pour consulter:\n• Vos avoirs actuels en diamants et numéros de certificats GIA\n• Historique des remises mensuelles et paiements à venir\n• Votre date de début de contrat et date de fin à 12 mois\n• Statut VIP et solde du pot de capitalisation",
      },
      {
        q: "Puis-je avoir plusieurs Plans de Solution en même temps?",
        a: "Oui. Vous pouvez gérer plusieurs Plans de Solution simultanément. Chaque plan fonctionne dans son propre cycle indépendant de 12 mois avec son propre taux de remise, statut VIP et date de rachat.\n\nC'est une stratégie courante pour les clients qui souhaitent:\n• Échelonner leurs dates de rachat (par exemple un plan par trimestre)\n• Diversifier sur différents niveaux SP\n• Réinvestir les remises dans de nouveaux plans",
      },
      {
        q: "Que se passe-t-il si je veux sortir avant 12 mois?",
        a: "La Garantie de Rachat à 100% s'applique après la période complète de 12 mois. Une sortie anticipée avant 12 mois est possible mais peut entraîner un rachat partiel à un taux réduit, selon les termes de votre contrat spécifique.\n\nPour cette raison, il est fortement recommandé de n'investir que du capital dont vous n'avez pas besoin pendant au moins 12 mois.",
      },
      {
        q: "Mon investissement est-il assuré ou protégé?",
        a: "Votre investissement est protégé de plusieurs façons:\n\n• Garantie de rachat à 100% — obligation contractuelle de rachat à pleine valeur après 12 mois\n• Actif physique — vous possédez de vrais diamants GIA certifiés et tangibles, pas un produit financier\n• Stockage en zone franche de Dubaï — stockage sécurisé et assuré en coffre-fort\n• Propriété légale — le Contrat de propriété fait des diamants votre propriété légale\n\nNote: Ce n'est pas un dépôt bancaire et n'est pas couvert par les régimes gouvernementaux d'assurance des dépôts.",
      },
      {
        q: "Qu'est-ce que le Bonus VIP3 et comment fonctionne-t-il?",
        a: "Le Bonus VIP3 est une récompense supplémentaire pour les clients ayant un plan VIP au niveau SP3 ($2 000–$5 000) ou supérieur.\n\nFonctionnement:\n• Vous devez avoir un abonnement VIP actif (1 000 $/an)\n• Votre capital doit être au niveau SP3 ou supérieur\n• Le Bonus VIP3 ajoute un crédit mensuel supplémentaire en plus de votre remise VIP standard\n\nAvantages du VIP3:\n• Rendement mensuel effectif plus élevé\n• Capitalisation du capital plus rapide\n• Accès prioritaire aux nouveaux programmes Diamond Solution\n\nLe Bonus VIP3 est automatiquement appliqué dans la calculatrice lorsque vous activez VIP aux niveaux SP3+.",
      },
    ],
    es: [
      {
        q: "¿Qué es exactamente Plan B?",
        a: "Plan B es un programa estructurado que le permite poseer diamantes físicos certificados por GIA mientras recibe reembolsos mensuales (flujo de caja). Está diseñado como un activo estable y tangible que funciona junto con sus bienes raíces y otras inversiones, no en lugar de ellas.",
      },
      {
        q: "¿Cómo funcionan los reembolsos mensuales?",
        a: "Usted elige un Plan de Solución (SP1 a SP7) según su monto de depósito. Cada mes recibe un reembolso entre el 2,2% y el 6,3% (con VIP).\n\nEjemplo: Un depósito de $10,000 en SP4 + VIP le da aproximadamente $600 por mes durante 12 meses.",
      },
      {
        q: "¿Qué es la Garantía de Recompra del 100%?",
        a: "Después de exactamente 12 meses, tiene el derecho contractual de vender los diamantes de vuelta a la empresa por el 100% de su depósito original. Recupera su capital completo, sin importar lo que suceda con los precios de los diamantes.",
      },
      {
        q: "¿Los diamantes son reales y físicos?",
        a: "Sí. Cada diamante está:\n• Certificado por GIA (Instituto Gemológico de América)\n• Libre de conflictos (Proceso de Kimberley)\n• Obtenido a través de contratos mineros directos\n\nPuede elegir entrega a domicilio o almacenamiento seguro en la Zona Franca de Dubái.",
      },
      {
        q: "¿Cómo funciona la herencia?",
        a: "Los diamantes son su propiedad legal a través del Contrato de Propiedad. Puede transmitirlos a sus herederos. La propiedad y todos los derechos se transfieren automáticamente según su testamento o las leyes de herencia locales.",
      },
      {
        q: "¿Se ve afectado por los mercados de valores, cripto o forex?",
        a: "No. Se trata de una mercancía física (diamantes). Su valor y sus reembolsos no están vinculados a los mercados financieros, las tasas de interés ni los eventos geopolíticos.",
      },
      {
        q: "¿Qué hay de los impuestos y el IVA?",
        a: "Almacenado en la Zona Franca de Dubái: 0% IVA y fiscalmente eficiente.\n\nSi se entrega en Europa: Puede aplicarse el IVA de importación local (ej. 21% en Países Bajos, 19% en Alemania).\n\nLa mayoría de los clientes mantienen los diamantes en almacenamiento en Dubái durante el período de 12 meses.",
      },
      {
        q: "¿Puedo empezar pequeño y crecer?",
        a: "Sí. Puede comenzar con tan solo $100 (SP1). Cada reembolso superior a $100 puede iniciar un nuevo ciclo de 12 meses, permitiendo el interés compuesto.",
      },
      {
        q: "¿Para quién es adecuado?",
        a: "Personas que ya poseen bienes raíces o tienen ahorros y desean:\n• Flujo de caja mensual\n• Protección del capital\n• Un activo patrimonial físico\n• Diversificación fuera de los mercados tradicionales",
      },
      {
        q: "¿Es esto asesoramiento financiero?",
        a: "No. Esta aplicación es únicamente una herramienta de simulación matemática y cálculo. No es asesoramiento financiero. Consulte siempre a un asesor financiero autorizado y revise todos los documentos legales antes de realizar cualquier inversión.",
      },
      {
        q: "¿Qué pasa después de 11 meses?",
        a: "En el mes 11 de su ciclo de 12 meses, debe informar a Diamond Solution de su decisión:\n\nOpción 1 – Entrega a domicilio: Solicite la entrega física de sus diamantes certificados GIA a su dirección. Se aplican gastos de envío + seguro completo (importe exacto según su país).\n\nOpción 2 – Recompra al 100%: Venda los diamantes de vuelta y reciba el 100% de su depósito original devuelto.\n\nDespués de la recompra, puede retirar el importe total o iniciar inmediatamente un nuevo ciclo de 12 meses.",
      },
      {
        q: "¿Cómo puedo depositar o retirar dinero?",
        a: "Aceptamos los siguientes métodos de pago:\n• Transferencia bancaria (IBAN)\n• Tarjeta de crédito / débito\n• Cripto (USDT o BTC)\n\nSe aplica una pequeña tarifa de procesamiento a todas las transacciones. Las tarifas exactas se muestran durante el proceso de transacción.",
      },
      {
        q: "¿Cuál es la inversión mínima y máxima?",
        a: "La inversión mínima es de $100 (SP1). No hay máximo oficial — el nivel estándar más alto es SP7 con $50.000+. Muchos clientes comienzan con SP4 ($5.000–$10.000) para el equilibrio óptimo entre tasa de descuento y flexibilidad.\n\nTambién puede ejecutar múltiples Planes de Solución simultáneamente para escalar su posición total.",
      },
      {
        q: "¿Qué es Diamond Solution y dónde está ubicado?",
        a: "Diamond Solution es una empresa de comercio y propiedad de diamantes físicos registrada en múltiples jurisdicciones:\n\n• Dubái, EAU — Licencia DMCC No. 1007195\n• Filipinas — Registro SEC No. 2026030241228-02\n• Certificado SIRA (Security Industry Regulatory Agency, Dubái)\n\nLas operaciones están basadas en la Zona Franca de Dubái, con oficinas en Viena, Manila y Florida.",
      },
      {
        q: "¿Cómo puedo rastrear mis diamantes y descuentos?",
        a: "Todos sus diamantes, descuentos y detalles del contrato son accesibles a través del portal de clientes de Diamond Solution en diamond-solution.net.\n\nPuede iniciar sesión en cualquier momento para ver:\n• Sus tenencias actuales de diamantes y números de certificados GIA\n• Historial de descuentos mensuales y pagos próximos\n• Su fecha de inicio de contrato y fecha de fin de 12 meses\n• Estado VIP y saldo del bote de capitalización",
      },
      {
        q: "¿Puedo tener múltiples Planes de Solución al mismo tiempo?",
        a: "Sí. Puede ejecutar múltiples Planes de Solución simultáneamente. Cada plan funciona en su propio ciclo independiente de 12 meses con su propia tasa de descuento, estado VIP y fecha de recompra.\n\nEsta es una estrategia común para clientes que desean:\n• Escalonar sus fechas de recompra (por ejemplo, un plan por trimestre)\n• Diversificar en diferentes niveles SP\n• Reinvertir descuentos en nuevos planes",
      },
      {
        q: "¿Qué pasa si quiero salir antes de 12 meses?",
        a: "La Garantía de Recompra al 100% se aplica después del período completo de 12 meses. La salida anticipada antes de 12 meses es posible pero puede resultar en una recompra parcial a una tasa reducida, dependiendo de los términos de su contrato específico.\n\nPor esta razón, se recomienda encarecidamente invertir solo capital al que no necesite acceso durante al menos 12 meses.",
      },
      {
        q: "¿Está mi inversión asegurada o protegida?",
        a: "Su inversión está protegida de varias maneras:\n\n• Garantía de Recompra al 100% — obligación contractual de recompra a valor completo después de 12 meses\n• Activo físico — posee diamantes GIA certificados reales y tangibles, no un producto financiero\n• Almacenamiento en Zona Franca de Dubái — almacenamiento en bóveda segura y asegurada\n• Propiedad legal — el Contrato de Propiedad hace de los diamantes su propiedad legal\n\nNota: Esto no es un depósito bancario y no está cubierto por esquemas gubernamentales de garantía de depósitos.",
      },
      {
        q: "¿Qué es el Bono VIP3 y cómo funciona?",
        a: "El Bono VIP3 es una recompensa adicional para clientes con un plan VIP en el nivel SP3 ($2,000–$5,000) o superior.\n\nCómo funciona:\n• Debe tener una suscripción VIP activa ($1,000/año)\n• Su capital debe estar en SP3 o superior\n• El Bono VIP3 agrega un crédito mensual adicional además de su descuento VIP estándar\n\nBeneficios del VIP3:\n• Mayor rendimiento mensual efectivo\n• Capitalización de capital más rápida\n• Acceso prioritario a nuevos programas de Diamond Solution\n\nEl Bono VIP3 se aplica automáticamente en la calculadora cuando activa VIP en niveles SP3+.",
      },
    ],
    ru: [
      {
        q: "Что такое Plan B?",
        a: "Plan B — это структурированная программа, которая позволяет вам владеть физическими алмазами с сертификатом GIA, получая ежемесячные возвраты (денежный поток). Она разработана как стабильный, осязаемый актив, работающий вместе с вашей недвижимостью и другими инвестициями — а не вместо них.",
      },
      {
        q: "Как работают ежемесячные возвраты?",
        a: "Вы выбираете план решения (SP1–SP7) в зависимости от суммы вклада. Каждый месяц вы получаете возврат от 2,2% до 6,3% (с VIP).\n\nПример: Вклад $10 000 при SP4 + VIP даёт вам около $600 в месяц в течение 12 месяцев.",
      },
      {
        q: "Что такое 100% гарантия обратного выкупа?",
        a: "Ровно через 12 месяцев у вас есть договорное право продать алмазы обратно компании за 100% вашего первоначального вклада. Вы получаете весь капитал обратно — независимо от того, что происходит с ценами на алмазы.",
      },
      {
        q: "Являются ли алмазы настоящими и физическими?",
        a: "Да. Каждый алмаз:\n• Сертифицирован GIA (Геммологический институт Америки)\n• Бесконфликтный (Кимберлийский процесс)\n• Закупается через прямые горнодобывающие контракты\n\nВы можете выбрать доставку на дом или безопасное хранение в Свободной зоне Дубая.",
      },
      {
        q: "Как работает наследование?",
        a: "Алмазы являются вашей законной собственностью по Договору о праве собственности. Вы можете передать их своим ближайшим родственникам. Право собственности и все права переходят автоматически в соответствии с вашим завещанием или местными законами о наследовании.",
      },
      {
        q: "Зависит ли это от фондовых рынков, криптовалюты или форекс?",
        a: "Нет. Это физический товар (алмазы). Его стоимость и ваши возвраты не связаны с финансовыми рынками, процентными ставками или геополитическими событиями.",
      },
      {
        q: "Как насчёт налогов и НДС?",
        a: "При хранении в Свободной зоне Дубая: 0% НДС и налоговая эффективность.\n\nПри доставке в Европу: Может применяться местный импортный НДС (например, 21% в Нидерландах, 19% в Германии).\n\nБольшинство клиентов хранят алмазы в Дубае в течение 12-месячного периода.",
      },
      {
        q: "Могу ли я начать с малого и расти?",
        a: "Да. Вы можете начать всего с $100 (SP1). Каждый возврат свыше $100 может начать новый 12-месячный цикл, что позволяет использовать сложные проценты.",
      },
      {
        q: "Для кого это подходит?",
        a: "Для людей, которые уже владеют недвижимостью или имеют сбережения и хотят:\n• Ежемесячный денежный поток\n• Защиту капитала\n• Физический наследственный актив\n• Диверсификацию вне традиционных рынков",
      },
      {
        q: "Это финансовый совет?",
        a: "Нет. Это приложение является исключительно инструментом математического моделирования и расчёта. Это не финансовый совет. Всегда консультируйтесь с лицензированным финансовым советником и изучайте все юридические документы перед любыми инвестициями.",
      },
      {
        q: "Что происходит после 11 месяцев?",
        a: "На 11-м месяце вашего 12-месячного цикла вы должны сообщить Diamond Solution о своём решении:\n\nВариант 1 – Доставка на дом: Запросите физическую доставку ваших GIA-сертифицированных бриллиантов по вашему адресу. Применяются расходы на доставку + полная страховка (точная сумма зависит от вашей страны).\n\nВариант 2 – 100% выкуп: Продайте бриллианты обратно и получите 100% вашего первоначального депозита.\n\nПосле выкупа вы можете вывести всю сумму или немедленно начать новый 12-месячный цикл.",
      },
      {
        q: "Как я могу внести или вывести деньги?",
        a: "Мы принимаем следующие способы оплаты:\n• Банковский перевод (IBAN)\n• Кредитная / дебетовая карта\n• Криптовалюта (USDT или BTC)\n\nНебольшая комиссия за обработку применяется ко всем транзакциям. Точные комиссии отображаются в процессе транзакции.",
      },
      {
        q: "Каков минимальный и максимальный размер инвестиций?",
        a: "Минимальная инвестиция составляет $100 (SP1). Официального максимума нет — самый высокий стандартный уровень — SP7 при $50 000+. Многие клиенты начинают с SP4 ($5 000–$10 000) для оптимального баланса между ставкой скидки и гибкостью.\n\nВы также можете одновременно запускать несколько Планов Решений для масштабирования вашей общей позиции.",
      },
      {
        q: "Что такое Diamond Solution и где он находится?",
        a: "Diamond Solution — компания по торговле и владению физическими бриллиантами, зарегистрированная в нескольких юрисдикциях:\n\n• Дубай, ОАЭ — Лицензия DMCC № 1007195\n• Филиппины — Регистрация SEC № 2026030241228-02\n• Сертификат SIRA (Security Industry Regulatory Agency, Дубай)\n\nОперации базируются в Дубайской Свободной Зоне, с офисами в Вене, Маниле и Флориде.",
      },
      {
        q: "Как я могу отслеживать свои бриллианты и скидки?",
        a: "Все ваши бриллианты, скидки и детали контракта доступны через клиентский портал Diamond Solution на diamond-solution.net.\n\nВы можете войти в любое время, чтобы просмотреть:\n• Ваши текущие запасы бриллиантов и номера сертификатов GIA\n• Историю ежемесячных скидок и предстоящие платежи\n• Дату начала контракта и дату окончания 12-месячного срока\n• Статус VIP и баланс накопительного котла",
      },
      {
        q: "Могу ли я иметь несколько Планов Решений одновременно?",
        a: "Да. Вы можете одновременно запускать несколько Планов Решений. Каждый план работает в своём независимом 12-месячном цикле со своей ставкой скидки, статусом VIP и датой выкупа.\n\nЭто распространённая стратегия для клиентов, которые хотят:\n• Распределить даты выкупа (например, один план в квартал)\n• Диверсифицировать по разным уровням SP\n• Реинвестировать скидки в новые планы",
      },
      {
        q: "Что происходит, если я хочу выйти до 12 месяцев?",
        a: "Гарантия 100% выкупа применяется после полного 12-месячного периода. Досрочный выход до 12 месяцев возможен, но может привести к частичному выкупу по сниженной ставке в зависимости от условий вашего конкретного контракта.\n\nПо этой причине настоятельно рекомендуется инвестировать только тот капитал, к которому вам не нужен доступ в течение как минимум 12 месяцев.",
      },
      {
        q: "Застрахованы ли мои инвестиции или защищены?",
        a: "Ваши инвестиции защищены несколькими способами:\n\n• Гарантия 100% выкупа — договорное обязательство выкупа по полной стоимости после 12 месяцев\n• Физический актив — вы владеете реальными, ощутимыми GIA-сертифицированными бриллиантами, а не финансовым продуктом\n• Хранение в Дубайской Свободной Зоне — безопасное, застрахованное хранение в хранилище\n• Юридическая собственность — Договор о праве собственности делает бриллианты вашей законной собственностью\n\nПримечание: Это не банковский депозит и не покрывается государственными схемами гарантирования вкладов.",
      },
      {
        q: "Что такое бонус VIP3 и как он работает?",
        a: "Бонус VIP3 — это дополнительное вознаграждение для клиентов с VIP-планом на уровне SP3 ($2 000–$5 000) или выше.\n\nКак это работает:\n• У вас должна быть активная VIP-подписка ($1 000/год)\n• Ваш капитал должен быть на уровне SP3 или выше\n• Бонус VIP3 добавляет дополнительный ежемесячный кредит сверх вашей стандартной VIP-скидки\n\nПреимущества VIP3:\n• Более высокая эффективная месячная доходность\n• Более быстрое накопление капитала\n• Приоритетный доступ к новым программам Diamond Solution\n\nБонус VIP3 автоматически применяется в калькуляторе при активации VIP на уровнях SP3+.",
      },
    ],
    zh: [
      {
        q: "Plan B究竟是什么？",
        a: "Plan B是一个结构化项目，让您在拥有GIA认证实体钻石的同时获得每月返利（现金流）。它被设计为稳定的有形资产，与您的房地产和其他投资并行运作——而非取代它们。",
      },
      {
        q: "每月返利如何运作？",
        a: "您根据存款金额选择解决方案计划（SP1至SP7）。每月您将获得2.2%至6.3%（含VIP）的返利。\n\n示例：$10,000存款在SP4+VIP下，每月约获得$600，持续12个月。",
      },
      {
        q: "什么是100%回购保证？",
        a: "恰好12个月后，您有合同权利以原始存款的100%将钻石卖回给公司。无论钻石价格如何变化，您都能收回全部本金。",
      },
      {
        q: "钻石是真实的实体钻石吗？",
        a: "是的。每颗钻石均：\n• 经GIA（美国宝石学院）认证\n• 无冲突（金伯利进程）\n• 通过直接采矿合同采购\n\n您可以选择送货上门或在迪拜自由区安全存储。",
      },
      {
        q: "继承如何运作？",
        a: "通过所有权合同，钻石是您的法定财产。您可以将其传给您的继承人。所有权和所有权利将根据您的遗嘱或当地继承法自动转让。",
      },
      {
        q: "这是否受股市、加密货币或外汇影响？",
        a: "不会。这是实物商品（钻石）。其价值和您的返利与金融市场、利率或地缘政治事件无关。",
      },
      {
        q: "税收和增值税怎么办？",
        a: "存储在迪拜自由区：0%增值税，税务高效。\n\n如果运送到欧洲：可能需要缴纳当地进口增值税（例如荷兰21%，德国19%）。\n\n大多数客户在12个月期间将钻石存放在迪拜以获得最大效率。",
      },
      {
        q: "我可以从小额开始增长吗？",
        a: "可以。您可以从$100（SP1）开始。每笔超过$100的返利都可以开始新的12个月周期，实现复利增长。",
      },
      {
        q: "这适合谁？",
        a: "已拥有房地产或有储蓄并希望获得以下内容的人：\n• 每月现金流\n• 资本保护\n• 实物遗产资产\n• 传统市场以外的多元化投资",
      },
      {
        q: "这是财务建议吗？",
        a: "不是。本应用程序仅是数学模拟和计算工具。它不是财务建议。在进行任何投资之前，请务必咨询持牌财务顾问并审查所有法律文件。",
      },
      {
        q: "11个月后会发生什么？",
        a: "在您12个月周期的第11个月，您必须告知Diamond Solution您的决定：\n\n选项1 – 送货上门：申请将您的GIA认证钻石实物送至您的地址。需支付运费+全额保险（具体金额取决于您所在国家）。\n\n选项2 – 100%回购：将钻石卖回给我们，收回100%的原始存款。\n\n回购后，您可以提取全额资金，或立即以返还的资金开始新的12个月周期。",
      },
      {
        q: "如何存款或取款？",
        a: "我们接受以下付款方式：\n• 银行转账（IBAN）\n• 信用卡/借记卡\n• 加密货币（USDT或BTC）\n\n所有交易（存款和取款）均收取少量处理费。确切费用在交易过程中显示。",
      },
      {
        q: "最低和最高投资额是多少？",
        a: "最低投资额为$100（SP1）。没有官方最高限额——最高标准级别是SP7，起点为$50,000+。许多客户从SP4（$5,000–$10,000）开始，以获得回扣率和灵活性的最佳平衡。\n\n您也可以同时运行多个解决方案计划来扩大您的总仓位。",
      },
      {
        q: "Diamond Solution是什么，总部在哪里？",
        a: "Diamond Solution是一家在多个司法管辖区注册的实物钻石贸易和所有权公司：\n\n• 阿联酋迪拜 — DMCC许可证号1007195\n• 菲律宾 — SEC注册号2026030241228-02\n• SIRA认证（迪拜安全行业监管机构）\n\n运营总部位于迪拜自由区，在维也纳、马尼拉和佛罗里达设有办事处。",
      },
      {
        q: "如何跟踪我的钻石和回扣？",
        a: "您的所有钻石、回扣和合同详情均可通过diamond-solution.net上的Diamond Solution客户门户访问。\n\n您可以随时登录查看：\n• 您当前的钻石持有量和GIA证书编号\n• 每月回扣历史和即将到来的付款\n• 您的合同开始日期和12个月结束日期\n• VIP状态和复利池余额",
      },
      {
        q: "我可以同时拥有多个解决方案计划吗？",
        a: "可以。您可以同时运行多个解决方案计划。每个计划在其独立的12个月周期内运行，具有自己的回扣率、VIP状态和回购日期。\n\n这是希望以下操作的客户的常见策略：\n• 错开回购日期（例如每季度一个计划）\n• 在不同SP级别之间分散投资\n• 将回扣再投资到新计划中",
      },
      {
        q: "如果我想在12个月前退出会怎样？",
        a: "100%回购保证在完整的12个月期限后适用。在12个月前提前退出是可能的，但可能会导致按降低的比率进行部分回购，具体取决于您特定合同的条款。\n\n因此，强烈建议只投资您在至少12个月内不需要动用的资金。",
      },
      {
        q: "我的投资有保险或保障吗？",
        a: "您的投资受到多方面保护：\n\n• 100%回购保证 — 12个月后按全额价值回购的合同义务\n• 实物资产 — 您拥有真实、有形的GIA认证钻石，而非金融产品\n• 迪拜自由区存储 — 安全、有保险的金库存储\n• 法律所有权 — 所有权合同使钻石成为您的法律财产\n\n注意：这不是银行存款，不受政府存款保险计划保障。",
      },
      {
        q: "什么是VIP3奖励，它如何运作？",
        a: "VIP3奖励是为持有SP3级别（$2,000–$5,000）或更高VIP计划的客户提供的额外奖励。\n\n运作方式：\n• 您必须拥有有效的VIP订阅（$1,000/年）\n• 您的资本必须在SP3或更高级别\n• VIP3奖励在您的标准VIP返利基础上增加额外的月度积分\n\nVIP3的优势：\n• 更高的有效月收益\n• 更快的资本复利增长\n• 优先访问Diamond Solution新项目\n\n当您在SP3+级别启用VIP时，计算器会自动应用VIP3奖励。",
      },
    ],
  };
  return data[lang] ?? data["en"];
}

export default function FaqScreen() {
  const router = useRouter();
  const { language } = useCalculator();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = getFaqItems(language);

  const toggle = (idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <ScreenContainer bgColor="#0f172a" edges={["top", "left", "right"]}>
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Text style={S.backText}>‹ {t(language, "back")}</Text>
          </TouchableOpacity>
          <Text style={S.pageTitle}>FAQ</Text>
          <Text style={S.pageSubtitle}>{t(language, "faqSubtitle")}</Text>
        </View>

        {/* Accordion Items */}
        {items.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[S.item, openIndex === idx && S.itemOpen]}
            onPress={() => toggle(idx)}
            activeOpacity={0.85}
          >
            <View style={S.questionRow}>
              <View style={S.qBadge}>
                <Text style={S.qBadgeText}>{idx + 1}</Text>
              </View>
              <Text style={S.questionText}>{item.q}</Text>
              <Text style={[S.chevron, openIndex === idx && S.chevronOpen]}>›</Text>
            </View>
            {openIndex === idx && (
              <View style={S.answerContainer}>
                <View style={S.divider} />
                <Text style={S.answerText}>{item.a}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Disclaimer footer */}
        <View style={S.footer}>
          <Text style={S.footerText}>{t(language, "faqDisclaimer")}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginBottom: 12,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: "#38BDF8",
    fontWeight: "bold",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
  },
  item: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#131c30",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  itemOpen: {
    borderColor: "#38BDF8",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  qBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1e3a5f",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#38BDF8",
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#e2e8f0",
    lineHeight: 22,
  },
  chevron: {
    fontSize: 22,
    color: "#475569",
    transform: [{ rotate: "0deg" }],
    flexShrink: 0,
  },
  chevronOpen: {
    transform: [{ rotate: "90deg" }],
    color: "#38BDF8",
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginBottom: 14,
  },
  answerText: {
    fontSize: 15,
    color: "#94A3B8",
    lineHeight: 24,
  },
  footer: {
    margin: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: "#0a1628",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  footerText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
