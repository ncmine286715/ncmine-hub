import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ArrowLeft, Scale, Shield, FileText, AlertTriangle, Mail } from 'lucide-react';

export const Route = createFileRoute('/legal')({
  component: LegalPage,
});

function LegalPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen pb-20 text-foreground">
      
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-4">
          <button onClick={() => navigate({ to: '/' })} className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Voltar
          </button>
          <h1 className="font-pixel text-sm uppercase">TERMOS LEGAIS</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-12">
        {/* Aviso crítico sobre direitos autorais */}
        <div className="bg-red-50 border-4 border-red-300 p-6 text-red-800 text-sm rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="font-pixel text-base uppercase">Aviso de Conteúdo de Terceiros</h2>
          </div>
          <p className="leading-relaxed">
            O <strong>NCMINE HUB</strong> é uma plataforma de agregação que <strong>não hospeda</strong> arquivos de addons.
            Todo o conteúdo é fornecido por links externos de terceiros (como MediaFire, Google Drive, sites oficiais de criadores).
            <br /><br />
            <strong>Não possuímos direitos autorais sobre os addons listados.</strong> Se você é o proprietário de um conteúdo e deseja que ele seja removido ou corrigido, entre em contato imediatamente através do e-mail abaixo.
          </p>
        </div>

        <section className="card-block p-6">
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-primary">
            <Shield className="h-5 w-5" /> POLÍTICA DE PRIVACIDADE (Firebase/Google)
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80 mb-4">
            Utilizamos Firebase Authentication e Firestore para personalizar sua experiência. Ao fazer login via Google ou e-mail, você autoriza o acesso a:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Nome de exibição, e-mail e foto de perfil (Google).</li>
            <li>Seu endereço de IP e dados de uso anônimos para melhorias.</li>
          </ul>
          <p className="text-sm mt-4">
            Seus dados são armazenados nos servidores do Google Cloud (Firebase) em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. Você pode solicitar exclusão da sua conta a qualquer momento enviando e-mail para <strong>contato@ncminehub.com</strong>.
          </p>
        </section>

        <section className="card-block p-6 border-l-4 border-l-primary">
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-primary">
            <FileText className="h-5 w-5" /> RESPONSABILIDADE SOBRE ADDONS
          </h2>
          <div className="space-y-3 text-sm">
            <p><strong>1. Conteúdo Agregado:</strong> O NCMINE HUB apenas exibe informações e links de download fornecidos por usuários ou fontes públicas. <span className="bg-yellow-100 px-1">Não hospedamos nenhum arquivo .mcaddon, .mcworld, .zip ou similar.</span></p>
            <p><strong>2. Direitos Autorais:</strong> Todo addon listado é de propriedade de seu respectivo criador. Se você encontrar um addon que viola seus direitos autorais, entre em contato para remoção imediata.</p>
            <p><strong>3. Remoção Voluntária Antes de Qualquer Processo:</strong> Se você é o criador original de um addon listado aqui e não deseja que ele seja divulgado nesta plataforma, nós o removemos <strong>imediatamente e sem burocracia</strong> assim que você nos avisar — não é necessário abrir um processo formal, notificação DMCA registrada ou comprovação extensa de autoria antes da remoção. Um e-mail simples identificando o addon já é suficiente para a remoção acontecer em até 48 horas úteis, a nosso critério e de boa-fé, antes de qualquer disputa formal.</p>
            <p><strong>4. Remoção DMCA:</strong> Para notificações formais de remoção com comprovante de autoria, envie para: <strong>ncmine75@gmail.com</strong>.</p>
            <p><strong>5. Isenção de Garantia:</strong> Os addons são fornecidos "como estão". Não nos responsabilizamos por danos causados por uso de addons de terceiros.</p>
          </div>
        </section>

        <section className="card-block p-6">
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-primary">
            <Scale className="h-5 w-5" /> CONDUTA DO USUÁRIO
          </h2>
          <p className="text-sm leading-relaxed">Ao comentar, avaliar ou enviar links de addons, você concorda que:</p>
          <ul className="list-decimal list-inside text-sm space-y-2 mt-2">
            <li>Não publicará conteúdo ofensivo, discriminatório ou ilegal.</li>
            <li>Não compartilhará links de malware, phishing ou conteúdo pirata (exceto addons gratuitos autorizados).</li>
            <li>Respeitará os direitos de propriedade intelectual.</li>
          </ul>
          <p className="text-sm mt-4">Violações resultarão em banimento permanente da plataforma e, em casos graves, denúncia às autoridades.</p>
        </section>

        <section className="card-block p-6 border-l-4 border-l-red-500 bg-red-50">
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-red-600">
            <Mail className="h-5 w-5" /> CONTATO PARA REMOÇÃO DE CONTEÚDO
          </h2>
          <p className="text-sm">Se você é um criador de addon e deseja remover seu trabalho da nossa plataforma ou corrigir créditos, envie um e-mail para:</p>
          <p className="font-bold text-md mt-2">📧 ncmine75@gmail.com</p>
          <p className="text-xs text-muted-foreground mt-2">Inclua no assunto: "Remoção - [Nome do Addon]". Não é necessário anexar prova de autoria nem abrir processo formal — a remoção é feita de boa-fé assim que identificamos o addon, normalmente em até 48 horas úteis. Prova de autoria (link do marketplace original, publicação oficial, etc.) é bem-vinda mas opcional.</p>
        </section>

        <section className="card-block p-6">
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-primary">
            <Shield className="h-5 w-5" /> SOBRE O SITE
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Este hub é mantido por <strong>@ncmine</strong>. Os addons listados pertencem aos seus respectivos criadores originais — o NCMINE HUB atua apenas como curadoria e ponto de acesso aos links de download.
          </p>
        </section>

        <div className="text-center text-[10px] text-muted-foreground border-t pt-6">
          Última atualização: {new Date().toLocaleDateString('pt-BR')} | NCMINE HUB - Todos os direitos reservados aos respectivos criadores.
        </div>
      </main>
    </div>
  );
}
