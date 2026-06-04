import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { broadcastNotification } from '../lib/firebase-services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Megaphone, Send, ShieldAlert } from 'lucide-react';
import { soundManager } from '../lib/sounds';

export const AdminBroadcastPanel: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [addonId, setAddonId] = useState('');

  // Strict admin check
  const isAdmin = user?.email === 'rosidomingos032@gmail.com';

  if (!isAdmin) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setLoading(true);
    try {
      await broadcastNotification(title, message, addonId || undefined);
      soundManager.play('xp');
      toast.success('NOTIFICAÇÃO ENVIADA PARA TODOS!');
      setTitle('');
      setMessage('');
      setAddonId('');
    } catch (error: any) {
      toast.error('Erro ao enviar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card className="border-4 border-red-600 shadow-[8px_8px_0_0_rgba(220,38,38,0.2)] bg-red-50/50 backdrop-blur-sm">
        <CardHeader className="bg-red-600 text-white p-4">
          <CardTitle className="font-pixel text-sm flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
            PAINEL DO MESTRE (ADMIN)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-xs font-bold text-red-700 mb-6 uppercase tracking-widest">
            Atenção: Isso vai enviar uma notificação para TODOS os usuários do site agora.
          </p>
          
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase">Título da Notificação</label>
              <Input 
                placeholder="Ex: NOVO ADDON APELÃO!" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="border-2 border-red-200 focus:border-red-600 h-12 text-sm font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase">Mensagem (O que eles vão ler)</label>
              <Textarea 
                placeholder="Ex: Corre aqui pra baixar o novo mod de Netherite Infinita que acabou de sair!" 
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="border-2 border-red-200 focus:border-red-600 min-h-[100px] text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase">ID do Addon (Opcional - link direto)</label>
              <Input 
                placeholder="Ex: netherite-infinita-42" 
                value={addonId}
                onChange={e => setAddonId(e.target.value)}
                className="border-2 border-red-200 focus:border-red-600"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full btn-block bg-red-600 hover:bg-red-700 text-white !py-6 font-black uppercase tracking-widest text-lg shadow-[4px_4px_0_0_var(--ink)]"
            >
              <Megaphone className="h-6 w-6 mr-3" />
              {loading ? 'DISPARANDO...' : 'DISPARAR ALERTA GERAL'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
