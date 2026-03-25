import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotificationSystem } from './useNotifications';
import { usePrayerTimes } from './usePrayerTimes';
import { useLocalStorage } from './useLocalStorage';

const MUEZZIN_URLS: Record<string, string> = {
  adhan1: 'https://cdn.islamic.network/audio/adhan/adhan1.mp3',
  adhan2: 'https://cdn.islamic.network/audio/adhan/adhan2.mp3',
  adhan3: 'https://cdn.islamic.network/audio/adhan/adhan3.mp3',
};

const IQAMAH_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // Simple bell

export function useAthan() {
  const { settings, sendNotification, isQuietTime } = useNotificationSystem();
  const { timings } = usePrayerTimes();
  const [activeAthan, setActiveAthan] = useState<{ prayer: string; type: 'adhan' | 'iqamah' } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playedAthan, setPlayedAthan] = useLocalStorage<string[]>('playedAthan', []); // Format: ['2026-03-04-Fajr-adhan', ...]

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveAthan(null);
  }, []);

  const playSound = useCallback((url: string, volume: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.volume = volume / 100;
    audioRef.current.play().catch(err => console.error('Audio playback failed:', err));
    
    audioRef.current.onended = () => {
      setActiveAthan(null);
    };
  }, []);

  const playTestAthan = useCallback((prayer: string) => {
    let muezzinId = settings.muezzin;
    if (prayer === 'Fajr' && settings.fajrAthanEnabled) {
      muezzinId = settings.fajrMuezzin;
    }
    const url = MUEZZIN_URLS[muezzinId] || MUEZZIN_URLS.adhan1;
    playSound(url, settings.athanVolume);
    setActiveAthan({ prayer: prayer === 'Fajr' ? 'الفجر' : 'تجربة', type: 'adhan' });
  }, [settings, playSound]);

  useEffect(() => {
    if (!timings || !settings.athanEnabled) return;

    const checkTime = () => {
      if (isQuietTime()) return;

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const todayKey = now.toISOString().split('T')[0];
      const isTabHidden = document.visibilityState === 'hidden';

      if (isTabHidden && !settings.backgroundAthanEnabled) return;

      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const prayerNamesAr: Record<string, string> = {
        Fajr: 'الفجر',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء'
      };

      prayers.forEach(prayer => {
        const prayerTime = timings[prayer as keyof typeof timings];
        if (!prayerTime) return;

        // 1. Adhan Check
        const adhanKey = `${todayKey}-${prayer}-adhan`;
        if (currentTime === prayerTime && !playedAthan.includes(adhanKey)) {
          if (settings.athanPrayers.includes(prayer)) {
            setPlayedAthan(prev => [...prev, adhanKey]);
            setActiveAthan({ prayer: prayerNamesAr[prayer], type: 'adhan' });
            
            let muezzinId = settings.muezzin;
            if (prayer === 'Fajr' && settings.fajrAthanEnabled) {
              muezzinId = settings.fajrMuezzin;
            }
            
            playSound(MUEZZIN_URLS[muezzinId] || MUEZZIN_URLS.adhan1, settings.athanVolume);
            sendNotification(`حان الآن وقت صلاة ${prayerNamesAr[prayer]}`, {
              body: 'حي على الصلاة، حي على الفلاح',
              requireInteraction: true
            });
          }
        }

        // 2. Iqamah Check
        if (settings.iqamahSoundEnabled) {
          const iqamahKey = `${todayKey}-${prayer}-iqamah`;
          const [pH, pM] = prayerTime.split(':').map(Number);
          const iqamahDate = new Date(now);
          iqamahDate.setHours(pH, pM, 0, 0);
          iqamahDate.setMinutes(iqamahDate.getMinutes() + settings.iqamahTime);
          
          const iqamahTimeStr = `${iqamahDate.getHours().toString().padStart(2, '0')}:${iqamahDate.getMinutes().toString().padStart(2, '0')}`;
          
          if (currentTime === iqamahTimeStr && !playedAthan.includes(iqamahKey)) {
            setPlayedAthan(prev => [...prev, iqamahKey]);
            setActiveAthan({ prayer: prayerNamesAr[prayer], type: 'iqamah' });
            playSound(IQAMAH_URL, settings.athanVolume);
            sendNotification(`حان الآن موعد إقامة صلاة ${prayerNamesAr[prayer]}`, {
              body: 'قد قامت الصلاة',
              requireInteraction: true
            });
          }
        }
      });

      // Cleanup old keys (keep only today's)
      if (playedAthan.length > 20) {
        setPlayedAthan(prev => prev.filter(key => key.startsWith(todayKey)));
      }
    };

    const interval = setInterval(checkTime, 10000); // Check every 10 seconds
    checkTime();

    return () => clearInterval(interval);
  }, [timings, settings, playSound, sendNotification, playedAthan, setPlayedAthan]);

  return { activeAthan, stopAudio, playTestAthan };
}
