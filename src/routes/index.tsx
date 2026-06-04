import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import addonsData from "@/data/addons.json";
import { Hero } from "@/components/Hero";
import { AddonsGrid } from "@/components/AddonsGrid";
import { FloatingBackground } from "@/components/FloatingBackground";
import { DownloadModal } from "@/components/DownloadModal";
import { InAppBrowserGuard } from "@/components/InAppBrowserGuard";
import { BottomNavigation, CategoriesPanel, AboutPanel, NotificationsPanel } from "@/components/BottomNavigation";
import type { Addon } from "@/components/AddonCard";
import { DiscordIcon, InstagramIcon, YouTubeIcon, TikTokIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL, CREATOR_NAME } from "@/lib/links";

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
      <AddonsGrid 
        addons={rest} 
        featuredAddon={featured} 
        onDownload={handleDownload} 
        onOpen={handleOpen}
        externalCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

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
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#5865F2] text-white"><DiscordIcon className="h-4 w-4" /> Discord</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground"><InstagramIcon className="h-4 w-4" /> Instagram</a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-[#FF0000] text-white"><YouTubeIcon className="h-4 w-4" /> YouTube</a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="btn-block bg-background text-foreground"><TikTokIcon className="h-4 w-4" /> TikTok</a>
          </div>
        </div>
        <div className="border-t-2 border-background/20 py-3 text-center font-pixel text-[9px] text-background/60">
          &copy; {new Date().getFullYear()} {CREATOR_NAME} &middot; Politica de Privacidade
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
      />
      <InAppBrowserGuard />
    </div>
  );
}
