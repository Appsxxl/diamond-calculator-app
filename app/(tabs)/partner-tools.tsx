import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  FlatList,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { stratSimulate, getSPLevel, getNetDeposit, runCalculation, createDefaultMonthData } from "@/lib/calculator";
import type { MonthData } from "@/lib/calculator";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import {
  setupNotificationHandler,
  requestNotificationPermission,
  schedulePartnerNotifications,
  cancelPartnerNotifications,
} from "@/lib/notifications";
import { t } from "@/lib/translations";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Partner {
  id: string;
  name: string;
  whatsapp: string;
  country: string;
  startDate: string; // DD-MM-YYYY format
  amount: number;
  level?: 1 | 2 | 3;
  contactMoments: string[]; // selected alert types
}

const STORAGE_KEY = "partner_list";

const DIAMOND_TIERS = [
  { rank: "Partner",              emoji: "🤝", teamVol: "$0",           infinity: "—",    bonus: "—"          },
  { rank: "Pearl",                emoji: "🤍", teamVol: "$100",          infinity: "—",    bonus: "—"          },
  { rank: "Ruby",                 emoji: "❤️", teamVol: "$500",          infinity: "—",    bonus: "—"          },
  { rank: "Sapphire",             emoji: "💙", teamVol: "$25,000",       infinity: "3.0%", bonus: "—"          },
  { rank: "Emerald",              emoji: "💚", teamVol: "$50,000",       infinity: "6.0%", bonus: "$1,000"     },
  { rank: "Diamond",              emoji: "💎", teamVol: "$250,000",      infinity: "9.0%", bonus: "$5,000"     },
  { rank: "Blue Diamond",         emoji: "🔵", teamVol: "$1,000,000",    infinity: "12.0%", bonus: "$20,000"   },
  { rank: "Green Diamond",        emoji: "💚", teamVol: "$2,500,000",    infinity: "15.0%", bonus: "$50,000"   },
  { rank: "Purple Diamond",       emoji: "💜", teamVol: "$5,000,000",    infinity: "18.0%", bonus: "$100,000"  },
  { rank: "Diamond Elite",        emoji: "💎", teamVol: "$10,000,000",   infinity: "21.0%", bonus: "$150,000"  },
  { rank: "Double Diamond Elite", emoji: "👑", teamVol: "$50,000,000",   infinity: "22.0%", bonus: "$1,000,000"},
  { rank: "Triple Diamond Elite", emoji: "🏆", teamVol: "$150,000,000",  infinity: "23.0%", bonus: "$2,000,000"},
  { rank: "Black Diamond",        emoji: "⚫", teamVol: "$500,000,000",  infinity: "24.0%", bonus: "$5,000,000"},
];
const REFERRAL_STORAGE_KEY = "referral_code";
const REFERRAL_BASE = "https://diamond-solution.net/user/register?reference=";
const NAVY = "#0d1a2a";
const GOLD = "#e67e22";
const GREEN = "#22c55e";
const BLUE = "#33C5FF";
const POOL_MAX = { pool1: 6, pool2: 4, pool3: 2 };
const BLUE_DIAMOND_THRESHOLD = 1_000_000;

// fetchDailyStats() — replace URL with real API endpoint when backend is ready
// Shape: { globalTurnover, pool1Parts, pool2Parts, pool3Parts }
const fetchDailyStats = async () => ({
  globalTurnover: 10_000_000,
  pool1Parts: 4,
  pool2Parts: 2,
  pool3Parts: 1,
});

const fmtM = (n: number) =>
  n >= 1_000_000 ? `$${(n/1_000_000).toFixed(2)}M`
  : n >= 1_000 ? `$${(n/1_000).toFixed(1)}K`
  : `$${n.toFixed(0)}`;

function parseVol(s: string): number { return parseFloat(s.replace(/[$,]/g, "")) || 0; }
function parseInfPct(s: string): number { return s === "—" ? 0 : parseFloat(s) / 100; }
function parseRankBonus(s: string): number { return s === "—" ? 0 : parseFloat(s.replace(/[$,]/g, "")) || 0; }

function calcTimeline(
  dbSize: number, convRate: number, avgPurchase: number,
  rebateReuseP: number, myParts: number,
  stats: { globalTurnover: number; pool1Parts: number; pool2Parts: number; pool3Parts: number }
) {
  const clients = Math.floor(dbSize * (convRate / 100));
  const teamVolume = clients * avgPurchase;
  const poolUnlocked = teamVolume >= BLUE_DIAMOND_THRESHOLD;

  // Pool payouts — fixed monthly from global turnover
  // Pool 1: $10M × 1% ÷ 500 estimated total parts × myParts (projected share)
  const ESTIMATED_TOTAL_PARTS = 500;
  const pool1PerPart = (stats.globalTurnover * 0.01) / ESTIMATED_TOTAL_PARTS;
  const pool1 = poolUnlocked ? pool1PerPart * Math.min(myParts, POOL_MAX.pool1) : 0;
  const pool2PerPart = (stats.globalTurnover * 0.01) / ESTIMATED_TOTAL_PARTS;
  const pool2 = poolUnlocked ? pool2PerPart * Math.min(myParts, POOL_MAX.pool2) : 0;
  const pool3PerPart = (stats.globalTurnover * 0.01) / ESTIMATED_TOTAL_PARTS;
  const pool3 = poolUnlocked ? pool3PerPart * Math.min(myParts, POOL_MAX.pool3) : 0;
  const totalPoolMonthly = pool1 + pool2 + pool3;

  // RECURSIVE COMPOUNDING MATH:
  // Each client starts with avgPurchase diamonds.
  // Each month: client earns rebate (SP rate ~3.3%), uses rebateReuseP% to buy more diamonds.
  // Their portfolio grows → rebate grows → Agent's 10% residual grows every month.
  // We simulate all 60 months and pick milestone snapshots.
  const SP_BASE_RATE = 0.033; // 3.3% base rebate rate
  const reuseDecimal = rebateReuseP / 100;

  const milestones = [1, 3, 6, 12, 24, 36, 48, 60];
  const labels: Record<number,string> = {
    1:"Mo.1", 3:"Mo.3", 6:"Mo.6", 12:"Yr.1",
    24:"Yr.2", 36:"Yr.3", 48:"Yr.4", 60:"Yr.5"
  };

  // Run full 60-month recursive simulation
  // KEY: portfolio grows every month → rebate grows → agent residual grows
  type MonthRow = { month: number; label: string; clientPortfolio: number; monthlyRebate: number; agentResidual10pct: number; cumulative: number };
  const allMonths: MonthRow[] = [];
  let clientPortfolio = avgPurchase; // starts at initial purchase per client
  // Month 1: Agent earns 10% initial commission on the purchase itself
  let cumulativeResidual = avgPurchase * 0.10 * clients;

  for (let m = 1; m <= 60; m++) {
    // Rebate this month based on CURRENT portfolio (grows each month)
    const monthlyRebate = clientPortfolio * SP_BASE_RATE;
    // Client reinvests rebateReuseP% as a new diamond purchase → portfolio grows
    const reinvested = monthlyRebate * reuseDecimal;
    // Portfolio grows BEFORE next calculation → true compounding
    clientPortfolio += reinvested;
    // Agent earns 10% of each client's reinvestment (the new purchase)
    const agentPerClient = reinvested * 0.10;
    const totalAgentResidual = agentPerClient * clients;
    cumulativeResidual += totalAgentResidual;

    if (milestones.includes(m)) {
      allMonths.push({
        month: m,
        label: labels[m],
        clientPortfolio,              // grows every milestone — visible compound growth
        monthlyRebate: monthlyRebate * clients,
        agentResidual10pct: totalAgentResidual, // grows every milestone
        cumulative: cumulativeResidual,
      });
    }
  }

  const peakRow = allMonths[allMonths.length - 1];
  const peakMonthly = (peakRow?.agentResidual10pct ?? 0) + totalPoolMonthly;

  return {
    clients, teamVolume, poolUnlocked,
    pool1Payout: pool1, pool2Payout: pool2, pool3Payout: pool3,
    totalPoolMonthly, peakMonthly,
    pool1PerPart, pool2PerPart, pool3PerPart,
    timeline: allMonths.map(row => ({
      month: row.month,
      label: row.label,
      clientPortfolio: row.clientPortfolio,
      agentResidual: row.agentResidual10pct,
      poolBonus: totalPoolMonthly,
      monthly: row.agentResidual10pct + totalPoolMonthly,
      cumulative: row.cumulative,
    })),
  };
}

