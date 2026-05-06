import { NextResponse } from "next/server"
import { getStats } from "@/lib/blob"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const stats = await getStats()
    // Compute per-group average degradation
    const aiUsageAvgDegradation: Record<string, number> = {}
    for (const [level, count] of Object.entries(stats.aiUsageCounts)) {
      const sum = stats.aiUsageDegradationSum[level] ?? 0
      aiUsageAvgDegradation[level] = Math.round((sum / count) * 10) / 10
    }

    return NextResponse.json({
      totalTests: stats.totalTests,
      avgDegradation: stats.avgDegradation,
      distribution: stats.distribution,
      tierCounts: stats.tierCounts,
      aiUsageCounts: stats.aiUsageCounts,
      aiUsageAvgDegradation,
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
      aiUsageAvgDegradation: {},
    })
  }
}
