import type { Language } from "@/lib/translations";

export type HnwFormality = "formal" | "ultra";
export type HnwNetWorth = "1m-5m" | "5m-25m" | "25m+";
export type HnwRelationship = "cold" | "warm" | "referred";
export type HnwAssetInterest = "real-estate" | "portfolio" | "wealth" | "retirement";

export interface HnwLetterParams {
  recipientName: string;
  formalAddress: string;
  relationship: HnwRelationship;
  referredBy?: string;
  assetInterest: HnwAssetInterest;
  netWorth: HnwNetWorth;
  formality: HnwFormality;
  adviserName: string;
  company: string;
  mobile: string;
  contact: string;
  date: string;
}

type P = {
  salFormal: (a: string, n: string) => string;
  salUltra: (a: string, n: string) => string;
  opCold: string;
  opWarm: string;
  opReferred: (by: string) => string;
  intro: (n: string, c: string) => string;
  assetRe: string;
  assetPort: string;
  assetWealth: string;
  assetRetire: string;
  nwLow: string;
  nwMid: string;
  nwHigh: string;
  ctaFormal: string;
  ctaUltra: string;
  closeFormal: string;
  closeUltra: string;
};

const PHRASES: Record<Language, P> = {
  en: {
    salFormal: (a, n) => `Dear ${a} ${n},`,
    salUltra: (a, n) => `Esteemed ${a} ${n},`,
    opCold: "I trust this letter finds you in excellent health and spirits.",
    opWarm: "I hope this correspondence finds you well, and I take this opportunity to reconnect with you personally.",
    opReferred: (by) => `It is with great pleasure that I write to you following a personal introduction by ${by}, who holds you in the highest regard.`,
    intro: (n, c) => `My name is ${n}, Senior Financial Adviser at ${c}. We work with a carefully selected group of high-net-worth individuals to deliver bespoke financial solutions that go well beyond what is typically available in the mainstream market.`,
    assetRe: "Our expertise spans premium real estate financing, cross-border property structures, and portfolio-grade investment assets — strategies that have enabled our clients to grow and protect generational wealth through strategic property exposure.",
    assetPort: "Our investment advisory specialises in bespoke portfolio construction, including structured products, alternative assets, and tax-efficient investment vehicles typically reserved for institutional and family-office clients.",
    assetWealth: "Our core focus is the preservation and structured growth of significant wealth — through capital protection strategies, multi-jurisdictional diversification, and exclusive access to vehicles not available through conventional financial channels.",
    assetRetire: "We help high-net-worth individuals architect retirement income strategies designed to sustain their lifestyle indefinitely — drawing on annuities, structured passive income, and legacy planning frameworks.",
    nwLow: "We take pride in delivering institutional-grade advisory with a level of personal attention that larger institutions cannot provide.",
    nwMid: "Our services are extended exclusively to clients who meet a defined threshold of financial standing, ensuring a calibre of advice and access commensurate with your position.",
    nwHigh: "At the highest levels of wealth, our engagement is entirely discreet and personalised — conducted with the sensitivity and selectivity that extraordinary financial standing demands.",
    ctaFormal: "I would welcome the opportunity to arrange a private, no-obligation consultation at a time of your choosing — whether in person or via a secure video call.",
    ctaUltra: "Should you find this introduction worthy of your consideration, I would consider it a privilege to arrange a private meeting entirely on your terms and at your complete convenience.",
    closeFormal: "Yours sincerely,",
    closeUltra: "I remain, with the greatest respect and sincere regards,",
  },
  nl: {
    salFormal: (a, n) => `Geachte ${a} ${n},`,
    salUltra: (a, n) => `Hooggeachte ${a} ${n},`,
    opCold: "Ik hoop dat deze brief u in goede gezondheid bereikt.",
    opWarm: "Ik hoop dat het u goed gaat en maak van deze gelegenheid gebruik om persoonlijk contact met u op te nemen.",
    opReferred: (by) => `Het is met groot genoegen dat ik u schrijf naar aanleiding van een persoonlijke introductie door ${by}, die u in de hoogste achting houdt.`,
    intro: (n, c) => `Mijn naam is ${n}, Senior Financieel Adviseur bij ${c}. Wij werken met een zorgvuldig geselecteerde groep vermogende particulieren aan op maat gemaakte financiële oplossingen die ver uitstijgen boven wat gangbaar beschikbaar is.`,
    assetRe: "Onze expertise omvat premium vastgoedfinanciering, grensoverschrijdende vastgoedstructuren en beleggingsobjecten van portefeuilleniveau — strategieën die onze cliënten in staat hebben gesteld generationeel vermogen te laten groeien en te beschermen.",
    assetPort: "Onze beleggingsadvisering is gespecialiseerd in maatwerk portefeuilleconstructie, inclusief gestructureerde producten, alternatieve activa en belastingefficiënte beleggingsvehikels die normaal voorbehouden zijn aan institutionele cliënten en family offices.",
    assetWealth: "Onze kernfocus is de preservering en gestructureerde groei van aanzienlijk vermogen — via kapitaalbeschermingsstrategieën, multi-jurisdictionele diversificatie en exclusieve toegang tot vehikels die niet beschikbaar zijn via conventionele financiële kanalen.",
    assetRetire: "Wij helpen vermogende particulieren bij het ontwerpen van pensioenstrategieën die hun levensstijl duurzaam ondersteunen — gebaseerd op annuïteiten, gestructureerd passief inkomen en estate planning.",
    nwLow: "Wij zijn trots op het leveren van institutionele kwaliteitsadvisering met een persoonlijke aandacht die grote instellingen niet kunnen bieden.",
    nwMid: "Onze diensten worden uitsluitend aangeboden aan cliënten die voldoen aan een specifieke drempel van financieel vermogen, zodat het advies- en toegangsniveau in overeenstemming is met uw positie.",
    nwHigh: "Op het hoogste vermogensniveau is onze dienstverlening volledig discreet en gepersonaliseerd — uitgevoerd met de gevoeligheid en selectiviteit die buitengewone financiële positie vereist.",
    ctaFormal: "Ik zou graag een privé, vrijblijvend gesprek willen arrangeren op een tijdstip geheel naar uw keuze — persoonlijk of via een beveiligde videocall.",
    ctaUltra: "Mocht u deze introductie uw aandacht waardig achten, dan zou ik het als een voorrecht beschouwen een privé ontmoeting te arrangeren op tijdstip en voorwaarden volledig naar uw keuze.",
    closeFormal: "Met vriendelijke groet,",
    closeUltra: "Met de grootste achting en hoogachting,",
  },
  de: {
    salFormal: (a, n) => `Sehr geehrte(r) ${a} ${n},`,
    salUltra: (a, n) => `Hochgeschätzte(r) ${a} ${n},`,
    opCold: "Ich hoffe, dass dieses Schreiben Sie bei bester Gesundheit und guter Stimmung erreicht.",
    opWarm: "Ich hoffe, es geht Ihnen gut, und nutze diese Gelegenheit, um persönlich mit Ihnen in Kontakt zu treten.",
    opReferred: (by) => `Es ist mir eine große Freude, Ihnen zu schreiben, nachdem mich ${by} persönlich an Sie verwiesen hat und die höchste Wertschätzung für Sie ausgedrückt hat.`,
    intro: (n, c) => `Mein Name ist ${n}, Senior Financial Adviser bei ${c}. Wir arbeiten mit einer sorgfältig ausgewählten Gruppe vermögender Privatkunden zusammen, um maßgeschneiderte Finanzlösungen zu liefern, die weit über das hinausgehen, was am regulären Markt verfügbar ist.`,
    assetRe: "Unsere Expertise umfasst erstklassige Immobilienfinanzierung, grenzüberschreitende Immobilienstrukturen und portfoliofähige Investitionsobjekte — Strategien, die unseren Kunden ermöglicht haben, generationelles Vermögen durch strategisches Immobilienengagement zu wachsen und zu schützen.",
    assetPort: "Unsere Anlageberatung ist auf maßgeschneiderte Portfoliokonstruktion spezialisiert, einschließlich strukturierter Produkte, alternativer Anlageklassen und steuereffizienter Anlagevehikel, die normalerweise institutionellen Kunden und Family Offices vorbehalten sind.",
    assetWealth: "Unser Kernfokus liegt auf der Erhaltung und strukturierten Vermehrung bedeutenden Vermögens — durch Kapitalschutzstrategien, multi-jurisdiktionale Diversifikation und exklusiven Zugang zu Vehikeln, die über herkömmliche Finanzkanäle nicht verfügbar sind.",
    assetRetire: "Wir helfen vermögenden Privatpersonen, Renteneinkommensstrategien zu entwickeln, die ihren Lebensstil dauerhaft sichern — auf Basis von Renten, strukturiertem passivem Einkommen und Nachlassplanungsrahmen.",
    nwLow: "Wir sind stolz darauf, institutionelle Beratungsqualität mit einer persönlichen Aufmerksamkeit zu liefern, die größere Institutionen nicht bieten können.",
    nwMid: "Unsere Dienstleistungen werden ausschließlich Kunden angeboten, die einen definierten Vermögensschwellenwert erfüllen, um ein Beratungs- und Zugangsniveau sicherzustellen, das Ihrer Position gerecht wird.",
    nwHigh: "Auf dem höchsten Vermögensniveau ist unser Engagement vollständig diskret und personalisiert — durchgeführt mit der Sensibilität und Selektivität, die außergewöhnliche finanzielle Verhältnisse erfordern.",
    ctaFormal: "Ich würde mich freuen, ein vertrauliches, unverbindliches Gespräch zu arrangieren — zu einem Zeitpunkt Ihrer Wahl, persönlich oder per sicherem Videoanruf.",
    ctaUltra: "Sollten Sie diese Kontaktaufnahme Ihrer Aufmerksamkeit würdig erachten, wäre es mir eine Ehre, ein privates Treffen ganz nach Ihren Vorstellungen und zu Ihrer vollständigen Bequemlichkeit zu arrangieren.",
    closeFormal: "Mit freundlichen Grüßen,",
    closeUltra: "Ich verbleibe mit größtem Respekt und aufrichtiger Hochachtung,",
  },
  fr: {
    salFormal: (a, n) => `Cher/Chère ${a} ${n},`,
    salUltra: (a, n) => `Estimé(e) ${a} ${n},`,
    opCold: "J'espère que cette lettre vous trouve en excellente santé et de bonne humeur.",
    opWarm: "J'espère que vous allez bien et je saisis cette occasion pour vous contacter personnellement.",
    opReferred: (by) => `C'est avec un grand plaisir que je vous écris suite à une introduction personnelle de ${by}, qui vous tient en très haute estime.`,
    intro: (n, c) => `Je m'appelle ${n}, Conseiller Financier Senior chez ${c}. Nous travaillons avec un groupe soigneusement sélectionné de particuliers fortunés pour offrir des solutions financières sur mesure qui dépassent largement ce qui est généralement disponible sur le marché traditionnel.`,
    assetRe: "Notre expertise couvre le financement immobilier premium, les structures immobilières transfrontalières et les actifs d'investissement de niveau portefeuille — des stratégies qui ont permis à nos clients de développer et de protéger un patrimoine générationnel grâce à une exposition immobilière stratégique.",
    assetPort: "Notre conseil en investissement est spécialisé dans la construction de portefeuilles sur mesure, incluant des produits structurés, des actifs alternatifs et des véhicules d'investissement fiscalement efficaces généralement réservés aux clients institutionnels et aux family offices.",
    assetWealth: "Notre focus principal est la préservation et la croissance structurée d'un patrimoine significatif — à travers des stratégies de protection du capital, une diversification multi-juridictionnelle et un accès exclusif à des véhicules non disponibles via les canaux financiers conventionnels.",
    assetRetire: "Nous aidons les particuliers fortunés à concevoir des stratégies de revenus de retraite conçues pour maintenir leur style de vie indéfiniment — en s'appuyant sur des rentes, des revenus passifs structurés et des cadres de planification successorale.",
    nwLow: "Nous sommes fiers de fournir une expertise de qualité institutionnelle avec un niveau d'attention personnelle que les grandes institutions ne peuvent pas offrir.",
    nwMid: "Nos services sont proposés exclusivement aux clients qui répondent à un seuil défini de standing financier, garantissant un niveau de conseil et d'accès à la hauteur de votre position.",
    nwHigh: "Aux niveaux les plus élevés de patrimoine, notre engagement est entièrement discret et personnalisé — mené avec la sensibilité et la sélectivité qu'exige une situation financière extraordinaire.",
    ctaFormal: "Je serais ravi de pouvoir organiser une consultation privée et sans engagement à un moment de votre choix — en personne ou via un appel vidéo sécurisé.",
    ctaUltra: "Si vous estimez cette introduction digne de votre considération, je considérerais comme un privilège d'organiser une rencontre privée entièrement selon vos conditions et à votre entière convenance.",
    closeFormal: "Cordialement,",
    closeUltra: "Je reste, avec le plus grand respect et mes sincères hommages,",
  },
  es: {
    salFormal: (a, n) => `Estimado/a ${a} ${n}:`,
    salUltra: (a, n) => `Distinguido/a ${a} ${n}:`,
    opCold: "Confío en que esta carta le encuentre gozando de excelente salud y bienestar.",
    opWarm: "Espero que se encuentre bien y aprovecho esta oportunidad para ponerme en contacto con usted personalmente.",
    opReferred: (by) => `Es con gran placer que le escribo tras una presentación personal de ${by}, quien le tiene en la más alta estima.`,
    intro: (n, c) => `Mi nombre es ${n}, Asesor Financiero Senior en ${c}. Trabajamos con un grupo cuidadosamente seleccionado de personas de alto patrimonio para ofrecer soluciones financieras a medida que van mucho más allá de lo que suele estar disponible en el mercado convencional.`,
    assetRe: "Nuestra experiencia abarca la financiación inmobiliaria premium, las estructuras de propiedad transfronterizas y los activos de inversión de nivel de cartera — estrategias que han permitido a nuestros clientes hacer crecer y proteger el patrimonio generacional mediante una exposición inmobiliaria estratégica.",
    assetPort: "Nuestro asesoramiento en inversiones está especializado en la construcción de carteras a medida, incluyendo productos estructurados, activos alternativos y vehículos de inversión fiscalmente eficientes normalmente reservados para clientes institucionales y family offices.",
    assetWealth: "Nuestro enfoque central es la preservación y el crecimiento estructurado de patrimonios significativos — a través de estrategias de protección de capital, diversificación multijurisdiccional y acceso exclusivo a vehículos no disponibles a través de canales financieros convencionales.",
    assetRetire: "Ayudamos a personas de alto patrimonio a diseñar estrategias de ingresos para la jubilación orientadas a mantener su estilo de vida indefinidamente — apoyándose en rentas vitalicias, ingresos pasivos estructurados y marcos de planificación patrimonial.",
    nwLow: "Nos enorgullece ofrecer asesoramiento de calidad institucional con un nivel de atención personal que las grandes instituciones no pueden proporcionar.",
    nwMid: "Nuestros servicios se ofrecen exclusivamente a clientes que cumplen un umbral definido de posición financiera, garantizando un nivel de asesoramiento y acceso acorde con su posición.",
    nwHigh: "En los niveles más altos de patrimonio, nuestro compromiso es completamente discreto y personalizado — llevado a cabo con la sensibilidad y selectividad que exige una situación financiera extraordinaria.",
    ctaFormal: "Me encantaría tener la oportunidad de concertar una consulta privada y sin compromiso en un momento de su elección — ya sea en persona o mediante una videollamada segura.",
    ctaUltra: "Si considera esta presentación digna de su consideración, tendría el privilegio de organizar un encuentro privado completamente en sus términos y a su entera conveniencia.",
    closeFormal: "Un cordial saludo,",
    closeUltra: "Quedo, con el mayor respeto y mis más sinceros saludos,",
  },
  it: {
    salFormal: (a, n) => `Gentile ${a} ${n},`,
    salUltra: (a, n) => `Stimatissimo/a ${a} ${n},`,
    opCold: "Mi auguro che questa lettera La raggiunga in ottima salute e serenità.",
    opWarm: "Spero che stia bene e colgo questa occasione per ricontattarLa personalmente.",
    opReferred: (by) => `È con grande piacere che Le scrivo a seguito di una presentazione personale di ${by}, che La tiene in altissima considerazione.`,
    intro: (n, c) => `Mi chiamo ${n}, Consulente Finanziario Senior presso ${c}. Lavoriamo con un gruppo accuratamente selezionato di persone ad alto patrimonio per offrire soluzioni finanziarie su misura che vanno ben oltre ciò che è tipicamente disponibile sul mercato tradizionale.`,
    assetRe: "La nostra competenza spazia dal finanziamento immobiliare premium alle strutture immobiliari transfrontaliere e agli asset di investimento di livello portafoglio — strategie che hanno permesso ai nostri clienti di far crescere e proteggere il patrimonio generazionale.",
    assetPort: "La nostra consulenza sugli investimenti è specializzata nella costruzione di portafogli su misura, inclusi prodotti strutturati, asset alternativi e veicoli di investimento fiscalmente efficienti tipicamente riservati a clienti istituzionali e family office.",
    assetWealth: "Il nostro focus principale è la preservazione e la crescita strutturata di patrimoni significativi — attraverso strategie di protezione del capitale, diversificazione multi-giurisdizionale e accesso esclusivo a veicoli non disponibili attraverso i canali finanziari convenzionali.",
    assetRetire: "Aiutiamo le persone ad alto patrimonio a progettare strategie di reddito pensionistico per mantenere il loro stile di vita indefinitamente — basandosi su rendite, reddito passivo strutturato e framework di pianificazione patrimoniale.",
    nwLow: "Siamo orgogliosi di offrire consulenza di qualità istituzionale con un livello di attenzione personale che le grandi istituzioni non possono fornire.",
    nwMid: "I nostri servizi sono offerti esclusivamente a clienti che soddisfano una soglia definita di standing finanziario, garantendo un livello di consulenza e accesso commisurato alla Sua posizione.",
    nwHigh: "Ai livelli più elevati di patrimonio, il nostro impegno è completamente discreto e personalizzato — condotto con la sensibilità e la selettività che una situazione finanziaria straordinaria richiede.",
    ctaFormal: "Sarei lieto di organizzare una consulenza privata e senza impegno in un momento di Sua scelta — di persona o tramite una videochiamata sicura.",
    ctaUltra: "Qualora ritenesse questa presentazione degna della Sua considerazione, sarebbe per me un privilegio organizzare un incontro privato interamente alle Sue condizioni e alla Sua piena comodità.",
    closeFormal: "Cordiali saluti,",
    closeUltra: "Rimango, con il massimo rispetto e i più sinceri ossequi,",
  },
  pt: {
    salFormal: (a, n) => `Caro/a ${a} ${n},`,
    salUltra: (a, n) => `Estimado/a ${a} ${n},`,
    opCold: "Espero que esta carta o/a encontre com excelente saúde e bem-estar.",
    opWarm: "Espero que esteja bem e aproveito esta oportunidade para entrar em contato pessoalmente.",
    opReferred: (by) => `É com grande prazer que lhe escrevo após uma apresentação pessoal de ${by}, que o/a tem em alta estima.`,
    intro: (n, c) => `Meu nome é ${n}, Consultor Financeiro Sênior na ${c}. Trabalhamos com um grupo cuidadosamente selecionado de indivíduos de alto patrimônio para oferecer soluções financeiras personalizadas que vão muito além do que normalmente está disponível no mercado convencional.`,
    assetRe: "Nossa expertise abrange financiamento imobiliário premium, estruturas de propriedade transfronteiriças e ativos de investimento de nível de carteira — estratégias que permitiram aos nossos clientes desenvolver e proteger patrimônio geracional através de exposição imobiliária estratégica.",
    assetPort: "Nossa consultoria de investimentos é especializada em construção de carteiras personalizadas, incluindo produtos estruturados, ativos alternativos e veículos de investimento fiscalmente eficientes normalmente reservados a clientes institucionais e family offices.",
    assetWealth: "Nosso foco central é a preservação e o crescimento estruturado de patrimônio significativo — através de estratégias de proteção de capital, diversificação multi-jurisdicional e acesso exclusivo a veículos não disponíveis através de canais financeiros convencionais.",
    assetRetire: "Ajudamos indivíduos de alto patrimônio a arquitetar estratégias de renda de aposentadoria projetadas para sustentar seu estilo de vida indefinidamente — baseando-se em anuidades, renda passiva estruturada e frameworks de planejamento de legado.",
    nwLow: "Temos orgulho em oferecer assessoria de qualidade institucional com um nível de atenção pessoal que instituições maiores não conseguem proporcionar.",
    nwMid: "Nossos serviços são oferecidos exclusivamente a clientes que atendem a um limite definido de posição financeira, garantindo um nível de assessoria e acesso compatível com sua posição.",
    nwHigh: "Nos níveis mais elevados de patrimônio, nosso engajamento é inteiramente discreto e personalizado — conduzido com a sensibilidade e seletividade que uma situação financeira extraordinária exige.",
    ctaFormal: "Ficaria honrado em organizar uma consulta privada e sem compromisso em um momento de sua escolha — pessoalmente ou por videochamada segura.",
    ctaUltra: "Caso considere esta apresentação digna de sua consideração, seria um privilégio organizar uma reunião privada completamente nos seus termos e à sua total conveniência.",
    closeFormal: "Atenciosamente,",
    closeUltra: "Permaneço, com o maior respeito e sinceras considerações,",
  },
  ru: {
    salFormal: (a, n) => `Уважаемый/ая ${a} ${n},`,
    salUltra: (a, n) => `Глубокоуважаемый/ая ${a} ${n},`,
    opCold: "Надеюсь, что это письмо застанет Вас в добром здравии и прекрасном расположении духа.",
    opWarm: "Надеюсь, у Вас всё хорошо, и пользуюсь этой возможностью, чтобы лично обратиться к Вам.",
    opReferred: (by) => `Я пишу Вам с большим удовольствием по личной рекомендации ${by}, который/ая отзывается о Вас с высочайшей похвалой.`,
    intro: (n, c) => `Меня зовут ${n}, я Старший Финансовый Советник в ${c}. Мы работаем с тщательно отобранной группой состоятельных клиентов, предлагая индивидуальные финансовые решения, далеко выходящие за рамки того, что обычно доступно на традиционном рынке.`,
    assetRe: "Наша экспертиза охватывает премиальное финансирование недвижимости, трансграничные имущественные структуры и инвестиционные активы портфельного уровня — стратегии, позволившие нашим клиентам наращивать и защищать капитал поколений через стратегическое инвестирование в недвижимость.",
    assetPort: "Наше инвестиционное консультирование специализируется на создании индивидуальных портфелей, включая структурированные продукты, альтернативные активы и налогово-эффективные инвестиционные инструменты, обычно доступные только институциональным клиентам и family offices.",
    assetWealth: "Наш основной фокус — сохранение и структурированный рост значительного капитала через стратегии защиты активов, мультиюрисдикционную диверсификацию и эксклюзивный доступ к инструментам, недоступным через обычные финансовые каналы.",
    assetRetire: "Мы помогаем состоятельным клиентам выстраивать стратегии пенсионного дохода, направленные на поддержание их образа жизни на неограниченный срок — включая аннуитеты, структурированный пассивный доход и инструменты наследственного планирования.",
    nwLow: "Мы гордимся тем, что обеспечиваем институциональное качество консультаций с уровнем личного внимания, недоступным в крупных учреждениях.",
    nwMid: "Наши услуги предоставляются исключительно клиентам, отвечающим установленному порогу финансового положения, что обеспечивает уровень консультаций и доступ, соответствующий Вашему статусу.",
    nwHigh: "На высших уровнях состоятельности наше взаимодействие носит полностью конфиденциальный и персонализированный характер — с той чуткостью и избирательностью, которых требует исключительное финансовое положение.",
    ctaFormal: "Я был бы рад организовать частную консультацию без каких-либо обязательств в удобное для Вас время — лично или по защищённой видеосвязи.",
    ctaUltra: "Если Вы сочтёте это обращение достойным Вашего внимания, для меня будет честью организовать приватную встречу полностью на Ваших условиях и в удобное Вам время.",
    closeFormal: "С уважением,",
    closeUltra: "Остаюсь с глубочайшим почтением и искренними заверениями в уважении,",
  },
  zh: {
    salFormal: (a, n) => `尊敬的${a} ${n}，`,
    salUltra: (a, n) => `至尊敬的${a} ${n}，`,
    opCold: "谨望此函安抵尊处，诸事顺遂。",
    opWarm: "冒昧致函，惟望诸事顺遂，借此良机，特书私函以致问候。",
    opReferred: (by) => `蒙${by}先生/女士隆重引荐，特此致函，深感荣幸。`,
    intro: (n, c) => `鄙人${n}，现任职于${c}，担任高级财务顾问一职。本机构专为精心甄选的高净值人士提供量身定制的财务解决方案，远超传统市场之所能及。`,
    assetRe: "本机构专精于优质房地产融资、跨境不动产架构及投资组合级资产——相关策略已助众多客户通过战略性房产布局，实现家族财富的增值与传承。",
    assetPort: "本机构投资咨询专注于定制化投资组合构建，涵盖结构性产品、另类资产及税务优化投资工具，此类工具通常仅供机构客户及家族办公室使用。",
    assetWealth: "本机构核心使命在于重大财富的保值与结构化增值——通过资产保护策略、多司法管辖区分散投资，以及传统金融渠道无法获取的专属工具。",
    assetRetire: "本机构协助高净值人士规划退休收入策略，以期永续维持其生活品质——涵盖年金、结构化被动收入及遗产规划框架。",
    nwLow: "本机构以机构级专业水准提供个性化咨询服务，所具备的个人关注度是大型机构所无法比拟的。",
    nwMid: "本机构服务仅向达到特定财富门槛的客户开放，确保建议质量与服务渠道与阁下的地位相符。",
    nwHigh: "面向最高财富层级，本机构以完全低调与个性化的方式开展业务——以非凡财务地位所需的审慎与选择性处理一切事务。",
    ctaFormal: "诚挚期待于您方便之时安排一次私密、无约束之洽谈——可面谈或通过安全视频会议进行。",
    ctaUltra: "若蒙阁下惠顾此函，在下将视能够以阁下所设定之条件及完全方便之时间，安排一次私人会面为莫大荣幸。",
    closeFormal: "此致，",
    closeUltra: "谨致最崇高的敬意与诚挚的问候，",
  },
  tl: {
    salFormal: (a, n) => `Mahal na ${a} ${n},`,
    salUltra: (a, n) => `Lubos na Kinikilalang ${a} ${n},`,
    opCold: "Umaasa akong ang liham na ito ay makaabot sa inyo na may mabuting kalusugan at kagalingan.",
    opWarm: "Umaasa akong naaalagaan kayo at ginagamit ko ang pagkakataong ito upang makipag-ugnayan sa inyo nang personal.",
    opReferred: (by) => `Natutuwa akong sumulat sa inyo matapos ang personal na pagpapakilala ni ${by}, na nagtataglay ng pinakamataas na pagtingin sa inyo.`,
    intro: (n, c) => `Ang pangalan ko ay ${n}, Senyor na Pinansiyal na Tagapayo sa ${c}. Nagtatrabaho kami kasama ang isang maingat na piniling grupo ng mga may mataas na kayamanan upang maibigay ang mga pasadyang solusyong pinansyal na higit pa sa karaniwan.`,
    assetRe: "Ang aming kaalaman ay sumasaklaw sa premium na real estate financing, cross-border na istruktura ng ari-arian, at mga asset na angkop sa portfolio — mga estratehiya na nagpahintulot sa aming mga kliyente na palaguin at protektahan ang kayamanang henerasyon.",
    assetPort: "Ang aming investment advisory ay espesyalista sa custom na pagtatayo ng portfolio, kabilang ang mga structured na produkto, alternatibong asset, at mga sasakyan ng pamumuhunan na karaniwang nakalaan para sa mga institutional na kliyente at family offices.",
    assetWealth: "Ang aming pangunahing pokus ay ang pangangalaga at nakabalangkas na paglago ng malaking kayamanan — sa pamamagitan ng mga estratehiya sa proteksyon ng kapital, multi-jurisdictional na diversification, at eksklusibong access sa mga sasakyan na hindi available sa karaniwang mga channel.",
    assetRetire: "Tinutulungan namin ang mga may mataas na kayamanan na bumuo ng mga estratehiya sa kita sa pagreretiro na dinisenyo upang mapanatili ang kanilang pamumuhay nang walang katiyakan — batay sa mga annuities, structured na passive income, at mga balangkas ng legacy planning.",
    nwLow: "Ipinagmamalaki namin ang pagbibigay ng institutional-grade na pagpapayo na may antas ng personal na atensyon na hindi maibigay ng malalaking institusyon.",
    nwMid: "Ang aming mga serbisyo ay eksklusibong inaalok sa mga kliyenteng nakakatugon sa isang tinukoy na threshold ng pinansiyal na katayuan, na tinitiyak ang kalidad ng pagpapayo at access na angkop sa inyong posisyon.",
    nwHigh: "Sa pinakamataas na antas ng kayamanan, ang aming pakikipag-ugnayan ay ganap na diskreto at personalisado — isinasagawa nang may pagiging sensitibo at selectivity na kinakailangan ng pambihirang pinansiyal na katayuan.",
    ctaFormal: "Ikinalulugod ko ang pagkakataong maayos ang isang pribado, walang obligasyong konsultasyon sa oras na pinakamainam para sa inyo — personal o sa pamamagitan ng secure na video call.",
    ctaUltra: "Kung ituturing ninyo ang pagpapakilalang ito na karapat-dapat sa inyong atensyon, itinuturing ko itong pribilehiyo na maayos ang isang pribadong pagpupulong nang ganap sa inyong mga tuntunin at sa inyong buong kaginhawaan.",
    closeFormal: "Taos-pusong paggalang,",
    closeUltra: "Nananatili ako, nang may pinakamataas na paggalang at taos-pusong pagbabati,",
  },
  ar: {
    salFormal: (a, n) => `السيد/السيدة ${a} ${n} المحترم/ة،`,
    salUltra: (a, n) => `الفاضل/ة ${a} ${n} حفظه/ا الله،`,
    opCold: "أرجو أن يصلكم هذا الخطاب وأنتم بأتم صحة وعافية.",
    opWarm: "آمل أن تكونوا بخير، وأغتنم هذه الفرصة للتواصل معكم شخصياً.",
    opReferred: (by) => `يسعدني مراسلتكم إثر تقديم شخصي من ${by}، الذي/التي يحظى بتقدير بالغ لشخصكم الكريم.`,
    intro: (n, c) => `اسمي ${n}، مستشار مالي أول في ${c}. نعمل مع مجموعة مختارة بعناية من ذوي الثروات العالية لتقديم حلول مالية مخصصة تتجاوز بكثير ما هو متاح في السوق التقليدية.`,
    assetRe: "تمتد خبرتنا لتشمل تمويل العقارات الفاخرة، والهياكل العقارية العابرة للحدود، والأصول الاستثمارية على مستوى المحافظ — وهي استراتيجيات أتاحت لعملائنا تنمية الثروات عبر الأجيال وحمايتها من خلال التعرض العقاري الاستراتيجي.",
    assetPort: "تتخصص استشاراتنا الاستثمارية في بناء المحافظ المخصصة، بما فيها المنتجات الهيكلية، والأصول البديلة، والأدوات الاستثمارية الفعّالة ضريبياً المخصصة عادةً للعملاء المؤسسيين ومكاتب الأسر.",
    assetWealth: "يتمحور تركيزنا الجوهري حول الحفاظ على الثروات الجوهرية وتنميتها بصورة منظمة — من خلال استراتيجيات حماية رأس المال، والتنويع متعدد الولايات القضائية، والوصول الحصري إلى أدوات غير متاحة عبر القنوات المالية التقليدية.",
    assetRetire: "نساعد الأثرياء على تصميم استراتيجيات دخل التقاعد المُصمَّمة للحفاظ على أسلوب حياتهم إلى أجل غير مسمى — مستعينين بالإيرادات السنوية، والدخل السلبي الهيكلي، وأطر التخطيط للتركة.",
    nwLow: "نفتخر بتقديم استشارات بجودة مؤسسية مع مستوى من الاهتمام الشخصي لا تستطيع المؤسسات الكبرى تقديمه.",
    nwMid: "تُقدَّم خدماتنا حصرياً للعملاء الذين يستوفون عتبة مالية محددة، مما يضمن مستوى استشارياً ووصولاً يتناسب مع مكانتكم.",
    nwHigh: "على أعلى مستويات الثروة، يتسم تعاملنا بالسرية الكاملة والتخصيص التام — بما يستلزمه الوضع المالي الاستثنائي من حساسية وانتقائية.",
    ctaFormal: "يسعدني تحديد موعد لاستشارة خاصة وغير ملزمة في الوقت الذي يناسبكم — سواء بصورة شخصية أو عبر مكالمة فيديو آمنة.",
    ctaUltra: "إن رأيتم في هذا التواصل ما يستحق اهتمامكم، فإنني أعدّ من دواعي شرفي تنظيم لقاء خاص وفق شروطكم الخاصة وفي الوقت الذي يتفق تماماً مع رغباتكم.",
    closeFormal: "مع خالص التحيات والاحترام،",
    closeUltra: "وتفضلوا بقبول فائق الاحترام والتقدير،",
  },
  th: {
    salFormal: (a, n) => `เรียน ${a} ${n} ที่เคารพ`,
    salUltra: (a, n) => `กราบเรียน ${a} ${n} ที่เคารพอย่างสูง`,
    opCold: "ข้าพเจ้าหวังเป็นอย่างยิ่งว่าจดหมายฉบับนี้จะพบท่านในสุขภาพที่ดีและจิตใจแจ่มใส",
    opWarm: "ข้าพเจ้าหวังว่าท่านสบายดีและขอถือโอกาสนี้ติดต่อท่านเป็นการส่วนตัว",
    opReferred: (by) => `ข้าพเจ้ามีความยินดีอย่างยิ่งที่ได้เขียนจดหมายถึงท่าน ภายหลังการแนะนำโดยตรงจาก${by} ผู้ซึ่งมีความนับถือท่านอย่างสูงสุด`,
    intro: (n, c) => `ข้าพเจ้าชื่อ ${n} ที่ปรึกษาการเงินอาวุโสแห่ง ${c} เราทำงานร่วมกับกลุ่มบุคคลที่มีมูลค่าสุทธิสูงซึ่งได้รับการคัดเลือกอย่างรอบคอบ เพื่อมอบโซลูชันทางการเงินที่ปรับแต่งเป็นพิเศษ เกินกว่าที่ตลาดทั่วไปจะสามารถเสนอได้`,
    assetRe: "ความเชี่ยวชาญของเราครอบคลุมการจัดหาเงินทุนอสังหาริมทรัพย์ระดับพรีเมียม โครงสร้างอสังหาริมทรัพย์ข้ามชาติ และสินทรัพย์ลงทุนระดับพอร์ตโฟลิโอ — กลยุทธ์ที่ช่วยให้ลูกค้าของเราสามารถเพิ่มพูนและปกป้องความมั่งคั่งของครอบครัวได้",
    assetPort: "การให้คำปรึกษาด้านการลงทุนของเราเชี่ยวชาญในการสร้างพอร์ตโฟลิโอแบบกำหนดเอง รวมถึงผลิตภัณฑ์ที่มีโครงสร้าง สินทรัพย์ทางเลือก และเครื่องมือลงทุนที่มีประสิทธิภาพทางภาษี ซึ่งโดยปกติสงวนไว้สำหรับลูกค้าสถาบันและ family offices",
    assetWealth: "ความมุ่งมั่นหลักของเราคือการรักษาและการเติบโตอย่างเป็นระบบของความมั่งคั่งจำนวนมาก — ผ่านกลยุทธ์การปกป้องทุน การกระจายความเสี่ยงหลายเขตอำนาจศาล และการเข้าถึงเครื่องมือเฉพาะที่ไม่มีผ่านช่องทางการเงินทั่วไป",
    assetRetire: "เราช่วยบุคคลที่มีความมั่งคั่งสูงในการวางแผนกลยุทธ์รายได้เพื่อการเกษียณ ที่ออกแบบมาเพื่อรักษาวิถีชีวิตของพวกเขาอย่างไม่มีกำหนด — โดยอิงจากเงินบำนาญ รายได้แฝงเชิงโครงสร้าง และกรอบการวางแผนมรดก",
    nwLow: "เราภาคภูมิใจในการมอบคำแนะนำระดับสถาบันพร้อมความเอาใจใส่ส่วนตัวในระดับที่สถาบันขนาดใหญ่ไม่สามารถทำได้",
    nwMid: "บริการของเราเสนอให้เฉพาะลูกค้าที่ตรงตามเกณฑ์ทางการเงินที่กำหนด เพื่อให้มั่นใจว่าระดับคำปรึกษาและการเข้าถึงนั้นสอดคล้องกับสถานะของท่าน",
    nwHigh: "ในระดับความมั่งคั่งสูงสุด การมีส่วนร่วมของเราเป็นความลับอย่างสมบูรณ์และเป็นส่วนตัว — ดำเนินการด้วยความละเอียดอ่อนและการคัดเลือกที่สถานะทางการเงินอันโดดเด่นต้องการ",
    ctaFormal: "ข้าพเจ้ายินดีที่จะจัดการประชุมส่วนตัวแบบไม่มีข้อผูกมัดในเวลาที่ท่านเลือก — ไม่ว่าจะเป็นแบบพบหน้าหรือผ่านการประชุมทางวิดีโอที่ปลอดภัย",
    ctaUltra: "หากท่านพิจารณาว่าการติดต่อครั้งนี้คุ้มค่าแก่การพิจารณาของท่าน ข้าพเจ้าจะถือว่าเป็นเกียรติอย่างยิ่งในการจัดการประชุมส่วนตัวตามเงื่อนไขของท่านทั้งหมดและตามความสะดวกของท่านอย่างสมบูรณ์",
    closeFormal: "ด้วยความนับถือ,",
    closeUltra: "ขอแสดงความนับถืออย่างสูงสุด,",
  },
  hi: {
    salFormal: (a, n) => `आदरणीय ${a} ${n},`,
    salUltra: (a, n) => `परम आदरणीय ${a} ${n},`,
    opCold: "मुझे आशा है कि यह पत्र आपको उत्तम स्वास्थ्य और प्रसन्नचित्त में पाएगा।",
    opWarm: "मुझे आशा है कि आप सकुशल हैं और मैं इस अवसर का उपयोग व्यक्तिगत रूप से आपसे संपर्क करने के लिए कर रहा हूँ।",
    opReferred: (by) => `${by} के व्यक्तिगत परिचय के बाद आपको पत्र लिखते हुए मुझे अत्यंत प्रसन्नता हो रही है, जो आपको अत्यंत उच्च सम्मान में रखते हैं।`,
    intro: (n, c) => `मेरा नाम ${n} है, और मैं ${c} में वरिष्ठ वित्तीय सलाहकार हूँ। हम सावधानीपूर्वक चयनित उच्च-नेटवर्थ व्यक्तियों के समूह के साथ काम करते हैं, जो सुपरिभाषित वित्तीय समाधान प्रदान करते हैं जो पारंपरिक बाजार में उपलब्ध से कहीं अधिक हैं।`,
    assetRe: "हमारी विशेषज्ञता प्रीमियम रियल एस्टेट फाइनेंसिंग, सीमा-पार संपत्ति संरचनाओं और पोर्टफोलियो-ग्रेड निवेश संपत्तियों तक फैली हुई है — ऐसी रणनीतियाँ जिन्होंने हमारे ग्राहकों को रणनीतिक संपत्ति एक्सपोज़र के माध्यम से पीढ़ीगत धन को बढ़ाने और संरक्षित करने में सक्षम बनाया है।",
    assetPort: "हमारी निवेश सलाहकारी कस्टम पोर्टफोलियो निर्माण में विशेषज्ञ है, जिसमें संरचित उत्पाद, वैकल्पिक परिसंपत्तियाँ और कर-कुशल निवेश वाहन शामिल हैं जो आमतौर पर संस्थागत ग्राहकों और फैमिली ऑफिस के लिए आरक्षित होते हैं।",
    assetWealth: "हमारा मुख्य ध्यान महत्वपूर्ण धन के संरक्षण और संरचित विकास पर है — पूंजी संरक्षण रणनीतियों, बहु-क्षेत्राधिकार विविधीकरण, और पारंपरिक वित्तीय चैनलों के माध्यम से उपलब्ध नहीं होने वाले वाहनों तक विशेष पहुँच के माध्यम से।",
    assetRetire: "हम उच्च-नेटवर्थ व्यक्तियों को सेवानिवृत्ति आय रणनीतियाँ बनाने में मदद करते हैं जो उनकी जीवनशैली को अनिश्चित काल तक बनाए रखने के लिए डिज़ाइन की गई हैं — वार्षिकी, संरचित निष्क्रिय आय, और विरासत योजना ढाँचों पर आधारित।",
    nwLow: "हम संस्थागत-ग्रेड सलाहकारी प्रदान करने में गर्व महसूस करते हैं, जिसमें व्यक्तिगत ध्यान का स्तर बड़े संस्थान नहीं दे सकते।",
    nwMid: "हमारी सेवाएं विशेष रूप से उन ग्राहकों को प्रदान की जाती हैं जो वित्तीय स्थिति की एक निर्धारित सीमा को पूरा करते हैं, जो आपकी स्थिति के अनुरूप सलाह और पहुँच का स्तर सुनिश्चित करती है।",
    nwHigh: "धन के उच्चतम स्तर पर, हमारी भागीदारी पूरी तरह से विवेकपूर्ण और व्यक्तिगत है — असाधारण वित्तीय स्थिति की संवेदनशीलता और चयनात्मकता के साथ संचालित।",
    ctaFormal: "मैं आपके चुने गए समय पर एक निजी, बिना किसी बाध्यता के परामर्श की व्यवस्था करने का अवसर पाना पसंद करूँगा — व्यक्तिगत रूप से या सुरक्षित वीडियो कॉल के माध्यम से।",
    ctaUltra: "यदि आप इस परिचय को अपने विचार के योग्य पाते हैं, तो मैं पूरी तरह से आपकी शर्तों पर और आपकी पूरी सुविधा पर एक निजी बैठक की व्यवस्था करना अपना सौभाग्य समझूँगा।",
    closeFormal: "सादर,",
    closeUltra: "सर्वोच्च सम्मान और हार्दिक शुभकामनाओं सहित,",
  },
  vi: {
    salFormal: (a, n) => `Kính thưa ${a} ${n},`,
    salUltra: (a, n) => `Trân trọng kính thưa ${a} ${n},`,
    opCold: "Tôi hy vọng bức thư này đến tay quý vị trong trạng thái sức khỏe và tinh thần tốt nhất.",
    opWarm: "Tôi hy vọng quý vị đang khỏe mạnh và nhân cơ hội này liên hệ trực tiếp với quý vị.",
    opReferred: (by) => `Tôi rất vui được viết thư này cho quý vị sau khi được ${by} giới thiệu cá nhân, người dành sự kính trọng cao nhất cho quý vị.`,
    intro: (n, c) => `Tôi là ${n}, Cố vấn Tài chính Cấp cao tại ${c}. Chúng tôi hợp tác với một nhóm cá nhân có tài sản ròng cao được lựa chọn kỹ lưỡng để cung cấp các giải pháp tài chính tùy chỉnh vượt xa những gì thường có trên thị trường thông thường.`,
    assetRe: "Chuyên môn của chúng tôi trải rộng từ tài chính bất động sản cao cấp, cấu trúc tài sản xuyên biên giới đến các tài sản đầu tư cấp danh mục — những chiến lược đã giúp khách hàng của chúng tôi phát triển và bảo vệ tài sản qua nhiều thế hệ.",
    assetPort: "Tư vấn đầu tư của chúng tôi chuyên xây dựng danh mục tùy chỉnh, bao gồm sản phẩm có cấu trúc, tài sản thay thế và công cụ đầu tư hiệu quả về thuế thường được dành riêng cho khách hàng tổ chức và văn phòng gia đình.",
    assetWealth: "Trọng tâm cốt lõi của chúng tôi là bảo tồn và tăng trưởng có cấu trúc tài sản đáng kể — thông qua các chiến lược bảo vệ vốn, đa dạng hóa đa pháp quyền và quyền truy cập độc quyền vào các công cụ không có sẵn qua các kênh tài chính thông thường.",
    assetRetire: "Chúng tôi giúp các cá nhân có tài sản cao thiết kế chiến lược thu nhập hưu trí được thiết kế để duy trì lối sống của họ vô thời hạn — dựa trên niên kim, thu nhập thụ động có cấu trúc và khung lập kế hoạch di sản.",
    nwLow: "Chúng tôi tự hào cung cấp tư vấn chất lượng thể chế với mức độ chú ý cá nhân mà các tổ chức lớn hơn không thể cung cấp.",
    nwMid: "Dịch vụ của chúng tôi được cung cấp độc quyền cho những khách hàng đáp ứng ngưỡng tài chính xác định, đảm bảo chất lượng tư vấn và khả năng tiếp cận tương xứng với vị thế của quý vị.",
    nwHigh: "Ở mức độ giàu có cao nhất, sự tham gia của chúng tôi hoàn toàn kín đáo và cá nhân hóa — được thực hiện với sự nhạy cảm và chọn lọc mà địa vị tài chính phi thường đòi hỏi.",
    ctaFormal: "Tôi rất muốn có cơ hội sắp xếp một buổi tư vấn riêng tư, không ràng buộc vào thời điểm thuận tiện nhất cho quý vị — dù là gặp trực tiếp hay qua cuộc gọi video an toàn.",
    ctaUltra: "Nếu quý vị thấy sự giới thiệu này xứng đáng với sự cân nhắc của mình, tôi sẽ coi đó là vinh dự khi được sắp xếp một cuộc gặp riêng hoàn toàn theo điều kiện của quý vị và tại sự tiện lợi hoàn toàn của quý vị.",
    closeFormal: "Trân trọng,",
    closeUltra: "Xin kính chào với sự tôn trọng sâu sắc nhất và những lời chúc thành thật nhất,",
  },
};

