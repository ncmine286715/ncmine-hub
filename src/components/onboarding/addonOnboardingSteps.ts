import type { OnboardingStepConfig } from "./OnboardingTour";

export const addonOnboardingSteps: OnboardingStepConfig[] = [
  {
    id: "welcome",
    title: "Oi, eu sou o Null! 👋",
    body: "Vou te mostrar rapidinho como funciona essa página e como baixar seu addon. Leva menos de 1 minuto — e você pode pular quando quiser.",
  },
  {
    id: "what-it-does",
    title: "O que você encontra aqui",
    body: "Imagem ou vídeo do addon, avaliação da comunidade, quantos downloads já rolaram e a descrição completa — tudo pra você saber exatamente o que vai instalar.",
    target: "hero",
  },
  {
    id: "requirements",
    title: "Confira a compatibilidade",
    body: "Aqui aparece a versão do addon e a data da última atualização. Só instale se a versão do seu Minecraft Bedrock for compatível — assim evita bugs.",
    target: "requirements",
  },
  {
    id: "security",
    title: "É seguro, sem pegadinha",
    body: "Todo addon listado aqui é verificado e 100% gratuito. Você nunca precisa pagar nada nem instalar programas estranhos pra baixar.",
    target: "security",
  },
  {
    id: "download",
    title: "É só clicar aqui",
    body: "Esse botão laranja é o caminho mais rápido: clique nele pra liberar o download do addon agora.",
    target: "download-cta",
  },
  {
    id: "after-click",
    title: "Depois de clicar, o que rola?",
    body: "Você vai pro Terabox, onde o arquivo fica guardado. É só criar uma conta grátis em segundos pra liberar o download em velocidade máxima — o passo a passo completo fica aqui embaixo.",
    target: "how-it-works",
  },
  {
    id: "done",
    title: "Prontinho! 🎉",
    body: "Agora é só baixar. Quer rever esse tutorial depois? É só tocar no botão de ajuda no canto da tela.",
  },
];
