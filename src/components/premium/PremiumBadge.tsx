"use client";

import { Badge } from "@/components/ui/badge";
import { usePremium } from "./usePremium";

export function PremiumBadge() {
  const { isPremium } = usePremium();
  if (!isPremium) return null;
  return (
    <Badge variant="default" className="bg-amber-500 text-white text-xs">
      ✦ Premium
    </Badge>
  );
}
