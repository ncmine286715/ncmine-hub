import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const VAPID_KEY = 'BNCMine_placeholder_vapid_key_replace_in_production';
const PREFS_KEY = 'ncmine:push_prefs';
const FREQUENCY_KEY = 'ncmine:last_push';

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    new_addons: boolean;
    interactions: boolean;
    community: boolean;
    updates: boolean;
  };
  schedule: {
    morning: boolean;   // 07:00
    noon: boolean;      // 12:00
    evening: boolean;   // 18:00
  };
  frequency: 'normal' | 'reduced' | 'minimal';
}

const DEFAULT_PREFS: NotificationPreferences = {
  enabled: false,
  types: {
    new_addons: true,
    interactions: true,
    community: true,
    updates: true,
  },
  schedule: {
    morning: true,
    noon: true,
    evening: false,
  },
  frequency: 'normal',
};

export function getNotificationPrefs(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_PREFS;
}

export function saveNotificationPrefs(prefs: NotificationPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function canSendNotification(): boolean {
  const prefs = getNotificationPrefs();
  if (!prefs.enabled) return false;

  const lastPush = localStorage.getItem(FREQUENCY_KEY);
  if (!lastPush) return true;

  const last = new Date(lastPush).getTime();
  const now = Date.now();
  const hours = (now - last) / (1000 * 60 * 60);

  switch (prefs.frequency) {
    case 'minimal': return hours >= 24;
    case 'reduced': return hours >= 8;
    default: return hours >= 4;
  }
}

export function markNotificationSent() {
  localStorage.setItem(FREQUENCY_KEY, new Date().toISOString());
}

export function isInScheduleWindow(): boolean {
  const prefs = getNotificationPrefs();
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 9 && prefs.schedule.morning) return true;
  if (hour >= 11 && hour < 13 && prefs.schedule.noon) return true;
  if (hour >= 17 && hour < 19 && prefs.schedule.evening) return true;

  return false;
}

export async function checkPushSupport(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (!('serviceWorker' in navigator)) return false;
  try {
    const supported = await isSupported();
    return supported;
  } catch {
    return false;
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;

  const permission = Notification.permission === 'default'
    ? await Notification.requestPermission()
    : Notification.permission;

  return permission === 'granted';
}

export async function registerPushToken(userId: string): Promise<string | null> {
  try {
    const supported = await checkPushSupport();
    if (!supported) return null;

    const app = getApps()[0];
    if (!app) return null;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (token && userId) {
      const tokenRef = doc(db, 'push_tokens', userId);
      await setDoc(tokenRef, {
        token,
        userId,
        updatedAt: serverTimestamp(),
        platform: detectPlatform(),
      });
    }

    return token;
  } catch {
    return null;
  }
}

export async function savePushPrefsToFirestore(userId: string, prefs: NotificationPreferences) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      notificationPrefs: prefs,
      updatedAt: serverTimestamp(),
    });
  } catch {}
}

function detectPlatform(): string {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  return 'web';
}

export const DAILY_MESSAGES = {
  new_addons: [
    'Tem addons novos esperando voce! 🧱',
    'Novos addons acabaram de chegar no hub!',
    'Confira os addons mais recentes da comunidade',
  ],
  interactions: [
    'Seu addon recebeu novas interacoes! ⚡',
    'Alguem curtiu seu comentario!',
    'Novas avaliacoes nos seus addons favoritos',
  ],
  community: [
    'Veja novidades da comunidade! 👥',
    'A Vila esta movimentada hoje!',
    'Novos mineradores entraram na comunidade',
  ],
};

export function getRandomMessage(type: keyof typeof DAILY_MESSAGES): string {
  const messages = DAILY_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
}
