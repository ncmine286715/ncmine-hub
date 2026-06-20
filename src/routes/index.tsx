import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import addonsData from "@/data/addons.json";
import { Hero } from "@/components/Hero";
import { AddonsGrid } from "@/components/AddonsGrid";
import { FloatingBackground } from "@/components/FloatingBackground";
import { DownloadModal } from "@/components/DownloadModal";
import { PersonalizedFeed } from "@/components/PersonalizedFeed";
import { BottomNavigation, CategoriesPanel, AboutPanel, NotificationsPanel } from "@/components/BottomNavigation";
import type { Addon } from "@/components/AddonCard";
import { DiscordIcon, InstagramIcon, YouTubeIcon, TikTokIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL, CREATOR_NAME } from "@/lib/links";
import { trackEvent, initScrollTracker, initSession } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${CREATOR_NAME} — Addons de Minecraft Bedrock` },
      {
        name: "description",
        content: `Hub oficial do ${CREATOR_NAME}: addons curados de Minecraft Bedrock, Discord, YouTube e Instagram em um so lugar.`,
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
const NOTIFY_KEY = "ncmine:notify-optin";

// Deterministic shuffle (seeded) so SSR/hydration stay consistent
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

type Tab = "home" | "categorias" | "notificacoes" | "sobre";

function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [downloadFor, setDownloadFor] = useState<Addon | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check notification status on mount
  useEffect(() => {
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
      if (localStorage.getItem(NOTIFY_KEY) === "1") {
        setNotificationsEnabled(true);
      }
    } catch {}
  }, []);

  // Analytics: sessão + page_view + scroll
  useEffect(() => {
    initSession();
    trackEvent("page_view", { page: "home" });
    const cleanup = initScrollTracker();
    return () => { cleanup && cleanup(); };
  }, []);

  const { featured, rest } = useMemo(() => {
    const [first, ...others] = RAW_ADDONS;
    return { featured: first, rest: shuffleSeeded(others) };
  }, []);

  const handleDownload = (a: Addon) => {
    setDownloadFor(a);
  };

  const handleOpen = (a: Addon) => {
    navigate({ to: "/addon/$id", params: { id: a.id } });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab);
    if (tab === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate({ to: `/${tab}` as any });
    }
  };

  const handleEnableNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") {
      window.open(DISCORD_URL, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const perm = Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
      
      if (perm === "granted") {
        try {
          localStorage.setItem(NOTIFY_KEY, "1");
        } catch {}
        setNotificationsEnabled(true);
        new Notification("Notificacoes ativadas!", {
          body: "Voce sera avisado quando novos addons chegarem!",
          icon: "/apple-touch-icon.png",
        });
      }
    } catch {}
  }, []);

  return (
    <div className="relative min-h-screen pb-16 text-foreground sm:pb-0">
      <FloatingBackground />
      <Hero addonsCount={RAW_ADDONS.length} />

      {/* Redes sociais — segue o criador */}
      <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-4 sm:pt-6">
        <div className="border-2 border-foreground bg-background p-3 shadow-[3px_3px_0_0_var(--ink)] sm:p-4">
          <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4">
            <span className="font-pixel text-[10px] uppercase text-primary sm:text-xs">Siga o criador</span>
            <span className="text-[9px] font-bold uppercase text-muted-foreground sm:text-[10px]">— novidades em primeira mão</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("external_click", { to: "discord", source: "home_social" })}
              className="btn-block bg-[#5865F2] text-white !py-3 min-h-[52px] text-sm font-black uppercase active:scale-[0.98] transition-transform"
            >
              <DiscordIcon className="h-5 w-5" />
              Discord
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("external_click", { to: "instagram", source: "home_social" })}
              className="btn-block bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white !py-3 min-h-[52px] text-sm font-black uppercase active:scale-[0.98] transition-transform"
            >
              <InstagramIcon className="h-5 w-5" />
              Instagram
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("external_click", { to: "youtube", source: "home_social" })}
              className="btn-block bg-[#FF0000] text-white !py-3 min-h-[52px] text-sm font-black uppercase active:scale-[0.98] transition-transform"
            >
              <YouTubeIcon className="h-5 w-5" />
              YouTube
            </a>
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground sm:text-[11px]">
            Toque em um addon abaixo pra baixar. <span className="font-bold text-foreground">Grátis, sem pegadinha.</span>
          </p>
        </div>
      </section>

      {/* Feed Personalizado */}
      <section className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6">
        <PersonalizedFeed addons={RAW_ADDONS} onOpen={handleOpen} onDownload={handleDownload} />
      </section>

      <AddonsGrid 
        addons={rest} 
        featuredAddon={featured} 
        onDownload={handleDownload} 
        onOpen={handleOpen}
        externalCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Pre-footer CTA */}
      {!user && (
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-8 sm:py-12">
          <div className="border-2 border-foreground bg-primary/5 p-6 sm:p-10 text-center shadow-[6px_6px_0_0_var(--ink)]">
            <h3 className="text-xl sm:text-3xl font-black uppercase mb-2">Nao perca nenhum addon</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Crie sua conta gratis e receba alertas quando novos addons chegarem. Salve favoritos e ganhe XP.
            </p>
            <Link
              to="/auth"
              className="btn-block bg-primary text-primary-foreground !px-10 !py-4 text-sm sm:text-base font-black uppercase shadow-[6px_6px_0_0_var(--ink)] animate-mc-pulse-orange"
            >
              CRIAR CONTA GRATIS
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t-2 border-foreground bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
          <div>
            <div className="flex items-center gap-2 font-pixel text-xs">
              <MinecraftBlockIcon className="h-5 w-5 text-primary" />
              NCMINE
            </div>
            <p className="mt-2 max-w-sm text-xs text-background/70">
              Hub nao-oficial de addons. Todos os creditos vao para os criadores originais listados em cada addon.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#5865F2] text-white !py-2.5 min-h-[44px]"><DiscordIcon className="h-4 w-4" /> Discord</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground !py-2.5 min-h-[44px]"><InstagramIcon className="h-4 w-4" /> Instagram</a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#FF0000] text-white !py-2.5 min-h-[44px]"><YouTubeIcon className="h-4 w-4" /> YouTube</a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground !py-2.5 min-h-[44px]"><TikTokIcon className="h-4 w-4" /> TikTok</a>
          </div>
        </div>
        <div className="border-t-2 border-background/20 py-3 text-center font-pixel text-[9px] text-background/60">
          &copy; {new Date().getFullYear()} {CREATOR_NAME} &middot; <Link to="/legal" className="hover:text-background">Politica de Privacidade e Termos</Link>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        hasNewNotification={!notificationsEnabled}
      />

      {/* Panels */}
      {activeTab === "categorias" && (
        <CategoriesPanel
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onClose={() => setActiveTab("home")}
        />
      )}

      {activeTab === "sobre" && (
        <AboutPanel onClose={() => setActiveTab("home")} />
      )}

      {activeTab === "notificacoes" && (
        <NotificationsPanel
          onClose={() => setActiveTab("home")}
          onEnableNotifications={handleEnableNotifications}
          notificationsEnabled={notificationsEnabled}
        />
      )}

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
