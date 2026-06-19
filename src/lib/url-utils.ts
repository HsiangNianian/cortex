/**
 * Parse the share `ref` query parameter.
 * Returns a number 0-100 if valid, or null if absent/invalid.
 */
export function parseRefParam(ref: string | undefined): number | null {
  if (!ref) return null
  const n = Number(ref)
  if (!Number.isFinite(n)) return null
  if (n < 0 || n > 100) return null
  return n
}