// ─── Translations ─────────────────────────────────────────────────────────────
const TX: Record<string, {
  title: string;
  // Potential Calculator
  potentialTitle: string;
  potentialDesc: string;
  dbSizeLabel: string;
  convRateLabel: string;
  avgAmountLabel: string;
  calcPotentialBtn: string;
  estClients: string;
  directVolume: string;
  directComm: string;
  rebatePool: string;
  // Call List
  callListTitle: string;
  addBtn: string;
  noPartners: string;
  noPartnersDesc: string;
  month: string;
  started: string;
  // Property Optimizer
  propTitle: string;
  propDesc: string;
  propCostLabel: string;
  findPlanBtn: string;
  recPlan: string;
  depositReq: string;
  rebateRate: string;
  vipReq: string;
  vipYes: string;
  vipNo: string;
  propNote: string;
  withoutVip: string;
  withVip: string;
  monthlyRebate: string;
  annualRebate: string;
  applyToScenario: string;
  applyToStrategyNote: string;
  applyNoVip: string;
  applyWithVip: string;
  // Savings Goal
  savingsTitle: string;
  savingsDesc: string;
  savingsGoalLabel: string;
  findSavingsBtn: string;
  savingsNote: string;
  // Asset Goal Planner
  assetTitle: string;
  assetDesc: string;
  assetTargetLabel: string;
  assetYearsLabel: string;
  findAssetBtn: string;
  assetNote: string;
  assetApplyNoVip: string;
  assetApplyWithVip: string;
  // Modal
  addPartner: string;
  editPartner: string;
  nameLabel: string;
  whatsappLabel: string;
  countryLabel: string;
  startDateLabel: string;
  amountLabel: string;
  contactMomentsLabel: string;
  cancelBtn: string;
  saveBtn: string;
  missingInfo: string;
  missingInfoMsg: string;
  invalidAmount: string;
  invalidAmountMsg: string;
  removePartner: string;
  removeConfirm: string;
  removeCancel: string;
  removeOk: string;
  // Alert labels
  alertRebate: string;
  alert90day: string;
  alert11month: string;
  alert30day: string;
  alert12month: string;
  clientLetterTitle: string;
  clientLetterDesc: string;
  alertsCount: string;
  diamondStability: string;
  onTopOfResidual: string;
  rankMoreTo: string;
  rankUnlocksInfinity: string;
  placeholderCustomAmount: string;
  placeholderTargetAmount: string;
  placeholderYears: string;
  carTip: string;
  targetPrefix: string;
  depositLabel: string;
  totalOutLabel: string;
  avgMoLabel: string;
  fullLabel: string;
  pct75Label: string;
  projRevTitle: string;
  projRevDesc: string;
  projRevDbSize: string;
  projRevConv: string;
  projRevAvgPurchase: string;
  projRevRebateReuse: string;
  projRevMyParts: string;
  projRevCalcBtn: string;
  projRevEstClients: string;
  projRevTeamVol: string;
  projRevYr5: string;
  projRevTimeline: string;
  projRevPeriod: string;
  projRevResidualCol: string;
  projRevPortfolioCol: string;
  projRevCumulativeCol: string;
  globalPoolTitle: string;
  globalPoolDesc: string;
  yourTeamVol: string;
  blueDiamondGateLabel: string;
  blueDiamondUnlocked: string;
  remainingToBlue: string;
  pool1Title: string;
  pool2Title: string;
  pool3Title: string;
  poolMinRankP1: string;
  poolMinRankP2: string;
  poolMinRankP3: string;
  activePoolTotal: string;
  totalQualUsers: string;
  myPartsLabel: string;
  yourPayoutLabel: string;
  fromBackOffice: string;
  noMembersYet: string;
  totalPoolPayoutLabel: string;
  poolFormulaNote: string;
  levelLabel: string;
  arVaultDesc: string;
  okBtn: string;
}> = {
  en: {
    title: "🤝 Partner Tools",
    potentialTitle: "📊 PROJECTED REVENUE MODEL",
    potentialDesc: "Estimate your earning potential based on your contact database size and conversion rate.",
    dbSizeLabel: "Your Database Size (contacts)",
    convRateLabel: "Estimated Conversion Rate (%)",
    avgAmountLabel: "Average Product Purchase ($)",
    calcPotentialBtn: "Calculate Potential",
    estClients: "Estimated Clients",
    directVolume: "Total Volume Generated",
    directComm: "Direct Residual Income (10%)",
    rebatePool: "Global Pool Bonus (~3%)",
    callListTitle: "📋 CALL LIST DASHBOARD",
    addBtn: "+ Add",
    noPartners: "No partners yet",
    noPartnersDesc: "Tap \"+ Add\" to add your first partner with their details, start date, and investment amount.",
    month: "Month",
    started: "Started",
    propTitle: "🏠 PROPERTY OPTIMIZER",
    propDesc: "Enter your monthly property costs. The optimizer will tell you which Solution Plan (with or without VIP) covers those costs.",
    propCostLabel: "Monthly Property Cost ($)",
    findPlanBtn: "Find My Plan",
    recPlan: "Recommended Plan",
    depositReq: "Deposit Required",
    rebateRate: "Monthly Rebate Rate",
    vipReq: "VIP Required",
    vipYes: "Yes (+$1,000)",
    vipNo: "No",
    propNote: "Monthly rebate covers your property cost.",
    withoutVip: "Without VIP",
    withVip: "With VIP",
    monthlyRebate: "Monthly Rebate",
    annualRebate: "Annual Rebate",
    applyToScenario: "📊 Open in Scenario Tool",
    applyToStrategyNote: "Pre-fills deposit, VIP, and monthly withdrawal from Month 1",
    applyNoVip: "📊 Apply (No VIP)",
    applyWithVip: "📊 Apply (With VIP)",
    addPartner: "Add Partner",
    editPartner: "Edit Partner",
    nameLabel: "Name *",
    whatsappLabel: "WhatsApp Number",
    countryLabel: "Country",
    startDateLabel: "Start Date (DD-MM-YYYY)",
    amountLabel: "Investment Amount ($) *",
    contactMomentsLabel: "Contact Moment Alerts",
    cancelBtn: "Cancel",
    saveBtn: "Save",
    missingInfo: "Missing Info",
    missingInfoMsg: "Name and amount are required.",
    invalidAmount: "Invalid Amount",
    invalidAmountMsg: "Please enter a valid amount.",
    removePartner: "Remove Partner",
    removeConfirm: "Are you sure?",
    removeCancel: "Cancel",
    removeOk: "Remove",
    alertRebate: "💰 Rebate ready",
    alert90day: "📋 90-day audit due",
    alert11month: "📅 11-Month Decision Due — Choose: Home Delivery or 100% Buyback",
    alert30day: "⏰ 30 days to cycle end — confirm partner's decision",
    alert12month: "🔴 12-month cycle ended — action needed immediately",
    savingsTitle: "💸 LIFESTYLE CASH FLOW",
    savingsDesc: "Passive income for cars, travel, and more. Enter your target monthly income and we find the deposit where 75% of the rebate covers your goal — protecting your capital.",
    savingsGoalLabel: "Target Monthly Income ($)",
    findSavingsBtn: "Find My Savings Plan",
    savingsNote: "75% of monthly rebate = your target income. Capital stays intact.",
    assetTitle: "🏡 ASSET GOAL PLANNER",
    assetDesc: "Want to buy a property or car outright? Enter your target amount and timeframe. We find the deposit that accumulates that lump sum through compounding rebates.",
    assetTargetLabel: "Target Amount ($)",
    assetYearsLabel: "Timeframe (years)",
    findAssetBtn: "Find My Asset Plan",
    assetNote: "Compound rebates build your lump sum. 20% reinvested monthly.",
    assetApplyNoVip: "📊 Apply (No VIP)",
    assetApplyWithVip: "📊 Apply (With VIP)",
    clientLetterTitle: "Client Letter Generator",
    clientLetterDesc: "Create a professional introduction letter in your language — ready to copy or share instantly.",
    alertsCount: "{count} alerts",
    diamondStability: "💎 Diamond Stability",
    onTopOfResidual: "✨ On top of your monthly residual income",
    rankMoreTo: "{amount} more to {rank}",
    rankUnlocksInfinity: "(Unlocks {pct} Infinity)",
    placeholderCustomAmount: "Custom amount",
    placeholderTargetAmount: "Target amount",
    placeholderYears: "Years",
    carTip: "🚗 Perfect for planning your monthly luxury car lease or premium lifestyle costs.",
    targetPrefix: "Target:",
    depositLabel: "Deposit:",
    totalOutLabel: "Total Out:",
    avgMoLabel: "/mo avg",
    fullLabel: "Full:",
    pct75Label: "75%:",
    projRevTitle: "📊 PROJECTED REVENUE MODEL",
    projRevDesc: "10% Direct Residual on every monthly diamond purchase your clients make.",
    projRevDbSize: "Database Size",
    projRevConv: "Conversion %",
    projRevAvgPurchase: "Avg Purchase ($)",
    projRevRebateReuse: "Rebate Re-Use %",
    projRevMyParts: "My Pool Parts",
    projRevCalcBtn: "⚡ CALCULATE PROJECTED REVENUE",
    projRevEstClients: "Est. Clients",
    projRevTeamVol: "Team Volume",
    projRevYr5: "Yr.5 Residual/mo",
    projRevTimeline: "📈 5-YEAR GROWTH TIMELINE",
    projRevPeriod: "Period",
    projRevResidualCol: "10% Residual",
    projRevPortfolioCol: "Client Portfolio",
    projRevCumulativeCol: "Cumulative",
    globalPoolTitle: "🌍 GLOBAL POOL BONUS PATH",
    globalPoolDesc: "Three pools of Global Bonus with different rank requirements. Enter your back office values for an accurate real-time payout.",
    yourTeamVol: "Your Team Volume",
    blueDiamondGateLabel: "/ $1M Blue Diamond Gate",
    blueDiamondUnlocked: "🔵 BLUE DIAMOND — Pool 1 Unlocked!",
    remainingToBlue: "{amount} remaining to Blue Diamond",
    pool1Title: "Pool 1 — Blue Diamond 🔵",
    pool2Title: "Pool 2 — Purple Diamond 💜",
    pool3Title: "Pool 3 — Double Diamond Elite 👑",
    poolMinRankP1: "Min Rank: Blue Diamond · Max 6 parts",
    poolMinRankP2: "Min Rank: Purple Diamond · Max 4 parts",
    poolMinRankP3: "Min Rank: Double Diamond Elite · Max 2 parts",
    activePoolTotal: "Active Pool Total ($)",
    totalQualUsers: "Total Qualified Users",
    myPartsLabel: "My Parts",
    yourPayoutLabel: "Your Payout:",
    fromBackOffice: "From back office",
    noMembersYet: "No members yet",
    totalPoolPayoutLabel: "Total Pool Payout (All 3 Pools)",
    poolFormulaNote: "Formula: Pool Total ÷ Total Qualified Users × Your Parts · Enter values from your back office for accuracy.",
    levelLabel: "LEVEL",
    arVaultDesc: "3D Diamond portfolio viewer · Scan & inspect your assets in AR",
    okBtn: "OK",
  },
  nl: {
    title: "🤝 Partner Tools",
    potentialTitle: "📊 POTENTIAALCALCULATOR",
    potentialDesc: "Schat uw verdienpotentieel op basis van uw contactdatabasegrootte en conversiepercentage.",
    dbSizeLabel: "Uw Databasegrootte (contacten)",
    convRateLabel: "Geschat Conversiepercentage (%)",
    avgAmountLabel: "Gemiddelde Storting per Klant ($)",
    calcPotentialBtn: "Bereken Potentiaal",
    estClients: "Geschatte Klanten",
    directVolume: "Totaal Gegenereerd Volume",
    directComm: "Directe Commissie (10%)",
    rebatePool: "Maandelijkse Kortingspool (~3%)",
    callListTitle: "📋 BELLIJST DASHBOARD",
    addBtn: "+ Toevoegen",
    noPartners: "Nog geen partners",
    noPartnersDesc: "Tik op \"+ Toevoegen\" om uw eerste partner toe te voegen met hun gegevens, startdatum en investeringsbedrag.",
    month: "Maand",
    started: "Gestart",
    propTitle: "🏠 VASTGOEDOPTIMIZER",
    propDesc: "Voer uw maandelijkse vastgoedkosten in. De optimizer vertelt u welk Solution Plan (met of zonder VIP) die kosten dekt.",
    propCostLabel: "Maandelijkse Vastgoedkosten ($)",
    findPlanBtn: "Vind Mijn Plan",
    recPlan: "Aanbevolen Plan",
    depositReq: "Vereiste Storting",
    rebateRate: "Maandelijks Kortingspercentage",
    vipReq: "VIP Vereist",
    vipYes: "Ja (+$1.000)",
    vipNo: "Nee",
    propNote: "Maandelijkse korting dekt uw vastgoedkosten.",
    withoutVip: "Zonder VIP",
    withVip: "Met VIP",
    monthlyRebate: "Maandelijkse Korting",
    annualRebate: "Jaarlijkse Korting",
    applyToScenario: "📊 Openen in Scenario Tool",
    applyToStrategyNote: "Vult storting, VIP en maandelijkse opname in vanaf Maand 1",
    applyNoVip: "📊 Toepassen (Geen VIP)",
    applyWithVip: "📊 Toepassen (Met VIP)",
    addPartner: "Partner Toevoegen",
    editPartner: "Partner Bewerken",
    nameLabel: "Naam *",
    whatsappLabel: "WhatsApp Nummer",
    countryLabel: "Land",
    startDateLabel: "Startdatum (DD-MM-JJJJ)",
    amountLabel: "Investeringsbedrag ($) *",
    contactMomentsLabel: "Contactmoment Meldingen",
    cancelBtn: "Annuleren",
    saveBtn: "Opslaan",
    missingInfo: "Ontbrekende Informatie",
    missingInfoMsg: "Naam en bedrag zijn verplicht.",
    invalidAmount: "Ongeldig Bedrag",
    invalidAmountMsg: "Voer een geldig bedrag in.",
    removePartner: "Partner Verwijderen",
    removeConfirm: "Weet u het zeker?",
    removeCancel: "Annuleren",
    removeOk: "Verwijderen",
    alertRebate: "💰 Korting klaar",
    alert90day: "📋 90-daagse audit verschuldigd",
    alert11month: "📅 11-Maands Beslissing Vereist — Kies: Thuislevering of 100% Terugkoop",
    alert30day: "⏰ 30 dagen tot cycluseinde — bevestig beslissing partner",
    alert12month: "🔴 12-maandse cyclus beëindigd — onmiddellijke actie vereist",
    savingsTitle: "💸 LIFESTYLE INKOMSTENSTROOM",
    savingsDesc: "Passief inkomen voor auto's, reizen en meer. Voer uw gewenste maandinkomen in en wij vinden de storting waarbij 75% van de korting uw doel dekt — uw kapitaal blijft intact.",
    savingsGoalLabel: "Doel Maandinkomen ($)",
    findSavingsBtn: "Vind Mijn Spaarplan",
    savingsNote: "75% van maandelijkse korting = uw doelinkomen. Kapitaal blijft intact.",
    assetTitle: "🏡 VERMOGENSDOELPLANNER",
    assetDesc: "Wilt u een woning of auto volledig betalen? Voer uw doelbedrag en tijdshorizon in. Wij vinden de storting die dat bedrag opbouwt via samengestelde kortingen.",
    assetTargetLabel: "Doelbedrag ($)",
    assetYearsLabel: "Tijdshorizon (jaren)",
    findAssetBtn: "Vind Mijn Vermogensplan",
    assetNote: "Samengestelde kortingen bouwen uw bedrag op. 20% maandelijks herbelegd.",
    assetApplyNoVip: "📊 Toepassen (Geen VIP)",
    assetApplyWithVip: "📊 Toepassen (Met VIP)",
    clientLetterTitle: "Klantbriefgenerator",
    clientLetterDesc: "Maak een professionele introductiebrief in uw taal — klaar om te kopiëren of direct te delen.",
    alertsCount: "{count} meldingen",
    diamondStability: "💎 Diamant Stabiliteit",
    onTopOfResidual: "✨ Bovenop uw maandelijks residueel inkomen",
    rankMoreTo: "{amount} meer naar {rank}",
    rankUnlocksInfinity: "(Ontgrendelt {pct} Infinity)",
    placeholderCustomAmount: "Aangepast bedrag",
    placeholderTargetAmount: "Doelbedrag",
    placeholderYears: "Jaren",
    carTip: "🚗 Perfect voor het plannen van uw maandelijkse luxe autolease of premium levensstijlkosten.",
    targetPrefix: "Doel:",
    depositLabel: "Storting:",
    totalOutLabel: "Totaal Uitbetaald:",
    avgMoLabel: "/mo gem.",
    fullLabel: "Volledig:",
    pct75Label: "75%:",
    projRevTitle: "📊 GEPROJECTEERD INKOMSTENMODEL",
    projRevDesc: "10% Directe Residu op elke maandelijkse diamantaankoop van uw klanten.",
    projRevDbSize: "Databasegrootte",
    projRevConv: "Conversie %",
    projRevAvgPurchase: "Gem. Aankoop ($)",
    projRevRebateReuse: "Korting Hergebruik %",
    projRevMyParts: "Mijn Pool Delen",
    projRevCalcBtn: "⚡ BEREKEN GEPROJECTEERDE INKOMSTEN",
    projRevEstClients: "Gesch. Klanten",
    projRevTeamVol: "Teamvolume",
    projRevYr5: "Jr.5 Residu/mo",
    projRevTimeline: "📈 5-JAAR GROEITIJDLIJN",
    projRevPeriod: "Periode",
    projRevResidualCol: "10% Residu",
    projRevPortfolioCol: "Klantportfolio",
    projRevCumulativeCol: "Cumulatief",
    globalPoolTitle: "🌍 GLOBAAL POOL BONUS PAD",
    globalPoolDesc: "Drie pools van Globale Bonus met verschillende rangvereisten. Voer uw backofficewaarden in voor een nauwkeurige realtime uitbetaling.",
    yourTeamVol: "Uw Teamvolume",
    blueDiamondGateLabel: "/ $1M Blauwe Diamant Drempel",
    blueDiamondUnlocked: "🔵 BLAUWE DIAMANT — Pool 1 Ontgrendeld!",
    remainingToBlue: "{amount} resterend naar Blauwe Diamant",
    pool1Title: "Pool 1 — Blauwe Diamant 🔵",
    pool2Title: "Pool 2 — Paarse Diamant 💜",
    pool3Title: "Pool 3 — Dubbele Diamant Elite 👑",
    poolMinRankP1: "Min Rang: Blauwe Diamant · Max 6 delen",
    poolMinRankP2: "Min Rang: Paarse Diamant · Max 4 delen",
    poolMinRankP3: "Min Rang: Dubbele Diamant Elite · Max 2 delen",
    activePoolTotal: "Actief Pool Totaal ($)",
    totalQualUsers: "Totaal Gekwalificeerde Gebruikers",
    myPartsLabel: "Mijn Delen",
    yourPayoutLabel: "Uw Uitbetaling:",
    fromBackOffice: "Uit backoffice",
    noMembersYet: "Nog geen leden",
    totalPoolPayoutLabel: "Totale Pool Uitbetaling (Alle 3 Pools)",
    poolFormulaNote: "Formule: Pool Totaal ÷ Totaal Gekwalificeerde Gebruikers × Mijn Delen · Voer waarden uit uw backoffice in voor nauwkeurigheid.",
    levelLabel: "NIVEAU",
    arVaultDesc: "3D Diamant portfolio viewer · Scan & inspecteer uw activa in AR",
    okBtn: "OK",
  },
  de: {
    title: "🤝 Partner-Tools",
    potentialTitle: "📊 POTENZIALRECHNER",
    potentialDesc: "Schätzen Sie Ihr Verdienstpotenzial basierend auf Ihrer Kontaktdatenbankgröße und Konversionsrate.",
    dbSizeLabel: "Ihre Datenbankgröße (Kontakte)",
    convRateLabel: "Geschätzte Konversionsrate (%)",
    avgAmountLabel: "Durchschnittliche Einzahlung pro Kunde ($)",
    calcPotentialBtn: "Potenzial Berechnen",
    estClients: "Geschätzte Kunden",
    directVolume: "Gesamt Generiertes Volumen",
    directComm: "Direktprovision (10%)",
    rebatePool: "Monatlicher Rabattpool (~3%)",
    callListTitle: "📋 ANRUFLISTEN-DASHBOARD",
    addBtn: "+ Hinzufügen",
    noPartners: "Noch keine Partner",
    noPartnersDesc: "Tippen Sie auf \"+ Hinzufügen\", um Ihren ersten Partner mit Details, Startdatum und Investitionsbetrag hinzuzufügen.",
    month: "Monat",
    started: "Gestartet",
    propTitle: "🏠 IMMOBILIEN-OPTIMIERER",
    propDesc: "Geben Sie Ihre monatlichen Immobilienkosten ein. Der Optimierer zeigt Ihnen, welcher Solution Plan (mit oder ohne VIP) diese Kosten deckt.",
    propCostLabel: "Monatliche Immobilienkosten ($)",
    findPlanBtn: "Meinen Plan Finden",
    recPlan: "Empfohlener Plan",
    depositReq: "Erforderliche Einzahlung",
    rebateRate: "Monatliche Rabattrate",
    vipReq: "VIP Erforderlich",
    vipYes: "Ja (+$1.000)",
    vipNo: "Nein",
    propNote: "Monatlicher Rabatt deckt Ihre Immobilienkosten.",
    withoutVip: "Ohne VIP",
    withVip: "Mit VIP",
    monthlyRebate: "Monatlicher Rabatt",
    annualRebate: "Jährlicher Rabatt",
    applyToScenario: "📊 Im Szenario-Tool öffnen",
    applyToStrategyNote: "Füllt Einzahlung, VIP und monatliche Auszahlung ab Monat 1 vor",
    applyNoVip: "📊 Anwenden (Kein VIP)",
    applyWithVip: "📊 Anwenden (Mit VIP)",
    addPartner: "Partner Hinzufügen",
    editPartner: "Partner Bearbeiten",
    nameLabel: "Name *",
    whatsappLabel: "WhatsApp-Nummer",
    countryLabel: "Land",
    startDateLabel: "Startdatum (TT-MM-JJJJ)",
    amountLabel: "Investitionsbetrag ($) *",
    contactMomentsLabel: "Kontaktmoment-Benachrichtigungen",
    cancelBtn: "Abbrechen",
    saveBtn: "Speichern",
    missingInfo: "Fehlende Informationen",
    missingInfoMsg: "Name und Betrag sind erforderlich.",
    invalidAmount: "Ungültiger Betrag",
    invalidAmountMsg: "Bitte geben Sie einen gültigen Betrag ein.",
    removePartner: "Partner Entfernen",
    removeConfirm: "Sind Sie sicher?",
    removeCancel: "Abbrechen",
    removeOk: "Entfernen",
    alertRebate: "💰 Rabatt bereit",
    alert90day: "📋 90-Tage-Audit fällig",
    alert11month: "📅 11-Monats-Entscheidung fällig — Wählen: Heimlieferung oder 100% Rückkauf",
    alert30day: "⏰ 30 Tage bis Zyklusende — Entscheidung des Partners bestätigen",
    alert12month: "🔴 12-Monats-Zyklus beendet — sofortiger Handlungsbedarf",
    savingsTitle: "💸 LIFESTYLE-CASHFLOW",
    savingsDesc: "Passives Einkommen für Autos, Reisen und mehr. Geben Sie Ihr gewünschtes Monatseinkommen ein und wir finden die Einlage, bei der 75% der Vergütung Ihr Ziel deckt — Ihr Kapital bleibt erhalten.",
    savingsGoalLabel: "Ziel Monatseinkommen ($)",
    findSavingsBtn: "Meinen Sparplan Finden",
    savingsNote: "75% der monatlichen Vergütung = Ihr Ziel. Kapital bleibt erhalten.",
    assetTitle: "🏡 VERMÖGENSZIELPLANER",
    assetDesc: "Möchten Sie eine Immobilie oder ein Auto vollständig bezahlen? Geben Sie Ihren Zielbetrag und Zeitrahmen ein. Wir finden die Einlage, die diesen Betrag durch Zinseszins aufbaut.",
    assetTargetLabel: "Zielbetrag ($)",
    assetYearsLabel: "Zeitrahmen (Jahre)",
    findAssetBtn: "Meinen Vermögensplan Finden",
    assetNote: "Zinseszins-Vergütungen bauen Ihren Betrag auf. 20% monatlich reinvestiert.",
    assetApplyNoVip: "📊 Anwenden (Kein VIP)",
    assetApplyWithVip: "📊 Anwenden (Mit VIP)",
    clientLetterTitle: "Kundenbriefgenerator",
    clientLetterDesc: "Erstellen Sie einen professionellen Einführungsbrief in Ihrer Sprache — fertig zum Kopieren oder sofortigen Teilen.",
    alertsCount: "{count} Benachrichtigungen",
    diamondStability: "💎 Diamant-Stabilität",
    onTopOfResidual: "✨ Zusätzlich zu Ihrem monatlichen Residualeinkommen",
    rankMoreTo: "{amount} mehr bis {rank}",
    rankUnlocksInfinity: "(Entsperrt {pct} Infinity)",
    placeholderCustomAmount: "Benutzerdefinierter Betrag",
    placeholderTargetAmount: "Zielbetrag",
    placeholderYears: "Jahre",
    carTip: "🚗 Perfekt für die Planung Ihres monatlichen Luxus-Autoleasings oder Premium-Lifestyle-Kosten.",
    targetPrefix: "Ziel:",
    depositLabel: "Einzahlung:",
    totalOutLabel: "Gesamt Ausgezahlt:",
    avgMoLabel: "/Mo Durchschn.",
    fullLabel: "Vollständig:",
    pct75Label: "75%:",
    projRevTitle: "📊 PROGNOSEEINNAHMENMODELL",
    projRevDesc: "10% Direktresidual auf jeden monatlichen Diamantkauf Ihrer Kunden.",
    projRevDbSize: "Datenbankgröße",
    projRevConv: "Konversionsrate %",
    projRevAvgPurchase: "Durchschnittl. Kauf ($)",
    projRevRebateReuse: "Rabatt-Wiederverwendung %",
    projRevMyParts: "Meine Pool-Anteile",
    projRevCalcBtn: "⚡ PROGNOSE BERECHNEN",
    projRevEstClients: "Gesch. Kunden",
    projRevTeamVol: "Teamvolumen",
    projRevYr5: "J.5 Residual/Mo",
    projRevTimeline: "📈 5-JAHRES-WACHSTUMSZEITPLAN",
    projRevPeriod: "Zeitraum",
    projRevResidualCol: "10% Residual",
    projRevPortfolioCol: "Kundenportfolio",
    projRevCumulativeCol: "Kumulativ",
    globalPoolTitle: "🌍 GLOBALER POOL-BONUSPFAD",
    globalPoolDesc: "Drei Pools des globalen Bonus mit unterschiedlichen Ranganforderungen. Geben Sie Ihre Backoffice-Werte für eine genaue Echtzeit-Auszahlung ein.",
    yourTeamVol: "Ihr Teamvolumen",
    blueDiamondGateLabel: "/ $1M Blauer Diamant Schwelle",
    blueDiamondUnlocked: "🔵 BLAUER DIAMANT — Pool 1 Entsperrt!",
    remainingToBlue: "{amount} verbleibend bis Blauer Diamant",
    pool1Title: "Pool 1 — Blauer Diamant 🔵",
    pool2Title: "Pool 2 — Lila Diamant 💜",
    pool3Title: "Pool 3 — Doppelter Diamant Elite 👑",
    poolMinRankP1: "Min. Rang: Blauer Diamant · Max. 6 Anteile",
    poolMinRankP2: "Min. Rang: Lila Diamant · Max. 4 Anteile",
    poolMinRankP3: "Min. Rang: Doppelter Diamant Elite · Max. 2 Anteile",
    activePoolTotal: "Aktiver Pool Gesamt ($)",
    totalQualUsers: "Gesamt Qualifizierte Nutzer",
    myPartsLabel: "Meine Anteile",
    yourPayoutLabel: "Ihre Auszahlung:",
    fromBackOffice: "Aus Backoffice",
    noMembersYet: "Noch keine Mitglieder",
    totalPoolPayoutLabel: "Gesamte Pool-Auszahlung (Alle 3 Pools)",
    poolFormulaNote: "Formel: Pool Gesamt ÷ Gesamt Qualifizierte Nutzer × Meine Anteile · Geben Sie Werte aus Ihrem Backoffice ein.",
    levelLabel: "STUFE",
    arVaultDesc: "3D Diamant-Portfolio-Viewer · Scannen & inspizieren Sie Ihre Assets in AR",
    okBtn: "OK",
  },
  fr: {
    title: "🤝 Outils Partenaire",
    potentialTitle: "📊 CALCULATEUR DE POTENTIEL",
    potentialDesc: "Estimez votre potentiel de revenus en fonction de la taille de votre base de contacts et du taux de conversion.",
    dbSizeLabel: "Taille de Votre Base de Données (contacts)",
    convRateLabel: "Taux de Conversion Estimé (%)",
    avgAmountLabel: "Dépôt Moyen par Client ($)",
    calcPotentialBtn: "Calculer le Potentiel",
    estClients: "Clients Estimés",
    directVolume: "Volume Total Généré",
    directComm: "Commission Directe (10%)",
    rebatePool: "Pool de Remises Mensuelles (~3%)",
    callListTitle: "📋 TABLEAU DE BORD LISTE D'APPELS",
    addBtn: "+ Ajouter",
    noPartners: "Aucun partenaire pour l'instant",
    noPartnersDesc: "Appuyez sur \"+ Ajouter\" pour ajouter votre premier partenaire avec ses coordonnées, sa date de début et son montant d'investissement.",
    month: "Mois",
    started: "Démarré",
    propTitle: "🏠 OPTIMISEUR IMMOBILIER",
    propDesc: "Entrez vos coûts immobiliers mensuels. L'optimiseur vous indiquera quel Plan Solution (avec ou sans VIP) couvre ces coûts.",
    propCostLabel: "Coût Immobilier Mensuel ($)",
    findPlanBtn: "Trouver Mon Plan",
    recPlan: "Plan Recommandé",
    depositReq: "Dépôt Requis",
    rebateRate: "Taux de Remise Mensuel",
    vipReq: "VIP Requis",
    vipYes: "Oui (+1 000 $)",
    vipNo: "Non",
    propNote: "La remise mensuelle couvre vos coûts immobiliers.",
    withoutVip: "Sans VIP",
    withVip: "Avec VIP",
    monthlyRebate: "Remise Mensuelle",
    annualRebate: "Remise Annuelle",
    applyToScenario: "📊 Ouvrir dans l'Outil Scénario",
    applyToStrategyNote: "Pré-remplit le dépôt, VIP et le retrait mensuel à partir du Mois 1",
    applyNoVip: "📊 Appliquer (Sans VIP)",
    applyWithVip: "📊 Appliquer (Avec VIP)",
    addPartner: "Ajouter un Partenaire",
    editPartner: "Modifier le Partenaire",
    nameLabel: "Nom *",
    whatsappLabel: "Numéro WhatsApp",
    countryLabel: "Pays",
    startDateLabel: "Date de Début (JJ-MM-AAAA)",
    amountLabel: "Montant d'Investissement ($) *",
    contactMomentsLabel: "Alertes Moments de Contact",
    cancelBtn: "Annuler",
    saveBtn: "Enregistrer",
    missingInfo: "Informations Manquantes",
    missingInfoMsg: "Le nom et le montant sont obligatoires.",
    invalidAmount: "Montant Invalide",
    invalidAmountMsg: "Veuillez entrer un montant valide.",
    removePartner: "Supprimer le Partenaire",
    removeConfirm: "Êtes-vous sûr?",
    removeCancel: "Annuler",
    removeOk: "Supprimer",
    alertRebate: "💰 Remise prête",
    alert90day: "📋 Audit 90 jours dû",
    alert11month: "📅 Décision 11 Mois Due — Choisir: Livraison à Domicile ou Rachat 100%",
    alert30day: "⏰ 30 jours avant fin de cycle — confirmer la décision du partenaire",
    alert12month: "🔴 Cycle 12 mois terminé — action immédiate requise",
    savingsTitle: "💸 FLUX DE TRÉSORERIE LIFESTYLE",
    savingsDesc: "Revenu passif pour voitures, voyages et plus. Entrez votre revenu mensuel cible et nous trouvons le dépôt où 75% de la remise couvre votre objectif — votre capital reste intact.",
    savingsGoalLabel: "Revenu Mensuel Cible ($)",
    findSavingsBtn: "Trouver Mon Plan Épargne",
    savingsNote: "75% de la remise mensuelle = votre objectif. Capital intact.",
    assetTitle: "🏡 PLANIFICATEUR D'ACTIFS",
    assetDesc: "Vous voulez acheter un bien ou une voiture? Entrez votre montant cible et votre horizon. Nous trouvons le dépôt qui accumule cette somme via des remises composées.",
    assetTargetLabel: "Montant Cible ($)",
    assetYearsLabel: "Horizon (années)",
    findAssetBtn: "Trouver Mon Plan Actif",
    assetNote: "Les remises composées construisent votre somme. 20% réinvesti mensuellement.",
    assetApplyNoVip: "📊 Appliquer (Sans VIP)",
    assetApplyWithVip: "📊 Appliquer (Avec VIP)",
    clientLetterTitle: "Générateur de lettre client",
    clientLetterDesc: "Créez une lettre d'introduction professionnelle dans votre langue — prête à copier ou partager instantanément.",
    alertsCount: "{count} alertes",
    diamondStability: "💎 Stabilité Diamant",
    onTopOfResidual: "✨ En plus de votre revenu résiduel mensuel",
    rankMoreTo: "{amount} de plus vers {rank}",
    rankUnlocksInfinity: "(Débloque {pct} Infinity)",
    placeholderCustomAmount: "Montant personnalisé",
    placeholderTargetAmount: "Montant cible",
    placeholderYears: "Années",
    carTip: "🚗 Parfait pour planifier votre location de voiture de luxe mensuelle ou vos coûts de style de vie premium.",
    targetPrefix: "Cible:",
    depositLabel: "Dépôt:",
    totalOutLabel: "Total Versé:",
    avgMoLabel: "/mo moy.",
    fullLabel: "Complet:",
    pct75Label: "75%:",
    projRevTitle: "📊 MODÈLE DE REVENUS PROJETÉS",
    projRevDesc: "10% de résiduel direct sur chaque achat mensuel de diamants de vos clients.",
    projRevDbSize: "Taille de la base",
    projRevConv: "Taux de conversion %",
    projRevAvgPurchase: "Achat moyen ($)",
    projRevRebateReuse: "Réutilisation remise %",
    projRevMyParts: "Mes parts de pool",
    projRevCalcBtn: "⚡ CALCULER LES REVENUS PROJETÉS",
    projRevEstClients: "Clients est.",
    projRevTeamVol: "Volume équipe",
    projRevYr5: "An.5 Résiduel/mo",
    projRevTimeline: "📈 CALENDRIER DE CROISSANCE 5 ANS",
    projRevPeriod: "Période",
    projRevResidualCol: "Résiduel 10%",
    projRevPortfolioCol: "Portfolio client",
    projRevCumulativeCol: "Cumulatif",
    globalPoolTitle: "🌍 CHEMIN DU BONUS POOL GLOBAL",
    globalPoolDesc: "Trois pools de Bonus Global avec différentes exigences de rang. Entrez vos valeurs de back-office pour un paiement précis en temps réel.",
    yourTeamVol: "Votre Volume d'Équipe",
    blueDiamondGateLabel: "/ $1M Seuil Diamant Bleu",
    blueDiamondUnlocked: "🔵 DIAMANT BLEU — Pool 1 Débloqué!",
    remainingToBlue: "{amount} restant vers Diamant Bleu",
    pool1Title: "Pool 1 — Diamant Bleu 🔵",
    pool2Title: "Pool 2 — Diamant Violet 💜",
    pool3Title: "Pool 3 — Diamant Élite Double 👑",
    poolMinRankP1: "Rang min: Diamant Bleu · Max 6 parts",
    poolMinRankP2: "Rang min: Diamant Violet · Max 4 parts",
    poolMinRankP3: "Rang min: Diamant Élite Double · Max 2 parts",
    activePoolTotal: "Total Pool Actif ($)",
    totalQualUsers: "Total Utilisateurs Qualifiés",
    myPartsLabel: "Mes Parts",
    yourPayoutLabel: "Votre Paiement:",
    fromBackOffice: "Du back-office",
    noMembersYet: "Pas encore de membres",
    totalPoolPayoutLabel: "Paiement Total Pool (3 Pools)",
    poolFormulaNote: "Formule: Total Pool ÷ Total Utilisateurs Qualifiés × Mes Parts · Entrez les valeurs de votre back-office.",
    levelLabel: "NIVEAU",
    arVaultDesc: "Visionneuse 3D portfolio diamant · Scanner & inspecter vos actifs en AR",
    okBtn: "OK",
  },
  es: {
    title: "🤝 Herramientas de Socio",
    potentialTitle: "📊 CALCULADORA DE POTENCIAL",
    potentialDesc: "Estime su potencial de ganancias basándose en el tamaño de su base de contactos y la tasa de conversión.",
    dbSizeLabel: "Tamaño de Su Base de Datos (contactos)",
    convRateLabel: "Tasa de Conversión Estimada (%)",
    avgAmountLabel: "Depósito Promedio por Cliente ($)",
    calcPotentialBtn: "Calcular Potencial",
    estClients: "Clientes Estimados",
    directVolume: "Volumen Total Generado",
    directComm: "Comisión Directa (10%)",
    rebatePool: "Pool de Descuentos Mensuales (~3%)",
    callListTitle: "📋 PANEL DE LISTA DE LLAMADAS",
    addBtn: "+ Agregar",
    noPartners: "Sin socios aún",
    noPartnersDesc: "Toca \"+ Agregar\" para agregar tu primer socio con sus datos, fecha de inicio y monto de inversión.",
    month: "Mes",
    started: "Iniciado",
    propTitle: "🏠 OPTIMIZADOR DE PROPIEDADES",
    propDesc: "Ingrese sus costos mensuales de propiedad. El optimizador le dirá qué Plan de Solución (con o sin VIP) cubre esos costos.",
    propCostLabel: "Costo Mensual de Propiedad ($)",
    findPlanBtn: "Encontrar Mi Plan",
    recPlan: "Plan Recomendado",
    depositReq: "Depósito Requerido",
    rebateRate: "Tasa de Descuento Mensual",
    vipReq: "VIP Requerido",
    vipYes: "Sí (+$1,000)",
    vipNo: "No",
    propNote: "El descuento mensual cubre sus costos de propiedad.",
    withoutVip: "Sin VIP",
    withVip: "Con VIP",
    monthlyRebate: "Descuento Mensual",
    annualRebate: "Descuento Anual",
    applyToScenario: "📊 Abrir en Herramienta de Escenario",
    applyToStrategyNote: "Rellena depósito, VIP y retiro mensual desde el Mes 1",
    applyNoVip: "📊 Aplicar (Sin VIP)",
    applyWithVip: "📊 Aplicar (Con VIP)",
    addPartner: "Agregar Socio",
    editPartner: "Editar Socio",
    nameLabel: "Nombre *",
    whatsappLabel: "Número de WhatsApp",
    countryLabel: "País",
    startDateLabel: "Fecha de Inicio (DD-MM-AAAA)",
    amountLabel: "Monto de Inversión ($) *",
    contactMomentsLabel: "Alertas de Momentos de Contacto",
    cancelBtn: "Cancelar",
    saveBtn: "Guardar",
    missingInfo: "Información Faltante",
    missingInfoMsg: "El nombre y el monto son obligatorios.",
    invalidAmount: "Monto Inválido",
    invalidAmountMsg: "Por favor ingrese un monto válido.",
    removePartner: "Eliminar Socio",
    removeConfirm: "¿Está seguro?",
    removeCancel: "Cancelar",
    removeOk: "Eliminar",
    alertRebate: "💰 Descuento listo",
    alert90day: "📋 Auditoría de 90 días pendiente",
    alert11month: "📅 Decisión de 11 Meses — Elegir: Entrega a Domicilio o Recompra 100%",
    alert30day: "⏰ 30 días para fin de ciclo — confirmar decisión del socio",
    alert12month: "🔴 Ciclo de 12 meses terminado — acción inmediata requerida",
    savingsTitle: "💸 LIFESTYLE FLUJO DE CAJA",
    savingsDesc: "Ingresos pasivos para autos, viajes y más. Ingrese su ingreso mensual objetivo y encontramos el depósito donde el 75% del descuento cubre su meta — su capital permanece intacto.",
    savingsGoalLabel: "Ingreso Mensual Objetivo ($)",
    findSavingsBtn: "Encontrar Mi Plan de Ahorro",
    savingsNote: "75% del descuento mensual = su objetivo. Capital intacto.",
    assetTitle: "🏡 PLANIFICADOR DE ACTIVOS",
    assetDesc: "¿Quiere comprar una propiedad o auto al contado? Ingrese su monto objetivo y plazo. Encontramos el depósito que acumula esa suma mediante descuentos compuestos.",
    assetTargetLabel: "Monto Objetivo ($)",
    assetYearsLabel: "Plazo (años)",
    findAssetBtn: "Encontrar Mi Plan de Activos",
    assetNote: "Los descuentos compuestos construyen su suma. 20% reinvertido mensualmente.",
    assetApplyNoVip: "📊 Aplicar (Sin VIP)",
    assetApplyWithVip: "📊 Aplicar (Con VIP)",
    clientLetterTitle: "Generador de carta de cliente",
    clientLetterDesc: "Crea una carta de presentación profesional en tu idioma — lista para copiar o compartir al instante.",
    alertsCount: "{count} alertas",
    diamondStability: "💎 Estabilidad Diamante",
    onTopOfResidual: "✨ Además de sus ingresos residuales mensuales",
    rankMoreTo: "{amount} más para {rank}",
    rankUnlocksInfinity: "(Desbloquea {pct} Infinity)",
    placeholderCustomAmount: "Monto personalizado",
    placeholderTargetAmount: "Monto objetivo",
    placeholderYears: "Años",
    carTip: "🚗 Perfecto para planificar su arrendamiento mensual de auto de lujo o costos de estilo de vida premium.",
    targetPrefix: "Objetivo:",
    depositLabel: "Depósito:",
    totalOutLabel: "Total Pagado:",
    avgMoLabel: "/mo prom.",
    fullLabel: "Completo:",
    pct75Label: "75%:",
    projRevTitle: "📊 MODELO DE INGRESOS PROYECTADOS",
    projRevDesc: "10% de residual directo en cada compra mensual de diamantes de sus clientes.",
    projRevDbSize: "Tamaño de base",
    projRevConv: "Tasa conversión %",
    projRevAvgPurchase: "Compra prom. ($)",
    projRevRebateReuse: "Reuso descuento %",
    projRevMyParts: "Mis partes de pool",
    projRevCalcBtn: "⚡ CALCULAR INGRESOS PROYECTADOS",
    projRevEstClients: "Clientes est.",
    projRevTeamVol: "Volumen equipo",
    projRevYr5: "Año 5 Residual/mo",
    projRevTimeline: "📈 CRONOGRAMA DE CRECIMIENTO 5 AÑOS",
    projRevPeriod: "Período",
    projRevResidualCol: "Residual 10%",
    projRevPortfolioCol: "Portfolio cliente",
    projRevCumulativeCol: "Acumulado",
    globalPoolTitle: "🌍 CAMINO DEL BONO POOL GLOBAL",
    globalPoolDesc: "Tres pools de Bono Global con diferentes requisitos de rango. Ingrese sus valores de back office para un pago preciso en tiempo real.",
    yourTeamVol: "Su Volumen de Equipo",
    blueDiamondGateLabel: "/ $1M Umbral Diamante Azul",
    blueDiamondUnlocked: "🔵 DIAMANTE AZUL — ¡Pool 1 Desbloqueado!",
    remainingToBlue: "{amount} restante para Diamante Azul",
    pool1Title: "Pool 1 — Diamante Azul 🔵",
    pool2Title: "Pool 2 — Diamante Púrpura 💜",
    pool3Title: "Pool 3 — Diamante Elite Doble 👑",
    poolMinRankP1: "Rango mín: Diamante Azul · Máx 6 partes",
    poolMinRankP2: "Rango mín: Diamante Púrpura · Máx 4 partes",
    poolMinRankP3: "Rango mín: Diamante Elite Doble · Máx 2 partes",
    activePoolTotal: "Total Pool Activo ($)",
    totalQualUsers: "Total Usuarios Calificados",
    myPartsLabel: "Mis Partes",
    yourPayoutLabel: "Su Pago:",
    fromBackOffice: "Del back office",
    noMembersYet: "Aún sin miembros",
    totalPoolPayoutLabel: "Pago Total Pool (3 Pools)",
    poolFormulaNote: "Fórmula: Total Pool ÷ Total Usuarios Calificados × Mis Partes · Ingrese valores de su back office para mayor precisión.",
    levelLabel: "NIVEL",
    arVaultDesc: "Visor 3D de portfolio de diamantes · Escanee e inspeccione sus activos en AR",
    okBtn: "OK",
  },
  ru: {
    title: "🤝 Инструменты Партнёра",
    potentialTitle: "📊 КАЛЬКУЛЯТОР ПОТЕНЦИАЛА",
    potentialDesc: "Оцените свой потенциал заработка на основе размера базы контактов и коэффициента конверсии.",
    dbSizeLabel: "Размер Вашей Базы Данных (контакты)",
    convRateLabel: "Предполагаемый Коэффициент Конверсии (%)",
    avgAmountLabel: "Средний Депозит на Клиента ($)",
    calcPotentialBtn: "Рассчитать Потенциал",
    estClients: "Ожидаемые Клиенты",
    directVolume: "Общий Сгенерированный Объём",
    directComm: "Прямая Комиссия (10%)",
    rebatePool: "Ежемесячный Пул Скидок (~3%)",
    callListTitle: "📋 ПАНЕЛЬ СПИСКА ЗВОНКОВ",
    addBtn: "+ Добавить",
    noPartners: "Партнёров пока нет",
    noPartnersDesc: "Нажмите \"+ Добавить\", чтобы добавить первого партнёра с данными, датой начала и суммой инвестиций.",
    month: "Месяц",
    started: "Начало",
    propTitle: "🏠 ОПТИМИЗАТОР НЕДВИЖИМОСТИ",
    propDesc: "Введите ежемесячные расходы на недвижимость. Оптимизатор покажет, какой Solution Plan (с VIP или без) покрывает эти расходы.",
    propCostLabel: "Ежемесячные Расходы на Недвижимость ($)",
    findPlanBtn: "Найти Мой План",
    recPlan: "Рекомендуемый План",
    depositReq: "Необходимый Депозит",
    rebateRate: "Ежемесячная Ставка Скидки",
    vipReq: "VIP Необходим",
    vipYes: "Да (+$1 000)",
    vipNo: "Нет",
    propNote: "Ежемесячная скидка покрывает расходы на недвижимость.",
    withoutVip: "Без VIP",
    withVip: "С VIP",
    monthlyRebate: "Ежемесячная Скидка",
    annualRebate: "Годовая Скидка",
    applyToScenario: "📊 Открыть в Инструменте Сценария",
    applyToStrategyNote: "Заполняет депозит, VIP и ежемесячный вывод с 1-го месяца",
    applyNoVip: "📊 Применить (Без VIP)",
    applyWithVip: "📊 Применить (С VIP)",
    addPartner: "Добавить Партнёра",
    editPartner: "Редактировать Партнёра",
    nameLabel: "Имя *",
    whatsappLabel: "Номер WhatsApp",
    countryLabel: "Страна",
    startDateLabel: "Дата Начала (ДД-ММ-ГГГГ)",
    amountLabel: "Сумма Инвестиций ($) *",
    contactMomentsLabel: "Уведомления о Контактных Моментах",
    cancelBtn: "Отмена",
    saveBtn: "Сохранить",
    missingInfo: "Отсутствует Информация",
    missingInfoMsg: "Имя и сумма обязательны.",
    invalidAmount: "Неверная Сумма",
    invalidAmountMsg: "Пожалуйста, введите корректную сумму.",
    removePartner: "Удалить Партнёра",
    removeConfirm: "Вы уверены?",
    removeCancel: "Отмена",
    removeOk: "Удалить",
    alertRebate: "💰 Скидка готова",
    alert90day: "📋 Аудит 90 дней",
    alert11month: "📅 Решение на 11-й Месяц — Выбрать: Доставка домой или Выкуп 100%",
    alert30day: "⏰ 30 дней до конца цикла — подтвердить решение партнёра",
    alert12month: "🔴 12-месячный цикл завершён — немедленные действия",
    savingsTitle: "💰 ЦЕЛЬ НАКОПЛЕНИЙ",
    savingsDesc: "Введите желаемый ежемесячный пассивный доход. Мы найдём депозит, при котором 75% скидки покрывает вашу цель — капитал остаётся нетронутым.",
    savingsGoalLabel: "Целевой Ежемесячный Доход ($)",
    findSavingsBtn: "Найти Мой Сберегательный План",
    savingsNote: "75% ежемесячной скидки = ваша цель. Капитал сохраняется.",
    assetTitle: "🏡 ПЛАНИРОВЩИК АКТИВОВ",
    assetDesc: "Хотите купить недвижимость или автомобиль? Введите целевую сумму и срок. Мы найдём депозит, который накопит эту сумму через сложные скидки.",
    assetTargetLabel: "Целевая Сумма ($)",
    assetYearsLabel: "Срок (лет)",
    findAssetBtn: "Найти Мой План Активов",
    assetNote: "Сложные скидки формируют вашу сумму. 20% реинвестируется ежемесячно.",
    assetApplyNoVip: "📊 Применить (Без VIP)",
    assetApplyWithVip: "📊 Применить (С VIP)",
    clientLetterTitle: "Генератор письма клиенту",
    clientLetterDesc: "Создайте профессиональное вводное письмо на вашем языке — готово к копированию или мгновенному обмену.",
    alertsCount: "{count} уведомлений",
    diamondStability: "💎 Стабильность Алмаза",
    onTopOfResidual: "✨ В дополнение к вашему ежемесячному остаточному доходу",
    rankMoreTo: "{amount} до {rank}",
    rankUnlocksInfinity: "(Открывает {pct} Infinity)",
    placeholderCustomAmount: "Произвольная сумма",
    placeholderTargetAmount: "Целевая сумма",
    placeholderYears: "Лет",
    carTip: "🚗 Идеально для планирования ежемесячной аренды роскошного автомобиля или премиальных расходов.",
    targetPrefix: "Цель:",
    depositLabel: "Депозит:",
    totalOutLabel: "Всего выплачено:",
    avgMoLabel: "/мес. средн.",
    fullLabel: "Полностью:",
    pct75Label: "75%:",
    projRevTitle: "📊 ПРОГНОЗИРУЕМАЯ МОДЕЛЬ ДОХОДОВ",
    projRevDesc: "10% прямого остаточного с каждой ежемесячной покупки алмазов ваших клиентов.",
    projRevDbSize: "Размер базы",
    projRevConv: "Конверсия %",
    projRevAvgPurchase: "Средняя покупка ($)",
    projRevRebateReuse: "Реинвестирование скидки %",
    projRevMyParts: "Мои доли пула",
    projRevCalcBtn: "⚡ РАССЧИТАТЬ ПРОГНОЗИРУЕМЫЙ ДОХОД",
    projRevEstClients: "Ожид. клиенты",
    projRevTeamVol: "Объём команды",
    projRevYr5: "Год 5 Остаток/мес",
    projRevTimeline: "📈 ВРЕМЕННАЯ ШКАЛА 5-ЛЕТНЕГО РОСТА",
    projRevPeriod: "Период",
    projRevResidualCol: "10% Остаток",
    projRevPortfolioCol: "Портфель клиента",
    projRevCumulativeCol: "Накопительно",
    globalPoolTitle: "🌍 ПУТЬ ГЛОБАЛЬНОГО ПУЛА БОНУСОВ",
    globalPoolDesc: "Три пула глобального бонуса с разными требованиями к рангу. Введите значения из бэк-офиса для точной выплаты в реальном времени.",
    yourTeamVol: "Ваш Объём Команды",
    blueDiamondGateLabel: "/ $1M Порог Голубого Алмаза",
    blueDiamondUnlocked: "🔵 ГОЛУБОЙ АЛМАЗ — Пул 1 Разблокирован!",
    remainingToBlue: "{amount} до Голубого Алмаза",
    pool1Title: "Пул 1 — Голубой Алмаз 🔵",
    pool2Title: "Пул 2 — Фиолетовый Алмаз 💜",
    pool3Title: "Пул 3 — Двойной Алмаз Элита 👑",
    poolMinRankP1: "Мин. ранг: Голубой Алмаз · Макс. 6 долей",
    poolMinRankP2: "Мин. ранг: Фиолетовый Алмаз · Макс. 4 доли",
    poolMinRankP3: "Мин. ранг: Двойной Алмаз Элита · Макс. 2 доли",
    activePoolTotal: "Активный Пул Всего ($)",
    totalQualUsers: "Всего Квалиф. Пользователей",
    myPartsLabel: "Мои Доли",
    yourPayoutLabel: "Ваша Выплата:",
    fromBackOffice: "Из бэк-офиса",
    noMembersYet: "Участников пока нет",
    totalPoolPayoutLabel: "Общая Выплата Пула (3 Пула)",
    poolFormulaNote: "Формула: Пул Всего ÷ Квалиф. Пользователей × Мои Доли · Введите значения из бэк-офиса.",
    levelLabel: "УРОВЕНЬ",
    arVaultDesc: "3D-просмотрщик портфеля алмазов · Сканируйте и проверяйте ваши активы в AR",
    okBtn: "ОК",
  },
  zh: {
    title: "🤝 合作伙伴工具",
    potentialTitle: "📊 潜力计算器",
    potentialDesc: "根据您的联系人数据库大小和转化率估算您的收入潜力。",
    dbSizeLabel: "您的数据库大小（联系人）",
    convRateLabel: "预计转化率（%）",
    avgAmountLabel: "每位客户平均存款（$）",
    calcPotentialBtn: "计算潜力",
    estClients: "预计客户",
    directVolume: "产生的总交易量",
    directComm: "直接佣金（10%）",
    rebatePool: "每月折扣池（~3%）",
    callListTitle: "📋 通话列表仪表板",
    addBtn: "+ 添加",
    noPartners: "暂无合作伙伴",
    noPartnersDesc: "点击\"+ 添加\"添加您的第一个合作伙伴，包括其详细信息、开始日期和投资金额。",
    month: "月",
    started: "开始于",
    propTitle: "🏠 房产优化器",
    propDesc: "输入您的每月房产成本。优化器将告诉您哪个解决方案计划（有或没有VIP）可以覆盖这些成本。",
    propCostLabel: "每月房产成本（$）",
    findPlanBtn: "找到我的计划",
    recPlan: "推荐计划",
    depositReq: "所需存款",
    rebateRate: "每月折扣率",
    vipReq: "需要VIP",
    vipYes: "是（+$1,000）",
    vipNo: "否",
    propNote: "每月折扣覆盖您的房产成本。",
    withoutVip: "无VIP",
    withVip: "有VIP",
    monthlyRebate: "每月折扣",
    annualRebate: "年度折扣",
    applyToScenario: "📊 在场景工具中打开",
    applyToStrategyNote: "预填存款、VIP和从第1个月起的每月提款",
    applyNoVip: "📊 应用（无VIP）",
    applyWithVip: "📊 应用（有VIP）",
    addPartner: "添加合作伙伴",
    editPartner: "编辑合作伙伴",
    nameLabel: "姓名 *",
    whatsappLabel: "WhatsApp号码",
    countryLabel: "国家",
    startDateLabel: "开始日期（DD-MM-YYYY）",
    amountLabel: "投资金额（$）*",
    contactMomentsLabel: "联系时机提醒",
    cancelBtn: "取消",
    saveBtn: "保存",
    missingInfo: "缺少信息",
    missingInfoMsg: "姓名和金额为必填项。",
    invalidAmount: "金额无效",
    invalidAmountMsg: "请输入有效金额。",
    removePartner: "删除合作伙伴",
    removeConfirm: "您确定吗？",
    removeCancel: "取消",
    removeOk: "删除",
    alertRebate: "💰 折扣已准备好",
    alert90day: "📋 90天审计到期",
    alert11month: "📅 第11个月决策到期 — 选择：送货上门或100%回购",
    alert30day: "⏰ 距周期结束30天 — 确认合作伙伴的决定",
    alert12month: "🔴 12个月周期结束 — 立即需要采取行动",
    savingsTitle: "💰 储蓄目标",
    savingsDesc: "输入您的目标月被动收入。我们找到75%回扣覆盖您目标的存款金额——您的资本保持完整。",
    savingsGoalLabel: "目标月收入 ($)",
    findSavingsBtn: "找到我的储蓄计划",
    savingsNote: "75%月回扣 = 您的目标收入。资本保持完整。",
    assetTitle: "🏡 资产目标规划器",
    assetDesc: "想全款购买房产或汽车？输入目标金额和时间框架。我们找到通过复利回扣积累该金额所需的存款。",
    assetTargetLabel: "目标金额 ($)",
    assetYearsLabel: "时间框架（年）",
    findAssetBtn: "找到我的资产计划",
    assetNote: "复利回扣积累您的金额。每月20%再投资。",
    assetApplyNoVip: "📊 应用（无VIP）",
    assetApplyWithVip: "📊 应用（含VIP）",
    clientLetterTitle: "客户信函生成器",
    clientLetterDesc: "用您的语言创建一封专业的介绍信——随时可复制或分享。",
    alertsCount: "{count} 条提醒",
    diamondStability: "💎 钻石稳定性",
    onTopOfResidual: "✨ 除您的月度被动收入之外",
    rankMoreTo: "再需 {amount} 到 {rank}",
    rankUnlocksInfinity: "（解锁 {pct} Infinity）",
    placeholderCustomAmount: "自定义金额",
    placeholderTargetAmount: "目标金额",
    placeholderYears: "年",
    carTip: "🚗 完美规划您的每月豪华汽车租赁或高端生活方式费用。",
    targetPrefix: "目标：",
    depositLabel: "存款：",
    totalOutLabel: "总支付：",
    avgMoLabel: "/月 均",
    fullLabel: "全额：",
    pct75Label: "75%：",
    projRevTitle: "📊 预计收入模型",
    projRevDesc: "每次客户每月购买钻石可获得10%直接被动收入。",
    projRevDbSize: "数据库大小",
    projRevConv: "转化率 %",
    projRevAvgPurchase: "平均购买额 ($)",
    projRevRebateReuse: "回扣再投资 %",
    projRevMyParts: "我的池份额",
    projRevCalcBtn: "⚡ 计算预计收入",
    projRevEstClients: "预计客户",
    projRevTeamVol: "团队交易量",
    projRevYr5: "第5年 被动/月",
    projRevTimeline: "📈 5年增长时间线",
    projRevPeriod: "时间段",
    projRevResidualCol: "10% 被动收入",
    projRevPortfolioCol: "客户投资组合",
    projRevCumulativeCol: "累计",
    globalPoolTitle: "🌍 全球奖金池路径",
    globalPoolDesc: "三个不同级别要求的全球奖金池。输入您的后台数值以获得准确的实时支付。",
    yourTeamVol: "您的团队交易量",
    blueDiamondGateLabel: "/ $1M 蓝钻门槛",
    blueDiamondUnlocked: "🔵 蓝钻 — 池1已解锁！",
    remainingToBlue: "距蓝钻还需 {amount}",
    pool1Title: "池1 — 蓝钻 🔵",
    pool2Title: "池2 — 紫钻 💜",
    pool3Title: "池3 — 双钻精英 👑",
    poolMinRankP1: "最低等级：蓝钻 · 最多6份",
    poolMinRankP2: "最低等级：紫钻 · 最多4份",
    poolMinRankP3: "最低等级：双钻精英 · 最多2份",
    activePoolTotal: "活跃池总额 ($)",
    totalQualUsers: "合格用户总数",
    myPartsLabel: "我的份额",
    yourPayoutLabel: "您的收益：",
    fromBackOffice: "来自后台",
    noMembersYet: "暂无成员",
    totalPoolPayoutLabel: "总池支付（全部3个池）",
    poolFormulaNote: "公式：池总额 ÷ 合格用户总数 × 我的份额 · 请输入后台数值以确保准确性。",
    levelLabel: "级别",
    arVaultDesc: "3D钻石投资组合查看器 · 在AR中扫描并检查您的资产",
    okBtn: "确定",
  },
};

