"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"

interface QuestionItem {
  id: number
  type: string
  question: string
  submitter_email: string
  submitter_name: string
  status: string
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30",
  approved: "text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-950/30",
  rejected: "text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-950/30",
}

export default function AdminQuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams?.get("status") || ""
  const [admin, setAdmin] = useState<{ id: number; username: string; role: string } | null>(null)
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((auth) => {
        if (!auth.authenticated) {
          router.push("/admin/login")
          return
        }
        setAdmin(auth.admin)
        const url = statusFilter
          ? `/api/admin/questions?status=${statusFilter}`
          : "/api/admin/questions"
        return fetch(url).then((r) => r.json())
      })
      .then((data) => {
        if (data?.questions) setQuestions(data.questions)
        setLoading(false)
      })
      .catch(() => router.push("/admin/login"))
  }, [router, statusFilter])

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      logic: "逻辑推理",
      math: "速算",
      vocab: "词汇语义",
      event: "事件排序",
      "event-cause": "因果推断",
      "event-argument": "论证分析",
    }
    return map[type] || type
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回后台
        </Link>
        <h1 className="mt-2 text-xl font-bold">审题</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["", "pending", "approved", "rejected"].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/questions?status=${s}` : "/admin/questions"}
            className={`rounded-md px-3 py-1.5 text-sm ${
              statusFilter === s
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s ? STATUS_LABELS[s] || s : "全部"}
          </Link>
        ))}
      </div>

      {questions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">暂无题目</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/admin/questions/${q.id}`}
              className="block rounded-lg border border-input p-4 transition-colors hover:bg-muted/50"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-xs ${STATUS_COLORS[q.status] || ""}`}>
                  {STATUS_LABELS[q.status] || q.status}
                </span>
                <span className="text-xs text-muted-foreground">{typeLabel(q.type)}</span>
              </div>
              <p className="line-clamp-2 text-sm">{q.question}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {q.submitter_name || "匿名"} · {q.submitter_email} · {q.created_at?.slice(0, 10)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
