"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { usePremium } from "./usePremium";
import { analyzeHistory, type TrendAnalysis } from "@/lib/premium/analysis";
import type { TestResult } from "@/lib/scoring";

interface TrendSectionProps {
  result: TestResult;
  isFirstTest: boolean;
}

export function TrendSection({ result, isFirstTest }: TrendSectionProps) {
  const { isPremium } = usePremium();
  const n = useTranslations();

  const analysis: TrendAnalysis | null = useMemo(() => {
    if (!isPremium) return null;
    try {
      const raw = localStorage.getItem("cognitive-rust-history");
      if (!raw) return null;
      const history = JSON.parse(raw);
      if (!Array.isArray(history) || history.length < 2) return null;
      return analyzeHistory(history);
    } catch {
      return null;
    }
  }, [isPremium, result]);

  if (analysis && analysis.dimensions.length >= 2) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          {analysis.overallTrend === "improving" ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-600" /> 整体呈改善趋势
            </>
          ) : analysis.overallTrend === "declining" ? (
            <>
              <TrendingDown className="h-4 w-4 text-red-600" /> 整体呈下降趋势
            </>
          ) : (
            <>
              <Minus className="h-4 w-4 text-muted-foreground" /> 整体保持稳定
            </>
          )}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            （{analysis.testCount} 次测试）
          </span>
        </p>
        <div className="space-y-2">
          {analysis.dimensions
            .filter((d) => d.delta !== null)
            .map((d) => (
              <div key={d.dimension} className="flex items-center gap-2 text-xs">
                <span className="w-16 text-muted-foreground">{d.label}</span>
                <span
                  className={`font-mono font-medium ${d.trend === "declining" ? "text-red-600" : d.trend === "improving" ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {d.delta !== null && d.delta > 0 ? "+" : ""}
                  {d.delta}%
                </span>
                <span className="text-muted-foreground truncate">{d.tip}</span>
              </div>
            ))}
        </div>
        {analysis.weakestDimension && (
          <p className="mt-2 text-xs text-muted-foreground">
            当前弱项：
            <span className="font-medium text-foreground">{analysis.weakestDimension.label}</span>
          </p>
        )}
      </div>
    );
  }

  if (!analysis && !isFirstTest && !isPremium) {
    return (
      <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">逐维度趋势分析</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          升级 Premium 后查看各维度认知变化趋势与改善建议
        </p>
        <Link
          href="/unlock"
          className="mt-3 inline-block rounded-full bg-foreground px-5 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
        >
          解锁 Premium
        </Link>
      </div>
    );
  }

  return null;
}
