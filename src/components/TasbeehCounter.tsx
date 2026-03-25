import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ChevronDown, Check, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { cn } from '@/utils/cn';

const DHIKR_OPTIONS = [
  { id: 'subhan_allah', text: 'سبحان الله' },
  { id: 'alhamdulillah', text: 'الحمد لله' },
  { id: 'allahu_akbar', text: 'الله أكبر' },
  { id: 'la_ilaha_illallah', text: 'لا إله إلا الله' },
  { id: 'astaghfirullah', text: 'أستغفر الله' },
];

export function TasbeehCounter() {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [selectedDhikr, setSelectedDhikr] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_dhikr');
    return saved || DHIKR_OPTIONS[0].text;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isVibrateEnabled, setIsVibrateEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('tasbeeh_count', count.toString());
  }, [count]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_dhikr', selectedDhikr);
  }, [selectedDhikr]);

  const handleIncrement = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    setCount(prev => prev + 1);
    
    // Vibration
    if (isVibrateEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Sound
    if (isSoundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Ripple effect
    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
      const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;
      
      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1000);
    }
  }, [isVibrateEnabled, isSoundEnabled]);

  const handleReset = () => {
    if (showResetConfirm) {
      setCount(0);
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000); // Reset confirmation after 3 seconds
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleIncrement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleIncrement]);

  const progress = (count % 33) / 33;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Beads calculation
  const totalBeads = 33;
  const activeBeadIndex = count % totalBeads;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10" dir="rtl">
      {/* Audio element for click sound */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3" preload="auto" />

      {/* Header Controls */}
      <div className="flex items-center gap-4 w-full max-w-xs justify-between">
        <button 
          onClick={() => setIsVibrateEnabled(!isVibrateEnabled)}
          className={cn(
            "p-3 rounded-2xl transition-all",
            isVibrateEnabled ? "bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold" : "bg-gray-100 text-gray-400 dark:bg-white/5"
          )}
          title="الاهتزاز"
        >
          <Smartphone className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between font-tajawal font-bold text-gray-700 dark:text-gray-200"
          >
            <span className="truncate">{selectedDhikr}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", isDropdownOpen && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                {DHIKR_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedDhikr(option.text);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-right hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group"
                  >
                    <span className={cn("font-tajawal", selectedDhikr === option.text ? "text-primary dark:text-gold font-bold" : "text-gray-600 dark:text-gray-400")}>
                      {option.text}
                    </span>
                    {selectedDhikr === option.text && <Check className="w-4 h-4 text-primary dark:text-gold" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className={cn(
            "p-3 rounded-2xl transition-all",
            isSoundEnabled ? "bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold" : "bg-gray-100 text-gray-400 dark:bg-white/5"
          )}
          title="الصوت"
        >
          {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Counter Display */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100 dark:text-white/5"
          />
          <motion.circle
            cx="160"
            cy="160"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            className="text-primary dark:text-gold"
          />
        </svg>

        {/* Beads */}
        <div className="absolute inset-0">
          {Array.from({ length: totalBeads }).map((_, i) => {
            const angle = (i / totalBeads) * 360;
            const isActive = i === activeBeadIndex;
            const isPassed = i < activeBeadIndex;
            
            return (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                }}
              >
                <motion.div 
                  animate={{
                    scale: isActive ? 1.5 : 1,
                    backgroundColor: isActive ? '#C8A951' : isPassed ? '#0F3D2E' : '#e5e7eb',
                  }}
                  className={cn(
                    "w-3 h-3 rounded-full shadow-sm",
                    isActive && "ring-4 ring-gold/20"
                  )}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Counter Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleIncrement}
          className="relative w-56 h-56 rounded-full bg-white dark:bg-surface-dark shadow-2xl border-8 border-gray-50 dark:border-white/5 flex flex-col items-center justify-center overflow-hidden group"
        >
          {/* Ripples */}
          {ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              className="absolute bg-primary/20 dark:bg-gold/20 rounded-full pointer-events-none"
              style={{
                width: 100,
                height: 100,
                left: ripple.x - 50,
                top: ripple.y - 50,
              }}
            />
          ))}

          <span className="text-sm font-tajawal text-gray-400 dark:text-gray-500 mb-1">اضغط للتسبيح</span>
          <motion.span 
            key={count}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-bold font-mono text-primary dark:text-gold"
          >
            {count}
          </motion.span>
          <div className="mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
            <span className="text-xs font-tajawal text-gray-400">{activeBeadIndex + 1} / 33</span>
          </div>
        </motion.button>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center gap-6">
        <button 
          onClick={handleReset}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-2xl font-tajawal font-bold transition-all active:scale-95",
            showResetConfirm 
              ? "bg-red-600 text-white shadow-lg shadow-red-500/30" 
              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
          )}
        >
          <RotateCcw className={cn("w-4 h-4", showResetConfirm && "animate-spin")} />
          {showResetConfirm ? 'تأكيد التصفير؟' : 'إعادة تصفير'}
        </button>
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-400 dark:text-gray-500 font-tajawal">
        يمكنك استخدام زر المسافة (Space) للتسبيح أيضاً
      </p>
    </div>
  );
}
