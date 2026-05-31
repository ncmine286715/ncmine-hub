import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Home, RefreshCw, Search, ArrowLeft, Gamepad2, Ghost, Skull, Pickaxe, AlertTriangle } from "lucide-react";

import appCssUrl from "../styles.css?url";
const appCss = appCssUrl.includes("?") ? appCssUrl : `${appCssUrl}?url`;

// Minecraft-style animated blocks for 404
function MinecraftBlocks() {
  const blocks = ["bg-[#8B4513]", "bg-[#228B22]", "bg-[#808080]", "bg-[#FFD700]", "bg-[#00CED1]", "bg-[#FF6347]"];
  const [positions, setPositions] = useState<Array<{ x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const newPositions = Array.from({ length: 12 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: blocks[Math.floor(Math.random() * blocks.length)],
      delay: Math.random() * 2,
    }));
    setPositions(newPositions);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {positions.map((pos, i) => (
        <div
          key={i}
          className={`absolute h-6 w-6 border-2 border-foreground ${pos.color} animate-bounce opacity-20 sm:h-8 sm:w-8`}
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            animationDelay: `${pos.delay}s`,
            animationDuration: "2s",
          }}
        />
      ))}
    </div>
  );
}

// Interactive creeper face that reacts to mouse
function CreeperFace() {
  const [isScared, setIsScared] = useState(false);

  return (
    <div 
      className="relative mx-auto mb-6 cursor-pointer"
      onMouseEnter={() => setIsScared(true)}
      onMouseLeave={() => setIsScared(false)}
      onClick={() => setIsScared(!isScared)}
    >
      <div className={`grid h-24 w-24 grid-cols-8 grid-rows-8 gap-0 border-4 border-foreground transition-transform duration-300 sm:h-32 sm:w-32 ${isScared ? "scale-90 rotate-3" : "hover:scale-105"}`}>
        {/* Row 1-2: Empty */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`top-${i}`} className="bg-[#4CAF50]" />
        ))}
        {/* Row 3: Eyes start */}
        <div className="bg-[#4CAF50]" />
        <div className={`transition-colors duration-300 ${isScared ? "bg-[#FF0000]" : "bg-foreground"}`} />
        <div className={`transition-colors duration-300 ${isScared ? "bg-[#FF0000]" : "bg-foreground"}`} />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className={`transition-colors duration-300 ${isScared ? "bg-[#FF0000]" : "bg-foreground"}`} />
        <div className={`transition-colors duration-300 ${isScared ? "bg-[#FF0000]" : "bg-foreground"}`} />
        <div className="bg-[#4CAF50]" />
        {/* Row 4: Eyes bottom */}
        <div className="bg-[#4CAF50]" />
        <div className={`transition-colors duration-300 ${isScared ? "bg-[#FF0000]" : "bg-foreground"}`} />
        <div className={`transition-colors duration-300 ${isScared ? "bg-[#FF0000]" : "bg-foreground"}`} />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className={`transition-colors duration-300 ${isScared ? "bg-[#FF0000]" : "bg-foreground"}`} />
        <div className={`transition-colors duration-300 ${isScared ? "bg-[#FF0000]" : "bg-foreground"}`} />
        <div className="bg-[#4CAF50]" />
        {/* Row 5: Nose top */}
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-foreground" />
        <div className="bg-foreground" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        {/* Row 6: Mouth top */}
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-foreground" />
        <div className="bg-foreground" />
        <div className="bg-foreground" />
        <div className="bg-foreground" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        {/* Row 7: Mouth bottom */}
        <div className="bg-[#4CAF50]" />
        <div className="bg-foreground" />
        <div className="bg-foreground" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-foreground" />
        <div className="bg-foreground" />
        <div className="bg-[#4CAF50]" />
        {/* Row 8: Bottom */}
        <div className="bg-[#4CAF50]" />
        <div className="bg-foreground" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-[#4CAF50]" />
        <div className="bg-foreground" />
        <div className="bg-[#4CAF50]" />
      </div>
      <p className="mt-2 text-center font-pixel text-[8px] text-muted-foreground">
        {isScared ? "SSSSSS..." : "Toque no Creeper!"}
      </p>
    </div>
  );
}

