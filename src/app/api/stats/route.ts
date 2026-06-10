import { NextResponse } from "next/server"
import { getStats } from "@/lib/storage"

export const dynamic = "force-dynamic"

interface CachedStats {
  body: Record<string, unknown>
  timestamp: number
}

let cache: CachedStats | null = null
const CACHE_TTL = 30_000 // 30s in-memory cache

export async function GET() {
  try {
    const now = Date.now()
    if (cache && now - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.body, {
        headers: { "x-cache": "HIT" },
      })
    }

    const stats = await getStats()

    const body = {
      totalTests: stats.totalTests,
      avgDegradation: stats.avgDegradation,
      distribution: stats.distribution,
      tierCounts: stats.tierCounts,
      aiUsageCounts: stats.aiUsageCounts,
      irtCount: stats.irtCount,
      pctCount: stats.pctCount,
    }

    cache = { body, timestamp: now }

    return NextResponse.json(body, {
      headers: {
        "x-cache": "MISS",
        "cache-control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    })
  } catch (err) {
    console.error("GET /api/stats error:", err)
    // Serve stale cache on error if available
    if (cache) {
      return NextResponse.json(cache.body, {
        headers: { "x-cache": "STALE" },
      })
    }
    return NextResponse.json({
      totalTests: 0,
      avgDegradation: null,
      distribution: Array(10).fill(0),
      tierCounts: {},
      aiUsageCounts: {},
    })
  }
}
