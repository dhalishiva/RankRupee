"use client";

import { useSyncExternalStore } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/api";

// One shared presence channel per browser tab. Each tab joins with a random id;
// nothing is stored and no personal data is sent — Supabase just counts open tabs.
let count = 0;
let channel: RealtimeChannel | null = null;
const listeners = new Set<() => void>();

function start() {
  if (channel || typeof window === "undefined") return;
  const id = crypto.randomUUID();
  channel = supabase.channel("softing-online", { config: { presence: { key: id } } });
  channel
    .on("presence", { event: "sync" }, () => {
      count = Object.keys(channel!.presenceState()).length;
      listeners.forEach((l) => l());
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") await channel!.track({ t: Date.now() });
    });
}

function subscribe(l: () => void) {
  listeners.add(l);
  start();
  return () => listeners.delete(l);
}

export function useOnlineCount() {
  return useSyncExternalStore(subscribe, () => count, () => 0);
}

export function OnlineBadge({ className = "" }: { className?: string }) {
  const n = useOnlineCount();
  if (!n) return null;
  return (
    <span className={`online ${className}`} title="People on Softing right now">
      <span className="online-dot" />
      {n} online now
    </span>
  );
}
