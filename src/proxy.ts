import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 proxy.ts — replaces the deprecated middleware.ts convention.
 * Proxy middleware runs on the Node.js runtime (Fluid Compute).
 *
 * Extend this file to add request-level logic (e.g., redirects, headers).
 */
export default function proxy(_request: NextRequest) {
  return NextResponse.next();
}
