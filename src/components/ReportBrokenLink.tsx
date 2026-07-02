import { useState } from "react";
import { AlertTriangle, X, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { recordReport } from "@/lib/firebase-services";
import { trackEvent } from "@/lib/analytics";

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID as string | undefined;
const REPORT_EMAIL = "ncmine75@gmail.com";

export function ReportBrokenLink({ addonId, addonTitle }: { addonId: string; addonTitle: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    trackEvent("report_broken_link", { addonId });
    try {
      if (FORMSPREE_ID) {
        await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addon: addonTitle, addonId, issue: issue || "Link não funcionou" }),
        });
      } else {
        const subject = encodeURIComponent(`Link quebrado: ${addonTitle}`);
        const body = encodeURIComponent(`Addon: ${addonTitle} (${addonId})\nProblema: ${issue || "Link não funcionou"}`);
        window.open(`mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
      }
      if (user) await recordReport(user.uid, addonId).catch(() => {});
      toast.success("Reporte enviado. Obrigado!");
      setOpen(false);
      setIssue("");
    } catch {
      toast.error("Não deu pra enviar agora. Tenta de novo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground hover:text-primary sm:text-xs"
      >
        <AlertTriangle className="h-3.5 w-3.5" /> Link não funcionou?
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/70 p-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="card-block relative w-full max-w-sm bg-background p-4 animate-mc-rise sm:p-5">
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="absolute right-2 top-2 border-2 border-foreground bg-background p-1 hover:bg-primary hover:text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="mb-1 flex items-center gap-2 font-pixel text-[11px] uppercase text-primary">
              <AlertTriangle className="h-4 w-4" /> Reportar problema
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">{addonTitle}</p>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="O que aconteceu? (opcional)"
              rows={3}
              className="w-full resize-none border-2 border-foreground bg-background p-2 text-sm outline-none focus:bg-primary/5"
            />
            <button
              onClick={submit}
              disabled={sending}
              className="btn-block mt-3 w-full bg-primary text-primary-foreground !py-2.5 text-sm"
            >
              <Send className="h-4 w-4" /> {sending ? "Enviando..." : "Enviar reporte"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
