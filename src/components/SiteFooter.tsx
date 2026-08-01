import { Link } from "@tanstack/react-router";
import { DiscordIcon, InstagramIcon, YouTubeIcon, TikTokIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL, CREATOR_NAME } from "@/lib/links";
import { SITE_TITLE } from "@/lib/site";

const INSTITUTIONAL = [
  { to: "/sobre", label: "Sobre" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
  { to: "/privacidade", label: "Privacidade" },
  { to: "/termos", label: "Termos de Uso" },
  { to: "/cookies", label: "Cookies" },
  { to: "/dmca", label: "DMCA" },
  { to: "/legal", label: "Créditos" },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border bg-background/80">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <MinecraftBlockIcon className="h-5 w-5 text-primary" />
            <span className="font-pixel text-xs uppercase tracking-wider">{SITE_TITLE}</span>
          </div>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Catálogo independente de addons para Minecraft Bedrock, mantido por {CREATOR_NAME}. Não hospedamos
            arquivos: cada download aponta para a fonte oficial do criador.
          </p>
        </div>

        <nav aria-label="Links institucionais">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Institucional</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {INSTITUTIONAL.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-foreground hover:underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Redes oficiais</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <FooterLink href={TIKTOK_URL} label="TikTok"><TikTokIcon className="h-4 w-4" /></FooterLink>
            <FooterLink href={DISCORD_URL} label="Discord"><DiscordIcon className="h-4 w-4" /></FooterLink>
            <FooterLink href={INSTAGRAM_URL} label="Instagram"><InstagramIcon className="h-4 w-4" /></FooterLink>
            <FooterLink href={YOUTUBE_URL} label="YouTube"><YouTubeIcon className="h-4 w-4" /></FooterLink>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        <p>© {new Date().getFullYear()} {SITE_TITLE} — {CREATOR_NAME}. Todos os direitos dos addons pertencem aos seus criadores.</p>
        <p className="mt-1">
          Não somos afiliados, patrocinados nem aprovados pela Mojang Studios ou pela Microsoft. Minecraft é marca
          registrada da Mojang Studios. Conteúdo indicado para maiores de 13 anos.
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-ghost border border-border !px-3 !py-2 !text-xs"
      aria-label={label}
    >
      {children}
      <span>{label}</span>
    </a>
  );
}
