import { TIER_KEYS, RESULT_TIERS } from "./scoring"
import { AI_CANONICAL_LEVELS } from "./constants"

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const CF_KV_NS = "0c72ec9e090c4137b117c3425370f05c"
const CF_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NS}/values`

function cfAuth(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN ?? ""}`,
    "Content-Type": "text/plain",
  }
}

interface StatsStore {
  totalTests: number
  sumDegradation: number
  distribution: number[]
  tierCounts: Record<string, number>
  aiUsageCounts: Record<string, number>
  irtCount: number
  pctCount: number
}

const EMPTY_STATS: StatsStore = {
  totalTests: 0,
  sumDegradation: 0,
  distribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  tierCounts: {},
  aiUsageCounts: {},
  irtCount: 0,
  pctCount: 0,
}

const TIER_LABEL_TO_KEY: Record<string, string> = {}
for (const t of RESULT_TIERS) {
  TIER_LABEL_TO_KEY[t.label] = t.tierKey
}

async function kvGet(key: string): Promise<string | null> {
  const res = await fetch(`${CF_API_BASE}/${encodeURIComponent(key)}`, {
    headers: cfAuth(),
    cache: "no-store" as const,
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`KV GET ${key}: ${res.status}`)
  return res.text()
}

async function kvGetJson<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key)
  return raw ? JSON.parse(raw) : null
}

async function kvPut(key: string, value: string, ttl?: number): Promise<void> {
  const url = new URL(`${CF_API_BASE}/${encodeURIComponent(key)}`)
  if (ttl) url.searchParams.set("expiration_ttl", String(ttl))

  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: cfAuth(),
    body: value,
  })
  if (!res.ok) throw new Error(`KV PUT ${key}: ${res.status}`)
}

// ---- Public API ----

export interface StatsData {
  totalTests: number
  avgDegradation: number | null
  distribution: number[]
  tierCounts: Record<string, number>
  aiUsageCounts: Record<string, number>
  sumDegradation: number
  irtCount: number
  pctCount: number
}

export async function getStats(): Promise<StatsData> {
  const s = (await kvGetJson<StatsStore>("stats")) ?? EMPTY_STATS

  return {
    totalTests: s.totalTests,
    avgDegradation: s.totalTests
      ? Math.round((s.sumDegradation / s.totalTests) * 10) / 10
      : null,
    distribution: s.distribution,
    tierCounts: s.tierCounts,
    aiUsageCounts: s.aiUsageCounts,
    sumDegradation: s.sumDegradation,
    irtCount: s.irtCount,
    pctCount: s.pctCount,
  }
}

export async function saveResult(
  result: {
    degradationIndex: number
    tierLabel: string
    aiUsageLevel: string | null
    estimationMethod?: "percentage" | "irt"
  },
): Promise<void> {
  // Read current stats
  const s = (await kvGetJson<StatsStore>("stats")) ?? EMPTY_STATS

  // Update
  const bucket = Math.max(0, Math.min(Math.floor(result.degradationIndex / 10), 9))
  const tierKey = TIER_LABEL_TO_KEY[result.tierLabel] ?? result.tierLabel

  s.totalTests += 1
  s.sumDegradation += result.degradationIndex
  s.distribution[bucket] += 1
  s.tierCounts[tierKey] = (s.tierCounts[tierKey] ?? 0) + 1
  if (result.aiUsageLevel) {
    s.aiUsageCounts[result.aiUsageLevel] = (s.aiUsageCounts[result.aiUsageLevel] ?? 0) + 1
  }
  if (result.estimationMethod === "irt") {
    s.irtCount += 1
  } else {
    s.pctCount += 1
  }

  await kvPut("stats", JSON.stringify(s))
}

// Legacy exports kept for API route compatibility
export { AI_CANONICAL_LEVELS, TIER_KEYS }
