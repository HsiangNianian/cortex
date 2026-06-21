"use client"

import { useState, useEffect } from "react"
import { useRouter, Link } from "@/i18n/navigation"
import { LogOut, Loader2 } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<{ id: number; username: string; role: string } | null>(null)
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/check").then((r) => r.json()),
      fetch("/api/admin/questions").then((r) => r.json()),
    ]).then(([auth, questions]) => {
      if (!auth.authenticated) {
        router.push("/admin/login")
        return
      }
      setAdmin(auth.admin)
      const qs = questions.questions || []
      setStats({
        pending: qs.filter((q: { status: string }) => q.status === "pending").length,
        approved: qs.filter((q: { status: string }) => q.status === "approved").length,
        rejected: qs.filter((q: { status: string }) => q.status === "rejected").length,
      })
      setLoading(false)
    }).catch(() => {
      router.push("/admin/login")
    })
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">管理后台</h1>
          <p className="text-sm text-muted-foreground">
            {admin?.username} ({admin?.role === "super_admin" ? "超级管理员" : "审题员"})
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          退出
        </button>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <Link
          href="/admin/questions?status=pending"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800/30 dark:bg-amber-950/30"
        >
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-amber-700 dark:text-amber-300">待审核</p>
        </Link>
        <Link
          href="/admin/questions?status=approved"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800/30 dark:bg-green-950/30"
        >
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-green-700 dark:text-green-300">已通过</p>
        </Link>
        <Link
          href="/admin/questions?status=rejected"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800/30 dark:bg-red-950/30"
        >
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-sm text-red-700 dark:text-red-300">已拒绝</p>
        </Link>
      </div>

      <div className="space-y-3">
        <Link
          href="/admin/questions"
          className="block rounded-lg border border-input p-4 transition-colors hover:bg-muted/50"
        >
          <p className="font-medium">审题</p>
          <p className="text-sm text-muted-foreground">查看所有提交的题目，进行审核</p>
        </Link>
        {admin?.role === "super_admin" && (
          <Link
            href="/admin/admins"
            className="block rounded-lg border border-input p-4 transition-colors hover:bg-muted/50"
          >
            <p className="font-medium">管理员管理</p>
            <p className="text-sm text-muted-foreground">创建或删除审题员账户</p>
          </Link>
        )}
        <Link
          href="/"
          className="block rounded-lg border border-input p-4 transition-colors hover:bg-muted/50"
        >
          <p className="font-medium">返回首页</p>
          <p className="text-sm text-muted-foreground">回到认知防锈测试</p>
        </Link>
      </div>
    </div>
  )
}
