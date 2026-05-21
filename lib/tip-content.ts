import { Language } from './translations';

export type TipKey =
  | 'monthlyGoal' | 'clientNameSaving' | 'vipStatus' | 'startAmount'
  | 'strategyDuration' | 'monthlyDeposit' | 'annualBonus' | 'fixedWithdrawal'
  | 'outPercentage' | 'activeCompounding' | 'reverseCalculator' | 'calcHistory'
  | 'currencyDisplay' | 'pdfExport' | 'createLetter' | 'scenarioChart'
  | 'compareMode' | 'rankTiers' | 'partnerList' | 'commissionEstimator'
  | 'invitationVideos' | 'adviserVideos' | 'lettersHub';

export type TipContent = { title: string; body: string[] };
type TipMap = Record<TipKey, TipContent>;

const en: TipMap = {
  monthlyGoal: {
    title: 'Monthly Goal',
    body: [
      'Set the monthly amount you (or your client) want to receive from Plan B discounts. This is your target — for example $3,500/month.',
      'The progress bar shows how close the current investment is to hitting this goal. 100% means the goal is already achievable.',
      'The Goal Reached badge appears when your simulation reaches this amount within the chosen time period. If not reached, try increasing the start amount or years.',
    ],
  },
  clientNameSaving: {
    title: 'Client Name & Saving',
    body: [
      "Enter your client's name to personalize the PDF report and WhatsApp message.",
      '💾 Save button — stores this client\'s full settings (amount, years, VIP, monthly overrides) so you can reload them later.',
      '📂 Load button — opens your saved client list. Tap any client to instantly restore their scenario.',
      "Notes field — add private notes about the client (e.g. 'prefers conservative', 'callback Thursday'). Notes are saved with the client profile.",
      'Pipeline status — each saved client has a status (Prospect → Meeting → Proposal → Signed → Active). Tap the status badge in the client list to advance it.',
    ],
  },
  vipStatus: {
    title: 'VIP Status',
    body: [
      'VIP adds +3% per month to your discount rate on top of your base SP rate. For example: SP3 base 2.7% + VIP = 5.7% per month.',
      'Auto-VIP: when your start amount reaches $3,550 or above, VIP activates automatically (the plan self-funds the VIP fee from early discounts).',
      'Manual VIP: for amounts below the auto threshold, you can enable VIP manually. A one-time $1,000 fee is applied in month 1.',
      'VIP dramatically increases the peak monthly rebate and helps the goal be reached sooner.',
    ],
  },
  startAmount: {
    title: 'Start Amount & SP Tier',
    body: [
      'Enter the gross amount (what is actually paid). The system deducts a 1.25% entry fee + $5 flat fee to calculate the net invested capital.',
      'SP Tier presets — tap SP2 through SP7 to quickly set common amounts:\n• SP2: $1,000 · 2.45%/mo\n• SP3: $2,500 · 2.70%/mo\n• SP4: $5,000 · 3.00%/mo\n• SP5: $10,000 · 3.10%/mo\n• SP6: $50,000 · 3.20%/mo\n• SP7: $100,000 · 3.30%/mo',
      'Upsell tip: when you are within $2,000 of the next tier, the calculator shows you how much extra to invest to reach the higher rate.',
      'Minimum investment: SP1 starts at $110. There is no upper limit.',
    ],
  },
  strategyDuration: {
    title: 'Strategy Duration (Years)',
    body: [
      'Set how many years the simulation should run. Valid range: 1 to 30 years.',
      'Longer duration = higher cumulative discounts and a larger final asset value. The monthly rebate curve also peaks later at higher amounts.',
      'Tip: most advisers present 3, 5, 7, and 10-year scenarios to show the client the difference. Use the Compare feature to show two durations side by side.',
    ],
  },
  monthlyDeposit: {
    title: 'Monthly Deposit',
    body: [
      'Add an extra diamond purchase every month on top of the initial investment.',
      'Example: Amount = $500, Till = 24 → you buy an additional $500 of diamonds per month for the first 2 years.',
      'Each monthly deposit increases your capital base and therefore the monthly rebate in all future months.',
      'Leave blank or set to 0 if you only want a one-time initial purchase.',
    ],
  },
  annualBonus: {
    title: 'Annual Bonus Deposit',
    body: [
      'Adds a one-time extra purchase that repeats once per year (every 12 months).',
      'Example: $2,000 → adds $2,000 to your diamond capital at months 12, 24, 36, etc.',
      'Useful for clients who reinvest a year-end bonus, tax refund, or annual savings into Plan B.',
    ],
  },
  fixedWithdrawal: {
    title: 'Fixed Monthly Withdrawal',
    body: [
      'Take a fixed dollar amount out of your monthly rebate every month, starting from a chosen month.',
      'Example: Amount = $500, From = 25 → you receive $500/month in cash from month 25 onwards.',
      'The withdrawal cannot exceed your monthly rebate. Any excess stays in your account.',
      'The remaining rebate after withdrawal continues to compound (unless you also set Out %).',
    ],
  },
  outPercentage: {
    title: 'Out % — Percentage Withdrawal',
    body: [
      'Instead of a fixed amount, take a percentage of your monthly rebate as cash.',
      'Example: 75%, From = 1 → you always take 75% of your monthly rebate as cash and reinvest the remaining 25%.',
      'This is the standard Plan B model: 75% out, 25% compounding. It balances income now with long-term growth.',
      'You can combine this with a Fixed Withdrawal — the fixed amount is taken first, then the % is applied to the remainder.',
    ],
  },
  activeCompounding: {
    title: 'Active Compounding %',
    body: [
      'Controls how much of your monthly rebate is reinvested (compounded) into new diamond purchases versus paid out as cash.',
      '100% = full compounding — no cash withdrawn. Your diamond portfolio grows fastest. Best for long-term wealth building.',
      '0% = all rebate paid out as cash every month. No further growth from reinvestment.',
      'You can edit individual months in the monthly table below the results by tapping the Comp% cell — useful for custom payout schedules.',
      'Default is 100%. Most clients use 75% out (Out %) + 25% compounding for balanced income and growth.',
    ],
  },
  reverseCalculator: {
    title: 'Reverse Calculator',
    body: [
      "Answers the question: 'What is the minimum investment needed to reach my goal?'",
      'It uses your current Goal ($) and Years settings, then runs a fast binary search to find the smallest starting amount that achieves the goal within the period.',
      'The result shows the minimum gross investment, the SP tier it falls into, and which month the goal is first reached.',
      'Tap Apply ↑ to copy the found amount directly into the Start Amount field and calculate the full scenario.',
    ],
  },
  calcHistory: {
    title: 'Calculation History',
    body: [
      'The last 10 calculations are automatically saved every time you tap Calculate.',
      'Tap any entry to instantly restore its start amount, years, VIP status, and client name — without losing your current input.',
      'Each entry shows: client name (or amount if no name), SP tier, years, and peak monthly rebate.',
      'History is stored locally on this device and persists across sessions.',
    ],
  },
  currencyDisplay: {
    title: 'Currency Display',
    body: [
      'Switch the display currency for all summary values in the results section.',
      'USD — US Dollar (base currency of Plan B)\nEUR — Euro (rate: 0.92)\nGBP — British Pound (rate: 0.79)\nAED — UAE Dirham (rate: 3.67)',
      'Rates are fixed approximations for presentation purposes. Always verify live rates before presenting to clients.',
      'The monthly table stays in USD. Only the main summary cards convert.',
    ],
  },
  pdfExport: {
    title: 'PDF Export',
    body: [
      'Generates a branded A4 PDF report for this client including: strategy parameters, monthly discount schedule, goal status, security guarantees, and a legal disclaimer.',
      'On iOS: opens the share sheet — you can AirDrop, email, or save to Files.',
      'On Android: opens the PDF directly via the system viewer.',
      'On Web: opens in a new tab and triggers the browser print/save dialog.',
      "The PDF filename includes the client's name and today's date for easy filing.",
    ],
  },
  createLetter: {
    title: 'Create Letter — Auto Prefill',
    body: [
      "Tapping this button saves the current client's name, SP tier, amount, and years, then navigates to the Letters hub.",
      'In the Letters hub, a blue banner will appear showing the pre-filled client data.',
      'The prefill is available for 30 minutes. Open any letter template and it will reference the client context from the Scenario Tool.',
      'Use this when you have finished a calculation and want to immediately compose an invitation or proposal letter for that client.',
    ],
  },
  scenarioChart: {
    title: 'Scenario Chart',
    body: [
      'This chart shows how your monthly rebate (green line) grows over the full strategy period.',
      'The gold dashed line is your Goal — the moment the green line crosses it, the goal is reached.',
      'Year markers (Y1, Y2…) divide the chart so you can see progress by year at a glance.',
      'The curve rises faster with higher SP tiers, VIP enabled, and monthly deposits. A flat or slow curve usually means a low start amount or no compounding.',
    ],
  },
  compareMode: {
    title: 'Compare Mode',
    body: [
      'Compare this calculation against any scenario from your history — side by side.',
      'Tap Compare, pick a past scenario from the list, and a comparison card appears with 5 key metrics: Peak Rebate, Total In, Total Out, Final Balance, Net Result.',
      'Green = winner. Use this to show clients the difference between SP tiers or different time periods.',
      "Tap 'Clear comparison' to dismiss the comparison card.",
    ],
  },
  rankTiers: {
    title: 'Rank Tiers',
    body: [
      'Your rank in the Plan B network is determined by your total downline team volume.',
      "Each rank unlocks a higher infinity bonus % — a monthly percentage paid on your entire team's purchase volume.",
      'Rank bonuses (💰) are one-time cash bonuses paid when you first reach a new rank.',
      'To advance: grow your team\'s monthly investment volume. Each new partner and each SP upgrade in your network counts toward your total.',
      'The ranks from Sapphire upward earn infinity bonuses. Partner, Pearl, and Ruby do not.',
    ],
  },
  partnerList: {
    title: 'Partner List',
    body: [
      'Track the advisers and partners in your direct downline.',
      'Add a partner with their name, WhatsApp number, country, start date, and investment amount.',
      'Level — set 1, 2, or 3 to indicate how deep in your network they are.',
      'Contact Moments — set automated reminder alerts for key milestones: start date, 3 months, 6 months, 1 year.',
      'WhatsApp button — opens a pre-written check-in message to that partner via WhatsApp.',
      'Delete a partner by tapping the trash icon (requires confirmation).',
    ],
  },
  commissionEstimator: {
    title: 'Commission Estimator',
    body: [
      'Estimates your monthly earnings from the Plan B infinity bonus system.',
      'Team Volume: the total monthly value of all purchases across your entire downline network (all levels combined).',
      'Personal Client Volume: what your own direct clients invest per month — enter it separately if you want to add it to team volume.',
      'Ranks and infinity rates:\n• Sapphire ($25k): 3%\n• Emerald ($50k): 6% + $1k bonus\n• Diamond ($250k): 9% + $5k bonus\n• Blue Diamond ($1M): 12% + $20k bonus\n• Green Diamond ($2.5M): 15% + $50k bonus',
      'The infinity bonus is a monthly percentage of your team volume. As your team grows, your rank and earnings grow automatically.',
    ],
  },
  invitationVideos: {
    title: 'Invitation Videos',
    body: [
      'These are official company introduction videos — suitable to share with new contacts who have never heard of Plan B.',
      'They are available to all users (no partner mode required).',
      'Share via WhatsApp or social media as a first introduction before a live presentation.',
    ],
  },
  adviserVideos: {
    title: 'Adviser Videos',
    body: [
      'These videos cover the business opportunity, compensation plan, and network structure.',
      'They are for qualified advisers only — not for sharing with general public contacts.',
      'Available in multiple languages. Filter by your preferred language using the language selector at the top.',
    ],
  },
  lettersHub: {
    title: 'Letters & Outreach Hub',
    body: [
      'This hub gives you professional letter templates for every type of contact.',
      'Customer Letters — invitation, presentation, and business opportunity letters for new clients.',
      'Adviser Recruiting — passive and active letters to invite new advisers into your network.',
      'Real Estate Partners — soft referral and joint-venture proposals for property professionals.',
      'VIP / HNW Outreach — ultra-premium letters for high-net-worth individuals.',
      'My Personal Letters — create and save your own custom letters with variable placeholders.',
      'Sent Log — track who you sent to, what their response was, and schedule follow-ups.',
      'Profile Setup (⚙) — add your name, company, and logo to pre-fill every letter automatically.',
    ],
  },
};

