# Diamond Solution Calculator - Project TODO

## Phase 1: Core Calculator Logic
- [x] Implement calculation engine (deposits, withdrawals, compound interest)
- [x] Create data models and TypeScript types
- [x] Build monthly result generation algorithm
- [x] Implement status and plan determination logic
- [x] Add VIP status tracking

## Phase 2: Home Screen & Navigation
- [x] Design and build Home screen layout
- [x] Implement tab navigation (Scenario Tool, Strategy Engineer, Settings)
- [x] Add language selector in header
- [x] Create navigation structure with Expo Router
- [x] Add app branding and logo

## Phase 3: Scenario Tool Screen
- [x] Build input form section (client name, goal, start amount, years)
- [x] Implement deposit configuration UI
- [x] Implement withdrawal configuration UI
- [x] Implement compound interest configuration UI
- [x] Create results table component
- [x] Add horizontal scroll for table columns
- [x] Implement calculation trigger and state management
- [x] Add summary statistics display
- [x] Add loading states during calculation

## Phase 4: Strategy Engineer Screen
- [x] Design strategy selection interface
- [x] Implement preset strategy templates (SP4, SP5, SP6, SP7)
- [ ] Build strategy parameter editor
- [ ] Add strategy save/load functionality
- [ ] Create strategy comparison view

## Phase 5: Settings & Configuration
- [x] Build Settings screen
- [x] Implement language switcher (EN, NL, DE, FR, ES)
- [x] Add theme toggle (Light/Dark mode)
- [ ] Add currency symbol preferences
- [x] Implement calculation history management
- [x] Add About & Help sections

## Phase 6: Multi-Language Support
- [x] Create translation dictionary for all 5 languages
- [x] Implement i18n context provider
- [x] Translate all UI labels and messages
- [x] Translate error messages and notifications
- [x] Test all language switches

## Phase 7: PDF Export
- [ ] Implement PDF generation from calculation results
- [ ] Design PDF layout and formatting
- [ ] Add PDF download functionality
- [ ] Test PDF on iOS and Android

## Phase 8: Data Persistence
- [x] Implement AsyncStorage for local calculations
- [x] Add calculation history storage
- [x] Implement user preferences storage
- [ ] Add data export/import functionality

## Phase 9: UI/UX Polish
- [x] Implement haptic feedback on interactions
- [x] Add loading indicators and spinners
- [x] Create error handling and validation
- [ ] Add success notifications
- [x] Implement smooth transitions between screens
- [x] Test responsive design on various screen sizes

## Phase 10: Testing & QA
- [x] Unit tests for calculation engine (26/26 passing)
- [ ] Integration tests for data flow
- [ ] Manual testing on iOS device
- [ ] Manual testing on Android device
- [ ] Manual testing on web browser
- [ ] Performance testing and optimization
- [ ] Accessibility testing

## Phase 11: Branding & Assets
- [x] Generate app logo/icon
- [x] Create splash screen
- [x] Update app.config.ts with branding
- [x] Create favicon for web
- [x] Design Android adaptive icon

## Phase 12: Deployment Preparation
- [ ] Create checkpoint
- [ ] Prepare app for publishing
- [ ] Generate APK/IPA builds
- [ ] Test builds on real devices
- [ ] Create user documentation

---

## Completed Items
(Items marked as [x] will be moved here)

## Bug Fixes (Apr 15 2026)
- [x] Fix Scenario Tool: results not rendering after calculation (FlatList inside ScrollView)
- [x] Fix gradient classes not working in React Native (replace with LinearGradient)
- [x] Fix Settings theme toggle (connect to global ThemeProvider)
- [x] Fix Clear History button (add onPress handler)
- [x] Fix Strategy Engineer: strategy cards do nothing when tapped
- [x] Fix haptics crashing on web (add Platform.OS guard)

