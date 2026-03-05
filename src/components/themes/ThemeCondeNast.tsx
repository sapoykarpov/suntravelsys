"use client";

import React, { useState, useEffect, useRef } from "react";
import type { ItineraryPayload } from "@/types/itinerary";
import OptionalSections from '../OptionalSections';
import {
    Heart,
    Share2,
    MessageCircle,
    ArrowUp,
    MapPin,
    Calendar,
    CheckCircle2,
    XCircle,
    Play,
    Moon,
    Coffee,
    Plane,
    Camera,
    Navigation,
    Bus,
    Star,
    Check,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

export default function ThemeCondeNast({
    data,
    isCoverVisible = true,
    scrollProgress = 0
}: {
    data: ItineraryPayload,
    isCoverVisible?: boolean,
    scrollProgress?: number
}) {
    const [liked, setLiked] = useState(false);
    const [playingDayIdx, setPlayingDayIdx] = useState<number | null>(null);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            // Simplified: centralized isCoverVisible prop now handles visibility
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('cn-active');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.cn-reveal').forEach(el => observer.observe(el));
        return () => {
            window.removeEventListener("scroll", handleScroll);
            observer.disconnect();
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getHeroStyle = () => {
        const currentPosition = data.coverTextSettings?.position || 'center';
        return `
            .cn-hero {
                justify-content: ${currentPosition === 'top' ? 'flex-start' : currentPosition === 'bottom' ? 'flex-end' : 'center'} !important;
            }
        `;
    };

    const renderActivityIcon = (iconCategory?: string) => {
        switch (iconCategory) {
            case "flight": return <Plane size={18} />;
            case "hotel": return <Moon size={18} />;
            case "meal": return <Coffee size={18} />;
            case "transport": return <Navigation size={18} />;
            default: return <Camera size={18} />;
        }
    };

    const primaryColor = data.brand.primaryColor || "#f97316";
    const secondaryColor = data.brand.secondaryColor || "#1c1917";
    const accentColor = primaryColor; // Assuming primaryColor is the accent color for OptionalSections

    return (
        <div className="cn-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
                
                .cn-root {
                    --primary: ${primaryColor};
                    --secondary: ${secondaryColor};
                    font-family: 'Lato', sans-serif;
                    background: #F9F8F6;
                    color: #1c1917;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .cn-root * { box-sizing: border-box; max-width: 100%; }
                
                .cn-container {
                    width: 100%;
                    max-width: 650px;
                    background: #fff;
                    min-height: 100vh;
                    position: relative;
                    box-shadow: 0 0 40px rgba(0,0,0,0.03);
                }

                .font-serif { font-family: 'Playfair Display', serif !important; }

                /* HERO */
                .cn-hero {
                    height: 90vh;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    color: #fff;
                    overflow: hidden;
                    width: 100%;
                    padding: 100px 0;
                }
                ${getHeroStyle()}
                .cn-hero-bg {
                    position: absolute; inset: 0;
                    background-size: cover;
                    background-position: center;
                }
                .cn-hero-overlay {
                    position: absolute; inset: 0;
                    background: rgba(0,0,0,0.4);
                }
                .cn-hero-content {
                    position: relative; z-index: 2;
                    padding: 24px;
                    width: 100%;
                }
                .cn-hero-label {
                    font-size: 11px;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                    opacity: 0.9;
                }
                .cn-hero-title {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: clamp(32px, 9vw, 56px);
                    line-height: 1.1;
                    margin-bottom: 16px;
                    word-break: break-word;
                }
                .cn-hero-sub {
                    font-size: 16px;
                    font-weight: 300;
                    max-width: 400px;
                    margin: 0 auto 32px;
                    opacity: 0.8;
                }
                .cn-badges {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .cn-badge {
                    background: rgba(255,255,255,0.15);
                    backdrop-filter: blur(8px);
                    padding: 6px 14px;
                    border-radius: 30px;
                    font-size: 11px;
                    border: 1px solid rgba(255,255,255,0.2);
                }

                /* SECTION INTRO */
                .cn-section {
                    padding: 60px 24px;
                    text-align: center;
                }
                .cn-section-h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(24px, 7vw, 36px);
                    margin-bottom: 24px;
                }
                .cn-section-p {
                    font-size: 17px;
                    line-height: 1.8;
                    color: #666;
                    font-weight: 300;
                    font-style: italic;
                    max-width: 500px;
                    margin: 0 auto;
                }

                /* ITINERARY */
                .cn-day-card {
                    border-bottom: 1px solid #f0f0f0;
                    overflow: hidden;
                }
                .cn-day-img-box {
                    width: 100%;
                    height: 300px;
                    position: relative;
                }
                .cn-day-img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                }
                .cn-day-content {
                    padding: 40px 24px;
                }
                .cn-day-num {
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    color: var(--primary);
                    margin-bottom: 8px;
                    display: block;
                }
                .cn-day-loc {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #aaa;
                    margin-bottom: 16px;
                }
                .cn-day-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px;
                    margin-bottom: 16px;
                    line-height: 1.2;
                }
                .cn-day-summary {
                    font-size: 16px;
                    line-height: 1.7;
                    color: #555;
                    font-weight: 300;
                    margin-bottom: 32px;
                    padding-left: 20px;
                    border-left: 2px solid var(--primary);
                }
                .cn-activities {
                    display: grid;
                    gap: 24px;
                }
                .cn-act-item {
                    display: flex;
                    gap: 16px;
                }
                .cn-act-icon {
                    color: var(--primary);
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .cn-act-time {
                    font-size: 11px;
                    font-weight: 700;
                    color: #bbb;
                    margin-bottom: 4px;
                }
                .cn-act-title {
                    font-weight: 700;
                    font-size: 15px;
                    margin-bottom: 4px;
                }
                .cn-act-desc {
                    font-size: 13px;
                    color: #777;
                    line-height: 1.5;
                }

                /* PRICING */
                .cn-price-section {
                    background: var(--secondary);
                    color: #fff;
                    padding: 80px 24px;
                    text-align: center;
                }
                .cn-price-accent {
                    width: 60px; height: 3px;
                    background: var(--primary);
                    margin: 0 auto 32px;
                }
                .cn-price-val {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(32px, 8vw, 48px);
                    margin-bottom: 12px;
                }
                .cn-price-label {
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    opacity: 0.5;
                    margin-bottom: 40px;
                }
                .cn-cta {
                    display: inline-block;
                    background: #fff;
                    color: #000;
                    padding: 18px 40px;
                    font-weight: 700;
                    font-size: 12px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    text-decoration: none;
                }

                /* INC/EXC */
                .cn-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 40px;
                    margin-top: 60px;
                    text-align: left;
                }
                .cn-grid h4 {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .cn-grid ul { list-style: none; padding: 0; }
                .cn-grid li {
                    font-size: 14px;
                    color: rgba(255,255,255,0.7);
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                /* NAV */
                .cn-nav-fixed {
                    position: fixed; bottom: 0; left: 50%;
                    transform: translateX(-50%) translateY(100%);
                    width: 100%;
                    max-width: 430px;
                    background: rgba(255,255,255,0.95);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid #eee;
                    padding: 16px 24px;
                    z-index: 100;
                    display: flex;
                    justify-content: center;
                    transition: transform 0.4s ease;
                }
                .cn-nav-show { transform: translateX(-50%) translateY(0); }
                .cn-nav-inner {
                    width: 100%;
                    max-width: 600px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .cn-nav-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: #555;
                    text-decoration: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                }
                .cn-nav-btn span {
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 4px;
                }
                .cn-book-btn-mini {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: 18px;
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                }

                /* ANIM */
                .cn-reveal {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .cn-active {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}} />

            <div className="cn-container">
                {/* Hero */}
                <header ref={heroRef} className="cn-hero">
                    <div className="cn-hero-bg" style={{ backgroundImage: `url('${data.meta.coverImage || data.days[0]?.heroImage}')` }} />
                    <div className="cn-hero-overlay" />
                    <div className="cn-hero-content cn-reveal">
                        <p className="cn-hero-label">The Digital Journal</p>
                        <h1 className="cn-hero-title" style={{
                            ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                            ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                            ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                            ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                        }}>{data.meta.title}</h1>
                        <p className="cn-hero-sub">{data.meta.subtitle}</p>
                        <div className="cn-badges">
                            <span className="cn-badge">{data.meta.durationDays} Days</span>
                            <span className="cn-badge">{data.meta.groupSize}</span>
                            <span className="cn-badge">Premium</span>
                        </div>
                    </div>
                </header>

                <OptionalSections data={data} primaryColor={accentColor} />

                {/* Intro */}
                <section className="cn-section cn-reveal">
                    <h2 className="cn-section-h2">A Journey Beyond Ordinary</h2>
                    <p className="cn-section-p">
                        "{data.meta.subtitle} — Sebuah mahakarya perjalanan yang tak
                        terlupakan. Setiap detail dirancang dengan cermat untuk memberikan
                        pengalaman kelas dunia."
                    </p>
                </section>

                {/* Itinerary */}
                <div className="cn-itinerary">
                    {data.days.map((day, idx) => (
                        <section key={idx} className="cn-day-card">
                            <div className="cn-day-img-box cn-reveal">
                                <img src={day.heroImage} className="cn-day-img" alt="" />
                                {day.videoUrl && (
                                    playingDayIdx === idx ? (
                                        <div style={{ position: 'relative' }}>
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
                                        <button onClick={() => setPlayingDayIdx(idx)} className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-full shadow-lg" style={{ border: 'none', cursor: 'pointer' }}>
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                    )
                                )}
                            </div>
                            <div className="cn-day-content cn-reveal">
                                <span className="cn-day-num">DAY {day.dayNumber.toString().padStart(2, "0")}</span>
                                <div className="cn-day-loc">
                                    <MapPin size={12} />
                                    <span>{day.location}</span>
                                </div>
                                <h3 className="cn-day-title">{day.title}</h3>
                                <div className="cn-day-summary">{day.summary}</div>
                                <div className="cn-activities">
                                    {day.activities.map((act: any, i) => (
                                        <div key={i} className="cn-act-item">
                                            <div className="cn-act-icon">{renderActivityIcon(act.iconCategory)}</div>
                                            <div>
                                                <div className="cn-act-time">{act.time}</div>
                                                <div className="cn-act-title">{act.title}</div>
                                                <div className="cn-act-desc">{act.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {/* Pricing */}
                <section className="cn-price-section">
                    <div className="cn-price-accent" />
                    <p className="cn-price-label">Investment</p>
                    <div className="cn-price-val cn-reveal">{data.meta.price}</div>
                    <p style={{ opacity: 0.5, fontSize: '13px', fontStyle: 'italic', marginBottom: '40px' }} className="cn-reveal">{data.meta.priceNote}</p>
                    {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                            {data.whatsappConfig.numbers.map((num, idx) => (
                                <a key={idx}
                                    href={`https://wa.me/${num.number.replace(/[^0-9]/g, '')}`}
                                    className="cn-cta cn-reveal"
                                    style={{ width: '100%', maxWidth: 350 }}
                                >
                                    Chat with {num.label || 'Contact'}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <a
                            href={(data.brand.whatsapp || data.brand.contact?.whatsapp)
                                ? `https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)!.replace(/[^0-9]/g, '')}`
                                : `mailto:${data.brand.email}`}
                            className="cn-cta cn-reveal"
                        >
                            Inquire Availability
                        </a>
                    )}

                    <div className="cn-grid">
                        <div className="cn-reveal">
                            <h4><CheckCircle2 size={20} style={{ color: primaryColor }} /> Price Includes</h4>
                            <ul>{data.inclusions.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </div>
                        <div className="cn-reveal">
                            <h4><XCircle size={20} style={{ opacity: 0.5 }} /> Price Excludes</h4>
                            <ul>{data.exclusions.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </div>
                    </div>
                </section>

                {/* Nav */}
                <div className={`cn-nav-fixed ${!isCoverVisible ? 'cn-nav-show' : ''}`}>
                    <div className="cn-nav-inner">
                        <button onClick={() => setLiked(!liked)} className="cn-nav-btn">
                            <Heart size={20} fill={liked ? 'red' : 'none'} style={{ color: liked ? 'red' : '#555' }} />
                            <span>Love</span>
                        </button>
                        <button onClick={scrollToTop} className="cn-nav-btn" style={{ background: '#1c1917', color: '#fff', width: '40px', height: '40px', borderRadius: '50%' }}>
                            <ArrowUp size={20} />
                        </button>
                        {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                            <a
                                href={`https://wa.me/${data.whatsappConfig.numbers[0].number.replace(/[^0-9]/g, '')}`}
                                className="cn-book-btn-mini"
                            >
                                <MessageCircle size={20} />
                                <span>Chat</span>
                            </a>
                        ) : (
                            <a
                                href={(data.brand.whatsapp || data.brand.contact?.whatsapp)
                                    ? `https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)!.replace(/[^0-9]/g, '')}`
                                    : `mailto:${data.brand.email}`}
                                className="cn-book-btn-mini"
                            >
                                <MessageCircle size={20} />
                                <span>Book</span>
                            </a>
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