const nl: TipMap = {
  monthlyGoal: {
    title: 'Maandelijks Doel',
    body: [
      'Stel het maandelijkse bedrag in dat u (of uw klant) wilt ontvangen uit Plan B kortingen. Dit is uw doel — bijvoorbeeld $3.500/maand.',
      'De voortgangsbalk toont hoe dichtbij de huidige investering dit doel is. 100% betekent dat het doel al haalbaar is.',
      'De badge "Doel Bereikt" verschijnt wanneer uw simulatie dit bedrag bereikt binnen de gekozen periode. Niet bereikt? Verhoog dan het startbedrag of het aantal jaren.',
    ],
  },
  clientNameSaving: {
    title: 'Klantnaam & Opslaan',
    body: [
      'Voer de naam van uw klant in om het PDF-rapport en WhatsApp-bericht te personaliseren.',
      '💾 Opslaan — bewaart alle instellingen van deze klant (bedrag, jaren, VIP, maandelijkse aanpassingen) zodat u ze later kunt herladen.',
      '📂 Laden — opent uw opgeslagen klantenlijst. Tik op een klant om zijn/haar scenario direct te herstellen.',
      "Notities — voeg privénotities toe over de klant (bijv. 'voorkeur conservatief', 'terugbellen donderdag'). Notities worden opgeslagen bij het klantprofiel.",
      'Pipeline status — elke opgeslagen klant heeft een status (Prospect → Meeting → Voorstel → Getekend → Actief). Tik op de statusbadge om deze te wijzigen.',
    ],
  },
  vipStatus: {
    title: 'VIP Status',
    body: [
      'VIP voegt +3% per maand toe aan uw kortingspercentage bovenop uw basis SP-tarief. Bijvoorbeeld: SP3 basis 2,7% + VIP = 5,7% per maand.',
      'Auto-VIP: wanneer uw startbedrag $3.550 of meer bereikt, wordt VIP automatisch geactiveerd (het plan financiert de VIP-kosten zelf uit vroege kortingen).',
      'Handmatige VIP: voor bedragen onder de automatische drempel kunt u VIP handmatig inschakelen. Een eenmalige vergoeding van $1.000 wordt toegepast in maand 1.',
      'VIP verhoogt de piekmaandelijkse korting aanzienlijk en helpt het doel eerder te bereiken.',
    ],
  },
  startAmount: {
    title: 'Startbedrag & SP Niveau',
    body: [
      'Voer het brutobedrag in (wat daadwerkelijk betaald wordt). Het systeem trekt een instapvergoeding van 1,25% + $5 vast af om het netto geïnvesteerde kapitaal te berekenen.',
      'SP Niveau presets — tik op SP2 t/m SP7 om snel veelgebruikte bedragen in te stellen:\n• SP2: $1.000 · 2,45%/mnd\n• SP3: $2.500 · 2,70%/mnd\n• SP4: $5.000 · 3,00%/mnd\n• SP5: $10.000 · 3,10%/mnd\n• SP6: $50.000 · 3,20%/mnd\n• SP7: $100.000 · 3,30%/mnd',
      'Upsell tip: als u binnen $2.000 van het volgende niveau zit, toont de calculator hoeveel extra u moet investeren om het hogere tarief te bereiken.',
      'Minimale investering: SP1 begint bij $110. Er is geen maximum.',
    ],
  },
  strategyDuration: {
    title: 'Strategie Looptijd (Jaren)',
    body: [
      'Stel in hoeveel jaar de simulatie moet lopen. Geldig bereik: 1 tot 30 jaar.',
      'Langere looptijd = hogere cumulatieve kortingen en een hogere eindwaarde. De maandelijkse kortingscurve piekt ook later op hogere bedragen.',
      'Tip: de meeste adviseurs presenteren scenario\'s van 3, 5, 7 en 10 jaar om het verschil te tonen. Gebruik de Vergelijk-functie om twee looptijden naast elkaar te zetten.',
    ],
  },
  monthlyDeposit: {
    title: 'Maandelijkse Storting',
    body: [
      'Voeg elke maand een extra diamantaankoop toe bovenop de initiële investering.',
      'Voorbeeld: Bedrag = $500, Tot = 24 → u koopt de eerste 2 jaar elke maand $500 extra aan diamanten.',
      'Elke maandelijkse storting verhoogt uw kapitaalbasis en daarmee de maandelijkse korting in alle toekomstige maanden.',
      'Laat leeg of stel in op 0 als u alleen een eenmalige aankoop wilt.',
    ],
  },
  annualBonus: {
    title: 'Jaarlijkse Bonusstorting',
    body: [
      'Voegt een eenmalige extra aankoop toe die eens per jaar herhaalt (elke 12 maanden).',
      'Voorbeeld: $2.000 → voegt $2.000 toe aan uw diamantkapitaal op maanden 12, 24, 36, enz.',
      'Nuttig voor klanten die een jaareindebonus, belastingteruggave of jaarlijkse spaargelden herinvesteren in Plan B.',
    ],
  },
  fixedWithdrawal: {
    title: 'Vaste Maandelijkse Opname',
    body: [
      'Neem elke maand een vast bedrag op uit uw maandelijkse korting, vanaf een gekozen maand.',
      'Voorbeeld: Bedrag = $500, Vanaf = 25 → u ontvangt $500/maand in contanten vanaf maand 25.',
      'De opname kan de maandelijkse korting niet overschrijden. Elk overschot blijft op uw rekening.',
      'De resterende korting na opname blijft aangroeien (tenzij u ook Opname % instelt).',
    ],
  },
  outPercentage: {
    title: 'Opname % — Procentuele Opname',
    body: [
      'Neem in plaats van een vast bedrag een percentage van uw maandelijkse korting op als contanten.',
      'Voorbeeld: 75%, Vanaf = 1 → u neemt altijd 75% van uw maandelijkse korting op en herbelegt de overige 25%.',
      'Dit is het standaard Plan B model: 75% opnemen, 25% aangroeien. Het balanceert huidig inkomen met groei op lange termijn.',
      'U kunt dit combineren met een Vaste Opname — het vaste bedrag wordt eerst genomen, daarna wordt het % toegepast.',
    ],
  },
  activeCompounding: {
    title: 'Actief Samengesteld %',
    body: [
      'Bepaalt hoeveel van uw maandelijkse korting wordt herbelegd in nieuwe diamantaankopen versus uitbetaald als contanten.',
      '100% = volledig aangroeien — geen contanten opgenomen. Uw diamantportefeuille groeit het snelst. Beste voor vermogensopbouw op lange termijn.',
      '0% = alle korting maandelijks als contanten uitbetaald. Geen verdere groei door herbelegging.',
      'U kunt individuele maanden bewerken in de maandelijkse tabel onder de resultaten door op de Comp%-cel te tikken.',
      'Standaard is 100%. De meeste klanten gebruiken 75% opnemen + 25% aangroeien voor gebalanceerd inkomen en groei.',
    ],
  },
  reverseCalculator: {
    title: 'Omgekeerde Calculator',
    body: [
      "Beantwoordt de vraag: 'Wat is de minimale investering om mijn doel te bereiken?'",
      'Gebruikt uw huidige Doel ($) en Jaren-instellingen en zoekt het kleinste startbedrag dat het doel binnen de periode bereikt.',
      'Het resultaat toont de minimale bruto-investering, het SP-niveau en welke maand het doel voor het eerst wordt bereikt.',
      'Tik op Toepassen ↑ om het gevonden bedrag direct in het veld Startbedrag te kopiëren.',
    ],
  },
  calcHistory: {
    title: 'Berekeningsgeschiedenis',
    body: [
      'De laatste 10 berekeningen worden automatisch opgeslagen elke keer dat u op Berekenen tikt.',
      'Tik op een item om het startbedrag, de jaren, de VIP-status en de klantnaam direct te herstellen.',
      'Elk item toont: klantnaam (of bedrag als er geen naam is), SP-niveau, jaren en piekmaandelijkse korting.',
      'Geschiedenis wordt lokaal op dit apparaat opgeslagen en blijft behouden tussen sessies.',
    ],
  },
  currencyDisplay: {
    title: 'Valuta Weergave',
    body: [
      'Schakel de weergavevaluta voor alle samenvatting-waarden in de resultaten.',
      'USD — US Dollar (basisvaluta van Plan B)\nEUR — Euro (koers: 0,92)\nGBP — Brits Pond (koers: 0,79)\nAED — VAE Dirham (koers: 3,67)',
      'Koersen zijn vaste benaderingen voor presentatiedoeleinden. Controleer altijd actuele koersen voordat u klanten presenteert.',
      'De maandelijkse tabel blijft in USD. Alleen de hoofdsamenvatting wordt geconverteerd.',
    ],
  },
  pdfExport: {
    title: 'PDF Exporteren',
    body: [
      'Genereert een branded A4 PDF-rapport voor deze klant met: strategieparameters, maandelijks kortingsoverzicht, doelstatus, veiligheidsgaranties en een juridische disclaimer.',
      'Op iOS: opent het deelmenu — u kunt AirDroppen, e-mailen of opslaan in Bestanden.',
      'Op Android: opent de PDF direct via de systeemviewer.',
      'Op web: opent in een nieuw tabblad en activeert het afdruk-/opslagdialoogvenster.',
      'De PDF-bestandsnaam bevat de naam van de klant en de datum van vandaag.',
    ],
  },
  createLetter: {
    title: 'Brief Maken — Automatisch Invullen',
    body: [
      'Door op deze knop te tikken worden de naam, het SP-niveau, het bedrag en de jaren van de huidige klant opgeslagen en navigeert u naar de Brieven-hub.',
      'In de Brieven-hub verschijnt een blauwe banner met de vooraf ingevulde klantgegevens.',
      'Het vooraf invullen is 30 minuten beschikbaar. Open een briefsjabloon en het verwijst naar de klantcontext uit de Scenario Tool.',
      'Gebruik dit wanneer u een berekening heeft voltooid en meteen een uitnodigings- of voorstelsbrief wilt opstellen.',
    ],
  },
  scenarioChart: {
    title: 'Scenario Grafiek',
    body: [
      'Deze grafiek toont hoe uw maandelijkse korting (groene lijn) groeit over de volledige strategieperiode.',
      'De gouden stippellijn is uw Doel — zodra de groene lijn deze kruist, is het doel bereikt.',
      'Jaarmarkeringen (J1, J2…) verdelen de grafiek zodat u de voortgang per jaar in één oogopslag kunt zien.',
      'De curve stijgt sneller met hogere SP-niveaus, VIP ingeschakeld en maandelijkse stortingen.',
    ],
  },
  compareMode: {
    title: 'Vergelijkingsmodus',
    body: [
      'Vergelijk deze berekening met elk scenario uit uw geschiedenis — naast elkaar.',
      'Tik op Vergelijken, kies een oud scenario en een vergelijkingskaart verschijnt met 5 statistieken: Piekkorting, Totaal In, Totaal Uit, Eindsaldo, Nettoresultaat.',
      'Groen = winnaar. Gebruik dit om klanten het verschil te tonen tussen SP-niveaus of periodes.',
      "Tik op 'Vergelijking wissen' om de vergelijkingskaart te sluiten.",
    ],
  },
  rankTiers: {
    title: 'Rangniveaus',
    body: [
      'Uw rang in het Plan B-netwerk wordt bepaald door uw totale downline teamvolume.',
      'Elk rang ontsluit een hoger infinity bonus % — een maandelijks percentage betaald op het totale aankoopvolume van uw team.',
      'Rangbonussen (💰) zijn eenmalige contante bonussen die worden uitbetaald wanneer u een nieuwe rang bereikt.',
      'Om te stijgen: vergroot het maandelijkse investeringsvolume van uw team. Elke nieuwe partner en elke SP-upgrade telt mee.',
      'De rangen vanaf Sapphire verdienen infinity bonussen. Partner, Pearl en Ruby doen dat niet.',
    ],
  },
  partnerList: {
    title: 'Partnerlijst',
    body: [
      'Volg de adviseurs en partners in uw directe downline.',
      'Voeg een partner toe met naam, WhatsApp-nummer, land, startdatum en investeringsbedrag.',
      'Niveau — stel 1, 2 of 3 in om aan te geven hoe diep in uw netwerk ze zijn.',
      'Contactmomenten — stel automatische herinneringen in voor sleutelmijlpalen: startdatum, 3 maanden, 6 maanden, 1 jaar.',
      'WhatsApp-knop — opent een kant-en-klaar check-inbericht aan die partner via WhatsApp.',
      'Verwijder een partner door op het prullenbakpictogram te tikken (vereist bevestiging).',
    ],
  },
  commissionEstimator: {
    title: 'Commissiecalculator',
    body: [
      'Schat uw maandelijkse verdiensten uit het Plan B infinity bonus-systeem.',
      'Teamvolume: de totale maandelijkse waarde van alle aankopen in uw volledige downline-netwerk (alle niveaus samen).',
      'Persoonlijk Klantvolume: wat uw eigen directe klanten per maand investeren — voer dit apart in als u het aan het teamvolume wilt toevoegen.',
      'Rangen en infinity-tarieven:\n• Sapphire ($25k): 3%\n• Emerald ($50k): 6% + $1k bonus\n• Diamond ($250k): 9% + $5k bonus\n• Blue Diamond ($1M): 12% + $20k bonus\n• Green Diamond ($2,5M): 15% + $50k bonus',
      'De infinity bonus is een maandelijks percentage van uw teamvolume. Naarmate uw team groeit, groeien uw rang en verdiensten automatisch.',
    ],
  },
  invitationVideos: {
    title: "Uitnodigingsvideo's",
    body: [
      'Dit zijn officiële bedrijfsintroductievideo\'s — geschikt om te delen met nieuwe contacten die nog nooit van Plan B hebben gehoord.',
      'Ze zijn beschikbaar voor alle gebruikers (geen partnermodus vereist).',
      'Deel via WhatsApp of sociale media als eerste introductie vóór een live presentatie.',
    ],
  },
  adviserVideos: {
    title: "Adviseservideo's",
    body: [
      'Deze video\'s behandelen de zakelijke kans, het compensatieplan en de netwerkstructuur.',
      'Ze zijn alleen voor gekwalificeerde adviseurs — niet bedoeld voor het algemene publiek.',
      'Beschikbaar in meerdere talen. Filter op uw voorkeurstaal via de taalselector bovenaan.',
    ],
  },
  lettersHub: {
    title: 'Brieven & Communicatiehub',
    body: [
      'Deze hub biedt u professionele briefsjablonen voor elk type contact.',
      'Klantbrieven — uitnodigings-, presentatie- en zakelijke brieven voor nieuwe klanten.',
      'Adviseur Werving — passieve en actieve brieven om nieuwe adviseurs uit te nodigen in uw netwerk.',
      'Vastgoedpartners — zachte verwijzing en joint-venture voorstellen voor vastgoedprofessionals.',
      'VIP / HNW Outreach — ultra-premium brieven voor vermogende particulieren.',
      'Mijn Persoonlijke Brieven — maak en sla uw eigen aangepaste brieven op met variabele plaatshouders.',
      'Verzendlog — volg wie u heeft verzonden, wat hun reactie was en plan vervolgacties.',
      'Profielinstellingen (⚙) — voeg uw naam, bedrijf en logo toe om elke brief automatisch voor te vullen.',
    ],
  },
};

