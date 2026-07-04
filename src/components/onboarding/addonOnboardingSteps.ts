import type { OnboardingStepConfig } from "./OnboardingTour";

export const addonOnboardingSteps: OnboardingStepConfig[] = [
  {
    id: "welcome",
    title: "Oi, eu sou o Null! 👋",
    body: "Deixa eu te mostrar como baixar esse addon rapidinho:",
  },
  {
    id: "what-it-does",
    title: "Confira os detalhes",
    body: "Vídeo, avaliação e versão do addon ficam aqui — só pra você saber o que vai instalar.",
    target: "hero",
  },
  {
    id: "download",
    title: "É só clicar aqui",
    body: "Esse botão laranja libera o download agora — 100% grátis, sem pegadinha.",
    target: "download-cta",
  },
  {
    id: "done",
    title: "Prontinho! 🎉",
    body: "Bora baixar. Pra rever esse tour, é só tocar no botão de ajuda no canto da tela.",
  },
];
