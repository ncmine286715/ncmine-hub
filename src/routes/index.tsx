import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useLiveAddons } from "@/hooks/use-live-addons";
import { Hero } from "@/components/Hero";
import { AddonsGrid } from "@/components/AddonsGrid";
import { DownloadModal } from "@/components/DownloadModal";
import type { Addon } from "@/components/AddonCard";
import { CREATOR_NAME, SITE_NAME, TIKTOK_URL } from "@/lib/links";
import { SITE_URL, canonical } from "@/lib/site";
import { trackEvent, initScrollTracker } from "@/lib/analytics";

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
      { property: "og:url", content: canonical("/") },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
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
    url: SITE_URL,
    inLanguage: "pt-BR",
    publisher: { "@type": "Person", name: CREATOR_NAME, url: TIKTOK_URL },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
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