const de: TipMap = {
  monthlyGoal: {
    title: 'Monatliches Ziel',
    body: [
      'Legen Sie den monatlichen Betrag fest, den Sie (oder Ihr Kunde) aus Plan B-Rabatten erhalten möchten. Dies ist Ihr Ziel — zum Beispiel $3.500/Monat.',
      'Der Fortschrittsbalken zeigt, wie nahe die aktuelle Investition diesem Ziel ist. 100% bedeutet, dass das Ziel bereits erreichbar ist.',
      'Das Abzeichen „Ziel erreicht" erscheint, wenn Ihre Simulation diesen Betrag innerhalb des gewählten Zeitraums erreicht. Nicht erreicht? Erhöhen Sie den Startbetrag oder die Jahre.',
    ],
  },
  clientNameSaving: {
    title: 'Kundenname & Speichern',
    body: [
      'Geben Sie den Namen Ihres Kunden ein, um den PDF-Bericht und die WhatsApp-Nachricht zu personalisieren.',
      '💾 Speichern — speichert alle Einstellungen dieses Kunden (Betrag, Jahre, VIP, monatliche Anpassungen) zur späteren Wiederherstellung.',
      '📂 Laden — öffnet Ihre gespeicherte Kundenliste. Tippen Sie auf einen Kunden, um sein Szenario sofort wiederherzustellen.',
      "Notizen — fügen Sie private Notizen zum Kunden hinzu (z.B. 'bevorzugt konservativ', 'Rückruf Donnerstag'). Notizen werden im Kundenprofil gespeichert.",
      'Pipeline-Status — jeder gespeicherte Kunde hat einen Status (Interessent → Meeting → Angebot → Unterzeichnet → Aktiv). Tippen Sie auf das Statusabzeichen, um es fortzuschalten.',
    ],
  },
  vipStatus: {
    title: 'VIP-Status',
    body: [
      'VIP fügt +3% pro Monat zu Ihrem Rabattsatz zusätzlich zum Basis-SP-Satz hinzu. Beispiel: SP3 Basis 2,7% + VIP = 5,7% pro Monat.',
      'Auto-VIP: Wenn Ihr Startbetrag $3.550 oder mehr erreicht, wird VIP automatisch aktiviert (der Plan finanziert die VIP-Gebühr aus frühen Rabatten).',
      'Manuelles VIP: Für Beträge unter dem automatischen Schwellenwert können Sie VIP manuell aktivieren. Eine einmalige Gebühr von $1.000 wird in Monat 1 berechnet.',
      'VIP erhöht den maximalen Monatsrabatt erheblich und hilft, das Ziel früher zu erreichen.',
    ],
  },
  startAmount: {
    title: 'Startbetrag & SP-Level',
    body: [
      'Geben Sie den Bruttobetrag ein (was tatsächlich bezahlt wird). Das System zieht eine Einstiegsgebühr von 1,25% + $5 pauschal ab, um das netto investierte Kapital zu berechnen.',
      'SP-Level Voreinstellungen — tippen Sie auf SP2 bis SP7, um schnell gängige Beträge einzustellen:\n• SP2: $1.000 · 2,45%/Monat\n• SP3: $2.500 · 2,70%/Monat\n• SP4: $5.000 · 3,00%/Monat\n• SP5: $10.000 · 3,10%/Monat\n• SP6: $50.000 · 3,20%/Monat\n• SP7: $100.000 · 3,30%/Monat',
      'Upsell-Tipp: Wenn Sie innerhalb von $2.000 des nächsten Levels sind, zeigt der Rechner, wie viel mehr Sie investieren müssen.',
      'Mindestinvestition: SP1 beginnt bei $110. Es gibt keine Obergrenze.',
    ],
  },
  strategyDuration: {
    title: 'Strategielaufzeit (Jahre)',
    body: [
      'Legen Sie fest, wie viele Jahre die Simulation laufen soll. Gültiger Bereich: 1 bis 30 Jahre.',
      'Längere Laufzeit = höhere kumulative Rabatte und ein größerer Endvermögenswert. Die monatliche Rabattkurve erreicht auch später höhere Spitzenwerte.',
      'Tipp: Die meisten Berater präsentieren Szenarien für 3, 5, 7 und 10 Jahre. Nutzen Sie die Vergleichsfunktion, um zwei Laufzeiten nebeneinander zu zeigen.',
    ],
  },
  monthlyDeposit: {
    title: 'Monatliche Einzahlung',
    body: [
      'Fügen Sie jeden Monat einen zusätzlichen Diamantenkauf zur Erstinvestition hinzu.',
      'Beispiel: Betrag = $500, Bis = 24 → Sie kaufen in den ersten 2 Jahren jeden Monat zusätzlich $500 an Diamanten.',
      'Jede monatliche Einzahlung erhöht Ihre Kapitalbasis und damit den monatlichen Rabatt in allen zukünftigen Monaten.',
      'Leer lassen oder auf 0 setzen, wenn Sie nur einen einmaligen Kauf möchten.',
    ],
  },
  annualBonus: {
    title: 'Jährliche Bonuseinzahlung',
    body: [
      'Fügt einen einmaligen Zusatzkauf hinzu, der sich einmal pro Jahr wiederholt (alle 12 Monate).',
      'Beispiel: $2.000 → fügt $2.000 zu Ihrem Diamantenkapital in den Monaten 12, 24, 36 usw. hinzu.',
      'Nützlich für Kunden, die einen Jahresbonus, eine Steuerrückerstattung oder jährliche Ersparnisse in Plan B reinvestieren.',
    ],
  },
  fixedWithdrawal: {
    title: 'Feste Monatliche Abhebung',
    body: [
      'Heben Sie jeden Monat einen festen Betrag aus Ihrem monatlichen Rabatt ab, beginnend ab einem gewählten Monat.',
      'Beispiel: Betrag = $500, Ab = 25 → Sie erhalten ab Monat 25 $500/Monat in bar.',
      'Die Abhebung kann den monatlichen Rabatt nicht überschreiten. Überschüsse verbleiben auf Ihrem Konto.',
      'Der verbleibende Rabatt nach der Abhebung wird weiter angesammelt (sofern Sie nicht auch Abhebung % eingestellt haben).',
    ],
  },
  outPercentage: {
    title: 'Abhebung % — Prozentualer Auszug',
    body: [
      'Heben Sie statt eines festen Betrags einen Prozentsatz Ihres monatlichen Rabatts als Bargeld ab.',
      'Beispiel: 75%, Ab = 1 → Sie nehmen immer 75% Ihres monatlichen Rabatts in bar und reinvestieren die verbleibenden 25%.',
      'Dies ist das Standard-Plan-B-Modell: 75% abheben, 25% anlegen. Es balanciert aktuelles Einkommen mit langfristigem Wachstum.',
      'Sie können dies mit einer festen Abhebung kombinieren — der feste Betrag wird zuerst genommen, dann wird der % angewendet.',
    ],
  },
  activeCompounding: {
    title: 'Aktiver Zinseszins %',
    body: [
      'Steuert, wie viel Ihres monatlichen Rabatts in neue Diamantenkäufe reinvestiert wird versus als Bargeld ausgezahlt.',
      '100% = vollständige Anlage — kein Bargeld abgehoben. Ihr Diamantenportfolio wächst am schnellsten. Am besten für langfristigen Vermögensaufbau.',
      '0% = gesamter Rabatt monatlich als Bargeld ausgezahlt. Kein weiteres Wachstum durch Reinvestition.',
      'Sie können einzelne Monate in der Monatstabelle unter den Ergebnissen durch Tippen auf die Comp%-Zelle bearbeiten.',
      'Standard ist 100%. Die meisten Kunden nutzen 75% Auszahlung + 25% Zinseszins für ausgeglichenes Einkommen und Wachstum.',
    ],
  },
  reverseCalculator: {
    title: 'Umgekehrter Rechner',
    body: [
      "Beantwortet die Frage: 'Was ist die Mindestinvestition, um mein Ziel zu erreichen?'",
      'Verwendet Ihre aktuellen Ziel ($) und Jahre-Einstellungen und findet den kleinsten Startbetrag, der das Ziel innerhalb des Zeitraums erreicht.',
      'Das Ergebnis zeigt die minimale Brutto-Investition, das SP-Level und welchen Monat das Ziel zuerst erreicht wird.',
      'Tippen Sie auf Übernehmen ↑, um den gefundenen Betrag direkt in das Startbetrag-Feld zu kopieren.',
    ],
  },
  calcHistory: {
    title: 'Berechnungsverlauf',
    body: [
      'Die letzten 10 Berechnungen werden jedes Mal automatisch gespeichert, wenn Sie auf Berechnen tippen.',
      'Tippen Sie auf einen Eintrag, um Startbetrag, Jahre, VIP-Status und Kundenname sofort wiederherzustellen.',
      'Jeder Eintrag zeigt: Kundenname (oder Betrag ohne Namen), SP-Level, Jahre und maximalen Monatsrabatt.',
      'Der Verlauf wird lokal auf diesem Gerät gespeichert und bleibt sitzungsübergreifend erhalten.',
    ],
  },
  currencyDisplay: {
    title: 'Währungsanzeige',
    body: [
      'Wechseln Sie die Anzeigewährung für alle Zusammenfassungswerte im Ergebnisbereich.',
      'USD — US-Dollar (Basiswährung von Plan B)\nEUR — Euro (Kurs: 0,92)\nGBP — Britisches Pfund (Kurs: 0,79)\nAED — VAE-Dirham (Kurs: 3,67)',
      'Kurse sind feste Näherungswerte für Präsentationszwecke. Überprüfen Sie immer aktuelle Kurse vor der Kundenpräsentation.',
      'Die Monatstabelle bleibt in USD. Nur die Hauptübersichtskarten werden konvertiert.',
    ],
  },
  pdfExport: {
    title: 'PDF-Export',
    body: [
      'Erstellt einen gebrandeten A4-PDF-Bericht für diesen Kunden mit: Strategieparameter, monatlichem Rabattplan, Zielstatus, Sicherheitsgarantien und rechtlichem Hinweis.',
      'Auf iOS: öffnet das Teilen-Menü — Sie können per AirDrop, E-Mail oder in Dateien speichern.',
      'Auf Android: öffnet die PDF direkt im System-Viewer.',
      'Im Web: öffnet in einem neuen Tab und löst den Browser-Druck-/Speicherdialog aus.',
      'Der PDF-Dateiname enthält den Kundennamen und das heutige Datum.',
    ],
  },
  createLetter: {
    title: 'Brief erstellen — Automatisch befüllen',
    body: [
      'Durch Tippen auf diese Schaltfläche werden der Name, das SP-Level, der Betrag und die Jahre des aktuellen Kunden gespeichert und Sie werden zur Briefe-Hub weitergeleitet.',
      'Im Briefe-Hub erscheint ein blauers Banner mit den vorbefüllten Kundendaten.',
      'Die Vorbefüllung ist 30 Minuten verfügbar. Öffnen Sie eine Briefvorlage und sie verweist auf den Kunden-Kontext aus dem Szenario-Tool.',
      'Nutzen Sie dies, wenn Sie eine Berechnung abgeschlossen haben und sofort einen Einladungs- oder Angebotsbrief verfassen möchten.',
    ],
  },
  scenarioChart: {
    title: 'Szenario-Diagramm',
    body: [
      'Dieses Diagramm zeigt, wie Ihr monatlicher Rabatt (grüne Linie) über den gesamten Strategiezeitraum wächst.',
      'Die goldene gestrichelte Linie ist Ihr Ziel — sobald die grüne Linie sie kreuzt, ist das Ziel erreicht.',
      'Jahresmarkierungen (J1, J2…) unterteilen das Diagramm, sodass Sie den Fortschritt nach Jahr auf einen Blick sehen.',
      'Die Kurve steigt schneller mit höheren SP-Levels, aktiviertem VIP und monatlichen Einzahlungen.',
    ],
  },
  compareMode: {
    title: 'Vergleichsmodus',
    body: [
      'Vergleichen Sie diese Berechnung mit einem beliebigen Szenario aus Ihrem Verlauf — nebeneinander.',
      'Tippen Sie auf Vergleichen, wählen Sie ein vergangenes Szenario aus und eine Vergleichskarte erscheint mit 5 Kennzahlen: Maximaler Rabatt, Gesamt Ein, Gesamt Aus, Endsaldo, Nettowert.',
      'Grün = Gewinner. Nutzen Sie dies, um Kunden den Unterschied zwischen SP-Levels oder Zeiträumen zu zeigen.',
      "Tippen Sie auf 'Vergleich löschen', um die Vergleichskarte zu schließen.",
    ],
  },
  rankTiers: {
    title: 'Rangstufen',
    body: [
      'Ihr Rang im Plan B-Netzwerk wird durch Ihr gesamtes Downline-Teamvolumen bestimmt.',
      'Jeder Rang schaltet einen höheren Infinity-Bonus % frei — ein monatlicher Prozentsatz auf das gesamte Kaufvolumen Ihres Teams.',
      'Rangboni (💰) sind einmalige Bargeldprämien, die beim erstmaligen Erreichen eines neuen Rangs ausgezahlt werden.',
      'Zum Aufsteigen: Steigern Sie das monatliche Investitionsvolumen Ihres Teams. Jeder neue Partner und jede SP-Aufwertung zählt.',
      'Die Ränge ab Sapphire verdienen Infinity-Boni. Partner, Pearl und Ruby tun dies nicht.',
    ],
  },
  partnerList: {
    title: 'Partnerliste',
    body: [
      'Verfolgen Sie die Berater und Partner in Ihrer direkten Downline.',
      'Fügen Sie einen Partner mit Name, WhatsApp-Nummer, Land, Startdatum und Investitionsbetrag hinzu.',
      'Level — stellen Sie 1, 2 oder 3 ein, um anzugeben, wie tief im Netzwerk sie sind.',
      'Kontaktmomente — richten Sie automatische Erinnerungen für wichtige Meilensteine ein: Startdatum, 3 Monate, 6 Monate, 1 Jahr.',
      'WhatsApp-Schaltfläche — öffnet eine vorgefertigte Check-in-Nachricht an diesen Partner via WhatsApp.',
      'Löschen Sie einen Partner durch Tippen auf das Papierkorb-Symbol (Bestätigung erforderlich).',
    ],
  },
  commissionEstimator: {
    title: 'Provisionsrechner',
    body: [
      'Schätzt Ihre monatlichen Einnahmen aus dem Plan B Infinity-Bonus-System.',
      'Teamvolumen: der gesamte monatliche Wert aller Käufe in Ihrem gesamten Downline-Netzwerk (alle Ebenen zusammen).',
      'Persönliches Kundenvolumen: was Ihre eigenen Direktkunden pro Monat investieren — separat eingeben, wenn Sie es zum Teamvolumen hinzufügen möchten.',
      'Ränge und Infinity-Sätze:\n• Sapphire ($25k): 3%\n• Emerald ($50k): 6% + $1k Bonus\n• Diamond ($250k): 9% + $5k Bonus\n• Blue Diamond ($1M): 12% + $20k Bonus\n• Green Diamond ($2,5M): 15% + $50k Bonus',
      'Der Infinity-Bonus ist ein monatlicher Prozentsatz Ihres Teamvolumens. Mit wachsendem Team steigen Rang und Einnahmen automatisch.',
    ],
  },
  invitationVideos: {
    title: 'Einladungsvideos',
    body: [
      'Dies sind offizielle Unternehmenseinführungsvideos — geeignet zum Teilen mit neuen Kontakten, die noch nie von Plan B gehört haben.',
      'Sie sind für alle Nutzer verfügbar (kein Partnermodus erforderlich).',
      'Teilen Sie diese via WhatsApp oder sozialen Medien als erste Einführung vor einer Live-Präsentation.',
    ],
  },
  adviserVideos: {
    title: 'Beratervideos',
    body: [
      'Diese Videos behandeln die Geschäftsmöglichkeit, den Vergütungsplan und die Netzwerkstruktur.',
      'Sie sind nur für qualifizierte Berater — nicht für die allgemeine Öffentlichkeit gedacht.',
      'In mehreren Sprachen verfügbar. Filtern Sie nach Ihrer bevorzugten Sprache über die Sprachauswahl oben.',
    ],
  },
  lettersHub: {
    title: 'Briefe & Outreach-Hub',
    body: [
      'Dieser Hub bietet Ihnen professionelle Briefvorlagen für jeden Kontakttyp.',
      'Kundenbriefe — Einladungs-, Präsentations- und Geschäftsbriefe für neue Kunden.',
      'Berateranwerbung — passive und aktive Briefe, um neue Berater in Ihr Netzwerk einzuladen.',
      'Immobilienpartner — sanfte Weiterempfehlungs- und Joint-Venture-Vorschläge für Immobilienprofis.',
      'VIP / HNW-Outreach — ultra-premium Briefe für vermögende Privatpersonen.',
      'Meine persönlichen Briefe — erstellen und speichern Sie eigene Briefe mit variablen Platzhaltern.',
      'Versandprotokoll — verfolgen Sie, an wen Sie gesendet haben, was die Reaktion war und planen Sie Nachverfolgungen.',
      'Profileinstellungen (⚙) — fügen Sie Ihren Namen, Ihr Unternehmen und Ihr Logo hinzu, um jeden Brief automatisch auszufüllen.',
    ],
  },
};

