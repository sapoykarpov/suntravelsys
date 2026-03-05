'use client';

// Production deployment trigger
import { useState } from 'react';
import Link from 'next/link';
import DMIViewer from '@/components/DMIViewer';
import { mockItinerary } from '@/lib/mockData';
import { ThemeTemplate } from '@/types/itinerary';

export default function Home() {
  const [theme, setTheme] = useState<ThemeTemplate>('amazing-black');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Inject the chosen theme into our mock payload
  const currentData = { ...mockItinerary, theme };

  if (isPreviewMode) {
    return (
      <main className="relative min-h-screen">
        <div className="fixed top-4 left-4 z-[9999] bg-white/90 backdrop-blur p-4 rounded-xl shadow-2xl flex flex-col gap-2 max-w-[200px] border border-black/10">
          <button
            onClick={() => setIsPreviewMode(false)}
            className="text-[10px] font-bold text-gray-500 hover:text-black uppercase mb-2 self-start"
          >
            ← Exit Preview
          </button>
          <label className="text-xs font-bold text-black uppercase tracking-widest">Switch Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeTemplate)}
            className="bg-black text-white text-xs p-2 rounded-lg cursor-pointer outline-none"
          >
            <option value="amazing-black">Amazing Black (Luxury)</option>
            <option value="bento">Bento (Modern)</option>
            <option value="viral-tiktok">Viral TikTok (Vertical)</option>
            <option value="bali-andi">Bali Andi (Elegant)</option>
            <option value="scrapbook">Scrapbook (Playful)</option>
          </select>
        </div>
        <DMIViewer data={currentData} />
      </main>
    );
  }

  return (
    <div className="home-root">
      <style dangerouslySetInnerHTML={{
        __html: `
        .home-root {
          min-height: 100vh;
          background: #0a0a0a;
          color: #fff;
          font-family: var(--font-inter), sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
        }
        .home-brand {
          font-family: var(--font-playfair), serif;
          font-size: 48px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #B8860B, #D4AF37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .home-tag {
          font-size: 16px;
          color: rgba(255,255,255,0.5);
          max-width: 480px;
          line-height: 1.6;
          margin-bottom: 40px;
        }
        .home-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .btn-dash {
          background: #B8860B;
          color: #000;
          padding: 14px 32px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s;
        }
        .btn-dash:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(184, 134, 11, 0.3);
        }
        .btn-preview {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 14px 32px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        `
      }} />

      <h1 className="home-brand">Travel Asset Engine</h1>
      <p className="home-tag">
        Platform itinerari digital & microblog modern untuk agen travel premium.
        Tingkatkan konversi penjualan Anda dengan desain yang memukau.
      </p>

      <div className="home-actions">
        <Link href="/admin" className="btn-dash">
          Masuk ke Dashboard Admin →
        </Link>
        <button onClick={() => setIsPreviewMode(true)} className="btn-preview">
          Preview Tema DMI
        </button>
      </div>

      <footer style={{ marginTop: 80, fontSize: 11, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px' }}>
        LuxeTravel Digital • 2026
      </footer>
    </div>
  );
}
