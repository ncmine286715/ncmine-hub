import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Sparkles, X, ArrowRight, Star, Trophy } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { awardStreakBonus } from '@/lib/firebase-services';

const LAST_VISIT_KEY = 'ncmine:last_visit';
const STREAK_KEY = 'ncmine:streak';
const DISMISS_KEY = 'ncmine:welcome_dismissed';

export function EngagementToast() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0');
    const dismissed = localStorage.getItem(DISMISS_KEY);

    if (dismissed === todayStr) return;

    if (lastVisit) {
      const lastDate = new Date(lastVisit);
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const newStreak = currentStreak + 1;
        setStreak(newStreak);
        localStorage.setItem(STREAK_KEY, String(newStreak));
        setShow(true);
        if (user) awardStreakBonus(user.uid).catch(() => {});
      } else if (diffDays > 1) {
        setStreak(1);
        localStorage.setItem(STREAK_KEY, '1');
        setIsReturning(true);
        setShow(true);
      } else if (lastDate.toDateString() !== todayStr) {
        const newStreak = currentStreak + 1;
        setStreak(newStreak);
        localStorage.setItem(STREAK_KEY, String(newStreak));
      }
    } else {
      setStreak(1);
      localStorage.setItem(STREAK_KEY, '1');
    }

    localStorage.setItem(LAST_VISIT_KEY, now.toString());
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, new Date().toDateString());
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md animate-mc-rise">
      <div className="bg-background border-2 border-foreground shadow-[6px_6px_0_0_var(--ink)] p-4 relative">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 p-1 hover:bg-muted border border-foreground/20"
        >
          <X className="h-3 w-3" />
        </button>

        {isReturning ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-pixel text-[10px] uppercase text-primary">Bem-vindo de volta!</span>
            </div>
            <p className="text-sm font-bold">Sentimos sua falta! Confira os novos addons que chegaram.</p>
            <button
              onClick={() => { dismiss(); document.getElementById('addons')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="mt-3 btn-block bg-primary text-primary-foreground !py-2 text-xs w-full"
            >
              Ver novidades <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ) : streak > 1 ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-pixel text-[10px] uppercase text-yellow-600">Streak de {streak} dias!</span>
            </div>
            <p className="text-sm font-bold">
              Voce esta visitando ha {streak} dias seguidos!
              {!user && ' Crie uma conta para nao perder seu progresso.'}
            </p>
            {!user && (
              <button
                onClick={() => { dismiss(); navigate({ to: '/auth' }); }}
                className="mt-3 btn-block bg-primary text-primary-foreground !py-2 text-xs w-full"
              >
                Criar conta gratis <Star className="h-3 w-3" />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
