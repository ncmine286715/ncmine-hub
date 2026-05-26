import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { DISCORD_URL } from "@/lib/links";

const NOTIFY_KEY = "ncmine:notify-optin";
const DISMISS_KEY = "ncmine:notify-dismissed";
const SHOW_DELAY_MS = 6000;

export function NotifyPopup() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof Notification === "undefined") return;
      if (Notification.permission === "granted") return;
      if (Notification.permission === "denied") return;
      if (localStorage.getItem(NOTIFY_KEY) === "1") return;
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      return;
    }
    const t = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setOpen(false);
  };

  const accept = async () => {
    if (typeof Notification === "undefined") {
      showToast("Navegador sem suporte. Entra no Discord!");
      window.open(DISCORD_URL, "_blank", "noopener,noreferrer");
      dismiss();
      return;
    }
    try {
      const perm =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;
      if (perm === "granted") {
        try {
          localStorage.setItem(NOTIFY_KEY, "1");
        } catch {}
        new Notification("Notificações ativadas ✅", {
          body: "Você será avisado quando rolar addon novo!",
          icon: "/apple-touch-icon.png",
        });
        showToast("Massa! Entra no Discord pra não perder nada.");
      } else {
        showToast("Sem problema — segue o Discord!");
      }
    } catch {
      showToast("Não consegui ativar agora.");
    }
    dismiss();
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Receber notificações de novos addons"
          className="fixed bottom-24 right-3 z-[55] w-[min(92vw,300px)] animate-mc-rise border-2 border-foreground bg-background p-3 shadow-[6px_6px_0_0_var(--ink)] sm:bottom-6 sm:right-6"
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="absolute -right-2 -top-2 border-2 border-foreground bg-background p-0.5 hover:bg-primary hover:text-primary-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-start gap-2">
            <div className="border-2 border-foreground bg-primary p-1.5 text-primary-foreground">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-extrabold uppercase leading-tight">
                Avisar addon novo?
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Receba uma notificação quando rolar mod novo no hub.
              </p>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={accept}
              className="btn-block flex-1 bg-primary text-primary-foreground !px-2 !py-1.5 text-[11px]"
            >
              Ativar
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="btn-block bg-background !px-2 !py-1.5 text-[11px]"
            >
              Agora não
            </button>
          </div>
        </div>
      )}
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