import { put, get } from "@vercel/blob"

const STATS_KEY = "stats.json"

/** In-memory cache for aggregated stats — avoids reading from Blob on every request */
let statsCache: { data: StatsData; timestamp: number } | null = null
const CACHE_TTL = 60_000 // 1 minute

/**
 * Batching: accumulate results and flush to Blob once the batch is full.
 * This reduces Advanced Operations (put) from 1 per test → 1 per N tests.
 * Cold-started functions might lose up to BATCH_SIZE unflushed results,
 * which is acceptable for anonymous aggregate stats.
 */
const BATCH_SIZE = 20
const pendingResults: ResultData[] = []

export interface ResultData {
  degradationIndex: number
  tierLabel: string
  correctCount: number
  totalQuestions: number
  aiUsageLevel: string | null
  timestamp: number
}

export interface StatsData {
  totalTests: number
  avgDegradation: number | null
  distribution: number[]
  tierCounts: Record<string, number>
  /** running sum of degradationIndex for avg calculation */
  sumDegradation: number
  /** counts per AI usage level */
  aiUsageCounts: Record<string, number>
  /** sum of degradationIndex per AI usage level (for computing per-group avg) */
  aiUsageDegradationSum: Record<string, number>
}

function emptyStats(): StatsData {
  return {
    totalTests: 0,
    avgDegradation: null,
    distribution: Array(10).fill(0),
    tierCounts: {},
    sumDegradation: 0,
    aiUsageCounts: {},
    aiUsageDegradationSum: {},
  }
}

/** Apply a single result to a StatsData object (mutates in-place). */
function applyResult(stats: StatsData, result: ResultData): void {
  stats.totalTests++
  stats.sumDegradation += result.degradationIndex
  stats.avgDegradation = Math.round((stats.sumDegradation / stats.totalTests) * 10) / 10
  stats.tierCounts[result.tierLabel] = (stats.tierCounts[result.tierLabel] ?? 0) + 1
  if (result.aiUsageLevel) {
    stats.aiUsageCounts[result.aiUsageLevel] = (stats.aiUsageCounts[result.aiUsageLevel] ?? 0) + 1
    stats.aiUsageDegradationSum[result.aiUsageLevel] =
      (stats.aiUsageDegradationSum[result.aiUsageLevel] ?? 0) + result.degradationIndex
  }
  const bucket = Math.min(Math.floor(result.degradationIndex / 10), 9)
  stats.distribution[bucket]++
}

export async function getStats(): Promise<StatsData> {
  // Return cached if fresh
  if (statsCache && Date.now() - statsCache.timestamp < CACHE_TTL) {
    return statsCache.data
  }

  try {
    const result = await get(STATS_KEY, { access: "private" })
    if (!result || !result.stream) {
      console.log("blob: no stream for stats.json, returning empty")
      return emptyStats()
    }
    const reader = result.stream.getReader()
    const decoder = new TextDecoder()
    let text = ""
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
    if (!text) return emptyStats()
    const data = JSON.parse(text) as StatsData
    statsCache = { data, timestamp: Date.now() }
    return data
  } catch (err) {
    console.error("blob: getStats error:", err)
    return emptyStats()
  }
}

export async function saveResultAndUpdateStats(result: ResultData): Promise<void> {
  // Mutate cached stats in-memory
  let stats: StatsData
  if (statsCache) {
    stats = statsCache.data
  } else {
    stats = await getStats()
  }

  applyResult(stats, result)
  statsCache = { data: stats, timestamp: Date.now() }

  // Accumulate for batch flush
  pendingResults.push(result)

  // Only write to Blob when the batch is full (1 Advanced Op per BATCH_SIZE tests)
  if (pendingResults.length >= BATCH_SIZE) {
    pendingResults.length = 0 // clear
    await put(STATS_KEY, JSON.stringify(stats), {
      contentType: "application/json",
      access: "private",
      allowOverwrite: true,
    }).catch((err) => {
      console.error("blob: batch flush failed:", err)
    })
  }
}
