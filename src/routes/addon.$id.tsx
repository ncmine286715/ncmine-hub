import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import addonsData from "@/data/addons.json";
import { FloatingBackground } from "@/components/FloatingBackground";
import { DownloadModal } from "@/components/DownloadModal";
import { TeraboxSteps } from "@/components/TeraboxSteps";
import { BottomNavigation } from "@/components/BottomNavigation";
import type { Addon } from "@/components/AddonCard";
import { AddonCard } from "@/components/AddonCard";
import { 
  Download, Star, User, Calendar, Tag, Share2, ArrowLeft, 
  ExternalLink, Play, ChevronRight, Sparkles, Clock, Info,
} from "lucide-react";
import { shareAddon } from "@/lib/share";
import { CREATOR_NAME, DISCORD_URL } from "@/lib/links";
import { DiscordIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";

import { RelatedAddons } from "@/components/RelatedAddons";
import { trackEvent, initScrollTracker, initSession } from "@/lib/analytics";
import { useEffect } from "react";

const RAW_ADDONS = addonsData as Addon[];

export const Route = createFileRoute("/addon/$id")({
  head: ({ params }) => {
    const addon = RAW_ADDONS.find((a) => a.id === params.id);
    if (!addon) {
      return {
        meta: [
          { title: "Addon nao encontrado — NCMINE" },
          { name: "description", content: "Este addon nao existe ou foi removido." },
        ],
      };
    }
    return {
      meta: [
        { title: `${addon.title} — Download Gratis | NCMINE` },
        { name: "description", content: addon.short },
        { property: "og:title", content: `${addon.title} — Download Gratis` },
        { property: "og:description", content: addon.short },
        { property: "og:image", content: addon.image },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: addon.title },
        { name: "twitter:description", content: addon.short },
        { name: "twitter:image", content: addon.image },
        { name: "keywords", content: addon.tags?.join(", ") || "" },
        { name: "author", content: addon.author || CREATOR_NAME },
      ],
    };
  },
  component: AddonPage,
});

import { FavoriteButton } from "@/components/FavoriteButton";
import { RatingAndComments } from "@/components/RatingAndComments";

function AddonPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [downloadFor, setDownloadFor] = useState<Addon | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const scrollToTutorial = () => {
    document.getElementById("como-baixar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const addon = useMemo(() => RAW_ADDONS.find((a) => a.id === id), [id]);

  // Analytics
  useEffect(() => {
    initSession();
    if (addon) trackEvent("addon_view", { addonId: addon.id, title: addon.title });
    const cleanup = initScrollTracker();
    return () => { cleanup && cleanup(); };
  }, [addon?.id]);
  
  // Get related addons (same category or random if none)
  const relatedAddons = useMemo(() => {
    if (!addon) return [];
    const sameCat = RAW_ADDONS.filter(
      (a) => a.id !== addon.id && a.category === addon.category
    ).slice(0, 4);
    if (sameCat.length >= 4) return sameCat;
    const others = RAW_ADDONS.filter(
      (a) => a.id !== addon.id && !sameCat.includes(a)
    ).slice(0, 4 - sameCat.length);
    return [...sameCat, ...others];
  }, [addon]);

  const handleShare = async () => {
    if (!addon) return;
    await shareAddon(addon, (msg) => {
      setToast(msg);
      window.setTimeout(() => setToast(null), 2200);
    });
  };

  const handleDownload = (a: Addon) => {
    setDownloadFor(a);
  };

  if (!addon) {
    return (
      <div className="relative min-h-screen pb-16 sm:pb-0">
        <FloatingBackground />
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
          <MinecraftBlockIcon className="mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="font-pixel text-2xl text-foreground">ADDON NAO ENCONTRADO</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este addon nao existe ou foi removido.
          </p>
          <Link
            to="/"
            className="btn-block mt-6 bg-primary text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Home
          </Link>
        </div>
        <BottomNavigation activeTab="home" onTabChange={() => navigate({ to: "/" })} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 text-foreground sm:pb-0">
      <FloatingBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <FavoriteButton addonId={addon.id} />
            <button
              onClick={handleShare}
              className="btn-block bg-background !px-2 !py-1.5 text-xs sm:!px-3 sm:!py-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 border-2 border-foreground bg-background px-3 py-1.5 text-xs font-bold shadow-[3px_3px_0_0_var(--ink)]">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-8">
        {/* Addon Hero */}
        <div className="card-block overflow-hidden">
          <div className="grid gap-0 sm:grid-cols-2">
            {/* Image/Video */}
            <div className="relative aspect-video w-full overflow-hidden border-b-2 border-foreground bg-muted sm:aspect-auto sm:border-b-0 sm:border-r-2">
              {addon.youtubeId ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${addon.youtubeId}`}
                  title={addon.title}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={addon.image}
                  alt={addon.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 border-2 border-foreground bg-primary px-2 py-0.5 font-pixel text-[8px] uppercase text-primary-foreground sm:text-[9px]">
                <Tag className="h-3 w-3" />
                {addon.category}
              </span>
            </div>

            {/* Content */}
            <div className="flex flex-col p-4 sm:p-6">
              <h1 className="mb-2 text-xl font-black uppercase leading-tight sm:text-3xl">
                {addon.title}
              </h1>

              {/* Meta */}
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3 sm:text-sm">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {addon.author || "Desconhecido"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {addon.date}
                </span>
                <span className="font-pixel text-[9px] sm:text-[10px]">v{addon.version}</span>
              </div>

              {/* Rating & Downloads */}
              <div className="mb-4 flex items-center gap-4">
                <span className="inline-flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${i < addon.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                    />
                  ))}
                  <span className="ml-1 text-xs font-bold">{addon.rating}/5</span>
                </span>
                <span className="inline-flex items-center gap-1 font-pixel text-xs">
                  <Download className="h-4 w-4" />
                  {addon.downloads.toLocaleString("pt-BR")} downloads
                </span>
              </div>

              {/* Short description */}
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {addon.short}
              </p>

              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {addon.tags?.slice(0, 6).map((t) => (
                  <span
                    key={t}
                    className="border-2 border-foreground bg-background px-2 py-0.5 text-[9px] uppercase sm:text-[10px]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => handleDownload(addon)}
                  className="btn-block flex-1 bg-primary text-primary-foreground !py-3 text-sm animate-mc-pulse-orange sm:!py-4 sm:text-base"
                >
                  <Download className="h-5 w-5" />
                  Baixar Gratis
                </button>
                <button
                  onClick={scrollToTutorial}
                  className="btn-block bg-foreground text-background !py-3 text-sm sm:!py-4"
                >
                  <Play className="h-5 w-5" />
                  Como Baixar
                </button>
              </div>

              {addon.youtubeId && (
                <a
                  href={`https://youtu.be/${addon.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Ver video completo no YouTube <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tutorial — sempre visível */}
        <div id="como-baixar" className="mt-4 scroll-mt-20 sm:mt-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-pixel text-xs text-primary sm:text-sm">COMO BAIXAR ESTE ADDON</span>
            <span className="h-px flex-1 bg-foreground/20" />
          </div>
          <TeraboxSteps />
          <button
            onClick={() => handleDownload(addon)}
            className="btn-block mt-3 w-full bg-primary text-primary-foreground !py-3.5 text-sm font-black animate-mc-pulse-orange sm:text-base"
          >
            <Download className="h-5 w-5" />
            Baixar {addon.title}
          </button>
        </div>

        {/* Full Description */}
        <div className="mt-4 card-block p-4 sm:mt-6 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 font-pixel text-xs sm:text-sm">
            <Info className="h-4 w-4 text-primary" />
            SOBRE ESTE ADDON
          </h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 sm:text-base">
            {addon.description}
          </div>
        </div>

        {/* Social Features */}
        <RatingAndComments addonId={addon.id} />

        {/* Continue Exploring */}
        <div className="mt-12 mb-8">
          <h2 className="mb-6 flex items-center gap-2 font-pixel text-xs sm:text-sm text-primary">
            <Sparkles className="h-5 w-5" />
            CONTINUAR EXPLORANDO
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
            {relatedAddons.map((ra) => (
              <AddonCard 
                key={ra.id} 
                addon={ra} 
                onDownload={() => {}} 
                onOpen={(a) => navigate({ to: '/addon/$id', params: { id: a.id } })} 
              />
            ))}
          </div>
        </div>

        {/* Related Addons */}
        {relatedAddons.length > 0 && (
          <section className="mt-6 sm:mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-pixel text-xs sm:text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                VOCE TAMBEM VAI GOSTAR
              </h2>
              <Link
                to="/"
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Ver todos <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
              {relatedAddons.map((a) => (
                <AddonCard
                  key={a.id}
                  addon={a}
                  onDownload={handleDownload}
                  onOpen={(addon) => navigate({ to: "/addon/$id", params: { id: addon.id } })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Discord CTA */}
        <div className="mt-6 card-block bg-[#5865F2] p-4 text-white sm:mt-10 sm:p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <DiscordIcon className="h-12 w-12 shrink-0 sm:h-16 sm:w-16" />
            <div className="flex-1">
              <h3 className="font-pixel text-sm sm:text-base">ENTRE NO DISCORD</h3>
              <p className="mt-1 text-xs text-white/80 sm:text-sm">
                Receba novos addons em primeira mao, tire duvidas e conheca a comunidade.
              </p>
            </div>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block bg-white text-[#5865F2] !px-6 !py-3 text-sm font-bold"
            >
              Entrar Agora
            </a>
          </div>
        </div>
      </main>

      {/* Footer mini */}
      <footer className="border-t-2 border-foreground bg-foreground py-4 text-center font-pixel text-[8px] text-background/60 sm:text-[9px]">
        &copy; {new Date().getFullYear()} {CREATOR_NAME} &middot; Todos os direitos reservados
      </footer>

      {/* Bottom Navigation (mobile) */}
      <BottomNavigation 
        activeTab="home" 
        onTabChange={() => navigate({ to: "/" })} 
      />

      {/* Download Modal */}
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
