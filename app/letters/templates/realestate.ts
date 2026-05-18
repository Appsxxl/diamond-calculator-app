import type { Language } from "@/lib/translations";

export type RealEstateLetterType = "referral" | "jv";

// Placeholders: [DATE] [RECIPIENT_NAME] [ADVISER_NAME] [ADVISER_COMPANY] [ADVISER_MOBILE] [ADVISER_CONTACT]

const T: Partial<Record<Language, Record<RealEstateLetterType, string>>> & { en: Record<RealEstateLetterType, string> } = {

  en: {
    referral:
`[DATE]

Dear [RECIPIENT_NAME],

I hope this message finds you well.

I am writing to explore whether there may be a natural connection between our respective work and client bases.

I am an independent adviser affiliated with Plan B · Diamond Solution — a platform that works with high-net-worth individuals seeking to preserve and grow wealth through physical diamond investment, entirely outside traditional financial markets.

The clients I work with tend to be financially sophisticated individuals and families who are actively managing wealth across multiple asset classes. A number of them hold or are seeking to acquire property — and when those conversations arise, I currently have no trusted referral partner in the real estate space to whom I can direct them confidently.

I believe there is a genuine and mutually respectful opportunity here. If you serve clients with similar profiles, it may be worth a brief conversation to see whether an informal referral relationship could be of value to both of us.

There is no formal structure proposed at this stage — only the possibility of an occasional, two-way introduction where it is genuinely relevant.

I would be happy to connect at a time that suits you.

Warm regards,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Dear [RECIPIENT_NAME],

I am writing to you directly with a proposal I believe could be of genuine mutual benefit.

I am an independent adviser with Plan B · Diamond Solution, working with a growing portfolio of high-net-worth clients across multiple jurisdictions. These are individuals and families with significant liquid assets — clients who are typically active in real estate, either as buyers, developers, or long-term investors.

I am interested in establishing a formal referral partnership with a select number of trusted real estate professionals. The arrangement I have in mind is straightforward: where I have a client with a relevant real estate need, I introduce them to you. Where you have a client seeking wealth preservation or alternative asset solutions outside traditional markets, you introduce them to me. No exclusivity. No complicated structure. Simply a professional relationship that serves both our clients better.

I have found that clients who are serious about their wealth tend to value being introduced to trusted specialists rather than searching the market themselves. A well-structured referral partnership creates a better experience for everyone involved.

I would welcome the opportunity to meet for 30 minutes to discuss whether this is a fit for both of us. I am selective about the partnerships I pursue, and I am approaching you because your reputation and client profile align closely with the kind of professional I want to work alongside.

I look forward to hearing from you.

Warm regards,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  nl: {
    referral:
`[DATE]

Beste [RECIPIENT_NAME],

Ik hoop dat dit bericht u goed bereikt.

Ik schrijf u om te verkennen of er een natuurlijke verbinding kan zijn tussen ons respectieve werk en klantenbestand.

Ik ben een onafhankelijk adviseur geaffilieerd met Plan B · Diamond Solution — een platform dat werkt met vermogende particulieren die hun vermogen willen bewaren en laten groeien via fysieke diamantinvesteringen, volledig buiten traditionele financiële markten.

De klanten met wie ik werk, zijn financieel onderlegde particulieren en families die actief vermogen beheren over meerdere activaklassen. Een aantal van hen bezit onroerend goed of is op zoek naar vastgoed — en wanneer die gesprekken ontstaan, heb ik momenteel geen vertrouwde doorverwijspartner in de vastgoedsector.

Ik geloof dat er een oprechte en wederzijds respectvolle kans is. Als u klanten bedient met vergelijkbare profielen, kan het de moeite waard zijn voor een kort gesprek om te zien of een informele doorverwijsrelatie voor ons beiden van waarde kan zijn.

Er wordt op dit moment geen formele structuur voorgesteld — alleen de mogelijkheid van een occasionele, wederzijdse introductie waar dit werkelijk relevant is.

Ik maak graag kennis op een tijdstip dat u schikt.

Met vriendelijke groet,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Beste [RECIPIENT_NAME],

Ik schrijf u direct met een voorstel waarvan ik geloof dat het voor beiden oprecht waardevol kan zijn.

Ik ben een onafhankelijk adviseur bij Plan B · Diamond Solution en werk met een groeiend portfolio van vermogende klanten in meerdere rechtsgebieden. Dit zijn particulieren en families met aanzienlijke liquide middelen — klanten die doorgaans actief zijn in onroerend goed, als kopers, ontwikkelaars of langetermijninvesteerders.

Ik ben geïnteresseerd in het opzetten van een formeel doorverwijspartnerschap met een selecte groep betrouwbare vastgoedprofessionals. De regeling die ik voor ogen heb, is eenvoudig: wanneer ik een klant heb met een relevante vastgoedbehoefte, verwijs ik deze naar u door. Wanneer u een klant heeft die op zoek is naar vermogensbehoud of alternatieve oplossingen buiten traditionele markten, verwijst u deze naar mij door. Geen exclusiviteit. Geen ingewikkelde structuur. Gewoon een professionele relatie die beide klanten beter bedient.

Ik heb gemerkt dat klanten die serieus zijn over hun vermogen, het waarderen om aan vertrouwde specialisten te worden voorgesteld in plaats van zelf de markt te doorzoeken.

Ik zou graag 30 minuten afspreken om te bespreken of dit voor ons beiden iets is. Ik ben selectief in de partnerschappen die ik nastreef, en ik benader u omdat uw reputatie en klantprofiel nauw aansluiten bij het soort professional waarmee ik wil samenwerken.

Ik zie uw reactie met belangstelling tegemoet.

Met vriendelijke groet,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  de: {
    referral:
`[DATE]

Sehr geehrte/r [RECIPIENT_NAME],

ich hoffe, diese Nachricht erreicht Sie in guter Verfassung.

Ich schreibe Ihnen, um zu erkunden, ob es eine natürliche Verbindung zwischen unserer jeweiligen Arbeit und Kundenbasis geben könnte.

Ich bin ein unabhängiger Berater, der mit Plan B · Diamond Solution verbunden ist — einer Plattform, die mit vermögenden Privatpersonen zusammenarbeitet, die ihr Vermögen durch physische Diamantinvestitionen erhalten und vermehren möchten, vollständig außerhalb traditioneller Finanzmärkte.

Die Kunden, mit denen ich arbeite, sind finanziell versierte Privatpersonen und Familien, die aktiv Vermögen über mehrere Anlageklassen verwalten. Eine Reihe von ihnen besitzt Immobilien oder ist auf der Suche danach — und wenn diese Gespräche entstehen, habe ich derzeit keinen vertrauenswürdigen Empfehlungspartner im Immobilienbereich.

Ich glaube, dass hier eine echte und gegenseitig respektvolle Gelegenheit besteht. Wenn Sie Kunden mit ähnlichen Profilen betreuen, könnte es sich lohnen, kurz zu sprechen, ob eine informelle Empfehlungsbeziehung für uns beide von Wert sein könnte.

Es wird zu diesem Zeitpunkt keine formelle Struktur vorgeschlagen — nur die Möglichkeit einer gelegentlichen, gegenseitigen Vorstellung, wo dies wirklich relevant ist.

Ich freue mich auf ein Gespräch zu einem für Sie geeigneten Zeitpunkt.

Mit freundlichen Grüßen,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Sehr geehrte/r [RECIPIENT_NAME],

ich schreibe Ihnen direkt mit einem Vorschlag, von dem ich glaube, dass er für beide Seiten echten Mehrwert schaffen kann.

Ich bin ein unabhängiger Berater bei Plan B · Diamond Solution und arbeite mit einem wachsenden Portfolio vermögender Kunden in mehreren Jurisdiktionen. Es handelt sich um Privatpersonen und Familien mit erheblichen liquiden Mitteln — Kunden, die typischerweise in Immobilien aktiv sind, als Käufer, Entwickler oder langfristige Investoren.

Ich bin daran interessiert, eine formelle Empfehlungspartnerschaft mit einer ausgewählten Anzahl vertrauenswürdiger Immobilienprofis aufzubauen. Die Vereinbarung, die ich mir vorstelle, ist unkompliziert: Wenn ich einen Kunden mit einem relevanten Immobilienbedarf habe, stelle ich ihn Ihnen vor. Wenn Sie einen Kunden haben, der nach Vermögenserhalt oder alternativen Lösungen außerhalb traditioneller Märkte sucht, stellen Sie ihn mir vor. Keine Exklusivität. Keine komplizierte Struktur. Einfach eine professionelle Beziehung, die beiden Kunden besser dient.

Ich würde mich über die Möglichkeit freuen, mich 30 Minuten zu treffen, um zu besprechen, ob dies für uns beide passt. Ich bin selektiv bei den Partnerschaften, die ich eingehe, und ich wende mich an Sie, weil Ihr Ruf und Kundenprofil eng mit der Art von Fachmann übereinstimmen, mit dem ich zusammenarbeiten möchte.

Ich freue mich auf Ihre Rückmeldung.

Mit freundlichen Grüßen,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  fr: {
    referral:
`[DATE]

Cher/Chère [RECIPIENT_NAME],

J'espère que ce message vous trouve en bonne santé.

Je vous écris pour explorer s'il pourrait y avoir une connexion naturelle entre nos travaux respectifs et nos bases de clients.

Je suis un conseiller indépendant affilié à Plan B · Diamond Solution — une plateforme qui travaille avec des particuliers fortunés cherchant à préserver et à développer leur patrimoine via l'investissement en diamants physiques, entièrement en dehors des marchés financiers traditionnels.

Les clients avec lesquels je travaille sont des particuliers et des familles financièrement avertis qui gèrent activement leur patrimoine sur plusieurs classes d'actifs. Un certain nombre d'entre eux possèdent ou cherchent à acquérir des biens immobiliers — et lorsque ces conversations surviennent, je n'ai actuellement aucun partenaire de référence de confiance dans le secteur immobilier.

Je crois qu'il y a une opportunité réelle et mutuellement respectueuse ici. Si vous servez des clients avec des profils similaires, cela pourrait valoir la peine d'une brève conversation pour voir si une relation de référence informelle pourrait être utile pour nous deux.

Aucune structure formelle n'est proposée à ce stade — seulement la possibilité d'une présentation mutuelle occasionnelle là où c'est véritablement pertinent.

Je serais heureux de me connecter à un moment qui vous convient.

Cordialement,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Cher/Chère [RECIPIENT_NAME],

Je vous écris directement avec une proposition que je crois pouvoir être d'un bénéfice mutuel réel.

Je suis un conseiller indépendant chez Plan B · Diamond Solution, travaillant avec un portefeuille croissant de clients fortunés dans plusieurs juridictions. Ce sont des particuliers et des familles avec des actifs liquides importants — des clients qui sont généralement actifs dans l'immobilier, en tant qu'acheteurs, promoteurs ou investisseurs à long terme.

Je suis intéressé à établir un partenariat de référence formel avec un nombre sélectionné de professionnels immobiliers de confiance. L'arrangement que j'ai en tête est simple : lorsque j'ai un client avec un besoin immobilier pertinent, je vous le présente. Lorsque vous avez un client cherchant la préservation du patrimoine ou des solutions alternatives en dehors des marchés traditionnels, vous me le présentez. Pas d'exclusivité. Pas de structure compliquée. Simplement une relation professionnelle qui sert mieux nos deux clientèles.

Je souhaiterais avoir l'opportunité de se retrouver 30 minutes pour discuter si cela convient à nous deux. Je suis sélectif dans les partenariats que je poursuis, et je vous approche parce que votre réputation et profil de clientèle correspondent étroitement au type de professionnel avec lequel je souhaite travailler.

Je me réjouis de votre réponse.

Cordialement,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  es: {
    referral:
`[DATE]

Estimado/a [RECIPIENT_NAME],

Espero que este mensaje le encuentre bien.

Le escribo para explorar si podría haber una conexión natural entre nuestros respectivos trabajos y bases de clientes.

Soy un asesor independiente afiliado a Plan B · Diamond Solution — una plataforma que trabaja con personas de alto patrimonio que buscan preservar y hacer crecer su riqueza a través de la inversión en diamantes físicos, completamente fuera de los mercados financieros tradicionales.

Los clientes con los que trabajo son personas y familias financieramente sofisticadas que gestionan activamente su patrimonio en múltiples clases de activos. Varios de ellos poseen o buscan adquirir propiedades — y cuando surgen esas conversaciones, actualmente no tengo un socio de referencia de confianza en el sector inmobiliario.

Creo que existe una oportunidad genuina y mutuamente respetuosa. Si atiende a clientes con perfiles similares, podría valer la pena una breve conversación para ver si una relación de referencia informal podría ser de valor para ambos.

No se propone ninguna estructura formal en esta etapa — solo la posibilidad de una presentación mutua ocasional donde sea genuinamente relevante.

Me encantaría conectar en un momento que le convenga.

Atentamente,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Estimado/a [RECIPIENT_NAME],

Le escribo directamente con una propuesta que creo que podría ser de genuino beneficio mutuo.

Soy un asesor independiente en Plan B · Diamond Solution, trabajando con una cartera creciente de clientes de alto patrimonio en múltiples jurisdicciones. Son personas y familias con activos líquidos significativos — clientes que típicamente son activos en bienes raíces, ya sea como compradores, promotores o inversores a largo plazo.

Estoy interesado en establecer una asociación de referencia formal con un número selecto de profesionales inmobiliarios de confianza. El acuerdo que tengo en mente es sencillo: cuando tengo un cliente con una necesidad inmobiliaria relevante, se lo presento. Cuando tiene un cliente que busca preservación patrimonial o soluciones alternativas fuera de los mercados tradicionales, me lo presenta. Sin exclusividad. Sin estructura complicada. Simplemente una relación profesional que sirva mejor a ambas clientelas.

Me gustaría tener la oportunidad de reunirme 30 minutos para discutir si esto es adecuado para ambos. Soy selectivo con las asociaciones que busco, y me dirijo a usted porque su reputación y perfil de clientes se alinean estrechamente con el tipo de profesional con el que quiero trabajar.

Espero su respuesta.

Atentamente,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  it: {
    referral:
`[DATE]

Gentile [RECIPIENT_NAME],

Spero che questo messaggio la trovi in buona salute.

Le scrivo per esplorare se potrebbe esserci una connessione naturale tra il nostro rispettivo lavoro e le nostre basi di clienti.

Sono un consulente indipendente affiliato a Plan B · Diamond Solution — una piattaforma che lavora con individui ad alto patrimonio netto che cercano di preservare e far crescere la loro ricchezza attraverso investimenti in diamanti fisici, completamente al di fuori dei mercati finanziari tradizionali.

I clienti con cui lavoro sono individui e famiglie finanziariamente sofisticati che gestiscono attivamente il patrimonio su più classi di asset. Un certo numero di loro possiede o cerca di acquisire proprietà immobiliari — e quando emergono queste conversazioni, attualmente non ho un partner di riferimento di fiducia nel settore immobiliare.

Credo che ci sia un'opportunità genuina e mutuamente rispettosa. Se serve clienti con profili simili, potrebbe valere la pena di una breve conversazione per vedere se una relazione di referral informale potrebbe essere di valore per entrambi.

Non viene proposta alcuna struttura formale in questa fase — solo la possibilità di una presentazione reciproca occasionale dove sia genuinamente rilevante.

Sarei felice di connettermi in un momento adatto a lei.

Cordiali saluti,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Gentile [RECIPIENT_NAME],

Le scrivo direttamente con una proposta che ritengo possa essere di genuino vantaggio reciproco.

Sono un consulente indipendente presso Plan B · Diamond Solution, che lavora con un portafoglio crescente di clienti ad alto patrimonio netto in più giurisdizioni. Sono individui e famiglie con attività liquide significative — clienti che sono tipicamente attivi nel settore immobiliare, come acquirenti, sviluppatori o investitori a lungo termine.

Sono interessato a stabilire una partnership di referral formale con un numero selezionato di professionisti immobiliari di fiducia. L'accordo che ho in mente è semplice: quando ho un cliente con un'esigenza immobiliare rilevante, glielo presento. Quando ha un cliente che cerca la preservazione del patrimonio o soluzioni alternative al di fuori dei mercati tradizionali, me lo presenta. Nessuna esclusività. Nessuna struttura complicata. Semplicemente una relazione professionale che serve meglio entrambe le clientele.

Vorrei avere l'opportunità di incontrarci per 30 minuti per discutere se questo è adatto a entrambi. Sono selettivo nelle partnership che perseguo, e mi rivolgo a lei perché la sua reputazione e il profilo dei clienti si allineano strettamente con il tipo di professionista con cui voglio lavorare.

In attesa di una sua risposta.

Cordiali saluti,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  pt: {
    referral:
`[DATE]

Caro/a [RECIPIENT_NAME],

Espero que esta mensagem o/a encontre bem.

Escrevo-lhe para explorar se poderá existir uma conexão natural entre o nosso respetivo trabalho e bases de clientes.

Sou um consultor independente afiliado ao Plan B · Diamond Solution — uma plataforma que trabalha com indivíduos de elevado patrimônio que procuram preservar e fazer crescer a sua riqueza através do investimento em diamantes físicos, completamente fora dos mercados financeiros tradicionais.

Os clientes com quem trabalho são indivíduos e famílias financeiramente sofisticados que gerem ativamente o patrimônio em múltiplas classes de ativos. Vários deles possuem ou procuram adquirir propriedades — e quando essas conversas surgem, atualmente não tenho um parceiro de referência de confiança no setor imobiliário.

Acredito que existe aqui uma oportunidade genuína e mutuamente respeitosa. Se serve clientes com perfis semelhantes, pode valer a pena uma breve conversa para ver se uma relação de referência informal poderia ser de valor para ambos.

Não é proposta nenhuma estrutura formal nesta fase — apenas a possibilidade de uma apresentação mútua ocasional onde seja genuinamente relevante.

Teria muito prazer em conversar num momento que lhe seja conveniente.

Com os melhores cumprimentos,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Caro/a [RECIPIENT_NAME],

Escrevo-lhe diretamente com uma proposta que acredito poder ser de genuíno benefício mútuo.

Sou um consultor independente no Plan B · Diamond Solution, a trabalhar com uma carteira crescente de clientes de elevado patrimônio em múltiplas jurisdições. São indivíduos e famílias com ativos líquidos significativos — clientes que tipicamente são ativos no setor imobiliário, como compradores, promotores ou investidores de longo prazo.

Estou interessado em estabelecer uma parceria de referência formal com um número selecionado de profissionais imobiliários de confiança. O acordo que tenho em mente é simples: quando tenho um cliente com uma necessidade imobiliária relevante, apresento-o/a. Quando tem um cliente que procura preservação patrimonial ou soluções alternativas fora dos mercados tradicionais, apresenta-mo/a. Sem exclusividade. Sem estrutura complicada. Simplesmente uma relação profissional que serve melhor ambas as clientelas.

Gostaria de ter a oportunidade de nos reunirmos durante 30 minutos para discutir se isto é adequado para ambos. Sou seletivo nas parcerias que estabeleço, e contacto-o/a porque a sua reputação e perfil de clientes se alinham estreitamente com o tipo de profissional com quem quero trabalhar.

Aguardo a sua resposta.

Com os melhores cumprimentos,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  ru: {
    referral:
`[DATE]

Уважаемый/ая [RECIPIENT_NAME],

Надеюсь, это сообщение застанет Вас в добром здравии.

Пишу Вам, чтобы изучить, может ли существовать естественная связь между нашей соответствующей работой и клиентской базой.

Я независимый советник, аффилированный с Plan B · Diamond Solution — платформой, которая работает с состоятельными людьми, стремящимися сохранить и приумножить капитал через инвестиции в физические бриллианты, полностью за пределами традиционных финансовых рынков.

Клиенты, с которыми я работаю, — это финансово грамотные физические лица и семьи, активно управляющие капиталом в нескольких классах активов. Часть из них владеет недвижимостью или намерена её приобрести — и когда возникают такие разговоры, у меня в настоящее время нет надёжного партнёра по рекомендациям в сфере недвижимости.

Убеждён, что здесь существует реальная и взаимно уважительная возможность для сотрудничества. Если Вы обслуживаете клиентов со схожими профилями, возможно, стоит провести краткую беседу, чтобы выяснить, может ли неформальные отношения по обмену рекомендациями быть ценны для нас обоих.

На данном этапе не предлагается никакой формальной структуры — только возможность случайного взаимного знакомства там, где это действительно актуально.

Буду рад пообщаться в удобное для Вас время.

С уважением,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Уважаемый/ая [RECIPIENT_NAME],

Пишу Вам напрямую с предложением, которое, по моему убеждению, может принести реальную взаимную выгоду.

Я независимый советник в Plan B · Diamond Solution, работающий с растущим портфелем состоятельных клиентов в нескольких юрисдикциях. Это физические лица и семьи со значительными ликвидными активами — клиенты, как правило, активно действующие на рынке недвижимости в качестве покупателей, застройщиков или долгосрочных инвесторов.

Я заинтересован в установлении формального партнёрства по обмену рекомендациями с избранным числом надёжных профессионалов в сфере недвижимости. Схема, которую я предлагаю, проста: когда у меня есть клиент с актуальной потребностью в недвижимости, я направляю его к Вам. Когда у Вас есть клиент, заинтересованный в сохранении капитала или альтернативных решениях за пределами традиционных рынков, Вы направляете его ко мне. Никакой эксклюзивности. Никаких сложных структур. Просто профессиональные отношения, которые лучше служат обеим клиентским базам.

Я хотел бы встретиться на 30 минут, чтобы обсудить, подходит ли это нам обоим. Я избирателен в партнёрствах, которые выстраиваю, и обращаюсь к Вам потому, что Ваша репутация и профиль клиентов тесно совпадают с типом профессионала, с которым я хочу сотрудничать.

С нетерпением жду Вашего ответа.

С уважением,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  zh: {
    referral:
`[DATE]

尊敬的[RECIPIENT_NAME]，

希望这封信能在您状态良好时送达。

我写信是为了探讨我们各自的工作和客户群之间是否存在自然的联系。

我是Plan B · Diamond Solution的独立顾问——该平台与寻求通过实物钻石投资在传统金融市场之外保值和增值财富的高净值人士合作。

与我合作的客户是在多个资产类别中积极管理财富的成熟投资者和家庭。其中一些人拥有房产或正在寻求购置房产——每当这类对话出现时，我目前在房地产领域还没有值得信赖的推介合作伙伴。

我相信这里存在真实而相互尊重的合作机会。如果您服务具有类似特征的客户，也许值得进行简短的交流，看看非正式的推介关系是否对我们双方都有价值。

目前不提议任何正式结构——只是在真正相关的情况下进行偶尔的双向介绍的可能性。

很乐意在您方便的时候建立联系。

此致，

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

尊敬的[RECIPIENT_NAME]，

我直接写信给您，提出一个我认为可能对双方都有真正益处的合作方案。

我是Plan B · Diamond Solution的独立顾问，与多个司法管辖区不断增长的高净值客户群合作。这些是拥有大量流动资产的个人和家庭——通常作为买家、开发商或长期投资者活跃于房地产市场。

我有意与少数值得信赖的房地产专业人士建立正式的推介合作关系。我设想的安排很简单：当我有客户有相关房地产需求时，我将其介绍给您；当您有客户寻求传统市场以外的财富保值或替代方案时，您将其介绍给我。没有排他性，没有复杂结构，只是一种更好地服务双方客户的专业关系。

我希望能有机会安排30分钟会面，讨论这是否适合我们双方。我对所寻求的合作关系非常谨慎，联系您是因为您的声誉和客户群与我希望合作的专业人士类型高度吻合。

期待您的回复。

此致，

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  tl: {
    referral:
`[DATE]

Mahal na [RECIPIENT_NAME],

Umaasa akong mabuti ang iyong kalagayan.

Sumusulat ako upang tuklasin kung maaaring mayroong natural na koneksyon sa pagitan ng aming kani-kanilang trabaho at mga base ng kliyente.

Ako ay isang independyenteng adviser na kaakibat ng Plan B · Diamond Solution — isang platform na nagtatrabaho sa mga high-net-worth na indibidwal na naghahanap na mapreserba at palakihin ang kanilang kayamanan sa pamamagitan ng pisikal na pamumuhunan sa brilyante, ganap na labas sa mga tradisyonal na pamilihang pinansyal.

Ang mga kliyenteng aking pinagtratrabahuhan ay mga pinansyal na bihasa na indibidwal at pamilya na aktibong namamahala ng kayamanan sa maraming klase ng asset. Ang ilan sa kanila ay nagmamay-ari o naghahanap na makakuha ng ari-arian — at kapag lumitaw ang mga ganitong usapan, wala akong mapagkakatiwalaang referral partner sa larangan ng real estate.

Naniniwala akong may tunay at magkaparehong pagkakataon dito. Kung naglilingkod ka sa mga kliyenteng may katulad na profile, maaaring sulit ang isang maikling pag-uusap upang makita kung ang isang impormal na relasyon ng referral ay maaaring magbunga para sa ating dalawa.

Walang pormal na istraktura ang iminumungkahi sa yugtong ito — tanging ang posibilidad ng paminsan-minsang, magkaparehong pagpapakilala kung saan ito ay tunay na may kaugnayan.

Ikinalulugod kong makipag-ugnayan sa isang oras na angkop sa iyo.

Taos-pusong paggalang,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Mahal na [RECIPIENT_NAME],

Direkta akong sumusulat sa iyo na may mungkahi na naniniwala akong maaaring maging tunay na kapwa-kapaki-pakinabang.

Ako ay isang independyenteng adviser sa Plan B · Diamond Solution, nagtatrabaho sa lumalaking portfolio ng mga high-net-worth na kliyente sa maraming hurisdiksyon. Sila ay mga indibidwal at pamilya na may malaking likidong assets — mga kliyenteng karaniwang aktibo sa real estate, bilang mga mamimili, developer, o pangmatagalang investor.

Interesado akong magtatag ng pormal na referral partnership sa isang piling bilang ng mga pinagkakatiwalaang propesyonal sa real estate. Ang kasunduan na iniisip ko ay simple: kapag mayroon akong kliyenteng may kaugnayan na pangangailangan sa real estate, ipapakilala ko siya sa iyo. Kapag mayroon kang kliyenteng naghahanap ng wealth preservation o alternatibong solusyon labas sa mga tradisyonal na merkado, ipapakilala mo siya sa akin. Walang exclusivity. Walang kumplikadong istraktura. Simpleng propesyonal na relasyon na mas mahusay na naglilingkod sa ating mga kliyente.

Nais kong mag-iskedyul ng 30 minuto upang talakayin kung ito ay angkop para sa ating dalawa. Maingat ako sa mga partnership na aking hinahanap, at nakikipag-ugnayan ako sa iyo dahil ang iyong reputasyon at profile ng kliyente ay malapit na nakahanay sa uri ng propesyonal na nais kong makipagtulungan.

Inaabangan ang iyong tugon.

Taos-pusong paggalang,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  ar: {
    referral:
`[DATE]

عزيزي/عزيزتي [RECIPIENT_NAME]،

أتمنى أن تكون بخير عند استلامك هذه الرسالة.

أكتب إليك لاستكشاف ما إذا كان يمكن أن يكون هناك ارتباط طبيعي بين عملنا ومجموعات عملائنا.

أنا مستشار مستقل منتسب إلى Plan B · Diamond Solution — منصة تعمل مع أصحاب الثروات الكبيرة الساعين إلى الحفاظ على ثرواتهم وتنميتها من خلال الاستثمار في الألماس المادي، خارج الأسواق المالية التقليدية تماماً.

العملاء الذين أعمل معهم هم أفراد وعائلات متمرسون مالياً يديرون الثروات بنشاط عبر فئات أصول متعددة. عدد منهم يمتلك عقارات أو يسعى إلى اقتنائها — وعندما تنشأ تلك المحادثات، لا يوجد لديّ حالياً شريك إحالة موثوق في قطاع العقارات.

أعتقد أن هناك فرصة حقيقية ومحترمة من الطرفين. إذا كنت تخدم عملاء بملامح مماثلة، فقد يستحق الأمر محادثة قصيرة لمعرفة ما إذا كانت علاقة إحالة غير رسمية يمكن أن تكون ذات قيمة لكلينا.

لا تُقترح أي هيكلة رسمية في هذه المرحلة — فقط إمكانية تقديم تعريفات متبادلة عرضية حيثما يكون ذلك ذا صلة حقيقية.

يسعدني التواصل في وقت يناسبك.

مع خالص التحية،

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

عزيزي/عزيزتي [RECIPIENT_NAME]،

أكتب إليك مباشرة بمقترح أعتقد أنه يمكن أن يكون ذا فائدة متبادلة حقيقية.

أنا مستشار مستقل في Plan B · Diamond Solution، أعمل مع محفظة متنامية من العملاء ذوي الثروات الكبيرة في ولايات قضائية متعددة. هم أفراد وعائلات يمتلكون أصولاً سائلة ضخمة — عملاء نشطون في العقارات عادةً كمشترين أو مطورين أو مستثمرين على المدى البعيد.

أنا مهتم بإنشاء شراكة إحالة رسمية مع عدد محدد من المحترفين الموثوقين في قطاع العقارات. الترتيب الذي أتصوره بسيط: عندما يكون لديّ عميل بحاجة عقارية ذات صلة، أُعرّفه بك. وعندما يكون لديك عميل يبحث عن حفظ الثروة أو حلول بديلة خارج الأسواق التقليدية، تُعرّفه بي. لا حصرية. لا هيكل معقد. مجرد علاقة مهنية تخدم عملاء كلينا بشكل أفضل.

أودّ أن نجتمع لمدة 30 دقيقة لمناقشة ما إذا كان هذا مناسباً لكلينا. أنا انتقائي في الشراكات التي أسعى إليها، وأتواصل معك لأن سمعتك وملف عملائك يتوافقان بشكل وثيق مع نوع المحترف الذي أرغب في العمل معه.

أتطلع إلى سماع ردك.

مع خالص التحية،

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  th: {
    referral:
`[DATE]

เรียน คุณ[RECIPIENT_NAME]

หวังว่าข้อความนี้จะถึงคุณในช่วงเวลาที่ดี

ฉันเขียนมาเพื่อสำรวจว่าอาจมีการเชื่อมโยงตามธรรมชาติระหว่างงานและฐานลูกค้าของเราหรือไม่

ฉันเป็นที่ปรึกษาอิสระที่เกี่ยวข้องกับ Plan B · Diamond Solution — แพลตฟอร์มที่ทำงานกับบุคคลมั่งคั่งที่ต้องการรักษาและเพิ่มพูนความมั่งคั่งผ่านการลงทุนในเพชรจริง ซึ่งอยู่นอกตลาดการเงินแบบดั้งเดิมโดยสิ้นเชิง

ลูกค้าที่ฉันทำงานด้วยคือบุคคลและครอบครัวที่มีความเชี่ยวชาญด้านการเงินซึ่งจัดการความมั่งคั่งอย่างแข็งขันในหลายประเภทสินทรัพย์ หลายคนในนั้นมีหรือกำลังมองหาอสังหาริมทรัพย์ — และเมื่อการสนทนาเหล่านั้นเกิดขึ้น ฉันยังไม่มีพาร์ทเนอร์แนะนำที่เชื่อถือได้ในด้านอสังหาริมทรัพย์

ฉันเชื่อว่ามีโอกาสที่แท้จริงและเคารพซึ่งกันและกันที่นี่ หากคุณให้บริการลูกค้าที่มีโปรไฟล์คล้ายกัน อาจคุ้มค่าที่จะพูดคุยสั้นๆ เพื่อดูว่าความสัมพันธ์การแนะนำอย่างไม่เป็นทางการจะเป็นประโยชน์สำหรับเราทั้งสองหรือไม่

ยังไม่มีการเสนอโครงสร้างที่เป็นทางการในขั้นตอนนี้ — เพียงแค่ความเป็นไปได้ของการแนะนำร่วมกันเป็นครั้งคราวที่เกี่ยวข้องจริงๆ

ยินดีที่จะติดต่อในเวลาที่เหมาะสมสำหรับคุณ

ด้วยความนับถือ

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

เรียน คุณ[RECIPIENT_NAME]

ฉันเขียนถึงคุณโดยตรงพร้อมข้อเสนอที่ฉันเชื่อว่าจะเป็นประโยชน์ร่วมกันอย่างแท้จริง

ฉันเป็นที่ปรึกษาอิสระที่ Plan B · Diamond Solution ทำงานกับลูกค้ามั่งคั่งที่เติบโตในหลายเขตอำนาจศาล พวกเขาคือบุคคลและครอบครัวที่มีสินทรัพย์สภาพคล่องสูง — ลูกค้าที่มักแข็งขันในอสังหาริมทรัพย์ไม่ว่าจะเป็นผู้ซื้อ นักพัฒนา หรือนักลงทุนระยะยาว

ฉันสนใจที่จะสร้างพาร์ทเนอร์ชิปการแนะนำที่เป็นทางการกับนักวิชาชีพด้านอสังหาริมทรัพย์ที่เชื่อถือได้จำนวนหนึ่ง ข้อตกลงที่ฉันคิดไว้นั้นตรงไปตรงมา: เมื่อฉันมีลูกค้าที่มีความต้องการด้านอสังหาริมทรัพย์ที่เกี่ยวข้อง ฉันจะแนะนำพวกเขาให้คุณ เมื่อคุณมีลูกค้าที่ต้องการการรักษาความมั่งคั่งหรือโซลูชันทางเลือกนอกตลาดแบบดั้งเดิม คุณแนะนำพวกเขาให้ฉัน ไม่มีสิทธิ์พิเศษ ไม่มีโครงสร้างซับซ้อน เพียงแค่ความสัมพันธ์ระดับมืออาชีพที่ให้บริการลูกค้าของเราทั้งคู่ได้ดียิ่งขึ้น

ฉันต้องการนัดหมาย 30 นาทีเพื่อหารือว่านี้เหมาะกับเราทั้งสองหรือไม่ ฉันเลือกสรรในพาร์ทเนอร์ชิปที่ฉันแสวงหา และฉันติดต่อคุณเพราะชื่อเสียงและโปรไฟล์ลูกค้าของคุณสอดคล้องอย่างใกล้ชิดกับประเภทของมืออาชีพที่ฉันต้องการทำงานด้วย

รอคอยการติดต่อกลับจากคุณ

ด้วยความนับถือ

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  hi: {
    referral:
`[DATE]

प्रिय [RECIPIENT_NAME],

आशा है यह संदेश आपको अच्छे स्वास्थ्य में पाएगा।

मैं यह पता लगाने के लिए लिख रहा हूँ कि क्या हमारे संबंधित काम और ग्राहक आधार के बीच कोई स्वाभाविक संबंध हो सकता है।

मैं Plan B · Diamond Solution से संबद्ध एक स्वतंत्र सलाहकार हूँ — एक ऐसा प्लेटफ़ॉर्म जो उन उच्च-नेट-वर्थ व्यक्तियों के साथ काम करता है जो भौतिक हीरे के निवेश के माध्यम से पारंपरिक वित्तीय बाजारों के पूरी तरह बाहर अपनी संपत्ति को संरक्षित और बढ़ाना चाहते हैं।

मेरे ग्राहक वित्तीय रूप से परिष्कृत व्यक्ति और परिवार हैं जो कई परिसंपत्ति वर्गों में सक्रिय रूप से संपत्ति का प्रबंधन करते हैं। उनमें से कुछ संपत्ति रखते हैं या अधिग्रहण करना चाहते हैं — और जब ऐसी बातचीत होती है, तो मेरे पास वर्तमान में रियल एस्टेट क्षेत्र में कोई विश्वसनीय रेफरल पार्टनर नहीं है।

मेरा मानना है कि यहाँ एक वास्तविक और पारस्परिक रूप से सम्मानजनक अवसर है। यदि आप समान प्रोफ़ाइल वाले ग्राहकों की सेवा करते हैं, तो यह देखने के लिए संक्षिप्त बातचीत के लायक हो सकता है कि क्या एक अनौपचारिक रेफरल संबंध हम दोनों के लिए मूल्यवान हो सकता है।

इस चरण में कोई औपचारिक संरचना प्रस्तावित नहीं है — केवल जहाँ वास्तव में प्रासंगिक हो वहाँ कभी-कभी पारस्परिक परिचय की संभावना।

आपकी सुविधा के अनुसार जुड़ने में मुझे खुशी होगी।

सादर,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

प्रिय [RECIPIENT_NAME],

मैं आपको सीधे एक प्रस्ताव के साथ लिख रहा हूँ जिसे मुझे विश्वास है कि वास्तविक पारस्परिक लाभ का हो सकता है।

मैं Plan B · Diamond Solution में एक स्वतंत्र सलाहकार हूँ, जो कई न्यायक्षेत्रों में उच्च-नेट-वर्थ ग्राहकों के बढ़ते पोर्टफोलियो के साथ काम कर रहा हूँ। ये महत्वपूर्ण तरल संपत्ति वाले व्यक्ति और परिवार हैं — ग्राहक जो आमतौर पर रियल एस्टेट में सक्रिय हैं, चाहे खरीदार, डेवलपर, या दीर्घकालिक निवेशक के रूप में।

मैं विश्वसनीय रियल एस्टेट पेशेवरों की एक चुनिंदा संख्या के साथ एक औपचारिक रेफरल पार्टनरशिप स्थापित करने में रुचि रखता हूँ। मेरे मन में जो व्यवस्था है वह सरल है: जब मेरे पास किसी प्रासंगिक रियल एस्टेट आवश्यकता वाला ग्राहक हो, तो मैं उन्हें आपसे परिचित कराता हूँ। जब आपके पास पारंपरिक बाजारों के बाहर धन संरक्षण या वैकल्पिक समाधान की तलाश करने वाला ग्राहक हो, तो आप उन्हें मुझसे परिचित कराते हैं। कोई विशेषाधिकार नहीं। कोई जटिल संरचना नहीं। बस एक पेशेवर संबंध जो हमारे दोनों ग्राहकों की बेहतर सेवा करता है।

मैं यह चर्चा करने के लिए 30 मिनट का समय निर्धारित करना चाहूँगा कि यह हम दोनों के लिए उचित है या नहीं। मैं अपनी पार्टनरशिप में चुनिंदा हूँ, और आपसे संपर्क कर रहा हूँ क्योंकि आपकी प्रतिष्ठा और ग्राहक प्रोफ़ाइल उस प्रकार के पेशेवर के साथ निकटता से मेल खाती है जिसके साथ मैं काम करना चाहता हूँ।

आपकी प्रतिक्रिया की प्रतीक्षा में।

सादर,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  vi: {
    referral:
`[DATE]

Kính gửi [RECIPIENT_NAME],

Tôi hy vọng thư này đến tay bạn trong lúc bạn đang khỏe mạnh.

Tôi viết để khám phá liệu có thể có sự kết nối tự nhiên giữa công việc và cơ sở khách hàng của chúng ta hay không.

Tôi là một cố vấn độc lập liên kết với Plan B · Diamond Solution — một nền tảng làm việc với các cá nhân có tài sản ròng cao đang tìm kiếm để bảo toàn và phát triển tài sản thông qua đầu tư kim cương vật lý, hoàn toàn ngoài thị trường tài chính truyền thống.

Các khách hàng tôi làm việc cùng là những cá nhân và gia đình am hiểu tài chính, đang tích cực quản lý tài sản qua nhiều loại tài sản. Một số trong họ sở hữu hoặc đang tìm mua bất động sản — và khi những cuộc trò chuyện đó phát sinh, hiện tại tôi chưa có đối tác giới thiệu đáng tin cậy trong lĩnh vực bất động sản.

Tôi tin rằng có một cơ hội thực sự và được tôn trọng lẫn nhau tại đây. Nếu bạn phục vụ những khách hàng có hồ sơ tương tự, có thể đáng để có một cuộc trò chuyện ngắn để xem liệu mối quan hệ giới thiệu không chính thức có thể có giá trị cho cả hai chúng ta hay không.

Không có cấu trúc chính thức nào được đề xuất ở giai đoạn này — chỉ là khả năng giới thiệu qua lại thỉnh thoảng khi thực sự liên quan.

Tôi rất vui khi được kết nối vào thời điểm thuận tiện cho bạn.

Trân trọng,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    jv:
`[DATE]

Kính gửi [RECIPIENT_NAME],

Tôi viết thư trực tiếp cho bạn với một đề xuất mà tôi tin rằng có thể mang lại lợi ích thực sự cho cả hai bên.

Tôi là cố vấn độc lập tại Plan B · Diamond Solution, làm việc với danh mục khách hàng có tài sản ròng cao ngày càng tăng ở nhiều khu vực pháp lý. Đây là những cá nhân và gia đình có tài sản lỏng đáng kể — những khách hàng thường hoạt động tích cực trong bất động sản, dù là người mua, nhà phát triển hay nhà đầu tư dài hạn.

Tôi quan tâm đến việc thiết lập quan hệ đối tác giới thiệu chính thức với một số chuyên gia bất động sản đáng tin cậy được lựa chọn. Thỏa thuận tôi nghĩ đến rất đơn giản: khi tôi có khách hàng có nhu cầu bất động sản liên quan, tôi giới thiệu họ với bạn. Khi bạn có khách hàng tìm kiếm bảo toàn tài sản hoặc các giải pháp thay thế ngoài thị trường truyền thống, bạn giới thiệu họ với tôi. Không độc quyền. Không cấu trúc phức tạp. Chỉ đơn giản là mối quan hệ chuyên nghiệp phục vụ khách hàng của cả hai chúng ta tốt hơn.

Tôi muốn sắp xếp 30 phút để thảo luận xem điều này có phù hợp với cả hai chúng ta không. Tôi chọn lọc trong các quan hệ đối tác mà tôi theo đuổi, và tôi tiếp cận bạn vì danh tiếng và hồ sơ khách hàng của bạn phù hợp chặt chẽ với loại chuyên gia mà tôi muốn hợp tác.

Mong nhận được hồi âm từ bạn.

Trân trọng,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },
};

export function getRealEstateTemplate(lang: Language, type: RealEstateLetterType): string {
  return (T[lang] ?? T.en)[type] ?? T.en[type];
}

export function buildRealEstateLetter(
  lang: Language,
  type: RealEstateLetterType,
  recipientName: string,
  adviserName: string,
  adviserCompany: string,
  adviserMobile: string,
  adviserContact: string,
  date: string,
): string {
  return getRealEstateTemplate(lang, type)
    .replace(/\[DATE\]/g, date)
    .replace(/\[RECIPIENT_NAME\]/g, recipientName || "———")
    .replace(/\[ADVISER_NAME\]/g, adviserName || "———")
    .replace(/\[ADVISER_COMPANY\]/g, adviserCompany || "———")
    .replace(/\[ADVISER_MOBILE\]/g, adviserMobile || "———")
    .replace(/\[ADVISER_CONTACT\]/g, adviserContact || "———");
}