## Critical Fixes - Match Original Calculator (Apr 15 2026)
- [x] Rewrite calculator engine with correct SP rates (SP4=3.0%, SP5=3.1%, SP6=3.2%, SP7=3.3% base + VIP +3.0%)
- [x] Implement full VIP system: $1000 cost, 12-month duration, +3.0% rate, $84/month into vipPot
- [x] Fix withdrawal logic: fixed amount + percentage of gross yield, capped at available balance
- [x] Fix compound logic: comp% of (available - withdrawal) goes to compPot; added to cap only when compPot >= 100
- [x] Add per-month data model: each month has individual stort, opn, opnP, comp values
- [x] Add bulk operations: bulk deposit (from-till), annual deposit, bulk withdrawal (from), bulk out% (from), bulk compound% (from-till)
- [x] Add VIP toggle switch to Scenario Tool
- [x] Add Goal input and Goal Progress bar to Scenario Tool
- [x] Fix summary stats: Total In, Total Out, ROC Break-Even, Wallet (wallet+vipPot+compPot), VIP Cost, Net Result, Max Monthly Out
- [x] Rebuild Scenario Tool results table with all columns: M, Diamonds, Deposit, Out%, Withdrawal, Compound%, Plan, Discount, Status, Total Diamonds
- [x] Completely rebuild Strategy Engineer: 4 Plans (A/B/C/D) with binary search goal planning
- [x] Add SP Level Breakdown table to Strategy Engineer
- [x] Add "Apply to Scenario" bridge from Strategy Engineer to Scenario Tool

## Auto-Fill Bridge Feature (Apr 15 2026)
- [x] Add "Apply Plan A/B/C/D" button to each plan card in Strategy Engineer
- [x] Pass plan values via Expo Router params to Scenario Tool
- [x] Auto-fill Scenario Tool fields when navigated from Strategy Engineer (startAmount, years, monthlyDeposit, outP, vip, goalAmount)
- [x] Show green "Applied from Strategy Engineer" confirmation banner in Scenario Tool (auto-dismisses after 5s)

## Major Improvements Batch (Apr 15 2026)
- [x] Fix translations: wire language selector to context so all UI text switches language across all screens
- [x] Correct SP1 rate to 2.2%, SP2 to 2.45%, SP3 to 2.7% (+ VIP +3.0% each)
- [x] Add SP1/SP2/SP3 rows to SP Level Overview on Home screen
- [x] Add VIP info line: "+3.0% bonus rate — costs $1,000 for 12 months" to Home screen
- [x] PDF Export: add Export PDF button to Scenario Tool results
- [x] PDF: professional layout with client name, inputs, summary stats, monthly breakdown table
- [x] Help Article 1: How to Use the Calculator (step-by-step walkthrough)
- [x] Help Article 2: Understanding Investment Strategies (4 plans with examples, SP levels, VIP, compound)
- [x] Help Article 3: Reading the Monthly Breakdown (column-by-column, color legend)
- [x] Help Article 4: Disclaimer (mathematical calculations only, not financial advice, own risk)

## Native Android Color Fix (Apr 16 2026)
- [ ] Fix row background colors in monthly breakdown table (green/orange/red status rows)
- [ ] Fix status badge colors (GROWING/VIP/WITHDRAWAL text badges)
- [ ] Fix summary card colored values (Total In, Total Out, Final Balance)
- [ ] Fix goal progress bar color
- [ ] Ensure all StyleSheet.create() colors use explicit hex strings (no CSS vars on native)
- [ ] Test all color fixes render correctly in web preview before publishing

