import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ComplianceDoc {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  issuer: string;
  detail: string;
  badge: string;
  badgeColor: string;
  url: string;
  qrNote?: string;
}

// ─── Translations ─────────────────────────────────────────────────────────────
const COMPLIANCE_TEXT: Record<string, {
  headerTitle: string;
  headerSub: string;
  regDubai: string;
  regSec: string;
  regGia: string;
  viewDoc: string;
  footerText: string;
  docs: {
    dmcc: { title: string; subtitle: string; detail: string; badge: string };
    sira: { title: string; subtitle: string; detail: string; badge: string };
    sec: { title: string; subtitle: string; detail: string; badge: string };
    gia: { title: string; subtitle: string; detail: string; badge: string; qrNote: string };
    legal: { title: string; subtitle: string; detail: string; badge: string };
    purchase: { title: string; subtitle: string; detail: string; badge: string };
    stig: { title: string; subtitle: string; detail: string; badge: string };
  };
}> = {
  en: {
    headerTitle: "🛡️ COMPLIANCE",
    headerSub: "Diamond Solution is a fully licensed and regulated company. All certificates and legal documents are available below for your review.",
    regDubai: "Dubai DMCC",
    regSec: "SEC Philippines",
    regGia: "GIA Certified",
    viewDoc: "📄 View Document",
    footerText: "All documents are official and unaltered. Diamond Solution International operates under the regulatory frameworks of the UAE (DMCC/SIRA) and the Philippines (SEC). GIA certificates are issued independently by the Gemological Institute of America.",
    docs: {
      dmcc: {
        title: "DMCC Business License",
        subtitle: "Dubai Multi Commodities Centre",
        detail: "Official trade license issued by DMCC — the world's largest free trade zone authority in Dubai, UAE. Authorises Diamond Solution to operate as a registered commodities business within the Dubai Freezone.",
        badge: "ACTIVE",
      },
      sira: {
        title: "SIRA Security Certification",
        subtitle: "Security Industry Regulatory Agency",
        detail: "Certification from the Security Industry Regulatory Agency (SIRA) of Dubai. Confirms that Diamond Solution meets the regulatory standards for secure asset handling and storage operations in the UAE.",
        badge: "CERTIFIED",
      },
      sec: {
        title: "SEC Philippines Registration",
        subtitle: "Securities and Exchange Commission",
        detail: "Corporate registration certificate issued by the Securities and Exchange Commission of the Philippines. Confirms Diamond Solution's legal corporate status and right to operate in the Philippine jurisdiction.",
        badge: "REGISTERED",
      },
      gia: {
        title: "GIA Diamond Certificate",
        subtitle: "Gemological Institute of America",
        detail: "Sample GIA grading report for a Round Brilliant diamond (0.71ct, E color, VVS1 clarity, Excellent cut). All diamonds in the Plan B program are independently certified by GIA — the global gold standard for diamond quality assessment.",
        badge: "CERTIFIED",
        qrNote: "💡 You can verify this certificate directly on the GIA website by scanning the QR code on the document or entering Report No. 3405502857 at gia.edu/report-check.",
      },
      legal: {
        title: "Legal Information Memorandum",
        subtitle: "Safety Declaration (EN)",
        detail: "Official legal information memorandum and safety declaration. Covers the contractual framework, ownership rights, buyback guarantee terms, storage conditions, and investor protections for the Plan B diamond investment program.",
        badge: "OFFICIAL",
      },
      purchase: {
        title: "Diamond Solution Plan – Purchase Agreement",
        subtitle: "STIG International Gemstone FZCO",
        detail: "Official purchase agreement template for the Diamond Solution Plan. Covers the purchase price, monthly rebate/discount structure, 100% buyback option after 12 months, delivery options, transfer of ownership, and Kimberley Process conflict-free certification. Governed by UAE/Dubai law.",
        badge: "TEMPLATE",
      },
      stig: {
        title: "STIG International — Parent Company",
        subtitle: "STIG International Gemstone FZCO",
        detail: "STIG International Gemstone FZCO is the parent company behind Diamond Solution. They source, certify, and distribute GIA-certified physical diamonds globally through the DMCC free trade zone in Dubai. This page shows the full range of certified diamond investment products — providing full transparency on the underlying assets backing the Diamond Solution program.",
        badge: "OFFICIAL",
      },
    },
  },
  nl: {
    headerTitle: "🛡️ COMPLIANCE",
    headerSub: "Diamond Solution is een volledig gelicenseerd en gereguleerd bedrijf. Alle certificaten en juridische documenten zijn hieronder beschikbaar voor uw beoordeling.",
    regDubai: "Dubai DMCC",
    regSec: "SEC Filipijnen",
    regGia: "GIA Gecertificeerd",
    viewDoc: "📄 Document Bekijken",
    footerText: "Alle documenten zijn officieel en ongewijzigd. Diamond Solution International opereert onder de regelgevende kaders van de VAE (DMCC/SIRA) en de Filipijnen (SEC). GIA-certificaten worden onafhankelijk uitgegeven door het Gemological Institute of America.",
    docs: {
      dmcc: {
        title: "DMCC Bedrijfslicentie",
        subtitle: "Dubai Multi Commodities Centre",
        detail: "Officiële handelslicentie uitgegeven door DMCC — de grootste vrijhandelszone-autoriteit ter wereld in Dubai, VAE. Machtigt Diamond Solution om als geregistreerd grondstoffenbedrijf te opereren binnen de Dubai Vrijhandelszone.",
        badge: "ACTIEF",
      },
      sira: {
        title: "SIRA Beveiligingscertificering",
        subtitle: "Security Industry Regulatory Agency",
        detail: "Certificering van het Security Industry Regulatory Agency (SIRA) van Dubai. Bevestigt dat Diamond Solution voldoet aan de regelgevende normen voor veilige activaverwerking en opslagoperaties in de VAE.",
        badge: "GECERTIFICEERD",
      },
      sec: {
        title: "SEC Filipijnen Registratie",
        subtitle: "Securities and Exchange Commission",
        detail: "Bedrijfsregistratiecertificaat uitgegeven door de Securities and Exchange Commission van de Filipijnen. Bevestigt de juridische bedrijfsstatus van Diamond Solution en het recht om te opereren in de Filipijnse jurisdictie.",
        badge: "GEREGISTREERD",
      },
      gia: {
        title: "GIA Diamantcertificaat",
        subtitle: "Gemological Institute of America",
        detail: "Voorbeeld GIA-beoordelingsrapport voor een ronde briljant diamant (0,71ct, kleur E, helderheid VVS1, uitstekende slijpvorm). Alle diamanten in het Plan B-programma zijn onafhankelijk gecertificeerd door GIA — de wereldwijde goudstandaard voor diamantkwaliteitsbeoordeling.",
        badge: "GECERTIFICEERD",
        qrNote: "💡 U kunt dit certificaat rechtstreeks verifiëren op de GIA-website door de QR-code op het document te scannen of rapportnummer 3405502857 in te voeren op gia.edu/report-check.",
      },
      legal: {
        title: "Juridisch Informatiememorandum",
        subtitle: "Veiligheidsverklaring (EN)",
        detail: "Officieel juridisch informatiememorandum en veiligheidsverklaring. Behandelt het contractuele kader, eigendomsrechten, terugkoopgarantievoorwaarden, opslagomstandigheden en beleggersbeschermingen voor het Plan B diamantinvesteringsprogramma.",
        badge: "OFFICIEEL",
      },
      purchase: {
        title: "Diamond Solution Plan – Koopovereenkomst",
        subtitle: "STIG International Gemstone FZCO",
        detail: "Officieel koopovereenkomstsjabloon voor het Diamond Solution Plan. Behandelt de aankoopprijs, maandelijkse korting/rabatstructuur, 100% terugkoopoptie na 12 maanden, leveringsopties, eigendomsoverdracht en Kimberley Process conflictvrije certificering. Beheerst door VAE/Dubai-recht.",
        badge: "SJABLOON",
      },
      stig: {
        title: "STIG International — Moederbedrijf",
        subtitle: "STIG International Gemstone FZCO",
        detail: "STIG International Gemstone FZCO is het moederbedrijf achter Diamond Solution. Ze sourcen, certificeren en distribueren GIA-gecertificeerde fysieke diamanten wereldwijd via de DMCC vrijhandelszone in Dubai. Volledige transparantie over de onderliggende activa.",
        badge: "OFFICIEEL",
      },
    },
  },
  de: {
    headerTitle: "🛡️ COMPLIANCE",
    headerSub: "Diamond Solution ist ein vollständig lizenziertes und reguliertes Unternehmen. Alle Zertifikate und rechtlichen Dokumente stehen Ihnen unten zur Verfügung.",
    regDubai: "Dubai DMCC",
    regSec: "SEC Philippinen",
    regGia: "GIA Zertifiziert",
    viewDoc: "📄 Dokument Anzeigen",
    footerText: "Alle Dokumente sind offiziell und unverändert. Diamond Solution International operiert unter den Regulierungsrahmen der VAE (DMCC/SIRA) und der Philippinen (SEC). GIA-Zertifikate werden unabhängig vom Gemological Institute of America ausgestellt.",
    docs: {
      dmcc: {
        title: "DMCC Geschäftslizenz",
        subtitle: "Dubai Multi Commodities Centre",
        detail: "Offizielle Handelslizenz, ausgestellt von DMCC — der weltgrößten Freihandelszonen-Behörde in Dubai, VAE. Ermächtigt Diamond Solution, als registriertes Rohstoffunternehmen innerhalb der Dubai Freihandelszone zu operieren.",
        badge: "AKTIV",
      },
      sira: {
        title: "SIRA Sicherheitszertifizierung",
        subtitle: "Security Industry Regulatory Agency",
        detail: "Zertifizierung der Security Industry Regulatory Agency (SIRA) von Dubai. Bestätigt, dass Diamond Solution die regulatorischen Standards für sichere Vermögensverwaltung und Lageroperationen in den VAE erfüllt.",
        badge: "ZERTIFIZIERT",
      },
      sec: {
        title: "SEC Philippinen Registrierung",
        subtitle: "Securities and Exchange Commission",
        detail: "Unternehmensregistrierungszertifikat, ausgestellt von der Securities and Exchange Commission der Philippinen. Bestätigt den rechtlichen Unternehmensstatus von Diamond Solution und das Recht, in der philippinischen Gerichtsbarkeit zu operieren.",
        badge: "REGISTRIERT",
      },
      gia: {
        title: "GIA Diamantzertifikat",
        subtitle: "Gemological Institute of America",
        detail: "Beispiel-GIA-Bewertungsbericht für einen runden Brillanten (0,71ct, Farbe E, Reinheit VVS1, ausgezeichneter Schliff). Alle Diamanten im Plan B-Programm sind unabhängig von GIA zertifiziert — dem weltweiten Goldstandard für Diamantqualitätsbewertung.",
        badge: "ZERTIFIZIERT",
        qrNote: "💡 Sie können dieses Zertifikat direkt auf der GIA-Website überprüfen, indem Sie den QR-Code auf dem Dokument scannen oder die Berichtsnummer 3405502857 auf gia.edu/report-check eingeben.",
      },
      legal: {
        title: "Rechtliches Informationsmemorandum",
        subtitle: "Sicherheitserklärung (EN)",
        detail: "Offizielles rechtliches Informationsmemorandum und Sicherheitserklärung. Behandelt den vertraglichen Rahmen, Eigentumsrechte, Rückkaufgarantiebedingungen, Lagerbedingungen und Anlegerschutz für das Plan B Diamantinvestitionsprogramm.",
        badge: "OFFIZIELL",
      },
      purchase: {
        title: "Diamond Solution Plan – Kaufvertrag",
        subtitle: "STIG International Gemstone FZCO",
        detail: "Offizielles Kaufvertragsvorlage für den Diamond Solution Plan. Behandelt den Kaufpreis, monatliche Rabattstruktur, 100% Rückkaufoption nach 12 Monaten, Lieferoptionen, Eigentumsübertragung und Kimberley-Prozess-Zertifizierung. Unterliegt dem VAE/Dubai-Recht.",
        badge: "VORLAGE",
      },
      stig: {
        title: "STIG International — Muttergesellschaft",
        subtitle: "STIG International Gemstone FZCO",
        detail: "STIG International Gemstone FZCO ist die Muttergesellschaft hinter Diamond Solution. Sie beschaffen, zertifizieren und vertreiben GIA-zertifizierte physische Diamanten weltweit über die DMCC-Freihandelszone in Dubai. Vollständige Transparenz über die zugrunde liegenden Vermögenswerte.",
        badge: "OFFIZIELL",
      },
    },
  },
  fr: {
    headerTitle: "🛡️ CONFORMITÉ",
    headerSub: "Diamond Solution est une société entièrement agréée et réglementée. Tous les certificats et documents juridiques sont disponibles ci-dessous pour votre examen.",
    regDubai: "Dubai DMCC",
    regSec: "SEC Philippines",
    regGia: "Certifié GIA",
    viewDoc: "📄 Voir le Document",
    footerText: "Tous les documents sont officiels et non modifiés. Diamond Solution International opère sous les cadres réglementaires des EAU (DMCC/SIRA) et des Philippines (SEC). Les certificats GIA sont délivrés indépendamment par le Gemological Institute of America.",
    docs: {
      dmcc: {
        title: "Licence Commerciale DMCC",
        subtitle: "Dubai Multi Commodities Centre",
        detail: "Licence commerciale officielle délivrée par le DMCC — la plus grande autorité de zone de libre-échange au monde à Dubaï, EAU. Autorise Diamond Solution à opérer en tant qu'entreprise de matières premières enregistrée dans la zone franche de Dubaï.",
        badge: "ACTIF",
      },
      sira: {
        title: "Certification de Sécurité SIRA",
        subtitle: "Security Industry Regulatory Agency",
        detail: "Certification de l'Agence de Réglementation de l'Industrie de la Sécurité (SIRA) de Dubaï. Confirme que Diamond Solution répond aux normes réglementaires pour la gestion sécurisée des actifs et les opérations de stockage aux EAU.",
        badge: "CERTIFIÉ",
      },
      sec: {
        title: "Enregistrement SEC Philippines",
        subtitle: "Securities and Exchange Commission",
        detail: "Certificat d'enregistrement d'entreprise délivré par la Securities and Exchange Commission des Philippines. Confirme le statut juridique de Diamond Solution et son droit d'opérer dans la juridiction philippine.",
        badge: "ENREGISTRÉ",
      },
      gia: {
        title: "Certificat de Diamant GIA",
        subtitle: "Gemological Institute of America",
        detail: "Exemple de rapport d'évaluation GIA pour un diamant rond brillant (0,71ct, couleur E, pureté VVS1, taille excellente). Tous les diamants du programme Plan B sont certifiés indépendamment par GIA — l'étalon-or mondial pour l'évaluation de la qualité des diamants.",
        badge: "CERTIFIÉ",
        qrNote: "💡 Vous pouvez vérifier ce certificat directement sur le site GIA en scannant le code QR sur le document ou en saisissant le numéro de rapport 3405502857 sur gia.edu/report-check.",
      },
      legal: {
        title: "Mémorandum d'Information Juridique",
        subtitle: "Déclaration de Sécurité (EN)",
        detail: "Mémorandum d'information juridique officiel et déclaration de sécurité. Couvre le cadre contractuel, les droits de propriété, les conditions de garantie de rachat, les conditions de stockage et les protections des investisseurs pour le programme d'investissement en diamants Plan B.",
        badge: "OFFICIEL",
      },
      purchase: {
        title: "Diamond Solution Plan – Contrat d'Achat",
        subtitle: "STIG International Gemstone FZCO",
        detail: "Modèle de contrat d'achat officiel pour le Diamond Solution Plan. Couvre le prix d'achat, la structure de remise mensuelle, l'option de rachat à 100% après 12 mois, les options de livraison, le transfert de propriété et la certification Kimberley Process. Régi par le droit des EAU/Dubaï.",
        badge: "MODÈLE",
      },
      stig: {
        title: "STIG International — Société Mère",
        subtitle: "STIG International Gemstone FZCO",
        detail: "STIG International Gemstone FZCO est la société mère de Diamond Solution. Ils sourcent, certifient et distribuent des diamants physiques certifiés GIA dans le monde entier via la zone franche DMCC à Dubaï. Transparence totale sur les actifs sous-jacents.",
        badge: "OFFICIEL",
      },
    },
  },
  es: {
    headerTitle: "🛡️ CUMPLIMIENTO",
    headerSub: "Diamond Solution es una empresa completamente licenciada y regulada. Todos los certificados y documentos legales están disponibles a continuación para su revisión.",
    regDubai: "Dubai DMCC",
    regSec: "SEC Filipinas",
    regGia: "Certificado GIA",
    viewDoc: "📄 Ver Documento",
    footerText: "Todos los documentos son oficiales y sin alteraciones. Diamond Solution International opera bajo los marcos regulatorios de los EAU (DMCC/SIRA) y Filipinas (SEC). Los certificados GIA son emitidos independientemente por el Instituto Gemológico de América.",
    docs: {
      dmcc: {
        title: "Licencia Comercial DMCC",
        subtitle: "Dubai Multi Commodities Centre",
        detail: "Licencia comercial oficial emitida por DMCC — la autoridad de zona de libre comercio más grande del mundo en Dubai, EAU. Autoriza a Diamond Solution a operar como empresa de materias primas registrada dentro de la Zona Franca de Dubai.",
        badge: "ACTIVO",
      },
      sira: {
        title: "Certificación de Seguridad SIRA",
        subtitle: "Security Industry Regulatory Agency",
        detail: "Certificación de la Agencia Reguladora de la Industria de Seguridad (SIRA) de Dubai. Confirma que Diamond Solution cumple con los estándares regulatorios para el manejo seguro de activos y operaciones de almacenamiento en los EAU.",
        badge: "CERTIFICADO",
      },
      sec: {
        title: "Registro SEC Filipinas",
        subtitle: "Securities and Exchange Commission",
        detail: "Certificado de registro corporativo emitido por la Comisión de Valores y Bolsa de Filipinas. Confirma el estado legal corporativo de Diamond Solution y el derecho a operar en la jurisdicción filipina.",
        badge: "REGISTRADO",
      },
      gia: {
        title: "Certificado de Diamante GIA",
        subtitle: "Instituto Gemológico de América",
        detail: "Informe de clasificación GIA de muestra para un diamante redondo brillante (0,71ct, color E, claridad VVS1, corte excelente). Todos los diamantes del programa Plan B están certificados independientemente por GIA — el estándar de oro mundial para la evaluación de la calidad de los diamantes.",
        badge: "CERTIFICADO",
        qrNote: "💡 Puede verificar este certificado directamente en el sitio web de GIA escaneando el código QR en el documento o ingresando el número de informe 3405502857 en gia.edu/report-check.",
      },
      legal: {
        title: "Memorando de Información Legal",
        subtitle: "Declaración de Seguridad (EN)",
        detail: "Memorando de información legal oficial y declaración de seguridad. Cubre el marco contractual, derechos de propiedad, términos de garantía de recompra, condiciones de almacenamiento y protecciones para inversores del programa de inversión en diamantes Plan B.",
        badge: "OFICIAL",
      },
      purchase: {
        title: "Diamond Solution Plan – Contrato de Compra",
        subtitle: "STIG International Gemstone FZCO",
        detail: "Plantilla de contrato de compra oficial para el Diamond Solution Plan. Cubre el precio de compra, estructura de descuento mensual, opción de recompra al 100% después de 12 meses, opciones de entrega, transferencia de propiedad y certificación del Proceso Kimberley. Regido por la ley de EAU/Dubai.",
        badge: "PLANTILLA",
      },
      stig: {
        title: "STIG International — Empresa Matriz",
        subtitle: "STIG International Gemstone FZCO",
        detail: "STIG International Gemstone FZCO es la empresa matriz detrás de Diamond Solution. Obtienen, certifican y distribuyen diamantes físicos certificados por GIA a nivel mundial a través de la zona franca DMCC en Dubái. Transparencia total sobre los activos subyacentes.",
        badge: "OFICIAL",
      },
    },
  },
  ru: {
    headerTitle: "🛡️ СООТВЕТСТВИЕ",
    headerSub: "Diamond Solution — полностью лицензированная и регулируемая компания. Все сертификаты и юридические документы доступны ниже для вашего ознакомления.",
    regDubai: "Дубай DMCC",
    regSec: "SEC Филиппины",
    regGia: "Сертификат GIA",
    viewDoc: "📄 Просмотреть Документ",
    footerText: "Все документы являются официальными и неизменёнными. Diamond Solution International работает в соответствии с нормативными базами ОАЭ (DMCC/SIRA) и Филиппин (SEC). Сертификаты GIA выдаются независимо Геммологическим институтом Америки.",
    docs: {
      dmcc: {
        title: "Бизнес-лицензия DMCC",
        subtitle: "Дубайский многотоварный центр",
        detail: "Официальная торговая лицензия, выданная DMCC — крупнейшей в мире организацией свободной торговой зоны в Дубае, ОАЭ. Разрешает Diamond Solution работать как зарегистрированная товарная компания в Дубайской свободной зоне.",
        badge: "АКТИВНА",
      },
      sira: {
        title: "Сертификация безопасности SIRA",
        subtitle: "Агентство по регулированию охранной отрасли",
        detail: "Сертификация Агентства по регулированию охранной отрасли (SIRA) Дубая. Подтверждает, что Diamond Solution соответствует нормативным стандартам безопасного управления активами и операций хранения в ОАЭ.",
        badge: "СЕРТИФИЦИРОВАНО",
      },
      sec: {
        title: "Регистрация SEC Филиппины",
        subtitle: "Комиссия по ценным бумагам и биржам",
        detail: "Корпоративный регистрационный сертификат, выданный Комиссией по ценным бумагам и биржам Филиппин. Подтверждает юридический корпоративный статус Diamond Solution и право работать в филиппинской юрисдикции.",
        badge: "ЗАРЕГИСТРИРОВАНО",
      },
      gia: {
        title: "Сертификат бриллианта GIA",
        subtitle: "Геммологический институт Америки",
        detail: "Образец отчёта об оценке GIA для круглого бриллианта (0,71 карата, цвет E, чистота VVS1, отличная огранка). Все бриллианты в программе Plan B независимо сертифицированы GIA — мировым золотым стандартом оценки качества бриллиантов.",
        badge: "СЕРТИФИЦИРОВАНО",
        qrNote: "💡 Вы можете проверить этот сертификат непосредственно на сайте GIA, отсканировав QR-код на документе или введя номер отчёта 3405502857 на gia.edu/report-check.",
      },
      legal: {
        title: "Юридический информационный меморандум",
        subtitle: "Декларация безопасности (EN)",
        detail: "Официальный юридический информационный меморандум и декларация безопасности. Охватывает договорную базу, права собственности, условия гарантии обратного выкупа, условия хранения и защиту инвесторов для программы инвестирования в бриллианты Plan B.",
        badge: "ОФИЦИАЛЬНО",
      },
      purchase: {
        title: "Diamond Solution Plan – Договор купли-продажи",
        subtitle: "STIG International Gemstone FZCO",
        detail: "Официальный шаблон договора купли-продажи для Diamond Solution Plan. Охватывает цену покупки, ежемесячную структуру скидок, опцию обратного выкупа 100% через 12 месяцев, варианты доставки, переход права собственности и сертификацию Кимберлийского процесса. Регулируется законодательством ОАЭ/Дубая.",
        badge: "ШАБЛОН",
      },
      stig: {
        title: "STIG International — Материнская Компания",
        subtitle: "STIG International Gemstone FZCO",
        detail: "STIG International Gemstone FZCO является материнской компанией Diamond Solution. Они поставляют, сертифицируют и распространяют физические алмазы с сертификацией GIA по всему миру через свободную экономическую зону DMCC в Дубае. Полная прозрачность относительно базовых активов.",
        badge: "ОФИЦИАЛЬНО",
      },
    },
  },
  zh: {
    headerTitle: "🛡️ 合规",
    headerSub: "Diamond Solution是一家完全持牌且受监管的公司。所有证书和法律文件均可在下方查阅。",
    regDubai: "迪拜DMCC",
    regSec: "菲律宾SEC",
    regGia: "GIA认证",
    viewDoc: "📄 查看文件",
    footerText: "所有文件均为官方原件，未经修改。Diamond Solution International在阿联酋（DMCC/SIRA）和菲律宾（SEC）的监管框架下运营。GIA证书由美国宝石学院独立颁发。",
    docs: {
      dmcc: {
        title: "DMCC营业执照",
        subtitle: "迪拜多种商品中心",
        detail: "由DMCC颁发的官方贸易执照——世界上最大的自由贸易区管理机构，位于阿联酋迪拜。授权Diamond Solution在迪拜自由区内作为注册商品企业运营。",
        badge: "有效",
      },
      sira: {
        title: "SIRA安全认证",
        subtitle: "安全行业监管机构",
        detail: "迪拜安全行业监管机构（SIRA）的认证。确认Diamond Solution符合阿联酋安全资产处理和存储运营的监管标准。",
        badge: "已认证",
      },
      sec: {
        title: "菲律宾SEC注册",
        subtitle: "证券交易委员会",
        detail: "由菲律宾证券交易委员会颁发的公司注册证书。确认Diamond Solution的合法公司地位及在菲律宾司法管辖区内的运营权。",
        badge: "已注册",
      },
      gia: {
        title: "GIA钻石证书",
        subtitle: "美国宝石学院",
        detail: "圆形明亮式钻石的GIA分级报告样本（0.71克拉，E色，VVS1净度，优秀切工）。Plan B计划中的所有钻石均由GIA独立认证——钻石质量评估的全球黄金标准。",
        badge: "已认证",
        qrNote: "💡 您可以通过扫描文件上的二维码或在gia.edu/report-check上输入报告编号3405502857，直接在GIA网站上验证此证书。",
      },
      legal: {
        title: "法律信息备忘录",
        subtitle: "安全声明（英文）",
        detail: "官方法律信息备忘录和安全声明。涵盖Plan B钻石投资计划的合同框架、所有权、回购保证条款、存储条件和投资者保护。",
        badge: "官方",
      },
      purchase: {
        title: "Diamond Solution计划 – 购买协议",
        subtitle: "STIG International Gemstone FZCO",
        detail: "Diamond Solution计划的官方购买协议模板。涵盖购买价格、每月折扣结构、12个月后100%回购选项、交付选项、所有权转让和金伯利进程无冲突认证。受阿联酋/迪拜法律管辖。",
        badge: "模板",
      },
      stig: {
        title: "STIG International — 母公司",
        subtitle: "STIG International Gemstone FZCO",
        detail: "STIG International Gemstone FZCO 是 Diamond Solution 的母公司。他们通过迪拜 DMCC 自由贸易区全球采购、认证和分销 GIA 认证的实体钒石。该页面展示了 Diamond Solution 计划提供的全系列讨证钒石投资产品——对基础资产完全透明。",
        badge: "官方",
      },
    },
  },
};

