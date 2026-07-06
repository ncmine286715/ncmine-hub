import { Download, FolderOpen, Gamepad2 } from "lucide-react";

const STEPS = [
  {
    icon: Download,
    title: "Baixa o arquivo",
    text: "Escolhe um addon na coleção e baixa o arquivo .mcaddon ou .mcpack.",
  },
  {
    icon: FolderOpen,
    title: "Abre no Minecraft",
    text: "Toca no arquivo baixado — o Minecraft abre e importa sozinho.",
  },
  {
    icon: Gamepad2,
    title: "Ativa no mundo",
    text: "Edita o mundo, ativa o pack em Recursos ou Comportamento e joga.",
  },
];

export function HowToInstall() {
  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-4 sm:py-12">
      <span className="inline-block bg-foreground px-2 py-1 font-pixel text-[9px] text-background sm:text-[10px]">
        COMO INSTALAR
      </span>
      <h2 className="mt-2 text-xl font-black uppercase leading-none sm:mt-3 sm:text-3xl">
        Do download ao mundo em 3 passos
      </h2>
      <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_0_var(--ink)] sm:p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-foreground bg-primary/10 font-pixel text-xs">
                {i + 1}
              </span>
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-3 text-sm font-black uppercase">{s.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {s.text}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground sm:text-xs">
        Alguns addons pedem &quot;Experimentos&quot; ativados nas configurações do mundo. Na página
        de cada addon tem o guia completo.
      </p>
    </section>
  );
}