// ─── Contact Moment Options ────────────────────────────────────────────────────
const CONTACT_MOMENT_KEYS = ["alertRebate", "alert90day", "alert11month", "alert30day", "alert12month"] as const;
type ContactMomentKey = typeof CONTACT_MOMENT_KEYS[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const ddmm = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmm) {
    return new Date(parseInt(ddmm[3]), parseInt(ddmm[2]) - 1, parseInt(ddmm[1]));
  }
  return new Date(dateStr);
}

function formatDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

function daysBetween(dateStr: string): number {
  const start = parseDate(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function monthsElapsed(dateStr: string): number {
  const start = parseDate(dateStr);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(0, months);
}

function getAlerts(partner: Partner, tx: typeof TX["en"]): string[] {
  const alerts: string[] = [];
  const days = daysBetween(partner.startDate);
  const months = monthsElapsed(partner.startDate);
  const enabled = partner.contactMoments && partner.contactMoments.length > 0
    ? partner.contactMoments
    : CONTACT_MOMENT_KEYS as unknown as string[]; // default: all enabled

  const estimatedMonthlyRebate = partner.amount * 0.03;
  if (enabled.includes("alertRebate") && estimatedMonthlyRebate >= 100) {
    alerts.push(`${tx.alertRebate} ~$${Math.round(estimatedMonthlyRebate)}/mo`);
  }
  if (enabled.includes("alert90day") && days >= 80 && days <= 100) {
    alerts.push(tx.alert90day);
  }
  if (enabled.includes("alert11month") && months === 11) {
    alerts.push(tx.alert11month);
  }
  if (enabled.includes("alert30day") && months >= 11 && months < 12) {
    alerts.push(tx.alert30day);
  }
  if (enabled.includes("alert12month") && months >= 12) {
    alerts.push(tx.alert12month);
  }

  // ── Compounding Review Trigger ──────────────────────────────────────────
  // Highlight clients whose portfolio has grown enough to warrant a new conversation
  const estimatedCurrentPortfolio = partner.amount * Math.pow(1 + 0.033 * 0.5, months); // ~50% avg reuse
  const portfolioGrowthPct = ((estimatedCurrentPortfolio - partner.amount) / partner.amount) * 100;
  if (months >= 6 && months < 12 && portfolioGrowthPct >= 10) {
    alerts.push(`📈 Compounding Review — Portfolio est. +${portfolioGrowthPct.toFixed(0)}% (Mo.${months})`);
  }
  if (months >= 12 && portfolioGrowthPct >= 20) {
    alerts.push(`💎 Compounding Review — Portfolio est. +${portfolioGrowthPct.toFixed(0)}% — New strategy opportunity!`);
  }

  return alerts;
}

function getSPLabel(amount: number): string {
  if (amount >= 100_000) return "SP7 (3.3%)";
  if (amount >= 50_000)  return "SP6 (3.2%)";
  if (amount >= 10_000)  return "SP5 (3.1%)";
  if (amount >= 5_000)   return "SP4 (3.0%)";
  if (amount >= 2_500)   return "SP3 (2.7%)";
  if (amount >= 1_000)   return "SP2 (2.45%)";
  return "SP1 (2.2%)";
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PartnerToolsScreen() {
  const { language } = useCalculator();
  const tx = TX[language] ?? TX.en;
  const router = useRouter();

  const [dbSize, setDbSize] = useState("100");
  const [convRate, setConvRate] = useState("10");
  const [avgAmount, setAvgAmount] = useState("5000");
  // ── New Adviser Dashboard state ──────────────────────────────────────
  const [referralCode, setReferralCode] = useState("");
  const [editingCode, setEditingCode] = useState(false);
  const [tempCode, setTempCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [globalStats, setGlobalStats] = useState({ globalTurnover: 10_000_000, pool1Parts: 4, pool2Parts: 2, pool3Parts: 1 });
  const [revenueDb, setRevenueDb] = useState("200");
  const [revenueConv, setRevenueConv] = useState("10");
  const [revenueAvg, setRevenueAvg] = useState("10000");
  const [revenueReuse, setRevenueReuse] = useState("50");
  const [revenueParts, setRevenueParts] = useState("1");
  const [revenueResult, setRevenueResult] = useState<ReturnType<typeof calcTimeline> | null>(null);

  // Live pool inputs — Adviser fills from back office
  const [pool1Total, setPool1Total] = useState("73908");
  const [pool1Users, setPool1Users] = useState("14");
  const [pool1Parts, setPool1Parts] = useState("0");
  const [pool2Total, setPool2Total] = useState("73908");
  const [pool2Users, setPool2Users] = useState("3");
  const [pool2Parts, setPool2Parts] = useState("0");
  const [pool3Total, setPool3Total] = useState("297522");
  const [pool3Users, setPool3Users] = useState("0");
  const [pool3Parts, setPool3Parts] = useState("0");

  // Referral code loader + stats
  React.useEffect(() => {
    AsyncStorage.getItem(REFERRAL_STORAGE_KEY).then(v => { if (v) setReferralCode(v); });
    fetchDailyStats().then(setGlobalStats);
  }, []);

  const poolTeamVolume = React.useMemo(() => {
    const c = Math.floor((parseFloat(revenueDb)||0) * ((parseFloat(revenueConv)||0) / 100));
    return c * (parseFloat(revenueAvg)||0);
  }, [revenueDb, revenueConv, revenueAvg]);
  const poolProgress = Math.min(poolTeamVolume / BLUE_DIAMOND_THRESHOLD, 1);

  const handleCopyLink = async () => {
    const link = referralCode ? `${REFERRAL_BASE}${referralCode}` : "";
    if (!link) { Alert.alert("No code", "Set your referral code first."); return; }
    await Clipboard.setStringAsync(link);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };
  const handleSaveCode = async () => {
    const trimmed = tempCode.trim();
    setReferralCode(trimmed);
    await AsyncStorage.setItem(REFERRAL_STORAGE_KEY, trimmed);
    setEditingCode(false);
  };
  const handleCalcRevenue = () => {
    setRevenueResult(calcTimeline(
      parseFloat(revenueDb)||0, parseFloat(revenueConv)||0,
      parseFloat(revenueAvg)||0, parseFloat(revenueReuse)||0,
      parseFloat(revenueParts)||1, globalStats
    ));
  };
  // ─────────────────────────────────────────────────────────────────────────

  const [potentialResult, setPotentialResult] = useState<{
    clients: number;
    totalVolume: number;
    directComm: number;
    monthlyRebatePool: number;
  } | null>(null);

  const [propCost, setPropCost] = useState("2000");
  const [propResult, setPropResult] = useState<{
    noVip: { deposit: number; sp: string; rate: number; monthlyRebate: number };
    withVip: { deposit: number; sp: string; rate: number; monthlyRebate: number };
    targetCost: number;
  } | null>(null);

  // Savings Goal state
  const [savingsGoal, setSavingsGoal] = useState("2000");
  const [savingsResult, setSavingsResult] = useState<{
    noVip: { deposit: number; sp: string; rate: number; monthlyRebate: number; payout75: number };
    withVip: { deposit: number; sp: string; rate: number; monthlyRebate: number; payout75: number };
    targetIncome: number;
  } | null>(null);

  // Asset Goal Planner state
  const [assetTarget, setAssetTarget] = useState("250000");
  const [assetYears, setAssetYears] = useState("5");
  const [assetResult, setAssetResult] = useState<{
    noVip: { deposit: number; netDeposit: number; entryFee: number; sp: string; rate: number; totalOut: number; avgMonthly: number };
    withVip: { deposit: number; netDeposit: number; entryFee: number; sp: string; rate: number; totalOut: number; avgMonthly: number };
    targetAmount: number;
    years: number;
  } | null>(null);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    country: "",
    startDate: formatDDMMYYYY(new Date()),
    amount: "",
    level: "1",
    contactMoments: [...CONTACT_MOMENT_KEYS] as string[],
  });

  const [inAppAlert, setInAppAlert] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    loadPartners();
    setupNotificationHandler();
    // Request permission on first load (non-blocking)
    requestNotificationPermission().catch(() => {});
    // Listen for notifications while app is open → show in-app modal
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      if (title && body) setInAppAlert({ title, body });
    });
    return () => sub.remove();
  }, []);

  const loadPartners = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setPartners(JSON.parse(raw));
    } catch {}
  };

  const savePartners = async (list: Partner[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setPartners(list);
    } catch {}
  };

  const openAddModal = () => {
    setEditingPartner(null);
    setForm({ name: "", whatsapp: "", country: "", startDate: formatDDMMYYYY(new Date()), amount: "", level: "1", contactMoments: [...CONTACT_MOMENT_KEYS] });
    setShowAddModal(true);
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      whatsapp: partner.whatsapp,
      country: partner.country,
      startDate: partner.startDate,
      amount: partner.amount.toString(),
      level: String(partner.level ?? 1),
      contactMoments: partner.contactMoments ?? [...CONTACT_MOMENT_KEYS],
    });
    setShowAddModal(true);
  };

  const toggleContactMoment = (key: string) => {
    setForm((f) => {
      const already = f.contactMoments.includes(key);
      return {
        ...f,
        contactMoments: already
          ? f.contactMoments.filter((k) => k !== key)
          : [...f.contactMoments, key],
      };
    });
  };

  const savePartner = () => {
    if (!form.name.trim() || !form.amount) {
      Alert.alert(tx.missingInfo, tx.missingInfoMsg);
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(tx.invalidAmount, tx.invalidAmountMsg);
      return;
    }
    const partner: Partner = {
      id: editingPartner ? editingPartner.id : Date.now().toString(),
      name: form.name.trim(),
      whatsapp: form.whatsapp.trim(),
      country: form.country.trim(),
      startDate: form.startDate,
      amount,
      level: (parseInt(form.level) || 1) as 1 | 2 | 3,
      contactMoments: form.contactMoments,
    };
    let updated: Partner[];
    if (editingPartner) {
      updated = partners.map((p) => (p.id === editingPartner.id ? partner : p));
    } else {
      updated = [partner, ...partners];
    }
    savePartners(updated);
    setShowAddModal(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Schedule push notifications for this partner
    schedulePartnerNotifications(
      { ...partner, startDate: partner.startDate.split("-").reverse().join("-") },
      {
        alertRebate: tx.alertRebate,
        alert90day: tx.alert90day,
        alert11month: tx.alert11month,
        alert30day: tx.alert30day,
        alert12month: tx.alert12month,
      }
    ).catch(() => {});
  };

  const deletePartner = (id: string) => {
    const doDelete = () => {
      const updated = partners.filter((p) => p.id !== id);
      savePartners(updated);
      cancelPartnerNotifications(id).catch(() => {});
    };
    if (Platform.OS === "web") {
      if (window.confirm(tx.removeConfirm)) doDelete();
    } else {
      Alert.alert(tx.removePartner, tx.removeConfirm, [
        { text: tx.removeCancel, style: "cancel" },
        { text: tx.removeOk, style: "destructive", onPress: doDelete },
      ]);
    }
  };

  const calculatePotential = () => {
    const db = parseFloat(dbSize) || 0;
    const conv = parseFloat(convRate) / 100 || 0;
    const avg = parseFloat(avgAmount) || 0;
    const clients = Math.round(db * conv);
    const totalVolume = clients * avg;
    const directComm = totalVolume * 0.1;
    const monthlyRebatePool = totalVolume * 0.03;
    setPotentialResult({ clients, totalVolume, directComm, monthlyRebatePool });
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const calculateProperty = () => {
    const cost = parseFloat(propCost) || 0;
    if (cost <= 0) return;

    // Plan D binary search — same engine as Strategy Engineer Plan D
    // Finds the exact deposit where stratSimulate(deposit, 1, 0, 75, vip) >= cost
    const planDSearch = (vip: boolean) => {
      let low = 0, high = 5_000_000;
      for (let i = 0; i < 40; i++) {
        const mid = (low + high) / 2;
        if (stratSimulate(mid, 1, 0, 75, vip) >= cost) high = mid;
        else low = mid;
      }
      const deposit = Math.ceil(high);
      const sp = getSPLevel(deposit);
      const actualRebate = stratSimulate(deposit, 1, 0, 75, vip);
      const baseRate = sp.baseRate + (vip ? 3.0 : 0);
      return {
        deposit,
        sp: sp.name + (vip ? "+VIP" : ""),
        rate: baseRate,
        monthlyRebate: Math.round(actualRebate),
      };
    };

    const noVipResult = planDSearch(false);
    const withVipResult = planDSearch(true);

    setPropResult({
      noVip: noVipResult,
      withVip: withVipResult,
      targetCost: cost,
    });
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleApplyNoVip = () => {
    if (!propResult) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(tabs)/scenario-tool",
      params: {
        source: "property",
        startAmount: String(propResult.noVip.deposit),
        years: "10",
        vip: "0",
        propWithdrawal: String(propResult.targetCost),
        propWithdrawalFrom: "1",
      },
    });
  };

  const handleApplyWithVip = () => {
    if (!propResult) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(tabs)/scenario-tool",
      params: {
        source: "property",
        startAmount: String(propResult.withVip.deposit),
        years: "10",
        vip: "1",
        propWithdrawal: String(propResult.targetCost),
        propWithdrawalFrom: "1",
      },
    });
  };

  // ── Savings Goal: 75% withdrawal target income ────────────────────────────
  const calculateSavings = () => {
    const income = parseFloat(savingsGoal) || 0;
    if (income <= 0) return;
    // Binary search: find deposit where 75% of monthly rebate = target income
    // i.e. stratSimulate(deposit, 1, 0, 75, vip) >= income
    const savingsSearch = (vip: boolean) => {
      let low = 0, high = 5_000_000;
      for (let i = 0; i < 40; i++) {
        const mid = (low + high) / 2;
        if (stratSimulate(mid, 1, 0, 75, vip) >= income) high = mid;
        else low = mid;
      }
      const deposit = Math.ceil(high);
      const netDep = getNetDeposit(deposit);
      const sp = getSPLevel(netDep);
      const fullRebate = netDep * (sp.baseRate + (vip ? 3.0 : 0)) / 100;
      const payout75 = Math.round(fullRebate * 0.75);
      const baseRate = sp.baseRate + (vip ? 3.0 : 0);
      return {
        deposit,
        sp: sp.name + (vip ? "+VIP" : ""),
        rate: baseRate,
        monthlyRebate: Math.round(fullRebate),
        payout75,
      };
    };
    setSavingsResult({
      noVip: savingsSearch(false),
      withVip: savingsSearch(true),
      targetIncome: income,
    });
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSavingsApplyNoVip = () => {
    if (!savingsResult) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(tabs)/scenario-tool",
      params: {
        source: "property",
        startAmount: String(savingsResult.noVip.deposit),
        years: "10",
        vip: "0",
        propWithdrawal: String(savingsResult.targetIncome),
        propWithdrawalFrom: "1",
      },
    });
  };

  const handleSavingsApplyWithVip = () => {
    if (!savingsResult) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(tabs)/scenario-tool",
      params: {
        source: "property",
        startAmount: String(savingsResult.withVip.deposit),
        years: "10",
        vip: "1",
        propWithdrawal: String(savingsResult.targetIncome),
        propWithdrawalFrom: "1",
      },
    });
  };

  // ── Asset Goal Planner: lump-sum accumulation (20% reinvested) ─────────────
  // Simulate N months with 80% out%. inleg is the gross deposit; fee is deducted
  // inside. The binary search finds the minimum gross, then the entry fee is added
  // on top so the displayed deposit = gross + fee (the true total the customer wires).
  const simulateTotalOut = (grossDeposit: number, months: number, vipEnabled: boolean): number => {
    const years = months / 12;
    const monthData: Record<number, MonthData> = {};
    for (let m = 1; m <= months; m++) {
      monthData[m] = { stort: 0, opn: 0, opnP: 80, comp: 100 };
    }
    const result = runCalculation({
      startAmount: getNetDeposit(grossDeposit),
      years,
      goal: 0,
      vipEnabled,
      manualVip: false,
      monthData,
    });
    return result.totalOut;
  };

  const calculateAsset = () => {
    const target = parseFloat(assetTarget) || 0;
    const years = parseInt(assetYears) || 5;
    if (target <= 0 || years <= 0) return;
    const months = years * 12;
    // Binary search finds minimum gross deposit where total 80% withdrawals >= target.
    // Fee is then added on top so the displayed deposit = gross + fee (what the customer actually wires).
    const assetSearch = (vip: boolean) => {
      let low = 0, high = 10_000_000;
      for (let i = 0; i < 60; i++) {
        const mid = (low + high) / 2;
        if (simulateTotalOut(mid, months, vip) >= target) high = mid;
        else low = mid;
      }
      const grossBase = Math.ceil(high);
      // Add entry fee on top: fee = $5 flat + 1.25% of grossBase
      const deposit = Math.ceil(grossBase + 5 + grossBase * 0.0125);
      const netDeposit = Math.floor(getNetDeposit(deposit));
      const entryFee = deposit - netDeposit;
      const sp = getSPLevel(netDeposit);
      const totalOut = Math.round(simulateTotalOut(grossBase, months, vip));
      const avgMonthly = Math.round(totalOut / months);
      const baseRate = sp.baseRate + (vip ? 3.0 : 0);
      return { deposit, netDeposit, entryFee, sp: sp.name + (vip ? "+VIP" : ""), rate: baseRate, totalOut, avgMonthly };
    };
    setAssetResult({
      noVip: assetSearch(false),
      withVip: assetSearch(true),
      targetAmount: target,
      years,
    });
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleAssetApplyNoVip = () => {
    if (!assetResult) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(tabs)/scenario-tool",
      params: {
        plan: "property",
        startAmount: String(assetResult.noVip.deposit),
        years: String(assetResult.years),
        outP: "80",
        vip: "0",
      },
    });
  };

  const handleAssetApplyWithVip = () => {
    if (!assetResult) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(tabs)/scenario-tool",
      params: {
        plan: "property",
        startAmount: String(assetResult.withVip.deposit),
        years: String(assetResult.years),
        outP: "80",
        vip: "1",
      },
    });
  };

  const alertCount = partners.reduce((sum, p) => sum + getAlerts(p, tx).length, 0);

  // ── Rank detection (mirrors affiliate.tsx) ──────────────────────────────
  const rankVolume = React.useMemo(() => partners.reduce((s, p) => s + p.amount, 0), [partners]);
  const currentTier = React.useMemo(() => {
    let tier = DIAMOND_TIERS[0];
    for (const row of DIAMOND_TIERS) {
      if (rankVolume >= parseVol(row.teamVol)) tier = row;
      else break;
    }
    return tier;
  }, [rankVolume]);
  const nextTier = React.useMemo(() => {
    const idx = DIAMOND_TIERS.findIndex(row => row.rank === currentTier.rank);
    return idx < DIAMOND_TIERS.length - 1 ? DIAMOND_TIERS[idx + 1] : null;
  }, [currentTier]);
  const rankProgressPct = React.useMemo(() => {
    if (!nextTier) return 100;
    const curVol = parseVol(currentTier.teamVol);
    const nextVol = parseVol(nextTier.teamVol);
    return Math.min(100, ((rankVolume - curVol) / (nextVol - curVol)) * 100);
  }, [rankVolume, currentTier, nextTier]);
  const totalRankBonusAchieved = React.useMemo(() => {
    let sum = 0;
    for (const row of DIAMOND_TIERS) {
      sum += parseRankBonus(row.bonus);
      if (row.rank === currentTier.rank) break;
    }
    return sum;
  }, [currentTier]);
  const isBlueDiamondReached = React.useMemo(() => {
    const bdIdx = DIAMOND_TIERS.findIndex(row => row.rank === "Blue Diamond");
    const curIdx = DIAMOND_TIERS.findIndex(row => row.rank === currentTier.rank);
    return curIdx >= bdIdx;
  }, [currentTier]);

  // ── Residual Stream — L1 10% + L2 5% + L3 3% + Infinity (mirrors affiliate.tsx) ──
  const residualSummary = React.useMemo(() => {
    if (partners.length === 0) return null;
    let totalPortfolio = 0;
    let l1 = 0, l2 = 0, l3 = 0, totalRebate = 0;
    let compoundingReviewCount = 0;
    partners.forEach(p => {
      const months = monthsElapsed(p.startDate);
      let portfolio = p.amount;
      for (let m = 0; m < months; m++) portfolio += portfolio * 0.033 * 0.5;
      const rebate = portfolio * 0.033 * 0.5;
      totalPortfolio += portfolio;
      totalRebate += rebate;
      const lvl = p.level ?? 1;
      if (lvl === 1)      l1 += rebate * 0.10;
      else if (lvl === 2) l2 += rebate * 0.05;
      else                l3 += rebate * 0.03;
      const growth = ((portfolio - p.amount) / p.amount) * 100;
      if (months >= 6 && growth >= 10) compoundingReviewCount++;
    });
    const totalAgentResidual = l1 + l2 + l3 + (totalRebate * parseInfPct(currentTier.infinity));
    return { totalPortfolio, totalMonthlyRebate: totalRebate, totalAgentResidual, compoundingReviewCount };
  }, [partners, currentTier]);

  return (
    <ScreenContainer bgColor="#0d1a2a">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── HEADER ── */}
        <View style={[S.header, { borderBottomWidth: 1, borderBottomColor: "#1a3550", paddingBottom: 16, marginBottom: 16 }]}>
          <Text style={S.headerTitle}>{t(language, "advCmdCentre")}</Text>
          <Text style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 4 }}>{t(language, "affPageSub")}</Text>
          {alertCount > 0 && (
            <View style={[S.alertBadge, { marginTop: 8 }]}>
              <Text style={S.alertBadgeText}>{tx.alertsCount.replace("{count}", String(alertCount))}</Text>
            </View>
          )}
        </View>

        {/* ── CLIENT LETTER GENERATOR ── */}
        <TouchableOpacity
          style={{
            marginHorizontal: 16, marginBottom: 14,
            backgroundColor: "rgba(230,126,34,0.08)",
            borderRadius: 14, padding: 16,
            borderWidth: 1.5, borderColor: GOLD,
            flexDirection: "row", alignItems: "center", gap: 14,
          }}
          onPress={() => router.push("/client-letter")}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 30 }}>✉️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: GOLD, fontWeight: "bold", fontSize: 15, letterSpacing: 0.3 }}>{tx.clientLetterTitle}</Text>
            <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 3, lineHeight: 17 }}>
              {tx.clientLetterDesc}
            </Text>
          </View>
          <Text style={{ color: GOLD, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        {/* ── RANK COMMAND CENTRE ── */}
        {residualSummary && (
          <View style={[S.section, { backgroundColor: "rgba(230,126,34,0.05)", borderRadius: 14, padding: 14, borderWidth: 2, borderColor: GOLD, marginBottom: 14 }]}>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 6 }}>
              {([
                { label: t(language, "affMembers"),        value: String(partners.length),                          color: BLUE  },
                { label: t(language, "affPortfolioValue"),  value: fmtM(residualSummary.totalPortfolio),            color: GOLD  },
                { label: t(language, "affTotalEarnings"),    value: fmtM(residualSummary.totalAgentResidual),        color: GREEN },
                { label: t(language, "affReviewCalls"),     value: String(residualSummary.compoundingReviewCount),  color: "#f97316" },
              ] as { label: string; value: string; color: string }[]).map(s => (
                <View key={s.label} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 }}>{s.label}</Text>
                  <Text style={{ color: s.color, fontSize: 13, fontWeight: "bold", marginTop: 2 }}>{s.value}</Text>
                </View>
              ))}
            </View>
            {residualSummary.compoundingReviewCount > 0 && (
              <Text style={{ color: "#f97316", fontSize: 11, lineHeight: 16, marginBottom: 6 }}>
                {t(language, "affReviewNote").replace("{count}", String(residualSummary.compoundingReviewCount))}
              </Text>
            )}
            {/* Anti-Inflation Counter */}
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 8, marginTop: 2 }}>
              <View style={{ flex: 1, backgroundColor: "rgba(239,68,68,0.07)", borderRadius: 7, padding: 8, borderWidth: 1, borderColor: "rgba(239,68,68,0.18)" }}>
                <Text style={{ color: "#ef4444", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 }}>{t(language, "affInflationLoss")}</Text>
                <Text style={{ color: "#f87171", fontSize: 13, fontWeight: "bold", marginTop: 2 }}>−{fmtM(residualSummary.totalPortfolio * 0.04 / 12)}/mo</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: "rgba(34,197,94,0.07)", borderRadius: 7, padding: 8, borderWidth: 1, borderColor: "rgba(34,197,94,0.18)" }}>
                <Text style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 }}>{tx.diamondStability}</Text>
                <Text style={{ color: GREEN, fontSize: 13, fontWeight: "bold", marginTop: 2 }}>+{fmtM(residualSummary.totalMonthlyRebate)}/mo</Text>
              </View>
            </View>
            {/* Rank Advancement Tracker */}
            <View style={{ backgroundColor: "rgba(51,197,255,0.06)", borderRadius: 8, padding: 10, marginTop: 4, borderWidth: 1, borderColor: "rgba(51,197,255,0.15)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                  {currentTier.emoji} {currentTier.rank}
                </Text>
                {nextTier && (
                  <Text style={{ color: "#64748b", fontSize: 10 }}>
                    → {nextTier.emoji} {nextTier.rank} ({nextTier.teamVol})
                  </Text>
                )}
              </View>
              <View style={{ height: 6, backgroundColor: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                <View style={{ height: 6, borderRadius: 3, width: `${rankProgressPct.toFixed(0)}%` as any, backgroundColor: isBlueDiamondReached ? "#1d4ed8" : nextTier?.rank === "Blue Diamond" ? "#3b82f6" : BLUE }} />
              </View>
              {nextTier && (
                <Text style={{ color: "#94a3b8", fontSize: 10, marginTop: 4 }}>
                  {tx.rankMoreTo.replace("{amount}", fmtM(Math.max(0, parseVol(nextTier.teamVol) - rankVolume))).replace("{rank}", nextTier.rank)}
                  {parseInfPct(nextTier.infinity) > 0 ? ` ${tx.rankUnlocksInfinity.replace("{pct}", nextTier.infinity)}` : ""}
                </Text>
              )}
              {isBlueDiamondReached && (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, backgroundColor: "rgba(29,78,216,0.15)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(29,78,216,0.45)", alignSelf: "flex-start" }}>
                  <Text style={{ color: "#60a5fa", fontSize: 11, fontWeight: "bold" }}>{t(language, "affGlobalPool")}</Text>
                </View>
              )}
              {!isBlueDiamondReached && nextTier?.rank === "Blue Diamond" && (
                <Text style={{ color: "#60a5fa", fontSize: 10, marginTop: 4, fontStyle: "italic" }}>
                  {t(language, "affBlueDiamondGateway")}
                </Text>
              )}
              {totalRankBonusAchieved > 0 && (
                <View style={{ backgroundColor: "rgba(230,126,34,0.12)", borderRadius: 10, padding: 12, marginTop: 8, borderWidth: 1.5, borderColor: GOLD }}>
                  <Text style={{ color: GOLD, fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                    {t(language, "affTotalDiamondValue")}
                  </Text>
                  <Text style={{ color: GOLD, fontSize: 26, fontWeight: "bold" }}>${totalRankBonusAchieved.toLocaleString()}</Text>
                  <Text style={{ color: "#94a3b8", fontSize: 10, marginTop: 4, lineHeight: 15 }}>
                    {"💎"} <Text style={{ color: GREEN, fontWeight: "bold" }}>{t(language, "affRankPaidIn")}</Text>{t(language, "affRankPaidInDesc")}
                  </Text>
                  <Text style={{ color: "#f59e0b", fontSize: 11, fontWeight: "bold", marginTop: 6 }}>
                    {tx.onTopOfResidual}
                  </Text>
                </View>
              )}

              {/* ── Income Projection (5% monthly team growth) ── */}
              {residualSummary.totalAgentResidual > 0 && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <View style={{ flex: 1, backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 7, padding: 8, alignItems: "center", borderWidth: 1, borderColor: "rgba(34,197,94,0.2)" }}>
                    <Text style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 }}>{t(language, "affEst6Mo")}</Text>
                    <Text style={{ color: "#22c55e", fontSize: 13, fontWeight: "bold", marginTop: 2 }}>{fmtM(residualSummary.totalAgentResidual * 1.34)}/mo</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 7, padding: 8, alignItems: "center", borderWidth: 1, borderColor: "rgba(34,197,94,0.2)" }}>
                    <Text style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 }}>{t(language, "affEst1Yr")}</Text>
                    <Text style={{ color: "#22c55e", fontSize: 14, fontWeight: "bold", marginTop: 2 }}>{fmtM(residualSummary.totalAgentResidual * 1.80)}/mo</Text>
                    <Text style={{ color: GOLD, fontSize: 9, marginTop: 4, textAlign: "center", lineHeight: 13 }}>
                      {t(language, "affLegacyScore").replace("{years}", String(Math.max(1, Math.floor(residualSummary.totalAgentResidual * 1.80 * 12 / 30000))))}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

