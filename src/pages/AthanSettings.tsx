import React from 'react';
import { motion } from 'motion/react';
import { Music, Bell, Volume2, Moon, Check, ChevronLeft, Info } from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotifications';
import { useAthan } from '@/hooks/useAthan';
import { cn } from '@/utils/cn';
import { useNavigate } from 'react-router-dom';

export function AthanSettings() {
  const { settings, setSettings, requestPermission } = useNotificationSystem();
  const { playTestAthan } = useAthan();
  const navigate = useNavigate();

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'systemNotificationsEnabled' && value === true) {
      requestPermission();
    }
  };

  const togglePrayer = (prayer: string) => {
    const current = settings.athanPrayers || [];
    if (current.includes(prayer)) {
      updateSetting('athanPrayers', current.filter(p => p !== prayer));
    } else {
      updateSetting('athanPrayers', [...current, prayer]);
    }
  };

  const muezzins = [
    { id: 'adhan1', name: 'أذان مكة المكرمة' },
    { id: 'adhan2', name: 'أذان المدينة المنورة' },
    { id: 'adhan3', name: 'أذان جميل وواضح' },
  ];

  const prayers = [
    { id: 'Fajr', name: 'الفجر' },
    { id: 'Dhuhr', name: 'الظهر' },
    { id: 'Asr', name: 'العصر' },
    { id: 'Maghrib', name: 'المغرب' },
    { id: 'Isha', name: 'العشاء' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto space-y-8 pb-20"
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 rotate-180" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-amiri text-gradient">إعدادات الأذان والإقامة</h1>
          <p className="text-sm text-gray-500 font-tajawal">تحكم كامل في أصوات التنبيهات والصلوات</p>
        </div>
      </div>

      {/* Athan Main Toggle */}
      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              settings.athanEnabled ? "bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold" : "bg-gray-100 text-gray-400 dark:bg-white/5"
            )}>
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tajawal text-gray-800 dark:text-gray-100">صوت الأذان</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal">تشغيل الأذان تلقائياً عند دخول الوقت</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={settings.athanEnabled} onChange={(e) => updateSetting('athanEnabled', e.target.checked)} />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-gold"></div>
          </label>
        </div>

        <div className={cn("space-y-8 transition-all", !settings.athanEnabled && "opacity-40 pointer-events-none")}>
          {/* Muezzin Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold font-tajawal text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-primary dark:text-gold" />
              اختر صوت الأذان (لجميع الصلوات)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {muezzins.map((m) => (
                <div key={m.id} className="relative group">
                  <button
                    onClick={() => updateSetting('muezzin', m.id)}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-right font-tajawal transition-all flex items-center justify-between",
                      settings.muezzin === m.id 
                        ? "border-primary bg-primary/5 text-primary dark:border-gold dark:bg-gold/5 dark:text-gold" 
                        : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <span className="font-bold">{m.name}</span>
                    {settings.muezzin === m.id && <Check className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => playTestAthan('Dhuhr')} // Use any prayer except Fajr to test default
                    className="absolute left-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-primary/10 text-primary dark:text-gold transition-colors opacity-0 group-hover:opacity-100"
                    title="تجربة الصوت"
                  >
                    <Music className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fajr Specific Athan */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-tajawal text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Moon className="w-4 h-4 text-primary dark:text-gold" />
                تخصيص أذان صلاة الفجر
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.fajrAthanEnabled} onChange={(e) => updateSetting('fajrAthanEnabled', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-gold"></div>
              </label>
            </div>
            
            {settings.fajrAthanEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                {muezzins.map((m) => (
                  <div key={`fajr-${m.id}`} className="relative group">
                    <button
                      onClick={() => updateSetting('fajrMuezzin', m.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border text-right font-tajawal transition-all flex items-center justify-between",
                        settings.fajrMuezzin === m.id 
                          ? "border-primary bg-primary/5 text-primary dark:border-gold dark:bg-gold/5 dark:text-gold" 
                          : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                      )}
                    >
                      <span className="font-bold">{m.name}</span>
                      {settings.fajrMuezzin === m.id && <Check className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => playTestAthan('Fajr')}
                      className="absolute left-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-primary/10 text-primary dark:text-gold transition-colors opacity-0 group-hover:opacity-100"
                      title="تجربة الصوت"
                    >
                      <Music className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Volume Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold font-tajawal text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary dark:text-gold" />
                مستوى الصوت
              </label>
              <span className="text-sm font-mono font-bold text-primary dark:text-gold">{settings.athanVolume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={settings.athanVolume}
              onChange={(e) => updateSetting('athanVolume', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary dark:accent-gold"
            />
          </div>

          {/* Prayer Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold font-tajawal text-gray-700 dark:text-gray-200">تفعيل الأذان لصلوات محددة</label>
            <div className="flex flex-wrap gap-3">
              {prayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePrayer(p.id)}
                  className={cn(
                    "px-6 py-3 rounded-xl border font-tajawal transition-all flex items-center gap-2",
                    settings.athanPrayers.includes(p.id)
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                      : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  {settings.athanPrayers.includes(p.id) && <Check className="w-4 h-4" />}
                  <span className="font-bold">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Iqamah Settings */}
      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              settings.iqamahSoundEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-100 text-gray-400 dark:bg-white/5"
            )}>
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tajawal text-gray-800 dark:text-gray-100">صوت الإقامة</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal">تشغيل تنبيه الإقامة بعد الأذان</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={settings.iqamahSoundEnabled} onChange={(e) => updateSetting('iqamahSoundEnabled', e.target.checked)} />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className={cn("space-y-6 transition-all", !settings.iqamahSoundEnabled && "opacity-40 pointer-events-none")}>
          <div className="space-y-4">
            <label className="text-sm font-bold font-tajawal text-gray-700 dark:text-gray-200">مدة الإقامة (بعد الأذان)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[5, 10, 15, 20].map((min) => (
                <button
                  key={min}
                  onClick={() => updateSetting('iqamahTime', min)}
                  className={cn(
                    "p-3 rounded-xl border font-mono font-bold transition-all",
                    settings.iqamahTime === min
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-600"
                      : "border-gray-200 dark:border-white/10 text-gray-500"
                  )}
                >
                  {min} دقيقة
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background & System Notifications */}
      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              settings.backgroundAthanEnabled ? "bg-amber-500/10 text-amber-500" : "bg-gray-100 text-gray-400 dark:bg-white/5"
            )}>
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tajawal text-gray-800 dark:text-gray-100">التشغيل في الخلفية</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal">استمرار تشغيل الأذان حتى عند مغادرة التبويب</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={settings.backgroundAthanEnabled} onChange={(e) => updateSetting('backgroundAthanEnabled', e.target.checked)} />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
          </label>
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/5" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              settings.systemNotificationsEnabled ? "bg-blue-500/10 text-blue-500" : "bg-gray-100 text-gray-400 dark:bg-white/5"
            )}>
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tajawal text-gray-800 dark:text-gray-100">إشعارات النظام</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal">إظهار تنبيهات سطح المكتب (Browser Notifications)</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={settings.systemNotificationsEnabled} onChange={(e) => updateSetting('systemNotificationsEnabled', e.target.checked)} />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>

      {/* Night Mode / Silent Mode */}
      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              settings.nightModeSilent ? "bg-indigo-500/10 text-indigo-500" : "bg-gray-100 text-gray-400 dark:bg-white/5"
            )}>
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tajawal text-gray-800 dark:text-gray-100">الوضع الصامت ليلاً</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal">كتم صوت الأذان بين 12:00 ص و 5:00 ص</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={settings.nightModeSilent} onChange={(e) => updateSetting('nightModeSilent', e.target.checked)} />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500"></div>
          </label>
        </div>
      </div>

      <div className="p-4 bg-primary/5 dark:bg-gold/5 rounded-2xl border border-primary/10 dark:border-gold/10 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary dark:text-gold shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 dark:text-gray-400 font-tajawal leading-relaxed">
          ملاحظة: لضمان تشغيل الأذان في الخلفية، يرجى التأكد من عدم كتم صوت المتصفح والسماح بالتشغيل التلقائي للصوت في إعدادات المتصفح لهذا الموقع.
        </p>
      </div>
    </motion.div>
  );
}
