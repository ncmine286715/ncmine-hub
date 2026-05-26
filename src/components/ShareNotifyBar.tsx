import { useState } from "react";
import { Share2 } from "lucide-react";
import { CREATOR_NAME } from "@/lib/links";

export function ShareNotifyBar() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://ncmine-hub.lovable.app";
    const title = `${CREATOR_NAME} — Addons Apelões de Minecraft Bedrock`;
    const text = `🔥 Achei o hub do ${CREATOR_NAME}! Addons apelões de Minecraft Bedrock, testados e prontos pra baixar 👇\n\n${url}`;

    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("Link copiado! Cola pra galera 🎉");
    } catch {
      showToast("Copia o link: " + url);
    }
  };

  return (
    <>
      <div className="mt-2 flex flex-wrap justify-center gap-2 sm:mt-3">
        <button
          type="button"
          onClick={handleShare}
          className="btn-block bg-background text-foreground !px-2.5 !py-1.5 text-[10px] sm:!px-3 sm:!py-2 sm:text-xs"
          aria-label="Compartilhar"
        >
          <Share2 className="h-3.5 w-3.5" /> Compartilhar
        </button>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-[60] w-[min(92vw,360px)] -translate-x-1/2 border-2 border-foreground bg-background px-3 py-2 text-center text-xs font-bold shadow-[4px_4px_0_0_var(--ink)] sm:bottom-6"
        >
          {toast}
        </div>
      )}
    </>
  );
}