// Lightweight analytics — proxy to GA4 gtag only. No firebase.
import { gaEvent } from "./gtag";

export type EventType = string;

export function trackEvent(type: EventType, payload: Record<string, any> = {}) {
  try {
    gaEvent(type, payload);
  } catch {}
}

export function initSession() {
  // no-op: GA4 handles sessions
}

export function initScrollTracker() {
  if (typeof window === "undefined") return () => {};
  const milestones = [25, 50, 75, 100];
  const reached = new Set<number>();
  let throttled = false;
  const onScroll = () => {
    if (throttled) return;
    throttled = true;
    setTimeout(() => { throttled = false; }, 400);
    const h = document.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    if (total <= 0) return;
    const pct = Math.round((h.scrollTop / total) * 100);
    for (const m of milestones) {
      if (pct >= m && !reached.has(m)) {
        reached.add(m);
        trackEvent("scroll_depth", { depth: m });
      }
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}