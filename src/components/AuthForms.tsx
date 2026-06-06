import React, { useState } from 'react';
import {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUserProfile, getUserProfile } from '../lib/firebase-services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Mail, Sparkles } from 'lucide-react';

export const AuthForms: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'menu' | 'login' | 'register' | 'reset'>('menu');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) await finalize(result.user);
    }).catch(console.error);
  }, []);

  const finalize = async (user: any) => {
    try {
      const profile: any = await getUserProfile(user.uid);
      if (!profile) {
        const tempUsername =
          user.displayName?.replace(/\s+/g, '_') ||
          user.email?.split('@')[0] ||
          `user_${user.uid.slice(0, 6)}`;
        await createUserProfile(user, tempUsername);
        toast.success(`Bem-vindo, ${tempUsername}! 🎉`);
      } else {
        toast.success(`Bem-vindo de volta, ${profile.username ?? 'minerador'}!`);
      }
      onSuccess?.();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await finalize(result.user);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (e2: any) {
          toast.error('Erro Google: ' + e2.message);
          setLoading(false);
        }
      } else {
        toast.error('Erro Google: ' + (err.message || 'Tente novamente'));
        setLoading(false);
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Preencha email e senha');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await finalize(cred.user);
    } catch (err: any) {
      toast.error('Erro login: ' + (err.code || err.message));
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Preencha email e senha');
    if (password.length < 6) return toast.error('Senha mín. 6 caracteres');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await finalize(cred.user);
    } catch (err: any) {
      toast.error('Erro cadastro: ' + (err.code || err.message));
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Digite seu email');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Link enviado! Veja seu email.');
      setMode('menu');
    } catch (err: any) {
      toast.error('Erro: ' + (err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-block bg-background p-5 sm:p-6">
      <div className="mb-4 text-center">
        <div className="inline-block bg-primary px-3 py-1 font-pixel text-[9px] text-primary-foreground border-2 border-foreground shadow-[3px_3px_0_0_var(--ink)] mb-3">
          ENTRAR EM 1 CLIQUE
        </div>
        <h2 className="text-xl font-black uppercase">Junte-se aos mineradores</h2>
        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" /> Ganhe XP, favoritos e comentários
        </p>
      </div>

      {/* GOOGLE — botão principal sempre visível */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="btn-block w-full bg-white text-foreground border-2 border-foreground shadow-[4px_4px_0_0_var(--ink)] hover:bg-muted active:translate-y-0.5 active:shadow-none transition-all !py-3 mb-3 flex items-center justify-center gap-3 text-sm font-bold"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {loading ? 'Conectando...' : 'Continuar com Google'}
      </button>

      {mode === 'menu' && (
        <button
          onClick={() => setMode('login')}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline py-2"
        >
          <Mail className="inline h-3 w-3 mr-1" /> Usar email e senha
        </button>
      )}

      {mode !== 'menu' && (
        <div className="border-t-2 border-dashed border-foreground/30 pt-4 mt-2 space-y-3">
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase font-bold">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold">Senha</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full btn-block bg-primary text-primary-foreground">Entrar</Button>
              <div className="flex justify-between text-[10px]">
                <button type="button" onClick={() => setMode('register')} className="text-primary hover:underline">Criar conta</button>
                <button type="button" onClick={() => setMode('reset')} className="text-muted-foreground hover:underline">Esqueci a senha</button>
              </div>
            </form>
          )}
          {mode === 'register' && (
            <form onSubmit={handleEmailRegister} className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase font-bold">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold">Senha (mín. 6)</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full btn-block bg-primary text-primary-foreground">Criar conta</Button>
              <button type="button" onClick={() => setMode('login')} className="text-[10px] text-primary hover:underline w-full text-center">Já tenho conta</button>
            </form>
          )}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase font-bold">Seu email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full btn-block bg-primary text-primary-foreground">Enviar link</Button>
              <button type="button" onClick={() => setMode('login')} className="text-[10px] text-primary hover:underline w-full text-center">Voltar</button>
            </form>
          )}
        </div>
      )}

      <p className="mt-4 text-center text-[9px] text-muted-foreground">
        Ao continuar, você concorda com nossos termos.
      </p>
    </div>
  );
};