import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Hadith, HadithResponse, FavoriteHadith } from '../types/hadith';
import { useLocalStorage } from './useLocalStorage';

const API_BASE_URL = 'https://api.hadith.gading.dev/books';

export function useHadith(collectionId?: string) {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionInfo, setCollectionInfo] = useState<{ name: string; available: number } | null>(null);
  const [favorites, setFavorites] = useLocalStorage<FavoriteHadith[]>('favoriteHadiths', []);

  const fetchHadiths = useCallback(async (page: number = 1, limit: number = 300) => {
    if (!collectionId) return;
    setLoading(true);
    setError(null);
    try {
      // Try local file first
      const localRes = await axios.get('/data/ahadith.json');
      const localData = localRes.data[collectionId];
      if (localData && localData.id === collectionId) {
        setHadiths(localData.hadiths);
        setCollectionInfo({ name: localData.name, available: localData.available });
        setLoading(false);
        return;
      }
    } catch (e) {
      console.log('Local hadith file not found or mismatch, trying API...');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/${collectionId}?range=${(page - 1) * limit + 1}-${page * limit}`, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
        }
      });
      const data: HadithResponse = response.data.data;
      setHadiths(data.hadiths);
      setCollectionInfo({ name: data.name, available: data.available });
    } catch (err: any) {
      console.error('Error fetching hadiths:', err);
      if (err.code === 'ECONNABORTED') {
        setError('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
      } else if (err.message === 'Network Error') {
        setError('خطأ في الاتصال بالشبكة. يرجى التأكد من اتصالك بالإنترنت.');
      } else {
        setError('فشل في جلب الأحاديث. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  const toggleFavorite = (hadith: Hadith, collectionName: string) => {
    if (!collectionId) return;
    const isFavorite = favorites.some(f => f.number === hadith.number && f.collectionId === collectionId);
    if (isFavorite) {
      setFavorites(prev => prev.filter(f => !(f.number === hadith.number && f.collectionId === collectionId)));
    } else {
      setFavorites(prev => [...prev, { ...hadith, collectionId, collectionName }]);
    }
  };

  const isFavorite = (hadithNumber: number) => {
    return favorites.some(f => f.number === hadithNumber && f.collectionId === collectionId);
  };

  return {
    hadiths,
    loading,
    error,
    collectionInfo,
    fetchHadiths,
    favorites,
    toggleFavorite,
    isFavorite,
    setFavorites
  };
}
