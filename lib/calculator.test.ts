import { describe, it, expect } from "vitest";
import {
  runCalculation,
  calculateStrategy,
  getSPLevel,
  createDefaultMonthData,
  CalculationParams,
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
    const result = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: false }));
    const m1 = result.months[0];
    expect(m1.isNewVip).toBe(false);
    expect(m1.totalRate).toBeCloseTo(3.1, 1); // SP5 only
  });

  it("SP5 rate is 3.1% base for 10000 balance", () => {
    const result = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: false }));
    expect(result.months[0].spName).toBe("SP5");
    expect(result.months[0].spBaseRate).toBe(3.1);
  });

  it("grossYield is Math.round(cap * rate/100)", () => {
    const result = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: false }));
    const m1 = result.months[0];
    const expected = Math.round(10000 * (3.1 / 100));
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

  it("isYearStart is true for month 13, 25, 37...", () => {
    const result = runCalculation(makeParams({ years: 5 }));
    expect(result.months[12].isYearStart).toBe(true);  // month 13
    expect(result.months[24].isYearStart).toBe(true);  // month 25
    expect(result.months[0].isYearStart).toBe(false);  // month 1
  });

  it("netResult = (finalCap + totalOut + wallet + vipPot + compPot) - totalIn", () => {
    const result = runCalculation(makeParams({ startAmount: 10000, years: 1, vipEnabled: true }));
    const expected = (result.finalCap + result.totalOut + result.finalWallet + result.finalVipPot + result.finalCompPot) - result.totalIn;
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
