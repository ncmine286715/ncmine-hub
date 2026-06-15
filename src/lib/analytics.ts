import { addDoc, collection, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

// ============================================================
// SISTEMA DE ANALYTICS — NCMINE
// Rastreia ações e comportamento (anônimo + logado)
// ============================================================

export type EventType =
  | "page_view"
  | "addon_view"
  | "addon_open"
  | "addon_click"
  | "download_start"
  | "download_complete"
  | "share"
  | "favorite"
  | "unfavorite"
  | "comment"
  | "rating"
  | "scroll_depth"
  | "session_start"
  | "external_click"
  | "inapp_detected"
  | "inapp_escape"
  | "terabox_open"
  | "tutorial_video_open";

const ANON_KEY = "ncmine:anon_id";
const SESSION_KEY = "ncmine:session_start";

function getAnonId(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "anon_no_storage";
  }
}

function getDayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Cache para evitar duplicar eventos por sessão
const sentOnce = new Set<string>();

export async function trackEvent(
  type: EventType,
  payload: Record<string, any> = {},
  options: { onceKey?: string } = {},
) {
  if (typeof window === "undefined") return;
  if (options.onceKey) {
    if (sentOnce.has(options.onceKey)) return;
    sentOnce.add(options.onceKey);
  }

  const user = auth.currentUser;
  const anonId = getAnonId();
  const event = {
    type,
    userId: user?.uid || null,
    anonId,
    path: window.location.pathname,
    referrer: document.referrer || null,
    ua: navigator.userAgent.slice(0, 200),
    day: getDayKey(),
    createdAt: serverTimestamp(),
    ...payload,
  };

  // 1. Loga em public_events (anônimo OK)
  try {
    await addDoc(collection(db, "public_events"), event);
  } catch (e) {
    // silencioso — analytics nunca pode quebrar UX
    console.debug("[analytics] event drop", e);
  }

  // 2. Incrementa contadores nas estatísticas diárias
  try {
    const dayRef = doc(db, "daily_stats", getDayKey());
    await setDoc(
      dayRef,
      { [`counts.${type}`]: increment(1), updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch {}

  // 3. Se for ação de addon, incrementa contadores no addon (requer auth)
  if (payload.addonId && user) {
    try {
      const addonRef = doc(db, "addons", payload.addonId);
      const addonSnap = await getDoc(addonRef);
      const field = ADDON_COUNTER_MAP[type];
      if (field) {
        if (!addonSnap.exists()) {
          await setDoc(addonRef, {
            downloadsCount: 0,
            viewsCount: 0,
            opensCount: 0,
            clicksCount: 0,
            sharesCount: 0,
            [field]: 1,
          });
        } else {
          await updateDoc(addonRef, { [field]: increment(1) });
        }
      }
    } catch {}
  }
}

const ADDON_COUNTER_MAP: Partial<Record<EventType, string>> = {
  download_start: "downloadsCount",
  addon_view: "viewsCount",
  addon_open: "opensCount",
  addon_click: "clicksCount",
  share: "sharesCount",
};

// ============================================================
// SCROLL DEPTH TRACKING
// ============================================================
export function initScrollTracker() {
  if (typeof window === "undefined") return;
  const milestones = [25, 50, 75, 100];
  const reached = new Set<number>();

  const onScroll = () => {
    const h = document.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    if (total <= 0) return;
    const pct = Math.round((h.scrollTop / total) * 100);
    for (const m of milestones) {
      if (pct >= m && !reached.has(m)) {
        reached.add(m);
        trackEvent("scroll_depth", { depth: m }, { onceKey: `scroll_${m}_${window.location.pathname}` });
      }
    }
  };

  let throttle = false;
  const handler = () => {
    if (throttle) return;
    throttle = true;
    setTimeout(() => { throttle = false; onScroll(); }, 500);
  };

  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}

// ============================================================
// SESSION TRACKER
// ============================================================
export function initSession() {
  if (typeof window === "undefined") return;
  try {
    const last = Number(sessionStorage.getItem(SESSION_KEY) || 0);
    if (Date.now() - last > 30 * 60 * 1000) {
      sessionStorage.setItem(SESSION_KEY, String(Date.now()));
      trackEvent("session_start", {
        screen: `${window.innerWidth}x${window.innerHeight}`,
        lang: navigator.language,
      });
    }
  } catch {}
}