## Major Feature Batch (Apr 16 2026)
- [ ] Rename "Diamond Solution" → "Plan B" everywhere (app name, all screens, translations, PDF)
- [ ] Add Russian (RU) language — full translations for all screens
- [ ] Add Chinese (ZH) language — full translations for all screens
- [ ] Add Goal Cards section to Home screen (Family & Legacy, Home & Property, Lifestyle & Passion, Freedom & Wealth)
- [ ] Each Goal Card has EXPLANATION modal and CALCULATE button (pre-fills Scenario Tool)
- [ ] Build Affiliate screen with referral link display and Copy/Share buttons
- [ ] Add 3-level compensation structure (10% direct, 5% level 2, 3% level 3)
- [ ] Add Diamond Bonus Plan table (Emerald $1K → Black Diamond $5M, total $8.326M)
- [ ] Add bonus description: paid in real diamond value (carats, sealed Plexiglas, GIA certificate)
- [ ] Add referral code input field to Settings screen
- [ ] Wire referral code to build full link: https://diamond-solution.net/user/register?reference={code}
- [ ] Show referral link on Affiliate screen with Copy and Share buttons
- [ ] Add Affiliate tab to bottom navigation

## APK Bug Fixes — Translations, Fonts, Colors (Apr 21 2026)
- [x] Root cause diagnosed: Affiliate screen body text was hardcoded English (not wired to t())
- [x] Root cause diagnosed: fontWeight "900" causes font substitution on Android (double-line effect)
- [x] Root cause diagnosed: containerClassName="bg-[#0f172a]" (JIT arbitrary value) unreliable on native APK
- [x] Root cause diagnosed: console.log in ThemeProvider fires on every render (performance + noise)
- [x] Add all missing Affiliate translation keys to all 7 languages: commission1Title/Desc, commission2Title/Desc, commission3Title/Desc, howItWorksStep1-5, diamondBonusDesc, totalPotentialBonuses, giaNote, actionAlertTitle, actionAlertDesc, rankHeader, partnersHeader, bonusHeader, caratsHeader
- [x] Wire all Affiliate screen body text to t(language, key) — no more hardcoded English
- [x] Replace fontWeight "900" with "bold" in index.tsx, scenario-tool.tsx, strategy-engineer.tsx (Android compatibility)
- [x] Add includeFontPadding: false to text styles in affiliate.tsx to prevent double-line on Android
- [x] Add bgColor prop to ScreenContainer component for reliable native background color
- [x] Replace containerClassName="bg-[#0f172a]" with bgColor="#0f172a" in index.tsx, affiliate.tsx, scenario-tool.tsx, strategy-engineer.tsx
- [x] Remove console.log from ThemeProvider (was firing on every render)
- [x] 26/26 unit tests passing, 0 TypeScript errors

## APK Visual & Functional Fixes Batch (Apr 22 2026)
- [x] Fix double-line/italic font on all screens (scenario-tool, help-article, affiliate, settings, disclaimer)
- [x] Fix double $$ sign in Current Status summary cards (Total In, Total Out, Final Balance, Net Result, etc.)
- [x] Fix monthly breakdown VIP row background color (brown → dark navy, only badge stays colored)
- [x] Fix summary card colors: Total In = red text, Net Result = green text, Discount = green text
- [x] Fix Withdrawal amount text: green color when withdrawal > 0
- [x] Fix Diamond Bonus Plan total amount — corrected to $8,326,000 with official 9 ranks
- [x] Update Commission Structure text with correct professional wording from official plan
- [x] Fix PDF export crash on Android (expo-sharing NoSuchMethodError → use IntentLauncher + Print.printAsync for iOS)

## Pro Compensation Calculator (Apr 22 2026)
- [x] Add all translation keys for Pro Compensation Calculator to all 7 languages
- [x] Build pro-compensation.tsx screen with 4 bonus types (Unilevel, Infinity, Matching, World Pools)
- [x] Free-entry avg monthly value field (min $110) with quick-select presets
- [x] World Pools shares by rank: Blue Diamond=1, Green=2, Purple=3, Elite=4, Double=5, Triple=6, Black=7
- [x] World Pools: user enters value per share from their backoffice, app multiplies by shares
- [x] Growth Projection section (monthly growth % + years → projected monthly income range)
- [x] Add "Pro Compensation Calculator" button on Affiliate screen
- [x] Register route in Expo Router
- [x] Full 7-language translations

