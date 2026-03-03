'use client';

import { useState } from 'react';
import DMIViewer from '@/components/DMIViewer';
import { mockItinerary } from '@/lib/mockData';
import { ThemeTemplate } from '@/types/itinerary';

export default function Home() {
  const [theme, setTheme] = useState<ThemeTemplate>('amazing-black');

  // Inject the chosen theme into our mock payload
  const currentData = { ...mockItinerary, theme };

  return (
    <main className="relative min-h-screen">
      {/* Dev-only Theme Switcher */}
      <div className="fixed top-4 left-4 z-[9999] bg-white/90 backdrop-blur p-4 rounded-xl shadow-2xl flex flex-col gap-2 max-w-[200px] border border-black/10">
        <label className="text-xs font-bold text-black uppercase tracking-widest">Dev: Switch Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeTemplate)}
          className="bg-black text-white text-xs p-2 rounded-lg cursor-pointer outline-none"
        >
          <option value="amazing-black">Amazing Black (Luxury)</option>
          <option value="bento">Bento (Modern)</option>
          <option value="viral-tiktok">Viral TikTok (Vertical)</option>
          <option disabled value="scrapbook">Scrapbook (In Dev)</option>
          <option disabled value="interactive-map">Interactive Map (In Dev)</option>
        </select>
      </div>

      {/* The Core Viewer Component */}
      <DMIViewer data={currentData} />
    </main>
  );
}
