// Plan B Calculator Engine – Tranche-based SP contract model
//
// Rules:
//  • Every deposit starts its own independent 12-month SP contract (tranche).
//  • No external money can be added to a running contract.
//  • Each month: collect ALL tranches maturing this month + this month's deposit
//    → combine into ONE new lump → determine SP tier → start ONE new 12-month contract.
//  • The SP tier is locked for the full 12 months at the rate matching the opening lump.
//  • SP7 (3.3%) requires the opening lump to be ≥ $100,000 in that single moment.
//  • Compound gains stay inside each tranche (growing its principal at the locked rate).
//  • VIP (+3%) applies globally to all active tranches in the months it is active.

export interface MonthData {
  stort: number;   // deposit for this month
  opn: number;     // fixed withdrawal amount
  opnP: number;    // withdrawal percentage of gross yield (0-100)
  comp: number;    // compound reinvestment percentage (0-100, default 100)
}

export interface Tranche {
  id: number;
  principal: number;   // grows each month when compound % > 0
  spName: string;
  baseRate: number;    // locked at creation — never changes
  startMonth: number;
  maturityMonth: number; // startMonth + 12; freed at beginning of this month
  isCompound: boolean;   // true = compound reinvestment tranche; false = main rebuy/deposit tranche
}

export interface MonthResult {
  month: number;
  capStart: number;
  deposit: number;
  maxOut: number;          // maximum available withdrawal
  withdrawal: number;
  grossYield: number;
  compoundAdded: number;
  wallet: number;
  vipPot: number;
  compPot: number;         // always 0 in tranche model (kept for UI compatibility)
  capEnd: number;
  spName: string;          // SP of the newest active tranche
  spBaseRate: number;
  totalRate: number;
  vipStatus: string;       // "NEW VIP" | "VIP (Xm)" | ""
  isNewVip: boolean;
  isVipActive: boolean;
  isVipSelfFunded: boolean;
  isManualVip: boolean;
  isYearStart: boolean;
  yearNumber: number;
  isSpUpgrade: boolean;
  isGoalReached: boolean;
  // Tranche summary (extra info for advanced display)
  activeTranchesCount: number;
  maturedCount: number;
  maturedSum: number;   // total principal freed from maturing contracts this month
}

export interface CalculationResult {
  months: MonthResult[];
  totalIn: number;
  totalOut: number;
  totalVipCost: number;
  totalVipPotPayments: number;
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
  manualVip?: boolean;
  monthData: Record<number, MonthData>;
}

export const SP_LEVELS = [
  { name: 'SP1', minBalance: 0,      maxBalance: 999,      baseRate: 2.2,  vipBonus: 3.0, totalWithVip: 5.2  },
  { name: 'SP2', minBalance: 1000,   maxBalance: 2499,     baseRate: 2.45, vipBonus: 3.0, totalWithVip: 5.45 },
  { name: 'SP3', minBalance: 2500,   maxBalance: 4999,     baseRate: 2.7,  vipBonus: 3.0, totalWithVip: 5.7  },
  { name: 'SP4', minBalance: 5000,   maxBalance: 9999,     baseRate: 3.0,  vipBonus: 3.0, totalWithVip: 6.0  },
  { name: 'SP5', minBalance: 10000,  maxBalance: 49999,    baseRate: 3.1,  vipBonus: 3.0, totalWithVip: 6.1  },
  { name: 'SP6', minBalance: 50000,  maxBalance: 99999,    baseRate: 3.2,  vipBonus: 3.0, totalWithVip: 6.2  },
  { name: 'SP7', minBalance: 100000, maxBalance: Infinity, baseRate: 3.3,  vipBonus: 3.0, totalWithVip: 6.3  },
];

// getSPLevel is called on the one-time opening lump of a contract.
// SP7 is therefore only reachable when ≥ $100,000 is deployed in a single moment.
export function getSPLevel(lump: number): { name: string; baseRate: number } {
  if (lump >= 100000) return { name: 'SP7', baseRate: 3.3 };
  if (lump >= 50000)  return { name: 'SP6', baseRate: 3.2 };
  if (lump >= 10000)  return { name: 'SP5', baseRate: 3.1 };
  if (lump >= 5000)   return { name: 'SP4', baseRate: 3.0 };
  if (lump >= 2500)   return { name: 'SP3', baseRate: 2.7 };
  if (lump >= 1000)   return { name: 'SP2', baseRate: 2.45 };
  return { name: 'SP1', baseRate: 2.2 };
}

