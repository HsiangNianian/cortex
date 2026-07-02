"use client";

import { useTranslations } from "next-intl";
import type { TestResult } from "@/lib/scoring";

interface CrossPromoSuggestionsProps {
  result: TestResult;
  isFirstTest: boolean;
}

export function CrossPromoSuggestions({ result, isFirstTest }: CrossPromoSuggestionsProps) {
  const n = useTranslations();
  if (isFirstTest) return null;

  const logicLow = result.dimensionScores.logic !== null && result.dimensionScores.logic < 60;
  const eventLow = result.dimensionScores.event !== null && result.dimensionScores.event < 60;
  if (!logicLow && !eventLow) return null;

  const title =
    logicLow && eventLow
      ? n("result.logicEventGameTitle")
      : logicLow
        ? n("result.logicGameTitle")
        : n("result.eventGameTitle");

  return (
    <>
      <div className="rounded-lg border border-dashed border-blue-300/30 bg-blue-50/50 p-4 text-center dark:bg-blue-950/10">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {n.rich("result.logicGameDesc", {
            game: (chunks) => (
              <a
                href="https://deadpan.hydroroll.team"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline-offset-2 hover:underline"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
      {result.dimensionScores.logic !== null && result.dimensionScores.logic >= 60 && (
        <div className="rounded-lg border border-dashed border-green-300/30 bg-green-50/50 p-4 text-center dark:bg-green-950/10">
          <p className="text-sm font-medium text-foreground">{n("result.logicGoodTitle")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {n.rich("result.logicGoodDesc", {
              lcti: (chunks) => (
                <a
                  href="https://lcti.hydroroll.team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-green-600 underline-offset-2 hover:underline"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      )}
    </>
  );
}
