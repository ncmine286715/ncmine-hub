import React, { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { addRating, addComment, getComments } from '../lib/firebase-services';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  rating?: number;
  createdAt: any;
  likes: number;
}

export const RatingAndComments: React.FC<{ addonId: string }> = ({ addonId }) => {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadComments();
  }, [addonId]);

  const loadComments = async () => {
    try {
      const data = await getComments(addonId);
      setComments(data as Comment[]);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('Você precisa estar logado para comentar.');
      return;
    }
    if (rating === 0 && comment.trim() === '') {
      toast.error('Dê uma nota ou escreva um comentário.');
      return;
    }

    setLoading(true);
    try {
      if (rating > 0) {
        await addRating(user.uid, profile.username, addonId, rating, comment);
        toast.success('Avaliação enviada!');
        setRating(0);
      } else {
        await addComment(user.uid, profile.username, addonId, comment);
        toast.success('Comentário enviado!');
      }
      setComment('');
      loadComments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar comentário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="card-block p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-pixel text-xs sm:text-sm">
          <MessageSquare className="h-4 w-4 text-primary" />
          AVALIAÇÕES E COMENTÁRIOS
        </h2>

        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Sua nota:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform active:scale-90"
                  >
                    <Star
                      className={`h-6 w-6 ${(hoverRating || rating) >= i ? 'fill-primary text-primary' : 'text-muted-foreground/40'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="O que você achou desse addon? (opcional se der nota)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border-2 border-foreground min-h-[100px]"
            />
            <Button 
              type="submit" 
              disabled={loading} 
              className="btn-block bg-primary text-primary-foreground"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Enviando...' : 'Publicar'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-6 bg-muted/30 border-2 border-dashed border-foreground/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Você precisa estar logado para avaliar este addon.
            </p>
            <Button variant="outline" className="border-2 border-foreground" asChild>
              <a href="/auth">Entrar ou Cadastrar</a>
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {fetching ? (
          <div className="text-center py-10">Carregando comentários...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Nenhum comentário ainda. Seja o primeiro!
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="card-block p-4 border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary/20 border-2 border-foreground flex items-center justify-center font-pixel text-xs">
                    {c.username[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-bold">{c.username}</span>
                    <div className="flex text-[10px] text-muted-foreground">
                      {c.createdAt?.toDate ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : 'agora mesmo'}
                    </div>
                  </div>
                </div>
                {c.rating && (
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 border border-primary/20 rounded">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs font-bold text-primary">{c.rating}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {c.text}
              </p>
              <div className="mt-3 flex items-center gap-4">
                <button className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="h-3 w-3" />
                  CURTIR ({c.likes})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
