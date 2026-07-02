import { useEffect, useState } from "react";
import { Flame, Gift, Star } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { PixelChest } from "@/components/PixelChest";
import { soundManager } from "@/lib/sounds";
import { trackEvent } from "@/lib/analytics";
import { awardPoints } from "@/lib/firebase-services";
import { useAuth } from "@/hooks/use-auth";

const LAST_OPEN_KEY = "ncmine:daily_chest_last_open";
const STREAK_KEY = "ncmine:daily_chest_streak";

function rewardForStreak(streak: number) {
  return Math.min(10 + (streak - 1) * 5, 50);
}

export function DailyChest() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(1);
  const [claimedToday, setClaimedToday] = useState(false);
  const [justOpened, setJustOpened] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    try {
      const lastOpen = localStorage.getItem(LAST_OPEN_KEY);
      const storedStreak = parseInt(localStorage.getItem(STREAK_KEY) || "1", 10);
      setStreak(storedStreak);
      if (lastOpen === new Date().toDateString()) {
        setClaimedToday(true);
      }
    } catch {}
  }, []);

  const handleOpen = async () => {
    if (claimedToday) {
      setShake(true);
      soundManager.play("click");
      trackEvent("daily_chest_locked_click", {});
      window.setTimeout(() => setShake(false), 400);
      toast("Já pegou o baú de hoje! Volte amanhã 🕒", { duration: 3000 });
      return;
    }

    const today = new Date();
    const todayStr = today.toDateString();
    let newStreak = 1;
    try {
      const lastOpen = localStorage.getItem(LAST_OPEN_KEY);
      if (lastOpen) {
        const diffDays = Math.floor((today.getTime() - new Date(lastOpen).getTime()) / (1000 * 60 * 60 * 24));
        const prevStreak = parseInt(localStorage.getItem(STREAK_KEY) || "1", 10);
        newStreak = diffDays <= 1 ? prevStreak + 1 : 1;
      }
      localStorage.setItem(LAST_OPEN_KEY, todayStr);
      localStorage.setItem(STREAK_KEY, String(newStreak));
    } catch {}

    const reward = rewardForStreak(newStreak);

    setStreak(newStreak);
    setClaimedToday(true);
    setJustOpened(true);
    soundManager.play("xp");
    trackEvent("daily_chest_open", { streak: newStreak, reward });

    if (user) {
      try {
        await awardPoints(user.uid, reward);
      } catch {}
      toast.success(`Baú aberto! +${reward} XP`, { duration: 4000 });
    } else {
      toast(`Baú aberto! +${reward} XP de mentirinha 😉`, {
        description: "Crie uma conta grátis pra guardar seu XP de verdade.",
        duration: 5000,
      });
    }
  };

  return (
    <div className="card-block relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-primary/10 to-transparent p-3 sm:gap-5 sm:p-5">
      <button
        type="button"
        onClick={handleOpen}
        aria-label={claimedToday ? "Baú já aberto hoje" : "Abrir baú diário"}
        className={`shrink-0 ${shake ? "animate-mc-chest-shake" : ""}`}
      >
        <PixelChest open={justOpened || claimedToday} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          <Gift className="h-3.5 w-3.5 text-primary" />
          <span className="font-pixel text-[9px] uppercase text-primary sm:text-[10px]">Baú Diário</span>
          {streak > 1 && (
            <span className="inline-flex items-center gap-0.5 border border-foreground/20 bg-background px-1.5 py-0.5 font-pixel text-[7px] uppercase text-orange-600 sm:text-[8px]">
              <Flame className="h-2.5 w-2.5 fill-orange-500 text-orange-500" /> {streak} dias
            </span>
          )}
        </div>
        <p className="text-[11px] font-bold leading-snug sm:text-sm">
          {claimedToday
            ? "Recompensa de hoje coletada! Volte amanhã pra mais XP."
            : `Clique e ganhe +${rewardForStreak(streak >= 1 ? streak : 1)} XP grátis hoje.`}
        </p>
        {!user && !claimedToday && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            <Link to="/auth" className="underline decoration-dotted underline-offset-2 hover:text-primary">
              Crie uma conta
            </Link>{" "}
            pra guardar seu XP.
          </p>
        )}
      </div>

      {!claimedToday && (
        <button
          type="button"
          onClick={handleOpen}
          className="btn-block hidden shrink-0 !px-4 !py-2.5 text-[11px] font-black uppercase sm:inline-flex"
        >
          <Star className="h-3.5 w-3.5" /> Abrir
        </button>
      )}
    </div>
  );
}
