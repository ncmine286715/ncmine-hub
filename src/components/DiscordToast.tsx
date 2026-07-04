import { useEffect } from "react";
import { X } from "lucide-react";
import { DISCORD_URL } from "@/lib/links";
import { DiscordIcon } from "@/components/icons/BrandIcons";
import { trackEvent } from "@/lib/analytics";

const SHOWN_KEY = "ncmine:discord-toast-shown";

/** Marca que o toast ja foi mostrado nessa sessao. Retorna false se ja tinha sido. */
export function markDownloadForDiscordToast(): boolean {
  try {
    if (sessionStorage.getItem(SHOWN_KEY)) return false;
    sessionStorage.setItem(SHOWN_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

// Aparece uma vez por sessao, logo depois de um download real — o momento
// em que a pessoa esta mais satisfeita e mais propensa a entrar na comunidade.
export function DiscordToast({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    trackEvent("discord_toast_show", {});
    const t = window.setTimeout(onClose, 7000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-2 z-[70] w-[calc(100%-1rem)] max-w-[300px] animate-mc-rise border-2 border-foreground bg-[#5865F2] text-white shadow-[4px_4px_0_0_var(--ink)] sm:right-6">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center border border-white/40 bg-black/10 hover:bg-black/20"
      >
        <X className="h-3 w-3" />
      </button>
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("external_click", { to: "discord", source: "post_download_toast" })}
        className="flex items-center gap-2.5 p-3 pr-7"
      >
        <DiscordIcon className="h-8 w-8 shrink-0" />
        <div className="min-w-0">
          <p className="font-pixel text-[9px] uppercase leading-tight">Baixou? Entra no Discord</p>
          <p className="mt-0.5 text-[10px] leading-snug text-white/80">Avisos de addon novo em primeira mão.</p>
        </div>
      </a>
    </div>
  );
}
