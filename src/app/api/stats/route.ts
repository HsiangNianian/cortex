import { NextResponse } from "next/server"
import { getStats } from "@/lib/storage"

export const dynamic = "force-static"

export async function GET() {
  try {
    const stats = await getStats()

    return NextResponse.json(
      {
        totalTests: stats.totalTests,
        avgDegradation: stats.avgDegradation,
        distribution: stats.distribution,
        tierCounts: stats.tierCounts,
        aiUsageCounts: stats.aiUsageCounts,
        irtCount: stats.irtCount,
        pctCount: stats.pctCount,
      },
      {
        headers: {
          "cache-control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    )
  } catch (err) {
    console.error("GET /api/stats error:", err)
    return NextResponse.json({
      totalTests: 0,
      avgDegradation: null,
      distribution: Array(10).fill(0),
      tierCounts: {},
      aiUsageCounts: {},
    })
  }
}
