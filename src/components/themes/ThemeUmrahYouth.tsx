'use client';

import React, { useState } from 'react';
import {
    Heart,
    Share2,
    MessageCircle,
    MapPin,
    Camera,
    Coffee,
    Zap,
    Compass,
    Check,
    Users,
    Play
} from 'lucide-react';
import { ItineraryPayload } from '@/types/itinerary';
import OptionalSections from '../OptionalSections';

export default function ThemeUmrahYouth({
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

    const getIcon = (category?: string) => {
        switch (category) {
            case 'camera': return <Camera size={18} />;
            case 'meal': return <Coffee size={18} />;
            case 'transport': return <Zap size={18} />;
            case 'activity': return <Compass size={18} />;
            default: return <Check size={18} />;
        }
    };

    const primary = '#2563eb'; // blue-600

    return (
        <div className="uy-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                
                .uy-root {
                    font-family: 'Inter', sans-serif;
                    background: #fff;
                    color: #0f172a;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .uy-root * { box-sizing: border-box; max-width: 100%; }
                
                .uy-container {
                    width: 100%;
                    max-width: 650px;
                    background: #fff;
                    min-height: 100vh;
                    position: relative;
                    padding-bottom: 120px;
                }

                .uy-nav {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 24px; border-bottom: 1px solid #f1f5f9;
                    background: rgba(255,255,255,0.8); backdrop-filter: blur(10px);
                    position: sticky; top: 0; z-index: 50;
                }
                .uy-brand { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }

                .uy-hero { padding: 24px; }
                .uy-hero-card {
                    position: relative; border-radius: 40px; overflow: hidden;
                    aspect-ratio: 3/4; shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }
                .uy-hero-img { width: 100%; height: 100%; object-fit: cover; }
                .uy-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%);
                    display: flex;
                    flex-direction: column;
                    justify-content: ${data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'bottom' ? 'flex-end' : 'center'};
                    padding: 80px 32px;
                }
                .uy-hero-h1 {
                    font-size: clamp(32px, 8vw, 48px); font-weight: 900; color: #fff;
                    line-height: 1; margin-bottom: 16px; font-style: italic;
                    word-break: break-word; text-transform: uppercase;
                }

                .uy-section { padding: 40px 24px; }
                .uy-section-h3 { font-size: 24px; font-weight: 900; font-style: italic; text-transform: uppercase; margin-bottom: 32px; }

                .uy-hlt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .uy-hlt-card { padding: 24px; border-radius: 32px; display: flex; flex-direction: column; gap: 16px; }
                .uy-hlt-icon { background: #fff; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }

                .uy-day { display: flex; gap: 24px; margin-bottom: 32px; }
                .uy-day-num { font-size: 24px; font-weight: 900; color: ${primary}; opacity: 0.2; font-style: italic; }
                .uy-day-body { flex: 1; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
                .uy-day-h4 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
                .uy-day-sum { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 16px; }

                .uy-act-badge {
                    display: flex; align-items: center; gap: 8px;
                    background: #f8fafc; padding: 8px 12px; border-radius: 12px;
                    font-size: 11px; font-weight: 600; margin-bottom: 8px;
                }

                .uy-price-card {
                    background: ${primary}; color: #fff; border-radius: 40px;
                    padding: 40px; position: relative; overflow: hidden;
                }
                .uy-price-val { font-size: clamp(24px, 6vw, 32px); font-weight: 900; font-style: italic; margin-bottom: 32px; word-break: break-word; }

                .uy-nav-float {
                    position: fixed; 
                    bottom: 24px; 
                    left: 50%; 
                    transform: translateX(-50%) translateY(100px);
                    width: calc(100% - 48px); 
                    max-width: 430px;
                    background: rgba(15,23,42,0.9); backdrop-filter: blur(20px);
                    border-radius: 32px; padding: 8px;
                    display: flex; align-items: center; justify-content: space-between;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    z-index: 100;
                    transition: all 0.5s ease;
                    opacity: 0;
                    pointer-events: none;
                }
                .uy-nav-float.v-active {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                    pointer-events: auto;
                }
                .uy-btn-cta {
                    flex: 1; margin: 0 12px;
                    background: ${primary}; color: #fff;
                    height: 52px; border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 12px; text-transform: uppercase;
                    text-decoration: none; letter-spacing: 2px;
                }
            `}} />

            <div className="uy-container">
                <nav className="uy-nav">
                    <div className="uy-brand">{data.brand.name}<span style={{ color: primary }}>.</span></div>
                    <div style={{ background: '#f1f5f9', padding: 10, borderRadius: '50%' }}>
                        <Zap size={18} style={{ color: primary }} />
                    </div>
                </nav>

                <header className="uy-hero">
                    <div className="uy-hero-card">
                        <img src={data.meta.coverImage || data.days[0]?.heroImage} className="uy-hero-img" alt="" />
                        <div className="uy-hero-overlay">
                            <h1 className="uy-hero-h1" style={{
                                ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                                ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                                ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                                ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                            }}>{data.meta.title}</h1>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', maxWidth: 200 }}>{data.meta.subtitle}</p>
                        </div>
                    </div>
                </header>

                <section className="uy-section">
                    <div className="uy-hlt-grid">
                        <div className="uy-hlt-card" style={{ background: '#eff6ff' }}>
                            <div className="uy-hlt-icon" style={{ color: primary }}><Camera size={20} /></div>
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>Exclusive Visuals<br /><span style={{ fontSize: '10px', opacity: 0.5, fontWeight: 400 }}>Capture every moment</span></span>
                        </div>
                        <div className="uy-hlt-card" style={{ background: '#f8fafc' }}>
                            <div className="uy-hlt-icon" style={{ color: '#64748b' }}><Users size={20} /></div>
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>Group Experience<br /><span style={{ fontSize: '10px', opacity: 0.5, fontWeight: 400 }}>Modern community</span></span>
                        </div>
                    </div>
                </section>

                <section className="uy-section">
                    <h3 className="uy-section-h3">The Journey</h3>
                    {data.days.map((day, idx) => (
                        <div key={idx} className="uy-day">
                            <div className="uy-day-num">{day.dayNumber < 10 ? `0${day.dayNumber}` : day.dayNumber}</div>
                            <div className="uy-day-body">
                                <h4 className="uy-day-h4">{day.title}</h4>
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
                                <p className="uy-day-sum">{day.summary}</p>
                                {day.activities.map((act, i) => (
                                    <div key={i} className="uy-act-badge">
                                        <div style={{ color: primary }}>{getIcon(act.iconCategory)}</div>
                                        <span>{act.time} — {act.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                <OptionalSections data={data} primaryColor={primary} />

                <section className="uy-section">
                    <div className="uy-price-card">
                        <div style={{ fontSize: '10px', fontWeight: 700, opacity: 0.6, letterSpacing: 2, marginBottom: 8 }}>INVESTMENT</div>
                        <div className="uy-price-val">{data.meta.price}</div>
                        {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                            <div className="grid gap-3">
                                {data.whatsappConfig.numbers.map((num, i) => (
                                    <a key={i}
                                        href={`https://wa.me/${num.number.replace(/[^0-9]/g, '')}`}
                                        style={{ display: 'block', background: '#fff', color: primary, textAlign: 'center', padding: '16px', borderRadius: '16px', fontWeight: 900, fontSize: '13px', textDecoration: 'none', letterSpacing: 2 }}
                                    >
                                        CHAT {num.label?.toUpperCase() || 'US'}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <a
                                href={(data.brand.whatsapp || data.brand.contact?.whatsapp) ? `https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)!.replace(/[^0-9]/g, '')}` : `mailto:${data.brand.email}`}
                                style={{ display: 'block', background: '#fff', color: primary, textAlign: 'center', padding: '16px', borderRadius: '16px', fontWeight: 900, fontSize: '13px', textDecoration: 'none', letterSpacing: 2 }}
                            >
                                GET THE SPOT
                            </a>
                        )}
                    </div>
                </section>

                {/* Footer Brand */}
                <section style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 900, fontSize: '24px', fontStyle: 'italic', marginBottom: 4 }}>{data.brand.name}</div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px', opacity: 0.4 }}>{data.brand.tagline}</div>
                    <div style={{ marginTop: '60px', opacity: 0.1, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '3px' }}>Powered by SunTravelSys</div>
                </section>
            </div>

            <div className={`uy-nav-float ${!isCoverVisible ? 'v-active' : ''}`}>
                <button onClick={() => setLiked(!liked)} style={{ background: 'none', border: 'none', color: liked ? '#ef4444' : '#fff', padding: 16 }}>
                    <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
                </button>
                {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                    <a
                        href={`https://wa.me/${data.whatsappConfig.numbers[0].number.replace(/[^0-9]/g, '')}`}
                        className="uy-btn-cta"
                    >
                        Chat Now
                    </a>
                ) : (
                    <a
                        href={(data.brand.whatsapp || data.brand.contact?.whatsapp) ? `https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)!.replace(/[^0-9]/g, '')}` : `mailto:${data.brand.email}`}
                        className="uy-btn-cta"
                    >
                        Book Now
                    </a>
                )}
                {(data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0) ? (
                    <a
                        href={`https://wa.me/${data.whatsappConfig.numbers[0].number.replace(/[^0-9]/g, '')}`}
                        style={{ padding: 16, background: '#10b981', borderRadius: '16px', color: '#fff' }}
                    >
                        <MessageCircle size={22} />
                    </a>
                ) : data.brand.whatsapp && (
                    <a
                        href={`https://wa.me/${data.brand.whatsapp.replace(/[^0-9]/g, '')}`}
                        style={{ padding: 16, background: '#10b981', borderRadius: '16px', color: '#fff' }}
                    >
                        <MessageCircle size={22} />
                    </a>
                )}
            </div>
        </div>
    );
}
