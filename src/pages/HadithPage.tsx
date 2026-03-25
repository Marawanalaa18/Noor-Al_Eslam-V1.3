import React from 'react';
import { motion } from 'motion/react';
import { Book, ChevronLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const collections = [
  { id: 'abu-daud', name: 'سنن أبي داود', count: 4590, color: 'text-blue-500' },
  { id: 'ahmad', name: 'مسند أحمد', count: 26363, color: 'text-emerald-500' },
  { id: 'bukhari', name: 'صحيح البخاري', count: 7008, color: 'text-amber-500' },
  { id: 'darimi', name: 'سنن الدارمي', count: 3367, color: 'text-rose-500' },
  { id: 'ibnu-majah', name: 'سنن ابن ماجه', count: 4332, color: 'text-indigo-500' },
  { id: 'malik', name: 'موطأ مالك', count: 1594, color: 'text-orange-500' },
  { id: 'muslim', name: 'صحيح مسلم', count: 5362, color: 'text-cyan-500' },
  { id: 'nasai', name: 'سنن النسائي', count: 5662, color: 'text-teal-500' },
  { id: 'tirmidzi', name: 'سنن الترمذي', count: 3891, color: 'text-violet-500' },
];

export function HadithPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12"
      dir="rtl"
    >
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold font-amiri text-gradient">الأحاديث النبوية</h1>
        <p className="text-gray-500 dark:text-gray-400 font-tajawal max-w-2xl mx-auto">
          تصفح كتب الحديث الشريف واستمتع بقراءة كلام خير الأنام صلى الله عليه وسلم
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection, index) => (
          <motion.button
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/hadith/${collection.id}`)}
            className="glass-card p-8 rounded-3xl text-right group hover:border-primary dark:hover:border-gold transition-all relative overflow-hidden"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${collection.color}`}>
              <Book className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-amiri text-gray-800 dark:text-gray-100 mb-2">
              {collection.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-tajawal">
                {collection.count.toLocaleString('ar-EG')} حديث
              </span>
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary dark:group-hover:text-gold transition-colors" />
            </div>
            
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>

      {/* Favorites Shortcut */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/favorites')}
        className="w-full glass-card p-8 rounded-3xl flex items-center justify-between border-dashed border-2 border-primary/20 dark:border-gold/20 group"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold font-amiri text-gray-800 dark:text-gray-100">الأحاديث المفضلة</h3>
            <p className="text-sm text-gray-500 font-tajawal">الوصول السريع للأحاديث التي قمت بحفظها</p>
          </div>
        </div>
        <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
      </motion.button>
    </motion.div>
  );
}
