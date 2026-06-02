import { Language } from './translations';

export type TipKey =
  | 'monthlyGoal' | 'clientNameSaving' | 'vipStatus' | 'startAmount'
  | 'strategyDuration' | 'monthlyDeposit' | 'annualBonus' | 'fixedWithdrawal'
  | 'outPercentage' | 'activeCompounding' | 'reverseCalculator' | 'calcHistory'
  | 'currencyDisplay' | 'pdfExport' | 'createLetter' | 'scenarioChart'
  | 'compareMode' | 'rankTiers' | 'partnerList' | 'commissionEstimator'
  | 'invitationVideos' | 'adviserVideos' | 'lettersHub'
  | 'assetGoalPlanner' | 'projectedRevenueModel' | 'sentLog'
  | 'strategySummary' | 'companyMargin' | 'monthlyDiscountSchedule'
  | 'bannerToggle';

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
      'USD — US Dollar (base currency of Plan B)\nEUR — Euro (rate: 0.92)\nGBP — British Pound (rate: 0.79)\nAED — UAE Dirham (rate: 3.67)\nPHP — Philippine Peso (rate: 57.5)\nSGD — Singapore Dollar (rate: 1.35)',
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
  assetGoalPlanner: {
    title: 'Asset Goal Planner',
    body: [
      'Enter the asset value you want to reach (e.g. $250,000). The planner calculates whether your start amount and monthly deposits get you there within the chosen timeframe.',
      'Use the quick-select chips to jump to common target values. The progress bar shows how close you are to the goal with current settings.',
      'Tip: combine with the Strategy tab to show a client the exact deposit amount needed to hit their target in 5 or 10 years.',
    ],
  },
  projectedRevenueModel: {
    title: 'Projected Revenue Model',
    body: [
      'Database Size = total contacts you can reach. Conversion Rate = percentage you expect to convert to clients. Together these calculate your estimated team size and total portfolio volume.',
      'Rebate Re-Use % — how much of their monthly diamond discount clients reinvest into new purchases. Higher re-use means faster portfolio growth and higher residual income for you.',
      'My Pool Parts = your share in the global bonus pool. The 36-month timeline shows how your passive income builds over time as the team compounds.',
    ],
  },
  sentLog: {
    title: 'Sent Log & Pipeline',
    body: [
      'Log every letter or outreach you send. Record the recipient\'s name, letter type, sent date, and an optional follow-up date to stay on top of your pipeline.',
      'Tap the outcome badge on any entry to cycle through the pipeline stages: Pending → Responded → Meeting → Converted → No Response. This gives you a live view of where each contact stands.',
      'Set a follow-up date to get an OVERDUE alert when the date has passed. Mark it Done once you have followed up. Overdue entries appear at the top in red so nothing slips through.',
    ],
  },
  strategySummary: {
    title: 'Strategy Summary',
    body: [
      'A snapshot of your full strategy: total invested, total discounts earned, final diamond value, and whether your monthly goal was reached.',
      'The ROI and Break-Even month show when your cumulative discounts cover your initial investment. After that point every discount is pure profit.',
      'Use this section to present the key numbers to a client in a clear, concise way before showing the full monthly table.',
    ],
  },
  companyMargin: {
    title: 'Company Margin Mechanics',
    body: [
      'Diamond Solution sources rough diamonds directly from mines at ~10% of retail price, cuts and certifies them in-house, and sells B2B globally at full market value.',
      'This vertical integration eliminates 5–6 middlemen (broker, exchange, wholesaler, distributor, retailer) who typically inflate the price by 700%.',
      'The margin created by cutting out the chain is what funds the monthly discount paid to investors — making the plan financially sustainable.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'Monthly Discount Schedule',
    body: [
      'This table shows every month of your strategy — your diamond balance, monthly discount earned, withdrawals taken, and cumulative totals.',
      'Switch between Monthly (row-by-row) and Yearly (annual summary) views. The yearly view is great for client presentations.',
      'Year-end rows are highlighted in amber. VIP activations, SP upgrades, and goal milestones are marked inline so you can see exactly when they happen.',
    ],
  },
  bannerToggle: {
    title: 'Maturity Banners',
    body: [
      'Green banners appear in the monthly table whenever a diamond batch reaches maturity — meaning its locked value is released and added to your active balance.',
      'After 12 months the contract is free: you can choose free delivery of your diamonds or receive 100% of your initial investment back.',
      'The number badge shows how many maturity events occur across your full strategy period.',
      'Toggle the button to hide or show all maturity banners. Hide them for a cleaner view; show them to explain the growth milestones to a client.',
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
      'USD — US Dollar (basisvaluta van Plan B)\nEUR — Euro (koers: 0,92)\nGBP — Brits Pond (koers: 0,79)\nAED — VAE Dirham (koers: 3,67)\nPHP — Filippijnse Peso (koers: 57,5)\nSGD — Singaporese Dollar (koers: 1,35)',
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
  assetGoalPlanner: {
    title: 'Vermogensdoelplanner',
    body: [
      'Voer de vermogenswaarde in die u wilt bereiken (bijv. $250.000). De planner berekent of uw startbedrag en maandelijkse stortingen u daar binnen het gekozen tijdsbestek brengen.',
      'Gebruik de snelkeuze-chips om naar veelgebruikte doelwaarden te springen. De voortgangsbalk toont hoe dicht u bij het doel bent met de huidige instellingen.',
      'Tip: combineer met het Strategie-tabblad om een klant het exacte stortingsbedrag te tonen dat nodig is om zijn doel in 5 of 10 jaar te bereiken.',
    ],
  },
  projectedRevenueModel: {
    title: 'Geprojecteerd inkomstenmodel',
    body: [
      'Databasegrootte = totaal aantal contacten dat u kunt bereiken. Conversiepercentage = percentage dat u verwacht te converteren. Samen berekenen deze uw geschatte teamgrootte en totale portefeuillewaarde.',
      'Korting Hergebruik % — hoeveel van hun maandelijkse diamantkorting klanten herinvesteren in nieuwe aankopen. Hoger hergebruik betekent snellere groei en hogere residuele inkomsten voor u.',
      'Mijn Pool Aandelen = uw aandeel in de globale bonuspool. De 36-maanden tijdlijn toont hoe uw passief inkomen opbouwt naarmate het team groeit.',
    ],
  },
  sentLog: {
    title: 'Verzonden log & pijplijn',
    body: [
      'Log elke brief of outreach die u verstuurt. Noteer de naam van de ontvanger, het type brief, de verzenddatum en optioneel een follow-updatum om uw pijplijn bij te houden.',
      'Tik op de uitkomst-badge van een item om door de pijplijnfasen te bladeren: In behandeling → Gereageerd → Vergadering → Geconverteerd → Geen reactie.',
      'Stel een follow-updatum in voor een ACHTERSTALLIG-melding zodra de datum verstreken is. Markeer als Klaar na opvolging. Achterstallige items verschijnen bovenaan in rood zodat niets wordt gemist.',
    ],
  },
    strategySummary: {
    title: 'Strategie Samenvatting',
    body: [
      'Een overzicht van uw volledige strategie: totaal geïnvesteerd, totale kortingen verdiend, eindwaarde diamanten en of uw maandelijkse doel is bereikt.',
      'De ROI en Break-Even maand tonen wanneer uw cumulatieve kortingen uw initiële investering dekken. Daarna is elke korting pure winst.',
      'Gebruik dit gedeelte om de kerncijfers op een duidelijke manier aan een klant te presenteren voordat u de volledige maandelijkse tabel toont.',
    ],
  },
  companyMargin: {
    title: 'Bedrijfsmarge Mechanisme',
    body: [
      'Diamond Solution koopt ruwe diamanten rechtstreeks bij mijnen voor ~10% van de winkelprijs, snijdt en certificeert intern, en verkoopt B2B wereldwijd tegen volledige marktwaarde.',
      'Deze verticale integratie elimineert 5–6 tussenpersonen die de prijs normaal met 700% opblazen.',
      'De marge die ontstaat door de keten te omzeilen financiert de maandelijkse korting die aan investeerders wordt betaald.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'Maandelijks Kortingsoverzicht',
    body: [
      'Deze tabel toont elke maand van uw strategie: diamantsaldo, verdiende maandelijkse korting, opnames en cumulatieve totalen.',
      'Schakel tussen Maandelijks en Jaarlijks overzicht. De jaarweergave is ideaal voor klantpresentaties.',
      'Jaareindregels zijn goudkleurig gemarkeerd. VIP-activeringen, SP-upgrades en mijlpalen zijn inline aangegeven.',
    ],
  },
  bannerToggle: {
    title: 'Rijpingsbanners',
    body: [
      'Groene banners verschijnen in de maandelijkse tabel wanneer een diamantbatch de rijping bereikt — de geblokkeerde waarde wordt vrijgegeven en toegevoegd aan uw actief saldo.',
      'Na 12 maanden is het contract gratis: u kunt kiezen voor gratis levering van uw diamanten of 100% van uw initiële investering terugkrijgen.',
      'Het getal toont hoeveel rijpingsgebeurtenissen er in uw volledige strategie plaatsvinden.',
      'Schakel de knop om alle rijpingsbanners te verbergen of te tonen. Verbergen voor een overzichtelijker beeld; tonen om groeimijlpalen aan een klant uit te leggen.',
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
      'USD — US-Dollar (Basiswährung von Plan B)\nEUR — Euro (Kurs: 0,92)\nGBP — Britisches Pfund (Kurs: 0,79)\nAED — VAE-Dirham (Kurs: 3,67)\nPHP — Philippinischer Peso (Kurs: 57,5)\nSGD — Singapur-Dollar (Kurs: 1,35)',
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
  assetGoalPlanner: {
    title: 'Vermögenszielplaner',
    body: [
      'Geben Sie den Vermögenswert ein, den Sie erreichen möchten (z.B. $250.000). Der Planer berechnet, ob Ihr Startbetrag und Ihre monatlichen Einzahlungen Sie innerhalb des gewählten Zeitrahmens dorthin bringen.',
      'Nutzen Sie die Schnellauswahl-Chips, um zu gängigen Zielwerten zu springen. Der Fortschrittsbalken zeigt, wie nah Sie dem Ziel mit den aktuellen Einstellungen sind.',
      'Tipp: Kombinieren Sie dies mit der Strategie-Registerkarte, um einem Kunden den genauen Einzahlungsbetrag zu zeigen, der benötigt wird, um sein Ziel in 5 oder 10 Jahren zu erreichen.',
    ],
  },
  projectedRevenueModel: {
    title: 'Prognoseeinnahmenmodell',
    body: [
      'Datenbankgröße = Gesamtzahl der Kontakte, die Sie erreichen können. Konversionsrate = Prozentsatz, den Sie voraussichtlich in Kunden umwandeln. Zusammen berechnen diese Ihre geschätzte Teamgröße und das Gesamtportfolievolumen.',
      'Rabatt-Wiederverwendung % — wie viel ihres monatlichen Diamantrabattes Kunden in neue Käufe reinvestieren. Höhere Wiederverwendung bedeutet schnelleres Portfoliowachstum und höhere Residualeinnahmen für Sie.',
      'Meine Pool-Anteile = Ihr Anteil am globalen Bonuspool. Die 36-Monats-Timeline zeigt, wie Ihr passives Einkommen wächst, während das Team wächst.',
    ],
  },
  sentLog: {
    title: 'Gesendetes Protokoll & Pipeline',
    body: [
      'Protokollieren Sie jeden Brief oder jede Kontaktaufnahme. Tragen Sie Namen, Brieftyp, Sendedatum und optional ein Nachfassdatum ein, um Ihre Pipeline im Blick zu behalten.',
      'Tippen Sie auf das Ergebnis-Badge eines Eintrags, um durch die Pipeline-Phasen zu wechseln: Ausstehend → Beantwortet → Meeting → Konvertiert → Keine Antwort.',
      'Setzen Sie ein Nachfassdatum, um eine ÜBERFÄLLIG-Warnung zu erhalten. Markieren Sie es als Erledigt nach dem Nachfassen. Überfällige Einträge erscheinen oben in Rot, damit nichts übersehen wird.',
    ],
  },
    strategySummary: {
    title: 'Strategie-Zusammenfassung',
    body: [
      'Ein Überblick über Ihre gesamte Strategie: Gesamtinvestition, erzielte Gesamtrabatte, finaler Diamantenwert und ob Ihr monatliches Ziel erreicht wurde.',
      'ROI und Break-Even-Monat zeigen, wann Ihre kumulierten Rabatte Ihre Anfangsinvestition decken. Danach ist jeder Rabatt reiner Gewinn.',
      'Nutzen Sie diesen Bereich, um einem Kunden die Kernzahlen klar zu präsentieren, bevor Sie die vollständige Monatstabelle zeigen.',
    ],
  },
  companyMargin: {
    title: 'Unternehmensmargen-Mechanismus',
    body: [
      'Diamond Solution bezieht Rohdiamanten direkt aus Minen für ~10% des Einzelhandelspreises, schleift und zertifiziert intern und verkauft B2B weltweit zum vollen Marktwert.',
      'Diese vertikale Integration eliminiert 5–6 Zwischenhändler, die den Preis normalerweise um 700% erhöhen.',
      'Die durch die Umgehung der Kette entstehende Marge finanziert die monatliche Vergütung der Investoren.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'Monatlicher Rabattplan',
    body: [
      'Diese Tabelle zeigt jeden Monat Ihrer Strategie: Diamantenguthaben, monatlicher Rabatt, Auszahlungen und kumulative Summen.',
      'Wechseln Sie zwischen Monatlicher und Jährlicher Ansicht. Die Jahresansicht eignet sich ideal für Kundenpräsentationen.',
      'Jahresabschlusszeilen sind gold markiert. VIP-Aktivierungen, SP-Upgrades und Meilensteine sind inline gekennzeichnet.',
    ],
  },
  bannerToggle: {
    title: 'Reife-Banner',
    body: [
      'Grüne Banner erscheinen in der Monatstabelle, wenn ein Diamantenpaket die Reife erreicht — der gesperrte Wert wird freigegeben und Ihrem aktiven Guthaben hinzugefügt.',
      'Nach 12 Monaten ist der Vertrag kostenlos: Sie können die kostenlose Lieferung Ihrer Diamanten wählen oder 100% Ihrer Anfangsinvestition zurückerhalten.',
      'Die Zahl zeigt, wie viele Reifeereignisse in Ihrer gesamten Strategie auftreten.',
      'Schalten Sie die Schaltfläche um, um alle Reife-Banner aus- oder einzublenden. Ausblenden für eine übersichtlichere Ansicht; einblenden, um die Wachstumsmeilensteine einem Kunden zu erklären.',
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
      'USD — Dollar américain (devise de base de Plan B)\nEUR — Euro (taux : 0,92)\nGBP — Livre sterling (taux : 0,79)\nAED — Dirham des EAU (taux : 3,67)\nPHP — Peso philippin (taux : 57,5)\nSGD — Dollar de Singapour (taux : 1,35)',
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
  assetGoalPlanner: {
    title: 'Planificateur d\'objectif patrimonial',
    body: [
      'Entrez la valeur patrimoniale que vous souhaitez atteindre (p.ex. 250 000 $). Le planificateur calcule si votre montant de départ et vos dépôts mensuels vous y amèneront dans le délai choisi.',
      'Utilisez les puces de sélection rapide pour accéder aux valeurs cibles courantes. La barre de progression indique votre proximité par rapport à l\'objectif avec les paramètres actuels.',
      'Conseil : combinez avec l\'onglet Stratégie pour montrer à un client le montant exact de dépôt nécessaire pour atteindre son objectif en 5 ou 10 ans.',
    ],
  },
  projectedRevenueModel: {
    title: 'Modèle de revenus projetés',
    body: [
      'Taille de la base de données = nombre total de contacts que vous pouvez atteindre. Taux de conversion = pourcentage que vous espérez convertir en clients. Ensemble ils calculent la taille estimée de votre équipe et le volume total du portefeuille.',
      'Réutilisation des remises % — quelle part de leur remise mensuelle sur les diamants les clients réinvestissent dans de nouveaux achats. Une réutilisation plus élevée signifie une croissance plus rapide et des revenus résiduels plus élevés pour vous.',
      'Mes parts de pool = votre part dans le pool de bonus mondial. La chronologie sur 36 mois montre comment vos revenus passifs s\'accumulent à mesure que l\'équipe se développe.',
    ],
  },
  sentLog: {
    title: 'Journal d\'envoi & pipeline',
    body: [
      'Enregistrez chaque lettre ou démarche envoyée. Notez le nom du destinataire, le type de lettre, la date d\'envoi et une date de suivi facultative pour garder le contrôle de votre pipeline.',
      'Appuyez sur le badge de résultat d\'une entrée pour faire défiler les étapes du pipeline : En attente → Répondu → Réunion → Converti → Sans réponse.',
      'Définissez une date de suivi pour recevoir une alerte EN RETARD lorsque la date est dépassée. Marquez-la Terminé après le suivi. Les entrées en retard apparaissent en rouge en haut de l\'écran.',
    ],
  },
    strategySummary: {
    title: 'Résumé de la Stratégie',
    body: [
      'Un aperçu de votre stratégie complète : total investi, remises totales gagnées, valeur finale des diamants et si votre objectif mensuel a été atteint.',
      'Le ROI et le mois de seuil de rentabilité indiquent quand vos remises cumulées couvrent votre investissement initial. Ensuite, chaque remise est du pur profit.',
      'Utilisez cette section pour présenter les chiffres clés à un client avant de montrer le tableau mensuel complet.',
    ],
  },
  companyMargin: {
    title: 'Mécanique des Marges',
    body: [
      'Diamond Solution source des diamants bruts directement des mines à ~10% du prix de détail, les taille et certifie en interne, et vend en B2B mondialement à pleine valeur marchande.',
      'Cette intégration verticale élimine 5 à 6 intermédiaires qui gonflent normalement le prix de 700%.',
      'La marge créée en court-circuitant la chaîne finance la remise mensuelle versée aux investisseurs.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'Calendrier de Remises Mensuelles',
    body: [
      'Ce tableau montre chaque mois de votre stratégie : solde en diamants, remise mensuelle gagnée, retraits et totaux cumulés.',
      'Basculez entre la vue Mensuelle et Annuelle. La vue annuelle est idéale pour les présentations clients.',
      'Les lignes de fin d\'année sont surlignées en or. Les activations VIP, mises à niveau SP et jalons sont indiqués en ligne.',
    ],
  },
  bannerToggle: {
    title: 'Bannières de Maturité',
    body: [
      'Des bannières vertes apparaissent dans le tableau mensuel lorsqu\'un lot de diamants atteint sa maturité — la valeur bloquée est libérée et ajoutée à votre solde actif.',
      'Après 12 mois, le contrat est gratuit : vous pouvez choisir la livraison gratuite de vos diamants ou récupérer 100% de votre investissement initial.',
      'Le badge numérique indique combien d\'événements de maturité surviennent dans toute votre période de stratégie.',
      'Appuyez sur le bouton pour masquer ou afficher toutes les bannières de maturité. Masquez-les pour une vue épurée ; affichez-les pour expliquer les jalons de croissance à un client.',
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
      'USD — Dólar estadounidense (moneda base de Plan B)\nEUR — Euro (tasa: 0,92)\nGBP — Libra esterlina (tasa: 0,79)\nAED — Dírham de EAU (tasa: 3,67)\nPHP — Peso filipino (tasa: 57,5)\nSGD — Dólar de Singapur (tasa: 1,35)',
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
  assetGoalPlanner: {
    title: 'Planificador de metas de activos',
    body: [
      'Introduce el valor de activo que deseas alcanzar (p.ej. $250,000). El planificador calcula si tu cantidad inicial y los depósitos mensuales te llevarán allí dentro del plazo elegido.',
      'Usa los chips de selección rápida para saltar a valores objetivo comunes. La barra de progreso muestra lo cerca que estás de la meta con la configuración actual.',
      'Consejo: combina con la pestaña Estrategia para mostrar a un cliente el monto exacto de depósito necesario para alcanzar su objetivo en 5 o 10 años.',
    ],
  },
  projectedRevenueModel: {
    title: 'Modelo de ingresos proyectados',
    body: [
      'Tamaño de base de datos = total de contactos a los que puedes llegar. Tasa de conversión = porcentaje que esperas convertir en clientes. Juntos calculan el tamaño estimado de tu equipo y el volumen total de cartera.',
      'Reutilización de descuento % — qué parte del descuento mensual en diamantes los clientes reinvierten en nuevas compras. Mayor reutilización significa crecimiento más rápido de la cartera e ingresos residuales más altos para ti.',
      'Mis partes de pool = tu participación en el pool de bonos global. La línea de tiempo de 36 meses muestra cómo crecen tus ingresos pasivos a medida que el equipo se capitaliza.',
    ],
  },
  sentLog: {
    title: 'Registro enviado y canal',
    body: [
      'Registra cada carta o comunicación enviada. Anota el nombre del destinatario, el tipo de carta, la fecha de envío y opcionalmente una fecha de seguimiento para controlar tu canal.',
      'Toca el badge de resultado de una entrada para avanzar por las etapas del canal: Pendiente → Respondió → Reunión → Convertido → Sin respuesta.',
      'Establece una fecha de seguimiento para recibir una alerta de VENCIDO cuando la fecha haya pasado. Márcalo como Hecho tras el seguimiento. Las entradas vencidas aparecen en rojo en la parte superior.',
    ],
  },
    strategySummary: {
    title: 'Resumen de Estrategia',
    body: [
      'Un resumen de su estrategia completa: total invertido, descuentos totales ganados, valor final de diamantes y si se alcanzó su objetivo mensual.',
      'El ROI y el mes de equilibrio muestran cuándo sus descuentos acumulados cubren su inversión inicial. A partir de ahí, cada descuento es ganancia pura.',
      'Use esta sección para presentar las cifras clave a un cliente antes de mostrar la tabla mensual completa.',
    ],
  },
  companyMargin: {
    title: 'Mecánica del Margen Empresarial',
    body: [
      'Diamond Solution obtiene diamantes en bruto directamente de minas al ~10% del precio minorista, los talla y certifica internamente, y vende B2B globalmente al valor de mercado completo.',
      'Esta integración vertical elimina 5–6 intermediarios que normalmente inflan el precio un 700%.',
      'El margen generado al eliminar la cadena financia el descuento mensual pagado a los inversores.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'Calendario de Descuentos Mensuales',
    body: [
      'Esta tabla muestra cada mes de su estrategia: saldo en diamantes, descuento mensual ganado, retiros y totales acumulados.',
      'Cambie entre las vistas Mensual y Anual. La vista anual es ideal para presentaciones a clientes.',
      'Las filas de fin de año están resaltadas en ámbar. Las activaciones VIP, actualizaciones SP y hitos se marcan en línea.',
    ],
  },
  bannerToggle: {
    title: 'Pancartas de Madurez',
    body: [
      'Las pancartas verdes aparecen en la tabla mensual cuando un lote de diamantes alcanza la madurez — el valor bloqueado se libera y se añade a su saldo activo.',
      'Después de 12 meses el contrato es gratuito: puede elegir la entrega gratuita de sus diamantes o recibir el 100% de su inversión inicial de vuelta.',
      'El número muestra cuántos eventos de madurez ocurren durante todo su período de estrategia.',
      'Pulse el botón para ocultar o mostrar todas las pancartas de madurez. Ocúltelas para una vista más limpia; muéstrelas para explicar los hitos de crecimiento a un cliente.',
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
      'USD — Dollaro USA (valuta base di Plan B)\nEUR — Euro (tasso: 0,92)\nGBP — Sterlina britannica (tasso: 0,79)\nAED — Dirham degli EAU (tasso: 3,67)\nPHP — Peso filippino (tasso: 57,5)\nSGD — Dollaro di Singapore (tasso: 1,35)',
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
  assetGoalPlanner: {
    title: 'Pianificatore obiettivi patrimoniali',
    body: [
      'Inserisci il valore patrimoniale che vuoi raggiungere (es. $250.000). Il pianificatore calcola se il tuo importo iniziale e i depositi mensili ti porteranno lì entro il periodo scelto.',
      'Usa i chip di selezione rapida per passare ai valori target comuni. La barra di avanzamento mostra quanto sei vicino all\'obiettivo con le impostazioni attuali.',
      'Suggerimento: combina con la scheda Strategia per mostrare a un cliente l\'importo esatto del deposito necessario per raggiungere il suo obiettivo in 5 o 10 anni.',
    ],
  },
  projectedRevenueModel: {
    title: 'Modello di entrate proiettate',
    body: [
      'Dimensione database = totale contatti raggiungibili. Tasso di conversione = percentuale che prevedi di convertire in clienti. Insieme calcolano la dimensione stimata del team e il volume totale del portafoglio.',
      'Riutilizzo rimborso % — quanta parte del loro sconto mensile sui diamanti i clienti reinvestono in nuovi acquisti. Maggiore riutilizzo significa crescita più rapida del portafoglio e entrate residue più alte per te.',
      'Mie parti del pool = la tua quota nel pool di bonus globale. La timeline di 36 mesi mostra come il tuo reddito passivo cresce man mano che il team si sviluppa.',
    ],
  },
  sentLog: {
    title: 'Registro inviato e pipeline',
    body: [
      'Registra ogni lettera o comunicazione inviata. Inserisci il nome del destinatario, il tipo di lettera, la data di invio e facoltativamente una data di follow-up per gestire la tua pipeline.',
      'Tocca il badge risultato di una voce per scorrere le fasi della pipeline: In attesa → Risposto → Riunione → Convertito → Nessuna risposta.',
      'Imposta una data di follow-up per ricevere un avviso IN SCADENZA quando la data è superata. Contrassegnala come Fatto dopo il follow-up. Le voci scadute appaiono in rosso in cima alla schermata.',
    ],
  },
    strategySummary: {
    title: 'Riepilogo Strategia',
    body: [
      'Una panoramica della tua strategia completa: totale investito, sconti totali guadagnati, valore finale dei diamanti e se l\'obiettivo mensile è stato raggiunto.',
      'Il ROI e il mese di pareggio mostrano quando gli sconti cumulativi coprono l\'investimento iniziale. Da quel punto ogni sconto è puro profitto.',
      'Usa questa sezione per presentare i numeri chiave a un cliente prima di mostrare la tabella mensile completa.',
    ],
  },
  companyMargin: {
    title: 'Meccanismo del Margine Aziendale',
    body: [
      'Diamond Solution acquista diamanti grezzi direttamente dalle miniere a ~10% del prezzo al dettaglio, li lavora e certifica internamente, e vende B2B globalmente al pieno valore di mercato.',
      'Questa integrazione verticale elimina 5–6 intermediari che normalmente gonfiano il prezzo del 700%.',
      'Il margine creato eliminando la catena finanzia lo sconto mensile pagato agli investitori.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'Piano Sconti Mensili',
    body: [
      'Questa tabella mostra ogni mese della tua strategia: saldo diamanti, sconto mensile guadagnato, prelievi e totali cumulativi.',
      'Passa tra la vista Mensile e Annuale. La vista annuale è ideale per le presentazioni ai clienti.',
      'Le righe di fine anno sono evidenziate in ambra. Le attivazioni VIP, aggiornamenti SP e traguardi sono indicati in linea.',
    ],
  },
  bannerToggle: {
    title: 'Banner di Maturazione',
    body: [
      'I banner verdi appaiono nella tabella mensile quando un lotto di diamanti raggiunge la maturazione — il valore bloccato viene rilasciato e aggiunto al tuo saldo attivo.',
      'Dopo 12 mesi il contratto è gratuito: puoi scegliere la consegna gratuita dei tuoi diamanti o ricevere il 100% del tuo investimento iniziale.',
      'Il numero mostra quanti eventi di maturazione si verificano nell\'intero periodo della strategia.',
      'Premi il pulsante per nascondere o mostrare tutti i banner di maturazione. Nascondili per una vista più pulita; mostrali per spiegare i traguardi di crescita a un cliente.',
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
      'USD — Dólar americano (moeda base do Plan B)\nEUR — Euro (taxa: 0,92)\nGBP — Libra esterlina (taxa: 0,79)\nAED — Dirham dos EAU (taxa: 3,67)\nPHP — Peso filipino (taxa: 57,5)\nSGD — Dólar de Singapura (taxa: 1,35)',
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
  assetGoalPlanner: {
    title: 'Planejador de metas de ativos',
    body: [
      'Insira o valor do ativo que deseja alcançar (ex. $250.000). O planejador calcula se o seu valor inicial e os depósitos mensais vão te levar lá dentro do prazo escolhido.',
      'Use os chips de seleção rápida para pular para valores de meta comuns. A barra de progresso mostra o quão perto você está da meta com as configurações atuais.',
      'Dica: combine com a aba Estratégia para mostrar a um cliente o valor exato de depósito necessário para atingir seu objetivo em 5 ou 10 anos.',
    ],
  },
  projectedRevenueModel: {
    title: 'Modelo de receita projetada',
    body: [
      'Tamanho do banco de dados = total de contatos que você pode alcançar. Taxa de conversão = porcentagem que você espera converter em clientes. Juntos calculam o tamanho estimado da equipe e o volume total da carteira.',
      'Reutilização de desconto % — quanto do desconto mensal em diamantes os clientes reinvestem em novas compras. Maior reutilização significa crescimento mais rápido da carteira e receita residual mais alta para você.',
      'Minhas partes no pool = sua participação no pool de bônus global. A linha do tempo de 36 meses mostra como sua renda passiva cresce à medida que a equipe se capitaliza.',
    ],
  },
  sentLog: {
    title: 'Registro enviado e pipeline',
    body: [
      'Registre cada carta ou contato enviado. Anote o nome do destinatário, tipo de carta, data de envio e opcionalmente uma data de acompanhamento para gerenciar seu pipeline.',
      'Toque no badge de resultado de uma entrada para avançar pelas etapas do pipeline: Pendente → Respondeu → Reunião → Convertido → Sem resposta.',
      'Defina uma data de acompanhamento para receber um alerta de ATRASADO quando a data passar. Marque como Concluído após o acompanhamento. Entradas atrasadas aparecem em vermelho no topo da tela.',
    ],
  },
    strategySummary: {
    title: 'Resumo da Estratégia',
    body: [
      'Uma visão geral da sua estratégia completa: total investido, descontos totais ganhos, valor final dos diamantes e se o seu objetivo mensal foi atingido.',
      'O ROI e o mês de equilíbrio mostram quando os seus descontos acumulados cobrem o investimento inicial. A partir daí, cada desconto é lucro puro.',
      'Use esta secção para apresentar os números-chave a um cliente antes de mostrar a tabela mensal completa.',
    ],
  },
  companyMargin: {
    title: 'Mecânica da Margem Empresarial',
    body: [
      'A Diamond Solution obtém diamantes brutos diretamente das minas a ~10% do preço de retalho, corta e certifica internamente, e vende B2B globalmente ao valor de mercado completo.',
      'Esta integração vertical elimina 5 a 6 intermediários que normalmente inflacionam o preço em 700%.',
      'A margem criada ao eliminar a cadeia financia o desconto mensal pago aos investidores.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'Calendário de Descontos Mensais',
    body: [
      'Esta tabela mostra cada mês da sua estratégia: saldo em diamantes, desconto mensal ganho, levantamentos e totais acumulados.',
      'Alterne entre a vista Mensal e Anual. A vista anual é ideal para apresentações a clientes.',
      'As linhas de fim de ano estão destacadas em âmbar. Ativações VIP, atualizações SP e marcos são indicados em linha.',
    ],
  },
  bannerToggle: {
    title: 'Banners de Maturidade',
    body: [
      'Banners verdes aparecem na tabela mensal quando um lote de diamantes atinge a maturidade — o valor bloqueado é liberado e adicionado ao seu saldo ativo.',
      'Após 12 meses o contrato é gratuito: pode escolher a entrega gratuita dos seus diamantes ou receber 100% do seu investimento inicial de volta.',
      'O número indica quantos eventos de maturidade ocorrem em todo o período da sua estratégia.',
      'Pressione o botão para ocultar ou mostrar todos os banners de maturidade. Oculte-os para uma vista mais limpa; mostre-os para explicar os marcos de crescimento a um cliente.',
    ],
  },
};

const ru: TipMap = {
  monthlyGoal: {
    title: 'Ежемесячная цель',
    body: [
      'Ваша персональная цель по продажам на этот месяц.',
      'Отслеживайте прогресс в режиме реального времени с помощью индикатора выполнения.',
      'Обновите цель в Настройках профиля (⚙) в любое время.',
    ],
  },
  clientNameSaving: {
    title: 'Сохранение имени клиента',
    body: [
      'Имя автоматически сохраняется по мере ввода.',
      'Не нужно нажимать кнопку «Сохранить» — изменения фиксируются мгновенно.',
      'Используйте читаемое имя для удобной идентификации в истории и экспорте.',
    ],
  },
  vipStatus: {
    title: 'VIP-статус клиента',
    body: [
      'Статусы: новый → активный → VIP → лидер → легенда.',
      'Статус обновляется автоматически на основе активности клиента.',
      'VIP-клиенты отображаются отдельно для быстрого доступа.',
    ],
  },
  startAmount: {
    title: 'Начальная сумма',
    body: [
      'Сумма первоначального вложения клиента.',
      'Используется как база для расчёта ребейтов и роста.',
      'Можно обновить в любое время при изменении условий.',
    ],
  },
  strategyDuration: {
    title: 'Срок стратегии',
    body: [
      'Общий планируемый срок инвестиционной стратегии в месяцах.',
      'Определяет горизонт расчёта и ожидаемые выплаты.',
      'Можно скорректировать под нужды клиента.',
    ],
  },
  monthlyDeposit: {
    title: 'Ежемесячный взнос',
    body: [
      'Регулярная ежемесячная сумма, вносимая клиентом.',
      'Учитывается в прогнозе накоплений и росте.',
      'Оставьте 0 для единовременных инвестиций без пополнений.',
    ],
  },
  annualBonus: {
    title: 'Годовой бонус',
    body: [
      'Дополнительная сумма, вносимая клиентом раз в год.',
      'Добавляется поверх ежемесячных взносов.',
      'Полезно для расчёта крупных единовременных пополнений.',
    ],
  },
  fixedWithdrawal: {
    title: 'Фиксированное снятие',
    body: [
      'Регулярная ежемесячная сумма вывода из портфеля.',
      'Используется для расчёта устойчивости стратегии вывода.',
      'Оставьте 0, если снятий не планируется.',
    ],
  },
  outPercentage: {
    title: 'Процент вывода',
    body: [
      'Ежемесячный процент от баланса для вывода.',
      'Альтернатива фиксированной сумме вывода.',
      'Полезно для расчёта гибких стратегий вывода.',
    ],
  },
  activeCompounding: {
    title: 'Активное реинвестирование',
    body: [
      'При включении ребейты реинвестируются обратно в портфель.',
      'Это ускоряет рост за счёт эффекта сложного процента.',
      'При отключении ребейты выплачиваются в виде наличных.',
    ],
  },
  reverseCalculator: {
    title: 'Обратный калькулятор',
    body: [
      'Задайте целевой ежемесячный доход и срок — калькулятор рассчитает необходимую начальную сумму.',
      'Удобно для планирования «от цели».',
      'Результаты автоматически подставляются в основной сценарий.',
    ],
  },
  calcHistory: {
    title: 'История расчётов',
    body: [
      'Журнал всех расчётов по текущему клиенту.',
      'Сравнивайте сценарии и отслеживайте изменения стратегии.',
      'Экспортируйте в PDF для предоставления клиенту.',
    ],
  },
  currencyDisplay: {
    title: 'Отображение валюты',
    body: [
      'Выберите валюту для отображения сумм.',
      'Не влияет на расчёты — только на форматирование.',
      'Настраивается индивидуально для каждого клиента.',
    ],
  },
  pdfExport: {
    title: 'Экспорт в PDF',
    body: [
      'Создайте профессиональный PDF-отчёт по текущему сценарию.',
      'Включает графики, таблицы и сводку.',
      'Готов к отправке клиенту.',
    ],
  },
  createLetter: {
    title: 'Создать письмо',
    body: [
      'Создайте персонализированное письмо клиенту на основе текущего сценария.',
      'Шаблон автоматически заполняется данными расчёта.',
      'Редактируйте и отправляйте прямо из приложения.',
    ],
  },
  scenarioChart: {
    title: 'График сценария',
    body: [
      'Визуализация роста портфеля с течением времени.',
      'Отображает баланс, взносы и ребейты по месяцам.',
      'Нажмите на точку для детальной информации.',
    ],
  },
  compareMode: {
    title: 'Режим сравнения',
    body: [
      'Сравните несколько сценариев для одного клиента рядом.',
      'Используйте для демонстрации различных стратегий.',
      'Экспортируйте сравнение в PDF.',
    ],
  },
  rankTiers: {
    title: 'Уровни ранга',
    body: [
      'Ваш текущий ранг и условия перехода на следующий уровень.',
      'Ранг определяет процент комиссии и бонусы.',
      'Отслеживайте прогресс в реальном времени.',
    ],
  },
  partnerList: {
    title: 'Список партнёров',
    body: [
      'Все партнёры в вашей сети с их статусами.',
      'Отслеживайте активность и объёмы команды.',
      'Нажмите на партнёра для детальной информации.',
    ],
  },
  commissionEstimator: {
    title: 'Калькулятор комиссии',
    body: [
      'Рассчитайте ожидаемый доход на основе объёмов.',
      'Включает личные продажи и командные бонусы.',
      'Обновляется автоматически при изменении данных.',
    ],
  },
  invitationVideos: {
    title: 'Видео-приглашения',
    body: [
      'Видеоматериалы для знакомства потенциальных клиентов с продуктом.',
      'Поделитесь ссылкой или отправьте прямо из приложения.',
      'Регулярно обновляются командой.',
    ],
  },
  adviserVideos: {
    title: 'Видео для консультантов',
    body: [
      'Учебные материалы и обновления для консультантов.',
      'Смотрите новые видео для повышения квалификации.',
      'Помечайте просмотренные для удобного отслеживания.',
    ],
  },
  lettersHub: {
    title: 'Центр писем',
    body: [
      'Создавайте и управляйте персонализированными письмами для клиентов.',
      'Журнал отправок — отслеживайте кому, что и когда отправлено.',
      'Настройка профиля (⚙) — добавьте имя, компанию и логотип для автозаполнения.',
    ],
  },
  assetGoalPlanner: {
    title: 'Планировщик целевых активов',
    body: [
      'Введите целевую стоимость активов (например, $250 000). Планировщик рассчитывает, достигнет ли ваша начальная сумма и ежемесячные взносы этой цели в выбранные сроки.',
      'Используйте быстрые чипы для выбора распространённых целевых значений. Индикатор прогресса показывает, насколько близко вы к цели при текущих настройках.',
      'Совет: сочетайте с вкладкой «Стратегия», чтобы показать клиенту точную сумму депозита для достижения цели за 5 или 10 лет.',
    ],
  },
  projectedRevenueModel: {
    title: 'Прогнозируемая модель доходов',
    body: [
      'Размер базы данных = общее количество контактов. Коэффициент конверсии = процент, который вы ожидаете превратить в клиентов. Вместе они рассчитывают предполагаемый размер команды и общий объём портфеля.',
      'Повторное использование скидки % — какую часть ежемесячной скидки на алмазы клиенты реинвестируют в новые покупки. Более высокий показатель означает более быстрый рост портфеля и более высокий остаточный доход для вас.',
      'Мои доли в пуле = ваша доля в глобальном бонусном пуле. График на 36 месяцев показывает, как растёт ваш пассивный доход по мере роста команды.',
    ],
  },
  sentLog: {
    title: 'Журнал отправленных и воронка',
    body: [
      'Фиксируйте каждое отправленное письмо или обращение. Укажите имя получателя, тип письма, дату отправки и при необходимости дату напоминания для контроля воронки.',
      'Нажмите на значок результата записи, чтобы переключаться по этапам воронки: Ожидание → Ответил → Встреча → Конвертирован → Нет ответа.',
      'Установите дату напоминания, чтобы получить предупреждение ПРОСРОЧЕНО. Отметьте как Выполнено после контакта. Просроченные записи отображаются вверху в красном цвете.',
    ],
  },
    strategySummary: {
    title: 'Сводка Стратегии',
    body: [
      'Обзор всей вашей стратегии: общая сумма инвестиций, заработанные скидки, итоговая стоимость алмазов и достигнута ли ежемесячная цель.',
      'ROI и месяц окупаемости показывают, когда накопленные скидки покрывают начальные инвестиции. После этого каждая скидка — чистая прибыль.',
      'Используйте этот раздел для представления ключевых показателей клиенту перед показом полной таблицы.',
    ],
  },
  companyMargin: {
    title: 'Механика Маржи Компании',
    body: [
      'Diamond Solution закупает необработанные алмазы напрямую с месторождений по ~10% розничной цены, обрабатывает и сертифицирует внутри, продаёт B2B по полной рыночной стоимости.',
      'Вертикальная интеграция устраняет 5–6 посредников, которые обычно повышают цену на 700%.',
      'Маржа от сокращения цепочки финансирует ежемесячные скидки инвесторам.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'График Ежемесячных Скидок',
    body: [
      'Таблица показывает каждый месяц стратегии: баланс алмазов, заработанная скидка, выплаты и накопленные итоги.',
      'Переключайтесь между ежемесячным и годовым видом. Годовой вид идеален для презентаций клиентам.',
      'Строки конца года выделены золотым. Активации VIP, обновления SP и вехи отмечены в таблице.',
    ],
  },
  bannerToggle: {
    title: 'Баннеры созревания',
    body: [
      'Зелёные баннеры появляются в месячной таблице, когда партия алмазов достигает созревания — заблокированная стоимость освобождается и добавляется к активному балансу.',
      'После 12 месяцев контракт становится бесплатным: вы можете выбрать бесплатную доставку алмазов или получить 100% начальной инвестиции обратно.',
      'Число показывает, сколько событий созревания происходит за весь период стратегии.',
      'Нажмите кнопку, чтобы скрыть или показать все баннеры созревания. Скрывайте для чистого вида; показывайте, чтобы объяснить вехи роста клиенту.',
    ],
  },
};

const zh: TipMap = {
  monthlyGoal: {
    title: '月度目标',
    body: [
      '本月的个人销售目标。',
      '通过进度条实时跟踪完成情况。',
      '随时在个人资料设置(⚙)中更新目标。',
    ],
  },
  clientNameSaving: {
    title: '客户名称保存',
    body: [
      '输入时自动保存名称。',
      '无需点击"保存"按钮，更改即时生效。',
      '使用易读的名称，方便在历史记录和导出中识别。',
    ],
  },
  vipStatus: {
    title: '客户VIP状态',
    body: [
      '状态：新客户 → 活跃 → VIP → 领导者 → 传奇。',
      '根据客户活动自动更新状态。',
      'VIP客户单独显示，方便快速访问。',
    ],
  },
  startAmount: {
    title: '初始金额',
    body: [
      '客户的初始投资金额。',
      '用作计算回扣和增长的基础。',
      '条件变化时可随时更新。',
    ],
  },
  strategyDuration: {
    title: '策略期限',
    body: [
      '投资策略的总计划月数。',
      '决定计算范围和预期支出。',
      '可根据客户需求调整。',
    ],
  },
  monthlyDeposit: {
    title: '每月存款',
    body: [
      '客户每月定期存入的金额。',
      '计入储蓄预测和增长中。',
      '无月供投资请填0。',
    ],
  },
  annualBonus: {
    title: '年度奖金',
    body: [
      '客户每年额外存入的金额。',
      '在月度存款基础上叠加。',
      '适用于计算大额一次性存款。',
    ],
  },
  fixedWithdrawal: {
    title: '固定提款',
    body: [
      '每月从投资组合中定期提取的金额。',
      '用于计算提款策略的可持续性。',
      '如不提款请填0。',
    ],
  },
  outPercentage: {
    title: '提款比例',
    body: [
      '每月从余额中提取的百分比。',
      '固定提款金额的替代方案。',
      '适用于灵活提款策略计算。',
    ],
  },
  activeCompounding: {
    title: '主动复利',
    body: [
      '启用时，回扣将再投资回投资组合。',
      '通过复利效应加速增长。',
      '禁用时，回扣以现金形式支付。',
    ],
  },
  reverseCalculator: {
    title: '反向计算器',
    body: [
      '设定目标月收入和期限，计算器将计算所需初始金额。',
      '便于"目标导向"规划。',
      '结果自动填入主要场景。',
    ],
  },
  calcHistory: {
    title: '计算历史',
    body: [
      '当前客户的所有计算记录。',
      '比较场景并跟踪策略变化。',
      '导出为PDF供客户参考。',
    ],
  },
  currencyDisplay: {
    title: '货币显示',
    body: [
      '选择金额显示的货币。',
      '不影响计算，仅影响格式。',
      '可为每个客户单独设置。',
    ],
  },
  pdfExport: {
    title: 'PDF导出',
    body: [
      '为当前场景生成专业PDF报告。',
      '包含图表、表格和摘要。',
      '可直接发送给客户。',
    ],
  },
  createLetter: {
    title: '创建信函',
    body: [
      '根据当前场景为客户创建个性化信函。',
      '模板自动填入计算数据。',
      '可在应用内编辑和发送。',
    ],
  },
  scenarioChart: {
    title: '场景图表',
    body: [
      '投资组合随时间增长的可视化。',
      '按月显示余额、存款和回扣。',
      '点击数据点查看详细信息。',
    ],
  },
  compareMode: {
    title: '比较模式',
    body: [
      '并排比较同一客户的多个场景。',
      '用于展示不同策略。',
      '可将比较结果导出为PDF。',
    ],
  },
  rankTiers: {
    title: '等级层次',
    body: [
      '您的当前等级及晋升下一级的条件。',
      '等级决定佣金比例和奖金。',
      '实时跟踪进度。',
    ],
  },
  partnerList: {
    title: '合作伙伴列表',
    body: [
      '您网络中所有合作伙伴及其状态。',
      '跟踪团队活动和业绩。',
      '点击合作伙伴查看详细信息。',
    ],
  },
  commissionEstimator: {
    title: '佣金估算器',
    body: [
      '根据业绩计算预期收入。',
      '包含个人销售和团队奖金。',
      '数据变化时自动更新。',
    ],
  },
  invitationVideos: {
    title: '邀请视频',
    body: [
      '向潜在客户介绍产品的视频资料。',
      '可分享链接或直接从应用发送。',
      '由团队定期更新。',
    ],
  },
  adviserVideos: {
    title: '顾问视频',
    body: [
      '顾问培训资料和更新。',
      '观看新视频提升专业技能。',
      '标记已看视频方便跟踪。',
    ],
  },
  lettersHub: {
    title: '信函中心',
    body: [
      '为客户创建和管理个性化信函。',
      '发送记录 — 跟踪发送对象、回复和后续跟进安排。',
      '个人资料设置(⚙) — 添加姓名、公司和徽标以自动填写每封信。',
    ],
  },
  assetGoalPlanner: {
    title: '资产目标规划器',
    body: [
      '输入您想要达到的资产价值（例如$250,000）。规划器会计算您的起始金额和每月存款是否能在所选时间范围内实现该目标。',
      '使用快速选择芯片跳转到常用目标值。进度条显示在当前设置下您距目标有多近。',
      '提示：结合策略选项卡，向客户展示在5年或10年内达到目标所需的确切存款金额。',
    ],
  },
  projectedRevenueModel: {
    title: '预计收入模型',
    body: [
      '数据库大小=您可以联系到的总联系人数。转化率=您预计转化为客户的百分比。两者共同计算您的预计团队规模和总投资组合量。',
      '折扣再利用%—客户每月将多少钻石折扣再投资于新购买。再利用率越高意味着投资组合增长越快，您的被动收入越高。',
      '我的矿池份额=您在全球奖金池中的份额。36个月时间线显示随着团队增长，您的被动收入如何积累。',
    ],
  },
  sentLog: {
    title: '已发送日志与管道',
    body: [
      '记录每封发送的信件或联络。填写收件人姓名、信件类型、发送日期，以及可选的跟进日期，以掌控您的业务管道。',
      '点击任意条目的结果标签，在管道阶段间循环切换：待处理 → 已回复 → 会议 → 已转化 → 无回应。',
      '设置跟进日期，当日期过后将收到逾期警告。跟进完成后标记为已完成。逾期条目以红色显示在屏幕顶部，确保不遗漏任何事项。',
    ],
  },
    strategySummary: {
    title: '策略摘要',
    body: [
      '您完整策略的快照：总投资额、赚取的总折扣、最终钻石价值，以及是否达到了每月目标。',
      'ROI和保本月份显示累计折扣何时覆盖初始投资。此后每笔折扣都是纯利润。',
      '在展示完整月度表格之前，使用此部分向客户清晰呈现关键数据。',
    ],
  },
  companyMargin: {
    title: '公司利润机制',
    body: [
      'Diamond Solution直接从矿山以约零售价10%的价格采购原钻，在内部切割和认证，并以完整市场价值在全球B2B销售。',
      '这种垂直整合消除了通常将价格抬高700%的5-6个中间商。',
      '通过绕过供应链产生的利润资助支付给投资者的每月折扣。',
    ],
  },
  monthlyDiscountSchedule: {
    title: '月度折扣计划',
    body: [
      '此表格显示您策略的每个月：钻石余额、赚取的月度折扣、提款和累计总额。',
      '在月度和年度视图之间切换。年度视图非常适合客户演示。',
      '年末行以琥珀色突出显示。VIP激活、SP升级和里程碑在表中标注。',
    ],
  },
  bannerToggle: {
    title: '成熟度横幅',
    body: [
      '当一批钻石达到成熟期时，月度表格中会出现绿色横幅——锁定的价值被释放并添加到您的活跃余额中。',
      '12个月后合同免费：您可以选择免费配送您的钻石，或收回100%的初始投资。',
      '数字徽章显示在您整个策略期间发生多少个成熟事件。',
      '点击按钮可隐藏或显示所有成熟度横幅。隐藏可获得更清晰的视图；显示可向客户解释增长里程碑。',
    ],
  },
};

const tl: TipMap = {
  monthlyGoal: {
    title: 'Buwanang Target',
    body: [
      'Ang iyong personal na target sa benta para sa buwang ito.',
      'Subaybayan ang progreso sa real-time gamit ang progress bar.',
      'I-update ang target anumang oras sa Profile Settings (⚙).',
    ],
  },
  clientNameSaving: {
    title: 'Pag-save ng Pangalan ng Kliyente',
    body: [
      'Awtomatikong sine-save ang pangalan habang nagta-type.',
      'Hindi na kailangang pindutin ang "I-save" — agad na nai-record ang mga pagbabago.',
      'Gumamit ng nababasang pangalan para sa madaling pagkilala sa kasaysayan at pag-export.',
    ],
  },
  vipStatus: {
    title: 'VIP Status ng Kliyente',
    body: [
      'Mga status: bago → aktibo → VIP → lider → alamat.',
      'Awtomatikong ina-update ang status batay sa aktibidad ng kliyente.',
      'Ang mga VIP na kliyente ay hiwalay na ipinapakita para sa mabilis na access.',
    ],
  },
  startAmount: {
    title: 'Panimulang Halaga',
    body: [
      'Ang paunang halaga ng investment ng kliyente.',
      'Ginagamit bilang base para sa pagkalkula ng rebate at paglago.',
      'Maaaring i-update anumang oras kung magbabago ang mga kondisyon.',
    ],
  },
  strategyDuration: {
    title: 'Tagal ng Estratehiya',
    body: [
      'Ang kabuuang nakaplanong buwan ng investment strategy.',
      'Tinutukoy ang saklaw ng kalkulasyon at inaasahang kita.',
      'Maaaring i-adjust ayon sa pangangailangan ng kliyente.',
    ],
  },
  monthlyDeposit: {
    title: 'Buwanang Deposito',
    body: [
      'Ang regular na buwanang halaga na idinedeposito ng kliyente.',
      'Kasama sa forecast ng ipon at paglago.',
      'Mag-iwan ng 0 para sa isang beses na investment na walang dagdag na deposito.',
    ],
  },
  annualBonus: {
    title: 'Taunang Bonus',
    body: [
      'Karagdagang halaga na idinedeposito ng kliyente taon-taon.',
      'Idinaragdag sa ibabaw ng buwanang deposito.',
      'Kapaki-pakinabang para sa pagkalkula ng malalaking isang beses na deposito.',
    ],
  },
  fixedWithdrawal: {
    title: 'Nakapirming Withdrawal',
    body: [
      'Regular na buwanang halaga na inaalis mula sa portfolio.',
      'Ginagamit para kalkulahin ang sustainability ng withdrawal strategy.',
      'Mag-iwan ng 0 kung walang withdrawal na nakaplanong.',
    ],
  },
  outPercentage: {
    title: 'Porsyento ng Withdrawal',
    body: [
      'Buwanang porsyento ng balanse na awi-withdraw.',
      'Alternatibo sa nakapirming halaga ng withdrawal.',
      'Kapaki-pakinabang para sa flexible na withdrawal strategy.',
    ],
  },
  activeCompounding: {
    title: 'Aktibong Compounding',
    body: [
      'Kapag naka-on, ang mga rebate ay nire-reinvest pabalik sa portfolio.',
      'Pabibilisin ang paglago sa pamamagitan ng compound effect.',
      'Kapag naka-off, ang mga rebate ay ibinibigay bilang cash.',
    ],
  },
  reverseCalculator: {
    title: 'Reverse Calculator',
    body: [
      'Itakda ang target na buwanang kita at tagal — kakalkulahin ng calculator ang kinakailangang panimulang halaga.',
      'Kapaki-pakinabang para sa pagpaplano na "mula sa layunin".',
      'Awtomatikong nalalapat ang mga resulta sa pangunahing scenario.',
    ],
  },
  calcHistory: {
    title: 'Kasaysayan ng Kalkulasyon',
    body: [
      'Log ng lahat ng kalkulasyon para sa kasalukuyang kliyente.',
      'Ikumpara ang mga scenario at subaybayan ang mga pagbabago sa estratehiya.',
      'I-export sa PDF para ibahagi sa kliyente.',
    ],
  },
  currencyDisplay: {
    title: 'Display ng Pera',
    body: [
      'Piliin ang pera para sa pagpapakita ng mga halaga.',
      'Hindi nakakaapekto sa mga kalkulasyon — para sa format lamang.',
      'Maaaring i-configure nang hiwalay para sa bawat kliyente.',
    ],
  },
  pdfExport: {
    title: 'PDF Export',
    body: [
      'Gumawa ng propesyonal na PDF report para sa kasalukuyang scenario.',
      'Kasama ang mga chart, talahanayan at buod.',
      'Handa nang ipadala sa kliyente.',
    ],
  },
  createLetter: {
    title: 'Gumawa ng Liham',
    body: [
      'Gumawa ng personalisadong liham para sa kliyente batay sa kasalukuyang scenario.',
      'Awtomatikong napupuno ang template ng data ng kalkulasyon.',
      'I-edit at ipadala nang direkta mula sa app.',
    ],
  },
  scenarioChart: {
    title: 'Chart ng Scenario',
    body: [
      'Visualization ng paglago ng portfolio sa paglipas ng panahon.',
      'Ipinapakita ang balanse, deposito at rebate bawat buwan.',
      'Pindutin ang isang punto para sa detalyadong impormasyon.',
    ],
  },
  compareMode: {
    title: 'Compare Mode',
    body: [
      'Ikumpara ang maraming scenario para sa isang kliyente nang magkatabi.',
      'Gamitin para ipakita ang iba\'t ibang estratehiya.',
      'I-export ang paghahambing sa PDF.',
    ],
  },
  rankTiers: {
    title: 'Antas ng Ranggo',
    body: [
      'Ang iyong kasalukuyang ranggo at mga kondisyon para sa pag-akyat sa susunod na antas.',
      'Ang ranggo ay nagtatakda ng porsyento ng komisyon at mga bonus.',
      'Subaybayan ang progreso sa real time.',
    ],
  },
  partnerList: {
    title: 'Listahan ng Partner',
    body: [
      'Lahat ng partner sa iyong network at ang kanilang mga status.',
      'Subaybayan ang aktibidad at dami ng koponan.',
      'Pindutin ang isang partner para sa detalyadong impormasyon.',
    ],
  },
  commissionEstimator: {
    title: 'Estimator ng Komisyon',
    body: [
      'Kalkulahin ang inaasahang kita batay sa dami.',
      'Kasama ang personal na benta at mga bonus ng koponan.',
      'Awtomatikong nag-a-update kapag nagbago ang data.',
    ],
  },
  invitationVideos: {
    title: 'Mga Video ng Imbitasyon',
    body: [
      'Mga video na nagpapakilala sa produkto sa mga potensyal na kliyente.',
      'Ibahagi ang link o ipadala nang direkta mula sa app.',
      'Regular na ina-update ng koponan.',
    ],
  },
  adviserVideos: {
    title: 'Mga Video para sa Adviser',
    body: [
      'Mga materyal sa pagsasanay at mga update para sa mga adviser.',
      'Manood ng mga bagong video para mapabuti ang kasanayan.',
      'Markahan ang mga napanood para sa madaling pagsubaybay.',
    ],
  },
  lettersHub: {
    title: 'Hub ng mga Liham',
    body: [
      'Gumawa at pamahalaan ang mga personalisadong liham para sa mga kliyente.',
      'Log ng Pagpapadala — subaybayan kung kanino, ano ang tugon at mag-iskedyul ng mga follow-up.',
      'Pag-setup ng Profile (⚙) — idagdag ang iyong pangalan, kumpanya at logo para awtomatikong mapunan ang bawat liham.',
    ],
  },
  assetGoalPlanner: {
    title: 'Tagaplano ng Layunin sa Asset',
    body: [
      'Ilagay ang halaga ng asset na nais mong maabot (hal. $250,000). Kinakalkula ng planner kung ang iyong panimulang halaga at buwanang deposito ay magdadala sa iyo doon sa loob ng napiling timeframe.',
      'Gamitin ang mga mabilis na chip para lumipat sa mga karaniwang target na halaga. Ipinapakita ng progress bar kung gaano ka na kalapit sa layunin gamit ang mga kasalukuyang setting.',
      'Tip: pagsamahin sa tab ng Strategy upang ipakita sa isang kliyente ang eksaktong halaga ng deposito na kailangan para maabot ang kanilang layunin sa loob ng 5 o 10 taon.',
    ],
  },
  projectedRevenueModel: {
    title: 'Inaasahang Modelo ng Kita',
    body: [
      'Laki ng Database = kabuuang bilang ng mga contact na maaari mong maabot. Rate ng Conversion = porsyento na inaasahan mong i-convert sa mga kliyente. Magkasama, kinakalkula nila ang iyong tinantyang laki ng koponan at kabuuang dami ng portfolio.',
      'Muling Paggamit ng Rebate % — kung gaano karaming buwanang diskwento sa brilyante ang muling ini-invest ng mga kliyente sa mga bagong pagbili. Mas mataas na muling paggamit ay nangangahulugang mas mabilis na paglago ng portfolio at mas mataas na kita para sa iyo.',
      'Aking Mga Bahagi sa Pool = ang iyong bahagi sa global na bonus pool. Ipinapakita ng 36-buwang timeline kung paano lumalaki ang iyong passive na kita habang nagko-compound ang koponan.',
    ],
  },
  sentLog: {
    title: 'Sent Log at Pipeline',
    body: [
      'I-log ang bawat liham o outreach na iyong naipadala. Itala ang pangalan ng tatanggap, uri ng liham, petsa ng pagpapadala, at opsyonal na petsa ng follow-up para kontrolin ang iyong pipeline.',
      'I-tap ang outcome badge ng isang entry para mag-cycle sa mga yugto ng pipeline: Nakabinbin → Sumagot → Pulong → Na-convert → Walang Tugon.',
      'Magtakda ng petsa ng follow-up para makatanggap ng alerto ng NAANTALA kapag lumipas na ang petsa. Markahan bilang Tapos na pagkatapos mag-follow up. Ang mga naantalang entry ay lumalabas sa itaas sa pulang kulay.',
    ],
  },
    strategySummary: {
    title: 'Buod ng Estratehiya',
    body: [
      'Isang buod ng iyong kumpletong estratehiya: kabuuang namuhunan, kabuuang diskwentong nakuha, panghuling halaga ng brilyante, at kung naabot ang buwanang layunin.',
      'Ipinapakita ng ROI at Break-Even month kung kailan sakop ng iyong mga naipon na diskwento ang iyong paunang pamumuhunan.',
      'Gamitin ang seksyong ito upang maipakita ang mga pangunahing numero sa kliyente bago ipakita ang buong talahanayan.',
    ],
  },
  companyMargin: {
    title: 'Mekanismo ng Margin ng Kumpanya',
    body: [
      'Ang Diamond Solution ay kumukuha ng magaspang na brilyante nang direkta mula sa mga minahan sa ~10% ng presyo sa tingi, ginugupit at sinesertipiko sa loob, at nagbebenta ng B2B sa buong mundo.',
      'Inaalis ng vertical integration na ito ang 5–6 na tagapamagitan na karaniwang nagpapalaki ng presyo ng 700%.',
      'Ang margin ay nagpopondo sa buwanang diskwento na binabayaran sa mga mamumuhunan.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'Buwanang Iskedyul ng Diskwento',
    body: [
      'Ipinapakita ng talahanayan na ito ang bawat buwan ng iyong estratehiya: balanse ng brilyante, buwanang diskwentong nakuha, at mga kabuuan.',
      'Lumipat sa pagitan ng Buwanan at Taunan na view. Ang taunang view ay perpekto para sa mga presentasyon ng kliyente.',
      'Ang mga hanay sa katapusan ng taon ay naka-highlight sa amber.',
    ],
  },
  bannerToggle: {
    title: 'Mga Maturity Banner',
    body: [
      'Lumalabas ang mga berdeng banner sa buwanang talahanayan kapag ang isang batch ng brilyante ay umabot sa kapanahunan — ang nakakulong na halaga ay inilalabas at idinaragdag sa iyong aktibong balanse.',
      'Pagkatapos ng 12 buwan ang kontrata ay libre: maaari kang pumili ng libreng pagpapadala ng iyong mga brilyante o matatanggap ang 100% ng iyong paunang puhunan.',
      'Ang numero ay nagpapakita kung ilang maturity event ang magaganap sa buong panahon ng iyong estratehiya.',
      'I-tap ang pindutan upang itago o ipakita ang lahat ng maturity banner. Itago para sa mas malinis na view; ipakita upang ipaliwanag ang mga milestone ng paglago sa isang kliyente.',
    ],
  },
};

const ar: TipMap = {
  monthlyGoal: {
    title: 'الهدف الشهري',
    body: [
      'هدفك الشخصي في المبيعات لهذا الشهر.',
      'تتبع التقدم في الوقت الفعلي باستخدام شريط التقدم.',
      'حدّث الهدف في أي وقت من إعدادات الملف الشخصي (⚙).',
    ],
  },
  clientNameSaving: {
    title: 'حفظ اسم العميل',
    body: [
      'يتم حفظ الاسم تلقائياً أثناء الكتابة.',
      'لا حاجة للضغط على "حفظ" — تُسجَّل التغييرات فوراً.',
      'استخدم اسماً مقروءاً لسهولة التعرف في السجل والتصدير.',
    ],
  },
  vipStatus: {
    title: 'حالة VIP للعميل',
    body: [
      'الحالات: جديد ← نشط ← VIP ← قائد ← أسطورة.',
      'تتحدث الحالة تلقائياً بناءً على نشاط العميل.',
      'يُعرض عملاء VIP بشكل منفصل لسرعة الوصول.',
    ],
  },
  startAmount: {
    title: 'المبلغ الابتدائي',
    body: [
      'مبلغ الاستثمار الأولي للعميل.',
      'يُستخدم كقاعدة لحساب الخصومات والنمو.',
      'يمكن تحديثه في أي وقت عند تغير الشروط.',
    ],
  },
  strategyDuration: {
    title: 'مدة الاستراتيجية',
    body: [
      'إجمالي الأشهر المخططة لاستراتيجية الاستثمار.',
      'يحدد نطاق الحساب والعوائد المتوقعة.',
      'يمكن تعديله وفق احتياجات العميل.',
    ],
  },
  monthlyDeposit: {
    title: 'الإيداع الشهري',
    body: [
      'المبلغ الشهري المنتظم الذي يودعه العميل.',
      'يُحتسب في توقعات الادخار والنمو.',
      'اترك 0 للاستثمار لمرة واحدة دون إيداعات إضافية.',
    ],
  },
  annualBonus: {
    title: 'المكافأة السنوية',
    body: [
      'مبلغ إضافي يودعه العميل سنوياً.',
      'يُضاف فوق الإيداعات الشهرية.',
      'مفيد لحساب الإيداعات الكبيرة لمرة واحدة.',
    ],
  },
  fixedWithdrawal: {
    title: 'السحب الثابت',
    body: [
      'المبلغ الشهري المنتظم المسحوب من المحفظة.',
      'يُستخدم لحساب استدامة استراتيجية السحب.',
      'اترك 0 إن لم يكن هناك سحب مخطط.',
    ],
  },
  outPercentage: {
    title: 'نسبة السحب',
    body: [
      'النسبة المئوية الشهرية من الرصيد للسحب.',
      'بديل عن مبلغ السحب الثابت.',
      'مفيد لاستراتيجيات السحب المرنة.',
    ],
  },
  activeCompounding: {
    title: 'التراكم النشط',
    body: [
      'عند التفعيل، تُعاد استثمار الخصومات في المحفظة.',
      'يُسرّع النمو من خلال تأثير الفائدة المركبة.',
      'عند التعطيل، تُدفع الخصومات نقداً.',
    ],
  },
  reverseCalculator: {
    title: 'الحاسبة العكسية',
    body: [
      'حدد الدخل الشهري المستهدف والمدة — ستحسب الآلة الحاسبة المبلغ الابتدائي اللازم.',
      'مفيد للتخطيط "من الهدف".',
      'تُطبَّق النتائج تلقائياً على السيناريو الرئيسي.',
    ],
  },
  calcHistory: {
    title: 'سجل الحسابات',
    body: [
      'سجل بجميع الحسابات للعميل الحالي.',
      'قارن السيناريوهات وتتبع تغييرات الاستراتيجية.',
      'صدّر إلى PDF لتقديمه للعميل.',
    ],
  },
  currencyDisplay: {
    title: 'عرض العملة',
    body: [
      'اختر العملة لعرض المبالغ.',
      'لا يؤثر على الحسابات — للتنسيق فقط.',
      'يمكن ضبطه بشكل منفصل لكل عميل.',
    ],
  },
  pdfExport: {
    title: 'تصدير PDF',
    body: [
      'أنشئ تقرير PDF احترافياً للسيناريو الحالي.',
      'يتضمن المخططات والجداول والملخص.',
      'جاهز للإرسال إلى العميل.',
    ],
  },
  createLetter: {
    title: 'إنشاء خطاب',
    body: [
      'أنشئ خطاباً مخصصاً للعميل بناءً على السيناريو الحالي.',
      'يملأ القالب بيانات الحساب تلقائياً.',
      'حرر وأرسل مباشرة من التطبيق.',
    ],
  },
  scenarioChart: {
    title: 'مخطط السيناريو',
    body: [
      'تصور نمو المحفظة بمرور الوقت.',
      'يعرض الرصيد والودائع والخصومات شهرياً.',
      'انقر على نقطة للحصول على معلومات تفصيلية.',
    ],
  },
  compareMode: {
    title: 'وضع المقارنة',
    body: [
      'قارن سيناريوهات متعددة لنفس العميل جنباً إلى جنب.',
      'استخدمه لعرض استراتيجيات مختلفة.',
      'صدّر المقارنة إلى PDF.',
    ],
  },
  rankTiers: {
    title: 'مستويات الرتبة',
    body: [
      'رتبتك الحالية وشروط الترقي للمستوى التالي.',
      'تحدد الرتبة نسبة العمولة والمكافآت.',
      'تتبع التقدم في الوقت الفعلي.',
    ],
  },
  partnerList: {
    title: 'قائمة الشركاء',
    body: [
      'جميع الشركاء في شبكتك وحالاتهم.',
      'تتبع نشاط الفريق وأحجام الأداء.',
      'انقر على شريك للحصول على معلومات تفصيلية.',
    ],
  },
  commissionEstimator: {
    title: 'مقدّر العمولة',
    body: [
      'احسب الدخل المتوقع بناءً على الأحجام.',
      'يشمل المبيعات الشخصية ومكافآت الفريق.',
      'يتحدث تلقائياً عند تغير البيانات.',
    ],
  },
  invitationVideos: {
    title: 'فيديوهات الدعوة',
    body: [
      'مواد فيديو لتعريف العملاء المحتملين بالمنتج.',
      'شارك الرابط أو أرسل مباشرة من التطبيق.',
      'يتم تحديثها بانتظام من قِبل الفريق.',
    ],
  },
  adviserVideos: {
    title: 'فيديوهات المستشار',
    body: [
      'مواد تدريبية وتحديثات للمستشارين.',
      'شاهد فيديوهات جديدة لتطوير مهاراتك.',
      'ضع علامة على المشاهَد لسهولة التتبع.',
    ],
  },
  lettersHub: {
    title: 'مركز الخطابات',
    body: [
      'أنشئ وأدر خطابات مخصصة للعملاء.',
      'سجل الإرسال — تتبع من أُرسل إليه وما كانت الاستجابة وجدوَلة المتابعات.',
      'إعداد الملف الشخصي (⚙) — أضف اسمك وشركتك وشعارك لملء كل خطاب تلقائياً.',
    ],
  },
  assetGoalPlanner: {
    title: 'مخطط أهداف الأصول',
    body: [
      'أدخل قيمة الأصول التي تريد الوصول إليها (مثل 250,000$). يحسب المخطط ما إذا كانت مبلغك الابتدائي وودائعك الشهرية ستوصلك إلى هناك ضمن الإطار الزمني المختار.',
      'استخدم رقائق الاختيار السريع للانتقال إلى القيم المستهدفة الشائعة. يُظهر شريط التقدم مدى قربك من الهدف بالإعدادات الحالية.',
      'نصيحة: اجمع مع علامة تبويب الاستراتيجية لإظهار المبلغ الدقيق للإيداع الذي يحتاجه العميل للوصول إلى هدفه في 5 أو 10 سنوات.',
    ],
  },
  projectedRevenueModel: {
    title: 'نموذج الإيرادات المتوقعة',
    body: [
      'حجم قاعدة البيانات = إجمالي جهات الاتصال التي يمكنك الوصول إليها. معدل التحويل = النسبة المئوية التي تتوقع تحويلها إلى عملاء. معاً يحسبان الحجم التقديري لفريقك وإجمالي حجم المحفظة.',
      'نسبة إعادة استخدام الخصم % — كم من خصمهم الشهري على الماس يعيد العملاء استثماره في مشتريات جديدة. إعادة الاستخدام الأعلى تعني نمواً أسرع للمحفظة وعائداً متبقياً أعلى لك.',
      'حصصي في المجموعة = حصتك في مجموعة المكافآت العالمية. يُظهر الجدول الزمني المؤلف من 36 شهراً كيف ينمو دخلك السلبي مع نمو الفريق.',
    ],
  },
  sentLog: {
    title: 'سجل المرسل والخط',
    body: [
      'سجّل كل رسالة أو تواصل ترسله. أدخل اسم المستلم ونوع الرسالة وتاريخ الإرسال وتاريخ المتابعة الاختياري للتحكم في خطك.',
      'اضغط على شارة النتيجة لأي إدخال للتنقل بين مراحل الخط: قيد الانتظار → استجاب → اجتماع → تحوّل → لا استجابة.',
      'حدد تاريخ متابعة لتلقي تنبيه متأخر عند مرور التاريخ. اضغط تم بعد المتابعة. تظهر الإدخالات المتأخرة باللون الأحمر في أعلى الشاشة.',
    ],
  },
    strategySummary: {
    title: 'ملخص الاستراتيجية',
    body: [
      'لمحة عامة عن استراتيجيتك الكاملة: إجمالي الاستثمار، الخصومات المكتسبة، القيمة النهائية للماس، وما إذا تم تحقيق هدفك الشهري.',
      'يُظهر العائد على الاستثمار وشهر التعادل متى تغطي خصوماتك المتراكمة استثمارك الأولي.',
      'استخدم هذا القسم لتقديم الأرقام الرئيسية للعميل قبل عرض الجدول الشهري الكامل.',
    ],
  },
  companyMargin: {
    title: 'آلية هامش الشركة',
    body: [
      'تحصل Diamond Solution على الماس الخام مباشرة من المناجم بـ~10% من سعر التجزئة، وتقطعه وتُصادق عليه داخلياً، وتبيعه B2B عالمياً بالقيمة السوقية الكاملة.',
      'يُلغي هذا التكامل الرأسي 5-6 وسطاء يرفعون السعر عادةً بنسبة 700%.',
      'الهامش الناتج عن تجاوز السلسلة يُموّل الخصم الشهري المدفوع للمستثمرين.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'جدول الخصومات الشهرية',
    body: [
      'يُظهر هذا الجدول كل شهر من استراتيجيتك: رصيد الماس، الخصم الشهري المكتسب، عمليات السحب والإجماليات.',
      'التبديل بين العرض الشهري والسنوي. العرض السنوي مثالي لعروض العملاء.',
      'صفوف نهاية العام مُميَّزة بالعنبر. تُشار تفعيلات VIP وترقيات SP والمعالم في الجدول.',
    ],
  },
  bannerToggle: {
    title: 'لافتات النضج',
    body: [
      'تظهر لافتات خضراء في الجدول الشهري عندما تصل دفعة من الماس إلى النضج — يتم تحرير القيمة المقفلة وإضافتها إلى رصيدك النشط.',
      'بعد 12 شهراً يصبح العقد مجانياً: يمكنك اختيار التوصيل المجاني لماسك أو استعادة 100% من استثمارك الأولي.',
      'الرقم يُظهر عدد أحداث النضج التي تحدث على مدار فترة استراتيجيتك الكاملة.',
      'اضغط الزر لإخفاء أو إظهار جميع لافتات النضج. أخفِها للحصول على عرض أنظف؛ أظهرها لشرح معالم النمو للعميل.',
    ],
  },
};

const th: TipMap = {
  monthlyGoal: {
    title: 'เป้าหมายรายเดือน',
    body: [
      'เป้าหมายการขายส่วนตัวของคุณสำหรับเดือนนี้',
      'ติดตามความคืบหน้าแบบเรียลไทม์ผ่านแถบความคืบหน้า',
      'อัปเดตเป้าหมายได้ทุกเมื่อในการตั้งค่าโปรไฟล์ (⚙)',
    ],
  },
  clientNameSaving: {
    title: 'การบันทึกชื่อลูกค้า',
    body: [
      'ชื่อจะบันทึกอัตโนมัติขณะพิมพ์',
      'ไม่ต้องกดปุ่ม "บันทึก" — การเปลี่ยนแปลงจะถูกบันทึกทันที',
      'ใช้ชื่อที่อ่านง่ายเพื่อระบุตัวตนในประวัติและการส่งออก',
    ],
  },
  vipStatus: {
    title: 'สถานะ VIP ของลูกค้า',
    body: [
      'สถานะ: ใหม่ → ใช้งานอยู่ → VIP → ผู้นำ → ตำนาน',
      'สถานะอัปเดตอัตโนมัติตามกิจกรรมของลูกค้า',
      'ลูกค้า VIP แสดงแยกต่างหากเพื่อการเข้าถึงที่รวดเร็ว',
    ],
  },
  startAmount: {
    title: 'จำนวนเงินเริ่มต้น',
    body: [
      'จำนวนเงินลงทุนเริ่มต้นของลูกค้า',
      'ใช้เป็นฐานในการคำนวณส่วนลดและการเติบโต',
      'สามารถอัปเดตได้ทุกเมื่อเมื่อเงื่อนไขเปลี่ยนแปลง',
    ],
  },
  strategyDuration: {
    title: 'ระยะเวลากลยุทธ์',
    body: [
      'จำนวนเดือนรวมที่วางแผนสำหรับกลยุทธ์การลงทุน',
      'กำหนดขอบเขตการคำนวณและผลตอบแทนที่คาดหวัง',
      'ปรับได้ตามความต้องการของลูกค้า',
    ],
  },
  monthlyDeposit: {
    title: 'เงินฝากรายเดือน',
    body: [
      'จำนวนเงินที่ลูกค้าฝากเป็นประจำทุกเดือน',
      'รวมอยู่ในการพยากรณ์การออมและการเติบโต',
      'ใส่ 0 สำหรับการลงทุนครั้งเดียวโดยไม่มีการฝากเพิ่มเติม',
    ],
  },
  annualBonus: {
    title: 'โบนัสประจำปี',
    body: [
      'จำนวนเงินเพิ่มเติมที่ลูกค้าฝากทุกปี',
      'เพิ่มเติมจากเงินฝากรายเดือน',
      'มีประโยชน์สำหรับการคำนวณเงินฝากก้อนใหญ่ครั้งเดียว',
    ],
  },
  fixedWithdrawal: {
    title: 'การถอนเงินคงที่',
    body: [
      'จำนวนเงินที่ถอนออกจากพอร์ตโฟลิโอเป็นประจำทุกเดือน',
      'ใช้คำนวณความยั่งยืนของกลยุทธ์การถอนเงิน',
      'ใส่ 0 หากไม่มีแผนการถอนเงิน',
    ],
  },
  outPercentage: {
    title: 'เปอร์เซ็นต์การถอน',
    body: [
      'เปอร์เซ็นต์ของยอดคงเหลือที่ถอนออกทุกเดือน',
      'ทางเลือกแทนจำนวนการถอนคงที่',
      'มีประโยชน์สำหรับกลยุทธ์การถอนที่ยืดหยุ่น',
    ],
  },
  activeCompounding: {
    title: 'การทบต้นแบบแอคทีฟ',
    body: [
      'เมื่อเปิดใช้งาน ส่วนลดจะถูกนำไปลงทุนซ้ำในพอร์ตโฟลิโอ',
      'เร่งการเติบโตผ่านเอฟเฟกต์ดอกเบี้ยทบต้น',
      'เมื่อปิดใช้งาน ส่วนลดจะจ่ายเป็นเงินสด',
    ],
  },
  reverseCalculator: {
    title: 'เครื่องคิดเลขย้อนกลับ',
    body: [
      'กำหนดรายได้รายเดือนเป้าหมายและระยะเวลา — เครื่องคิดเลขจะคำนวณจำนวนเงินเริ่มต้นที่ต้องการ',
      'สะดวกสำหรับการวางแผนแบบ "จากเป้าหมาย"',
      'ผลลัพธ์จะนำไปใช้กับสถานการณ์หลักโดยอัตโนมัติ',
    ],
  },
  calcHistory: {
    title: 'ประวัติการคำนวณ',
    body: [
      'บันทึกการคำนวณทั้งหมดสำหรับลูกค้าปัจจุบัน',
      'เปรียบเทียบสถานการณ์และติดตามการเปลี่ยนแปลงกลยุทธ์',
      'ส่งออกเป็น PDF เพื่อมอบให้ลูกค้า',
    ],
  },
  currencyDisplay: {
    title: 'การแสดงสกุลเงิน',
    body: [
      'เลือกสกุลเงินสำหรับแสดงจำนวนเงิน',
      'ไม่กระทบการคำนวณ — เพื่อการจัดรูปแบบเท่านั้น',
      'สามารถตั้งค่าแยกต่างหากสำหรับลูกค้าแต่ละราย',
    ],
  },
  pdfExport: {
    title: 'ส่งออก PDF',
    body: [
      'สร้างรายงาน PDF มืออาชีพสำหรับสถานการณ์ปัจจุบัน',
      'รวมกราฟ ตาราง และสรุป',
      'พร้อมส่งให้ลูกค้า',
    ],
  },
  createLetter: {
    title: 'สร้างจดหมาย',
    body: [
      'สร้างจดหมายส่วนตัวสำหรับลูกค้าตามสถานการณ์ปัจจุบัน',
      'เทมเพลตจะกรอกข้อมูลการคำนวณโดยอัตโนมัติ',
      'แก้ไขและส่งได้โดยตรงจากแอป',
    ],
  },
  scenarioChart: {
    title: 'กราฟสถานการณ์',
    body: [
      'การแสดงภาพการเติบโตของพอร์ตโฟลิโอตามเวลา',
      'แสดงยอดคงเหลือ เงินฝาก และส่วนลดรายเดือน',
      'แตะจุดเพื่อดูข้อมูลโดยละเอียด',
    ],
  },
  compareMode: {
    title: 'โหมดเปรียบเทียบ',
    body: [
      'เปรียบเทียบหลายสถานการณ์สำหรับลูกค้าคนเดียวเคียงข้างกัน',
      'ใช้เพื่อแสดงกลยุทธ์ที่แตกต่างกัน',
      'ส่งออกการเปรียบเทียบเป็น PDF',
    ],
  },
  rankTiers: {
    title: 'ระดับยศ',
    body: [
      'ยศปัจจุบันของคุณและเงื่อนไขในการก้าวขึ้นสู่ระดับต่อไป',
      'ยศกำหนดเปอร์เซ็นต์ค่าคอมมิชชันและโบนัส',
      'ติดตามความคืบหน้าแบบเรียลไทม์',
    ],
  },
  partnerList: {
    title: 'รายชื่อพาร์ทเนอร์',
    body: [
      'พาร์ทเนอร์ทั้งหมดในเครือข่ายของคุณและสถานะของพวกเขา',
      'ติดตามกิจกรรมและปริมาณของทีม',
      'แตะพาร์ทเนอร์เพื่อดูข้อมูลโดยละเอียด',
    ],
  },
  commissionEstimator: {
    title: 'เครื่องประเมินค่าคอมมิชชัน',
    body: [
      'คำนวณรายได้ที่คาดหวังตามปริมาณ',
      'รวมการขายส่วนตัวและโบนัสทีม',
      'อัปเดตอัตโนมัติเมื่อข้อมูลเปลี่ยนแปลง',
    ],
  },
  invitationVideos: {
    title: 'วิดีโอเชิญชวน',
    body: [
      'สื่อวิดีโอสำหรับแนะนำผลิตภัณฑ์แก่ลูกค้าที่มีศักยภาพ',
      'แชร์ลิงก์หรือส่งโดยตรงจากแอป',
      'ทีมอัปเดตเป็นประจำ',
    ],
  },
  adviserVideos: {
    title: 'วิดีโอสำหรับที่ปรึกษา',
    body: [
      'สื่อการฝึกอบรมและการอัปเดตสำหรับที่ปรึกษา',
      'ดูวิดีโอใหม่เพื่อพัฒนาทักษะ',
      'ทำเครื่องหมายที่ดูแล้วเพื่อติดตามได้ง่าย',
    ],
  },
  lettersHub: {
    title: 'ศูนย์จดหมาย',
    body: [
      'สร้างและจัดการจดหมายส่วนตัวสำหรับลูกค้า',
      'บันทึกการส่ง — ติดตามว่าส่งให้ใคร การตอบกลับ และกำหนดการติดตาม',
      'การตั้งค่าโปรไฟล์ (⚙) — เพิ่มชื่อ บริษัท และโลโก้เพื่อกรอกจดหมายแต่ละฉบับโดยอัตโนมัติ',
    ],
  },
  assetGoalPlanner: {
    title: 'เครื่องมือวางแผนเป้าหมายสินทรัพย์',
    body: [
      'ป้อนมูลค่าสินทรัพย์ที่คุณต้องการบรรลุ (เช่น $250,000) เครื่องมือวางแผนจะคำนวณว่าจำนวนเงินเริ่มต้นและเงินฝากรายเดือนของคุณจะพาคุณไปถึงเป้าหมายภายในกรอบเวลาที่เลือกหรือไม่',
      'ใช้ชิปเลือกด่วนเพื่อข้ามไปยังมูลค่าเป้าหมายทั่วไป แถบความคืบหน้าแสดงให้เห็นว่าคุณใกล้เคียงกับเป้าหมายแค่ไหนด้วยการตั้งค่าปัจจุบัน',
      'เคล็ดลับ: ใช้ร่วมกับแท็บกลยุทธ์เพื่อแสดงให้ลูกค้าเห็นจำนวนเงินฝากที่แน่นอนที่จำเป็นเพื่อบรรลุเป้าหมายใน 5 หรือ 10 ปี',
    ],
  },
  projectedRevenueModel: {
    title: 'แบบจำลองรายได้ที่คาดการณ์',
    body: [
      'ขนาดฐานข้อมูล = จำนวนผู้ติดต่อทั้งหมดที่คุณสามารถเข้าถึงได้ อัตราการแปลง = เปอร์เซ็นต์ที่คุณคาดว่าจะเปลี่ยนเป็นลูกค้า ทั้งสองอย่างช่วยคำนวณขนาดทีมโดยประมาณและปริมาณพอร์ตโฟลิโอรวม',
      'การนำส่วนลดกลับมาใช้ใหม่ % — ลูกค้านำส่วนลดเพชรรายเดือนกี่เปอร์เซ็นต์ไปลงทุนซื้อใหม่ การนำกลับมาใช้ใหม่ที่สูงขึ้นหมายถึงการเติบโตของพอร์ตโฟลิโอที่เร็วขึ้นและรายได้คงเหลือที่สูงขึ้นสำหรับคุณ',
      'ส่วนแบ่งพูลของฉัน = ส่วนแบ่งของคุณในพูลโบนัสทั่วโลก ไทม์ไลน์ 36 เดือนแสดงให้เห็นว่ารายได้ passive ของคุณเติบโตอย่างไรเมื่อทีมเติบโต',
    ],
  },
  sentLog: {
    title: 'บันทึกที่ส่งและไปป์ไลน์',
    body: [
      'บันทึกจดหมายหรือการติดต่อทุกฉบับที่คุณส่ง ระบุชื่อผู้รับ ประเภทจดหมาย วันที่ส่ง และวันติดตามผลหากต้องการ เพื่อควบคุมไปป์ไลน์ของคุณ',
      'แตะที่แบดจ์ผลลัพธ์ของรายการเพื่อวนผ่านขั้นตอนไปป์ไลน์: รอดำเนินการ → ตอบกลับแล้ว → นัดประชุม → แปลงแล้ว → ไม่มีการตอบกลับ',
      'ตั้งวันติดตามผลเพื่อรับการแจ้งเตือนเกินกำหนดเมื่อวันผ่านไป กดเสร็จสิ้นหลังติดตามผล รายการที่เกินกำหนดจะแสดงสีแดงที่ด้านบนของหน้าจอ',
    ],
  },
    strategySummary: {
    title: 'สรุปกลยุทธ์',
    body: [
      'ภาพรวมกลยุทธ์ทั้งหมดของคุณ: เงินลงทุนรวม ส่วนลดรวมที่ได้รับ มูลค่าเพชรสุดท้าย และบรรลุเป้าหมายรายเดือนหรือไม่',
      'ROI และเดือน Break-Even แสดงให้เห็นว่าส่วนลดสะสมครอบคลุมการลงทุนเริ่มต้นเมื่อใด',
      'ใช้ส่วนนี้เพื่อนำเสนอตัวเลขสำคัญให้ลูกค้าก่อนแสดงตารางรายเดือนเต็มรูปแบบ',
    ],
  },
  companyMargin: {
    title: 'กลไกอัตรากำไรของบริษัท',
    body: [
      'Diamond Solution จัดหาเพชรดิบโดยตรงจากเหมือง ~10% ของราคาขายปลีก ตัดและรับรองภายใน และขาย B2B ทั่วโลก',
      'การรวมแนวดิ่งนี้ขจัดคนกลาง 5-6 รายที่มักเพิ่มราคา 700%',
      'อัตรากำไรที่ได้จากการตัดห่วงโซ่จะจัดหาเงินทุนสำหรับส่วนลดรายเดือนที่จ่ายให้นักลงทุน',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'ตารางส่วนลดรายเดือน',
    body: [
      'ตารางนี้แสดงทุกเดือนของกลยุทธ์คุณ: ยอดเพชร ส่วนลดรายเดือน การถอนเงิน และยอดรวมสะสม',
      'สลับระหว่างมุมมองรายเดือนและรายปี มุมมองรายปีเหมาะสำหรับการนำเสนอลูกค้า',
      'แถวสิ้นปีถูกไฮไลต์ด้วยสีอำพัน การเปิดใช้งาน VIP การอัปเกรด SP และเหตุการณ์สำคัญถูกทำเครื่องหมายในตาราง',
    ],
  },
  bannerToggle: {
    title: 'แบนเนอร์ครบกำหนด',
    body: [
      'แบนเนอร์สีเขียวจะปรากฏในตารางรายเดือนเมื่อชุดเพชรถึงวันครบกำหนด — มูลค่าที่ถูกล็อกไว้จะถูกปลดล็อกและเพิ่มเข้าในยอดคงเหลือที่ใช้งานอยู่',
      'หลังจาก 12 เดือนสัญญาจะฟรี: คุณสามารถเลือกรับเพชรฟรีหรือรับเงินลงทุนเริ่มต้นคืน 100%',
      'ตัวเลขแสดงจำนวนเหตุการณ์ครบกำหนดที่เกิดขึ้นตลอดช่วงเวลากลยุทธ์ทั้งหมดของคุณ',
      'กดปุ่มเพื่อซ่อนหรือแสดงแบนเนอร์ครบกำหนดทั้งหมด ซ่อนเพื่อมุมมองที่สะอาดขึ้น แสดงเพื่ออธิบายจุดสำคัญของการเติบโตให้ลูกค้า',
    ],
  },
};

const hi: TipMap = {
  monthlyGoal: {
    title: 'मासिक लक्ष्य',
    body: [
      'इस महीने के लिए आपका व्यक्तिगत बिक्री लक्ष्य।',
      'प्रगति बार के माध्यम से रियल-टाइम में प्रगति ट्रैक करें।',
      'प्रोफ़ाइल सेटिंग्स (⚙) में किसी भी समय लक्ष्य अपडेट करें।',
    ],
  },
  clientNameSaving: {
    title: 'क्लाइंट नाम सहेजना',
    body: [
      'टाइप करते समय नाम स्वचालित रूप से सहेजा जाता है।',
      '"सहेजें" बटन दबाने की आवश्यकता नहीं — परिवर्तन तुरंत दर्ज होते हैं।',
      'इतिहास और निर्यात में आसान पहचान के लिए पठनीय नाम का उपयोग करें।',
    ],
  },
  vipStatus: {
    title: 'क्लाइंट VIP स्थिति',
    body: [
      'स्थितियाँ: नया → सक्रिय → VIP → नेता → किंवदंती।',
      'क्लाइंट गतिविधि के आधार पर स्थिति स्वचालित रूप से अपडेट होती है।',
      'VIP क्लाइंट त्वरित पहुँच के लिए अलग से दिखाए जाते हैं।',
    ],
  },
  startAmount: {
    title: 'प्रारंभिक राशि',
    body: [
      'क्लाइंट की प्रारंभिक निवेश राशि।',
      'छूट और विकास की गणना के लिए आधार के रूप में उपयोग की जाती है।',
      'स्थितियाँ बदलने पर किसी भी समय अपडेट किया जा सकता है।',
    ],
  },
  strategyDuration: {
    title: 'रणनीति की अवधि',
    body: [
      'निवेश रणनीति के लिए कुल नियोजित महीने।',
      'गणना के दायरे और अपेक्षित भुगतान को निर्धारित करता है।',
      'क्लाइंट की जरूरतों के अनुसार समायोजित किया जा सकता है।',
    ],
  },
  monthlyDeposit: {
    title: 'मासिक जमा',
    body: [
      'क्लाइंट द्वारा हर महीने जमा की जाने वाली नियमित राशि।',
      'बचत पूर्वानुमान और विकास में शामिल।',
      'अतिरिक्त जमा के बिना एकमुश्त निवेश के लिए 0 छोड़ें।',
    ],
  },
  annualBonus: {
    title: 'वार्षिक बोनस',
    body: [
      'क्लाइंट द्वारा सालाना जमा की जाने वाली अतिरिक्त राशि।',
      'मासिक जमा के ऊपर जोड़ी जाती है।',
      'एकमुश्त बड़ी जमा की गणना के लिए उपयोगी।',
    ],
  },
  fixedWithdrawal: {
    title: 'निश्चित निकासी',
    body: [
      'पोर्टफोलियो से हर महीने निकाली जाने वाली नियमित राशि।',
      'निकासी रणनीति की स्थिरता की गणना के लिए उपयोग किया जाता है।',
      'यदि कोई निकासी नहीं है तो 0 छोड़ें।',
    ],
  },
  outPercentage: {
    title: 'निकासी प्रतिशत',
    body: [
      'हर महीने शेष राशि का निकाला जाने वाला प्रतिशत।',
      'निश्चित निकासी राशि का विकल्प।',
      'लचीली निकासी रणनीतियों के लिए उपयोगी।',
    ],
  },
  activeCompounding: {
    title: 'सक्रिय चक्रवृद्धि',
    body: [
      'सक्षम होने पर, छूट पोर्टफोलियो में वापस पुनर्निवेश की जाती हैं।',
      'चक्रवृद्धि ब्याज प्रभाव के माध्यम से विकास को गति देता है।',
      'अक्षम होने पर, छूट नकद के रूप में भुगतान की जाती है।',
    ],
  },
  reverseCalculator: {
    title: 'रिवर्स कैलकुलेटर',
    body: [
      'लक्ष्य मासिक आय और अवधि निर्धारित करें — कैलकुलेटर आवश्यक प्रारंभिक राशि की गणना करेगा।',
      '"लक्ष्य से" योजना बनाने के लिए सुविधाजनक।',
      'परिणाम मुख्य परिदृश्य में स्वचालित रूप से लागू होते हैं।',
    ],
  },
  calcHistory: {
    title: 'गणना इतिहास',
    body: [
      'वर्तमान क्लाइंट के लिए सभी गणनाओं का लॉग।',
      'परिदृश्यों की तुलना करें और रणनीति परिवर्तनों को ट्रैक करें।',
      'क्लाइंट को प्रदान करने के लिए PDF में निर्यात करें।',
    ],
  },
  currencyDisplay: {
    title: 'मुद्रा प्रदर्शन',
    body: [
      'राशि प्रदर्शित करने के लिए मुद्रा चुनें।',
      'गणनाओं को प्रभावित नहीं करता — केवल स्वरूपण के लिए।',
      'प्रत्येक क्लाइंट के लिए अलग से कॉन्फ़िगर किया जा सकता है।',
    ],
  },
  pdfExport: {
    title: 'PDF निर्यात',
    body: [
      'वर्तमान परिदृश्य के लिए पेशेवर PDF रिपोर्ट बनाएं।',
      'चार्ट, तालिकाएँ और सारांश शामिल हैं।',
      'क्लाइंट को भेजने के लिए तैयार।',
    ],
  },
  createLetter: {
    title: 'पत्र बनाएं',
    body: [
      'वर्तमान परिदृश्य के आधार पर क्लाइंट के लिए व्यक्तिगत पत्र बनाएं।',
      'टेम्पलेट स्वचालित रूप से गणना डेटा से भरा जाता है।',
      'ऐप से सीधे संपादित करें और भेजें।',
    ],
  },
  scenarioChart: {
    title: 'परिदृश्य चार्ट',
    body: [
      'समय के साथ पोर्टफोलियो वृद्धि का विज़ुअलाइज़ेशन।',
      'मासिक शेष, जमा और छूट दिखाता है।',
      'विस्तृत जानकारी के लिए किसी बिंदु पर टैप करें।',
    ],
  },
  compareMode: {
    title: 'तुलना मोड',
    body: [
      'एक क्लाइंट के लिए कई परिदृश्यों की साथ-साथ तुलना करें।',
      'विभिन्न रणनीतियों को प्रदर्शित करने के लिए उपयोग करें।',
      'तुलना को PDF में निर्यात करें।',
    ],
  },
  rankTiers: {
    title: 'रैंक स्तर',
    body: [
      'आपका वर्तमान रैंक और अगले स्तर पर जाने की शर्तें।',
      'रैंक कमीशन प्रतिशत और बोनस निर्धारित करता है।',
      'रियल टाइम में प्रगति ट्रैक करें।',
    ],
  },
  partnerList: {
    title: 'पार्टनर सूची',
    body: [
      'आपके नेटवर्क के सभी पार्टनर और उनकी स्थितियाँ।',
      'टीम गतिविधि और मात्रा ट्रैक करें।',
      'विस्तृत जानकारी के लिए किसी पार्टनर पर टैप करें।',
    ],
  },
  commissionEstimator: {
    title: 'कमीशन अनुमानक',
    body: [
      'मात्रा के आधार पर अपेक्षित आय की गणना करें।',
      'व्यक्तिगत बिक्री और टीम बोनस शामिल हैं।',
      'डेटा बदलने पर स्वचालित रूप से अपडेट होता है।',
    ],
  },
  invitationVideos: {
    title: 'आमंत्रण वीडियो',
    body: [
      'संभावित क्लाइंट को उत्पाद से परिचित कराने के लिए वीडियो सामग्री।',
      'लिंक साझा करें या ऐप से सीधे भेजें।',
      'टीम द्वारा नियमित रूप से अपडेट किया जाता है।',
    ],
  },
  adviserVideos: {
    title: 'सलाहकार वीडियो',
    body: [
      'सलाहकारों के लिए प्रशिक्षण सामग्री और अपडेट।',
      'कौशल विकास के लिए नए वीडियो देखें।',
      'आसान ट्रैकिंग के लिए देखे गए को चिह्नित करें।',
    ],
  },
  lettersHub: {
    title: 'पत्र केंद्र',
    body: [
      'क्लाइंट के लिए व्यक्तिगत पत्र बनाएं और प्रबंधित करें।',
      'भेजने का लॉग — किसको भेजा, प्रतिक्रिया क्या थी और फॉलो-अप शेड्यूल करें।',
      'प्रोफ़ाइल सेटअप (⚙) — प्रत्येक पत्र को स्वचालित रूप से भरने के लिए अपना नाम, कंपनी और लोगो जोड़ें।',
    ],
  },
  assetGoalPlanner: {
    title: 'संपत्ति लक्ष्य योजनाकार',
    body: [
      'वह संपत्ति मूल्य दर्ज करें जिसे आप प्राप्त करना चाहते हैं (उदा. $250,000)। योजनाकार गणना करता है कि आपकी प्रारंभिक राशि और मासिक जमा आपको चुनी गई समय-सीमा के भीतर वहां पहुंचाएंगे या नहीं।',
      'सामान्य लक्ष्य मूल्यों पर जाने के लिए त्वरित-चयन चिप्स का उपयोग करें। प्रगति बार दर्शाता है कि वर्तमान सेटिंग्स के साथ आप लक्ष्य के कितने करीब हैं।',
      'टिप: किसी ग्राहक को 5 या 10 वर्षों में उनका लक्ष्य प्राप्त करने के लिए आवश्यक सटीक जमा राशि दिखाने के लिए रणनीति टैब के साथ संयोजित करें।',
    ],
  },
  projectedRevenueModel: {
    title: 'अनुमानित राजस्व मॉडल',
    body: [
      'डेटाबेस आकार = आप जिन कुल संपर्कों तक पहुंच सकते हैं। रूपांतरण दर = जितने प्रतिशत को आप ग्राहक में बदलने की उम्मीद करते हैं। साथ मिलकर ये आपके अनुमानित टीम आकार और कुल पोर्टफोलियो वॉल्यूम की गणना करते हैं।',
      'छूट पुनः उपयोग % — ग्राहक अपनी मासिक हीरे की छूट का कितना हिस्सा नई खरीदारी में पुनर्निवेश करते हैं। अधिक पुनः उपयोग का अर्थ है तेज़ पोर्टफोलियो वृद्धि और आपके लिए अधिक अवशिष्ट आय।',
      'मेरे पूल हिस्से = वैश्विक बोनस पूल में आपका हिस्सा। 36-महीने की टाइमलाइन दर्शाती है कि जैसे-जैसे टीम बढ़ती है, आपकी निष्क्रिय आय कैसे बढ़ती है।',
    ],
  },
  sentLog: {
    title: 'भेजा गया लॉग और पाइपलाइन',
    body: [
      'हर भेजे गए पत्र या संपर्क को लॉग करें। प्राप्तकर्ता का नाम, पत्र का प्रकार, भेजने की तारीख और वैकल्पिक फॉलो-अप तारीख दर्ज करें।',
      'किसी भी एंट्री के परिणाम बैज पर टैप करें और पाइपलाइन चरणों में आगे बढ़ें: लंबित → उत्तर दिया → बैठक → रूपांतरित → कोई प्रतिक्रिया नहीं।',
      'फॉलो-अप तारीख सेट करें ताकि तारीख निकलने पर OVERDUE अलर्ट मिले। फॉलो-अप के बाद Done मार्क करें। अतिदेय एंट्री स्क्रीन के ऊपर लाल रंग में दिखती हैं।',
    ],
  },
    strategySummary: {
    title: 'रणनीति सारांश',
    body: [
      'आपकी पूरी रणनीति का स्नैपशॉट: कुल निवेश, अर्जित कुल छूट, अंतिम हीरे का मूल्य, और क्या आपका मासिक लक्ष्य प्राप्त हुआ।',
      'ROI और Break-Even महीना दिखाता है कि आपकी संचित छूट आपके प्रारंभिक निवेश को कब कवर करती है।',
      'पूरी मासिक तालिका दिखाने से पहले ग्राहक को मुख्य संख्याएं प्रस्तुत करने के लिए इस अनुभाग का उपयोग करें।',
    ],
  },
  companyMargin: {
    title: 'कंपनी मार्जिन तंत्र',
    body: [
      'Diamond Solution खदानों से सीधे ~10% खुदरा मूल्य पर कच्चे हीरे प्राप्त करती है, आंतरिक रूप से काटती और प्रमाणित करती है, और पूरे बाजार मूल्य पर B2B बेचती है।',
      'यह लंबवत एकीकरण 5-6 बिचौलियों को समाप्त करता है जो आमतौर पर कीमत 700% बढ़ाते हैं।',
      'श्रृंखला को हटाकर बनाया गया मार्जिन निवेशकों को दी जाने वाली मासिक छूट को वित्तपोषित करता है।',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'मासिक छूट अनुसूची',
    body: [
      'यह तालिका आपकी रणनीति के प्रत्येक महीने को दिखाती है: हीरे की शेष राशि, अर्जित मासिक छूट, निकासी और संचित योग।',
      'मासिक और वार्षिक दृश्य के बीच स्विच करें। वार्षिक दृश्य ग्राहक प्रस्तुतियों के लिए आदर्श है।',
      'वर्ष-अंत पंक्तियाँ एम्बर में हाइलाइट हैं। VIP सक्रियण, SP अपग्रेड और मील के पत्थर इनलाइन चिह्नित हैं।',
    ],
  },
  bannerToggle: {
    title: 'परिपक्वता बैनर',
    body: [
      'जब हीरे का एक बैच परिपक्वता तक पहुँचता है तो मासिक तालिका में हरे बैनर दिखाई देते हैं — लॉक मूल्य जारी होता है और आपकी सक्रिय शेष राशि में जोड़ा जाता है।',
      '12 महीनों के बाद अनुबंध मुफ्त है: आप अपने हीरों की मुफ्त डिलीवरी चुन सकते हैं या अपनी प्रारंभिक निवेश राशि का 100% वापस प्राप्त कर सकते हैं।',
      'संख्या बताती है कि आपकी पूरी रणनीति अवधि में कितनी परिपक्वता घटनाएं होती हैं।',
      'सभी परिपक्वता बैनर छिपाने या दिखाने के लिए बटन दबाएं। साफ दृश्य के लिए छिपाएं; ग्राहक को विकास मील के पत्थर समझाने के लिए दिखाएं।',
    ],
  },
};

const vi: TipMap = {
  monthlyGoal: {
    title: 'Mục tiêu hàng tháng',
    body: [
      'Mục tiêu doanh số cá nhân của bạn cho tháng này.',
      'Theo dõi tiến độ theo thời gian thực qua thanh tiến độ.',
      'Cập nhật mục tiêu bất cứ lúc nào trong Cài đặt Hồ sơ (⚙).',
    ],
  },
  clientNameSaving: {
    title: 'Lưu tên khách hàng',
    body: [
      'Tên được lưu tự động khi bạn gõ.',
      'Không cần nhấn nút "Lưu" — thay đổi được ghi lại ngay lập tức.',
      'Sử dụng tên dễ đọc để dễ nhận dạng trong lịch sử và xuất.',
    ],
  },
  vipStatus: {
    title: 'Trạng thái VIP khách hàng',
    body: [
      'Trạng thái: mới → đang hoạt động → VIP → lãnh đạo → huyền thoại.',
      'Trạng thái tự động cập nhật dựa trên hoạt động của khách hàng.',
      'Khách hàng VIP hiển thị riêng để truy cập nhanh.',
    ],
  },
  startAmount: {
    title: 'Số tiền ban đầu',
    body: [
      'Số tiền đầu tư ban đầu của khách hàng.',
      'Được dùng làm cơ sở tính chiết khấu và tăng trưởng.',
      'Có thể cập nhật bất cứ lúc nào khi điều kiện thay đổi.',
    ],
  },
  strategyDuration: {
    title: 'Thời hạn chiến lược',
    body: [
      'Tổng số tháng dự kiến cho chiến lược đầu tư.',
      'Xác định phạm vi tính toán và khoản thanh toán dự kiến.',
      'Có thể điều chỉnh theo nhu cầu của khách hàng.',
    ],
  },
  monthlyDeposit: {
    title: 'Tiền gửi hàng tháng',
    body: [
      'Số tiền định kỳ khách hàng gửi vào hàng tháng.',
      'Được tính vào dự báo tiết kiệm và tăng trưởng.',
      'Để 0 cho đầu tư một lần không có thêm tiền gửi.',
    ],
  },
  annualBonus: {
    title: 'Tiền thưởng hàng năm',
    body: [
      'Số tiền bổ sung khách hàng gửi hàng năm.',
      'Được cộng thêm vào tiền gửi hàng tháng.',
      'Hữu ích để tính các khoản gửi một lần lớn.',
    ],
  },
  fixedWithdrawal: {
    title: 'Rút tiền cố định',
    body: [
      'Số tiền định kỳ rút khỏi danh mục đầu tư mỗi tháng.',
      'Dùng để tính độ bền vững của chiến lược rút tiền.',
      'Để 0 nếu không có kế hoạch rút tiền.',
    ],
  },
  outPercentage: {
    title: 'Tỷ lệ rút tiền',
    body: [
      'Tỷ lệ phần trăm số dư rút ra mỗi tháng.',
      'Thay thế cho số tiền rút cố định.',
      'Hữu ích cho các chiến lược rút tiền linh hoạt.',
    ],
  },
  activeCompounding: {
    title: 'Lãi kép chủ động',
    body: [
      'Khi bật, chiết khấu được tái đầu tư vào danh mục.',
      'Tăng tốc tăng trưởng thông qua hiệu ứng lãi kép.',
      'Khi tắt, chiết khấu được trả bằng tiền mặt.',
    ],
  },
  reverseCalculator: {
    title: 'Máy tính ngược',
    body: [
      'Đặt thu nhập hàng tháng mục tiêu và thời hạn — máy tính sẽ tính số tiền ban đầu cần thiết.',
      'Tiện lợi cho việc lập kế hoạch "từ mục tiêu".',
      'Kết quả tự động áp dụng vào kịch bản chính.',
    ],
  },
  calcHistory: {
    title: 'Lịch sử tính toán',
    body: [
      'Nhật ký tất cả các phép tính cho khách hàng hiện tại.',
      'So sánh các kịch bản và theo dõi thay đổi chiến lược.',
      'Xuất sang PDF để cung cấp cho khách hàng.',
    ],
  },
  currencyDisplay: {
    title: 'Hiển thị tiền tệ',
    body: [
      'Chọn tiền tệ để hiển thị số tiền.',
      'Không ảnh hưởng đến tính toán — chỉ để định dạng.',
      'Có thể cấu hình riêng cho từng khách hàng.',
    ],
  },
  pdfExport: {
    title: 'Xuất PDF',
    body: [
      'Tạo báo cáo PDF chuyên nghiệp cho kịch bản hiện tại.',
      'Bao gồm biểu đồ, bảng và tóm tắt.',
      'Sẵn sàng gửi cho khách hàng.',
    ],
  },
  createLetter: {
    title: 'Tạo thư',
    body: [
      'Tạo thư cá nhân hóa cho khách hàng dựa trên kịch bản hiện tại.',
      'Mẫu tự động điền dữ liệu tính toán.',
      'Chỉnh sửa và gửi trực tiếp từ ứng dụng.',
    ],
  },
  scenarioChart: {
    title: 'Biểu đồ kịch bản',
    body: [
      'Trực quan hóa tăng trưởng danh mục theo thời gian.',
      'Hiển thị số dư, tiền gửi và chiết khấu theo tháng.',
      'Nhấn vào một điểm để xem thông tin chi tiết.',
    ],
  },
  compareMode: {
    title: 'Chế độ so sánh',
    body: [
      'So sánh nhiều kịch bản cho một khách hàng cạnh nhau.',
      'Dùng để trình bày các chiến lược khác nhau.',
      'Xuất so sánh sang PDF.',
    ],
  },
  rankTiers: {
    title: 'Cấp bậc',
    body: [
      'Cấp bậc hiện tại của bạn và điều kiện lên cấp tiếp theo.',
      'Cấp bậc xác định tỷ lệ hoa hồng và tiền thưởng.',
      'Theo dõi tiến độ theo thời gian thực.',
    ],
  },
  partnerList: {
    title: 'Danh sách đối tác',
    body: [
      'Tất cả đối tác trong mạng lưới của bạn và trạng thái của họ.',
      'Theo dõi hoạt động và khối lượng nhóm.',
      'Nhấn vào đối tác để xem thông tin chi tiết.',
    ],
  },
  commissionEstimator: {
    title: 'Ước tính hoa hồng',
    body: [
      'Tính thu nhập dự kiến dựa trên khối lượng.',
      'Bao gồm doanh số cá nhân và tiền thưởng nhóm.',
      'Tự động cập nhật khi dữ liệu thay đổi.',
    ],
  },
  invitationVideos: {
    title: 'Video mời',
    body: [
      'Tài liệu video giới thiệu sản phẩm cho khách hàng tiềm năng.',
      'Chia sẻ liên kết hoặc gửi trực tiếp từ ứng dụng.',
      'Được nhóm cập nhật thường xuyên.',
    ],
  },
  adviserVideos: {
    title: 'Video cho cố vấn',
    body: [
      'Tài liệu đào tạo và cập nhật cho cố vấn.',
      'Xem video mới để nâng cao kỹ năng.',
      'Đánh dấu đã xem để theo dõi dễ dàng.',
    ],
  },
  lettersHub: {
    title: 'Trung tâm thư',
    body: [
      'Tạo và quản lý thư cá nhân hóa cho khách hàng.',
      'Nhật ký gửi — theo dõi gửi cho ai, phản hồi là gì và lên lịch theo dõi.',
      'Thiết lập Hồ sơ (⚙) — thêm tên, công ty và logo để tự động điền vào từng thư.',
    ],
  },
  assetGoalPlanner: {
    title: 'Công cụ lập kế hoạch mục tiêu tài sản',
    body: [
      'Nhập giá trị tài sản bạn muốn đạt được (ví dụ: $250.000). Công cụ tính toán liệu số tiền ban đầu và khoản tiền gửi hàng tháng của bạn có đưa bạn đến đó trong khung thời gian đã chọn hay không.',
      'Sử dụng các chip chọn nhanh để nhảy đến các giá trị mục tiêu phổ biến. Thanh tiến trình cho thấy bạn gần đạt mục tiêu đến đâu với các cài đặt hiện tại.',
      'Mẹo: kết hợp với tab Chiến lược để cho khách hàng thấy số tiền gửi chính xác cần thiết để đạt mục tiêu trong 5 hoặc 10 năm.',
    ],
  },
  projectedRevenueModel: {
    title: 'Mô hình doanh thu dự kiến',
    body: [
      'Kích thước cơ sở dữ liệu = tổng số liên hệ bạn có thể tiếp cận. Tỷ lệ chuyển đổi = phần trăm bạn kỳ vọng chuyển thành khách hàng. Cùng nhau chúng tính toán quy mô ước tính của nhóm và tổng khối lượng danh mục đầu tư.',
      'Tỷ lệ tái sử dụng chiết khấu % — khách hàng tái đầu tư bao nhiêu phần chiết khấu kim cương hàng tháng vào mua hàng mới. Tái sử dụng cao hơn có nghĩa là danh mục đầu tư tăng trưởng nhanh hơn và thu nhập thụ động cao hơn cho bạn.',
      'Phần pool của tôi = phần của bạn trong pool thưởng toàn cầu. Dòng thời gian 36 tháng cho thấy thu nhập thụ động của bạn tăng như thế nào khi nhóm phát triển.',
    ],
  },
  sentLog: {
    title: 'Nhật ký đã gửi và quy trình',
    body: [
      'Ghi lại mọi thư hoặc liên hệ bạn đã gửi. Nhập tên người nhận, loại thư, ngày gửi và tùy chọn ngày theo dõi để quản lý quy trình của bạn.',
      'Nhấn vào huy hiệu kết quả của một mục để chuyển qua các giai đoạn quy trình: Đang chờ → Đã phản hồi → Cuộc họp → Đã chuyển đổi → Không phản hồi.',
      'Đặt ngày theo dõi để nhận cảnh báo QUÁ HẠN khi ngày đó đã qua. Đánh dấu là Hoàn thành sau khi theo dõi. Các mục quá hạn hiển thị màu đỏ ở đầu màn hình.',
    ],
  },
  strategySummary: {
    title: 'Tóm Tắt Chiến Lược',
    body: [
      'Tổng quan chiến lược đầy đủ của bạn: tổng đầu tư, tổng chiết khấu kiếm được, giá trị kim cương cuối cùng và liệu mục tiêu hàng tháng có đạt được không.',
      'ROI và tháng hòa vốn cho thấy khi nào chiết khấu tích lũy bù đắp khoản đầu tư ban đầu.',
      'Sử dụng phần này để trình bày các con số chính cho khách hàng trước khi hiển thị bảng hàng tháng đầy đủ.',
    ],
  },
  companyMargin: {
    title: 'Cơ Chế Lợi Nhuận Công Ty',
    body: [
      'Diamond Solution thu mua kim cương thô trực tiếp từ mỏ với ~10% giá bán lẻ, cắt và chứng nhận nội bộ, bán B2B toàn cầu theo giá thị trường đầy đủ.',
      'Tích hợp dọc này loại bỏ 5-6 trung gian thường tăng giá 700%.',
      'Lợi nhuận từ việc bỏ qua chuỗi cung ứng tài trợ cho chiết khấu hàng tháng trả cho nhà đầu tư.',
    ],
  },
  monthlyDiscountSchedule: {
    title: 'Lịch Chiết Khấu Hàng Tháng',
    body: [
      'Bảng này hiển thị từng tháng của chiến lược: số dư kim cương, chiết khấu hàng tháng kiếm được, rút tiền và tổng tích lũy.',
      'Chuyển đổi giữa chế độ xem Hàng tháng và Hàng năm. Chế độ xem hàng năm lý tưởng cho thuyết trình khách hàng.',
      'Các hàng cuối năm được đánh dấu màu hổ phách. Kích hoạt VIP, nâng cấp SP và mốc quan trọng được đánh dấu trong bảng.',
    ],
  },
  bannerToggle: {
    title: 'Banner Đáo Hạn',
    body: [
      'Các banner màu xanh lá xuất hiện trong bảng hàng tháng khi một lô kim cương đến hạn — giá trị bị khóa được giải phóng và thêm vào số dư đang hoạt động của bạn.',
      'Sau 12 tháng hợp đồng miễn phí: bạn có thể chọn giao hàng miễn phí cho kim cương của mình hoặc nhận lại 100% khoản đầu tư ban đầu.',
      'Con số cho biết có bao nhiêu sự kiện đáo hạn xảy ra trong toàn bộ kỳ chiến lược của bạn.',
      'Nhấn nút để ẩn hoặc hiển thị tất cả banner đáo hạn. Ẩn để có chế độ xem gọn gàng hơn; hiển thị để giải thích các mốc tăng trưởng cho khách hàng.',
    ],
  },
};

const tips: Partial<Record<Language, TipMap>> = { en, nl, de, fr, es, it, pt, ru, zh, tl, ar, th, hi, vi };

export function getTip(lang: Language, key: TipKey): TipContent {
  return tips[lang]?.[key] ?? tips.en![key];
}
