import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCssUrl from "../styles.css?url";
// Ensure the link href carries the ?url query so Vite serves it as CSS, not as a JS module.
const appCss = appCssUrl.includes("?") ? appCssUrl : `${appCssUrl}?url`;

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      {/* floating pixel blocks */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-10 w-10 rotate-12 border-2 border-foreground bg-primary shadow-[4px_4px_0_0_var(--ink)] animate-mc-rise" />
        <div className="absolute right-[12%] top-[22%] h-8 w-8 -rotate-6 border-2 border-foreground bg-foreground" />
        <div className="absolute bottom-[18%] left-[18%] h-6 w-6 border-2 border-foreground bg-foreground" />
        <div className="absolute bottom-[14%] right-[20%] h-12 w-12 rotate-3 border-2 border-foreground bg-primary shadow-[4px_4px_0_0_var(--ink)]" />
      </div>
      <div className="relative z-10 max-w-md text-center">
        <pre className="mx-auto select-none font-pixel text-[10px] leading-[1.1] text-foreground sm:text-xs" aria-hidden>
{`  ███   ███   █  █
  █ █   █ █   █  █
  █ █   █ █   ████
  █ █   █ █      █
  ███   ███      █`}
        </pre>
        <h1 className="mt-4 text-3xl font-black uppercase sm:text-4xl">
          Bloco não encontrado
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Essa página caiu na lava 🔥 — mas a gente tem mais de <span className="font-bold text-primary">100 addons</span> esperando por você.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="btn-block bg-primary text-primary-foreground animate-mc-pulse-orange !px-4 !py-2.5 text-sm"
          >
            🧱 Voltar ao Hub
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-3 inline-block border-2 border-foreground bg-primary px-3 py-1 font-pixel text-xs text-primary-foreground animate-mc-shake">
          CRASHOU
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">
          Um Creeper explodiu essa página
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tenta de novo ou volta pro hub que tá tudo certo lá.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-block bg-primary text-primary-foreground !px-4 !py-2.5 text-sm"
          >
            🔄 Tentar de novo
          </button>
          <a
            href="/"
            className="btn-block bg-background text-foreground !px-4 !py-2.5 text-sm"
          >
            🧱 Hub
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "@ncmine — Addons de Minecraft" },
      { name: "description", content: "Hub oficial do @ncmine: addons de Minecraft Bedrock, Discord, YouTube e Instagram." },
      { name: "author", content: "@ncmine" },
      { name: "theme-color", content: "#ff7a00" },
      { property: "og:site_name", content: "@ncmine" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "@ncmine — Addons de Minecraft" },
      { name: "twitter:title", content: "@ncmine — Addons de Minecraft" },
      { property: "og:description", content: "Hub oficial do @ncmine: addons de Minecraft Bedrock, Discord, YouTube e Instagram." },
      { name: "twitter:description", content: "Hub oficial do @ncmine: addons de Minecraft Bedrock, Discord, YouTube e Instagram." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/de2efe20-b5d4-44f9-9e1f-52fb0f86a5bd/id-preview-235b3c1d--67433150-dd89-446e-884c-5349cc1549b9.lovable.app-1779241468799.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/de2efe20-b5d4-44f9-9e1f-52fb0f86a5bd/id-preview-235b3c1d--67433150-dd89-446e-884c-5349cc1549b9.lovable.app-1779241468799.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider } from "../hooks/use-auth";
import { useEffect } from "react";
import { soundManager } from "../lib/sounds";
import { getLatestGlobalNotif } from "../lib/firebase-services";
import { toast } from "sonner";
import { EngagementToast } from "../components/EngagementToast";
import { DailyRetention } from "../components/DailyRetention";
import { InAppBrowserGuard } from "../components/InAppBrowserGuard";
import { Toaster } from "sonner";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    let lastNotifId = localStorage.getItem('last_global_notif');

    const checkGlobalNotif = async () => {
      try {
        const latest = await getLatestGlobalNotif();
        if (latest && latest.id !== lastNotifId) {
          soundManager.play('xp');

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(latest.title, { body: latest.message, icon: '/apple-touch-icon.png' });
          }

          toast(latest.title, {
            description: latest.message,
            action: latest.addonId ? {
              label: 'BAIXAR AGORA',
              onClick: () => window.location.href = `/addon/${latest.addonId}`
            } : undefined,
            duration: 10000,
          });

          localStorage.setItem('last_global_notif', latest.id);
        }
      } catch {}
    };

    checkGlobalNotif();
    const interval = setInterval(checkGlobalNotif, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        soundManager.play('click');
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <EngagementToast />
        <DailyRetention />
        <InAppBrowserGuard />
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
