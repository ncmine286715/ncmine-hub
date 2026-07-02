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
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL, CREATOR_NAME, SITE_NAME } from "@/lib/links";
import { trackEvent, initScrollTracker, initSession } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { NullMascot } from "@/components/NullMascot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NudgePopup } from "@/components/NudgePopup";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { homeOnboardingSteps } from "@/components/onboarding/homeOnboardingSteps";

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
  // Começa vazio em ambos server e client (evita mismatch de hidratação) e só
  // aplica o ?q= da URL depois do mount.
  const [initialQuery, setInitialQuery] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setInitialQuery(q);
  }, []);

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
    // Featured = addon mais baixado (prova social real)
    const sorted = [...RAW_ADDONS].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    const first = sorted[0];
    const others = RAW_ADDONS.filter((a) => a.id !== first.id);
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: "https://mineaddonsnews.online",
    description: `Hub de ${RAW_ADDONS.length} addons gratis para Minecraft Bedrock curado por ${CREATOR_NAME}`,
  };

  return (
    <div className="relative min-h-screen pb-16 text-foreground sm:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <FloatingBackground />
      <Hero addonsCount={RAW_ADDONS.length} />

      {/* Feed Personalizado */}
      <section className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-5">
        <PersonalizedFeed addons={RAW_ADDONS} onOpen={handleOpen} onDownload={handleDownload} />
      </section>

      <AddonsGrid 
        addons={rest} 
        featuredAddon={featured} 
        onDownload={handleDownload} 
        onOpen={handleOpen}
        externalCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        initialQuery={initialQuery}
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
          <div data-onboarding="social" className="flex flex-wrap gap-2">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#5865F2] text-white !py-2.5 min-h-[44px]"><DiscordIcon className="h-4 w-4" /> Discord</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground !py-2.5 min-h-[44px]"><InstagramIcon className="h-4 w-4" /> Instagram</a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#FF0000] text-white !py-2.5 min-h-[44px]"><YouTubeIcon className="h-4 w-4" /> YouTube</a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground !py-2.5 min-h-[44px]"><TikTokIcon className="h-4 w-4" /> TikTok</a>
            <ThemeToggle className="min-h-[44px]" />
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

      {/* Mascote Null + Nudge de download */}
      <NullMascot />
      <NudgePopup addon={featured} onDownload={handleDownload} />

      {/* Onboarding — explica o hub e guia até o download */}
      <OnboardingTour steps={homeOnboardingSteps} storageKey="ncmine:onboarding:home:v1" />
    </div>
  );
}
