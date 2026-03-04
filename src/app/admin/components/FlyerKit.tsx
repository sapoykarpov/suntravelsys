'use client';

import { useState, useRef, useCallback } from 'react';
import type { ItineraryPayload } from '@/types/itinerary';
import type { DesignSchema, ImageSlot, TextElement } from '@/app/api/flyer/analyze-design/route';

// ─── Constants ─────────────────────────────────────────────────────────────────

type FlyerRatio = '4:5' | '9:16';

const FLYER_DIMS = {
    '4:5': { w: 1080, h: 1350, label: '1080×1350 Feed' },
    '9:16': { w: 1080, h: 1920, label: '1080×1920 Story' },
};

const FONT_SIZE_MAP = {
    xs: '11px', sm: '13px', md: '15px', lg: '18px', xl: '22px', '2xl': '28px', '3xl': '36px',
};
const FONT_WEIGHT_MAP = {
    normal: 400, semibold: 600, bold: 700, extrabold: 800, black: 900,
};

// ─── Flyer Canvas ──────────────────────────────────────────────────────────────

interface FlyerCanvasProps {
    schema: DesignSchema;
    brand: ItineraryPayload['brand'];
    ratio: FlyerRatio;
    editedTexts: Record<string, string>;
    editedImages: Record<string, string>;
    scale: number;
    headlineStyle?: any;
}

