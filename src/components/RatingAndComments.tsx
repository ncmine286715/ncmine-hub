import React, { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp, MessageSquare, Reply, Trophy, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { addRating, addComment, getComments, toggleLikeComment, addReply, awardPoints } from '../lib/firebase-services';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReplyData {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: any;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  rating?: number;
  createdAt: any;
  likes: number;
  repliesCount?: number;
}

export const RatingAndComments: React.FC<{ addonId: string }> = ({ addonId }) => {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

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
      toast.error('Logue para comentar.');
      return;
    }
    if (rating === 0 && comment.trim() === '') {
      toast.error('Dê uma nota ou escreva algo.');
      return;
    }

    setLoading(true);
    try {
      if (rating > 0) {
        await addRating(user.uid, profile.username, addonId, rating, comment);
        await awardPoints(user.uid, 5); // 5 points for rating
        toast.success('Avaliação enviada! +5 XP');
        setRating(0);
      } else {
        await addComment(user.uid, profile.username, addonId, comment);
        await awardPoints(user.uid, 2); // 2 points for comment
        toast.success('Comentário enviado! +2 XP');
      }
      setComment('');
      loadComments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Logue para curtir.');
      return;
    }
    try {
      await toggleLikeComment(commentId, user.uid);
      loadComments();
    } catch (error) {
      toast.error('Erro ao curtir.');
    }
  };

  const handleReply = async (commentId: string) => {
    if (!user || !profile) return;
    if (replyText.trim() === '') return;

    try {
      await addReply(commentId, user.uid, profile.username, replyText);
      await awardPoints(user.uid, 1);
      toast.success('Resposta enviada!');
      setReplyTo(null);
      setReplyText('');
      loadComments();
    } catch (error) {
      toast.error('Erro ao responder.');
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Input Section */}
      <div className="card-block p-4 sm:p-8 bg-primary/5 border-primary/20">
        <h2 className="mb-6 flex items-center gap-2 font-pixel text-xs sm:text-sm text-primary">
          <MessageSquare className="h-5 w-5" />
          ÁREA DE FEEDBACK
        </h2>

        {user ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-background border-2 border-foreground rounded shadow-[4px_4px_0_0_var(--ink)]">
              <span className="text-sm font-black uppercase tracking-wider">Sua avaliação:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-all hover:scale-110 active:scale-90"
                  >
                    <Star
                      className={`h-7 w-7 ${(hoverRating || rating) >= i ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Textarea
                placeholder="Compartilhe sua experiência com outros mineradores..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border-2 border-foreground min-h-[120px] focus:ring-0 text-sm sm:text-base p-4"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] font-pixel text-muted-foreground uppercase">
                <Trophy className="h-3 w-3" /> Ganhe XP
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full sm:w-auto btn-block bg-primary text-primary-foreground px-8 py-6 font-black uppercase tracking-widest text-base shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] transition-transform"
            >
              <Send className="h-5 w-5 mr-2" />
              {loading ? 'Publicando...' : 'Publicar no Mural'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-10 border-4 border-dashed border-foreground/10 rounded-2xl">
            <p className="text-sm text-muted-foreground mb-6 uppercase font-pixel tracking-tighter">
              Faça login para participar da comunidade
            </p>
            <Button className="btn-block bg-primary text-primary-foreground font-black px-10" asChild>
              <a href="/auth">Entrar Agora</a>
            </Button>
          </div>
        )}
      </div>

      {/* Comments Mural */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
           <h3 className="font-pixel text-[10px] text-muted-foreground uppercase">Mural de Comentários</h3>
           <span className="text-[10px] font-bold bg-foreground text-background px-2 py-0.5">{comments.length}</span>
        </div>

        {fetching ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-pixel text-[10px] animate-pulse">Minerando comentários...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-foreground/5">
            <p className="text-muted-foreground font-pixel text-xs uppercase opacity-50 italic">
              Nenhum minerador passou por aqui ainda.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {comments.map((c) => (
              <div key={c.id} className="group bg-background border-2 border-foreground p-4 sm:p-6 transition-all hover:shadow-[6px_6px_0_0_var(--ink)] relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 border-2 border-foreground flex items-center justify-center font-pixel text-lg shadow-[2px_2px_0_0_var(--ink)] overflow-hidden">
                      {c.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black uppercase tracking-tight">{c.username}</span>
                        {c.userId === 'admin_id' && <ShieldCheck className="h-3 w-3 text-primary" />}
                      </div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold">
                        {c.createdAt?.toDate ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : 'agora'}
                      </div>
                    </div>
                  </div>
                  {c.rating && (
                    <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 border-2 border-foreground shadow-[2px_2px_0_0_var(--ink)]">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-black">{c.rating}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-medium mb-6">
                  {c.text}
                </p>

                <div className="flex items-center gap-4 pt-4 border-t-2 border-dashed border-foreground/10">
                  <button 
                    onClick={() => handleLike(c.id)}
                    className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground hover:text-red-500 transition-colors uppercase group/btn"
                  >
                    <ThumbsUp className={`h-4 w-4 ${c.likes > 0 ? 'fill-red-500 text-red-500' : 'group-hover/btn:scale-110 transition-transform'}`} />
                    CURTIR ({c.likes})
                  </button>
                  <button 
                    onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                    className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase"
                  >
                    <Reply className="h-4 w-4" />
                    RESPONDER {c.repliesCount ? `(${c.repliesCount})` : ''}
                  </button>
                </div>

                {replyTo === c.id && (
                  <div className="mt-4 flex gap-2 animate-mc-rise">
                    <Input 
                      autoFocus
                      placeholder="Sua resposta..." 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="border-2 border-foreground h-10"
                    />
                    <Button onClick={() => handleReply(c.id)} className="btn-block bg-primary text-primary-foreground h-10 px-4">
                      ENVIAR
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
