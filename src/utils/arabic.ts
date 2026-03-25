export const normalizeArabic = (text: string) => {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u0652\u06D6-\u06ED\u0617-\u061A\u0640]/g, '') // Remove tashkeel, small signs, and tatweel
    .replace(/[أإآٱ]/g, 'ا') // Normalize Alif (including Wasla)
    .replace(/ة/g, 'ه') // Normalize Ta Marbuta
    .replace(/ى/g, 'ي') // Normalize Ya/Maksura
    .replace(/ؤ/g, 'و') // Normalize Waw with Hamza
    .replace(/ئ/g, 'ي') // Normalize Ya with Hamza
    .replace(/ء/g, '') // Remove standalone hamza for broader matching
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};
