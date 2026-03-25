import { useState, useEffect } from 'react';
import axios from 'axios';
import { alquranApi } from '@/utils/api';
import { normalizeArabic } from '@/utils/arabic';
import { getFromOffline, saveToOffline } from '@/utils/db';

export interface Ayah {
  number: number;
  text: string;
  normalizedText?: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
}

export interface QuranData {
  surahs: any[];
  ayahs: Ayah[];
  pages: Record<number, Ayah[]>;
  surahStartPages: Record<number, number>;
}

export function useQuranData() {
  const [data, setData] = useState<QuranData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const refetch = () => {
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    const fetchQuran = async () => {
      setLoading(true);
      setError(null);
      try {
        const cached = await getFromOffline('quran-uthmani');
        if (cached && retryCount === 0) {
          setData(cached);
          setLoading(false);
          return;
        }

        const res = await axios.get('/data/quran.json');
        const surahs = res.data.data.surahs;
        
        const ayahs: Ayah[] = [];
        const pages: Record<number, Ayah[]> = {};
        const surahStartPages: Record<number, number> = {};

        surahs.forEach((surah: any) => {
          surah.ayahs.forEach((ayah: any) => {
            const ayahWithSurah = { 
              ...ayah, 
              normalizedText: normalizeArabic(ayah.text),
              surah: {
                number: surah.number,
                name: surah.name,
                englishName: surah.englishName,
                englishNameTranslation: surah.englishNameTranslation,
                revelationType: surah.revelationType,
                numberOfAyahs: surah.ayahs.length
              }
            };
            ayahs.push(ayahWithSurah);
            
            if (!pages[ayah.page]) {
              pages[ayah.page] = [];
            }
            pages[ayah.page].push(ayahWithSurah);

            if (ayah.numberInSurah === 1) {
              surahStartPages[surah.number] = ayah.page;
            }
          });
        });

        const quranData: QuranData = { surahs, ayahs, pages, surahStartPages };
        await saveToOffline('quran-uthmani', 'quran_surah', quranData);
        setData(quranData);
      } catch (err: any) {
        console.error('Failed to fetch Quran data:', err);
        setError('تعذر تحميل بيانات القرآن. يرجى التحقق من اتصالك بالإنترنت.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuran();
  }, [retryCount]);

  return { data, loading, error, refetch };
}
