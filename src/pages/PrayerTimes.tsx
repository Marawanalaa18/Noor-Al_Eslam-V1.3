import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin, AlertCircle, Calendar, Settings, Search, Navigation, Globe, Bell, Timer } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { aladhanApi } from '@/utils/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/utils/cn';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useNotificationSystem } from '@/hooks/useNotifications';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

interface UserLocation {
  lat: number;
  lng: number;
  name: string;
  type: 'gps' | 'manual';
}

export function PrayerTimes() {
  const { latitude, longitude, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [timings, setTimings] = useState<any>(null);
  const [dateInfo, setDateInfo] = useState<any>(null);
  const [userLocation, setUserLocation] = useLocalStorage<UserLocation | null>('userLocation', null);
  const [method, setMethod] = useLocalStorage<number>('prayerMethod', 5); // Default: Egyptian General Authority of Survey
  const [hijriAdjustment, setHijriAdjustment] = useLocalStorage<number>('hijriAdjustment', 0);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, setSettings } = useNotificationSystem();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Manual selection states
  const [showSetup, setShowSetup] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const calculationMethods = [
    { id: 5, name: 'الهيئة العامة المصرية للمساحة' },
    { id: 4, name: 'جامعة أم القرى بمكة المكرمة' },
    { id: 3, name: 'رابطة العالم الإسلامي' },
    { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
    { id: 1, name: 'جامعة العلوم الإسلامية بكراتشي' },
    { id: 8, name: 'منطقة الخليج' },
    { id: 9, name: 'الكويت' },
    { id: 10, name: 'قطر' },
  ];

  const fetchTimings = async (lat: number, lng: number, calcMethod: number, adj: number) => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await aladhanApi.get('/timings', {
        params: { latitude: lat, longitude: lng, method: calcMethod, adjustment: adj }
      });
      setTimings(res.data.data.timings);
      setDateInfo(res.data.data.date);
    } catch (err) {
      console.error(err);
      setFetchError('تعذر جلب مواقيت الصلاة. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (userLocation && !searchParams.get('setup')) {
      fetchTimings(userLocation.lat, userLocation.lng, method, hijriAdjustment);
      setShowSetup(false);
    } else {
      setShowSetup(true);
      // Automatically request location if not already set and not manually triggered via setup param
      if (!userLocation && !geoLoading && !geoError) {
        requestLocation();
      }
    }
  }, [userLocation, method, hijriAdjustment, searchParams, requestLocation, geoLoading, geoError]);

  const closeSetup = () => {
    setShowSetup(false);
    if (searchParams.get('setup')) {
      setSearchParams({});
    }
  };

  // Handle GPS success
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      const newLoc: UserLocation = {
        lat: latitude,
        lng: longitude,
        name: 'موقعي الحالي',
        type: 'gps'
      };
      setUserLocation(newLoc);
      // Close setup immediately on success
      setShowSetup(false);
      if (searchParams.get('setup')) {
        setSearchParams({});
      }
    }
  }, [latitude, longitude, setUserLocation, searchParams, setSearchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 5,
          'accept-language': 'ar,en'
        },
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        }
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectManualLocation = (result: any) => {
    const newLoc: UserLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name.split(',')[0],
      type: 'manual'
    };
    setUserLocation(newLoc);
    setManualMode(false);
    setSearchResults([]);
    setSearchQuery('');
    if (searchParams.get('setup')) {
      setSearchParams({});
    }
  };

  const prayerNames = [
    { key: 'Fajr', ar: 'الفجر' },
    { key: 'Sunrise', ar: 'الشروق' },
    { key: 'Dhuhr', ar: 'الظهر' },
    { key: 'Asr', ar: 'العصر' },
    { key: 'Maghrib', ar: 'المغرب' },
    { key: 'Isha', ar: 'العشاء' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-amiri text-gradient">مواقيت الصلاة</h1>
        
        {dateInfo && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600 dark:text-gray-300 font-tajawal">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full">
              <Calendar className="w-5 h-5 text-primary dark:text-gold" />
              <span>{dateInfo.hijri.weekday.ar}، {dateInfo.hijri.day} {dateInfo.hijri.month.ar} {dateInfo.hijri.year} هـ</span>
            </div>
            <div className="hidden sm:block text-gray-300 dark:text-gray-600">•</div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full">
              <span>{dateInfo.gregorian.day} {dateInfo.gregorian.month.en} {dateInfo.gregorian.year} م</span>
            </div>
          </div>
        )}

        {userLocation && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <MapPin className="w-5 h-5" />
              <span dir="rtl">{userLocation.name}</span>
            </div>
            <button 
              onClick={() => setSearchParams({ setup: 'true' })}
              className="text-xs text-primary dark:text-gold hover:underline font-tajawal"
            >
              تغيير الموقع
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSetup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 dark:bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary dark:text-gold" />
                </div>
                <h2 className="text-2xl font-bold font-amiri">تحديد الموقع</h2>
                <p className="text-gray-500 dark:text-gray-400 font-tajawal">يرجى اختيار طريقة تحديد موقعك لعرض المواقيت بدقة</p>
              </div>

              {!manualMode ? (
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => requestLocation()}
                    disabled={geoLoading}
                    className="flex items-center justify-center gap-3 p-4 bg-primary dark:bg-gold text-white dark:text-black rounded-2xl font-bold font-tajawal hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {geoLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5" />
                    )}
                    تحديد تلقائي (GPS)
                  </button>
                  <button
                    onClick={() => setManualMode(true)}
                    className="flex items-center justify-center gap-3 p-4 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold font-tajawal hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                    تحديد يدوي (مدينة / دولة)
                  </button>
                  {geoError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-xs text-red-600 dark:text-red-400 font-tajawal font-bold">{geoError}</p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن مدينتك..."
                      className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl p-4 pr-12 text-sm font-tajawal outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                      {isSearching ? (
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <Search className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </form>

                  <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectManualLocation(result)}
                        className="w-full text-right p-3 rounded-xl hover:bg-primary/5 dark:hover:bg-gold/5 border border-transparent hover:border-primary/20 transition-all text-sm font-tajawal"
                      >
                        {result.display_name}
                      </button>
                    ))}
                    {searchResults.length === 0 && searchQuery && !isSearching && (
                      <p className="text-center text-gray-500 text-xs py-4">لا توجد نتائج</p>
                    )}
                  </div>

                  <button
                    onClick={() => setManualMode(false)}
                    className="w-full text-center text-sm text-gray-500 hover:underline font-tajawal"
                  >
                    العودة للخلف
                  </button>
                </div>
              )}
              
              {userLocation && (
                <button 
                  onClick={closeSetup}
                  className="w-full text-center text-xs text-gray-400 hover:text-gray-600 font-tajawal mt-4"
                >
                  إغلاق
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {fetchError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex flex-col items-center gap-3 text-center"
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
            <AlertCircle className="w-5 h-5" />
            <span>{fetchError}</span>
          </div>
          <button 
            onClick={() => userLocation && fetchTimings(userLocation.lat, userLocation.lng, method, hijriAdjustment)}
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </motion.div>
      )}

      {timings && (
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300",
          isFetching ? "opacity-50" : "opacity-100"
        )}>
          {prayerNames.map((prayer, idx) => (
            <motion.div
              key={prayer.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 rounded-3xl flex flex-col items-center gap-4 hover:scale-105 transition-transform"
            >
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center text-primary dark:text-gold">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-tajawal">{prayer.ar}</h3>
              <p className="text-3xl font-mono text-gray-800 dark:text-gray-200">
                {timings[prayer.key]}
              </p>
              
              {/* Iqamah Counter */}
              {prayer.key !== 'Sunrise' && timings[prayer.key] && (
                <div className="mt-2 text-xs font-tajawal text-gray-500 dark:text-gray-400 flex flex-col items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-3 py-2 rounded-2xl w-full">
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" />
                    <span>الإقامة بعد {settings.iqamahTime} دقيقة</span>
                  </div>
                  
                  {/* Real-time countdown */}
                  {(() => {
                    const [pH, pM] = timings[prayer.key].split(':').map(Number);
                    const adhanDate = new Date(currentTime);
                    adhanDate.setHours(pH, pM, 0, 0);
                    
                    const iqamahDate = new Date(adhanDate);
                    iqamahDate.setMinutes(iqamahDate.getMinutes() + settings.iqamahTime);
                    
                    if (currentTime >= adhanDate && currentTime < iqamahDate) {
                      const diff = iqamahDate.getTime() - currentTime.getTime();
                      const mins = Math.floor(diff / 60000);
                      const secs = Math.floor((diff % 60000) / 1000);
                      return (
                        <div className="text-primary dark:text-gold font-mono font-bold animate-pulse mt-1">
                          الإقامة خلال {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Settings Section */}
      <div className="glass-card p-6 rounded-3xl max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-primary dark:text-gold" />
          <h3 className="text-lg font-bold font-tajawal">إعدادات الحساب</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">طريقة الحساب</label>
            <select 
              value={method}
              onChange={(e) => setMethod(Number(e.target.value))}
              className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-tajawal focus:ring-2 focus:ring-primary dark:focus:ring-gold outline-none transition-shadow cursor-pointer"
            >
              {calculationMethods.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">تعديل التاريخ الهجري (بالأيام)</label>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setHijriAdjustment(prev => prev - 1)}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/20 transition-colors font-bold text-lg"
              >
                -
              </button>
              <div className="flex-1 text-center font-mono text-lg font-bold">
                {hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment}
              </div>
              <button 
                onClick={() => setHijriAdjustment(prev => prev + 1)}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/20 transition-colors font-bold text-lg"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              استخدم هذا الخيار إذا كان التاريخ الهجري يختلف عن رؤية الهلال في بلدك
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-4 h-4 text-primary dark:text-gold" />
              <span className="text-sm font-bold">تنبيهات الصلاة</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500">التنبيه قبل الصلاة بـ</label>
                <select 
                  value={settings.prayerReminderTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, prayerReminderTime: Number(e.target.value) as any }))}
                  className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-xs font-tajawal outline-none"
                >
                  <option value={10}>10 دقائق</option>
                  <option value={15}>15 دقيقة</option>
                  <option value={30}>30 دقيقة</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-500">وقت الإقامة (بعد الأذان)</label>
                <select 
                  value={settings.iqamahTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, iqamahTime: Number(e.target.value) }))}
                  className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-xs font-tajawal outline-none"
                >
                  <option value={10}>10 دقائق</option>
                  <option value={15}>15 دقيقة</option>
                  <option value={20}>20 دقيقة</option>
                  <option value={30}>30 دقيقة</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
