import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

export const LoginForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Bem-vindo de volta!');
      onSuccess?.();
    } catch (error: any) {
      toast.error('Erro ao entrar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-foreground shadow-[4px_4px_0_0_var(--ink)]">
      <CardHeader>
        <CardTitle className="font-pixel text-lg">LOGIN</CardTitle>
        <CardDescription>Entre para salvar seus favoritos</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 border-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-2 border-foreground"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full btn-block bg-primary text-primary-foreground">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

import { checkCreationLimit } from '../lib/firebase-services';

export const RegisterForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaQuestion] = useState(() => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    return { q: `${a} + ${b} = ?`, a: a + b };
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseInt(captcha) !== captchaQuestion.a) {
      toast.error('Creeper detectado! CAPTCHA incorreto.');
      return;
    }

    setLoading(true);
    try {
      // 2. IP-based Rate Limiting (Simple check)
      const canCreate = await checkCreationLimit('global_limit'); // Use a generic key
      if (!canCreate) {
        toast.error('Muitas contas criadas recentemente. Tente novamente mais tarde.');
        setLoading(false);
        return;
      }

      // 3. User Creation
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      // 4. Firestore Profile Creation
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        username,
        email,
        bio: 'Novo minerador no NCMINE!',
        points: 10,
        rank: 'Iniciante',
        createdAt: serverTimestamp(),
        favorites: [],
        downloadsCount: 0,
        downloadedAddons: [],
      });

      // 5. Track attempt in system_limits (rate limiting)
      await setDoc(doc(db, 'system_limits', 'global_limit'), { 
        lastCreation: serverTimestamp() 
      }, { merge: true });

      toast.success('Conta criada! Você ganhou 10 pontos.');
      onSuccess?.();
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Erro ao criar conta.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Este e-mail já está em uso.';
      if (error.code === 'auth/weak-password') errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-foreground shadow-[4px_4px_0_0_var(--ink)]">
      <CardHeader>
        <CardTitle className="font-pixel text-lg">CADASTRO</CardTitle>
        <CardDescription>Crie sua conta e ganhe pontos</CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-username">Nome de Usuário</Label>
            <Input 
              id="reg-username" 
              placeholder="Nick no Minecraft" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border-2 border-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input 
              id="reg-email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 border-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Senha</Label>
            <Input 
              id="reg-password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-2 border-foreground"
            />
          </div>
          <div className="space-y-2 border-t-2 border-dashed border-foreground/20 pt-4">
            <Label htmlFor="captcha">Prove que não é um Creeper: {captchaQuestion.q}</Label>
            <Input 
              id="captcha" 
              placeholder="Resultado" 
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              required
              className="border-2 border-foreground"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full btn-block bg-primary text-primary-foreground">
            {loading ? 'Criando...' : 'Criar Conta'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