const fr: TipMap = {
  monthlyGoal: {
    title: 'Objectif Mensuel',
    body: [
      'Définissez le montant mensuel que vous (ou votre client) souhaitez recevoir des remises Plan B. C\'est votre objectif — par exemple $3 500/mois.',
      'La barre de progression indique dans quelle mesure l\'investissement actuel est proche de cet objectif. 100% signifie que l\'objectif est déjà réalisable.',
      'Le badge « Objectif Atteint » apparaît lorsque votre simulation atteint ce montant dans la période choisie. Non atteint ? Augmentez le montant de départ ou les années.',
    ],
  },
  clientNameSaving: {
    title: 'Nom du Client & Sauvegarde',
    body: [
      'Saisissez le nom de votre client pour personnaliser le rapport PDF et le message WhatsApp.',
      '💾 Sauvegarder — enregistre tous les paramètres de ce client (montant, années, VIP, ajustements mensuels) pour les recharger plus tard.',
      '📂 Charger — ouvre votre liste de clients enregistrés. Appuyez sur un client pour restaurer instantanément son scénario.',
      "Notes — ajoutez des notes privées sur le client (ex. 'préfère le conservateur', 'rappel jeudi'). Les notes sont sauvegardées avec le profil client.",
      'Statut pipeline — chaque client enregistré a un statut (Prospect → Rendez-vous → Proposition → Signé → Actif). Appuyez sur le badge de statut pour le faire avancer.',
    ],
  },
  vipStatus: {
    title: 'Statut VIP',
    body: [
      'Le VIP ajoute +3% par mois à votre taux de remise en plus de votre taux SP de base. Par exemple : SP3 base 2,7% + VIP = 5,7% par mois.',
      'Auto-VIP : lorsque votre montant de départ atteint $3 550 ou plus, le VIP s\'active automatiquement (le plan autofinance la frais VIP grâce aux premières remises).',
      'VIP manuel : pour les montants en dessous du seuil automatique, vous pouvez activer le VIP manuellement. Des frais uniques de $1 000 sont appliqués au mois 1.',
      'Le VIP augmente considérablement la remise mensuelle maximale et aide à atteindre l\'objectif plus tôt.',
    ],
  },
  startAmount: {
    title: 'Montant de Départ & Niveau SP',
    body: [
      'Saisissez le montant brut (ce qui est réellement payé). Le système déduit des frais d\'entrée de 1,25% + $5 fixe pour calculer le capital net investi.',
      'Préréglages SP — appuyez sur SP2 à SP7 pour définir rapidement des montants courants :\n• SP2 : $1 000 · 2,45%/mois\n• SP3 : $2 500 · 2,70%/mois\n• SP4 : $5 000 · 3,00%/mois\n• SP5 : $10 000 · 3,10%/mois\n• SP6 : $50 000 · 3,20%/mois\n• SP7 : $100 000 · 3,30%/mois',
      'Conseil upsell : lorsque vous êtes à moins de $2 000 du niveau suivant, le calculateur vous indique combien investir de plus.',
      'Investissement minimum : SP1 commence à $110. Il n\'y a pas de limite supérieure.',
    ],
  },
  strategyDuration: {
    title: 'Durée de la Stratégie (Années)',
    body: [
      'Définissez combien d\'années la simulation doit durer. Plage valide : 1 à 30 ans.',
      'Durée plus longue = remises cumulées plus élevées et valeur finale d\'actif plus importante. La courbe de remise mensuelle culmine également plus tard à des montants plus élevés.',
      'Conseil : la plupart des conseillers présentent des scénarios de 3, 5, 7 et 10 ans. Utilisez la fonction Comparer pour montrer deux durées côte à côte.',
    ],
  },
  monthlyDeposit: {
    title: 'Dépôt Mensuel',
    body: [
      'Ajoutez un achat de diamants supplémentaire chaque mois en plus de l\'investissement initial.',
      'Exemple : Montant = $500, Jusqu\'au = 24 → vous achetez $500 de diamants supplémentaires par mois pendant les 2 premières années.',
      'Chaque dépôt mensuel augmente votre base de capital et donc la remise mensuelle dans tous les mois futurs.',
      'Laissez vide ou mettez 0 si vous ne souhaitez qu\'un achat unique.',
    ],
  },
  annualBonus: {
    title: 'Dépôt Bonus Annuel',
    body: [
      'Ajoute un achat supplémentaire unique qui se répète une fois par an (tous les 12 mois).',
      'Exemple : $2 000 → ajoute $2 000 à votre capital diamants aux mois 12, 24, 36, etc.',
      'Utile pour les clients qui réinvestissent un bonus de fin d\'année, un remboursement fiscal ou des économies annuelles dans Plan B.',
    ],
  },
  fixedWithdrawal: {
    title: 'Retrait Mensuel Fixe',
    body: [
      'Retirez un montant fixe de votre remise mensuelle chaque mois, à partir d\'un mois choisi.',
      'Exemple : Montant = $500, À partir de = 25 → vous recevez $500/mois en espèces à partir du mois 25.',
      'Le retrait ne peut pas dépasser votre remise mensuelle. Tout excédent reste sur votre compte.',
      'La remise restante après retrait continue à se composer (sauf si vous avez également défini un Retrait %).',
    ],
  },
  outPercentage: {
    title: 'Retrait % — Retrait en Pourcentage',
    body: [
      'Au lieu d\'un montant fixe, retirez un pourcentage de votre remise mensuelle en espèces.',
      'Exemple : 75%, À partir de = 1 → vous prenez toujours 75% de votre remise mensuelle en espèces et réinvestissez les 25% restants.',
      'C\'est le modèle Plan B standard : 75% retrait, 25% capitalisation. Il équilibre les revenus actuels avec la croissance à long terme.',
      'Vous pouvez combiner cela avec un Retrait Fixe — le montant fixe est pris en premier, puis le % est appliqué.',
    ],
  },
  activeCompounding: {
    title: 'Capitalisation Active %',
    body: [
      'Contrôle combien de votre remise mensuelle est réinvestie dans de nouveaux achats de diamants versus versée en espèces.',
      '100% = capitalisation complète — pas d\'espèces retirées. Votre portefeuille de diamants croît le plus vite. Meilleur pour la création de patrimoine à long terme.',
      '0% = toute la remise versée en espèces chaque mois. Aucune croissance supplémentaire par réinvestissement.',
      'Vous pouvez modifier des mois individuels dans le tableau mensuel sous les résultats en appuyant sur la cellule Comp%.',
      'Par défaut 100%. La plupart des clients utilisent 75% de retrait + 25% de capitalisation pour un équilibre revenus/croissance.',
    ],
  },
  reverseCalculator: {
    title: 'Calculateur Inversé',
    body: [
      "Répond à la question : 'Quel est l'investissement minimum pour atteindre mon objectif ?'",
      'Utilise vos paramètres actuels Objectif ($) et Années, puis trouve le plus petit montant de départ qui atteint l\'objectif dans la période.',
      'Le résultat montre l\'investissement brut minimum, le niveau SP et le mois où l\'objectif est atteint pour la première fois.',
      'Appuyez sur Appliquer ↑ pour copier le montant trouvé directement dans le champ Montant de Départ.',
    ],
  },
  calcHistory: {
    title: 'Historique des Calculs',
    body: [
      'Les 10 derniers calculs sont automatiquement sauvegardés chaque fois que vous appuyez sur Calculer.',
      'Appuyez sur une entrée pour restaurer instantanément le montant de départ, les années, le statut VIP et le nom du client.',
      'Chaque entrée affiche : nom du client (ou montant sans nom), niveau SP, années et remise mensuelle maximale.',
      'L\'historique est stocké localement sur cet appareil et persiste entre les sessions.',
    ],
  },
  currencyDisplay: {
    title: 'Affichage de la Devise',
    body: [
      'Changez la devise d\'affichage pour toutes les valeurs récapitulatives dans la section des résultats.',
      'USD — Dollar américain (devise de base de Plan B)\nEUR — Euro (taux : 0,92)\nGBP — Livre sterling (taux : 0,79)\nAED — Dirham des EAU (taux : 3,67)',
      'Les taux sont des approximations fixes à des fins de présentation. Vérifiez toujours les taux en vigueur avant de les présenter aux clients.',
      'Le tableau mensuel reste en USD. Seules les cartes récapitulatives principales sont converties.',
    ],
  },
  pdfExport: {
    title: 'Export PDF',
    body: [
      'Génère un rapport PDF A4 de marque pour ce client incluant : paramètres de stratégie, calendrier de remises mensuel, statut de l\'objectif, garanties de sécurité et avertissement légal.',
      'Sur iOS : ouvre le menu de partage — vous pouvez utiliser AirDrop, envoyer par e-mail ou enregistrer dans Fichiers.',
      'Sur Android : ouvre le PDF directement via la visionneuse système.',
      'Sur Web : ouvre dans un nouvel onglet et déclenche la boîte de dialogue d\'impression/sauvegarde du navigateur.',
      'Le nom du fichier PDF inclut le nom du client et la date du jour.',
    ],
  },
  createLetter: {
    title: 'Créer une Lettre — Préremplissage Auto',
    body: [
      'En appuyant sur ce bouton, le nom, le niveau SP, le montant et les années du client actuel sont sauvegardés, puis vous êtes redirigé vers le Hub Lettres.',
      'Dans le Hub Lettres, une bannière bleue apparaît avec les données client préremplies.',
      'Le préremplissage est disponible pendant 30 minutes. Ouvrez un modèle de lettre et il fera référence au contexte client de l\'Outil Scénario.',
      'Utilisez ceci lorsque vous avez terminé un calcul et souhaitez immédiatement rédiger une lettre d\'invitation ou de proposition.',
    ],
  },
  scenarioChart: {
    title: 'Graphique de Scénario',
    body: [
      'Ce graphique montre comment votre remise mensuelle (ligne verte) croît sur toute la période de la stratégie.',
      'La ligne dorée en pointillés est votre Objectif — dès que la ligne verte la croise, l\'objectif est atteint.',
      'Les marqueurs annuels (A1, A2…) divisent le graphique pour voir la progression par année d\'un coup d\'œil.',
      'La courbe monte plus vite avec des niveaux SP plus élevés, le VIP activé et des dépôts mensuels.',
    ],
  },
  compareMode: {
    title: 'Mode Comparaison',
    body: [
      'Comparez ce calcul avec n\'importe quel scénario de votre historique — côte à côte.',
      'Appuyez sur Comparer, choisissez un scénario passé, et une carte de comparaison apparaît avec 5 métriques : Remise Maximum, Total Entrant, Total Sortant, Solde Final, Résultat Net.',
      'Vert = gagnant. Utilisez cela pour montrer aux clients la différence entre les niveaux SP ou différentes périodes.',
      "Appuyez sur 'Effacer la comparaison' pour fermer la carte.",
    ],
  },
  rankTiers: {
    title: 'Niveaux de Rang',
    body: [
      'Votre rang dans le réseau Plan B est déterminé par le volume total de votre équipe downline.',
      'Chaque rang débloque un bonus infini % plus élevé — un pourcentage mensuel payé sur le volume d\'achat total de votre équipe.',
      'Les bonus de rang (💰) sont des primes uniques versées lorsque vous atteignez un nouveau rang pour la première fois.',
      'Pour progresser : développez le volume d\'investissement mensuel de votre équipe. Chaque nouveau partenaire et chaque mise à niveau SP comptent.',
      'Les rangs à partir de Sapphire gagnent des bonus infinis. Partner, Pearl et Ruby ne le font pas.',
    ],
  },
  partnerList: {
    title: 'Liste des Partenaires',
    body: [
      'Suivez les conseillers et partenaires dans votre downline directe.',
      'Ajoutez un partenaire avec son nom, numéro WhatsApp, pays, date de début et montant d\'investissement.',
      'Niveau — définissez 1, 2 ou 3 pour indiquer la profondeur dans votre réseau.',
      'Moments de Contact — définissez des rappels automatiques pour des jalons clés : date de début, 3 mois, 6 mois, 1 an.',
      'Bouton WhatsApp — ouvre un message de vérification prêt à envoyer à ce partenaire via WhatsApp.',
      'Supprimez un partenaire en appuyant sur l\'icône de la corbeille (confirmation requise).',
    ],
  },
  commissionEstimator: {
    title: 'Estimateur de Commission',
    body: [
      'Estime vos gains mensuels du système de bonus infini Plan B.',
      'Volume d\'équipe : la valeur mensuelle totale de tous les achats dans tout votre réseau downline (tous niveaux confondus).',
      'Volume Personnel Client : ce que vos propres clients directs investissent par mois — saisissez-le séparément si vous souhaitez l\'ajouter au volume d\'équipe.',
      'Rangs et taux infinis :\n• Sapphire ($25k) : 3%\n• Emerald ($50k) : 6% + $1k bonus\n• Diamond ($250k) : 9% + $5k bonus\n• Blue Diamond ($1M) : 12% + $20k bonus\n• Green Diamond ($2,5M) : 15% + $50k bonus',
      'Le bonus infini est un pourcentage mensuel de votre volume d\'équipe. Plus votre équipe grandit, plus votre rang et vos gains augmentent automatiquement.',
    ],
  },
  invitationVideos: {
    title: "Vidéos d'Invitation",
    body: [
      'Ce sont des vidéos officielles d\'introduction à l\'entreprise — adaptées pour partager avec de nouveaux contacts qui n\'ont jamais entendu parler de Plan B.',
      'Elles sont disponibles pour tous les utilisateurs (aucun mode partenaire requis).',
      'Partagez via WhatsApp ou les réseaux sociaux comme première introduction avant une présentation en direct.',
    ],
  },
  adviserVideos: {
    title: 'Vidéos Conseiller',
    body: [
      "Ces vidéos couvrent l'opportunité commerciale, le plan de rémunération et la structure du réseau.",
      'Elles sont réservées aux conseillers qualifiés — non destinées au grand public.',
      'Disponibles en plusieurs langues. Filtrez par votre langue préférée avec le sélecteur de langue en haut.',
    ],
  },
  lettersHub: {
    title: 'Hub Lettres & Communication',
    body: [
      'Ce hub vous offre des modèles de lettres professionnelles pour chaque type de contact.',
      'Lettres Clients — lettres d\'invitation, de présentation et d\'opportunité commerciale pour les nouveaux clients.',
      'Recrutement Conseillers — lettres passives et actives pour inviter de nouveaux conseillers dans votre réseau.',
      'Partenaires Immobiliers — propositions de recommandation douce et de coentreprise pour les professionnels de l\'immobilier.',
      'Outreach VIP / HNW — lettres ultra-premium pour les personnes à haute valeur nette.',
      'Mes Lettres Personnelles — créez et sauvegardez vos propres lettres avec des espaces réservés variables.',
      'Journal d\'Envoi — suivez à qui vous avez envoyé, leur réponse et planifiez les relances.',
      'Configuration du Profil (⚙) — ajoutez votre nom, entreprise et logo pour préremplir chaque lettre automatiquement.',
    ],
  },
};

