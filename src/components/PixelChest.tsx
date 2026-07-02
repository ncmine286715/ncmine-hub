export function PixelChest({ open }: { open: boolean }) {
  return (
    <div className="relative h-14 w-14 sm:h-16 sm:w-16">
      <svg
        viewBox="0 0 8 8"
        className={`h-14 w-14 drop-shadow-[3px_3px_0_var(--ink)] sm:h-16 sm:w-16 ${open ? "animate-mc-bob" : ""}`}
        shapeRendering="crispEdges"
      >
        {/* corpo */}
        <rect x="0" y="3" width="8" height="4" fill="#6b4020" />
        <rect x="0" y="3" width="8" height="4" fill="none" stroke="#2b1608" strokeWidth="0.15" />
        {/* faixa dourada */}
        <rect x="0" y="4.5" width="8" height="1" fill="#e0b83c" />
        {/* fechadura */}
        <rect x="3.3" y="4.4" width="1.4" height="1.6" fill="#2b1608" />
        {open ? (
          <>
            {/* tampa aberta */}
            <rect x="0" y="0.2" width="8" height="2" fill="#8a5a2c" transform="rotate(-16 4 2.2)" />
            <rect
              x="0"
              y="0.2"
              width="8"
              height="2"
              fill="none"
              stroke="#2b1608"
              strokeWidth="0.15"
              transform="rotate(-16 4 2.2)"
            />
            {/* brilho interno */}
            <rect x="1" y="2.5" width="6" height="0.7" fill="#ffe27a" />
          </>
        ) : (
          <>
            {/* tampa fechada */}
            <rect x="0" y="1.6" width="8" height="1.4" fill="#8a5a2c" />
            <rect
              x="0"
              y="1.6"
              width="8"
              height="1.4"
              fill="none"
              stroke="#2b1608"
              strokeWidth="0.15"
            />
          </>
        )}
      </svg>
      {open && (
        <>
          <span
            className="absolute -left-2 -top-2 animate-mc-float text-sm"
            style={{ animationDelay: "0ms" }}
          >
            ✨
          </span>
          <span
            className="absolute -right-2 -top-1 animate-mc-float text-xs"
            style={{ animationDelay: "300ms" }}
          >
            ✨
          </span>
          <span
            className="absolute -bottom-1 left-1/2 animate-mc-float text-xs"
            style={{ animationDelay: "150ms" }}
          >
            ✨
          </span>
        </>
      )}
    </div>
  );
}
