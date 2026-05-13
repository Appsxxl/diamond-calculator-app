import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Share, Platform, KeyboardAvoidingView, Image,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import type { Language } from "@/lib/translations";

type LetterType = "invitation" | "presentation" | "business";

// ─── Letter Templates ─────────────────────────────────────────────────────────
// Placeholders: [DATE] [CUSTOMER_NAME] [ADVISER_NAME] [ADVISER_COMPANY] [ADVISER_CONTACT]

const LETTERS: Partial<Record<Language, Record<LetterType, string>>> & { en: Record<LetterType, string> } = {

  en: {
    invitation:
`[DATE]

Dear [CUSTOMER_NAME],

I hope this message finds you well.

I wanted to reach out personally to share something I have been exploring with a number of clients who are looking to strengthen their asset base beyond the traditional financial markets.

Investment-grade physical diamonds have been drawing quiet but consistent attention from wealth-conscious individuals. Unlike equities, foreign exchange, or cryptocurrency, physical diamonds are not traded on any public exchange. Their value is not directly influenced by interest rate decisions, market corrections, or currency volatility. They are a tangible, portable, and discreet store of value — one that has preserved purchasing power across generations.

I am not making any recommendation — only opening a conversation. If you are curious to learn more about how some clients are approaching this as part of a broader wealth preservation strategy, I would be happy to share a brief overview at a time that suits you. No obligation, no pressure.

Looking forward to hearing from you.

Warm regards,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    presentation:
`[DATE]

Dear [CUSTOMER_NAME],

Thank you for the time you recently gave me — I genuinely appreciate your openness.

As I mentioned, the Diamond Solution programme offers something that sits entirely outside the conventional financial world. At its core is a straightforward principle: physical diamonds as a personal, non-market-traded asset that generates a structured monthly return through a closed loyalty and rebate mechanism.

What makes this different from most financial products is the transparency. There are no hidden fees, no market exposure, and no speculative risk. The value of your diamonds does not fluctuate with the stock market, interest rate decisions, or any economic headline. What you hold is yours — in physical form.

I would very much like to walk you through the full presentation at your convenience. It takes approximately 30 minutes and answers the most common questions clearly. I can do this over a video call, in person, or by sending you the materials to review at your own pace.

Please let me know which you prefer and I will arrange it immediately.

Warm regards,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    business:
`[DATE]

Dear [CUSTOMER_NAME],

Following our recent conversation, I wanted to share a broader picture — not only as a personal wealth preservation strategy, but also as a business opportunity worth understanding.

Diamond Solution offers a fully transparent income structure for those who choose to introduce the programme to others. This is not a traditional commission model. It is a long-term residual income structure, where your earnings grow proportionally as the portfolios of those you introduce continue to grow month after month.

The model is built on a simple truth: the more diamonds held within the network, the more monthly rebates are generated — and those rebates flow back through a clearly defined structure. It compounds quietly and consistently.

Many of our most successful partners began as personal clients. They understood the product from the inside first, and sharing it with others felt like a natural extension of their own conviction — not a sales exercise.

I am happy to walk you through the full business model at your convenience. There is no timeline, no expectation, and no pressure. What matters is that you have the complete picture before forming any opinion.

Kind regards,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  nl: {
    invitation:
`[DATE]

Beste [CUSTOMER_NAME],

Ik hoop dat het goed met u gaat.

Ik wilde u persoonlijk benaderen om iets te delen wat ik momenteel verken met een aantal cliënten die hun vermogensbasis willen versterken buiten de traditionele financiële markten.

Investeerbare fysieke diamanten trekken stille maar consistente aandacht van vermogensgerichte personen. In tegenstelling tot aandelen, valutamarkten of cryptovaluta worden fysieke diamanten niet verhandeld op een openbare beurs. Hun waarde wordt niet rechtstreeks beïnvloed door rentebeslissingen, marktcorrecties of valutaschommelingen. Het zijn tastbare, draagbare en discrete waardeopslag — die koopkracht door generaties heen heeft behouden.

Ik maak hier geen aanbeveling — ik open enkel een gesprek. Als u nieuwsgierig bent naar hoe sommige cliënten dit benaderen als onderdeel van een bredere vermogensstrategie, deel ik graag een kort overzicht op een moment dat u uitkomt. Geen verplichting, geen druk.

Ik zie uw reactie graag tegemoet.

Met vriendelijke groet,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    presentation:
`[DATE]

Beste [CUSTOMER_NAME],

Hartelijk dank voor de tijd die u mij recent hebt gegund — ik waardeer uw openheid oprecht.

Zoals besproken biedt het Diamond Solution programma iets dat volledig buiten de conventionele financiële wereld staat. De kern is een eenvoudig principe: fysieke diamanten als een persoonlijk, niet-beursgenoteerd vermogensbestanddeel dat een gestructureerd maandelijks rendement genereert via een gesloten loyaliteits- en kortingsmechanisme.

Wat dit onderscheidt van de meeste financiële producten is de transparantie. Er zijn geen verborgen kosten, geen marktblootstelling en geen speculatief risico. De waarde van uw diamanten fluctueert niet met de aandelenmarkt, rentebeslissingen of economisch nieuws. Wat u bezit, is van u — in fysieke vorm.

Ik zou u graag de volledige presentatie laten zien op een moment dat u uitkomt. Het duurt ongeveer 30 minuten en beantwoordt de meest gestelde vragen duidelijk. Dit kan via een videogesprek, persoonlijk, of door u de materialen te sturen zodat u ze op uw eigen tempo kunt bekijken.

Laat me weten wat uw voorkeur heeft en ik regel het onmiddellijk.

Met vriendelijke groet,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    business:
`[DATE]

Beste [CUSTOMER_NAME],

Naar aanleiding van ons recente gesprek wilde ik u een breder beeld geven — niet alleen als persoonlijke vermogensstrategie, maar ook als zakelijke kans die het waard is te begrijpen.

Diamond Solution biedt een volledig transparante inkomensstructuur voor degenen die het programma aan anderen willen introduceren. Dit is geen traditioneel commissiemodel. Het is een structuur voor langdurig passief inkomen, waarbij uw verdiensten proportioneel groeien naarmate de portefeuilles van degenen die u introduceert maand na maand blijven groeien.

Het model is gebaseerd op een eenvoudige waarheid: hoe meer diamanten in het netwerk, hoe meer maandelijkse kortingen worden gegenereerd — en die kortingen vloeien terug via een duidelijk gedefinieerde structuur. Het groeit rustig en consistent.

Veel van onze meest succesvolle partners begonnen als persoonlijke cliënten. Ze begrepen het product van binnenuit en het delen ervan met anderen voelde als een natuurlijke uitbreiding van hun eigen overtuiging — geen verkoopgesprek.

Ik vertel u graag meer over het volledige bedrijfsmodel op een moment dat u uitkomt. Er is geen tijdsdruk, geen verwachting en geen druk. Wat telt is dat u het volledige beeld heeft.

Met vriendelijke groet,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  de: {
    invitation:
`[DATE]

Sehr geehrte/r [CUSTOMER_NAME],

ich hoffe, diese Nachricht erreicht Sie wohlbehalten.

Ich möchte mich persönlich bei Ihnen melden, um etwas zu teilen, das ich derzeit mit einer Reihe von Mandanten erkunde, die ihre Vermögensbasis über die traditionellen Finanzmärkte hinaus stärken möchten.

Physische Diamanten in Investmentqualität ziehen das stille, aber beständige Interesse von vermögensbewussten Personen auf sich. Im Gegensatz zu Aktien, Devisen oder Kryptowährungen werden physische Diamanten an keiner öffentlichen Börse gehandelt. Ihr Wert wird nicht direkt durch Zinsentscheidungen, Marktkorrekturen oder Währungsschwankungen beeinflusst. Sie sind ein greifbarer, tragbarer und diskreter Wertspeicher — der über Generationen hinweg Kaufkraft bewahrt hat.

Ich spreche hier keine Empfehlung aus — ich öffne lediglich ein Gespräch. Falls Sie neugierig sind, wie einige Mandanten dies als Teil einer umfassenderen Vermögensstrategie angehen, würde ich gerne einen kurzen Überblick mit Ihnen teilen, wann es Ihnen passt. Keinerlei Verpflichtung, keinerlei Druck.

Ich freue mich auf Ihre Rückmeldung.

Mit freundlichen Grüßen,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    presentation:
`[DATE]

Sehr geehrte/r [CUSTOMER_NAME],

herzlichen Dank für die Zeit, die Sie mir kürzlich gewidmet haben — ich schätze Ihre Offenheit sehr.

Wie besprochen bietet das Diamond Solution Programm etwas, das vollständig außerhalb der konventionellen Finanzwelt steht. Im Kern steht ein einfaches Prinzip: physische Diamanten als persönliches, nicht börsengehandeltes Vermögensgut, das über einen geschlossenen Loyalitäts- und Rabattmechanismus eine strukturierte monatliche Rendite erwirtschaftet.

Was dieses Konzept von den meisten Finanzprodukten unterscheidet, ist die Transparenz. Es gibt keine versteckten Gebühren, kein Marktrisiko und kein spekulatives Risiko. Der Wert Ihrer Diamanten schwankt nicht mit dem Aktienmarkt, Zinsentscheidungen oder wirtschaftlichen Schlagzeilen. Was Sie besitzen, gehört Ihnen — in physischer Form.

Ich würde Ihnen sehr gerne die vollständige Präsentation zeigen, wann es Ihnen passt. Sie dauert etwa 30 Minuten und beantwortet die häufigsten Fragen klar und verständlich. Dies kann per Videoanruf, persönlich oder durch Übersendung der Unterlagen zur Durchsicht in Ihrem eigenen Tempo erfolgen.

Teilen Sie mir bitte Ihre Präferenz mit und ich organisiere es umgehend.

Mit freundlichen Grüßen,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    business:
`[DATE]

Sehr geehrte/r [CUSTOMER_NAME],

im Anschluss an unser kürzliches Gespräch möchte ich Ihnen ein umfassenderes Bild vermitteln — nicht nur als persönliche Vermögensstrategie, sondern auch als Geschäftsmöglichkeit, die es zu verstehen lohnt.

Diamond Solution bietet eine vollständig transparente Einkommensstruktur für diejenigen, die das Programm anderen vorstellen möchten. Dies ist kein traditionelles Provisionsmodell. Es handelt sich um eine langfristige, passive Einkommensstruktur, bei der Ihre Einnahmen proportional wachsen, wenn die Portfolios der von Ihnen vorgestellten Personen Monat für Monat weiter wachsen.

Das Modell basiert auf einer einfachen Wahrheit: Je mehr Diamanten im Netzwerk gehalten werden, desto mehr monatliche Rabatte werden generiert — und diese Rabatte fließen über eine klar definierte Struktur zurück. Es wächst still und beständig.

Viele unserer erfolgreichsten Partner begannen als persönliche Kunden. Sie verstanden das Produkt von innen heraus, und es anderen zu empfehlen fühlte sich wie eine natürliche Erweiterung ihrer eigenen Überzeugung an — kein Verkaufsgespräch.

Ich erkläre Ihnen gerne das vollständige Geschäftsmodell zu einem Zeitpunkt, der Ihnen passt. Es gibt keinen Zeitplan, keine Erwartungen und keinen Druck. Entscheidend ist, dass Sie das vollständige Bild vor Sich haben.

Mit freundlichen Grüßen,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  fr: {
    invitation:
`[DATE]

Cher/Chère [CUSTOMER_NAME],

J'espère que ce message vous trouve en bonne santé.

Je souhaitais vous contacter personnellement pour partager quelque chose que j'explore actuellement avec plusieurs clients désireux de renforcer leur patrimoine au-delà des marchés financiers traditionnels.

Les diamants physiques de qualité investissement attirent une attention discrète mais constante de la part de personnes soucieuses de leur patrimoine. Contrairement aux actions, aux devises ou aux cryptomonnaies, les diamants physiques ne sont pas cotés sur une bourse publique. Leur valeur n'est pas directement influencée par les décisions de taux d'intérêt, les corrections de marché ou les fluctuations de change. Ils constituent une réserve de valeur tangible, portable et discrète — qui a préservé le pouvoir d'achat à travers les générations.

Je ne fais aucune recommandation ici — j'ouvre simplement une conversation. Si vous êtes curieux de découvrir comment certains clients abordent cela dans le cadre d'une stratégie de préservation du patrimoine plus large, je serais ravi de vous présenter un bref aperçu au moment qui vous convient. Aucune obligation, aucune pression.

Dans l'attente de votre retour.

Cordialement,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    presentation:
`[DATE]

Cher/Chère [CUSTOMER_NAME],

Je vous remercie du temps que vous m'avez récemment accordé — j'apprécie sincèrement votre ouverture d'esprit.

Comme je vous l'ai mentionné, le programme Diamond Solution offre quelque chose qui se situe entièrement en dehors du monde financier conventionnel. Son principe de base est simple : des diamants physiques en tant qu'actif personnel, non coté en bourse, qui génère un rendement mensuel structuré via un mécanisme fermé de fidélité et de remise.

Ce qui distingue ce concept de la plupart des produits financiers, c'est la transparence. Il n'y a pas de frais cachés, pas d'exposition aux marchés et pas de risque spéculatif. La valeur de vos diamants ne fluctue pas avec les marchés boursiers, les décisions de taux d'intérêt ou les actualités économiques. Ce que vous détenez vous appartient — sous forme physique.

Je serais vraiment ravi de vous présenter la présentation complète au moment qui vous convient. Elle dure environ 30 minutes et répond clairement aux questions les plus fréquentes. Cela peut se faire par appel vidéo, en personne, ou en vous envoyant les supports à consulter à votre propre rythme.

Faites-moi savoir ce que vous préférez et j'organiserai cela immédiatement.

Cordialement,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    business:
`[DATE]

Cher/Chère [CUSTOMER_NAME],

Suite à notre récente conversation, je souhaitais vous offrir une vision plus large — non seulement en tant que stratégie de préservation du patrimoine personnel, mais aussi en tant qu'opportunité commerciale qui mérite d'être comprise.

Diamond Solution propose une structure de revenus entièrement transparente pour ceux qui choisissent de présenter le programme à d'autres personnes. Il ne s'agit pas d'un modèle de commission traditionnel. C'est une structure de revenus passifs à long terme, où vos gains croissent proportionnellement à mesure que les portefeuilles des personnes que vous introduisez continuent de croître mois après mois.

Le modèle repose sur une vérité simple : plus il y a de diamants détenus au sein du réseau, plus des remises mensuelles sont générées — et ces remises reviennent via une structure clairement définie. Cela se développe discrètement et régulièrement.

Beaucoup de nos partenaires les plus prospères ont commencé comme clients personnels. Ils ont d'abord compris le produit de l'intérieur, et le partager avec d'autres leur a semblé être le prolongement naturel de leur propre conviction — pas un exercice de vente.

Je suis heureux de vous expliquer le modèle commercial complet à votre convenance. Il n'y a pas de délai, pas d'attente et aucune pression. Ce qui compte, c'est que vous ayez le tableau complet avant de vous forger une opinion.

Bien cordialement,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  it: {
    invitation:
`[DATE]

Gentile [CUSTOMER_NAME],

Spero che questo messaggio la trovi in buona salute.

Volevo contattarla personalmente per condividere qualcosa che sto esplorando con diversi clienti che desiderano rafforzare la propria base patrimoniale al di là dei mercati finanziari tradizionali.

I diamanti fisici di qualità investimento stanno attirando un'attenzione discreta ma costante da parte di persone attente alla propria ricchezza. A differenza di azioni, valute o criptovalute, i diamanti fisici non sono negoziati su alcuna borsa pubblica. Il loro valore non è direttamente influenzato da decisioni sui tassi di interesse, correzioni del mercato o fluttuazioni valutarie. Sono una riserva di valore tangibile, portatile e discreta — che ha preservato il potere d'acquisto attraverso le generazioni.

Non sto facendo alcuna raccomandazione — sto semplicemente aprendo una conversazione. Se è curioso di scoprire come alcuni clienti si approcciano a questo nell'ambito di una strategia di preservazione del patrimonio più ampia, sarei lieto di condividere una breve panoramica quando le fa comodo. Nessun obbligo, nessuna pressione.

In attesa di un suo riscontro.

Cordiali saluti,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    presentation:
`[DATE]

Gentile [CUSTOMER_NAME],

La ringrazio per il tempo che mi ha recentemente dedicato — apprezzo sinceramente la sua apertura.

Come le ho accennato, il programma Diamond Solution offre qualcosa che si colloca completamente al di fuori del mondo finanziario convenzionale. Al centro vi è un principio semplice: diamanti fisici come asset personale non quotato in borsa, che genera un rendimento mensile strutturato attraverso un meccanismo chiuso di fedeltà e rimborso.

Ciò che distingue questo concetto dalla maggior parte dei prodotti finanziari è la trasparenza. Non ci sono commissioni nascoste, nessuna esposizione al mercato e nessun rischio speculativo. Il valore dei suoi diamanti non fluttua con i mercati azionari, le decisioni sui tassi di interesse o le notizie economiche. Ciò che detiene è suo — in forma fisica.

Mi farebbe molto piacere illustrarle la presentazione completa quando le fa comodo. Dura circa 30 minuti e risponde chiaramente alle domande più comuni. Possiamo farlo tramite videochiamata, di persona, o inviandole i materiali da consultare ai suoi ritmi.

Mi faccia sapere cosa preferisce e organizzerò immediatamente.

Cordiali saluti,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    business:
`[DATE]

Gentile [CUSTOMER_NAME],

In seguito alla nostra recente conversazione, desideravo offrirle un quadro più ampio — non solo come strategia personale di preservazione del patrimonio, ma anche come opportunità imprenditoriale che vale la pena comprendere.

Diamond Solution offre una struttura di reddito completamente trasparente per coloro che scelgono di presentare il programma ad altri. Non si tratta di un modello commissionale tradizionale. È una struttura di reddito passivo a lungo termine, in cui i suoi guadagni crescono proporzionalmente man mano che i portafogli delle persone che introduce continuano a crescere mese dopo mese.

Il modello si basa su una semplice verità: più diamanti vengono detenuti all'interno della rete, più rimborsi mensili vengono generati — e questi rimborsi rifluiscono attraverso una struttura chiaramente definita. Cresce silenziosamente e costantemente.

Molti dei nostri partner di maggior successo hanno iniziato come clienti personali. Hanno prima compreso il prodotto dall'interno, e condividerlo con altri è sembrato un'estensione naturale della propria convinzione — non un esercizio di vendita.

Sono lieto di illustrarle il modello di business completo quando le fa comodo. Non ci sono scadenze, aspettative o pressioni. Ciò che conta è che lei abbia il quadro completo prima di formarsi un'opinione.

Distinti saluti,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  es: {
    invitation:
`[DATE]

Estimado/a [CUSTOMER_NAME],

Espero que este mensaje le encuentre bien.

Quería ponerme en contacto personalmente para compartir algo que estoy explorando actualmente con varios clientes que desean fortalecer su base de activos más allá de los mercados financieros tradicionales.

Los diamantes físicos de grado inversión están atrayendo una atención discreta pero constante por parte de personas preocupadas por su patrimonio. A diferencia de las acciones, los mercados de divisas o las criptomonedas, los diamantes físicos no se negocian en ninguna bolsa pública. Su valor no está directamente influenciado por las decisiones sobre tipos de interés, correcciones del mercado o fluctuaciones monetarias. Son una reserva de valor tangible, portable y discreta, que ha preservado el poder adquisitivo a través de generaciones.

No hago ninguna recomendación aquí — simplemente abro una conversación. Si tiene curiosidad por saber cómo algunos clientes abordan esto como parte de una estrategia más amplia de preservación del patrimonio, estaré encantado de compartir un breve resumen cuando le convenga. Sin compromiso, sin presión.

Quedo a la espera de sus noticias.

Un cordial saludo,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    presentation:
`[DATE]

Estimado/a [CUSTOMER_NAME],

Gracias por el tiempo que me dedicó recientemente — le agradezco sinceramente su apertura.

Como le mencioné, el programa Diamond Solution ofrece algo que se sitúa completamente fuera del mundo financiero convencional. En su núcleo hay un principio sencillo: diamantes físicos como activo personal, no cotizado en bolsa, que genera un rendimiento mensual estructurado a través de un mecanismo cerrado de fidelización y descuento.

Lo que diferencia este concepto de la mayoría de los productos financieros es la transparencia. No hay comisiones ocultas, ni exposición a los mercados, ni riesgo especulativo. El valor de sus diamantes no fluctúa con los mercados de valores, las decisiones sobre tipos de interés ni las noticias económicas. Lo que posee es suyo — en forma física.

Me gustaría mucho presentarle la presentación completa cuando le venga bien. Dura aproximadamente 30 minutos y responde con claridad a las preguntas más frecuentes. Puedo hacerlo mediante videollamada, en persona o enviándole los materiales para que los revise a su propio ritmo.

Hágame saber cuál prefiere y lo organizaré de inmediato.

Un cordial saludo,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    business:
`[DATE]

Estimado/a [CUSTOMER_NAME],

Tras nuestra reciente conversación, quería ofrecerle una visión más amplia — no solo como estrategia personal de preservación del patrimonio, sino también como una oportunidad de negocio que merece la pena entender.

Diamond Solution ofrece una estructura de ingresos completamente transparente para quienes eligen presentar el programa a otras personas. No se trata de un modelo de comisiones tradicional. Es una estructura de ingresos pasivos a largo plazo, en la que sus ganancias crecen proporcionalmente a medida que las carteras de las personas que presenta continúan creciendo mes a mes.

El modelo se basa en una verdad simple: cuantos más diamantes se mantengan dentro de la red, más descuentos mensuales se generan — y esos descuentos regresan a través de una estructura claramente definida. Crece de forma silenciosa y constante.

Muchos de nuestros socios más exitosos comenzaron como clientes personales. Entendieron el producto desde dentro primero, y compartirlo con otros les pareció una extensión natural de su propia convicción — no un ejercicio de ventas.

Estaré encantado de explicarle el modelo de negocio completo cuando le convenga. No hay plazos, expectativas ni presión. Lo que importa es que tenga el cuadro completo antes de formarse una opinión.

Un cordial saludo,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  pt: {
    invitation:
`[DATE]

Caro/a [CUSTOMER_NAME],

Espero que esta mensagem o/a encontre bem.

Quis entrar em contacto pessoalmente para partilhar algo que tenho estado a explorar com vários clientes que pretendem fortalecer a sua base de ativos para além dos mercados financeiros tradicionais.

Os diamantes físicos de grau de investimento têm atraído uma atenção discreta mas consistente por parte de pessoas conscientes do seu património. Ao contrário de ações, divisas ou criptomoedas, os diamantes físicos não são negociados em nenhuma bolsa pública. O seu valor não é diretamente influenciado por decisões sobre taxas de juro, correções de mercado ou flutuações cambiais. São uma reserva de valor tangível, portátil e discreta — que tem preservado o poder de compra ao longo de gerações.

Não estou a fazer qualquer recomendação — estou apenas a abrir uma conversa. Se tiver curiosidade em saber como alguns clientes abordam isto como parte de uma estratégia mais ampla de preservação de riqueza, terei todo o gosto em partilhar uma breve visão geral quando lhe for conveniente. Sem compromisso, sem pressão.

Aguardo o seu contacto.

Com os melhores cumprimentos,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    presentation:
`[DATE]

Caro/a [CUSTOMER_NAME],

Obrigado/a pelo tempo que me dedicou recentemente — agradeço sinceramente a sua abertura.

Como lhe mencionei, o programa Diamond Solution oferece algo que se situa completamente fora do mundo financeiro convencional. No seu cerne está um princípio simples: diamantes físicos como ativo pessoal, não cotado em bolsa, que gera um retorno mensal estruturado através de um mecanismo fechado de fidelização e desconto.

O que distingue este conceito da maioria dos produtos financeiros é a transparência. Não há taxas ocultas, sem exposição ao mercado e sem risco especulativo. O valor dos seus diamantes não flutua com os mercados bolsistas, decisões sobre taxas de juro ou notícias económicas. O que detém é seu — em forma física.

Gostaria muito de lhe apresentar a apresentação completa quando lhe for conveniente. Demora aproximadamente 30 minutos e responde claramente às perguntas mais comuns. Posso fazê-lo por videochamada, pessoalmente ou enviando-lhe os materiais para consultar ao seu próprio ritmo.

Informe-me da sua preferência e organizarei imediatamente.

Com os melhores cumprimentos,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    business:
`[DATE]

Caro/a [CUSTOMER_NAME],

Na sequência da nossa recente conversa, quis partilhar uma visão mais abrangente — não apenas como estratégia pessoal de preservação de riqueza, mas também como uma oportunidade de negócio que vale a pena compreender.

O Diamond Solution oferece uma estrutura de rendimentos totalmente transparente para quem escolhe apresentar o programa a outras pessoas. Não se trata de um modelo de comissões tradicional. É uma estrutura de rendimento passivo a longo prazo, onde os seus ganhos crescem proporcionalmente à medida que as carteiras das pessoas que introduz continuam a crescer mês após mês.

O modelo baseia-se numa verdade simples: quanto mais diamantes forem detidos na rede, mais descontos mensais são gerados — e esses descontos fluem de volta através de uma estrutura claramente definida. Cresce de forma silenciosa e consistente.

Muitos dos nossos parceiros mais bem-sucedidos começaram como clientes pessoais. Primeiro compreenderam o produto por dentro, e partilhá-lo com outros pareceu uma extensão natural da sua própria convicção — não um exercício de vendas.

Terei todo o gosto em explicar-lhe o modelo de negócio completo quando lhe for conveniente. Não há prazos, expectativas nem pressão. O que importa é que tenha o quadro completo antes de formar uma opinião.

Com os melhores cumprimentos,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  ru: {
    invitation:
`[DATE]

Уважаемый/ая [CUSTOMER_NAME],

Надеюсь, это сообщение застанет вас в добром здравии.

Я хотел(а) лично связаться с вами, чтобы поделиться тем, что сейчас изучаю совместно с рядом клиентов, которые стремятся укрепить свою активную базу за пределами традиционных финансовых рынков.

Физические бриллианты инвестиционного класса привлекают тихое, но стабильное внимание людей, заботящихся о своём капитале. В отличие от акций, валютных рынков или криптовалют, физические бриллианты не торгуются ни на одной публичной бирже. Их стоимость не зависит напрямую от решений по процентным ставкам, рыночных коррекций или валютных колебаний. Это осязаемый, портативный и конфиденциальный способ сохранения капитала — проверенный поколениями.

Я не даю никаких рекомендаций — я лишь открываю диалог. Если вам интересно узнать, как некоторые клиенты используют это в рамках более широкой стратегии сохранения капитала, я с удовольствием поделюсь кратким обзором в удобное для вас время. Никаких обязательств, никакого давления.

Буду рад/рада получить от вас ответ.

С уважением,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    presentation:
`[DATE]

Уважаемый/ая [CUSTOMER_NAME],

Благодарю вас за время, которое вы недавно уделили мне, — я искренне ценю вашу открытость.

Как я упоминал(а), программа Diamond Solution предлагает нечто, что полностью выходит за рамки конвенционального финансового мира. В её основе лежит простой принцип: физические бриллианты как личный, небиржевой актив, генерирующий структурированный ежемесячный доход через закрытый механизм лояльности и скидок.

Что отличает эту концепцию от большинства финансовых продуктов — это прозрачность. Никаких скрытых комиссий, никакой рыночной экспозиции и никакого спекулятивного риска. Стоимость ваших бриллиантов не колеблется вместе с фондовым рынком, решениями по процентным ставкам или экономическими новостями. То, чем вы владеете, принадлежит вам — в физической форме.

Я был(а) бы очень рад(а) провести для вас полную презентацию в удобное для вас время. Она занимает около 30 минут и чётко отвечает на наиболее распространённые вопросы. Это можно сделать по видеозвонку, лично или направив вам материалы для изучения в вашем собственном темпе.

Сообщите, пожалуйста, что предпочитаете, и я организую всё незамедлительно.

С уважением,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    business:
`[DATE]

Уважаемый/ая [CUSTOMER_NAME],

По итогам нашего недавнего разговора я хотел(а) поделиться более широкой картиной — не только как личной стратегией сохранения капитала, но и как возможностью для бизнеса, которую стоит понять.

Diamond Solution предлагает полностью прозрачную структуру дохода для тех, кто выбирает представление программы другим людям. Это не традиционная комиссионная модель. Это структура долгосрочного пассивного дохода, в которой ваши заработки растут пропорционально по мере того, как портфели представленных вами людей продолжают расти из месяца в месяц.

Модель основана на простой истине: чем больше бриллиантов удерживается в сети, тем больше ежемесячных скидок генерируется — и эти скидки возвращаются через чётко определённую структуру. Рост происходит тихо и последовательно.

Многие из наших наиболее успешных партнёров начинали как личные клиенты. Сначала они поняли продукт изнутри, и делиться им с другими ощущалось как естественное продолжение собственного убеждения — а не как коммерческое упражнение.

Я с радостью расскажу вам о полной бизнес-модели в удобное для вас время. Никаких сроков, ожиданий и давления. Важно, чтобы у вас была полная картина, прежде чем вы сформируете своё мнение.

С уважением,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LOCALE_MAP: Partial<Record<Language, string>> = {
  en: "en-GB", nl: "nl-NL", de: "de-DE", fr: "fr-FR",
  it: "it-IT", es: "es-ES", pt: "pt-PT", ru: "ru-RU",
  zh: "zh-CN", ar: "ar-SA", th: "th-TH", hi: "hi-IN", vi: "vi-VN",
};

function formatDate(lang: Language): string {
  try {
    return new Date().toLocaleDateString(LOCALE_MAP[lang] ?? "en-GB", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  }
}

function getTemplate(lang: Language, type: LetterType): string {
  return ((LETTERS[lang] ?? LETTERS.en) as Record<LetterType, string>)[type] ?? LETTERS.en[type];
}

function buildLetter(
  lang: Language, type: LetterType,
  customerName: string, adviserName: string,
  adviserCompany: string, adviserMobile: string, adviserContact: string,
): string {
  return getTemplate(lang, type)
    .replace(/\[DATE\]/g, formatDate(lang))
    .replace(/\[CUSTOMER_NAME\]/g, customerName.trim() || "———")
    .replace(/\[ADVISER_NAME\]/g, adviserName.trim() || "———")
    .replace(/\[ADVISER_COMPANY\]/g, adviserCompany.trim() || "———")
    .replace(/\[ADVISER_MOBILE\]/g, adviserMobile.trim() || "———")
    .replace(/\[ADVISER_CONTACT\]/g, adviserContact.trim() || "———");
}

// ─── UI Translations ──────────────────────────────────────────────────────────
const CL_TEXT: Record<string, {
  back: string; title: string; sub: string;
  sectionType: string; sectionYou: string; autoSaved: string;
  sectionCustomer: string; sectionPreview: string;
  typeInvitation: string; typeInvitationSub: string;
  typePresentation: string; typePresentationSub: string;
  typeBusiness: string; typeBusinessSub: string;
  placeholderName: string; placeholderCompany: string;
  placeholderMobile: string; placeholderEmail: string;
  placeholderCustomer: string;
  btnCopy: string; btnCopied: string; btnShare: string; btnPdf: string;
  disclaimer: string;
}> = {
  en: {
    back: "← Back",
    title: "CLIENT LETTER",
    sub: "Generate a professional letter for your prospect. Adviser mode only.",
    sectionType: "LETTER TYPE",
    sectionYou: "YOUR DETAILS",
    autoSaved: "(auto-saved)",
    sectionCustomer: "CUSTOMER",
    sectionPreview: "LETTER PREVIEW",
    typeInvitation: "Invitation", typeInvitationSub: "First contact · JPP1",
    typePresentation: "Presentation", typePresentationSub: "Follow-up · JPP2",
    typeBusiness: "Business", typeBusinessSub: "Opportunity · JPP3",
    placeholderName: "Your full name", placeholderCompany: "Company / organisation",
    placeholderMobile: "Mobile number", placeholderEmail: "Email address",
    placeholderCustomer: "Customer first name",
    btnCopy: "📋  Copy", btnCopied: "✓ Copied!", btnShare: "📤  Share", btnPdf: "📄  PDF",
    disclaimer: "This letter is a professional introduction tool. It does not constitute financial advice and should not be presented as such. Always comply with the regulations of your jurisdiction.",
  },
  nl: {
    back: "← Terug",
    title: "KLANTBRIEF",
    sub: "Genereer een professionele brief voor uw prospect. Alleen voor adviseurs.",
    sectionType: "BRIEFTYPE",
    sectionYou: "UW GEGEVENS",
    autoSaved: "(automatisch opgeslagen)",
    sectionCustomer: "KLANT",
    sectionPreview: "BRIEFVOORBEELD",
    typeInvitation: "Uitnodiging", typeInvitationSub: "Eerste contact · JPP1",
    typePresentation: "Presentatie", typePresentationSub: "Opvolging · JPP2",
    typeBusiness: "Zakelijk", typeBusinessSub: "Kans · JPP3",
    placeholderName: "Uw volledige naam", placeholderCompany: "Bedrijf / organisatie",
    placeholderMobile: "Mobiel nummer", placeholderEmail: "E-mailadres",
    placeholderCustomer: "Voornaam klant",
    btnCopy: "📋  Kopiëren", btnCopied: "✓ Gekopieerd!", btnShare: "📤  Delen", btnPdf: "📄  PDF",
    disclaimer: "Deze brief is een professioneel introductiemiddel. Het vormt geen financieel advies en mag niet als zodanig worden gepresenteerd. Houd u altijd aan de regelgeving van uw jurisdictie.",
  },
  de: {
    back: "← Zurück",
    title: "KUNDENBRIEF",
    sub: "Erstellen Sie einen professionellen Brief für Ihren Interessenten. Nur für Berater.",
    sectionType: "BRIEFTYP",
    sectionYou: "IHRE ANGABEN",
    autoSaved: "(automatisch gespeichert)",
    sectionCustomer: "KUNDE",
    sectionPreview: "BRIEFVORSCHAU",
    typeInvitation: "Einladung", typeInvitationSub: "Erstkontakt · JPP1",
    typePresentation: "Präsentation", typePresentationSub: "Nachfassung · JPP2",
    typeBusiness: "Geschäftlich", typeBusinessSub: "Möglichkeit · JPP3",
    placeholderName: "Ihr vollständiger Name", placeholderCompany: "Unternehmen / Organisation",
    placeholderMobile: "Mobilnummer", placeholderEmail: "E-Mail-Adresse",
    placeholderCustomer: "Vorname des Kunden",
    btnCopy: "📋  Kopieren", btnCopied: "✓ Kopiert!", btnShare: "📤  Teilen", btnPdf: "📄  PDF",
    disclaimer: "Dieser Brief ist ein professionelles Einführungsmittel. Er stellt keine Finanzberatung dar und sollte nicht als solche präsentiert werden. Halten Sie sich stets an die Vorschriften Ihrer Jurisdiktion.",
  },
  fr: {
    back: "← Retour",
    title: "LETTRE CLIENT",
    sub: "Générez une lettre professionnelle pour votre prospect. Réservé aux conseillers.",
    sectionType: "TYPE DE LETTRE",
    sectionYou: "VOS COORDONNÉES",
    autoSaved: "(sauvegarde automatique)",
    sectionCustomer: "CLIENT",
    sectionPreview: "APERÇU DE LA LETTRE",
    typeInvitation: "Invitation", typeInvitationSub: "Premier contact · JPP1",
    typePresentation: "Présentation", typePresentationSub: "Suivi · JPP2",
    typeBusiness: "Affaires", typeBusinessSub: "Opportunité · JPP3",
    placeholderName: "Votre nom complet", placeholderCompany: "Entreprise / organisation",
    placeholderMobile: "Numéro de mobile", placeholderEmail: "Adresse e-mail",
    placeholderCustomer: "Prénom du client",
    btnCopy: "📋  Copier", btnCopied: "✓ Copié !", btnShare: "📤  Partager", btnPdf: "📄  PDF",
    disclaimer: "Cette lettre est un outil d'introduction professionnel. Elle ne constitue pas un conseil financier et ne doit pas être présentée comme tel. Respectez toujours la réglementation de votre juridiction.",
  },
  it: {
    back: "← Indietro",
    title: "LETTERA CLIENTE",
    sub: "Genera una lettera professionale per il tuo prospect. Solo per consulenti.",
    sectionType: "TIPO DI LETTERA",
    sectionYou: "I TUOI DATI",
    autoSaved: "(salvato automaticamente)",
    sectionCustomer: "CLIENTE",
    sectionPreview: "ANTEPRIMA LETTERA",
    typeInvitation: "Invito", typeInvitationSub: "Primo contatto · JPP1",
    typePresentation: "Presentazione", typePresentationSub: "Follow-up · JPP2",
    typeBusiness: "Business", typeBusinessSub: "Opportunità · JPP3",
    placeholderName: "Nome completo", placeholderCompany: "Azienda / organizzazione",
    placeholderMobile: "Numero di cellulare", placeholderEmail: "Indirizzo email",
    placeholderCustomer: "Nome del cliente",
    btnCopy: "📋  Copia", btnCopied: "✓ Copiato!", btnShare: "📤  Condividi", btnPdf: "📄  PDF",
    disclaimer: "Questa lettera è uno strumento di introduzione professionale. Non costituisce consulenza finanziaria e non deve essere presentata come tale. Rispetta sempre la normativa della tua giurisdizione.",
  },
  es: {
    back: "← Volver",
    title: "CARTA AL CLIENTE",
    sub: "Genere una carta profesional para su prospecto. Solo para asesores.",
    sectionType: "TIPO DE CARTA",
    sectionYou: "SUS DATOS",
    autoSaved: "(guardado automáticamente)",
    sectionCustomer: "CLIENTE",
    sectionPreview: "VISTA PREVIA",
    typeInvitation: "Invitación", typeInvitationSub: "Primer contacto · JPP1",
    typePresentation: "Presentación", typePresentationSub: "Seguimiento · JPP2",
    typeBusiness: "Negocio", typeBusinessSub: "Oportunidad · JPP3",
    placeholderName: "Su nombre completo", placeholderCompany: "Empresa / organización",
    placeholderMobile: "Número de móvil", placeholderEmail: "Dirección de email",
    placeholderCustomer: "Nombre del cliente",
    btnCopy: "📋  Copiar", btnCopied: "✓ ¡Copiado!", btnShare: "📤  Compartir", btnPdf: "📄  PDF",
    disclaimer: "Esta carta es una herramienta de introducción profesional. No constituye asesoramiento financiero y no debe presentarse como tal. Cumpla siempre con la normativa de su jurisdicción.",
  },
  pt: {
    back: "← Voltar",
    title: "CARTA AO CLIENTE",
    sub: "Gere uma carta profissional para o seu prospect. Apenas para consultores.",
    sectionType: "TIPO DE CARTA",
    sectionYou: "OS SEUS DADOS",
    autoSaved: "(guardado automaticamente)",
    sectionCustomer: "CLIENTE",
    sectionPreview: "PRÉ-VISUALIZAÇÃO",
    typeInvitation: "Convite", typeInvitationSub: "Primeiro contacto · JPP1",
    typePresentation: "Apresentação", typePresentationSub: "Seguimento · JPP2",
    typeBusiness: "Negócio", typeBusinessSub: "Oportunidade · JPP3",
    placeholderName: "O seu nome completo", placeholderCompany: "Empresa / organização",
    placeholderMobile: "Número de telemóvel", placeholderEmail: "Endereço de email",
    placeholderCustomer: "Primeiro nome do cliente",
    btnCopy: "📋  Copiar", btnCopied: "✓ Copiado!", btnShare: "📤  Partilhar", btnPdf: "📄  PDF",
    disclaimer: "Esta carta é uma ferramenta de introdução profissional. Não constitui aconselhamento financeiro e não deve ser apresentada como tal. Cumpra sempre a regulamentação da sua jurisdição.",
  },
  ru: {
    back: "← Назад",
    title: "ПИСЬМО КЛИЕНТУ",
    sub: "Создайте профессиональное письмо для вашего потенциального клиента. Только для советников.",
    sectionType: "ТИП ПИСЬМА",
    sectionYou: "ВАШИ ДАННЫЕ",
    autoSaved: "(автосохранение)",
    sectionCustomer: "КЛИЕНТ",
    sectionPreview: "ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР",
    typeInvitation: "Приглашение", typeInvitationSub: "Первый контакт · JPP1",
    typePresentation: "Презентация", typePresentationSub: "Продолжение · JPP2",
    typeBusiness: "Бизнес", typeBusinessSub: "Возможность · JPP3",
    placeholderName: "Ваше полное имя", placeholderCompany: "Компания / организация",
    placeholderMobile: "Номер мобильного", placeholderEmail: "Электронная почта",
    placeholderCustomer: "Имя клиента",
    btnCopy: "📋  Копировать", btnCopied: "✓ Скопировано!", btnShare: "📤  Поделиться", btnPdf: "📄  PDF",
    disclaimer: "Это письмо является профессиональным инструментом для знакомства. Оно не является финансовой консультацией и не должно представляться таковой. Всегда соблюдайте законодательство вашей юрисдикции.",
  },
  zh: {
    back: "← 返回",
    title: "客户信函",
    sub: "为您的潜在客户生成专业信函。仅限顾问使用。",
    sectionType: "信函类型",
    sectionYou: "您的信息",
    autoSaved: "（自动保存）",
    sectionCustomer: "客户",
    sectionPreview: "信函预览",
    typeInvitation: "邀请函", typeInvitationSub: "初次联系 · JPP1",
    typePresentation: "演示函", typePresentationSub: "跟进 · JPP2",
    typeBusiness: "商业机会", typeBusinessSub: "机会 · JPP3",
    placeholderName: "您的全名", placeholderCompany: "公司 / 组织",
    placeholderMobile: "手机号码", placeholderEmail: "电子邮件地址",
    placeholderCustomer: "客户名字",
    btnCopy: "📋  复制", btnCopied: "✓ 已复制！", btnShare: "📤  分享", btnPdf: "📄  PDF",
    disclaimer: "此信函是专业介绍工具，不构成财务建议，也不应以此方式呈现。请始终遵守您所在司法管辖区的法规。",
  },
  tl: {
    back: "← Bumalik",
    title: "LIHAM SA KLIYENTE",
    sub: "Lumikha ng propesyonal na liham para sa iyong prospect. Para sa mga adviser lamang.",
    sectionType: "URI NG LIHAM",
    sectionYou: "IYONG MGA DETALYE",
    autoSaved: "(awtomatikong nase-save)",
    sectionCustomer: "KLIYENTE",
    sectionPreview: "PREVIEW NG LIHAM",
    typeInvitation: "Imbitasyon", typeInvitationSub: "Unang contact · JPP1",
    typePresentation: "Presentasyon", typePresentationSub: "Follow-up · JPP2",
    typeBusiness: "Negosyo", typeBusinessSub: "Oportunidad · JPP3",
    placeholderName: "Iyong buong pangalan", placeholderCompany: "Kumpanya / organisasyon",
    placeholderMobile: "Numero ng mobile", placeholderEmail: "Email address",
    placeholderCustomer: "Unang pangalan ng kliyente",
    btnCopy: "📋  Kopyahin", btnCopied: "✓ Nakopya!", btnShare: "📤  Ibahagi", btnPdf: "📄  PDF",
    disclaimer: "Ang liham na ito ay isang propesyonal na tool sa pagpapakilala. Hindi ito bumubuo ng financial advice at hindi dapat ipresenta bilang ganoon. Palaging sumunod sa mga regulasyon ng iyong hurisdiksyon.",
  },
  ar: {
    back: "→ رجوع",
    title: "رسالة العميل",
    sub: "أنشئ رسالة احترافية لعميلك المحتمل. للمستشارين فقط.",
    sectionType: "نوع الرسالة",
    sectionYou: "بياناتك",
    autoSaved: "(حفظ تلقائي)",
    sectionCustomer: "العميل",
    sectionPreview: "معاينة الرسالة",
    typeInvitation: "دعوة", typeInvitationSub: "أول تواصل · JPP1",
    typePresentation: "عرض تقديمي", typePresentationSub: "متابعة · JPP2",
    typeBusiness: "أعمال", typeBusinessSub: "فرصة · JPP3",
    placeholderName: "اسمك الكامل", placeholderCompany: "الشركة / المنظمة",
    placeholderMobile: "رقم الجوال", placeholderEmail: "البريد الإلكتروني",
    placeholderCustomer: "اسم العميل الأول",
    btnCopy: "📋  نسخ", btnCopied: "✓ تم النسخ!", btnShare: "📤  مشاركة", btnPdf: "📄  PDF",
    disclaimer: "هذه الرسالة أداة تعريفية احترافية. لا تُشكّل نصيحة مالية ولا ينبغي تقديمها على هذا النحو. التزم دائماً بالأنظمة المعمول بها في نطاق اختصاصك.",
  },
  th: {
    back: "← กลับ",
    title: "จดหมายถึงลูกค้า",
    sub: "สร้างจดหมายมืออาชีพสำหรับลูกค้าเป้าหมายของคุณ สำหรับที่ปรึกษาเท่านั้น",
    sectionType: "ประเภทจดหมาย",
    sectionYou: "ข้อมูลของคุณ",
    autoSaved: "(บันทึกอัตโนมัติ)",
    sectionCustomer: "ลูกค้า",
    sectionPreview: "ตัวอย่างจดหมาย",
    typeInvitation: "คำเชิญ", typeInvitationSub: "ติดต่อครั้งแรก · JPP1",
    typePresentation: "การนำเสนอ", typePresentationSub: "ติดตามผล · JPP2",
    typeBusiness: "ธุรกิจ", typeBusinessSub: "โอกาส · JPP3",
    placeholderName: "ชื่อเต็มของคุณ", placeholderCompany: "บริษัท / องค์กร",
    placeholderMobile: "หมายเลขมือถือ", placeholderEmail: "ที่อยู่อีเมล",
    placeholderCustomer: "ชื่อแรกของลูกค้า",
    btnCopy: "📋  คัดลอก", btnCopied: "✓ คัดลอกแล้ว!", btnShare: "📤  แชร์", btnPdf: "📄  PDF",
    disclaimer: "จดหมายนี้เป็นเครื่องมือแนะนำระดับมืออาชีพ ไม่ถือเป็นคำแนะนำทางการเงินและไม่ควรนำเสนอเป็นเช่นนั้น โปรดปฏิบัติตามกฎระเบียบของเขตอำนาจศาลของคุณเสมอ",
  },
  hi: {
    back: "← वापस",
    title: "क्लाइंट पत्र",
    sub: "अपने संभावित ग्राहक के लिए एक पेशेवर पत्र बनाएं। केवल सलाहकारों के लिए।",
    sectionType: "पत्र प्रकार",
    sectionYou: "आपका विवरण",
    autoSaved: "(स्वतः सहेजा गया)",
    sectionCustomer: "ग्राहक",
    sectionPreview: "पत्र पूर्वावलोकन",
    typeInvitation: "आमंत्रण", typeInvitationSub: "पहला संपर्क · JPP1",
    typePresentation: "प्रस्तुति", typePresentationSub: "अनुवर्ती · JPP2",
    typeBusiness: "व्यवसाय", typeBusinessSub: "अवसर · JPP3",
    placeholderName: "आपका पूरा नाम", placeholderCompany: "कंपनी / संगठन",
    placeholderMobile: "मोबाइल नंबर", placeholderEmail: "ईमेल पता",
    placeholderCustomer: "ग्राहक का पहला नाम",
    btnCopy: "📋  कॉपी", btnCopied: "✓ कॉपी हो गया!", btnShare: "📤  साझा करें", btnPdf: "📄  PDF",
    disclaimer: "यह पत्र एक पेशेवर परिचय उपकरण है। यह वित्तीय सलाह नहीं है और इसे ऐसे प्रस्तुत नहीं किया जाना चाहिए। हमेशा अपने क्षेत्राधिकार के नियमों का पालन करें।",
  },
  vi: {
    back: "← Quay lại",
    title: "THƯ KHÁCH HÀNG",
    sub: "Tạo thư chuyên nghiệp cho khách hàng tiềm năng của bạn. Chỉ dành cho tư vấn viên.",
    sectionType: "LOẠI THƯ",
    sectionYou: "THÔNG TIN CỦA BẠN",
    autoSaved: "(tự động lưu)",
    sectionCustomer: "KHÁCH HÀNG",
    sectionPreview: "XEM TRƯỚC THƯ",
    typeInvitation: "Lời mời", typeInvitationSub: "Liên hệ đầu tiên · JPP1",
    typePresentation: "Thuyết trình", typePresentationSub: "Theo dõi · JPP2",
    typeBusiness: "Kinh doanh", typeBusinessSub: "Cơ hội · JPP3",
    placeholderName: "Họ và tên đầy đủ", placeholderCompany: "Công ty / tổ chức",
    placeholderMobile: "Số điện thoại di động", placeholderEmail: "Địa chỉ email",
    placeholderCustomer: "Tên khách hàng",
    btnCopy: "📋  Sao chép", btnCopied: "✓ Đã sao chép!", btnShare: "📤  Chia sẻ", btnPdf: "📄  PDF",
    disclaimer: "Thư này là công cụ giới thiệu chuyên nghiệp. Nó không cấu thành lời khuyên tài chính và không nên được trình bày như vậy. Luôn tuân thủ các quy định của khu vực pháp lý của bạn.",
  },
};

// Loads the diamond asset and returns a base64 data URI for use in HTML/PDF.
async function loadLogoBase64(): Promise<string> {
  try {
    const asset = await Asset.fromModule(require("../assets/onboarding/diamond.png")).downloadAsync();
    if (!asset.localUri) return "";
    const b64 = await FileSystem.readAsStringAsync(asset.localUri, { encoding: FileSystem.EncodingType.Base64 });
    return `data:image/png;base64,${b64}`;
  } catch {
    return "";
  }
}

function buildHtml(letter: string, logoDataUri: string): string {
  const escaped = letter
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial Rounded MT Bold', 'Arial Rounded MT', Arial, sans-serif; color: #1e293b; background: #fff; }
  .letterhead {
    background: #0a1628;
    padding: 28px 48px;
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .letterhead img { width: 60px; height: 60px; border-radius: 12px; }
  .brand-title { color: #f1f5f9; font-size: 20px; letter-spacing: 1.5px; font-family: 'Arial Rounded MT Bold', 'Arial Rounded MT', Arial, sans-serif; }
  .brand-sub   { color: #64748b; font-size: 11px; margin-top: 5px; letter-spacing: 1px; font-family: 'Arial Rounded MT Bold', 'Arial Rounded MT', Arial, sans-serif; text-transform: uppercase; }
  .gold-bar    { height: 3px; background: linear-gradient(90deg, #e67e22, #f59e0b 60%, transparent); }
  .body        { padding: 48px 48px 32px; font-size: 14px; line-height: 1.85; color: #1e293b; font-family: 'Arial Rounded MT Bold', 'Arial Rounded MT', Arial, sans-serif; }
  .footer      { margin: 0 48px; padding: 18px 0; border-top: 1px solid #e2e8f0;
                 font-size: 10px; color: #94a3b8; font-family: 'Arial Rounded MT Bold', 'Arial Rounded MT', Arial, sans-serif; }
</style>
</head>
<body>
  <div class="letterhead">
    ${logoDataUri ? `<img src="${logoDataUri}" />` : `<div style="width:60px;height:60px;background:#1e293b;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px;">💎</div>`}
    <div>
      <div class="brand-title">PLAN B · DIAMOND SOLUTION</div>
      <div class="brand-sub">Strategic Wealth Preservation</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="body">${escaped}</div>
  <div class="footer">
    This letter is a professional introduction tool and does not constitute financial advice.
    Always comply with the regulations applicable in your jurisdiction.
  </div>
</body>
</html>`;
}

const STORAGE_KEY = "client_letter_adviser_info";

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ClientLetterScreen() {
  const router = useRouter();
  const { language } = useCalculator();

  const tx = CL_TEXT[language] ?? CL_TEXT.en;
  const [letterType, setLetterType] = useState<LetterType>("invitation");
  const [customerName, setCustomerName] = useState("");
  const [adviserName, setAdviserName] = useState("");
  const [adviserCompany, setAdviserCompany] = useState("");
  const [adviserMobile, setAdviserMobile] = useState("");
  const [adviserContact, setAdviserContact] = useState("");
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    loadLogoBase64().then(setLogoBase64);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        if (saved.adviserName)    setAdviserName(saved.adviserName);
        if (saved.adviserCompany) setAdviserCompany(saved.adviserCompany);
        if (saved.adviserMobile)  setAdviserMobile(saved.adviserMobile);
        if (saved.adviserContact) setAdviserContact(saved.adviserContact);
      } catch { /* ignore */ }
    });
  }, []);

  const saveAdviserInfo = useCallback(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ adviserName, adviserCompany, adviserMobile, adviserContact }));
  }, [adviserName, adviserCompany, adviserMobile, adviserContact]);

  const letter = buildLetter(language, letterType, customerName, adviserName, adviserCompany, adviserMobile, adviserContact);

  const handleCopy = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync(letter);
    saveAdviserInfo();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [letter, saveAdviserInfo]);

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveAdviserInfo();
    try {
      await Share.share({ message: letter });
    } catch { /* cancelled */ }
  }, [letter, saveAdviserInfo]);

  const handlePdf = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveAdviserInfo();
    setPdfLoading(true);
    try {
      const html = buildHtml(letter, logoBase64);
      if (Platform.OS === "web") {
        // Web: open print dialog
        const win = window.open("", "_blank");
        if (win) { win.document.write(html); win.document.close(); win.print(); }
      } else {
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        const safeName = customerName.trim().replace(/[^a-zA-Z0-9]/g, "_") || "Client";
        const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const dest = `${FileSystem.documentDirectory}Letter_${safeName}_${dateStr}.pdf`;
        await FileSystem.moveAsync({ from: uri, to: dest });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(dest, { mimeType: "application/pdf", dialogTitle: "Share Letter PDF" });
        } else {
          await Print.printAsync({ html });
        }
      }
    } catch { /* cancelled */ }
    finally { setPdfLoading(false); }
  }, [letter, logoBase64, saveAdviserInfo]);

  const TYPE_OPTIONS: { key: LetterType; label: string; icon: string; sub: string }[] = [
    { key: "invitation",   label: tx.typeInvitation,   icon: "✉️", sub: tx.typeInvitationSub },
    { key: "presentation", label: tx.typePresentation, icon: "📊", sub: tx.typePresentationSub },
    { key: "business",     label: tx.typeBusiness,     icon: "💼", sub: tx.typeBusinessSub },
  ];

  return (
    <ScreenContainer bgColor="#0a1628">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

          {/* ── Header ── */}
          <View style={S.header}>
            <TouchableOpacity onPress={() => router.back()} style={S.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={S.backText}>{tx.back}</Text>
            </TouchableOpacity>
            <Text style={S.screenTitle}>{tx.title}</Text>
            <Text style={S.screenSub}>{tx.sub}</Text>
          </View>

          {/* ── Letter Type ── */}
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

          {/* ── Adviser Info ── */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>{tx.sectionYou}  <Text style={S.savedNote}>{tx.autoSaved}</Text></Text>
            <TextInput
              style={S.input}
              placeholder={tx.placeholderName}
              placeholderTextColor="#475569"
              value={adviserName}
              onChangeText={setAdviserName}
              onBlur={saveAdviserInfo}
            />
            <TextInput
              style={S.input}
              placeholder={tx.placeholderCompany}
              placeholderTextColor="#475569"
              value={adviserCompany}
              onChangeText={setAdviserCompany}
              onBlur={saveAdviserInfo}
            />
            <TextInput
              style={S.input}
              placeholder={tx.placeholderMobile}
              placeholderTextColor="#475569"
              value={adviserMobile}
              onChangeText={setAdviserMobile}
              onBlur={saveAdviserInfo}
              keyboardType="phone-pad"
            />
            <TextInput
              style={S.input}
              placeholder={tx.placeholderEmail}
              placeholderTextColor="#475569"
              value={adviserContact}
              onChangeText={setAdviserContact}
              onBlur={saveAdviserInfo}
              keyboardType="email-address"
            />
          </View>

          {/* ── Customer Info ── */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>{tx.sectionCustomer}</Text>
            <TextInput
              style={S.input}
              placeholder={tx.placeholderCustomer}
              placeholderTextColor="#475569"
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          {/* ── Letter Preview ── */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>{tx.sectionPreview}</Text>
            <View style={S.previewCard}>
              {/* Letterhead */}
              <View style={S.previewHeader}>
                <Image
                  source={require("../assets/onboarding/diamond.png")}
                  style={S.previewLogo}
                  resizeMode="cover"
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={S.previewBrandTitle}>PLAN B · DIAMOND SOLUTION</Text>
                  <Text style={S.previewBrandSub}>Strategic Wealth Preservation</Text>
                </View>
              </View>
              <View style={S.previewGoldBar} />
              <Text style={S.previewText}>{letter}</Text>
            </View>
          </View>

          {/* ── Actions ── */}
          <View style={S.actionRow}>
            <TouchableOpacity style={[S.actionBtn, S.copyBtn]} onPress={handleCopy} activeOpacity={0.85}>
              <Text style={S.actionBtnText}>{copied ? tx.btnCopied : tx.btnCopy}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.actionBtn, S.shareBtn]} onPress={handleShare} activeOpacity={0.85}>
              <Text style={S.actionBtnText}>{tx.btnShare}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.actionBtn, S.pdfBtn]} onPress={handlePdf} activeOpacity={0.85} disabled={pdfLoading}>
              <Text style={S.actionBtnText}>{pdfLoading ? "⏳" : tx.btnPdf}</Text>
            </TouchableOpacity>
          </View>

          <Text style={S.disclaimer}>{tx.disclaimer}</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const GOLD  = "#e67e22";
const NAVY  = "#0d1a2a";
// Arial Rounded MT Bold: built-in on iOS, graceful fallback on Android/web
const FONT  = "ArialRoundedMTBold";

const S = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backBtn: {
    marginBottom: 10,
  },
  backText: {
    color: GOLD,
    fontSize: 14,
    fontFamily: FONT,
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: FONT,
    color: "#f1f5f9",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  screenSub: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    fontFamily: FONT,
  },

  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONT,
    color: "#475569",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  savedNote: {
    fontSize: 10,
    fontFamily: FONT,
    color: "#334155",
    letterSpacing: 0,
  },

  // Type selector
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#334155",
  },
  typeRowActive: {
    borderColor: GOLD,
    backgroundColor: "rgba(230,126,34,0.06)",
  },
  typeIcon: { fontSize: 22 },
  typeLabel: {
    fontSize: 15,
    fontFamily: FONT,
    color: "#94a3b8",
  },
  typeLabelActive: { color: GOLD },
  typeSub: {
    fontSize: 11,
    fontFamily: FONT,
    color: "#475569",
    marginTop: 2,
  },
  typeCheck: {
    fontSize: 16,
    color: GOLD,
    fontFamily: FONT,
  },

  // Inputs
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#f1f5f9",
    fontSize: 14,
    fontFamily: FONT,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },

  // Preview
  previewCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  previewHeader: {
    backgroundColor: "#0a1628",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  previewLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  previewBrandTitle: {
    color: "#f1f5f9",
    fontFamily: FONT,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  previewBrandSub: {
    color: "#64748b",
    fontFamily: FONT,
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  previewGoldBar: {
    height: 3,
    backgroundColor: "#e67e22",
  },
  previewText: {
    fontSize: 13,
    color: "#1e293b",
    lineHeight: 21,
    fontFamily: FONT,
    padding: 20,
  },

  // Actions
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  copyBtn: {
    backgroundColor: GOLD,
  },
  shareBtn: {
    backgroundColor: "#1e40af",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  pdfBtn: {
    backgroundColor: "#065f46",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  actionBtnText: {
    color: "#fff",
    fontFamily: FONT,
    fontSize: 15,
  },

  disclaimer: {
    marginHorizontal: 16,
    marginTop: 16,
    fontSize: 11,
    fontFamily: FONT,
    color: "#334155",
    lineHeight: 16,
    textAlign: "center",
  },
});
