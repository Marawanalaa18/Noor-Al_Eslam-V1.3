import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { usePrayerTimes } from './usePrayerTimes';

export interface NotificationSettings {
  enabled: boolean;
  khatmaReminder: boolean;
  khatmaTime: string;
  morningAdhkar: boolean;
  morningAdhkarTime: string;
  eveningAdhkar: boolean;
  eveningAdhkarTime: string;
  prayerAlerts: boolean;
  prayerReminderTime: 10 | 15 | 30;
  iqamahReminder: boolean;
  iqamahTime: number; // minutes after adhan
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  randomDhikrPopup: boolean;
  dhikrInterval: number;
  dhikrMode: 'fixed' | 'random' | 'activity';
  dhikrDuration: number;
  // Athan Settings
  athanEnabled: boolean;
  muezzin: string;
  athanVolume: number;
  athanPrayers: string[]; // ['Fajr', 'Dhuhr', ...]
  iqamahSoundEnabled: boolean;
  nightModeSilent: boolean;
  fajrAthanEnabled: boolean;
  fajrMuezzin: string;
  systemNotificationsEnabled: boolean;
  backgroundAthanEnabled: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  khatmaReminder: true,
  khatmaTime: '20:00',
  morningAdhkar: true,
  morningAdhkarTime: '06:00',
  eveningAdhkar: true,
  eveningAdhkarTime: '17:00',
  prayerAlerts: true,
  prayerReminderTime: 10,
  iqamahReminder: true,
  iqamahTime: 15,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '05:00',
  randomDhikrPopup: true,
  dhikrInterval: 30,
  dhikrMode: 'fixed',
  dhikrDuration: 10,
  athanEnabled: true,
  muezzin: 'mishary',
  athanVolume: 80,
  athanPrayers: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
  iqamahSoundEnabled: true,
  nightModeSilent: false,
  fajrAthanEnabled: true,
  fajrMuezzin: 'adhan1',
  systemNotificationsEnabled: true,
  backgroundAthanEnabled: true,
};

