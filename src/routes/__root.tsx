import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { InAppBrowserGuard } from "../components/InAppBrowserGuard";
import { SocialDock } from "../components/SocialDock";
import { FloatingBackground } from "../components/FloatingBackground";
import { pageview } from "../lib/gtag";

import appCssUrl from "../styles.css?url";
// Em dev o Vite serve CSS como módulo JS; `?direct` força CSS real no <link>.
const appCss = import.meta.env.DEV
  ? `${appCssUrl.split("?")[0]}?direct`
  : appCssUrl;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <p className="font-pixel text-xs text-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Página não encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Esse endereço não existe (ou o addon foi removido).
        </p>
        <Link to="/" className="btn-block mt-6 bg-primary text-primary-foreground">
          Voltar ao hub
        </Link>
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
        <p className="font-pixel text-xs text-primary">Erro</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Algo deu errado</h1>
        <p className="mt-3 text-sm text-muted-foreground">Tenta de novo ou volta pro hub.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-block bg-primary text-primary-foreground"
          >
            Tentar de novo
          </button>
          <a href="/" className="btn-block bg-background text-foreground">Hub</a>
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
      { title: "@ncmine — Addons de Minecraft Bedrock" },
      { name: "description", content: "Hub curado de addons Minecraft Bedrock do @ncmine. Baixe grátis, sem cadastro." },
      { name: "author", content: "@ncmine" },
      { name: "theme-color", content: "#ffffff" },
      { property: "og:site_name", content: "@ncmine" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "@ncmine — Addons de Minecraft Bedrock" },
      { name: "twitter:title", content: "@ncmine — Addons de Minecraft Bedrock" },
      { property: "og:description", content: "Hub curado de addons Minecraft Bedrock do @ncmine." },
      { name: "twitter:description", content: "Hub curado de addons Minecraft Bedrock do @ncmine." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700;800;900&family=Instrument+Serif&display=swap",
      },
      { rel: "preconnect", href: "https://ugc.production.linktr.ee" },
      { rel: "preconnect", href: "https://images.bedrockexplorer.com" },
      { rel: "dns-prefetch", href: "https://i.imgur.com" },
      { rel: "dns-prefetch", href: "https://media.forgecdn.net" },
      { rel: "dns-prefetch", href: "https://terabox.com" },
      { rel: "dns-prefetch", href: "https://1024terabox.com" },
    ],
    scripts: [
      { src: "https://www.googletagmanager.com/gtag/js?id=G-RYBSXRH3TF", async: true },
      {
        children:
          "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','G-RYBSXRH3TF',{send_page_view:false});",
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
    <html lang="pt-BR">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    pageview(path + (typeof window !== "undefined" ? window.location.search : ""));
  }, [path]);

  return (
    <QueryClientProvider client={queryClient}>
      <FloatingBackground />
      <Outlet />
      <InAppBrowserGuard />
      <SocialDock />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
