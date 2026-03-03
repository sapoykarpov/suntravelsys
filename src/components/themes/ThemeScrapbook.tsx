'use client';

import React, { useState, useEffect } from 'react';
import {
    Heart,
    ArrowUp,
    MapPin,
    Camera,
    Coffee,
    Star,
    Anchor,
    MessageCircle,
    Share2,
    Play
} from 'lucide-react';
import { ItineraryPayload } from '@/types/itinerary';
import { imageWithFallback } from '@/lib/utils/images';

export default function ThemeScrapbook({
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
        const handleScroll = () => {
            // Centralized isCoverVisible now handles visibility
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getRotation = (idx: number) => {
        const rotations = ['-1deg', '1.5deg', '-0.5deg', '1deg'];
        return rotations[idx % rotations.length];
    };

    const getIcon = (idx: number) => {
        const icons = [
            <Coffee key="coffee" className="sb-deco-icon" size={28} />,
            <Star key="star" className="sb-deco-icon" size={28} />,
            <Anchor key="anchor" className="sb-deco-icon" size={28} />,
            <Camera key="camera" className="sb-deco-icon" size={28} />
        ];
        return icons[idx % icons.length];
    };

    const primary = '#BA4949';

    return (
        <div className="sb-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&display=swap');
                
                .sb-root {
                    font-family: 'Lora', serif;
                    background: #FDFCF8;
                    color: #3D3D3D;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .sb-root * { box-sizing: border-box; max-width: 100%; }
                
                .sb-container {
                    width: 100%;
                    max-width: 650px;
                    background: #FDFCF8;
                    min-height: 100vh;
                    position: relative;
                    padding: 40px 20px;
                }

                .font-hand { font-family: 'Caveat', cursive !important; }
                
                .sb-hero {
                    text-align: center;
                    padding: 40px 0 60px;
                    position: relative;
                }
                .sb-tape {
                    background: rgba(186, 73, 73, 0.2);
                    width: 80px; height: 24px;
                    transform: rotate(-3deg);
                    margin: 0 auto 20px;
                }
                .sb-title {
                    font-family: 'Caveat', cursive;
                    color: ${primary};
                    font-size: clamp(48px, 12vw, 72px);
                    line-height: 1;
                    margin-bottom: 8px;
                    word-break: break-word;
                }
                .sb-sub {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    color: #999;
                    font-style: italic;
                }

                .sb-day-card {
                    margin-bottom: 80px;
                    position: relative;
                }
                .sb-polaroid {
                    background: #fff;
                    padding: 12px 12px 40px 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    border: 1px solid #eee;
                    margin-bottom: 32px;
                }
                .sb-pol-img { width: 100%; aspect-ratio: 1; object-fit: cover; }
                .sb-pol-tag { font-family: 'Caveat', cursive; font-size: 24px; color: #ccc; margin-top: 10px; }

                .sb-day-info { padding: 0 10px; }
                .sb-loc {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 11px; font-weight: 700; color: ${primary};
                    text-transform: uppercase; letter-spacing: 2px;
                    margin-bottom: 12px;
                }
                .sb-day-title {
                    font-size: 24px; font-weight: 700;
                    margin-bottom: 16px;
                    border-bottom: 1px dashed #eee;
                    padding-bottom: 8px;
                }
                .sb-summary {
                    font-size: 17px; line-height: 1.7; color: #555;
                    margin-bottom: 24px;
                }

                .sb-act {
                    display: flex; gap: 12px;
                    margin-bottom: 16px;
                    padding-top: 16px;
                    border-top: 0.5px solid #f0f0f0;
                }
                .sb-act-time { font-family: 'Caveat', cursive; font-size: 20px; color: ${primary}; min-width: 60px; }
                .sb-act-title { font-weight: 700; font-size: 15px; }
                .sb-act-desc { font-size: 13px; color: #888; line-height: 1.4; }

                .sb-deco-icon { position: absolute; top: -10px; right: 0; opacity: 0.3; }

                /* TICKET SECTION */
                .sb-ticket {
                    background: #FFFDF5;
                    border: 2px dashed #eee;
                    padding: 40px 24px;
                    border-radius: 20px;
                    margin-top: 60px;
                    text-align: center;
                    position: relative;
                }
                .sb-ticket-h3 { font-family: 'Caveat', cursive; font-size: 36px; color: ${primary}; margin-bottom: 24px; }
                .sb-ticket-row { display: flex; justify-content: space-between; font-size: 13px; border-bottom: 1px solid #f9f9f9; padding: 12px 0; }

                /* NAV */
                .sb-nav-float {
                    position: fixed; 
                    bottom: 24px; 
                    left: 50%; 
                    transform: translateX(-50%) translateY(100px);
                    width: calc(100% - 48px); 
                    max-width: 400px;
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid #eee;
                    padding: 8px 16px;
                    border-radius: 50px;
                    display: flex; justify-content: space-between; align-items: center;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    z-index: 100;
                    transition: all 0.5s ease;
                    opacity: 0;
                    pointer-events: none;
                }
                .sb-nav-float.v-active {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                    pointer-events: auto;
                }
                .sb-cta {
                    background: ${primary}; color: #fff;
                    padding: 10px 24px; border-radius: 40px;
                    font-family: 'Caveat', cursive; font-size: 24px;
                    text-decoration: none;
                }
            `}} />

            <div className="sb-container">
                <header className="sb-hero" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'bottom' ? 'flex-end' : 'center',
                    minHeight: '30vh'
                }}>
                    <div className="sb-tape" />
                    <h1 className="sb-title" style={{
                        ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                        ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                        ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                        ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                    }}>{data.meta.title}</h1>
                    <p className="sb-sub">{data.meta.subtitle}</p>
                </header>

                <main>
                    {data.days.map((day, idx) => (
                        <div key={idx} className="sb-day-card" style={{ transform: `rotate(${getRotation(idx)})` }}>
                            {getIcon(idx)}
                            <div className="sb-polaroid">
                                <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
                                    <img src={imageWithFallback(day.heroImage, 'nature')} className="sb-pol-img" alt="" />
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
                                <div className="sb-pol-tag">#Day0{day.dayNumber}</div>
                            </div>
                            <div className="sb-day-info">
                                <div className="sb-loc"><MapPin size={12} /> {day.location}</div>
                                <h2 className="sb-day-title">{day.title}</h2>
                                <p className="sb-summary">{day.summary}</p>
                                {day.activities.map((act, i) => (
                                    <div key={i} className="sb-act">
                                        <span className="sb-act-time">{act.time}</span>
                                        <div>
                                            <div className="sb-act-title">{act.title}</div>
                                            <p className="sb-act-desc">{act.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </main>

                <section className="sb-ticket">
                    <h3 className="sb-ticket-h3">Informasi Perjalanan</h3>
                    <div className="sb-ticket-row"><span>Investasi</span><strong>{data.meta.price}</strong></div>
                    <div className="sb-ticket-row"><span>Stay</span><strong>{data.hotels?.[0]?.name || 'Premium Stay'}</strong></div>
                    <div className="sb-ticket-row" style={{ border: 'none' }}><span>Periode</span><strong>{data.meta.startDate}</strong></div>

                    <a
                        href={(data.brand.whatsapp || data.brand.contact?.whatsapp) ? `https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)!.replace(/[^0-9]/g, '')}` : `mailto:${data.brand.email}`}
                        className="sb-cta"
                        style={{ marginTop: 32, display: 'inline-block', padding: '12px 32px' }}
                    >
                        Tanyakan Detailnya
                    </a>
                </section>

                <section style={{ padding: '80px 0', textAlign: 'center', opacity: 0.5 }}>
                    <div className="font-hand" style={{ fontSize: '28px', color: primary }}>{data.brand.name}</div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px', marginTop: 8 }}>{data.brand.tagline}</div>
                </section>
            </div>

            <div className={`sb-nav-float ${!isCoverVisible ? 'v-active' : ''}`}>
                <button onClick={() => setLiked(!liked)} style={{ background: 'none', border: 'none', color: liked ? primary : '#ccc' }}>
                    <Heart size={24} fill={liked ? primary : 'none'} />
                </button>
                <a
                    href={(data.brand.whatsapp || data.brand.contact?.whatsapp) ? `https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)!.replace(/[^0-9]/g, '')}` : `mailto:${data.brand.email}`}
                    className="sb-cta"
                >
                    Ayo Jalan!
                </a>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: '#ccc' }}>
                    <ArrowUp size={24} />
                </button>
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