// Random Minecraft death messages
const DEATH_MESSAGES = [
  "Voce caiu no void",
  "Voce foi explodido por um Creeper",
  "Voce foi morto por um Enderman",
  "Voce morreu de fome",
  "Voce caiu de um lugar alto",
  "Voce foi atingido por uma flecha",
  "Voce se afogou",
  "Voce foi queimado ate a morte",
];

function NotFoundComponent() {
  const [deathMessage] = useState(() => DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)]);
  const [respawnCount, setRespawnCount] = useState(3);

  useEffect(() => {
    if (respawnCount > 0) {
      const t = setTimeout(() => setRespawnCount(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [respawnCount]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <MinecraftBlocks />
      
      <div className="relative z-10 max-w-md text-center">
        <CreeperFace />
        
        <div className="mb-4 inline-flex items-center gap-2 border-2 border-foreground bg-[#FF0000] px-3 py-1 font-pixel text-[10px] text-white">
          <Skull className="h-4 w-4" />
          VOCE MORREU!
        </div>
        
        <h1 className="font-pixel text-5xl text-foreground sm:text-7xl">404</h1>
        <h2 className="mt-3 text-lg font-bold text-foreground sm:text-xl">{deathMessage}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A pagina que voce procura nao existe ou foi destruida por um Creeper.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="btn-block bg-primary text-primary-foreground !py-3 text-sm"
          >
            {respawnCount > 0 ? (
              <span className="font-pixel text-xs">Respawn em {respawnCount}...</span>
            ) : (
              <>
                <Home className="h-4 w-4" /> Respawnar na Home
              </>
            )}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-block bg-background text-foreground !py-3 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
        </div>

        <div className="mt-6 border-t-2 border-dashed border-foreground/20 pt-4">
          <p className="mb-2 font-pixel text-[8px] text-muted-foreground">OU TENTE BUSCAR</p>
          <Link
            to="/"
            hash="addons"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Search className="h-4 w-4" /> Buscar addons
          </Link>
        </div>

        <p className="mt-6 font-pixel text-[8px] text-muted-foreground/50">
          Score: 0 &middot; XP: Perdido
        </p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const [isExploding, setIsExploding] = useState(false);

  const handleRetry = () => {
    setIsExploding(true);
    setTimeout(() => {
      router.invalidate();
      reset();
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <MinecraftBlocks />
      
      <div className={`relative z-10 max-w-md text-center transition-all duration-500 ${isExploding ? "scale-0 opacity-0" : ""}`}>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-4 border-foreground bg-[#FFD700] sm:h-24 sm:w-24">
          <AlertTriangle className="h-10 w-10 text-foreground sm:h-12 sm:w-12" />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-3 py-1 font-pixel text-[10px] text-background">
          <Ghost className="h-4 w-4" />
          ERRO ENCONTRADO
        </div>

        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Algo deu errado!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Um bug escapou da mina. Voce pode tentar recarregar ou voltar para a home.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer font-pixel text-[9px] text-muted-foreground">
              Ver erro tecnico
            </summary>
            <pre className="mt-2 max-h-32 overflow-auto border-2 border-foreground bg-muted p-2 text-[10px] text-foreground">
              {error.message}
            </pre>
          </details>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={handleRetry}
            className="btn-block bg-primary text-primary-foreground !py-3 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isExploding ? "animate-spin" : ""}`} /> Tentar novamente
          </button>
          <Link
            to="/"
            className="btn-block bg-background text-foreground !py-3 text-sm"
          >
            <Home className="h-4 w-4" /> Ir para Home
          </Link>
        </div>

        <div className="mt-6 border-t-2 border-dashed border-foreground/20 pt-4">
          <p className="font-pixel text-[8px] text-muted-foreground">
            Se o erro persistir, entre no Discord para suporte
          </p>
          <a
            href="https://discord.com/invite/7vHysxHrTr"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Gamepad2 className="h-3 w-3" /> Entrar no Discord
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
    <html lang="pt-BR" className="bg-background">
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

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
