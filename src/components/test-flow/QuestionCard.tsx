"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/questions";
import { QUESTION_TIME } from "@/lib/questions";
import { QuestionTimer } from "./QuestionTimer";
import { renderEmphasized } from "./helpers";

interface QuestionCardProps {
  questions: Question[];
  currentQ: number;
  answers: (number | null)[];
  timeLeft: number;
  selected: number | null;
  isLastQuestion: boolean;
  handleSelectOption: (i: number) => void;
  handleNext: () => void;
}

export function QuestionCard({
  questions,
  currentQ,
  answers,
  timeLeft,
  selected,
  isLastQuestion,
  handleSelectOption,
  handleNext,
}: QuestionCardProps) {
  const n = useTranslations();
  const question = questions[currentQ];
  if (!question) return null;

  return (
    <Card className="mx-auto w-full max-w-lg border-0 shadow-lg sm:border md:max-w-xl lg:max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {currentQ + 1}/{questions.length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {n("question.category." + question.category)}
            </Badge>
          </div>
          <QuestionTimer remaining={timeLeft} total={QUESTION_TIME} />
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex gap-1">
          {questions.map((_, i) => {
            const isAnswered = answers[i] !== undefined;
            const isCurrent = i === currentQ;
            return (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  isAnswered
                    ? "bg-primary"
                    : isCurrent
                      ? "bg-primary/40"
                      : "bg-muted"
                }`}
              />
            );
          })}
        </div>

        <CardTitle className="mt-4 whitespace-pre-line text-lg leading-relaxed">
          {question.question}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect =
            answers[currentQ] !== undefined && question.answer === i;
          const isWrong = answers[currentQ] === i && !isCorrect;

          const showFeedback = answers[currentQ] !== undefined;

          return (
            <button
              key={i}
              disabled={answers[currentQ] !== undefined}
              onClick={() => handleSelectOption(i)}
              className={`w-full rounded-lg border-2 p-4 text-left text-sm transition-all active:scale-[0.98] ${
                showFeedback
                  ? isCorrect
                    ? "border-green-500 bg-green-50 text-green-800"
                    : isWrong
                      ? "border-red-500 bg-red-50 text-red-800"
                      : "border-muted opacity-60"
                  : isSelected
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50 hover:bg-accent"
              }`}
            >
              <span className="font-medium">
                {String.fromCharCode(65 + i)}.
              </span>{" "}
              {renderEmphasized(option)}
            </button>
          );
        })}
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          size="lg"
          className="w-full text-base"
          disabled={selected === null}
          onClick={handleNext}
        >
          {isLastQuestion
            ? n("testing.finishButton")
            : n("testing.nextButton")}
        </Button>
      </CardFooter>
    </Card>
  );
}
