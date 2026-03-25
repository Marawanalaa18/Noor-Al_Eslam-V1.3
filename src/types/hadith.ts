export interface Hadith {
  number: number;
  arab: string;
  id?: string; // Indonesian translation (from some APIs)
  translation?: string; // Indonesian translation (from gading.dev)
}

export interface HadithResponse {
  name: string;
  id: string;
  available: number;
  hadiths: Hadith[];
}

export interface HadithCollection {
  id: string;
  name: string;
  available: number;
}

export interface FavoriteHadith extends Hadith {
  collectionId: string;
  collectionName: string;
}
