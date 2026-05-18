import type { Language } from "@/lib/translations";

export type AdvisorLetterType = "passive" | "active";

// Placeholders: [DATE] [RECIPIENT_NAME] [ADVISER_NAME] [ADVISER_COMPANY] [ADVISER_MOBILE] [ADVISER_CONTACT]

const T: Partial<Record<Language, Record<AdvisorLetterType, string>>> & { en: Record<AdvisorLetterType, string> } = {

  en: {
    passive:
`[DATE]

Dear [RECIPIENT_NAME],

I hope this message finds you well.

I am writing to introduce you to something I have been building — a wealth advisory and network business model that I believe may be worth a conversation.

Through my work with Plan B · Diamond Solution, I am part of a network of independent advisers who introduce clients to physical diamond investment. This is a non-market-traded, tangible asset designed for long-term wealth preservation — entirely outside of equities, currencies, and interest-rate exposure.

The business model behind it is built on a structured, transparent residual income that grows as client portfolios compound month after month. It is not a commission structure. It is a long-term income that rewards you for building something real.

I am not reaching out with any expectation. I simply thought that, given your background and the kind of clients you work with, this might be worth understanding — even if only as a reference point.

If you are ever curious to learn more, I would be happy to share a brief overview at a time that suits you. No obligation, no pressure.

Warm regards,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Dear [RECIPIENT_NAME],

I am reaching out directly because I believe you are the kind of professional who would genuinely appreciate what I am about to share.

I am part of a growing international network of independent advisers affiliated with Plan B · Diamond Solution. We work with clients seeking to preserve and grow wealth entirely outside of traditional financial markets — through physical diamond investment, a non-public, non-traded asset class with a structured monthly rebate mechanism.

What makes this particularly worth your attention is the business architecture. Advisers who build a team earn a transparent, long-term residual income that compounds as the portfolios of their introduced clients grow — month after month, year after year. This is not a sales commission. It is a compounding income structure built on a simple principle: the more diamonds held within your network, the greater the monthly rebates that flow back through you.

I would like to schedule 30 minutes to walk you through the full model. I am confident that once you see the structure clearly, you will have everything you need to make your own informed decision.

Would you be open to a brief call or meeting in the coming days?

Warm regards,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  nl: {
    passive:
`[DATE]

Beste [RECIPIENT_NAME],

Ik hoop dat dit bericht u goed bereikt.

Ik schrijf u om iets te introduceren waar ik aan werk — een vermogensadviserings- en netwerkbedrijfsmodel dat ik denk dat een gesprek waard is.

Via mijn werk met Plan B · Diamond Solution maak ik deel uit van een netwerk van onafhankelijke adviseurs die klanten introduceren aan fysieke diamantinvesteringen. Dit is een niet-beursgenoteerd, tastbaar actief ontworpen voor langetermijnvermogensbehoud — volledig buiten aandelen, valuta's en rentegevoeligheid.

Het onderliggende bedrijfsmodel is gebaseerd op een gestructureerd, transparant residueel inkomen dat groeit naarmate klantportfolio's maand na maand samengesteld worden. Het is geen commissiestructuur. Het is een langetermijninkomen dat u beloont voor het opbouwen van iets echts.

Ik bereik u zonder verwachtingen. Ik dacht eenvoudigweg dat, gezien uw achtergrond en het type klanten waarmee u werkt, dit het begrijpen waard zou kunnen zijn.

Als u ooit meer wilt weten, deel ik graag een kort overzicht op een tijdstip dat u schikt. Geen verplichtingen, geen druk.

Met vriendelijke groet,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Beste [RECIPIENT_NAME],

Ik neem direct contact met u op omdat ik geloof dat u het type professional bent dat oprecht zou waarderen wat ik ga delen.

Ik maak deel uit van een groeiend internationaal netwerk van onafhankelijke adviseurs geaffilieerd met Plan B · Diamond Solution. Wij werken met klanten die vermogen willen bewaren en laten groeien volledig buiten traditionele financiële markten — via fysieke diamantinvesteringen, een niet-publieke, niet-verhandelde activaklasse met een gestructureerd maandelijks kortingsmechanisme.

Wat dit bijzonder de moeite waard maakt, is de bedrijfsarchitectuur. Adviseurs die een team opbouwen, verdienen een transparant, langetermijn residueel inkomen dat samengesteld wordt naarmate de portfolio's van hun geïntroduceerde klanten groeien — maand na maand, jaar na jaar.

Ik zou graag 30 minuten inplannen om u het volledige model te laten zien. Zodra u de structuur duidelijk ziet, heeft u alles wat u nodig heeft om uw eigen weloverwogen beslissing te nemen.

Zou u openstaan voor een kort gesprek of vergadering in de komende dagen?

Met vriendelijke groet,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  de: {
    passive:
`[DATE]

Sehr geehrte/r [RECIPIENT_NAME],

ich hoffe, diese Nachricht erreicht Sie in guter Verfassung.

Ich schreibe Ihnen, um Ihnen etwas vorzustellen, woran ich arbeite — ein Vermögensberatungs- und Netzwerkgeschäftsmodell, das ich für ein Gespräch wert halte.

Durch meine Arbeit mit Plan B · Diamond Solution bin ich Teil eines Netzwerks unabhängiger Berater, die Kunden in physische Diamantinvestitionen einführen. Dies ist ein nicht börsennotiertes, greifbares Vermögenswert für die langfristige Vermögenserhaltung — vollständig außerhalb von Aktien, Währungen und Zinsrisiken.

Das zugrunde liegende Geschäftsmodell basiert auf einem strukturierten, transparenten Residualeinkommen, das wächst, wenn sich Kundenportfolios Monat für Monat akkumulieren. Es ist keine Provisionsstruktur. Es ist ein langfristiges Einkommen, das Sie dafür belohnt, etwas Echtes aufzubauen.

Ich melde mich ohne Erwartungen. Ich dachte einfach, dass dies, angesichts Ihres Hintergrunds und der Art von Kunden, mit denen Sie arbeiten, es wert sein könnte, es zu verstehen.

Wenn Sie jemals mehr erfahren möchten, teile ich gerne eine kurze Übersicht zu einem für Sie passenden Zeitpunkt. Keine Verpflichtungen, kein Druck.

Mit freundlichen Grüßen,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Sehr geehrte/r [RECIPIENT_NAME],

ich melde mich direkt bei Ihnen, weil ich glaube, dass Sie genau die Art von Fachmann sind, der das, was ich teilen möchte, aufrichtig schätzen würde.

Ich bin Teil eines wachsenden internationalen Netzwerks unabhängiger Berater, die mit Plan B · Diamond Solution verbunden sind. Wir arbeiten mit Kunden, die Vermögen vollständig außerhalb traditioneller Finanzmärkte erhalten und vermehren möchten — durch physische Diamantinvestitionen, eine nicht-öffentliche, nicht gehandelte Anlageklasse mit einem strukturierten monatlichen Rabattsystem.

Was dies besonders beachtenswert macht, ist die Geschäftsarchitektur. Berater, die ein Team aufbauen, erzielen ein transparentes, langfristiges Residualeinkommen, das sich akkumuliert, während die Portfolios ihrer eingeführten Kunden wachsen — Monat für Monat, Jahr für Jahr.

Ich würde gerne 30 Minuten einplanen, um Ihnen das vollständige Modell vorzustellen. Sobald Sie die Struktur klar sehen, haben Sie alles, was Sie brauchen, um Ihre eigene fundierte Entscheidung zu treffen.

Wären Sie offen für ein kurzes Gespräch oder Treffen in den kommenden Tagen?

Mit freundlichen Grüßen,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  fr: {
    passive:
`[DATE]

Cher/Chère [RECIPIENT_NAME],

J'espère que ce message vous trouve en bonne santé.

Je vous écris pour vous présenter quelque chose sur lequel je travaille — un modèle d'entreprise de conseil en patrimoine et de réseau que je pense mériter une conversation.

Grâce à mon travail avec Plan B · Diamond Solution, je fais partie d'un réseau de conseillers indépendants qui introduisent des clients à l'investissement en diamants physiques. Il s'agit d'un actif tangible non coté en bourse, conçu pour la préservation du patrimoine à long terme — entièrement en dehors des actions, des devises et de l'exposition aux taux d'intérêt.

Le modèle d'entreprise sous-jacent est basé sur un revenu résiduel structuré et transparent qui croît à mesure que les portefeuilles des clients s'accumulent mois après mois. Ce n'est pas une structure de commission. C'est un revenu à long terme qui vous récompense pour avoir construit quelque chose de réel.

Je vous contacte sans attente. J'ai simplement pensé que, compte tenu de votre parcours et du type de clients avec lesquels vous travaillez, cela pourrait valoir la peine d'être compris.

Si vous souhaitez en savoir plus, je serai heureux de partager un bref aperçu à un moment qui vous convient. Aucune obligation, aucune pression.

Cordialement,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Cher/Chère [RECIPIENT_NAME],

Je vous contacte directement car je crois que vous êtes le type de professionnel qui apprécierait sincèrement ce que je suis sur le point de partager.

Je fais partie d'un réseau international croissant de conseillers indépendants affiliés à Plan B · Diamond Solution. Nous travaillons avec des clients souhaitant préserver et développer leur patrimoine entièrement en dehors des marchés financiers traditionnels — via l'investissement en diamants physiques, une classe d'actifs non publique et non cotée avec un mécanisme de remise mensuelle structuré.

Ce qui rend cela particulièrement digne d'attention, c'est l'architecture commerciale. Les conseillers qui construisent une équipe gagnent un revenu résiduel transparent à long terme qui se compose à mesure que les portefeuilles de leurs clients introduits croissent — mois après mois, année après année.

J'aimerais programmer 30 minutes pour vous présenter le modèle complet. Je suis convaincu qu'une fois que vous aurez vu la structure clairement, vous aurez tout ce dont vous avez besoin pour prendre votre propre décision éclairée.

Seriez-vous ouvert(e) à un bref appel ou une réunion dans les prochains jours ?

Cordialement,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  es: {
    passive:
`[DATE]

Estimado/a [RECIPIENT_NAME],

Espero que este mensaje le encuentre bien.

Le escribo para presentarle algo en lo que estoy trabajando — un modelo de negocio de asesoría patrimonial y red que creo que merece una conversación.

A través de mi trabajo con Plan B · Diamond Solution, formo parte de una red de asesores independientes que introducen a clientes en la inversión en diamantes físicos. Se trata de un activo tangible no cotizado en bolsa, diseñado para la preservación del patrimonio a largo plazo — completamente fuera de acciones, divisas y exposición a tipos de interés.

El modelo de negocio subyacente se basa en unos ingresos residuales estructurados y transparentes que crecen a medida que las carteras de los clientes se acumulan mes a mes. No es una estructura de comisiones. Es un ingreso a largo plazo que le recompensa por construir algo real.

Me pongo en contacto sin expectativas. Simplemente pensé que, dado su historial y el tipo de clientes con los que trabaja, esto podría valer la pena entenderlo.

Si alguna vez tiene curiosidad por saber más, estaré encantado de compartir un breve resumen en el momento que le convenga. Sin obligaciones, sin presión.

Atentamente,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Estimado/a [RECIPIENT_NAME],

Me pongo en contacto directamente con usted porque creo que es el tipo de profesional que apreciaría genuinamente lo que estoy a punto de compartir.

Formo parte de una red internacional creciente de asesores independientes afiliados a Plan B · Diamond Solution. Trabajamos con clientes que buscan preservar y hacer crecer su patrimonio completamente fuera de los mercados financieros tradicionales — a través de la inversión en diamantes físicos, una clase de activos no pública y no cotizada con un mecanismo de descuento mensual estructurado.

Lo que hace que esto sea especialmente digno de atención es la arquitectura empresarial. Los asesores que construyen un equipo obtienen un ingreso residual transparente a largo plazo que se compone a medida que las carteras de sus clientes introducidos crecen — mes a mes, año tras año.

Me gustaría programar 30 minutos para presentarle el modelo completo. Estoy seguro de que una vez que vea la estructura claramente, tendrá todo lo que necesita para tomar su propia decisión informada.

¿Estaría abierto/a a una breve llamada o reunión en los próximos días?

Atentamente,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  it: {
    passive:
`[DATE]

Gentile [RECIPIENT_NAME],

Spero che questo messaggio la trovi in buona salute.

Le scrivo per presentarle qualcosa su cui sto lavorando — un modello di business di consulenza patrimoniale e rete che ritengo meriti una conversazione.

Attraverso il mio lavoro con Plan B · Diamond Solution, faccio parte di una rete di consulenti indipendenti che introducono i clienti agli investimenti in diamanti fisici. Si tratta di un asset tangibile non quotato in borsa, progettato per la preservazione del patrimonio a lungo termine — completamente al di fuori di azioni, valute ed esposizione ai tassi di interesse.

Il modello di business sottostante si basa su un reddito residuo strutturato e trasparente che cresce man mano che i portafogli dei clienti si accumulano mese dopo mese. Non è una struttura a commissione. È un reddito a lungo termine che la ricompensa per aver costruito qualcosa di reale.

La contatto senza aspettative. Ho semplicemente pensato che, dato il suo background e il tipo di clienti con cui lavora, potrebbe valere la pena capirlo.

Se mai fosse curioso/a di saperne di più, sarei felice di condividere una breve panoramica nel momento più adatto a lei. Nessun obbligo, nessuna pressione.

Cordiali saluti,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Gentile [RECIPIENT_NAME],

La contatto direttamente perché credo che lei sia il tipo di professionista che apprezzerebbe sinceramente ciò che sto per condividere.

Faccio parte di una rete internazionale in crescita di consulenti indipendenti affiliati a Plan B · Diamond Solution. Lavoriamo con clienti che desiderano preservare e far crescere il patrimonio completamente al di fuori dei mercati finanziari tradizionali — attraverso investimenti in diamanti fisici, una classe di asset non pubblica e non scambiata con un meccanismo di rimborso mensile strutturato.

Ciò che rende questo particolarmente degno di attenzione è l'architettura commerciale. I consulenti che costruiscono un team guadagnano un reddito residuo trasparente a lungo termine che si compone man mano che i portafogli dei loro clienti introdotti crescono — mese dopo mese, anno dopo anno.

Vorrei programmare 30 minuti per illustrarle il modello completo. Sono sicuro che una volta vista chiaramente la struttura, avrà tutto ciò che le serve per prendere la propria decisione informata.

Sarebbe aperto/a a una breve chiamata o incontro nei prossimi giorni?

Cordiali saluti,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  pt: {
    passive:
`[DATE]

Caro/a [RECIPIENT_NAME],

Espero que esta mensagem o/a encontre bem.

Escrevo-lhe para apresentar algo em que estou a trabalhar — um modelo de negócio de consultoria patrimonial e rede que acredito merecer uma conversa.

Através do meu trabalho com o Plan B · Diamond Solution, faço parte de uma rede de consultores independentes que introduzem clientes no investimento em diamantes físicos. Trata-se de um ativo tangível não cotado em bolsa, concebido para a preservação de patrimônio a longo prazo — completamente fora de ações, moedas e exposição a taxas de juro.

O modelo de negócio subjacente baseia-se num rendimento residual estruturado e transparente que cresce à medida que as carteiras dos clientes se acumulam mês após mês. Não é uma estrutura de comissões. É um rendimento a longo prazo que o/a recompensa por construir algo real.

Contacto-o/a sem expectativas. Simplesmente pensei que, dado o seu percurso e o tipo de clientes com quem trabalha, isto poderia valer a pena compreender.

Se alguma vez tiver curiosidade em saber mais, terei todo o prazer em partilhar uma breve visão geral no momento que lhe for mais conveniente. Sem obrigações, sem pressão.

Com os melhores cumprimentos,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Caro/a [RECIPIENT_NAME],

Contacto-o/a diretamente porque acredito que é o tipo de profissional que apreciaria genuinamente o que estou prestes a partilhar.

Faço parte de uma rede internacional crescente de consultores independentes afiliados ao Plan B · Diamond Solution. Trabalhamos com clientes que procuram preservar e fazer crescer o seu patrimônio completamente fora dos mercados financeiros tradicionais — através do investimento em diamantes físicos, uma classe de ativos não pública e não negociada com um mecanismo de desconto mensal estruturado.

O que torna isto particularmente digno de atenção é a arquitetura empresarial. Os consultores que constroem uma equipa obtêm um rendimento residual transparente a longo prazo que se compõe à medida que as carteiras dos seus clientes introduzidos crescem — mês após mês, ano após ano.

Gostaria de agendar 30 minutos para lhe apresentar o modelo completo. Estou confiante de que, uma vez que veja a estrutura claramente, terá tudo o que precisa para tomar a sua própria decisão informada.

Estaria disponível para uma breve chamada ou reunião nos próximos dias?

Com os melhores cumprimentos,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  ru: {
    passive:
`[DATE]

Уважаемый/ая [RECIPIENT_NAME],

Надеюсь, это сообщение застанет Вас в добром здравии.

Пишу Вам, чтобы представить то, над чем я работаю — бизнес-модель консультирования по вопросам благосостояния и построения сети, которая, на мой взгляд, заслуживает разговора.

Через мою работу с Plan B · Diamond Solution я являюсь частью сети независимых советников, которые знакомят клиентов с инвестициями в физические бриллианты. Это материальный актив, не торгуемый на бирже, предназначенный для долгосрочного сохранения капитала — полностью вне акций, валют и процентного риска.

Лежащая в основе бизнес-модель построена на структурированном, прозрачном остаточном доходе, который растёт по мере того, как портфели клиентов накапливаются месяц за месяцем. Это не комиссионная структура. Это долгосрочный доход, который вознаграждает Вас за создание чего-то реального.

Я обращаюсь к Вам без каких-либо ожиданий. Я просто подумал, что, учитывая Ваш опыт и тип клиентов, с которыми Вы работаете, это может быть достойно понимания.

Если Вам когда-нибудь захочется узнать больше, я буду рад поделиться кратким обзором в удобное для Вас время. Без обязательств и давления.

С уважением,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Уважаемый/ая [RECIPIENT_NAME],

Я обращаюсь к Вам напрямую, потому что убеждён, что Вы именно тот профессионал, который искренне оценит то, чем я собираюсь поделиться.

Я являюсь частью растущей международной сети независимых советников, аффилированных с Plan B · Diamond Solution. Мы работаем с клиентами, которые стремятся сохранить и приумножить капитал полностью за пределами традиционных финансовых рынков — через инвестиции в физические бриллианты, непубличный, неторгуемый класс активов со структурированным ежемесячным механизмом возврата.

Особого внимания заслуживает бизнес-архитектура. Советники, которые строят команду, получают прозрачный долгосрочный остаточный доход, который накапливается по мере роста портфелей привлечённых клиентов — месяц за месяцем, год за годом.

Я хотел бы запланировать 30 минут, чтобы провести Вас по всей модели. Я уверен, что как только Вы увидите структуру чётко, у Вас будет всё необходимое для принятия собственного обоснованного решения.

Не могли бы Вы уделить время для краткого звонка или встречи в ближайшие дни?

С уважением,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  zh: {
    passive:
`[DATE]

尊敬的[RECIPIENT_NAME]，

希望这封信能在您状态良好时送达。

我写信是为了向您介绍我正在从事的工作——一个我认为值得探讨的财富咨询与网络业务模式。

通过与Plan B · Diamond Solution的合作，我是一个独立顾问网络的一员，我们为客户介绍实物钻石投资。这是一种非上市交易的有形资产，专为长期财富保值而设计——完全独立于股票、货币和利率风险之外。

其基础商业模式建立在结构化、透明的被动收入之上，随着客户投资组合月复一月的复利增长而持续扩大。这不是佣金结构，而是一种长期收入，奖励您为自己构建真实的事业。

我与您联系没有任何期望。我只是想到，鉴于您的背景和您服务的客户类型，这可能值得了解。

如果您有任何兴趣想了解更多，我很乐意在方便您的时间分享简要概述。没有任何义务或压力。

此致，

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

尊敬的[RECIPIENT_NAME]，

我直接与您联系，因为我相信您正是那种能真正欣赏我即将分享内容的专业人士。

我是一个不断壮大的国际独立顾问网络的成员，与Plan B · Diamond Solution合作。我们为希望完全在传统金融市场之外保值和增值财富的客户提供服务——通过实物钻石投资，这是一种非公开、非上市的资产类别，具有结构化的每月返利机制。

尤其值得关注的是其商业架构。建立团队的顾问可以获得透明的长期被动收入，随着引入客户的投资组合持续增长而复利积累——月复一月，年复一年。

我希望安排30分钟向您详细介绍整个模式。我相信，一旦您清楚地了解这一结构，您将拥有做出自己明智决定所需的一切信息。

您是否愿意在近期安排一次简短的通话或会面？

此致，

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  tl: {
    passive:
`[DATE]

Mahal na [RECIPIENT_NAME],

Umaasa akong mabuti ang iyong kalagayan habang natanggap mo ang mensaheng ito.

Sumusulat ako upang ipakilala sa iyo ang isang bagay na aking pinagtatrabahuhan — isang modelo ng negosyo sa payo sa kayamanan at network na naniniwala akong karapat-dapat sa isang pag-uusap.

Sa pamamagitan ng aking trabaho sa Plan B · Diamond Solution, bahagi ako ng isang network ng mga independyenteng adviser na nagpapakilala sa mga kliyente sa pisikal na pamumuhunan sa brilyante. Ito ay isang tangible na asset na hindi kinakalakal sa stock exchange, idinisenyo para sa pangmatagalang pangangalaga ng kayamanan — ganap na labas sa mga stock, pera, at panganib sa interest rate.

Ang pinagbabatayan ng modelo ng negosyo ay binuo sa isang nakabalangkas, transparent na residual na kita na lumalaki habang ang mga portfolio ng kliyente ay umaani buwan-buwan. Hindi ito istraktura ng komisyon. Ito ay pangmatagalang kita na ginagantimpalaan ka para sa pagtatayo ng isang tunay na bagay.

Makikipag-ugnayan ako sa iyo nang walang anumang inaasahan. Naisip ko lamang na, dahil sa iyong background at uri ng mga kliyenteng pinaglilingkuran mo, maaaring ito ay sulit na maunawaan.

Kung ikaw ay ziyoso na malaman ang higit pa, ikinalulugod kong ibahagi ang isang maikling pangkalahatang-ideya sa oras na angkop sa iyo. Walang obligasyon, walang presyon.

Taos-pusong paggalang,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Mahal na [RECIPIENT_NAME],

Direkta akong nakikipag-ugnayan sa iyo dahil naniniwala akong ikaw ang uri ng propesyonal na tunay na magpapahalaga sa aking ibabahagi.

Bahagi ako ng lumalaking internasyonal na network ng mga independyenteng adviser na kaakibat ng Plan B · Diamond Solution. Nagtatrabaho kami sa mga kliyenteng naghahanap na pangalagaan at palakihin ang kayamanan ganap na labas sa mga tradisyonal na pamilihang pinansyal — sa pamamagitan ng pisikal na pamumuhunan sa brilyante, isang non-public, hindi kinakalakal na klase ng asset na may nakabalangkas na mekanismo ng buwanang rebate.

Ang partikular na kapansin-pansin ay ang arkitektura ng negosyo. Ang mga adviser na nagtatayo ng koponan ay kumikita ng transparent, pangmatagalang residual na kita na umaani habang lumalaki ang mga portfolio ng kanilang mga ipinakilalang kliyente — buwan-buwan, taon-taon.

Nais kong mag-iskedyul ng 30 minuto upang gabayan ka sa buong modelo. Tiwala akong kapag nakita mo na ang istraktura nang malinaw, magkakaroon ka ng lahat ng kailangan mo upang makagawa ng iyong sariling informed na desisyon.

Magiging bukas ka ba sa isang maikling tawag o pagpupulong sa mga darating na araw?

Taos-pusong paggalang,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  ar: {
    passive:
`[DATE]

عزيزي/عزيزتي [RECIPIENT_NAME]،

أتمنى أن تكون بخير عند استلامك هذه الرسالة.

أكتب إليك لأقدم لك شيئاً أعمل عليه — نموذج أعمال للاستشارات المالية والشبكات أعتقد أنه يستحق محادثة.

من خلال عملي مع Plan B · Diamond Solution، أنا جزء من شبكة من المستشارين المستقلين الذين يُعرّفون العملاء بالاستثمار في الألماس المادي. هذا أصل ملموس غير مُتداول في البورصة، مصمم للحفاظ على الثروة على المدى الطويل — بعيداً تماماً عن الأسهم والعملات ومخاطر أسعار الفائدة.

نموذج الأعمال الأساسي مبني على دخل متبقٍ منظم وشفاف ينمو مع تراكم محافظ العملاء شهراً بعد شهر. إنها ليست هيكل عمولة. إنه دخل طويل الأجل يكافئك على بناء شيء حقيقي.

أتواصل معك دون أي توقعات. اعتقدت ببساطة أن هذا، بالنظر إلى خلفيتك ونوع العملاء الذين تعمل معهم، قد يستحق الفهم.

إذا كنت يوماً ما فضولياً لمعرفة المزيد، يسعدني مشاركة نظرة عامة موجزة في الوقت المناسب لك. لا التزامات، لا ضغط.

مع خالص التحية،

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

عزيزي/عزيزتي [RECIPIENT_NAME]،

أتواصل معك مباشرة لأنني أؤمن بأنك النوع من المحترفين الذين سيقدّرون حقاً ما أوشك على مشاركته.

أنا جزء من شبكة دولية متنامية من المستشارين المستقلين المنتسبين إلى Plan B · Diamond Solution. نعمل مع العملاء الذين يسعون إلى الحفاظ على ثرواتهم وتنميتها خارج الأسواق المالية التقليدية تماماً — من خلال الاستثمار في الألماس المادي، وهو فئة أصول غير عامة وغير متداولة مع آلية خصم شهرية منظمة.

ما يجعل هذا يستحق الاهتمام بشكل خاص هو بنية الأعمال. المستشارون الذين يبنون فريقاً يحصلون على دخل متبقٍ شفاف طويل الأجل يتراكم مع نمو محافظ عملائهم المُعرَّفين — شهراً بعد شهر، عاماً بعد عام.

أود جدولة 30 دقيقة لأطلعك على النموذج الكامل. أنا واثق من أنك بمجرد رؤية الهيكل بوضوح، ستمتلك كل ما تحتاجه لاتخاذ قرارك المستنير الخاص.

هل ستكون منفتحاً/ة على مكالمة قصيرة أو اجتماع في الأيام القادمة؟

مع خالص التحية،

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  th: {
    passive:
`[DATE]

เรียน คุณ[RECIPIENT_NAME]

หวังว่าข้อความนี้จะถึงคุณในช่วงเวลาที่ดี

ฉันเขียนมาเพื่อแนะนำสิ่งที่ฉันกำลังสร้าง — รูปแบบธุรกิจที่ปรึกษาด้านความมั่งคั่งและเครือข่ายที่ฉันเชื่อว่าคุ้มค่าแก่การพูดคุย

ผ่านการทำงานกับ Plan B · Diamond Solution ฉันเป็นส่วนหนึ่งของเครือข่ายที่ปรึกษาอิสระที่แนะนำลูกค้าให้รู้จักการลงทุนในเพชรจริง นี่คือสินทรัพย์ที่จับต้องได้ซึ่งไม่มีการซื้อขายในตลาดหลักทรัพย์ ออกแบบมาเพื่อการรักษามูลค่าความมั่งคั่งในระยะยาว — ไม่เกี่ยวข้องกับหุ้น สกุลเงิน หรือความเสี่ยงด้านอัตราดอกเบี้ย

โมเดลธุรกิจพื้นฐานสร้างขึ้นบนรายได้ค้างรับที่มีโครงสร้างและโปร่งใสซึ่งเติบโตขึ้นเมื่อพอร์ตโฟลิโอของลูกค้าสะสมทบต้นเดือนแล้วเดือนเล่า ไม่ใช่โครงสร้างค่าคอมมิชชัน แต่เป็นรายได้ระยะยาวที่ตอบแทนคุณสำหรับการสร้างสิ่งที่แท้จริง

ฉันติดต่อคุณโดยไม่มีความคาดหวังใดๆ ฉันแค่คิดว่าด้วยพื้นฐานของคุณและประเภทของลูกค้าที่คุณทำงานด้วย สิ่งนี้อาจคุ้มค่าแก่การทำความเข้าใจ

หากคุณสนใจอยากเรียนรู้เพิ่มเติม ฉันยินดีแบ่งปันภาพรวมสั้นๆ ในเวลาที่เหมาะสมสำหรับคุณ ไม่มีข้อผูกมัด ไม่มีแรงกดดัน

ด้วยความนับถือ

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

เรียน คุณ[RECIPIENT_NAME]

ฉันติดต่อคุณโดยตรงเพราะเชื่อว่าคุณคือประเภทของมืออาชีพที่จะชื่นชมสิ่งที่ฉันกำลังจะแบ่งปันอย่างแท้จริง

ฉันเป็นส่วนหนึ่งของเครือข่ายนานาชาติที่เติบโตของที่ปรึกษาอิสระที่เกี่ยวข้องกับ Plan B · Diamond Solution เราทำงานกับลูกค้าที่ต้องการรักษาและเพิ่มพูนความมั่งคั่งนอกตลาดการเงินแบบดั้งเดิมอย่างสมบูรณ์ — ผ่านการลงทุนในเพชรจริง ซึ่งเป็นประเภทสินทรัพย์ที่ไม่เป็นสาธารณะและไม่มีการซื้อขาย พร้อมกลไกส่วนลดรายเดือนที่มีโครงสร้าง

สิ่งที่ทำให้น่าสนใจเป็นพิเศษคือสถาปัตยกรรมธุรกิจ ที่ปรึกษาที่สร้างทีมจะได้รับรายได้ค้างรับระยะยาวที่โปร่งใสซึ่งทบต้นเมื่อพอร์ตโฟลิโอของลูกค้าที่แนะนำเติบโต — เดือนแล้วเดือนเล่า ปีแล้วปีเล่า

ฉันต้องการนัดหมาย 30 นาทีเพื่อพาคุณผ่านโมเดลทั้งหมด ฉันมั่นใจว่าเมื่อคุณเห็นโครงสร้างอย่างชัดเจน คุณจะมีทุกสิ่งที่จำเป็นในการตัดสินใจอย่างมีข้อมูลของคุณเอง

คุณจะเปิดรับการโทรสั้นๆ หรือการนัดพบในวันข้างหน้าไหม?

ด้วยความนับถือ

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  hi: {
    passive:
`[DATE]

प्रिय [RECIPIENT_NAME],

आशा है यह संदेश आपको अच्छे स्वास्थ्य में पाएगा।

मैं आपको कुछ ऐसी चीज़ से परिचित कराने के लिए लिख रहा हूँ जिस पर मैं काम कर रहा हूँ — एक धन सलाहकारी और नेटवर्क व्यवसाय मॉडल जिसे मुझे लगता है कि एक बातचीत का मूल्य है।

Plan B · Diamond Solution के साथ अपने काम के माध्यम से, मैं स्वतंत्र सलाहकारों के एक नेटवर्क का हिस्सा हूँ जो ग्राहकों को भौतिक हीरे के निवेश से परिचित कराते हैं। यह एक मूर्त संपत्ति है जो शेयर बाजार में कारोबार नहीं होती, दीर्घकालिक धन संरक्षण के लिए डिज़ाइन की गई है — पूरी तरह से इक्विटी, मुद्राओं और ब्याज दर जोखिम के बाहर।

इसके अंतर्निहित व्यवसाय मॉडल को एक संरचित, पारदर्शी अवशिष्ट आय पर बनाया गया है जो महीने दर महीने ग्राहक पोर्टफोलियो बढ़ने पर बढ़ती है। यह कोई कमीशन संरचना नहीं है। यह एक दीर्घकालिक आय है जो आपको कुछ वास्तविक बनाने के लिए पुरस्कृत करती है।

मैं बिना किसी अपेक्षा के आपसे संपर्क कर रहा हूँ। मैंने बस सोचा कि, आपकी पृष्ठभूमि और आप जिस प्रकार के ग्राहकों के साथ काम करते हैं उसे देखते हुए, यह समझने लायक हो सकता है।

यदि आप कभी और जानना चाहते हैं, तो मुझे आपकी सुविधा के अनुसार एक संक्षिप्त अवलोकन साझा करने में प्रसन्नता होगी। कोई दायित्व नहीं, कोई दबाव नहीं।

सादर,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

प्रिय [RECIPIENT_NAME],

मैं सीधे आपसे संपर्क कर रहा हूँ क्योंकि मुझे विश्वास है कि आप उस प्रकार के पेशेवर हैं जो मैं जो साझा करने वाला हूँ उसकी वास्तव में सराहना करेंगे।

मैं Plan B · Diamond Solution से संबद्ध स्वतंत्र सलाहकारों के एक बढ़ते अंतरराष्ट्रीय नेटवर्क का हिस्सा हूँ। हम उन ग्राहकों के साथ काम करते हैं जो पारंपरिक वित्तीय बाजारों के पूरी तरह बाहर धन को संरक्षित और बढ़ाना चाहते हैं — भौतिक हीरे के निवेश के माध्यम से, एक संरचित मासिक छूट तंत्र के साथ एक गैर-सार्वजनिक, गैर-कारोबार वाला परिसंपत्ति वर्ग।

इसे विशेष रूप से ध्यान देने योग्य बनाता है व्यवसाय वास्तुकला। जो सलाहकार एक टीम बनाते हैं वे पारदर्शी, दीर्घकालिक अवशिष्ट आय अर्जित करते हैं जो महीने दर महीने, साल दर साल उनके परिचित ग्राहकों के पोर्टफोलियो बढ़ने पर चक्रवृद्धि होती है।

मैं 30 मिनट का समय निर्धारित करना चाहूँगा ताकि आपको पूरे मॉडल से अवगत करा सकूँ। मुझे विश्वास है कि एक बार जब आप संरचना को स्पष्ट रूप से देख लेंगे, तो आपके पास अपना सूचित निर्णय लेने के लिए सभी आवश्यक जानकारी होगी।

क्या आप आने वाले दिनों में एक संक्षिप्त कॉल या बैठक के लिए तैयार होंगे?

सादर,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },

  vi: {
    passive:
`[DATE]

Kính gửi [RECIPIENT_NAME],

Tôi hy vọng thư này đến tay bạn trong lúc bạn đang khỏe mạnh.

Tôi viết thư này để giới thiệu với bạn điều tôi đang xây dựng — một mô hình kinh doanh tư vấn tài sản và mạng lưới mà tôi tin rằng xứng đáng để trò chuyện.

Thông qua công việc của tôi với Plan B · Diamond Solution, tôi là một phần của mạng lưới các cố vấn độc lập giới thiệu khách hàng về đầu tư kim cương vật lý. Đây là tài sản hữu hình không được giao dịch trên sàn chứng khoán, được thiết kế để bảo toàn tài sản dài hạn — hoàn toàn ngoài cổ phiếu, tiền tệ và rủi ro lãi suất.

Mô hình kinh doanh cơ bản được xây dựng trên thu nhập thặng dư có cấu trúc, minh bạch tăng lên khi danh mục đầu tư của khách hàng tích lũy tháng này qua tháng khác. Đây không phải là cấu trúc hoa hồng. Đây là thu nhập dài hạn thưởng cho bạn vì đã xây dựng điều gì đó có thực.

Tôi liên hệ với bạn mà không có kỳ vọng nào. Tôi chỉ nghĩ rằng, với nền tảng của bạn và loại khách hàng bạn làm việc cùng, điều này có thể đáng để hiểu.

Nếu bạn muốn tìm hiểu thêm, tôi rất vui được chia sẻ tổng quan ngắn gọn vào thời điểm thuận tiện cho bạn. Không có nghĩa vụ, không có áp lực.

Trân trọng,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,

    active:
`[DATE]

Kính gửi [RECIPIENT_NAME],

Tôi liên hệ trực tiếp với bạn vì tôi tin rằng bạn chính là loại chuyên gia sẽ thực sự đánh giá cao những gì tôi sắp chia sẻ.

Tôi là một phần của mạng lưới quốc tế đang phát triển gồm các cố vấn độc lập liên kết với Plan B · Diamond Solution. Chúng tôi làm việc với các khách hàng muốn bảo toàn và phát triển tài sản hoàn toàn ngoài thị trường tài chính truyền thống — thông qua đầu tư kim cương vật lý, một loại tài sản không công khai, không giao dịch với cơ chế hoàn tiền hàng tháng có cấu trúc.

Điều làm cho điều này đặc biệt đáng chú ý là kiến trúc kinh doanh. Các cố vấn xây dựng đội nhóm kiếm được thu nhập thặng dư dài hạn minh bạch tăng lên khi danh mục đầu tư của khách hàng được giới thiệu tăng trưởng — tháng này qua tháng khác, năm này qua năm khác.

Tôi muốn lên lịch 30 phút để giới thiệu toàn bộ mô hình cho bạn. Tôi tự tin rằng khi bạn thấy cấu trúc rõ ràng, bạn sẽ có mọi thứ cần thiết để đưa ra quyết định sáng suốt của riêng mình.

Bạn có sẵn lòng cho một cuộc gọi ngắn hoặc cuộc gặp trong những ngày tới không?

Trân trọng,

[ADVISER_NAME]
[ADVISER_COMPANY]
[ADVISER_MOBILE]
[ADVISER_CONTACT]`,
  },
};

export function getAdvisorTemplate(lang: Language, type: AdvisorLetterType): string {
  return (T[lang] ?? T.en)[type] ?? T.en[type];
}

export function buildAdvisorLetter(
  lang: Language,
  type: AdvisorLetterType,
  recipientName: string,
  adviserName: string,
  adviserCompany: string,
  adviserMobile: string,
  adviserContact: string,
  date: string,
): string {
  return getAdvisorTemplate(lang, type)
    .replace(/\[DATE\]/g, date)
    .replace(/\[RECIPIENT_NAME\]/g, recipientName || "———")
    .replace(/\[ADVISER_NAME\]/g, adviserName || "———")
    .replace(/\[ADVISER_COMPANY\]/g, adviserCompany || "———")
    .replace(/\[ADVISER_MOBILE\]/g, adviserMobile || "———")
    .replace(/\[ADVISER_CONTACT\]/g, adviserContact || "———");
}
