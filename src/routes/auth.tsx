import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { LoginForm, RegisterForm } from '../components/AuthForms';
import { Button } from '../components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/use-auth';
import { useEffect } from 'react';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate({ to: '/' });
    }
  }, [user, navigate]);

  return (
    <div className="container max-w-md py-12">
      <div className="mb-8 text-center">
        <h1 className="font-pixel text-2xl uppercase">Área do Minerador</h1>
        <p className="text-muted-foreground mt-2">Participe da maior comunidade de addons</p>
      </div>

      {isLogin ? (
        <LoginForm onSuccess={() => navigate({ to: '/' })} />
      ) : (
        <RegisterForm onSuccess={() => navigate({ to: '/' })} />
      )}

      <div className="mt-6 text-center">
        <Button 
          variant="link" 
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary font-bold"
        >
          {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
        </Button>
      </div>
    </div>
  );
}
