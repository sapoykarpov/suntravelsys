'use client';

import React, { useState } from 'react';
import {
    Heart,
    MessageCircle,
    Phone,
    MapPin,
    Check,
    Plane,
    Hotel,
    Coffee,
    Bus,
    User,
    FileText,
    Backpack,
    Droplet,
    Play
} from 'lucide-react';
import { ItineraryPayload } from '@/types/itinerary';
import OptionalSections from '../OptionalSections';

export default function ThemeUmrohEvent({
    data,
    isCoverVisible = true,
    scrollProgress = 0
}: {
    data: ItineraryPayload,
    isCoverVisible?: boolean,
    scrollProgress?: number
}) {
    const [liked, setLiked] = useState(false);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

    const getAmenityIcon = (label: string) => {
        const l = label.toLowerCase();
        if (l.includes('tiket') || l.includes('pesawat') || l.includes('flight')) return <Plane size={24} />;
        if (l.includes('hotel') || l.includes('akomodasi')) return <Hotel size={24} />;
        if (l.includes('makan') || l.includes('meal')) return <Coffee size={24} />;
        if (l.includes('transport') || l.includes('bus')) return <Bus size={24} />;
        if (l.includes('tour') || l.includes('leader') || l.includes('guide')) return <User size={24} />;
        if (l.includes('visa') || l.includes('asuransi')) return <FileText size={24} />;
        if (l.includes('perlengkapan') || l.includes('koper')) return <Backpack size={24} />;
        if (l.includes('zamzam')) return <Droplet size={24} />;
        return <Check size={24} />;
    };

    const gold = '#d4af37';

    return (
        <div className="ue-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Poppins:wght@300;400;600;700&display=swap');
                
                .ue-root {
                    font-family: 'Poppins', sans-serif;
                    background: #faf8f5;
                    color: #2c3e50;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    --gold: ${gold};
                }
                .ue-root * { box-sizing: border-box; max-width: 100%; }
                
                .ue-container {
                    width: 100%;
                    max-width: 650px;
                    background: #faf8f5;
                    min-height: 100vh;
                    position: relative;
                    padding-bottom: 120px;
                }

                .font-amiri { font-family: 'Amiri', serif !important; }

                /* HERO */
                .ue-hero {
                    height: 80vh;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 40px 24px;
                    background: #1e293b;
                    overflow: hidden;
                }
                .ue-hero-img {
                    position: absolute; inset: 0;
                    width: 100%; height: 100%;
                    object-fit: cover; opacity: 0.5;
                }
                .ue-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%);
                }
                .ue-hero-content { position: relative; z-index: 10; width: 100%; }
                .ue-hero-bismillah { font-family: 'Amiri', serif; font-size: 28px; color: var(--gold); margin-bottom: 24px; }
                .ue-hero-title {
                    font-family: 'Amiri', serif;
                    font-size: clamp(32px, 10vw, 64px);
                    color: #fff; line-height: 1.1; margin-bottom: 16px;
                    word-break: break-word; text-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }

                .ue-section { padding: 60px 24px; }
                .ue-section-h2 { font-family: 'Amiri', serif; font-size: 36px; text-align: center; margin-bottom: 40px; color: #2c3e50; }

                .ue-hlt-card {
                    background: #fff;
                    padding: 24px;
                    border-radius: 20px;
                    border-right: 4px solid var(--gold);
                    margin-bottom: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    display: flex; gap: 20px; align-items: center;
                }
                .ue-hlt-val { font-family: 'Amiri', serif; font-size: 24px; color: var(--gold); }

                .ue-day-card {
                    background: #fff;
                    padding: 32px;
                    border-radius: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.02);
                    border: 1px solid #f1f5f9;
                }
                .ue-day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f8fafc; padding-bottom: 16px; }
                .ue-day-num { font-family: 'Amiri', serif; font-size: 48px; color: var(--gold); font-weight: 700; line-height: 1; }

                /* PRICE */
                .ue-price-card {
                    background: #1a1a2e; color: #fff;
                    padding: 64px 24px; border-radius: 40px;
                    text-align: center; margin: 40px 0;
                    position: relative; overflow: hidden;
                }
                .ue-price-val { font-size: clamp(32px, 8vw, 48px); font-weight: 700; color: var(--gold); margin-bottom: 24px; word-break: break-word; }

                /* FOOTER BAR */
                .ue-footer-bar {
                    position: fixed; 
                    bottom: 0; 
                    left: 50%;
                    transform: translateX(-50%) translateY(100px);
                    width: 100%;
                    max-width: 430px;
                    background: rgba(255,255,255,0.9); backdrop-filter: blur(10px);
                    padding: 16px 24px; z-index: 100;
                    display: flex; justify-content: center;
                    border-top: 1px solid #eee;
                    transition: all 0.5s ease;
                    opacity: 0;
                    pointer-events: none;
                }
                .ue-footer-bar.v-active {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                    pointer-events: auto;
                }
                .ue-footer-inner {
                    width: 100%; max-width: 650px;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .ue-book-btn {
                    background: #1e293b; color: #fff;
                    padding: 12px 24px; border-radius: 50px;
                    font-weight: 700; font-size: 12px;
                    text-transform: uppercase; letter-spacing: 2px;
                    text-decoration: none;
                }
            `}} />

            <div className="ue-container">
                <header className="ue-hero" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'bottom' ? 'flex-end' : 'center',
                    minHeight: '85vh',
                    padding: '120px 24px'
                }}>
                    <img src={data.meta.coverImage || data.days[0]?.heroImage} className="ue-hero-img" alt="" />
                    <div className="ue-hero-overlay" />
                    <div className="ue-hero-content">
                        <div className="ue-hero-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                        <h1 className="ue-hero-title" style={{
                            ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                            ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                            ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                            ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                        }}>{data.meta.title}</h1>
                        <p style={{ color: '#fff', opacity: 0.8, fontStyle: 'italic' }}>{data.meta.subtitle}</p>
                    </div>
                </header>

                <section className="ue-section">
                    <h2 className="ue-section-h2">Keistimewaan Program</h2>
                    <div className="ue-hlt-list">
                        {data.highlights.map((hlt, i) => (
                            <div key={i} className="ue-hlt-card">
                                <div style={{ fontSize: '24px', opacity: 0.4 }}>★</div>
                                <div>
                                    <div className="ue-hlt-val">{hlt.value}</div>
                                    <p style={{ fontSize: '13px', color: '#64748b' }}>{hlt.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="ue-section">
                    <h2 className="ue-section-h2">Rencana Perjalanan</h2>
                    <div className="ue-itinerary">
                        {data.days.map((day, idx) => (
                            <div key={idx} className="ue-day-card">
                                <div className="ue-day-header">
                                    <div className="ue-day-num">{day.dayNumber}</div>
                                    <div style={{ background: gold, color: '#fff', padding: '4px 12px', fontSize: '10px', fontWeight: 700, borderRadius: '50px' }}>{day.location}</div>
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: 16 }}>{day.title}</h3>
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
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {day.activities.map((act, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>
                                            <span style={{ color: gold, fontWeight: 700 }}>{act.time}</span>
                                            <span>{act.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <OptionalSections data={data} primaryColor={gold} />

                <section className="ue-section">
                    <div className="ue-price-card">
                        <div style={{ fontSize: '11px', fontWeight: 700, color: gold, letterSpacing: 2, marginBottom: 12 }}>INVESTASI PERJALANAN</div>
                        <div className="ue-price-val">{data.meta.price}</div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>{data.meta.groupSize}</p>
                        {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                            <div className="grid gap-3">
                                {data.whatsappConfig.numbers.map((num, i) => (
                                    <a key={i}
                                        href={`https://wa.me/${num.number.replace(/[^0-9]/g, '')}`}
                                        style={{ display: 'block', background: gold, color: '#1a1a2e', padding: '16px', borderRadius: '50px', fontWeight: 900, textDecoration: 'none', letterSpacing: 2 }}
                                    >
                                        CHAT {num.label?.toUpperCase() || 'OFFICE'}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <a
                                href={`https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)?.replace(/[^0-9]/g, '')}`}
                                style={{ display: 'block', background: gold, color: '#1a1a2e', padding: '16px', borderRadius: '50px', fontWeight: 900, textDecoration: 'none', letterSpacing: 2 }}
                            >
                                DAFTAR SEKARANG
                            </a>
                        )}
                    </div>
                </section>

                <section className="ue-section" style={{ textAlign: 'center' }}>
                    <h3 className="ue-section-h2" style={{ fontSize: '24px' }}>Termasuk Dalam Paket</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {data.inclusions.map((inc, i) => (
                            <div key={i} style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #f1f5f9' }}>
                                <div style={{ color: gold, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{getAmenityIcon(inc)}</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>{inc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer Brand */}
                <section style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div className="font-amiri" style={{ fontSize: '28px', fontWeight: 700, marginBottom: 4 }}>{data.brand.name}</div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px', opacity: 0.5 }}>{data.brand.tagline}</div>
                    <div style={{ marginTop: '80px', opacity: 0.1, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '3px' }}>Powered by SunTravelSys</div>
                </section>
            </div>

            <div className={`ue-footer-bar ${!isCoverVisible ? 'v-active' : ''}`}>
                <div className="ue-footer-inner">
                    {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                        <div className="flex gap-2 py-1">
                            {data.whatsappConfig.numbers.slice(0, 2).map((num, i) => (
                                <a key={i}
                                    href={`https://wa.me/${num.number.replace(/[^0-9]/g, '')}`}
                                    className="ue-book-btn"
                                    style={{ padding: '10px 16px', fontSize: '10px' }}
                                >
                                    Chat {num.label || 'Us'}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <a
                                href={`https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)?.replace(/[^0-9]/g, '')}`}
                                style={{ background: '#10b981', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                            >
                                <MessageCircle size={20} fill="currentColor" />
                            </a>
                            <a
                                href={`https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)?.replace(/[^0-9]/g, '')}`}
                                className="ue-book-btn"
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                Hubungi Kami
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
