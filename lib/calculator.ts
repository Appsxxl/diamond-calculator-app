// Plan B Calculator Engine
// Exact port of the original HTML calculator logic

export interface MonthData {
  stort: number;   // deposit for this month
  opn: number;     // fixed withdrawal amount
  opnP: number;    // withdrawal percentage of gross yield (0-100)
  comp: number;    // compound reinvestment percentage (0-100, default 100)
}

export interface MonthResult {
  month: number;
  capStart: number;
  deposit: number;
  maxOut: number;         // maximum available withdrawal (b)
  withdrawal: number;     // actual withdrawal taken (rO)
  grossYield: number;     // discount/gross yield (k)
  compoundAdded: number;  // amount added to compPot (nC)
  wallet: number;
  vipPot: number;
  compPot: number;
  capEnd: number;
  spName: string;
  spBaseRate: number;
  totalRate: number;
  vipStatus: string;      // "NEW VIP" | "VIP (Xm)" | ""
  isNewVip: boolean;
  isVipActive: boolean;
  isYearStart: boolean;
  yearNumber: number;
  isSpUpgrade: boolean;
  isGoalReached: boolean;
}

export interface CalculationResult {
  months: MonthResult[];
  totalIn: number;
  totalOut: number;
  totalVipCost: number;
  finalCap: number;
  finalWallet: number;
  finalVipPot: number;
  finalCompPot: number;
  netResult: number;
  rocMonth: number | null;
  maxMonthlyOut: number;
  maxMonthlyOutMonth: number;
  activeWithdrawalMonths: number;
  goalReached: boolean;
  goalProgress: number; // 0-100
  goalReachedMonth: number | null;
}

export interface CalculationParams {
  startAmount: number;
  years: number;
  goal: number;
  vipEnabled: boolean;
  monthData: Record<number, MonthData>;
}

export const SP_LEVELS = [
  { name: 'SP1', minBalance: 0,      maxBalance: 999,      baseRate: 2.2, vipBonus: 3.0, totalWithVip: 5.2 },
  { name: 'SP2', minBalance: 1000,   maxBalance: 2499,     baseRate: 2.45, vipBonus: 3.0, totalWithVip: 5.45 },
  { name: 'SP3', minBalance: 2500,   maxBalance: 4999,     baseRate: 2.7, vipBonus: 3.0, totalWithVip: 5.7 },
  { name: 'SP4', minBalance: 5000,   maxBalance: 9999,     baseRate: 3.0, vipBonus: 3.0, totalWithVip: 6.0 },
  { name: 'SP5', minBalance: 10000,  maxBalance: 49999,    baseRate: 3.1, vipBonus: 3.0, totalWithVip: 6.1 },
  { name: 'SP6', minBalance: 50000,  maxBalance: 99999,    baseRate: 3.2, vipBonus: 3.0, totalWithVip: 6.2 },
  { name: 'SP7', minBalance: 100000, maxBalance: Infinity, baseRate: 3.3, vipBonus: 3.0, totalWithVip: 6.3 },
];

export function getSPLevel(cap: number): { name: string; baseRate: number } {
  if (cap >= 100000) return { name: 'SP7', baseRate: 3.3 };
  if (cap >= 50000)  return { name: 'SP6', baseRate: 3.2 };
  if (cap >= 10000)  return { name: 'SP5', baseRate: 3.1 };
  if (cap >= 5000)   return { name: 'SP4', baseRate: 3.0 };
  if (cap >= 2500)   return { name: 'SP3', baseRate: 2.7 };
  if (cap >= 1000)   return { name: 'SP2', baseRate: 2.45 };
  return { name: 'SP1', baseRate: 2.2 };
}

export function createDefaultMonthData(): MonthData {
  return { stort: 0, opn: 0, opnP: 0, comp: 100 };
}

