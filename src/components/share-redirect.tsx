"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AutoRedirect({ ref }: { ref: string }) {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams()
    if (ref) params.set("ref", ref)
    const dest = "/" + (ref ? "?" + params.toString() : "")
    router.replace(dest)
  }, [router, ref])

  return null
}
