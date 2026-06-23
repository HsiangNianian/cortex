"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Star, Coffee, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface SponsorUser {
  userId: string;
  name: string;
  avatar: string;
}

interface SponsorEntry {
  user: SponsorUser;
  allSumAmount: string;
  planName: string;
  planPrice: string;
  lastPayTime: number;
  planId: string;
  anonymous?: boolean;
}

interface SponsorsData {
  sponsors: SponsorEntry[];
  supportWall: SponsorEntry[];
  sponsorWall: SponsorEntry[];
  total: number;
  cached: boolean;
}

/* ── Full-page Danmaku ── */
interface DanmakuItem {
  entry: SponsorEntry;
  top: number;
  speed: number;
  delay: number;
  fontSize: number;
}

function Danmaku({ entries }: { entries: SponsorEntry[] }) {
  const [items, setItems] = useState<DanmakuItem[]>([]);

  useEffect(() => {
    const count = Math.min(entries.length, 12);
    const shuffled = [...entries].sort(() => Math.random() - 0.5).slice(0, count);
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(
      shuffled.map((entry, i) => ({
        entry,
        top: 5 + Math.random() * 80,
        speed: 35 + Math.random() * 45,
        delay: -(Math.random() * (35 + Math.random() * 45)),
        fontSize: 13 + Math.random() * 3,
      })),
    );
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [entries]);

  if (entries.length === 0 || items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {items.map(({ entry: s, top, speed, delay, fontSize }) => (
        <div
          key={`${s.user.userId}-${top}`}
          className="absolute flex animate-danmaku-track whitespace-nowrap"
          style={{
            top: `${top}%`,
            animationDuration: `${speed}s`,
            animationDelay: `${delay}s`,
            fontSize: `${fontSize}px`,
          }}
        >
          <div className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 shadow-md backdrop-blur-md border">
            {s.user.avatar && !s.anonymous ? (
              <img src={s.user.avatar} alt="" className="h-5 w-5 rounded-full" loading="lazy" />
            ) : (
              <Coffee className="h-4 w-4 text-muted-foreground/40" />
            )}
            <span className="font-medium">{s.anonymous ? "匿名用户" : s.user.name}</span>
            <span className="text-muted-foreground">赞助了</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
              ¥{s.allSumAmount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Sponsor Wall Cell ── */
function WallCell({ entry }: { entry: SponsorEntry }) {
  const anon = entry.anonymous === true;

  return (
    <div className="flex flex-col items-center gap-1">
      {entry.user.avatar && !anon ? (
        <img
          src={entry.user.avatar}
          alt={entry.user.name}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-200 dark:ring-amber-700"
          loading="lazy"
        />
      ) : (
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-muted ${anon ? "blur-[2px]" : ""}`}
        >
          <Coffee className="h-6 w-6 text-muted-foreground/30" />
        </div>
      )}
      <p
        className={`max-w-[72px] truncate text-center text-[11px] font-medium ${anon ? "blur-[2px] select-none" : ""}`}
      >
        {anon ? "匿名用户" : entry.user.name}
      </p>
      <p className="text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400">
        ¥{entry.allSumAmount}
      </p>
    </div>
  );
}

export default function SponsorsPage() {
  useEffect(() => {
    document.body.classList.add("hide-top-nav");
    return () => document.body.classList.remove("hide-top-nav");
  }, []);
  const t = useTranslations("sponsors");
  const [data, setData] = useState<SponsorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/sponsors")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const sortedSponsors = useMemo(() => {
    if (!data?.sponsorWall) return [];
    return [...data.sponsorWall].sort(
      (a, b) => parseFloat(b.allSumAmount) - parseFloat(a.allSumAmount),
    );
  }, [data]);

  return (
    <div className="flex min-h-dvh flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToTest")}
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border bg-card py-12 text-center">
            <p className="text-sm text-muted-foreground">{t("loadError")}</p>
          </div>
        )}

        {data && (
          <>
            {/* Sponsor Wall */}
            {sortedSponsors.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                  <h2 className="text-lg font-semibold">{t("sponsorList")}</h2>
                </div>
                <div className="rounded-2xl border bg-card/50 p-4">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {sortedSponsors.map((s, i) => (
                      <WallCell key={i} entry={s} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Support Danmaku (full-page) */}
            {data.supportWall && data.supportWall.length > 0 && (
              <Danmaku entries={data.supportWall} />
            )}

            <p className="text-center text-xs text-muted-foreground">
              {t("totalCount", { count: data.total })} · {t("cacheNote")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
