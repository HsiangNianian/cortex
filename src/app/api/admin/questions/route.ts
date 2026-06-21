import { NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/community/auth"
import { getAllQuestionsWithStatus } from "@/lib/community/d1"

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let questions
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      const { getQuestionsByStatus } = await import("@/lib/community/d1")
      questions = await getQuestionsByStatus(status)
    } else {
      questions = await getAllQuestionsWithStatus()
    }

    return NextResponse.json({ questions })
  } catch (err) {
    console.error("GET /api/admin/questions error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
