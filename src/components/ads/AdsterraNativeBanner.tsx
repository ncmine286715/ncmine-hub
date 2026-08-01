import { AdSandbox } from "./AdSandbox";

const KEY = "fc144efab9f4920a4ea665f542dfd9e6";
const SCRIPT_SRC = `https://pl29077820.effectivecpmnetwork.com/${KEY}/invoke.js`;
const CONTAINER_ID = `container-${KEY}`;

const SRC_DOC = `<!doctype html><html><head><meta charset="utf-8" /><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body><div id="${CONTAINER_ID}"></div><script async data-cfasync="false" src="${SCRIPT_SRC}"></script></body></html>`;

// Isolado num iframe sandbox (ver AdSandbox) — por isso pode ter varias
// instancias na mesma pagina sem conflito de id/variavel global.
export function AdsterraNativeBanner({ className, height = 300 }: { className?: string; height?: number }) {
  return <AdSandbox srcDoc={SRC_DOC} height={height} className={className} />;
}
