import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/use-auth';
import { FloatingBackground } from '@/components/FloatingBackground';
import { BottomNavigation } from '@/components/BottomNavigation';
import { User, LogOut, Calendar, Download, Heart, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-pixel animate-pulse">Carregando...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="relative min-h-screen">
        <FloatingBackground />
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
          <User className="mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="font-pixel text-2xl uppercase">PERFIL</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre para ver suas estatísticas e gerenciar sua conta.
          </p>
          <button
            onClick={() => navigate({ to: '/auth' })}
            className="btn-block mt-6 bg-primary text-primary-foreground"
          >
            Entrar ou Cadastrar
          </button>
        </div>
        <BottomNavigation activeTab="profile" onTabChange={(tab) => navigate({ to: tab === 'home' ? '/' : `/${tab}` })} />
      </div>
    );
  }

  const joinDate = profile.createdAt?.toDate ? format(profile.createdAt.toDate(), "MMMM 'de' yyyy", { locale: ptBR }) : 'Recentemente';

  return (
    <div className="relative min-h-screen pb-20 sm:pb-0">
      <FloatingBackground />
      
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-3 py-4">
          <h1 className="font-pixel text-sm uppercase">MEU PERFIL</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-3 py-8">
        {/* Profile Card */}
        <div className="card-block p-6 text-center">
          <div className="mx-auto h-24 w-24 border-4 border-foreground bg-primary/20 flex items-center justify-center font-pixel text-4xl mb-4">
            {profile.username[0].toUpperCase()}
          </div>
          <h2 className="text-xl font-black uppercase mb-1">{profile.username}</h2>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-6">
            <ShieldCheck className="h-3 w-3 text-primary" />
            Membro NCMINE
          </p>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 bg-muted/30 border-2 border-foreground/10 rounded">
              <Heart className="h-4 w-4 mb-1 text-red-500" />
              <span className="text-sm font-black">{profile.favorites?.length || 0}</span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Favoritos</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/30 border-2 border-foreground/10 rounded">
              <Download className="h-4 w-4 mb-1 text-primary" />
              <span className="text-sm font-black">{profile.downloadsCount || 0}</span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Downloads</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/30 border-2 border-foreground/10 rounded">
              <Calendar className="h-4 w-4 mb-1 text-blue-500" />
              <span className="text-[9px] uppercase font-bold text-muted-foreground mt-1">Desde</span>
              <span className="text-[10px] font-black truncate w-full">{joinDate}</span>
            </div>
          </div>
        </div>

        {/* Download History Section */}
        <div className="mt-8">
          <h3 className="font-pixel text-xs mb-4 flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            HISTÓRICO DE DOWNLOADS
          </h3>
          {profile.downloadedAddons && profile.downloadedAddons.length > 0 ? (
            <div className="space-y-2">
              {profile.downloadedAddons.slice(0, 5).map((addonId: string) => (
                <div 
                  key={addonId} 
                  className="card-block p-3 flex justify-between items-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => navigate({ to: '/addon/$id', params: { id: addonId } })}
                >
                  <span className="text-sm font-bold uppercase">{addonId}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-pixel">Abrir</span>
                </div>
              ))}
              {profile.downloadedAddons.length > 5 && (
                <p className="text-center text-[10px] text-muted-foreground mt-2">
                  Mostrando os últimos 5 downloads
                </p>
              )}
            </div>
          ) : (
            <div className="card-block p-6 text-center border-dashed border-2 border-foreground/20">
              <p className="text-xs text-muted-foreground">Você ainda não baixou nenhum addon.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button 
            onClick={() => navigate({ to: '/favorites' })}
            className="btn-block w-full bg-background flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5" />
              <span className="font-bold">Ver meus favoritos</span>
            </div>
            <span className="font-pixel text-[10px]">{profile.favorites?.length || 0}</span>
          </button>

          <button 
            onClick={async () => {
              await signOut();
              navigate({ to: '/' });
            }}
            className="btn-block w-full bg-red-50 text-red-600 border-red-200 flex items-center gap-3"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-bold">Sair da conta</span>
          </button>
        </div>
      </main>

      <BottomNavigation activeTab="profile" onTabChange={(tab) => navigate({ to: tab === 'home' ? '/' : `/${tab}` })} />
    </div>
  );
}