const es: TipMap = {
  monthlyGoal: {
    title: 'Meta Mensual',
    body: [
      'Establezca el monto mensual que usted (o su cliente) desea recibir de los descuentos Plan B. Este es su objetivo — por ejemplo $3,500/mes.',
      'La barra de progreso muestra qué tan cerca está la inversión actual de alcanzar esta meta. 100% significa que la meta ya es alcanzable.',
      'La insignia "Meta Alcanzada" aparece cuando su simulación llega a este monto dentro del período elegido. ¿No alcanzada? Intente aumentar el monto inicial o los años.',
    ],
  },
  clientNameSaving: {
    title: 'Nombre del Cliente & Guardar',
    body: [
      'Ingrese el nombre de su cliente para personalizar el informe PDF y el mensaje de WhatsApp.',
      '💾 Guardar — almacena todos los ajustes de este cliente (monto, años, VIP, ajustes mensuales) para recargarlos más tarde.',
      '📂 Cargar — abre su lista de clientes guardados. Toque cualquier cliente para restaurar instantáneamente su escenario.',
      "Notas — agregue notas privadas sobre el cliente (ej. 'prefiere conservador', 'llamar el jueves'). Las notas se guardan con el perfil del cliente.",
      'Estado de pipeline — cada cliente guardado tiene un estado (Prospecto → Reunión → Propuesta → Firmado → Activo). Toque el badge de estado para avanzarlo.',
    ],
  },
  vipStatus: {
    title: 'Estado VIP',
    body: [
      'VIP añade +3% por mes a su tasa de descuento sobre su tasa SP base. Por ejemplo: SP3 base 2,7% + VIP = 5,7% por mes.',
      'Auto-VIP: cuando su monto inicial alcanza $3,550 o más, VIP se activa automáticamente (el plan autofinancia la tarifa VIP con los primeros descuentos).',
      'VIP manual: para montos por debajo del umbral automático, puede activar VIP manualmente. Se aplica una tarifa única de $1,000 en el mes 1.',
      'VIP aumenta drásticamente el descuento mensual máximo y ayuda a alcanzar la meta antes.',
    ],
  },
  startAmount: {
    title: 'Monto Inicial & Nivel SP',
    body: [
      'Ingrese el monto bruto (lo que realmente se paga). El sistema deduce una tarifa de entrada de 1,25% + $5 fijo para calcular el capital neto invertido.',
      'Preajustes SP — toque SP2 a SP7 para establecer rápidamente montos comunes:\n• SP2: $1,000 · 2,45%/mes\n• SP3: $2,500 · 2,70%/mes\n• SP4: $5,000 · 3,00%/mes\n• SP5: $10,000 · 3,10%/mes\n• SP6: $50,000 · 3,20%/mes\n• SP7: $100,000 · 3,30%/mes',
      'Consejo de upsell: cuando está dentro de $2,000 del siguiente nivel, la calculadora le muestra cuánto más invertir para alcanzar la tasa más alta.',
      'Inversión mínima: SP1 comienza en $110. No hay límite máximo.',
    ],
  },
  strategyDuration: {
    title: 'Duración de la Estrategia (Años)',
    body: [
      'Establezca cuántos años debe ejecutarse la simulación. Rango válido: 1 a 30 años.',
      'Mayor duración = mayores descuentos acumulados y mayor valor de activo final. La curva de descuento mensual también alcanza su pico más tarde en montos más altos.',
      'Consejo: la mayoría de los asesores presentan escenarios de 3, 5, 7 y 10 años para mostrar la diferencia. Use la función Comparar para mostrar dos duraciones lado a lado.',
    ],
  },
  monthlyDeposit: {
    title: 'Depósito Mensual',
    body: [
      'Agregue una compra adicional de diamantes cada mes además de la inversión inicial.',
      'Ejemplo: Monto = $500, Hasta = 24 → compra $500 adicionales de diamantes por mes durante los primeros 2 años.',
      'Cada depósito mensual aumenta su base de capital y por lo tanto el descuento mensual en todos los meses futuros.',
      'Deje en blanco o establezca en 0 si solo desea una compra única.',
    ],
  },
  annualBonus: {
    title: 'Depósito Bono Anual',
    body: [
      'Agrega una compra extra única que se repite una vez al año (cada 12 meses).',
      'Ejemplo: $2,000 → agrega $2,000 a su capital de diamantes en los meses 12, 24, 36, etc.',
      'Útil para clientes que reinvierten un bono de fin de año, reembolso de impuestos o ahorros anuales en Plan B.',
    ],
  },
  fixedWithdrawal: {
    title: 'Retiro Mensual Fijo',
    body: [
      'Retire un monto fijo de su descuento mensual cada mes, comenzando desde un mes elegido.',
      'Ejemplo: Monto = $500, Desde = 25 → recibe $500/mes en efectivo a partir del mes 25.',
      'El retiro no puede exceder su descuento mensual. Cualquier exceso permanece en su cuenta.',
      'El descuento restante después del retiro continúa componiendo (a menos que también establezca Retiro %).',
    ],
  },
  outPercentage: {
    title: 'Retiro % — Retiro en Porcentaje',
    body: [
      'En lugar de un monto fijo, retire un porcentaje de su descuento mensual en efectivo.',
      'Ejemplo: 75%, Desde = 1 → siempre toma el 75% de su descuento mensual en efectivo y reinvierte el 25% restante.',
      'Este es el modelo Plan B estándar: 75% retiro, 25% capitalización. Equilibra ingresos actuales con crecimiento a largo plazo.',
      'Puede combinar esto con un Retiro Fijo — el monto fijo se toma primero, luego se aplica el %.',
    ],
  },
  activeCompounding: {
    title: 'Capitalización Activa %',
    body: [
      'Controla cuánto de su descuento mensual se reinvierte en nuevas compras de diamantes versus se paga en efectivo.',
      '100% = capitalización completa — sin efectivo retirado. Su cartera de diamantes crece más rápido. Mejor para la creación de riqueza a largo plazo.',
      '0% = todo el descuento pagado en efectivo cada mes. Sin crecimiento adicional por reinversión.',
      'Puede editar meses individuales en la tabla mensual debajo de los resultados tocando la celda Comp%.',
      'El valor predeterminado es 100%. La mayoría de los clientes usan 75% retiro + 25% capitalización para ingresos y crecimiento equilibrados.',
    ],
  },
  reverseCalculator: {
    title: 'Calculadora Inversa',
    body: [
      "Responde la pregunta: '¿Cuál es la inversión mínima necesaria para alcanzar mi meta?'",
      'Usa su configuración actual de Meta ($) y Años, luego encuentra el monto inicial más pequeño que alcanza la meta dentro del período.',
      'El resultado muestra la inversión bruta mínima, el nivel SP en que cae y qué mes se alcanza la meta por primera vez.',
      'Toque Aplicar ↑ para copiar el monto encontrado directamente en el campo Monto Inicial.',
    ],
  },
  calcHistory: {
    title: 'Historial de Cálculos',
    body: [
      'Los últimos 10 cálculos se guardan automáticamente cada vez que toca Calcular.',
      'Toque cualquier entrada para restaurar instantáneamente el monto inicial, años, estado VIP y nombre del cliente.',
      'Cada entrada muestra: nombre del cliente (o monto sin nombre), nivel SP, años y descuento mensual máximo.',
      'El historial se almacena localmente en este dispositivo y persiste entre sesiones.',
    ],
  },
  currencyDisplay: {
    title: 'Visualización de Moneda',
    body: [
      'Cambie la moneda de visualización para todos los valores de resumen en la sección de resultados.',
      'USD — Dólar estadounidense (moneda base de Plan B)\nEUR — Euro (tasa: 0,92)\nGBP — Libra esterlina (tasa: 0,79)\nAED — Dírham de EAU (tasa: 3,67)',
      'Las tasas son aproximaciones fijas para fines de presentación. Verifique siempre las tasas en vivo antes de presentar a clientes.',
      'La tabla mensual permanece en USD. Solo las tarjetas de resumen principales se convierten.',
    ],
  },
  pdfExport: {
    title: 'Exportar PDF',
    body: [
      'Genera un informe PDF A4 de marca para este cliente que incluye: parámetros de estrategia, calendario de descuentos mensual, estado de meta, garantías de seguridad y aviso legal.',
      'En iOS: abre el menú compartir — puede usar AirDrop, enviar por correo o guardar en Archivos.',
      'En Android: abre el PDF directamente a través del visor del sistema.',
      'En Web: abre en una nueva pestaña y activa el diálogo de impresión/guardado del navegador.',
      'El nombre del archivo PDF incluye el nombre del cliente y la fecha de hoy.',
    ],
  },
  createLetter: {
    title: 'Crear Carta — Prellenado Auto',
    body: [
      'Al tocar este botón, se guardan el nombre, nivel SP, monto y años del cliente actual, y se navega al Hub de Cartas.',
      'En el Hub de Cartas, aparecerá un banner azul con los datos del cliente prellenados.',
      'El prellenado está disponible por 30 minutos. Abra cualquier plantilla de carta y hará referencia al contexto del cliente de la Herramienta de Escenario.',
      'Úselo cuando haya terminado un cálculo y quiera redactar inmediatamente una carta de invitación o propuesta.',
    ],
  },
  scenarioChart: {
    title: 'Gráfico de Escenario',
    body: [
      'Este gráfico muestra cómo crece su descuento mensual (línea verde) durante todo el período de la estrategia.',
      'La línea dorada discontinua es su Meta — en el momento en que la línea verde la cruza, se alcanza la meta.',
      'Los marcadores de año (A1, A2…) dividen el gráfico para ver el progreso por año de un vistazo.',
      'La curva sube más rápido con niveles SP más altos, VIP activado y depósitos mensuales.',
    ],
  },
  compareMode: {
    title: 'Modo Comparación',
    body: [
      'Compare este cálculo con cualquier escenario de su historial — lado a lado.',
      'Toque Comparar, elija un escenario pasado y aparece una tarjeta de comparación con 5 métricas: Descuento Máximo, Total Entrada, Total Salida, Saldo Final, Resultado Neto.',
      'Verde = ganador. Úselo para mostrar a los clientes la diferencia entre niveles SP o diferentes períodos.',
      "Toque 'Borrar comparación' para cerrar la tarjeta.",
    ],
  },
  rankTiers: {
    title: 'Niveles de Rango',
    body: [
      'Su rango en la red Plan B está determinado por el volumen total de su equipo downline.',
      'Cada rango desbloquea un % de bono infinito más alto — un porcentaje mensual pagado sobre el volumen total de compras de su equipo.',
      'Los bonos de rango (💰) son bonos en efectivo únicos pagados cuando alcanza un nuevo rango por primera vez.',
      'Para avanzar: aumente el volumen de inversión mensual de su equipo. Cada nuevo socio y cada mejora SP cuenta.',
      'Los rangos desde Sapphire en adelante ganan bonos infinitos. Partner, Pearl y Ruby no lo hacen.',
    ],
  },
  partnerList: {
    title: 'Lista de Socios',
    body: [
      'Realice un seguimiento de los asesores y socios en su downline directo.',
      'Agregue un socio con su nombre, número de WhatsApp, país, fecha de inicio y monto de inversión.',
      'Nivel — establezca 1, 2 o 3 para indicar qué tan profundo están en su red.',
      'Momentos de Contacto — configure recordatorios automáticos para hitos clave: fecha de inicio, 3 meses, 6 meses, 1 año.',
      'Botón WhatsApp — abre un mensaje de check-in prediseñado para ese socio via WhatsApp.',
      'Elimine un socio tocando el ícono de papelera (requiere confirmación).',
    ],
  },
  commissionEstimator: {
    title: 'Estimador de Comisiones',
    body: [
      'Estima sus ganancias mensuales del sistema de bono infinito Plan B.',
      'Volumen del Equipo: el valor mensual total de todas las compras en toda su red downline (todos los niveles combinados).',
      'Volumen Personal de Clientes: lo que sus propios clientes directos invierten por mes — ingréselo por separado si desea sumarlo al volumen del equipo.',
      'Rangos y tasas infinitas:\n• Sapphire ($25k): 3%\n• Emerald ($50k): 6% + $1k bono\n• Diamond ($250k): 9% + $5k bono\n• Blue Diamond ($1M): 12% + $20k bono\n• Green Diamond ($2,5M): 15% + $50k bono',
      'El bono infinito es un porcentaje mensual de su volumen de equipo. A medida que su equipo crece, su rango y ganancias crecen automáticamente.',
    ],
  },
  invitationVideos: {
    title: 'Videos de Invitación',
    body: [
      'Estos son videos oficiales de introducción a la empresa — adecuados para compartir con nuevos contactos que nunca han oído hablar de Plan B.',
      'Están disponibles para todos los usuarios (no se requiere modo socio).',
      'Comparta via WhatsApp o redes sociales como primera introducción antes de una presentación en vivo.',
    ],
  },
  adviserVideos: {
    title: 'Videos de Asesor',
    body: [
      'Estos videos cubren la oportunidad de negocio, el plan de compensación y la estructura de red.',
      'Son solo para asesores calificados — no para compartir con contactos del público general.',
      'Disponibles en múltiples idiomas. Filtre por su idioma preferido usando el selector de idioma en la parte superior.',
    ],
  },
  lettersHub: {
    title: 'Hub de Cartas & Comunicación',
    body: [
      'Este hub le ofrece plantillas de cartas profesionales para cada tipo de contacto.',
      'Cartas de Clientes — cartas de invitación, presentación y oportunidad de negocio para nuevos clientes.',
      'Reclutamiento de Asesores — cartas pasivas y activas para invitar nuevos asesores a su red.',
      'Socios Inmobiliarios — propuestas de referencia suave y empresa conjunta para profesionales inmobiliarios.',
      'Alcance VIP / HNW — cartas ultra premium para personas de alto patrimonio neto.',
      'Mis Cartas Personales — cree y guarde sus propias cartas con marcadores de posición variables.',
      'Registro de Envíos — haga seguimiento de a quién envió, cuál fue su respuesta y programe seguimientos.',
      'Configuración de Perfil (⚙) — agregue su nombre, empresa y logo para pre-rellenar cada carta automáticamente.',
    ],
  },
};