## Dark Mode Removal & Font Fix Batch (Apr 22 2026)
- [x] Remove dark mode entirely — lock app to dark navy theme only
- [x] Replace all NativeWind color tokens (text-foreground, bg-background etc.) with hardcoded hex in StyleSheet
- [x] Remove ThemeProvider light/dark toggle logic
- [x] Remove dark mode toggle from Settings screen
- [x] Fix all NativeWind className on Text components (root cause of double-line font on Android)
- [x] Fix Total Out color: change from red to green
- [x] Swap Tool 1 (Scenario) and Tool 2 (Strategy) order on Home screen
- [x] Wire Goal Card CALCULATE button to Strategy Engineer (pre-filled with goal amount)
- [x] Translate Goal Card titles, subtitles, descriptions, and amounts in all 7 languages (EN, NL, DE, FR, ES, RU, ZH)

## APK Color & Font Fix Batch (Apr 23 2026)
- [x] Fix double-line font on APK — fontWeight 800 → bold in help-article.tsx, strategy-engineer.tsx
- [x] Fix SP2 range: $1K–$2.5K (was $1K–$2K), SP3 range: $2.5K–$5K (was $2K–$5K) in Home screen
- [x] Fix missing colors in APK calculator — ScreenContainer now bypasses NativeWind CSS vars when bgColor is set, inner View gets explicit backgroundColor on all 3 layers
- [x] Verified all colored rows (VIP, withdrawal, growing) use explicit hex in StyleSheet.create

## Professional Launch Update (Apr 24 2026)

### Section 1: Font & Readability
- [x] App-wide font upgrade: body 16-17sp, headings 18-20sp, bold readable (Arial-style)
- [x] Apply consistent font sizes across all screens

### Section 2: Onboarding Screen "Why You Need a Plan B"
- [x] New onboarding screen shown after language selection (before Home)
- [x] Headline: "Most People Don't Have a Plan B"
- [x] Subheadline text as specified
- [x] 4 benefit cards with icons/logos: Monthly Rebates, 100% Capital Protection, GIA-Certified Physical Diamonds, Legacy & Inheritance
- [x] Tap-to-show tooltips on each card (full expanded text in modal)
- [x] Big CTA button: "Build My Personal Plan B" → Strategy Engineer
- [x] Translate all text into 7 languages (EN, NL, DE, FR, ES, RU, ZH)

### Section 3: Partner Mode
- [x] Partner Mode toggle in Settings (password protected, PIN: 4837)
- [x] OFF (default): Hide entire Affiliate tab from tab bar
- [x] ON: Show Affiliate tab + Strategic Partner Tools tab

### Section 4: Strategic Partner Tools Tab
- [x] Tab only visible when Partner Mode ON
- [x] Potential Calculator: Database size + Conversion % → projected clients + commission
- [x] Call List Dashboard: Partner list with name, WhatsApp, country, start date, amount
- [x] Call List alerts: $100+ rebate ready, 90-day audit, 30 days before 12-month end
- [x] Property Optimizer: monthly property costs → which SP + VIP covers it

### Section 5: Office Location Selector
- [x] Office Location selector in Settings (Vienna, Dubai, Manila, Florida)
- [x] Selected office appears in every PDF footer with regulatory numbers

### Section 6: FAQ Section
- [x] FAQ accordion (12 questions) added under Help tab
- [x] All 12 questions with exact answers as specified (EN, NL, DE, FR, ES, RU, ZH)
- [x] Add Q13: What is the minimum and maximum investment?
- [x] Add Q14: What is Diamond Solution and where is it based?
- [x] Add Q15: How do I track my diamonds and rebates?
- [x] Add Q16: Can I have multiple Solution Plans at the same time?
- [x] Add Q17: What happens if I want to exit before 12 months?
- [x] Add Q18: Is my investment insured or protected?

