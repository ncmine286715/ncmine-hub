import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AuthForms } from '../components/AuthForms';
import { useAuth } from '../hooks/use-auth';
import { useEffect } from 'react';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
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
        <h1 className="font-pixel text-2xl uppercase">ÁREA DO MINERADOR</h1>
        <p className="text-muted-foreground mt-2">Participe da comunidade NCMINE</p>
      </div>

      <AuthForms onSuccess={() => navigate({ to: '/' })} />
    </div>
  );
}
