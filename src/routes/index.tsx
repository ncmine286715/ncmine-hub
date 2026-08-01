import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useLiveAddons } from "@/hooks/use-live-addons";
import { Hero } from "@/components/Hero";
import { AddonsGrid } from "@/components/AddonsGrid";
import { DownloadModal } from "@/components/DownloadModal";
import type { Addon } from "@/components/AddonCard";
import { DiscordIcon, InstagramIcon, YouTubeIcon, TikTokIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL, CREATOR_NAME, SITE_NAME } from "@/lib/links";
import { trackEvent, initScrollTracker } from "@/lib/analytics";
import { AdsterraBanner } from "@/components/ads/AdsterraBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${CREATOR_NAME} — Addons de Minecraft Bedrock` },
      {
        name: "description",
        content: `Hub oficial do ${CREATOR_NAME}: addons curados de Minecraft Bedrock em um só lugar. Baixe grátis, sem cadastro.`,
      },
      { property: "og:title", content: `${CREATOR_NAME} — Addons de Minecraft` },
      { property: "og:description", content: "Addons selecionados, sem cadastro. Curadoria semanal do @ncmine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function shuffleSeeded<T>(arr: T[], seed = 1337): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function Index() {
  const navigate = useNavigate();
  const { addons: RAW_ADDONS, loading } = useLiveAddons();
  const [downloadFor, setDownloadFor] = useState<Addon | null>(null);
  const [initialQuery, setInitialQuery] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setInitialQuery(q);
  }, []);

  useEffect(() => {
    trackEvent("page_view", { page: "home" });
    const cleanup = initScrollTracker();
    return () => { cleanup && cleanup(); };
  }, []);

  const { featured, rest } = useMemo(() => {
    const sorted = [...RAW_ADDONS].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    const first = sorted[0];
    const others = RAW_ADDONS.filter((a) => a.id !== first?.id);
    return { featured: first, rest: shuffleSeeded(others) };
  }, [RAW_ADDONS]);

  const handleDownload = (a: Addon) => setDownloadFor(a);
  const handleOpen = (a: Addon) => navigate({ to: "/addon/$id", params: { id: a.id } });

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: "https://ncmine-hub.lovable.app",
    description: `Hub de ${RAW_ADDONS.length} addons grátis para Minecraft Bedrock curado por ${CREATOR_NAME}`,
  };

  return (
    <div className="relative min-h-screen text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Hero addonsCount={RAW_ADDONS.length} />

      <AddonsGrid
        addons={rest}
        featuredAddon={featured}
        onDownload={handleDownload}
        onOpen={handleOpen}
        initialQuery={initialQuery}
        loading={loading && rest.length === 0}
      />

      <div className="mx-auto w-full max-w-6xl px-2 py-4 sm:px-4 sm:py-6">
        <AdsterraBanner />
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MinecraftBlockIcon className="h-5 w-5 text-primary" />
              <span className="font-pixel text-xs uppercase tracking-wider">{SITE_NAME}</span>
            </div>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground">
              Hub não-oficial de addons. Os créditos vão para os criadores originais listados em cada addon.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <FooterLink href={DISCORD_URL} label="Discord"><DiscordIcon className="h-4 w-4" /></FooterLink>
            <FooterLink href={INSTAGRAM_URL} label="Instagram"><InstagramIcon className="h-4 w-4" /></FooterLink>
            <FooterLink href={YOUTUBE_URL} label="YouTube"><YouTubeIcon className="h-4 w-4" /></FooterLink>
            <FooterLink href={TIKTOK_URL} label="TikTok"><TikTokIcon className="h-4 w-4" /></FooterLink>
          </div>
        </div>
        <div className="border-t border-border py-3 text-center font-pixel text-[9px] text-muted-foreground">
          © {new Date().getFullYear()} {CREATOR_NAME} · <Link to="/legal" className="hover:text-foreground">Política de Privacidade e Termos</Link>
        </div>
      </footer>

      <DownloadModal
        open={!!downloadFor}
        url={downloadFor?.downloadUrl ?? "#"}
        title={downloadFor?.title ?? ""}
        onClose={() => setDownloadFor(null)}
        addonId={downloadFor?.id}
      />
    </div>
  );
}

function FooterLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-ghost border border-border !px-3 !py-2 !text-xs"
      aria-label={label}
    >
      {children}
      <span>{label}</span>
    </a>
  );
}