### Section 7: PDF Export Fix
- [ ] Fix "Failed to generate PDF" error
- [ ] Professional quotation layout: Plan B logo + QUOTATION header
- [ ] Client name + selected office location
- [ ] SP level table with monthly rebate % and 12-month total
- [ ] 100% Buyback Guarantee note
- [ ] Inheritance Clause (bordered box)
- [ ] Tax Notice
- [ ] 11-month decision note + deposit/withdraw methods
- [ ] Footer with office regulatory numbers
- [ ] Works in web version too

### Section 8: Netlify Deployment
- [x] Netlify deployment instructions prepared for user (drag-and-drop method)

### Section 9: Compliance Tab
- [x] New Compliance tab with 5 viewable documents (opens in system browser)
- [x] SIRA Certificate (Dubai)
- [x] DMCC e-License (Dubai Freezone, License No. 1007195)
- [x] SEC Philippines Certificate (Reg. No. 2026030241228-02)
- [x] Sample GIA Certificate (GIA Report 3405502857)
- [x] Legal Information Memorandum (EN)
- [x] Regulatory summary bar (DMCC, SEC Philippines, GIA Certified)
- [x] All 5 PDFs uploaded to CDN with permanent URLs

## Call List Dashboard Fixes (Apr 24 2026)
- [x] Add 11-month alert: "11-Month Decision Due — Partner must choose: Home Delivery or 100% Buyback"
- [x] Fix date input format: use DD-MM-YYYY (European format) globally
- [x] Date display in partner cards: show DD-MM-YYYY format with start date visible
- [x] Alert calculation: all 5 alerts (rebate, 90-day, 11m, 30-days, 12m) recalculated from DD-MM-YYYY start date
- [x] Legacy YYYY-MM-DD dates still parse correctly (backward compatibility)

