'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ItineraryPayload } from '@/types/itinerary';
import { imageWithFallback } from '@/lib/utils/images';
import {
  Navigation,
  MapPin,
  Heart,
  Share2,
  MessageCircle,
  Moon,
  Camera,
  Coffee,
  Plane,
  ChevronRight,
  Play
} from 'lucide-react';

interface Activity {
  time: string;
  title: string;
  description: string;
  iconCategory?: string;
}

interface Day {
  dayNumber: number;
  title: string;
  location: string;
  summary: string;
  heroImage?: string;
  videoUrl?: string;
  activities: Activity[];
}

export default function ThemeInteractiveMap({
  data,
  isCoverVisible = true,
  scrollProgress: centralizedProgress = 0
}: {
  data: ItineraryPayload,
  isCoverVisible?: boolean,
  scrollProgress?: number
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [playingDayIdx, setPlayingDayIdx] = useState<number | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Preprocess WhatsApp link once
  const whatsappNumber = data.brand.whatsapp?.replace(/[^0-9]/g, '');
  const contactLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : `mailto:${data.brand.email}`;

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollTop = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? Math.min(100, (scrollTop / maxScroll) * 100) : 0;
        setScrollProgress(progress);

        // Update active step based on scroll position
        const step = Math.min(
          Math.floor((progress / 100) * data.days.length),
          Math.max(0, data.days.length - 1)
        );
        setActiveStep(step);
      }, 50); // 50ms debounce
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [data.days.length]);

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('im-fade-in-active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    document.querySelectorAll('.im-fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Safe coordinate generator for SVG path (clamped to 0-100 viewBox)
  const getCoords = (index: number, total: number) => {
    const spacing = total > 1 ? 70 / (total - 1) : 0;
    const x = 15 + index * spacing;
    const y = 75 - (index * 8) % 50;
    // Clamp to viewBox bounds
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  // Generate smooth SVG path with clamped coordinates
  const svgPath = data.days.length > 0 ? data.days.reduce((acc, _, index) => {
    const coords = getCoords(index, data.days.length);
    if (index === 0) return `M ${coords.x} ${coords.y}`;
    const prev = getCoords(index - 1, data.days.length);
    const cpX = Math.max(5, Math.min(95, (prev.x + coords.x) / 2 + (index % 2 === 0 ? 8 : -8)));
    const cpY = Math.max(10, Math.min(90, (prev.y + coords.y) / 2));
    return `${acc} Q ${cpX} ${cpY} ${coords.x} ${coords.y}`;
  }, "") : "";

  const renderActivityIcon = (iconCategory?: string) => {
    switch (iconCategory) {
      case 'flight': return <Plane size={16} aria-hidden="true" />;
      case 'hotel': return <Moon size={16} aria-hidden="true" />;
      case 'meal': return <Coffee size={16} aria-hidden="true" />;
      case 'transport': return <Navigation size={16} aria-hidden="true" />;
      default: return <Camera size={16} aria-hidden="true" />;
    }
  };

  const primary = data.brand.primaryColor || '#1d4ed8';

  return (
    <div className="im-root" ref={containerRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&family=Montserrat:wght@400;700;800&display=swap');
        
        .im-root {
          font-family: 'Space Grotesk', sans-serif;
          background: #fcfaf2;
          color: #2c2c2c;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          --primary: ${primary};
        }
        .im-root * { box-sizing: border-box; max-width: 100%; }
        
        .im-container {
          width: 100%;
          max-width: 650px;
          background: #fcfaf2;
          min-height: 100vh;
          position: relative;
          z-index: 10;
          padding-bottom: 100px;
        }

        .font-montserrat { font-family: 'Montserrat', sans-serif !important; }

        /* MAP BACKGROUND */
        .im-map-bg {
          position: fixed; inset: 0;
          background-image: radial-gradient(#d1d5db 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }
        .im-svg-map {
          position: fixed; top: 10%; left: 0; width: 100%; height: 80%;
          opacity: 0.15; pointer-events: none; z-index: 0;
        }

        /* ANIMATIONS */
        .im-fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease-out;
        }
        .im-fade-in-active {
          opacity: 1;
          transform: translateY(0);
        }
        .im-fade-in-delay-1 { transition-delay: 0.1s; }
        .im-fade-in-delay-2 { transition-delay: 0.2s; }
        .im-fade-in-delay-3 { transition-delay: 0.3s; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .im-pulse { animation: pulse 2s ease-in-out infinite; }

        /* HERO */
        .im-hero {
          padding: 80px 24px 40px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
          min-height: 50vh;
          justify-content: center;
        }
        .im-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(29, 78, 216, 0.1); color: var(--primary);
          padding: 6px 16px; border-radius: 50px;
          font-size: 10px; font-weight: 700;
          margin-bottom: 24px;
          border: 1px solid rgba(29, 78, 216, 0.2);
        }
        .im-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(28px, 9vw, 48px);
          font-weight: 800; line-height: 1.1;
          text-transform: uppercase; margin-bottom: 16px;
          word-break: break-word; text-align: center;
        }
        .im-subtitle {
          font-size: 14px; opacity: 0.7; max-width: 400px; line-height: 1.5;
        }

        /* DAYS */
        .im-day-section { 
          padding: 20px 24px 40px;
          transition: all 0.5s ease;
        }
        .im-day-card {
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          border: 1px solid #eee;
          margin-bottom: 24px;
        }
        .im-day-img { 
          width: 100%; 
          height: 240px; 
          object-fit: cover; 
          display: block;
        }
        .im-day-content { padding: 24px; }
        .im-day-h2 { 
          font-family: 'Montserrat', sans-serif; 
          font-size: 22px; 
          font-weight: 700; 
          margin: 0 0 12px; 
          line-height: 1.3;
        }
        .im-day-summary {
          font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 24px; font-style: italic;
        }

        .im-activities { display: flex; flex-direction: column; gap: 16px; }
        .im-act { display: flex; gap: 12px; }
        .im-act-icon { 
          color: var(--primary); 
          margin-top: 2px; 
          flex-shrink: 0;
        }
        .im-act-content { flex: 1; min-width: 0; }
        .im-act-time { 
          font-size: 10px; 
          opacity: 0.5; 
          font-weight: 700; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .im-act-title { 
          font-weight: 600; 
          font-size: 14px; 
          margin: 2px 0 4px;
          word-break: break-word;
        }
        .im-act-desc { 
          font-size: 13px; 
          color: #666; 
          line-height: 1.5;
          word-break: break-word;
        }

        /* PRICING */
        .im-price-deck {
          background: #1a1a1a;
          color: #fff;
          padding: 48px 24px 80px;
          border-radius: 32px 32px 0 0;
          width: 100%;
          margin-top: 20px;
        }
        .im-price {
          font-size: clamp(28px, 8vw, 40px);
          color: var(--primary);
          font-family: 'Montserrat', sans-serif;
          font-weight: 800; margin: 8px 0;
        }
        .im-price-note { opacity: 0.5; font-size: 12px; }
        .im-inc-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .im-inc-item { 
          display: flex; gap: 10px; 
          font-size: 14px; 
          color: rgba(255,255,255,0.8);
          word-break: break-word;
        }
        .im-inc-check { color: var(--primary); font-weight: bold; flex-shrink: 0; }

        /* FLOATING NAV */
        .im-nav-float {
          position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(100px);
          width: calc(100% - 32px); max-width: 420px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.08);
          padding: 10px 16px;
          border-radius: 50px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          z-index: 100;
          opacity: 0;
          pointer-events: none;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .im-nav-float.v-active {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        .im-nav-actions { display: flex; gap: 12px; }
        .im-nav-btn {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; cursor: pointer;
          color: #666; transition: all 0.2s;
        }
        .im-nav-btn:hover { background: rgba(0,0,0,0.05); color: var(--primary); }
        .im-btn-cta {
          background: var(--primary); color: #fff;
          padding: 10px 20px; border-radius: 40px;
          font-weight: 700; font-size: 12px;
          text-transform: uppercase; letter-spacing: 0.5px;
          text-decoration: none; display: flex; align-items: center; gap: 6px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .im-btn-cta:hover { 
          transform: translateY(-1px); 
          box-shadow: 0 4px 16px rgba(29, 78, 216, 0.3);
        }

        /* PROGRESS BAR */
        .im-progress {
          position: fixed; top: 0; left: 0; height: 3px;
          background: var(--primary);
          z-index: 200;
          transition: width 0.1s ease-out;
        }

        /* MOBILE OPTIMIZATION */
        @media (max-width: 480px) {
          .im-hero { padding: 60px 20px 30px; }
          .im-title { font-size: clamp(24px, 8vw, 36px); }
          .im-day-img { height: 200px; }
          .im-day-content { padding: 20px; }
          .im-day-h2 { font-size: 18px; }
          .im-nav-float { width: calc(100% - 24px); padding: 8px 14px; }
          .im-btn-cta { padding: 9px 16px; font-size: 11px; }
        }
      `}</style>

      {/* Progress Bar */}
      <div className="im-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />

      {/* Map Background */}
      <div className="im-map-bg" aria-hidden="true" />
      <div className="im-svg-map" aria-hidden="true">
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
          <path
            d={svgPath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="0.4"
            strokeLinecap="round"
          />
          {/* Animated dots for each day */}
          {data.days.map((_, idx) => {
            const coords = getCoords(idx, data.days.length);
            const isActive = idx === activeStep;
            return (
              <circle
                key={idx}
                cx={coords.x}
                cy={coords.y}
                r={isActive ? 1.8 : 1}
                fill={isActive ? 'var(--primary)' : '#d1d5db'}
                className={isActive ? 'im-pulse' : ''}
              />
            );
          })}
        </svg>
      </div>

      <div className="im-container">
        {/* HERO */}
        <section className="im-hero im-fade-in im-fade-in-active" style={{
          justifyContent: data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'bottom' ? 'flex-end' : 'center',
        }}>
          <div className="im-badge">
            <Navigation size={14} aria-hidden="true" />
            <span>EXPLORER'S ROUTE</span>
          </div>
          <h1 className="im-title" style={{
            ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
            ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
            ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
            ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
          }}>{data.meta.title}</h1>
          <p className="im-subtitle">{data.meta.subtitle}</p>
        </section>

        {/* ITINERARY DAYS */}
        <main>
          {data.days.map((day: Day, idx: number) => {
            const coords = getCoords(idx, data.days.length);
            const isActive = idx === activeStep;

            return (
              <div
                key={idx}
                ref={(el) => { sectionsRef.current[idx] = el; }}
                className={`im-day-section im-fade-in im-fade-in-delay-${(idx % 3) + 1}`}
                style={{
                  opacity: isActive ? 1 : 0.3,
                  filter: isActive ? 'none' : 'blur(2px)',
                }}
              >
                <div className="im-day-card">
                  {/* Day Image with fallback */}
                  <div style={{ position: 'relative' }}>
                    <img
                      src={imageWithFallback(day.heroImage, 'travel')}
                      alt={day.title || `Day ${day.dayNumber}`}
                      className="im-day-img"
                      loading={idx > 1 ? 'lazy' : 'eager'}
                    />
                    {day.videoUrl && (
                      <button onClick={() => setPlayingVideoId(day.videoUrl!)} style={{
                        position: 'absolute', bottom: 16, right: 16,
                        background: 'rgba(255,255,255,0.95)', borderRadius: '50%',
                        width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer', border: 'none', padding: 0
                      }}>
                        <Play size={20} fill="currentColor" color="#1a1a1a" />
                      </button>
                    )}
                  </div>

                  <div className="im-day-content">
                    {/* Location Badge */}
                    <div
                      className="im-fade-in"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 10, fontWeight: 700, color: 'var(--primary)',
                        textTransform: 'uppercase', marginBottom: 10
                      }}
                    >
                      <MapPin size={10} aria-hidden="true" />
                      <span>{day.location}</span>
                    </div>

                    {/* Day Title */}
                    <h2 className="im-day-h2 im-fade-in im-fade-in-delay-1">{day.title}</h2>

                    {/* Summary */}
                    <p className="im-day-summary im-fade-in im-fade-in-delay-2">{day.summary}</p>

                    {/* Activities */}
                    <div className="im-activities">
                      {day.activities.map((act: Activity, i) => (
                        <div key={i} className="im-act im-fade-in">
                          <div className="im-act-icon">
                            {renderActivityIcon(act.iconCategory)}
                          </div>
                          <div className="im-act-content">
                            <div className="im-act-time">{act.time}</div>
                            <div className="im-act-title">{act.title}</div>
                            <p className="im-act-desc">{act.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* PRICING SECTION */}
        <section className="im-price-deck im-fade-in">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h3 className="font-montserrat" style={{ fontSize: '14px', fontWeight: 700, opacity: 0.4, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>
              THE EXPEDITION
            </h3>
            <div className="im-price">{data.meta.price}</div>
            <p className="im-price-note">{data.meta.priceNote}</p>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, opacity: 0.3, textTransform: 'uppercase', marginBottom: 16, letterSpacing: '1px' }}>
              Inclusions
            </h4>
            <div className="im-inc-list">
              {data.inclusions.map((inc, i) => (
                <div key={i} className="im-inc-item">
                  <span className="im-inc-check" aria-hidden="true">✓</span>
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 48, textAlign: 'center', opacity: 0.3 }}>
            <div className="font-montserrat" style={{ fontSize: 18, fontWeight: 800 }}>{data.brand.name}</div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '3px', marginTop: 6 }}>
              Powered by SunTravelSys
            </div>
          </div>
        </section>
      </div>

      {/* FLOATING NAVIGATION */}
      <nav className={`im-nav-float ${!isCoverVisible ? 'v-active' : ''}`} role="navigation" aria-label="Quick actions">
        <div className="im-nav-actions">
          <button
            className="im-nav-btn"
            aria-label="Add to favorites"
            onClick={(e) => { e.preventDefault(); /* Add like logic */ }}
          >
            <Heart size={18} aria-hidden="true" />
          </button>
          <button
            className="im-nav-btn"
            aria-label="Share itinerary"
            onClick={(e) => { e.preventDefault(); /* Add share logic */ }}
          >
            <Share2 size={18} aria-hidden="true" />
          </button>
        </div>

        <a
          href={contactLink}
          target="_blank"
          rel="noopener noreferrer"
          className="im-btn-cta"
          aria-label="Book this itinerary via WhatsApp"
        >
          Book Now <ChevronRight size={14} aria-hidden="true" />
        </a>
      </nav>

      {/* Video Modal */}
      {playingVideoId && (
        <div onClick={() => setPlayingVideoId(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '90%', maxWidth: '900px', aspectRatio: '16/9' }}>
            <iframe src={`https://www.youtube.com/embed/${playingVideoId}`} frameBorder="0" allowFullScreen style={{ width: '100%', height: '100%', borderRadius: 8 }} />
            <button onClick={() => setPlayingVideoId(null)} style={{
              position: 'absolute', top: -36, right: 0, background: 'none', border: 'none',
              color: '#fff', cursor: 'pointer', fontSize: 28, padding: 0
            }}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}