const it: TipMap = {
  monthlyGoal: {
    title: 'Obiettivo Mensile',
    body: [
      'Impostare il importo mensile che voi (o il vostro cliente) desiderate ricevere dagli sconti Plan B. Questo è il vostro obiettivo — ad esempio $3.500/mese.',
      'La barra di avanzamento mostra quanto vicino è l\'investimento attuale a raggiungere questo obiettivo. 100% significa che l\'obiettivo è già raggiungibile.',
      'Il badge "Obiettivo Raggiunto" appare quando la simulazione raggiunge questo importo entro il periodo scelto. Non raggiunto? Provate ad aumentare l\'importo iniziale o gli anni.',
    ],
  },
  clientNameSaving: {
    title: 'Nome Cliente & Salvataggio',
    body: [
      'Inserite il nome del vostro cliente per personalizzare il report PDF e il messaggio WhatsApp.',
      '💾 Salva — memorizza tutte le impostazioni di questo cliente (importo, anni, VIP, sovrascritture mensili) per ricaricarle in seguito.',
      '📂 Carica — apre il vostro elenco di clienti salvati. Toccate qualsiasi cliente per ripristinare istantaneamente il suo scenario.',
      "Note — aggiungete note private sul cliente (es. 'preferisce il conservativo', 'richiamata giovedì'). Le note vengono salvate con il profilo cliente.",
      'Stato pipeline — ogni cliente salvato ha uno stato (Prospect → Incontro → Proposta → Firmato → Attivo). Toccate il badge di stato per avanzarlo.',
    ],
  },
  vipStatus: {
    title: 'Stato VIP',
    body: [
      'VIP aggiunge +3% al mese al tasso di sconto oltre al tasso SP base. Ad esempio: SP3 base 2,7% + VIP = 5,7% al mese.',
      'Auto-VIP: quando l\'importo iniziale raggiunge $3.550 o superiore, VIP si attiva automaticamente (il piano si autofinanzia la quota VIP con i primi sconti).',
      'VIP manuale: per importi sotto la soglia automatica, potete attivare VIP manualmente. Una commissione una tantum di $1.000 viene applicata al mese 1.',
      'VIP aumenta notevolmente il rimborso mensile massimo e aiuta a raggiungere l\'obiettivo prima.',
    ],
  },
  startAmount: {
    title: 'Importo Iniziale & Livello SP',
    body: [
      'Inserite l\'importo lordo (ciò che viene effettivamente pagato). Il sistema deduce una commissione di ingresso dell\'1,25% + $5 fisso per calcolare il capitale netto investito.',
      'Preimpostazioni SP — toccate SP2 fino a SP7 per impostare rapidamente importi comuni:\n• SP2: $1.000 · 2,45%/mese\n• SP3: $2.500 · 2,70%/mese\n• SP4: $5.000 · 3,00%/mese\n• SP5: $10.000 · 3,10%/mese\n• SP6: $50.000 · 3,20%/mese\n• SP7: $100.000 · 3,30%/mese',
      'Suggerimento upsell: quando siete entro $2.000 dal livello successivo, la calcolatrice mostra quanto di più investire per raggiungere il tasso più alto.',
      'Investimento minimo: SP1 inizia da $110. Non c\'è limite superiore.',
    ],
  },
  strategyDuration: {
    title: 'Durata della Strategia (Anni)',
    body: [
      'Impostate quanti anni deve durare la simulazione. Intervallo valido: da 1 a 30 anni.',
      'Durata maggiore = sconti cumulativi più elevati e maggiore valore finale degli asset. La curva di rimborso mensile raggiunge il picco più tardi a importi più elevati.',
      'Suggerimento: la maggior parte dei consulenti presenta scenari di 3, 5, 7 e 10 anni. Usate la funzione Confronta per mostrare due durate affiancate.',
    ],
  },
  monthlyDeposit: {
    title: 'Deposito Mensile',
    body: [
      'Aggiungete un acquisto extra di diamanti ogni mese oltre all\'investimento iniziale.',
      'Esempio: Importo = $500, Fino = 24 → acquistate $500 aggiuntivi di diamanti al mese per i primi 2 anni.',
      'Ogni deposito mensile aumenta la base di capitale e quindi il rimborso mensile in tutti i mesi futuri.',
      'Lasciate vuoto o impostate a 0 se desiderate solo un acquisto una tantum.',
    ],
  },
  annualBonus: {
    title: 'Deposito Bonus Annuale',
    body: [
      'Aggiunge un acquisto extra una tantum che si ripete una volta all\'anno (ogni 12 mesi).',
      'Esempio: $2.000 → aggiunge $2.000 al capitale diamanti ai mesi 12, 24, 36, ecc.',
      'Utile per i clienti che reinvestono un bonus di fine anno, un rimborso fiscale o risparmi annuali in Plan B.',
    ],
  },
  fixedWithdrawal: {
    title: 'Prelievo Mensile Fisso',
    body: [
      'Preleva un importo fisso dal rimborso mensile ogni mese, a partire da un mese scelto.',
      'Esempio: Importo = $500, Da = 25 → ricevete $500/mese in contanti dal mese 25 in poi.',
      'Il prelievo non può superare il rimborso mensile. Qualsiasi eccedenza rimane nel vostro conto.',
      'Il rimborso rimanente dopo il prelievo continua a capitalizzare (a meno che non abbiate impostato anche Prelievo %).',
    ],
  },
  outPercentage: {
    title: 'Prelievo % — Prelievo Percentuale',
    body: [
      'Invece di un importo fisso, preleva una percentuale del rimborso mensile in contanti.',
      'Esempio: 75%, Da = 1 → prendete sempre il 75% del rimborso mensile in contanti e reinvestite il restante 25%.',
      'Questo è il modello Plan B standard: 75% prelievo, 25% capitalizzazione. Bilancia reddito immediato con crescita a lungo termine.',
      'Potete combinarlo con un Prelievo Fisso — l\'importo fisso viene preso prima, poi viene applicata la %.',
    ],
  },
  activeCompounding: {
    title: 'Capitalizzazione Attiva %',
    body: [
      'Controlla quanta parte del rimborso mensile viene reinvestita in nuovi acquisti di diamanti rispetto a quanto viene erogato in contanti.',
      '100% = capitalizzazione completa — nessun contante prelevato. Il portafoglio diamanti cresce più velocemente. Migliore per la creazione di ricchezza a lungo termine.',
      '0% = tutto il rimborso erogato in contanti ogni mese. Nessuna ulteriore crescita da reinvestimento.',
      'Potete modificare mesi individuali nella tabella mensile sotto i risultati toccando la cella Comp%.',
      'Il valore predefinito è 100%. La maggior parte dei clienti usa 75% prelievo + 25% capitalizzazione per reddito e crescita bilanciati.',
    ],
  },
  reverseCalculator: {
    title: 'Calcolatrice Inversa',
    body: [
      "Risponde alla domanda: 'Qual è l'investimento minimo necessario per raggiungere il mio obiettivo?'",
      'Usa le impostazioni attuali di Obiettivo ($) e Anni, poi trova il più piccolo importo iniziale che raggiunge l\'obiettivo entro il periodo.',
      'Il risultato mostra l\'investimento lordo minimo, il livello SP e quale mese l\'obiettivo viene raggiunto per la prima volta.',
      'Toccate Applica ↑ per copiare l\'importo trovato direttamente nel campo Importo Iniziale.',
    ],
  },
  calcHistory: {
    title: 'Cronologia Calcoli',
    body: [
      'Gli ultimi 10 calcoli vengono salvati automaticamente ogni volta che toccate Calcola.',
      'Toccate qualsiasi voce per ripristinare istantaneamente l\'importo iniziale, gli anni, lo stato VIP e il nome del cliente.',
      'Ogni voce mostra: nome cliente (o importo senza nome), livello SP, anni e rimborso mensile massimo.',
      'La cronologia è memorizzata localmente su questo dispositivo e persiste tra le sessioni.',
    ],
  },
  currencyDisplay: {
    title: 'Visualizzazione Valuta',
    body: [
      'Cambia la valuta di visualizzazione per tutti i valori di riepilogo nella sezione dei risultati.',
      'USD — Dollaro USA (valuta base di Plan B)\nEUR — Euro (tasso: 0,92)\nGBP — Sterlina britannica (tasso: 0,79)\nAED — Dirham degli EAU (tasso: 3,67)',
      'I tassi sono approssimazioni fisse a scopo di presentazione. Verificate sempre i tassi attuali prima di presentare ai clienti.',
      'La tabella mensile rimane in USD. Solo le schede di riepilogo principali vengono convertite.',
    ],
  },
  pdfExport: {
    title: 'Esportazione PDF',
    body: [
      'Genera un report PDF A4 brandizzato per questo cliente che include: parametri di strategia, calendario sconti mensile, stato obiettivo, garanzie di sicurezza e avviso legale.',
      'Su iOS: apre il menu condivisione — potete usare AirDrop, inviare via email o salvare in File.',
      'Su Android: apre il PDF direttamente tramite il visualizzatore di sistema.',
      'Sul Web: apre in una nuova scheda e attiva la finestra di dialogo stampa/salvataggio del browser.',
      'Il nome del file PDF include il nome del cliente e la data odierna.',
    ],
  },
  createLetter: {
    title: 'Crea Lettera — Precompilazione Auto',
    body: [
      'Toccando questo pulsante vengono salvati nome, livello SP, importo e anni del cliente attuale, poi si naviga all\'Hub Lettere.',
      'Nell\'Hub Lettere apparirà un banner blu con i dati del cliente precompilati.',
      'La precompilazione è disponibile per 30 minuti. Aprite qualsiasi modello di lettera e farà riferimento al contesto cliente dello Strumento Scenario.',
      'Usatelo quando avete completato un calcolo e volete comporre immediatamente una lettera di invito o proposta.',
    ],
  },
  scenarioChart: {
    title: 'Grafico dello Scenario',
    body: [
      'Questo grafico mostra come il rimborso mensile (linea verde) cresce durante l\'intero periodo della strategia.',
      'La linea dorata tratteggiata è il vostro Obiettivo — nel momento in cui la linea verde la incrocia, l\'obiettivo è raggiunto.',
      'I marcatori annuali (A1, A2…) dividono il grafico per vedere i progressi per anno a colpo d\'occhio.',
      'La curva sale più velocemente con livelli SP più alti, VIP abilitato e depositi mensili.',
    ],
  },
  compareMode: {
    title: 'Modalità Confronto',
    body: [
      'Confrontate questo calcolo con qualsiasi scenario dalla vostra cronologia — fianco a fianco.',
      'Toccate Confronta, scegliete uno scenario passato e appare una scheda di confronto con 5 metriche chiave: Rimborso Massimo, Totale Entrato, Totale Uscito, Saldo Finale, Risultato Netto.',
      'Verde = vincitore. Usatelo per mostrare ai clienti la differenza tra livelli SP o periodi diversi.',
      "Toccate 'Cancella confronto' per chiudere la scheda.",
    ],
  },
  rankTiers: {
    title: 'Livelli di Rango',
    body: [
      'Il vostro rango nella rete Plan B è determinato dal volume totale del team downline.',
      'Ogni rango sblocca un % di bonus infinito più alto — una percentuale mensile pagata sul volume di acquisto totale del vostro team.',
      'I bonus di rango (💰) sono premi in contanti una tantum pagati quando raggiungete un nuovo rango per la prima volta.',
      'Per avanzare: aumentate il volume di investimento mensile del team. Ogni nuovo partner e ogni aggiornamento SP conta.',
      'I ranghi da Sapphire in su guadagnano bonus infiniti. Partner, Pearl e Ruby non lo fanno.',
    ],
  },
  partnerList: {
    title: 'Lista Partner',
    body: [
      'Monitorate i consulenti e i partner nel vostro downline diretto.',
      'Aggiungete un partner con nome, numero WhatsApp, paese, data di inizio e importo di investimento.',
      'Livello — impostate 1, 2 o 3 per indicare quanto in profondità sono nella rete.',
      'Momenti di Contatto — impostate promemoria automatici per tappe fondamentali: data di inizio, 3 mesi, 6 mesi, 1 anno.',
      'Pulsante WhatsApp — apre un messaggio di check-in pre-scritto a quel partner via WhatsApp.',
      'Eliminate un partner toccando l\'icona del cestino (richiede conferma).',
    ],
  },
  commissionEstimator: {
    title: 'Stimatore Commissioni',
    body: [
      'Stima i guadagni mensili dal sistema di bonus infinito Plan B.',
      'Volume del Team: il valore mensile totale di tutti gli acquisti nell\'intera rete downline (tutti i livelli combinati).',
      'Volume Personale Clienti: ciò che i vostri clienti diretti investono per mese — inseritelo separatamente se volete aggiungerlo al volume del team.',
      'Ranghi e tassi infiniti:\n• Sapphire ($25k): 3%\n• Emerald ($50k): 6% + $1k bonus\n• Diamond ($250k): 9% + $5k bonus\n• Blue Diamond ($1M): 12% + $20k bonus\n• Green Diamond ($2,5M): 15% + $50k bonus',
      'Il bonus infinito è una percentuale mensile del volume del team. Man mano che il team cresce, il rango e i guadagni crescono automaticamente.',
    ],
  },
  invitationVideos: {
    title: 'Video di Invito',
    body: [
      'Questi sono video ufficiali di introduzione aziendale — adatti da condividere con nuovi contatti che non hanno mai sentito parlare di Plan B.',
      'Sono disponibili per tutti gli utenti (non è richiesta la modalità partner).',
      'Condividete via WhatsApp o social media come prima introduzione prima di una presentazione dal vivo.',
    ],
  },
  adviserVideos: {
    title: 'Video Consulente',
    body: [
      "Questi video coprono l'opportunità commerciale, il piano di compensazione e la struttura della rete.",
      'Sono solo per consulenti qualificati — non destinati al pubblico generale.',
      'Disponibili in più lingue. Filtrate per la lingua preferita usando il selettore di lingua in alto.',
    ],
  },
  lettersHub: {
    title: 'Hub Lettere & Outreach',
    body: [
      'Questo hub vi offre modelli di lettere professionali per ogni tipo di contatto.',
      'Lettere Clienti — lettere di invito, presentazione e opportunità commerciale per nuovi clienti.',
      'Reclutamento Consulenti — lettere passive e attive per invitare nuovi consulenti nella vostra rete.',
      'Partner Immobiliari — proposte di referral soft e joint-venture per professionisti immobiliari.',
      'Outreach VIP / HNW — lettere ultra-premium per persone ad alto patrimonio netto.',
      'Le Mie Lettere Personali — create e salvate lettere personalizzate con segnaposto variabili.',
      'Registro Invii — monitorate a chi avete inviato, la risposta e pianificate i follow-up.',
      'Configurazione Profilo (⚙) — aggiungete nome, azienda e logo per precompilare ogni lettera automaticamente.',
    ],
  },
};