export function createDefaultMonthData(): MonthData {
  return { stort: 0, opn: 0, opnP: 0, comp: 100 };
}

// Deduct $5 flat fee + 1.25% variable fee from every deposit transaction.
export function getNetDeposit(gross: number): number {
  if (gross <= 0) return 0;
  return Math.max(0, (gross - 5) * 0.9875);
}

// ─── Main Calculator ──────────────────────────────────────────────────────────

export function runCalculation(params: CalculationParams): CalculationResult {
  const { startAmount, years, goal, vipEnabled, manualVip, monthData } = params;
  const maxMonths = years * 12;

  let tranches: Tranche[] = [];
  let nextId = 1;

  let vActive = false;
  let vMnd = 0;
  let vipPot = 0;
  let wallet = 0;  // carry-over from yield not reinvested and not withdrawn

  let tIn = startAmount;  // gross deposits (for ROC / net-result tracking)
  let tOut = 0;
  let tVip = 0;
  let tVipPot = 0;
  let runningWithdrawals = 0;
  let rocMonth: number | null = null;
  let finalMaxVal = 0;
  let finalMaxMonth = 0;
  let finalMaxWithdrawal = 0;
  let finalMaxWithdrawalMonth = 0;
  let finalMaxGrossYield = 0;
  let finalMaxGrossYieldMonth = 0;
  let activeWithdrawalMonths = 0;

  const results: MonthResult[] = [];

  for (let m = 1; m <= maxMonths; m++) {
    const mD: MonthData = monthData[m] ?? createDefaultMonthData();

    // Capital at start of month. For month 1 this is 0 (tranches created during the month),
    // so we use the net deposit as the display value to show what was invested.
    const capStartRaw = tranches.reduce((s, t) => s + t.principal, 0);
    const depositNetM1 = m === 1
      ? startAmount + getNetDeposit(monthData[1]?.stort ?? 0)
      : 0;
    const capStart = m === 1 ? depositNetM1 : capStartRaw;

    // ── 1. Collect maturing tranches ────────────────────────────────────────
    // A tranche with maturityMonth === m has completed its 12-month run.
    const maturing = tranches.filter(t => t.maturityMonth === m);
    tranches = tranches.filter(t => t.maturityMonth !== m);
    const maturedSum = maturing.reduce((s, t) => s + t.principal, 0);
    const maturedCount = maturing.length;
    // Fold + early VIP only trigger when a main (non-compound) tranche matures.
    // Pure compound-tranche maturities must NOT fold other tranches' yield — that
    // buries the big rebuy's yield inside a tiny lump and collapses available to
    // nearly zero in months 14–24 (and the equivalent windows in later cycles).
    const hasMainMaturity = maturing.some(t => !t.isCompound);

    // ── 2. New deposit for this month ────────────────────────────────────────
    // Month 1 includes the startAmount as an additional deposit.
    const depositGross = mD.stort + (m === 1 ? startAmount : 0);
    // Fees are applied per transaction — startAmount and monthly deposit are separate.
    const depositNet = getNetDeposit(mD.stort) + (m === 1 ? startAmount : 0);
    if (m > 1) tIn += mD.stort;  // startAmount already counted in tIn initialiser

    // ── 3. Combine matured principal + new deposit → one new contract ────────
    // When opn is set in a maturity month, that amount is taken from the freed
    // principal first (before reinvestment). This implements "take out initial".
    const principalTakeout = maturedSum > 0 ? Math.min(mD.opn, maturedSum) : 0;
    if (principalTakeout > 0) { tOut += principalTakeout; runningWithdrawals += principalTakeout; }

    // When a contract matures with full auto-rebuy (no principal withdrawal),
    // run the VIP check BEFORE creating the rebuy tranche so we can fold the
    // compound tranches' yield (minus VIP reservation) into the new contract,
    // ensuring the combined amount qualifies for the correct SP tier.
    // In all other months VIP runs after the new tranche is created (step 4).
    let vipLabel = '';
    let isNewVip = false;
    let isVipSelfFunded = false;
    let isManualVip_ = false;
    let preRebuyYield = 0;
    let nVFolded = 0;

    if (maturedSum > 0 && principalTakeout === 0 && hasMainMaturity) {
      // ── 3a. Early VIP check (main-tranche maturity months only) ──────────
      const compoundCapNow = tranches.reduce((s, t) => s + t.principal, 0);
      const totalCapForVip = compoundCapNow + maturedSum + depositNet;
      if (vipEnabled) {
        const vipThresholdMet = totalCapForVip >= 3550;
        if (vipThresholdMet && (!vActive || vMnd <= 0)) {
          const cost = 1000;
          if (vipPot >= cost) {
            vipPot -= cost;
            isVipSelfFunded = true;
          } else if (manualVip) {
            isManualVip_ = true;
          } else {
            if (compoundCapNow > 0) {
              const factor = Math.max(0, (compoundCapNow - cost) / compoundCapNow);
              for (const t of tranches) t.principal *= factor;
            }
          }
          tVip += cost;
          vActive = true;
          vMnd = 12;
          vipLabel = 'NEW VIP';
          isNewVip = true;
        } else if (vActive) {
          vipLabel = `VIP (${vMnd}m)`;
        }
      }

      // ── 3b. Fold ONLY compound tranches' yield into the rebuy lump ────────
      // Main (rebuy) tranches keep their yield in the available pool so that
      // months between main maturities (e.g. 14–24) show full available income.
      const vipBonusNow = vActive ? 3.0 : 0;
      preRebuyYield = tranches
        .filter(t => t.isCompound)
        .reduce((s, t) => s + Math.round(t.principal * ((t.baseRate + vipBonusNow) / 100)), 0);
      const nV84 = vActive ? 84 : 0;
      nVFolded = Math.min(preRebuyYield, nV84);
    }

    const yieldFolded = preRebuyYield - nVFolded;

    const newLump = (maturedSum - principalTakeout) + depositNet + yieldFolded;
    let newSpName = '';
    let newBaseRate = 0;

    if (newLump > 0) {
      const sp = getSPLevel(newLump);
      newSpName = sp.name;
      newBaseRate = sp.baseRate;
      tranches.push({
        id: nextId++,
        principal: newLump,
        spName: sp.name,
        baseRate: sp.baseRate,
        startMonth: m,
        maturityMonth: m + 12,
        isCompound: false,
      });
    }

    // ── 4. VIP check (non-main-maturity months) ──────────────────────────────
    // Runs after the new tranche is created. Also covers compound-tranche
    // maturity months, since those skip the early VIP check above.
    if (!hasMainMaturity || maturedSum === 0 || principalTakeout > 0) {
      const totalCapNow = tranches.reduce((s, t) => s + t.principal, 0);
      if (vipEnabled) {
        const vipThresholdMet = totalCapNow >= 3550 || (m === 1 && startAmount >= 3550);
        if (vipThresholdMet && (!vActive || vMnd <= 0)) {
          const cost = 1000;
          if (vipPot >= cost) {
            vipPot -= cost;
            isVipSelfFunded = true;
          } else if (manualVip) {
            isManualVip_ = true;
          } else {
            if (totalCapNow > 0) {
              const factor = Math.max(0, (totalCapNow - cost) / totalCapNow);
              for (const t of tranches) t.principal *= factor;
            }
          }
          tVip += cost;
          vActive = true;
          vMnd = 12;
          vipLabel = 'NEW VIP';
          isNewVip = true;
        } else if (vActive) {
          vipLabel = `VIP (${vMnd}m)`;
        }
      }
    }

    // ── 5. Monthly yield from all active tranches ────────────────────────────
    // VIP bonus applies globally to all tranches in the months it is active.
    const vipBonus = vActive ? 3.0 : 0;
    const trancheYields = tranches.map(t =>
      Math.round(t.principal * ((t.baseRate + vipBonus) / 100))
    );
    const totalYield = trancheYields.reduce((s, y) => s + y, 0);

    // ── 6. VIP monthly pot accumulation ($84/month saved toward next renewal) ─
    const nV = vActive ? 84 : 0;
    if (vipEnabled) { vipPot += nV; tVipPot += nV; }

    // Track max gross yield (matches the "Monthly Discount" table column)
    if (totalYield > finalMaxGrossYield) { finalMaxGrossYield = totalYield; finalMaxGrossYieldMonth = m; }

    // ── 7. Available to withdraw or reinvest ─────────────────────────────────
    // When yield was folded into the rebuy (preRebuyYield > 0), subtract it
    // from available to avoid double-counting; nVFolded covered the VIP pot
    // reservation so effectiveNV is the remainder still owed from yield.
    const effectiveNV = nV - nVFolded;
    const available = (totalYield - preRebuyYield) - effectiveNV + wallet;
    // maxOut includes freed principal so goal/display correctly reflects total accessible value
    const totalAvailable = principalTakeout + Math.max(0, available);
    if (totalAvailable > finalMaxVal) { finalMaxVal = totalAvailable; finalMaxMonth = m; }

    // ── 8. Withdrawal from yield (principal takeout already counted in step 3) ─
    const pO = totalYield * (mD.opnP / 100);
    const remainingOpn = Math.max(0, mD.opn - principalTakeout);
    let rO = Math.min(remainingOpn + pO, Math.max(0, available));

    // On contract-maturity months, compound yields were folded into the rebuy
    // lump (step 3b), locking them inside the tranche. This makes `available`
    // far smaller than the intended opnP% of totalYield. Fix: compute how much
    // is still owed to the user and pull that shortfall directly from the rebuy
    // tranche's principal, so the withdrawal is always exactly opnP% of the
    // Discount Applied column (totalYield).
    if (mD.opnP > 0 && yieldFolded > 0) {
      const fullTarget = Math.min(
        remainingOpn + pO,
        Math.max(0, totalYield - effectiveNV + wallet),
      );
      const shortfall = Math.round(fullTarget - rO);
      if (shortfall > 0 && tranches.length > 0) {
        const rebuy = tranches[tranches.length - 1];
        // Only touch the tranche that was just created this month (the rebuy)
        if (rebuy.startMonth === m) {
          const reduction = Math.min(shortfall, Math.floor(rebuy.principal));
          rebuy.principal -= reduction;
          rO += reduction;
          const adjSp = getSPLevel(rebuy.principal);
          rebuy.spName = adjSp.name;
          rebuy.baseRate = adjSp.baseRate;
        }
      }
    }

    tOut += rO;
    runningWithdrawals += rO;
    if (principalTakeout > 0 || rO > 0) activeWithdrawalMonths++;
    const actualMonthlyWithdrawal = principalTakeout + rO;
    if (actualMonthlyWithdrawal > finalMaxWithdrawal) { finalMaxWithdrawal = actualMonthlyWithdrawal; finalMaxWithdrawalMonth = m; }

    // ── 9. ROC (return-of-capital) check ─────────────────────────────────────
    if (rocMonth === null && runningWithdrawals >= tIn && tIn > 0) rocMonth = m;

    // ── 10. Compound – start a fresh contract with this month's reinvested gains ─
    // Contract principals are FIXED for their entire 12-month life.
    // Compound gains are never folded back into the source tranche; instead they
    // immediately open a new independent 12-month contract (earning from next month).
    const leftover = Math.max(0, available - rO);
    const nC = Math.round(leftover * (mD.comp / 100));
    wallet = leftover - nC;

    if (nC > 0) {
      const cSp = getSPLevel(nC);
      tranches.push({
        id: nextId++,
        principal: nC,
        spName: cSp.name,
        baseRate: cSp.baseRate,
        startMonth: m + 1,    // earns from next month
        maturityMonth: m + 13, // 12 full months of earning
        isCompound: true,
      });
    }

    // ── 11. VIP countdown ────────────────────────────────────────────────────
    if (vMnd > 0) vMnd--;
    if (vMnd === 0) vActive = false;

    const capEnd = tranches.reduce((s, t) => s + t.principal, 0);

    // Representative SP for display = newest tranche (just created or most recent)
    const displaySp = newLump > 0
      ? { name: newSpName, baseRate: newBaseRate }
      : tranches.length > 0
        ? { name: tranches[tranches.length - 1].spName, baseRate: tranches[tranches.length - 1].baseRate }
        : { name: 'SP1', baseRate: 2.2 };

    const totalRate = displaySp.baseRate + vipBonus;
    const prevSpName = results.length > 0 ? results[results.length - 1].spName : displaySp.name;

    results.push({
      month: m,
      // M1: show the earning capital after VIP deduction (capEnd minus compound gains added this month).
      // For all other months capStart is the running total at the start of the month.
      capStart: m === 1 ? capEnd - nC : capStart,
      deposit: depositGross,
      maxOut: totalAvailable,
      withdrawal: principalTakeout + rO,
      grossYield: totalYield,
      compoundAdded: nC,
      wallet,
      vipPot,
      compPot: 0,
      capEnd,
      spName: displaySp.name,
      spBaseRate: displaySp.baseRate,
      totalRate,
      vipStatus: vipLabel,
      isNewVip,
      isVipActive: vActive,
      isVipSelfFunded,
      isManualVip: isManualVip_,
      isYearStart: m > 1 && (m - 1) % 12 === 0,
      yearNumber: Math.ceil(m / 12),
      isSpUpgrade: newLump > 0 && newSpName !== '' && newSpName !== prevSpName,
      isGoalReached:
        goal > 0 &&
        totalAvailable >= goal &&
        (results.length === 0 || !results[results.length - 1].isGoalReached),
      activeTranchesCount: tranches.length,
      maturedCount,
      maturedSum,
    });
  }

  const goalReachedMonth = results.find(r => r.isGoalReached)?.month ?? null;
  const finalCap = tranches.reduce((s, t) => s + t.principal, 0);
  const netResult = (finalCap + tOut) - (tIn + tVipPot);
  const goalProgress = goal > 0 ? Math.min((finalMaxVal / goal) * 100, 100) : 0;

  return {
    months: results,
    totalIn: tIn,
    totalOut: tOut,
    totalVipCost: tVip,
    totalVipPotPayments: tVipPot,
    finalCap,
    finalWallet: wallet,
    finalVipPot: vipPot,
    finalCompPot: 0,
    netResult,
    rocMonth,
    // When withdrawals are configured, show the max actual payout received.
    // When compound-only, show max gross yield — matches the Monthly Discount table column
    // and represents what the plan generates at peak (total from all active tranches).
    maxMonthlyOut: finalMaxWithdrawal > 0 ? finalMaxWithdrawal : finalMaxGrossYield,
    maxMonthlyOutMonth: finalMaxWithdrawal > 0 ? finalMaxWithdrawalMonth : finalMaxGrossYieldMonth,
    activeWithdrawalMonths,
    goalReached: goal > 0 ? finalMaxVal >= goal : false,
    goalProgress,
    goalReachedMonth,
  };
}

