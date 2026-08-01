import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { SITE_TITLE, SITE_URL, canonical } from "@/lib/site";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Preciso pagar ou criar conta para baixar um addon?",
    a: "Não. Todo o catálogo é gratuito e não existe cadastro, login ou assinatura. Você abre a página do addon, clica em baixar e é levado ao arquivo hospedado pelo criador original.",
  },
  {
    q: "Como instalo um addon no Minecraft Bedrock pelo celular?",
    a: "Baixe o arquivo .mcaddon ou .mcpack, toque nele no gerenciador de arquivos e o Minecraft abre sozinho importando o conteúdo. Depois, entre no mundo, vá em Editar mundo, selecione Pacotes de comportamento e de recursos e ative os pacotes importados.",
  },
  {
    q: "Ativei o addon e nada aconteceu. O que fiz de errado?",
    a: "Na maioria dos casos falta ligar as Experimental Toggles (alternâncias experimentais) nas configurações do mundo, ou o pacote de comportamento foi ativado sem o pacote de recursos correspondente. Confira também se a versão do Minecraft é igual ou superior à indicada na página do addon.",
  },
  {
    q: "O addon funciona em multiplayer e em Realms?",
    a: "Funciona se o addon estiver aplicado no mundo hospedado. Em Realms, faça o upload do mundo já com os pacotes ativados. Em servidores de terceiros, depende do que o dono do servidor permite.",
  },
  {
    q: "Addon dá ban ou corrompe meu mundo?",
    a: "Addons são conteúdo oficialmente suportado pelo Bedrock e não causam banimento no modo offline ou em mundos próprios. Ainda assim, ativar addons desativa conquistas no mundo e pode alterar o terreno gerado, então faça backup antes de instalar em um mundo antigo.",
  },
  {
    q: "Como baixar arquivos do Terabox sem instalar aplicativo?",
    a: "Abra o link no navegador do celular, toque em baixar e escolha continuar no navegador quando o site sugerir o aplicativo. Em cada página de addon há um vídeo curto mostrando o processo passo a passo.",
  },
  {
    q: "Os arquivos têm vírus?",
    a: "Publicamos apenas arquivos de conteúdo do Minecraft (.mcaddon, .mcpack, .mcworld, .zip). Não distribuímos executáveis, instaladores nem programas de PC. Se algum link começar a apontar para outro tipo de arquivo, ele é retirado do ar assim que identificamos.",
  },
  {
    q: "Sou criador e meu addon está aqui. Como peço remoção ou crédito?",
    a: "Escreva para ncmine75@gmail.com com o link da página. A remoção é feita em até 48 horas úteis, sem exigir notificação formal, e a correção de crédito costuma ser feita no mesmo dia.",
  },
  {
    q: "Com que frequência entram addons novos?",
    a: "O catálogo recebe novidades toda semana, acompanhando as atualizações do Minecraft Bedrock. Novidades também são anunciadas no Discord e no TikTok @ncmine.",
  },
  {
    q: "O site é oficial da Mojang?",
    a: "Não. O MineAddonsNews é um projeto independente e não tem qualquer vínculo, patrocínio ou aprovação da Mojang Studios ou da Microsoft.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `Perguntas frequentes sobre addons de Minecraft Bedrock — ${SITE_TITLE}` },
      { name: "description", content: "Como instalar addons no Bedrock, ativar experimentais, usar em Realms, baixar do Terabox e resolver os erros mais comuns." },
      { property: "og:title", content: `FAQ — addons de Minecraft Bedrock` },
      { property: "og:description", content: "As dúvidas que mais chegam nos comentários, respondidas em uma página só." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical("/faq") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/faq") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url: `${SITE_URL}/faq`,
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: () => (
    <LegalLayout
      title="Perguntas frequentes"
      intro="As dúvidas que mais chegam no Discord e nos comentários, respondidas direto ao ponto."
      showUpdated={false}
    >
      {FAQ.map((f) => (
        <section key={f.q} className="space-y-2">
          <h2 className="text-base font-bold sm:text-lg">{f.q}</h2>
          <p className="text-sm leading-relaxed text-foreground/85">{f.a}</p>
        </section>
      ))}
    </LegalLayout>
  ),
});
