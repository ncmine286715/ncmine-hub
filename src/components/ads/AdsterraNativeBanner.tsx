import { useIsMobile } from "@/hooks/use-mobile";
import { AdSandbox } from "./AdSandbox";

const KEY = "fc144efab9f4920a4ea665f542dfd9e6";
const SCRIPT_SRC = `https://pl29077820.effectivecpmnetwork.com/${KEY}/invoke.js`;
const CONTAINER_ID = `container-${KEY}`;

const SRC_DOC = `<!doctype html><html><head><meta charset="utf-8" /><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body><div id="${CONTAINER_ID}"></div><script async data-cfasync="false" src="${SCRIPT_SRC}"></script></body></html>`;

type Props = {
  className?: string;
  desktopHeight?: number;
  mobileHeight?: number;
};

// Isolado num iframe sandbox (ver AdSandbox) — por isso pode ter varias
// instancias na mesma pagina sem conflito de id/variavel global.
//
// Altura maior no mobile: o widget nativo empilha os cards verticalmente
// numa coluna estreita, entao a mesma altura do desktop cortaria conteudo.
// So muda o `style.height` do iframe (nao recria o elemento), entao nao
// recarrega o anuncio quando o breakpoint muda depois da hidratacao.
export function AdsterraNativeBanner({ className, desktopHeight = 260, mobileHeight = 340 }: Props) {
  const isMobile = useIsMobile();
  return (
    <AdSandbox srcDoc={SRC_DOC} height={isMobile ? mobileHeight : desktopHeight} className={className} />
  );
}
