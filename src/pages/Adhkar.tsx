import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Loader2, Check, Search, X, AlertCircle, ChevronDown, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/utils/cn';
import { islamicApi } from '@/utils/api';
import { useProgress } from '@/hooks/useProgress';
import { getFromOffline, saveToOffline } from '@/utils/db';

interface AdhkarItem {
  id: number;
  category: string;
  text: string;
  text_without_diacritical: string;
  description: string;
  count: number;
  reference: string;
}

const ProgressRing = ({ current, total, onClick, isDone }: { current: number, total: number, onClick: () => void, isDone: boolean }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = current / total;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        whileTap={!isDone ? { scale: 0.9 } : {}}
        animate={isDone ? { 
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, -5, 5, 0]
        } : {}}
        transition={{ duration: 0.5 }}
        onClick={onClick}
        disabled={isDone}
        className={cn(
          "relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 outline-none",
          isDone ? "shadow-[0_0_30px_rgba(200,169,81,0.4)] bg-gold/5" : "hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10"
        )}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-sm">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-gray-100 dark:text-gray-800"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
              "transition-colors duration-300",
              isDone ? "text-[#c8a951]" : "text-primary dark:text-primary-light"
            )}
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-center">
          {isDone ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <Check className="w-8 h-8 text-[#c8a951]" />
            </motion.div>
          ) : (
            <div className="flex items-baseline gap-1 font-mono" dir="ltr">
              <span className="text-2xl font-bold text-primary dark:text-gold">{current}</span>
              <span className="text-sm text-gray-400">/{total}</span>
            </div>
          )}
        </div>
      </motion.button>
      
      <div className="h-6 flex items-center justify-center">
        <AnimatePresence>
          {isDone && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm font-bold text-[#c8a951] font-tajawal bg-gold/10 px-3 py-1 rounded-full"
            >
              بارك الله فيك ✨
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export function Adhkar() {
  const [activeTab, setActiveTab] = useState<string>('أذكار الصباح');
  const [adhkarData, setAdhkarData] = useState<Record<string, AdhkarItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counters, setCounters] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { addAdhkar } = useProgress();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try offline first
      const cached = await getFromOffline('adhkar_all');
      if (cached) {
        setAdhkarData(cached);
        if (Object.keys(cached).length > 0) {
          setActiveTab(Object.keys(cached)[0]);
        }
        setLoading(false);
        // Continue to fetch fresh data in background
      }

      const res = await axios.get('/data/azkar.json');
      const data: AdhkarItem[] = res.data;
      const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = [];
        }
        acc[curr.category].push(curr);
        return acc;
      }, {} as Record<string, AdhkarItem[]>);
      
      setAdhkarData(grouped);
      await saveToOffline('adhkar_all', 'adhkar_category', grouped);
      
      if (Object.keys(grouped).length > 0 && !activeTab) {
        setActiveTab(Object.keys(grouped)[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (!adhkarData || Object.keys(adhkarData).length === 0) {
        setError('حدث خطأ في الاتصال بالشبكة. يرجى المحاولة مرة أخرى.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const advanceToNext = (currentId: number) => {
    const currentList = adhkarData[activeTab] || [];
    const currentIndex = currentList.findIndex(d => d.id === currentId);
    if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
      const nextId = currentList[currentIndex + 1].id;
      const nextElement = document.getElementById(`zikr-${nextId}`);
      if (nextElement) {
        // Add a small highlight effect to the next element
        nextElement.classList.add('ring-2', 'ring-primary', 'ring-offset-4', 'dark:ring-offset-gray-900');
        setTimeout(() => {
          nextElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-4', 'dark:ring-offset-gray-900');
        }, 1500);
        
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleCount = (id: number, targetCount: number) => {
    const current = counters[id] || 0;
    if (current < targetCount) {
      const newCount = current + 1;
      setCounters(prev => ({ ...prev, [id]: newCount }));
      
      if (newCount === targetCount) {
        addAdhkar(1);
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c8a951', '#f1d570', '#ffffff'],
          disableForReducedMotion: true
        });
        
        // Auto-advance after a short delay
        setTimeout(() => {
          advanceToNext(id);
        }, 1200);
      }
    }
  };

  const handleReset = () => {
    setCounters({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary dark:text-gold" />
        <p className="text-gray-500 font-tajawal">جاري تحميل الأذكار...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-amiri text-gray-900 dark:text-white">عذراً، حدث خطأ</h2>
          <p className="text-gray-600 dark:text-gray-400 font-tajawal max-w-xs mx-auto">
            {error}
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold font-tajawal hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const categories = Object.keys(adhkarData);

  const allAdhkar = Object.values(adhkarData).flat() as AdhkarItem[];

  const filteredAdhkar = searchQuery.trim() 
    ? allAdhkar.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
          item.category.toLowerCase().includes(query) ||
          item.text.toLowerCase().includes(query) ||
          item.text_without_diacritical.toLowerCase().includes(query)
        );
      })
    : (adhkarData[activeTab] || []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-amiri text-gradient">الأذكار</h1>
        <p className="text-gray-500 dark:text-gray-400 font-tajawal">أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</p>
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في الأذكار..."
          className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl py-3 pr-12 pl-12 text-sm font-tajawal outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 left-0 pl-4 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Category Selection Dropdown */}
      {!searchQuery && (
        <div className="relative max-w-xs mx-auto" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-gold/10 flex items-center justify-center text-primary dark:text-gold group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-tajawal">اختر التصنيف</p>
                <p className="text-lg font-bold font-amiri text-gray-900 dark:text-white leading-tight">{activeTab}</p>
              </div>
            </div>
            <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute z-50 top-full left-0 right-0 mt-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
              >
                <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveTab(cat);
                        setIsDropdownOpen(false);
                        handleReset();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-right",
                        activeTab === cat 
                          ? "bg-primary text-white shadow-md" 
                          : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300"
                      )}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        activeTab === cat ? "bg-white" : "bg-primary/30"
                      )} />
                      <span className="font-bold font-tajawal">{cat}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {searchQuery && (
        <div className="max-w-md mx-auto px-6 py-4 rounded-2xl bg-primary/10 text-primary font-bold font-tajawal text-center border border-primary/20">
          نتائج البحث عن: <span className="text-gray-900 dark:text-white underline decoration-primary/30 underline-offset-4">{searchQuery}</span>
        </div>
      )}

      <div className="space-y-6">
        {filteredAdhkar.length > 0 ? (
          filteredAdhkar.map((dhikr, idx) => {
            const currentCount = counters[dhikr.id] || 0;
            const isDone = currentCount >= dhikr.count;

            return (
              <motion.div
                id={`zikr-${dhikr.id}`}
                key={dhikr.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden group transition-all duration-500",
                  isDone ? "opacity-70 bg-gray-50 dark:bg-white/5 scale-[0.98]" : "hover:shadow-xl"
                )}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 dark:bg-gold/5 rounded-bl-full flex items-start justify-end p-4">
                  <Star className={cn("w-4 h-4 transition-colors", isDone ? "text-gold" : "text-primary/40 dark:text-gold/40")} />
                </div>

                {searchQuery && (
                  <div className="mb-4">
                    <span className="text-xs font-bold font-tajawal text-primary dark:text-gold bg-primary/10 dark:bg-gold/10 px-3 py-1 rounded-full">
                      {dhikr.category}
                    </span>
                  </div>
                )}
                
                <p className={cn(
                  "text-xl md:text-2xl leading-relaxed font-amiri mb-6 text-justify whitespace-pre-line transition-colors",
                  isDone ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-100"
                )}>
                  {dhikr.text}
                </p>
                
                {dhikr.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-tajawal bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                    {dhikr.description}
                  </p>
                )}
                
                <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-100 dark:border-white/5 pt-6 gap-6">
                  <div className="flex flex-col gap-2 text-center md:text-right w-full md:w-auto">
                    {dhikr.reference && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full inline-block w-fit mx-auto md:mx-0">
                        المصدر: {dhikr.reference}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <ProgressRing 
                      current={currentCount} 
                      total={dhikr.count} 
                      onClick={() => handleCount(dhikr.id, dhikr.count)}
                      isDone={isDone}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 glass-card rounded-3xl"
          >
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-tajawal">لا توجد نتائج تطابق بحثك</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
