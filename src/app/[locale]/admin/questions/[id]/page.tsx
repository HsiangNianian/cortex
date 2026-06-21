"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"

interface QuestionDetail {
  id: number
  type: string
  question: string
  options: string
  correct_answer: number
  explanation: string
  submitter_email: string
  submitter_name: string
  status: string
  admin_notes: string
  created_at: string
}

export default function AdminQuestionReviewPage() {
  const router = useRouter()
  const params = useParams()
  const [admin, setAdmin] = useState<{ id: number; username: string; role: string } | null>(null)
  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [adminNotes, setAdminNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/check").then((r) => r.json()),
      fetch(`/api/admin/questions`).then((r) => r.json()),
    ]).then(([auth, data]) => {
      if (!auth.authenticated) {
        router.push("/admin/login")
        return
      }
      setAdmin(auth.admin)
      const id = Number(params?.id)
      const q = (data.questions || []).find((q: QuestionDetail) => q.id === id)
      if (q) {
        setQuestion(q)
        try { setOptions(JSON.parse(q.options)) } catch { setOptions([]) }
        setAdminNotes(q.admin_notes || "")
      }
      setLoading(false)
    }).catch(() => router.push("/admin/login"))
  }, [router, params])

  const handleReview = async (status: "approved" | "rejected") => {
    setActionLoading(true)
    setMessage("")
    try {
      const res = await fetch(`/api/admin/questions/${question?.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || "操作失败")
        return
      }
      setMessage(status === "approved" ? "已通过审核 ✓" : "已拒绝 ✗")
      if (question) setQuestion({ ...question, status })
    } catch {
      setMessage("网络错误")
    } finally {
      setActionLoading(false)
    }
  }

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

  if (!question) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-muted-foreground">题目不存在</p>
        <Link href="/admin/questions" className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700">
          返回审题列表
        </Link>
      </div>
    )
  }

  const answerLabels = options.map((_, i) => String.fromCharCode(65 + i))

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <h1 className="mt-4 text-xl font-bold">审核题目 #{question.id}</h1>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">题型</p>
          <p className="text-sm font-medium">{typeLabel(question.type)}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">题干</p>
          <div className="mt-1 whitespace-pre-wrap rounded-md border border-input bg-muted/30 p-3 text-sm">
            {question.question}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">选项</p>
          <div className="mt-1 space-y-1.5">
            {options.map((opt, i) => (
              <div
                key={i}
                className={`rounded-md border p-2.5 text-sm ${
                  i === question.correct_answer
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20"
                    : "border-input"
                }`}
              >
                <span className="mr-2 font-medium">{answerLabels[i]}.</span>
                {opt}
                {i === question.correct_answer && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ 正确答案</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {question.explanation && (
          <div>
            <p className="text-xs text-muted-foreground">解析</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{question.explanation}</p>
          </div>
        )}

        <div className="rounded-md border border-input bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">出题人</p>
          <p className="text-sm">{question.submitter_name || "匿名"}</p>
          <p className="text-xs text-muted-foreground mt-1">邮箱</p>
          <p className="text-sm">{question.submitter_email}</p>
          <p className="text-xs text-muted-foreground mt-1">提交时间</p>
          <p className="text-sm">{question.created_at}</p>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">审核备注</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="审核意见（可选）"
          />
        </div>

        {message && (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800/30 dark:bg-blue-950/30 dark:text-blue-300">
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => handleReview("approved")}
            disabled={actionLoading || question.status !== "pending"}
            className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading ? "处理中..." : "通过"}
          </button>
          <button
            onClick={() => handleReview("rejected")}
            disabled={actionLoading || question.status !== "pending"}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading ? "处理中..." : "拒绝"}
          </button>
        </div>
      </div>
    </div>
  )
}