export function useNotificationSystem() {
  const [storedSettings, setSettings] = useLocalStorage<NotificationSettings>('notificationSettings', defaultSettings);
  const settings = { ...defaultSettings, ...storedSettings };
  const { timings } = usePrayerTimes();
  const notifiedRef = useRef<Set<string>>(new Set());

  const requestPermission = async () => {
    try {
      if (!('Notification' in window)) {
        alert('متصفحك لا يدعم الإشعارات الخارجية، سيتم تفعيل التنبيهات داخل التطبيق فقط.');
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      }

      if (Notification.permission === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      } else {
        alert('تم منع الإشعارات من المتصفح (أو بسبب بيئة العرض). سيتم تفعيل التنبيهات داخل التطبيق فقط.');
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      }
    } catch (error) {
      console.warn('Notification permission error:', error);
      setSettings(prev => ({ ...prev, enabled: true }));
      return true;
    }
  };

  const isQuietTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const currentMinutes = hours * 60 + now.getMinutes();

    // 1. Night Mode (00:00 - 05:00)
    if (settings.nightModeSilent && hours >= 0 && hours < 5) {
      return true;
    }

    // 2. Quiet Hours
    if (settings.quietHoursEnabled) {
      const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
      const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (startMinutes <= endMinutes) {
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return true;
      } else {
        // Crosses midnight
        if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) return true;
      }
    }

    return false;
  };

  const sendNotification = async (title: string, options?: NotificationOptions & { url?: string }) => {
    if (settings.enabled && settings.systemNotificationsEnabled && !isQuietTime()) {
      // Try Service Worker first for background support
      if ('serviceWorker' in navigator && 'Notification' in window) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && Notification.permission === 'granted') {
          const swOptions: any = {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            dir: 'rtl',
            lang: 'ar',
            data: { url: options?.url || '/' },
            ...options
          };
          registration.showNotification(title, swOptions);
          return;
        }
      }

      // Fallback to standard Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            icon: '/favicon.ico',
            ...options
          });
        } catch (e) {
          console.error('Failed to send native notification', e);
        }
      } else {
        console.log(`🔔 إشعار جديد: ${title} - ${options?.body}`);
      }
    }
  };

  useEffect(() => {
    if (!settings.enabled) return;

    const checkNotifications = () => {
      if (isQuietTime()) return;

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayDate = now.toISOString().slice(0, 10);

      // Helper to check and notify
      const checkAndNotify = (id: string, time: string, title: string, body: string) => {
        const notifKey = `${todayDate}-${id}`;
        if (time === currentTime && !notifiedRef.current.has(notifKey)) {
          sendNotification(title, { body });
          notifiedRef.current.add(notifKey);
        }
      };

      if (settings.khatmaReminder) {
        checkAndNotify('khatma', settings.khatmaTime, 'تذكير بالورد اليومي', 'حان وقت قراءة وردك اليومي من القرآن الكريم 📖');
      }

      if (settings.morningAdhkar) {
        checkAndNotify('morning', settings.morningAdhkarTime, 'أذكار الصباح', 'ابدأ يومك بذكر الله ☀️');
      }

      if (settings.eveningAdhkar) {
        checkAndNotify('evening', settings.eveningAdhkarTime, 'أذكار المساء', 'اختم يومك بذكر الله 🌙');
      }

      // Hourly Dhikr
      if (settings.randomDhikrPopup && settings.dhikrMode === 'fixed') {
        const minutes = now.getMinutes();
        if (minutes === 0) { // Top of the hour
          const dhikrs = [
            'سبحان الله وبحمده',
            'الحمد لله رب العالمين',
            'لا إله إلا الله',
            'الله أكبر',
            'لا حول ولا قوة إلا بالله',
            'أستغفر الله وأتوب إليه',
            'اللهم صل وسلم على نبينا محمد'
          ];
          const randomDhikr = dhikrs[Math.floor(Math.random() * dhikrs.length)];
          checkAndNotify('hourly-dhikr', currentTime, 'ذكر الله', randomDhikr);
        }
      }

      if (settings.prayerAlerts && timings) {
        // Check 10 mins before prayers
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const prayerNamesAr: Record<string, string> = {
          Fajr: 'الفجر',
          Dhuhr: 'الظهر',
          Asr: 'العصر',
          Maghrib: 'المغرب',
          Isha: 'العشاء'
        };

        prayers.forEach(prayer => {
          const prayerTimeStr = timings[prayer as keyof typeof timings];
          if (prayerTimeStr) {
            // Parse prayer time
            const [pH, pM] = prayerTimeStr.split(':').map(Number);
            const prayerDate = new Date(now);
            prayerDate.setHours(pH, pM, 0, 0);
            
            // 1. Pre-prayer alert
            const reminderDate = new Date(prayerDate);
            reminderDate.setMinutes(reminderDate.getMinutes() - settings.prayerReminderTime);
            
            const alertTime = `${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`;
            checkAndNotify(`prayer-${prayer}`, alertTime, 'تنبيه الصلاة', `اقترب موعد صلاة ${prayerNamesAr[prayer]} (متبقي ${settings.prayerReminderTime} دقائق) 🕌`);

            // 2. Iqamah alert (after adhan)
            if (settings.iqamahReminder) {
              const iqamahDate = new Date(prayerDate);
              iqamahDate.setMinutes(iqamahDate.getMinutes() + settings.iqamahTime);
              
              const iqamahAlertTime = `${iqamahDate.getHours().toString().padStart(2, '0')}:${iqamahDate.getMinutes().toString().padStart(2, '0')}`;
              checkAndNotify(`iqamah-${prayer}`, iqamahAlertTime, 'موعد الإقامة', `حان الآن موعد إقامة صلاة ${prayerNamesAr[prayer]} 🕋`);
            }
          }
        });
      }
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Check immediately

    return () => clearInterval(interval);
  }, [settings, timings]);

  return { settings, setSettings, requestPermission, sendNotification, isQuietTime };
}
