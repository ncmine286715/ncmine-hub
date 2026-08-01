import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { CONTACT_EMAIL, SITE_TITLE, canonical } from "@/lib/site";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: `Termos de Uso — ${SITE_TITLE}` },
      { name: "description", content: "Regras de uso do MineAddonsNews: natureza do serviço, responsabilidades, propriedade intelectual e limitações." },
      { property: "og:title", content: `Termos de Uso — ${SITE_TITLE}` },
      { property: "og:description", content: "Condições para usar o catálogo de addons de Minecraft Bedrock." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical("/termos") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/termos") }],
  }),
  component: () => (
    <LegalLayout
      title="Termos de Uso"
      intro="Ao navegar no MineAddonsNews você concorda com as condições abaixo. Elas são curtas e diretas de propósito."
    >
      <LegalSection title="1. O que o site é">
        <p>
          O MineAddonsNews é um catálogo editorial e gratuito de addons para Minecraft Bedrock. Reunimos ficha
          técnica, imagens, instruções de instalação e o link oficial de download de cada projeto. Não hospedamos
          arquivos e não cobramos por nenhum conteúdo.
        </p>
      </LegalSection>

      <LegalSection title="2. Uso permitido">
        <ul className="list-disc space-y-1 pl-5">
          <li>Consultar, pesquisar e compartilhar as páginas livremente.</li>
          <li>Usar os addons segundo a licença definida por cada autor original.</li>
          <li>É proibido raspar o site em massa, clonar o catálogo ou revender o conteúdo.</li>
          <li>É proibido usar o site para distribuir malware, phishing ou conteúdo ilegal.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Propriedade intelectual">
        <p>
          Textos, curadoria e identidade visual deste site são de autoria de @ncmine. Cada addon pertence ao seu
          criador original, sempre creditado na respectiva página. Minecraft é marca registrada da Mojang Studios;
          este site não é afiliado, patrocinado nem aprovado pela Mojang ou pela Microsoft.
        </p>
      </LegalSection>

      <LegalSection title="4. Downloads e responsabilidade">
        <p>
          Os links levam a serviços externos. Conferimos os arquivos antes de publicar, mas o conteúdo pode ser
          alterado pelo autor a qualquer momento. Os addons são oferecidos "como estão", sem garantia: faça backup
          dos seus mundos antes de instalar. Não nos responsabilizamos por perda de mundos, falhas do jogo ou
          problemas em serviços de terceiros.
        </p>
      </LegalSection>

      <LegalSection title="5. Remoção de conteúdo">
        <p>
          Criadores podem pedir a remoção de qualquer addon pelo e-mail{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, sem burocracia. Veja a{" "}
          <a className="underline" href="/dmca">política de DMCA</a>.
        </p>
      </LegalSection>

      <LegalSection title="6. Alterações e foro">
        <p>
          Estes termos podem ser atualizados; a data de revisão fica sempre no topo da página. Aplica-se a
          legislação brasileira.
        </p>
      </LegalSection>
    </LegalLayout>
  ),
});
