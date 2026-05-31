import type { Addon } from "@/components/AddonCard";
import { CREATOR_NAME } from "@/lib/links";

export async function shareAddon(
  addon: Addon,
  onToast: (msg: string) => void,
): Promise<void> {
  // Use the dedicated addon page URL for better SEO and sharing
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/addon/${encodeURIComponent(addon.id)}`
      : `https://ncmine-hub.lovable.app/addon/${encodeURIComponent(addon.id)}`;
  const title = `${addon.title} — Addon Minecraft Bedrock`;
  const text = `${addon.title}\n${addon.short}\n\nBaixa gratis no hub do ${CREATOR_NAME}:\n${url}`;

  if (typeof navigator !== "undefined" && (navigator as any).share) {
    try {
      await (navigator as any).share({ title, text, url });
      return;
    } catch {
      // user cancelled — fall through
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    onToast("Link copiado!");
  } catch {
    onToast("Copia ai: " + url);
  }
}
