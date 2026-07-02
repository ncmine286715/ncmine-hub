import type { OnboardingStepConfig } from "./OnboardingTour";

export const homeOnboardingSteps: OnboardingStepConfig[] = [
  {
    id: "welcome",
    title: "Oi, eu sou o Null! 👋",
    body: "Vou te mostrar rapidinho como funciona o hub e como baixar addons sem enrolação. Leva menos de 1 minuto — e você pode pular quando quiser.",
  },
  {
    id: "hero",
    title: "Tudo começa por aqui",
    body: "Aqui em cima você vê quantos addons grátis tem no hub. Toque na lupa pra buscar ou no botão laranja pra ir direto pra lista de addons.",
    target: "hero",
  },
  {
    id: "feed",
    title: "Sugestões pra você",
    body: "Essas abas mostram addons recomendados, novidades, os mais populares e os criadores em destaque. Vale dar uma espiada em cada uma.",
    target: "feed",
  },
  {
    id: "search",
    title: "Busque e filtre rapidinho",
    body: "Sabe o nome do addon que você quer? Digite aqui. Também dá pra ordenar por mais recente, mais popular ou nota da comunidade.",
    target: "search",
  },
  {
    id: "featured",
    title: "O addon em destaque",
    body: "Esse é o addon mais baixado da comunidade agora. Toque na imagem pra ver os detalhes ou no botão laranja pra baixar direto — todos os addons aqui são 100% gratuitos e verificados.",
    target: "featured",
  },
  {
    id: "in-app-browser",
    title: "Veio do TikTok ou Instagram?",
    body: "Se você abriu esse link direto pelo app do TikTok ou Instagram, o download pode não funcionar. Toque nos 3 pontinhos (⋯) no canto da tela, escolha \"Abrir no navegador\" (Chrome ou Safari) e pronto — tudo passa a funcionar normalmente.",
  },
  {
    id: "social",
    title: "Nos siga nas redes",
    body: "Aqui embaixo tem os nossos links de Discord, Instagram, YouTube e TikTok. Toque em qualquer um pra abrir direto no navegador do seu celular e não perder nenhuma novidade.",
    target: "social",
  },
  {
    id: "done",
    title: "Prontinho! 🎉",
    body: "Agora é só explorar e baixar. Quer rever esse tutorial depois? É só tocar no botão de ajuda no canto da tela.",
  },
];
