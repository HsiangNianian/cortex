import { QUESTIONS_PER_TEST } from "./questions";
import { getChallengeCopy } from "./scoring";

interface OgImageParams {
  index: number;
  tierKey: string;
  correct: string | number;
  challenge?: string;
}

export function buildOgImageUrl({
  index,
  tierKey,
  correct,
  challenge,
}: OgImageParams): string {
  const params = new URLSearchParams({
    i: String(index),
    t: tierKey,
    c: String(correct),
    n: String(QUESTIONS_PER_TEST),
  });

  if (challenge) {
    params.set("challenge", challenge);
  }

  return `/api/og?${params.toString()}`;
}

export function buildShareMetadataText({
  siteTitle,
  tierKey,
  tierLabel,
  index,
}: {
  siteTitle: string;
  tierKey: string;
  tierLabel: string;
  index: number;
}) {
  return {
    title: `${siteTitle} — ${tierLabel}`,
    description: getChallengeCopy(tierKey, index),
  };
}
