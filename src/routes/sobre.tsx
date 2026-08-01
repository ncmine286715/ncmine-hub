import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { CONTACT_EMAIL, SITE_TITLE, SITE_URL, canonical } from "@/lib/site";
import { CREATOR_NAME, TIKTOK_URL } from "@/lib/links";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: `Sobre o ${SITE_TITLE} — quem faz e por quê` },
      { name: "description", content: "A história do MineAddonsNews: um catálogo independente de addons de Minecraft Bedrock criado por @ncmine para acabar com sites cheios de redirecionamento." },
      { property: "og:title", content: `Sobre o ${SITE_TITLE}` },
      { property: "og:description", content: "Quem mantém o catálogo, como os addons são selecionados e qual o critério editorial." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical("/sobre") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/sobre") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `Sobre o ${SITE_TITLE}`,
          url: `${SITE_URL}/sobre`,
          publisher: { "@type": "Person", name: "@ncmine", url: TIKTOK_URL },
        }),
      },
    ],
  }),
  component: () => (
    <LegalLayout
      title={`Sobre o ${SITE_TITLE}`}
      intro="Um catálogo feito por quem joga Bedrock, para quem cansou de site com cinco redirecionamentos antes do download."
      showUpdated={false}
    >
      <LegalSection title="Como tudo começou">
        <p>
          Eu sou o Nicolas, conhecido como {CREATOR_NAME}. Comecei publicando vídeos curtos de addons de Minecraft
          Bedrock no TikTok e no YouTube. A pergunta que mais recebia nos comentários era sempre a mesma: "onde
          baixa?". Mandar link por comentário não escalava, e a maioria dos sites de addon que existiam abria pop-up,
          empurrava encurtador e ainda entregava um arquivo quebrado.
        </p>
        <p>
          O {SITE_TITLE} nasceu disso: um lugar único, rápido no celular, onde cada addon tem uma página com o que
          ele faz, o que precisa para rodar, como instalar e um botão de download que vai direto para a fonte
          oficial do criador.
        </p>
      </LegalSection>

      <LegalSection title="Critério editorial">
        <ul className="list-disc space-y-1 pl-5">
          <li>Testamos o addon no Minecraft Bedrock antes de publicar a página.</li>
          <li>Só entra conteúdo com link de origem identificável e crédito ao autor.</li>
          <li>Nada de arquivo com executável, instalador ou pedido de permissão estranha.</li>
          <li>Addon que quebra em uma versão nova é atualizado ou marcado como desatualizado.</li>
          <li>Ordem de exibição é editorial e por popularidade real, nunca paga.</li>
        </ul>
      </LegalSection>

      <LegalSection title="De onde vêm os addons">
        <p>
          Parte é enviada diretamente pelos criadores; parte é curadoria de projetos públicos, sempre com link para a
          publicação original. Não hospedamos arquivos e não reempacotamos nada. Quem quiser que seu projeto saia do
          ar tem a página removida em até 48 horas úteis pelo{" "}
          <a className="underline" href="/dmca">canal de remoção</a>.
        </p>
      </LegalSection>

      <LegalSection title="Como o site se mantém">
        <p>
          O acesso é e continuará gratuito. Os custos de domínio e hospedagem são cobertos por doações voluntárias e,
          futuramente, por publicidade discreta — sempre separada visualmente dos botões de download, para ninguém
          clicar em anúncio achando que é o addon.
        </p>
      </LegalSection>

      <LegalSection title="Falar comigo">
        <p>
          Sugestão, correção ou parceria: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
          ou pelo <a className="underline" href="/contato">canal de contato</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  ),
});
