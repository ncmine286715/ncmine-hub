import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { CONTACT_EMAIL, SITE_TITLE, canonical } from "@/lib/site";

export const Route = createFileRoute("/dmca")({
  head: () => ({
    meta: [
      { title: `DMCA e remoção de conteúdo — ${SITE_TITLE}` },
      { name: "description", content: "Como pedir a remoção ou correção de crédito de um addon publicado no MineAddonsNews. Processo simples, sem burocracia." },
      { property: "og:title", content: `DMCA e remoção de conteúdo — ${SITE_TITLE}` },
      { property: "og:description", content: "Procedimento de remoção para criadores e detentores de direitos." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical("/dmca") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/dmca") }],
  }),
  component: () => (
    <LegalLayout
      title="DMCA e remoção de conteúdo"
      intro="Somos um catálogo: divulgamos addons e apontamos para o download oficial do autor. Se você é o criador e não quer aparecer aqui, é só avisar."
    >
      <LegalSection title="Como funciona">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Envie um e-mail para <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> com o assunto "Remoção - nome do addon".</li>
          <li>Informe o link da página no nosso site e como podemos te identificar como autor (opcional, mas ajuda).</li>
          <li>A página é retirada do ar em até 48 horas úteis, sem exigir notificação formal ou processo jurídico.</li>
        </ol>
      </LegalSection>

      <LegalSection title="Correção de créditos">
        <p>
          Se o addon estiver creditado a outra pessoa, mande o link da publicação original que corrigimos o crédito e
          a fonte na mesma hora — geralmente é isso que o autor prefere em vez da remoção.
        </p>
      </LegalSection>

      <LegalSection title="Notificação formal">
        <p>
          Para uma notificação DMCA formal, inclua: identificação da obra protegida, o URL exato no nosso site, seus
          dados de contato, declaração de boa-fé de que o uso não é autorizado e declaração de veracidade sob
          responsabilidade. Enviamos confirmação por e-mail assim que a remoção é feita.
        </p>
      </LegalSection>

      <LegalSection title="Contranotificação">
        <p>
          Se um conteúdo seu foi removido por engano, responda ao mesmo e-mail explicando a situação. Reavaliamos e
          republicamos quando o pedido original se mostrar improcedente.
        </p>
      </LegalSection>
    </LegalLayout>
  ),
});
