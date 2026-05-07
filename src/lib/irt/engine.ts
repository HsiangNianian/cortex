import type { ResponseRecord, ThetaEstimate } from "./types";

/**
 * 3PL Item Response Function.
 * Returns P(θ) = probability of a correct response at ability θ.
 *
 * @param theta - examinee ability (logits)
 * @param b - item difficulty (IRT b-parameter)
 * @param a - discrimination (IRT a-parameter, default 1.0 for 1PL)
 * @param c - guessing (IRT c-parameter, default 0.25 for 4-option MCQ)
 */
export function irf(
  theta: number,
  b: number,
  a: number = 1.0,
  c: number = 0.25,
): number {
  const exponent = -a * (theta - b);
  const clamped = Math.max(-50, Math.min(50, exponent)); // prevent overflow
  return c + (1 - c) / (1 + Math.exp(clamped));
}

/**
 * Fisher information at ability θ for a given item.
 * Measures how much information the item provides at this ability level.
 *
 * For 1PL (c = 0): I(θ) = a² × P(θ) × (1 − P(θ))
 * For 3PL (c > 0): full formula accounting for guessing
 */
export function fisherInfo(
  theta: number,
  b: number,
  a: number = 1.0,
  c: number = 0.25,
): number {
  const p = irf(theta, b, a, c);
  const q = 1 - p;

  if (p <= 0 || q <= 0) return 0;

  if (c === 0) {
    // 1PL / Rasch simplification
    return a * a * p * q;
  }

  // Full 3PL formula
  const num = a * a * (p - c) ** 2 * q;
  const den = (1 - c) * (1 - c) * p;
  return num / den;
}

/**
 * Standard normal PDF.
 */
function normalPDF(x: number, mean: number = 0, sd: number = 1): number {
  const variance = sd * sd;
  return (
    Math.exp((-0.5 * (x - mean) * (x - mean)) / variance) /
    Math.sqrt(2 * Math.PI * variance)
  );
}

/**
 * EAP (Expected A Posteriori) ability estimation.
 *
 * Uses grid integration over [-4, +4] with 0.2 step (41 quadrature points).
 * Computations are done in log-space to prevent floating-point underflow
 * when multiplying many small probabilities.
 *
 * @param responses - array of scored responses
 * @param priorMean - prior mean on ability (default 0)
 * @param priorSd - prior SD on ability (default 1)
 */
export function estimateAbility(
  responses: ResponseRecord[],
  priorMean: number = 0,
  priorSd: number = 1,
): ThetaEstimate {
  const gridStart = -4;
  const gridEnd = 4;
  const gridStep = 0.2;

  const thetaGrid: number[] = [];
  const logPosterior: number[] = [];

  for (let theta = gridStart; theta <= gridEnd + 1e-10; theta += gridStep) {
    thetaGrid.push(theta);

    // Log-likelihood
    let logLikelihood = 0;
    for (const r of responses) {
      const p = irf(theta, r.difficulty, r.discrimination, r.guessing);
      // Clamp to avoid log(0)
      const cp = Math.max(1e-15, Math.min(1 - 1e-15, p));
      logLikelihood += r.score === 1 ? Math.log(cp) : Math.log(1 - cp);
    }

    // Log-prior
    const logPrior = Math.log(normalPDF(theta, priorMean, priorSd));

    logPosterior.push(logLikelihood + logPrior);
  }

  // Numerical stability: subtract max log-posterior before exponentiating
  const maxLog = Math.max(...logPosterior);
  const posterior = logPosterior.map((lp) => Math.exp(lp - maxLog));

  // Normalize
  const posteriorSum = posterior.reduce((a, b) => a + b, 0);
  const normalized = posterior.map((p) => p / posteriorSum);

  // EAP point estimate: Σ(θ × posterior)
  let thetaEAP = 0;
  for (let i = 0; i < thetaGrid.length; i++) {
    thetaEAP += thetaGrid[i] * normalized[i];
  }

  // Posterior variance: Σ(θ² × posterior) − EAP²
  let thetaSq = 0;
  for (let i = 0; i < thetaGrid.length; i++) {
    thetaSq += thetaGrid[i] * thetaGrid[i] * normalized[i];
  }
  const variance = thetaSq - thetaEAP * thetaEAP;
  const standardError = Math.sqrt(Math.max(0, variance));

  return {
    theta: Math.round(thetaEAP * 100) / 100,
    standardError: Math.round(standardError * 100) / 100,
    responses,
    priorMean,
    priorSd,
  };
}
