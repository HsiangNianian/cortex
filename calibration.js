// 3PL IRT item parameter calibration via MLE
// Fixed guessing parameter c (default 0.25 for 4-option MC).
// Estimates discrimination a and difficulty b.
//
// Usage (Workers cron):
//   import { runCalibration } from "./calibration.js"
//   await runCalibration(env)

function itemFunc(theta, a, b, c) {
  const z = Math.exp(-a * (theta - b));
  return c + (1 - c) / (1 + z);
}

function negLogLikelihood(a, b, responses, c) {
  let ll = 0;
  for (const r of responses) {
    const P = itemFunc(r.theta, a, b, c);
    if (P <= 0 || P >= 1) continue;
    ll += r.correct * Math.log(P) + (1 - r.correct) * Math.log(1 - P);
  }
  return -ll;
}

/**
 * Calibrate a 3PL item using MLE with grid search + gradient ascent.
 *
 * @param {{ correct: number; theta: number }[]} responses
 * @param {{ c?: number; maxIter?: number; tol?: number; lr?: number; minResponses?: number }} [options]
 * @returns {{ a: number; b: number; c: number; n: number } | null}
 */
export function calibrate3PL(responses, options = {}) {
  const c = options.c ?? 0.25;
  const maxIter = options.maxIter ?? 100;
  const tol = options.tol ?? 1e-4;
  const lr = options.lr ?? 0.01;
  const minResponses = options.minResponses ?? 10;

  // Filter responses with valid theta values
  const valid = responses.filter(
    (r) => r.theta != null && Number.isFinite(r.theta),
  );
  if (valid.length < minResponses) return null;

  // ---- Step 1: Coarse grid search for starting point ----
  let bestLL = Infinity;
  let bestA = 1.0;
  let bestB = 0.0;

  for (let a = 0.2; a <= 3.01; a += 0.4) {
    for (let b = -3.0; b <= 3.01; b += 0.4) {
      const ll = negLogLikelihood(a, b, valid, c);
      if (ll < bestLL) {
        bestLL = ll;
        bestA = a;
        bestB = b;
      }
    }
  }

  // ---- Step 2: Gradient ascent refinement ----
  let a = bestA;
  let b = bestB;
  for (let iter = 0; iter < maxIter; iter++) {
    let gradA = 0;
    let gradB = 0;

    for (const r of valid) {
      const z = Math.exp(-a * (r.theta - b));
      const Psi = 1 / (1 + z);
      const P = c + (1 - c) * Psi;
      if (P <= 0 || P >= 1) continue;

      const residual = r.correct - P;
      const dP_dPsi = 1 - c;
      const dPsi_da = Psi * (1 - Psi) * (r.theta - b);
      const dPsi_db = -Psi * (1 - Psi) * a;
      const dP_da = dP_dPsi * dPsi_da;
      const dP_db = dP_dPsi * dPsi_db;

      gradA += (residual * dP_da) / (P * (1 - P));
      gradB += (residual * dP_db) / (P * (1 - P));
    }

    // Cap gradient magnitude to prevent wild jumps
    const maxGrad = 10;
    gradA = Math.max(-maxGrad, Math.min(maxGrad, gradA));
    gradB = Math.max(-maxGrad, Math.min(maxGrad, gradB));

    const newA = Math.max(0.1, Math.min(5.0, a + lr * gradA));
    const newB = Math.max(-5.0, Math.min(5.0, b + lr * gradB));

    if (Math.abs(newA - a) < tol && Math.abs(newB - b) < tol) break;
    a = newA;
    b = newB;
  }

  return {
    a: Math.round(a * 100) / 100,
    b: Math.round(b * 100) / 100,
    c,
    n: valid.length,
  };
}

/**
 * Run calibration across all questions with sufficient response data.
 * Called from the Workers cron scheduled handler.
 *
 * @param {{ CORTEX_DB: import("@cloudflare/workers-types").D1Database; CORTEX_KV: import("@cloudflare/workers-types").KVNamespace }} env
 */
export async function runCalibration(env) {
  if (!env.CORTEX_DB || !env.CORTEX_KV) {
    console.log("[calibration] Missing D1 or KV bindings, skipping");
    return;
  }

  // Find questions with >= 100 responses that have theta data
  const minResponses = 100;
  const candidates = await env.CORTEX_DB.prepare(
    `SELECT question_id, COUNT(*) as n, SUM(correct) as n_correct
     FROM item_responses
     WHERE theta IS NOT NULL
     GROUP BY question_id
     HAVING n >= ?`,
  )
    .bind(minResponses)
    .all();

  if (!candidates.results || candidates.results.length === 0) {
    console.log(
      `[calibration] No questions with >= ${minResponses} responses (have theta)`,
    );
    return;
  }

  console.log(
    `[calibration] Found ${candidates.results.length} candidate question(s)`,
  );

  let calibratedCount = 0;
  for (const q of candidates.results) {
    const responses = await env.CORTEX_DB.prepare(
      `SELECT correct, theta FROM item_responses
       WHERE question_id = ? AND theta IS NOT NULL
       ORDER BY created_at`,
    )
      .bind(q.question_id)
      .all();

    if (!responses.results || responses.results.length < minResponses) continue;

    const result = calibrate3PL(
      responses.results.map((r) => ({ correct: r.correct, theta: r.theta })),
    );

    if (result) {
      const kvKey = `calibrated_params:${q.question_id}`;
      await env.CORTEX_KV.put(kvKey, JSON.stringify(result));
      calibratedCount++;
      console.log(
        `[calibration] Q${q.question_id}: a=${result.a}, b=${result.b}, c=${result.c} (n=${result.n})`,
      );
    }
  }

  // Write aggregated key for efficient client-side fetching
  if (calibratedCount > 0) {
    const allParams = {};
    // Read back individual keys and aggregate
    for (const q of candidates.results) {
      try {
        const raw = await env.CORTEX_KV.get(`calibrated_params:${q.question_id}`);
        if (raw) {
          allParams[String(q.question_id)] = JSON.parse(raw);
        }
      } catch {
        // skip read failures
      }
    }
    await env.CORTEX_KV.put("calibrated_params:all", JSON.stringify(allParams));
    console.log(`[calibration] Wrote ${Object.keys(allParams).length} param(s) to aggregated key`);
  }

  console.log(
    `[calibration] Calibrated ${calibratedCount}/${candidates.results.length} question(s)`,
  );
}
