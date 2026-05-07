/**
 * LLM question generator using OpenAI-compatible API (DeepSeek).
 *
 * Generates single MCQ questions, validates them, and returns structured Question objects.
 */
import OpenAI from "openai";
import { buildGeneratePrompt, type GeneratePromptInput } from "./prompts";
import { validateGeneratedQuestion } from "./validator";
import type { Question } from "@/lib/question-bank/types";

const client = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL ?? "https://api.deepseek.com/",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const MODEL = process.env.OPENAI_MODEL ?? "deepseek-v4-flash";

/* ─── Thinking / reasoning config from env ─── */

/** Maps user-friendly effort values to API values. */
function resolveEffort(raw: string | undefined): "high" | "max" {
  switch (raw?.toLowerCase()) {
    case "high":
      return "high";
    case "max":
      return "max";
    default:
      return "high";
  }
}

function thinkingEnabled(): boolean {
  return process.env.OPENAI_THINKING_ENABLED !== "disabled";
}

function reasoningEffort(): "high" | "max" {
  return resolveEffort(process.env.OPENAI_REASONING_EFFORT);
}

export interface GenerateResult {
  question: Question;
  raw: string;
}

/**
 * Generate a single MCQ question via LLM.
 * Retries up to `maxRetries` times on validation failure.
 */
export async function generateQuestion(
  input: GeneratePromptInput,
  maxRetries = 2,
): Promise<GenerateResult> {
  const { system, user } = buildGeneratePrompt(input);
  let lastError: string | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const params: Record<string, unknown> = {
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7 + attempt * 0.1,
        max_tokens: 1024,
      };

      if (thinkingEnabled()) {
        params.reasoning_effort = reasoningEffort();
        params.extra_body = { thinking: { type: "enabled" } };
      }

      const response = await client.chat.completions.create(params as any);

      const raw = response.choices[0]?.message?.content ?? "";
      if (!raw) {
        lastError = "Empty response";
        continue;
      }

      const parsed = JSON.parse(raw);
      const question = validateGeneratedQuestion(parsed, input.locale, input.type);

      question.source = "llm";
      question.difficulty = input.difficulty;
      question.guessing ??= 0.25;
      question.discrimination ??= 1.0;

      return { question, raw };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Failed to generate question after ${maxRetries + 1} attempts: ${lastError}`);
}

/**
 * Generate multiple questions in parallel (batch).
 * Failed generations are returned as null and can be retried individually.
 */
export async function generateQuestions(
  inputs: GeneratePromptInput[],
  concurrency = 3,
): Promise<(GenerateResult | null)[]> {
  const results: (GenerateResult | null)[] = new Array(inputs.length).fill(null);
  let idx = 0;

  async function worker() {
    while (idx < inputs.length) {
      const i = idx++;
      try {
        results[i] = await generateQuestion(inputs[i]);
      } catch {
        // null = failed
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

export function llmEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
