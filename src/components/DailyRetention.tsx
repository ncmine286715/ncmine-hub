import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getNotificationPrefs,
  canSendNotification,
  isInScheduleWindow,
  markNotificationSent,
  getRandomMessage,
} from '@/lib/push-notifications';
import { useAuth } from '@/hooks/use-auth';

const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
const LAST_LOCAL_NOTIF_KEY = 'ncmine:last_local_notif';

export function DailyRetention() {
  const { user } = useAuth();

  const checkAndNotify = useCallback(() => {
    const prefs = getNotificationPrefs();
    if (!prefs.enabled) return;
    if (!canSendNotification()) return;
    if (!isInScheduleWindow()) return;

    const lastLocal = localStorage.getItem(LAST_LOCAL_NOTIF_KEY);
    const now = Date.now();
    if (lastLocal && now - parseInt(lastLocal) < 4 * 60 * 60 * 1000) return;

    const enabledTypes = Object.entries(prefs.types)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type as 'new_addons' | 'interactions' | 'community');

    if (enabledTypes.length === 0) return;

    const randomType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
    const message = getRandomMessage(randomType);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('NCMINE Hub', {
        body: message,
        icon: '/apple-touch-icon.png',
        tag: 'ncmine-daily',
      });
    }

    toast(message, { duration: 8000 });

    markNotificationSent();
    localStorage.setItem(LAST_LOCAL_NOTIF_KEY, String(now));
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkAndNotify, 5000);
    const interval = setInterval(checkAndNotify, CHECK_INTERVAL);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkAndNotify]);

  return null;
}
