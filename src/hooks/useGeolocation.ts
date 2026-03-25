import { useState, useCallback } from 'react';

interface Location {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'تحديد الموقع غير مدعوم في متصفحك',
        loading: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null, latitude: null, longitude: null }));

    const success = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const error = (err: GeolocationPositionError) => {
      let errorMessage = 'حدث خطأ أثناء تحديد الموقع';
      if (err.code === 1) {
        errorMessage = 'تم رفض إذن الوصول للموقع. يرجى تفعيل الموقع من إعدادات المتصفح.';
      } else if (err.code === 2) {
        errorMessage = 'الموقع غير متاح حالياً. تأكد من تفعيل الـ GPS.';
      } else if (err.code === 3) {
        errorMessage = 'انتهت مهلة طلب الموقع. حاول مرة أخرى.';
      }

      setLocation((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });
  }, []);

  return { ...location, requestLocation };
}
