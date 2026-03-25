import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, Theme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { id: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: 'light', 
      label: 'الوضع الفاتح', 
      icon: <Sun className="w-6 h-6" />,
      description: 'مظهر مشرق ومريح للعين في النهار'
    },
    { 
      id: 'dark', 
      label: 'الوضع الداكن', 
      icon: <Moon className="w-6 h-6" />,
      description: 'مظهر داكن يقلل إجهاد العين ليلاً'
    },
    { 
      id: 'system', 
      label: 'تلقائي حسب الجهاز', 
      icon: <Laptop className="w-6 h-6" />,
      description: 'يتغير المظهر تلقائياً حسب إعدادات جهازك'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((option) => (
        <motion.button
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTheme(option.id)}
          className={cn(
            "relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 text-right",
            theme === option.id 
              ? "bg-primary/5 border-primary dark:bg-gold/5 dark:border-gold shadow-lg" 
              : "bg-white border-gray-100 hover:border-primary/30 dark:bg-surface-dark dark:border-white/5 dark:hover:border-gold/30"
          )}
        >
          {theme === option.id && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 left-4 bg-primary dark:bg-gold text-white dark:text-primary-dark p-1 rounded-full"
            >
              <Check className="w-3 h-3" />
            </motion.div>
          )}

          <div className={cn(
            "p-4 rounded-2xl mb-4 transition-colors",
            theme === option.id 
              ? "bg-primary text-white dark:bg-gold dark:text-primary-dark" 
              : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
          )}>
            {option.icon}
          </div>

          <h3 className={cn(
            "text-lg font-tajawal font-bold mb-1",
            theme === option.id ? "text-primary dark:text-gold" : "text-gray-700 dark:text-gray-200"
          )}>
            {option.label}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-tajawal">
            {option.description}
          </p>
        </motion.button>
      ))}
    </div>
  );
};
