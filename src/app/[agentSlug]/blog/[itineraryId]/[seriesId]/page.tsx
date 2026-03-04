import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ItineraryPayload } from '@/types/itinerary';

interface PageProps {
    params: Promise<{ agentSlug: string; itineraryId: string; seriesId: string }>;
}

// Same series generator as MicroblogKit — shared logic
function generateSeries(data: ItineraryPayload) {
    const { meta, days, highlights, inclusions, brand } = data;

    const series: Record<string, {
        title: string; icon: string; angle: string;
        slides: { heading: string; body: string; image?: string; tag?: string; emoji?: string; type: string }[];
    }> = {
        highlight: {
            title: 'Highlight Destinasi', icon: '🏅', angle: 'Showcase tempat-tempat terbaik dalam perjalanan ini',
            slides: [
                { type: 'cover', heading: `${meta.durationDays} Highlights Tak Terlupakan`, body: meta.subtitle || '', image: days[0]?.heroImage, tag: `${meta.durationDays}H${meta.durationNights}M`, emoji: '✨' },
                ...days.slice(0, 3).map(d => ({ type: 'day', heading: d.title, body: d.summary, image: d.heroImage, tag: `Day ${d.dayNumber}`, emoji: '📍' })),
                { type: 'cta', heading: 'Tertarik?', body: `Dapatkan paket ${meta.title} mulai ${meta.price}.`, emoji: '🎯', tag: 'Book Now' },
            ],
        },
        journey: {
            title: 'Day-by-Day Journey', icon: '🗺️', angle: 'Nikmati perjalanan hari per hari',
            slides: [
                { type: 'cover', heading: `${meta.durationDays} Hari di ${days[0]?.location?.split(',')[0] || 'Destinasi Impian'}`, body: `Bersama ${brand.name} ✈️`, image: days[0]?.heroImage, tag: 'Itinerary', emoji: '🗓️' },
                ...days.slice(0, 4).map(d => ({
                    type: 'day', heading: `Day ${d.dayNumber}: ${d.title}`,
                    body: d.activities.slice(0, 3).map(a => `• ${a.title}`).join('\n'),
                    image: d.heroImage, tag: d.location.split(',')[0], emoji: '📅',
                })),
            ],
        },
        value: {
            title: 'Value & Harga', icon: '💰', angle: 'Liburan berkualitas dengan harga terbaik',
            slides: [
                { type: 'cover', heading: `${meta.durationDays} Hari Cuma ${meta.price}`, body: 'Breakdown lengkap apa yang kamu dapatkan 👇', image: days[Math.floor(days.length / 2)]?.heroImage, tag: 'Worth It?', emoji: '🤔' },
                { type: 'inclusion', heading: 'Semua Sudah Termasuk!', body: inclusions.slice(0, 6).join('\n'), emoji: '✅', tag: 'Inclusions' },
                { type: 'highlight', heading: 'Yang Bikin Beda', body: highlights.slice(0, 4).map(h => `${h.icon || '•'} ${h.label}: ${h.value}`).join('\n'), emoji: '⭐', tag: 'Keunggulan' },
                { type: 'cta', heading: `Mulai dari ${meta.price}`, body: `${meta.priceNote || 'Per orang, all-inclusive'}. Hubungi kami sekarang!`, emoji: '💌', tag: 'Contact Us' },
            ],
        },
        tips: {
            title: 'Tips & Edukasi', icon: '💡', angle: 'Persiapan terbaik sebelum berangkat',
            slides: [
                { type: 'cover', heading: `5 Hal Wajib Tahu Sebelum ke ${days[0]?.location?.split(',')[0] || 'Destinasi'}`, body: `Tips dari ${brand.name}`, image: days[1]?.heroImage, tag: 'Tips', emoji: '📌' },
                { type: 'highlight', heading: '🧳 Persiapan Dokumen', body: 'Paspor minimal 6 bulan sebelum kadaluarsa\nFoto 4x6 background putih\nAsuransi perjalanan', emoji: '📋', tag: 'Packing' },
                { type: 'highlight', heading: '💵 Soal Budget', body: 'Siapkan uang saku harian sesuai destinasi\nRekening multi-currency lebih aman\nKartu kredit selalu standby', emoji: '💳', tag: 'Budget' },
                { type: 'cta', heading: 'Pergi Lebih Mudah Bersama Kami', body: `${brand.name} siap bantu dari dokumen hingga akomodasi!`, emoji: '🤝', tag: 'Hubungi Kami' },
            ],
        },
    };

    return series;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { agentSlug, itineraryId, seriesId } = await params;
    return {
        title: `Travel Blog | ${agentSlug}`,
        description: `Micro-blog perjalanan — ${seriesId}`,
    };
}

export const dynamic = 'force-dynamic';

