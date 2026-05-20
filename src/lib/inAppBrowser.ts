export type InAppKind = "tiktok" | "instagram" | "facebook" | "snapchat" | null;

export function detectInAppBrowser(): InAppKind {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  if (/musical_ly|Bytedance|TikTok/i.test(ua)) return "tiktok";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/Snapchat/i.test(ua)) return "snapchat";
  return null;
}

export function currentUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}