import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { CONTACT_EMAIL, SITE_TITLE, canonical } from "@/lib/site";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: `Política de Privacidade — ${SITE_TITLE}` },
      { name: "description", content: "Como o MineAddonsNews coleta, usa e protege dados de quem navega no site, em conformidade com a LGPD e o GDPR." },
      { property: "og:title", content: `Política de Privacidade — ${SITE_TITLE}` },
      { property: "og:description", content: "Dados coletados, cookies, finalidade, base legal e como exercer seus direitos." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical("/privacidade") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/privacidade") }],
  }),
  component: () => (
    <LegalLayout
      title="Política de Privacidade"
      intro="Esta política explica quais dados são tratados quando você usa o MineAddonsNews, com que finalidade e como exercer seus direitos."
    >
      <LegalSection title="1. Quem é o responsável">
        <p>
          O site é mantido de forma independente pelo criador de conteúdo @ncmine (Nicolas), pessoa física, sem
          vínculo com empresas ou com a Mojang Studios/Microsoft. Contato do responsável pelo tratamento de dados:{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Dados que coletamos">
        <p>Não pedimos cadastro, login, nome, telefone ou endereço. Os dados tratados são apenas os de navegação:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Páginas visitadas, tempo de permanência e origem do acesso (via Google Analytics 4).</li>
          <li>Cliques em botões de download e compartilhamento, de forma agregada e anônima.</li>
          <li>Dados técnicos do dispositivo: tipo de aparelho, sistema, navegador, idioma e país aproximado.</li>
          <li>Endereço IP, tratado de forma anonimizada pelo Google Analytics.</li>
        </ul>
        <p>Não coletamos dados sensíveis, não vendemos dados e não montamos perfis individuais de usuários.</p>
      </LegalSection>

      <LegalSection title="3. Finalidade e base legal">
        <p>
          Usamos esses dados para entender quais addons interessam ao público, corrigir erros e melhorar a velocidade
          do site. A base legal é o legítimo interesse (art. 7º, IX da LGPD) para métricas essenciais e o
          consentimento (art. 7º, I) para cookies de medição e futura publicidade, coletado no banner de cookies.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies e terceiros">
        <p>
          Utilizamos Google Analytics 4 para medição de audiência. Se e quando anúncios do Google AdSense forem
          ativados, o Google e seus parceiros poderão usar cookies para exibir anúncios com base em visitas
          anteriores a este e a outros sites. Você pode desativar a publicidade personalizada nas{" "}
          <a className="underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer nofollow">
            configurações de anúncios do Google
          </a>
          . Detalhes na nossa <a className="underline" href="/cookies">Política de Cookies</a>.
        </p>
      </LegalSection>

      <LegalSection title="5. Links e downloads externos">
        <p>
          Os arquivos dos addons não ficam hospedados aqui: os botões levam a serviços de terceiros (Terabox,
          MediaFire, Google Drive, sites dos criadores). Ao sair do site, você passa a ser regido pela política de
          privacidade desses serviços, sobre a qual não temos controle.
        </p>
      </LegalSection>

      <LegalSection title="6. Crianças e adolescentes">
        <p>
          Minecraft tem grande público infantil. O site não é direcionado a menores de 13 anos e não coleta
          conscientemente dados dessa faixa etária. Anúncios, quando existirem, serão configurados como não
          personalizados para tráfego identificado como infantil, em linha com a COPPA e com as políticas do Google.
          Se um responsável identificar coleta indevida, basta escrever para{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> que os dados serão apagados.
        </p>
      </LegalSection>

      <LegalSection title="7. Retenção e segurança">
        <p>
          Os relatórios do Google Analytics ficam retidos por até 14 meses. O site é servido 100% por HTTPS, com
          cabeçalhos de segurança ativos e sem áreas de login ou banco de dados de usuários.
        </p>
      </LegalSection>

      <LegalSection title="8. Seus direitos">
        <p>
          Você pode pedir confirmação, acesso, correção, anonimização, portabilidade ou exclusão dos dados, além de
          revogar o consentimento de cookies a qualquer momento pelo banner. Pedidos são respondidos em até 15 dias
          pelo e-mail <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  ),
});
