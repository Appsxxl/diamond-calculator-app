import { describe, it, expect } from "vitest";
import {
  runCalculation,
  calculateStrategy,
  getSPLevel,
  createDefaultMonthData,
  CalculationParams,
  MonthData,
} from "./calculator";

function makeParams(overrides: Partial<CalculationParams> = {}): CalculationParams {
  return {
    startAmount: 10000,
    years: 5,
    goal: 2000,
    vipEnabled: true,
    monthData: {},
    ...overrides,
  };
}

describe("Calculator Engine - SP Level Logic", () => {
  it("SP1 for balance < 1000", () => {
    expect(getSPLevel(500)).toEqual({ name: "SP1", baseRate: 2.2 });
  });
  it("SP2 for balance 1000-2499", () => {
    expect(getSPLevel(1500)).toEqual({ name: "SP2", baseRate: 2.45 });
  });
  it("SP3 for balance 2500-4999", () => {
    expect(getSPLevel(3000)).toEqual({ name: "SP3", baseRate: 2.7 });
  });
  it("SP4 for balance 5000-9999", () => {
    expect(getSPLevel(7500)).toEqual({ name: "SP4", baseRate: 3.0 });
  });
  it("SP5 for balance 10000-49999", () => {
    expect(getSPLevel(10000)).toEqual({ name: "SP5", baseRate: 3.1 });
  });
  it("SP6 for balance 50000-99999", () => {
    expect(getSPLevel(75000)).toEqual({ name: "SP6", baseRate: 3.2 });
  });
  it("SP7 for balance >= 100000", () => {
    expect(getSPLevel(100000)).toEqual({ name: "SP7", baseRate: 3.3 });
  });
});

