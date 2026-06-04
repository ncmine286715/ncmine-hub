import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '../hooks/use-auth';
import { FloatingBackground } from '@/components/FloatingBackground';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  User, 
  LogOut, 
  Calendar, 
  Download, 
  Heart, 
  ShieldCheck, 
  ArrowLeft, 
  Trophy, 
  Edit2, 
  ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProfileEditor } from '../components/ProfileEditor';
import { AdminBroadcastPanel } from '../components/AdminBroadcastPanel';
import { useState } from 'react';
import { InstagramIcon, YouTubeIcon, DiscordIcon } from '../components/icons/BrandIcons';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Strict admin check
  const isAdmin = user?.email === 'rosidomingos032@gmail.com';

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
  const rankColor = profile.rank === 'Lenda' ? 'bg-orange-500' : profile.rank === 'Veterano' ? 'bg-purple-500' : 'bg-primary';

  return (
    <div className="relative min-h-screen pb-20 sm:pb-0">
      <FloatingBackground />
      
      {isEditing && <ProfileEditor onClose={() => setIsEditing(false)} />}

      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-4">
          <button onClick={() => navigate({ to: '/' })} className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Início
          </button>
          <h1 className="font-pixel text-sm uppercase">MEU PERFIL</h1>
          <div className="flex items-center gap-2">
            {isAdmin && <span className="bg-red-600 text-white text-[8px] font-pixel px-1.5 py-0.5 shadow-[2px_2px_0_0_#000]">ADMIN</span>}
            <button onClick={() => setIsEditing(true)} className="text-primary hover:scale-110 transition-transform">
              <Edit2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-3 py-6">
        {/* Admin Section */}
        {isAdmin && <AdminBroadcastPanel />}
        
        {/* Profile Card with Banner */}
        <div className="card-block p-0 overflow-hidden relative">
          <div className="h-24 sm:h-32 bg-primary/10 relative overflow-hidden">
            {profile.banner ? (
              <img src={profile.banner} className="w-full h-full object-cover" alt="Banner" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 via-background to-primary/20" />
            )}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 font-pixel text-[8px] border-2 border-foreground text-white shadow-[2px_2px_0_0_var(--ink)] ${rankColor}`}>
                {profile.rank || 'Iniciante'}
              </span>
            </div>
          </div>
          
          <div className="px-6 pb-6 text-center">
            <div className="mx-auto -mt-10 h-20 w-20 border-4 border-foreground bg-background overflow-hidden flex items-center justify-center font-pixel text-3xl mb-3 relative z-10 shadow-[4px_4px_0_0_var(--ink)]">
              {profile.avatar ? (
                <img src={profile.avatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                profile.username?.[0]?.toUpperCase() || '?'
              )}
            </div>
            
            <h2 className="text-xl font-black uppercase mb-1">{profile.username}</h2>
            
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <Trophy className="h-3 w-3 text-orange-500" /> {profile.points || 0} PTS
              </span>
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                <Calendar className="h-3 w-3 text-primary" /> {joinDate}
              </span>
            </div>

            {profile.bio && (
              <p className="text-xs text-foreground/70 italic mb-4 max-w-md mx-auto line-clamp-2">
                "{profile.bio}"
              </p>
            )}

            <div className="flex justify-center gap-3 mb-6">
              {profile.socialLinks?.discord && (
                <button title={profile.socialLinks.discord} className="hover:scale-110 transition-transform"><DiscordIcon className="h-4 w-4" /></button>
              )}
              {profile.socialLinks?.youtube && (
                <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><YouTubeIcon className="h-4 w-4" /></a>
              )}
              {profile.socialLinks?.instagram && (
                <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><InstagramIcon className="h-4 w-4" /></a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 bg-primary/5 border-2 border-foreground rounded shadow-[3px_3px_0_0_var(--ink)]">
                <Heart className="h-5 w-5 mb-1 text-red-500" />
                <span className="text-sm font-black">{profile.favorites?.length || 0}</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Favoritos</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-primary/5 border-2 border-foreground rounded shadow-[3px_3px_0_0_var(--ink)]">
                <Download className="h-5 w-5 mb-1 text-primary" />
                <span className="text-sm font-black">{profile.downloadsCount || 0}</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Downloads</span>
              </div>
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
