import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/use-auth';
import { useMemo, useState } from 'react';
import addonsData from "@/data/addons.json";
import { AddonCard, type Addon } from '@/components/AddonCard';
import { FloatingBackground } from '@/components/FloatingBackground';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Heart, ArrowLeft } from 'lucide-react';
import { MinecraftBlockIcon } from '@/components/icons/BrandIcons';
import { DownloadModal } from '@/components/DownloadModal';

const RAW_ADDONS = addonsData as Addon[];

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [downloadFor, setDownloadFor] = useState<Addon | null>(null);

  const favoriteAddons = useMemo(() => {
    if (!profile?.favorites) return [];
    return RAW_ADDONS.filter(a => profile.favorites.includes(a.id));
  }, [profile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-pixel animate-pulse">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <FloatingBackground />
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
          <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="font-pixel text-2xl">FAVORITOS</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Você precisa estar logado para ver seus favoritos.
          </p>
          <button
            onClick={() => navigate({ to: '/auth' })}
            className="btn-block mt-6 bg-primary text-primary-foreground"
          >
            Entrar Agora
          </button>
        </div>
        <BottomNavigation activeTab="favorites" onTabChange={(tab) => navigate({ to: tab === 'home' ? '/' : `/${tab}` })} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 sm:pb-0">
      <FloatingBackground />
      
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-4">
          <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 font-bold">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="font-pixel text-sm uppercase">MEUS FAVORITOS</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-6">
        {favoriteAddons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MinecraftBlockIcon className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">Você ainda não tem nenhum favorito.</p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Explorar Addons
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {favoriteAddons.map((addon) => (
              <AddonCard 
                key={addon.id} 
                addon={addon} 
                onDownload={setDownloadFor}
                onOpen={(a) => navigate({ to: '/addon/$id', params: { id: a.id } })}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNavigation activeTab="favorites" onTabChange={(tab) => navigate({ to: tab === 'home' ? '/' : `/${tab}` })} />

      <DownloadModal
        open={!!downloadFor}
        url={downloadFor?.downloadUrl ?? "#"}
        title={downloadFor?.title ?? ""}
        onClose={() => setDownloadFor(null)}
      />
    </div>
  );
}
