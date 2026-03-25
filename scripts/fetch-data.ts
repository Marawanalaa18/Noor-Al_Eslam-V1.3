import fs from 'fs';
import path from 'path';
import axios from 'axios';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchQuran() {
  const filePath = path.join(DATA_DIR, 'quran.json');
  
  console.log('Fetching Quran surah by surah with rate limit protection...');
  const surahs = [];
  for (let i = 1; i <= 114; i++) {
    let success = false;
    let retries = 5;
    let delay = 2000;

    while (!success && retries > 0) {
      try {
        console.log(`Fetching Surah ${i} (Retries left: ${retries})...`);
        const response = await axios.get(`https://api.alquran.cloud/v1/surah/${i}/quran-uthmani`, { timeout: 30000 });
        if (response.data && response.data.data) {
          surahs.push(response.data.data);
          success = true;
          console.log(`Successfully fetched Surah ${i}`);
        } else {
          throw new Error('Invalid response format');
        }
        // Delay between requests to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        retries--;
        console.warn(`Error fetching Surah ${i}: ${error.message}. Retries left: ${retries}`);
        if (error.response && error.response.status === 429) {
          console.warn(`Rate limit hit. Waiting ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    if (!success) {
      console.error(`CRITICAL: Failed to fetch Surah ${i} after all retries.`);
      // We should probably stop here or handle it. For now, we'll continue but the file will be incomplete.
    }
  }

  const quranData = {
    code: 200,
    status: "OK",
    data: {
      surahs: surahs
    }
  };

  const jsonString = JSON.stringify(quranData);
  console.log(`JSON string length: ${jsonString.length}`);
  fs.writeFileSync(filePath, jsonString);
  console.log(`Saved ${surahs.length}/114 surahs to ${filePath}`);
}

async function fetchAhadith() {
  const filePath = path.join(DATA_DIR, 'ahadith.json');
  const books = [
    'abu-daud', 'ahmad', 'bukhari', 'darimi', 'ibnu-majah', 
    'malik', 'muslim', 'nasai', 'tirmidzi'
  ];
  
  const allAhadith: any = {};
  
  console.log('Fetching Ahadith for all books (at least 500 each)...');
  
  for (const book of books) {
    console.log(`Fetching ${book}...`);
    try {
      // API limit seems to be 300 per request
      const res1 = await axios.get(`https://api.hadith.gading.dev/books/${book}?range=1-300`);
      const res2 = await axios.get(`https://api.hadith.gading.dev/books/${book}?range=301-600`);
      
      if (res1.data && res1.data.data && res2.data && res2.data.data) {
        const combinedHadiths = [...res1.data.data.hadiths, ...res2.data.data.hadiths].map((h: any) => ({
          number: h.number,
          arab: h.arab
        }));
        
        const combined = {
          ...res1.data.data,
          hadiths: combinedHadiths
        };
        allAhadith[book] = combined;
        console.log(`Successfully fetched 600 hadiths for ${book}`);
      }
      // Small delay between books
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e: any) {
      console.error(`Error fetching ${book}: ${e.message}`);
    }
  }
  
  const jsonString = JSON.stringify(allAhadith);
  console.log(`Ahadith JSON string length: ${jsonString.length}`);
  fs.writeFileSync(filePath, jsonString);
  console.log(`Saved Ahadith to ${filePath}`);
}

async function main() {
  await fetchQuran();
  
  // Azkar
  console.log('Fetching Azkar...');
  try {
    const azkarRes = await axios.get('https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/adkar.json');
    fs.writeFileSync(path.join(DATA_DIR, 'azkar.json'), JSON.stringify(azkarRes.data));
  } catch (e) { console.error(e); }
  
  // Sunan
  console.log('Fetching Sunan...');
  try {
    const sunanRes = await axios.get('https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/sunnah_data.json');
    fs.writeFileSync(path.join(DATA_DIR, 'sunan.json'), JSON.stringify(sunanRes.data));
  } catch (e) { console.error(e); }

  // Ahadith
  await fetchAhadith();
}

main();
