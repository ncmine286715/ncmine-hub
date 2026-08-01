import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { CONTACT_EMAIL, SITE_TITLE, canonical } from "@/lib/site";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: `Créditos e informações legais — ${SITE_TITLE}` },
      { name: "description", content: "Créditos dos criadores de addons, licenciamento, marcas registradas e índice das políticas do MineAddonsNews." },
      { property: "og:title", content: `Créditos e informações legais — ${SITE_TITLE}` },
      { property: "og:description", content: "Como creditamos criadores e onde encontrar cada política do site." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical("/legal") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/legal") }],
  }),
  component: () => (
    <LegalLayout
      title="Créditos e informações legais"
      intro="Todo addon listado pertence ao seu criador original. Aqui explicamos como creditamos e onde ficam as políticas do site."
    >
      <LegalSection title="Créditos dos criadores">
        <p>
          Cada página de addon exibe o nome do autor, a versão e o link para a publicação de origem. Quando o autor
          não é identificável, o addon é marcado como "autor desconhecido" e removido caso o criador se manifeste.
          Correções de crédito são aplicadas assim que recebemos a informação em{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection title="Licenciamento e redistribuição">
        <p>
          Não hospedamos, reempacotamos nem alteramos arquivos. Os botões de download levam ao arquivo publicado pelo
          próprio criador. Addons exclusivos produzidos por @ncmine são de autoria própria e podem ser usados
          livremente em vídeos e séries, desde que o crédito seja mantido e não haja revenda.
        </p>
      </LegalSection>

      <LegalSection title="Marcas registradas">
        <p>
          Minecraft, Bedrock Edition e Mojang são marcas registradas da Mojang Studios/Microsoft. Este site é
          independente e não é afiliado, patrocinado nem aprovado por elas. Nomes de terceiros aparecem apenas para
          identificar o conteúdo descrito.
        </p>
      </LegalSection>

      <LegalSection title="Índice de políticas">
        <ul className="list-disc space-y-1 pl-5">
          <li><Link className="underline" to="/privacidade">Política de Privacidade</Link></li>
          <li><Link className="underline" to="/termos">Termos de Uso</Link></li>
          <li><Link className="underline" to="/cookies">Política de Cookies</Link></li>
          <li><Link className="underline" to="/dmca">DMCA e remoção de conteúdo</Link></li>
          <li><Link className="underline" to="/contato">Contato</Link></li>
          <li><Link className="underline" to="/sobre">Sobre o site</Link></li>
        </ul>
      </LegalSection>
    </LegalLayout>
  ),
});
