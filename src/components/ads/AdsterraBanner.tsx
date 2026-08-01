import { AdSandbox } from "./AdSandbox";

const KEY = "9a98a3b31d91c4b164ea0ce081293fc6";
const SCRIPT_SRC = `https://www.highperformanceformat.com/${KEY}/invoke.js`;
const AT_OPTIONS = { key: KEY, format: "iframe", height: 250, width: 300, params: {} };

const SRC_DOC = `<!doctype html><html><head><meta charset="utf-8" /><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;display:flex;justify-content:center}</style><script>atOptions=${JSON.stringify(AT_OPTIONS)};</script></head><body><script src="${SCRIPT_SRC}"></script></body></html>`;

// Isolado num iframe sandbox (ver AdSandbox) — por isso pode ter varias
// instancias na mesma pagina sem disputar o "atOptions" global.
export function AdsterraBanner({ className }: { className?: string }) {
  return <AdSandbox srcDoc={SRC_DOC} height={250} width={300} className={className} />;
}
