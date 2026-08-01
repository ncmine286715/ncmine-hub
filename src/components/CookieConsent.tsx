import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { applyConsent, getCookieConsent, setCookieConsent } from "@/lib/consent";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const choice = getCookieConsent();
      applyConsent(choice);
      setOpen(choice === null);
    };
    sync();
    window.addEventListener("cookie-consent", sync);
    return () => window.removeEventListener("cookie-consent", sync);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-2 bottom-2 z-[60] mx-auto max-w-2xl rounded-lg border border-border bg-background p-3 shadow-lg sm:inset-x-4 sm:bottom-4 sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <Cookie className="mr-1.5 inline h-4 w-4 text-primary" aria-hidden />
          Usamos cookies de medição para saber quais addons interessam a você. Nenhum dado pessoal é vendido.{" "}
          <a href="/cookies" className="underline hover:text-foreground">Saiba mais</a>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setCookieConsent("rejected")}
            className="btn-block bg-background text-foreground !px-3 !py-2 !text-xs"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => setCookieConsent("accepted")}
            className="btn-block bg-primary text-primary-foreground !px-4 !py-2 !text-xs"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