// ─── Strategy Engine (tranche-based) ─────────────────────────────────────────

export function stratSimulate(
  inleg: number,
  months: number,
  monthlyStort: number,
  opnP = 0,
  vipEnabled = true,
): number {
  let tranches: Tranche[] = [];
  let nextId = 1;
  let vActive = false;
  let vMnd = 0;
  let vipPot = 0;
  let wallet = 0;
  let finalAvailable = 0;

  for (let i = 1; i <= months; i++) {
    // 1. Collect maturing tranches
    const maturing = tranches.filter(t => t.maturityMonth === i);
    tranches = tranches.filter(t => t.maturityMonth !== i);
    const maturedSum = maturing.reduce((s, t) => s + t.principal, 0);

    // 2. New deposit (inleg in month 1 only, monthlyStort every month)
    // Internal amounts (start capital, matured principal) are fee-free; only
    // external monthly deposits pay the $5 + 1.25% transaction fee.
    const depositNet = getNetDeposit(monthlyStort) + (i === 1 ? inleg : 0);

    // 3. New contract from matured + deposit
    const newLump = maturedSum + depositNet;
    if (newLump > 0) {
      const sp = getSPLevel(newLump);
      tranches.push({ id: nextId++, principal: newLump, spName: sp.name, baseRate: sp.baseRate, startMonth: i, maturityMonth: i + 12, isCompound: false });
    }

    // 4. VIP check
    const totalCap = tranches.reduce((s, t) => s + t.principal, 0);
    if (vipEnabled) {
      const threshold = totalCap >= 3550 || (i === 1 && inleg >= 3550);
      if (threshold && (!vActive || vMnd <= 0)) {
        const cost = 1000;
        if (vipPot >= cost) {
          vipPot -= cost;
        } else {
          const factor = Math.max(0, (totalCap - cost) / totalCap);
          for (const t of tranches) t.principal *= factor;
        }
        vActive = true;
        vMnd = 12;
      }
    }

    // 5. Yield
    const vipBonus = vActive ? 3.0 : 0;
    const trancheYields = tranches.map(t => Math.round(t.principal * ((t.baseRate + vipBonus) / 100)));
    const totalYield = trancheYields.reduce((s, y) => s + y, 0);

    const nV = vActive ? 84 : 0;
    if (vipEnabled) vipPot += nV;

    const available = (totalYield - nV) + wallet;

    if (opnP > 0) {
      const out = available * (opnP / 100);
      finalAvailable = out;
      const reinvest = Math.round(available - out);
      if (reinvest > 0) {
        const cSp = getSPLevel(reinvest);
        tranches.push({ id: nextId++, principal: reinvest, spName: cSp.name, baseRate: cSp.baseRate, startMonth: i + 1, maturityMonth: i + 13, isCompound: true });
      }
      wallet = 0;
    } else {
      finalAvailable = available;
      const reinvest = Math.round(available);
      if (reinvest > 0) {
        const cSp = getSPLevel(reinvest);
        tranches.push({ id: nextId++, principal: reinvest, spName: cSp.name, baseRate: cSp.baseRate, startMonth: i + 1, maturityMonth: i + 13, isCompound: true });
      }
      wallet = 0;
    }

    if (vMnd > 0) vMnd--;
    if (vMnd === 0) vActive = false;
  }

  return finalAvailable;
}

