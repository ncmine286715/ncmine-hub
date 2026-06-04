import React, { useState, useEffect } from 'react';
import { Bell, Package, Zap, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { getNotifications, markNotificationAsRead, type Notification } from '../lib/firebase-services';
import { Button } from './ui/button';
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

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-end sm:p-4 bg-background/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full sm:w-[400px] h-full sm:h-auto sm:max-h-[600px] bg-background border-l-2 sm:border-2 border-foreground shadow-[8px_8px_0_0_var(--ink)] flex flex-col animate-mc-rise"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b-2 border-foreground flex items-center justify-between bg-primary/10">
          <h2 className="font-pixel text-[10px] uppercase flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Alertas da Mina
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-primary/20 border-2 border-foreground bg-background">
            <Check className="h-3 w-3" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading ? (
            <div className="p-10 text-center font-pixel text-[8px] animate-pulse">Sondando terrenos...</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs uppercase font-bold">Nenhum sinal detectado.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => handleAction(n)}
                className={`p-3 border-2 border-foreground cursor-pointer transition-all hover:bg-primary/5 relative ${!n.read ? 'bg-primary/5 border-l-4 border-l-primary' : 'opacity-60'}`}
              >
                <div className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 bg-background border-2 border-foreground flex items-center justify-center">
                    {n.type === 'new_addon' ? <Zap className="h-4 w-4 text-yellow-500" /> : <Package className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase mb-0.5 truncate">{n.title}</p>
                    <p className="text-[11px] leading-tight text-foreground/80 line-clamp-2">{n.message}</p>
                    <p className="mt-1.5 text-[8px] font-bold text-muted-foreground uppercase">
                      {formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t-2 border-foreground bg-muted/20 text-center">
           <p className="text-[8px] font-pixel text-muted-foreground uppercase leading-tight">
             Você recebe avisos sobre novos addons do mesmo tipo que você baixou.
           </p>
        </div>
      </div>
    </div>
  );
};
