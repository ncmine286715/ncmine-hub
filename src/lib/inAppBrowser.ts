// ============================================================
// DETECÇÃO DE NAVEGADOR INTERNO (in-app) + ESCAPE PARA EXTERNO
// ------------------------------------------------------------
// A maior parte do tráfego vem de vídeos (TikTok, Instagram, Kwai,
// YouTube). Esses apps abrem links num "navegador interno" (webview)
// onde o Terabox NÃO funciona: download falha, criação de conta trava
// e o Minecraft não consegue importar o arquivo.
//
// Levar o usuário para o navegador REAL (Chrome/Safari) é o passo
// que mais aumenta a conversão de downloads e contas no Terabox.
// ============================================================

export type InAppKind =
  | "tiktok"
  | "instagram"
  | "facebook"
  | "messenger"
  | "snapchat"
  | "kwai"
  | "whatsapp"
  | "telegram"
  | "line"
  | "pinterest"
  | "twitter"
  | "webview"
  | null;

export type Platform = "android" | "ios" | "windows" | "other";

export function detectInAppBrowser(): InAppKind {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";

  if (/musical_ly|Bytedance|TikTok|BytedanceWebview/i.test(ua)) return "tiktok";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/Messenger|MessengerForiOS/i.test(ua)) return "messenger";
  if (/FB_IAB|FBAN|FBAV|FBIOS|FB4A/i.test(ua)) return "facebook";
  if (/Snapchat/i.test(ua)) return "snapchat";
  if (/Kwai|ksWebView|kwai_/i.test(ua)) return "kwai";
  if (/WhatsApp/i.test(ua)) return "whatsapp";
  if (/Telegram/i.test(ua)) return "telegram";
  if (/\bLine\//i.test(ua)) return "line";
  if (/Pinterest/i.test(ua)) return "pinterest";
  if (/Twitter|TwitterAndroid/i.test(ua)) return "twitter";

  // Heurística genérica: webview do Android embutida em apps
  // (Chrome real contém "Chrome" e NÃO contém "; wv)").
  if (/Android/i.test(ua) && /;\s*wv\)/i.test(ua)) return "webview";

  return null;
}

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
  // iPadOS 13+ se identifica como Mac; detecta pelo touch.
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/Windows/i.test(ua)) return "windows";
  return "other";
}

export function currentUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

// Nome amigável de cada app.
export const IN_APP_LABELS: Record<NonNullable<InAppKind>, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  messenger: "Messenger",
  snapchat: "Snapchat",
  kwai: "Kwai",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  line: "Line",
  pinterest: "Pinterest",
  twitter: "X (Twitter)",
  webview: "app",
};

export function inAppLabel(kind: InAppKind): string {
  return kind ? IN_APP_LABELS[kind] : "app";
}

// Nome do navegador real conforme a plataforma.
export function realBrowserName(platform: Platform): string {
  if (platform === "ios") return "Safari";
  return "Chrome";
}

// Monta o melhor href de "abrir no navegador real" para a plataforma.
// Android: intent:// que força o Chrome (com fallback para a própria página).
// iOS/desktop: a URL https normal (no iOS o usuário usa o menu do app).
export function buildExternalHref(url: string, platform: Platform): string {
  if (platform === "android") {
    const noScheme = url.replace(/^https?:\/\//i, "");
    return (
      `intent://${noScheme}#Intent;scheme=https;` +
      `package=com.android.chrome;` +
      `S.browser_fallback_url=${encodeURIComponent(url)};end`
    );
  }
  return url;
}

// Tenta escapar do navegador interno programaticamente.
// Retorna true se uma tentativa foi feita (Android intent). No iOS não há
// escape programático confiável, então retorna false e a UI deve instruir.
export function tryOpenExternal(url: string, platform: Platform = detectPlatform()): boolean {
  if (typeof window === "undefined") return false;
  if (platform === "android") {
    try {
      window.location.href = buildExternalHref(url, "android");
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// Passo a passo de como sair do app e abrir no navegador real.
export function getEscapeInstructions(kind: InAppKind, platform: Platform): string[] {
  const browser = realBrowserName(platform);
  switch (kind) {
    case "instagram":
      return [
        "Toque nos 3 pontinhos (⋯) no canto superior direito",
        `Selecione "Abrir no ${browser}" ou "Abrir no navegador"`,
        "Pronto! Agora o download do Terabox vai funcionar",
      ];
    case "tiktok":
      return [
        "Toque nos 3 pontinhos (⋯) no canto da tela",
        `Selecione "Abrir no navegador" (${browser})`,
        "Se não aparecer, copie o link e cole no " + browser,
      ];
    case "kwai":
      return [
        "Toque no menu (⋮ ou ⋯) no canto da tela",
        `Selecione "Abrir no navegador" ou copie o link`,
        `Cole o link no ${browser} para baixar`,
      ];
    case "facebook":
    case "messenger":
      return [
        "Toque nos 3 pontinhos (⋯) no canto superior direito",
        `Selecione "Abrir no ${browser}"`,
        "Pronto! Downloads e instalação liberados",
      ];
    case "snapchat":
      return [
        "Segure o link por 2 segundos",
        `Selecione "Abrir no navegador" (${browser})`,
        "Ou copie o link e abra manualmente no " + browser,
      ];
    case "whatsapp":
    case "telegram":
    case "line":
      return [
        `Toque no menu (⋮) e em "Abrir no ${browser}"`,
        "Ou copie o link tocando e segurando nele",
        `Cole o link no ${browser} para baixar`,
      ];
    default:
      return [
        `Use o botão "Abrir no ${browser}" acima`,
        "Ou copie o link e cole no navegador do celular",
        "No navegador real o download do Terabox funciona normal",
      ];
  }
}
