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
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
