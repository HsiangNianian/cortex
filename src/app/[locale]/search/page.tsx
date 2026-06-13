"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Search, Loader2, ChevronDown, ChevronUp, ArrowLeft, Flag } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  id: number
  type: string
  category: string
  question: string
  options: string[]
  answer: number | number[]
  explanation: string
  difficulty: number
  score: number
}

function diffLabel(d: number): string {
  if (d < -0.5) return "简单"
  if (d < 0.5) return "中等"
  return "困难"
}

export default function SearchPage() {
  const n = useTranslations()
  const locale = useLocale()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [flaggedIds, setFlaggedIds] = useState<Set<number>>(new Set())
  const [hasFlaggedBefore, setHasFlaggedBefore] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Check if user has flagged before
  useEffect(() => {
    try {
      const hist = localStorage.getItem("cognitive-rust-history")
      if (hist && JSON.parse(hist).some((h: any) => h.flaggedIds?.length > 0)) {
        setHasFlaggedBefore(true)
      }
    } catch {}
  }, [])

  function toggleFlag(qId: number) {
    setFlaggedIds((prev) => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else {
        next.add(qId)
        fetch("/api/flags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: `${locale}:${qId}` }),
        }).catch(() => {})
      }
      return next
    })
  }

  const doSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setResults([])
        setSearched(false)
        return
      }
      setLoading(true)
      setSearched(true)
      fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}&limit=20`)
        .then((r) => r.json())
        .then((d) => {
          setResults(d.results ?? [])
          setExpanded(new Set())
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    },
    [locale],
  )

  function handleInput(val: string) {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-lg space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">{n("search.title")}</h1>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={n("search.placeholder")}
            className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Results */}
        {!loading && searched && results.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">{n("search.noResults")}</p>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground">
              {n("search.resultCount", { count: results.length })}
            </p>
            <div className="space-y-3">
              {results.map((r) => {
                const isOpen = expanded.has(r.id)
                const correctAns = Array.isArray(r.answer)
                  ? r.answer.map((a) => r.options[a]).join(", ")
                  : r.options[r.answer]

                return (
                  <Card key={r.id} className="transition-shadow hover:shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium leading-relaxed">
                          {r.question.split("\n")[0]}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {n("question.category." + r.category)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {diffLabel(r.difficulty)} · θ={r.difficulty.toFixed(1)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/40">
                          score: {r.score}
                        </span>
                        <button
                          type="button"
                          title={n("testing.flagTip")}
                          onClick={(e) => { e.stopPropagation(); toggleFlag(r.id); }}
                          className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                            flaggedIds.has(r.id)
                              ? "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400"
                              : "text-muted-foreground/50 hover:text-amber-500 hover:bg-muted"
                          }`}
                        >
                          <Flag className={`h-3 w-3 ${flaggedIds.has(r.id) ? "fill-amber-400" : ""}`} />
                          {!hasFlaggedBefore && <span className="hidden sm:inline">{flaggedIds.has(r.id) ? n("testing.flagged") : n("testing.flagLabel")}</span>}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 pt-1">
                      {/* Options preview */}
                      <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                        {r.options.map((opt, i) => (
                          <span
                            key={i}
                            className={`truncate rounded px-1.5 py-0.5 ${
                              (Array.isArray(r.answer) ? r.answer.includes(i) : r.answer === i)
                                ? "bg-green-50 font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
                                : ""
                            }`}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </span>
                        ))}
                      </div>

                      {/* Expandable explanation */}
                      <button
                        onClick={() => toggleExpand(r.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {isOpen ? n("search.collapse") : n("search.expand")}
                      </button>
                      {isOpen && (
                        <div className="mt-2 rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-medium text-green-700 dark:text-green-300">
                            {n("search.correctAnswer")}: {correctAns}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                            {r.explanation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