export function runCalculation(params: CalculationParams): CalculationResult {
  const { startAmount, years, goal, vipEnabled, monthData } = params;
  const maxMonths = years * 12;

  let cap = startAmount;
  let wallet = 0;
  let vipPot = 0;
  let compPot = 0;
  let tIn = startAmount;
  let tOut = 0;
  let tVip = 0;
  let vActive = false;
  let vMnd = 0;
  let activeWithdrawalMonths = 0;
  let runningWithdrawals = 0;
  let rocMonth: number | null = null;
  let finalMaxVal = 0;
  let finalMaxMonth = 0;

  const results: MonthResult[] = [];

  for (let m = 1; m <= maxMonths; m++) {
    const mD: MonthData = monthData[m] ?? createDefaultMonthData();
    const capStart = cap;

    // Step 1: Add deposit
    cap += mD.stort;
    tIn += mD.stort;

    // Step 2: VIP check (exact original logic)
    let vipLabel = '';
    let isNewVip = false;

    if (vipEnabled) {
      if (cap >= 3550 && (!vActive || vMnd <= 0)) {
        const cost = 1000;
        cap -= cost;
        tVip += cost;
        vActive = true;
        vMnd = 12;
        vipLabel = 'NEW VIP';
        isNewVip = true;
      } else if (vActive) {
        vipLabel = `VIP (${vMnd}m)`;
      }
    }

    // Step 3: SP level
    const sp = getSPLevel(cap);

    // Step 4: Total rate
    const totalRate = sp.baseRate + (vActive ? 3.0 : 0);

    // Step 5: Gross yield
    const k = Math.round(cap * (totalRate / 100));

    // Step 6: Monthly VIP cost deducted from yield ($84/month)
    const nV = vActive ? 84 : 0;

    // Step 7: Available to withdraw = (grossYield - vipCost) + wallet
    const b = (k - nV) + wallet;
    if (b > finalMaxVal) {
      finalMaxVal = b;
      finalMaxMonth = m;
    }

    // Step 8: Withdrawal = min(fixedOpn + percentageOfGross, available)
    const pO = k * (mD.opnP / 100);
    const rO = Math.min(mD.opn + pO, b);
    tOut += rO;
    runningWithdrawals += rO;

    // Step 9: ROC check
    if (rocMonth === null && runningWithdrawals >= tIn && tIn > 0) {
      rocMonth = m;
    }
    if (rO > 0) activeWithdrawalMonths++;

    // Step 10: Compound
    const o = b - rO;
    const nC = Math.round(o * (mD.comp / 100));
    wallet = o - nC;
    compPot += nC;

    // Step 11: Add compPot to cap when >= 100
    if (compPot >= 100) {
      cap += compPot;
      compPot = 0;
    }

    // Step 12: VIP countdown
    if (vMnd > 0) vMnd--;
    if (vMnd === 0) vActive = false;

    const prevSpName = results.length > 0 ? results[results.length - 1].spName : sp.name;
    results.push({
      month: m,
      capStart,
      deposit: mD.stort,
      maxOut: b,
      withdrawal: rO,
      grossYield: k,
      compoundAdded: nC,
      wallet,
      vipPot,
      compPot,
      capEnd: cap,
      spName: sp.name,
      spBaseRate: sp.baseRate,
      totalRate,
      vipStatus: vipLabel,
      isNewVip,
      isVipActive: vActive,
      isYearStart: m > 1 && (m - 1) % 12 === 0,
      yearNumber: Math.ceil(m / 12),
      isSpUpgrade: sp.name !== prevSpName,
      isGoalReached: goal > 0 && b >= goal && (results.length === 0 || !results[results.length - 1].isGoalReached),
    });
  }

  // Find the month goal was first reached
  let goalReachedMonth: number | null = null;
  for (const r of results) {
    if (goal > 0 && r.maxOut >= goal && goalReachedMonth === null) {
      goalReachedMonth = r.month;
    }
  }

  // Find SP upgrade months
  const spUpgradeMonths = new Set<number>();
  let prevSP = '';
  for (const r of results) {
    if (prevSP && r.spName !== prevSP) spUpgradeMonths.add(r.month);
    prevSP = r.spName;
  }

  const netResult = (cap + tOut + wallet + vipPot + compPot) - tIn;
  const goalProgress = goal > 0 ? Math.min((finalMaxVal / goal) * 100, 100) : 0;

  return {
    months: results,
    totalIn: tIn,
    totalOut: tOut,
    totalVipCost: tVip,
    finalCap: cap,
    finalWallet: wallet,
    finalVipPot: vipPot,
    finalCompPot: compPot,
    netResult,
    rocMonth,
    maxMonthlyOut: finalMaxVal,
    maxMonthlyOutMonth: finalMaxMonth,
    activeWithdrawalMonths,
    goalReached: finalMaxVal >= goal,
    goalProgress,
    goalReachedMonth,
  };
}

// ─── Strategy Engineer ───────────────────────────────────────────────────────

