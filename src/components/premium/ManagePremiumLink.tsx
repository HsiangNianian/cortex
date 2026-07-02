"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePremium } from "./usePremium";

export function ManagePremiumLink() {
  const n = useTranslations();
  const { isPremium } = usePremium();

  return (
    <Link
      href={isPremium ? "/premium" : "/unlock"}
      className="text-xs text-primary/70 underline-offset-4 hover:underline"
    >
      {isPremium ? n("landing.managePremium") : n("landing.activateLicense")}
    </Link>
  );
}
