/**
 * BM25 full-text search over the question bank.
 *
 * Uses Intl.Segmenter for CJK word segmentation (built into modern runtimes),
 * whitespace tokenization for English, and the classic BM25 ranking formula.
 */

import type { Question } from "@/lib/question-bank/types"
import { bank as zhCN } from "@/lib/question-bank/zh-CN"
import { bank as en } from "@/lib/question-bank/en"
import { bank as ja } from "@/lib/question-bank/ja"

const BANKS: Record<string, Question[]> = { "zh-CN": zhCN, en, ja }

// ── BM25 parameters ──
const K1 = 1.5
const B = 0.75

// ── In-memory index built lazily per locale ──
type IndexEntry = {
  id: number
  terms: Map<string, number> // term → term frequency in this doc
  docLen: number
}
const indexCache = new Map<string, IndexEntry[]>()

// ── Tokenizer ──

function tokenize(text: string, locale: string): string[] {
  const tokens: string[] = []

  // CJK: use Intl.Segmenter for word-level segmentation
  if (locale === "zh-CN" || locale === "ja") {
    const seg = new Intl.Segmenter(locale === "zh-CN" ? "zh-Hans" : "ja", {
      granularity: "word",
    })
    for (const { segment, isWordLike } of seg.segment(text)) {
      if (isWordLike && segment.trim().length >= 1) {
        tokens.push(segment.toLowerCase())
      }
    }
    return tokens
  }

  // English / fallback: whitespace + punctuation cleanup
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
}

// ── Index builder ──

function buildIndex(locale: string): IndexEntry[] {
  const cached = indexCache.get(locale)
  if (cached) return cached

  const bank = BANKS[locale] ?? zhCN
  const entries: IndexEntry[] = []

  for (const q of bank) {
    const text = `${q.question} ${q.options.join(" ")}`
    const tokens = tokenize(text, locale)
    const termMap = new Map<string, number>()
    for (const t of tokens) {
      termMap.set(t, (termMap.get(t) ?? 0) + 1)
    }
    entries.push({ id: q.id, terms: termMap, docLen: tokens.length })
  }

  indexCache.set(locale, entries)
  return entries
}

// ── BM25 scoring ──

function computeBM25(
  queryTerms: string[],
  entries: IndexEntry[],
): { id: number; score: number }[] {
  const N = entries.length

  // Average doc length
  const totalLen = entries.reduce((s, e) => s + e.docLen, 0)
  const avgdl = totalLen / Math.max(N, 1)

  // Document frequency per term
  const df = new Map<string, number>()
  for (const t of queryTerms) {
    let count = 0
    for (const e of entries) {
      if (e.terms.has(t)) count++
    }
    df.set(t, count)
  }

  // Score each document
  const results: { id: number; score: number }[] = []
  for (const e of entries) {
    let score = 0
    for (const t of queryTerms) {
      const tf = e.terms.get(t) ?? 0
      if (tf === 0) continue
      const docFreq = df.get(t) ?? 0
      const idf = Math.log((N - docFreq + 0.5) / (docFreq + 0.5) + 1)
      const numerator = (K1 + 1) * tf
      const denominator = K1 * (1 - B + B * (e.docLen / avgdl)) + tf
      score += idf * (numerator / denominator)
    }
    if (score > 0) {
      results.push({ id: e.id, score })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results
}

// ── Public API ──

export interface SearchResult {
  question: Question
  score: number
}

export function search(
  query: string,
  locale: string,
  limit = 20,
): SearchResult[] {
  if (!query.trim()) return []

  const entries = buildIndex(locale)
  const bank = BANKS[locale] ?? zhCN
  const bankById = new Map(bank.map((q) => [q.id, q]))
  const queryTerms = tokenize(query, locale)

  const scored = computeBM25(queryTerms, entries)

  return scored.slice(0, limit).map(({ id, score }) => ({
    question: bankById.get(id)!,
    score: Math.round(score * 100) / 100,
  }))
}
