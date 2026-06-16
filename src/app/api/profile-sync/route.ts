import { NextResponse } from "next/server"
import { validateLicense, getAbilityProfile, saveAbilityProfile } from "@/lib/auth/license"

function getLicenseKey(request: Request): string | null {
  const auth = request.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null
  return auth.slice(7)
}

export async function GET(request: Request) {
  const licenseKey = getLicenseKey(request)
  if (!licenseKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const valid = await validateLicense(licenseKey)
  if (!valid.valid) {
    return NextResponse.json({ error: "invalid_license" }, { status: 403 })
  }

  try {
    const profile = await getAbilityProfile(licenseKey)
    if (!profile) {
      return NextResponse.json({ profile: null })
    }
    return NextResponse.json({
      profile: {
        overall: { theta: profile.overall_theta, standardError: profile.overall_se },
        byType: {
          logic: profile.logic_theta !== null
            ? { theta: profile.logic_theta, standardError: profile.logic_se ?? 0 }
            : null,
          math: profile.math_theta !== null
            ? { theta: profile.math_theta, standardError: profile.math_se ?? 0 }
            : null,
          vocab: profile.vocab_theta !== null
            ? { theta: profile.vocab_theta, standardError: profile.vocab_se ?? 0 }
            : null,
          event: profile.event_theta !== null
            ? { theta: profile.event_theta, standardError: profile.event_se ?? 0 }
            : null,
        },
        testDate: profile.updated_at,
        questionsAnswered: profile.questions_answered,
      },
    })
  } catch (error) {
    console.error("[profile-sync] GET error:", error)
    return NextResponse.json({ error: "sync_failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const licenseKey = getLicenseKey(request)
  if (!licenseKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const valid = await validateLicense(licenseKey)
  if (!valid.valid) {
    return NextResponse.json({ error: "invalid_license" }, { status: 403 })
  }

  try {
    const body = (await request.json()) as {
      profile: {
        overall: { theta: number; standardError: number }
        byType: {
          logic: { theta: number; standardError: number } | null
          math: { theta: number; standardError: number } | null
          vocab: { theta: number; standardError: number } | null
          event: { theta: number; standardError: number } | null
        }
        questionsAnswered: number
      }
    }

    if (!body.profile || typeof body.profile.overall?.theta !== "number") {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 })
    }

    const p = body.profile
    await saveAbilityProfile(licenseKey, {
      overallTheta: p.overall.theta,
      overallSe: p.overall.standardError,
      logicTheta: p.byType.logic?.theta ?? null,
      logicSe: p.byType.logic?.standardError ?? null,
      mathTheta: p.byType.math?.theta ?? null,
      mathSe: p.byType.math?.standardError ?? null,
      vocabTheta: p.byType.vocab?.theta ?? null,
      vocabSe: p.byType.vocab?.standardError ?? null,
      eventTheta: p.byType.event?.theta ?? null,
      eventSe: p.byType.event?.standardError ?? null,
      questionsAnswered: p.questionsAnswered,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[profile-sync] POST error:", error)
    return NextResponse.json({ error: "sync_failed" }, { status: 500 })
  }
}
