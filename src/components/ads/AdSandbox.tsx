type Props = {
  srcDoc: string;
  height: number;
  width?: number | string;
  className?: string;
};

// sandbox sem "allow-popups" e sem "allow-top-navigation": o script do
// anuncio roda e renderiza normalmente, mas o navegador bloqueia qualquer
// tentativa dele de abrir aba nova ou redirecionar a pagina principal —
// e assim que se neutraliza popunder/clickunder escondido em ad tags.
export function AdSandbox({ srcDoc, height, width = "100%", className }: Props) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-center font-pixel text-[8px] uppercase tracking-widest text-muted-foreground/50">
        Publicidade
      </p>
      <iframe
        title="Publicidade"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin"
        scrolling="no"
        loading="lazy"
        style={{ width, height, maxWidth: "100%", border: "none", display: "block", margin: "0 auto" }}
      />
    </div>
  );
}