{/* ── SECTION 0A: REFERRAL CODE — Pinned Header ── */}
        <View style={[S.section, { backgroundColor: "#0a1628", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: BLUE, marginBottom: 14 }]}>
          <Text style={{ color: GOLD, fontSize: 13, fontWeight: "bold", letterSpacing: 0.8, marginBottom: 10, textTransform: "uppercase" }}>
            {t(language, "affReferralLinkTitle")}
          </Text>
          {editingCode ? (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              <TextInput style={[S.input, { flex: 1, marginBottom: 0 }]} value={tempCode} onChangeText={setTempCode}
                placeholder={t(language, "affEnterCode")} placeholderTextColor="#2a4a6a"
                autoCapitalize="none" autoCorrect={false} returnKeyType="done" onSubmitEditing={handleSaveCode} autoFocus />
              <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" }} onPress={handleSaveCode}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#0f2035", alignItems: "center", justifyContent: "center" }} onPress={() => setEditingCode(false)}>
                <Text style={{ color: "#64748b", fontSize: 16, fontWeight: "bold" }}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: referralCode ? "#94a3b8" : "#2a4a6a", fontSize: 12, lineHeight: 18 }} numberOfLines={2}>
                  {referralCode ? `${REFERRAL_BASE}${referralCode}` : t(language, "affNoCodeSet")}
                </Text>
              </View>
              <TouchableOpacity onPress={() => { setTempCode(referralCode); setEditingCode(true); }} style={{ padding: 6 }}>
                <Text style={{ fontSize: 20 }}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity style={{ flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center", backgroundColor: copied ? GREEN : BLUE }} onPress={handleCopyLink}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "bold" }}>{copied ? t(language, "affCopied") : t(language, "affCopyLink")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center", backgroundColor: "#0f2035", borderWidth: 1, borderColor: "#1a3550" }}
              onPress={() => referralCode ? Linking.openURL(`${REFERRAL_BASE}${referralCode}`) : Alert.alert("No code", "Set your referral code first.")}>
              <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "bold" }}>{t(language, "affOpenLink")}</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* ── SECTION 2: Call List Dashboard ──────────────────────────────── */}
        <View style={[S.section, { backgroundColor: "#0f2035", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1a3550", marginBottom: 12 }]}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>{t(language, "affDashboardTitle")}</Text>
            <TouchableOpacity style={S.addBtn} onPress={openAddModal} activeOpacity={0.8}>
              <Text style={S.addBtnText}>{tx.addBtn}</Text>
            </TouchableOpacity>
          </View>

          {partners.length === 0 ? (
            <View style={S.emptyCard}>
              <Text style={S.emptyIcon}>👥</Text>
              <Text style={S.emptyTitle}>{tx.noPartners}</Text>
              <Text style={S.emptyDesc}>{tx.noPartnersDesc}</Text>
            </View>
          ) : (
            <FlatList
              data={partners}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const alerts = getAlerts(item, tx);
                const months = monthsElapsed(item.startDate);
                const sp = getSPLabel(item.amount);
                return (
                  <View style={S.partnerCard}>
                    <View style={S.partnerHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={S.partnerName}>{item.name}</Text>
                        <Text style={S.partnerSub}>
                          {item.country ? `${item.country} · ` : ""}{sp} · ${item.amount.toLocaleString()} · {tx.started} {item.startDate} · {tx.month} {months}/12
                        </Text>
                        {item.whatsapp ? (
                          <Text style={S.partnerWhatsapp}>📱 {item.whatsapp}</Text>
                        ) : null}
                      </View>
                      <View style={S.partnerActions}>
                        <TouchableOpacity onPress={() => openEditModal(item)} style={S.editBtn}>
                          <Text style={S.editBtnText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deletePartner(item.id)} style={S.deleteBtn}>
                          <Text style={S.deleteBtnText}>🗑</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {alerts.length > 0 && (
                      <View style={S.alertsBox}>
                        {alerts.map((alert, i) => (
                          <Text key={i} style={S.alertText}>{alert}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              }}
            />
          )}
        </View>


        {/* ── SECURITY BADGE BAR ── */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12, justifyContent: "center" }}>
          {["💎 GIA Certified", "🔒 AES-256", "✅ 3DS2 Verified", "🛡️ Lloyd's Insured"].map(b => (
            <View key={b} style={{ backgroundColor: "#0f2035", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#1a3550" }}>
              <Text style={{ color: "#64748b", fontSize: 10, fontWeight: "bold" }}>{b}</Text>
            </View>
          ))}
        </View>


        {/* ── SECTION 3: Property Optimizer ───────────────────────────────── */}
        <View style={[S.section, { backgroundColor: "#0f2035", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: GOLD + "44", marginBottom: 12, borderTopWidth: 2, borderTopColor: GOLD }]}>
          <Text style={[S.sectionTitle, { color: GOLD }]}>{tx.propTitle}</Text>
          <View style={S.card}>
            <Text style={S.cardDesc}>{tx.propDesc}</Text>

            <Text style={S.inputLabel}>{tx.propCostLabel}</Text>
            <View style={S.chipRow}>
              {["500", "1000", "2000", "3000", "5000"].map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setPropCost(v)}
                  style={[S.chip, propCost === v && S.chipActive]}
                >
                  <Text style={[S.chipText, propCost === v && S.chipTextActive]}>${parseInt(v).toLocaleString()}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={S.input}
              value={propCost}
              onChangeText={setPropCost}
              keyboardType="numeric"
              returnKeyType="done"
              placeholderTextColor="#64748b"
              placeholder={tx.placeholderCustomAmount}
            />

            <TouchableOpacity style={S.calcBtn} onPress={calculateProperty} activeOpacity={0.8}>
              <Text style={S.calcBtnText}>{tx.findPlanBtn}</Text>
            </TouchableOpacity>

            {propResult && (
              <View style={S.resultBox}>
                <Text style={[S.resultLabel, { color: "#94a3b8", marginBottom: 10, textAlign: "center" }]}>
                  {tx.targetPrefix} ${propResult.targetCost.toLocaleString()}/mo — {tx.propNote}
                </Text>

                {/* Side-by-side comparison */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {/* Without VIP */}
                  <View style={[S.resultBox, { flex: 1, margin: 0, backgroundColor: "#1e293b" }]}>
                    <Text style={{ color: "#94a3b8", fontWeight: "700", fontSize: 11, textAlign: "center", marginBottom: 8 }}>{tx.withoutVip}</Text>
                    <Text style={{ color: "#38bdf8", fontWeight: "800", fontSize: 16, textAlign: "center" }}>{propResult.noVip.sp}</Text>
                    <Text style={{ color: "#e2e8f0", fontSize: 13, textAlign: "center", marginTop: 4 }}>${propResult.noVip.deposit.toLocaleString()}</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center", marginTop: 2 }}>{propResult.noVip.rate.toFixed(1)}%/mo</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center" }}>${propResult.noVip.monthlyRebate.toLocaleString()}/mo</Text>
                    <Text style={{ color: "#64748b", fontSize: 11, textAlign: "center" }}>${(propResult.noVip.monthlyRebate * 12).toLocaleString()}/yr</Text>
                    <TouchableOpacity style={[S.applyBtn, { marginTop: 10 }]} onPress={handleApplyNoVip} activeOpacity={0.85}>
                      <Text style={S.applyBtnText}>{tx.applyNoVip}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* With VIP */}
                  <View style={[S.resultBox, { flex: 1, margin: 0, backgroundColor: "#1e293b", borderColor: "#f59e0b" }]}>
                    <Text style={{ color: "#f59e0b", fontWeight: "700", fontSize: 11, textAlign: "center", marginBottom: 8 }}>{tx.withVip} ⭐</Text>
                    <Text style={{ color: "#38bdf8", fontWeight: "800", fontSize: 16, textAlign: "center" }}>{propResult.withVip.sp}</Text>
                    <Text style={{ color: "#e2e8f0", fontSize: 13, textAlign: "center", marginTop: 4 }}>${propResult.withVip.deposit.toLocaleString()}</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center", marginTop: 2 }}>{propResult.withVip.rate.toFixed(1)}%/mo</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center" }}>${propResult.withVip.monthlyRebate.toLocaleString()}/mo</Text>
                    <Text style={{ color: "#64748b", fontSize: 11, textAlign: "center" }}>${(propResult.withVip.monthlyRebate * 12).toLocaleString()}/yr</Text>
                    <TouchableOpacity style={[S.applyBtn, { marginTop: 10, backgroundColor: "#92400e" }]} onPress={handleApplyWithVip} activeOpacity={0.85}>
                      <Text style={S.applyBtnText}>{tx.applyWithVip}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={S.applyBtnNote}>{tx.applyToScenario}</Text>
              </View>
            )}
          </View>
        </View>


        {/* ── SECTION 4: Savings Goal ───────────────────────────────── */}
        <View style={[S.section, { backgroundColor: "#0f2035", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: GREEN + "44", marginBottom: 12, borderTopWidth: 2, borderTopColor: GREEN }]}>
          <Text style={[S.sectionTitle, { color: GREEN }]}>{tx.savingsTitle}</Text>
          <View style={S.card}>
            <Text style={S.cardDesc}>{tx.savingsDesc}</Text>
            <View style={{ backgroundColor: "rgba(230,126,34,0.08)", borderRadius: 7, paddingHorizontal: 10, paddingVertical: 7, marginTop: 6, marginBottom: 2, borderLeftWidth: 2, borderLeftColor: GOLD }}>
              <Text style={{ color: GOLD, fontSize: 11, lineHeight: 16 }}>{tx.carTip}</Text>
            </View>

            <Text style={S.inputLabel}>{tx.savingsGoalLabel}</Text>
            <View style={S.chipRow}>
              {["1000", "2000", "3000", "5000", "10000"].map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setSavingsGoal(v)}
                  style={[S.chip, savingsGoal === v && S.chipActive]}
                >
                  <Text style={[S.chipText, savingsGoal === v && S.chipTextActive]}>${parseInt(v).toLocaleString()}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={S.input}
              value={savingsGoal}
              onChangeText={setSavingsGoal}
              keyboardType="numeric"
              returnKeyType="done"
              placeholderTextColor="#64748b"
              placeholder={tx.placeholderCustomAmount}
            />

            <TouchableOpacity style={S.calcBtn} onPress={calculateSavings} activeOpacity={0.8}>
              <Text style={S.calcBtnText}>{tx.findSavingsBtn}</Text>
            </TouchableOpacity>

            {savingsResult && (
              <View style={S.resultBox}>
                <Text style={[S.resultLabel, { color: "#94a3b8", marginBottom: 10, textAlign: "center" }]}>
                  {tx.targetPrefix} ${savingsResult.targetIncome.toLocaleString()}/mo — {tx.savingsNote}
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={[S.resultBox, { flex: 1, margin: 0, backgroundColor: "#1e293b" }]}>
                    <Text style={{ color: "#94a3b8", fontWeight: "700", fontSize: 11, textAlign: "center", marginBottom: 8 }}>{tx.withoutVip}</Text>
                    <Text style={{ color: "#38bdf8", fontWeight: "800", fontSize: 16, textAlign: "center" }}>{savingsResult.noVip.sp}</Text>
                    <Text style={{ color: "#e2e8f0", fontSize: 13, textAlign: "center", marginTop: 4 }}>${savingsResult.noVip.deposit.toLocaleString()}</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center", marginTop: 2 }}>{savingsResult.noVip.rate.toFixed(1)}%/mo</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center" }}>{tx.fullLabel} ${savingsResult.noVip.monthlyRebate.toLocaleString()}/mo</Text>
                    <Text style={{ color: "#f59e0b", fontSize: 13, fontWeight: "700", textAlign: "center" }}>{tx.pct75Label} ${savingsResult.noVip.payout75.toLocaleString()}/mo</Text>
                    <Text style={{ color: "#64748b", fontSize: 11, textAlign: "center" }}>${(savingsResult.noVip.payout75 * 12).toLocaleString()}/yr</Text>
                    <TouchableOpacity style={[S.applyBtn, { marginTop: 10 }]} onPress={handleSavingsApplyNoVip} activeOpacity={0.85}>
                      <Text style={S.applyBtnText}>{tx.assetApplyNoVip}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[S.resultBox, { flex: 1, margin: 0, backgroundColor: "#1e293b", borderColor: "#f59e0b" }]}>
                    <Text style={{ color: "#f59e0b", fontWeight: "700", fontSize: 11, textAlign: "center", marginBottom: 8 }}>{tx.withVip} ⭐</Text>
                    <Text style={{ color: "#38bdf8", fontWeight: "800", fontSize: 16, textAlign: "center" }}>{savingsResult.withVip.sp}</Text>
                    <Text style={{ color: "#e2e8f0", fontSize: 13, textAlign: "center", marginTop: 4 }}>${savingsResult.withVip.deposit.toLocaleString()}</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center", marginTop: 2 }}>{savingsResult.withVip.rate.toFixed(1)}%/mo</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center" }}>{tx.fullLabel} ${savingsResult.withVip.monthlyRebate.toLocaleString()}/mo</Text>
                    <Text style={{ color: "#f59e0b", fontSize: 13, fontWeight: "700", textAlign: "center" }}>{tx.pct75Label} ${savingsResult.withVip.payout75.toLocaleString()}/mo</Text>
                    <Text style={{ color: "#64748b", fontSize: 11, textAlign: "center" }}>${(savingsResult.withVip.payout75 * 12).toLocaleString()}/yr</Text>
                    <TouchableOpacity style={[S.applyBtn, { marginTop: 10, backgroundColor: "#92400e" }]} onPress={handleSavingsApplyWithVip} activeOpacity={0.85}>
                      <Text style={S.applyBtnText}>{tx.assetApplyWithVip}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={S.applyBtnNote}>{tx.applyToScenario}</Text>
              </View>
            )}
          </View>
        </View>


        {/* ── SECTION 5: Asset Goal Planner ──────────────────────────── */}
        <View style={[S.section, { backgroundColor: "#0f2035", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BLUE + "44", marginBottom: 12, borderTopWidth: 2, borderTopColor: BLUE }]}>
          <Text style={[S.sectionTitle, { color: BLUE }]}>{tx.assetTitle}</Text>
          <View style={S.card}>
            <Text style={S.cardDesc}>{tx.assetDesc}</Text>

            <Text style={S.inputLabel}>{tx.assetTargetLabel}</Text>
            <View style={S.chipRow}>
              {["50000", "100000", "250000", "500000"].map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setAssetTarget(v)}
                  style={[S.chip, assetTarget === v && S.chipActive]}
                >
                  <Text style={[S.chipText, assetTarget === v && S.chipTextActive]}>${(parseInt(v)/1000).toFixed(0)}K</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={S.input}
              value={assetTarget}
              onChangeText={setAssetTarget}
              keyboardType="numeric"
              returnKeyType="next"
              placeholderTextColor="#64748b"
              placeholder={tx.placeholderTargetAmount}
            />

            <Text style={S.inputLabel}>{tx.assetYearsLabel}</Text>
            <View style={S.chipRow}>
              {["5", "7", "10", "15", "20"].map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setAssetYears(v)}
                  style={[S.chip, assetYears === v && S.chipActive]}
                >
                  <Text style={[S.chipText, assetYears === v && S.chipTextActive]}>{v}y</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={S.input}
              value={assetYears}
              onChangeText={setAssetYears}
              keyboardType="numeric"
              returnKeyType="done"
              placeholderTextColor="#64748b"
              placeholder={tx.placeholderYears}
            />

            <TouchableOpacity style={S.calcBtn} onPress={calculateAsset} activeOpacity={0.8}>
              <Text style={S.calcBtnText}>{tx.findAssetBtn}</Text>
            </TouchableOpacity>

            {assetResult && (
              <View style={S.resultBox}>
                <Text style={[S.resultLabel, { color: "#94a3b8", marginBottom: 10, textAlign: "center" }]}>
                  {tx.totalOutLabel} ${assetResult.targetAmount.toLocaleString()} in {assetResult.years}y @ 80% — {tx.assetNote}
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={[S.resultBox, { flex: 1, margin: 0, backgroundColor: "#1e293b" }]}>
                    <Text style={{ color: "#94a3b8", fontWeight: "700", fontSize: 11, textAlign: "center", marginBottom: 8 }}>{tx.withoutVip}</Text>
                    <Text style={{ color: "#38bdf8", fontWeight: "800", fontSize: 16, textAlign: "center" }}>{assetResult.noVip.sp}</Text>
                    <Text style={{ color: "#e2e8f0", fontSize: 13, textAlign: "center", marginTop: 4 }}>{tx.depositLabel} ${assetResult.noVip.deposit.toLocaleString()}</Text>
                    <Text style={{ color: "#f87171", fontSize: 10, textAlign: "center", marginTop: 1 }}>Entry fee: −${assetResult.noVip.entryFee.toLocaleString()}</Text>
                    <Text style={{ color: "#64748b", fontSize: 10, textAlign: "center", marginTop: 1 }}>Net capital: ${assetResult.noVip.netDeposit.toLocaleString()}</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center", marginTop: 4 }}>{assetResult.noVip.rate.toFixed(1)}%/mo</Text>
                    <Text style={{ color: "#f59e0b", fontSize: 13, fontWeight: "700", textAlign: "center", marginTop: 4 }}>{tx.totalOutLabel} ${assetResult.noVip.totalOut.toLocaleString()}</Text>
                    <Text style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", marginTop: 2 }}>~${assetResult.noVip.avgMonthly.toLocaleString()}{tx.avgMoLabel}</Text>
                    <TouchableOpacity style={[S.applyBtn, { marginTop: 10 }]} onPress={handleAssetApplyNoVip} activeOpacity={0.85}>
                      <Text style={S.applyBtnText}>{tx.assetApplyNoVip}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[S.resultBox, { flex: 1, margin: 0, backgroundColor: "#1e293b", borderColor: "#f59e0b" }]}>
                    <Text style={{ color: "#f59e0b", fontWeight: "700", fontSize: 11, textAlign: "center", marginBottom: 8 }}>{tx.withVip} ⭐</Text>
                    <Text style={{ color: "#38bdf8", fontWeight: "800", fontSize: 16, textAlign: "center" }}>{assetResult.withVip.sp}</Text>
                    <Text style={{ color: "#e2e8f0", fontSize: 13, textAlign: "center", marginTop: 4 }}>{tx.depositLabel} ${assetResult.withVip.deposit.toLocaleString()}</Text>
                    <Text style={{ color: "#f87171", fontSize: 10, textAlign: "center", marginTop: 1 }}>Entry fee: −${assetResult.withVip.entryFee.toLocaleString()}</Text>
                    <Text style={{ color: "#64748b", fontSize: 10, textAlign: "center", marginTop: 1 }}>Net capital: ${assetResult.withVip.netDeposit.toLocaleString()}</Text>
                    <Text style={{ color: "#22c55e", fontSize: 12, textAlign: "center", marginTop: 4 }}>{assetResult.withVip.rate.toFixed(1)}%/mo</Text>
                    <Text style={{ color: "#f59e0b", fontSize: 13, fontWeight: "700", textAlign: "center", marginTop: 4 }}>{tx.totalOutLabel} ${assetResult.withVip.totalOut.toLocaleString()}</Text>
                    <Text style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", marginTop: 2 }}>~${assetResult.withVip.avgMonthly.toLocaleString()}{tx.avgMoLabel}</Text>
                    <TouchableOpacity style={[S.applyBtn, { marginTop: 10, backgroundColor: "#92400e" }]} onPress={handleAssetApplyWithVip} activeOpacity={0.85}>
                      <Text style={S.applyBtnText}>{tx.assetApplyWithVip}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={S.applyBtnNote}>{tx.applyToScenario}</Text>
              </View>
            )}
          </View>
        </View>


        {/* ── SECTION 0C: PROJECTED REVENUE MODEL ── */}
        <View style={[S.section, { backgroundColor: "#0f2035", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: GOLD + "44", marginBottom: 12 }]}>
          <Text style={[S.sectionTitle, { color: GOLD }]}>{tx.projRevTitle}</Text>
          <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
            {tx.projRevDesc}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {[
              { label: tx.projRevDbSize, val: revenueDb, set: setRevenueDb },
              { label: tx.projRevConv, val: revenueConv, set: setRevenueConv },
              { label: tx.projRevAvgPurchase, val: revenueAvg, set: setRevenueAvg },
              { label: tx.projRevRebateReuse, val: revenueReuse, set: setRevenueReuse },
              { label: tx.projRevMyParts, val: revenueParts, set: setRevenueParts },
            ].map(item => (
              <View key={item.label} style={{ minWidth: "45%", flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, fontWeight: "bold", marginBottom: 3, textTransform: "uppercase" }}>{item.label}</Text>
                <TextInput style={[S.input, { padding: 8 }]} value={item.val} onChangeText={item.set}
                  keyboardType="numeric" placeholderTextColor="#2a4a6a" />
              </View>
            ))}
          </View>
          <TouchableOpacity style={[S.calcBtn, { backgroundColor: GOLD }]} onPress={handleCalcRevenue}>
            <Text style={S.calcBtnText}>{tx.projRevCalcBtn}</Text>
          </TouchableOpacity>
          {revenueResult && (
            <>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12, marginBottom: 12 }}>
                {[
                  { label: tx.projRevEstClients, value: String(revenueResult.clients), color: BLUE },
                  { label: tx.projRevTeamVol, value: fmtM(revenueResult.teamVolume), color: GOLD },
                  { label: tx.projRevYr5, value: fmtM(revenueResult.timeline[revenueResult.timeline.length-1]?.agentResidual ?? 0), color: GREEN },
                ].map(s => (
                  <View key={s.label} style={{ flex: 1, backgroundColor: "#0d1a2a", borderRadius: 8, padding: 8, alignItems: "center" }}>
                    <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase" }}>{s.label}</Text>
                    <Text style={{ color: s.color, fontSize: 15, fontWeight: "bold", marginTop: 3 }}>{s.value}</Text>
                  </View>
                ))}
              </View>
              <Text style={[S.sectionTitle, { color: GOLD, fontSize: 12 }]}>{tx.projRevTimeline}</Text>
              <View style={{ borderRadius: 8, overflow: "hidden" }}>
                <View style={{ flexDirection: "row", backgroundColor: "#0d1a2a", paddingVertical: 7, paddingHorizontal: 10 }}>
                  <Text style={{ flex: 1, color: "#64748b", fontSize: 11, fontWeight: "bold" }}>{tx.projRevPeriod}</Text>
                  <Text style={{ flex: 1, color: "#64748b", fontSize: 11, fontWeight: "bold", textAlign: "right" }}>{tx.projRevResidualCol}</Text>
                  <Text style={{ flex: 1, color: "#64748b", fontSize: 11, fontWeight: "bold", textAlign: "right" }}>{tx.projRevPortfolioCol}</Text>
                  <Text style={{ flex: 1, color: "#64748b", fontSize: 11, fontWeight: "bold", textAlign: "right" }}>{tx.projRevCumulativeCol}</Text>
                </View>
                {revenueResult.timeline.map(row => (
                  <View key={row.month} style={{ flexDirection: "row", paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: "#0f2035" }}>
                    <Text style={{ flex: 1, color: GOLD, fontSize: 12, fontWeight: "bold" }}>{row.label}</Text>
                    <Text style={{ flex: 1, color: GREEN, fontSize: 12, fontWeight: "bold", textAlign: "right" }}>{fmtM(row.agentResidual)}</Text>
                    <Text style={{ flex: 1, color: "#94a3b8", fontSize: 11, textAlign: "right" }}>{fmtM(row.clientPortfolio)}</Text>
                    <Text style={{ flex: 1, color: "#fff", fontSize: 12, textAlign: "right" }}>{fmtM(row.cumulative)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>


        {/* ── SECTION 0B: GLOBAL POOL PATH ── */}
        <View style={[S.section, { backgroundColor: "#0f2035", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1a2a4a", marginBottom: 12 }]}>
          <Text style={[S.sectionTitle, { color: GOLD }]}>{tx.globalPoolTitle}</Text>
          <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
            {tx.globalPoolDesc}
          </Text>

          {/* Progress toward Blue Diamond */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "bold" }}>{tx.yourTeamVol}</Text>
            <Text style={{ color: poolProgress >= 1 ? GREEN : GOLD, fontSize: 11, fontWeight: "bold" }}>
              {fmtM(poolTeamVolume)} {tx.blueDiamondGateLabel}
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: "#0d1a2a", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
            <View style={{ height: "100%", width: `${Math.round(poolProgress * 100)}%` as any, backgroundColor: poolProgress >= 1 ? GREEN : BLUE, borderRadius: 4 }} />
          </View>
          <Text style={{ color: poolProgress >= 1 ? GREEN : "#64748b", fontSize: 11, textAlign: "center", marginBottom: 14 }}>
            {poolProgress >= 1 ? tx.blueDiamondUnlocked : tx.remainingToBlue.replace("{amount}", fmtM(BLUE_DIAMOND_THRESHOLD - poolTeamVolume))}
          </Text>

          {/* Pool 1 — Blue Diamond */}
          <View style={{ backgroundColor: "#0d1a2a", borderRadius: 10, padding: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: BLUE }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: BLUE, fontSize: 13, fontWeight: "bold" }}>{tx.pool1Title}</Text>
              <Text style={{ color: "#64748b", fontSize: 10 }}>{tx.poolMinRankP1}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 3 }}>{tx.activePoolTotal}</Text>
                <TextInput style={[S.input, { padding: 8, fontSize: 13 }]} value={pool1Total}
                  onChangeText={setPool1Total} keyboardType="numeric" placeholderTextColor="#2a4a6a"
                  placeholder={tx.fromBackOffice} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 3 }}>{tx.totalQualUsers}</Text>
                <TextInput style={[S.input, { padding: 8, fontSize: 13 }]} value={pool1Users}
                  onChangeText={setPool1Users} keyboardType="numeric" placeholderTextColor="#2a4a6a"
                  placeholder={tx.fromBackOffice} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 3 }}>{tx.myPartsLabel}</Text>
                <TextInput style={[S.input, { padding: 8, fontSize: 13 }]} value={pool1Parts}
                  onChangeText={setPool1Parts} keyboardType="numeric" placeholderTextColor="#2a4a6a"
                  placeholder="1–6" />
              </View>
            </View>
            <View style={{ backgroundColor: "#0f2035", borderRadius: 6, padding: 10, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#64748b", fontSize: 12 }}>{tx.yourPayoutLabel}</Text>
              <Text style={{ color: GREEN, fontSize: 15, fontWeight: "bold" }}>
                {fmtM((parseFloat(pool1Total)||0) / Math.max(parseFloat(pool1Users)||1, 1) * (parseFloat(pool1Parts)||1))}/mo
              </Text>
            </View>
          </View>

          {/* Pool 2 — Purple Diamond */}
          <View style={{ backgroundColor: "#0d1a2a", borderRadius: 10, padding: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: "#a855f7" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: "#a855f7", fontSize: 13, fontWeight: "bold" }}>{tx.pool2Title}</Text>
              <Text style={{ color: "#64748b", fontSize: 10 }}>{tx.poolMinRankP2}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 3 }}>{tx.activePoolTotal}</Text>
                <TextInput style={[S.input, { padding: 8, fontSize: 13 }]} value={pool2Total}
                  onChangeText={setPool2Total} keyboardType="numeric" placeholderTextColor="#2a4a6a"
                  placeholder={tx.fromBackOffice} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 3 }}>{tx.totalQualUsers}</Text>
                <TextInput style={[S.input, { padding: 8, fontSize: 13 }]} value={pool2Users}
                  onChangeText={setPool2Users} keyboardType="numeric" placeholderTextColor="#2a4a6a"
                  placeholder={tx.fromBackOffice} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 3 }}>{tx.myPartsLabel}</Text>
                <TextInput style={[S.input, { padding: 8, fontSize: 13 }]} value={pool2Parts}
                  onChangeText={setPool2Parts} keyboardType="numeric" placeholderTextColor="#2a4a6a"
                  placeholder="1–4" />
              </View>
            </View>
            <View style={{ backgroundColor: "#0f2035", borderRadius: 6, padding: 10, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#64748b", fontSize: 12 }}>{tx.yourPayoutLabel}</Text>
              <Text style={{ color: GREEN, fontSize: 15, fontWeight: "bold" }}>
                {fmtM((parseFloat(pool2Total)||0) / Math.max(parseFloat(pool2Users)||1, 1) * (parseFloat(pool2Parts)||1))}/mo
              </Text>
            </View>
          </View>

          {/* Pool 3 — Double Diamond Elite */}
          <View style={{ backgroundColor: "#0d1a2a", borderRadius: 10, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: "#f59e0b" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: "#f59e0b", fontSize: 13, fontWeight: "bold" }}>{tx.pool3Title}</Text>
              <Text style={{ color: "#64748b", fontSize: 10 }}>{tx.poolMinRankP3}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 3 }}>{tx.activePoolTotal}</Text>
                <TextInput style={[S.input, { padding: 8, fontSize: 13 }]} value={pool3Total}
                  onChangeText={setPool3Total} keyboardType="numeric" placeholderTextColor="#2a4a6a"
                  placeholder={tx.fromBackOffice} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 3 }}>{tx.totalQualUsers}</Text>
                <TextInput style={[S.input, { padding: 8, fontSize: 13 }]} value={pool3Users}
                  onChangeText={setPool3Users} keyboardType="numeric" placeholderTextColor="#2a4a6a"
                  placeholder={tx.fromBackOffice} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 3 }}>{tx.myPartsLabel}</Text>
                <TextInput style={[S.input, { padding: 8, fontSize: 13 }]} value={pool3Parts}
                  onChangeText={setPool3Parts} keyboardType="numeric" placeholderTextColor="#2a4a6a"
                  placeholder="1–2" />
              </View>
            </View>
            <View style={{ backgroundColor: "#0f2035", borderRadius: 6, padding: 10, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#64748b", fontSize: 12 }}>{tx.yourPayoutLabel}</Text>
              <Text style={{ color: GREEN, fontSize: 15, fontWeight: "bold" }}>
                {(parseFloat(pool3Users)||0) === 0 ? tx.noMembersYet : fmtM((parseFloat(pool3Total)||0) / Math.max(parseFloat(pool3Users)||1, 1) * (parseFloat(pool3Parts)||1)) + "/mo"}
              </Text>
            </View>
          </View>

          {/* Total Pool Payout */}
          <View style={{ backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "rgba(34,197,94,0.25)", marginBottom: 10 }}>
            <Text style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{tx.totalPoolPayoutLabel}</Text>
            <Text style={{ color: GREEN, fontSize: 20, fontWeight: "bold", marginTop: 4 }}>
              {fmtM(
                ((parseFloat(pool1Total)||0) / Math.max(parseFloat(pool1Users)||1,1) * (parseFloat(pool1Parts)||1)) +
                ((parseFloat(pool2Total)||0) / Math.max(parseFloat(pool2Users)||1,1) * (parseFloat(pool2Parts)||1)) +
                ((parseFloat(pool3Total)||0) / Math.max(parseFloat(pool3Users)||1,1) * (parseFloat(pool3Parts)||1))
              )}/mo
            </Text>
            <Text style={{ color: "#64748b", fontSize: 10, marginTop: 3 }}>
              {tx.poolFormulaNote}
            </Text>
          </View>

        </View>

        {/* ── AR VAULT PLACEHOLDER ── */}
        <View style={{ backgroundColor: "#0f2035", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1.5, borderColor: "#a78bfa44", alignItems: "center" }}>
          <Text style={{ color: "#a78bfa", fontSize: 13, fontWeight: "bold", letterSpacing: 0.5 }}>{t(language, "affVaultComingSoon")}</Text>
          <Text style={{ color: "#475569", fontSize: 10, marginTop: 4 }}>{tx.arVaultDesc}</Text>
        </View>

      </ScrollView>

      {/* ── Add/Edit Partner Modal ────────────────────────────────────────── */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={S.modalOverlay}>
            <ScrollView style={S.modalSheet} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={S.modalTitle}>{editingPartner ? tx.editPartner : tx.addPartner}</Text>

              <Text style={S.inputLabel}>{tx.nameLabel}</Text>
              <TextInput
                style={S.input}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder={tx.nameLabel.replace(" *", "")}
                placeholderTextColor="#64748b"
                returnKeyType="next"
              />

              <Text style={S.inputLabel}>{tx.whatsappLabel}</Text>
              <TextInput
                style={S.input}
                value={form.whatsapp}
                onChangeText={(v) => setForm((f) => ({ ...f, whatsapp: v }))}
                placeholder="+31 6 12345678"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                returnKeyType="next"
              />

              <Text style={S.inputLabel}>{tx.countryLabel}</Text>
              <TextInput
                style={S.input}
                value={form.country}
                onChangeText={(v) => setForm((f) => ({ ...f, country: v }))}
                placeholder="Netherlands"
                placeholderTextColor="#64748b"
                returnKeyType="next"
              />

              <Text style={S.inputLabel}>{tx.startDateLabel}</Text>
              <TextInput
                style={S.input}
                value={form.startDate}
                onChangeText={(v) => setForm((f) => ({ ...f, startDate: v }))}
                placeholder="15-01-2025"
                placeholderTextColor="#64748b"
                returnKeyType="next"
                keyboardType="numbers-and-punctuation"
              />

              <Text style={S.inputLabel}>{tx.amountLabel}</Text>
              <TextInput
                style={S.input}
                value={form.amount}
                onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
                placeholder="5000"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                returnKeyType="done"
              />

              {/* Level Selector */}
              <Text style={S.inputLabel}>{tx.levelLabel}</Text>
              <View style={S.chipRow}>
                {([
                  { value: "1", label: "L1 — 10%" },
                  { value: "2", label: "L2 — 5%"  },
                  { value: "3", label: "L3 — 3%"  },
                ] as { value: string; label: string }[]).map(l => (
                  <Pressable key={l.value} onPress={() => setForm(f => ({ ...f, level: l.value }))}
                    style={[S.chip, form.level === l.value && S.chipActive]}>
                    <Text style={[S.chipText, form.level === l.value && S.chipTextActive]}>{l.label}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Contact Moment Toggles */}
              <Text style={S.inputLabel}>{tx.contactMomentsLabel}</Text>
              <View style={S.contactMomentsBox}>
                {CONTACT_MOMENT_KEYS.map((key) => {
                  const isOn = form.contactMoments.includes(key);
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[S.contactMomentRow, isOn && S.contactMomentRowOn]}
                      onPress={() => toggleContactMoment(key)}
                      activeOpacity={0.8}
                    >
                      <View style={[S.contactMomentCheck, isOn && S.contactMomentCheckOn]}>
                        {isOn && <Text style={S.contactMomentCheckMark}>✓</Text>}
                      </View>
                      <Text style={[S.contactMomentLabel, isOn && S.contactMomentLabelOn]}>
                        {tx[key]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={S.modalBtnRow}>
                <TouchableOpacity
                  style={S.modalCancelBtn}
                  onPress={() => setShowAddModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={S.modalCancelText}>{tx.cancelBtn}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={S.modalSaveBtn}
                  onPress={savePartner}
                  activeOpacity={0.8}
                >
                  <Text style={S.modalSaveText}>{tx.saveBtn}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* In-App Alert Modal — fires when a notification arrives while app is open */}
      <Modal
        visible={inAppAlert !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInAppAlert(null)}
      >
        <Pressable
          style={S.alertOverlay}
          onPress={() => setInAppAlert(null)}
        >
          <View style={S.alertBox}>
            <Text style={S.alertBoxTitle}>{inAppAlert?.title}</Text>
            <Text style={S.alertBoxBody}>{inAppAlert?.body}</Text>
            <TouchableOpacity
              style={S.alertBoxBtn}
              onPress={() => setInAppAlert(null)}
              activeOpacity={0.8}
            >
              <Text style={S.alertBoxBtnText}>{tx.okBtn}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#e2e8f0", flex: 1 },
  alertBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  alertBadgeText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#f59e0b",
    letterSpacing: 0.8,
    flex: 1,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  cardDesc: { fontSize: 14, color: "#94a3b8", marginBottom: 14, lineHeight: 20 },
  inputLabel: { fontSize: 13, color: "#94a3b8", marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 10,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipActive: { backgroundColor: "#0ea5e9", borderColor: "#0ea5e9" },
  chipText: { color: "#94a3b8", fontSize: 14 },
  chipTextActive: { color: "#fff", fontWeight: "bold" },
  calcBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  calcBtnText: { color: "#0f172a", fontWeight: "bold", fontSize: 16 },
  resultBox: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  resultRowBorder: { borderTopWidth: 1, borderTopColor: "#1e293b" },
  resultLabel: { color: "#94a3b8", fontSize: 14, flex: 1 },
  resultValue: { color: "#e2e8f0", fontSize: 16, fontWeight: "bold" },
  resultNote: { color: "#64748b", fontSize: 13, marginTop: 8, lineHeight: 18 },
  applyBtn: {
    backgroundColor: "#0ea5e9",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center" as const,
    marginTop: 14,
  },
  applyBtnText: { color: "#fff", fontWeight: "bold" as const, fontSize: 15 },
  applyBtnNote: { color: "#64748b", fontSize: 12, textAlign: "center" as const, marginTop: 6, lineHeight: 17 },
  addBtn: {
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  emptyCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "bold", color: "#e2e8f0", marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  partnerCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  partnerHeader: { flexDirection: "row", alignItems: "flex-start" },
  partnerName: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 3 },
  partnerSub: { fontSize: 13, color: "#94a3b8", lineHeight: 18 },
  partnerWhatsapp: { fontSize: 13, color: "#4ade80", marginTop: 2 },
  partnerActions: { flexDirection: "row", gap: 6 },
  editBtn: {
    backgroundColor: "#334155",
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: { fontSize: 16 },
  deleteBtn: {
    backgroundColor: "#7f1d1d",
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: { fontSize: 16 },
  alertsBox: {
    marginTop: 10,
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  alertText: { fontSize: 13, color: "#fbbf24", lineHeight: 19 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: { fontSize: 19, fontWeight: "bold", color: "#fff", marginBottom: 16 },
  modalBtnRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#334155",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  modalCancelText: { color: "#94a3b8", fontWeight: "bold", fontSize: 16 },
  modalSaveBtn: {
    flex: 2,
    backgroundColor: "#0ea5e9",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  modalSaveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  contactMomentsBox: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 6,
  },
  contactMomentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
  },
  contactMomentRowOn: { borderColor: "#0ea5e9", backgroundColor: "#0c2a3e" },
  contactMomentCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  contactMomentCheckOn: { borderColor: "#0ea5e9", backgroundColor: "#0ea5e9" },
  contactMomentCheckMark: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  contactMomentLabel: { color: "#94a3b8", fontSize: 13, flex: 1, lineHeight: 18 },
  contactMomentLabelOn: { color: "#e2e8f0" },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertBox: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  alertBoxTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f59e0b",
    marginBottom: 10,
    lineHeight: 24,
  },
  alertBoxBody: {
    fontSize: 15,
    color: "#e2e8f0",
    lineHeight: 22,
    marginBottom: 20,
  },
  alertBoxBtn: {
    backgroundColor: "#0ea5e9",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  alertBoxBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