## Netlify Deployment Fix (Apr 24 2026)
- [x] Add _redirects file to dist/ folder for SPA routing (/* /index.html 200)
- [x] Build web export (expo export --platform web) — 1.3MB ZIP
- [x] Package dist folder as ZIP for Netlify drag-and-drop

## 8-Fix Batch (Apr 25 2026)
- [x] Translate Partner Tools tab into all 7 languages (EN, NL, DE, FR, ES, RU, ZH)
- [x] Translate Compliance tab into all 7 languages
- [x] Add QR scan note to GIA compliance entry
- [x] Add contact moment warning options to Call List (configurable per partner)
- [x] Fix Help article text color to white (not headers)
- [x] Add How to Use / Understanding Monthly Breakdown / Disclaimer sections to Settings Help (already present)
- [x] Remove Affiliate Program card from Home screen (visible only in Partner Mode)
- [x] Add Net Result % to Scenario Tool output
- [x] Upload Purchase Agreement PDF and add to Compliance tab

## Videos Tab (Apr 25 2026)
- [x] Build Videos screen with YouTube channel @wealthpreservation101
- [x] Show 2 videos with thumbnails, titles, duration, view count
- [x] Tap video → opens YouTube in browser
- [x] Subscribe button → opens channel page
- [x] Full 7-language translations (EN, NL, DE, FR, ES, RU, ZH)
- [x] Add Videos tab to bottom navigation (play.rectangle.fill icon)

## Property Optimizer → Scenario Tool Bridge (Apr 25 2026)
- [x] Add 'Open in Scenario Tool' button to Property Optimizer result box
- [x] Button pre-fills deposit (optimizer amount), VIP, and 10-year horizon
- [x] Monthly property cost set as fixed withdrawal (opn) from month 61 to 120
- [x] Scenario Tool receives params via route and auto-fills with banner confirmation
- [x] Full 7-language button translations
- [x] 0 TypeScript errors

## Netlify 404 Fix (Apr 25 2026)
- [x] Add _redirects file for SPA routing
- [x] Add netlify.toml with redirect rules
- [x] Rebuild expo web export
- [x] Re-deploy to Netlify (zip ready for manual drag-and-drop)

## Referral + Disclaimer + Vimeo Batch (Apr 25 2026)
- [x] Fix referral code: Register Now button auto-fills affiliate link
- [x] Add persistent legal disclaimer + trademark on all calculation screens
- [x] Research Vimeo channel and advise on integration (36 videos found, recommendation provided)
- [x] Add Vimeo videos to Videos tab (pending user approval)

## Next Steps Batch (Apr 25 2026)
- [x] Add Vimeo JPP videos (EN/DE/ES/NL/HU/SRB) with language filter to Videos tab
- [x] YouTube RSS auto-sync for new videos (no API key needed)
- [x] FAQ VIP3 Bonus entry in all 7 languages
- [x] TypeScript 0 errors + Netlify deployed

## Partner Tools + Onboarding + Alerts Batch (Apr 25 2026)
- [ ] Fix Property Optimizer SP thresholds (SP6=$50K, SP7=$100K) and representative deposit amounts
- [ ] Fix Property Optimizer withdrawal start: from Month 1 (not Month 61)
- [ ] Add total volume row to Potential Calculator
- [ ] Add language selector (7 languages) to onboarding screen
- [ ] Add "Back to Onboarding" option in Settings
- [ ] Implement push notifications for contact moment alerts (Option D)
- [ ] In-app modal pop-up when alert fires while app is open
- [ ] TypeScript check + Netlify deploy

## Partner Tools + Onboarding + Notifications Batch (Apr 26 2026)
- [x] Fix Property Optimizer: SP6=$50K, SP7=$100K (correct thresholds matching calculator.ts)
- [x] Fix Property Optimizer: withdrawal starts from Month 1 (not Month 61)
- [x] Add Total Volume row to Potential Calculator result
- [x] Add language selector (7 flags) to Onboarding screen
- [x] Add "View Introduction Again" button in Settings Help section
- [x] Add viewOnboarding translation key to all 7 languages
- [x] Implement Option D contact moment alerts: push notifications + in-app modal
- [x] Create lib/notifications.ts service (permission request, schedule, cancel)
- [x] Wire notifications into savePartner (schedule) and deletePartner (cancel)
- [x] In-app alert modal shows when notification fires while app is open
- [x] 0 TypeScript errors + Netlify deployed (all 9 routes 200 OK)

## Property Optimizer Rebuild (Apr 26 2026)
- [x] Extract Plan D binary search engine from Strategy Engineer
- [x] Rebuild Property Optimizer using Plan D logic
- [x] Show both VIP and non-VIP results side by side
- [x] Display: required deposit, SP level, rate, monthly rebate, annual rebate
- [x] Update "Open in Scenario Tool" to use Plan D values
- [x] TypeScript check + Netlify deploy

## Optimizer Upgrade + STIG Compliance Batch (Apr 26 2026)
- [x] Upgrade Property Optimizer to 75% withdrawal rate engine (target monthly income input)
- [x] Add Savings Goal mode to Property Optimizer
- [x] Add Asset Goal Planner (lump-sum property/car goal with timeframe)
- [x] Add STIG International card to Compliance in 7 languages
- [x] TypeScript check + Netlify deploy

## Asset Goal Planner Fix (Apr 26 2026)
- [x] Fix calculateAsset: target = Total Out (sum of all monthly withdrawals) = goal amount, NOT monthly withdrawal = goal
- [x] Default years to 5 (not 10) in Asset Goal Planner
- [x] Auto-set Out% to 80% in Asset Goal Planner (fixed, not user-editable)
- [x] Result display: show required deposit, SP level, rate, total out over N years, monthly withdrawal estimate
- [x] TypeScript check + Netlify deploy

## Scenario Tool Param Fix (Apr 26 2026)
- [x] Fix: years param from Asset Goal Planner not applied in Scenario Tool
- [x] Fix: outP=80 param from Asset Goal Planner not applied in Scenario Tool Out% field
- [x] TypeScript check + Netlify deploy