export function buildHnwLetter(lang: Language, params: HnwLetterParams): string {
  const p = PHRASES[lang] ?? PHRASES.en;
  const {
    recipientName, formalAddress, relationship, referredBy,
    assetInterest, netWorth, formality,
    adviserName, company, mobile, contact, date,
  } = params;

  const sal = formality === "ultra"
    ? p.salUltra(formalAddress, recipientName)
    : p.salFormal(formalAddress, recipientName);

  const opener = relationship === "cold"
    ? p.opCold
    : relationship === "warm"
    ? p.opWarm
    : p.opReferred(referredBy ?? "");

  const asset = assetInterest === "real-estate" ? p.assetRe
    : assetInterest === "portfolio" ? p.assetPort
    : assetInterest === "wealth" ? p.assetWealth
    : p.assetRetire;

  const nwLine = netWorth === "1m-5m" ? p.nwLow
    : netWorth === "5m-25m" ? p.nwMid
    : p.nwHigh;

  const cta = formality === "ultra" ? p.ctaUltra : p.ctaFormal;
  const close = formality === "ultra" ? p.closeUltra : p.closeFormal;

  return [
    date,
    "",
    sal,
    "",
    opener + " " + p.intro(adviserName, company),
    "",
    asset + " " + nwLine,
    "",
    cta,
    "",
    close,
    adviserName,
    company,
    mobile,
    contact,
  ].join("\n");
}
