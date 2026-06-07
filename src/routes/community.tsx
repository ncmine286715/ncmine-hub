import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { getPopularAddons, getTopRatedAddons, getNewUsers, getGlobalActivity } from '../lib/firebase-services';
import { FloatingBackground } from '@/components/FloatingBackground';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Users, Trophy, Flame, Star, MessageSquare, Activity, ArrowLeft,
  TrendingUp, Crown, Zap, Heart, Target, Sparkles, ArrowRight
} from 'lucide-react';
import { MinecraftBlockIcon } from '@/components/icons/BrandIcons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Route = createFileRoute('/community')({
  component: CommunityPage,
});

function CommunityPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [popular, setPopular] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'feed' | 'ranking' | 'membros'>('feed');

  useEffect(() => {
    async function loadData() {
      try {
        const [p, t, u, a] = await Promise.all([
          getPopularAddons(10),
          getTopRatedAddons(10),
          getNewUsers(20),
          getGlobalActivity(15)
        ]);
        setPopular(p || []);
        setTopRated(t || []);
        setNewUsers(u || []);
        setActivity(a || []);
      } catch (error) {
        console.error('Error loading community data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalMembers = newUsers.length > 0 ? `${newUsers.length}+` : '...';

  return (
    <div className="relative min-h-screen pb-20 sm:pb-0">
      <FloatingBackground />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3">
          <button onClick={() => navigate({ to: '/' })} className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Home
          </button>
          <h1 className="font-pixel text-sm uppercase flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> VILA
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Stats Banner */}
      <div className="border-b-2 border-foreground bg-primary/5">
        <div className="mx-auto max-w-5xl px-3 py-3 sm:py-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div>
              <span className="text-lg sm:text-2xl font-black text-primary">2.4k+</span>
              <p className="text-[7px] sm:text-[9px] font-pixel uppercase text-muted-foreground">Mineradores</p>
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-foreground">{activity.length}</span>
              <p className="text-[7px] sm:text-[9px] font-pixel uppercase text-muted-foreground">Atividades</p>
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-orange-500">{popular.length}</span>
              <p className="text-[7px] sm:text-[9px] font-pixel uppercase text-muted-foreground">Em Alta</p>
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-yellow-500">{topRated.length}</span>
              <p className="text-[7px] sm:text-[9px] font-pixel uppercase text-muted-foreground">Avaliados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="border-b-2 border-foreground bg-background sticky top-[53px] z-30">
        <div className="mx-auto max-w-5xl flex">
          <TabBtn active={activeSection === 'feed'} onClick={() => setActiveSection('feed')} icon={<Activity className="h-3.5 w-3.5" />} label="Feed" />
          <TabBtn active={activeSection === 'ranking'} onClick={() => setActiveSection('ranking')} icon={<Trophy className="h-3.5 w-3.5" />} label="Ranking" />
          <TabBtn active={activeSection === 'membros'} onClick={() => setActiveSection('membros')} icon={<Users className="h-3.5 w-3.5" />} label="Membros" />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-3 py-4 sm:py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <MinecraftBlockIcon className="h-8 w-8 text-primary animate-mc-bob" />
            <p className="mt-3 font-pixel text-[10px] text-muted-foreground animate-pulse uppercase">Minerando dados...</p>
          </div>
        )}

        {!loading && activeSection === 'feed' && (
          <div className="space-y-6">
            {/* User welcome card */}
            {profile && (
              <div className="border-2 border-primary bg-primary/5 p-4 flex items-center justify-between shadow-[4px_4px_0_0_var(--ink)]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 border-2 border-foreground bg-primary/10 flex items-center justify-center font-pixel text-sm overflow-hidden">
                    {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : profile.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase">{profile.username}</p>
                    <p className="text-[9px] font-bold text-primary flex items-center gap-1">
                      <Zap className="h-3 w-3" /> {profile.points || 0} XP - {profile.rank || 'Iniciante'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate({ to: '/profile' })}
                  className="text-[9px] font-pixel text-primary uppercase hover:underline flex items-center gap-1"
                >
                  Perfil <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* CTA for non-logged users */}
            {!user && (
              <div className="border-2 border-primary bg-primary/5 p-4 text-center shadow-[4px_4px_0_0_var(--ink)]">
                <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-pixel text-[10px] uppercase mb-1">Faca parte da vila!</p>
                <p className="text-[11px] text-muted-foreground mb-3">Crie sua conta gratis e apareca aqui</p>
                <button
                  onClick={() => navigate({ to: '/auth' })}
                  className="btn-block bg-primary text-primary-foreground !py-2 text-xs"
                >
                  Entrar na Vila
                </button>
              </div>
            )}

            {/* Activity Feed */}
            <section>
              <h2 className="flex items-center gap-2 font-pixel text-xs mb-3 text-primary">
                <Activity className="h-4 w-4" />
                ATIVIDADE RECENTE
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {activity.map((act) => (
                  <div key={act.id} className="group bg-background border-2 border-foreground p-3 sm:p-4 transition-all hover:shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px]">
                    <div className="flex gap-3">
                      <div className="h-9 w-9 sm:h-11 sm:w-11 shrink-0 border-2 border-foreground bg-primary/10 flex items-center justify-center font-pixel text-xs overflow-hidden">
                        {act.avatar ? <img src={act.avatar} className="w-full h-full object-cover" /> : (act.username?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase truncate">{act.username}</span>
                          <span className="text-[8px] text-muted-foreground font-bold">comentou</span>
                          {act.rating && (
                            <span className="flex items-center gap-0.5 text-[8px] font-bold text-yellow-600">
                              <Star className="h-2.5 w-2.5 fill-current" /> {act.rating}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-foreground/80 line-clamp-2 italic leading-relaxed">"{act.text}"</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[8px] text-muted-foreground font-bold uppercase">
                            {act.createdAt?.toDate ? formatDistanceToNow(act.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : 'agora'}
                          </span>
                          <button
                            onClick={() => navigate({ to: '/addon/$id', params: { id: act.addonId } })}
                            className="text-[8px] font-pixel text-primary uppercase hover:underline flex items-center gap-0.5"
                          >
                            {act.addonId} <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className="text-center py-16 border-2 border-dashed border-foreground/10">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground font-pixel uppercase">Silencio total na mina...</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Seja o primeiro a comentar em um addon!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Rankings Inline */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border-2 border-foreground bg-background p-3 shadow-[3px_3px_0_0_var(--ink)]">
                <h3 className="flex items-center gap-2 font-pixel text-[10px] mb-2 text-orange-500">
                  <Flame className="h-3.5 w-3.5" /> TOP 3 POPULARES
                </h3>
                {popular.slice(0, 3).map((addon, i) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between py-1.5 border-b border-foreground/5 last:border-0 cursor-pointer hover:text-primary"
                    onClick={() => navigate({ to: '/addon/$id', params: { id: addon.id } })}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-pixel text-[9px] text-muted-foreground w-4">#{i + 1}</span>
                      <span className="text-[11px] font-bold uppercase truncate">{addon.id}</span>
                    </span>
                    <span className="text-[9px] font-bold text-orange-500">{addon.favoritesCount}</span>
                  </div>
                ))}
              </div>
              <div className="border-2 border-foreground bg-background p-3 shadow-[3px_3px_0_0_var(--ink)]">
                <h3 className="flex items-center gap-2 font-pixel text-[10px] mb-2 text-yellow-500">
                  <Star className="h-3.5 w-3.5 fill-current" /> TOP 3 AVALIADOS
                </h3>
                {topRated.slice(0, 3).map((addon, i) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between py-1.5 border-b border-foreground/5 last:border-0 cursor-pointer hover:text-primary"
                    onClick={() => navigate({ to: '/addon/$id', params: { id: addon.id } })}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-pixel text-[9px] text-muted-foreground w-4">#{i + 1}</span>
                      <span className="text-[11px] font-bold uppercase truncate">{addon.id}</span>
                    </span>
                    <span className="text-[9px] font-bold text-yellow-500">{addon.averageRating?.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {!loading && activeSection === 'ranking' && (
          <div className="space-y-6">
            {/* Popular Addons Full */}
            <section>
              <h2 className="flex items-center gap-2 font-pixel text-xs mb-3">
                <Flame className="h-4 w-4 text-orange-500" />
                ADDONS MAIS POPULARES
              </h2>
              <div className="space-y-2">
                {popular.map((addon, index) => (
                  <div
                    key={addon.id}
                    className={`group bg-background border-2 border-foreground p-3 flex items-center gap-3 cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_var(--ink)] ${index < 3 ? 'border-l-4 border-l-orange-500' : ''}`}
                    onClick={() => navigate({ to: '/addon/$id', params: { id: addon.id } })}
                  >
                    <span className={`font-pixel text-sm w-8 text-center ${index === 0 ? 'text-orange-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                      {index === 0 ? <Crown className="h-5 w-5 mx-auto text-orange-500" /> : `#${index + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-[11px] sm:text-sm uppercase truncate block">{addon.id}</span>
                      {addon.averageRating > 0 && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" /> {addon.averageRating?.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-orange-500 shrink-0">
                      <Heart className="h-3.5 w-3.5 fill-current" /> {addon.favoritesCount}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Rated Full */}
            <section>
              <h2 className="flex items-center gap-2 font-pixel text-xs mb-3">
                <Trophy className="h-4 w-4 text-yellow-500" />
                MELHOR AVALIADOS
              </h2>
              <div className="space-y-2">
                {topRated.map((addon, index) => (
                  <div
                    key={addon.id}
                    className={`group bg-background border-2 border-foreground p-3 flex items-center gap-3 cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_var(--ink)] ${index < 3 ? 'border-l-4 border-l-yellow-500' : ''}`}
                    onClick={() => navigate({ to: '/addon/$id', params: { id: addon.id } })}
                  >
                    <span className={`font-pixel text-sm w-8 text-center ${index === 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                      {index === 0 ? <Crown className="h-5 w-5 mx-auto text-yellow-500" /> : `#${index + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-[11px] sm:text-sm uppercase truncate block">{addon.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-yellow-500 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-current" /> {addon.averageRating?.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Engagement CTA */}
            <div className="bg-primary border-2 border-foreground p-5 text-primary-foreground text-center shadow-[6px_6px_0_0_var(--ink)]">
              <Target className="h-8 w-8 mx-auto mb-2" />
              <p className="font-pixel text-[10px] mb-1 uppercase">Quer aparecer no ranking?</p>
              <p className="text-[11px] leading-tight font-bold opacity-90">Comente e avalie addons para ganhar XP e subir de rank!</p>
              {!user && (
                <button
                  onClick={() => navigate({ to: '/auth' })}
                  className="mt-3 btn-block bg-background text-foreground !py-2 text-xs"
                >
                  Criar conta gratis
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && activeSection === 'membros' && (
          <div className="space-y-6">
            {/* New Members */}
            <section>
              <h2 className="flex items-center gap-2 font-pixel text-xs mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                NOVOS MINERADORES
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {newUsers.map((u, i) => (
                  <div key={u.id} className="border-2 border-foreground bg-background p-3 text-center transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_var(--ink)]">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 mx-auto border-2 border-foreground bg-primary/10 flex items-center justify-center font-pixel text-lg mb-2 overflow-hidden">
                      {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : (u.username?.[0] || '?').toUpperCase()}
                    </div>
                    <p className="text-[10px] sm:text-xs font-black uppercase truncate">{u.username}</p>
                    <p className="text-[8px] font-pixel text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <Zap className="h-2.5 w-2.5 text-yellow-500" /> {u.points || 0} XP
                    </p>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 text-[7px] font-pixel uppercase border border-foreground ${
                      u.rank === 'Lenda' ? 'bg-orange-500 text-white' :
                      u.rank === 'Veterano' ? 'bg-purple-500 text-white' :
                      u.rank === 'Explorador' ? 'bg-blue-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {u.rank || 'Iniciante'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Join CTA */}
            {!user && (
              <div className="border-2 border-foreground bg-background p-6 text-center shadow-[6px_6px_0_0_var(--ink)]">
                <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
                <p className="font-pixel text-xs uppercase mb-1">Junte-se a Vila</p>
                <p className="text-xs text-muted-foreground mb-4">Crie sua conta e apareca na lista de mineradores</p>
                <button
                  onClick={() => navigate({ to: '/auth' })}
                  className="btn-block bg-primary text-primary-foreground !py-3 text-sm animate-mc-pulse-orange"
                >
                  <Sparkles className="h-4 w-4" /> Criar minha conta
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNavigation activeTab="community" onTabChange={(tab) => navigate({ to: tab === 'home' ? '/' : `/${tab}` })} />
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] sm:text-xs font-bold uppercase transition-all border-b-2 ${
        active
          ? 'border-primary text-primary bg-primary/5'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
