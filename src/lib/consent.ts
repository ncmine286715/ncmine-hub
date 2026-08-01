export type ConsentChoice = "accepted" | "rejected";
const KEY = "mn_cookie_consent_v1";

export function getCookieConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

export function setCookieConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, choice);
  applyConsent(choice);
  window.dispatchEvent(new CustomEvent("cookie-consent", { detail: choice }));
}

export function resetCookieConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("cookie-consent", { detail: null }));
}

export function applyConsent(choice: ConsentChoice | null) {
  if (typeof window === "undefined") return;
  const granted = choice === "accepted" ? "granted" : "denied";
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  gtag?.("consent", "update", {
    analytics_storage: granted,
    ad_storage: granted,
    ad_user_data: granted,
    ad_personalization: granted,
  });
}
