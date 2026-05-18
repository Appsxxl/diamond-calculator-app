import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { ScreenContainer } from "@/components/screen-container";
import { DisclaimerFooter, DisclaimerInline } from "@/components/disclaimer-footer";
import { useCalculator } from "@/lib/calculator-context";
import { t, Language } from "@/lib/translations";
import { runCalculation, MonthResult, fmt, MonthData, CalculationParams, createDefaultMonthData, getNetDeposit, getSPLevel } from "@/lib/calculator";

function numVal(s: string, fallback = 0): number {
  const n = parseFloat(s);
  return isNaN(n) ? fallback : n;
}

// ─── Format month count as "X Years & Y Months" in any language ─────────────
function formatGoalDuration(totalMonths: number, lang: string): string {
  const yr = Math.floor(totalMonths / 12);
  const mo = totalMonths % 12;

  const yrW = (n: number): string => (({
    en: n===1?'Year':'Years', nl: 'Jaar', de: n===1?'Jahr':'Jahre',
    fr: n===1?'An':'Ans', es: n===1?'Año':'Años',
    ru: n===1?'Год':n<=4?'Года':'Лет',
    zh: '年', tl: 'Taon', pt: n===1?'Ano':'Anos',
    ar: n===1?'سنة':'سنوات', th: 'ปี', hi: 'वर्ष', it: n===1?'Anno':'Anni', vi: 'Năm',
  } as Record<string,string>)[lang] ?? (n===1?'Year':'Years'));

  const moW = (n: number): string => (({
    en: n===1?'Month':'Months', nl: n===1?'Maand':'Maanden', de: n===1?'Monat':'Monate',
    fr: 'Mois', es: n===1?'Mes':'Meses',
    ru: n===1?'Месяц':n<=4?'Месяца':'Месяцев',
    zh: '个月', tl: 'Buwan', pt: n===1?'Mês':'Meses',
    ar: n<=10?'أشهر':'شهراً', th: 'เดือน', hi: 'माह', it: n===1?'Mese':'Mesi', vi: 'Tháng',
  } as Record<string,string>)[lang] ?? (n===1?'Month':'Months'));

  const conn: Record<string,string> = {
    en:'&', nl:'&', de:'&', fr:'&', es:'&', ru:'и', zh:'', tl:'at', pt:'&', ar:'و', th:'&', hi:'&', it:'&', vi:'&',
  };
  const c = conn[lang] ?? '&';

  if (lang === 'zh') {
    if (mo === 0) return `${yr}${yrW(yr)}`;
    if (yr === 0) return `${mo}${moW(mo)}`;
    return `${yr}${yrW(yr)}${mo}${moW(mo)}`;
  }
  if (mo === 0) return `${yr} ${yrW(yr)}`;
  if (yr === 0) return `${mo} ${moW(mo)}`;
  return `${yr} ${yrW(yr)} ${c} ${mo} ${moW(mo)}`;
}

// ─── Result text builder (Copy / Share) ──────────────────────────────────────
function buildCopyText(
  lang: string,
  { deposit, net, sp, vipEnabled, years, goal, clientName, result }: {
    deposit: number; net: number;
    sp: { name: string; baseRate: number };
    vipEnabled: boolean; years: string; goal: string;
    clientName: string;
    result: { goalReachedMonth: number | null; maxMonthlyOut: number; maxMonthlyOutMonth: number; totalIn: number; totalOut: number; finalCap: number; netResult: number; rocMonth: number | null; };
  }
): string {
  const L = (key: string) => t(lang as Language, key);
  const lbl: Record<string, Record<string, string>> = {
    title:          { en: '💎 Plan B — Strategy Result', nl: '💎 Plan B — Strategieresultaat', de: '💎 Plan B — Strategie Ergebnis', fr: '💎 Plan B — Résultat Stratégique', es: '💎 Plan B — Resultado Estratégico', ru: '💎 Plan B — Результат стратегии', zh: '💎 Plan B — 策略结果' },
    duration:       { en: 'Duration', nl: 'Looptijd', de: 'Laufzeit', fr: 'Durée', es: 'Duración', ru: 'Срок', zh: '期限' },
    goalReached:    { en: 'Goal reached', nl: 'Doel bereikt', de: 'Ziel erreicht', fr: 'Objectif atteint', es: 'Meta alcanzada', ru: 'Цель достигнута', zh: '目标达成' },
    goalMissed:     { en: 'Not within period', nl: 'Niet bereikt', de: 'Nicht erreicht', fr: 'Non atteint', es: 'No alcanzado', ru: 'Не достигнута', zh: '未达成' },
    peak:           { en: 'Peak discount', nl: 'Max korting', de: 'Max. Rabatt', fr: 'Remise max', es: 'Desc. máximo', ru: 'Макс. скидка', zh: '最高折扣' },
    month:          { en: 'Month', nl: 'Maand', de: 'Monat', fr: 'Mois', es: 'Mes', ru: 'Месяц', zh: '月' },
    year:           { en: 'Year', nl: 'Jaar', de: 'Jahr', fr: 'Année', es: 'Año', ru: 'Год', zh: '年' },
    yearSingle:     { en: 'year', nl: 'jaar', de: 'Jahr', fr: 'an', es: 'año', ru: 'год', zh: '年' },
    yearPlural:     { en: 'years', nl: 'jaar', de: 'Jahre', fr: 'ans', es: 'años', ru: 'лет', zh: '年' },
    footer2:        { en: 'Projections are illustrative only — not a guarantee of returns.', nl: 'Projecties zijn illustratief — geen garantie op rendement.', de: 'Prognosen sind illustrativ — keine Renditegarantie.', fr: 'Projections illustratives uniquement — sans garantie de rendement.', es: 'Proyecciones ilustrativas — sin garantía de rentabilidad.', ru: 'Прогнозы носят иллюстративный характер — не гарантия доходности.', zh: '预测仅供参考，不构成收益保证。' },
  };
  const g = (key: string) => lbl[key]?.[lang] ?? lbl[key]?.['en'] ?? key;
  const yrs = numVal(years);
  return [
    g('title'),
    '──────────────────────────',
    clientName ? `${L('clientName')}:  ${clientName}` : null,
    `${L('startDiamonds')}:  $${deposit.toLocaleString()}`,
    `${L('netInvestedDiamonds')}:  $${net.toLocaleString()}`,
    `${L('planPrefix')}  ${sp.name}${vipEnabled ? ' +VIP' : ''} (${(sp.baseRate + (vipEnabled ? 3 : 0)).toFixed(1)}%/mo)`,
    `${g('duration')}:  ${years} ${yrs === 1 ? g('yearSingle') : g('yearPlural')}`,
    ``,
    `${L('goal')}:  $${numVal(goal).toLocaleString()}`,
    result.goalReachedMonth
      ? `${g('goalReached')}:  ${g('month')} ${result.goalReachedMonth} (${formatGoalDuration(result.goalReachedMonth, lang)})`
      : `${g('goalReached')}:  ${g('goalMissed')}`,
    `${g('peak')}:  $${result.maxMonthlyOut.toLocaleString()} (${g('month')} ${result.maxMonthlyOutMonth})`,
    ``,
    `${L('totalIn')}:  $${result.totalIn.toLocaleString()}`,
    `${L('totalOut')}:  $${result.totalOut.toLocaleString()}`,
    `${L('finalBalance')}:  $${result.finalCap.toLocaleString()}`,
    `${L('netResult')}:  $${result.netResult.toLocaleString()}`,
    result.rocMonth ? `${L('rocBreakEven')}:  ${g('month')} ${result.rocMonth}` : null,
    ``,
    `Plan B Diamond · Adviser Pro`,
    g('footer2'),
  ].filter((l): l is string => l !== null).join('\n');
}

// ─── PDF labels by language ───────────────────────────────────────────────────
function getPdfLabels(lang: string): Record<string, string> {
  const d: Record<string, Record<string, string>> = {
    en: { docTitle:'Personal Strategy Roadmap', giaTitle:'GIA Verified', giaSub:'Plan B Integrity', preparedFor:'Prepared for', yearPlanB:'Year Plan B Strategy', paramsTitle:'Strategy Parameters', spTier:'SP Tier', vipFeeLabel:'VIP Activation Fee', feesLabel:'Transaction Fees', feesValue:'$5 flat + 1.25% applied to all deposits', vipActive:'Active (+3% Monthly Discount)', vipStandard:'Standard', vipFeeValue:'$1,000 (Paid Manually)', vipFeeNone:'None', summaryTitle:'Strategy Summary', goalLabel:'🎯 Monthly Goal', goalReached:'✅ Reached at Month {month} ({duration})', goalMissed:'⏳ Not reached within {years}-year period', pending:'Pending', tableTitle:'Monthly Discount Schedule', tableGrouped:'(Grouped by Year)', colPeriod:'Period', colMonth:'Month', colAnnualDep:'Annual Deposits ($)', colMonthlyDep:'Monthly Deposit ($)', colAnnualDisc:'Annual Discount Gained ($)', colMonthlyDisc:'Monthly Discount ($)', colCumulative:'Cumulative Discounts ($)', colTotalAsset:'💎 Total Asset Value ($)', secTitle:'Security & Guarantees', secBoxTitle:'🛡️ Your Protections', g1:'Contractual 100% Buyback Guarantee on completion of the {years}-year strategy period.', g2:'Ownership of physical, GIA-certified diamonds — legally yours.', g3:'Diamonds stored in secure Dubai Freezone or delivered to your home.', g4:'All ownership rights transferable to your children or next of kin.', discTitle:'Mathematical Calculation Only:', discBody:'This document provides mathematical calculations for illustrative purposes and is not financial advice. All projections are based on current plan parameters and may vary. Always review the official Diamond Solution contract documents.', generatedBy:'Generated by Plan B App', vipNote:'* Total Purchase Amount includes the initial purchase, monthly contributions, and the manual $1,000 VIP activation fee.' },
    nl: { docTitle:'Persoonlijk Strategieroadmap', giaTitle:'GIA Geverifieerd', giaSub:'Plan B Integriteit', preparedFor:'Opgesteld voor', yearPlanB:'Jaar Plan B Strategie', paramsTitle:'Strategie Parameters', spTier:'SP Niveau', vipFeeLabel:'VIP Activeringskosten', feesLabel:'Transactiekosten', feesValue:'$5 vast + 1,25% op alle stortingen', vipActive:'Actief (+3% Maandelijkse Korting)', vipStandard:'Standaard', vipFeeValue:'$1.000 (Handmatig betaald)', vipFeeNone:'Geen', summaryTitle:'Strategiebeschrijving', goalLabel:'🎯 Maandelijks Doel', goalReached:'✅ Bereikt in Maand {month} ({duration})', goalMissed:'⏳ Niet bereikt binnen {years}-jaarsperiode', pending:'In behandeling', tableTitle:'Maandelijks Kortingsoverzicht', tableGrouped:'(Gegroepeerd per jaar)', colPeriod:'Periode', colMonth:'Maand', colAnnualDep:'Jaarlijkse Stortingen ($)', colMonthlyDep:'Maandelijkse Storting ($)', colAnnualDisc:'Jaarlijkse Korting ($)', colMonthlyDisc:'Maandelijkse Korting ($)', colCumulative:'Cumulatieve Kortingen ($)', colTotalAsset:'💎 Totale Waarde ($)', secTitle:'Veiligheid & Garanties', secBoxTitle:'🛡️ Uw Beschermingen', g1:'Contractuele 100% Terugkoopgarantie na afloop van de {years}-jaarsperiode.', g2:'Eigendom van fysieke, GIA-gecertificeerde diamanten — uw wettelijk eigendom.', g3:'Diamanten opgeslagen in Dubai Vrijzone of thuisbezorgd.', g4:'Alle eigendomsrechten overdraagbaar aan uw kinderen of naaste familie.', discTitle:'Alleen Wiskundige Berekening:', discBody:'Dit document biedt wiskundige berekeningen voor illustratieve doeleinden en is geen financieel advies. Bekijk altijd de officiële Diamond Solution-contractdocumenten.', generatedBy:'Gegenereerd door Plan B App', vipNote:'* Totaal aankoopbedrag inclusief eerste aankoop, maandelijkse bijdragen en de handmatige VIP-activeringskosten van $1.000.' },
    de: { docTitle:'Persönliche Strategie-Roadmap', giaTitle:'GIA Verifiziert', giaSub:'Plan B Integrität', preparedFor:'Erstellt für', yearPlanB:'Jahre Plan B Strategie', paramsTitle:'Strategie-Parameter', spTier:'SP-Level', vipFeeLabel:'VIP-Aktivierungsgebühr', feesLabel:'Transaktionsgebühren', feesValue:'5 $ pauschal + 1,25% auf alle Einzahlungen', vipActive:'Aktiv (+3% Monatlicher Rabatt)', vipStandard:'Standard', vipFeeValue:'1.000 $ (Manuell bezahlt)', vipFeeNone:'Keine', summaryTitle:'Strategiezusammenfassung', goalLabel:'🎯 Monatliches Ziel', goalReached:'✅ Erreicht in Monat {month} ({duration})', goalMissed:'⏳ Nicht erreicht innerhalb {years}-Jahres-Zeitraum', pending:'Ausstehend', tableTitle:'Monatlicher Rabattplan', tableGrouped:'(Gruppiert nach Jahr)', colPeriod:'Zeitraum', colMonth:'Monat', colAnnualDep:'Jährliche Einzahlungen ($)', colMonthlyDep:'Monatliche Einzahlung ($)', colAnnualDisc:'Jährlicher Rabatt ($)', colMonthlyDisc:'Monatlicher Rabatt ($)', colCumulative:'Kumulierte Rabatte ($)', colTotalAsset:'💎 Gesamter Vermögenswert ($)', secTitle:'Sicherheit & Garantien', secBoxTitle:'🛡️ Ihre Schutzmaßnahmen', g1:'Vertragliche 100% Rückkaufgarantie nach Abschluss der {years}-Jahres-Strategie.', g2:'Eigentum an physischen, GIA-zertifizierten Diamanten — legal Ihres.', g3:'Diamanten in der Dubai Freizone gelagert oder nach Hause geliefert.', g4:'Alle Eigentumsrechte übertragbar auf Ihre Kinder oder nächsten Angehörigen.', discTitle:'Nur Mathematische Berechnung:', discBody:'Dieses Dokument enthält mathematische Berechnungen zu illustrativen Zwecken und ist keine Finanzberatung. Überprüfen Sie immer die offiziellen Diamond Solution-Vertragsunterlagen.', generatedBy:'Erstellt von Plan B App', vipNote:'* Gesamter Kaufbetrag inkl. Erstkauf, monatliche Beiträge und manuelle VIP-Aktivierungsgebühr von 1.000 $.' },
    fr: { docTitle:'Feuille de Route Stratégique Personnelle', giaTitle:'Vérifié GIA', giaSub:'Intégrité Plan B', preparedFor:'Préparé pour', yearPlanB:'Ans de Stratégie Plan B', paramsTitle:'Paramètres de Stratégie', spTier:'Niveau SP', vipFeeLabel:"Frais d'Activation VIP", feesLabel:'Frais de Transaction', feesValue:'5 $ fixe + 1,25% sur tous les dépôts', vipActive:'Actif (+3% Remise Mensuelle)', vipStandard:'Standard', vipFeeValue:'1 000 $ (Payé manuellement)', vipFeeNone:'Aucun', summaryTitle:'Résumé Stratégique', goalLabel:'🎯 Objectif Mensuel', goalReached:'✅ Atteint au Mois {month} ({duration})', goalMissed:'⏳ Non atteint dans la période de {years} ans', pending:'En attente', tableTitle:'Calendrier de Remises Mensuelles', tableGrouped:'(Groupé par année)', colPeriod:'Période', colMonth:'Mois', colAnnualDep:'Dépôts Annuels ($)', colMonthlyDep:'Dépôt Mensuel ($)', colAnnualDisc:'Remise Annuelle ($)', colMonthlyDisc:'Remise Mensuelle ($)', colCumulative:'Remises Cumulées ($)', colTotalAsset:'💎 Valeur Totale des Actifs ($)', secTitle:'Sécurité & Garanties', secBoxTitle:'🛡️ Vos Protections', g1:"Garantie de Rachat Contractuelle à 100% à l'issue de la période de {years} ans.", g2:'Propriété de diamants physiques certifiés GIA — légalement vôtres.', g3:'Diamants stockés en Zone Franche de Dubaï ou livrés à domicile.', g4:'Tous droits de propriété transmissibles à vos enfants ou proches.', discTitle:'Calcul Mathématique Uniquement :', discBody:"Ce document fournit des calculs mathématiques à titre illustratif et ne constitue pas un conseil financier. Consultez toujours les documents contractuels officiels de Diamond Solution.", generatedBy:'Généré par Plan B App', vipNote:"* Montant total d'achat incluant l'achat initial, les contributions mensuelles et les frais d'activation VIP manuels de 1 000 $." },
    es: { docTitle:'Hoja de Ruta Estratégica Personal', giaTitle:'Verificado GIA', giaSub:'Integridad Plan B', preparedFor:'Preparado para', yearPlanB:'Años de Estrategia Plan B', paramsTitle:'Parámetros de Estrategia', spTier:'Nivel SP', vipFeeLabel:'Tarifa de Activación VIP', feesLabel:'Tarifas de Transacción', feesValue:'$5 fijo + 1,25% en todos los depósitos', vipActive:'Activo (+3% Descuento Mensual)', vipStandard:'Estándar', vipFeeValue:'$1,000 (Pagado Manualmente)', vipFeeNone:'Ninguno', summaryTitle:'Resumen Estratégico', goalLabel:'🎯 Meta Mensual', goalReached:'✅ Alcanzado en Mes {month} ({duration})', goalMissed:'⏳ No alcanzado en el período de {years} años', pending:'Pendiente', tableTitle:'Calendario de Descuentos Mensuales', tableGrouped:'(Agrupado por año)', colPeriod:'Período', colMonth:'Mes', colAnnualDep:'Depósitos Anuales ($)', colMonthlyDep:'Depósito Mensual ($)', colAnnualDisc:'Descuento Anual ($)', colMonthlyDisc:'Descuento Mensual ($)', colCumulative:'Descuentos Acumulados ($)', colTotalAsset:'💎 Valor Total de Activos ($)', secTitle:'Seguridad y Garantías', secBoxTitle:'🛡️ Sus Protecciones', g1:'Garantía de Recompra Contractual del 100% al completar el período de {years} años.', g2:'Propiedad de diamantes físicos certificados GIA — legalmente suyos.', g3:'Diamantes almacenados en Zona Franca de Dubái o entregados en su domicilio.', g4:'Todos los derechos de propiedad transferibles a sus hijos o familiares.', discTitle:'Solo Cálculo Matemático:', discBody:'Este documento proporciona cálculos matemáticos con fines ilustrativos y no constituye asesoramiento financiero. Revise siempre los documentos contractuales oficiales de Diamond Solution.', generatedBy:'Generado por Plan B App', vipNote:'* El monto total de compra incluye la compra inicial, contribuciones mensuales y la tarifa de activación VIP manual de $1,000.' },
    ru: { docTitle:'Персональная Стратегическая Дорожная Карта', giaTitle:'GIA Проверено', giaSub:'Целостность Plan B', preparedFor:'Подготовлено для', yearPlanB:'Лет Стратегии Plan B', paramsTitle:'Параметры Стратегии', spTier:'Уровень SP', vipFeeLabel:'Плата за Активацию VIP', feesLabel:'Комиссии за Транзакции', feesValue:'$5 фиксированно + 1,25% на все депозиты', vipActive:'Активен (+3% Ежемесячная Скидка)', vipStandard:'Стандарт', vipFeeValue:'$1 000 (Оплачено вручную)', vipFeeNone:'Отсутствует', summaryTitle:'Сводка Стратегии', goalLabel:'🎯 Ежемесячная Цель', goalReached:'✅ Достигнута в Месяц {month} ({duration})', goalMissed:'⏳ Не достигнута в течение {years}-летнего периода', pending:'В ожидании', tableTitle:'График Ежемесячных Скидок', tableGrouped:'(Сгруппировано по годам)', colPeriod:'Период', colMonth:'Месяц', colAnnualDep:'Годовые Депозиты ($)', colMonthlyDep:'Ежемесячный Депозит ($)', colAnnualDisc:'Годовые Скидки ($)', colMonthlyDisc:'Ежемесячная Скидка ($)', colCumulative:'Накопленные Скидки ($)', colTotalAsset:'💎 Общая Стоимость Активов ($)', secTitle:'Безопасность и Гарантии', secBoxTitle:'🛡️ Ваши Гарантии', g1:'Договорная гарантия 100% обратного выкупа по завершении {years}-летнего периода.', g2:'Право собственности на физические алмазы с сертификатом GIA — ваша законная собственность.', g3:'Алмазы хранятся в Свободной Зоне Дубая или доставляются на дом.', g4:'Все права собственности передаваемы детям или ближайшим родственникам.', discTitle:'Только Математический Расчёт:', discBody:'Этот документ содержит математические расчёты в иллюстративных целях и не является финансовым советом. Всегда изучайте официальные договорные документы Diamond Solution.', generatedBy:'Создано приложением Plan B', vipNote:'* Общая сумма покупки включает первоначальную покупку, ежемесячные взносы и ручную плату за активацию VIP в размере $1 000.' },
    zh: { docTitle:'个人策略路线图', giaTitle:'GIA认证', giaSub:'Plan B 诚信保证', preparedFor:'为以下客户准备', yearPlanB:'年Plan B策略', paramsTitle:'策略参数', spTier:'SP级别', vipFeeLabel:'VIP激活费', feesLabel:'交易费用', feesValue:'$5固定 + 所有存款的1.25%', vipActive:'已激活（+3%月度折扣）', vipStandard:'标准', vipFeeValue:'$1,000（手动支付）', vipFeeNone:'无', summaryTitle:'策略摘要', goalLabel:'🎯 月度目标', goalReached:'✅ 在第{month}个月达成（{duration}）', goalMissed:'⏳ 在{years}年期内未达成', pending:'待定', tableTitle:'月度折扣计划', tableGrouped:'（按年分组）', colPeriod:'期间', colMonth:'月份', colAnnualDep:'年度存款（$）', colMonthlyDep:'月度存款（$）', colAnnualDisc:'年度获得折扣（$）', colMonthlyDisc:'月度折扣（$）', colCumulative:'累计折扣（$）', colTotalAsset:'💎 总资产价值（$）', secTitle:'安全与保障', secBoxTitle:'🛡️ 您的保护', g1:'在{years}年策略期结束时，合同承诺100%回购保证。', g2:'拥有GIA认证的实体钻石所有权——合法属于您。', g3:'钻石存储在迪拜自由区或送货上门。', g4:'所有所有权可转让给您的子女或近亲。', discTitle:'仅供数学计算：', discBody:'本文件提供数学计算仅供参考，不构成财务建议。所有预测均基于当前计划参数，可能有所变化。请务必查阅Diamond Solution官方合同文件。', generatedBy:'由Plan B应用程序生成', vipNote:'* 总购买金额包括初始购买、每月供款及手动$1,000 VIP激活费。' },
  };
  return d[lang] ?? d['en'];
}

