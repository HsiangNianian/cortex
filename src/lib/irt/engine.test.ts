import { describe, it, expect } from "vitest";
import { irf, fisherInfo, estimateAbility } from "./engine";

describe("irf (Item Response Function)", () => {
  it("returns ~0.5 when theta equals difficulty for 1PL (c=0)", () => {
    expect(irf(0, 0, 1, 0)).toBeCloseTo(0.5, 2);
  });

  it("returns ~c when theta is very low", () => {
    expect(irf(-10, 0, 1, 0.25)).toBeCloseTo(0.25, 2);
  });

  it("returns ~1 when theta is very high", () => {
    expect(irf(10, 0, 1, 0)).toBeCloseTo(1, 4);
  });

  it("returns higher probability for easier items at same ability", () => {
    const easy = irf(0, -2, 1, 0);
    const hard = irf(0, 2, 1, 0);
    expect(easy).toBeGreaterThan(hard);
  });

  it("clamps exponent to prevent overflow", () => {
    // Extreme values should not produce NaN or Infinity
    expect(irf(100, 0)).toBeGreaterThan(0);
    expect(irf(-100, 0)).toBeGreaterThan(0);
  });

  it("discrimination parameter changes slope", () => {
    const atTheta = irf(1, 0, 2, 0);
    const atB = irf(0, 0, 2, 0);
    // Higher discrimination = steeper curve near b
    expect(atTheta).toBeGreaterThan(irf(1, 0, 1, 0));
    expect(atB).toBeCloseTo(0.5, 2);
  });
});

describe("fisherInfo", () => {
  it("returns 0 at extremes for 1PL", () => {
    expect(fisherInfo(-10, 0)).toBeCloseTo(0, 4);
    expect(fisherInfo(10, 0)).toBeCloseTo(0, 4);
  });

  it("peaks near item difficulty", () => {
    const atB = fisherInfo(0, 0, 1, 0);
    const away = fisherInfo(3, 0, 1, 0);
    expect(atB).toBeGreaterThan(away);
  });

  it("higher discrimination increases information", () => {
    const highDisc = fisherInfo(0, 0, 2, 0);
    const lowDisc = fisherInfo(0, 0, 1, 0);
    expect(highDisc).toBeGreaterThan(lowDisc);
  });

  it("does not produce NaN", () => {
    // Various combinations should all produce valid numbers
    for (let theta = -3; theta <= 3; theta += 0.5) {
      for (let b = -3; b <= 3; b += 0.5) {
        const info = fisherInfo(theta, b, 1.5, 0.25);
        expect(Number.isFinite(info)).toBe(true);
        expect(info).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("estimateAbility (EAP)", () => {
  it("returns prior mean (~0) with no responses", () => {
    const result = estimateAbility([]);
    expect(result.theta).toBeCloseTo(0, 1);
    expect(result.responses).toEqual([]);
  });

  it("returns positive theta for all-correct responses", () => {
    const responses = [
      { questionId: 1, score: 1, difficulty: 0, discrimination: 1, guessing: 0 },
      { questionId: 2, score: 1, difficulty: 0, discrimination: 1, guessing: 0 },
      { questionId: 3, score: 1, difficulty: 0, discrimination: 1, guessing: 0 },
      { questionId: 4, score: 1, difficulty: 0, discrimination: 1, guessing: 0 },
      { questionId: 5, score: 1, difficulty: 0, discrimination: 1, guessing: 0 },
    ];
    const result = estimateAbility(responses);
    expect(result.theta).toBeGreaterThan(0);
    expect(result.standardError).toBeGreaterThan(0);
  });

  it("returns negative theta for all-incorrect responses", () => {
    const responses = [
      { questionId: 1, score: 0, difficulty: 0, discrimination: 1, guessing: 0 },
      { questionId: 2, score: 0, difficulty: 0, discrimination: 1, guessing: 0 },
      { questionId: 3, score: 0, difficulty: 0, discrimination: 1, guessing: 0 },
    ];
    const result = estimateAbility(responses);
    expect(result.theta).toBeLessThan(0);
  });

  it("handles mixed responses correctly", () => {
    const responses = [
      { questionId: 1, score: 1, difficulty: -2, discrimination: 1, guessing: 0 },
      { questionId: 2, score: 0, difficulty: 2, discrimination: 1, guessing: 0 },
    ];
    const result = estimateAbility(responses);
    expect(result.theta).not.toBeNaN();
    expect(result.standardError).toBeGreaterThan(0);
  });

  it("more responses reduce standard error", () => {
    const fewResponses = [
      { questionId: 1, score: 1, difficulty: 0, discrimination: 1, guessing: 0 },
    ];
    const manyResponses = Array.from({ length: 20 }, (_, i) => ({
      questionId: i,
      score: 1,
      difficulty: 0,
      discrimination: 1,
      guessing: 0,
    }));

    const few = estimateAbility(fewResponses);
    const many = estimateAbility(manyResponses);
    expect(many.standardError).toBeLessThan(few.standardError);
  });

  it("rounds values to 2 decimal places", () => {
    const responses = [
      { questionId: 1, score: 1, difficulty: 0.5, discrimination: 1.2, guessing: 0.25 },
      { questionId: 2, score: 0, difficulty: -0.3, discrimination: 0.9, guessing: 0.25 },
    ];
    const result = estimateAbility(responses);
    const decimalParts = result.theta.toString().split(".");
    if (decimalParts.length > 1) {
      expect(decimalParts[1].length).toBeLessThanOrEqual(2);
    }
  });
});
