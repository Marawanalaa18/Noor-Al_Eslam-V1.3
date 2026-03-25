import React from 'react';
import { motion } from 'motion/react';
import { Share2, Copy, Heart, Book } from 'lucide-react';
import { Hadith } from '../types/hadith';
import { cn } from '@/utils/cn';

interface HadithCardProps {
  hadith: Hadith;
  collectionName: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  fontSize: number;
}

export function HadithCard({ hadith, collectionName, isFavorite, onToggleFavorite, fontSize }: HadithCardProps) {
  const copyToClipboard = () => {
    const text = `${hadith.arab}\n\n[${collectionName} - حديث رقم: ${hadith.number}]`;
    navigator.clipboard.writeText(text);
    // You could add a toast here if available
  };

  const shareHadith = () => {
    const text = `${hadith.arab}\n\n[${collectionName} - حديث رقم: ${hadith.number}]`;
    if (navigator.share) {
      navigator.share({
        title: 'حديث نبوي شريف',
        text: text,
      }).catch(console.error);
    } else {
      copyToClipboard();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 rounded-3xl space-y-6 border border-gray-100 dark:border-white/10"
      dir="rtl"
    >
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold flex items-center justify-center font-bold font-mono">
            {hadith.number}
          </div>
          <div>
            <h3 className="font-bold font-tajawal text-gray-800 dark:text-gray-100">{collectionName}</h3>
            <p className="text-xs text-gray-500 font-tajawal">حديث شريف</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isFavorite ? "bg-red-500/10 text-red-500" : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-red-500"
            )}
          >
            <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary dark:hover:text-gold transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={shareHadith}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary dark:hover:text-gold transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        className="font-amiri leading-relaxed text-right text-gray-800 dark:text-gray-100"
        style={{ fontSize: `${fontSize}px` }}
      >
        {hadith.arab}
      </div>

      <div className="pt-4 flex items-center gap-2 text-xs text-gray-400 font-tajawal">
        <Book className="w-3.5 h-3.5" />
        <span>المصدر: {collectionName}</span>
      </div>
    </motion.div>
  );
}
