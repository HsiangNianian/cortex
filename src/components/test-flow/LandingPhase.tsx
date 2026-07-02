"use client";

import { useState, useEffect, type ReactNode, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QUESTIONS_PER_TEST, QUESTION_TIME } from "@/lib/questions";
import type { DimensionScores } from "@/lib/scoring";
import type { SavedProgress } from "./helpers";
import { SiteGoal } from "@/components/site-goal";
import {
  CooldownBanner,
  usePremium,
  CommunityBanner,
  AnnouncementDialog,
  ManagePremiumLink,
} from "../premium-seam";
import { MAX_FREE_TESTS } from "./useTestState";
import { useFestivalTemplate } from "../festival/FestivalTemplateProvider";

interface LandingPhaseProps {
  savedResult: {
    degradationIndex: number;
    tierLabel: string;
    tierColor: string;
    tierLabelKey?: string;
    correctCount: number;
    totalQuestions: number;
    dimensionScores?: DimensionScores;
    timestamp: number;
  } | null;
  savedProgress: SavedProgress | null;
  challengeRef: number | null;
  questionMarkRef: RefObject<HTMLDivElement | null>;
  handleStart: () => void;
  handleResume: () => void;
  handleViewLastResult: () => void;
  cooldownEndsAt: number;
  cooldownVersion: number;
  freeTestUsedCount: number;
  children?: ReactNode;
}

export function LandingPhase({
  savedResult,
  savedProgress,
  challengeRef,
  questionMarkRef,
  handleStart,
  handleResume,
  handleViewLastResult,
  cooldownEndsAt,
  cooldownVersion,
  freeTestUsedCount,
}: LandingPhaseProps) {
  const n = useTranslations();
  const { isPremium } = usePremium();
  const { activeTemplate } = useFestivalTemplate();
  const isChallenge = challengeRef !== null;
  const [cooldownDismissed, setCooldownDismissed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCooldownDismissed(false);
  }, [cooldownVersion]);

  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setCurrentTime(Date.now());
  }, []);
  const isCoolingDown = cooldownEndsAt > currentTime && !cooldownDismissed;

  return (
    <>
      {isCoolingDown && (
        <CooldownBanner
          cooldownEndsAt={cooldownEndsAt}
          onClose={() => setCooldownDismissed(true)}
        />
      )}
      <div className="mx-auto w-full max-w-lg space-y-4 md:max-w-xl lg:max-w-2xl">
        <Card className="border-0 shadow-lg sm:border">
          <CardHeader className="text-center">
            <div
              ref={questionMarkRef}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5"
            >
              <span className="question-mark text-2xl font-bold text-primary">
                {activeTemplate?.id === "dragonboat" ? "🎋" : "?"}
              </span>
            </div>
            <CardTitle className="text-2xl tracking-tight">{n("landing.title")}</CardTitle>
            <CardDescription className="mt-3 text-base leading-relaxed">
              {isChallenge ? (
                <>
                  {n("landing.challengePrefix")}{" "}
                  <span className="font-bold text-foreground">{challengeRef}</span>{" "}
                  {n("landing.challengeSuffix")}
                </>
              ) : (
                <>{n("landing.defaultSubtitle", { count: QUESTIONS_PER_TEST })}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SiteGoal />
            <CommunityBanner />

            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{QUESTIONS_PER_TEST}</span>{" "}
                {n("landing.questionsCount", { count: QUESTIONS_PER_TEST })}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  ~{Math.ceil((QUESTIONS_PER_TEST * QUESTION_TIME) / 60)}
                </span>{" "}
                {n("landing.timeEstimate", {
                  minutes: Math.ceil((QUESTIONS_PER_TEST * QUESTION_TIME) / 60),
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{n("landing.noAiLabel")}</span>{" "}
                {n("landing.noAiSubtext")}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3 text-xs leading-relaxed text-amber-700 dark:border-amber-800/30 dark:bg-amber-950/30 dark:text-amber-400">
              {n("landing.disclaimer")}
            </div>

            {savedResult && (
              <div
                className="cursor-default rounded-lg p-3 text-sm"
                style={{
                  backgroundColor: savedResult.tierColor + "15",
                  borderLeft: `3px solid ${savedResult.tierColor}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{n("landing.lastTestLabel")}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(savedResult.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: savedResult.tierColor }}>
                    {savedResult.degradationIndex}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {n("landing.lastTestDegradation")}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: savedResult.tierColor }}
                  >
                    {savedResult.tierLabelKey
                      ? n("tier." + savedResult.tierLabelKey)
                      : savedResult.tierLabel}
                  </span>
                </div>
                <button
                  onClick={handleViewLastResult}
                  className="mt-2 text-xs underline underline-offset-4 transition-colors hover:text-foreground"
                  style={{ color: savedResult.tierColor }}
                >
                  {n("landing.viewLastResult")}
                </button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            {savedProgress && !isChallenge ? (
              <>
                <Button size="lg" className="w-full text-base" onClick={handleResume}>
                  {n("landing.resumeButton")}
                  <span className="ml-2 text-sm opacity-70">
                    {n("landing.resumeProgress", {
                      done: savedProgress.answers.length,
                      total: QUESTIONS_PER_TEST,
                    })}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-sm text-muted-foreground"
                  onClick={handleStart}
                >
                  {n("landing.restartButton")}
                </Button>
              </>
            ) : (
              (() => {
                const cooldownRemaining =
                  cooldownEndsAt > currentTime ? cooldownEndsAt - currentTime : 0;
                const cooldownText =
                  cooldownRemaining > 0
                    ? (() => {
                        const h = Math.ceil(cooldownRemaining / (1000 * 60 * 60));
                        const d = Math.floor(h / 24);
                        const rh = h % 24;
                        return d > 0 && rh > 0 ? `${d}d${rh}h` : d > 0 ? `${d}d` : `${rh}h`;
                      })()
                    : null;
                const badgeText = isPremium
                  ? null
                  : isCoolingDown
                    ? ` (${cooldownText})`
                    : ` (${freeTestUsedCount}/${MAX_FREE_TESTS})`;
                return (
                  <Button size="lg" className="w-full text-base" onClick={handleStart}>
                    {savedResult ? n("landing.retakeButton") : n("landing.ctaButton")}
                    {badgeText && (
                      <span className="ml-2 text-sm tabular-nums opacity-70">{badgeText}</span>
                    )}
                  </Button>
                );
              })()
            )}
            <Link
              href="/stats"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {n("landing.viewStats")}
            </Link>
            <ManagePremiumLink />
          </CardFooter>
        </Card>
      </div>

      <AnnouncementDialog />
    </>
  );
}