const pt: TipMap = {
  monthlyGoal: {
    title: 'Meta Mensal',
    body: [
      'Defina o valor mensal que você (ou seu cliente) deseja receber dos descontos Plan B. Este é o seu objetivo — por exemplo $3.500/mês.',
      'A barra de progresso mostra o quão perto o investimento atual está de atingir esta meta. 100% significa que a meta já é alcançável.',
      'O badge "Meta Atingida" aparece quando a simulação atinge este valor dentro do período escolhido. Não atingida? Tente aumentar o valor inicial ou os anos.',
    ],
  },
  clientNameSaving: {
    title: 'Nome do Cliente & Salvar',
    body: [
      'Insira o nome do seu cliente para personalizar o relatório PDF e a mensagem do WhatsApp.',
      '💾 Salvar — armazena todas as configurações deste cliente (valor, anos, VIP, substituições mensais) para recarregar mais tarde.',
      '📂 Carregar — abre a sua lista de clientes salvos. Toque em qualquer cliente para restaurar instantaneamente o seu cenário.',
      "Notas — adicione notas privadas sobre o cliente (ex. 'prefere conservador', 'retornar quinta-feira'). As notas são salvas com o perfil do cliente.",
      'Status de pipeline — cada cliente salvo tem um status (Prospecto → Reunião → Proposta → Assinado → Ativo). Toque no badge de status para avançar.',
    ],
  },
  vipStatus: {
    title: 'Status VIP',
    body: [
      'VIP adiciona +3% por mês à sua taxa de desconto além da taxa SP base. Por exemplo: SP3 base 2,7% + VIP = 5,7% por mês.',
      'Auto-VIP: quando o valor inicial atinge $3.550 ou mais, o VIP é ativado automaticamente (o plano financia a taxa VIP com os primeiros descontos).',
      'VIP manual: para valores abaixo do limite automático, você pode ativar o VIP manualmente. Uma taxa única de $1.000 é aplicada no mês 1.',
      'O VIP aumenta drasticamente o reembolso mensal máximo e ajuda a atingir a meta mais cedo.',
    ],
  },
  startAmount: {
    title: 'Valor Inicial & Nível SP',
    body: [
      'Insira o valor bruto (o que é realmente pago). O sistema deduz uma taxa de entrada de 1,25% + $5 fixo para calcular o capital líquido investido.',
      'Predefinições SP — toque de SP2 a SP7 para definir rapidamente valores comuns:\n• SP2: $1.000 · 2,45%/mês\n• SP3: $2.500 · 2,70%/mês\n• SP4: $5.000 · 3,00%/mês\n• SP5: $10.000 · 3,10%/mês\n• SP6: $50.000 · 3,20%/mês\n• SP7: $100.000 · 3,30%/mês',
      'Dica de upsell: quando está dentro de $2.000 do próximo nível, a calculadora mostra quanto mais investir.',
      'Investimento mínimo: SP1 começa em $110. Não há limite máximo.',
    ],
  },
  strategyDuration: {
    title: 'Duração da Estratégia (Anos)',
    body: [
      'Defina quantos anos a simulação deve durar. Intervalo válido: 1 a 30 anos.',
      'Maior duração = maiores descontos acumulados e maior valor final de ativos. A curva de reembolso mensal também atinge o pico mais tarde em valores mais altos.',
      'Dica: a maioria dos consultores apresenta cenários de 3, 5, 7 e 10 anos. Use a função Comparar para mostrar duas durações lado a lado.',
    ],
  },
  monthlyDeposit: {
    title: 'Depósito Mensal',
    body: [
      'Adicione uma compra extra de diamantes a cada mês além do investimento inicial.',
      'Exemplo: Valor = $500, Até = 24 → você compra $500 adicionais de diamantes por mês durante os primeiros 2 anos.',
      'Cada depósito mensal aumenta a base de capital e portanto o reembolso mensal em todos os meses futuros.',
      'Deixe em branco ou defina como 0 se quiser apenas uma compra única.',
    ],
  },
  annualBonus: {
    title: 'Depósito Bônus Anual',
    body: [
      'Adiciona uma compra extra única que se repete uma vez por ano (a cada 12 meses).',
      'Exemplo: $2.000 → adiciona $2.000 ao seu capital de diamantes nos meses 12, 24, 36, etc.',
      'Útil para clientes que reinvestem um bônus de fim de ano, restituição fiscal ou poupanças anuais no Plan B.',
    ],
  },
  fixedWithdrawal: {
    title: 'Saque Mensal Fixo',
    body: [
      'Retire um valor fixo do seu reembolso mensal a cada mês, a partir de um mês escolhido.',
      'Exemplo: Valor = $500, A partir de = 25 → você recebe $500/mês em dinheiro a partir do mês 25.',
      'O saque não pode exceder o reembolso mensal. Qualquer excedente permanece na sua conta.',
      'O reembolso restante após o saque continua a capitalizar (a menos que também tenha definido Saque %).',
    ],
  },
  outPercentage: {
    title: 'Saque % — Saque Percentual',
    body: [
      'Em vez de um valor fixo, retire uma porcentagem do seu reembolso mensal em dinheiro.',
      'Exemplo: 75%, A partir de = 1 → você sempre retira 75% do reembolso mensal em dinheiro e reinveste os 25% restantes.',
      'Este é o modelo padrão Plan B: 75% saque, 25% capitalização. Equilibra renda atual com crescimento a longo prazo.',
      'Você pode combinar isso com um Saque Fixo — o valor fixo é retirado primeiro, depois a % é aplicada.',
    ],
  },
  activeCompounding: {
    title: 'Capitalização Ativa %',
    body: [
      'Controla quanto do seu reembolso mensal é reinvestido em novas compras de diamantes versus pago em dinheiro.',
      '100% = capitalização total — sem dinheiro retirado. Seu portfólio de diamantes cresce mais rápido. Melhor para criação de riqueza a longo prazo.',
      '0% = todo o reembolso pago em dinheiro a cada mês. Sem crescimento adicional por reinvestimento.',
      'Você pode editar meses individuais na tabela mensal abaixo dos resultados tocando na célula Comp%.',
      'O padrão é 100%. A maioria dos clientes usa 75% saque + 25% capitalização para renda e crescimento equilibrados.',
    ],
  },
  reverseCalculator: {
    title: 'Calculadora Inversa',
    body: [
      "Responde à pergunta: 'Qual é o investimento mínimo necessário para atingir minha meta?'",
      'Usa suas configurações atuais de Meta ($) e Anos, e encontra o menor valor inicial que atinge a meta dentro do período.',
      'O resultado mostra o investimento bruto mínimo, o nível SP em que se enquadra e qual mês a meta é atingida pela primeira vez.',
      'Toque em Aplicar ↑ para copiar o valor encontrado diretamente no campo Valor Inicial.',
    ],
  },
  calcHistory: {
    title: 'Histórico de Cálculos',
    body: [
      'Os últimos 10 cálculos são salvos automaticamente cada vez que você toca em Calcular.',
      'Toque em qualquer entrada para restaurar instantaneamente o valor inicial, anos, status VIP e nome do cliente.',
      'Cada entrada mostra: nome do cliente (ou valor sem nome), nível SP, anos e reembolso mensal máximo.',
      'O histórico é armazenado localmente neste dispositivo e persiste entre sessões.',
    ],
  },
  currencyDisplay: {
    title: 'Exibição de Moeda',
    body: [
      'Mude a moeda de exibição para todos os valores de resumo na seção de resultados.',
      'USD — Dólar americano (moeda base do Plan B)\nEUR — Euro (taxa: 0,92)\nGBP — Libra esterlina (taxa: 0,79)\nAED — Dirham dos EAU (taxa: 3,67)',
      'As taxas são aproximações fixas para fins de apresentação. Verifique sempre as taxas ao vivo antes de apresentar aos clientes.',
      'A tabela mensal permanece em USD. Apenas os cartões de resumo principais são convertidos.',
    ],
  },
  pdfExport: {
    title: 'Exportar PDF',
    body: [
      'Gera um relatório PDF A4 com marca para este cliente incluindo: parâmetros de estratégia, cronograma de descontos mensal, status da meta, garantias de segurança e aviso legal.',
      'No iOS: abre o menu de compartilhamento — você pode usar AirDrop, enviar por email ou salvar em Arquivos.',
      'No Android: abre o PDF diretamente pelo visualizador do sistema.',
      'Na Web: abre em uma nova aba e aciona o diálogo de impressão/salvamento do navegador.',
      'O nome do arquivo PDF inclui o nome do cliente e a data de hoje.',
    ],
  },
  createLetter: {
    title: 'Criar Carta — Preenchimento Auto',
    body: [
      'Ao tocar neste botão, o nome, nível SP, valor e anos do cliente atual são salvos e você é direcionado ao Hub de Cartas.',
      'No Hub de Cartas, aparecerá um banner azul com os dados do cliente pré-preenchidos.',
      'O preenchimento fica disponível por 30 minutos. Abra qualquer modelo de carta e ele fará referência ao contexto do cliente da Ferramenta de Cenário.',
      'Use isso quando tiver concluído um cálculo e quiser redigir imediatamente uma carta de convite ou proposta.',
    ],
  },
  scenarioChart: {
    title: 'Gráfico do Cenário',
    body: [
      'Este gráfico mostra como o seu reembolso mensal (linha verde) cresce ao longo de todo o período da estratégia.',
      'A linha dourada tracejada é a sua Meta — no momento em que a linha verde a cruza, a meta é atingida.',
      'Os marcadores anuais (A1, A2…) dividem o gráfico para ver o progresso por ano de relance.',
      'A curva sobe mais rápido com níveis SP mais altos, VIP ativado e depósitos mensais.',
    ],
  },
  compareMode: {
    title: 'Modo Comparação',
    body: [
      'Compare este cálculo com qualquer cenário do seu histórico — lado a lado.',
      'Toque em Comparar, escolha um cenário passado e aparece um cartão de comparação com 5 métricas: Reembolso Máximo, Total Entrada, Total Saída, Saldo Final, Resultado Líquido.',
      'Verde = vencedor. Use isso para mostrar aos clientes a diferença entre níveis SP ou períodos diferentes.',
      "Toque em 'Limpar comparação' para fechar o cartão.",
    ],
  },
  rankTiers: {
    title: 'Níveis de Classificação',
    body: [
      'Sua classificação na rede Plan B é determinada pelo volume total da equipe downline.',
      'Cada classificação desbloqueia um % de bônus infinito mais alto — uma porcentagem mensal paga sobre o volume total de compras da equipe.',
      'Bônus de classificação (💰) são bônus em dinheiro únicos pagos quando você atinge uma nova classificação pela primeira vez.',
      'Para avançar: aumente o volume de investimento mensal da equipe. Cada novo parceiro e cada atualização SP conta.',
      'As classificações a partir de Sapphire ganham bônus infinitos. Partner, Pearl e Ruby não.',
    ],
  },
  partnerList: {
    title: 'Lista de Parceiros',
    body: [
      'Acompanhe os consultores e parceiros no seu downline direto.',
      'Adicione um parceiro com nome, número de WhatsApp, país, data de início e valor de investimento.',
      'Nível — defina 1, 2 ou 3 para indicar o quão profundo na rede estão.',
      'Momentos de Contato — configure lembretes automáticos para marcos importantes: data de início, 3 meses, 6 meses, 1 ano.',
      'Botão WhatsApp — abre uma mensagem de check-in pré-escrita para esse parceiro via WhatsApp.',
      'Exclua um parceiro tocando no ícone de lixeira (requer confirmação).',
    ],
  },
  commissionEstimator: {
    title: 'Estimador de Comissão',
    body: [
      'Estima seus ganhos mensais do sistema de bônus infinito Plan B.',
      'Volume da Equipe: o valor mensal total de todas as compras em toda a sua rede downline (todos os níveis combinados).',
      'Volume Pessoal de Clientes: o que seus próprios clientes diretos investem por mês — insira separadamente se quiser adicioná-lo ao volume da equipe.',
      'Classificações e taxas infinitas:\n• Sapphire ($25k): 3%\n• Emerald ($50k): 6% + $1k bônus\n• Diamond ($250k): 9% + $5k bônus\n• Blue Diamond ($1M): 12% + $20k bônus\n• Green Diamond ($2,5M): 15% + $50k bônus',
      'O bônus infinito é uma porcentagem mensal do volume da equipe. À medida que a equipe cresce, a classificação e os ganhos crescem automaticamente.',
    ],
  },
  invitationVideos: {
    title: 'Vídeos de Convite',
    body: [
      'Estes são vídeos oficiais de introdução da empresa — adequados para compartilhar com novos contatos que nunca ouviram falar do Plan B.',
      'Estão disponíveis para todos os usuários (não requer modo parceiro).',
      'Compartilhe via WhatsApp ou redes sociais como primeira introdução antes de uma apresentação ao vivo.',
    ],
  },
  adviserVideos: {
    title: 'Vídeos do Consultor',
    body: [
      'Estes vídeos cobrem a oportunidade de negócio, o plano de compensação e a estrutura da rede.',
      'São apenas para consultores qualificados — não destinados ao público geral.',
      'Disponíveis em vários idiomas. Filtre pelo idioma preferido usando o seletor de idioma no topo.',
    ],
  },
  lettersHub: {
    title: 'Hub de Cartas & Comunicação',
    body: [
      'Este hub oferece modelos de cartas profissionais para cada tipo de contato.',
      'Cartas de Clientes — cartas de convite, apresentação e oportunidade de negócio para novos clientes.',
      'Recrutamento de Consultores — cartas passivas e ativas para convidar novos consultores para sua rede.',
      'Parceiros Imobiliários — propostas de referência suave e joint-venture para profissionais imobiliários.',
      'Alcance VIP / HNW — cartas ultra-premium para indivíduos de alto patrimônio líquido.',
      'Minhas Cartas Pessoais — crie e salve suas próprias cartas com marcadores de posição variáveis.',
      'Registro de Envios — acompanhe para quem enviou, qual foi a resposta e agende follow-ups.',
      'Configuração de Perfil (⚙) — adicione seu nome, empresa e logo para pré-preencher cada carta automaticamente.',
    ],
  },
};

const tips: Partial<Record<Language, TipMap>> = { en, nl, de, fr, es, it, pt };

export function getTip(lang: Language, key: TipKey): TipContent {
  return tips[lang]?.[key] ?? tips.en![key];
}
