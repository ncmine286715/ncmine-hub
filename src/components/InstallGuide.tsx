import { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, ChevronRight, ChevronDown, CheckCircle, AlertTriangle, ExternalLink, Copy, Check, X } from 'lucide-react';
import { detectInAppBrowser, inAppLabel, type InAppKind } from '@/lib/inAppBrowser';

type Props = {
  addonTitle: string;
  onClose?: () => void;
};

type Platform = 'android' | 'ios' | 'windows' | null;

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Windows/i.test(ua)) return 'windows';
  return 'android';
}

function detectMinecraftVersion(): string {
  return '1.21+';
}

export function InstallGuide({ addonTitle, onClose }: Props) {
  const [platform, setPlatform] = useState<Platform>(null);
  const [inApp, setInApp] = useState<InAppKind>(null);
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInApp(detectInAppBrowser());
  }, []);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const steps = getSteps(platform, inApp);

  return (
    <div className="border-2 border-foreground bg-background shadow-[4px_4px_0_0_var(--ink)]">
      {/* Header */}
      <div className="bg-foreground text-background p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          <span className="font-pixel text-[9px] uppercase">Guia de Instalacao</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-background/20">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* In-App Browser Warning */}
      {inApp && (
        <div className="bg-yellow-500/10 border-b-2 border-yellow-500 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-yellow-800">
                Voce esta no navegador do {inAppLabel(inApp)}
              </p>
              <p className="text-[10px] text-yellow-700 mt-0.5">
                Para instalar addons, voce precisa abrir no navegador real do celular. Funcionalidades como download e compartilhamento nao funcionam dentro de apps.
              </p>
              <div className="flex gap-2 mt-2">
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-block bg-yellow-600 text-white !py-1.5 text-[10px] flex-1"
                >
                  <ExternalLink className="h-3 w-3" /> Abrir no navegador
                </a>
                <button onClick={copyUrl} className="btn-block !py-1.5 text-[10px] px-3">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-[9px] text-yellow-700 mt-2 font-bold">
                {inApp === 'instagram' && 'No Instagram: toque nos 3 pontinhos (⋯) e "Abrir no navegador"'}
                {inApp === 'tiktok' && 'No TikTok: toque nos 3 pontinhos (⋯) e "Abrir no navegador"'}
                {inApp === 'facebook' && 'No Facebook: toque nos 3 pontinhos (⋯) e "Abrir no Chrome/Safari"'}
                {inApp === 'snapchat' && 'No Snapchat: segure o link e "Abrir no navegador"'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Detection */}
      <div className="p-3 border-b border-foreground/10">
        <div className="flex items-center gap-2 mb-2">
          {platform === 'android' && <Smartphone className="h-4 w-4 text-green-600" />}
          {platform === 'ios' && <Smartphone className="h-4 w-4 text-blue-500" />}
          {platform === 'windows' && <Monitor className="h-4 w-4 text-blue-600" />}
          <span className="text-[10px] font-bold uppercase">
            Detectado: {platform === 'android' ? 'Android' : platform === 'ios' ? 'iPhone/iPad' : 'Windows 10/11'}
          </span>
          <span className="text-[9px] text-muted-foreground ml-auto">
            Minecraft {detectMinecraftVersion()}
          </span>
        </div>
        <div className="flex gap-1">
          <PlatformBtn label="Android" active={platform === 'android'} onClick={() => setPlatform('android')} />
          <PlatformBtn label="iOS" active={platform === 'ios'} onClick={() => setPlatform('ios')} />
          <PlatformBtn label="Windows" active={platform === 'windows'} onClick={() => setPlatform('windows')} />
        </div>
      </div>

      {/* Steps */}
      <div className="p-3 space-y-2">
        <p className="font-pixel text-[9px] uppercase text-muted-foreground mb-2">
          Passo a passo — {addonTitle}
        </p>
        {steps.map((s, i) => (
          <StepItem
            key={i}
            index={i + 1}
            title={s.title}
            description={s.description}
            tip={s.tip}
            active={step === i}
            completed={step > i}
            onClick={() => setStep(i)}
          />
        ))}
      </div>

      {/* Version Compatibility */}
      <div className="p-3 border-t-2 border-foreground/10 bg-muted/20">
        <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Compatibilidade</p>
        <div className="flex flex-wrap gap-1">
          <span className="text-[8px] px-2 py-0.5 border border-green-600 text-green-700 bg-green-50">1.21+</span>
          <span className="text-[8px] px-2 py-0.5 border border-green-600 text-green-700 bg-green-50">Bedrock</span>
          <span className="text-[8px] px-2 py-0.5 border border-foreground/30 text-muted-foreground">Android</span>
          <span className="text-[8px] px-2 py-0.5 border border-foreground/30 text-muted-foreground">iOS</span>
          <span className="text-[8px] px-2 py-0.5 border border-foreground/30 text-muted-foreground">Windows</span>
        </div>
      </div>
    </div>
  );
}

function PlatformBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-[9px] font-bold border-2 border-foreground transition-all ${
        active ? 'bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--ink)]' : 'hover:bg-muted/30'
      }`}
    >
      {label}
    </button>
  );
}

function StepItem({ index, title, description, tip, active, completed, onClick }: {
  index: number; title: string; description: string; tip?: string;
  active: boolean; completed: boolean; onClick: () => void;
}) {
  return (
    <div
      className={`border-2 transition-all cursor-pointer ${
        active ? 'border-primary bg-primary/5 shadow-[2px_2px_0_0_var(--ink)]' :
        completed ? 'border-green-500/50 bg-green-50/50' :
        'border-foreground/20 hover:border-foreground/40'
      }`}
      onClick={onClick}
    >
      <div className="p-2.5 flex items-start gap-2">
        <div className={`w-5 h-5 shrink-0 flex items-center justify-center border-2 text-[8px] font-bold ${
          completed ? 'border-green-600 bg-green-600 text-white' :
          active ? 'border-primary bg-primary text-primary-foreground' :
          'border-foreground/30 text-muted-foreground'
        }`}>
          {completed ? <CheckCircle className="h-3 w-3" /> : index}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold ${active ? 'text-primary' : ''}`}>{title}</p>
            {active ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
          {active && (
            <div className="mt-1.5">
              <p className="text-[10px] text-foreground/80 leading-relaxed">{description}</p>
              {tip && (
                <p className="mt-1.5 text-[9px] text-primary font-bold bg-primary/5 px-2 py-1 border-l-2 border-primary">
                  💡 {tip}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Step {
  title: string;
  description: string;
  tip?: string;
}

function getSteps(platform: Platform, inApp: InAppKind): Step[] {
  if (inApp) {
    const browserName = platform === 'ios' ? 'Safari' : 'Chrome';
    return [
      {
        title: `Sair do ${inAppLabel(inApp)}`,
        description: `Primeiro, abra este link no ${browserName}. Dentro do ${inAppLabel(inApp)} os downloads nao funcionam corretamente.`,
        tip: 'Use o botao "Abrir no navegador" acima ou copie o link.',
      },
      {
        title: 'Baixar o arquivo do addon',
        description: 'Clique no botao de download. O arquivo vai para o Terabox. Siga as instrucoes do Terabox para baixar.',
        tip: 'O arquivo tera extensao .mcaddon ou .mcpack',
      },
      {
        title: 'Abrir com Minecraft',
        description: platform === 'ios'
          ? 'Va em Arquivos, encontre o download e toque nele. Selecione "Abrir com Minecraft".'
          : 'Toque no arquivo baixado na barra de notificacoes. Ele abrira automaticamente no Minecraft.',
        tip: platform === 'ios' ? 'Se nao aparecer Minecraft, toque em "Mais" e procure.' : 'Se nao abrir, va em Downloads e toque no arquivo.',
      },
      {
        title: 'Ativar no mundo',
        description: 'No Minecraft, va em Jogar > edite o mundo > Packs de Comportamento ou Recursos > ative o addon importado.',
        tip: 'Alguns addons precisam de "Experimentos" ativados nas configuracoes do mundo.',
      },
    ];
  }

  if (platform === 'android') {
    return [
      {
        title: 'Baixar o arquivo',
        description: 'Toque em "Baixar" e siga as instrucoes do Terabox. O arquivo sera salvo na pasta Downloads do seu celular.',
        tip: 'Procure por arquivos .mcaddon ou .mcpack',
      },
      {
        title: 'Abrir o arquivo',
        description: 'Abra a notificacao de download OU va em Arquivos > Downloads e toque no arquivo. O Android vai perguntar com qual app abrir.',
        tip: 'Escolha "Minecraft" na lista de apps. Se nao aparecer, instale um gerenciador de arquivos.',
      },
      {
        title: 'Importacao automatica',
        description: 'O Minecraft vai abrir e importar o addon automaticamente. Voce vera a mensagem "Importacao concluida com sucesso!".',
        tip: 'Se der erro, verifique se seu Minecraft esta na versao 1.21 ou superior.',
      },
      {
        title: 'Ativar no mundo',
        description: 'Va em Jogar > Editar mundo (icone de lapis) > Packs de Comportamento/Recursos > Ative o addon.',
        tip: 'Ative "Experimentos" se o addon exigir (geralmente addons com scripts).',
      },
    ];
  }

  if (platform === 'ios') {
    return [
      {
        title: 'Baixar o arquivo',
        description: 'Toque em "Baixar" e siga as instrucoes do Terabox. O arquivo sera salvo no app Arquivos.',
        tip: 'No Safari, o download aparece no canto superior direito (seta para baixo).',
      },
      {
        title: 'Localizar nos Arquivos',
        description: 'Abra o app Arquivos > pasta Downloads ou "No Meu iPhone" > encontre o arquivo .mcaddon/.mcpack.',
        tip: 'Se nao encontrar, procure na aba "Recentes" do Arquivos.',
      },
      {
        title: 'Abrir com Minecraft',
        description: 'Toque no arquivo > "Compartilhar" (quadrado com seta) > "Abrir com Minecraft" OU toque direto e selecione Minecraft.',
        tip: 'Se Minecraft nao aparecer, toque "Mais" e procure na lista completa.',
      },
      {
        title: 'Ativar no mundo',
        description: 'No Minecraft: Jogar > Editar mundo > Packs de Comportamento/Recursos > Ative o addon importado.',
        tip: 'Ative "Experimentos" se necessario. Reinicie o mundo se o addon nao carregar.',
      },
    ];
  }

  // Windows
  return [
    {
      title: 'Baixar o arquivo',
      description: 'Clique em "Baixar" e siga as instrucoes do Terabox. O arquivo sera salvo na pasta Downloads.',
      tip: 'O arquivo tera extensao .mcaddon ou .mcpack',
    },
    {
      title: 'Duplo clique no arquivo',
      description: 'Abra a pasta Downloads e de dois cliques no arquivo baixado. O Windows vai abrir automaticamente o Minecraft.',
      tip: 'Se nao abrir, clique com botao direito > "Abrir com" > Minecraft.',
    },
    {
      title: 'Aguardar importacao',
      description: 'O Minecraft vai abrir e importar o pack automaticamente. A mensagem "Importacao concluida!" aparecera.',
      tip: 'Se travar, feche o Minecraft e abra o arquivo novamente.',
    },
    {
      title: 'Ativar no mundo',
      description: 'Em Jogar > Editar mundo > Packs de Comportamento/Recursos > Ative o addon. Crie um mundo novo se preferir.',
      tip: 'No Windows 10/11, certifique-se de ter Minecraft Bedrock (da Microsoft Store), nao Java Edition.',
    },
  ];
}
