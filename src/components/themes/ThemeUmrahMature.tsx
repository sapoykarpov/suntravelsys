'use client';

import React, { useState, useEffect } from 'react';
import {
    Heart,
    Share2,
    MessageCircle,
    ShieldCheck,
    Moon,
    MapPin,
    Check,
    Play
} from 'lucide-react';
import { ItineraryPayload } from '@/types/itinerary';
import OptionalSections from '../OptionalSections';

export default function ThemeUmrahMature({
    data,
    isCoverVisible = true,
    scrollProgress = 0
}: {
    data: ItineraryPayload,
    isCoverVisible?: boolean,
    scrollProgress?: number
}) {
    const [liked, setLiked] = useState(false); const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('um-active');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.um-reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const whatsappUrl = data.brand.whatsapp || data.brand.contact?.whatsapp;
    const email = data.brand.email || data.brand.contact?.email;
    const accent = data.brand.primaryColor || '#B08968';
    const darkGreen = '#1B4332';

    return (
        <div className="um-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                
                .um-root {
                    --accent: ${accent};
                    --dark: ${darkGreen};
                    background: #FDFCF8;
                    color: var(--dark);
                    font-family: 'Bodoni Moda', serif;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .um-root * { box-sizing: border-box; max-width: 100%; }

                .um-container {
                    width: 100%;
                    max-width: 600px;
                    background: #FDFCF8;
                    min-height: 100vh;
                    position: relative;
                    padding-bottom: 120px;
                    box-shadow: 0 0 50px rgba(0,0,0,0.05);
                }

                /* HEADER */
                .um-header {
                    padding: 40px 24px;
                    text-align: center;
                    background: #fff;
                    border-bottom: 1px solid #E9E5D9;
                }
                .um-logo-icon {
                    color: var(--accent);
                    margin: 0 auto 16px;
                }
                .um-brand-name {
                    font-size: clamp(24px, 6vw, 32px);
                    font-weight: 700;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                    word-break: break-word;
                }
                .um-brand-tag {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    color: #A0A0A0;
                    font-size: 13px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                /* HERO */
                .um-hero {
                    padding: 24px;
                }
                .um-hero-frame {
                    position: relative;
                    border-radius: 100px 100px 0 0;
                    overflow: hidden;
                    aspect-ratio: 4/5;
                    border: 8px solid #fff;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .um-hero-img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                }
                .um-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6));
                }
                .um-hero-badge {
                    position: absolute; top: 32px; right: 32px;
                    background: rgba(255,255,255,0.9);
                    padding: 8px 16px;
                    border-radius: 30px;
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    color: var(--accent);
                    font-weight: 700;
                    font-size: 12px;
                }
                .um-hero-text {
                    position: relative; z-index: 10;
                    padding: 0 32px;
                    text-align: center;
                    color: #fff;
                }
                .um-hero-title {
                    font-size: clamp(28px, 8vw, 42px);
                    line-height: 1.1;
                    margin-bottom: 12px;
                    word-break: break-word;
                }
                .um-hero-sub {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: 16px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    opacity: 0.9;
                }

                /* INTRO */
                .um-section {
                    padding: 60px 24px;
                    text-align: center;
                }
                .um-section-title {
                    font-size: clamp(24px, 6vw, 32px);
                    font-weight: 700;
                    margin-bottom: 24px;
                    line-height: 1.2;
                }
                .um-section-p {
                    font-family: 'Playfair Display', serif;
                    font-size: 17px;
                    line-height: 1.8;
                    color: #606060;
                    font-style: italic;
                }

                /* HIGHLIGHTS */
                .um-highlights {
                    padding: 0 24px 60px;
                    display: grid;
                    gap: 16px;
                }
                .um-highlight-card {
                    background: #fff;
                    border: 1px solid #E9E5D9;
                    border-radius: 24px;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .um-hlt-icon {
                    width: 56px; height: 56px;
                    background: #F4F1E8;
                    color: var(--accent);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                /* ITINERARY */
                .um-itinerary {
                    padding: 60px 32px;
                }
                .um-itinerary-header {
                    font-size: 18px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    text-align: center;
                    margin-bottom: 48px;
                    display: block;
                    text-decoration: underline;
                    text-underline-offset: 12px;
                    text-decoration-color: var(--accent);
                }
                .um-timeline {
                    position: relative;
                }
                .um-day {
                    position: relative;
                    padding-left: 32px;
                    margin-bottom: 48px;
                    border-left: 2px solid #E9E5D9;
                }
                .um-day-dot {
                    position: absolute;
                    left: -9px; top: 0;
                    width: 16px; height: 16px;
                    background: var(--dark);
                    border-radius: 50%;
                    border: 4px solid #FDFCF8;
                }
                .um-day-meta {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    color: var(--accent);
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                }
                .um-day-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 12px;
                    line-height: 1.2;
                }
                .um-day-p {
                    font-family: 'Playfair Display', serif;
                    font-size: 15px;
                    color: #555;
                    line-height: 1.6;
                }
                .um-activity {
                    margin-top: 20px;
                    padding-left: 4px;
                }
                .um-act-item {
                    display: flex;
                    gap: 12px;
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: 13px;
                    color: #777;
                    margin-bottom: 8px;
                }

                /* PRICE */
                .um-price-box {
                    margin: 0 24px 60px;
                    background: var(--dark);
                    color: #fff;
                    padding: 40px 24px;
                    border-radius: 40px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .um-price-label {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    opacity: 0.6;
                    font-size: 13px;
                    margin-bottom: 12px;
                }
                .um-price-val {
                    font-size: clamp(28px, 6vw, 42px);
                    font-weight: 700;
                    margin-bottom: 32px;
                }
                .um-book-btn {
                    display: block;
                    background: var(--accent);
                    color: #fff;
                    padding: 16px;
                    border-radius: 50px;
                    text-decoration: none;
                    letter-spacing: 3px;
                    font-weight: 700;
                    font-size: 14px;
                    transition: transform 0.2s;
                }

                /* NAVBAR */
                .um-nav-fixed {
                    position: fixed; 
                    bottom: 24px; 
                    left: 50%;
                    transform: translateX(-50%) translateY(100px);
                    width: 100%;
                    max-width: 430px;
                    padding: 0 16px;
                    z-index: 100;
                    display: flex;
                    justify-content: center;
                    transition: all 0.5s ease;
                    opacity: 0;
                    pointer-events: none;
                }
                .um-nav-fixed.v-active {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                    pointer-events: auto;
                }
                .um-nav {
                    width: 100%;
                    max-width: 450px;
                    background: rgba(255,255,255,0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid #E9E5D9;
                    padding: 8px;
                    border-radius: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                    pointer-events: auto;
                }
                .um-rect-btn {
                    background: var(--dark);
                    color: #fff;
                    height: 48px;
                    padding: 0 24px;
                    border-radius: 30px;
                    font-weight: 700;
                    font-size: 12px;
                    letter-spacing: 2px;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    flex: 1;
                    justify-content: center;
                    margin: 0 8px;
                }
                .um-circle-btn {
                    width: 48px; height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8f8f8;
                    color: #555;
                    transition: all 0.2s;
                }
                .um-wa-btn {
                    background: #25D366;
                    color: #fff;
                }

                /* ANIM */
                .um-reveal {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.6s ease-out;
                }
                .um-active {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}} />

            <div className="um-container">
                {/* Header */}
                <header className="um-header">
                    <div className="um-logo-icon">
                        <Moon size={32} fill="currentColor" />
                    </div>
                    <h1 className="um-brand-name">{data.brand.name}</h1>
                    <p className="um-brand-tag">{data.brand.tagline}</p>
                </header>

                {/* Hero */}
                <section className="um-hero">
                    <div className="um-hero-frame um-reveal" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'bottom' ? 'flex-end' : 'center',
                        padding: '100px 0'
                    }}>
                        <img src={data.meta.coverImage || data.days[0]?.heroImage} className="um-hero-img" alt="" />
                        <div className="um-hero-overlay" />
                        <div className="um-hero-text">
                            <h2 className="um-hero-title" style={{
                                ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                                ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                                ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                                ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                            }}>{data.meta.title}</h2>
                            <p className="um-hero-sub">{data.meta.subtitle}</p>
                        </div>
                    </div>
                </section>

                {/* Intro */}
                <OptionalSections data={data} primaryColor={accent} />

                <section className="um-section um-reveal">
                    <h2 className="um-section-title">Kekhusyukan yang Menenangkan</h2>
                    <p className="um-section-p">
                        "{data.itinerarySummary?.[0] || 'Menyediakan fasilitas terbaik agar fokus utama Anda hanyalah beribadah dan bersujud kepada-Nya.'}"
                    </p>
                </section>

                {/* Highlights */}
                <section className="um-highlights">
                    {data.highlights.slice(0, 2).map((hlt, i) => (
                        <div key={i} className="um-highlight-card um-reveal">
                            <div className="um-hlt-icon">
                                {i === 0 ? <ShieldCheck size={28} /> : <MapPin size={28} />}
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 700, fontSize: '16px' }}>{hlt.value}</h4>
                                <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>{hlt.label}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Itinerary */}
                <section className="um-itinerary">
                    <span className="um-itinerary-header um-reveal">Manasik Perjalanan</span>
                    <div className="um-timeline">
                        {data.days.map((day, i) => (
                            <div key={i} className="um-day um-reveal">
                                <div className="um-day-dot" />
                                <div className="um-day-meta">{day.location} — Hari {day.dayNumber}</div>
                                <h3 className="um-day-title">{day.title}</h3>
                                {day.heroImage && (
                                    <div style={{ position: 'relative', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
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
                                <p className="um-day-p">{day.summary}</p>
                                <div className="um-activity">
                                    {day.activities.map((act, j) => (
                                        <div key={j} className="um-act-item">
                                            <Check size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                                            <span>{act.time}: {act.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Price Section */}
                <section className="um-price-box um-reveal">
                    <p className="um-price-label">Pilihan Investasi</p>
                    <div className="um-price-val">{data.meta.price}</div>
                    <p style={{ opacity: 0.6, fontSize: '13px', fontStyle: 'italic', marginBottom: '32px' }}>{data.meta.priceNote}</p>

                    {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                        <div className="grid gap-3">
                            {data.whatsappConfig.numbers.map((num, i) => (
                                <a key={i} href={`https://wa.me/${num.number.replace(/[^0-9]/g, '')}`} className="um-book-btn">
                                    HUBUNGI {num.label?.toUpperCase() || 'KAMI'} (WA)
                                </a>
                            ))}
                        </div>
                    ) : (
                        <a href={whatsappUrl ? `https://wa.me/${whatsappUrl.replace(/[^0-9]/g, '')}` : `mailto:${email}`} className="um-book-btn">
                            RESERVASI SEKARANG
                        </a>
                    )}
                </section>

                {/* Footer buttons fixed */}
                <div className={`um-nav-fixed ${!isCoverVisible ? 'v-active' : ''}`}>
                    <div className="um-nav">
                        <div className="flex px-2 gap-2">
                            <button onClick={() => setLiked(!liked)} className="um-circle-btn" style={{ color: liked ? 'red' : '' }}>
                                <Heart size={20} fill={liked ? 'red' : 'none'} />
                            </button>
                            <button className="um-circle-btn">
                                <Share2 size={20} />
                            </button>
                        </div>

                        {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                            <div className="flex flex-1 gap-2 mx-2 overflow-x-auto no-scrollbar py-1">
                                {data.whatsappConfig.numbers.map((num, i) => (
                                    <a key={i}
                                        href={`https://wa.me/${num.number.replace(/[^0-9]/g, '')}`}
                                        className="um-rect-btn"
                                        style={{ minWidth: '140px', fontSize: '10px' }}
                                    >
                                        CHAT {num.label?.toUpperCase() || 'OFFICE'}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <>
                                <a
                                    href={whatsappUrl ? `https://wa.me/${whatsappUrl.replace(/[^0-9]/g, '')}` : `mailto:${email}`}
                                    className="um-rect-btn"
                                >
                                    RESERVASI
                                </a>
                                {whatsappUrl && (
                                    <a
                                        href={`https://wa.me/${whatsappUrl.replace(/[^0-9]/g, '')}`}
                                        className="um-circle-btn um-wa-btn"
                                    >
                                        <MessageCircle size={24} fill="currentColor" />
                                    </a>
                                )}
                            </>
                        )}
                    </div>
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
