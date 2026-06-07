import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AuthForms } from '../components/AuthForms';
import { useAuth } from '../hooks/use-auth';
import { useEffect } from 'react';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ShieldCheck, Zap, Star, Trophy, Bell, Heart } from 'lucide-react';
import { MinecraftBlockIcon } from '@/components/icons/BrandIcons';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate({ to: '/' });
    }
  }, [user, navigate]);

  return (
    <div className="relative min-h-screen pb-8">
      <FloatingBackground />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3">
          <button onClick={() => navigate({ to: '/' })} className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center gap-1">
            <MinecraftBlockIcon className="h-4 w-4 text-primary" /> NCMINE
          </button>
          <span className="font-pixel text-[9px] text-muted-foreground uppercase">Area do Minerador</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 py-6 sm:py-12">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-10 items-start">
          {/* Left - Benefits */}
          <div className="hidden sm:block space-y-6">
            <div>
              <span className="inline-block bg-primary px-3 py-1 font-pixel text-[9px] text-primary-foreground border-2 border-foreground shadow-[3px_3px_0_0_var(--ink)] mb-4">
                POR QUE CRIAR CONTA?
              </span>
              <h1 className="text-3xl font-black uppercase leading-tight">
                Sua conta de
                <br />
                <span className="text-primary">minerador</span>
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Tenha a melhor experiencia no NCMINE Hub. Tudo gratis, pra sempre.
              </p>
            </div>

            <div className="space-y-3">
              <BenefitItem
                icon={<Heart className="h-5 w-5 text-red-500" />}
                title="Favoritos Salvos"
                desc="Salve seus addons favoritos e acesse rapido"
              />
              <BenefitItem
                icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                title="Sistema de XP"
                desc="Ganhe pontos baixando, comentando e avaliando"
              />
              <BenefitItem
                icon={<Bell className="h-5 w-5 text-primary" />}
                title="Alertas de Novos Addons"
                desc="Seja o primeiro a saber quando chegar addon novo"
              />
              <BenefitItem
                icon={<Star className="h-5 w-5 text-primary fill-primary" />}
                title="Avalie e Comente"
                desc="Ajude a comunidade avaliando os addons"
              />
              <BenefitItem
                icon={<ShieldCheck className="h-5 w-5 text-green-500" />}
                title="Historico de Downloads"
                desc="Nunca perca o que voce ja baixou"
              />
            </div>

            {/* Social proof */}
            <div className="border-2 border-foreground bg-primary/5 p-4 shadow-[4px_4px_0_0_var(--ink)]">
              <p className="font-pixel text-[9px] uppercase text-primary mb-2">Comunidade ativa</p>
              <div className="flex gap-4">
                <div className="text-center">
                  <span className="text-xl font-black">2.4k+</span>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Mineradores</p>
                </div>
                <div className="text-center">
                  <span className="text-xl font-black">100+</span>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Addons</p>
                </div>
                <div className="text-center">
                  <span className="text-xl font-black">50k+</span>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Downloads</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Auth Form */}
          <div>
            {/* Mobile headline */}
            <div className="sm:hidden mb-4 text-center">
              <h1 className="font-pixel text-lg uppercase">AREA DO MINERADOR</h1>
              <p className="text-xs text-muted-foreground mt-1">Crie sua conta gratis e desbloqueie tudo</p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground">
                  <Zap className="h-3 w-3 text-yellow-500" /> Gratis
                </span>
                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-green-500" /> Seguro
                </span>
                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground">
                  <Star className="h-3 w-3 text-primary fill-primary" /> XP
                </span>
              </div>
            </div>
            <AuthForms onSuccess={() => navigate({ to: '/' })} />

            {/* Mobile benefits below form */}
            <div className="sm:hidden mt-4 grid grid-cols-2 gap-2">
              <div className="border-2 border-foreground bg-background p-3 text-center">
                <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
                <p className="text-[9px] font-bold uppercase">Favoritos</p>
              </div>
              <div className="border-2 border-foreground bg-background p-3 text-center">
                <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                <p className="text-[9px] font-bold uppercase">XP e Rank</p>
              </div>
              <div className="border-2 border-foreground bg-background p-3 text-center">
                <Bell className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-[9px] font-bold uppercase">Alertas</p>
              </div>
              <div className="border-2 border-foreground bg-background p-3 text-center">
                <Star className="h-4 w-4 mx-auto mb-1 text-primary fill-primary" />
                <p className="text-[9px] font-bold uppercase">Avaliacoes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 border-2 border-foreground bg-background p-3 shadow-[3px_3px_0_0_var(--ink)] transition-all hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_var(--ink)]">
      <div className="shrink-0 border-2 border-foreground bg-primary/10 p-1.5">{icon}</div>
      <div>
        <p className="text-sm font-black uppercase">{title}</p>
        <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
      </div>
    </div>
  );
}