export default async function MicroblogPublicPage({ params }: PageProps) {
    const { agentSlug, itineraryId, seriesId } = await params;

    // Find the itinerary (any status for now, published in production)
    // We use getItineraryById since this is agent-specific content
    const { getItineraryById } = await import('@/lib/supabase/queries');
    const data = await getItineraryById(itineraryId);

    if (!data) notFound();

    const allSeries = generateSeries(data);
    const currentSeries = allSeries[seriesId];
    if (!currentSeries) notFound();

    const primaryColor = data.brand.primaryColor || '#B8860B';
    const agentBlogBase = `/${agentSlug}/blog`;

    return (
        <div style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            background: '#0a0a0f',
            minHeight: '100vh',
            color: '#fff',
        }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #0a0a0f; }

                .blog-nav {
                    position: sticky; top: 0; z-index: 100;
                    background: rgba(10,10,15,0.9);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    padding: 14px 24px;
                    display: flex; align-items: center; justify-content: space-between;
                }

                .blog-hero {
                    max-width: 680px; margin: 0 auto;
                    padding: 60px 24px 40px;
                    text-align: center;
                }

                .blog-tag { display: inline-block; padding: 5px 16px; border-radius: 100px; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px; }
                .blog-heading { font-size: clamp(28px, 5vw, 48px); font-weight: 900; line-height: 1.1; margin-bottom: 14px; }
                .blog-subheading { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.6; max-width: 480px; margin: 0 auto; }

                .slides-section { max-width: 480px; margin: 0 auto; padding: 0 24px 80px; display: flex; flex-direction: column; gap: 0; }

                .slide-card {
                    position: relative; overflow: hidden;
                    border-radius: 24px; margin-bottom: 24px;
                    aspect-ratio: 4/5;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                }

                .slide-brand-bar {
                    position: absolute; bottom: 0; left: 0; right: 0;
                    background: linear-gradient(90deg, rgba(0,0,0,0.82), rgba(0,0,0,0.68));
                    backdrop-filter: blur(8px);
                    padding: 10px 18px;
                    display: flex; align-items: center; gap: 10px;
                }
                .slide-brand-name { font-size: 12px; font-weight: 800; color: #fff; line-height: 1.2; }
                .slide-brand-contact { font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 1px; }

                .slide-card img.bg {
                    position: absolute; inset: 0;
                    width: 100%; height: 100%; object-fit: cover;
                }

                .slide-overlay {
                    position: absolute; inset: 0;
                }

                .slide-content {
                    position: absolute; inset: 0;
                    padding: 28px;
                    display: flex; flex-direction: column; justify-content: flex-end;
                }

                .slide-tag-pill {
                    position: absolute; top: 24px; left: 24px;
                    padding: 5px 14px; border-radius: 100px;
                    font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
                }

                .slide-heading { font-size: clamp(22px, 5vw, 30px); font-weight: 800; line-height: 1.2; margin-bottom: 10px; }
                .slide-body { font-size: 14px; line-height: 1.7; white-space: pre-line; }

                .series-nav {
                    max-width: 680px; margin: 0 auto; padding: 0 24px 60px;
                    display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
                }

                .series-card {
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px; padding: 18px; text-decoration: none; color: inherit;
                    transition: all 0.2s;
                    display: flex; flex-direction: column; gap: 8px;
                }
                .series-card:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
                .series-card.active { border-color: var(--primary); background: rgba(var(--primary-rgb), 0.1); }

                .brand-footer {
                    max-width: 680px; margin: 0 auto; padding: 0 24px 60px;
                    text-align: center;
                }

                @media (max-width: 480px) {
                    .slides-section { padding: 0 16px 60px; }
                    .series-nav { grid-template-columns: 1fr; }
                }
            ` }} />

            {/* Nav */}
            <nav className="blog-nav">
                <Link href={`/${agentSlug}`} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    textDecoration: 'none', color: '#fff',
                }}>
                    {data.brand.logoUrl && (
                        <img src={data.brand.logoUrl} alt={data.brand.name}
                            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', background: 'rgba(255,255,255,0.1)', padding: 4 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{data.brand.name}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>Travel Blog</div>
                    </div>
                </Link>
                <Link href={`/${agentSlug}/${data.id}`}
                    style={{ fontSize: 12, fontWeight: 600, color: primaryColor, textDecoration: 'none', background: `${primaryColor}20`, padding: '7px 16px', borderRadius: 100, border: `1px solid ${primaryColor}40` }}>
                    Lihat Itinerary Lengkap →
                </Link>
            </nav>

            {/* Hero */}
            <div className="blog-hero">
                <div className="blog-tag" style={{ background: `${primaryColor}22`, color: primaryColor }}>
                    {currentSeries.icon} {currentSeries.title}
                </div>
                <h1 className="blog-heading">
                    {data.meta.title}
                </h1>
                <p className="blog-subheading">
                    {currentSeries.angle} • {data.meta.durationDays} Hari {data.meta.durationNights} Malam
                </p>
            </div>

            {/* Slide Cards */}
            <div className="slides-section">
                {currentSeries.slides.map((slide, i) => {
                    const hasImage = !!slide.image && (slide.type === 'cover' || slide.type === 'day');
                    const isCTA = slide.type === 'cta';

                    return (
                        <div key={i} className="slide-card" style={{
                            background: !hasImage
                                ? isCTA
                                    ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`
                                    : slide.type === 'inclusion' ? 'linear-gradient(135deg, #0f172a, #1e293b)'
                                        : `linear-gradient(145deg, #111827, ${primaryColor}18)`
                                : '#111',
                        }}>
                            {hasImage && (
                                <>
                                    <img className="bg" src={slide.image} alt={slide.heading}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <div className="slide-overlay" style={{
                                        background: isCTA
                                            ? 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4) 60%, transparent)'
                                            : 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2) 55%, transparent)',
                                    }} />
                                </>
                            )}

                            {/* Tag pill */}
                            {slide.tag && (
                                <div className="slide-tag-pill" style={{ background: isCTA ? 'rgba(255,255,255,0.2)' : primaryColor, color: '#fff' }}>
                                    {slide.emoji} {slide.tag}
                                </div>
                            )}

                            {/* Logo top-right (only if no brand bar below) */}
                            {data.brand.logoUrl && (
                                <div style={{ position: 'absolute', top: 20, right: 20, width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.11)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <img src={data.brand.logoUrl} alt="" style={{ width: '78%', height: '78%', objectFit: 'contain' }}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            )}

                            {/* Main content — leave space for brand bar */}
                            <div style={{ position: 'absolute', inset: 0, paddingBottom: 58, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '48px 24px 68px' }}>
                                {!hasImage && slide.emoji && (
                                    <div style={{ fontSize: 40, marginBottom: 14, lineHeight: 1 }}>{slide.emoji}</div>
                                )}
                                <h2 className="slide-heading">{slide.heading}</h2>
                                <p className="slide-body" style={{ color: isCTA ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)' }}>
                                    {slide.body}
                                </p>
                                {isCTA && (
                                    <a href={`https://wa.me/${(data.brand.contact?.whatsapp || (data.brand as any).whatsapp || '').replace(/\D/g, '')}`}
                                        style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700, width: 'fit-content' }}>
                                        💬 Hubungi via WhatsApp
                                    </a>
                                )}
                            </div>

                            {/* Brand Footer Bar — every slide */}
                            <div className="slide-brand-bar" style={{ borderTop: `1px solid ${primaryColor}35` }}>
                                {data.brand.logoUrl && (
                                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={data.brand.logoUrl} alt="" style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="slide-brand-name">{data.brand.name}</div>
                                    <div className="slide-brand-contact">
                                        {(data.brand.contact?.whatsapp || (data.brand as any).whatsapp) && `📱 ${data.brand.contact?.whatsapp || (data.brand as any).whatsapp}`}
                                        {(data.brand.contact?.instagram || (data.brand as any).instagram) && `  📸 ${data.brand.contact?.instagram || (data.brand as any).instagram}`}
                                    </div>
                                </div>
                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                                    {i + 1}/{currentSeries.slides.length}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Other Series Navigation */}
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
                    Baca Juga
                </div>
            </div>
            <div className="series-nav">
                {Object.entries(allSeries)
                    .filter(([id]) => id !== seriesId)
                    .map(([id, s]) => (
                        <Link key={id} href={`/${agentSlug}/blog/${itineraryId}/${id}`} className="series-card">
                            <div style={{ fontSize: 24 }}>{s.icon}</div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{s.title}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{s.angle}</div>
                        </Link>
                    ))}
            </div>

            {/* Brand Profile Footer */}
            <div className="brand-footer">
                <div style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20, padding: '28px 24px',
                }}>
                    {/* Logo + Name row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, justifyContent: 'center' }}>
                        {data.brand.logoUrl && (
                            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${primaryColor}30` }}>
                                <img src={data.brand.logoUrl} alt={data.brand.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{data.brand.name}</div>
                            {data.brand.tagline && (
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontStyle: 'italic' }}>{data.brand.tagline}</div>
                            )}
                        </div>
                    </div>

                    {/* Contact info */}
                    {(data.brand.contact?.whatsapp || (data.brand as any).whatsapp || data.brand.contact?.instagram || (data.brand as any).instagram) && (
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                            {(data.brand.contact?.whatsapp || (data.brand as any).whatsapp) && (
                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    📱 {data.brand.contact?.whatsapp || (data.brand as any).whatsapp}
                                </span>
                            )}
                            {(data.brand.contact?.instagram || (data.brand as any).instagram) && (
                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    📸 {data.brand.contact?.instagram || (data.brand as any).instagram}
                                </span>
                            )}
                        </div>
                    )}

                    <Link href={`/${agentSlug}/${data.id}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: primaryColor, color: '#000', textDecoration: 'none',
                        padding: '12px 28px', borderRadius: 100, fontSize: 13, fontWeight: 800,
                    }}>
                        🌐 Lihat Itinerary Lengkap
                    </Link>
                </div>
            </div>
        </div>
    );
}
