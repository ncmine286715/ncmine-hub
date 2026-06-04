import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { updateProfile } from '../lib/firebase-services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { toast } from 'sonner';
import { X, Save, Camera, Link as LinkIcon } from 'lucide-react';

export const ProfileEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || '',
    banner: profile?.banner || '',
    discord: profile?.socialLinks?.discord || '',
    youtube: profile?.socialLinks?.youtube || '',
    instagram: profile?.socialLinks?.instagram || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      await updateProfile(profile.id, {
        username: formData.username,
        bio: formData.bio,
        avatar: formData.avatar,
        banner: formData.banner,
        socialLinks: {
          discord: formData.discord,
          youtube: formData.youtube,
          instagram: formData.instagram,
        }
      });
      toast.success('Perfil atualizado com sucesso!');
      onClose();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-2 border-foreground animate-mc-rise">
        <CardHeader className="flex flex-row items-center justify-between border-b-2 border-foreground bg-primary/5">
          <CardTitle className="font-pixel text-sm uppercase">EDITAR PERFIL</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Nome de Usuário</Label>
              <Input 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="border-2 border-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Bio (Sua história)</Label>
              <Textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="border-2 border-foreground min-h-[80px]"
                placeholder="Ex: Fã de addons de sobrevivência!"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Camera className="h-3 w-3" /> Avatar URL</Label>
                <Input 
                  value={formData.avatar}
                  onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                  className="border-2 border-foreground"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Camera className="h-3 w-3" /> Banner URL</Label>
                <Input 
                  value={formData.banner}
                  onChange={(e) => setFormData({...formData, banner: e.target.value})}
                  className="border-2 border-foreground"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t-2 border-dashed border-foreground/20">
              <Label className="flex items-center gap-2 text-primary"><LinkIcon className="h-3 w-3" /> Redes Sociais</Label>
              <div className="grid gap-2">
                <Input 
                  placeholder="Discord (User#0000)" 
                  value={formData.discord}
                  onChange={(e) => setFormData({...formData, discord: e.target.value})}
                  className="border-2 border-foreground"
                />
                <Input 
                  placeholder="Canal do YouTube" 
                  value={formData.youtube}
                  onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                  className="border-2 border-foreground"
                />
                <Input 
                  placeholder="Instagram" 
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  className="border-2 border-foreground"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t-2 border-foreground p-4 bg-muted/20">
            <Button type="submit" disabled={loading} className="w-full btn-block bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
