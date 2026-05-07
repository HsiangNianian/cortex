"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProcessingPhase() {
  const n = useTranslations();

  return (
    <Card className="mx-auto w-full max-w-lg border-0 shadow-lg sm:border md:max-w-xl lg:max-w-2xl">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-2xl tracking-tight">
          {n("processing.title")}
        </CardTitle>
        <CardDescription>{n("processing.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        <p className="text-sm text-muted-foreground">
          {n("processing.message")}
        </p>
      </CardContent>
    </Card>
  );
}
