import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import addonsData from "@/data/addons.json";
import { Hero } from "@/components/Hero";
import { AddonsGrid } from "@/components/AddonsGrid";
import { FloatingBackground } from "@/components/FloatingBackground";
import { DownloadModal } from "@/components/DownloadModal";
import { AddonDetailModal } from "@/components/AddonDetailModal";
import { InAppBrowserGuard } from "@/components/InAppBrowserGuard";
import { MobileStickyCTA } from "@/components/MobileStickyCTA";
import type { Addon } from "@/components/AddonCard";
import { DiscordIcon, InstagramIcon, YouTubeIcon, TikTokIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL, CREATOR_NAME } from "@/lib/links";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${CREATOR_NAME} — Addons de Minecraft Bedrock` },
      {
        name: "description",
        content: `Hub oficial do ${CREATOR_NAME}: addons curados de Minecraft Bedrock, Discord, YouTube e Instagram em um só lugar.`,
      },
      { property: "og:title", content: `${CREATOR_NAME} — Addons de Minecraft` },
      { property: "og:description", content: "Addons selecionados, Discord, YouTube e mais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const RAW_ADDONS = addonsData as Addon[];

// Deterministic shuffle (seeded) so SSR/hydration stay consistent
// but the order doesn't follow the JSON sequence.
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
  const [downloadFor, setDownloadFor] = useState<Addon | null>(null);
  const [detailFor, setDetailFor] = useState<Addon | null>(null);
  const ALL_ADDONS = useMemo(() => shuffleSeeded(RAW_ADDONS), []);

  const handleDownload = (a: Addon) => {
    setDetailFor(null);
    setDownloadFor(a);
  };

  return (
    <div className="relative min-h-screen text-foreground">
      <FloatingBackground />
      <Hero addonsCount={ALL_ADDONS.length} />
      <AddonsGrid addons={ALL_ADDONS} onDownload={handleDownload} onOpen={setDetailFor} />

      {/* Footer */}
      <footer className="border-t-2 border-foreground bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-pixel text-xs">
              <MinecraftBlockIcon className="h-5 w-5 text-primary" />
              NCMINE
            </div>
            <p className="mt-2 max-w-sm text-xs text-background/70">
              Hub não-oficial de addons. Todos os créditos vão para os criadores originais listados em cada addon.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#5865F2] text-white"><DiscordIcon className="h-4 w-4" /> Discord</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground"><InstagramIcon className="h-4 w-4" /> Instagram</a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#FF0000] text-white"><YouTubeIcon className="h-4 w-4" /> YouTube</a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground"><TikTokIcon className="h-4 w-4" /> TikTok</a>
          </div>
        </div>
        <div className="border-t-2 border-background/20 py-3 text-center font-pixel text-[9px] text-background/60">
          © {new Date().getFullYear()} {CREATOR_NAME}
        </div>
      </footer>

      <AddonDetailModal
        addon={detailFor}
        onClose={() => setDetailFor(null)}
        onDownload={handleDownload}
      />
      <DownloadModal
        open={!!downloadFor}
        url={downloadFor?.downloadUrl ?? "#"}
        title={downloadFor?.title ?? ""}
        onClose={() => setDownloadFor(null)}
      />
      <InAppBrowserGuard />
      <MobileStickyCTA />
    </div>
  );
}
