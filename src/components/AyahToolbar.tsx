import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Copy, Bookmark, Share2, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AyahInfo {
  surah: number;
  ayah: number;
  page: number;
  text: string;
  surahName: string;
}

interface AyahToolbarProps {
  ayah: AyahInfo | null;
  position: { top: number; bottom: number; left: number } | null;
  isBookmarked: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onClose: () => void;
}

export function AyahToolbar({
  ayah,
  position,
  isBookmarked,
  isPlaying,
  onPlay,
  onBookmark,
  onShare,
  onClose
}: AyahToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!ayah) return;
      if (e.key.toLowerCase() === 'c') {
        handleCopy();
      } else if (e.key.toLowerCase() === 'b') {
        onBookmark();
      } else if (e.key.toLowerCase() === 'p') {
        onPlay();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ayah, onBookmark, onPlay, onClose]);

  const handleCopy = async () => {
    if (!ayah) return;
    const textToCopy = `"${ayah.text}"\n— سورة ${ayah.surahName} (${ayah.ayah})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (toolbarRef.current) {
        setDimensions({
          width: toolbarRef.current.offsetWidth,
          height: toolbarRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [ayah]);

  if (!ayah || !position) return null;

  let leftPos = position.left;
  let topPos = position.top;
  let showBelow = false;

  if (!isMobile && dimensions.width > 0) {
    // Clamp left position to keep toolbar on screen
    const halfWidth = dimensions.width / 2;
    const padding = 20;
    leftPos = Math.max(halfWidth + padding, Math.min(window.innerWidth - halfWidth - padding, leftPos));
    
    // Check if showing above would go off-screen (top)
    // The toolbar is positioned at topPos, but shifted up by its height + 10px
    if (topPos - dimensions.height - 20 < 0) {
      showBelow = true;
      topPos = position.bottom; // Position at the bottom of the ayah
    }
  }

  const style: React.CSSProperties = isMobile 
    ? {
        position: 'fixed',
        bottom: 'max(32px, env(safe-area-inset-bottom))',
        left: '16px',
        right: '16px',
        zIndex: 100,
        maxWidth: '400px',
        margin: '0 auto'
      }
    : {
        position: 'fixed',
        top: `${topPos}px`,
        left: `${leftPos}px`,
        transform: showBelow 
          ? 'translate(-50%, 10px)' // Show below the ayah
          : 'translate(-50%, -100%) translateY(-10px)', // Show above the ayah
        zIndex: 100,
      };

  return (
    <>
      <AnimatePresence>
        {ayah && (
          <motion.div
            ref={toolbarRef}
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={style}
            className={cn(
              "flex items-center justify-around sm:justify-center gap-1 p-2 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.2)]",
              "bg-white/95 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/10",
              "overflow-hidden"
            )}
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <ToolbarButton 
              icon={isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />} 
              label={isPlaying ? "إيقاف" : "تشغيل"} 
              onClick={onPlay} 
              active={isPlaying}
              isMobile={isMobile}
            />
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton 
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} 
              label="نسخ" 
              onClick={handleCopy} 
              active={copied}
              isMobile={isMobile}
            />
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton 
              icon={<Bookmark className="w-4 h-4" />} 
              label="حفظ" 
              onClick={onBookmark} 
              active={isBookmarked}
              isMobile={isMobile}
            />
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton 
              icon={<Share2 className="w-4 h-4" />} 
              label="مشاركة" 
              onClick={onShare} 
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-tajawal flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            تم نسخ الآية بنجاح
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ToolbarButton({ icon, label, onClick, active, isMobile }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean, isMobile?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center flex-1 sm:flex-none sm:w-16 h-12 rounded-xl transition-all duration-200",
        active 
          ? "text-gold bg-gold/10 scale-105" 
          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95"
      )}
      title={isMobile ? undefined : label}
    >
      <div className={cn("transition-transform duration-200", active && "scale-110")}>
        {icon}
      </div>
      <span className="text-[10px] mt-1 font-tajawal font-medium opacity-90">{label}</span>
    </button>
  );
}
