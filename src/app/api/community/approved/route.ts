import { NextResponse } from "next/server"
import { getApprovedQuestions } from "@/lib/community/d1"

export async function GET() {
  try {
    const rows = await getApprovedQuestions()
    return NextResponse.json({ questions: rows })
  } catch (err) {
    console.error("GET /api/community/approved error:", err)
    return NextResponse.json({ questions: [] })
  }
}