function FlyerCanvas({ schema, brand, ratio, editedTexts, editedImages, scale, headlineStyle }: FlyerCanvasProps) {
    const { w, h } = FLYER_DIMS[ratio];
    const primaryColor = brand.primaryColor || schema.colorPalette.primary || '#B8860B';
    const heroBg = editedImages['img-hero'] || (brand as any).heroImage;

    const fontMap: Record<string, string> = {
        serif: "'Playfair Display', Georgia, serif",
        'sans-serif': "'Inter', system-ui, sans-serif",
        display: "'Montserrat', 'Impact', sans-serif",
        mono: "'Courier New', monospace",
    };
    const fontFamily = fontMap[schema.fontStyle] || fontMap['sans-serif'];

    const overlayGradient = {
        dark: `rgba(0,0,0,${schema.overlayOpacity / 100})`,
        light: `rgba(255,255,255,${schema.overlayOpacity / 100})`,
        'gradient-bottom': `linear-gradient(to top, rgba(0,0,0,${schema.overlayOpacity / 100}) 0%, rgba(0,0,0,${schema.overlayOpacity / 200}) 50%, transparent 100%)`,
        'gradient-full': `linear-gradient(180deg, rgba(0,0,0,${schema.overlayOpacity / 200}) 0%, rgba(0,0,0,${schema.overlayOpacity / 100}) 100%)`,
        none: 'transparent',
    }[schema.overlayStyle] || 'transparent';

    const getTextContent = (el: TextElement) => {
        if (editedTexts[el.id]) return editedTexts[el.id];
        // Auto-map from brand/itinerary data based on role
        return el.defaultText;
    };

    return (
        <>
            {schema.typography.headingFont && (
                <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${schema.typography.headingFont.replace(/ /g, '+')}:wght@400;700;800;900&family=${schema.typography.bodyFont?.replace(/ /g, '+') || 'Inter'}:wght@400;500;600&display=swap`} />
            )}
            <div style={{
                width: w * scale,
                height: h * scale,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: scale < 0.4 ? 6 : scale < 0.7 ? 10 : 16,
                fontFamily,
                boxShadow: '0 20px 80px rgba(0,0,0,0.3)',
                background: schema.backgroundColor || '#111',
                flexShrink: 0,
            }}>
                {/* ── Hero Background ── */}
                {heroBg && (
                    <img src={heroBg} alt="hero"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                )}
                {!heroBg && (
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${schema.colorPalette.background || '#111'}, ${primaryColor}22)` }} />
                )}

                {/* ── Overlay ── */}
                {schema.overlayStyle !== 'none' && (
                    <div style={{ position: 'absolute', inset: 0, background: overlayGradient, pointerEvents: 'none' }} />
                )}

                {/* ── Secondary Images Grid ── */}
                {(() => {
                    const secondarySlots = schema.imageSlots.filter(s => s.role === 'secondary');
                    if (secondarySlots.length === 0) return null;
                    const gridH = h * scale * 0.22;
                    const hasSecondary = secondarySlots.some(s => editedImages[s.id]);

                    if (!hasSecondary && !heroBg) return null;

                    return (
                        <div style={{
                            position: 'absolute',
                            bottom: 80 * scale,
                            left: 20 * scale,
                            right: 20 * scale,
                            height: gridH,
                            display: 'flex',
                            gap: 8 * scale,
                            borderRadius: 10 * scale,
                            overflow: 'hidden',
                        }}>
                            {secondarySlots.map((slot) => {
                                const imgSrc = editedImages[slot.id];
                                if (!imgSrc) return (
                                    <div key={slot.id} style={{
                                        flex: 1, height: '100%', borderRadius: 8 * scale,
                                        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)',
                                        border: '1.5px dashed rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11 * scale, color: 'rgba(255,255,255,0.35)', fontWeight: 600,
                                    }}>
                                        {slot.label}
                                    </div>
                                );
                                return (
                                    <div key={slot.id} style={{ flex: 1, height: '100%', borderRadius: 8 * scale, overflow: 'hidden' }}>
                                        <img src={imgSrc} alt={slot.label}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}

                {/* ── Text Elements ── */}
                {schema.textElements.map((el) => {
                    const text = getTextContent(el);
                    if (!text || el.role === 'brand') return null;

                    const isBadge = el.role === 'badge';
                    const isPrice = el.role === 'price';
                    const isCTA = el.role === 'cta';

                    // Position mapping
                    const posMap: Record<string, React.CSSProperties> = {
                        'top-left': { top: '10%', left: '5%' },
                        'top-center': { top: '8%', left: '50%', transform: 'translateX(-50%)' },
                        'top-right': { top: '10%', right: '5%' },
                        'center': { top: '42%', left: '50%', transform: 'translate(-50%,-50%)' },
                        'center-below-headline': { top: '55%', left: '50%', transform: 'translate(-50%,-50%)' },
                        'bottom-center': { bottom: isCTA ? '6%' : '18%', left: '50%', transform: 'translateX(-50%)' },
                        'bottom-left': { bottom: '14%', left: '5%' },
                        'bottom-right': { bottom: '14%', right: '5%' },
                    };
                    const posStyle = posMap[el.style.position] || posMap['center'];

                    const color = el.style.color || '#fff';

                    // Magic Headline Logic
                    const isMagicHeadline = el.role === 'headline' && headlineStyle;
                    const magicCss: React.CSSProperties = isMagicHeadline ? {
                        background: headlineStyle.color.includes('gradient') ? headlineStyle.color : undefined,
                        WebkitBackgroundClip: headlineStyle.color.includes('gradient') ? 'text' : undefined,
                        WebkitTextFillColor: headlineStyle.color.includes('gradient') ? 'transparent' : headlineStyle.color,
                        WebkitTextStroke: headlineStyle.webkitTextStroke ? `${parseInt(headlineStyle.webkitTextStroke) * scale}px ${headlineStyle.webkitTextStroke.split(' ')[1]}` : undefined,
                        textShadow: headlineStyle.textShadow ? headlineStyle.textShadow.split(',').map((s: string) => {
                            const parts = s.trim().split(' ');
                            return parts.map(p => p.includes('px') ? (parseFloat(p) * scale) + 'px' : p).join(' ');
                        }).join(', ') : undefined,
                        letterSpacing: headlineStyle.letterSpacing,
                        textTransform: headlineStyle.textTransform as any,
                        transform: (posStyle.transform || '') + (headlineStyle.skew ? ` skew(${headlineStyle.skew})` : ''),
                        fontSize: (parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * 1.5 * scale) + 'px', // Boost size for magic text
                    } : {};

                    return (
                        <div key={el.id} style={{
                            position: 'absolute',
                            ...posStyle,
                            textAlign: el.style.align,
                            width: el.style.align === 'center' ? '90%' : undefined,
                            zIndex: isBadge ? 10 : isPrice ? 8 : isCTA ? 9 : 5,
                            pointerEvents: 'none',
                        }}>
                            {isBadge ? (
                                <span style={{
                                    display: 'inline-block',
                                    background: primaryColor,
                                    color: '#fff',
                                    fontSize: parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * scale + 'px',
                                    fontWeight: FONT_WEIGHT_MAP[el.style.fontWeight],
                                    padding: `${5 * scale}px ${14 * scale}px`,
                                    borderRadius: 100,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                }}>
                                    {text}
                                </span>
                            ) : isCTA ? (
                                <span style={{
                                    display: 'inline-block',
                                    background: primaryColor,
                                    color: '#000',
                                    fontSize: parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * scale + 'px',
                                    fontWeight: FONT_WEIGHT_MAP[el.style.fontWeight],
                                    padding: `${10 * scale}px ${28 * scale}px`,
                                    borderRadius: 100,
                                }}>
                                    {text}
                                </span>
                            ) : isPrice ? (
                                <span style={{
                                    display: 'inline-block',
                                    fontSize: parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * scale + 'px',
                                    fontWeight: FONT_WEIGHT_MAP[el.style.fontWeight],
                                    color: primaryColor,
                                    background: 'rgba(0,0,0,0.5)',
                                    padding: `${6 * scale}px ${18 * scale}px`,
                                    borderRadius: 8 * scale,
                                    backdropFilter: 'blur(8px)',
                                    border: `1px solid ${primaryColor}50`,
                                }}>
                                    {text}
                                </span>
                            ) : (
                                <span style={{
                                    display: 'block',
                                    fontSize: parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * scale + 'px',
                                    fontWeight: FONT_WEIGHT_MAP[el.style.fontWeight],
                                    color,
                                    lineHeight: 1.1,
                                    textShadow: el.role === 'headline' && !headlineStyle ? `0 2px 16px rgba(0,0,0,0.6)` : !headlineStyle ? `0 1px 6px rgba(0,0,0,0.4)` : undefined,
                                    fontFamily: el.role === 'headline'
                                        ? `'${schema.typography.headingFont}', ${fontMap[schema.fontStyle]}`
                                        : fontFamily,
                                    ...magicCss
                                }}>
                                    {text}
                                </span>
                            )}
                        </div>
                    );
                })}

                {/* ── Brand Bar ── */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: `${12 * scale}px ${20 * scale}px`,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                    display: 'flex', alignItems: 'center', gap: 10 * scale,
                    zIndex: 20,
                }}>
                    {brand.logoUrl && (
                        <div style={{ width: 30 * scale, height: 30 * scale, borderRadius: 8 * scale, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src={brand.logoUrl} alt={brand.name}
                                style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11 * scale, fontWeight: 800, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {brand.name}
                        </div>
                        {(brand.whatsapp || brand.contact?.whatsapp) && (
                            <div style={{ fontSize: 9 * scale, color: primaryColor, marginTop: 1 * scale, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                📱 {brand.whatsapp || brand.contact?.whatsapp}
                            </div>
                        )}
                    </div>
                    {brand.tagline && (
                        <div style={{ fontSize: 8 * scale, color: 'rgba(255,255,255,0.4)', maxWidth: 90 * scale, textAlign: 'right', flexShrink: 0, lineHeight: 1.3 }}>
                            {brand.tagline}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Image Slot Editor ─────────────────────────────────────────────────────────

interface ImageSlotEditorProps {
    slot: ImageSlot;
    currentUrl: string;
    onUpdate: (url: string) => void;
    primaryColor: string;
}

function ImageSlotEditor({ slot, currentUrl, onUpdate, primaryColor }: ImageSlotEditorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<{ url: string; thumb: string; alt: string }[]>([]);
    const [expanded, setExpanded] = useState(false);

    const inp: React.CSSProperties = { width: '100%', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 8, padding: '7px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const { searchUnsplashPhotosClient } = await import('@/lib/utils/unsplash');
            const r = await searchUnsplashPhotosClient(searchQuery, 6);
            setResults(r.photos);
        } finally { setSearching(false); }
    };

    return (
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
            <button onClick={() => setExpanded(!expanded)} style={{
                width: '100%', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10,
                background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                    background: currentUrl ? 'transparent' : 'rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px dashed ${currentUrl ? primaryColor : 'rgba(0,0,0,0.15)'}`,
                }}>
                    {currentUrl
                        ? <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : <span style={{ fontSize: 16 }}>🖼️</span>
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', textTransform: 'capitalize' }}>
                        {slot.role === 'hero' ? '⭐ ' : ''}{slot.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.35)', marginTop: 1 }}>
                        {currentUrl ? 'Gambar dipilih ✓' : 'Belum ada gambar — klik untuk pilih'}
                    </div>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)' }}>{expanded ? '▲' : '▼'}</span>
            </button>

            {expanded && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, display: 'block', paddingTop: 10 }}>URL Gambar</div>
                        <input type="text" value={currentUrl} placeholder="Paste URL gambar..."
                            style={{ ...inp }}
                            onChange={e => onUpdate(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Cari di Unsplash</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input type="text" value={searchQuery} placeholder="Seoul, Bali, Paris..."
                                style={{ ...inp, flex: 1 }}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                            <button onClick={handleSearch} disabled={searching}
                                style={{ padding: '0 12px', borderRadius: 8, background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>
                                {searching ? '⏳' : '→'}
                            </button>
                        </div>
                    </div>
                    {results.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                            {results.map((p, i) => (
                                <button key={i} onClick={() => { onUpdate(p.url); setExpanded(false); }}
                                    style={{ padding: 0, border: currentUrl === p.url ? '2px solid #B8860B' : '2px solid transparent', borderRadius: 7, overflow: 'hidden', cursor: 'pointer', aspectRatio: '1/1', background: '#eee' }}>
                                    <img src={p.thumb} alt={p.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main FlyerKit ─────────────────────────────────────────────────────────────

interface FlyerKitProps { data: ItineraryPayload; }

export default function FlyerKit({ data }: FlyerKitProps) {
    const { brand, meta, days, inclusions, highlights } = data;

    // State for Magic Text Effect
    const [magicHeadlineUrl, setMagicHeadlineUrl] = useState('');
    const [scanningEffect, setScanningEffect] = useState(false);
    const [headlineStyle, setHeadlineStyle] = useState<any>(null);

    const handleScanEffect = async () => {
        if (!magicHeadlineUrl.trim()) return;
        setScanningEffect(true);
        try {
            const res = await fetch('/api/flyer/analyze-text-effect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: magicHeadlineUrl }),
            });
            const result = await res.json();
            if (result.style) {
                setHeadlineStyle(result.style);
                setSidebarTab('texts');
            }
        } catch (e) {
            console.error('Magic Scan failure', e);
        } finally {
            setScanningEffect(false);
        }
    };

    // Replace the text-headline rendering block in FlyerCanvas helper...
    // Note: To keep things clean, I will modify the internal FlyerCanvas logic via replacement
    const [ratio, setRatio] = useState<FlyerRatio>('4:5');
    const [schema, setSchema] = useState<DesignSchema | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [referenceUrl, setReferenceUrl] = useState('');
    const [analyzeError, setAnalyzeError] = useState('');
    const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
    const [editedImages, setEditedImages] = useState<Record<string, string>>({});
    const [sidebarTab, setSidebarTab] = useState<'style-transfer' | 'images' | 'texts' | 'brand'>('style-transfer');
    const [downloading, setDownloading] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const primaryColor = brand.primaryColor || '#B8860B';
    const itineraryContext = `${meta.title}, ${meta.durationDays} hari ${meta.durationNights} malam, mulai ${meta.price}`;

    // Auto-fill texts from itinerary data when schema arrives
    const applyAutoTexts = (newSchema: DesignSchema) => {
        const autoTexts: Record<string, string> = {};
        newSchema.textElements.forEach(el => {
            switch (el.role) {
                case 'headline': autoTexts[el.id] = meta.title; break;
                case 'subheadline': autoTexts[el.id] = meta.subtitle || `${meta.durationDays}H${meta.durationNights}M · All Inclusive`; break;
                case 'price': autoTexts[el.id] = `Mulai ${meta.price}`; break;
                case 'badge': autoTexts[el.id] = `${meta.durationDays}H${meta.durationNights}M`; break;
                case 'cta': autoTexts[el.id] = 'Hubungi Kami Sekarang!'; break;
                case 'brand': autoTexts[el.id] = brand.name; break;
                case 'body': autoTexts[el.id] = highlights.slice(0, 2).map(h => `✦ ${h.label}: ${h.value}`).join('  '); break;
            }
        });
        setEditedTexts(autoTexts);
    };

    // Auto-fill images from itinerary
    const applyAutoImages = (newSchema: DesignSchema) => {
        const autoImages: Record<string, string> = {};
        const heroSlot = newSchema.imageSlots.find(s => s.role === 'hero');
        if (heroSlot && (meta.coverImage || days[0]?.heroImage)) {
            autoImages[heroSlot.id] = meta.coverImage || days[0]?.heroImage;
        }
        const secondarySlots = newSchema.imageSlots.filter(s => s.role === 'secondary');
        secondarySlots.forEach((slot, i) => {
            if (days[i + 1]?.heroImage) autoImages[slot.id] = days[i + 1].heroImage;
        });
        setEditedImages(autoImages);
    };

    const handleAnalyze = async () => {
        if (!referenceUrl.trim()) return;
        setAnalyzing(true);
        setAnalyzeError('');
        try {
            const res = await fetch('/api/flyer/analyze-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: referenceUrl, itineraryContext }),
            });
            const result = await res.json();
            if (result.schema) {
                setSchema(result.schema);
                applyAutoTexts(result.schema);
                applyAutoImages(result.schema);
                setSidebarTab('images');
                if (result.error) setAnalyzeError(`AI fallback: ${result.error}`);
            } else {
                setAnalyzeError('Gagal mendapatkan schema dari AI.');
            }
        } catch (e: any) {
            setAnalyzeError(e.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const useDefaultTemplate = () => {
        const defaultSchema: DesignSchema = {
            layoutType: 'full-bleed',
            colorPalette: { primary: primaryColor, secondary: '#1a1a1a', accent: '#D4AF37', background: '#0a0a0f', text: '#ffffff' },
            overlayStyle: 'gradient-bottom', overlayOpacity: 68,
            borderRadius: 'md', fontStyle: 'sans-serif',
            typography: { headingFont: 'Montserrat', bodyFont: 'Inter' },
            imageSlots: [
                { id: 'img-hero', role: 'hero', label: 'Hero Background', position: { area: 'full' }, aspectRatio: '4/5' },
                { id: 'img-2', role: 'secondary', label: 'Gambar 2', position: { area: 'bottom-left-third' }, aspectRatio: '1/1' },
                { id: 'img-3', role: 'secondary', label: 'Gambar 3', position: { area: 'bottom-center-third' }, aspectRatio: '1/1' },
                { id: 'img-4', role: 'secondary', label: 'Gambar 4', position: { area: 'bottom-right-third' }, aspectRatio: '1/1' },
            ],
            textElements: [
                { id: 'text-badge', role: 'badge', defaultText: '7H6M', style: { fontSize: 'sm', fontWeight: 'extrabold', color: '#fff', align: 'left', position: 'top-left' } },
                { id: 'text-headline', role: 'headline', defaultText: meta.title, style: { fontSize: '3xl', fontWeight: 'black', color: '#ffffff', align: 'center', position: 'center' } },
                { id: 'text-sub', role: 'subheadline', defaultText: 'Paket All Inclusive', style: { fontSize: 'md', fontWeight: 'normal', color: 'rgba(255,255,255,0.8)', align: 'center', position: 'center-below-headline' } },
                { id: 'text-price', role: 'price', defaultText: `Mulai ${meta.price}`, style: { fontSize: 'xl', fontWeight: 'bold', color: primaryColor, align: 'center', position: 'bottom-center' } },
                { id: 'text-cta', role: 'cta', defaultText: 'Hubungi Kami Sekarang!', style: { fontSize: 'sm', fontWeight: 'bold', color: '#000', align: 'center', position: 'bottom-center' } },
            ],
            brandPosition: 'bottom-left', backgroundStyle: 'image',
            analysisConfidence: 100, description: 'Default template Travel Asset Engine',
        };
        setSchema(defaultSchema);
        applyAutoTexts(defaultSchema);
        applyAutoImages(defaultSchema);
        setSidebarTab('images');
    };

    const handleDownload = async () => {
        if (!canvasRef.current || !schema) return;
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const el = canvasRef.current.querySelector('div') as HTMLElement;
            const canvas = await html2canvas(el, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: null });
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `${brand.name.replace(/\s+/g, '_')}_flyer_${ratio.replace(':', 'x')}.png`;
            a.click();
        } catch { alert('Download gagal. Coba lagi.'); }
        finally { setDownloading(false); }
    };

    // Dims for preview
    const { w, h } = FLYER_DIMS[ratio];
    const maxH = 560;
    const SCALE = Math.min(maxH / h, 380 / w, 1);

    const inp: React.CSSProperties = { width: '100%', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
    const card: React.CSSProperties = { background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: 14, marginBottom: 10 };
    const label: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: 7, display: 'block' };
    const SIDEBAR_TABS = [
        { id: 'style-transfer' as const, icon: '🪄', label: 'Style' },
        { id: 'images' as const, icon: '🖼️', label: 'Foto' },
        { id: 'texts' as const, icon: '✏️', label: 'Teks' },
        { id: 'brand' as const, icon: '🎨', label: 'Brand' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#ECECF0', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .fk-topbar { background:#fff; border-bottom:1px solid rgba(0,0,0,0.07); padding:10px 20px; display:flex; align-items:center; gap:12px; flex-shrink:0; }
                .fk-ratio-toggle { display:flex; background:rgba(0,0,0,0.05); border-radius:10px; padding:3px; gap:2px; }
                .fk-ratio-btn { padding:5px 14px; border-radius:8px; font-size:11px; font-weight:700; border:none; cursor:pointer; transition:all 0.2s; color:rgba(0,0,0,0.45); background:transparent; }
                .fk-ratio-btn.active { background:#fff; color:#1a1a1a; box-shadow:0 1px 4px rgba(0,0,0,0.1); }
                .fk-btn-gold { display:flex; align-items:center; gap:6px; padding:9px 18px; border-radius:11px; font-size:12px; font-weight:700; cursor:pointer; border:none; background:linear-gradient(135deg,#B8860B,#D4AF37); color:#fff; box-shadow:0 4px 14px rgba(184,134,11,0.3); transition:all 0.2s; }
                .fk-btn-gold:hover { opacity:0.9; transform:translateY(-1px); }
                .fk-btn-ghost { display:flex; align-items:center; gap:6px; padding:9px 18px; border-radius:11px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid rgba(0,0,0,0.1); background:rgba(255,255,255,0.85); color:rgba(0,0,0,0.6); transition:all 0.2s; }
                .fk-body { display:flex; flex:1; overflow:hidden; }
                .fk-main { flex:1; overflow-y:auto; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:28px 20px; gap:16px; }
                .fk-sidebar { width:320px; flexShrink:0; background:#F7F7F9; border-left:1px solid rgba(0,0,0,0.08); display:flex; flex-direction:column; overflow:hidden; }
                .fk-sidebar-tabs { background:#fff; border-bottom:1px solid rgba(0,0,0,0.07); display:flex; }
                .fk-stab { flex:1; padding:12px 4px 10px; border:none; background:transparent; cursor:pointer; font-size:10px; font-weight:700; letter-spacing:0.06em; display:flex; flex-direction:column; align-items:center; gap:2px; border-bottom:2px solid transparent; color:rgba(0,0,0,0.35); transition:all 0.2s; }
                .fk-stab.active { color:#B8860B; border-bottom-color:#B8860B; }
                .fk-stab-icon { font-size:16px; }
                .fk-sidebar-body { flex:1; overflow-y:auto; padding:14px; }
            ` }} />

            {/* Topbar */}
            <div className="fk-topbar">
                <span style={{ fontSize: 14 }}>✦</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>Flyer Maker</span>
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: 5 }}>Beta</span>
                <div style={{ flex: 1 }} />
                <div className="fk-ratio-toggle">
                    {(['4:5', '9:16'] as FlyerRatio[]).map(r => (
                        <button key={r} className={`fk-ratio-btn ${ratio === r ? 'active' : ''}`} onClick={() => setRatio(r)}>
                            {r === '4:5' ? '▭ 1080×1350' : '▯ 1080×1920'}
                        </button>
                    ))}
                </div>
                {schema && (
                    <>
                        <button className="fk-btn-ghost" onClick={handleDownload} disabled={downloading}>
                            {downloading ? '⏳' : '⬇️'} Download PNG
                        </button>
                    </>
                )}
            </div>

            {/* Body */}
            <div className="fk-body">
                {/* Canvas Area */}
                <div className="fk-main">
                    {!schema ? (
                        /* Empty state */
                        <div style={{ maxWidth: 460, textAlign: 'center', marginTop: 40 }}>
                            <div style={{ fontSize: 52, marginBottom: 16 }}>🎨</div>
                            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Flyer Maker</h2>
                            <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
                                Paste link gambar referensi dari Google/Pinterest, dan AI akan menganalisa design-nya untuk membuat flyer serupa otomatis. Atau gunakan template default.
                            </p>
                            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid rgba(0,0,0,0.08)', marginBottom: 12, textAlign: 'left' }}>
                                <label style={label}>🔗 URL Referensi Design (Google / Pinterest)</label>
                                <input type="text" value={referenceUrl}
                                    placeholder="https://i.pinimg.com/... atau URL gambar manapun"
                                    style={{ ...inp, marginBottom: 10 }}
                                    onChange={e => setReferenceUrl(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                                />
                                <button className="fk-btn-gold" style={{ width: '100%', justifyContent: 'center' }}
                                    onClick={handleAnalyze} disabled={analyzing || !referenceUrl.trim()}>
                                    {analyzing ? '🤖 AI Menganalisa...' : '🪄 Analisa & Style Transfer'}
                                </button>
                                {analyzeError && (
                                    <div style={{ marginTop: 8, fontSize: 11, color: '#e55', background: 'rgba(220,50,50,0.06)', borderRadius: 7, padding: '7px 10px' }}>
                                        ⚠️ {analyzeError}
                                    </div>
                                )}
                            </div>
                            <button className="fk-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={useDefaultTemplate}>
                                Gunakan Template Default →
                            </button>
                        </div>
                    ) : (
                        <>
                            <div ref={canvasRef} style={{ display: 'flex', justifyContent: 'center' }}>
                                <FlyerCanvas
                                    schema={schema} brand={brand}
                                    ratio={ratio}
                                    editedTexts={editedTexts}
                                    editedImages={editedImages}
                                    scale={SCALE}
                                    headlineStyle={headlineStyle}
                                />
                            </div>

                            {schema.analysisConfidence > 0 && (
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
                                    🤖 AI Confidence: {schema.analysisConfidence}% · {schema.description}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="fk-btn-gold" onClick={handleDownload} disabled={downloading}>
                                    {downloading ? '⏳' : '⬇️'} Download {FLYER_DIMS[ratio].label}
                                </button>
                                <button className="fk-btn-ghost" onClick={() => { setSchema(null); setReferenceUrl(''); }}>
                                    🪄 Ganti Referensi
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="fk-sidebar">
                    <div className="fk-sidebar-tabs">
                        {SIDEBAR_TABS.map(t => (
                            <button key={t.id} className={`fk-stab ${sidebarTab === t.id ? 'active' : ''}`} onClick={() => setSidebarTab(t.id)}>
                                <span className="fk-stab-icon">{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="fk-sidebar-body">

                        {/* ── Style Transfer ── */}
                        {sidebarTab === 'style-transfer' && (
                            <>
                                <div style={card}>
                                    <span style={label}>🔗 Referensi URL Design</span>
                                    <input type="text" value={referenceUrl} placeholder="Paste URL gambar referensi..."
                                        style={{ ...inp, marginBottom: 8 }}
                                        onChange={e => setReferenceUrl(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && schema && handleAnalyze()} />
                                    <button onClick={handleAnalyze} disabled={analyzing || !referenceUrl.trim()}
                                        style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: 'linear-gradient(135deg,#B8860B, #D4AF37)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                                        {analyzing ? '🤖 Menganalisa...' : '🪄 Analisa Style'}
                                    </button>
                                    {analyzeError && <div style={{ marginTop: 8, fontSize: 11, color: '#e55' }}>{analyzeError}</div>}
                                </div>

                                {schema && (
                                    <>
                                        <div style={card}>
                                            <span style={label}>📐 Layout Terdeteksi</span>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', textTransform: 'capitalize' }}>{schema.layoutType.replace('-', ' ')}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', marginTop: 3, fontStyle: 'italic' }}>{schema.description}</div>
                                        </div>

                                        <div style={card}>
                                            <span style={label}>🎨 Palet Warna AI</span>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {Object.entries(schema.colorPalette).map(([k, v]) => (
                                                    <div key={k} title={`${k}: ${v}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: v, border: '1px solid rgba(0,0,0,0.1)' }} />
                                                        <div style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', textTransform: 'capitalize' }}>{k}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={card}>
                                            <span style={label}>🔲 Overlay</span>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <span style={{ fontSize: 12, textTransform: 'capitalize', color: '#555' }}>{schema.overlayStyle.replace('-', ' ')}</span>
                                                <div style={{ flex: 1 }} />
                                                <span style={{ fontSize: 12, fontWeight: 700 }}>{schema.overlayOpacity}%</span>
                                            </div>
                                            <input type="range" min={0} max={95} step={5} value={schema.overlayOpacity}
                                                onChange={e => setSchema({ ...schema, overlayOpacity: +e.target.value })}
                                                style={{ width: '100%', accentColor: '#B8860B', marginTop: 6 }} />
                                        </div>

                                        <div style={card}>
                                            <span style={label}>🔤 Gaya Font</span>
                                            {(['serif', 'sans-serif', 'display', 'mono'] as const).map(fs => (
                                                <button key={fs} onClick={() => setSchema({ ...schema, fontStyle: fs })}
                                                    style={{ display: 'block', width: '100%', padding: '8px 12px', marginBottom: 5, borderRadius: 9, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', background: schema.fontStyle === fs ? 'rgba(184,134,11,0.1)' : '#F5F5F7', color: schema.fontStyle === fs ? '#B8860B' : '#555', outline: schema.fontStyle === fs ? '1.5px solid #B8860B' : 'none' }}>
                                                    {fs === 'serif' ? 'Serif — Elegan' : fs === 'sans-serif' ? 'Sans-Serif — Modern' : fs === 'display' ? 'Display — Impactful' : 'Mono — Tech'}
                                                </button>
                                            ))}
                                        </div>

                                        <div style={card}>
                                            <span style={label}>🖼️ Image Slots Terdeteksi</span>
                                            {schema.imageSlots.map(slot => (
                                                <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                    <span style={{ fontSize: 13 }}>{slot.role === 'hero' ? '⭐' : '◻️'}</span>
                                                    <div>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{slot.label}</div>
                                                        <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>{slot.role} · {slot.aspectRatio} · {slot.position.area}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div style={{ marginTop: 8, fontSize: 11, color: '#B8860B', fontWeight: 600 }}>
                                                → Ganti gambar di tab Foto 🖼️
                                            </div>
                                        </div>
                                    </>
                                )}

                                {!schema && (
                                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(0,0,0,0.3)', fontSize: 12 }}>
                                        Belum ada design yang dianalisa.<br />Paste URL di atas atau gunakan template default.
                                    </div>
                                )}

                                <button className="fk-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={useDefaultTemplate}>
                                    Gunakan Template Default
                                </button>
                            </>
                        )}

                        {/* ── Images ── */}
                        {sidebarTab === 'images' && schema && (
                            <>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', marginBottom: 12, lineHeight: 1.5 }}>
                                    {schema.imageSlots.length} image slot ditemukan. Gambar sudah auto-fill dari itinerary — ganti jika perlu.
                                </div>
                                {schema.imageSlots.map(slot => (
                                    <ImageSlotEditor
                                        key={slot.id}
                                        slot={slot}
                                        currentUrl={editedImages[slot.id] || ''}
                                        onUpdate={(url) => setEditedImages(prev => ({ ...prev, [slot.id]: url }))}
                                        primaryColor={primaryColor}
                                    />
                                ))}
                            </>
                        )}

                        {/* ── Texts ── */}
                        {sidebarTab === 'texts' && schema && (
                            <>
                                {/* Magic Text Scan Section */}
                                <div style={{ ...card, background: 'linear-gradient(135deg, #fff, rgba(184,134,11,0.05))', border: '1px solid rgba(184,134,11,0.2)' }}>
                                    <span style={label}>🪄 Magic Text Effect Scan</span>
                                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 10, lineHeight: 1.5 }}>
                                        Paste URL gambar (Google/Pinterest) dengan efek tulisan keren, AI akan meniru gayanya untuk Headline Anda.
                                    </div>
                                    <input type="text" value={magicHeadlineUrl} placeholder="Paste link efek teks (misal: Quest 3D)..."
                                        style={{ ...inp, marginBottom: 8 }}
                                        onChange={e => setMagicHeadlineUrl(e.target.value)} />
                                    <button onClick={handleScanEffect} disabled={scanningEffect || !magicHeadlineUrl.trim()}
                                        style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: 'linear-gradient(135deg, #1a1a1a, #444)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        {scanningEffect ? '🤖 Scanning Effect...' : '🧪 Terapkan Efek Magic'}
                                    </button>
                                    {headlineStyle && (
                                        <button onClick={() => setHeadlineStyle(null)} style={{ width: '100%', marginTop: 6, background: 'transparent', border: 'none', color: '#e55', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                            ↺ Hapus Efek & Reset
                                        </button>
                                    )}
                                </div>

                                {schema.textElements.map(el => (
                                    <div key={el.id} style={card}>
                                        <span style={label}>{el.role === 'headline' ? '🔤' : el.role === 'price' ? '💰' : el.role === 'badge' ? '🏷️' : el.role === 'cta' ? '🎯' : '✏️'} {el.role}</span>
                                        {el.role === 'body' ? (
                                            <textarea value={editedTexts[el.id] ?? el.defaultText} rows={3}
                                                style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
                                                onChange={e => setEditedTexts(prev => ({ ...prev, [el.id]: e.target.value }))} />
                                        ) : (
                                            <input type="text" value={editedTexts[el.id] ?? el.defaultText}
                                                style={inp}
                                                onChange={e => setEditedTexts(prev => ({ ...prev, [el.id]: e.target.value }))} />
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* ── Brand ── */}
                        {sidebarTab === 'brand' && (
                            <>
                                <div style={card}>
                                    <span style={label}>✦ Brand Profile (dari Supabase)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                        {brand.logoUrl && (
                                            <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src={brand.logoUrl} alt={brand.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>{brand.name}</div>
                                            {brand.tagline && <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', marginTop: 2, fontStyle: 'italic' }}>{brand.tagline}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 6, background: brand.primaryColor || '#B8860B', border: '1px solid rgba(0,0,0,0.1)' }} title={brand.primaryColor} />
                                        <div style={{ width: 24, height: 24, borderRadius: 6, background: brand.secondaryColor || '#1a1a1a', border: '1px solid rgba(0,0,0,0.1)' }} title={brand.secondaryColor} />
                                        <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', alignSelf: 'center', marginLeft: 4 }}>{brand.primaryColor} · {brand.secondaryColor}</div>
                                    </div>
                                </div>
                                <div style={{ ...card, fontSize: 12, color: 'rgba(0,0,0,0.5)', lineHeight: 1.7 }}>
                                    <span style={label}>ℹ️ Info Itinerary</span>
                                    <div><b>Judul:</b> {meta.title}</div>
                                    <div><b>Durasi:</b> {meta.durationDays}H {meta.durationNights}M</div>
                                    <div><b>Harga:</b> {meta.price}</div>
                                    <div><b>Agen:</b> {brand.name}</div>
                                    {brand.whatsapp && <div><b>WA:</b> {brand.whatsapp}</div>}
                                </div>
                            </>
                        )}

                        {/* Empty state for tabs when no schema */}
                        {sidebarTab !== 'style-transfer' && sidebarTab !== 'brand' && !schema && (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(0,0,0,0.3)', fontSize: 12 }}>
                                Analisa design terlebih dahulu di tab Style 🪄
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
