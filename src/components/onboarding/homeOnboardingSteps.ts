import type { OnboardingStepConfig } from "./OnboardingTour";

export const homeOnboardingSteps: OnboardingStepConfig[] = [
  {
    id: "welcome",
    title: "Oi, eu sou o Null! 👋",
    body: "Aqui é addon grátis, sem enrolação. Um tour rapidinho:",
  },
  {
    id: "hero",
    title: "Busque ou role a lista",
    body: "Use a lupa pra achar um addon pelo nome, ou role pra ver a lista toda.",
    target: "hero",
  },
  {
    id: "featured",
    title: "Toque e baixe",
    body: "Toque em qualquer addon pra ver os detalhes e baixar — tudo 100% grátis.",
    target: "featured",
  },
  {
    id: "in-app-browser",
    title: "Veio do TikTok ou Instagram?",
    body: "Toque nos 3 pontinhos (⋯) e escolha \"Abrir no navegador\" — senão o download trava.",
  },
  {
    id: "done",
    title: "Prontinho! 🎉",
    body: "Bora explorar. Pra rever esse tour, é só tocar no botão de ajuda no canto da tela.",
  },
];
