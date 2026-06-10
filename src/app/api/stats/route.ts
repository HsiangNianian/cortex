import { NextResponse } from "next/server"
import { getAll } from "@vercel/edge-config"
import { getStats, type StatsData } from "@/lib/storage"

export const dynamic = "force-dynamic"

function formatStats(s: StatsData) {
  return {
    totalTests: s.totalTests,
    avgDegradation: s.avgDegradation,
    distribution: s.distribution,
    tierCounts: s.tierCounts,
    aiUsageCounts: s.aiUsageCounts,
    irtCount: s.irtCount,
    pctCount: s.pctCount,
  }
}

export async function GET() {
  try {
    // Read from Edge Config — free, ultra-low latency, no Redis cost
    const edgeItems = await getAll<Record<string, unknown>>()
    if (edgeItems && edgeItems.totalTests !== undefined) {
      return NextResponse.json(edgeItems, {
        headers: { "x-cache": "EDGE_CONFIG" },
      })
    }

    // Fallback: Edge Config empty (not yet synced), read from Redis
    const stats = await getStats()
    return NextResponse.json(formatStats(stats), {
      headers: { "x-cache": "REDIS_FALLBACK" },
    })
  } catch (err) {
    console.error("GET /api/stats error:", err)
    // Last-resort fallback: try Redis directly if Edge Config fails
    try {
      const stats = await getStats()
      return NextResponse.json(formatStats(stats), {
        headers: { "x-cache": "REDIS_FALLBACK" },
      })
    } catch (_) {
      return NextResponse.json({
        totalTests: 0,
        avgDegradation: null,
        distribution: Array(10).fill(0),
        tierCounts: {},
        aiUsageCounts: {},
      })
    }
  }
}
