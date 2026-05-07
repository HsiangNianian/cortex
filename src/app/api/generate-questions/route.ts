/**
 * POST /api/generate-questions
 *
 * Generates a single MCQ question via LLM (DeepSeek) with Redis caching
 * and per-IP rate limiting.
 *
 * Caches questions in Redis by (locale, type, difficulty_bucket) as a JSON array.
 * On request, pops one from cache if available; otherwise generates a new one.
 *
 * Body: {
 *   locale: "zh-CN"|"en"|"ja",
 *   type: "logic"|"math"|"vocab",
 *   difficulty: number,       // IRT b-parameter
 *   usedQuestions?: string[]  // short summaries of already-used questions to avoid dupes
 * }
 *
 * Response 200: { question: Question, cached: boolean }
 * Response 429: { error: "Rate limit exceeded..." }
 * Response 502: { error: "Question generation failed: ..." }
 */
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { generateQuestion } from "@/lib/llm/generator";
import type { Question } from "@/lib/question-bank/types";

function getRedis(): Redis {
  return Redis.fromEnv();
}

const CACHE_TTL = 60 * 60 * 24; // 24 h
const MAX_QUESTIONS_PER_BUCKET = 10;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_TTL = 60 * 60 * 24; // 24 h
const VALID_TYPES = ["logic", "math", "vocab"] as const;

function bucketDifficulty(d: number): string {
  return String(Math.round(d * 2) / 2);
}
function cacheKey(locale: string, type: string, bucket: string): string {
  return `cortex:llm-q:${locale}:${type}:${bucket}`;
}
function rateLimitKey(ip: string): string {
  return `cortex:llm:rate:${ip}:${new Date().toISOString().slice(0, 10)}`;
}
function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { locale, type, difficulty, usedQuestions } = body as {
      locale: string;
      type: string;
      difficulty: number;
      usedQuestions?: string[];
    };

    // ── Validate ──
    if (!locale || !type || difficulty === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: locale, type, difficulty" },
        { status: 400 },
      );
    }
    if (!(VALID_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
    }
    if (typeof difficulty !== "number" || isNaN(difficulty)) {
      return NextResponse.json({ error: "difficulty must be a number" }, { status: 400 });
    }

    const redis = getRedis();
    const ip = getClientIP(request);
    const bucket = bucketDifficulty(difficulty);
    const cKey = cacheKey(locale, type, bucket);
    const rKey = rateLimitKey(ip);

    // ── Rate limit ──
    const pipe = redis.pipeline();
    pipe.incr(rKey);
    pipe.expire(rKey, RATE_LIMIT_TTL, "NX");
    const [count] = (await pipe.exec<number[]>()) ?? [0];
    if (count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 20 LLM-generated questions per day." },
        { status: 429 },
      );
    }

    // ── Try cache pop ──
    const raw = await redis.get<string>(cKey);
    if (raw) {
      try {
        const pool: Question[] = JSON.parse(raw);
        if (Array.isArray(pool) && pool.length > 0) {
          const question = pool.shift()!;
          // Re-cache remaining (or delete if empty)
          if (pool.length > 0) {
            await redis.setex(cKey, CACHE_TTL, JSON.stringify(pool));
          } else {
            await redis.del(cKey);
          }
          return NextResponse.json({ question, cached: true });
        }
      } catch {
        // corrupt cache — delete and regenerate
        await redis.del(cKey);
      }
    }

    // ── Cache miss → generate ──
    try {
      const result = await generateQuestion({
        locale,
        type: type as "logic" | "math" | "vocab",
        difficulty,
        usedQuestions: usedQuestions ?? [],
      });

      // Refill cache in background (fire-and-forget).
      // Don't await — we already have the question the user needs.
      void refillCache(redis, cKey, result.question);

      return NextResponse.json({ question: result.question, cached: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("LLM generation error:", msg);
      return NextResponse.json(
        { error: `Question generation failed: ${msg}` },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("POST /api/generate-questions error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Fire-and-forget: add the newly generated question to the cache pool.
 * If the pool is still small (< 3), don't bother refilling more — the
 * next request will trigger a fresh generation organically.
 */
async function refillCache(redis: Redis, key: string, question: Question): Promise<void> {
  try {
    let pool: Question[] = [];
    const raw = await redis.get<string>(key);
    if (raw) {
      try {
        pool = JSON.parse(raw);
      } catch {
        pool = [];
      }
    }
    pool.push(question);
    if (pool.length > MAX_QUESTIONS_PER_BUCKET) {
      pool = pool.slice(-MAX_QUESTIONS_PER_BUCKET);
    }
    await redis.setex(key, CACHE_TTL, JSON.stringify(pool));
  } catch {
    // best-effort
  }
}
