import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'noor_islam_db';
const DB_VERSION = 1;

export interface OfflineData {
  id: string;
  type: 'quran_surah' | 'adhkar_category' | 'prayer_times';
  data: any;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('offline_content')) {
          db.createObjectStore('offline_content', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveToOffline = async (id: string, type: OfflineData['type'], data: any) => {
  const db = await getDB();
  await db.put('offline_content', {
    id,
    type,
    data,
    timestamp: Date.now(),
  });
};

export const getFromOffline = async (id: string) => {
  const db = await getDB();
  const result = await db.get('offline_content', id);
  return result?.data || null;
};

export const clearOfflineData = async () => {
  const db = await getDB();
  await db.clear('offline_content');
};
