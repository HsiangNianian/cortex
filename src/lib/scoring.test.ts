import { describe, it, expect } from "vitest";
import {
  scoreAnswer,
  isCorrect,
  normalizeDimensionScores,
  normalCDF,
  abilityToDegradationIndex,
  thetaToDimensionScore,
  calculateResult,
  getTierByIndex,
  getChallengeCopy,
} from "./scoring";

describe("scoreAnswer", () => {
  it("returns 0 when answer is null", () => {
    expect(scoreAnswer(null, 2)).toBe(0);
  });

  it("returns 1 for correct single-select answer", () => {
    expect(scoreAnswer(2, 2)).toBe(1);
  });

  it("returns 0 for incorrect single-select answer", () => {
    expect(scoreAnswer(1, 2)).toBe(0);
  });

  it("returns partial credit for multi-select with subset of correct options", () => {
    expect(scoreAnswer([0, 1], [0, 1, 2])).toBe(2 / 3);
  });

  it("returns 0 for multi-select with any wrong option", () => {
    expect(scoreAnswer([0, 3], [0, 1, 2])).toBe(0);
  });

  it("returns 1 for multi-select with all correct options", () => {
    expect(scoreAnswer([0, 1, 2], [0, 1, 2])).toBe(1);
  });

  it("handles array correct answer with single user answer", () => {
    expect(scoreAnswer(1, [0, 1, 2])).toBe(1);
    expect(scoreAnswer(3, [0, 1, 2])).toBe(0);
  });
});

describe("isCorrect", () => {
  it("returns true only for full credit", () => {
    expect(isCorrect(2, 2)).toBe(true);
    expect(isCorrect(1, 2)).toBe(false);
    expect(isCorrect([0, 1], [0, 1, 2])).toBe(false);
    expect(isCorrect([0, 1, 2], [0, 1, 2])).toBe(true);
  });
});

describe("normalizeDimensionScores", () => {
  it("returns nulls for empty input", () => {
    const result = normalizeDimensionScores(null);
    expect(result.logic).toBeNull();
    expect(result.math).toBeNull();
    expect(result.vocab).toBeNull();
    expect(result.event).toBeNull();
  });

  it("preserves valid numbers", () => {
    const result = normalizeDimensionScores({ logic: 80, math: 60 });
    expect(result.logic).toBe(80);
    expect(result.math).toBe(60);
    expect(result.vocab).toBeNull();
    expect(result.event).toBeNull();
  });

  it("ignores non-number values", () => {
    const result = normalizeDimensionScores({ logic: "bad", math: null });
    expect(result.logic).toBeNull();
    expect(result.math).toBeNull();
  });
});

describe("normalCDF", () => {
  it("returns ~0.5 at x=0", () => {
    expect(normalCDF(0)).toBeCloseTo(0.5, 4);
  });

  it("returns ~0.841 at x=1 (one sigma above mean)", () => {
    expect(normalCDF(1)).toBeCloseTo(0.8413, 2);
  });

  it("returns ~0.977 at x=2", () => {
    expect(normalCDF(2)).toBeCloseTo(0.9772, 2);
  });

  it("returns ~0.159 at x=-1", () => {
    expect(normalCDF(-1)).toBeCloseTo(0.1587, 2);
  });

  it("handles very negative values", () => {
    expect(normalCDF(-10)).toBeCloseTo(0, 10);
  });

  it("handles very positive values", () => {
    expect(normalCDF(10)).toBeCloseTo(1, 10);
  });
});

describe("abilityToDegradationIndex", () => {
  it("theta=0 maps to ~50", () => {
    expect(abilityToDegradationIndex(0)).toBe(50);
  });

  it("theta=1.5 maps to single digits (peak)", () => {
    const index = abilityToDegradationIndex(1.5);
    expect(index).toBeLessThanOrEqual(10);
    expect(index).toBeGreaterThanOrEqual(0);
  });

  it("theta=-1.5 maps to high index (decline)", () => {
    const index = abilityToDegradationIndex(-1.5);
    expect(index).toBeGreaterThanOrEqual(90);
  });

  it("clamps to [0, 100]", () => {
    expect(abilityToDegradationIndex(5)).toBe(0);
    expect(abilityToDegradationIndex(-5)).toBe(100);
  });
});

