/**
 * LLM question generator using OpenAI-compatible API (DeepSeek).
 *
 * Generates single MCQ questions, validates them, and returns structured Question objects.
 */
import OpenAI from "openai";
import type { ChatCompletionCreateParamsStreaming } from "openai/resources/chat/completions";
import { buildGeneratePrompt, type GeneratePromptInput } from "./prompts";
import { validateGeneratedQuestion } from "./validator";
import type { Question } from "@/lib/question-bank/types";

const client = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL ?? "https://api.deepseek.com/",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const MODEL = process.env.OPENAI_MODEL ?? "deepseek-v4-flash";

type DeepSeekStreamingParams = Omit<
  ChatCompletionCreateParamsStreaming,
  "reasoning_effort"
> & {
  reasoning_effort?: "high" | "max";
  extra_body?: { thinking: { type: "enabled" } };
};

type ReasoningDelta = {
  content?: string | null;
  reasoning_content?: string | null;
};

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
 * Generate a single MCQ question via LLM (SSE streaming).
 * Retries up to `maxRetries` times on validation failure.
 *
 * DeepSeek sends SSE keep-alive comments (`: keep-alive`) during long
 * thinking periods. The OpenAI SDK's EventStream parser ignores SSE
 * comments transparently, so no special handling is needed.
 */
export async function generateQuestion(
  input: GeneratePromptInput,
  maxRetries = 2,
): Promise<GenerateResult> {
  const { system, user } = buildGeneratePrompt(input);
  let lastError: string | null = null;

  const traceId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[LLM:${traceId}] generating | locale=${input.locale} type=${input.type} difficulty=${input.difficulty}`);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const params: DeepSeekStreamingParams = {
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        stream: true,
        stream_options: { include_usage: true },
        temperature: 0.7 + attempt * 0.1,
        max_tokens: 1024,
      };

      if (thinkingEnabled()) {
        params.reasoning_effort = reasoningEffort();
        params.extra_body = { thinking: { type: "enabled" } };
      }

      const start = performance.now();
      const stream = await client.chat.completions.create(
        params as unknown as ChatCompletionCreateParamsStreaming,
      );

      let raw = "";
      let reasoning = "";
      let finishReason: string | null = null;
      let usage: { prompt_tokens?: number; completion_tokens?: number } | null = null;

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta as ReasoningDelta | undefined;
        if (delta?.content) raw += delta.content;
        if (delta?.reasoning_content) reasoning += delta.reasoning_content;

        if (chunk.choices?.[0]?.finish_reason) {
          finishReason = chunk.choices[0].finish_reason;
        }

        // The `include_usage` chunk has choices=[] and usage populated
        if (chunk.usage) {
          usage = chunk.usage;
        }
      }

      const elapsed = (performance.now() - start).toFixed(0);
      const usageStr = usage
        ? `prompt_tokens=${usage.prompt_tokens} completion_tokens=${usage.completion_tokens}`
        : "";

      console.log(`[LLM:${traceId}] attempt=${attempt} ${elapsed}ms finish_reason=${finishReason} ${usageStr}`);
      if (reasoning) {
        console.log(`[LLM:${traceId}] reasoning=${reasoning.slice(0, 300)}`);
      }
      console.log(`[LLM:${traceId}] <<< ${raw.slice(0, 500)}`);

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

      console.log(`[LLM:${traceId}] ✓ validated | answer=${question.answer}`);
      return { question, raw };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[LLM:${traceId}] attempt=${attempt} FAILED: ${lastError}`);
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
