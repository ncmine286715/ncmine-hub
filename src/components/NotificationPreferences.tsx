import { useState, useEffect } from 'react';
import { Bell, BellOff, Package, MessageSquare, Users, Zap, Clock, Shield, X } from 'lucide-react';
import {
  getNotificationPrefs,
  saveNotificationPrefs,
  requestPushPermission,
  registerPushToken,
  savePushPrefsToFirestore,
  checkPushSupport,
  type NotificationPreferences as NotifPrefs,
} from '@/lib/push-notifications';
import { useAuth } from '@/hooks/use-auth';

type Props = {
  onClose: () => void;
};

export function NotificationPreferences({ onClose }: Props) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotifPrefs>(getNotificationPrefs());
  const [supported, setSupported] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkPushSupport().then(setSupported);
  }, []);

  const toggleEnabled = async () => {
    if (!prefs.enabled) {
      const granted = await requestPushPermission();
      if (!granted) return;

      if (user) {
        await registerPushToken(user.uid);
      }
    }

    const updated = { ...prefs, enabled: !prefs.enabled };
    setPrefs(updated);
    saveNotificationPrefs(updated);
    if (user) savePushPrefsToFirestore(user.uid, updated);
  };

  const toggleType = (type: keyof NotifPrefs['types']) => {
    const updated = { ...prefs, types: { ...prefs.types, [type]: !prefs.types[type] } };
    setPrefs(updated);
    saveNotificationPrefs(updated);
    if (user) savePushPrefsToFirestore(user.uid, updated);
  };

  const toggleSchedule = (time: keyof NotifPrefs['schedule']) => {
    const updated = { ...prefs, schedule: { ...prefs.schedule, [time]: !prefs.schedule[time] } };
    setPrefs(updated);
    saveNotificationPrefs(updated);
    if (user) savePushPrefsToFirestore(user.uid, updated);
  };

  const setFrequency = (freq: NotifPrefs['frequency']) => {
    const updated = { ...prefs, frequency: freq };
    setPrefs(updated);
    saveNotificationPrefs(updated);
    if (user) savePushPrefsToFirestore(user.uid, updated);
  };

  if (!supported) {
    return (
      <div className="p-6 text-center">
        <BellOff className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-bold">Navegador sem suporte</p>
        <p className="text-xs text-muted-foreground mt-1">
          Seu navegador nao suporta notificacoes push. Tente abrir no Chrome ou Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-[10px] uppercase flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Preferencias de Notificacao
        </h3>
        <button onClick={onClose} className="p-1.5 border-2 border-foreground hover:bg-primary/10 min-h-[36px] min-w-[36px] flex items-center justify-center">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Master Toggle */}
      <div
        className={`border-2 border-foreground p-3 flex items-center justify-between cursor-pointer transition-all ${prefs.enabled ? 'bg-primary/10 border-primary' : 'bg-muted/30'}`}
        onClick={toggleEnabled}
      >
        <div className="flex items-center gap-3">
          {prefs.enabled ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
          <div>
            <p className="text-xs font-bold uppercase">{prefs.enabled ? 'Notificacoes Ativas' : 'Notificacoes Desativadas'}</p>
            <p className="text-[10px] text-muted-foreground">
              {prefs.enabled ? 'Voce recebera alertas personalizados' : 'Toque para ativar'}
            </p>
          </div>
        </div>
        <div className={`w-10 h-5 rounded-full border-2 border-foreground relative transition-all ${prefs.enabled ? 'bg-primary' : 'bg-muted'}`}>
          <div className={`absolute top-0.5 w-3.5 h-3.5 bg-background border border-foreground transition-all ${prefs.enabled ? 'left-5' : 'left-0.5'}`} />
        </div>
      </div>

      {prefs.enabled && (
        <>
          {/* Notification Types */}
          <div className="border-2 border-foreground p-3">
            <p className="font-pixel text-[9px] uppercase text-muted-foreground mb-2">Tipos de alerta</p>
            <div className="space-y-2">
              <TypeToggle
                icon={<Package className="h-4 w-4" />}
                label="Novos addons"
                desc="Quando addons novos chegam"
                active={prefs.types.new_addons}
                onToggle={() => toggleType('new_addons')}
              />
              <TypeToggle
                icon={<Zap className="h-4 w-4" />}
                label="Interacoes"
                desc="Curtidas, comentarios nos seus addons"
                active={prefs.types.interactions}
                onToggle={() => toggleType('interactions')}
              />
              <TypeToggle
                icon={<Users className="h-4 w-4" />}
                label="Comunidade"
                desc="Novidades da Vila"
                active={prefs.types.community}
                onToggle={() => toggleType('community')}
              />
              <TypeToggle
                icon={<MessageSquare className="h-4 w-4" />}
                label="Atualizacoes"
                desc="Updates do NCMINE Hub"
                active={prefs.types.updates}
                onToggle={() => toggleType('updates')}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="border-2 border-foreground p-3">
            <p className="font-pixel text-[9px] uppercase text-muted-foreground mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Horarios
            </p>
            <div className="grid grid-cols-3 gap-2">
              <ScheduleBtn label="Manha" time="07:00" active={prefs.schedule.morning} onToggle={() => toggleSchedule('morning')} />
              <ScheduleBtn label="Tarde" time="12:00" active={prefs.schedule.noon} onToggle={() => toggleSchedule('noon')} />
              <ScheduleBtn label="Noite" time="18:00" active={prefs.schedule.evening} onToggle={() => toggleSchedule('evening')} />
            </div>
          </div>

          {/* Frequency Control */}
          <div className="border-2 border-foreground p-3">
            <p className="font-pixel text-[9px] uppercase text-muted-foreground mb-2 flex items-center gap-1">
              <Shield className="h-3 w-3" /> Anti-Spam
            </p>
            <div className="grid grid-cols-3 gap-2">
              <FreqBtn label="Normal" desc="A cada 4h" active={prefs.frequency === 'normal'} onClick={() => setFrequency('normal')} />
              <FreqBtn label="Reduzido" desc="A cada 8h" active={prefs.frequency === 'reduced'} onClick={() => setFrequency('reduced')} />
              <FreqBtn label="Minimo" desc="1x/dia" active={prefs.frequency === 'minimal'} onClick={() => setFrequency('minimal')} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TypeToggle({ icon, label, desc, active, onToggle }: {
  icon: React.ReactNode; label: string; desc: string; active: boolean; onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between p-2 cursor-pointer transition-all border ${active ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/30'}`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <span className={active ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
        <div>
          <p className="text-[11px] font-bold">{label}</p>
          <p className="text-[9px] text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className={`w-4 h-4 border-2 border-foreground flex items-center justify-center ${active ? 'bg-primary' : ''}`}>
        {active && <span className="text-primary-foreground text-[8px] font-bold">✓</span>}
      </div>
    </div>
  );
}

function ScheduleBtn({ label, time, active, onToggle }: {
  label: string; time: string; active: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`border-2 border-foreground p-2 text-center transition-all ${active ? 'bg-primary/10 border-primary shadow-[2px_2px_0_0_var(--ink)]' : 'hover:bg-muted/30'}`}
    >
      <p className="text-[10px] font-bold">{label}</p>
      <p className="text-[8px] text-muted-foreground">{time}</p>
    </button>
  );
}

function FreqBtn({ label, desc, active, onClick }: {
  label: string; desc: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-2 border-foreground p-2 text-center transition-all ${active ? 'bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--ink)]' : 'hover:bg-muted/30'}`}
    >
      <p className="text-[10px] font-bold">{label}</p>
      <p className={`text-[8px] ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{desc}</p>
    </button>
  );
}
