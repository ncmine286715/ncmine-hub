import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LEGAL_UPDATED_LABEL, SITE_TITLE } from "@/lib/site";

export function LegalLayout({
  title,
  intro,
  children,
  showUpdated = true,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
  showUpdated?: boolean;
}) {
  return (
    <div className="relative min-h-screen text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao início
          </Link>
          <span className="font-pixel text-[10px] uppercase tracking-wider">{SITE_TITLE}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        <h1 className="text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{intro}</p>}
        {showUpdated && (
          <p className="mt-3 text-xs text-muted-foreground">
            Última atualização: <time dateTime="2026-08-01">{LEGAL_UPDATED_LABEL}</time>
          </p>
        )}

        <div className="legal-prose mt-8 space-y-8">{children}</div>
      </main>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}
