import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, Star, User, Calendar, Share2, ExternalLink } from "lucide-react";
import { useState } from "react";
import addonsData from "@/data/addons.json";
import type { Addon } from "@/components/AddonCard";
import { DownloadModal } from "@/components/DownloadModal";
import { TeraboxTutorial } from "@/components/TeraboxTutorial";
import { RelatedAddons } from "@/components/RelatedAddons";
import { InAppBrowserGuard } from "@/components/InAppBrowserGuard";
import { MinecraftBlockIcon, DiscordIcon, InstagramIcon, YouTubeIcon, TikTokIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL, CREATOR_NAME } from "@/lib/links";
import { shareAddon } from "@/lib/share";

const ALL = addonsData as Addon[];
const SITE = "https://ncmine-hub.lovable.app";

export const Route = createFileRoute("/addon/$id")({
  loader: ({ params }) => {
    const addon = ALL.find((a) => a.id === params.id);
    if (!addon) throw notFound();
    return { addon };
  },
  head: ({ loaderData, params }) => {
    const a = loaderData?.addon;
    if (!a) return {};
    const url = `${SITE}/addon/${params.id}`;
    const title = `${a.title} — Addon Minecraft Bedrock | ${CREATOR_NAME}`;
    const desc = a.short || a.description?.slice(0, 155) || "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: a.title },
        { property: "og:description", content: desc },
        { property: "og:image", content: a.image },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: a.title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: a.image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: a.title,
            applicationCategory: "GameApplication",
            operatingSystem: "Minecraft Bedrock",
            description: a.description,
            image: a.image,
            author: { "@type": "Person", name: a.author || CREATOR_NAME },
            aggregateRating: a.rating
              ? { "@type": "AggregateRating", ratingValue: a.rating, reviewCount: Math.max(1, a.downloads || 1) }
              : undefined,
          }),
        },
      ],
    };
  },
  component: AddonPage,
  notFoundComponent: AddonNotFound,
});

function AddonPage() {
  const { addon } = Route.useLoaderData();
  const [openDownload, setOpenDownload] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleShare = async () => {
    await shareAddon(addon, (msg) => {
      setToast(msg);
      window.setTimeout(() => setToast(null), 2200);
    });
  };

  return (
    <div className="min-h-screen text-foreground">
      {/* Top bar */}
      <header className="border-b-2 border-foreground">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
          <Link to="/" className="inline-flex items-center gap-2 font-pixel text-[10px] uppercase hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 font-pixel text-[10px] uppercase">
            <MinecraftBlockIcon className="h-4 w-4 text-primary" />
            NCMINE
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-8">
        {/* Hero image */}
        <div className="relative mb-4 overflow-hidden border-2 border-foreground bg-muted shadow-[4px_4px_0_0_var(--ink)] sm:mb-6">
          {addon.youtubeId ? (
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${addon.youtubeId}?rel=0`}
                title={addon.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <img
              src={addon.image}
              alt={addon.title}
              referrerPolicy="no-referrer"
              className="aspect-[16/9] w-full object-cover"
            />
          )}
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 border-2 border-foreground bg-primary px-2 py-0.5 font-pixel text-[9px] uppercase text-primary-foreground">
            {addon.category}
          </span>
          <span className="absolute right-2 top-2 border-2 border-foreground bg-background px-2 py-0.5 font-pixel text-[9px]">
            v{addon.version}
          </span>
        </div>

        {/* Title + meta */}
        <h1 className="text-2xl font-black uppercase leading-tight sm:text-4xl">
          {addon.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{addon.author || "Desconhecido"}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{addon.date}</span>
          <span className="inline-flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < addon.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
            ))}
          </span>
        </div>

        {/* Sticky primary action on mobile */}
        <div className="sticky top-0 z-30 -mx-3 mt-4 flex gap-2 border-y-2 border-foreground bg-background/95 px-3 py-2 backdrop-blur sm:relative sm:top-auto sm:mx-0 sm:mt-5 sm:rounded-none sm:border-0 sm:px-0 sm:py-0">
          <button
            onClick={() => setOpenDownload(true)}
            className="btn-block flex-1 bg-primary text-primary-foreground animate-mc-pulse-orange !py-3 text-sm sm:!py-3.5 sm:text-base"
          >
            <Download className="h-5 w-5" />
            Baixar agora
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartilhar"
            className="btn-block bg-background !px-3 !py-3 sm:!py-3.5"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Tags */}
        {addon.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {addon.tags.map((t: string) => (
              <span key={t} className="border-2 border-foreground bg-background px-1.5 py-0.5 text-[10px] uppercase">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {/* Description */}
        <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85 sm:text-base">
          {addon.description}
        </div>

        {/* Tutorial Terabox - universal */}
        <div className="mt-6">
          <TeraboxTutorial />
        </div>

        {addon.youtubeId && (
          <a
            href={`https://youtu.be/${addon.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Ver vídeo do addon no YouTube <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Related */}
        <RelatedAddons current={addon} all={ALL} />
      </main>

      {/* Footer (Discord + links) */}
      <footer className="mt-8 border-t-2 border-foreground bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-pixel text-xs">
            <MinecraftBlockIcon className="h-5 w-5 text-primary" /> NCMINE
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#5865F2] text-white !py-2 text-xs"><DiscordIcon className="h-4 w-4" /> Discord</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground !py-2 text-xs"><InstagramIcon className="h-4 w-4" /> Insta</a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#FF0000] text-white !py-2 text-xs"><YouTubeIcon className="h-4 w-4" /> YT</a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground !py-2 text-xs"><TikTokIcon className="h-4 w-4" /> TikTok</a>
          </div>
        </div>
      </footer>

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 border-2 border-foreground bg-background px-3 py-2 text-xs font-bold shadow-[3px_3px_0_0_var(--ink)]">
          {toast}
        </div>
      )}

      <DownloadModal
        open={openDownload}
        url={addon.downloadUrl}
        title={addon.title}
        onClose={() => setOpenDownload(false)}
      />
      <InAppBrowserGuard />
    </div>
  );
}

function AddonNotFound() {
  const { id } = Route.useParams();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="font-pixel text-5xl text-primary">404</div>
      <h1 className="mt-3 text-xl font-black uppercase">Addon não encontrado</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        O addon <span className="font-mono">{id}</span> não existe ou foi removido.
      </p>
      <Link to="/" className="btn-block mt-5 bg-primary text-primary-foreground !px-4 !py-2.5 text-sm">
        <ArrowLeft className="h-4 w-4" /> Voltar ao hub
      </Link>
    </div>
  );
}