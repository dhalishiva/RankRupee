"use client";

import Link from "next/link";
import { fetchToday, useData } from "@/lib/api";
import { categoryBySlug, Listing, MIN_CENTS } from "@/lib/data";
import { usd } from "@/lib/format";
import { ListingLogo, useRanked } from "./ui";

/** The #1 spotlight shown above the category chips: all-time #1 and today's #1. */
export function Spotlight() {
  const { data: ranked } = useRanked();
  const { data: today } = useData("today", fetchToday);
  const top = ranked?.[0];
  const todayTop = today?.[0];

  return (
    <section className="spotlight" aria-label="Current number one">
      <ThroneCard
        label="All-time #1"
        loading={!ranked}
        listing={top}
        amount={top?.total_cents}
        claimHref={`/claim?amount=${Math.max(MIN_CENTS, (top?.total_cents ?? 0) + 100)}`}
        claimAmount={Math.max(MIN_CENTS, (top?.total_cents ?? 0) + 100)}
      />
      <ThroneCard
        label="Today's #1"
        today
        loading={!today}
        listing={todayTop}
        amount={todayTop?.today_cents}
        claimHref="/claim"
        claimAmount={Math.max(MIN_CENTS, (todayTop?.today_cents ?? 0) + 100)}
      />
    </section>
  );
}

function ThroneCard({
  label,
  listing,
  amount,
  loading,
  claimHref,
  claimAmount,
  today,
}: {
  label: string;
  listing?: Pick<Listing, "slug" | "name" | "tagline" | "domain" | "category">;
  amount?: number;
  loading: boolean;
  claimHref: string;
  claimAmount: number;
  today?: boolean;
}) {
  if (loading) return <div className="throne skeleton" />;
  if (!listing)
    return (
      <div className={`throne throne-empty ${today ? "throne-today" : ""}`}>
        <span className="throne-label">{label}</span>
        <div className="throne-body">
          <span className="throne-crown">👑</span>
          <div className="throne-text">
            <strong>Nobody yet</strong>
            <span className="muted small">{today ? "No payments today. Today's crown is free for the taking." : "The throne is empty."}</span>
          </div>
        </div>
        <Link href={claimHref} className="btn btn-sm throne-btn">Take it for {usd(claimAmount)}</Link>
      </div>
    );
  const cat = categoryBySlug(listing.category);
  return (
    <div className={`throne ${today ? "throne-today" : ""}`}>
      <span className="throne-label">👑 {label}</span>
      <Link href={`/product/${listing.slug}`} className="throne-body">
        <ListingLogo name={listing.name} domain={listing.domain} size={48} />
        <div className="throne-text">
          <strong>{listing.name}</strong>
          <span className="muted small">{listing.tagline}</span>
          {cat && <span className="throne-cat">{cat.short} · {listing.domain}</span>}
        </div>
        <span className="throne-amt">{amount !== undefined ? usd(amount) : ""}</span>
      </Link>
      <Link href={claimHref} className="btn btn-sm throne-btn">
        {today ? `Beat it today for ${usd(claimAmount)}` : `Take #1 for ${usd(claimAmount)}`}
      </Link>
    </div>
  );
}
