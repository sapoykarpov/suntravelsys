'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Heart,
    Share2,
    MessageCircle,
    Play,
    Volume2,
    VolumeX,
    MapPin,
    Calendar,
    CreditCard,
    Info
} from 'lucide-react';
import { ItineraryPayload } from '@/types/itinerary';

export default function ThemeViralTiktok({
    data,
    isCoverVisible = true,
    scrollProgress = 0
}: {
    data: ItineraryPayload,
    isCoverVisible?: boolean,
    scrollProgress?: number
}) {
    const [activeScreen, setActiveScreen] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [liked, setLiked] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const slides: any[] = [];
    slides.push({
        type: 'hero',
        title: data.meta.title,
        subtitle: data.meta.subtitle,
        period: `${data.meta.durationDays}D${data.meta.durationNights}N`,
        videoUrl: data.days[0]?.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-view-of-the-city-of-positano-in-italy-40224-large.mp4',
        price: data.meta.price
    });

    data.days.forEach(day => {
        slides.push({
            type: 'day',
            day: day.dayNumber,
            location: day.location,
            title: day.title,
            desc: day.summary,
            videoUrl: day.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-luxury-villa-with-a-pool-and-view-of-the-sea-40228-large.mp4',
        });
    });

    if (data.departurePeriods?.enabled && data.departurePeriods.items.length > 0) {
        slides.push({
            type: 'periods',
            items: data.departurePeriods.items,
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flying-over-the-clouds-at-sunset-40236-large.mp4'
        });
    }

    if (data.testimonials?.enabled && data.testimonials.items.length > 0) {
        slides.push({
            type: 'testimonials',
            items: data.testimonials.items,
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4'
        });
    }

    if (data.gallery?.enabled && data.gallery.items.length > 0) {
        slides.push({
            type: 'gallery',
            items: data.gallery.items,
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-shore-1563-large.mp4'
        });
    }

    slides.push({
        type: 'deck',
        title: "READY FOR TAKEOFF?",
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-sea-from-a-balcony-40232-large.mp4'
    });

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const scrollPos = containerRef.current.scrollTop;
            const height = containerRef.current.offsetHeight;
            const index = Math.round(scrollPos / height);
            setActiveScreen(index);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const primary = data.brand.primaryColor || '#ff0050';

    return (
        <div className="vt-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
                
                .vt-root {
                    font-family: 'Montserrat', sans-serif;
                    background: #000;
                    color: #fff;
                    width: 100%;
                    max-width: 100%;
                    overflow: hidden;
                    height: 100vh;
                    position: relative;
                }
                .vt-root * { box-sizing: border-box; max-width: 100%; }

                .vt-snap-container {
                    scroll-snap-type: y mandatory;
                    overflow-y: scroll;
                    height: 100vh;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .vt-snap-container::-webkit-scrollbar { display: none; }

                .vt-section {
                    scroll-snap-align: start;
                    height: 100vh;
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                }

                .vt-video {
                    position: absolute; inset: 0;
                    width: 100%; height: 100%;
                    object-fit: cover; brightness: 0.7;
                }

                .vt-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent 40%, rgba(0,0,0,0.7));
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding-bottom: 140px;
                }

                .vt-badge {
                    display: inline-block;
                    background: white;
                    color: black;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }

                .vt-title {
                    font-size: clamp(28px, 9vw, 42px);
                    font-weight: 900;
                    font-style: italic;
                    line-height: 1.1;
                    margin-bottom: 12px;
                    word-break: break-word;
                }

                .vt-sub {
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    opacity: 0.8;
                    margin-bottom: 24px;
                }

                .vt-info-row {
                    display: flex;
                    gap: 20px;
                    margin-top: 16px;
                }
                .vt-info-item { display: flex; flex-direction: column; }
                .vt-info-label { font-size: 9px; text-transform: uppercase; font-weight: 700; opacity: 0.6; }
                .vt-info-val { font-size: 18px; font-weight: 700; }

                /* SIDEBAR */
                .vt-sidebar {
                    position: fixed; 
                    right: 16px; 
                    bottom: 160px;
                    display: flex; flex-direction: column; gap: 24px;
                    align-items: center; z-index: 50;
                    transition: all 0.5s ease;
                    opacity: ${activeScreen > 0 || !isCoverVisible ? 1 : 0};
                    pointer-events: ${activeScreen > 0 || !isCoverVisible ? 'auto' : 'none'};
                }
                .vt-side-btn {
                    width: 48px; height: 48px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                    display: flex; align-items: center; justify-content: center;
                    color: #fff;
                }
                .vt-side-label { font-size: 10px; font-weight: 700; margin-top: 4px; }

                /* BOTTOM BAR */
                .vt-bottom-bar {
                    position: fixed; 
                    bottom: 0; 
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    max-width: 430px;
                    padding: 24px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.9));
                    z-index: 40;
                    transition: all 0.5s ease;
                    opacity: ${activeScreen > 0 || !isCoverVisible ? 1 : 0};
                    pointer-events: ${activeScreen > 0 || !isCoverVisible ? 'auto' : 'none'};
                }
                .vt-cta {
                    display: block; width: 100%;
                    background: #fff; color: #000;
                    text-align: center; padding: 16px;
                    border-radius: 40px; font-weight: 900;
                    text-transform: uppercase; letter-spacing: 1px;
                    text-decoration: none; font-size: 14px;
                }

                .vt-glass-card {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 20px;
                    padding: 20px;
                }
            `}} />

            <div ref={containerRef} className="vt-snap-container">
                {slides.map((slide, idx) => (
                    <section key={idx} className="vt-section">
                        <video
                            autoPlay
                            loop
                            muted={isMuted}
                            playsInline
                            className="vt-video"
                            src={slide.videoUrl}
                        />
                        <div className="vt-overlay" style={{
                            justifyContent: data.coverTextSettings?.position === 'top' ? 'flex-start' : data.coverTextSettings?.position === 'bottom' ? 'flex-end' : 'center',
                            paddingTop: data.coverTextSettings?.position === 'top' ? '120px' : '24px',
                            paddingBottom: data.coverTextSettings?.position === 'bottom' ? '160px' : '24px',
                        }}>
                            {slide.type === 'hero' && (
                                <div style={{ opacity: activeScreen === idx ? 1 : 0, transition: '0.5s' }}>
                                    <span className="vt-badge">Exclusive Tour</span>
                                    <h1 className="vt-title" style={{
                                        ...(data.coverTextSettings?.fontSize ? { fontSize: data.coverTextSettings.fontSize } : {}),
                                        ...(data.coverTextSettings?.color ? { color: data.coverTextSettings.color } : {}),
                                        ...(data.coverTextSettings?.strokeWidth ? { WebkitTextStroke: `${data.coverTextSettings.strokeWidth}px ${data.coverTextSettings.strokeColor || '#000'}` } : {}),
                                        ...(data.coverTextSettings?.shadowBlur ? { textShadow: `0 2px ${data.coverTextSettings.shadowBlur}px ${data.coverTextSettings.shadowColor || '#000'}` } : {}),
                                    }}>{slide.title}</h1>
                                    <p className="vt-sub">{slide.subtitle}</p>
                                    <div className="vt-info-row">
                                        <div className="vt-info-item">
                                            <span className="vt-info-label">Investment</span>
                                            <span className="vt-info-val">{slide.price}</span>
                                        </div>
                                        <div className="vt-info-item">
                                            <span className="vt-info-label">Period</span>
                                            <span className="vt-info-val">{slide.period}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {slide.type === 'day' && (
                                <div style={{ opacity: activeScreen === idx ? 1 : 0, transition: '0.5s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6, fontSize: 11, marginBottom: 8 }}>
                                        <MapPin size={12} /> {slide.location}
                                    </div>
                                    <h2 className="vt-title">Day {slide.day}: {slide.title}</h2>
                                    <p style={{ fontSize: '14px', lineHeight: 1.6, fontWeight: 300 }}>{slide.desc}</p>
                                </div>
                            )}

                            {slide.type === 'periods' && (
                                <div style={{ opacity: activeScreen === idx ? 1 : 0, transition: '0.5s', width: '100%' }}>
                                    <h2 className="vt-title">JADWAL TRIP</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {slide.items.map((p: any, i: number) => (
                                            <div key={i} className="vt-glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Tanggal</span>
                                                    <span style={{ fontWeight: 800 }}>{p.date}</span>
                                                </div>
                                                {p.price && (
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Harga</span>
                                                        <div style={{ color: primary, fontWeight: 900 }}>{p.price}</div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {slide.type === 'testimonials' && (
                                <div style={{ opacity: activeScreen === idx ? 1 : 0, transition: '0.5s' }}>
                                    <h2 className="vt-title">GUESTS LOVE IT</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {slide.items.map((t: any, i: number) => (
                                            <div key={i} className="vt-glass-card" style={{ padding: '16px' }}>
                                                <p style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: 10 }}>"{t.text}"</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {t.avatar && <img src={t.avatar} style={{ width: 24, height: 24, borderRadius: '50%' }} alt="" />}
                                                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{t.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {slide.type === 'gallery' && (
                                <div style={{ opacity: activeScreen === idx ? 1 : 0, transition: '0.5s', width: '100%' }}>
                                    <h2 className="vt-title">MOMENTS</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {slide.items.slice(0, 4).map((item: any, i: number) => (
                                            <div key={i} style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
                                                <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {slide.type === 'deck' && (
                                <div style={{ opacity: activeScreen === idx ? 1 : 0, transition: '0.5s' }}>
                                    <h2 className="vt-title">READY?</h2>
                                    <div className="vt-glass-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.6 }}>DATES</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{data.meta.startDate}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.6 }}>PROVIDER</span>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: primary }}>{data.brand.name}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                ))}
            </div>

            <div className="vt-sidebar">
                <div className="flex flex-col items-center">
                    <button onClick={() => setLiked(!liked)} className="vt-side-btn" style={{ background: liked ? primary : '' }}>
                        <Heart size={24} fill={liked ? 'white' : 'none'} />
                    </button>
                    <span className="vt-side-label">Like</span>
                </div>
                <div className="flex flex-col items-center">
                    <button className="vt-side-btn">
                        <Share2 size={24} />
                    </button>
                    <span className="vt-side-label">Share</span>
                </div>
                <button onClick={() => setIsMuted(!isMuted)} className="vt-side-btn">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            <div className="vt-bottom-bar">
                {data.whatsappConfig?.enabled && data.whatsappConfig.numbers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {data.whatsappConfig.numbers.map((num, idx) => (
                            <a key={idx}
                                href={`https://wa.me/${num.number.replace(/[^0-9]/g, '')}`}
                                className="vt-cta"
                                style={{ padding: '12px', fontSize: '12px' }}
                            >
                                Chat with {num.label || 'Contact'}
                            </a>
                        ))}
                    </div>
                ) : (
                    <a
                        href={(data.brand.whatsapp || data.brand.contact?.whatsapp) ? `https://wa.me/${(data.brand.whatsapp || data.brand.contact?.whatsapp)!.replace(/[^0-9]/g, '')}` : `mailto:${data.brand.email}`}
                        className="vt-cta"
                    >
                        Book Now
                    </a>
                )}
            </div>
        </div>
    );
}
