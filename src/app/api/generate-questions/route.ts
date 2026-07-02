export const dynamic = "force-static"

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "disabled" }, { status: 410 })
}
