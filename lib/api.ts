"use client";

import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { ActivityRow, Listing, Stats, SUPABASE_KEY, SUPABASE_URL, TodayRow } from "./data";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

export async function fetchRanked(): Promise<Listing[]> {
  const { data, error } = await supabase.rpc("ranked_listings").order("rank").limit(2000);
  if (error) throw error;
  return (data ?? []) as Listing[];
}

export async function fetchToday(): Promise<TodayRow[]> {
  const { data, error } = await supabase.rpc("today_ranking").order("rank").limit(500);
  if (error) throw error;
  return (data ?? []) as TodayRow[];
}

export async function fetchActivity(limit = 20): Promise<ActivityRow[]> {
  const { data, error } = await supabase.rpc("recent_activity", { p_limit: limit });
  if (error) throw error;
  return (data ?? []) as ActivityRow[];
}

export async function fetchStats(): Promise<Stats> {
  const { data, error } = await supabase.rpc("site_stats");
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as Stats | undefined;
  return row ?? { listings: 0, total_cents: 0, payments: 0 };
}

export async function fetchPayments(slug: string) {
  const { data, error } = await supabase.rpc("listing_payments", { p_slug: slug });
  if (error) throw error;
  return (data ?? []) as { amount_cents: number; kind: string; paid_at: string }[];
}

export function recordClick(slug: string) {
  void supabase.rpc("record_click", { p_slug: slug }).then(() => undefined, () => undefined);
}

// ---------- payments API (Supabase Edge Function) ----------
export type PayConfig = {
  razorpay: { enabled: boolean; keyId: string | null };
  paypal: { enabled: boolean; clientId: string | null; env: "sandbox" | "live" };
  inrPerUsd: number;
  minCents: number;
};

export class ApiError extends Error {
  constructor(message: string, public status: number, public data: Record<string, unknown>) {
    super(message);
  }
}

export async function callApi<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/api`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error || "Request failed", res.status, data);
  return data as T;
}

let configPromise: Promise<PayConfig> | null = null;
export const fetchPayConfig = () => {
  if (!configPromise) configPromise = callApi<PayConfig>({ action: "config" }).catch((e) => { configPromise = null; throw e; });
  return configPromise;
};

// ---------- tiny cached data hook ----------
const cache = new Map<string, unknown>();

export function useData<T>(key: string, fn: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>(() => cache.get(key) as T | undefined);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    fn().then(
      (d) => {
        cache.set(key, d);
        setData(d);
        setError(null);
      },
      (e) => setError(e?.message || "Could not load"),
    );
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    const t = setInterval(load, 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(t);
    };
  }, [load]);
  return { data, error, reload: load, loading: data === undefined && !error };
}

export const invalidate = () => cache.clear();
