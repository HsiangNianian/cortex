import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { getStats } = await import("@/lib/storage")
    const stats = await getStats()

    return NextResponse.json({
      totalTests: stats.totalTests,
      avgDegradation: stats.avgDegradation,
      distribution: stats.distribution,
      tierCounts: stats.tierCounts,
      aiUsageCounts: stats.aiUsageCounts,
      irtCount: stats.irtCount,
      pctCount: stats.pctCount,
    })
  } catch (err) {
    console.error("GET /api/stats error:", err)
    // Return empty data instead of 500 so the page shows "暂无数据" gracefully
    return NextResponse.json({
      totalTests: 0,
      avgDegradation: null,
      distribution: Array(10).fill(0),
      tierCounts: {},
      aiUsageCounts: {},
    })
  }
}
