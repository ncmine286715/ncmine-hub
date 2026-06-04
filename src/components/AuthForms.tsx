import React, { useState } from 'react';
import { 
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, sendEmailVerification, updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { isUsernameAvailable, checkCreationLimit, createUserProfile, getUserProfile } from '../lib/firebase-services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Mail, Lock, User, Github, AlertCircle } from 'lucide-react';

export const AuthForms: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  
  // Campos comuns
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Captura redirect do Google
  React.useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await handleGoogleFinalize(result.user);
      }
    }).catch(console.error);
  }, []);

  const handleGoogleFinalize = async (user: any) => {
    try {
      const profile = await getUserProfile(user.uid);
      if (!profile) {
        // Se não tem perfil, precisa de username - redireciona para formulário extra
        // Por simplicidade, vamos pedir username no popup antes? Mas no fluxo de redirect não dá.
        // Vamos criar um perfil temporário com email como username, e depois editar.
        const tempUsername = user.email?.split('@')[0] || `user_${user.uid.slice(0,6)}`;
        await createUserProfile(user, tempUsername);
        toast.success('Conta criada! Você pode editar seu nome no perfil.');
      } else {
        toast.success(`Bem-vindo de volta, ${profile.username}`);
      }
      onSuccess?.();
    } catch (err) any {
      toast.error('Erro ao finalizar login: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN COM EMAIL/SENHA
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha email e senha');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        toast.warning('Verifique seu email antes de entrar. Enviamos um link de verificação.');
        await sendEmailVerification(user);
        setLoading(false);
        return;
      }
      const profile = await getUserProfile(user.uid);
      if (!profile) {
        // Caso raro: cria perfil
        const usernameFallback = user.displayName || user.email?.split('@')[0] || 'User';
        await createUserProfile(user, usernameFallback);
      }
      toast.success('Login realizado!');
      onSuccess?.();
    } catch (error: any) {
      let msg = 'Erro no login. ';
      if (error.code === 'auth/user-not-found') msg += 'Usuário não encontrado.';
      else if (error.code === 'auth/wrong-password') msg += 'Senha incorreta.';
      else if (error.code === 'auth/invalid-email') msg += 'Email inválido.';
      else if (error.code === 'auth/too-many-requests') msg += 'Muitas tentativas. Tente mais tarde.';
      else msg += error.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // REGISTRO COM EMAIL/SENHA
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Senhas não conferem');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const available = await isUsernameAvailable(username);
      if (!available) {
        toast.error('Nome de usuário já em uso.');
        setLoading(false);
        return;
      }
      const canCreate = await checkCreationLimit();
      if (!canCreate) {
        toast.error('Aguarde 1 minuto para criar outra conta.');
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Atualizar displayName no Auth
      await updateProfile(user, { displayName: username });
      // Criar perfil no Firestore
      await createUserProfile(user, username);
      // Enviar verificação de email
      await sendEmailVerification(user);
      toast.success('Conta criada! Enviamos um link de verificação para seu email. Verifique e faça login.');
      // Não loga automaticamente, pede para verificar email
      await auth.signOut();
      setActiveTab('login');
    } catch (error: any) {
      let msg = 'Erro no registro: ';
      if (error.code === 'auth/email-already-in-use') msg += 'Email já cadastrado.';
      else if (error.code === 'auth/invalid-email') msg += 'Email inválido.';
      else if (error.code === 'auth/weak-password') msg += 'Senha muito fraca. Use 6+ caracteres.';
      else msg += error.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // REDEFINIÇÃO DE SENHA
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Digite seu email');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Email de redefinição enviado! Verifique sua caixa de entrada.');
      setActiveTab('login');
    } catch (error: any) {
      let msg = 'Erro: ';
      if (error.code === 'auth/user-not-found') msg += 'Usuário não encontrado.';
      else msg += error.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN COM GOOGLE (com username)
  const handleGoogleLogin = async () => {
    if (!username && activeTab === 'register') {
      toast.error('Escolha um nome de usuário antes de continuar.');
      return;
    }
    setLoading(true);
    try {
      if (activeTab === 'register') {
        const available = await isUsernameAvailable(username);
        if (!available) {
          toast.error('Nome de usuário já em uso.');
          setLoading(false);
          return;
        }
        const canCreate = await checkCreationLimit();
        if (!canCreate) {
          toast.error('Aguarde 1 minuto para criar outra conta.');
          setLoading(false);
          return;
        }
        // Armazena username temporariamente para uso após login
        sessionStorage.setItem('pendingUsername', username);
      }
      // Tenta popup
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await handleGoogleFinalize(result.user);
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Erro no Google: ' + (error.message || 'Tente novamente'));
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-foreground shadow-[4px_4px_0_0_var(--ink)]">
      <CardHeader>
        <CardTitle className="font-pixel text-lg">ÁREA DO MINERADOR</CardTitle>
        <CardDescription>Entre, registre-se ou recupere sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
            <TabsTrigger value="reset">Esqueci a senha</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="login-password">Senha</Label>
                <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full">Entrar com Email</Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou</span></div>
            </div>
            <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" className="w-full flex gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Entrar com Google
            </Button>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="reg-username">Nome de usuário (seu nick)</Label>
                <Input id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="reg-password">Senha (mínimo 6 caracteres)</Label>
                <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="reg-confirm">Confirmar senha</Label>
                <Input id="reg-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full">Criar conta</Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou cadastre-se com</span></div>
            </div>
            <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" className="w-full flex gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24">...</svg>
              Google
            </Button>
          </TabsContent>

          <TabsContent value="reset">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Seu email cadastrado</Label>
                <Input id="reset-email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full">Enviar link de redefinição</Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground">
        <AlertCircle className="h-3 w-3 inline mr-1" /> Ao criar conta, você aceita nossos termos.
      </CardFooter>
    </Card>
  );
};