type OptionsHelpItem = { icon: string; title: string; color: string; body: string };
type OptionsHelpData = { buttonLabel: string; modalTitle: string; tipTitle: string; tipBody: string; items: OptionsHelpItem[] };

function getOptionsHelpItems(lang: string): OptionsHelpData {
  const d: Record<string, OptionsHelpData> = {
    en: {
      buttonLabel: 'How to use the extra options',
      modalTitle: 'ℹ️ Extra Options Explained',
      tipTitle: '💡 Tip — using options together',
      tipBody: 'You can combine all options. For example: buy $500/month for 3 years, then take 75% out from month 37 onwards. The calculator applies all settings simultaneously and shows the result month by month.',
      items: [
        { icon: '💰', title: 'Monthly Deposit', color: '#33C5FF', body: 'Buy extra diamonds every month on top of your initial purchase.\n\nEnter the amount ($) and up to which month you want to keep buying. Press OK to apply.\n\nExample: $500 until month 24 = $500 extra purchase every month for 2 years.' },
        { icon: '🎁', title: 'Annual Bonus Deposit', color: '#f59e0b', body: 'Add a one-time extra purchase that repeats once per year (every 12 months).\n\nUseful for annual bonuses, tax refunds, or year-end investments.\n\nExample: $2,000 → buys $2,000 in diamonds on month 12, 24, 36, etc.' },
        { icon: '📤', title: 'Fixed Monthly Withdrawal', color: '#fb923c', body: 'Take out a fixed dollar amount from your monthly discount every month, starting from a specific month.\n\nEnter the amount ($) and the starting month, then press OK.\n\nExample: $500 from month 25 = withdraw $500 per month from year 3 onwards.\n\nNote: withdrawal cannot exceed your monthly discount. Any excess stays in your account.' },
        { icon: '📊', title: 'Out % (Percentage Withdrawal)', color: '#a78bfa', body: 'Instead of a fixed amount, take out a percentage of your monthly discount.\n\nEnter the % and the starting month, then press Set.\n\nExample: 75% from month 1 = always take 75% of your discount as cash, reinvest the remaining 25%.\n\nThis is the standard Plan B model — 75% out, 25% compounding.' },
        { icon: '⚡', title: 'Active Compounding %', color: '#4ade80', body: 'Controls how much of your monthly discount is reinvested (compounded) into new diamond purchases versus paid out.\n\n100% = full compounding, no cash taken out — your diamond portfolio grows fastest.\n0% = all discount paid out as cash every month.\n\nThe default is 100% compounding. You can change individual months in the monthly table below the results by tapping the Comp% cell.' },
      ],
    },
    nl: {
      buttonLabel: 'Hoe gebruik je de extra opties',
      modalTitle: 'ℹ️ Extra Opties Uitgelegd',
      tipTitle: '💡 Tip — opties combineren',
      tipBody: 'U kunt alle opties combineren. Bijvoorbeeld: koop $500/maand voor 3 jaar, neem dan 75% op vanaf maand 37. De calculator past alle instellingen gelijktijdig toe en toont het resultaat maand voor maand.',
      items: [
        { icon: '💰', title: 'Maandelijks Depot', color: '#33C5FF', body: 'Koop elke maand extra diamanten bovenop uw eerste aankoop.\n\nVoer het bedrag ($) in en tot welke maand u wilt blijven kopen. Druk op OK.\n\nVoorbeeld: $500 tot maand 24 = $500 extra aankoop elke maand gedurende 2 jaar.' },
        { icon: '🎁', title: 'Jaarlijkse Bonusstorting', color: '#f59e0b', body: 'Voeg een eenmalige extra aankoop toe die één keer per jaar herhaalt (elke 12 maanden).\n\nNuttig voor jaarlijkse bonussen, belastingteruggaven of jaareinde-investeringen.\n\nVoorbeeld: $2.000 → aankopen op maand 12, 24, 36, enz.' },
        { icon: '📤', title: 'Vaste Maandelijkse Opname', color: '#fb923c', body: 'Neem elke maand een vast bedrag op van uw maandelijkse korting, beginnend vanaf een specifieke maand.\n\nVoer het bedrag ($) en de startmaand in, druk op OK.\n\nVoorbeeld: $500 vanaf maand 25 = $500 per maand opnemen vanaf jaar 3.\n\nNoot: opname kan de maandelijkse korting niet overschrijden.' },
        { icon: '📊', title: 'Opname % (Percentage)', color: '#a78bfa', body: 'Neem een percentage van uw maandelijkse korting op in plaats van een vast bedrag.\n\nVoer het % en de startmaand in, druk op Instellen.\n\nVoorbeeld: 75% vanaf maand 1 = altijd 75% van uw korting als contant opnemen, 25% herbeleg.\n\nDit is het standaard Plan B model — 75% opnemen, 25% aangroeien.' },
        { icon: '⚡', title: 'Actief Samengesteld %', color: '#4ade80', body: 'Bepaalt hoeveel van uw maandelijkse korting wordt herbelegd in nieuwe diamantaankopen.\n\n100% = volledig aangroeien, geen contant opgenomen — uw portefeuille groeit het snelst.\n0% = alle korting maandelijks als contant uitbetaald.\n\nStandaard is 100% samengesteld. U kunt individuele maanden aanpassen in de maandelijkse tabel.' },
      ],
    },
    de: {
      buttonLabel: 'Wie man die Zusatzoptionen verwendet',
      modalTitle: 'ℹ️ Zusatzoptionen erklärt',
      tipTitle: '💡 Tipp — Optionen kombinieren',
      tipBody: 'Sie können alle Optionen kombinieren. Beispiel: Kaufen Sie $500/Monat für 3 Jahre, dann heben Sie 75% ab Monat 37 ab. Der Rechner wendet alle Einstellungen gleichzeitig an und zeigt das Ergebnis Monat für Monat.',
      items: [
        { icon: '💰', title: 'Monatliche Einzahlung', color: '#33C5FF', body: 'Kaufen Sie jeden Monat zusätzliche Diamanten über Ihren Erstkauf hinaus.\n\nGeben Sie den Betrag ($) und den Monat "Bis" ein. Drücken Sie OK.\n\nBeispiel: $500 bis Monat 24 = $500 Zusatzkauf jeden Monat für 2 Jahre.' },
        { icon: '🎁', title: 'Jährliche Bonuseinzahlung', color: '#f59e0b', body: 'Fügen Sie einmal pro Jahr (alle 12 Monate) einen einmaligen Sonderkauf hinzu.\n\nNützlich für Jahresboni, Steuererstattungen oder Jahresabschlussinvestitionen.\n\nBeispiel: $2.000 → Kauf in Monat 12, 24, 36 usw.' },
        { icon: '📤', title: 'Feste Monatliche Abhebung', color: '#fb923c', body: 'Heben Sie jeden Monat einen festen Betrag von Ihrem monatlichen Rabatt ab, ab einem bestimmten Monat.\n\nBetrag und Startmonat eingeben, OK drücken.\n\nBeispiel: $500 ab Monat 25 = $500 pro Monat ab Jahr 3.\n\nHinweis: Abhebung kann den monatlichen Rabatt nicht überschreiten.' },
        { icon: '📊', title: 'Abhebung % (Prozentsatz)', color: '#a78bfa', body: 'Nehmen Sie statt eines festen Betrags einen Prozentsatz Ihres monatlichen Rabatts ab.\n\n% und Startmonat eingeben, Einstellen drücken.\n\nBeispiel: 75% ab Monat 1 = 75% des Rabatts als Bargeld, 25% Wiederanlage.\n\nDies ist das Standard-Plan-B-Modell — 75% abheben, 25% anlegen.' },
        { icon: '⚡', title: 'Aktiver Zinseszins %', color: '#4ade80', body: 'Steuert, wie viel Ihres monatlichen Rabatts in neue Diamantkäufe reinvestiert wird.\n\n100% = vollständige Anlage — Ihr Portfolio wächst am schnellsten.\n0% = gesamter Rabatt monatlich als Bargeld ausgezahlt.\n\nStandard ist 100%. Sie können einzelne Monate in der monatlichen Tabelle anpassen.' },
      ],
    },
    fr: {
      buttonLabel: 'Comment utiliser les options supplémentaires',
      modalTitle: 'ℹ️ Options supplémentaires expliquées',
      tipTitle: '💡 Conseil — combiner les options',
      tipBody: 'Vous pouvez combiner toutes les options. Par exemple: achetez $500/mois pendant 3 ans, puis retirez 75% à partir du mois 37. Le calculateur applique tous les paramètres simultanément et montre le résultat mois par mois.',
      items: [
        { icon: '💰', title: 'Dépôt Mensuel', color: '#33C5FF', body: 'Achetez des diamants supplémentaires chaque mois en plus de votre achat initial.\n\nEntrez le montant ($) et jusqu\'à quel mois vous souhaitez continuer. Appuyez sur OK.\n\nExemple: $500 jusqu\'au mois 24 = $500 d\'achat supplémentaire chaque mois pendant 2 ans.' },
        { icon: '🎁', title: 'Bonus Annuel', color: '#f59e0b', body: 'Ajoutez un achat supplémentaire unique qui se répète une fois par an (tous les 12 mois).\n\nUtile pour les primes annuelles, remboursements d\'impôts ou investissements de fin d\'année.\n\nExemple: $2 000 → achats aux mois 12, 24, 36, etc.' },
        { icon: '📤', title: 'Retrait Mensuel Fixe', color: '#fb923c', body: 'Retirez un montant fixe de votre remise mensuelle chaque mois, à partir d\'un mois spécifique.\n\nEntrez le montant et le mois de départ, puis appuyez sur OK.\n\nExemple: $500 à partir du mois 25 = $500/mois à partir de l\'an 3.\n\nNote: le retrait ne peut pas dépasser votre remise mensuelle.' },
        { icon: '📊', title: 'Retrait % (Pourcentage)', color: '#a78bfa', body: 'Retirez un pourcentage de votre remise mensuelle au lieu d\'un montant fixe.\n\nEntrez le % et le mois de départ, puis appuyez sur Définir.\n\nExemple: 75% dès le mois 1 = 75% de remise en cash, 25% réinvesti.\n\nC\'est le modèle Plan B standard — 75% retrait, 25% capitalisation.' },
        { icon: '⚡', title: 'Capitalisation Active %', color: '#4ade80', body: 'Contrôle combien de votre remise mensuelle est réinvesti dans de nouveaux achats de diamants.\n\n100% = capitalisation complète — votre portefeuille croît le plus vite.\n0% = toute la remise versée en cash chaque mois.\n\nPar défaut: 100%. Vous pouvez modifier des mois individuels dans le tableau mensuel.' },
      ],
    },
    es: {
      buttonLabel: 'Cómo usar las opciones adicionales',
      modalTitle: 'ℹ️ Opciones adicionales explicadas',
      tipTitle: '💡 Consejo — combinar opciones',
      tipBody: 'Puede combinar todas las opciones. Por ejemplo: compre $500/mes durante 3 años, luego retire el 75% desde el mes 37. La calculadora aplica todos los ajustes simultáneamente y muestra el resultado mes a mes.',
      items: [
        { icon: '💰', title: 'Depósito Mensual', color: '#33C5FF', body: 'Compre diamantes adicionales cada mes además de su compra inicial.\n\nIngrese el monto ($) y hasta qué mes desea continuar comprando. Presione OK.\n\nEjemplo: $500 hasta el mes 24 = $500 de compra adicional cada mes durante 2 años.' },
        { icon: '🎁', title: 'Bono Anual', color: '#f59e0b', body: 'Agregue una compra extra única que se repite una vez al año (cada 12 meses).\n\nÚtil para bonificaciones anuales, reembolsos de impuestos o inversiones de fin de año.\n\nEjemplo: $2,000 → compras en los meses 12, 24, 36, etc.' },
        { icon: '📤', title: 'Retiro Mensual Fijo', color: '#fb923c', body: 'Retire un monto fijo de su descuento mensual cada mes, comenzando desde un mes específico.\n\nIngrese el monto y el mes de inicio, luego presione OK.\n\nEjemplo: $500 desde el mes 25 = $500/mes a partir del año 3.\n\nNota: el retiro no puede exceder su descuento mensual.' },
        { icon: '📊', title: 'Retiro % (Porcentaje)', color: '#a78bfa', body: 'En lugar de un monto fijo, retire un porcentaje de su descuento mensual.\n\nIngrese el % y el mes de inicio, luego presione Establecer.\n\nEjemplo: 75% desde el mes 1 = siempre retire el 75% del descuento en efectivo, reinvierta el 25%.\n\nEste es el modelo Plan B estándar — 75% retiro, 25% capitalización.' },
        { icon: '⚡', title: 'Capitalización Activa %', color: '#4ade80', body: 'Controla cuánto de su descuento mensual se reinvierte en nuevas compras de diamantes.\n\n100% = capitalización completa — su cartera crece más rápido.\n0% = todo el descuento pagado en efectivo cada mes.\n\nEl valor predeterminado es 100%. Puede cambiar meses individuales en la tabla mensual.' },
      ],
    },
    ru: {
      buttonLabel: 'Как использовать дополнительные параметры',
      modalTitle: 'ℹ️ Дополнительные параметры',
      tipTitle: '💡 Совет — комбинирование параметров',
      tipBody: 'Можно комбинировать все параметры. Например: покупайте $500/месяц в течение 3 лет, затем выводите 75% с месяца 37. Калькулятор применяет все настройки одновременно и показывает результат помесячно.',
      items: [
        { icon: '💰', title: 'Ежемесячный депозит', color: '#33C5FF', body: 'Покупайте дополнительные алмазы каждый месяц сверх первоначальной покупки.\n\nВведите сумму ($) и месяц «До». Нажмите OK.\n\nПример: $500 до месяца 24 = дополнительная покупка на $500 каждый месяц в течение 2 лет.' },
        { icon: '🎁', title: 'Ежегодный бонусный депозит', color: '#f59e0b', body: 'Добавьте разовую дополнительную покупку, повторяющуюся раз в год (каждые 12 месяцев).\n\nПолезно для годовых бонусов, налоговых возвратов или инвестиций в конце года.\n\nПример: $2 000 → покупки в месяцах 12, 24, 36 и т.д.' },
        { icon: '📤', title: 'Фиксированный ежемесячный вывод', color: '#fb923c', body: 'Выводите фиксированную сумму из ежемесячного дохода каждый месяц, начиная с определённого месяца.\n\nВведите сумму и начальный месяц, нажмите OK.\n\nПример: $500 с месяца 25 = $500 в месяц начиная с 3-го года.\n\nПримечание: вывод не может превышать ежемесячный доход.' },
        { icon: '📊', title: 'Вывод % (Процентный вывод)', color: '#a78bfa', body: 'Вместо фиксированной суммы выводите процент от ежемесячного дохода.\n\nВведите % и начальный месяц, нажмите «Установить».\n\nПример: 75% с месяца 1 = всегда выводить 75% дохода, реинвестировать 25%.\n\nЭто стандартная модель Plan B — 75% вывод, 25% сложный процент.' },
        { icon: '⚡', title: 'Активный сложный %', color: '#4ade80', body: 'Контролирует, какая часть ежемесячного дохода реинвестируется в новые покупки алмазов.\n\n100% = полный сложный процент, нет вывода — портфель растёт быстрее всего.\n0% = весь доход выплачивается ежемесячно.\n\nПо умолчанию 100%. Можно изменить отдельные месяцы в таблице.' },
      ],
    },
    zh: {
      buttonLabel: '如何使用额外选项',
      modalTitle: 'ℹ️ 额外选项说明',
      tipTitle: '💡 提示 — 组合使用选项',
      tipBody: '您可以组合所有选项。例如：购买$500/月持续3年，然后从第37个月起提取75%。计算器同时应用所有设置并逐月显示结果。',
      items: [
        { icon: '💰', title: '月度存款', color: '#33C5FF', body: '每月在初始购买之外额外购买钻石。\n\n输入金额（$）和您想继续购买的截止月份。按确定。\n\n示例：$500 直到第24个月 = 连续2年每月额外购买$500。' },
        { icon: '🎁', title: '年度奖金存款', color: '#f59e0b', body: '添加每年重复一次（每12个月）的一次性额外购买。\n\n适用于年度奖金、税务退款或年末投资。\n\n示例：$2,000 → 在第12、24、36个月等购买。' },
        { icon: '📤', title: '固定月度提款', color: '#fb923c', body: '从特定月份开始，每月从月度收益中提取固定金额。\n\n输入金额和开始月份，然后按确定。\n\n示例：从第25个月起每月$500 = 从第3年起每月提取$500。\n\n注意：提款不能超过您的月度收益。' },
        { icon: '📊', title: '提款%（百分比提款）', color: '#a78bfa', body: '不是固定金额，而是提取月度收益的百分比。\n\n输入百分比和开始月份，然后按设置。\n\n示例：从第1个月起75% = 始终提取75%的收益作为现金，将剩余25%再投资。\n\n这是标准Plan B模型 — 75%提取，25%复利。' },
        { icon: '⚡', title: '主动复利%', color: '#4ade80', body: '控制月度收益中有多少被再投资到新的钻石购买中。\n\n100% = 完全复利，不提取现金 — 您的钻石组合增长最快。\n0% = 所有收益每月以现金方式支付。\n\n默认为100%复利。您可以在下方月度表格中更改单个月份。' },
      ],
    },
  };
  return d[lang] ?? d['en'];
}

