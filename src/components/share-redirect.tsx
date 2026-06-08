"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRedirect({ queryRef }: { queryRef: string }) {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    if (queryRef) params.set("ref", queryRef);
    const dest = "/" + (queryRef ? "?" + params.toString() : "");
    router.replace(dest);
  }, [router, queryRef]);

  return null;
}
