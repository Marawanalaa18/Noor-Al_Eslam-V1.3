import React from 'react';
import { Search, X } from 'lucide-react';

interface HadithSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function HadithSearch({ value, onChange }: HadithSearchProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ابحث في الأحاديث (مثلاً: الصلاة، الصدقة، الصبر)..."
        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pr-12 pl-12 text-right font-tajawal outline-none focus:ring-2 focus:ring-primary dark:focus:ring-gold transition-all"
        dir="rtl"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

interface HadithPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function HadithPagination({ currentPage, totalPages, onPageChange }: HadithPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-12" dir="rtl">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-6 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold font-tajawal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
      >
        السابق
      </button>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold font-tajawal text-gray-500 dark:text-gray-400">صفحة</span>
        <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold flex items-center justify-center font-bold font-mono">
          {currentPage}
        </span>
        <span className="text-sm font-bold font-tajawal text-gray-500 dark:text-gray-400">من {totalPages}</span>
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-6 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold font-tajawal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
      >
        التالي
      </button>
    </div>
  );
}
