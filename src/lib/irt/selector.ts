import type { Question } from "../question-bank/types";
import { fisherInfo } from "./engine";

/**
 * Select the next question that maximises Fisher information at the
 * current ability estimate, filtered to a specific dimension/type.
 *
 * @param theta  - current ability estimate (logits)
 * @param candidates  - pool of available questions (pre-filtered by type/category)
 * @param usedIds  - set of question IDs already presented this test
 * @returns the most informative unused question, or null if pool exhausted
 */
export function selectNextQuestion(
  theta: number,
  candidates: Question[],
  usedIds: Set<number>,
): Question | null {
  let best: Question | null = null;
  let bestInfo = -Infinity;

  for (const q of candidates) {
    if (usedIds.has(q.id)) continue;

    const info = fisherInfo(
      theta,
      q.difficulty,
      q.discrimination ?? 1.0,
      q.guessing ?? 0.25,
    );

    if (info > bestInfo) {
      bestInfo = info;
      best = q;
    }
  }

  return best;
}

/**
 * Convenience wrapper that also excludes questions that have been used
 * and groups candidates by type so callers don't need to pre-filter.
 *
 * @returns the best question matching `type`, or null if none remain
 */
export function selectNextQuestionByType(
  theta: number,
  pool: Question[],
  usedIds: Set<number>,
  type: "logic" | "math" | "vocab",
): Question | null {
  const candidates = pool.filter((q) => q.type === type);
  return selectNextQuestion(theta, candidates, usedIds);
}
