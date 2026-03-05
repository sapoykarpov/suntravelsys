'use client';

import { useState, useRef, useEffect } from 'react';
import type { ItineraryPayload } from '@/types/itinerary';
import { searchUnsplashPhotosClient } from '@/lib/utils/unsplash';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { updateItineraryContent } from '../actions';

// ─── Font Pairs ────────────────────────────────────────────────────────────────

export const FONT_PAIRS = [
    { id: 'system', label: 'System Default', heading: 'system-ui, sans-serif', body: 'system-ui, sans-serif', googleUrl: '' },
    { id: 'playfair', label: 'Playfair + Lato', heading: "'Playfair Display', serif", body: "'Lato', sans-serif", googleUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Lato:wght@400;600&display=swap' },
    { id: 'montserrat', label: 'Montserrat', heading: "'Montserrat', sans-serif", body: "'Montserrat', sans-serif", googleUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap' },
    { id: 'cormorant', label: 'Cormorant + Inter', heading: "'Cormorant Garamond', serif", body: "'Inter', sans-serif", googleUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800&family=Inter:wght@400;500;600&display=swap' },
    { id: 'oswald', label: 'Oswald + OpenSans', heading: "'Oswald', sans-serif", body: "'Open Sans', sans-serif", googleUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Open+Sans:wght@400;600&display=swap' },
    { id: 'raleway', label: 'Raleway + Nunito', heading: "'Raleway', sans-serif", body: "'Nunito', sans-serif", googleUrl: 'https://fonts.googleapis.com/css2?family=Raleway:wght@700;800;900&family=Nunito:wght@400;600&display=swap' },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SlideRatio = '4:5' | '9:16';

export interface SlideTextSettings {
    headingSize: number;
    bodySize: number;
    textPosition: 'top' | 'center' | 'bottom';
    headingColor: string;
    bodyColor: string;
    showBrandBar: boolean;
    footerStyle: 'solid' | 'transparent';
    footerColor: string;
    overlayOpacity: number;
    overlayColor: string;
    fontPairId: string;
}

function makeDefaultSettings(brand: ItineraryPayload['brand']): SlideTextSettings {
    return {
        headingSize: 24,
        bodySize: 13,
        textPosition: 'bottom',
        headingColor: '#ffffff',
        bodyColor: 'rgba(255,255,255,0.78)',
        showBrandBar: true,
        footerStyle: 'solid',
        footerColor: brand.primaryColor || '#B8860B',
        overlayOpacity: 70,
        overlayColor: '#000000',
        fontPairId: 'system',
    };
}

export interface MicroblogSlide {
    id: string;
    type: 'cover' | 'highlight' | 'day' | 'inclusion' | 'cta';
    heading: string;
    body: string;
    image?: string;
    tag?: string;
    emoji?: string;
    imageCredit?: string;
    autoSearchQuery?: string;
}

// ─── Slide Dims ────────────────────────────────────────────────────────────────

const SLIDE_DIMS = {
    '4:5': { w: 400, h: 500 },
    '9:16': { w: 338, h: 600 },
};

// ─── Series Generator ──────────────────────────────────────────────────────────

function generateSeries(data: ItineraryPayload) {
    const { meta, days, highlights, inclusions, brand } = data;
    const dest0 = days[0]?.location?.split(',')[0] || 'destinasi';

    return [
        {
            id: 'highlight', title: 'Highlight Destinasi', angle: 'Showcase tempat-tempat terbaik', icon: '🏅',
            slides: [
                { id: 'h-cover', type: 'cover' as const, heading: `${meta.durationDays} Highlights Tak Terlupakan`, body: meta.subtitle || `Paket ${meta.title}`, image: days[0]?.heroImage, tag: `${meta.durationDays}H${meta.durationNights}M`, emoji: '✨', autoSearchQuery: dest0 },
                ...days.slice(0, 3).map((day, i) => ({ id: `h-day-${i}`, type: 'day' as const, heading: day.title, body: day.summary, image: day.heroImage, tag: `Day ${day.dayNumber}`, emoji: '📍', autoSearchQuery: day.location.split(',')[0] })),
                { id: 'h-cta', type: 'cta' as const, heading: 'Tertarik?', body: `Dapatkan paket ${meta.title} mulai ${meta.price}. Terbatas!`, emoji: '🎯', tag: 'Book Now' },
            ],
        },
        {
            id: 'journey', title: 'Day-by-Day Journey', angle: 'Ceritakan perjalanan hari per hari', icon: '🗺️',
            slides: [
                { id: 'j-cover', type: 'cover' as const, heading: `${meta.durationDays} Hari di ${dest0}`, body: `Bersama ${brand.name} ✈️`, image: meta.coverImage || days[0]?.heroImage, tag: 'Itinerary', emoji: '🗓️', autoSearchQuery: dest0 },
                ...days.slice(0, 4).map(day => ({
                    id: `j-day-${day.dayNumber}`, type: 'day' as const, heading: `Day ${day.dayNumber}: ${day.title}`,
                    body: day.activities.slice(0, 2).map(a => `• ${a.title}`).join('\n') + (day.activities.length > 2 ? `\n• +${day.activities.length - 2} lainnya` : ''),
                    image: day.heroImage, tag: day.location.split(',')[0], emoji: '📅', autoSearchQuery: day.location.split(',')[0],
                })),
            ],
        },
        {
            id: 'value', title: 'Value & Harga', angle: 'Logika harga — kenapa worth it?', icon: '💰',
            slides: [
                { id: 'v-cover', type: 'cover' as const, heading: `${meta.durationDays} Hari Cuma ${meta.price}`, body: 'Kita breakdown sekarang! 👇', image: days[Math.floor(days.length / 2)]?.heroImage, tag: 'Worth It?', emoji: '🤔', autoSearchQuery: dest0 },
                { id: 'v-inc', type: 'inclusion' as const, heading: 'Semua Sudah Termasuk!', body: inclusions.slice(0, 6).join('\n'), emoji: '✅', tag: 'Inclusions' },
                { id: 'v-hi', type: 'highlight' as const, heading: 'Yang Bikin Beda', body: highlights.slice(0, 4).map(h => `${h.icon || '•'} ${h.label}: ${h.value}`).join('\n'), emoji: '⭐', tag: 'Keunggulan' },
                { id: 'v-cta', type: 'cta' as const, heading: `Mulai dari ${meta.price}`, body: `${meta.priceNote || 'Per orang, all-inclusive'}. Hubungi kami!`, emoji: '💌', tag: 'Contact Us' },
            ],
        },
        {
            id: 'tips', title: 'Tips & Edukasi', angle: 'Edukasi audiens sebelum berangkat', icon: '💡',
            slides: [
                { id: 't-cover', type: 'cover' as const, heading: `5 Hal Wajib Tahu Sebelum ke ${dest0}`, body: `Tips dari ${brand.name} 🧳`, image: days[1]?.heroImage, tag: 'Tips', emoji: '📌', autoSearchQuery: dest0 + ' travel tips' },
                { id: 't-1', type: 'highlight' as const, heading: '🧳 Persiapan Dokumen', body: 'Paspor min. 6 bulan sebelum kadaluarsa\nFoto 4x6 background putih\nAsuransi perjalanan', emoji: '📋', tag: 'Packing' },
                { id: 't-2', type: 'highlight' as const, heading: '💵 Soal Budget', body: 'Siapkan uang saku harian sesuai destinasi\nRekening multi-currency lebih aman\nKartu kredit sebagai backup', emoji: '💳', tag: 'Budget' },
                { id: 't-cta', type: 'cta' as const, heading: 'Pergi Lebih Mudah Bersama Kami', body: `${brand.name} bantu dari dokumen hingga akomodasi!`, emoji: '🤝', tag: 'Hubungi Kami' },
            ],
        },
    ];
}

// ─── Brand Footer Bar ──────────────────────────────────────────────────────────

interface BrandFooterBarProps {
    brand: ItineraryPayload['brand'];
    scale: number;
    primaryColor: string;
    footerStyle: 'solid' | 'transparent';
    footerColor: string;
}

function BrandFooterBar({ brand, scale, primaryColor, footerStyle, footerColor }: BrandFooterBarProps) {
    const phone = brand.contact?.whatsapp || brand.whatsapp || brand.contact?.phone || brand.phone;
    const ig = brand.contact?.instagram || brand.instagram;
    const isSolid = footerStyle === 'solid';

    return (
        <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: isSolid ? footerColor : 'rgba(0,0,0,0.35)',
            backdropFilter: isSolid ? 'none' : 'blur(12px)',
            borderTop: isSolid ? `2px solid rgba(255,255,255,0.1)` : `1px solid rgba(255,255,255,0.12)`,
            padding: `${10 * scale}px ${16 * scale}px`,
            display: 'flex', alignItems: 'center', gap: 10 * scale,
        }}>
            {brand.logoUrl && (
                <div style={{ width: 28 * scale, height: 28 * scale, borderRadius: 7 * scale, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={brand.logoUrl} alt={brand.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10 * scale, fontWeight: 800, color: '#fff', letterSpacing: '0.03em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {brand.name}
                </div>
                {(phone || ig) && (
                    <div style={{ fontSize: 8 * scale, color: primaryColor, marginTop: 1 * scale, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {phone ? `📱 ${phone}` : ''}{phone && ig ? '  ' : ''}{ig ? `📸 ${ig}` : ''}
                    </div>
                )}
            </div>
            {brand.tagline && (
                <div style={{ fontSize: 7 * scale, color: 'rgba(255,255,255,0.5)', textAlign: 'right', lineHeight: 1.3, maxWidth: 80 * scale, flexShrink: 0 }}>
                    {brand.tagline}
                </div>
            )}
        </div>
    );
}

// ─── Slide Preview ─────────────────────────────────────────────────────────────

interface SlidePreviewProps {
    slide: MicroblogSlide;
    brand: ItineraryPayload['brand'];
    ratio: SlideRatio;
    textSettings: SlideTextSettings;
    scale?: number;
}

function SlidePreview({ slide, brand, ratio, textSettings, scale = 1 }: SlidePreviewProps) {
    const { w, h } = SLIDE_DIMS[ratio];
    const primaryColor = brand.primaryColor || '#B8860B';
    const isCover = slide.type === 'cover';
    const isCTA = slide.type === 'cta';
    const hasImage = !!slide.image && (isCover || slide.type === 'day');
    const fontPair = FONT_PAIRS.find(f => f.id === textSettings.fontPairId) || FONT_PAIRS[0];

    // overlay with custom color + opacity
    const overlayAlpha = Math.round(textSettings.overlayOpacity * 2.55).toString(16).padStart(2, '0');
    const overlayFull = `${textSettings.overlayColor}${overlayAlpha}`;
    const overlayLight = `${textSettings.overlayColor}${Math.round(textSettings.overlayOpacity * 0.4 * 2.55).toString(16).padStart(2, '0')}`;

    const justifyMap: Record<string, string> = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
    const contentJustify = hasImage || isCTA ? 'flex-end' : justifyMap[textSettings.textPosition];
    const brandBarH = textSettings.showBrandBar ? 50 * scale : 0;

    return (
        <>
            {fontPair.googleUrl && <link rel="stylesheet" href={fontPair.googleUrl} />}
            <div style={{
                width: w * scale, height: h * scale,
                borderRadius: scale >= 0.9 ? 20 * scale : 10 * scale,
                overflow: 'hidden', position: 'relative', flexShrink: 0,
                fontFamily: fontPair.body,
                boxShadow: scale >= 0.9 ? '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)' : '0 3px 10px rgba(0,0,0,0.15)',
            }}>
                {hasImage ? (
                    <>
                        <img src={slide.image} alt={slide.heading}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: `linear-gradient(to top, ${overlayFull} 0%, ${overlayLight} 55%, transparent 100%)`,
                        }} />
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '100%', height: '100%',
                            background: isCTA
                                ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}bb 100%)`
                                : slide.type === 'inclusion' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                                    : `linear-gradient(145deg, #111827 0%, #1f2937 50%, ${primaryColor}18 100%)`,
                        }} />
                        <div style={{
                            position: 'absolute', top: 0, right: 0,
                            width: w * scale * 0.65, height: h * scale * 0.45,
                            background: `radial-gradient(circle at top right, ${primaryColor}30, transparent 70%)`,
                            pointerEvents: 'none',
                        }} />
                    </>
                )}

                {/* Tag pill */}
                {slide.tag && (
                    <div style={{
                        position: 'absolute', top: 18 * scale, left: 18 * scale,
                        background: isCTA ? 'rgba(255,255,255,0.22)' : primaryColor,
                        color: '#fff', fontSize: 9 * scale, fontWeight: 800, letterSpacing: '0.1em',
                        padding: `${4 * scale}px ${11 * scale}px`, borderRadius: 100, textTransform: 'uppercase',
                        backdropFilter: 'blur(8px)',
                    }}>
                        {slide.emoji} {slide.tag}
                    </div>
                )}

                {/* Logo badge (top right, only if no solid footer bar) */}
                {brand.logoUrl && (
                    <div style={{
                        position: 'absolute', top: 14 * scale, right: 14 * scale,
                        width: 32 * scale, height: 32 * scale, borderRadius: 9 * scale,
                        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)',
                    }}>
                        <img src={brand.logoUrl} alt="" style={{ width: '78%', height: '78%', objectFit: 'contain' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                )}

                {/* Content */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: contentJustify as any,
                    padding: `${48 * scale}px ${22 * scale}px ${(textSettings.showBrandBar ? brandBarH + 12 * scale : 22 * scale)}px`,
                }}>
                    {!hasImage && !isCTA && (
                        <div style={{ fontSize: 32 * scale, marginBottom: 10 * scale, lineHeight: 1 }}>{slide.emoji}</div>
                    )}
                    <div style={{
                        color: textSettings.headingColor,
                        fontFamily: fontPair.heading,
                        fontSize: (isCover ? textSettings.headingSize + 3 : isCTA ? textSettings.headingSize + 5 : textSettings.headingSize) * scale,
                        fontWeight: 800, lineHeight: 1.2, marginBottom: 8 * scale,
                        textShadow: hasImage ? '0 1px 6px rgba(0,0,0,0.55)' : 'none',
                    }}>
                        {slide.heading}
                    </div>
                    <div style={{
                        color: textSettings.bodyColor, fontSize: textSettings.bodySize * scale,
                        lineHeight: 1.65, whiteSpace: 'pre-line',
                        textShadow: hasImage ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                    }}>
                        {slide.body}
                    </div>
                    {ratio === '9:16' && isCTA && (
                        <div style={{
                            marginTop: 16 * scale, display: 'inline-flex', alignItems: 'center', gap: 6 * scale,
                            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                            padding: `${7 * scale}px ${14 * scale}px`, borderRadius: 100,
                            fontSize: 10 * scale, fontWeight: 700, color: '#fff', width: 'fit-content',
                        }}>
                            Swipe Up ↑
                        </div>
                    )}
                </div>

                {textSettings.showBrandBar && (
                    <BrandFooterBar brand={brand} scale={scale} primaryColor={primaryColor}
                        footerStyle={textSettings.footerStyle} footerColor={textSettings.footerColor} />
                )}
            </div>
        </>
    );
}

// ─── QC Sidebar ───────────────────────────────────────────────────────────────

type SidebarTab = 'content' | 'style' | 'image' | 'publish';

interface QCSidebarProps {
    slide: MicroblogSlide;
    brand: ItineraryPayload['brand'];
    seriesId: string;
    itineraryId: string;
    ratio: SlideRatio;
    textSettings: SlideTextSettings;
    onUpdate: (s: MicroblogSlide) => void;
    onTextSettingsUpdate: (s: SlideTextSettings) => void;
}

function QCSidebar({ slide, brand, seriesId, itineraryId, ratio, textSettings, onUpdate, onTextSettingsUpdate }: QCSidebarProps) {
    const [tab, setTab] = useState<SidebarTab>('content');
    const [searching, setSearching] = useState(false);
    const [photoResults, setPhotoResults] = useState<{ url: string; thumb: string; alt: string; credit: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const [apiStatus, setApiStatus] = useState<'ok' | 'missing_key'>('ok');

    const agentSlug = brand.name.toLowerCase().replace(/\s+/g, '-');
    const publicUrl = `/${agentSlug}/blog/${itineraryId}/${seriesId}`;

    // Auto-search Unsplash based on slide destination when switching to image tab
    useEffect(() => {
        if (tab === 'image' && slide.autoSearchQuery && photoResults.length === 0) {
            const q = slide.autoSearchQuery;
            setSearchQuery(q);
            setSearching(true);
            searchUnsplashPhotosClient(q, 8)
                .then(r => {
                    setPhotoResults(r.photos);
                    if (r.error === 'MISSING_API_KEY') setApiStatus('missing_key');
                })
                .catch(() => { })
                .finally(() => setSearching(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, slide.id]);

    const handleImageSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const r = await searchUnsplashPhotosClient(searchQuery, 8);
            setPhotoResults(r.photos);
            if (r.error === 'MISSING_API_KEY') setApiStatus('missing_key');
        } finally { setSearching(false); }
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(`${window.location.origin}${publicUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    const label: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: 7, display: 'block' };
    const inp: React.CSSProperties = { width: '100%', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, padding: '8px 11px', fontSize: 13, color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
    const card: React.CSSProperties = { background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: 14 };
    const defaultSettings = makeDefaultSettings(brand);

    const TABS = [
        { id: 'content' as SidebarTab, label: 'Teks', icon: '✏️' },
        { id: 'style' as SidebarTab, label: 'Gaya', icon: '🎨' },
        { id: 'image' as SidebarTab, label: 'Foto', icon: '🖼️' },
        { id: 'publish' as SidebarTab, label: 'Publish', icon: '🌐' },
    ];

    return (
        <aside style={{ width: 310, flexShrink: 0, background: '#F7F7F9', borderLeft: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px 0', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)' }}>QC Sidebar</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '3px 0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {slide.emoji} {slide.heading}
                </div>
                <div style={{ display: 'flex' }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            flex: 1, padding: '8px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                            border: 'none', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                            borderBottom: tab === t.id ? '2px solid #B8860B' : '2px solid transparent',
                            color: tab === t.id ? '#B8860B' : 'rgba(0,0,0,0.35)',
                        }}>
                            <span>{t.icon}</span>{t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* ── CONTENT ── */}
                {tab === 'content' && (
                    <>
                        <div style={card}>
                            <span style={label}>Heading</span>
                            <textarea value={slide.heading} rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
                                onChange={e => onUpdate({ ...slide, heading: e.target.value })} />
                        </div>
                        <div style={card}>
                            <span style={label}>Body Text</span>
                            <textarea value={slide.body} rows={5} style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }}
                                onChange={e => onUpdate({ ...slide, body: e.target.value })} />
                        </div>
                        <div style={card}>
                            <span style={label}>Tag & Emoji</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input value={slide.emoji || ''} style={{ ...inp, width: 50, textAlign: 'center', fontSize: 18, padding: '6px 4px' }}
                                    onChange={e => onUpdate({ ...slide, emoji: e.target.value })} />
                                <input value={slide.tag || ''} style={{ ...inp, flex: 1 }} placeholder="Tag label"
                                    onChange={e => onUpdate({ ...slide, tag: e.target.value })} />
                            </div>
                        </div>
                    </>
                )}

                {/* ── STYLE ── */}
                {tab === 'style' && (
                    <>
                        {/* Font Pairing */}
                        <div style={card}>
                            <span style={label}>🔤 Font Pairing</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {FONT_PAIRS.map(fp => (
                                    <button key={fp.id} onClick={() => onTextSettingsUpdate({ ...textSettings, fontPairId: fp.id })}
                                        style={{
                                            padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                            background: textSettings.fontPairId === fp.id ? 'rgba(184,134,11,0.1)' : '#F5F5F7',
                                            outline: textSettings.fontPairId === fp.id ? '1.5px solid #B8860B' : '1px solid rgba(0,0,0,0.06)',
                                            textAlign: 'left', transition: 'all 0.15s',
                                            color: textSettings.fontPairId === fp.id ? '#B8860B' : '#555',
                                            fontSize: 12, fontWeight: 600,
                                        }}>
                                        {fp.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Heading Size */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={label}>Ukuran Heading</span>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{textSettings.headingSize}px</span>
                            </div>
                            <input type="range" min={14} max={40} step={1} value={textSettings.headingSize}
                                onChange={e => onTextSettingsUpdate({ ...textSettings, headingSize: +e.target.value })}
                                style={{ width: '100%', accentColor: '#B8860B' }} />
                        </div>

                        {/* Body Size */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={label}>Ukuran Body</span>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{textSettings.bodySize}px</span>
                            </div>
                            <input type="range" min={9} max={18} step={1} value={textSettings.bodySize}
                                onChange={e => onTextSettingsUpdate({ ...textSettings, bodySize: +e.target.value })}
                                style={{ width: '100%', accentColor: '#B8860B' }} />
                        </div>

                        {/* Text Position */}
                        <div style={card}>
                            <span style={label}>Posisi Teks (Non-Image)</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {(['top', 'center', 'bottom'] as const).map(pos => (
                                    <button key={pos} onClick={() => onTextSettingsUpdate({ ...textSettings, textPosition: pos })}
                                        style={{
                                            flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                                            fontWeight: 600, textTransform: 'capitalize', border: 'none',
                                            background: textSettings.textPosition === pos ? 'rgba(184,134,11,0.1)' : '#F5F5F7',
                                            color: textSettings.textPosition === pos ? '#B8860B' : 'rgba(0,0,0,0.5)',
                                            outline: textSettings.textPosition === pos ? '1px solid #B8860B' : 'none',
                                        }}>
                                        {pos === 'top' ? '⬆' : pos === 'center' ? '⬛' : '⬇'} {pos}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Heading Color */}
                        <div style={card}>
                            <span style={label}>Warna Heading</span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="color" value={textSettings.headingColor.startsWith('#') ? textSettings.headingColor : '#ffffff'}
                                    onChange={e => onTextSettingsUpdate({ ...textSettings, headingColor: e.target.value })}
                                    style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', padding: 2 }} />
                                <input type="text" value={textSettings.headingColor} style={{ ...inp, flex: 1, fontSize: 11, fontFamily: 'monospace', padding: '7px 10px' }}
                                    onChange={e => onTextSettingsUpdate({ ...textSettings, headingColor: e.target.value })} />
                            </div>
                        </div>

                        {/* Overlay Color + Opacity */}
                        <div style={card}>
                            <span style={label}>🌑 Overlay Gambar</span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                                <input type="color" value={textSettings.overlayColor}
                                    onChange={e => onTextSettingsUpdate({ ...textSettings, overlayColor: e.target.value })}
                                    style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', padding: 2 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>Opacity</span>
                                        <span style={{ fontSize: 12, fontWeight: 700 }}>{textSettings.overlayOpacity}%</span>
                                    </div>
                                    <input type="range" min={10} max={95} step={5} value={textSettings.overlayOpacity}
                                        onChange={e => onTextSettingsUpdate({ ...textSettings, overlayOpacity: +e.target.value })}
                                        style={{ width: '100%', accentColor: '#B8860B' }} />
                                </div>
                            </div>
                        </div>

                        {/* Brand Footer */}
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: textSettings.showBrandBar ? 14 : 0 }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700 }}>Footer Brand Agent</div>
                                    <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 2 }}>Logo, nama & kontak di slide</div>
                                </div>
                                <button onClick={() => onTextSettingsUpdate({ ...textSettings, showBrandBar: !textSettings.showBrandBar })}
                                    style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0, background: textSettings.showBrandBar ? '#B8860B' : 'rgba(0,0,0,0.15)' }}>
                                    <div style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all 0.2s', left: textSettings.showBrandBar ? 22 : 2, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                                </button>
                            </div>

                            {textSettings.showBrandBar && (
                                <>
                                    {/* Footer Style Toggle */}
                                    <div style={{ marginBottom: 10 }}>
                                        <span style={{ ...label, marginBottom: 6 }}>Gaya Footer</span>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {(['solid', 'transparent'] as const).map(s => (
                                                <button key={s} onClick={() => onTextSettingsUpdate({ ...textSettings, footerStyle: s })}
                                                    style={{
                                                        flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                                                        fontWeight: 600, border: 'none', textTransform: 'capitalize',
                                                        background: textSettings.footerStyle === s ? 'rgba(184,134,11,0.1)' : '#F5F5F7',
                                                        color: textSettings.footerStyle === s ? '#B8860B' : 'rgba(0,0,0,0.5)',
                                                        outline: textSettings.footerStyle === s ? '1px solid #B8860B' : 'none',
                                                    }}>
                                                    {s === 'solid' ? '█ Blok Warna' : '◌ Transparan'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer Color Picker (only for solid) */}
                                    {textSettings.footerStyle === 'solid' && (
                                        <div>
                                            <span style={{ ...label, marginBottom: 6 }}>Warna Footer</span>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <input type="color" value={textSettings.footerColor}
                                                    onChange={e => onTextSettingsUpdate({ ...textSettings, footerColor: e.target.value })}
                                                    style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', padding: 2 }} />
                                                <input type="text" value={textSettings.footerColor} style={{ ...inp, flex: 1, fontSize: 11, fontFamily: 'monospace', padding: '7px 10px' }}
                                                    onChange={e => onTextSettingsUpdate({ ...textSettings, footerColor: e.target.value })} />
                                                <button onClick={() => onTextSettingsUpdate({ ...textSettings, footerColor: brand.primaryColor || '#B8860B' })}
                                                    title="Reset ke warna brand"
                                                    style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: brand.primaryColor || '#B8860B', cursor: 'pointer', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                                                    Brand
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <button onClick={() => onTextSettingsUpdate(defaultSettings)}
                            style={{ padding: '9px 0', borderRadius: 10, background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                            ↺ Reset ke Default
                        </button>
                    </>
                )}

                {/* ── IMAGE ── */}
                {tab === 'image' && (
                    <>
                        {slide.image && (
                            <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: ratio === '9:16' ? '9/16' : '4/5', background: '#F0F0F2' }}>
                                <img src={slide.image} alt="current" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                        )}
                        <div style={card}>
                            <span style={label}>URL Gambar</span>
                            <input type="text" value={slide.image || ''} placeholder="Paste URL gambar..."
                                style={{ ...inp, fontSize: 11 }}
                                onChange={e => onUpdate({ ...slide, image: e.target.value })} />
                        </div>
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={label}>🔍 Cari di Unsplash</span>
                                {searching && <span style={{ fontSize: 10, color: '#B8860B' }}>Searching...</span>}
                            </div>

                            {apiStatus === 'missing_key' && (
                                <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(59,130,246,0.06)', border: '1px dashed rgba(59,130,246,0.3)', borderRadius: 10, color: '#3B82F6', fontSize: 10, lineHeight: 1.5 }}>
                                    <strong>ℹ️ Demo Mode:</strong> Unsplash API Key belum diset di .env.local. Gambar yang muncul saat ini adalah random.
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                                <input type="text" value={searchQuery} placeholder="e.g. Seoul Korea night"
                                    style={{ ...inp, flex: 1, fontSize: 12 }}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleImageSearch()} />
                                <button onClick={handleImageSearch} disabled={searching}
                                    style={{ padding: '0 12px', borderRadius: 10, background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>
                                    {searching ? '⏳' : '→'}
                                </button>
                            </div>

                            {photoResults.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                    {photoResults.map((p, i) => (
                                        <button key={i} onClick={() => onUpdate({ ...slide, image: p.url, imageCredit: p.credit })} title={p.credit}
                                            style={{ padding: 0, border: slide.image === p.url ? '2.5px solid #B8860B' : '2.5px solid transparent', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', aspectRatio: ratio === '9:16' ? '9/16' : '4/5', background: '#F0F0F2' }}>
                                            <img src={p.thumb} alt={p.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        </button>
                                    ))}
                                </div>
                            ) : !searching ? (
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', textAlign: 'center', padding: '8px 0' }}>
                                    Otomatis search saat buka tab · atau ketik manual di atas
                                </div>
                            ) : null}

                            {slide.imageCredit && (
                                <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', marginTop: 8, fontStyle: 'italic' }}>{slide.imageCredit}</div>
                            )}
                        </div>
                    </>
                )}

                {/* ── PUBLISH ── */}
                {tab === 'publish' && (
                    <>
                        <div style={card}>
                            <span style={label}>🌐 Public Blog Link</span>
                            <div style={{ background: 'rgba(184,134,11,0.06)', border: '1px dashed rgba(184,134,11,0.3)', borderRadius: 8, padding: '9px 11px', fontSize: 11, color: '#B8860B', wordBreak: 'break-all', marginBottom: 10, fontFamily: 'monospace' }}>
                                {publicUrl}
                            </div>
                            <button onClick={handleCopyLink} style={{ width: '100%', padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 700, background: copied ? '#10B981' : 'linear-gradient(135deg, #B8860B, #D4AF37)', color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                                {copied ? '✓ Link Tersalin!' : '🔗 Copy Link Blog'}
                            </button>
                        </div>
                        <div style={{ ...card, background: 'rgba(184,134,11,0.04)', border: '1px dashed rgba(184,134,11,0.25)' }}>
                            <span style={label}>💡 Cara Pakai</span>
                            <ul style={{ fontSize: 12, color: 'rgba(0,0,0,0.55)', lineHeight: 1.75, paddingLeft: 16, margin: 0 }}>
                                <li>Copy link lalu kirim ke agen via WA/email</li>
                                <li>Agen share link ke calon pembeli di story IG</li>
                                <li>Setiap seri = 1 link terpisah (4 seri per itinerary)</li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface MicroblogKitProps { data: ItineraryPayload; }

export default function MicroblogKit({ data }: MicroblogKitProps) {
    const allSeries = generateSeries(data);
    const [activeSeries, setActiveSeries] = useState(data.assets_config?.microblog?.activeSeries || allSeries[0].id);
    const [activeSlide, setActiveSlide] = useState(data.assets_config?.microblog?.activeSlide || 0);
    const [ratio, setRatio] = useState<SlideRatio>(data.assets_config?.microblog?.ratio || '4:5');
    const [downloading, setDownloading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [textSettings, setTextSettings] = useState<SlideTextSettings>(() => data.assets_config?.microblog?.textSettings || makeDefaultSettings(data.brand));
    const [seriesSlides, setSeriesSlides] = useState<Record<string, MicroblogSlide[]>>(
        () => data.assets_config?.microblog?.seriesSlides || Object.fromEntries(allSeries.map(s => [s.id, s.slides]))
    );
    const largePreviewRef = useRef<HTMLDivElement>(null);

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus('idle');
        try {
            const result = await updateItineraryContent(data.id, {
                assets_config: {
                    ...data.assets_config,
                    microblog: {
                        activeSeries,
                        activeSlide,
                        ratio,
                        textSettings,
                        seriesSlides
                    }
                }
            });
            if (result.success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const currentSeries = allSeries.find(s => s.id === activeSeries)!;
    const currentSlides = seriesSlides[activeSeries] || currentSeries.slides;
    const currentSlide = currentSlides[activeSlide];

    const { w: SW, h: SH } = SLIDE_DIMS[ratio];
    const LARGE_SCALE = Math.min(520 / SH, 440 / SW, 1);
    const THUMB_H = ratio === '9:16' ? 110 : 90;
    const THUMB_SCALE = THUMB_H / SH;

    const handleSeriesChange = (id: string) => { setActiveSeries(id); setActiveSlide(0); };
    const handleSlideUpdate = (updated: MicroblogSlide) => {
        setSeriesSlides(prev => ({ ...prev, [activeSeries]: prev[activeSeries].map(s => s.id === updated.id ? updated : s) }));
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            if (!largePreviewRef.current) return;
            const el = largePreviewRef.current.querySelector('div') as HTMLElement;
            const canvas = await html2canvas(el, { scale: 2.5, useCORS: true, allowTaint: true, backgroundColor: null });
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `${data.brand.name.replace(/\s+/g, '_')}_${activeSeries}_slide${activeSlide + 1}_${ratio.replace(':', 'x')}.png`;
            a.click();
        } catch { alert('Download gagal. Coba lagi.'); }
        finally { setDownloading(false); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#ECECF0', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .mb4-topbar { background:#fff; border-bottom:1px solid rgba(0,0,0,0.07); padding:10px 20px; display:flex; align-items:center; gap:12px; flex-shrink:0; }
                .mb4-series-btn { display:flex; align-items:center; gap:6px; padding:6px 13px; border-radius:10px; border:1.5px solid rgba(0,0,0,0.08); background:#fff; cursor:pointer; white-space:nowrap; font-size:12px; font-weight:600; color:rgba(0,0,0,0.55); transition:all 0.2s; }
                .mb4-series-btn:hover { border-color:rgba(184,134,11,0.3); color:#B8860B; }
                .mb4-series-btn.active { background:linear-gradient(135deg,#B8860B,#D4AF37); border-color:transparent; color:#fff; box-shadow:0 3px 12px rgba(184,134,11,0.25); }
                .mb4-ratio-toggle { display:flex; background:rgba(0,0,0,0.05); border-radius:10px; padding:3px; gap:2px; }
                .mb4-ratio-btn { padding:5px 13px; border-radius:8px; font-size:11px; font-weight:700; border:none; cursor:pointer; transition:all 0.2s; color:rgba(0,0,0,0.45); background:transparent; }
                .mb4-ratio-btn.active { background:#fff; color:#1a1a1a; box-shadow:0 1px 4px rgba(0,0,0,0.1); }
                .mb4-body { display:flex; flex:1; overflow:hidden; }
                .mb4-main { flex:1; overflow-y:auto; display:flex; flex-direction:column; align-items:center; padding:28px 20px; gap:20px; }
                .mb4-strip { display:flex; gap:8px; align-items:flex-end; }
                .mb4-thumb { border-radius:8px; overflow:hidden; cursor:pointer; transition:all 0.2s; border:2.5px solid transparent; flex-shrink:0; }
                .mb4-thumb.active { border-color:#B8860B; }
                .mb4-thumb:hover { transform:scale(1.05); }
                .mb4-actions { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
                .mb4-btn { display:flex; align-items:center; gap:6px; padding:10px 18px; border-radius:11px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all 0.2s; }
                .mb4-btn-gold { background:linear-gradient(135deg,#B8860B,#D4AF37); color:#fff; box-shadow:0 4px 14px rgba(184,134,11,0.3); }
                .mb4-btn-gold:hover { opacity:0.9; transform:translateY(-1px); }
                .mb4-btn-ghost { background:rgba(255,255,255,0.85); color:rgba(0,0,0,0.6); border:1px solid rgba(0,0,0,0.1)!important; }
                .mb4-nav-dots { display:flex; gap:5px; }
                .mb4-nav-dot { width:6px; height:6px; border-radius:50%; background:rgba(0,0,0,0.2); border:none; cursor:pointer; padding:0; transition:all 0.2s; }
                .mb4-nav-dot.active { background:#B8860B; transform:scale(1.6); }
            ` }} />

            {/* Top Bar */}
            <div className="mb4-topbar">
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>Seri:</span>
                <div style={{ display: 'flex', gap: 6, flex: 1, overflowX: 'auto' }}>
                    {allSeries.map(s => (
                        <button key={s.id} className={`mb4-series-btn ${activeSeries === s.id ? 'active' : ''}`} onClick={() => handleSeriesChange(s.id)}>
                            {s.icon} {s.title}
                            <span style={{ fontSize: 9, opacity: 0.7, background: activeSeries === s.id ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 5 }}>
                                {seriesSlides[s.id]?.length}
                            </span>
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            padding: '6px 14px',
                            background: saveStatus === 'success' ? '#22C55E' : '#FFFFFF',
                            color: saveStatus === 'success' ? '#fff' : 'rgba(0,0,0,0.6)',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 11,
                            border: '1.5px solid rgba(0,0,0,0.08)',
                            cursor: saving ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'all 0.3s'
                        }}
                    >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 size={12} /> : <Save size={12} />}
                        {saving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Progress'}
                    </button>

                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.3)' }}>Format:</span>
                    <div className="mb4-ratio-toggle">
                        {(['4:5', '9:16'] as SlideRatio[]).map(r => (
                            <button key={r} className={`mb4-ratio-btn ${ratio === r ? 'active' : ''}`} onClick={() => setRatio(r)}>
                                {r === '4:5' ? '▭ Feed' : '▯ Story'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="mb4-body">
                <div className="mb4-main">
                    <div ref={largePreviewRef} style={{ display: 'flex', justifyContent: 'center' }}>
                        <SlidePreview slide={currentSlide} brand={data.brand} ratio={ratio} textSettings={textSettings} scale={LARGE_SCALE} />
                    </div>

                    <div className="mb4-strip">
                        {currentSlides.map((slide, i) => (
                            <div key={slide.id} className={`mb4-thumb ${i === activeSlide ? 'active' : ''}`}
                                style={{ width: Math.round(SW * THUMB_SCALE), height: THUMB_H }}
                                onClick={() => setActiveSlide(i)}>
                                <SlidePreview slide={slide} brand={data.brand} ratio={ratio} textSettings={textSettings} scale={THUMB_SCALE} />
                            </div>
                        ))}
                    </div>

                    <div className="mb4-nav-dots">
                        {currentSlides.map((_, i) => (
                            <button key={i} className={`mb4-nav-dot ${i === activeSlide ? 'active' : ''}`} onClick={() => setActiveSlide(i)} />
                        ))}
                    </div>

                    <div className="mb4-actions">
                        <button className="mb4-btn mb4-btn-gold" onClick={handleDownload} disabled={downloading}>
                            {downloading ? '⏳' : '⬇️'} Download Slide {activeSlide + 1}
                        </button>
                        <button className="mb4-btn mb4-btn-ghost"
                            onClick={() => window.open(`/${data.brand.name.toLowerCase().replace(/\s+/g, '-')}/blog/${data.id}/${activeSeries}`, '_blank')}>
                            🌐 Lihat Halaman Blog
                        </button>
                    </div>

                    {ratio === '9:16' && (
                        <div style={{ fontSize: 11, color: '#B8860B', background: 'rgba(184,134,11,0.08)', border: '1px dashed rgba(184,134,11,0.3)', borderRadius: 8, padding: '8px 14px', fontWeight: 600, textAlign: 'center' }}>
                            ▯ Story 9:16 — siap untuk video engine berikutnya
                        </div>
                    )}
                </div>

                <QCSidebar
                    slide={currentSlide}
                    brand={data.brand}
                    seriesId={activeSeries}
                    itineraryId={data.id}
                    ratio={ratio}
                    textSettings={textSettings}
                    onUpdate={handleSlideUpdate}
                    onTextSettingsUpdate={setTextSettings}
                />
            </div>
        </div>
    );
}
