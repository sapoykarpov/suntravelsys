'use client';

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Calendar,
    Clock,
    ChevronDown,
    MessageCircle,
    Check,
    Plane,
    Hotel,
    Coffee,
    Car,
    Camera,
    Share2,
    Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ItineraryPayload } from '@/types/itinerary';
import { imageWithFallback } from '@/lib/utils/images';

export default function ThemeJapanEditorial({
    data,
    isCoverVisible = true,
    scrollProgress = 0
}: {
    data: ItineraryPayload,
    isCoverVisible?: boolean,
    scrollProgress?: number
}) {
    const [activeDay, setActiveDay] = useState<number>(1);
    const [isScrolled, setIsScrolled] = useState(false); const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    useEffect(() => {
        const handleScroll = () => {
            // Centralized isCoverVisible now handles visibility
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const primaryColor = data.brand.primaryColor || '#c9a962';

    const renderActivityIcon = (category?: string) => {
        switch (category) {
            case 'flight': return <Plane size={16} />;
            case 'hotel': return <Hotel size={16} />;
            case 'meal': return <Coffee size={16} />;
            case 'transport': return <Car size={16} />;
            case 'camera': return <Camera size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="je-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
                
                .je-root {
                    font-family: 'Inter', sans-serif;
                    background: #FAFAFA;
                    color: #1a1a1a;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    --primary: ${primaryColor};
                }
                .je-root * { box-sizing: border-box; max-width: 100%; }
                
                .je-container {
                    width: 100%;
                    max-width: 650px;
                    background: #fff;
                    min-height: 100vh;
                    position: relative;
                    padding-bottom: 120px;
                    box-shadow: 0 0 40px rgba(0,0,0,0.03);
                }

                .font-serif { font-family: 'Crimson Text', serif !important; }

                /* HEADER */
                .je-header {
                    sticky top-0 z-50 transition-all duration-300;
                    background: white;
                    padding: 20px 24px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .je-brand-name { font-family: 'Crimson Text', serif; font-size: 24px; font-weight: 700; }

                /* HERO */
                .je-hero { padding: 40px 24px; }
                .je-hero-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .je-meta-item { display: flex; flex-direction: column; gap: 4px; }
                .je-meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999; font-weight: 700; }
                .je-meta-val { font-size: 13px; font-weight: 600; }

                .je-hero-title {
                    font-family: 'Crimson Text', serif;
                    font-size: clamp(36px, 10vw, 64px);
                    line-height: 1.1;
                    margin-bottom: 24px;
                    word-break: break-word;
                }
                .je-hero-sub {
                    font-size: 17px;
                    color: #666;
                    line-height: 1.6;
                    font-weight: 300;
                    margin-bottom: 40px;
                }

                /* GALLERY */
                .je-gallery {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 4px;
                    height: 400px;
                    margin: 0 24px 60px;
                    border-radius: 16px;
                    overflow: hidden;
                }
                .je-gal-img { width: 100%; height: 100%; object-fit: cover; }

                /* SECTION */
                .je-section { padding: 60px 24px; border-top: 1px solid #eee; }
                .je-section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #999; font-weight: 700; margin-bottom: 16px; display: block; }
                .je-section-h2 { font-family: 'Crimson Text', serif; font-size: clamp(28px, 8vw, 42px); line-height: 1.2; margin-bottom: 32px; }

                /* ITINERARY */
                .je-day {
                    border: 1px solid #eee;
                    border-radius: 16px;
                    margin-bottom: 12px;
                    overflow: hidden;
                }
                .je-day-trigger {
                    width: 100%; padding: 20px;
                    display: flex; align-items: center; gap: 16px;
                    text-align: left; background: #fff; border: none;
                }
                .je-day-num {
                    width: 44px; height: 44px;
                    border: 1px solid #eee;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Crimson Text', serif;
                    font-size: 18px; font-weight: 700;
                }
                .je-day-active .je-day-num { background: #000; color: #fff; border-color: #000; }
                
                /* INCLUSIONS */
                .je-inc-card {
                    display: flex; gap: 16px; padding: 20px;
                    background: #fff; border: 1px solid #f0f0f0;
                    border-radius: 12px; margin-bottom: 12px;
                }

                /* FOOTER BAR */
                .je-footer-bar {
                    position: fixed; 
                    bottom: 0; 
                    left: 50%;
                    transform: translateX(-50%) translateY(100%);
                    width: 100%;
                    max-width: 430px;
                    background: #fff; border-top: 1px solid #eee;
                    padding: 16px 24px; z-index: 100;
                    display: flex; justify-content: center;
                    box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
                    transition: all 0.5s ease;
                    opacity: 0;
                    pointer-events: none;
                }
                .je-footer-bar.v-active {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                    pointer-events: auto;
                }
                .je-footer-inner {
                    width: 100%; max-width: 650px;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .je-price-box { display: flex; flex-direction: column; }
                .je-book-btn {
                    background: #000; color: #fff;
                    padding: 12px 24px; border-radius: 50px;
                    font-size: 12px; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 2px;
                    text-decoration: none; display: flex; align-items: center; gap: 8px;
                }

                /* PRICING */
                .je-price-section {
                    padding: 60px 24px;
                    border-top: 1px solid #eee;
                    text-align: center;
                }
                .je-price-val {
                    font-family: 'Crimson Text', serif;
                    font-size: clamp(32px, 8vw, 48px);
                    font-weight: 700;
                    margin: 16px 0 8px;
                    color: #1a1a1a;
                }
                .je-price-note {
                    font-size: 13px;
                    color: #999;
                    font-style: italic;
                    margin-bottom: 32px;
                }
                .je-price-cta {
                    display: inline-block;
                    background: #1a1a1a;
                    color: #fff;
                    padding: 16px 40px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    text-decoration: none;
                    border-radius: 50px;
                    transition: all 0.2s;
                }
                .je-price-cta:hover {
                    background: var(--primary);
                }
                .je-inc-exc-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    text-align: left;
                    margin-top: 40px;
                }
                @media (max-width: 480px) {
                    .je-inc-exc-grid { grid-template-columns: 1fr; }
                }
                .je-inc-exc-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .je-inc-exc-list li {
                    font-size: 13px;
                    color: #666;
                    padding: 10px 0;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }
            `}} />

            <div className="je-container">
                <header className="je-header">
                    <div className="je-brand-name">{data.brand.name}</div>
                    <div style={{ width: 24, height: 1, background: '#000' }} />
                </header>

                <section className="je-hero" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'bottom' ? 'flex-end' : 'center',
                    minHeight: '40vh'
                }}>
                    <div className="je-hero-meta">
                        <div className="je-meta-item">
                            <span className="je-meta-label">Duration</span>
                            <span className="je-meta-val">{data.meta.durationDays}D / {data.meta.durationNights}N</span>
                        </div>
                        <div className="je-meta-item">
                            <span className="je-meta-label">Guests</span>
                            <span className="je-meta-val">{data.meta.groupSize}</span>
                        </div>
                    </div>

                    <h1 className="je-hero-title" style={{
                        ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                        ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                        ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                        ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                    }}>
                        {data.meta.title}
                    </h1>
                    <p className="je-hero-sub">{data.meta.subtitle}</p>
                </section>

                <div className="je-gallery">
                    <img src={imageWithFallback(data.meta.coverImage || data.days[0]?.heroImage, 'japan')} className="je-gal-img" alt="" />
                    <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 4 }}>
                        <img src={imageWithFallback(data.days[1]?.heroImage, 'city')} className="je-gal-img" alt="" />
                        <img src={imageWithFallback(data.days[2]?.heroImage, 'nature')} className="je-gal-img" alt="" />
                    </div>
                </div>

                <section className="je-section">
                    <span className="je-section-label">The Experience</span>
                    <h2 className="je-section-h2">Tidak Ada yang Terlewatkan, Tidak Ada yang Terburu-buru</h2>
                    <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#666', fontWeight: 300 }}>
                        {data.itinerarySummary?.[0] || 'Kami merancang perjalanan ini berdasarkan prinsip ichi-go ichi-e — "sekali dalam seumur hidup." Setiap momen adalah kesempatan unik.'}
                    </p>
                </section>

                <section className="je-section">
                    <span className="je-section-label">Itinerary</span>
                    <div className="je-itinerary-list">
                        {data.days.map((day, idx) => (
                            <div key={idx} className={`je-day ${activeDay === day.dayNumber ? 'je-day-active' : ''}`}>
                                <button className="je-day-trigger" onClick={() => setActiveDay(activeDay === day.dayNumber ? 0 : day.dayNumber)}>
                                    <div className="je-day-num">{day.dayNumber}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{day.title}</div>
                                        <div style={{ fontSize: '12px', color: '#999' }}>{day.location}</div>
                                    </div>
                                    <ChevronDown size={18} style={{ transform: activeDay === day.dayNumber ? 'rotate(180deg)' : '', transition: '0.3s' }} />
                                </button>
                                <AnimatePresence>
                                    {activeDay === day.dayNumber && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                                            <div style={{ padding: '0 20px 24px', borderTop: '1px solid #f9f9f9' }}>
                                                {day.heroImage && (
                                                    <div style={{ position: 'relative', marginBottom: '24px', borderRadius: '8px', overflow: 'hidden' }}>
                                                        <img src={day.heroImage} alt={day.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                                                        {day.videoUrl && (
                                                            <button onClick={() => setPlayingVideoId(day.videoUrl!)} style={{
                                                                position: 'absolute', bottom: 12, right: 12,
                                                                background: 'rgba(255,255,255,0.95)', borderRadius: '50%',
                                                                width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer', border: 'none', padding: 0
                                                            }}>
                                                                <Play size={16} fill="currentColor" color="#000" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', fontStyle: 'italic' }}>{day.summary}</p>
                                                <div style={{ display: 'grid', gap: '20px' }}>
                                                    {day.activities.map((act, i) => (
                                                        <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                                            <div style={{ color: primaryColor, marginTop: 4 }}>{renderActivityIcon(act.iconCategory)}</div>
                                                            <div>
                                                                <div style={{ fontSize: '10px', fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>{act.time}</div>
                                                                <div style={{ fontWeight: 700, fontSize: '14px' }}>{act.title}</div>
                                                                <div style={{ fontSize: '13px', color: '#777', lineHeight: '1.5' }}>{act.description}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="je-section">
                    <span className="je-section-label">Details</span>
                    <h2 className="je-section-h2">What's Included</h2>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {data.inclusions.map((inc, i) => (
                            <div key={i} className="je-inc-card">
                                <Check size={18} style={{ color: primaryColor, flexShrink: 0 }} />
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>{inc}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing */}
                <section className="je-price-section">
                    <span className="je-section-label">Investment</span>
                    <div className="je-price-val">{data.meta.price}</div>
                    {data.meta.priceNote && <p className="je-price-note">{data.meta.priceNote}</p>}
                    <a
                        href={`https://wa.me/${(data.brand as any).whatsapp?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="je-price-cta"
                    >
                        Reserve Now
                    </a>

                    <div className="je-inc-exc-grid">
                        <div>
                            <h4 style={{ fontFamily: 'Crimson Text, serif', fontSize: '18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Check size={18} style={{ color: primaryColor }} /> Inclusions
                            </h4>
                            <ul className="je-inc-exc-list">
                                {data.inclusions.map((inc, i) => (
                                    <li key={i}>
                                        <Check size={14} style={{ color: primaryColor, flexShrink: 0, marginTop: 2 }} />
                                        {inc}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontFamily: 'Crimson Text, serif', fontSize: '18px', marginBottom: 16, color: '#999' }}>
                                Exclusions
                            </h4>
                            <ul className="je-inc-exc-list">
                                {data.exclusions.map((exc, i) => (
                                    <li key={i} style={{ color: '#aaa' }}>
                                        {exc}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Footer Brand */}
                <section style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid #eee' }}>
                    <div style={{ fontFamily: 'Crimson Text', fontSize: '28px', fontWeight: 700, marginBottom: 8 }}>{data.brand.name}</div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px', color: primaryColor, fontWeight: 700 }}>{data.brand.tagline}</div>
                    <div style={{ marginTop: '40px', opacity: 0.2, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px' }}>Powered by SunTravelSys</div>
                </section >
            </div >

            <div className={`je-footer-bar ${!isCoverVisible ? 'v-active' : ''}`}>
                <div className="je-footer-inner" style={{ justifyContent: 'center' }}>
                    <a
                        href={`https://wa.me/${(data.brand as any).whatsapp?.replace(/[^0-9]/g, '')}`}
                        className="je-book-btn"
                    >
                        <MessageCircle size={16} /> Reserve Now
                    </a>
                </div>
            </div>

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
