import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, VolumeX, Music } from 'lucide-react';

interface AthanToastProps {
  activeAthan: { prayer: string; type: 'adhan' | 'iqamah' } | null;
  onStop: () => void;
}

export function AthanToast({ activeAthan, onStop }: AthanToastProps) {
  return (
    <AnimatePresence>
      {activeAthan && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="glass-card p-6 rounded-3xl shadow-2xl border border-primary/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 dark:bg-gold/10 rounded-full flex items-center justify-center text-primary dark:text-gold animate-pulse">
                {activeAthan.type === 'adhan' ? <Music className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-tajawal">
                  {activeAthan.type === 'adhan' ? 'حان الآن وقت صلاة' : 'حان الآن موعد إقامة صلاة'}
                </p>
                <p className="text-xl font-bold font-amiri text-gray-900 dark:text-white">
                  {activeAthan.prayer}
                </p>
              </div>
            </div>
            
            <button
              onClick={onStop}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-bold font-tajawal hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              <VolumeX className="w-4 h-4" />
              <span>إيقاف</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
