import { useState } from "react";
import { Home, Grid3X3, Bell, Info, Shield, Package, Image, Layers, Sparkles, Heart, Users, User } from "lucide-react";
import { MinecraftBlockIcon, DiscordIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL } from "@/lib/links";

type Tab = "home" | "favorites" | "community" | "profile" | "categorias" | "notificacoes" | "sobre";

type Props = {
  activeTab: string;
  onTabChange: (tab: any) => void;
  hasNewNotification?: boolean;
};

export function BottomNavigation({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-foreground bg-background/98 backdrop-blur-sm sm:hidden">
      <div className="grid h-16 grid-cols-4">
        <button
          type="button"
          onClick={() => onTabChange("home")}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeTab === "home" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className={`h-5 w-5 ${activeTab === "home" ? "fill-primary" : ""}`} />
          <span className="font-pixel text-[8px]">INICIO</span>
        </button>
        
        <button
          type="button"
          onClick={() => onTabChange("favorites")}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeTab === "favorites" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className={`h-5 w-5 ${activeTab === "favorites" ? "fill-primary" : ""}`} />
          <span className="font-pixel text-[8px]">FAVORITOS</span>
        </button>
        
        <button
          type="button"
          onClick={() => onTabChange("community")}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeTab === "community" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className={`h-5 w-5 ${activeTab === "community" ? "fill-primary/20" : ""}`} />
          <span className="font-pixel text-[8px]">COMUNIDADE</span>
        </button>
        
        <button
          type="button"
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeTab === "profile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className={`h-5 w-5 ${activeTab === "profile" ? "fill-primary/20" : ""}`} />
          <span className="font-pixel text-[8px]">PERFIL</span>
        </button>
      </div>
    </nav>
  );
}

type CategoryItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
};

const CATEGORIES: CategoryItem[] = [
  { id: "Todos", label: "Todos", icon: <Grid3X3 className="h-6 w-6" />, color: "bg-foreground text-background" },
  { id: "Addon", label: "Addons", icon: <Package className="h-6 w-6" />, color: "bg-primary text-primary-foreground" },
  { id: "Texture Pack", label: "Texturas", icon: <Image className="h-6 w-6" />, color: "bg-[#4CAF50] text-white" },
  { id: "Holoprint", label: "Holoprint", icon: <Layers className="h-6 w-6" />, color: "bg-[#2196F3] text-white" },
  { id: "Addon Pack", label: "Packs", icon: <Sparkles className="h-6 w-6" />, color: "bg-[#9C27B0] text-white" },
];

type CategoriesPanelProps = {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onClose: () => void;
};

export function CategoriesPanel({ selectedCategory, onSelectCategory, onClose }: CategoriesPanelProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:hidden">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative w-full animate-mc-rise rounded-t-2xl border-t-2 border-foreground bg-background pb-20">
        <div className="mx-auto my-3 h-1 w-12 rounded-full bg-muted-foreground/30" />
        <div className="px-4 pb-4">
          <h3 className="mb-4 font-pixel text-xs">CATEGORIAS</h3>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id);
                  onClose();
                }}
                className={`flex items-center gap-3 border-2 border-foreground p-3 text-left transition-all ${
                  selectedCategory === cat.id 
                    ? `${cat.color} shadow-[4px_4px_0_0_var(--ink)]` 
                    : "bg-background hover:bg-muted"
                }`}
              >
                {cat.icon}
                <span className="text-sm font-bold">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type AboutPanelProps = {
  onClose: () => void;
};

