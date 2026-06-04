import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { toggleFavorite } from '../lib/firebase-services';
import { toast } from 'sonner';

export const FavoriteButton: React.FC<{ addonId: string }> = ({ addonId }) => {
  const { user, profile } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsFavorite(profile.favorites?.includes(addonId) || false);
    }
  }, [profile, addonId]);

  const handleToggle = async () => {
    if (!user) {
      toast.error('Entre para salvar nos favoritos!');
      return;
    }

    setLoading(true);
    try {
      await toggleFavorite(user.uid, addonId, isFavorite);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removido dos favoritos' : 'Salvo nos favoritos!');
    } catch (error) {
      toast.error('Erro ao atualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`btn-block transition-all !px-3 !py-2 ${
        isFavorite 
          ? 'bg-red-500 text-white border-red-700' 
          : 'bg-background text-foreground'
      }`}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
      <span className="hidden sm:inline ml-2">
        {isFavorite ? 'Favoritado' : 'Favoritar'}
      </span>
    </button>
  );
};