const DOC_URLS: Record<string, string> = {
  dmcc: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663417308751/rpTddMOTXqobsSHz.pdf",
  sira: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663417308751/dPduwAYsUXjsNHLm.pdf",
  sec: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663417308751/qpvsAvqPUAYgktZT.pdf",
  gia: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663417308751/vxareTUPSKKRZJGf.pdf",
  legal: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663417308751/dYvaYLFUOLLpAXAm.pdf",
  purchase: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663417308751/OacTlXyhaoHDRGWQ.pdf",
  stig: "https://stig-international.com/products",
};

const DOC_BADGE_COLORS: Record<string, string> = {
  dmcc: "#22c55e",
  sira: "#38bdf8",
  sec: "#f59e0b",
  gia: "#a78bfa",
  legal: "#94a3b8",
  purchase: "#f59e0b",
  stig: "#38bdf8",
};

const DOC_ICONS: Record<string, string> = {
  dmcc: "🏢",
  sira: "🛡️",
  sec: "🇵🇭",
  gia: "💎",
  legal: "📋",
  purchase: "📝",
  stig: "🌐",
};

const DOC_ISSUERS: Record<string, string> = {
  dmcc: "License No. 1007195",
  sira: "Dubai, UAE",
  sec: "Reg. No. 2026030241228-02",
  gia: "Report No. 3405502857",
  legal: "Diamond Solution International",
  purchase: "STIG International Gemstone FZCO",
  stig: "DMCC License No. 1007195 · Dubai, UAE",
};