export function AboutPanel({ onClose }: AboutPanelProps) {
  const [tab, setTab] = useState<"sobre" | "privacidade">("sobre");

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:hidden">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full flex-col animate-mc-rise rounded-t-2xl border-t-2 border-foreground bg-background pb-20">
        <div className="mx-auto my-3 h-1 w-12 rounded-full bg-muted-foreground/30" />
        
        <div className="flex gap-2 px-4">
          <button
            type="button"
            onClick={() => setTab("sobre")}
            className={`flex-1 border-2 border-foreground px-3 py-2 font-pixel text-[10px] ${
              tab === "sobre" ? "bg-primary text-primary-foreground" : "bg-background"
            }`}
          >
            SOBRE
          </button>
          <button
            type="button"
            onClick={() => setTab("privacidade")}
            className={`flex-1 border-2 border-foreground px-3 py-2 font-pixel text-[10px] ${
              tab === "privacidade" ? "bg-primary text-primary-foreground" : "bg-background"
            }`}
          >
            PRIVACIDADE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {tab === "sobre" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="border-2 border-foreground bg-primary p-2">
                  <MinecraftBlockIcon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-pixel text-sm">NCMINE HUB</h3>
                  <p className="text-xs text-muted-foreground">Addons de Minecraft Bedrock</p>
                </div>
              </div>
              
              <p className="text-sm leading-relaxed text-muted-foreground">
                Hub nao-oficial de addons de Minecraft Bedrock. Todos os creditos vao para os criadores originais listados em cada addon.
              </p>
              
              <p className="text-sm leading-relaxed text-muted-foreground">
                Este site foi criado para facilitar o acesso aos melhores addons da comunidade, reunindo em um so lugar mods curados, testados e prontos para download.
              </p>

              <div className="border-t-2 border-foreground pt-4">
                <p className="mb-2 text-xs font-bold uppercase">Redes Sociais</p>
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-block w-full bg-[#5865F2] text-white !py-3"
                >
                  <DiscordIcon className="h-5 w-5" />
                  Entrar no Discord
                </a>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Criado com carinho por @ncmine
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-pixel text-sm">POLITICA DE PRIVACIDADE</h3>
              
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <strong className="text-foreground">1. Coleta de Dados</strong><br />
                  Este site nao coleta dados pessoais dos usuarios. Nao utilizamos cookies de rastreamento ou ferramentas de analytics que identifiquem usuarios individuais.
                </p>
                
                <p>
                  <strong className="text-foreground">2. Notificacoes</strong><br />
                  Se voce optar por receber notificacoes de novos addons, essa preferencia e armazenada apenas localmente no seu dispositivo.
                </p>
                
                <p>
                  <strong className="text-foreground">3. Downloads</strong><br />
                  Os downloads sao redirecionados para servicos de terceiros (como TeraBox). Cada servico possui sua propria politica de privacidade.
                </p>
                
                <p>
                  <strong className="text-foreground">4. Links Externos</strong><br />
                  Este site contem links para redes sociais e outros servicos externos. Nao somos responsaveis pelas praticas de privacidade desses sites.
                </p>
                
                <p>
                  <strong className="text-foreground">5. Contato</strong><br />
                  Para questoes sobre privacidade, entre em contato pelo Discord.
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Ultima atualizacao: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type NotificationsPanelProps = {
  onClose: () => void;
  onEnableNotifications: () => void;
  notificationsEnabled: boolean;
};

export function NotificationsPanel({ onClose, onEnableNotifications, notificationsEnabled }: NotificationsPanelProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:hidden">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative w-full animate-mc-rise rounded-t-2xl border-t-2 border-foreground bg-background pb-20">
        <div className="mx-auto my-3 h-1 w-12 rounded-full bg-muted-foreground/30" />
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="border-2 border-foreground bg-primary p-2">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-pixel text-xs">ALERTAS DE ADDONS</h3>
              <p className="text-xs text-muted-foreground">Receba avisos de novos mods</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {notificationsEnabled ? (
              <div className="border-2 border-foreground bg-primary/10 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-bold text-primary">Notificacoes Ativadas</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Voce sera avisado quando novos addons forem adicionados ao hub.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Ative as notificacoes para ser o primeiro a saber quando novos addons apeloes chegarem no hub.
                </p>
                <button
                  type="button"
                  onClick={onEnableNotifications}
                  className="btn-block w-full bg-primary text-primary-foreground !py-3"
                >
                  <Bell className="h-5 w-5" />
                  Ativar Notificacoes
                </button>
              </>
            )}

            <div className="border-t-2 border-foreground pt-4">
              <p className="mb-2 text-xs font-bold uppercase">Nao perca nada</p>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-block w-full bg-[#5865F2] text-white !py-3"
              >
                <DiscordIcon className="h-5 w-5" />
                Discord (avisos mais rapidos)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