describe("thetaToDimensionScore", () => {
  it("returns 0-100 range", () => {
    expect(thetaToDimensionScore(0)).toBe(50);
    expect(thetaToDimensionScore(2)).toBeGreaterThan(95);
    expect(thetaToDimensionScore(-2)).toBeLessThan(5);
  });
});

describe("calculateResult", () => {
  const makeQuestion = (type: string, answer: number) => ({
    id: 1,
    type,
    question: "test?",
    options: ["A", "B", "C", "D"],
    answer,
    explanation: "",
    dimension:
      type === "event-cause" || type === "event-argument"
        ? ("event" as const)
        : (type as "logic" | "math" | "vocab" | "event"),
  });

  it("computes score for all correct answers", () => {
    const questions = [
      { ...makeQuestion("logic", 0), id: 1 },
      { ...makeQuestion("math", 1), id: 2 },
      { ...makeQuestion("vocab", 2), id: 3 },
    ];
    const result = calculateResult([0, 1, 2], [false, false, false], questions);
    expect(result.correctCount).toBe(3);
    expect(result.score).toBe(100);
    expect(result.degradationIndex).toBe(0);
    expect(result.estimationMethod).toBe("percentage");
  });

  it("computes score for mixed answers", () => {
    const questions = [
      { ...makeQuestion("logic", 0), id: 1 },
      { ...makeQuestion("math", 1), id: 2 },
      { ...makeQuestion("vocab", 2), id: 3 },
    ];
    const result = calculateResult([0, null, 2], [false, true, false], questions);
    expect(result.correctCount).toBe(2);
    expect(result.score).toBeCloseTo(66.67, 0);
  });

  it("computes per-dimension scores", () => {
    const questions = [
      { ...makeQuestion("logic", 0), id: 1, type: "logic" as const, dimension: "logic" as const },
      { ...makeQuestion("logic", 1), id: 2, type: "logic" as const, dimension: "logic" as const },
      { ...makeQuestion("math", 2), id: 3, type: "math" as const, dimension: "math" as const },
    ];
    const result = calculateResult([0, 0, 2], [false, false, false], questions);
    expect(result.dimensionScores.logic).toBe(50);
    expect(result.dimensionScores.math).toBe(100);
  });

  it("maps event sub-types to event dimension", () => {
    const questions = [
      { ...makeQuestion("event-cause", 0), id: 1 },
      { ...makeQuestion("event-argument", 1), id: 2 },
    ];
    // Both correct → 100%
    const result = calculateResult([0, 1], [false, false], questions);
    expect(result.dimensionScores.event).toBe(100);
    expect(result.dimensionScores.logic).toBeNull();
  });
});

describe("getTierByIndex", () => {
  it("returns cognitivePeak for index 0", () => {
    expect(getTierByIndex(0).tierKey).toBe("cognitivePeak");
  });

  it("returns severeDecline for index 100", () => {
    expect(getTierByIndex(100).tierKey).toBe("severeDecline");
  });

  it("returns correct boundary tiers", () => {
    expect(getTierByIndex(20).tierKey).toBe("cognitivePeak");
    expect(getTierByIndex(21).tierKey).toBe("mildDecline");
    expect(getTierByIndex(40).tierKey).toBe("mildDecline");
    expect(getTierByIndex(41).tierKey).toBe("moderateDecline");
  });
});

describe("getChallengeCopy", () => {
  it("includes the score in the message", () => {
    expect(getChallengeCopy("cognitivePeak", 42)).toContain("42");
  });

  it("returns a message for unknown tier", () => {
    expect(getChallengeCopy("unknown", 50)).toBeTruthy();
  });
});
