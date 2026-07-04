import { useState } from "react";

type Face = "top" | "front" | "back" | "right" | "left" | "bottom";

// Sombreamento clássico de bloco do Minecraft: topo mais claro, laterais
// mais escuras — dá profundidade sem precisar do modelo 3D real do addon.
const FACE_STYLE: Record<Face, { transform: string; brightness: number }> = {
  top: { transform: "rotateX(90deg) translateZ(60px)", brightness: 1.2 },
  front: { transform: "translateZ(60px)", brightness: 0.95 },
  back: { transform: "rotateY(180deg) translateZ(60px)", brightness: 0.95 },
  right: { transform: "rotateY(90deg) translateZ(60px)", brightness: 0.72 },
  left: { transform: "rotateY(-90deg) translateZ(60px)", brightness: 0.72 },
  bottom: { transform: "rotateX(-90deg) translateZ(60px)", brightness: 0.5 },
};

const FACES = Object.keys(FACE_STYLE) as Face[];

export function AddonBlockPreview({ image, alt }: { image: string; alt: string }) {
  const [broken, setBroken] = useState(false);

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ perspective: "600px" }}
    >
      <div className="relative">
        <div
          className="animate-block-spin relative h-[120px] w-[120px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {FACES.map((face) => (
            <div
              key={face}
              className="absolute inset-0 overflow-hidden border border-black/40"
              style={{ transform: FACE_STYLE[face].transform, backfaceVisibility: "hidden" }}
            >
              {!broken ? (
                <img
                  src={image}
                  alt={alt}
                  referrerPolicy="no-referrer"
                  onError={() => setBroken(true)}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  style={{ filter: `brightness(${FACE_STYLE[face].brightness})` }}
                />
              ) : (
                <div
                  className="h-full w-full bg-foreground"
                  style={{ filter: `brightness(${FACE_STYLE[face].brightness})` }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="absolute -bottom-3 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-black/25 blur-sm" />
      </div>
      <span className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 border-2 border-foreground bg-background/90 px-1.5 py-0.5 font-pixel text-[7px] uppercase text-muted-foreground">
        preview 3d · passe o mouse pra pausar
      </span>
    </div>
  );
}
