import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { SITE_TITLE, canonical } from "@/lib/site";
import { resetCookieConsent } from "@/lib/consent";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: `Política de Cookies — ${SITE_TITLE}` },
      { name: "description", content: "Quais cookies o MineAddonsNews usa, para que servem e como revogar o consentimento a qualquer momento." },
      { property: "og:title", content: `Política de Cookies — ${SITE_TITLE}` },
      { property: "og:description", content: "Cookies de medição, publicidade e preferências — e como desativá-los." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical("/cookies") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/cookies") }],
  }),
  component: () => (
    <LegalLayout
      title="Política de Cookies"
      intro="Cookies são pequenos arquivos guardados no seu navegador. Abaixo está exatamente o que usamos e como recusar."
    >
      <LegalSection title="Cookies essenciais">
        <p>
          Guardam apenas a sua escolha no banner de consentimento e preferências de exibição (como a ordenação da
          lista). Não identificam você e não podem ser desativados, pois o site depende deles para funcionar.
        </p>
      </LegalSection>

      <LegalSection title="Cookies de medição (Google Analytics 4)">
        <p>
          Só são ativados depois que você aceita o banner. Registram, de forma agregada, quais páginas foram vistas e
          quais addons foram baixados, com IP anonimizado. Nome típico: <code>_ga</code>, <code>_ga_*</code>.
        </p>
      </LegalSection>

      <LegalSection title="Cookies de publicidade">
        <p>
          O site pode passar a exibir anúncios do Google AdSense. Nesse caso, o Google e seus parceiros poderão usar
          cookies para medir e, mediante consentimento, personalizar anúncios. Sem consentimento, os anúncios são
          exibidos de forma não personalizada.
        </p>
      </LegalSection>

      <LegalSection title="Como controlar">
        <p>
          Você pode revogar ou alterar sua escolha quando quiser pelo botão abaixo, ou apagar os cookies nas
          configurações do seu navegador.
        </p>
        <button type="button" onClick={() => resetCookieConsent()} className="btn-block bg-primary text-primary-foreground !py-2 !text-sm">
          Revisar minhas preferências de cookies
        </button>
      </LegalSection>
    </LegalLayout>
  ),
});
