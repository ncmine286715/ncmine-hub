import React, { useState, useEffect } from 'react';
import { Bell, Package, Zap, Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { getNotifications, markNotificationAsRead, type Notification } from '../lib/firebase-services';
import { useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NotificationHub: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadNotifs();
    else setLoading(false);
  }, [user]);

  const loadNotifs = async () => {
    try {
      const data = await getNotifications(user!.uid);
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (notif: Notification) => {
    if (!notif.read) {
      await markNotificationAsRead(user!.uid, notif.id);
    }
    if (notif.addonId) {
      navigate({ to: '/addon/$id', params: { id: notif.addonId } });
    }
    onClose();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-end bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:w-[400px] h-full sm:h-auto sm:max-h-[80vh] sm:m-4 bg-background border-l-2 sm:border-2 border-foreground shadow-[8px_8px_0_0_var(--ink)] flex flex-col animate-mc-rise"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-foreground flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="font-pixel text-[10px] uppercase">Alertas da Mina</h2>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[8px] font-pixel px-1.5 py-0.5 border border-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-primary/10 border-2 border-foreground bg-background min-h-[36px] min-w-[36px] flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {!user ? (
            <div className="p-8 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary/30" />
              <p className="text-xs font-bold uppercase mb-2">Entre para ver alertas</p>
              <p className="text-[10px] text-muted-foreground mb-4">Crie uma conta para receber notificacoes de novos addons</p>
              <button
                onClick={() => { navigate({ to: '/auth' }); onClose(); }}
                className="btn-block bg-primary text-primary-foreground !py-2.5 text-xs w-full"
              >
                Criar conta gratis
              </button>
            </div>
          ) : loading ? (
            <div className="p-10 text-center font-pixel text-[8px] animate-pulse">Sondando terrenos...</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs uppercase font-bold mb-1">Nenhum alerta ainda</p>
              <p className="text-[10px] text-muted-foreground">Baixe addons para receber alertas sobre novidades similares</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleAction(n)}
                className={`p-3 border-2 border-foreground cursor-pointer transition-all min-h-[60px] ${
                  !n.read
                    ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-primary/10 hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_var(--ink)]'
                    : 'opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 bg-background border-2 border-foreground flex items-center justify-center">
                    {n.type === 'new_addon' ? <Zap className="h-4 w-4 text-yellow-500" /> : <Package className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-black uppercase truncate">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 bg-primary rounded-full shrink-0" />}
                    </div>
                    <p className="text-[11px] leading-tight text-foreground/80 line-clamp-2 mt-0.5">{n.message}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">
                        {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : 'agora'}
                      </p>
                      {n.addonId && (
                        <span className="text-[8px] font-pixel text-primary flex items-center gap-0.5">
                          Ver <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-foreground bg-muted/20 text-center">
          <p className="text-[8px] font-pixel text-muted-foreground uppercase leading-tight">
            Alertas sobre novos addons do mesmo tipo que voce baixou
          </p>
        </div>
      </div>
    </div>
  );
};
