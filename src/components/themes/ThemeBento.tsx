'use client';

import React, { useState, useEffect } from 'react';
import { ItineraryPayload } from '@/types/itinerary';
import { imageWithFallback } from '@/lib/utils/images';
import { Play } from 'lucide-react';

interface Props {
    data: ItineraryPayload;
}

export default function ThemeBento({
    data,
    isCoverVisible = true,
    scrollProgress = 0
}: {
    data: ItineraryPayload,
    isCoverVisible?: boolean,
    scrollProgress?: number
}) {
    const [activeDay, setActiveDay] = useState(0);
    const [playingVideoId, setPlayingVideoId] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('bento-active');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.bento-reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const primary = data.brand.primaryColor || '#2563eb';

    return (
        <div className="bento-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                .bento-root {
                    --primary: ${primary};
                    font-family: 'Inter', system-ui, sans-serif;
                    background: #F5F5F7;
                    color: #1D1D1F;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .bento-root * { box-sizing: border-box; max-width: 100%; }

                .bento-container {
                    width: 100%;
                    max-width: 600px;
                    padding: 16px;
                }

                .bc {
                    background: white;
                    border-radius: 24px;
                    padding: 24px;
                    border: 1px solid rgba(0,0,0,0.05);
                    margin-bottom: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }

                /* HERO */
                .bento-hero {
                    border-radius: 28px;
                    min-height: 320px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    margin-bottom: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                .bento-hero-img {
                    position: absolute; inset: 0;
                    width: 100%; height: 100%;
                    object-fit: cover;
                }
                .bento-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                }
                .bento-hero-content {
                    position: relative; z-index: 2;
                    padding: 24px;
                    color: white;
                }
                .bento-hero-badge {
                    display: inline-block;
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(12px);
                    padding: 6px 14px;
                    border-radius: 30px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                    border: 1px solid rgba(255,255,255,0.3);
                }
                .bento-hero h1 {
                    font-size: clamp(24px, 7vw, 36px);
                    font-weight: 800;
                    line-height: 1.1;
                    margin-bottom: 8px;
                    word-break: break-word;
                }
                .bento-hero p {
                    font-size: 14px;
                    opacity: 0.8;
                    word-break: break-word;
                }

                /* INFO ROW */
                .bento-info-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .bento-info-card {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 24px;
                }
                .bento-info-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }
                .bento-info-label {
                    font-size: 10px;
                    text-transform: uppercase;
                    font-weight: 700;
                    color: #999;
                    letter-spacing: 1px;
                    margin-bottom: 4px;
                }
                .bento-info-value {
                    font-size: clamp(14px, 4vw, 17px);
                    font-weight: 700;
                }

                /* PRICE CARD */
                .bento-price {
                    background: var(--primary);
                    color: white;
                    border-radius: 28px;
                    padding: 32px 24px;
                    margin-bottom: 16px;
                    text-align: center;
                }
                .bento-price-label {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    opacity: 0.8;
                    margin-bottom: 8px;
                }
                .bento-price-value {
                    font-size: clamp(28px, 8vw, 42px);
                    font-weight: 800;
                    margin-bottom: 8px;
                    word-break: break-word;
                }
                .bento-price-note {
                    font-size: 12px;
                    opacity: 0.7;
                    font-style: italic;
                    margin-bottom: 24px;
                }
                .bento-price-cta {
                    display: block;
                    background: white;
                    color: var(--primary);
                    text-align: center;
                    padding: 16px;
                    border-radius: 16px;
                    font-weight: 800;
                    font-size: 14px;
                    text-decoration: none;
                    transition: transform 0.2s;
                }

                /* ITINERARY */
                .bento-day-selector {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding-bottom: 12px;
                    margin-bottom: 20px;
                    scrollbar-width: none;
                }
                .bento-day-btn {
                    flex-shrink: 0;
                    width: 44px; height: 44px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 15px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bento-day-btn.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .bento-day-btn:not(.active) {
                    background: #f0f0f0;
                    color: #999;
                }
                .bento-day-img {
                    width: 100%;
                    aspect-ratio: 16/9;
                    object-fit: cover;
                    border-radius: 18px;
                    margin-bottom: 20px;
                }
                .bento-day-tag {
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 6px;
                }
                .bento-day-title {
                    font-size: 24px;
                    font-weight: 800;
                    margin-bottom: 10px;
                    line-height: 1.2;
                }
                .bento-day-summary {
                    font-size: 15px;
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                .bento-act {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 10px;
                    padding: 12px;
                    background: #F9F9FB;
                    border-radius: 16px;
                    border: 1px solid rgba(0,0,0,0.03);
                }
                .bento-act-time {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--primary);
                    min-width: 45px;
                }
                .bento-act-title {
                    font-weight: 700;
                    font-size: 14px;
                    margin-bottom: 2px;
                }
                .bento-act-desc {
                    font-size: 12px;
                    color: #888;
                }

                /* INC / EXC */
                .bento-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }

                /* REVEAL */
                .bento-reveal { opacity: 0; transform: translateY(20px); transition: all 0.5s ease-out; }
                .bento-active { opacity: 1; transform: translateY(0); }
            `}} />

            <div className="bento-container">
                {/* Hero */}
                <div className="bento-hero bento-reveal" style={{
                    justifyContent: data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'bottom' ? 'flex-end' : 'center',
                }}>
                    <img src={imageWithFallback(data.meta.coverImage || data.days[0]?.heroImage, 'japan')} className="bento-hero-img" alt="" />
                    <div className="bento-hero-overlay" />
                    <div className="bento-hero-content">
                        <div className="bento-hero-badge">{data.meta.durationDays} Days Experience</div>
                        <h1 style={{
                            ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                            ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                            ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                            ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                        }}>{data.meta.title}</h1>
                        <p>{data.meta.subtitle}</p>
                    </div>
                </div>

                {/* Info Row */}
                <div className="bento-info-row bento-reveal">
                    <div className="bc bento-info-card">
                        <div className="bento-info-icon">🧭</div>
                        <div className="bento-info-label">Duration</div>
                        <div className="bento-info-value">{data.meta.durationDays}D / {data.meta.durationNights}N</div>
                    </div>
                    <div className="bc bento-info-card" style={{ background: '#fff' }}>
                        <div className="bento-info-icon">🎒</div>
                        <div className="bento-info-label">Group Size</div>
                        <div className="bento-info-value">{data.meta.groupSize}</div>
                    </div>
                </div>

                {/* Price */}
                <div className="bento-price bento-reveal">
                    <div className="bento-price-label">Complete Package</div>
                    <div className="bento-price-value">{data.meta.price}</div>
                    <div className="bento-price-note">{data.meta.priceNote}</div>
                    <a
                        href={(data.brand.whatsapp || data.brand.contact?.whatsapp)
                            ? `https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)!.replace(/[^0-9]/g, '')}`
                            : `mailto:${data.brand.email || data.brand.contact?.email}`}
                        target="_blank" rel="noreferrer"
                        className="bento-price-cta"
                    >
                        Book Your Journey →
                    </a>
                </div>

                {/* Highlights */}
                <div className="bc bento-reveal">
                    <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>✨ Key Highlights</h3>
                    {data.highlights.map((hlt, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx < data.highlights.length - 1 ? '1px solid #f5f5f7' : 'none' }}>
                            <span style={{ fontSize: 13, color: '#555', fontWeight: 600, flex: 1, marginRight: 12 }}>{hlt.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', background: 'rgba(37, 99, 235, 0.08)', padding: '4px 12px', borderRadius: 10, textAlign: 'right' }}>{hlt.value}</span>
                        </div>
                    ))}
                </div>

                {/* Itinerary */}
                <div className="bc bento-reveal">
                    <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>📍 Itinerary</h3>
                    <div className="bento-day-selector">
                        {data.days.map((_, i) => (
                            <button key={i} className={`bento-day-btn ${activeDay === i ? 'active' : ''}`} onClick={() => setActiveDay(i)}>
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    {data.days[activeDay] && (
                        <div key={activeDay} className="bento-reveal bento-active">
                            <div style={{ position: 'relative' }}>
                                {playingVideoId && data.days[activeDay].videoUrl ? (
                                    <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                                        <iframe src={`https://www.youtube.com/embed/${data.days[activeDay].videoUrl}?autoplay=1`} frameBorder="0" allowFullScreen style={{ width: '100%', height: '100%' }} />
                                        <button onClick={() => setPlayingVideoId(false)} style={{
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
                                        <img src={imageWithFallback(data.days[activeDay].heroImage, 'japan')} alt="" className="bento-day-img" />
                                        {data.days[activeDay].videoUrl && (
                                            <button onClick={() => setPlayingVideoId(true)} style={{
                                                position: 'absolute', bottom: 16, right: 16,
                                                background: 'rgba(255,255,255,0.95)', borderRadius: '50%',
                                                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.3s', border: 'none', padding: 0
                                            }}>
                                                <Play size={20} fill="currentColor" color="#2563eb" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="bento-day-tag">Day {String(activeDay + 1).padStart(2, '0')}</div>
                            <div className="bento-day-title">{data.days[activeDay].title}</div>
                            <div className="bento-day-summary">{data.days[activeDay].summary}</div>

                            {data.days[activeDay].activities.map((act, i) => (
                                <div key={i} className="bento-act">
                                    <div className="bento-act-time">{act.time}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="bento-act-title">{act.title}</div>
                                        <div className="bento-act-desc">{act.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inclusions */}
                <div className="bento-grid bento-reveal">
                    <div className="bc" style={{ background: '#F0FDF4', borderColor: '#DCFCE7' }}>
                        <h4 style={{ color: '#166534', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>✓ Inclusions</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {data.inclusions.map((inc, i) => (
                                <li key={i} style={{ fontSize: 13, color: '#166534', marginBottom: 6, paddingLeft: 20, position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 0 }}>•</span> {inc}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bc" style={{ background: '#FEF2F2', borderColor: '#FEE2E2' }}>
                        <h4 style={{ color: '#991B1B', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>✕ Exclusions</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {data.exclusions.map((exc, i) => (
                                <li key={i} style={{ fontSize: 13, color: '#991B1B', marginBottom: 6, paddingLeft: 20, position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 0 }}>•</span> {exc}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
