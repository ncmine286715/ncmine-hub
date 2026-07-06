import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "ncmine:theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isVoid, setIsVoid] = useState(false);

  useEffect(() => {
    setIsVoid(document.documentElement.classList.contains("void"));
  }, []);

  const toggle = () => {
    const next = !isVoid;
    setIsVoid(next);
    document.documentElement.classList.toggle("void", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "void" : "paper");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isVoid ? "Mudar para tema claro" : "Mudar para tema Dark Void"}
      title={isVoid ? "Tema: Dark Void" : "Tema: Padrão"}
      className={`inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-background hover:bg-muted sm:h-10 sm:w-10 ${className}`}
    >
      {isVoid ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
