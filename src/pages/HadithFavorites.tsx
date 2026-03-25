import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronLeft, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHadith } from '../hooks/useHadith';
import { HadithCard } from '../components/HadithCard';

export function HadithFavorites() {
  const navigate = useNavigate();
  const { favorites, setFavorites } = useHadith();
  const [fontSize, setFontSize] = useState(24);

  const clearFavorites = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح جميع الأحاديث المفضلة؟')) {
      setFavorites([]);
    }
  };

  const removeFavorite = (hadithNumber: number, collectionId: string) => {
    setFavorites(prev => prev.filter(f => !(f.number === hadithNumber && f.collectionId === collectionId)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/hadith')}
            className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </button>
          <div>
            <h1 className="text-4xl font-bold font-amiri text-gradient">المفضلة</h1>
            <p className="text-sm text-gray-500 font-tajawal">
              الأحاديث التي قمت بحفظها للرجوع إليها لاحقاً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 p-1">
            <button 
              onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold font-mono text-gray-400">A</span>
            <button 
              onClick={() => setFontSize(prev => Math.min(40, prev + 2))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold font-tajawal hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Favorites List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {favorites.length > 0 ? (
            favorites.map((hadith) => (
              <div key={`${hadith.collectionId}-${hadith.number}`}>
                <HadithCard
                  hadith={hadith}
                  collectionName={hadith.collectionName}
                  isFavorite={true}
                  onToggleFavorite={() => removeFavorite(hadith.number, hadith.collectionId)}
                  fontSize={fontSize}
                />
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-gray-50 dark:bg-white/5 rounded-3xl space-y-6"
            >
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 text-gray-300 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-amiri text-gray-800 dark:text-gray-100">لا توجد أحاديث مفضلة</h3>
                <p className="text-gray-500 font-tajawal">قم بإضافة الأحاديث التي تعجبك لتظهر هنا.</p>
              </div>
              <button
                onClick={() => navigate('/hadith')}
                className="px-8 py-3 bg-primary dark:bg-gold text-white dark:text-black rounded-xl font-bold font-tajawal shadow-lg shadow-primary/20"
              >
                تصفح الأحاديث
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
