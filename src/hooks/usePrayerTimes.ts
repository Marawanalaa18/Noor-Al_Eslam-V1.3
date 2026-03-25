import { useState, useEffect } from 'react';
import { islamicApi } from '@/utils/api';
import { useLocalStorage } from './useLocalStorage';
import { PrayerTimings } from '@/pages/PrayerTimes';

export function usePrayerTimes() {
  const [timings, setTimings] = useLocalStorage<PrayerTimings | null>('prayerTimings', null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation] = useLocalStorage<any>('userLocation', null);
  const [method] = useLocalStorage<number>('prayerMethod', 5);
  const [hijriAdjustment] = useLocalStorage<number>('hijriAdjustment', 0);

  useEffect(() => {
    const fetchTimings = async () => {
      if (!userLocation?.lat || !userLocation?.lng) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await islamicApi.get('/timings', {
          params: {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            method,
            adjustment: hijriAdjustment
          }
        });
        setTimings(response.data.data.timings);
      } catch (err) {
        setError('Failed to fetch prayer times');
      } finally {
        setLoading(false);
      }
    };

    fetchTimings();
  }, [userLocation, method, hijriAdjustment]);

  return { timings, loading, error };
}
