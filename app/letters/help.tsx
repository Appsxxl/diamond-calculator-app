import React from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import type { Language } from "@/lib/translations";

const NAVY = "#0a1628";
const GOLD = "#e67e22";
const FONT = "ArialRoundedMTBold";

type Section = { icon: string; title: string; color: string; bullets: string[] };
type HelpText = { back: string; title: string; sub: string; sections: Section[] };

const TX: Record<Language, HelpText> = {
  en: {
    back: "← Back", title: "HOW TO USE", sub: "Letters & Outreach — Quick Guide",
    sections: [
      {
        icon: "👤", title: "PROFILE SETUP", color: GOLD,
        bullets: [
          "Tap ⚙ Profile on the Letters hub to open your profile.",
          "Enter your Full Name, Company, Mobile, and Email/Website. These are pre-filled in every letter you generate.",
          "Upload your logo (JPG or PNG) — it appears in the header of every PDF export.",
          "Tap Save. Your profile is stored on your account and syncs across devices.",
        ],
      },
      {
        icon: "✉️", title: "CUSTOMER LETTERS", color: GOLD,
        bullets: [
          "Three letter types: Invitation (soft intro), Presentation (meeting/event invite), Business Opportunity (direct pitch).",
          "Enter the recipient's name, fill in your adviser details if not pre-loaded, then tap Generate.",
          "Use Copy to paste into any messaging app, or Export PDF to share a branded document.",
        ],
      },
      {
        icon: "🤝", title: "ADVISOR RECRUITING", color: "#3b82f6",
        bullets: [
          "Passive: A soft introduction letter that opens a conversation without pressure — ideal for existing contacts.",
          "Active: A direct 30-minute meeting request that explains the residual income opportunity — for motivated prospects.",
          "Fill in the recipient's name, review your adviser details, generate, then Copy or Export PDF.",
        ],
      },
      {
        icon: "🏢", title: "REAL ESTATE PARTNERS", color: "#10b981",
        bullets: [
          "Referral: A soft introduction exploring mutual referral fit — no formal structure proposed, just opening the door.",
          "Joint Venture (JV): A formal two-way referral proposal with a 30-minute meeting request — for agents you're ready to partner with.",
          "Tip: Start with the Referral letter for new contacts; use the JV letter once there's existing interest.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Fill in the recipient's Full Name and Formal Title (e.g. Mr., Ms., Dr., Lord).",
          "Select Relationship: Cold (no prior contact), Warm (you've met), or Referred (enter the referrer's name).",
          "Choose Asset Interest (Real Estate, Portfolio, Wealth Preservation, or Retirement Planning) and Net Worth range — these adjust the tone and content of the letter automatically.",
          "Formality: Formal uses professional language; Ultra-Formal uses elevated ceremonial language — use it for titled individuals or ultra-HNWI.",
          "Three export options: Copy pastes the text, Open in Mail opens your email app with subject and body pre-filled (add the recipient email to auto-address it), Export PDF creates a branded document.",
        ],
      },
      {
        icon: "🌍", title: "LANGUAGE", color: "#64748b",
        bullets: [
          "Every letter follows the language set in your app settings — switch language there to generate letters in any of the 14 supported languages.",
          "Your adviser profile details (name, company, etc.) are inserted as-is regardless of language.",
        ],
      },
    ],
  },
  nl: {
    back: "← Terug", title: "HOE TE GEBRUIKEN", sub: "Brieven & Outreach — Snelgids",
    sections: [
      {
        icon: "👤", title: "PROFIELINSTELLING", color: GOLD,
        bullets: [
          "Tik op ⚙ Profiel in de Letters-hub om uw profiel te openen.",
          "Vul uw volledige naam, bedrijf, mobiel en e-mail/website in. Deze worden vooraf ingevuld in elke brief die u genereert.",
          "Upload uw logo (JPG of PNG) — het verschijnt in de koptekst van elke PDF-export.",
          "Tik op Opslaan. Uw profiel is opgeslagen in uw account en synchroniseert op alle apparaten.",
        ],
      },
      {
        icon: "✉️", title: "KLANTBRIEVEN", color: GOLD,
        bullets: [
          "Drie soorten brieven: Uitnodiging (zachte intro), Presentatie (vergadering/evenement), Zakelijke Kans (directe pitch).",
          "Vul de naam van de ontvanger in, controleer uw adviseurgegevens en tik op Genereren.",
          "Gebruik Kopiëren om in elke app te plakken, of Exporteer PDF voor een branded document.",
        ],
      },
      {
        icon: "🤝", title: "ADVISEUR WERVING", color: "#3b82f6",
        bullets: [
          "Passief: Een zachte introductiebrief die een gesprek opent zonder druk — ideaal voor bestaande contacten.",
          "Actief: Een directe uitnodiging voor een 30 minuten gesprek met uitleg over de inkomstenstructuur — voor gemotiveerde prospects.",
          "Vul de naam van de ontvanger in, genereer en gebruik Kopiëren of Exporteer PDF.",
        ],
      },
      {
        icon: "🏢", title: "VASTGOEDPARTNERS", color: "#10b981",
        bullets: [
          "Referral: Een zachte introductie die wederzijdse doorverwijzing verkent — geen formele structuur, alleen de deur openen.",
          "Joint Venture (JV): Een formeel twee-richtingsvoorstel met een vergaderverzoek — voor makelaars waarmee u wilt samenwerken.",
          "Tip: Begin met de Referral-brief voor nieuwe contacten; gebruik de JV-brief als er al interesse is.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Vul de volledige naam en formele titel van de ontvanger in (bijv. Dhr., Mevr., Dr.).",
          "Selecteer Relatie: Koud (geen eerder contact), Warm (u heeft elkaar ontmoet), of Doorverwezen (vul de naam van de doorverwijzer in).",
          "Kies Vermogensinteresse en het Vermogensbereik — deze passen de toon en inhoud van de brief automatisch aan.",
          "Formaliteit: Formeel gebruikt professionele taal; Ultra-Formeel gebruikt verheven taal voor titulaire personen.",
          "Drie exportopties: Kopiëren, E-mail openen (met vooraf ingevuld onderwerp en tekst), of Exporteer PDF.",
        ],
      },
      {
        icon: "🌍", title: "TAAL", color: "#64748b",
        bullets: [
          "Elke brief volgt de taal die in uw app-instellingen is ingesteld — wissel van taal om brieven in een van de 14 ondersteunde talen te genereren.",
          "Uw adviseurprofielgegevens worden ongewijzigd ingevoegd, ongeacht de taal.",
        ],
      },
    ],
  },
  de: {
    back: "← Zurück", title: "ANLEITUNG", sub: "Briefe & Outreach — Kurzanleitung",
    sections: [
      {
        icon: "👤", title: "PROFIL EINRICHTEN", color: GOLD,
        bullets: [
          "Tippen Sie im Letters-Hub auf ⚙ Profil, um Ihr Profil zu öffnen.",
          "Geben Sie Ihren vollständigen Namen, Unternehmen, Mobilnummer und E-Mail/Website ein. Diese werden in jeden generierten Brief vorausgefüllt.",
          "Laden Sie Ihr Logo hoch (JPG oder PNG) — es erscheint im Kopfbereich jedes PDF-Exports.",
          "Tippen Sie auf Speichern. Ihr Profil wird auf Ihrem Konto gespeichert und auf allen Geräten synchronisiert.",
        ],
      },
      {
        icon: "✉️", title: "KUNDENBRIEFE", color: GOLD,
        bullets: [
          "Drei Brieftypen: Einladung (sanfte Einführung), Präsentation (Meeting/Veranstaltungseinladung), Geschäftsmöglichkeit (direkte Ansprache).",
          "Geben Sie den Namen des Empfängers ein, überprüfen Sie Ihre Beraterdaten und tippen Sie auf Erstellen.",
          "Verwenden Sie Kopieren zum Einfügen in jede App oder Exportieren als PDF für ein professionelles Dokument.",
        ],
      },
      {
        icon: "🤝", title: "BERATER REKRUTIERUNG", color: "#3b82f6",
        bullets: [
          "Passiv: Ein sanftes Einführungsschreiben, das ein Gespräch ohne Druck eröffnet — ideal für bestehende Kontakte.",
          "Aktiv: Eine direkte Anfrage für ein 30-Minuten-Gespräch mit Erläuterung der Einkommensstruktur — für motivierte Interessenten.",
          "Namen des Empfängers eingeben, Brief erstellen, dann Kopieren oder als PDF exportieren.",
        ],
      },
      {
        icon: "🏢", title: "IMMOBILIENPARTNER", color: "#10b981",
        bullets: [
          "Empfehlung: Eine sanfte Einführung, die gegenseitige Empfehlungsmöglichkeiten erkundet — kein formeller Vorschlag, nur die Tür öffnen.",
          "Joint Venture (JV): Ein formeller beidseitiger Empfehlungsvorschlag mit Besprechungsanfrage — für Makler, mit denen Sie zusammenarbeiten möchten.",
          "Tipp: Beginnen Sie mit dem Empfehlungsbrief für neue Kontakte; verwenden Sie den JV-Brief, sobald Interesse besteht.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Geben Sie den vollständigen Namen und den formellen Titel des Empfängers ein (z.B. Herr, Frau, Dr.).",
          "Wählen Sie Beziehung: Kalt (kein vorheriger Kontakt), Warm (Sie haben sich getroffen) oder Empfohlen (Name des Empfehlers eingeben).",
          "Wählen Sie Anlageinteresse und Vermögensbereich — diese passen Ton und Inhalt des Briefes automatisch an.",
          "Formalität: Formell verwendet professionelle Sprache; Ultra-Formell verwendet erhabene Sprache für titulierte Personen.",
          "Drei Exportoptionen: Kopieren, In E-Mail öffnen (mit vorausgefülltem Betreff und Text) oder Als PDF exportieren.",
        ],
      },
      {
        icon: "🌍", title: "SPRACHE", color: "#64748b",
        bullets: [
          "Jeder Brief folgt der in Ihren App-Einstellungen festgelegten Sprache — wechseln Sie die Sprache, um Briefe in einer der 14 unterstützten Sprachen zu erstellen.",
          "Ihre Beraterprofildaten werden unverändert eingefügt, unabhängig von der Sprache.",
        ],
      },
    ],
  },
  fr: {
    back: "← Retour", title: "MODE D'EMPLOI", sub: "Lettres & Outreach — Guide Rapide",
    sections: [
      {
        icon: "👤", title: "CONFIGURATION DU PROFIL", color: GOLD,
        bullets: [
          "Appuyez sur ⚙ Profil dans le hub Lettres pour ouvrir votre profil.",
          "Entrez votre nom complet, entreprise, mobile et e-mail/site web. Ces données sont pré-remplies dans chaque lettre générée.",
          "Téléchargez votre logo (JPG ou PNG) — il apparaît dans l'en-tête de chaque export PDF.",
          "Appuyez sur Enregistrer. Votre profil est sauvegardé sur votre compte et synchronisé sur tous vos appareils.",
        ],
      },
      {
        icon: "✉️", title: "LETTRES CLIENT", color: GOLD,
        bullets: [
          "Trois types de lettres : Invitation (intro douce), Présentation (invitation à une réunion/événement), Opportunité commerciale (approche directe).",
          "Entrez le nom du destinataire, vérifiez vos coordonnées de conseiller, puis appuyez sur Générer.",
          "Utilisez Copier pour coller dans n'importe quelle application, ou Exporter PDF pour partager un document avec votre marque.",
        ],
      },
      {
        icon: "🤝", title: "RECRUTEMENT CONSEILLER", color: "#3b82f6",
        bullets: [
          "Passif : Une lettre d'introduction douce qui ouvre la conversation sans pression — idéale pour les contacts existants.",
          "Actif : Une demande directe de réunion de 30 minutes qui explique la structure de revenus résiduels — pour les prospects motivés.",
          "Entrez le nom du destinataire, générez, puis Copiez ou Exportez en PDF.",
        ],
      },
      {
        icon: "🏢", title: "PARTENAIRES IMMOBILIERS", color: "#10b981",
        bullets: [
          "Référence : Une introduction douce explorant les possibilités de référence mutuelle — aucune structure formelle proposée, juste ouvrir la porte.",
          "Joint Venture (JV) : Une proposition formelle bilatérale avec demande de réunion — pour les agents avec qui vous êtes prêt à collaborer.",
          "Conseil : Commencez par la lettre de référence pour les nouveaux contacts ; utilisez la lettre JV une fois l'intérêt établi.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Renseignez le nom complet et le titre formel du destinataire (ex. M., Mme, Dr., Me).",
          "Sélectionnez la Relation : Froide (aucun contact préalable), Chaleureuse (vous vous êtes rencontrés) ou Référé (entrez le nom du référent).",
          "Choisissez l'Intérêt patrimonial et la Tranche de patrimoine — ceux-ci ajustent automatiquement le ton et le contenu.",
          "Formalité : Formel utilise un langage professionnel ; Ultra-Formel utilise un langage cérémonieux élevé pour les personnalités titrées.",
          "Trois options d'export : Copier, Ouvrir dans Mail (sujet et corps pré-remplis) ou Exporter PDF.",
        ],
      },
      {
        icon: "🌍", title: "LANGUE", color: "#64748b",
        bullets: [
          "Chaque lettre suit la langue définie dans les paramètres de votre application — changez la langue pour générer des lettres dans l'une des 14 langues prises en charge.",
          "Vos coordonnées de profil conseiller sont insérées telles quelles, quelle que soit la langue.",
        ],
      },
    ],
  },
  es: {
    back: "← Volver", title: "CÓMO USAR", sub: "Cartas & Outreach — Guía Rápida",
    sections: [
      {
        icon: "👤", title: "CONFIGURAR PERFIL", color: GOLD,
        bullets: [
          "Toca ⚙ Perfil en el hub de Cartas para abrir tu perfil.",
          "Ingresa tu nombre completo, empresa, móvil y correo/sitio web. Estos datos se rellenan automáticamente en cada carta.",
          "Sube tu logo (JPG o PNG) — aparece en el encabezado de cada PDF exportado.",
          "Toca Guardar. Tu perfil se almacena en tu cuenta y se sincroniza en todos los dispositivos.",
        ],
      },
      {
        icon: "✉️", title: "CARTAS AL CLIENTE", color: GOLD,
        bullets: [
          "Tres tipos: Invitación (intro suave), Presentación (invitación a reunión/evento), Oportunidad de negocio (enfoque directo).",
          "Ingresa el nombre del destinatario, revisa tus datos de asesor y toca Generar.",
          "Usa Copiar para pegar en cualquier app, o Exportar PDF para compartir un documento con tu marca.",
        ],
      },
      {
        icon: "🤝", title: "RECLUTAMIENTO DE ASESORES", color: "#3b82f6",
        bullets: [
          "Pasivo: Carta de introducción suave que abre la conversación sin presión — ideal para contactos existentes.",
          "Activo: Solicitud directa de reunión de 30 minutos que explica la estructura de ingresos — para prospectos motivados.",
          "Ingresa el nombre, genera y usa Copiar o Exportar PDF.",
        ],
      },
      {
        icon: "🏢", title: "SOCIOS INMOBILIARIOS", color: "#10b981",
        bullets: [
          "Referido: Introducción suave explorando posibilidades de referencia mutua — sin propuesta formal, solo abriendo la puerta.",
          "Joint Venture (JV): Propuesta formal bidireccional con solicitud de reunión — para agentes con los que estás listo para colaborar.",
          "Consejo: Empieza con la carta de Referido para nuevos contactos; usa la JV una vez que hay interés.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Ingresa el nombre completo y título formal del destinatario (ej. Sr., Sra., Dr.).",
          "Selecciona Relación: Fría (sin contacto previo), Cálida (ya se conocen) o Referido (ingresa el nombre del referente).",
          "Elige Interés patrimonial y Rango de patrimonio — ajustan automáticamente el tono y contenido.",
          "Formalidad: Formal usa lenguaje profesional; Ultra-Formal usa lenguaje ceremonioso elevado para personas tituladas.",
          "Tres opciones: Copiar, Abrir en Correo (asunto y cuerpo pre-rellenados) o Exportar PDF.",
        ],
      },
      {
        icon: "🌍", title: "IDIOMA", color: "#64748b",
        bullets: [
          "Cada carta sigue el idioma configurado en los ajustes de la app — cambia el idioma para generar cartas en cualquiera de los 14 idiomas.",
          "Los datos de tu perfil de asesor se insertan tal como están, independientemente del idioma.",
        ],
      },
    ],
  },
  it: {
    back: "← Indietro", title: "COME USARE", sub: "Lettere & Outreach — Guida Rapida",
    sections: [
      {
        icon: "👤", title: "CONFIGURAZIONE PROFILO", color: GOLD,
        bullets: [
          "Tocca ⚙ Profilo nell'hub Lettere per aprire il tuo profilo.",
          "Inserisci nome completo, azienda, cellulare e email/sito web. Questi dati vengono precompilati in ogni lettera.",
          "Carica il tuo logo (JPG o PNG) — appare nell'intestazione di ogni PDF esportato.",
          "Tocca Salva. Il profilo è salvato sul tuo account e sincronizzato su tutti i dispositivi.",
        ],
      },
      {
        icon: "✉️", title: "LETTERE AL CLIENTE", color: GOLD,
        bullets: [
          "Tre tipi: Invito (intro morbida), Presentazione (invito a riunione/evento), Opportunità commerciale (approccio diretto).",
          "Inserisci il nome del destinatario, verifica i tuoi dati da consulente e tocca Genera.",
          "Usa Copia per incollare in qualsiasi app, o Esporta PDF per condividere un documento con il tuo brand.",
        ],
      },
      {
        icon: "🤝", title: "RECLUTAMENTO CONSULENTI", color: "#3b82f6",
        bullets: [
          "Passivo: Lettera di introduzione morbida che apre la conversazione senza pressione — ideale per contatti esistenti.",
          "Attivo: Richiesta diretta di riunione di 30 minuti con spiegazione della struttura di reddito residuale.",
          "Inserisci il nome, genera e usa Copia o Esporta PDF.",
        ],
      },
      {
        icon: "🏢", title: "PARTNER IMMOBILIARI", color: "#10b981",
        bullets: [
          "Referral: Introduzione morbida che esplora possibilità di referral reciproco — nessuna struttura formale proposta.",
          "Joint Venture (JV): Proposta formale bidirezionale con richiesta di riunione — per agenti con cui sei pronto a collaborare.",
          "Suggerimento: Inizia con la lettera Referral per nuovi contatti; usa la JV quando c'è già interesse.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Inserisci nome completo e titolo formale del destinatario (es. Sig., Sig.ra, Dott.).",
          "Seleziona Relazione: Freddo (nessun contatto), Caldo (vi siete incontrati) o Riferito (inserisci il nome del referente).",
          "Scegli Interesse patrimoniale e Fascia patrimoniale — regolano automaticamente tono e contenuto.",
          "Formalità: Formale usa linguaggio professionale; Ultra-Formale usa linguaggio cerimonioso per persone titolate.",
          "Tre opzioni: Copia, Apri in Mail (oggetto e corpo precompilati) o Esporta PDF.",
        ],
      },
      {
        icon: "🌍", title: "LINGUA", color: "#64748b",
        bullets: [
          "Ogni lettera segue la lingua impostata nelle preferenze dell'app — cambia lingua per generare lettere in una delle 14 lingue supportate.",
          "I dati del tuo profilo consulente vengono inseriti così come sono, indipendentemente dalla lingua.",
        ],
      },
    ],
  },
  pt: {
    back: "← Voltar", title: "COMO USAR", sub: "Cartas & Outreach — Guia Rápido",
    sections: [
      {
        icon: "👤", title: "CONFIGURAR PERFIL", color: GOLD,
        bullets: [
          "Toque em ⚙ Perfil no hub de Cartas para abrir seu perfil.",
          "Insira seu nome completo, empresa, celular e e-mail/site. Esses dados são preenchidos automaticamente em cada carta.",
          "Faça upload do seu logo (JPG ou PNG) — ele aparece no cabeçalho de cada PDF exportado.",
          "Toque em Salvar. Seu perfil é armazenado na sua conta e sincronizado em todos os dispositivos.",
        ],
      },
      {
        icon: "✉️", title: "CARTAS AO CLIENTE", color: GOLD,
        bullets: [
          "Três tipos: Convite (intro suave), Apresentação (convite para reunião/evento), Oportunidade de negócio (abordagem direta).",
          "Insira o nome do destinatário, revise seus dados de consultor e toque em Gerar.",
          "Use Copiar para colar em qualquer aplicativo, ou Exportar PDF para compartilhar um documento com sua marca.",
        ],
      },
      {
        icon: "🤝", title: "RECRUTAMENTO DE CONSULTORES", color: "#3b82f6",
        bullets: [
          "Passivo: Carta de introdução suave que abre a conversa sem pressão — ideal para contatos existentes.",
          "Ativo: Solicitação direta de reunião de 30 minutos explicando a estrutura de renda residual — para prospects motivados.",
          "Insira o nome, gere e use Copiar ou Exportar PDF.",
        ],
      },
      {
        icon: "🏢", title: "PARCEIROS IMOBILIÁRIOS", color: "#10b981",
        bullets: [
          "Indicação: Introdução suave explorando possibilidades de indicação mútua — sem proposta formal, apenas abrindo a porta.",
          "Joint Venture (JV): Proposta formal bidirecional com solicitação de reunião — para agentes com quem você está pronto para colaborar.",
          "Dica: Comece com a carta de Indicação para novos contatos; use a JV quando já houver interesse.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Insira o nome completo e título formal do destinatário (ex. Sr., Sra., Dr.).",
          "Selecione Relacionamento: Frio (sem contato prévio), Morno (já se conhecem) ou Indicado (insira o nome do indicador).",
          "Escolha Interesse patrimonial e Faixa de patrimônio — ajustam automaticamente o tom e o conteúdo.",
          "Formalidade: Formal usa linguagem profissional; Ultra-Formal usa linguagem cerimonial para pessoas tituladas.",
          "Três opções: Copiar, Abrir no Mail (assunto e corpo preenchidos) ou Exportar PDF.",
        ],
      },
      {
        icon: "🌍", title: "IDIOMA", color: "#64748b",
        bullets: [
          "Cada carta segue o idioma definido nas configurações do aplicativo — mude o idioma para gerar cartas em qualquer um dos 14 idiomas suportados.",
          "Os dados do seu perfil de consultor são inseridos como estão, independentemente do idioma.",
        ],
      },
    ],
  },
  ru: {
    back: "← Назад", title: "КАК ИСПОЛЬЗОВАТЬ", sub: "Письма и Outreach — Краткое Руководство",
    sections: [
      {
        icon: "👤", title: "НАСТРОЙКА ПРОФИЛЯ", color: GOLD,
        bullets: [
          "Нажмите ⚙ Профиль в хабе Писем, чтобы открыть ваш профиль.",
          "Введите полное имя, компанию, мобильный и email/сайт. Эти данные автоматически подставляются в каждое письмо.",
          "Загрузите ваш логотип (JPG или PNG) — он отображается в заголовке каждого PDF-экспорта.",
          "Нажмите Сохранить. Профиль хранится на вашем аккаунте и синхронизируется на всех устройствах.",
        ],
      },
      {
        icon: "✉️", title: "ПИСЬМА КЛИЕНТАМ", color: GOLD,
        bullets: [
          "Три типа: Приглашение (мягкое знакомство), Презентация (приглашение на встречу/мероприятие), Бизнес-возможность (прямой питч).",
          "Введите имя получателя, проверьте данные советника и нажмите Создать.",
          "Используйте Копировать для вставки в любое приложение или Экспорт PDF для брендированного документа.",
        ],
      },
      {
        icon: "🤝", title: "РЕКРУТИНГ СОВЕТНИКОВ", color: "#3b82f6",
        bullets: [
          "Пассивное: Мягкое вводное письмо, открывающее разговор без давления — идеально для существующих контактов.",
          "Активное: Прямой запрос на 30-минутную встречу с описанием структуры остаточного дохода — для мотивированных кандидатов.",
          "Введите имя, создайте письмо и используйте Копировать или Экспорт PDF.",
        ],
      },
      {
        icon: "🏢", title: "ПАРТНЁРЫ ПО НЕДВИЖИМОСТИ", color: "#10b981",
        bullets: [
          "Реферал: Мягкое знакомство с изучением возможностей взаимного реферала — без формального предложения, просто открывая дверь.",
          "Совместное предприятие (СП): Официальное двустороннее реферальное предложение с запросом на встречу — для агентов, с которыми вы готовы сотрудничать.",
          "Совет: Начните с реферального письма для новых контактов; используйте СП при наличии интереса.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Введите полное имя и формальное обращение получателя (например, г-н, г-жа, д-р).",
          "Выберите Тип контакта: Холодный (без предварительного контакта), Тёплый (вы знакомы) или Рекомендован (введите имя рекомендателя).",
          "Выберите Интерес к активам и Диапазон капитала — они автоматически корректируют тон и содержание письма.",
          "Формальность: Формальный — профессиональный стиль; Ультра-формальный — церемониальный язык для титулованных лиц.",
          "Три варианта экспорта: Копировать, Открыть в почте (с предзаполненными темой и текстом) или Экспорт PDF.",
        ],
      },
      {
        icon: "🌍", title: "ЯЗЫК", color: "#64748b",
        bullets: [
          "Каждое письмо следует языку, установленному в настройках приложения — смените язык для создания писем на любом из 14 поддерживаемых языков.",
          "Данные вашего профиля вставляются как есть, независимо от выбранного языка.",
        ],
      },
    ],
  },
  zh: {
    back: "← 返回", title: "使用说明", sub: "信函与推广——快速指南",
    sections: [
      {
        icon: "👤", title: "资料设置", color: GOLD,
        bullets: [
          "在信函中心点击 ⚙ 资料以打开您的个人资料。",
          "填写姓名、公司、手机及电子邮件/网站。这些信息将自动填入您生成的每封信函。",
          "上传您的logo（JPG或PNG）——它将显示在每份PDF导出的页眉中。",
          "点击保存。您的资料保存在账户中，并在所有设备间同步。",
        ],
      },
      {
        icon: "✉️", title: "客户信函", color: GOLD,
        bullets: [
          "三种类型：邀请函（温和介绍）、演示函（会议/活动邀请）、商业机会函（直接推介）。",
          "填写收件人姓名，确认顾问信息后点击生成。",
          "使用复制粘贴到任意应用，或导出PDF以分享品牌文档。",
        ],
      },
      {
        icon: "🤝", title: "顾问招募", color: "#3b82f6",
        bullets: [
          "被动型：温和的介绍信，无压力开启对话——适用于现有联系人。",
          "主动型：直接申请30分钟会议，说明剩余收入结构——适用于积极候选人。",
          "填写姓名，生成后使用复制或导出PDF。",
        ],
      },
      {
        icon: "🏢", title: "房地产合作伙伴", color: "#10b981",
        bullets: [
          "推荐型：温和介绍，探索互相推荐的可能性——无正式提案，只是开启对话。",
          "合资型（JV）：正式的双向推荐提案，含会议邀请——适用于准备合作的经纪人。",
          "建议：对新联系人先发推荐信；待有兴趣后再发JV信。",
        ],
      },
      {
        icon: "💎", title: "VIP / 高净值推广", color: "#a855f7",
        bullets: [
          "填写收件人全名及正式称谓（如先生、女士、博士）。",
          "选择关系类型：冷接触（无先前联系）、熟人（曾见面）或已介绍（填写介绍人姓名）。",
          "选择资产兴趣和净资产范围——系统将自动调整信函的语气与内容。",
          "正式程度：正式使用专业语言；极度正式使用庄重礼仪语言，适用于有头衔者。",
          "三种导出方式：复制、邮件打开（主题和正文预填写）或导出PDF。",
        ],
      },
      {
        icon: "🌍", title: "语言", color: "#64748b",
        bullets: [
          "每封信函遵循应用设置中的语言——切换语言可生成14种支持语言之一的信函。",
          "您的顾问资料信息将按原样插入，不受语言影响。",
        ],
      },
    ],
  },
  tl: {
    back: "← Bumalik", title: "PAANO GAMITIN", sub: "Mga Liham & Outreach — Mabilis na Gabay",
    sections: [
      {
        icon: "👤", title: "PAG-SET UP NG PROFILE", color: GOLD,
        bullets: [
          "I-tap ang ⚙ Profile sa Letters hub para buksan ang inyong profile.",
          "Ilagay ang inyong buong pangalan, kumpanya, mobile, at email/website. Awtomatikong mapupuno ang mga ito sa bawat liham.",
          "Mag-upload ng logo (JPG o PNG) — lilitaw ito sa header ng bawat PDF export.",
          "I-tap ang I-save. Ang inyong profile ay naka-imbak sa inyong account at nag-si-sync sa lahat ng device.",
        ],
      },
      {
        icon: "✉️", title: "MGA LIHAM SA KLIYENTE", color: GOLD,
        bullets: [
          "Tatlong uri: Imbitasyon (malambot na intro), Presentasyon (imbitasyon sa pulong/event), Oportunidad sa Negosyo (direktang pitch).",
          "Ilagay ang pangalan ng tatanggap, suriin ang inyong detalye, at i-tap ang Buuin.",
          "Gamitin ang Kopyahin para i-paste sa anumang app, o I-export ang PDF para sa branded na dokumento.",
        ],
      },
      {
        icon: "🤝", title: "PAGRE-RECRUIT NG ADVISER", color: "#3b82f6",
        bullets: [
          "Passive: Malambot na liham ng pagpapakilala na nagbubukas ng pag-uusap nang walang presyon — para sa mga kasalukuyang kontak.",
          "Active: Direktang kahilingan para sa 30-minutong pulong na nagpapaliwanag ng residual income — para sa mga motivated na prospect.",
          "Ilagay ang pangalan, buuin, at gamitin ang Kopyahin o I-export ang PDF.",
        ],
      },
      {
        icon: "🏢", title: "MGA KASOSYO SA REAL ESTATE", color: "#10b981",
        bullets: [
          "Referral: Malambot na pagpapakilala na nag-eeksplora ng mutual referral — walang pormal na istraktura, nagbubukas lang ng pintuan.",
          "Joint Venture (JV): Pormal na dalawang-daan na referral proposal na may kahilingan sa pulong — para sa mga ahente na handang makipagtulungan.",
          "Tip: Magsimula sa Referral letter para sa mga bagong kontak; gamitin ang JV kung may interes na.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Ilagay ang buong pangalan at pormal na titulo ng tatanggap (hal. Gng., Bb., Dr.).",
          "Piliin ang Relasyon: Malamig (walang naunang kontak), Mainit (nagkakilala na), o Inirekomenda (ilagay ang pangalan ng nagrekumenda).",
          "Pumili ng Asset Interest at Net Worth range — awtomatikong inaayos nito ang tono at nilalaman ng liham.",
          "Formalidad: Pormal ay gumagamit ng propesyonal na wika; Ultra-Pormal ay may mataas na seremonya para sa mga may titulo.",
          "Tatlong opsyon: Kopyahin, Buksan sa Mail (paunang punan ang paksa at katawan), o I-export ang PDF.",
        ],
      },
      {
        icon: "🌍", title: "WIKA", color: "#64748b",
        bullets: [
          "Ang bawat liham ay sumusunod sa wikang nakatakda sa mga setting ng app — palitan ang wika para gumawa ng liham sa alinman sa 14 suportadong wika.",
          "Ang inyong detalye ng profile ay ipinasok nang walang pagbabago, anuman ang wika.",
        ],
      },
    ],
  },
  ar: {
    back: "→ رجوع", title: "كيفية الاستخدام", sub: "الرسائل والتواصل — دليل سريع",
    sections: [
      {
        icon: "👤", title: "إعداد الملف الشخصي", color: GOLD,
        bullets: [
          "اضغط على ⚙ الملف في مركز الرسائل لفتح ملفك الشخصي.",
          "أدخل اسمك الكامل والشركة والجوال والبريد الإلكتروني/الموقع. تُملأ هذه البيانات تلقائياً في كل رسالة.",
          "ارفع شعارك (JPG أو PNG) — يظهر في رأس كل ملف PDF مُصدَّر.",
          "اضغط حفظ. يُخزَّن ملفك الشخصي في حسابك ويتزامن على جميع الأجهزة.",
        ],
      },
      {
        icon: "✉️", title: "رسائل العملاء", color: GOLD,
        bullets: [
          "ثلاثة أنواع: دعوة (مقدمة لطيفة)، عرض تقديمي (دعوة لاجتماع/حدث)، فرصة عمل (عرض مباشر).",
          "أدخل اسم المستلم، راجع بيانات مستشارك، ثم اضغط إنشاء.",
          "استخدم نسخ للصق في أي تطبيق، أو تصدير PDF لمشاركة وثيقة ذات علامة تجارية.",
        ],
      },
      {
        icon: "🤝", title: "استقطاب المستشارين", color: "#3b82f6",
        bullets: [
          "سلبي: رسالة تعريفية لطيفة تفتح حواراً دون ضغط — مثالية للمعارف الحاليين.",
          "نشط: طلب مباشر لاجتماع 30 دقيقة يشرح هيكل الدخل المتبقي — للمرشحين المتحمسين.",
          "أدخل الاسم، أنشئ الرسالة، ثم نسخ أو تصدير PDF.",
        ],
      },
      {
        icon: "🏢", title: "شركاء العقارات", color: "#10b981",
        bullets: [
          "إحالة: مقدمة لطيفة لاستكشاف إمكانية الإحالة المتبادلة — دون هيكل رسمي، فقط فتح الباب.",
          "مشروع مشترك (JV): اقتراح إحالة رسمي ثنائي الاتجاه مع طلب اجتماع — للوكلاء المستعدين للشراكة.",
          "نصيحة: ابدأ برسالة الإحالة للمعارف الجدد؛ استخدم رسالة المشروع المشترك عند وجود اهتمام.",
        ],
      },
      {
        icon: "💎", title: "VIP / كبار العملاء", color: "#a855f7",
        bullets: [
          "أدخل الاسم الكامل واللقب الرسمي للمستلم (مثال: السيد، السيدة، الدكتور).",
          "اختر طبيعة العلاقة: تواصل مبدئي (بدون اتصال سابق)، معرفة سابقة، أو موصى به (أدخل اسم المُحيل).",
          "اختر اهتمام الاستثمار ونطاق الثروة — يضبطان تلقائياً نبرة الرسالة ومحتواها.",
          "الرسمية: رسمي يستخدم لغة مهنية؛ رسمي للغاية يستخدم لغة احتفالية رفيعة للأشخاص ذوي الألقاب.",
          "ثلاثة خيارات: نسخ، فتح في البريد (الموضوع والنص مُعبأَان مسبقاً)، أو تصدير PDF.",
        ],
      },
      {
        icon: "🌍", title: "اللغة", color: "#64748b",
        bullets: [
          "تتبع كل رسالة اللغة المحددة في إعدادات التطبيق — غيّر اللغة لإنشاء رسائل بأي من اللغات الـ14 المدعومة.",
          "تُدرج بيانات ملفك الشخصي كما هي بصرف النظر عن اللغة.",
        ],
      },
    ],
  },
  th: {
    back: "← กลับ", title: "วิธีใช้งาน", sub: "จดหมายและการเข้าถึง — คู่มือด่วน",
    sections: [
      {
        icon: "👤", title: "ตั้งค่าโปรไฟล์", color: GOLD,
        bullets: [
          "แตะ ⚙ โปรไฟล์ที่ Letters hub เพื่อเปิดโปรไฟล์ของคุณ",
          "กรอกชื่อ-นามสกุล บริษัท เบอร์โทร และอีเมล/เว็บไซต์ ข้อมูลเหล่านี้จะถูกกรอกอัตโนมัติในทุกจดหมาย",
          "อัปโหลดโลโก้ (JPG หรือ PNG) — จะปรากฏในส่วนหัวของ PDF ที่ส่งออกทุกฉบับ",
          "แตะบันทึก โปรไฟล์ถูกเก็บในบัญชีและซิงค์ทุกอุปกรณ์",
        ],
      },
      {
        icon: "✉️", title: "จดหมายถึงลูกค้า", color: GOLD,
        bullets: [
          "สามประเภท: คำเชิญ (แนะนำตัวอ่อนๆ), การนำเสนอ (เชิญประชุม/กิจกรรม), โอกาสทางธุรกิจ (เสนอตรง)",
          "กรอกชื่อผู้รับ ตรวจสอบข้อมูลที่ปรึกษา แล้วแตะสร้าง",
          "ใช้คัดลอกเพื่อวางในแอปใดก็ได้ หรือส่งออก PDF สำหรับเอกสารที่มีแบรนด์",
        ],
      },
      {
        icon: "🤝", title: "การสรรหาที่ปรึกษา", color: "#3b82f6",
        bullets: [
          "แบบพาสซีฟ: จดหมายแนะนำตัวอ่อนๆ ที่เปิดบทสนทนาโดยไม่กดดัน — เหมาะสำหรับผู้ติดต่อที่รู้จักอยู่แล้ว",
          "แบบแอคทีฟ: คำขอนัดประชุม 30 นาทีโดยตรงพร้อมอธิบายโครงสร้างรายได้ — สำหรับผู้สนใจที่มีแรงจูงใจ",
          "กรอกชื่อ สร้างจดหมาย แล้วใช้คัดลอกหรือส่งออก PDF",
        ],
      },
      {
        icon: "🏢", title: "พันธมิตรอสังหาริมทรัพย์", color: "#10b981",
        bullets: [
          "แนะนำแบบอ่อนๆ: สำรวจความเป็นไปได้ของการแนะนำซึ่งกันและกัน — ไม่มีข้อเสนอทางการ แค่เปิดประตู",
          "Joint Venture (JV): ข้อเสนอแนะนำสองทางอย่างเป็นทางการพร้อมคำขอประชุม — สำหรับเอเจนต์ที่พร้อมร่วมงาน",
          "เคล็ดลับ: เริ่มด้วยจดหมายแนะนำสำหรับผู้ติดต่อใหม่ ใช้ JV เมื่อมีความสนใจแล้ว",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "กรอกชื่อเต็มและคำนำหน้าของผู้รับ (เช่น นาย / นาง / ดร.)",
          "เลือกความสัมพันธ์: ไม่รู้จัก (ไม่เคยติดต่อ), รู้จักกัน (เคยพบ), หรือได้รับการแนะนำ (กรอกชื่อผู้แนะนำ)",
          "เลือกความสนใจด้านทรัพย์สินและช่วงมูลค่า — ปรับโทนและเนื้อหาจดหมายอัตโนมัติ",
          "ระดับทางการ: ทางการใช้ภาษาอาชีพ; ทางการสูงสุดใช้ภาษาพิธีการสำหรับบุคคลมีตำแหน่ง",
          "สามตัวเลือก: คัดลอก, เปิดใน Mail (ใส่หัวข้อและเนื้อหาไว้แล้ว), หรือส่งออก PDF",
        ],
      },
      {
        icon: "🌍", title: "ภาษา", color: "#64748b",
        bullets: [
          "จดหมายทุกฉบับใช้ภาษาที่ตั้งค่าในแอป — เปลี่ยนภาษาเพื่อสร้างจดหมายใน 14 ภาษาที่รองรับ",
          "ข้อมูลโปรไฟล์ที่ปรึกษาจะถูกแทรกตามที่กรอกไว้โดยไม่ขึ้นกับภาษาที่เลือก",
        ],
      },
    ],
  },
  hi: {
    back: "← वापस", title: "उपयोग कैसे करें", sub: "पत्र और आउटरीच — त्वरित मार्गदर्शिका",
    sections: [
      {
        icon: "👤", title: "प्रोफ़ाइल सेटअप", color: GOLD,
        bullets: [
          "अपना प्रोफ़ाइल खोलने के लिए Letters hub पर ⚙ प्रोफ़ाइल दबाएं।",
          "अपना पूरा नाम, कंपनी, मोबाइल और ईमेल/वेबसाइट दर्ज करें। ये विवरण हर पत्र में स्वचालित रूप से भरे जाते हैं।",
          "अपना लोगो अपलोड करें (JPG या PNG) — यह हर PDF एक्सपोर्ट के हेडर में दिखता है।",
          "सेव करें दबाएं। आपका प्रोफ़ाइल आपके खाते में सहेजा जाता है और सभी डिवाइस पर समन्वयित होता है।",
        ],
      },
      {
        icon: "✉️", title: "क्लाइंट पत्र", color: GOLD,
        bullets: [
          "तीन प्रकार: आमंत्रण (सॉफ्ट इंट्रो), प्रस्तुति (मीटिंग/इवेंट आमंत्रण), व्यापार अवसर (सीधा पिच)।",
          "प्राप्तकर्ता का नाम दर्ज करें, सलाहकार विवरण जांचें और उत्पन्न करें दबाएं।",
          "कॉपी का उपयोग किसी भी ऐप में पेस्ट करने के लिए करें, या ब्रांडेड दस्तावेज़ के लिए PDF निर्यात करें।",
        ],
      },
      {
        icon: "🤝", title: "सलाहकार भर्ती", color: "#3b82f6",
        bullets: [
          "निष्क्रिय: एक सौम्य परिचय पत्र जो बिना दबाव के बातचीत खोलता है — मौजूदा संपर्कों के लिए आदर्श।",
          "सक्रिय: अवशिष्ट आय संरचना को समझाते हुए 30 मिनट की मीटिंग के लिए सीधा अनुरोध।",
          "नाम दर्ज करें, उत्पन्न करें और कॉपी या PDF निर्यात का उपयोग करें।",
        ],
      },
      {
        icon: "🏢", title: "रियल एस्टेट साझेदार", color: "#10b981",
        bullets: [
          "रेफरल: परस्पर रेफरल संभावना का पता लगाने वाला सौम्य परिचय — कोई औपचारिक प्रस्ताव नहीं, बस दरवाजा खोलना।",
          "संयुक्त उद्यम (JV): मीटिंग अनुरोध के साथ औपचारिक द्विपक्षीय रेफरल प्रस्ताव — सहयोग के लिए तैयार एजेंटों के लिए।",
          "सुझाव: नए संपर्कों के लिए रेफरल पत्र से शुरू करें; जब रुचि हो तो JV पत्र का उपयोग करें।",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW आउटरीच", color: "#a855f7",
        bullets: [
          "प्राप्तकर्ता का पूरा नाम और औपचारिक शीर्षक दर्ज करें (जैसे श्री, श्रीमती, डॉ.)।",
          "संबंध चुनें: नया संपर्क, परिचित, या रेफर किया गया (रेफरर का नाम दर्ज करें)।",
          "संपत्ति रुचि और नेट वर्थ रेंज चुनें — ये स्वचालित रूप से पत्र का स्वर और सामग्री समायोजित करते हैं।",
          "औपचारिकता: औपचारिक पेशेवर भाषा; अति-औपचारिक शीर्षक वाले व्यक्तियों के लिए उच्च समारोही भाषा।",
          "तीन विकल्प: कॉपी, मेल में खोलें (विषय और मुख्य भाग पूर्व-भरे), या PDF निर्यात।",
        ],
      },
      {
        icon: "🌍", title: "भाषा", color: "#64748b",
        bullets: [
          "हर पत्र ऐप सेटिंग्स में सेट भाषा का अनुसरण करता है — 14 समर्थित भाषाओं में से किसी में पत्र बनाने के लिए भाषा बदलें।",
          "आपके प्रोफ़ाइल विवरण भाषा की परवाह किए बिना जैसे हैं वैसे ही डाले जाते हैं।",
        ],
      },
    ],
  },
  vi: {
    back: "← Quay lại", title: "CÁCH SỬ DỤNG", sub: "Thư & Tiếp Cận — Hướng Dẫn Nhanh",
    sections: [
      {
        icon: "👤", title: "THIẾT LẬP HỒ SƠ", color: GOLD,
        bullets: [
          "Nhấn ⚙ Hồ sơ tại hub Thư để mở hồ sơ của bạn.",
          "Nhập họ tên đầy đủ, công ty, số điện thoại và email/website. Những thông tin này tự động điền vào mỗi thư.",
          "Tải lên logo của bạn (JPG hoặc PNG) — logo xuất hiện trong tiêu đề của mỗi PDF xuất.",
          "Nhấn Lưu. Hồ sơ được lưu trên tài khoản và đồng bộ trên tất cả thiết bị.",
        ],
      },
      {
        icon: "✉️", title: "THƯ KHÁCH HÀNG", color: GOLD,
        bullets: [
          "Ba loại: Lời mời (giới thiệu nhẹ nhàng), Thuyết trình (mời họp/sự kiện), Cơ hội kinh doanh (đề xuất trực tiếp).",
          "Nhập tên người nhận, xem lại thông tin tư vấn viên rồi nhấn Tạo.",
          "Dùng Sao Chép để dán vào bất kỳ ứng dụng nào, hoặc Xuất PDF cho tài liệu có thương hiệu.",
        ],
      },
      {
        icon: "🤝", title: "TUYỂN DỤNG TƯ VẤN VIÊN", color: "#3b82f6",
        bullets: [
          "Bị động: Thư giới thiệu nhẹ nhàng mở cuộc trò chuyện không áp lực — lý tưởng cho các liên hệ hiện có.",
          "Chủ động: Yêu cầu họp 30 phút trực tiếp giải thích cơ cấu thu nhập thụ động — cho các ứng viên có động lực.",
          "Nhập tên, tạo thư rồi dùng Sao Chép hoặc Xuất PDF.",
        ],
      },
      {
        icon: "🏢", title: "ĐỐI TÁC BẤT ĐỘNG SẢN", color: "#10b981",
        bullets: [
          "Giới thiệu: Mở đầu nhẹ nhàng khám phá khả năng giới thiệu qua lại — không đề xuất chính thức, chỉ mở cánh cửa.",
          "Liên doanh (JV): Đề xuất giới thiệu hai chiều chính thức kèm yêu cầu họp — cho các đại lý sẵn sàng hợp tác.",
          "Mẹo: Bắt đầu bằng thư Giới thiệu cho liên hệ mới; dùng JV khi đã có sự quan tâm.",
        ],
      },
      {
        icon: "💎", title: "VIP / HNW OUTREACH", color: "#a855f7",
        bullets: [
          "Nhập họ tên đầy đủ và danh xưng trang trọng của người nhận (vd. Ông, Bà, Tiến sĩ).",
          "Chọn Mối quan hệ: Lạnh (chưa liên hệ), Quen biết (đã gặp), hoặc Được giới thiệu (nhập tên người giới thiệu).",
          "Chọn Quan tâm tài sản và Mức tài sản ròng — tự động điều chỉnh giọng văn và nội dung thư.",
          "Trang trọng: Trang Trọng dùng ngôn ngữ chuyên nghiệp; Cực Kỳ Trang Trọng dùng ngôn ngữ lễ nghi cho người có tước hiệu.",
          "Ba tùy chọn: Sao Chép, Mở trong Mail (tiêu đề và nội dung được điền sẵn), hoặc Xuất PDF.",
        ],
      },
      {
        icon: "🌍", title: "NGÔN NGỮ", color: "#64748b",
        bullets: [
          "Mỗi thư theo ngôn ngữ đã đặt trong cài đặt ứng dụng — đổi ngôn ngữ để tạo thư bằng 1 trong 14 ngôn ngữ được hỗ trợ.",
          "Thông tin hồ sơ tư vấn viên được chèn nguyên vẹn bất kể ngôn ngữ nào được chọn.",
        ],
      },
    ],
  },
};

export default function LettersHelpScreen() {
  const router = useRouter();
  const { language } = useCalculator();
  const tx = TX[language] ?? TX.en;

  return (
    <ScreenContainer bgColor={NAVY}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={S.back}>{tx.back}</Text>
          </TouchableOpacity>
          <Text style={S.title}>{tx.title}</Text>
          <Text style={S.sub}>{tx.sub}</Text>
        </View>

        <View style={S.body}>
          {tx.sections.map((sec) => (
            <View key={sec.title} style={S.card}>
              <View style={S.cardHeader}>
                <Text style={S.cardIcon}>{sec.icon}</Text>
                <Text style={[S.cardTitle, { color: sec.color }]}>{sec.title}</Text>
              </View>
              <View style={[S.cardDivider, { backgroundColor: sec.color }]} />
              {sec.bullets.map((b, i) => (
                <View key={i} style={S.bulletRow}>
                  <View style={[S.dot, { backgroundColor: sec.color }]} />
                  <Text style={S.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: "#1e2d47",
  },
  back: { color: GOLD, fontFamily: FONT, fontSize: 14, marginBottom: 14 },
  title: { color: "#fff", fontFamily: FONT, fontSize: 20, letterSpacing: 1, marginBottom: 4 },
  sub: { color: "#64748b", fontFamily: FONT, fontSize: 12 },

  body: { padding: 16, gap: 12 },

  card: {
    backgroundColor: "#0f1f38", borderRadius: 14, borderWidth: 1,
    borderColor: "#1e2d47", padding: 16,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontFamily: FONT, fontSize: 12, letterSpacing: 0.8, flex: 1 },
  cardDivider: { height: 2, borderRadius: 1, marginBottom: 12, opacity: 0.4 },
  bulletRow: { flexDirection: "row", gap: 10, marginBottom: 8, alignItems: "flex-start" },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  bulletText: { color: "#94a3b8", fontFamily: FONT, fontSize: 12, lineHeight: 19, flex: 1 },
});
