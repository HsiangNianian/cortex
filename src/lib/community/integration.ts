import type { Question } from "@/lib/question-bank/types"

interface CommunityAPIQuestion {
  id: number
  type: string
  question: string
  options: string  // JSON string
  correct_answer: number
  explanation: string
}

/**
 * Fetch approved community questions and convert them to Question[].
 * Only fetches for zh-CN locale.
 */
export async function fetchCommunityQuestions(locale: string): Promise<Question[]> {
  if (locale !== "zh-CN") return []

  try {
    const res = await fetch("/api/community/approved")
    if (!res.ok) return []
    const data = await res.json()
    if (!data.questions || !Array.isArray(data.questions)) return []

    return data.questions.map((q: CommunityAPIQuestion, i: number) => ({
      id: 9000 + q.id,  // high ID range to avoid conflicts with static questions
      type: q.type as Question["type"],
      category: q.type,
      question: q.question,
      options: tryParseJSON(q.options, [] as string[]),
      answer: q.correct_answer,
      explanation: q.explanation || "",
      difficulty: 0,
      source: "community" as const,
    }))
  } catch {
    return []
  }
}

/**
 * Merge up to `maxCount` community questions into the question array.
 * Replaces the last N questions with community questions.
 */
export function mergeCommunityQuestions(
  questions: Question[],
  communityQs: Question[],
  maxCount = 3
): Question[] {
  if (communityQs.length === 0) return questions
  const n = Math.min(communityQs.length, maxCount, questions.length)
  if (n === 0) return questions

  const result = [...questions]
  for (let i = 0; i < n; i++) {
    result[result.length - 1 - i] = communityQs[i]
  }
  return result
}

function tryParseJSON<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
