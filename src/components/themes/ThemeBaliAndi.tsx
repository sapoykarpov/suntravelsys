'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Users,
    MapPin,
    Clock,
    ArrowUp,
    Star,
    X,
    MessageCircle,
    Instagram,
    Globe,
    Share2,
    Play
} from 'lucide-react';
import { ItineraryPayload } from '@/types/itinerary';
import { imageWithFallback } from '@/lib/utils/images';

export default function ThemeBaliAndi({
    data,
    isCoverVisible = true,
    scrollProgress: centralizedProgress = 0
}: {
    data: ItineraryPayload,
    isCoverVisible?: boolean,
    scrollProgress?: number
}) {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [playingDayIdx, setPlayingDayIdx] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            setScrollProgress(scrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const whatsappUrl = data.brand.whatsapp || data.brand.contact?.whatsapp;
    const email = data.brand.email || data.brand.contact?.email;

    return (
        <div className="ba-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;600;700&display=swap');
                
                .ba-root {
                    font-family: 'Inter', sans-serif;
                    background: #0a0a0a;
                    color: white;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    --gold: #c9a962;
                }
                .ba-root * { box-sizing: border-box; max-width: 100%; }
                
                .ba-container {
                    width: 100%;
                    max-width: 650px;
                    background: #0a0a0a;
                    min-height: 100vh;
                    position: relative;
                }

                .font-serif { font-family: 'Cormorant Garamond', serif !important; }
                .gold-text { color: var(--gold); }
                .gold-bg { background-color: var(--gold); }
                .glass-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                /* PROGRESS */
                .ba-progress {
                    position: fixed; top: 0; left: 0; h: 4px;
                    background: var(--gold);
                    z-index: 1000;
                    transition: width 0.1s;
                }

                /* HERO */
                .ba-hero {
                    height: 100vh;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 40px 24px;
                    overflow: hidden;
                }
                .ba-hero-img {
                    position: absolute; inset: 0;
                    width: 100%; height: 100%;
                    object-fit: cover; opacity: 0.6;
                }
                .ba-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0) 50%);
                }
                .ba-hero-content { position: relative; z-index: 10; width: 100%; }
                .ba-hero-badge {
                    display: inline-block;
                    background: var(--gold);
                    color: black;
                    padding: 4px 16px;
                    border-radius: 50px;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 24px;
                }
                .ba-hero-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: clamp(40px, 12vw, 72px);
                    line-height: 1;
                    margin-bottom: 32px;
                    font-weight: 300;
                    word-break: break-word;
                }
                .ba-hero-meta {
                    display: grid;
                    gap: 16px;
                    font-size: 13px;
                    color: rgba(255,255,255,0.7);
                }
                .ba-hero-meta-item { display: flex; align-items: center; gap: 12px; }

                /* SECTION */
                .ba-section { padding: 80px 24px; }
                .ba-section-label {
                    color: var(--gold);
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 4px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    display: block;
                }
                .ba-section-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: clamp(32px, 8vw, 48px);
                    margin-bottom: 40px;
                    font-weight: 300;
                }

                /* HIGHLIGHTS */
                .ba-highlight-grid {
                    display: grid;
                    gap: 20px;
                }
                .ba-highlight-card {
                    padding: 32px;
                    border-left: 3px solid var(--gold);
                }
                .ba-hlt-icon { font-size: 32px; margin-bottom: 24px; }
                .ba-hlt-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 24px;
                    color: var(--gold);
                    font-style: italic;
                    margin-bottom: 12px;
                }
                .ba-hlt-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6; }

                /* ITINERARY */
                .ba-day { position: relative; margin-bottom: 80px; }
                .ba-day-header {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .ba-day-num {
                    width: 60px; height: 60px;
                    background: var(--gold);
                    color: black;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 700;
                    font-style: italic;
                    flex-shrink: 0;
                }
                .ba-day-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 26px;
                    color: var(--gold);
                    font-style: italic;
                }
                .ba-day-loc {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    opacity: 0.4;
                    margin-top: 4px;
                }
                .ba-day-body {
                    padding-left: 30px;
                    border-left: 1px solid rgba(255,255,255,0.1);
                    margin-left: 30px;
                }
                .ba-day-img {
                    width: 100%;
                    height: 240px;
                    object-fit: cover;
                    border-radius: 24px;
                    margin-bottom: 24px;
                }
                .ba-day-summary {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 19px;
                    font-style: italic;
                    color: rgba(255,255,255,0.8);
                    line-height: 1.6;
                    margin-bottom: 32px;
                }
                .ba-act { position: relative; padding-left: 24px; margin-bottom: 32px; }
                .ba-act-dot {
                    position: absolute; left: -35px; top: 6px;
                    width: 10px; height: 10px;
                    background: var(--gold);
                    border-radius: 50%;
                    border: 2px solid #0a0a0a;
                }
                .ba-act-time {
                    font-size: 10px; font-weight: 700; color: var(--gold);
                    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;
                }
                .ba-act-title { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
                .ba-act-desc { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.5; }

                /* PRICING */
                .ba-sticky-bar {
                    position: fixed; 
                    bottom: 24px; 
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    max-width: 430px;
                    padding: 0 16px; 
                    z-index: 100;
                    display: flex; justify-content: center;
                }
                .ba-nav {
                    width: 100%; 
                    max-width: 400px;
                    padding: 16px 24px;
                    display: flex; align-items: center;
                    justify-content: space-between;
                    border-radius: 24px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                .ba-inquire {
                    background: var(--gold);
                    color: black;
                    padding: 12px 24px;
                    border-radius: 50px;
                    font-weight: 800;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    text-decoration: none;
                }
            `}} />

            <div className="ba-progress" style={{ width: `${scrollProgress}%` }} />

            <div className="ba-container">
                {/* Hero */}
                <header className="ba-hero" style={{
                    justifyContent: data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'center' ? 'center' : 'flex-end',
                }}>
                    <motion.img
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        transition={{ duration: 1.5 }}
                        src={imageWithFallback(data.meta.coverImage || data.days[0]?.heroImage, 'bali')}
                        className="ba-hero-img"
                        alt=""
                    />
                    <div className="ba-hero-overlay" />
                    <div className="ba-hero-content">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className="ba-hero-badge">Premium Experience</span>
                            <div className="gold-text uppercase tracking-widest text-[10px] mb-4 font-bold opacity-80">Private Journey</div>
                            <h1 className="ba-hero-title" style={{
                                ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                                ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                                ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                                ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                            }}>
                                {data.meta.title}
                            </h1>
                            <div className="ba-hero-meta">
                                <span className="ba-hero-meta-item"><Calendar size={18} className="gold-text" /> {data.meta.durationDays} Days / {data.meta.durationNights} Nights</span>
                                <span className="ba-hero-meta-item"><Users size={18} className="gold-text" /> Max {data.meta.groupSize} Guests</span>
                                <span className="ba-hero-meta-item"><MapPin size={18} className="gold-text" /> {data.meta.startDate} — {data.meta.endDate}</span>
                            </div>
                        </motion.div>
                    </div>
                </header>

                {/* Highlights */}
                <section className="ba-section">
                    <span className="ba-section-label">Experience</span>
                    <h2 className="ba-section-title">What Awaits You</h2>
                    <div className="ba-highlight-grid">
                        {data.highlights.map((hlt, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card ba-highlight-card"
                            >
                                <div className="ba-hlt-icon">{i === 0 ? '🏝️' : i === 1 ? '🍽️' : '🧘'}</div>
                                <h3 className="ba-hlt-title">{hlt.value}</h3>
                                <p className="ba-hlt-desc">{hlt.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Itinerary */}
                <section className="ba-section">
                    <span className="ba-section-label">The Journey</span>
                    <h2 className="ba-section-title">Day by Day</h2>
                    <div className="ba-itinerary-list">
                        {data.days.map((day, idx) => (
                            <div key={idx} className="ba-day">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="ba-day-header"
                                >
                                    <div className="ba-day-num">{day.dayNumber}</div>
                                    <div>
                                        <h3 className="ba-day-title">{day.title}</h3>
                                        <p className="ba-day-loc">{day.location}</p>
                                    </div>
                                </motion.div>

                                <div className="ba-day-body">
                                    {day.heroImage && (
                                        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                                            {playingDayIdx === idx && day.videoUrl ? (
                                                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                                                    <iframe src={`https://www.youtube.com/embed/${day.videoUrl}?autoplay=1`} frameBorder="0" allowFullScreen style={{ width: '100%', height: '100%' }} />
                                                    <button onClick={() => setPlayingDayIdx(null)} style={{
                                                        position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)',
                                                        color: '#fff', border: 'none', borderRadius: '50%',
                                                        width: 36, height: 36, cursor: 'pointer', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center', fontSize: 20
                                                    }}>
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <motion.img
                                                        initial={{ opacity: 0 }}
                                                        whileInView={{ opacity: 1 }}
                                                        viewport={{ once: true }}
                                                        src={imageWithFallback(day.heroImage, 'bali')}
                                                        className="ba-day-img"
                                                        alt=""
                                                    />
                                                    {day.videoUrl && (
                                                        <button onClick={() => setPlayingDayIdx(idx)} style={{
                                                            position: 'absolute', bottom: 16, right: 16,
                                                            background: 'rgba(255,255,255,0.95)', borderRadius: '50%',
                                                            width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer', border: 'none', padding: 0
                                                        }}>
                                                            <Play size={20} fill="currentColor" color="#1a1a1a" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <p className="ba-day-summary">{day.summary}</p>
                                    <div className="ba-activities">
                                        {day.activities.map((act, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: 20, opacity: 0 }}
                                                whileInView={{ x: 0, opacity: 1 }}
                                                viewport={{ once: true }}
                                                className="ba-act"
                                            >
                                                <div className="ba-act-dot" />
                                                <div className="ba-act-time">{act.time}</div>
                                                <h4 className="ba-act-title">{act.title}</h4>
                                                <p className="ba-act-desc">{act.description}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Accomodation */}
                {data.hotels?.[0] && (
                    <section className="ba-section">
                        <span className="ba-section-label">Stay</span>
                        <h2 className="ba-section-title">Your Sanctuary</h2>
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="glass-card"
                            style={{ borderRadius: '32px', overflow: 'hidden' }}
                        >
                            <img src={imageWithFallback(data.hotels[0].imageUrl, 'hotel')} className="w-full h-64 object-cover" alt="" />
                            <div className="p-8">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="gold-text fill-current" />)}
                                </div>
                                <h3 className="text-2xl font-serif italic gold-text mb-2 uppercase">{data.hotels[0].name}</h3>
                                <p className="text-white/40 text-[10px] tracking-widest uppercase mb-6">{data.hotels[0].location}</p>
                                <p className="text-white/60 text-sm font-light leading-relaxed">
                                    Experience unparalleled elegance and world-class service in our handpicked boutique accommodations.
                                </p>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* Price & Booking Footer */}
                <section className="ba-section" style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                    <div className="max-w-md mx-auto">
                        <span className="ba-section-label">Investment</span>
                        <div className="font-serif italic gold-text text-5xl mb-4">{data.meta.price}</div>
                        <p className="text-white/40 text-xs italic mb-12">{data.meta.priceNote}</p>

                        <div className="grid gap-8 text-left">
                            <div className="glass-card p-8 rounded-3xl">
                                <h4 className="gold-text font-serif italic text-xl mb-6 uppercase tracking-widest">Inclusions</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {data.inclusions.map((inc, i) => <li key={i} className="text-white/60 text-sm mb-4 flex gap-3"><Check size={16} className="gold-text shrink-0" /> {inc}</li>)}
                                </ul>
                            </div>
                            <div className="p-8 rounded-3xl border border-white/10">
                                <h4 className="text-white/40 font-serif italic text-xl mb-6 uppercase tracking-widest">Exclusions</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {data.exclusions.map((exc, i) => <li key={i} className="text-white/20 text-sm mb-4 flex gap-3"><X size={16} className="shrink-0" /> {exc}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Brand Last Page */}
                <section className="py-32 px-6 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="w-20 h-20 gold-bg text-black rounded-full mx-auto flex items-center justify-center text-3xl font-bold italic mb-8 overflow-hidden">
                            {data.brand.logoUrl ? (
                                <img src={data.brand.logoUrl} alt={data.brand.name} className="w-full h-full object-contain" />
                            ) : (
                                data.brand.name.charAt(0)
                            )}
                        </div>
                        <h3 className="text-2xl font-serif font-light mb-2 text-center">{data.brand.name}</h3>
                        <p className="gold-text text-xs tracking-[0.4em] uppercase mb-16 text-center">{data.brand.tagline}</p>

                        <div className="flex justify-center gap-6 mb-20">
                            {data.brand.instagram && (
                                <a href={data.brand.instagram} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:gold-bg hover:text-black transition-all">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {data.brand.website && (
                                <a href={data.brand.website} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:gold-bg hover:text-black transition-all">
                                    <Globe size={20} />
                                </a>
                            )}
                        </div>

                        <div className="pt-12 border-t border-white/5 opacity-30">
                            <p className="text-[10px] uppercase tracking-[0.5em]">Crafted by</p>
                            <p className="text-xs font-bold tracking-widest uppercase">Travel Asset Engine</p>
                        </div>
                    </motion.div>
                </section>

                {/* Sticky Navbar */}
                <AnimatePresence>
                    {!isCoverVisible && (
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="ba-sticky-bar"
                        >
                            <div className="ba-nav glass-card" style={{ justifyContent: 'center' }}>
                                <div className="flex items-center gap-8">
                                    <button className="text-white/40 hover:text-white transition-colors">
                                        <Share2 size={24} />
                                    </button>
                                    <a
                                        href={whatsappUrl ? `https://wa.me/${whatsappUrl.replace(/[^0-9]/g, '')}` : `mailto:${email}`}
                                        className="ba-inquire"
                                        style={{ padding: '14px 40px', fontSize: '13px' }}
                                    >
                                        Reservasi
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const Check = ({ size, className, style }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
