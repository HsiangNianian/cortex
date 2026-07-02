"use client";

import { usePremium } from "./usePremium";

export function ExportCsvLink() {
  const { isPremium, licenseKey } = usePremium();
  if (!isPremium) return null;

  async function handleExport() {
    if (!licenseKey) return;
    try {
      const res = await fetch("/api/premium/export", {
        headers: { Authorization: `Bearer ${licenseKey}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cognitive-rust-results.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      /* silent */
    }
  }

  return (
    <>
      <span className="text-muted-foreground/40">|</span>
      <button
        onClick={handleExport}
        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        导出 CSV
      </button>
    </>
  );
}
