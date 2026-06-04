import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ArrowLeft, Scale, Shield, FileText } from 'lucide-react';

export const Route = createFileRoute('/legal')({
  component: LegalPage,
});

function LegalPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen pb-20 text-foreground">
      <FloatingBackground />
      
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-4">
          <button onClick={() => navigate({ to: '/' })} className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Voltar
          </button>
          <h1 className="font-pixel text-sm uppercase">LEGAL</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-12">
        <div className="bg-red-50 border-4 border-red-200 p-6 text-red-800 text-sm">
          <h2 className="font-bold mb-2">⚠️ AVISO LEGAL IMPORTANTE</h2>
          <p>
            Este documento é um modelo informativo. Eu sou uma Inteligência Artificial, não um advogado. 
            Estas cláusulas servem como base, mas **você deve consultar um profissional jurídico** para garantir conformidade total com as leis do seu país e da plataforma onde o site está hospedado.
          </p>
        </div>

        <section className="card-block p-6">
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-primary">
            <Shield className="h-5 w-5" /> POLÍTICA DE PRIVACIDADE E DADOS (FIREBASE/GOOGLE)
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80 mb-4">
            Utilizamos o Firebase Authentication e o Firestore para fornecer uma experiência personalizada. Ao utilizar o login via Google, você autoriza o acesso às seguintes informações básicas: seu nome de exibição, e-mail e foto de perfil.
          </p>
          <ul className="list-disc list-inside text-sm text-foreground/80 space-y-2">
            <li><strong>Google API Services:</strong> O uso de informações recebidas das APIs do Google está em conformidade com a Política de Dados do Usuário dos Serviços de API do Google, incluindo os requisitos de "Uso Limitado".</li>
            <li><strong>Armazenamento de Dados:</strong> Seus dados são armazenados de forma segura nos servidores do Google Cloud (Firebase).</li>
          </ul>
        </section>

        <section className="card-block p-6 border-l-4 border-l-primary">
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-primary">
            <FileText className="h-5 w-5" /> POLÍTICA DE CONTEÚDO (ADDONS E MARKETPLACE)
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80 mb-4">
            O NCMINE HUB é uma plataforma de agregação. O conteúdo disponibilizado pode incluir:
          </p>
          <ul className="list-decimal list-inside text-sm text-foreground/80 space-y-2 mb-4">
            <li><strong>Addons de Terceiros:</strong> Conteúdos criados pela comunidade, disponibilizados conforme os termos de uso dos próprios criadores.</li>
            <li><strong>Conteúdo Marketplace:</strong> Alguns addons exibidos são derivados ou listagens de produtos vendidos no Minecraft Marketplace. <strong>Não possuímos direitos sobre o Marketplace oficial da Mojang</strong>; disponibilizamos apenas os links públicos e informações fornecidas pelos desenvolvedores ou distribuidores.</li>
            <li><strong>Créditos:</strong> Sempre buscamos manter os créditos originais. Se você for o detentor de direitos autorais de algum conteúdo e desejar sua remoção ou correção de créditos, entre em contato imediatamente.</li>
          </ul>
        </section>

        <section className="card-block p-6">
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-primary">
            <Scale className="h-5 w-5" /> CONDUTA DO USUÁRIO (COMUNIDADE)
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            A seção de comentários e comunidade deve ser um local respeitoso. É proibido:
          </p>
          <ul className="list-disc list-inside text-sm text-foreground/80 space-y-2 mt-2">
            <li>Publicar conteúdos ofensivos, preconceituosos ou de ódio.</li>
            <li>Tentar realizar spam ou ataques automatizados (bots) na plataforma.</li>
            <li>Divulgar links maliciosos ou phishing.</li>
          </ul>
          <p className="text-sm mt-4">
            Reservamo-nos o direito de banir usuários e remover conteúdos que violem estes princípios sem aviso prévio.
          </p>
        </section>

        <section className="card-block p-6 border-l-4 border-l-red-500">
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-red-500">
            <Scale className="h-5 w-5" /> DIREITOS AUTORAIS E DMCA
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            O NCMINE HUB respeita a propriedade intelectual. Se você é o criador de algum conteúdo e deseja que ele seja removido ou quer que adicionemos os devidos créditos, por favor, entre em contato. Responderemos a solicitações legítimas de remoção (DMCA) o mais rápido possível.
          </p>
        </section>
      </main>
    </div>
  );
}