type PlanTier = {
  name: string;
  rate: string;
  color: string;
  nextTier: { name: string; threshold: number; rate: number } | null;
};

function getPlanTier(amount: number, vipActive: boolean): PlanTier {
  const v = vipActive ? ' (+3% VIP)' : '';
  if (amount >= 100000) return { name: 'SP7', rate: '3.3%' + v, color: '#22d3ee', nextTier: null };
  if (amount >= 50000)  return { name: 'SP6', rate: '3.2%' + v, color: '#a78bfa', nextTier: { name: 'SP7', threshold: 100000, rate: 3.3 } };
  if (amount >= 10000)  return { name: 'SP5', rate: '3.1%' + v, color: '#22c55e', nextTier: { name: 'SP6', threshold: 50000,  rate: 3.2 } };
  if (amount >= 5000)   return { name: 'SP4', rate: '3.0%' + v, color: '#f59e0b', nextTier: { name: 'SP5', threshold: 10000,  rate: 3.1 } };
  if (amount >= 2500)   return { name: 'SP3', rate: '2.7%' + v, color: '#fb923c', nextTier: { name: 'SP4', threshold: 5000,   rate: 3.0 } };
  if (amount >= 1000)   return { name: 'SP2', rate: '2.45%' + v, color: '#94a3b8', nextTier: { name: 'SP3', threshold: 2500,  rate: 2.7 } };
  return                       { name: 'SP1', rate: '2.2%' + v,  color: '#64748b', nextTier: { name: 'SP2', threshold: 1000,  rate: 2.45 } };
}

const CLIENTS_KEY = "plan_b_saved_clients";

interface SavedClient {
  id: string;
  name: string;
  savedAt: number;
  startAmount: string;
  years: string;
  goal: string;
  vipEnabled: boolean;
  manualVip: boolean;
  monthData: Record<number, MonthData>;
}

