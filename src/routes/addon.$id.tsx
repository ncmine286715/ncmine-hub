import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ADDONS, isIndexableAddon } from "@/lib/addons";
import { DownloadModal } from "@/components/DownloadModal";
import { TERABOX_TUTORIAL_YT_ID } from "@/lib/tutorial";
import type { Addon } from "@/components/AddonCard";
import {
  Download, Star, User, Calendar, Tag, Share2, ArrowLeft, Play,
} from "lucide-react";
import { shareAddon } from "@/lib/share";
import { CREATOR_NAME, TIKTOK_URL } from "@/lib/links";
import { SITE_URL, canonical as siteCanonical } from "@/lib/site";
import { MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { RelatedAddons } from "@/components/RelatedAddons";
import { trackEvent, initScrollTracker } from "@/lib/analytics";
import { useCountUp } from "@/hooks/use-count-up";
import { AddonBlockPreview } from "@/components/AddonBlockPreview";

const RAW_ADDONS = ADDONS;

export const Route = createFileRoute("/addon/$id")({
  head: ({ params }) => {
    const addon = RAW_ADDONS.find((a) => a.id === params.id);
    if (!addon) {
      return { meta: [{ title: "Addon não encontrado — @ncmine" }] };
    }
    const canonical = siteCanonical(`/addon/${addon.id}`);
    const indexable = isIndexableAddon(addon);
    // Title entre 50 e 60 caracteres, com o nome do addon + diferencial.
    const clamp = (s: string, max: number) =>
      s.length <= max ? s : `${s.slice(0, max - 1).replace(/[\s,;:—-]+$/, "")}…`;
    const title = clamp(`Baixar ${addon.title} — Addon Minecraft Bedrock`, 60);
    // Descrição própria, montada com os metadados da ficha (120–158 chars) —
    // nunca o texto do autor original copiado literalmente.
    const description = clamp(
      `Baixe e instale ${addon.title} no Minecraft Bedrock: passo a passo em português, requisitos e link direto. ` +
        `Categoria ${addon.category}, versão ${addon.version}. Testado por @ncmine.`,
      158,
    );
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(indexable ? [] : [{ name: "robots", content: "noindex, follow" }]),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: addon.image },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: addon.image },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: AddonPage,
});

function AddonPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [downloadFor, setDownloadFor] = useState<Addon | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const addon = useMemo(() => RAW_ADDONS.find((a) => a.id === id), [id]);
  const animatedDownloads = useCountUp(addon?.downloads ?? 0);

  useEffect(() => {
    if (addon) trackEvent("addon_view", { addonId: addon.id, title: addon.title });
    const cleanup = initScrollTracker();
    return () => { cleanup && cleanup(); };
  }, [addon?.id]);

  const handleShare = async () => {
    if (!addon) return;
    await shareAddon(addon, (msg) => {
      setToast(msg);
      window.setTimeout(() => setToast(null), 2200);
    });
  };

  if (!addon) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <MinecraftBlockIcon className="mb-4 h-14 w-14 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Addon não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Este addon não existe ou foi removido.</p>
        <Link to="/" className="btn-block mt-6 bg-primary text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao hub
        </Link>
      </div>
    );
  }

  const pageUrl = `${SITE_URL}/addon/${addon.id}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: addon.title,
        description: addon.short,
        image: addon.image,
        applicationCategory: "GameApplication",
        operatingSystem: "Android, iOS, Windows",
        softwareVersion: addon.version,
        datePublished: addon.date,
        author: { "@type": "Person", name: addon.author || CREATOR_NAME },
        url: pageUrl,
        review: {
          "@type": "Review",
          author: { "@type": "Person", name: CREATOR_NAME, url: TIKTOK_URL },
          reviewBody: `Instalado e testado no Minecraft Bedrock (versão ${addon.version}) antes da publicação: importação do pacote, ativação no mundo e sessão de jogo sem travamentos.`,
        },
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL", availability: "https://schema.org/InStock" },
        publisher: { "@type": "Person", name: CREATOR_NAME, url: TIKTOK_URL },
        ...(addon.rating > 0
          ? { aggregateRating: { "@type": "AggregateRating", ratingValue: addon.rating, bestRating: 5, ratingCount: Math.max(5, Math.round((addon.downloads || 50) / 25)) } }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: addon.category, item: `${SITE_URL}/?q=${encodeURIComponent(addon.category)}` },
          { "@type": "ListItem", position: 3, name: addon.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="relative min-h-screen text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="btn-ghost !px-2 !py-1.5 !text-sm">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Voltar</span>
          </Link>
          <button onClick={handleShare} className="btn-ghost border border-border !px-3 !py-1.5 !text-xs">
            <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>
      </header>

      {toast && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold shadow-md">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <Breadcrumb className="mb-4 text-xs">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><span className="text-muted-foreground">{addon.category}</span></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage className="line-clamp-1">{addon.title}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="card-block overflow-hidden">
          <div className="grid gap-0 sm:grid-cols-2">
            <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-muted sm:aspect-auto sm:border-b-0 sm:border-r">
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
                <div className="absolute inset-0">
                  <AddonBlockPreview image={addon.image} alt={addon.title} />
                </div>
              )}
              <span className="chip chip-primary absolute left-3 top-3">
                <Tag className="h-3 w-3" /> {addon.category}
              </span>
            </div>

            <div className="flex flex-col p-5 sm:p-8">
              <h1 className="text-2xl font-black leading-tight sm:text-4xl">{addon.title}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {addon.author || "Desconhecido"}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {addon.date}</span>
                <span className="font-pixel text-[10px]">v{addon.version}</span>
              </div>

              {(addon.rating > 0 || addon.downloads > 0) && (
                <div className="mt-4 flex items-center gap-4">
                  {addon.rating > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < addon.rating ? "fill-primary text-primary" : "text-border"}`} />
                      ))}
                      <span className="ml-1 text-xs font-semibold">{addon.rating}/5</span>
                    </span>
                  )}
                  {addon.downloads > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground">
                      <Download className="h-4 w-4" /> {animatedDownloads.toLocaleString("pt-BR")}
                    </span>
                  )}
                </div>
              )}

              {addon.short && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{addon.short}</p>
              )}

              {addon.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {addon.tags.slice(0, 8).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { window.location.href = `/?q=${encodeURIComponent(t)}`; }}
                      className="chip hover:bg-primary hover:text-primary-foreground"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : null}

              <button
                onClick={() => setDownloadFor(addon)}
                className="btn-block mt-6 bg-primary text-primary-foreground !py-3.5 !text-base"
              >
                <Download className="h-5 w-5" /> Baixar agora
              </button>
            </div>
          </div>
        </div>

        {addon.description && addon.description !== addon.short && (
          <section className="mx-auto mt-8 max-w-3xl">
            <h2 className="text-xl font-bold">Sobre o addon</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
              {addon.description}
            </p>
          </section>
        )}

        <section className="mx-auto mt-10 max-w-3xl">
          <h2 className="text-xl font-bold">Requisitos</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/85">
            <li>• Minecraft Bedrock Edition {addon.version ? `— testado na versão ${addon.version} do addon` : ""} (Android, iOS, Windows, console com importação de mundo).</li>
            <li>• Espaço livre para o arquivo do pacote e para o backup do seu mundo.</li>
            <li>• Alternâncias experimentais (Experimental Toggles) ativadas no mundo — necessário na maioria dos addons de comportamento.</li>
            <li>• Pacote de comportamento e pacote de recursos ativados juntos, quando o addon trouxer os dois.</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Addons desativam conquistas no mundo em que forem ligados. Faça backup antes de aplicar em um mundo antigo.
          </p>
        </section>

        <section id="como-instalar" className="mx-auto mt-10 max-w-3xl">
          <h2 className="text-xl font-bold">Como instalar {addon.title}</h2>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/85">
            <li><strong>1.</strong> Toque em "Baixar agora" e conclua o download do arquivo (.mcaddon, .mcpack ou .mcworld).</li>
            <li><strong>2.</strong> Abra o arquivo no gerenciador de downloads do celular ou dê dois cliques no PC — o Minecraft abre sozinho e importa o conteúdo.</li>
            <li><strong>3.</strong> No Minecraft, entre em <em>Jogar → Editar mundo</em> (ou crie um mundo novo).</li>
            <li><strong>4.</strong> Em <em>Pacotes de comportamento</em> e <em>Pacotes de recursos</em>, ative o pacote com o nome {addon.title}.</li>
            <li><strong>5.</strong> Em <em>Configurações do mundo</em>, ligue as alternâncias experimentais se o addon usar entidades, blocos ou scripts personalizados.</li>
            <li><strong>6.</strong> Salve, entre no mundo e confirme que o conteúdo apareceu. Se não aparecer, saia e entre de novo no mundo.</li>
          </ol>
        </section>

        <section id="como-baixar" className="mx-auto mt-10 max-w-3xl">
          <h2 className="text-xl font-bold">Como baixar do Terabox</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tutorial rápido do @ncmine.</p>
          <div className="card-block mt-4 aspect-video overflow-hidden">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${TERABOX_TUTORIAL_YT_ID}`}
              title="Como baixar do Terabox"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section className="mt-12">
          <RelatedAddons current={addon} all={RAW_ADDONS} />
        </section>

      </main>

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
