"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { QUESTIONS_PER_TEST, QUESTION_TIME } from "@/lib/questions";

interface DeclarationPhaseProps {
  declared: boolean;
  setDeclared: (v: boolean) => void;
  aiUsage: number | null;
  setAiUsage: (v: number | null) => void;
  handleBeginTest: () => void;
  handleRestart: () => void;
}

export function DeclarationPhase({
  declared,
  setDeclared,
  aiUsage,
  setAiUsage,
  handleBeginTest,
  handleRestart,
}: DeclarationPhaseProps) {
  const n = useTranslations();
  const aiLevels = n.raw("declaration.aiLevels") as string[];
  const isAiExit = aiUsage !== null && aiUsage === aiLevels.length - 1;

  if (isAiExit) {
    return (
      <Card className="mx-auto w-full max-w-lg border-0 shadow-lg sm:border md:max-w-xl lg:max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{n("declaration.aiExitTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-6 text-center">
            {n("declaration.aiExitMessage").split("\n").map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground [&:not(:first-child)]:mt-4">
                {line}
              </p>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            size="lg"
            className="w-full text-base"
            onClick={() => setAiUsage(null)}
          >
            {n("declaration.aiExitBack")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleRestart}
          >
            {n("declaration.backButton")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-lg border-0 shadow-lg sm:border md:max-w-xl lg:max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{n("declaration.title")}</CardTitle>
        <CardDescription className="mt-2 text-sm leading-relaxed">
          {n("declaration.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-foreground">•</span>
            {n("declaration.quietEnv")}
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">•</span>
            {n("declaration.fullTime", {
              minutes: Math.ceil((QUESTIONS_PER_TEST * QUESTION_TIME) / 60),
            })}
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">•</span>
            {n("declaration.timeLimit", { seconds: QUESTION_TIME })}
          </li>
        </ul>

        {/* AI usage question */}
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-foreground">
            {n("declaration.aiUsageLabel")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {n("declaration.aiUsageHint")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {aiLevels.map(
              (opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setAiUsage(i)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                    aiUsage === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/20 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {opt}
                </button>
              ),
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-3 rounded-lg border p-4">
          <Checkbox
            id="declaration"
            checked={declared}
            onCheckedChange={(checked) => setDeclared(checked === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="declaration"
            className="text-sm leading-relaxed cursor-pointer"
          >
            {n("declaration.pledge")}
          </label>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          size="lg"
          className="w-full text-base"
          disabled={!declared || aiUsage === null}
          onClick={handleBeginTest}
        >
          {aiUsage !== null
            ? n("declaration.startButton")
            : n("declaration.selectAiFirst")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={handleRestart}
        >
          {n("declaration.backButton")}
        </Button>
      </CardFooter>
    </Card>
  );
}