export default function ScenarioToolScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    plan?: string;
    startAmount?: string;
    monthlyDeposit?: string;
    years?: string;
    outP?: string;
    vip?: string;
    goalAmount?: string;
    // Property Optimizer params
    source?: string;
    propWithdrawal?: string;
    propWithdrawalFrom?: string;
  }>();
  const { language, officeLocation } = useCalculator();
  const { width: screenWidth } = useWindowDimensions();
  // Compute table column widths: 96% of screen, minus outer content padding (32) and card padding (24)
  const TW = Math.max(Math.round(Math.min(screenWidth * 0.96, 1450) - 56), 788);
  const cw = {
    num:      Math.round(TW * 0.036),
    avail:    Math.round(TW * 0.134),
    disc:     Math.round(TW * 0.102),
    diamonds: Math.round(TW * 0.115),
    status:   Math.round(TW * 0.128),
    comp:     Math.round(TW * 0.092),
    plan:     Math.round(TW * 0.102),
    strat:    Math.round(TW * 0.092),
    monthly:  Math.round(TW * 0.092),
    total:    Math.round(TW * 0.115),
  };
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [savedClients, setSavedClients] = useState<SavedClient[]>([]);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [autosaved, setAutosaved] = useState(false);

  const [clientName, setClientName] = useState("");
  const [startAmount, setStartAmount] = useState("3000");
  const [years, setYears] = useState("5");
  const [goal, setGoal] = useState("3500");
  const [inputErrors, setInputErrors] = useState<{ startAmount?: string; years?: string }>({});
  const [showOptionsHelp, setShowOptionsHelp] = useState(false);
  const optionsHelp = useMemo(() => getOptionsHelpItems(language), [language]);
  const [vipEnabled, setVipEnabled] = useState(false);

  // Bulk deposit
  const [bulkStortVal, setBulkStortVal] = useState("");
  const [bulkStortTo, setBulkStortTo] = useState("");
  // Annual deposit
  const [annualVal, setAnnualVal] = useState("");
  // Bulk withdrawal
  const [bulkOpnVal, setBulkOpnVal] = useState("");
  const [bulkOpnFrom, setBulkOpnFrom] = useState("");
  // Bulk out%
  const [bulkOpnPVal, setBulkOpnPVal] = useState("");
  const [bulkOpnPFrom, setBulkOpnPFrom] = useState("");

  const [manualVip, setManualVip] = useState(false);
  const vipExplicitlyOff = useRef(false);

  // Load persisted backup on mount (runs once).
  // Skip if we arrived with external params — the params effects will own state.
  useEffect(() => {
    if (params.plan || params.source === 'property') {
      setHydrated(true);
      return;
    }
    AsyncStorage.getItem(CLIENTS_KEY).then(raw => {
      if (raw) { try { setSavedClients(JSON.parse(raw)); } catch {} }
    });
    AsyncStorage.getItem('plan_b_scenario_backup').then(raw => {
      if (raw) {
        try {
          const s = JSON.parse(raw);
          if (s.clientName   != null) setClientName(s.clientName);
          if (s.startAmount  != null) setStartAmount(s.startAmount);
          if (s.years        != null) setYears(s.years);
          if (s.goal         != null) setGoal(s.goal);
          if (s.vipEnabled   != null) setVipEnabled(s.vipEnabled);
          if (s.manualVip    != null) setManualVip(s.manualVip);
          if (s.monthData    != null) setMonthData(s.monthData);
          if (s.bulkStortVal != null) setBulkStortVal(s.bulkStortVal);
          if (s.bulkStortTo  != null) setBulkStortTo(s.bulkStortTo);
          if (s.annualVal    != null) setAnnualVal(s.annualVal);
          if (s.bulkOpnVal   != null) setBulkOpnVal(s.bulkOpnVal);
          if (s.bulkOpnFrom  != null) setBulkOpnFrom(s.bulkOpnFrom);
          if (s.bulkOpnPVal  != null) setBulkOpnPVal(s.bulkOpnPVal);
          if (s.bulkOpnPFrom != null) setBulkOpnPFrom(s.bulkOpnPFrom);
          if (s.bulkCompVal  != null) setBulkCompVal(s.bulkCompVal);
          if (s.bulkCompFrom != null) setBulkCompFrom(s.bulkCompFrom);
          if (s.bulkCompTo   != null) setBulkCompTo(s.bulkCompTo);
        } catch {}
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-trigger VIP when initial purchase >= $3,550 (only if user hasn't explicitly turned it off)
  const autoVip = numVal(startAmount) >= 3550 && vipEnabled;
  useEffect(() => {
    if (numVal(startAmount) >= 3550 && !vipExplicitlyOff.current) {
      setVipEnabled(true);
      setManualVip(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAmount]);

  // Plan Coach: tier detection & upsell
  const planTier = getPlanTier(numVal(startAmount), autoVip);
  const upsellGap = planTier.nextTier ? planTier.nextTier.threshold - numVal(startAmount) : 0;
  const showUpsell = planTier.nextTier !== null && upsellGap > 0 && upsellGap <= 2000;

  const [monthData, setMonthData] = useState<Record<number, MonthData>>({});
  const [result, setResult] = useState<ReturnType<typeof runCalculation> | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [showMarginMechanics, setShowMarginMechanics] = useState(true);

  // Auto-recalculate when startAmount changes so Goal Reached updates immediately
  useEffect(() => {
    const start = numVal(startAmount);
    if (start <= 0) return;
    setResult(runCalculation({
      startAmount: getNetDeposit(start),
      years: numVal(years, 5),
      goal: numVal(goal, 3500),
      vipEnabled,
      manualVip,
      monthData,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAmount]);

  // Bulk compounding (reset support)
  const [bulkCompVal, setBulkCompVal] = useState("");
  const [bulkCompFrom, setBulkCompFrom] = useState("");
  const [bulkCompTo, setBulkCompTo] = useState("");

  // Tracks which maturity banners the user has dismissed
  const [hiddenMaturityMonths, setHiddenMaturityMonths] = useState<Set<number>>(new Set());
  const [allBannersHidden, setAllBannersHidden] = useState(false);
  const hideMaturityBanner = useCallback((month: number) =>
    setHiddenMaturityMonths(prev => new Set([...prev, month])), []);

  const tableHeaderScrollRef = useRef<ScrollView>(null);
  const tableBodyScrollRef = useRef<ScrollView>(null);

  // Auto-fill from Strategy Engineer when navigated with plan params
  useEffect(() => {
    if (!params.plan) return;
    // Full reset — clear every bulk/override field so no stale data from a previous session leaks in
    setAnnualVal(""); setBulkOpnVal(""); setBulkOpnFrom("");
    setBulkOpnPVal(""); setBulkOpnPFrom("");
    setBulkStortVal(""); setBulkStortTo("");
    setBulkCompVal(""); setBulkCompFrom(""); setBulkCompTo("");
    setManualVip(false);
    const newMonthData: Record<number, MonthData> = {};
    const yrs = parseFloat(params.years ?? "5") || 5;
    const totalM = yrs * 12;
    if (params.startAmount) setStartAmount(params.startAmount);
    if (params.years) setYears(String(yrs));
    if (params.goalAmount) setGoal(params.goalAmount);
    if (params.vip !== undefined) setVipEnabled(params.vip === "1");
    // Apply monthly deposit to all months
    const dep = parseFloat(params.monthlyDeposit ?? "0") || 0;
    if (dep > 0) {
      for (let m = 1; m <= totalM; m++) {
        newMonthData[m] = { stort: dep, opn: 0, opnP: 0, comp: 100 };
      }
      setBulkStortVal(String(dep));
      setBulkStortTo(String(totalM));
    }
    // Apply out%: all months for Asset Goal Planner, month 1 only for Plan D
    const outP = parseFloat(params.outP ?? "0") || 0;
    if (outP > 0) {
      const applyTo = params.plan === 'property' ? totalM : 1;
      for (let m = 1; m <= applyTo; m++) {
        newMonthData[m] = { ...(newMonthData[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), opnP: outP };
      }
      if (params.plan === 'property') {
        setBulkOpnPVal(String(outP));
        setBulkOpnPFrom("1");
      }
    }
    setMonthData(newMonthData);
    // Auto-run calculation immediately with the new plan data
    const vipOn = params.vip === "1";
    const startAmt = parseFloat(params.startAmount ?? "3000") || 3000;
    setResult(runCalculation({
      startAmount: getNetDeposit(startAmt),
      years: yrs,
      goal: parseFloat(params.goalAmount ?? "3500") || 3500,
      vipEnabled: vipOn || startAmt >= 3550,
      manualVip: false,
      monthData: newMonthData,
    }));
    const planLabels: Record<string, string> = {
      A: "Plan A — Monthly Top-Up Strategy",
      B: "Plan B — Wait & Grow Strategy",
      C: "Plan C — One-Year Lump Sum Strategy",
      D: "Plan D — Instant Payout Strategy",
      property: "Asset Goal Planner",
    };
    setAppliedBanner(`✅ ${t(language, 'appliedFromStrategy')}: ${planLabels[params.plan ?? ""] ?? params.plan}`);
    // Auto-dismiss banner after 5 seconds
    const timer = setTimeout(() => setAppliedBanner(null), 5000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.plan, params.startAmount, params.monthlyDeposit, params.years, params.outP, params.vip, params.goalAmount]);

  // Auto-fill from Property Optimizer / Asset Goal Planner
  useEffect(() => {
    if (params.source !== "property") return;
    // Full reset — wipe every bulk/override field so previous session data doesn't bleed in
    setAnnualVal(""); setBulkOpnVal(""); setBulkOpnFrom("");
    setBulkOpnPVal(""); setBulkOpnPFrom("");
    setBulkStortVal(""); setBulkStortTo("");
    setBulkCompVal(""); setBulkCompFrom(""); setBulkCompTo("");
    setManualVip(false);
    const newMonthData: Record<number, MonthData> = {};
    const yrs = parseFloat(params.years ?? "10") || 10;
    const totalM = yrs * 12;
    const withdrawal = parseFloat(params.propWithdrawal ?? "0") || 0;
    const fromMonth = parseInt(params.propWithdrawalFrom ?? "61") || 61;
    const outPct = parseFloat(params.outP ?? "0") || 0;
    const startAmt = parseFloat(params.startAmount ?? "0") || 0;
    const vipOn = params.vip === "1" || startAmt >= 3550;
    if (params.startAmount) setStartAmount(params.startAmount);
    setYears(String(yrs));
    if (params.vip !== undefined) setVipEnabled(vipOn);
    // Apply fixed withdrawal from a specific month onwards (Property Optimizer)
    if (withdrawal > 0) {
      for (let m = fromMonth; m <= totalM; m++) {
        newMonthData[m] = { stort: 0, opn: withdrawal, opnP: 0, comp: 100 };
      }
    }
    // Apply out% to all months (Asset Goal Planner)
    if (outPct > 0) {
      for (let m = 1; m <= totalM; m++) {
        newMonthData[m] = { stort: 0, opn: 0, opnP: outPct, comp: 100 };
      }
    }
    setMonthData(newMonthData);
    // Run calculation immediately — avoids blank screen when startAmount didn't change
    setResult(runCalculation({
      startAmount: getNetDeposit(startAmt),
      years: yrs,
      goal: numVal(goal, 3500),
      vipEnabled: vipOn,
      manualVip: false,
      monthData: newMonthData,
    }));
    const spLabel = startAmt > 0 ? `$${startAmt.toLocaleString()}` : "";
    const vipLabel = vipOn ? " + VIP" : "";
    if (outPct > 0) {
      setAppliedBanner(`🏡 Asset Goal Planner: ${spLabel}${vipLabel} — ${outPct}% out/mo · ${yrs}y`);
    } else {
      setAppliedBanner(`🏠 Property Optimizer: ${spLabel}${vipLabel} — $${withdrawal.toLocaleString()}/mo from Y5`);
    }
    const timer = setTimeout(() => setAppliedBanner(null), 8000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.source, params.startAmount, params.propWithdrawal, params.propWithdrawalFrom, params.vip, params.years, params.outP]);

  const totalMonths = numVal(years, 1) * 12;

  const getMonthData = useCallback((m: number): MonthData => {
    return monthData[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 };
  }, [monthData]);

  const setMonthField = useCallback((m: number, field: keyof MonthData, value: number) => {
    setMonthData(prev => ({
      ...prev,
      [m]: { ...(prev[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), [field]: value },
    }));
  }, []);

  const applyBulkStort = () => {
    const val = numVal(bulkStortVal);
    const to = numVal(bulkStortTo, totalMonths);
    setMonthData(prev => {
      const next = { ...prev };
      for (let m = 1; m <= Math.min(to, totalMonths); m++) {
        next[m] = { ...(next[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), stort: val };
      }
      return next;
    });
  };

  const applyAnnual = () => {
    const val = numVal(annualVal);
    setMonthData(prev => {
      const next = { ...prev };
      for (let m = 13; m <= totalMonths; m += 12) {
        next[m] = { ...(next[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), stort: val };
      }
      return next;
    });
  };

  const applyBulkOpn = () => {
    const val = numVal(bulkOpnVal);
    const from = numVal(bulkOpnFrom, 1);
    setMonthData(prev => {
      const next = { ...prev };
      for (let m = from; m <= totalMonths; m++) {
        next[m] = { ...(next[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), opn: val };
      }
      return next;
    });
  };

  const applyBulkOpnP = () => {
    const val = numVal(bulkOpnPVal);
    const from = numVal(bulkOpnPFrom, 1);
    setMonthData(prev => {
      const next = { ...prev };
      for (let m = from; m <= totalMonths; m++) {
        next[m] = { ...(next[m] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), opnP: val };
      }
      return next;
    });
  };


  const handleReset = () => {
    AsyncStorage.removeItem('plan_b_scenario_backup').catch(() => {});
    setAutosaved(false);
    setClientName(""); setStartAmount("3000"); setYears("5"); setGoal("3500");
    setVipEnabled(false); setManualVip(false); setMonthData({}); setResult(null);
    setBulkStortVal(""); setBulkStortTo(""); setAnnualVal("");
    setBulkOpnVal(""); setBulkOpnFrom(""); setBulkOpnPVal(""); setBulkOpnPFrom("");
    setBulkCompVal(""); setBulkCompFrom(""); setBulkCompTo("");
    setInputErrors({});
  };

  const saveClient = async () => {
    const name = clientName.trim();
    if (!name) {
      Alert.alert("Client name required", "Enter a client name before saving.");
      return;
    }
    const entry: SavedClient = {
      id: Date.now().toString(),
      name,
      savedAt: Date.now(),
      startAmount,
      years,
      goal,
      vipEnabled,
      manualVip,
      monthData,
    };
    const updated = [entry, ...savedClients.filter(c => c.name !== name)];
    setSavedClients(updated);
    await AsyncStorage.setItem(CLIENTS_KEY, JSON.stringify(updated));
    Alert.alert("Saved", `"${name}" saved successfully.`);
  };

  const loadClient = (client: SavedClient) => {
    setClientName(client.name);
    setStartAmount(client.startAmount);
    setYears(client.years);
    setGoal(client.goal);
    setVipEnabled(client.vipEnabled);
    setManualVip(client.manualVip);
    setMonthData(client.monthData);
    setResult(null);
    setInputErrors({});
    setShowClientsModal(false);
  };

  const deleteClient = (id: string) => {
    Alert.alert("Remove client", "Remove this saved profile?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          const updated = savedClients.filter(c => c.id !== id);
          setSavedClients(updated);
          await AsyncStorage.setItem(CLIENTS_KEY, JSON.stringify(updated));
        },
      },
    ]);
  };

  const handleCalculate = async () => {
    const errors: { startAmount?: string; years?: string } = {};
    const amt = parseFloat(startAmount);
    const yrs = parseFloat(years);
    if (!startAmount || isNaN(amt) || amt <= 0) errors.startAmount = "Enter a valid deposit amount";
    if (!years || isNaN(yrs) || yrs <= 0 || yrs > 30) errors.years = "Enter years between 1 and 30";
    setInputErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 0));
    const params: CalculationParams = {
      startAmount: getNetDeposit(numVal(startAmount, 3000)),
      years: numVal(years, 5),
      goal: numVal(goal, 3500),
      vipEnabled,
      manualVip,
      monthData,
    };
    const res = runCalculation(params);
    setResult(res);
    setCalculating(false);
  };

  const vipShadow = useMemo(() => {
    if (!result || vipEnabled || autoVip) return null;
    if (result.goalReachedMonth !== null) return null;
    const start = numVal(startAmount);
    if (start < 1000) return null;
    const shadow = runCalculation({
      startAmount: getNetDeposit(start),
      years: numVal(years, 5),
      goal: numVal(goal, 3500),
      vipEnabled: true,
      manualVip: false,
      monthData,
    });
    return shadow.maxMonthlyOut > result.maxMonthlyOut ? shadow : null;
  }, [result, vipEnabled, autoVip, startAmount, years, goal, monthData]);

  const vipRecoveryMonth = useMemo(() => {
    if (!result || !vipShadow) return null;
    let cumDiff = -1000;
    for (let i = 0; i < Math.min(result.months.length, vipShadow.months.length); i++) {
      cumDiff += vipShadow.months[i].grossYield - result.months[i].grossYield;
      if (cumDiff >= 0) return i + 1;
    }
    return null;
  }, [result, vipShadow]);

  const handleCompareWithVip = () => {
    setVipEnabled(true);
    setResult(runCalculation({
      startAmount: getNetDeposit(numVal(startAmount, 3000)),
      years: numVal(years, 5),
      goal: numVal(goal, 3500),
      vipEnabled: true,
      manualVip: false,
      monthData,
    }));
  };

  // Autosave — debounced 600ms, skips before hydration is confirmed
  useEffect(() => {
    if (!hydrated) return;
    const backup = {
      clientName, startAmount, years, goal, vipEnabled, manualVip, monthData,
      bulkStortVal, bulkStortTo, annualVal, bulkOpnVal, bulkOpnFrom,
      bulkOpnPVal, bulkOpnPFrom, bulkCompVal, bulkCompFrom, bulkCompTo,
    };
    const timer = setTimeout(() => {
      AsyncStorage.setItem('plan_b_scenario_backup', JSON.stringify(backup))
        .then(() => { setAutosaved(true); setTimeout(() => setAutosaved(false), 2000); })
        .catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, clientName, startAmount, years, goal, vipEnabled, manualVip, monthData,
      bulkStortVal, bulkStortTo, annualVal, bulkOpnVal, bulkOpnFrom,
      bulkOpnPVal, bulkOpnPFrom, bulkCompVal, bulkCompFrom, bulkCompTo]);

  const goalProgress = result ? result.goalProgress : 0;

  if (!hydrated) return <ScreenContainer bgColor="#0f172a" edges={["top", "left", "right"]} />;

  return (
    <ScreenContainer edges={["top", "left", "right"]} bgColor="#0f172a">
      <ScrollView style={S.scroll} contentContainerStyle={S.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Text style={S.backText}>← {t(language, 'back')}</Text>
          </TouchableOpacity>
          <Text style={S.title}>💎 Plan B</Text>
          <Text style={S.subtitle}>{t(language, 'welcomeSubtitle')}</Text>
        </View>

        {/* Applied Banner */}
        {appliedBanner && (
          <View style={S.appliedBanner}>
            <Text style={S.appliedBannerText}>{appliedBanner}</Text>
            <TouchableOpacity onPress={() => setAppliedBanner(null)}>
              <Text style={S.appliedBannerClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Goal bar */}
        <View style={S.card}>
          <View style={S.row}>
            <Text style={S.label}>{t(language, 'goal').toUpperCase()} $</Text>
            <TextInput style={S.goalInput} value={goal} onChangeText={setGoal} keyboardType="numeric" placeholderTextColor="#666" />
            <TouchableOpacity style={S.resetBtn} onPress={handleReset}>
              <Text style={S.resetText}>{t(language, 'reset')}</Text>
            </TouchableOpacity>
          </View>
          <View style={S.progressBar}>
            <View style={[S.progressFill, { width: `${Math.min(goalProgress, 100)}%` as any }]} />
          </View>
          <View style={S.row}>
            <Text style={S.progressLabel}>{Math.round(goalProgress)}%</Text>
            {autosaved && (
              <Text style={{ color: "#22c55e", fontSize: 10, fontWeight: "bold", marginLeft: 6 }}>💾 Autosaved</Text>
            )}
            {result?.goalReached && (
              <View style={S.goalBadge}><Text style={S.goalBadgeText}>{t(language, 'goalReached')}</Text></View>
            )}
          </View>
        </View>

        {/* Client & VIP */}
        <View style={S.card}>
          <View style={S.row}>
            <View style={S.flex1}>
              <Text style={S.label}>{t(language, 'clientName').toUpperCase()}</Text>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <TextInput style={[S.input, { flex: 1, marginBottom: 0 }]} value={clientName} onChangeText={setClientName} placeholder={t(language, 'clientName')} placeholderTextColor="#555" />
                <TouchableOpacity onPress={saveClient} style={{ backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#334155' }}>
                  <Text style={{ fontSize: 15 }}>💾</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowClientsModal(true)} style={{ backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#334155' }}>
                  <Text style={{ fontSize: 15 }}>📂{savedClients.length > 0 ? ` ${savedClients.length}` : ''}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={S.vipBox}>
              <Text style={S.label}>{t(language, 'vipStatus').toUpperCase()}</Text>
              <Switch
                value={vipEnabled}
                onValueChange={(v) => { vipExplicitlyOff.current = !v; setVipEnabled(v); }}
                trackColor={{ false: "#333", true: "#f59e0b" }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Start & Years */}
        <View style={S.row}>
          <View style={[S.card, S.flex1, { marginRight: 5 }]}>
            <Text style={S.label}>{t(language, 'startDiamonds').toUpperCase()} $</Text>
            <TextInput style={S.bigInput} value={startAmount} onChangeText={v => { setStartAmount(v); setInputErrors(e => ({ ...e, startAmount: undefined })); }} keyboardType="numeric" placeholderTextColor="#555" />
            {/* SP Tier Presets */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {([
                { label: 'SP2', amount: '1000', color: '#94a3b8' },
                { label: 'SP3', amount: '2500', color: '#fb923c' },
                { label: 'SP4', amount: '5000', color: '#f59e0b' },
                { label: 'SP5', amount: '10000', color: '#22c55e' },
                { label: 'SP6', amount: '50000', color: '#a78bfa' },
                { label: 'SP7', amount: '100000', color: '#22d3ee' },
              ] as const).map(p => (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => { setStartAmount(p.amount); setInputErrors(e => ({ ...e, startAmount: undefined })); }}
                  style={{ backgroundColor: p.color + '18', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: p.color + '55' }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: p.color, fontSize: 10, fontWeight: 'bold' }}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {numVal(startAmount) > 0 && numVal(startAmount) < 110
              ? <Text style={{ color: '#ef4444', fontSize: 10, marginTop: 4, fontWeight: 'bold' }}>⚠️ SP1 Minimum is $110</Text>
              : numVal(startAmount) >= 110
                ? (() => {
                    const gross = numVal(startAmount);
                    const net = getNetDeposit(gross);
                    const fee = gross - net;
                    const vipFee = autoVip ? 1000 : 0;
                    const netDiamonds = net - vipFee;
                    return (
                      <View style={{ marginTop: 6, backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 6, padding: 7, borderWidth: 1, borderColor: '#334155' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#94a3b8', fontSize: 10 }}>{t(language, 'grossDeposit')}</Text>
                          <Text style={{ color: '#e2e8f0', fontSize: 10, fontWeight: 'bold' }}>${gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                          <Text style={{ color: '#94a3b8', fontSize: 10 }}>{t(language, 'accessFee')}</Text>
                          <Text style={{ color: '#ef4444', fontSize: 10 }}>−${fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        {autoVip && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                            <Text style={{ color: '#94a3b8', fontSize: 10 }}>{t(language, 'vipActivationFee')}</Text>
                            <Text style={{ color: '#ef4444', fontSize: 10 }}>−$1,000.00</Text>
                          </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 3 }}>
                          <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: 'bold' }}>{t(language, 'netInvestedDiamonds')}</Text>
                          <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: 'bold' }}>${netDiamonds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                      </View>
                    );
                  })()
                : null
            }
            {inputErrors.startAmount && (
              <Text style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>⚠️ {inputErrors.startAmount}</Text>
            )}

            {/* Plan tier badge */}
            {(() => {
              const vipSuffix = ' (+3% VIP)';
              const hasVip = planTier.rate.endsWith(vipSuffix);
              const baseRate = hasVip ? planTier.rate.slice(0, -vipSuffix.length) : planTier.rate;
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7 }}>
                  <View style={{
                    backgroundColor: planTier.color + '22',
                    borderRadius: 12,
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                    borderWidth: 1,
                    borderColor: planTier.color,
                    flexDirection: 'row',
                    alignItems: 'baseline',
                  }}>
                    <Text style={{ color: planTier.color, fontSize: 10, fontWeight: 'bold', letterSpacing: 0.4 }}>
                      {t(language, 'planPrefix') + ' ' + planTier.name + ' · ' + baseRate}
                    </Text>
                    {hasVip && (
                      <Text style={{ color: planTier.color, fontSize: 8.5, fontWeight: 'bold', opacity: 0.85, marginLeft: 1 }}>
                        {vipSuffix}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })()}

            {/* Upsell tip */}
            {showUpsell && (
              <View style={{
                backgroundColor: 'rgba(253,224,71,0.12)',
                borderRadius: 7,
                padding: 9,
                marginTop: 7,
                borderWidth: 1.5,
                borderColor: '#FDE047',
              }}>
                <Text style={{ color: '#FDE047', fontSize: 10, fontWeight: 'bold', lineHeight: 15 }}>
                  {t(language, 'upsellTipGeneric')
                    .replace('{amount}', fmt(upsellGap))
                    .replace('{plan}', `${planTier.nextTier!.name} (${planTier.nextTier!.rate}%)`)}
                </Text>
              </View>
            )}

            {autoVip ? (
              <View style={{
                backgroundColor: 'rgba(16,185,129,0.15)',
                borderRadius: 8,
                padding: 10,
                marginTop: 10,
                borderWidth: 1.5,
                borderColor: '#10b981',
                alignItems: 'center',
              }}>
                <Text style={{ color: '#10b981', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.8 }}>{t(language, 'vipAutoActiveTitle')}</Text>
                <Text style={{ color: '#6ee7b7', fontSize: 10, marginTop: 4, textAlign: 'center' }}>{t(language, 'vipAutoActiveFee')}</Text>
                <View style={{ marginTop: 6, backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: '#f59e0b', fontSize: 10, fontWeight: 'bold' }}>{t(language, 'vipRateApplied')}</Text>
                </View>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                  <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: 'bold', flex: 1 }}>{t(language, 'manualVipLabel')}</Text>
                  <Switch value={manualVip} onValueChange={setManualVip} trackColor={{ false: "#333", true: "#33C5FF" }} thumbColor="#fff" />
                </View>
                <View style={{ backgroundColor: 'rgba(51,197,255,0.1)', borderRadius: 6, padding: 8, marginTop: 6, borderLeftWidth: 2, borderLeftColor: '#33C5FF' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 10, lineHeight: 14 }}>{t(language, 'manualVipNote')}</Text>
                </View>
              </>
            )}
          </View>
          <View style={[S.card, S.flex1, { marginLeft: 5 }]}>
            <Text style={S.label}>{t(language, 'years').toUpperCase()}</Text>
            <TextInput style={S.bigInput} value={years} onChangeText={v => { setYears(v); setInputErrors(e => ({ ...e, years: undefined })); }} keyboardType="numeric" placeholderTextColor="#555" />
            {inputErrors.years && (
              <Text style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>⚠️ {inputErrors.years}</Text>
            )}
          </View>
        </View>

        {/* Extra Options Help */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, paddingVertical: 6, paddingHorizontal: 2 }}
          onPress={() => setShowOptionsHelp(true)}
          activeOpacity={0.7}
        >
          <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#33C5FF', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#33C5FF', fontSize: 11, fontWeight: 'bold', lineHeight: 14 }}>i</Text>
          </View>
          <Text style={{ color: '#33C5FF', fontSize: 12, fontWeight: '600' }}>{optionsHelp.buttonLabel}</Text>
        </TouchableOpacity>

        {/* Bulk Deposit */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language, 'deposit').toUpperCase()}</Text>
          <View style={S.bulkRow}>
            <TextInput style={S.bulkInput} value={bulkStortVal} onChangeText={setBulkStortVal} placeholder={t(language,'extraAmounts')} placeholderTextColor="#555" keyboardType="numeric" />
            <TextInput style={S.bulkSmall} value={bulkStortTo} onChangeText={setBulkStortTo} placeholder={t(language,'till')} placeholderTextColor="#555" keyboardType="numeric" />
            <TouchableOpacity style={S.btnBlue} onPress={applyBulkStort}><Text style={S.btnText}>{t(language,'ok')}</Text></TouchableOpacity>
          </View>
          {numVal(bulkStortVal) > 0 && numVal(bulkStortVal) < 110
            ? <Text style={{ color: '#ef4444', fontSize: 10, marginTop: 4, fontWeight: 'bold' }}>⚠️ SP1 Minimum is $110</Text>
            : numVal(bulkStortVal) >= 110
              ? <Text style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>${numVal(bulkStortVal).toLocaleString()} → Net: ${getNetDeposit(numVal(bulkStortVal)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              : null
          }
          <Text style={S.sectionLabel}>{t(language,'extraAmounts').toUpperCase()} {t(language,'annual').toUpperCase()} {t(language,'oneTime').toUpperCase()}</Text>
          <View style={S.bulkRow}>
            <TextInput style={S.bulkInput} value={annualVal} onChangeText={setAnnualVal} placeholder={t(language,'extraAmounts')} placeholderTextColor="#555" keyboardType="numeric" />
            <TouchableOpacity style={S.btnAmber} onPress={applyAnnual}><Text style={S.btnTextDark}>{t(language,'set')}</Text></TouchableOpacity>
          </View>
        </View>

        {/* Bulk Withdrawal */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t(language,'withdrawal').toUpperCase()}</Text>
          <View style={S.bulkRow}>
            <TextInput style={S.bulkInput} value={bulkOpnVal} onChangeText={setBulkOpnVal} placeholder={t(language,'monthlyAmount')} placeholderTextColor="#555" keyboardType="numeric" />
            <TextInput style={S.bulkSmall} value={bulkOpnFrom} onChangeText={setBulkOpnFrom} placeholder={t(language,'from')} placeholderTextColor="#555" keyboardType="numeric" />
            <TouchableOpacity style={S.btnBlue} onPress={applyBulkOpn}><Text style={S.btnText}>{t(language,'ok')}</Text></TouchableOpacity>
          </View>
          <Text style={S.sectionLabel}>{t(language,'outPercentage').toUpperCase()}</Text>
          <View style={S.bulkRow}>
            <TextInput style={S.bulkSmall} value={bulkOpnPVal} onChangeText={setBulkOpnPVal} placeholder="%" placeholderTextColor="#555" keyboardType="numeric" />
            <TextInput style={S.bulkSmall} value={bulkOpnPFrom} onChangeText={setBulkOpnPFrom} placeholder={t(language,'from')} placeholderTextColor="#555" keyboardType="numeric" />
            <TouchableOpacity style={S.btnAmber} onPress={applyBulkOpnP}><Text style={S.btnTextDark}>{t(language,'set')}</Text></TouchableOpacity>
          </View>
        </View>

        {/* Active Compounding Info */}
        <View style={S.card}>
          <Text style={S.sectionLabel}>⚡ {t(language, 'compoundPercentage').toUpperCase()}</Text>
          <Text style={{ color: "#64748b", fontSize: 11, lineHeight: 16 }}>
            {t(language, 'activeCompInfo')}
          </Text>
        </View>

        {/* Calculate + Reset */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 0 }}>
          <TouchableOpacity style={[S.calcBtn, { flex: 1, marginBottom: 0 }, calculating && { opacity: 0.7 }]} onPress={handleCalculate} disabled={calculating}>
            {calculating
              ? <ActivityIndicator color="#0f172a" />
              : <Text style={S.calcText}>⚡ {t(language, 'calculate').toUpperCase()}</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155', marginBottom: 8 }}
            onPress={handleReset}
          >
            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: 'bold' }}>↺ Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {result && (
          <>
            {/* PDF Export Button */}
            <TouchableOpacity
              style={[S.calcBtn, { backgroundColor: '#33C5FF', marginBottom: 8, opacity: pdfLoading ? 0.6 : 1 }]}
              disabled={pdfLoading}
              onPress={async () => {
                if (!result) return;
                setPdfLoading(true);
                try {
                  const officeData: Record<string, { name: string; address: string; reg: string }> = {
                    dubai: { name: 'Diamond Solution — Dubai Freezone', address: 'DMCC Business Centre, Jumeirah Lakes Towers, Dubai, UAE', reg: 'DMCC License No. 1007195 · SIRA Certified' },
                    vienna: { name: 'Diamond Solution — Vienna, Austria', address: 'Vienna, Austria', reg: 'EU Operations Office' },
                    manila: { name: 'Diamond Solution — Manila, Philippines', address: 'Manila, Philippines', reg: 'SEC Registration No. 2026030241228-02' },
                    florida: { name: 'Diamond Solution — Florida, USA', address: 'Florida, United States', reg: 'US Operations Office' },
                  };
                  const office = officeData[officeLocation] ?? officeData.dubai;
                  const P = getPdfLabels(language);
                  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                  const pdfFilename = `PlanB_${(clientName || 'Strategy').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}_${new Date().toISOString().split('T')[0]}`;
                  const totalYears = Math.round(result.months.length / 12);
                  const totalMonths = result.months.length;
                  const maxRebateMonth = result.months.reduce((best, r) => r.grossYield > best.grossYield ? r : best, result.months[0]);
                  const firstDeposit = result.months[0]?.deposit ?? 0;
                  const depositMonths = result.months.filter(m => m.deposit > 0).length;
                  const depositLabel = firstDeposit > 0
                    ? `${fmt(firstDeposit)}${depositMonths > 1 ? ` <span style="font-size:10px;color:#0369a1">(active ${depositMonths} months)</span>` : ''}`
                    : 'None';

                  // Build monthly table rows — grouped by year if > 5 years
                  let tableBody = '';
                  if (totalYears <= 5) {
                    let cumulative = 0;
                    tableBody = result.months.map(row => {
                      cumulative += row.grossYield;
                      const isManualVipRow = row.isNewVip && !row.isVipSelfFunded;
                      const bg = isManualVipRow ? '#fef3c7' : row.month % 2 === 0 ? '#f8fafc' : '#ffffff';
                      const border = isManualVipRow ? ';border-top:2px solid #f59e0b;border-bottom:2px solid #f59e0b' : '';
                      const depColor = row.deposit > 0 ? '#0369a1' : '#94a3b8';
                      const vipBadge = isManualVipRow
                        ? '<br><span style="font-size:9px;color:#92400e;font-weight:700;background:#fde68a;padding:1px 5px;border-radius:3px;white-space:nowrap">+ $1,000 Manual VIP Fee</span>'
                        : '';
                      return `<tr style="background:${bg}${border}">
                        <td style="text-align:center;color:#1e293b;font-weight:${isManualVipRow ? '700' : '400'}">${row.month}</td>
                        <td style="text-align:right;color:${depColor};font-weight:${row.deposit > 0 ? '600' : '400'}">${row.deposit > 0 ? fmt(row.deposit) : '$0'}${vipBadge}</td>
                        <td style="text-align:right;color:#16a34a;font-weight:600">${fmt(row.grossYield)}</td>
                        <td style="text-align:right;color:#16a34a">${fmt(cumulative)}</td>
                        <td style="text-align:right;color:#1e3a5f;font-weight:600">${fmt(row.capEnd)}</td>
                      </tr>`;
                    }).join('');
                  } else {
                    // Group by year
                    let cumulative = 0;
                    const years_map: Record<number, { rebates: number; deposits: number; finalVal: number; months: number; hasManualVip: boolean }> = {};
                    result.months.forEach(row => {
                      const yr = Math.ceil(row.month / 12);
                      if (!years_map[yr]) years_map[yr] = { rebates: 0, deposits: 0, finalVal: 0, months: 0, hasManualVip: false };
                      years_map[yr].rebates += row.grossYield;
                      years_map[yr].deposits += row.deposit;
                      years_map[yr].finalVal = row.capEnd;
                      years_map[yr].months = row.month;
                      if (row.isNewVip && !row.isVipSelfFunded) years_map[yr].hasManualVip = true;
                    });
                    tableBody = Object.entries(years_map).map(([yr, data]) => {
                      cumulative += data.rebates;
                      const bg = data.hasManualVip ? '#fef3c7' : parseInt(yr) % 2 === 0 ? '#f8fafc' : '#ffffff';
                      const border = data.hasManualVip ? ';border-top:2px solid #f59e0b;border-bottom:2px solid #f59e0b' : '';
                      const depColor = data.deposits > 0 ? '#0369a1' : '#94a3b8';
                      const vipBadge = data.hasManualVip
                        ? '<br><span style="font-size:9px;color:#92400e;font-weight:700;background:#fde68a;padding:1px 5px;border-radius:3px;white-space:nowrap">+ $1,000 Manual VIP Fee</span>'
                        : '';
                      return `<tr style="background:${bg}${border}">
                        <td style="text-align:center;color:#1e293b;font-weight:600">Year ${yr} (Month ${(parseInt(yr)-1)*12+1}–${data.months})</td>
                        <td style="text-align:right;color:${depColor};font-weight:${data.deposits > 0 ? '600' : '400'}">${data.deposits > 0 ? fmt(data.deposits) : '$0'}${vipBadge}</td>
                        <td style="text-align:right;color:#16a34a;font-weight:600">${fmt(data.rebates)}</td>
                        <td style="text-align:right;color:#16a34a">${fmt(cumulative)}</td>
                        <td style="text-align:right;color:#1e3a5f;font-weight:600">${fmt(data.finalVal)}</td>
                      </tr>`;
                    }).join('');
                  }

                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
                  <title>${pdfFilename}</title>
                  <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    @page { size: A4; margin: 20mm 15mm; }
                    body { font-family: Arial, Helvetica, sans-serif; background: #ffffff; color: #1e293b; font-size: 12px; line-height: 1.5; }
                    
                    /* Header */
                    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 3px solid #1e3a5f; margin-bottom: 18px; }
                    .logo-area { display: flex; align-items: center; gap: 10px; }
                    .logo-emoji { font-size: 32px; }
                    .logo-text { font-size: 22px; font-weight: 900; color: #1e3a5f; letter-spacing: -0.5px; }
                    .logo-sub { font-size: 10px; color: #64748b; margin-top: 2px; }
                    .doc-title { text-align: right; }
                    .doc-title-main { font-size: 14px; font-weight: 900; color: #1e3a5f; letter-spacing: 1px; text-transform: uppercase; }
                    .doc-meta { font-size: 10px; color: #64748b; margin-top: 3px; }
                    .gia-seal { display:inline-flex; flex-direction:column; align-items:center; border:2px solid #0284c7; border-radius:8px; padding:6px 12px; background:#f0f9ff; margin-right: 12px; }
                    .gia-seal-icon { font-size:14px; margin-bottom:2px; }
                    .gia-seal-title { font-size:9px; font-weight:900; color:#0369a1; letter-spacing:1.2px; text-transform:uppercase; }
                    .gia-seal-sub { font-size:7.5px; color:#64748b; margin-top:1px; }

                    /* Client block */
                    .client-block { background: #f1f5f9; border-left: 4px solid #33C5FF; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; }
                    .client-name { font-size: 17px; font-weight: 700; color: #1e3a5f; }
                    .client-meta { font-size: 10px; color: #64748b; margin-top: 3px; }

                    /* Section titles */
                    .section-title { font-size: 11px; font-weight: 700; color: #1e3a5f; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1.5px solid #33C5FF; padding-bottom: 5px; margin: 18px 0 10px; }

                    /* Parameters grid */
                    .params-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
                    .param-row { display: flex; flex-direction: column; }
                    .param-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                    .param-value { font-size: 14px; font-weight: 700; color: #1e3a5f; margin-top: 2px; }

                    /* Summary grid */
                    .summary-box { border: 1.5px solid #1e3a5f; border-radius: 8px; padding: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; background: #fff; }
                    .stat { padding: 8px 12px; border-radius: 6px; background: #f8fafc; }
                    .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
                    .stat-value { font-size: 15px; font-weight: 700; color: #1e3a5f; }
                    .green { color: #16a34a !important; }
                    .blue { color: #33C5FF !important; }

                    /* Table */
                    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 18px; }
                    thead tr { background: #1e3a5f; }
                    thead th { color: #ffffff; padding: 8px 10px; text-align: left; font-weight: 700; letter-spacing: 0.5px; }
                    thead th:not(:first-child) { text-align: right; }
                    tbody td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }

                    /* Guarantee box */
                    .guarantee-box { background: #f0fdf4; border: 1.5px solid #16a34a; border-radius: 8px; padding: 14px 18px; margin-bottom: 14px; }
                    .guarantee-title { font-size: 12px; font-weight: 700; color: #16a34a; margin-bottom: 6px; }
                    .guarantee-item { font-size: 11px; color: #166534; margin-bottom: 4px; padding-left: 12px; position: relative; }
                    .guarantee-item::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 700; }

                    /* Disclaimer */
                    .disclaimer { margin-top: 14px; padding: 10px 14px; background: #fefce8; border-left: 3px solid #ca8a04; border-radius: 4px; font-size: 10px; color: #78350f; line-height: 1.6; }

                    /* Footer */
                    .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
                  </style></head><body>

                  <!-- HEADER -->
                  <div class="header">
                    <div class="logo-area">
                      <div class="logo-emoji">💎</div>
                      <div>
                        <div class="logo-text">Plan B</div>
                        <div class="logo-sub">Diamond Solution International</div>
                      </div>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;">
                      <div class="gia-seal">
                        <div class="gia-seal-icon">🔒</div>
                        <div class="gia-seal-title">${P.giaTitle}</div>
                        <div class="gia-seal-sub">${P.giaSub}</div>
                      </div>
                      <div class="doc-title">
                        <div class="doc-title-main">${P.docTitle}</div>
                        <div class="doc-meta">Date: ${today}</div>
                        <div class="doc-meta">${office.name}</div>
                      </div>
                    </div>
                  </div>

                  <!-- CLIENT BLOCK -->
                  ${clientName ? `<div class="client-block">
                    <div class="client-name">${clientName}</div>
                    <div class="client-meta">${P.preparedFor}: ${totalYears}-${P.yearPlanB} &nbsp;·&nbsp; ${office.reg}</div>
                  </div>` : ''}

                  <!-- STRATEGY PARAMETERS -->
                  <div class="section-title">${P.paramsTitle}</div>
                  <div class="params-box">
                    <div class="param-row">
                      <div class="param-label">${t(language, 'startDiamonds')}</div>
                      <div class="param-value">${fmt(numVal(startAmount))}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">${t(language, 'years')}</div>
                      <div class="param-value">${totalYears} Years (${totalMonths} Months)</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">${P.spTier}</div>
                      <div class="param-value" style="color:#1e3a5f">${(() => { const sp = getSPLevel(getNetDeposit(numVal(startAmount))); return sp.name + ' — ' + (sp.baseRate + (vipEnabled ? 3 : 0)).toFixed(2) + '%/mo'; })()}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">${t(language, 'goal')}</div>
                      <div class="param-value" style="color:${result.goalReachedMonth ? '#16a34a' : '#1e3a5f'}">${fmt(numVal(goal))}${result.goalReachedMonth ? ' ✓' : ''}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">${t(language, 'deposit')}</div>
                      <div class="param-value" style="font-weight:700">${depositLabel}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">${t(language, 'vipStatus')}</div>
                      <div class="param-value" style="color:${vipEnabled ? '#33C5FF' : '#64748b'}">${vipEnabled ? P.vipActive : P.vipStandard}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label">${P.vipFeeLabel}</div>
                      <div class="param-value" style="color:${vipEnabled ? '#f59e0b' : '#64748b'}">${vipEnabled ? P.vipFeeValue : P.vipFeeNone}</div>
                    </div>
                    <div class="param-row">
                      <div class="param-label" style="font-weight:700">${P.feesLabel}</div>
                      <div class="param-value" style="font-weight:700;color:#f59e0b">${P.feesValue}</div>
                    </div>
                  </div>

                  <!-- STRATEGY SUMMARY -->
                  <div class="section-title">${P.summaryTitle} — ${totalYears} ${P.yearPlanB}</div>
                  <div class="summary-box">
                    <div class="stat">
                      <div class="stat-label">${t(language, 'totalIn')}${result.totalVipCost > 0 ? ' *' : ''}</div>
                      <div class="stat-value">${fmt(result.totalIn + result.totalVipCost)}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">${t(language, 'totalOut')}</div>
                      <div class="stat-value green">${fmt(result.totalOut)}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">${t(language, 'finalBalance')}</div>
                      <div class="stat-value green">${fmt(result.finalCap)}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">${t(language, 'netResult')}</div>
                      <div class="stat-value green">${(() => { const adj = result.netResult - result.totalVipCost; const base = result.totalIn + result.totalVipCost; return fmt(adj) + ' (' + (base > 0 ? (adj / base * 100).toFixed(1) : '0.0') + '%)'; })()}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">${t(language, 'rocBreakEven')}</div>
                      <div class="stat-value blue">${result.rocMonth ? P.colMonth + ' ' + result.rocMonth + ' (Year ' + Math.ceil(result.rocMonth/12) + ')' : P.pending}</div>
                    </div>
                    <div class="stat">
                      <div class="stat-label">${t(language, 'maxMonthlyDiscountLabel').replace('{month}', String(result.maxMonthlyOutMonth))}</div>
                      <div class="stat-value green">${fmt(result.maxMonthlyOut)}</div>
                    </div>
                    <div class="stat" style="grid-column:span 2;background:${result.goalReachedMonth ? '#f0fdf4' : '#fefce8'};border:1.5px solid ${result.goalReachedMonth ? '#16a34a' : '#ca8a04'}">
                      <div class="stat-label">${P.goalLabel} — ${fmt(numVal(goal))}</div>
                      <div class="stat-value" style="color:${result.goalReachedMonth ? '#16a34a' : '#b45309'}">${result.goalReachedMonth ? P.goalReached.replace('{month}', String(result.goalReachedMonth)).replace('{duration}', formatGoalDuration(result.goalReachedMonth, language)) : P.goalMissed.replace('{years}', String(totalYears))}</div>
                    </div>
                  </div>
                  ${result.totalVipCost > 0 ? `<p style="font-size:9px;color:#64748b;margin:4px 0 0 2px">${P.vipNote}</p>` : ''}

                  <!-- MONTHLY DISCOUNT SCHEDULE -->
                  <div class="section-title">${P.tableTitle} ${totalYears > 5 ? P.tableGrouped : ''}</div>
                  <table>
                    <thead>
                      <tr>
                        <th>${totalYears > 5 ? P.colPeriod : P.colMonth}</th>
                        <th style="text-align:right">${totalYears > 5 ? P.colAnnualDep : P.colMonthlyDep}</th>
                        <th style="text-align:right">${totalYears > 5 ? P.colAnnualDisc : P.colMonthlyDisc}</th>
                        <th style="text-align:right">${P.colCumulative}</th>
                        <th style="text-align:right">${P.colTotalAsset}</th>
                      </tr>
                    </thead>
                    <tbody>${tableBody}</tbody>
                  </table>

                  <!-- SECURITY & GUARANTEES -->
                  <div class="section-title">${P.secTitle}</div>
                  <div class="guarantee-box">
                    <div class="guarantee-title">${P.secBoxTitle}</div>
                    <div class="guarantee-item">${P.g1.replace('{years}', String(totalYears))}</div>
                    <div class="guarantee-item">${P.g2}</div>
                    <div class="guarantee-item">${P.g3}</div>
                    <div class="guarantee-item">${P.g4}</div>
                  </div>

                  <!-- DISCLAIMER -->
                  <div class="disclaimer">
                    ⚠️ <strong>${P.discTitle}</strong> ${P.discBody}
                  </div>

                  <!-- FOOTER -->
                  <div class="footer">
                    <span><strong>${office.name}</strong> · ${office.address} · ${office.reg}</span>
                    <span>${P.generatedBy} · ${today} · ${pdfFilename}.pdf</span>
                  </div>

                  </body></html>`;

                  if (Platform.OS === 'web') {
                    // Web: open in new window and trigger browser print dialog
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(html);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                      }, 500);
                    }
                  } else {
                    const { uri } = await Print.printToFileAsync({ html, base64: false });
                    if (Platform.OS === 'android') {
                      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                        data: uri,
                        flags: 1,
                        type: 'application/pdf',
                      });
                    } else {
                      // iOS: share sheet lets adviser AirDrop, email, save to Files, etc.
                      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Share Strategy PDF' });
                    }
                  }
                } catch (e) {
                  Alert.alert(t(language,'pdfError'), String(e));
                } finally {
                  setPdfLoading(false);
                }
              }}
            >
              <Text style={[S.calcText, { color: '#fff' }]}>
                {pdfLoading ? `⏳ ${t(language,'pdfGenerating')}` : `📄 ${t(language,'exportPdf').toUpperCase()}`}
              </Text>
            </TouchableOpacity>

            {/* Copy Result Button */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TouchableOpacity
                style={[S.calcBtn, { flex: 1, backgroundColor: copied ? '#22c55e' : '#1e293b', borderWidth: 1, borderColor: copied ? '#22c55e' : '#334155' }]}
                onPress={async () => {
                  const deposit = numVal(startAmount);
                  const net = getNetDeposit(deposit);
                  const sp = getSPLevel(net);
                  const text = buildCopyText(language, { deposit, net, sp, vipEnabled, years, goal, clientName, result });
                  await Clipboard.setStringAsync(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
              >
                <Text style={[S.calcText, { color: copied ? '#fff' : '#94a3b8', fontSize: 13 }]}>
                  {copied ? '✅ Copied' : '📋 Copy'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[S.calcBtn, { flex: 1, backgroundColor: shared ? '#22c55e' : '#1e293b', borderWidth: 1, borderColor: shared ? '#22c55e' : '#334155' }]}
                onPress={async () => {
                  const deposit = numVal(startAmount);
                  const net = getNetDeposit(deposit);
                  const sp = getSPLevel(net);
                  const text = buildCopyText(language, { deposit, net, sp, vipEnabled, years, goal, clientName, result });
                  const available = await Sharing.isAvailableAsync();
                  if (!available) {
                    await Clipboard.setStringAsync(text);
                    setShared(true);
                    setTimeout(() => setShared(false), 2500);
                    return;
                  }
                  // Write to a temp file so the share sheet has a proper text attachment
                  const file = new FileSystem.File(FileSystem.Paths.cache, 'planb-result.txt');
                  file.create({ overwrite: true });
                  file.write(text);
                  await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', dialogTitle: 'Share Strategy Result', UTI: 'public.plain-text' });
                  setShared(true);
                  setTimeout(() => setShared(false), 2500);
                }}
              >
                <Text style={[S.calcText, { color: shared ? '#fff' : '#94a3b8', fontSize: 13 }]}>{shared ? '✅ ' + t(language, 'done') : '📤 ' + t(language, 'shareLink')}</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Cards */}
            <View style={[S.card, { borderWidth: 1, borderColor: 'rgba(51,197,255,0.22)' }]}>
              <Text style={S.sectionLabel}>{t(language, 'strategySummaryLabel').replace('{years}', String(Math.round(result.months.length / 12)))}</Text>

              {/* 🎯 Target Monthly Goal — always visible, prominent */}
              <View style={{
                backgroundColor: result.goalReachedMonth ? "rgba(34,197,94,0.12)" : "rgba(30,58,95,0.6)",
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: result.goalReachedMonth ? "#22c55e" : "#334155",
              }}>
                <Text style={{ color: "#f59e0b", fontSize: 11, fontWeight: "bold", letterSpacing: 0.5, marginBottom: 4 }}>
                  {t(language, 'targetMonthlyGoal')}
                </Text>
                <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 6 }}>
                  {fmt(numVal(goal))}
                </Text>
                {result.goalReachedMonth ? (
                  <Text style={{ color: "#22c55e", fontSize: 13, fontWeight: "bold" }}>
                    {t(language, 'goalReachedText')
                      .replace('{month}', String(result.goalReachedMonth))
                      .replace('{duration}', formatGoalDuration(result.goalReachedMonth, language))}
                  </Text>
                ) : (
                  <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                    {t(language, 'goalNotReachedText').replace('{amount}', fmt(result.maxMonthlyOut))}
                  </Text>
                )}
              </View>

              {/* ── VIP Opportunity Nudge ── */}
              {vipShadow && (
                <View style={{ backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: "#f59e0b" }}>
                  <Text style={{ color: "#f59e0b", fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>
                    {t(language, 'stratVipNudgeTitle')}
                  </Text>
                  <Text style={{ color: "#fbbf24", fontSize: 14, fontWeight: "bold", marginBottom: 4, lineHeight: 20 }}>
                    {t(language, 'stratVipNudgeDesc')
                      .replace('{currentResult}', fmt(result.maxMonthlyOut))
                      .replace('{vipResult}', fmt(vipShadow.maxMonthlyOut))
                      .replace('{diff}', fmt(vipShadow.maxMonthlyOut - result.maxMonthlyOut))}
                  </Text>
                  {vipRecoveryMonth && (
                    <Text style={{ color: "#94a3b8", fontSize: 11, lineHeight: 16, marginBottom: 10 }}>
                      {t(language, 'stratVipPotential').replace('{month}', String(vipRecoveryMonth))}
                    </Text>
                  )}
                  <TouchableOpacity style={{ backgroundColor: "#f59e0b", borderRadius: 8, paddingVertical: 10, alignItems: "center" }} onPress={handleCompareWithVip} activeOpacity={0.85}>
                    <Text style={{ color: "#0f172a", fontSize: 13, fontWeight: "bold" }}>{t(language, 'stratCompareVip')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {(() => {
                const vipFee = result.totalVipCost;
                const displayTotalIn = result.totalIn + vipFee;
                const displayNetResult = result.netResult - vipFee;
                const displayNetPct = displayTotalIn > 0 ? (displayNetResult / displayTotalIn * 100).toFixed(1) : '0.0';
                return (
              <View style={S.summaryGrid}>
                {/* Total Purchase Amount — 3-line breakdown */}
                <View style={{ backgroundColor: 'rgba(245,158,11,0.09)', borderRadius: 8, padding: 9, width: '48%', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.38)' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>{t(language, 'totalIn')}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>{t(language, 'assetCapital')}</Text>
                    <Text style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 'bold' }}>{fmt(result.totalIn)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>{t(language, 'vipAccessFeeLabel')}</Text>
                    <Text style={{ color: vipFee > 0 ? '#f87171' : '#64748b', fontSize: 11, fontWeight: 'bold' }}>
                      {vipFee > 0 ? `-${fmt(vipFee)}` : '—'}
                    </Text>
                  </View>
                  <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(245,158,11,0.35)', paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'totalOutlayLabel')}</Text>
                    <Text style={{ color: '#f59e0b', fontSize: 14, fontWeight: 'bold' }}>{fmt(displayTotalIn)}</Text>
                  </View>
                </View>
                <SummaryItem label={t(language,'totalOut')} value={fmt(result.totalOut)} green={result.totalOut > 0} />
                <View style={{ backgroundColor: 'rgba(245,158,11,0.09)', borderRadius: 8, padding: 8, width: '48%', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.38)' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t(language, 'finalBalance')}</Text>
                  <Text style={{ color: '#f59e0b', fontSize: 16, fontWeight: 'bold' }}>{fmt(result.finalCap)}</Text>
                </View>
                <SummaryItem
                  label={t(language, 'netResult')}
                  value={`${fmt(displayNetResult)} (${displayNetPct}%)`}
                  green={displayNetResult >= 0}
                  red={displayNetResult < 0}
                />
                <SummaryItem label={t(language, 'availableRebates')} value={fmt(result.finalWallet + result.finalVipPot + result.finalCompPot)} />
                <SummaryItem label={t(language, 'maxMonthlyDiscountLabel').replace('{month}', String(result.maxMonthlyOutMonth))} value={fmt(result.maxMonthlyOut)} green />
                <SummaryItem
                  label={t(language,'rocBreakEven')}
                  value={result.rocMonth
                    ? `M${result.rocMonth} (Y${Math.ceil(result.rocMonth / 12)}-M${((result.rocMonth - 1) % 12) + 1})`
                    : t(language,'waiting')}
                />
              </View>
                );
              })()}

              {/* ── Brand Authority Row ── */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ backgroundColor: 'rgba(51,197,255,0.1)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(51,197,255,0.28)' }}>
                    <Text style={{ color: '#33C5FF', fontSize: 9, fontWeight: 'bold' }}>{t(language, 'giaVerifiedBadge')}</Text>
                  </View>
                  <Text style={{ color: '#334155', fontSize: 9 }}>{t(language, 'dataSecure')}</Text>
                </View>
                <Text style={{ color: 'rgba(245,158,11,0.65)', fontSize: 9, fontWeight: 'bold', fontStyle: 'italic' }}>{t(language, 'integrityBadge')}</Text>
              </View>
              {/* ── Version stamp ── */}
              <Text style={{ color: '#1e3a5f', fontSize: 8, textAlign: 'right', marginBottom: 4 }}>
                {`v2.1 · ${new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })}`}
              </Text>

              {(() => {
                const spTiers = [
                  { threshold: 1000,   name: 'SP2', rate: 2.45 },
                  { threshold: 2500,   name: 'SP3', rate: 2.7  },
                  { threshold: 5000,   name: 'SP4', rate: 3.0  },
                  { threshold: 10000,  name: 'SP5', rate: 3.1  },
                  { threshold: 50000,  name: 'SP6', rate: 3.2  },
                  { threshold: 100000, name: 'SP7', rate: 3.3  },
                ];
                const nextSp = spTiers.find(t => result.finalCap < t.threshold && result.finalCap >= t.threshold * 0.8);
                const spHint = nextSp
                  ? `Add ${fmt(nextSp.threshold - result.finalCap)} to unlock ${nextSp.name} (${nextSp.rate}% base/mo)`
                  : null;
                const vipCountdownHint = vipEnabled && result.finalVipPot < 1000
                  ? t(language, 'vipRenewalHint')
                      .replace('{months}', String(Math.ceil((1000 - result.finalVipPot) / 84)))
                      .replace('{amount}', fmt(result.finalVipPot))
                  : null;
                const withdrawalHint = result.totalOut > 0 && result.finalCap <= (parseFloat(startAmount) || 0)
                  ? t(language, 'withdrawalHintText')
                  : null;
                if (!spHint && !vipCountdownHint && !withdrawalHint) return null;
                return (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    {spHint && (
                      <View style={{ backgroundColor: 'rgba(251,191,36,0.88)', borderRadius: 6, padding: 8, borderLeftWidth: 2, borderLeftColor: '#92400e' }}>
                        <Text style={{ color: '#1e293b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'spUpgradeNearby')} {spHint}</Text>
                      </View>
                    )}
                    {vipCountdownHint && (
                      <View style={{ backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 6, padding: 8, borderLeftWidth: 2, borderLeftColor: '#a78bfa' }}>
                        <Text style={{ color: '#a78bfa', fontSize: 11 }}>{t(language, 'vipRenewalLabel')} {vipCountdownHint}</Text>
                      </View>
                    )}
                    {withdrawalHint && (
                      <View style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 6, padding: 8, borderLeftWidth: 2, borderLeftColor: '#f87171' }}>
                        <Text style={{ color: '#f87171', fontSize: 11 }}>⚠ {withdrawalHint}</Text>
                      </View>
                    )}
                  </View>
                );
              })()}
            </View>

            {/* Buyback Guarantee Note */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 10, marginTop: -8, marginBottom: 4 }}>
              <Text style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", fontStyle: "italic" }}>
                {t(language, 'buybackNote')}
              </Text>
            </View>

            {/* Company Margin Mechanics — toggle */}
            <TouchableOpacity
              onPress={() => setShowMarginMechanics(v => !v)}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                marginHorizontal: 16, marginBottom: showMarginMechanics ? 0 : 8, marginTop: 4,
                paddingHorizontal: 14, paddingVertical: 10,
                backgroundColor: '#0D0D0D', borderRadius: 10,
                borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)',
              }}
            >
              <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.2 }}>
                {t(language, 'companyMarginTitle')}
              </Text>
              <Text style={{ color: 'rgba(212,175,55,0.7)', fontSize: 16 }}>
                {showMarginMechanics ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {showMarginMechanics && <CompanyMarginMechanics language={language} />}

            {/* Monthly / Yearly Table */}
            <View style={[S.card, { overflow: 'visible', flexGrow: 1, flexShrink: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text style={[S.sectionLabel, { flex: 1, marginBottom: 0 }]}>{t(language,'monthlyBreakdown').toUpperCase()}</Text>
                {(() => {
                  const bannerCount = result?.months.filter(m => m.maturedSum > 0).length ?? 0;
                  return bannerCount > 0 ? (
                    <TouchableOpacity
                      onPress={() => setAllBannersHidden(v => !v)}
                      style={{ backgroundColor: allBannersHidden ? '#1e293b' : 'rgba(34,197,94,0.12)', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: allBannersHidden ? '#334155' : '#22c55e', flexDirection: 'row', alignItems: 'center', gap: 5 }}
                    >
                      <Text style={{ color: allBannersHidden ? '#64748b' : '#22c55e', fontSize: 10, fontWeight: 'bold' }}>
                        {allBannersHidden ? t(language, 'showBanners') : t(language, 'hideBanners')}
                      </Text>
                      <View style={{ backgroundColor: allBannersHidden ? '#334155' : '#22c55e', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                        <Text style={{ color: allBannersHidden ? '#94a3b8' : '#052e16', fontSize: 9, fontWeight: 'bold' }}>{bannerCount}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null;
                })()}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: viewMode === 'monthly' ? '#f59e0b' : '#64748b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'monthly')}</Text>
                  <Switch
                    value={viewMode === 'yearly'}
                    onValueChange={v => setViewMode(v ? 'yearly' : 'monthly')}
                    trackColor={{ false: '#334155', true: '#f59e0b' }}
                    thumbColor="#fff"
                  />
                  <Text style={{ color: viewMode === 'yearly' ? '#f59e0b' : '#64748b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'yearly')}</Text>
                </View>
              </View>
              {viewMode === 'yearly' ? (
                <YearlySummary result={result} language={language} />
              ) : (
                /* overflow:visible so sticky child can escape the card's border-radius stacking context */
                <View style={{ overflow: 'visible' }}>
                  {/* Sticky header — position:sticky pins it to the page scroll top */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    ref={tableHeaderScrollRef}
                    style={Platform.select({
                      web: { position: 'sticky' as any, top: 0, zIndex: 10, backgroundColor: '#1a2744' } as any,
                      default: { backgroundColor: '#1a2744', zIndex: 10 },
                    })}
                  >
                    <View style={[S.tableHead, { width: TW }]}>
                      {([
                        { tKey: "monthHeader",   w: cw.num      },
                        { tKey: "withdrawal",    w: cw.avail    },
                        { tKey: "discountApplied", w: cw.disc   },
                        { tKey: "startDiamonds", w: cw.diamonds },
                        { tKey: "vipStatus",     w: cw.status   },
                        { tKey: "activeCompAbbr", w: cw.comp    },
                        { tKey: "planPrefix",    w: cw.plan     },
                        { tKey: "outPercentage", w: cw.strat    },
                        { tKey: "deposit",       w: cw.monthly  },
                        { tKey: "finalBalance",  w: cw.total    },
                      ]).map(h => (
                        <Text key={h.tKey} style={[S.th, { width: h.w }]}>{t(language, h.tKey)}</Text>
                      ))}
                    </View>
                  </ScrollView>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator
                    ref={tableBodyScrollRef}
                    onScroll={(e) => {
                      tableHeaderScrollRef.current?.scrollTo({ x: e.nativeEvent.contentOffset.x, animated: false });
                    }}
                    scrollEventThrottle={16}
                    style={{ width: '100%' as any }}
                    contentContainerStyle={{ minWidth: TW }}
                  >
                  <View style={{ width: TW }}>
                    {result.months.map((row) => {
                      const isLastOfYear = row.month % 12 === 0;
                      let yearSummary = null;
                      if (isLastOfYear) {
                        const yearStart = row.month - 11;
                        const yearMonths = result.months.slice(yearStart - 1, row.month);
                        const yearPayout  = yearMonths.reduce((s, r) => s + r.withdrawal, 0);
                        const yearRebates = yearMonths.reduce((s, r) => s + r.grossYield, 0);
                        const yearDeposits = yearMonths.reduce((s, r) => s + r.deposit, 0);
                        yearSummary = (
                          <View style={{ backgroundColor: "#0f1e35", flexDirection: "row", paddingVertical: 6, paddingHorizontal: 4, borderTopWidth: 1, borderBottomWidth: 2, borderColor: "#f59e0b" }}>
                            <Text style={{ width: cw.num,      color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>Y{row.yearNumber}</Text>
                            <Text style={{ width: cw.avail,    color: "#facc15", fontSize: 10, fontWeight: "bold" }}>{fmt(yearPayout)}</Text>
                            <Text style={{ width: cw.disc,     color: "#4ade80", fontSize: 10, fontWeight: "bold" }}>{fmt(yearRebates)}</Text>
                            <Text style={{ width: cw.diamonds, color: "#e2e8f0", fontSize: 10 }}>{fmt(row.capEnd)}</Text>
                            <Text style={{ width: cw.status,   color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>{t(language, 'yearTotal').replace('{year}', String(row.yearNumber))}</Text>
                            <Text style={{ width: cw.comp,     color: "#94a3b8", fontSize: 10 }}>—</Text>
                            <Text style={{ width: cw.plan,     color: "#94a3b8", fontSize: 10 }}>—</Text>
                            <Text style={{ width: cw.strat,    color: "#94a3b8", fontSize: 10 }}>—</Text>
                            <Text style={{ width: cw.monthly,  color: "#60a5fa", fontSize: 10 }}>{fmt(yearDeposits)}</Text>
                            <Text style={{ width: cw.total,    color: "#4ade80", fontSize: 10, fontWeight: "bold" }}>{fmt(row.capEnd)}</Text>
                          </View>
                        );
                      }
                      return (
                        <React.Fragment key={row.month}>
                          {row.isYearStart && (
                            <View style={S.yearRow}>
                              <Text style={S.yearText}>── {t(language, 'year')} {row.yearNumber} ──</Text>
                            </View>
                          )}
                          {row.isSpUpgrade && (
                            <View style={{ backgroundColor: "rgba(245,158,11,0.15)", flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 4, borderLeftWidth: 2, borderLeftColor: "#f59e0b" }}>
                              <Text style={{ color: "#f59e0b", fontSize: 10, fontWeight: "bold" }}>{t(language, 'spUpgradeRow').replace('{plan}', row.spName).replace('{rate}', String(row.spBaseRate))}</Text>
                            </View>
                          )}
                          {row.isGoalReached && (
                            <View style={{ backgroundColor: "rgba(34,197,94,0.15)", flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 4, borderLeftWidth: 2, borderLeftColor: "#22c55e" }}>
                              <Text style={{ color: "#22c55e", fontSize: 10, fontWeight: "bold" }}>{t(language, 'goalReachedInTable').replace('{month}', String(row.month))}</Text>
                            </View>
                          )}
                          {row.isNewVip && !row.isVipSelfFunded && (
                            <View style={{ backgroundColor: row.isManualVip ? "rgba(51,197,255,0.15)" : "rgba(245,158,11,0.18)", flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 4, borderLeftWidth: 2, borderLeftColor: row.isManualVip ? "#33C5FF" : "#f59e0b" }}>
                              <Text style={{ color: row.isManualVip ? "#33C5FF" : "#f59e0b", fontSize: 10, fontWeight: "bold" }}>
                                {row.isManualVip
                                  ? t(language, 'manualVipBanner').replace('{month}', String(row.month))
                                  : t(language, 'autoVipBanner').replace('{month}', String(row.month))}
                              </Text>
                            </View>
                          )}
                          {/* Maturity banner — shown in the month contracts actually expire */}
                          {row.maturedSum > 0 && !allBannersHidden && !hiddenMaturityMonths.has(row.month) && (() => {
                            const freed = Math.round(row.maturedSum);
                            const alreadySet = getMonthData(row.month).opn === freed;
                            const bannerKey = row.maturedCount > 1 ? 'contractsMatured' : 'contractMatured';
                            return (
                              <View style={{ width: TW, backgroundColor: "rgba(34,197,94,0.12)", flexDirection: "row", alignItems: "center", paddingVertical: 5, paddingHorizontal: 8, borderLeftWidth: 3, borderLeftColor: "#22c55e", gap: 6 }}>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                  <Text style={{ color: "#22c55e", fontSize: 10, fontWeight: "bold" }} numberOfLines={1}>
                                    {t(language, bannerKey).replace('{month}', String(row.month)).replace('{amount}', fmt(freed))}
                                  </Text>
                                  <Text style={{ color: "#64748b", fontSize: 9, marginTop: 1 }} numberOfLines={1}>
                                    {t(language, 'diamondDeliveryHint')}
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() => {
                                    const newOpn = alreadySet ? 0 : freed;
                                    const newMonthData = {
                                      ...monthData,
                                      [row.month]: { ...(monthData[row.month] ?? { stort: 0, opn: 0, opnP: 0, comp: 100 }), opn: newOpn },
                                    };
                                    setMonthData(newMonthData);
                                    setResult(runCalculation({
                                      startAmount: getNetDeposit(numVal(startAmount, 3000)),
                                      years: numVal(years, 5),
                                      goal: numVal(goal, 3500),
                                      vipEnabled,
                                      manualVip,
                                      monthData: newMonthData,
                                    }));
                                  }}
                                  style={{ backgroundColor: alreadySet ? "#78350f" : "#166534", borderRadius: 5, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: alreadySet ? "#f59e0b" : "#22c55e", flexShrink: 0 }}
                                >
                                  <Text style={{ color: alreadySet ? "#fef3c7" : "#bbf7d0", fontSize: 10, fontWeight: "bold" }}>
                                    {alreadySet ? t(language, 'undoTakeOut') : t(language, 'takeOut')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })()}
                          <TableRow row={row} mData={getMonthData(row.month)} onUpdate={setMonthField} cw={cw} />
                          {yearSummary}
                        </React.Fragment>
                      );
                    })}
                  </View>
                  </ScrollView>
                </View>
              )}
            </View>
          {/* Disclaimer — shown only after results are visible */}
          <DisclaimerInline />
        </>
        )}

        <View style={{ height: 20 }} />
        <DisclaimerFooter />
      </ScrollView>

      {/* ── Extra Options Help Modal ── */}
      <Modal visible={showOptionsHelp} transparent animationType="slide" onRequestClose={() => setShowOptionsHelp(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: '#1e293b', maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{optionsHelp.modalTitle}</Text>
              <TouchableOpacity onPress={() => setShowOptionsHelp(false)}>
                <Text style={{ color: '#64748b', fontSize: 22, lineHeight: 26 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
              {optionsHelp.items.map(item => (
                <View key={item.title} style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: item.color }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                    <Text style={{ color: item.color, fontSize: 14, fontWeight: 'bold' }}>{item.title}</Text>
                  </View>
                  <Text style={{ color: '#94a3b8', fontSize: 13, lineHeight: 20 }}>{item.body}</Text>
                </View>
              ))}
              <View style={{ backgroundColor: 'rgba(253,224,71,0.08)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FDE047' }}>
                <Text style={{ color: '#FDE047', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>{optionsHelp.tipTitle}</Text>
                <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 18 }}>{optionsHelp.tipBody}</Text>
              </View>
              <View style={{ height: 8 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Saved Clients Modal ── */}
      <Modal visible={showClientsModal} transparent animationType="slide" onRequestClose={() => { setShowClientsModal(false); setClientSearch(""); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: '#1e293b', maxHeight: '75%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>📂 Saved Clients</Text>
              <TouchableOpacity onPress={() => { setShowClientsModal(false); setClientSearch(""); }}>
                <Text style={{ color: '#64748b', fontSize: 22, lineHeight: 26 }}>✕</Text>
              </TouchableOpacity>
            </View>
            {savedClients.length > 0 && (
              <TextInput
                style={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: 8, padding: 10, marginHorizontal: 12, marginTop: 12, marginBottom: 4, fontSize: 13, borderWidth: 1, borderColor: '#334155' }}
                value={clientSearch}
                onChangeText={setClientSearch}
                placeholder="Search clients..."
                placeholderTextColor="#475569"
                clearButtonMode="while-editing"
              />
            )}
            {savedClients.length === 0 ? (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Text style={{ color: '#475569', fontSize: 14 }}>No saved clients yet.</Text>
                <Text style={{ color: '#334155', fontSize: 12, marginTop: 4 }}>Enter a client name and tap 💾 to save.</Text>
              </View>
            ) : (
              <FlatList
                data={savedClients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))}
                keyExtractor={c => c.id}
                contentContainerStyle={{ padding: 12 }}
                ListEmptyComponent={<View style={{ padding: 24, alignItems: 'center' }}><Text style={{ color: '#475569', fontSize: 13 }}>No clients match "{clientSearch}"</Text></View>}
                renderItem={({ item }) => {
                  const sp = getSPLevel(getNetDeposit(parseFloat(item.startAmount) || 0));
                  const date = new Date(item.savedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                  return (
                    <TouchableOpacity
                      onPress={() => loadClient(item)}
                      style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 3 }}>{item.name}</Text>
                        <Text style={{ color: '#64748b', fontSize: 11 }}>{sp.name}{item.vipEnabled ? ' +VIP' : ''} · ${parseFloat(item.startAmount).toLocaleString()} · {item.years}y</Text>
                        <Text style={{ color: '#334155', fontSize: 10, marginTop: 2 }}>{date}</Text>
                      </View>
                      <TouchableOpacity onPress={() => deleteClient(item.id)} style={{ padding: 8 }}>
                        <Text style={{ fontSize: 16 }}>🗑️</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function ActiveCompoundingCell({ grossYield, withdrawal, vipFee = 0, colW = 72 }: { grossYield: number; withdrawal: number; vipFee?: number; colW?: number }) {
  const pct = grossYield > 0
    ? Math.max(0, Math.round((grossYield - withdrawal - vipFee) / grossYield * 100))
    : 100;
  const color = pct === 100 ? '#4ade80' : pct >= 75 ? '#a3e635' : pct >= 50 ? '#fbbf24' : pct >= 25 ? '#f97316' : '#f87171';
  const barW = Math.max(20, Math.round(colW * 0.55));
  const fillW = Math.max(0, Math.round((pct / 100) * barW));
  return (
    <View style={{ width: colW, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 }}>
      <Text style={{ color, fontWeight: 'bold', fontSize: 11 }}>{pct}%</Text>
      <View style={{ width: barW, height: 3, backgroundColor: '#1e3a5f', borderRadius: 2, marginTop: 2 }}>
        <View style={{ width: fillW, height: 3, backgroundColor: color, borderRadius: 2 }} />
      </View>
    </View>
  );
}

// colWidth kept as no-op; header now uses inline cw widths

function getRowStyle(row: MonthResult) {
  if (row.isNewVip && !row.isVipSelfFunded) return S.tableRowManualVip;
  if (row.vipStatus && row.vipStatus.includes('VIP')) return S.tableRowVip;
  if (row.withdrawal > 0) return S.tableRowWithdrawal;
  if (row.capEnd > row.capStart) return S.tableRowGrowing;
  return row.month % 2 === 0 ? S.tableRowAlt : S.tableRow;
}

type CW = { num: number; avail: number; disc: number; diamonds: number; status: number; comp: number; plan: number; strat: number; monthly: number; total: number };

function TableRow({ row, mData, onUpdate, cw }: { row: MonthResult; mData: MonthData; onUpdate: (m: number, f: keyof MonthData, v: number) => void; cw: CW }) {
  const rowStyle = getRowStyle(row);
  return (
    <View style={[S.tableRow, rowStyle]}>
      {/* # */}
      <View style={{ width: cw.num, alignItems: 'center' }}>
        <Text style={[S.td, { color: "#94a3b8" }]}>{row.month}</Text>
        {row.isYearStart && (
          <Text style={{ color: "#f59e0b", fontSize: 7, fontWeight: "bold" }}>Y{row.yearNumber}</Text>
        )}
      </View>
      {/* Available Value */}
      <View style={{ width: cw.avail }}>
        <Text style={[S.td, { color: "#facc15", fontWeight: "bold" }]}>{fmt(row.withdrawal)}</Text>
      </View>
      {/* Discount Applied */}
      <View style={{ width: cw.disc, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[S.td, { color: "#4ade80" }]}>{fmt(row.grossYield)}</Text>
        <Text style={{ color: row.isVipActive ? "#fbbf24" : "#64748b", fontSize: 8 }}>
          {getSPLevel(row.grossYield).name}{row.isVipActive ? ' +VIP' : ''}
        </Text>
      </View>
      {/* Diamonds */}
      <Text style={[S.td, { width: cw.diamonds, color: "#e2e8f0" }]}>{fmt(row.capStart)}</Text>
      {/* VIP Status */}
      <View style={{ width: cw.status, alignItems: "center", justifyContent: "center", gap: 2 }}>
        {row.vipStatus ? (
          <View style={{ backgroundColor: row.isNewVip ? "#7f1d1d" : "#1e3a5f", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: row.isNewVip ? "#ef4444" : "#3b82f6" }}>
            <Text style={{ color: row.isNewVip ? "#fca5a5" : "#fde68a", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>{row.vipStatus}</Text>
          </View>
        ) : (
          <Text style={{ color: "#334155", fontSize: 9 }}>—</Text>
        )}
        {row.vipPot > 0 ? (
          <Text style={{ color: "#fbbf24", fontSize: 8, textAlign: "center" }}>💰 {fmt(row.vipPot)}</Text>
        ) : null}
      </View>
      {/* Active Compounding */}
      <ActiveCompoundingCell grossYield={row.grossYield} withdrawal={row.withdrawal} vipFee={row.isVipActive ? 84 : 0} colW={cw.comp} />
      {/* Plan */}
      <View style={{ width: cw.plan, alignItems: 'center' }}>
        <Text style={[S.td, { color: row.isNewVip ? "#ef4444" : "#22c55e", fontSize: 10, fontWeight: "bold" }]}>
          {row.spName} ({row.totalRate.toFixed(1)}%)
        </Text>
      </View>
      {/* Strategy Discount % */}
      <View style={{ width: cw.strat, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TextInput
          style={[S.tdInput, { width: Math.round(cw.strat * 0.72), color: "#f59e0b" }]}
          value={String(mData.opnP)}
          onChangeText={v => onUpdate(row.month, "opnP", parseFloat(v) || 0)}
          keyboardType="numeric"
        />
        <Text style={{ color: '#f59e0b', fontSize: 11, marginLeft: 2 }}>%</Text>
      </View>
      {/* Monthly Purchase */}
      <View style={{ width: cw.monthly, alignItems: 'center' }}>
        <TextInput
          style={[S.tdInput, { width: Math.round(cw.monthly * 0.85), color: "#60a5fa" }]}
          value={String(mData.stort)}
          onChangeText={v => onUpdate(row.month, "stort", parseFloat(v) || 0)}
          keyboardType="numeric"
        />
      </View>
      {/* Total Assets */}
      <Text style={[S.td, { width: cw.total, color: row.capEnd >= row.capStart ? "#4ade80" : "#f87171", fontWeight: "bold" }]}>{fmt(row.capEnd)}</Text>
    </View>
  );
}

function YearlySummary({ result, language }: { result: ReturnType<typeof runCalculation>; language: Language }) {
  const numYears = Math.ceil(result.months.length / 12);
  const rows = Array.from({ length: numYears }, (_, i) => {
    const y = i + 1;
    const yearMonths = result.months.filter(m => m.yearNumber === y);
    const last = yearMonths[yearMonths.length - 1];
    const selfFunded = yearMonths.some(m => m.isVipSelfFunded);
    const firstActivation = yearMonths.some(m => m.isNewVip && !m.isVipSelfFunded);
    return {
      year: y,
      rebatePayout: yearMonths.reduce((s, m) => s + m.withdrawal, 0),
      rebate: yearMonths.reduce((s, m) => s + m.grossYield, 0),
      deposits: yearMonths.reduce((s, m) => s + m.deposit, 0),
      selfFunded,
      firstActivation,
      total: last.capEnd,
    };
  });
  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#334155', paddingHorizontal: 4 }}>
        <Text style={{ width: 36, color: '#f59e0b', fontSize: 11, fontWeight: 'bold' }}>{t(language, 'year')}</Text>
        <Text style={{ flex: 1.2, color: '#facc15', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{t(language, 'withdrawal')}</Text>
        <Text style={{ flex: 1, color: '#4ade80', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{t(language, 'annualDiscountGained')}</Text>
        <Text style={{ flex: 1, color: '#60a5fa', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{t(language, 'annualAssetGrowth')}</Text>
        <Text style={{ flex: 1, color: '#94a3b8', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{t(language, 'vipStatus')}</Text>
        <Text style={{ flex: 1, color: '#4ade80', fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{t(language, 'finalBalance')}</Text>
      </View>
      {rows.map(r => (
        <View key={r.year} style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b', alignItems: 'center', paddingHorizontal: 4 }}>
          <Text style={{ width: 36, color: '#f59e0b', fontSize: 13, fontWeight: 'bold' }}>Y{r.year}</Text>
          <Text style={{ flex: 1.2, color: '#facc15', fontSize: 14, fontWeight: 'bold', textAlign: 'right' }}>{fmt(r.rebatePayout)}</Text>
          <Text style={{ flex: 1, color: '#4ade80', fontSize: 13, textAlign: 'right' }}>{fmt(r.rebate)}</Text>
          <Text style={{ flex: 1, color: r.deposits > 0 ? '#60a5fa' : '#475569', fontSize: 13, textAlign: 'right' }}>{r.deposits > 0 ? fmt(r.deposits) : '—'}</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {r.selfFunded ? (
              <View style={{ backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: '#22c55e' }}>
                <Text style={{ color: '#22c55e', fontSize: 8, fontWeight: 'bold' }}>{t(language, 'vipSelfFunded')}</Text>
              </View>
            ) : r.firstActivation ? (
              <View style={{ backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: '#ef4444' }}>
                <Text style={{ color: '#fca5a5', fontSize: 8, fontWeight: 'bold' }}>{t(language, 'newVip')}</Text>
              </View>
            ) : (
              <Text style={{ color: '#64748b', fontSize: 10 }}>—</Text>
            )}
          </View>
          <Text style={{ flex: 1, color: '#4ade80', fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>{fmt(r.total)}</Text>
        </View>
      ))}
    </View>
  );
}

function CompanyMarginMechanics({ language }: { language: Language }) {
  const GOLD       = '#D4AF37';
  const GOLD_DIM   = 'rgba(212,175,55,0.5)';
  const GOLD_GLOW  = 'rgba(212,175,55,0.18)';
  const GOLD_FAINT = 'rgba(212,175,55,0.07)';
  const ONYX       = '#0D0D0D';
  const ff         = Platform.OS === 'web' ? 'Trebuchet MS, sans-serif' : undefined;

  const flowSteps = [
    { icon: '⛏',  topLine: t(language, 'directRoughTopLine'), label: t(language, 'sourcingLabel'),  sub: t(language, 'ofSalePrice'),    value: '~10%', highlight: true  },
    { icon: '💎', topLine: t(language, 'internalCutTopLine'), label: t(language, 'giaCertLabel'),   sub: t(language, 'processingCost'), value: '~15%', highlight: false },
    { icon: '💼',  topLine: t(language, 'b2bGlobalTopLine'),   label: t(language, 'b2bSaleCardLabel'), sub: t(language, 'realizedValue'), value: '100%', highlight: true  },
  ];

  return (
    <View style={{ backgroundColor: ONYX, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: GOLD_DIM, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <View style={{ borderBottomWidth: 0.5, borderBottomColor: GOLD, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: GOLD, fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5, fontFamily: ff, flex: 1 }}>
          {t(language, 'companyMarginTitle')}
        </Text>
        <Text style={{ color: GOLD_DIM, fontSize: 11, fontFamily: ff }}>{t(language, 'b2bSupplyChainLabel')}</Text>
      </View>

      <View style={{ padding: 16 }}>

        {/* ── 1. Side-by-side comparison ── */}
        <View style={{ flexDirection: 'row', alignItems: 'stretch', marginBottom: 18, gap: 8 }}>

          {/* LEFT: Traditional Chain */}
          <View style={{ flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.04)', overflow: 'hidden' }}>
            <View style={{ backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 8, paddingVertical: 6 }}>
              <Text style={{ color: '#f87171', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.8, textAlign: 'center', fontFamily: ff }}>
                {t(language, 'traditionalMarket').toUpperCase()}
              </Text>
            </View>
            <View style={{ padding: 10, position: 'relative', minHeight: 76 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, opacity: 0.36 }}>
                {[
                  { icon: '🏛️', label: t(language, 'nodeDealer') },
                  { icon: '📈', label: t(language, 'nodeExchange') },
                  { icon: '🏭', label: t(language, 'nodeWholesale') },
                  { icon: '🚛', label: t(language, 'nodeDist') },
                  { icon: '🏪', label: t(language, 'nodeRetail') },
                  { icon: '🏬', label: t(language, 'nodeStore') },
                  { icon: '👤', label: t(language, 'nodeClient') },
                ].map((node, i) => (
                  <View key={i} style={{ alignItems: 'center', width: 30 }}>
                    <Text style={{ fontSize: 15 }}>{node.icon}</Text>
                    <Text style={{ color: '#64748b', fontSize: 7, textAlign: 'center', fontFamily: ff }}>{node.label}</Text>
                  </View>
                ))}
              </View>
              {/* Red dashed overlay */}
              <View style={[{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(239,68,68,0.07)',
                alignItems: 'center', justifyContent: 'center', borderRadius: 8,
              }, Platform.OS === 'web' ? { borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)' } as any : { borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)' }]}>
                <Text style={{ color: '#f87171', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                <Text style={{ color: '#f87171', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, fontFamily: ff, textAlign: 'center', lineHeight: 14, marginTop: 1 }}>
                  700%{'\n'}{t(language, 'priceBloatLabel')}
                </Text>
              </View>
            </View>
          </View>

          {/* VS divider */}
          <View style={{ width: 26, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 1, flex: 1, backgroundColor: GOLD_DIM }} />
            <Text style={{ color: GOLD, fontSize: 10, fontWeight: 'bold', fontFamily: ff, paddingVertical: 4 }}>VS</Text>
            <View style={{ width: 1, flex: 1, backgroundColor: GOLD_DIM }} />
          </View>

          {/* RIGHT: Direct model quick view */}
          <View style={{ flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: GOLD, backgroundColor: GOLD_FAINT, overflow: 'hidden' }}>
            <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 8, paddingVertical: 6 }}>
              <Text style={{ color: GOLD, fontSize: 10, fontWeight: 'bold', letterSpacing: 0.8, textAlign: 'center', fontFamily: ff }}>
                {t(language, 'ourDirectModel')}
              </Text>
            </View>
            <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', flex: 1 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>⛏</Text>
                <Text style={{ color: GOLD_DIM, fontSize: 8, fontFamily: ff }}>{t(language, 'roughLabel')}</Text>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: ff }}>~10%</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={[{ backgroundColor: '#22c55e', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, marginBottom: 3 }, Platform.OS === 'web' ? { boxShadow: '0 0 8px rgba(34,197,94,0.5)' } as any : {}]}>
                  <Text style={{ color: '#0f172a', fontSize: 9, fontWeight: 'bold', fontFamily: ff }}>~75%</Text>
                </View>
                <Text style={{ color: '#22c55e', fontSize: 7, fontWeight: 'bold', fontFamily: ff, marginBottom: 2 }}>{t(language, 'netMarginLabel')}</Text>
                <Text style={{ color: GOLD, fontSize: 18 }}>→</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>💼</Text>
                <Text style={{ color: GOLD_DIM, fontSize: 8, fontFamily: ff }}>Business to Business</Text>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: ff }}>100%</Text>
              </View>
            </View>
          </View>

        </View>

        {/* ── 2. Mine-to-Market detailed flow ── */}
        <Text style={{ color: GOLD, fontSize: 12, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 10, fontFamily: ff }}>
          {t(language, 'mineToMarketEff').toUpperCase()}
        </Text>

        {/* 3-step flow — $9K badge on connector before B2B Sale */}
        <View style={{ flexDirection: 'row', alignItems: 'stretch', marginBottom: 12, justifyContent: 'space-between', gap: 6 }}>
          {flowSteps.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                flex: 1, alignItems: 'center',
                backgroundColor: step.highlight ? GOLD_GLOW : GOLD_FAINT,
                borderRadius: 10,
                borderWidth: step.highlight ? 1 : 0.5,
                borderColor: step.highlight ? GOLD : GOLD_DIM,
                paddingHorizontal: 10, paddingVertical: 16,
              }}>
                <Text style={{ fontSize: 29, marginBottom: 6 }}>{step.icon}</Text>
                <Text style={{ color: step.highlight ? GOLD : '#94a3b8', fontSize: 12, fontWeight: 'bold', textAlign: 'center', fontFamily: ff, letterSpacing: 0.3 }}>
                  {step.topLine}
                </Text>
                <Text style={{ color: step.highlight ? GOLD : '#94a3b8', fontSize: 12, fontWeight: 'bold', textAlign: 'center', fontFamily: ff, letterSpacing: 0.3 }}>
                  {step.label}
                </Text>
                <Text style={{ color: GOLD_DIM, fontSize: 11, textAlign: 'center', fontFamily: ff, marginTop: 3 }}>{step.sub}</Text>
                {step.value && (
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 6, textAlign: 'center', fontFamily: ff }}>
                    {step.value}
                  </Text>
                )}
              </View>
              {i < flowSteps.length - 1 && (
                i === 1 ? (
                  <View style={{ alignItems: 'center', paddingHorizontal: 2 }}>
                    <View style={[{ backgroundColor: '#22c55e', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, marginBottom: 1 }, Platform.OS === 'web' ? { boxShadow: '0 0 8px rgba(34,197,94,0.45)' } as any : {}]}>
                      <Text style={{ color: '#0f172a', fontSize: 9, fontWeight: 'bold', fontFamily: ff }}>~75%</Text>
                    </View>
                    <Text style={{ color: '#22c55e', fontSize: 7, fontWeight: 'bold', fontFamily: ff, marginBottom: 2 }}>{t(language, 'marginLabel')}</Text>
                    <Text style={{ color: GOLD, fontSize: 20 }}>›</Text>
                  </View>
                ) : (
                  <Text style={{ color: GOLD, fontSize: 22, paddingHorizontal: 2, alignSelf: 'center' }}>›</Text>
                )
              )}
            </View>
          ))}
        </View>

        {/* Margin Pool equation */}
        <View style={{ backgroundColor: GOLD_GLOW, borderRadius: 8, borderWidth: 0.5, borderColor: GOLD, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: GOLD, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 7, textAlign: 'center', fontFamily: ff }}>
            {t(language, 'operationalMarginPool').toUpperCase()}
          </Text>
          <Text style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 19, textAlign: 'center', fontFamily: ff }}>
            {t(language, 'b2bBulkRevenue')} {t(language, 'minusOpCosts')}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6, fontFamily: ff }}>
            {t(language, 'resultingMarginFunds') + '  '}
            <Text style={{ color: GOLD, fontWeight: 'bold' }}>[1] {t(language, 'operationalProfitLabel')}</Text>
            {'   '}
            <Text style={{ color: '#60a5fa', fontWeight: 'bold' }}>[2] {t(language, 'b2bTradingLabel')}</Text>
            {'   '}
            <Text style={{ color: '#4ade80', fontWeight: 'bold' }}>[3] {t(language, 'customerDiscountsLabel')}</Text>
          </Text>
        </View>

        {/* ── 3. Margin breakdown + Yield bridge ── */}
        <View style={[{ borderRadius: 8, padding: 14, marginBottom: 18 }, Platform.OS === 'web' ? { borderStyle: 'dashed', borderWidth: 1, borderColor: GOLD } as any : { borderWidth: 1, borderColor: GOLD }]}>
          {/* Cost breakdown table */}
          <View style={{ marginBottom: 10 }}>
            {[
              { icon: '⛏', label: t(language, 'roughCostRow'),  pct: '~10%', color: '#94a3b8' },
              { icon: '💎', label: t(language, 'cutGiaRow'),     pct: '~15%', color: '#94a3b8' },
              { icon: '💼', label: t(language, 'b2bSaleRow'),    pct: '100%', color: '#e2e8f0' },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Text style={{ fontSize: 14, width: 22 }}>{row.icon}</Text>
                <Text style={{ color: row.color, fontSize: 12, flex: 1, fontFamily: ff }}>{row.label}</Text>
                <Text style={{ color: row.color, fontSize: 12, fontWeight: 'bold', fontFamily: ff }}>{row.pct}</Text>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: GOLD_DIM, marginVertical: 6 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, width: 22 }}>💰</Text>
              <Text style={{ color: '#22c55e', fontSize: 13, fontWeight: 'bold', flex: 1, fontFamily: ff }}>{t(language, 'netOperatingMargin')}</Text>
              <Text style={{ color: '#22c55e', fontSize: 16, fontWeight: 'bold', fontFamily: ff }}>~75%</Text>
            </View>
          </View>
          {/* Bridge sentence */}
          <View style={{ borderTopWidth: 0.5, borderTopColor: GOLD_DIM, paddingTop: 10 }}>
            <Text style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 19, fontFamily: ff }}>
              {t(language, 'marginBridgeIntro') + ' '}
              <Text style={{ color: GOLD, fontWeight: 'bold' }}>{t(language, 'marginBridgeHL')}</Text>
              {'. ' + t(language, 'marginBridgeOutro')}
            </Text>
          </View>
        </View>

        {/* ── 4. Capital Velocity bold stat (replaces Q1–Q4 bar) ── */}
        <View style={{ backgroundColor: GOLD_GLOW, borderRadius: 10, borderWidth: 1, borderColor: GOLD_DIM, padding: 16, marginBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ alignItems: 'center', minWidth: 60 }}>
            <Text style={{ color: GOLD, fontSize: 42, fontWeight: 'bold', fontFamily: ff, lineHeight: 46 }}>4×</Text>
            <Text style={{ color: GOLD_DIM, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, fontFamily: ff, textAlign: 'center' }}>{t(language, 'annualRotationLabel')}</Text>
          </View>
          <View style={{ width: 1, height: 52, backgroundColor: GOLD_DIM }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 'bold', fontFamily: ff, marginBottom: 4 }}>
              {t(language, 'capitalRotationStat')}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 17, fontFamily: ff }}>
              {t(language, 'capitalRotationDesc')}{' '}
              <Text style={{ color: '#4ade80', fontWeight: 'bold' }}>{t(language, 'consistentRebates')}</Text>
              {' ' + t(language, 'regardlessCycle')}
            </Text>
            <Text style={{ color: GOLD, fontSize: 11, fontWeight: 'bold', fontFamily: ff, marginTop: 5 }}>
              300% minimum — 4 cycles / 12 months
            </Text>
          </View>
        </View>

        {/* ── 5. Transparency Note (fontSize 15) ── */}
        <View style={{ borderTopWidth: 0.5, borderTopColor: GOLD_DIM, paddingTop: 13 }}>
          <Text style={{ color: GOLD, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6, fontFamily: ff }}>
            {t(language, 'transparencyNoteTitle')}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 15, lineHeight: 22, fontStyle: 'italic', fontFamily: ff }}>
            {t(language, 'transparencyNoteBody')}
          </Text>
        </View>

      </View>
    </View>
  );
}

function SummaryItem({ label, value, green, red }: { label: string; value: string; green?: boolean; red?: boolean }) {
  return (
    <View style={S.summaryItem}>
      <Text style={S.summaryLabel}>{label}</Text>
      <Text style={[S.summaryValue, green ? { color: "#4ade80" } : red ? { color: "#f87171" } : { color: "#e2e8f0" }]}>{value}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0f172a", width: '100%' as any },
  content: { padding: 16, width: '100%' as any, ...Platform.select({ web: { width: '96%' as any, maxWidth: 1450, alignSelf: 'center' as const } }) },
  header: { marginBottom: 10, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", marginBottom: 6 },
  backText: { color: "#60a5fa", fontSize: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 2 },
  card: { backgroundColor: "#1e293b", borderRadius: 12, padding: 12, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex1: { flex: 1 },
  label: { color: "#f59e0b", fontSize: 15, fontWeight: "bold", marginBottom: 3, letterSpacing: 0.5 },
  input: { backgroundColor: "#0f172a", color: "#fff", borderRadius: 8, padding: 10, fontSize: 16, borderWidth: 1, borderColor: "#334155" },
  bigInput: { backgroundColor: "#0f172a", color: "#fff", borderRadius: 8, padding: 8, fontSize: 20, fontWeight: "bold", borderWidth: 1, borderColor: "#334155" },
  goalInput: { flex: 1, backgroundColor: "#0f172a", color: "#f59e0b", borderRadius: 8, padding: 8, fontSize: 18, fontWeight: "bold", borderWidth: 1, borderColor: "#f59e0b" },
  resetBtn: { backgroundColor: "#dc2626", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  resetText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  progressBar: { height: 6, backgroundColor: "#0f172a", borderRadius: 3, marginTop: 6, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#22c55e", borderRadius: 3 },
  progressLabel: { color: "#22c55e", fontSize: 13, fontWeight: "bold", marginTop: 3 },
  goalBadge: { backgroundColor: "#22c55e", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3, marginLeft: 8 },
  goalBadgeText: { color: "#0f172a", fontWeight: "bold", fontSize: 13 },
  vipBox: { alignItems: "center", marginLeft: 12 },
  sectionLabel: { color: "#f59e0b", fontSize: 15, fontWeight: "bold", marginBottom: 5, marginTop: 4, letterSpacing: 0.5 },
  bulkRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 },
  bulkInput: { flex: 1, backgroundColor: "#0f172a", color: "#fff", borderRadius: 6, padding: 7, fontSize: 15, borderWidth: 1, borderColor: "#334155" },
  bulkSmall: { width: 64, backgroundColor: "#0f172a", color: "#fff", borderRadius: 6, padding: 7, fontSize: 15, borderWidth: 1, borderColor: "#334155" },
  btnBlue: { backgroundColor: "#33C5FF", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  btnAmber: { backgroundColor: "#f59e0b", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  btnPurple: { backgroundColor: "#a78bfa", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  btnTextDark: { color: "#0f172a", fontWeight: "bold", fontSize: 14 },
  calcBtn: { backgroundColor: "#f59e0b", borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 8 },
  calcText: { color: "#0f172a", fontWeight: "bold", fontSize: 17, letterSpacing: 1 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  summaryItem: { backgroundColor: "#0f172a", borderRadius: 8, padding: 8, width: "48%" },
  summaryLabel: { color: "#94a3b8", fontSize: 13, marginBottom: 2 },
  summaryValue: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  tableHead: { flexDirection: "row", backgroundColor: "#1a2744", paddingVertical: 7, borderBottomWidth: 1.5, borderBottomColor: "#f59e0b" },
  th: { color: "#f59e0b", fontSize: 10, fontWeight: "bold", paddingHorizontal: 3, textAlign: "center", letterSpacing: 0.3 },
  tableRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#0f172a", paddingVertical: 3, backgroundColor: "#0f172a" },
  tableRowAlt: { backgroundColor: "#1a2744" },
  tableRowManualVip: { backgroundColor: "rgba(245,158,11,0.12)", borderLeftWidth: 2, borderLeftColor: "#f59e0b" },
  tableRowVip: { backgroundColor: "#0f1e3d" },
  tableRowWithdrawal: { backgroundColor: "#0f172a" },
  tableRowGrowing: { backgroundColor: "#0a1f0a" },
  td: { fontSize: 13, paddingHorizontal: 3, textAlign: "center", color: "#e2e8f0" },
  tdInput: { backgroundColor: "#0f172a", borderRadius: 3, paddingHorizontal: 3, paddingVertical: 2, fontSize: 13, textAlign: "center", borderWidth: 1, borderColor: "#334155" },
  yearRow: { backgroundColor: "#1e3a5f", paddingVertical: 3, paddingHorizontal: 8 },
  yearText: { color: "#60a5fa", fontSize: 13, fontWeight: "bold", textAlign: "center" },
  appliedBanner: { backgroundColor: "#14532d", borderRadius: 10, padding: 10, marginBottom: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#22c55e" },
  appliedBannerText: { color: "#86efac", fontSize: 15, fontWeight: "600", flex: 1, lineHeight: 22 },
  appliedBannerClose: { color: "#86efac", fontSize: 18, paddingLeft: 8 },
});
