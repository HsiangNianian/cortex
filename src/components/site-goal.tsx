"use client"

import { useEffect, useState } from "react"
import { Target } from "lucide-react"

interface GoalData {
  avgDegradation: number | null
  totalTests: number
}

const GOAL = 50 // 目标：全站平均退化指数 < 50

export function SiteGoal() {
  const [data, setData] = useState<GoalData | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setData({ avgDegradation: d.avgDegradation, totalTests: d.totalTests }))
      .catch(() => {})
  }, [])

  if (!data || data.avgDegradation === null) return null

  const current = data.avgDegradation
  const achieved = current < GOAL
  // Progress: how close we are (lower is better, so invert)
  // At degradation 100 (worst) → 0%, at 50 (goal) → 100%, at 0 (best) → 200%
  const progress = Math.min(100, Math.max(0, Math.round(((100 - current) / (100 - GOAL)) * 100)))

  return (
    <div className={`rounded-2xl border px-4 py-3 ${
      achieved
        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
        : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Target className={`h-4 w-4 ${achieved ? "text-green-600" : "text-amber-600"}`} />
        <span className="text-sm font-semibold">
          {achieved ? "站点目标已达成！" : "站点目标"}
        </span>
        <span className="text-xs text-muted-foreground">
          {achieved
            ? `全站平均退化指数 ${current}，低于目标 ${GOAL}`
            : `全站平均退化指数 ${current} → 目标 < ${GOAL}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            achieved ? "bg-green-500" : progress > 60 ? "bg-amber-500" : "bg-red-400"
          }`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        已有 {data.totalTests.toLocaleString()} 人次参与测试 · 共同努力降低全站退化指数
      </p>
    </div>
  )
}
