// Google Analytics 4 — gtag helper
export const GA_ID = "G-RYBSXRH3TF";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export function pageview(path: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: path });
}

export function gaEvent(name: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}