export function stratSimulate(
  inleg: number,
  months: number,
  monthlyStort: number,
  opnP = 0,
  vipEnabled = true,
): number {
  let cap = inleg;
  let wallet = 0;
  let vActive = false;
  let vMnd = 0;
  let finalPayout = 0;

  for (let i = 1; i <= months; i++) {
    cap += monthlyStort;

    if (vipEnabled) {
      if (cap >= 3550 && (!vActive || vMnd <= 0)) {
        cap -= 1000;
        vActive = true;
        vMnd = 12;
      }
    }

    const spRate =
      cap >= 100000 ? 3.3 :
      cap >= 50000  ? 3.2 :
      cap >= 10000  ? 3.1 :
      cap >= 5000   ? 3.0 :
      cap >= 2500   ? 2.7 :
      cap >= 1000   ? 2.4 : 2.2;

    const totalRate = spRate + (vActive ? 3.0 : 0);
    const discount = Math.round(cap * (totalRate / 100));
    const vipCost = vActive ? 84 : 0;

    const available = (discount - vipCost) + wallet;

    if (opnP > 0) {
      const actualOut = available * (opnP / 100);
      finalPayout = actualOut;
      cap += available - actualOut;
      wallet = 0;
    } else {
      finalPayout = available;
      cap += available;
      wallet = 0;
    }

    if (vMnd > 0) vMnd--;
    if (vMnd === 0) vActive = false;
  }

  return finalPayout;
}

export function stratFindMeetingMonth(
  start: number,
  maxMonths: number,
  monthlyStort: number,
  goal: number,
  vipEnabled = true,
): number | null {
  let cap = start;
  let wallet = 0;
  let vActive = false;
  let vMnd = 0;

  for (let i = 1; i <= maxMonths; i++) {
    cap += monthlyStort;

    if (vipEnabled) {
      if (cap >= 3550 && (!vActive || vMnd <= 0)) {
        cap -= 1000;
        vActive = true;
        vMnd = 12;
      }
    }

    const spRate =
      cap >= 100000 ? 3.3 :
      cap >= 50000  ? 3.2 :
      cap >= 10000  ? 3.1 :
      cap >= 5000   ? 3.0 :
      cap >= 2500   ? 2.7 :
      cap >= 1000   ? 2.4 : 2.2;

    const totalRate = spRate + (vActive ? 3.0 : 0);
    const discount = Math.round(cap * (totalRate / 100));
    const vipCost = vActive ? 84 : 0;

    const available = (discount - vipCost) + wallet;
    if (available >= goal) return i;

    cap += available;
    wallet = 0;

    if (vMnd > 0) vMnd--;
    if (vMnd === 0) vActive = false;
  }

  return null;
}

export interface StrategyResult {
  planA_deposit: number | 'MET';
  planB_months: number | null;
  planB_years: number;
  planB_remainingMonths: number;
  planC_lumpSum: number;
  planD_lumpSum: number;
  readiness: number;
}

export function calculateStrategy(
  startDeposit: number,
  monthlyGoal: number,
  targetYears: number,
  vipEnabled = true,
): StrategyResult {
  const months = targetYears * 12;

  const endOfPeriodResult = stratSimulate(startDeposit, months, 0, 0, vipEnabled);
  const readiness = Math.min(Math.round((endOfPeriodResult / monthlyGoal) * 100), 100);

  // Plan A
  let planA_deposit: number | 'MET';
  const atZero = stratSimulate(startDeposit, months, 0, 0, vipEnabled);
  if (atZero >= monthlyGoal) {
    planA_deposit = 'MET';
  } else {
    let low = 1, high = 1000000;
    for (let j = 0; j < 25; j++) {
      const mid = (low + high) / 2;
      if (stratSimulate(startDeposit, months, mid, 0, vipEnabled) >= monthlyGoal) high = mid;
      else low = mid;
    }
    let suggested = Math.round(high);
    if (suggested > 0 && suggested < 100) suggested = 100;
    planA_deposit = suggested;
  }

  // Plan B
  const monthFound = stratFindMeetingMonth(startDeposit, 600, 0, monthlyGoal, vipEnabled);
  const planB_years = monthFound !== null ? Math.floor(monthFound / 12) : 0;
  const planB_remainingMonths = monthFound !== null ? monthFound % 12 : 0;

  // Plan C
  let sLow = 0, sHigh = 5000000;
  for (let k = 0; k < 25; k++) {
    const sMid = (sLow + sHigh) / 2;
    if (stratSimulate(sMid, 12, 0, 0, vipEnabled) >= monthlyGoal) sHigh = sMid;
    else sLow = sMid;
  }

  // Plan D
  let lLow = 0, lHigh = 5000000;
  for (let l = 0; l < 25; l++) {
    const lMid = (lLow + lHigh) / 2;
    if (stratSimulate(lMid, 1, 0, 75, vipEnabled) >= monthlyGoal) lHigh = lMid;
    else lLow = lMid;
  }

  return {
    planA_deposit,
    planB_months: monthFound,
    planB_years,
    planB_remainingMonths,
    planC_lumpSum: Math.round(sHigh),
    planD_lumpSum: Math.round(lHigh),
    readiness,
  };
}

export function fmt(value: number, symbol = '$'): string {
  return `${symbol}${Math.round(value).toLocaleString('en-US')}`;
}