const DOC_ORDER = ["dmcc", "sira", "sec", "gia", "legal", "purchase", "stig"];

async function openDoc(url: string, title: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Cannot Open", `Unable to open ${title}. Please try again.`);
    }
  } catch (e) {
    Alert.alert("Error", String(e));
  }
}

export default function ComplianceScreen() {
  const { language } = useCalculator();
  const lang = (COMPLIANCE_TEXT[language] ? language : "en") as keyof typeof COMPLIANCE_TEXT;
  const tx = COMPLIANCE_TEXT[lang];

  return (
    <ScreenContainer bgColor="#0a0f1e" containerClassName="bg-[#0a0f1e]">
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>{tx.headerTitle}</Text>
          <Text style={S.headerSub}>{tx.headerSub}</Text>
        </View>

        {/* Regulatory summary bar */}
        <View style={S.regBar}>
          <View style={S.regItem}>
            <Text style={S.regIcon}>🇦🇪</Text>
            <Text style={S.regLabel}>{tx.regDubai}</Text>
          </View>
          <View style={S.regDivider} />
          <View style={S.regItem}>
            <Text style={S.regIcon}>🇵🇭</Text>
            <Text style={S.regLabel}>{tx.regSec}</Text>
          </View>
          <View style={S.regDivider} />
          <View style={S.regItem}>
            <Text style={S.regIcon}>💎</Text>
            <Text style={S.regLabel}>{tx.regGia}</Text>
          </View>
        </View>

        {/* Document cards */}
        {DOC_ORDER.map((id) => {
          const docTx = tx.docs[id as keyof typeof tx.docs];
          const qrNote = id === "gia" ? (docTx as typeof tx.docs.gia).qrNote : undefined;
          return (
            <View key={id} style={S.card}>
              <View style={S.cardTop}>
                <Text style={S.cardIcon}>{DOC_ICONS[id]}</Text>
                <View style={S.cardMeta}>
                  <View style={S.cardTitleRow}>
                    <Text style={S.cardTitle}>{docTx.title}</Text>
                    <View style={[S.badge, { backgroundColor: DOC_BADGE_COLORS[id] + "22", borderColor: DOC_BADGE_COLORS[id] }]}>
                      <Text style={[S.badgeText, { color: DOC_BADGE_COLORS[id] }]}>{docTx.badge}</Text>
                    </View>
                  </View>
                  <Text style={S.cardSubtitle}>{docTx.subtitle}</Text>
                  <Text style={S.cardIssuer}>{DOC_ISSUERS[id]}</Text>
                </View>
              </View>
              <Text style={S.cardDetail}>{docTx.detail}</Text>
              {qrNote ? (
                <View style={S.qrNoteBox}>
                  <Text style={S.qrNoteText}>{qrNote}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={S.viewBtn}
                onPress={() => openDoc(DOC_URLS[id], docTx.title)}
                activeOpacity={0.8}
              >
                <Text style={S.viewBtnText}>{tx.viewDoc}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Legal footer */}
        <View style={S.footer}>
          <Text style={S.footerText}>{tx.footerText}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0a0f1e" },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f59e0b",
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 15,
    color: "#e2e8f0",
    lineHeight: 22,
  },
  regBar: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  regItem: { alignItems: "center", flex: 1 },
  regIcon: { fontSize: 22, marginBottom: 4 },
  regLabel: { fontSize: 11, color: "#e2e8f0", fontWeight: "bold", textAlign: "center" },
  regDivider: { width: 1, height: 36, backgroundColor: "#334155" },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTop: { flexDirection: "row", marginBottom: 10 },
  cardIcon: { fontSize: 32, marginRight: 12, marginTop: 2 },
  cardMeta: { flex: 1 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 2 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", flex: 1 },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: "bold", letterSpacing: 0.5 },
  cardSubtitle: { fontSize: 13, color: "#94a3b8", marginBottom: 2 },
  cardIssuer: { fontSize: 12, color: "#64748b" },
  cardDetail: {
    fontSize: 14,
    color: "#e2e8f0",
    lineHeight: 21,
    marginBottom: 10,
  },
  qrNoteBox: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#a78bfa",
  },
  qrNoteText: { fontSize: 13, color: "#c4b5fd", lineHeight: 19 },
  viewBtn: {
    backgroundColor: "#0ea5e9",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  viewBtnText: { fontSize: 15, fontWeight: "bold", color: "#fff" },
  footer: {
    marginTop: 8,
    padding: 14,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#334155",
  },
  footerText: { fontSize: 13, color: "#e2e8f0", lineHeight: 19 },
});
