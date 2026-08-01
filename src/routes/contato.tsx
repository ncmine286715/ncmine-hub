import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { CONTACT_EMAIL, SITE_TITLE, canonical } from "@/lib/site";
import { DISCORD_URL, INSTAGRAM_URL, TIKTOK_URL, YOUTUBE_URL } from "@/lib/links";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: `Contato — ${SITE_TITLE}` },
      { name: "description", content: "Fale com o MineAddonsNews: parcerias, envio de addons, correção de créditos, remoção de conteúdo e suporte." },
      { property: "og:title", content: `Contato — ${SITE_TITLE}` },
      { property: "og:description", content: "E-mail, Discord e redes sociais oficiais do @ncmine." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical("/contato") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/contato") }],
  }),
  component: () => (
    <LegalLayout
      title="Contato"
      intro="Respondo pessoalmente todas as mensagens, normalmente em até 48 horas úteis."
      showUpdated={false}
    >
      <LegalSection title="E-mail">
        <p>
          Canal principal para qualquer assunto — parceria, envio do seu addon, correção de crédito, denúncia ou
          remoção de conteúdo:
        </p>
        <p className="text-base font-bold">
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p>
          Para agilizar, coloque no assunto o tipo do pedido: <em>Parceria</em>, <em>Enviar addon</em>,{" "}
          <em>Correção de créditos</em> ou <em>Remoção</em>, seguido do nome do addon.
        </p>
      </LegalSection>

      <LegalSection title="Comunidade e redes">
        <ul className="list-disc space-y-1 pl-5">
          <li><a className="underline" href={DISCORD_URL} target="_blank" rel="noopener noreferrer">Discord</a> — suporte rápido e avisos de addon novo.</li>
          <li><a className="underline" href={TIKTOK_URL} target="_blank" rel="noopener noreferrer">TikTok @ncmine</a></li>
          <li><a className="underline" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a className="underline" href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">YouTube</a></li>
        </ul>
      </LegalSection>

      <LegalSection title="Quer aparecer no catálogo?">
        <p>
          Mande o link do addon, a versão do Minecraft Bedrock suportada, o seu nome/@ para crédito e uma imagem de
          divulgação. Publicamos apenas conteúdo com autorização do criador ou licença que permita a divulgação.
        </p>
      </LegalSection>
    </LegalLayout>
  ),
});
