# SEO Implementation Design

Date: 2026-06-08
Status: approved

## Overview

Full SEO implementation for Cognitive Rustproof (cortex.hydroroll.team), covering technical SEO foundation, content engine, social sharing optimization, and multilingual SEO across zh-CN, en, and ja.

## Sections

1. Technical SEO Foundation
2. Content Engine (Articles/Blog)
3. Social Sharing Optimization
4. Multilingual SEO
5. Measurement

---

## 1. Technical SEO Foundation

### New files

| File | Purpose |
|------|---------|
| `src/app/robots.ts` | Robots.txt pointing to sitemap index |
| `src/app/sitemap.ts` | Dynamic sitemap with all pages, alternates per locale |
| `src/app/not-found.tsx` | Custom 404 page |

### Existing file changes

| File | Change |
|------|--------|
| `src/app/[locale]/layout.tsx` | Add JSON-LD WebApplication schema, hreflang alternates, canonical URL |
| `src/app/[locale]/about/page.tsx` | Add `generateMetadata` with title, description, OG images |
| `src/app/[locale]/stats/page.tsx` | Split into server component wrapper (metadata) + client component (interactivity) |
| `src/app/[locale]/articles/page.tsx` | New: article list page |
| `src/app/[locale]/articles/[slug]/page.tsx` | New: article detail page |

### Structured data types

- **Home/Landing**: `WebApplication` (applicationCategory: HealthApplication)
- **About page**: `Article`
- **Article pages**: `Article` with author, datePublished, dateModified
- **Stats page**: `Dataset`

### Sitemap structure

- All locale-prefixed paths (`/en`, `/zh-CN`, `/ja`)
- Each path includes `<xhtml:link rel="alternate" hreflang="...">` entries
- Article pages listed with `lastmod` and `changefreq=weekly`
- Static pages with `changefreq=monthly`

---

## 2. Content Engine

### Route structure

```
/src/app/[locale]/articles/
  page.tsx              ← article listing
  [slug]/
    page.tsx            ← article detail (generateStaticParams for SSG)
```

### Content storage

Content lives in message namespaces under `messages/{locale}.json`:

- `articles.list` — listing page translations
- `articles.{slug}` — per-article content (title, body paragraphs, CTA)

This avoids adding a CMS or MDX dependency.

### Initial 3 articles

| Slug | zh-CN | en | ja |
|------|-------|----|-----|
| `ai-making-you-dumber` | AI 正在让你变笨吗？ | Is AI Making You Dumber? | AIがあなたを鈍らせている？ |
| `brain-fitness-guide` | 大脑防锈指南 | Brain Fitness Guide | 脳の"サビ"防止ガイド |
| `how-cognitive-test-works` | 这个测试凭什么测出认知状态 | How This Test Actually Works | このテストの仕組み |

### Per-article SEO

- Custom `generateMetadata` with article-specific OG image via `@vercel/og`
- JSON-LD `Article` schema
- Internal CTA links to the test
- `generateStaticParams` for build-time static generation of all article×locale combinations

---

## 3. Social Sharing Optimization

- Add `og:site_name`, `og:locale`, `og:locale:alternate` to layout metadata
- Share page OG: add challenge-style copy per tier (e.g., "I scored X — think you can beat me?")
- Ensure share page metadata renders before redirect

---

## 4. Multilingual SEO

- hreflang tags on every page via layout metadata alternates
- `metadataBase` already set to `https://cortex.hydroroll.team`
- Locale-specific paths: `/en`, `/zh-CN`, `/ja`
- Default locale (zh-CN) accessible at root `/` via cookie-based redirect
- Article content: human-written per locale, not machine-translated

---

## 5. Measurement

- Vercel Analytics for traffic monitoring
- Google Search Console for indexing status, keyword rankings, and click-through rates
- Track: indexed pages count, top keywords by locale, CTR per page type (home / article / share / stats)

---

## Implementation order

1. Technical foundation (robots.txt, sitemap, structured data, metadata fixes)
2. Article engine (pages, first 3 articles)
3. Social sharing polish
4. Search Console + Analytics setup
5. Ongoing: monthly articles, backlink outreach
