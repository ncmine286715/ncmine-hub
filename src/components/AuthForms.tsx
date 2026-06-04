import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { isUsernameAvailable, checkCreationLimit } from '../lib/firebase-services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { soundManager } from '../lib/sounds';

export const AuthForms: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    if (!username) {
      toast.error('Escolha um nome de usuário primeiro.');
      return;
    }

    setLoading(true);
    try {
      // 1. Check Username
      const available = await isUsernameAvailable(username);
      if (!available) {
        toast.error('Este nome já está em uso.');
        setLoading(false);
        return;
      }

      // 2. Check Rate Limit
      const canCreate = await checkCreationLimit('global_limit');
      if (!canCreate) {
        toast.error('Muitas contas criadas recentemente.');
        setLoading(false);
        return;
      }

      // 3. Google Sign In
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // 4. Create Profile
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (!profileDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          username,
          email: user.email,
          bio: 'Novo minerador no NCMINE!',
          points: 10,
          rank: 'Iniciante',
          createdAt: serverTimestamp(),
          favorites: [],
          downloadsCount: 0,
          downloadedAddons: [],
        });
        
        await setDoc(doc(db, 'system_limits', 'global_limit'), { 
          lastCreation: serverTimestamp() 
        }, { merge: true });
        
        soundManager.play('xp');
        toast.success('Conta criada! Bem-vindo.');
      } else {
        toast.success('Bem-vindo de volta!');
      }

      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      toast.error('Erro na autenticação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-foreground shadow-[4px_4px_0_0_var(--ink)]">
      <CardHeader>
        <CardTitle className="font-pixel text-lg">ENTRAR / CADASTRO</CardTitle>
        <CardDescription>Escolha um nome e entre com Google</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Nome de Usuário</Label>
          <Input 
            id="username" 
            placeholder="Seu nick no Minecraft" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-2 border-foreground"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGoogleAuth} disabled={loading || !username} className="w-full btn-block bg-primary text-primary-foreground font-black">
          {loading ? 'Processando...' : 'Entrar com Google'}
        </Button>
      </CardFooter>
    </Card>
  );
};
