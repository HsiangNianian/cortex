"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { usePremium } from "./usePremium";
import type { TestResult, DimensionScores } from "@/lib/scoring";

interface AIInterpretSectionProps {
  result: TestResult;
  prevResult: {
    degradationIndex: number;
    dimensionScores?: DimensionScores;
    timestamp: number;
  } | null;
  isFirstTest: boolean;
}

export function AIInterpretSection({ result, prevResult, isFirstTest }: AIInterpretSectionProps) {
  const n = useTranslations();
  const locale = useLocale();
  const { isPremium, licenseKey } = usePremium();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cognitive-rust-result");
      if (!raw) return;
      const entry = JSON.parse(raw);
      if (!entry.timestamp) return;
      const cached = localStorage.getItem(`cortex:ai-interpret:${entry.timestamp}`);
      if (cached) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAiAnalysis(cached);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const testCount: number = (() => {
    try {
      const raw = localStorage.getItem("cognitive-rust-history");
      if (!raw) return 1;
      const history = JSON.parse(raw);
      return Array.isArray(history) ? history.length : 1;
    } catch {
      return 1;
    }
  })();

  if (isFirstTest) return null;

  async function handleAiInterpret() {
    if (!isPremium) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const body = {
        locale,
        degradationIndex: result.degradationIndex,
        tierLabelKey: result.tier.tierKey,
        dimensionScores: result.dimensionScores,
        thetaByType: result.thetaByType,
        prevResult: prevResult
          ? {
              degradationIndex: prevResult.degradationIndex,
              timestamp: prevResult.timestamp,
              dimensionScores: prevResult.dimensionScores,
            }
          : null,
        testCount,
      };
      const res = await fetch("/api/ai/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${licenseKey}`,
        },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        setAiError(n("result.interpretLimitExhausted"));
        setAiLoading(false);
        return;
      }
      if (!res.ok) throw new Error("API error");

      const contentType = res.headers.get("Content-Type") || "";

      if (contentType.includes("text/event-stream")) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullAnalysis = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.response) {
                  fullAnalysis += parsed.response;
                  setAiAnalysis(fullAnalysis);
                }
              } catch {
                /* ignore */
              }
            }
          }
        }

        try {
          const entryRaw = localStorage.getItem("cognitive-rust-result");
          if (entryRaw) {
            const entry = JSON.parse(entryRaw);
            if (entry.timestamp) {
              localStorage.setItem(`cortex:ai-interpret:${entry.timestamp}`, fullAnalysis);
            }
          }
        } catch {
          /* ignore */
        }
      } else {
        const data = await res.json();
        setAiAnalysis(data.analysis);
        try {
          const entryRaw = localStorage.getItem("cognitive-rust-result");
          if (entryRaw) {
            const entry = JSON.parse(entryRaw);
            if (entry.timestamp) {
              localStorage.setItem(`cortex:ai-interpret:${entry.timestamp}`, data.analysis);
            }
          }
        } catch {
          /* ignore */
        }
      }
    } catch {
      setAiError(n("result.aiInterpretError"));
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-950/20">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          {n("result.aiInterpretTitle")}
          <sup className="ml-0.5 text-sm text-amber-500">*</sup>
        </p>
        {isPremium ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handleAiInterpret}
            disabled={aiLoading}
          >
            {aiAnalysis ? n("result.aiInterpretRegenerate") : n("result.aiInterpretButton")}
          </Button>
        ) : null}
      </div>

      {!isPremium && (
        <div className="mt-2 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 p-3 text-center dark:border-amber-800 dark:bg-amber-950/20">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Premium 专属 · 基于你的测试数据生成个性化认知分析报告
          </p>
          <Link
            href="/unlock"
            className="mt-1.5 inline-block text-xs font-medium text-amber-600 underline-offset-2 hover:underline dark:text-amber-400"
          >
            升级查看 →
          </Link>
        </div>
      )}

      {isPremium && !aiAnalysis && !aiLoading && !aiError && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {n("result.aiInterpretDesc")}
        </p>
      )}

      {aiLoading && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {n("result.aiInterpretLoading")}
        </p>
      )}

      {aiError && <p className="mt-2 text-sm text-red-600">{aiError}</p>}

      {aiAnalysis && (
        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {aiAnalysis}
        </div>
      )}
    </div>
  );
}
