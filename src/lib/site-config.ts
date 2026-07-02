/**
 * Centralized site configuration.
 * All personal/deployment-specific values are read from environment variables
 * so the public repository contains no hardcoded domains or IDs.
 *
 * Deployers set NEXT_PUBLIC_SITE_URL (and friends) via env / Cloudflare vars.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Bare host (no protocol), e.g. "cortex.example.com" — for share text / watermarks. */
export const SITE_HOST = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return SITE_URL;
  }
})();

/** Author / project URL shown in about page etc. (defaults to the repo). */
export const AUTHOR_URL = process.env.NEXT_PUBLIC_AUTHOR_URL ?? "https://github.com/HsiangNianian";

/** Optional QQ group link for the community banner (empty = hidden). */
export const QQ_GROUP_URL = process.env.NEXT_PUBLIC_QQ_GROUP_URL ?? "";

/** Optional Discord invite for the community banner (empty = hidden). */
export const DISCORD_INVITE_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "";

/** Optional cross-promotion game site (empty = hidden). */
export const GAME_SITE_URL = process.env.NEXT_PUBLIC_GAME_SITE_URL ?? "";

/** Afdian sponsor page (empty = hidden). */
export const AFDIAN_SPONSOR_URL = process.env.NEXT_PUBLIC_AFDIAN_SPONSOR_URL ?? "";

/**
 * Normalized base path for static-export deployment (e.g. GitHub Pages subpath).
 * Raw `fetch("/api/...")` calls must be prefixed with this, unlike
 * `<Link>` / `next/image` which auto-apply basePath.
 *
 * Guaranteed to be either "" or a leading-slash path WITHOUT trailing slash
 * (e.g. "/cortex"), read from the same env var as next.config.ts.
 */
const _raw = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const BASE_PATH = _raw ? "/" + _raw.replace(/^\/+|\/+$/g, "") : "";

/** Prefix a root-absolute path with the configured basePath. */
export function withBasePath(path: string): string {
  if (!BASE_PATH) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}