export function stratFindMeetingMonth(
  start: number,
  maxMonths: number,
  monthlyStort: number,
  goal: number,
  vipEnabled = true,
): number | null {
  let tranches: Tranche[] = [];
  let nextId = 1;
  let vActive = false;
  let vMnd = 0;
  let vipPot = 0;
  let wallet = 0;

  for (let i = 1; i <= maxMonths; i++) {
    const maturing = tranches.filter(t => t.maturityMonth === i);
    tranches = tranches.filter(t => t.maturityMonth !== i);
    const maturedSum = maturing.reduce((s, t) => s + t.principal, 0);

    const depositNet = getNetDeposit(monthlyStort) + (i === 1 ? start : 0);
    const newLump = maturedSum + depositNet;
    if (newLump > 0) {
      const sp = getSPLevel(newLump);
      tranches.push({ id: nextId++, principal: newLump, spName: sp.name, baseRate: sp.baseRate, startMonth: i, maturityMonth: i + 12, isCompound: false });
    }

    const totalCap = tranches.reduce((s, t) => s + t.principal, 0);
    if (vipEnabled) {
      const threshold = totalCap >= 3550 || (i === 1 && start >= 3550);
      if (threshold && (!vActive || vMnd <= 0)) {
        const cost = 1000;
        if (vipPot >= cost) {
          vipPot -= cost;
        } else {
          const factor = Math.max(0, (totalCap - cost) / totalCap);
          for (const t of tranches) t.principal *= factor;
        }
        vActive = true;
        vMnd = 12;
      }
    }

    const vipBonus = vActive ? 3.0 : 0;
    const trancheYields = tranches.map(t => Math.round(t.principal * ((t.baseRate + vipBonus) / 100)));
    const totalYield = trancheYields.reduce((s, y) => s + y, 0);
    const nV = vActive ? 84 : 0;
    if (vipEnabled) vipPot += nV;

    const available = (totalYield - nV) + wallet;
    if (available >= goal) return i;

    const reinvest = Math.round(available);
    if (reinvest > 0) {
      const cSp = getSPLevel(reinvest);
      tranches.push({ id: nextId++, principal: reinvest, spName: cSp.name, baseRate: cSp.baseRate, startMonth: i + 1, maturityMonth: i + 13, isCompound: true });
    }
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
  if (stratSimulate(startDeposit, months, 0, 0, vipEnabled) >= monthlyGoal) {
    planA_deposit = 'MET';
  } else {
    let low = 1, high = 1000000;
    for (let j = 0; j < 25; j++) {
      const mid = (low + high) / 2;
      if (stratSimulate(startDeposit, months, mid, 0, vipEnabled) >= monthlyGoal) high = mid;
      else low = mid;
    }
    // STANDING RULE: minimum $107/month — do not change without explicit instruction.
    planA_deposit = Math.max(107, Math.round(high));
  }

  // Plan B
  const monthFound = stratFindMeetingMonth(startDeposit, 600, 0, monthlyGoal, vipEnabled);
  const planB_years = monthFound !== null ? Math.floor(monthFound / 12) : 0;
  const planB_remainingMonths = monthFound !== null ? monthFound % 12 : 0;

  // Plan C — lump sum needed to meet goal within 12 months (compound mode)
  let sLow = 0, sHigh = 5000000;
  for (let k = 0; k < 25; k++) {
    const sMid = (sLow + sHigh) / 2;
    if (stratSimulate(sMid, 12, 0, 0, vipEnabled) >= monthlyGoal) sHigh = sMid;
    else sLow = sMid;
  }

  // Plan D — lump sum needed to meet goal in 1 month (75% payout mode)
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
