'use client';

import React from 'react';
import { ItineraryPayload } from '@/types/itinerary';
import { Star, Quote } from 'lucide-react';

interface OptionalSectionsProps {
    data: ItineraryPayload;
    primaryColor?: string;
}

export default function OptionalSections({ data, primaryColor = '#D4AF37' }: OptionalSectionsProps) {
    if (!data.testimonials?.enabled && !data.gallery?.enabled && !data.departurePeriods?.enabled) return null;

    return (
        <div className="opt-root">
            <style dangerouslySetInnerHTML={{
                __html: `
                .opt-section { padding: 80px 24px; width: 100%; max-width: 650px; margin: 0 auto; }
                .opt-title { font-size: 32px; font-weight: 800; margin-bottom: 40px; text-align: center; letter-spacing: -0.02em; }
                
                /* Testimonials */
                .test-grid { display: flex; flex-direction: column; gap: 24px; }
                .test-card { background: #fff; padding: 32px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
                .test-quote { color: ${primaryColor}; margin-bottom: 20px; opacity: 0.3; }
                .test-text { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #4b5563; font-style: italic; }
                .test-user { display: flex; align-items: center; gap: 12px; }
                .test-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: #f3f4f6; }
                .test-name { font-weight: 700; font-size: 14px; color: #1a1a1a; }
                .test-role { font-size: 12px; color: #9ca3af; }

                /* Gallery */
                .gal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                .gal-item { border-radius: 16px; overflow: hidden; aspect-ratio: 1/1; position: relative; background: #f3f4f6; }
                .gal-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
                .gal-item:hover .gal-img { transform: scale(1.1); }

                /* Periods */
                .period-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
                .period-card { background: #fff; padding: 20px 24px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .period-date { font-weight: 800; font-size: 16px; color: #1a1a1a; }
                .period-price { color: ${primaryColor}; font-weight: 900; font-size: 16px; }
                .period-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 4px; display: block; }
            `}} />

            {data.departurePeriods?.enabled && data.departurePeriods.items.length > 0 && (
                <section className="opt-section" id="departure-periods">
                    <h2 className="opt-title">Jadwal Keberangkatan</h2>
                    <div className="period-grid">
                        {data.departurePeriods.items.map((p, i) => (
                            <div key={i} className="period-card">
                                <div>
                                    <span className="period-label">Tanggal</span>
                                    <span className="period-date">{p.date}</span>
                                </div>
                                {p.price && (
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="period-label">Mulai Dari</span>
                                        <span className="period-price">{p.price}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {data.testimonials?.enabled && data.testimonials.items.length > 0 && (
                <section className="opt-section" id="testimonials">
                    <h2 className="opt-title">Apa Kata Mereka</h2>
                    <div className="test-grid">
                        {data.testimonials.items.map((t, i) => (
                            <div key={i} className="test-card">
                                <Quote className="test-quote" size={32} />
                                <p className="test-text">"{t.text}"</p>
                                <div className="test-user">
                                    {t.avatar ? (
                                        <img src={t.avatar} className="test-avatar" alt={t.name} />
                                    ) : (
                                        <div className="test-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', color: primaryColor }}>
                                            {t.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="test-name">{t.name}</div>
                                        {t.role && <div className="test-role">{t.role}</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {data.gallery?.enabled && data.gallery.items.length > 0 && (
                <section className="opt-section" id="gallery">
                    <h2 className="opt-title">Sudut Pandang</h2>
                    <div className="gal-grid">
                        {data.gallery.items.map((item, i) => (
                            <div key={i} className="gal-item">
                                <img src={item.url} className="gal-img" alt={item.caption || ""} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
