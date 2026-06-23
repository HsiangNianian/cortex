import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildOgImageUrl, buildShareMetadataText } from "../src/lib/metadata-utils";
import { QUESTIONS_PER_TEST } from "../src/lib/questions";

const ogUrl = buildOgImageUrl({ index: 50, tierKey: "moderateDecline", correct: "?" });
assert.equal(
  new URLSearchParams(ogUrl.split("?")[1]).get("n"),
  String(QUESTIONS_PER_TEST),
  "OG image URL should use QUESTIONS_PER_TEST",
);

const share = buildShareMetadataText({
  siteTitle: "Cognitive Rustproof",
  tierKey: "moderateDecline",
  tierLabel: "Moderate Decline",
  index: 42,
});
assert.equal(
  share.title,
  "Cognitive Rustproof — Moderate Decline",
  "share metadata should use the localized tier label",
);
assert.match(
  share.description,
  /42/,
  "share metadata description should include the challenge score",
);

const root = process.cwd();
// proxy.ts (Next.js 16 proxy convention) is optional — it provides
// request-level logic (redirects, headers) but is not required for
// basic operation. OpenNext/Cloudflare does not bundle it by default.
// https://nextjs.org/docs/app/api-reference/config/next-config-js/proxy

const ogRoute = readFileSync(join(root, "src", "app", "api", "og", "route.tsx"), "utf8");
assert.equal(
  /runtime\s*=\s*["']edge["']/.test(ogRoute),
  false,
  "OG route should not opt into Edge runtime when build warnings require static generation compatibility",
);