describe("Calculator Engine - runCalculation", () => {
  it("generates correct number of months", () => {
    const result = runCalculation(makeParams({ years: 5 }));
    expect(result.months).toHaveLength(60);
  });

  it("generates 12 months for 1 year", () => {
    const result = runCalculation(makeParams({ years: 1 }));
    expect(result.months).toHaveLength(12);
  });

  it("totalIn equals startAmount when no deposits", () => {
    const result = runCalculation(makeParams({ startAmount: 10000, monthData: {} }));
    expect(result.totalIn).toBe(10000);
  });

  it("totalOut is 0 when no withdrawals", () => {
    const result = runCalculation(makeParams());
    expect(result.totalOut).toBe(0);
  });

  it("finalCap grows over time with VIP enabled", () => {
    const result = runCalculation(makeParams({ startAmount: 10000, years: 5, vipEnabled: true }));
    expect(result.finalCap).toBeGreaterThan(10000);
  });

  it("VIP activates at month 1 when cap >= 3500 (2500+1000)", () => {
    const result = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: true }));
    const m1 = result.months[0];
    expect(m1.isNewVip).toBe(true);
    // After VIP cost ($1000) is deducted: cap = 9000 => SP4 (3.0%) + VIP (3.0%) = 6.0%
    expect(m1.totalRate).toBeCloseTo(6.0, 1); // SP4 3.0 + VIP 3.0
  });

  it("VIP does not activate when disabled", () => {
    // net(10000) = (10000-5)*0.9875 = 9870 → SP4 (3.0%), no VIP
    const result = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: false }));
    const m1 = result.months[0];
    expect(m1.isNewVip).toBe(false);
    expect(m1.totalRate).toBeCloseTo(3.0, 1); // SP4 only (fees reduce 10k to ~9870)
  });

  it("manualVip=true leaves cap unchanged (external fee, not a deposit)", () => {
    // With manualVip=false: cap loses $1,000 (deducted from assets)
    // With manualVip=true:  cap is unchanged ($1,000 paid externally, not from diamonds)
    const auto   = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: true, manualVip: false }));
    const manual = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: true, manualVip: true }));
    expect(manual.months[0].isManualVip).toBe(true);
    expect(auto.months[0].isManualVip).toBe(false);
    // manualVip cap is higher: $1,000 not deducted + extra yield on that $1,000
    expect(manual.months[0].capEnd - auto.months[0].capEnd).toBeGreaterThan(950);
  });

  it("VIP triggers in month 1 when gross startAmount >= 3550 even though net cap < 3550", () => {
    // gross=3550 → net = (3550-5)*0.9875 = 3500.69 < 3550 threshold
    // VIP should still activate because gross startAmount >= 3550
    const result = runCalculation(makeParams({ startAmount: 3550, years: 1, vipEnabled: true, goal: 0 }));
    expect(result.months[0].isNewVip).toBe(true);
    // After VIP deduction: 3500.69 - 1000 = 2500.69 → SP3
    expect(result.months[0].spName).toBe('SP3');
  });

  it("SP5 rate is 3.1% base for balance >= 10000 net", () => {
    // Need gross > 10127 to get net >= 10000 (SP5): (10200-5)*0.9875 = 10055
    const result = runCalculation(makeParams({ startAmount: 10200, years: 1, vipEnabled: false }));
    expect(result.months[0].spName).toBe("SP5");
    expect(result.months[0].spBaseRate).toBe(3.1);
  });

  it("grossYield is Math.round(cap * rate/100)", () => {
    // net(10200) = (10200-5)*0.9875 = 10055.06 → SP5 (3.1%)
    const result = runCalculation(makeParams({ startAmount: 10200, years: 1, vipEnabled: false }));
    const m1 = result.months[0];
    const netCap = (10200 - 5) * 0.9875; // 10055.0625
    const expected = Math.round(netCap * (3.1 / 100));
    expect(m1.grossYield).toBe(expected);
  });

  it("withdrawal is capped at available balance", () => {
    const monthData: Record<number, any> = {};
    for (let i = 1; i <= 12; i++) {
      monthData[i] = { stort: 0, opn: 999999, opnP: 0, comp: 100 };
    }
    const result = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: false, monthData }));
    const m1 = result.months[0];
    expect(m1.withdrawal).toBeLessThanOrEqual(m1.maxOut);
  });

  it("compPot is added to cap only when >= 100", () => {
    const result = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: false }));
    // compPot should be 0 after each month if it accumulated >= 100
    result.months.forEach(m => {
      expect(m.compPot).toBeLessThan(100);
    });
  });

  it("SP level is locked for first 12 months; SP2 reached when combined matured+deposit >= $1,000", () => {
    // In the tranche model each contract's principal is fixed.
    // net(900) ≈ $884 → SP1. A $200 deposit in month 13 pushes the combined
    // matured lump to $884 + net($200) ≈ $1,077 → first SP2 contract.
    const monthData: Record<number, MonthData> = { 13: { stort: 200, opn: 0, opnP: 0, comp: 100 } };
    const result = runCalculation(makeParams({ startAmount: 900, years: 2, vipEnabled: false, goal: 0, monthData }));
    // months 1-12: original SP1 contract is active
    result.months.slice(0, 12).forEach(m => {
      expect(m.spName).toBe("SP1");
    });
    // SP2 upgrade must appear at month 13 (matured $884 + new deposit $193 = $1,077 ≥ $1,000)
    const upgradeMonth = result.months.find(m => m.spName === "SP2");
    expect(upgradeMonth).toBeDefined();
    expect(upgradeMonth!.month).toBe(13);
    expect(upgradeMonth!.isSpUpgrade).toBe(true);
    expect(upgradeMonth!.totalRate).toBeCloseTo(2.45, 2);
  });

  it("VIP rate adds to upgraded SP level correctly", () => {
    // Start in SP4, VIP active → totalRate = SP4(3.0%) + VIP(3.0%) = 6.0%
    // After compounding into SP5, totalRate = SP5(3.1%) + VIP(3.0%) = 6.1%
    const result = runCalculation(makeParams({ startAmount: 5000, years: 5, vipEnabled: true, goal: 0 }));
    const sp5Month = result.months.find(m => m.spName === "SP5" && m.isVipActive);
    if (sp5Month) {
      expect(sp5Month.totalRate).toBeCloseTo(6.1, 1);
    }
  });

  it("isYearStart is true for month 13, 25, 37...", () => {
    const result = runCalculation(makeParams({ years: 5 }));
    expect(result.months[12].isYearStart).toBe(true);  // month 13
    expect(result.months[24].isYearStart).toBe(true);  // month 25
    expect(result.months[0].isYearStart).toBe(false);  // month 1
  });

  it("netResult = (finalCap + totalOut) - (totalIn + totalVipPotPayments)", () => {
    const result = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: true }));
    // netResult = value out (capital + withdrawals) minus value in (deposits + monthly VIP fees)
    const expected = (result.finalCap + result.totalOut) - (result.totalIn + result.totalVipPotPayments);
    expect(result.netResult).toBeCloseTo(expected, 0);
  });
});

describe("Strategy Engineer - calculateStrategy", () => {
  it("returns readiness 0-100", () => {
    const result = calculateStrategy(5000, 5000, 5);
    expect(result.readiness).toBeGreaterThanOrEqual(0);
    expect(result.readiness).toBeLessThanOrEqual(100);
  });

  it("Plan A returns MET when start is large enough", () => {
    const result = calculateStrategy(1000000, 100, 5);
    expect(result.planA_deposit).toBe("MET");
  });

  it("Plan A returns a number when deposit is needed", () => {
    const result = calculateStrategy(1000, 5000, 5);
    expect(typeof result.planA_deposit).toBe("number");
    expect(result.planA_deposit as number).toBeGreaterThan(0);
  });

  it("Plan B returns months when goal is reachable", () => {
    const result = calculateStrategy(100000, 1000, 5);
    expect(result.planB_months).not.toBeNull();
  });

  it("Plan C lump sum is positive", () => {
    const result = calculateStrategy(5000, 1000, 5);
    expect(result.planC_lumpSum).toBeGreaterThan(0);
  });

  it("Plan D lump sum is greater than Plan C (1 month vs 12 months)", () => {
    const result = calculateStrategy(5000, 1000, 5);
    expect(result.planD_lumpSum).toBeGreaterThan(result.planC_lumpSum);
  });
});
