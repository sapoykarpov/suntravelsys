'use client';

import React, { useEffect, useState } from 'react';
import { Plane, Moon, Coffee, Bus, Camera, MapPin, ChevronRight, Share2, Heart, CheckCircle2, Award, Zap, Shield, Play, X } from 'lucide-react';
import { ItineraryPayload } from '@/types/itinerary';
import OptionalSections from '../OptionalSections';
import { imageWithFallback } from '@/lib/utils/images';

interface Props {
    data: ItineraryPayload;
}

export default function ThemeAmazingBlack({
    data,
    isCoverVisible = true,
    scrollProgress = 0
}: {
    data: ItineraryPayload,
    isCoverVisible?: boolean,
    scrollProgress?: number
}) {
    const [playingDayIdx, setPlayingDayIdx] = useState<number | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('ab-active');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.ab-reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const gold = data.brand.primaryColor || '#D4AF37';
    const dark = data.brand.secondaryColor || '#0a0a0a';

    return (
        <div className="ab-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                .ab-root {
                    --gold: ${gold};
                    --dark: ${dark};
                    font-family: 'Montserrat', system-ui, sans-serif;
                    background: var(--dark);
                    color: #fff;
                    overflow-x: hidden;
                    width: 100%;
                    max-width: 100%;
                }
                .ab-root * { box-sizing: border-box; max-width: 100%; }

                /* HERO */
                .ab-hero {
                    min-height: 85vh;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .ab-hero-img {
                    position: absolute; inset: 0;
                    width: 100%; height: 100%;
                    object-fit: cover; opacity: 0.5;
                }
                .ab-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 80%, var(--dark) 100%);
                }
                .ab-hero-content {
                    position: relative; z-index: 2;
                    text-align: center;
                    padding: 80px 24px 140px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-height: 85vh;
                    justify-content: ${data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'bottom' ? 'flex-end' : 'center'};
                }
                .ab-badge {
                    display: inline-block;
                    border: 1px solid var(--gold);
                    padding: 10px 20px;
                    margin-bottom: 24px;
                    border-radius: 4px;
                }
                .ab-badge span {
                    color: var(--gold);
                    font-size: 10px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    font-weight: 500;
                }
                .ab-hero-title {
                    font-family: 'Cormorant Garamond', 'Georgia', serif;
                    font-size: clamp(32px, 8vw, 56px);
                    font-weight: 300;
                    line-height: 1.1;
                    margin-bottom: 16px;
                    word-break: break-word;
                }
                .ab-hero-title em {
                    display: block;
                    font-style: italic;
                    color: var(--gold);
                }
                .ab-hero-sub {
                    font-size: 12px;
                    font-weight: 300;
                    letter-spacing: 2px;
                    color: rgba(255,255,255,0.7);
                    text-transform: uppercase;
                }

                /* SECTIONS */
                .ab-section {
                    padding: 60px 20px;
                    width: 100%;
                }
                .ab-section-label {
                    font-size: 10px;
                    letter-spacing: 3px;
                    color: var(--gold);
                    text-transform: uppercase;
                    margin-bottom: 12px;
                    display: block;
                }
                .ab-section-title {
                    font-family: 'Cormorant Garamond', 'Georgia', serif;
                    font-size: clamp(24px, 6vw, 36px);
                    font-weight: 300;
                    margin-bottom: 16px;
                    line-height: 1.2;
                    word-break: break-word;
                }
                .ab-text {
                    font-size: 14px;
                    line-height: 1.8;
                    color: rgba(255,255,255,0.65);
                    font-weight: 300;
                    word-break: break-word;
                }

                /* HIGHLIGHTS */
                .ab-highlights {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 32px;
                }
                .ab-highlight-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(212,175,55,0.15);
                    border-radius: 16px;
                    padding: 24px 20px;
                }
                .ab-highlight-card h3 {
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--gold);
                    word-break: break-word;
                }
                .ab-highlight-card p {
                    font-size: 13px;
                    color: rgba(255,255,255,0.5);
                    line-height: 1.5;
                }

                /* TIMELINE */
                .ab-timeline { padding: 20px 0; }
                .ab-day {
                    position: relative;
                    padding-left: 40px;
                    margin-bottom: 48px;
                    border-left: 1px solid rgba(212,175,55,0.2);
                }
                .ab-day-dot {
                    position: absolute;
                    left: -6px; top: 4px;
                    width: 12px; height: 12px;
                    background: var(--gold);
                    border-radius: 50%;
                    border: 3px solid var(--dark);
                }
                .ab-day-label {
                    font-size: 10px;
                    color: var(--gold);
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                }
                .ab-day-title {
                    font-family: 'Cormorant Garamond', 'Georgia', serif;
                    font-size: clamp(22px, 5vw, 28px);
                    font-weight: 400;
                    margin-bottom: 16px;
                    word-break: break-word;
                }
                .ab-day-img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    border-radius: 12px;
                    margin-bottom: 16px;
                }
                .ab-activity {
                    background: rgba(255,255,255,0.02);
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 10px;
                    border-left: 2px solid var(--gold);
                }
                .ab-act-time {
                    font-size: 11px;
                    color: var(--gold);
                    margin-bottom: 4px;
                    font-weight: 500;
                    letter-spacing: 1px;
                }
                .ab-act-title {
                    font-size: 15px;
                    margin-bottom: 4px;
                    font-weight: 500;
                }
                .ab-act-desc {
                    font-size: 13px;
                    color: rgba(255,255,255,0.5);
                    line-height: 1.5;
                    word-break: break-word;
                }

                /* PRICE CTA */
                .ab-price-section {
                    padding: 60px 20px;
                    text-align: center;
                    background: #111;
                }
                .ab-price-value {
                    font-family: 'Cormorant Garamond', 'Georgia', serif;
                    font-size: clamp(28px, 7vw, 48px);
                    color: var(--gold);
                    margin-bottom: 12px;
                    word-break: break-word;
                }
                .ab-cta {
                    display: inline-block;
                    border: 1px solid var(--gold);
                    color: var(--gold);
                    padding: 14px 32px;
                    border-radius: 30px;
                    font-size: 11px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    text-decoration: none;
                    margin-top: 24px;
                    background: transparent;
                    cursor: pointer;
                }
                .ab-inc-exc {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                    margin-top: 32px;
                    text-align: left;
                }
                .ab-inc-exc h4 {
                    color: var(--gold);
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 20px;
                    margin-bottom: 12px;
                }
                .ab-inc-exc li {
                    font-size: 13px;
                    color: rgba(255,255,255,0.6);
                    margin-bottom: 6px;
                    list-style: none;
                    padding-left: 16px;
                    position: relative;
                }
                .ab-inc-exc li::before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: var(--gold);
                }

                /* ANIMATIONS */
                .ab-reveal {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .ab-active {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}} />

            {/* HERO */}
            <section className="ab-hero">
                <img src={imageWithFallback(data.meta.coverImage || data.days[0]?.heroImage, 'japan')} alt="" className="ab-hero-img" />
                <div className="ab-hero-overlay" />
                <div className="ab-hero-content">
                    <div className="ab-badge"><span>Premium Escape</span></div>
                    <h1 className="ab-hero-title" style={{
                        ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                        ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                        ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                        ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                    }}>
                        {data.meta.title.split('—')[0].trim()}
                        {data.meta.title.includes('—') && <em>{data.meta.title.split('—')[1]?.trim()}</em>}
                    </h1>
                    <p className="ab-hero-sub">{data.meta.durationDays} Days • {data.meta.subtitle}</p>
                </div>
            </section>

            {/* HIGHLIGHTS */}
            <section className="ab-section" style={{ textAlign: 'center' }}>
                <div className="ab-reveal">
                    <span className="ab-section-label">The Experience</span>
                    <h2 className="ab-section-title">A Journey Beyond Ordinary</h2>
                    <p className="ab-text">
                        {data.meta.subtitle}. Curated exclusively for {data.meta.groupSize} by {data.brand.name}.
                    </p>
                </div>
                <div className="ab-highlights ab-reveal">
                    {data.highlights.map((hlt, idx) => (
                        <div key={idx} className="ab-highlight-card" style={{ textAlign: 'left' }}>
                            <h3>{hlt.value}</h3>
                            <p>{hlt.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ITINERARY */}
            <section className="ab-section">
                <div className="ab-reveal" style={{ textAlign: 'center', marginBottom: 32 }}>
                    <span className="ab-section-label">Itinerary</span>
                    <h2 className="ab-section-title">Day by Day</h2>
                </div>
                <div className="ab-timeline">
                    {data.days.map((day, idx) => (
                        <div key={idx} className="ab-day ab-reveal">
                            <div className="ab-day-dot" />
                            <span className="ab-day-label">Day {day.dayNumber} • {day.location}</span>
                            <h3 className="ab-day-title">{day.title}</h3>
                            <div style={{ position: 'relative' }}>
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
                                        <img src={imageWithFallback(day.heroImage, 'japan')} alt={day.title} className="ab-day-img" />
                                        {day.videoUrl && (
                                            <button onClick={() => setPlayingDayIdx(idx)} style={{
                                                position: 'absolute', bottom: 16, right: 16,
                                                background: 'rgba(255,255,255,0.95)', borderRadius: '50%',
                                                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.3s',
                                                border: 'none', padding: 0
                                            }}>
                                                <Play size={20} fill="currentColor" color="#D4AF37" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <p className="ab-text" style={{ marginBottom: 16 }}>{day.summary}</p>
                            {day.activities.map((act, i) => (
                                <div key={i} className="ab-activity">
                                    <div className="ab-act-time">{act.time}</div>
                                    <div className="ab-act-title">{act.title}</div>
                                    <div className="ab-act-desc">{act.description}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            <OptionalSections data={data} primaryColor={gold} />

            {/* PRICING */}
            <section className="ab-price-section">
                <div className="ab-reveal">
                    <span className="ab-section-label">Investment</span>
                    <div className="ab-price-value">{data.meta.price}</div>
                    <p className="ab-text" style={{ fontStyle: 'italic' }}>{data.meta.priceNote}</p>

                    <div className="ab-inc-exc">
                        <div>
                            <h4>Inclusions</h4>
                            <ul>{data.inclusions.map((inc, i) => <li key={i}>{inc}</li>)}</ul>
                        </div>
                        <div>
                            <h4>Exclusions</h4>
                            <ul>{data.exclusions.map((exc, i) => <li key={i}>{exc}</li>)}</ul>
                        </div>
                    </div>

                    {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 32 }}>
                            {data.whatsappConfig.numbers.map((num, idx) => (
                                <a key={idx}
                                    href={`https://wa.me/${num.number.replace(/[^0-9]/g, '')}`}
                                    target="_blank" rel="noreferrer"
                                    className="ab-cta"
                                    style={{ margin: 0, width: '100%', maxWidth: 300 }}
                                >
                                    Chat with {num.label || 'Contact'}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <a
                            href={(data.brand.whatsapp || data.brand.contact?.whatsapp)
                                ? `https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)!.replace(/[^0-9]/g, '')}`
                                : `mailto:${data.brand.email || data.brand.contact?.email}`}
                            target="_blank" rel="noreferrer"
                            className="ab-cta"
                        >
                            Request to Book
                        </a>
                    )}
                </div>
            </section>
        </div>
    );
}
