/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { PrayerTimes } from './pages/PrayerTimes';
import { Quran } from './pages/Quran';
import { Audio } from './pages/Audio';
import { Adhkar } from './pages/Adhkar';
import { Sunnah } from './pages/Sunnah';
import { Settings } from './pages/Settings';
import { AthanSettings } from './pages/AthanSettings';
import { HadithPage } from './pages/HadithPage';
import { HadithCollectionPage } from './pages/HadithCollectionPage';
import { HadithFavorites } from './pages/HadithFavorites';
import { Tracker } from './pages/Tracker';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="prayer-times" element={<PrayerTimes />} />
              <Route path="quran" element={<Quran />} />
              <Route path="audio" element={<Audio />} />
              <Route path="adhkar" element={<Adhkar />} />
              <Route path="sunnah" element={<Sunnah />} />
              <Route path="hadith" element={<HadithPage />} />
              <Route path="hadith/:collectionId" element={<HadithCollectionPage />} />
              <Route path="favorites" element={<HadithFavorites />} />
              <Route path="tracker" element={<Tracker />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/athan" element={<AthanSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AudioProvider>
    </ThemeProvider>
  );
}
