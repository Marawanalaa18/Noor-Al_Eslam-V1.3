import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Loader2, Book, ArrowUp, Sparkles, Minus, Plus } from 'lucide-react';
import { useHadith } from '../hooks/useHadith';
import { HadithCard } from '../components/HadithCard';
import { HadithSearch, HadithPagination } from '../components/HadithControls';
import { cn } from '@/utils/cn';

export function HadithCollectionPage() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { hadiths, loading, error, collectionInfo, fetchHadiths, toggleFavorite, isFavorite } = useHadith(collectionId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(24);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchHadiths();
  }, [fetchHadiths]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredHadiths = useMemo(() => {
    return hadiths.filter(h => 
      h.arab.includes(searchQuery) || 
      h.number.toString().includes(searchQuery)
    );
  }, [hadiths, searchQuery]);

  const totalPages = Math.ceil(filteredHadiths.length / itemsPerPage);
  const currentHadiths = filteredHadiths.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRandomHadith = () => {
    if (hadiths.length === 0) return;
    const randomIndex = Math.floor(Math.random() * hadiths.length);
    const randomHadith = hadiths[randomIndex];
    setSearchQuery(randomHadith.number.toString());
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary dark:text-gold animate-spin" />
        <p className="text-gray-500 font-tajawal animate-pulse">جاري تحميل الأحاديث الشريفة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <Book className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-amiri text-gray-800 dark:text-gray-100">{error}</h2>
        <button 
          onClick={() => fetchHadiths()}
          className="px-8 py-3 bg-primary dark:bg-gold text-white dark:text-black rounded-xl font-bold font-tajawal"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
            <h1 className="text-4xl font-bold font-amiri text-gradient">{collectionInfo?.name}</h1>
            <p className="text-sm text-gray-500 font-tajawal">
              {collectionInfo?.available.toLocaleString('ar-EG')} حديث متاح
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={getRandomHadith}
            className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold rounded-xl font-bold font-tajawal hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            حديث عشوائي
          </button>
          
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
        </div>
      </div>

      {/* Search */}
      <div className="space-y-4">
        <HadithSearch value={searchQuery} onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }} />
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['الصلاة', 'الصيام', 'الزكاة', 'الأخلاق', 'الدعاء', 'الجنة', 'النار'].map((topic) => (
            <button
              key={topic}
              onClick={() => { setSearchQuery(topic); setCurrentPage(1); }}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold font-tajawal transition-all",
                searchQuery === topic
                  ? "bg-primary text-white dark:bg-gold dark:text-black"
                  : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
              )}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Hadith List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {currentHadiths.length > 0 ? (
            currentHadiths.map((hadith) => (
              <div key={hadith.number}>
                <HadithCard
                  hadith={hadith}
                  collectionName={collectionInfo?.name || ''}
                  isFavorite={isFavorite(hadith.number)}
                  onToggleFavorite={() => toggleFavorite(hadith, collectionInfo?.name || '')}
                  fontSize={fontSize}
                />
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl"
            >
              <p className="text-gray-500 font-tajawal">لم يتم العثور على أحاديث تطابق بحثك.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      <HadithPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 left-6 w-14 h-14 bg-primary dark:bg-gold text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
