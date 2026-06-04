import React, { useState } from 'react';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { isUsernameAvailable, checkCreationLimit } from '../lib/firebase-services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

export const AuthForms: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Captura resultado de redirect (caso o popup tenha falhado)
  React.useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await finalizeLogin(result.user);
      }
    }).catch(console.error);
  }, []);

  const finalizeLogin = async (user: any) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Cria novo perfil
        await setDoc(userRef, {
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
        toast.success('Conta criada! Bem-vindo ao NCMINE.');
      } else {
        toast.success(`Bem-vindo de volta, ${userSnap.data().username || username}!`);
      }
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error('Escolha um nome de usuário primeiro.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verifica se nome está disponível
      const available = await isUsernameAvailable(trimmedUsername);
      if (!available) {
        toast.error('Este nome de usuário já está em uso. Escolha outro.');
        setLoading(false);
        return;
      }

      // 2. Verifica limite de criação (anti-spam)
      const canCreate = await checkCreationLimit('global_limit');
      if (!canCreate) {
        toast.error('Aguarde 1 minuto antes de criar outra conta.');
        setLoading(false);
        return;
      }

      // 3. Tenta login com Google (popup)
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await finalizeLogin(result.user);
      } catch (popupError: any) {
        // Se o popup foi bloqueado, tenta redirect
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          console.log('Popup bloqueado, usando redirect...');
          await signInWithRedirect(auth, googleProvider);
          // O redirect vai recarregar a página, então não chamamos onSuccess aqui
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      let errorMessage = 'Erro na autenticação. ';
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage += 'Domínio não autorizado. Adicione este domínio no Firebase Console: Authentication → Settings → Authorized domains.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage += 'Falha de rede. Verifique sua conexão.';
      } else {
        errorMessage += error.message;
      }
      
      toast.error(errorMessage);
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
          <Label htmlFor="username">Nome de Usuário (seu nick no Minecraft)</Label>
          <Input 
            id="username" 
            placeholder="Ex: MineradorPro" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-2 border-foreground"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGoogleAuth} 
          disabled={loading || !username.trim()} 
          className="w-full btn-block"
        >
          {loading ? 'Processando...' : 'Entrar com Google'}
        </Button>
      </CardFooter>
    </Card>
  );
};