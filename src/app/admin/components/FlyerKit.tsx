'use client';

import { useState, useRef } from 'react';
import type { ItineraryPayload } from '@/types/itinerary';
import type { DesignSchema, ImageSlot, TextElement } from '@/app/api/flyer/analyze-design/route';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { updateItineraryContent } from '../actions';

type FlyerRatio = '4:5' | '9:16';

const FLYER_DIMS = {
    '4:5': { w: 1080, h: 1350, label: '1080×1350 Feed' },
    '9:16': { w: 1080, h: 1920, label: '1080×1920 Story' },
};

const FONT_SIZE_MAP: Record<string, string> = {
    xs: '11px', sm: '13px', md: '15px', lg: '18px', xl: '22px', '2xl': '28px', '3xl': '36px',
};
const FONT_WEIGHT_MAP: Record<string, number> = {
    normal: 400, semibold: 600, bold: 700, extrabold: 800, black: 900,
};

interface FlyerCanvasProps {
    schema: DesignSchema;
    brand: ItineraryPayload['brand'];
    ratio: FlyerRatio;
    editedTexts: Record<string, string>;
    editedImages: Record<string, string>;
    scale: number;
    headlineStyle?: any;
    magicImageSrc?: string;
}

function FlyerCanvas({ schema, brand, ratio, editedTexts, editedImages, scale, headlineStyle, magicImageSrc }: FlyerCanvasProps) {
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
        return el.defaultText;
    };

    return (
        <>
            {(schema.typography.headingFont || headlineStyle?.fontFamily) && (
                <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${(headlineStyle?.fontFamily || schema.typography.headingFont).replace(/ /g, '+')}:wght@400;700;800;900&family=${schema.typography.bodyFont?.replace(/ /g, '+') || 'Inter'}:wght@400;500;600&display=swap`} />
            )}
            <div style={{ width: w * scale, height: h * scale, position: 'relative', overflow: 'hidden', borderRadius: scale < 0.4 ? 6 : scale < 0.7 ? 10 : 16, fontFamily, boxShadow: '0 20px 80px rgba(0,0,0,0.3)', background: schema.backgroundColor || '#111', flexShrink: 0 }}>
                {heroBg && <img src={heroBg} alt="hero" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                {!heroBg && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${schema.colorPalette.background || '#111'}, ${primaryColor}22)` }} />}
                {schema.overlayStyle !== 'none' && <div style={{ position: 'absolute', inset: 0, background: overlayGradient, pointerEvents: 'none' }} />}

                {(() => {
                    const secondarySlots = schema.imageSlots.filter(s => s.role === 'secondary');
                    if (secondarySlots.length === 0) return null;
                    const gridH = h * scale * 0.22;
                    const hasSecondary = secondarySlots.some(s => editedImages[s.id]);
                    if (!hasSecondary && !heroBg) return null;
                    return (
                        <div style={{ position: 'absolute', bottom: 80 * scale, left: 20 * scale, right: 20 * scale, height: gridH, display: 'flex', gap: 8 * scale, borderRadius: 10 * scale, overflow: 'hidden' }}>
                            {secondarySlots.map((slot) => {
                                const imgSrc = editedImages[slot.id];
                                if (!imgSrc) return (<div key={slot.id} style={{ flex: 1, height: '100%', borderRadius: 8 * scale, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)', border: '1.5px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 * scale, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{slot.label}</div>);
                                return (<div key={slot.id} style={{ flex: 1, height: '100%', borderRadius: 8 * scale, overflow: 'hidden' }}><img src={imgSrc} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>);
                            })}
                        </div>
                    );
                })()}

                {schema.textElements.map((el) => {
                    const text = getTextContent(el);
                    if (!text || el.role === 'brand') return null;
                    if (el.role === 'headline' && magicImageSrc) return null;
                    const isBadge = el.role === 'badge';
                    const isPrice = el.role === 'price';
                    const isCTA = el.role === 'cta';
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
                    const isMagicHeadline = el.role === 'headline' && headlineStyle;
                    const magicCss: React.CSSProperties = isMagicHeadline ? {
                        fontFamily: headlineStyle.fontFamily ? `'${headlineStyle.fontFamily}', ${fontMap[schema.fontStyle]}` : undefined,
                        fontWeight: headlineStyle.fontWeight || 900,
                        background: (headlineStyle.color && headlineStyle.color.includes('gradient')) ? headlineStyle.color : undefined,
                        WebkitBackgroundClip: (headlineStyle.color && headlineStyle.color.includes('gradient')) ? 'text' : undefined,
                        WebkitTextFillColor: (headlineStyle.color && headlineStyle.color.includes('gradient')) ? 'transparent' : (headlineStyle.color || '#fff'),
                        textShadow: headlineStyle.textShadow ? headlineStyle.textShadow.split(',').map((s: string) => { const parts = s.trim().split(' '); return parts.map((p: string) => p.includes('px') ? (parseFloat(p) * scale) + 'px' : p).join(' '); }).join(', ') : '0 4px 20px rgba(0,0,0,0.5)',
                        letterSpacing: headlineStyle.letterSpacing || 'normal',
                        textTransform: (headlineStyle.textTransform as any) || 'uppercase',
                        transform: (posStyle.transform || '') + (headlineStyle.skew ? ` skew(${headlineStyle.skew})` : ''),
                        fontSize: (parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * 1.5 * scale) + 'px',
                        lineHeight: 1.0,
                    } : {};
                    return (
                        <div key={el.id} style={{ position: 'absolute', ...posStyle, textAlign: el.style.align, width: el.style.align === 'center' ? '90%' : undefined, zIndex: isBadge ? 10 : isPrice ? 8 : isCTA ? 9 : 5, pointerEvents: 'none' }}>
                            {isBadge ? (
                                <span style={{ display: 'inline-block', background: primaryColor, color: '#fff', fontSize: parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * scale + 'px', fontWeight: FONT_WEIGHT_MAP[el.style.fontWeight], padding: `${5 * scale}px ${14 * scale}px`, borderRadius: 100, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{text}</span>
                            ) : isCTA ? (
                                <span style={{ display: 'inline-block', background: primaryColor, color: '#000', fontSize: parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * scale + 'px', fontWeight: FONT_WEIGHT_MAP[el.style.fontWeight], padding: `${10 * scale}px ${28 * scale}px`, borderRadius: 100 }}>{text}</span>
                            ) : isPrice ? (
                                <span style={{ display: 'inline-block', fontSize: parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * scale + 'px', fontWeight: FONT_WEIGHT_MAP[el.style.fontWeight], color: primaryColor, background: 'rgba(0,0,0,0.5)', padding: `${6 * scale}px ${18 * scale}px`, borderRadius: 8 * scale, backdropFilter: 'blur(8px)', border: `1px solid ${primaryColor}50` }}>{text}</span>
                            ) : (
                                <span style={{ display: 'block', fontSize: parseFloat(FONT_SIZE_MAP[el.style.fontSize]) * scale + 'px', fontWeight: FONT_WEIGHT_MAP[el.style.fontWeight], color, lineHeight: 1.1, textShadow: el.role === 'headline' && !headlineStyle ? '0 2px 16px rgba(0,0,0,0.6)' : !headlineStyle ? '0 1px 6px rgba(0,0,0,0.4)' : undefined, fontFamily: el.role === 'headline' ? `'${schema.typography.headingFont}', ${fontMap[schema.fontStyle]}` : fontFamily, ...magicCss }}>{text}</span>
                            )}
                        </div>
                    );
                })}

                {magicImageSrc && (
                    <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', zIndex: 6, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
                        <img src={magicImageSrc} alt="Magic Headline" style={{ maxWidth: '100%', maxHeight: 200 * scale, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }} />
                    </div>
                )}

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `${12 * scale}px ${20 * scale}px`, background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', display: 'flex', alignItems: 'center', gap: 10 * scale, zIndex: 20 }}>
                    {brand.logoUrl && (
                        <div style={{ width: 30 * scale, height: 30 * scale, borderRadius: 8 * scale, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src={brand.logoUrl} alt={brand.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11 * scale, fontWeight: 800, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.name}</div>
                        {(brand.whatsapp || brand.contact?.whatsapp) && <div style={{ fontSize: 9 * scale, color: primaryColor, marginTop: 1 * scale, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📱 {brand.whatsapp || brand.contact?.whatsapp}</div>}
                    </div>
                    {brand.tagline && <div style={{ fontSize: 8 * scale, color: 'rgba(255,255,255,0.4)', maxWidth: 90 * scale, textAlign: 'right', flexShrink: 0, lineHeight: 1.3 }}>{brand.tagline}</div>}
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

    const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box', color: '#fff' };

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
        <div style={{ marginTop: 8 }}>
            <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>URL Gambar</div>
                <input type="text" value={currentUrl} placeholder="Paste URL gambar..." style={inp} onChange={e => onUpdate(e.target.value)} />
            </div>
            <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Cari Unsplash</div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" value={searchQuery} placeholder="Seoul, Bali, Paris..." style={{ ...inp, flex: 1 }} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                    <button onClick={handleSearch} disabled={searching} style={{ padding: '0 10px', borderRadius: 8, background: '#D4AF37', color: '#000', border: 'none', cursor: 'pointer', fontSize: 13, flexShrink: 0, fontWeight: 700 }}>{searching ? '⏳' : '→'}</button>
                </div>
            </div>
            {results.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginTop: 8 }}>
                    {results.map((p, i) => (
                        <button key={i} onClick={() => { onUpdate(p.url); setResults([]); }} style={{ padding: 0, border: currentUrl === p.url ? '2px solid #D4AF37' : '2px solid transparent', borderRadius: 7, overflow: 'hidden', cursor: 'pointer', aspectRatio: '1/1', background: '#333' }}>
                            <img src={p.thumb} alt={p.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// === GEMINI MODAL ===
interface GeminiModalProps { onClose: () => void; prompt: string; onImageResult: (src: string) => void; }
function GeminiModal({ onClose, prompt, onImageResult }: GeminiModalProps) {
    const [copied, setCopied] = useState(false);
    const [hint, setHint] = useState('');
    const fRef = useRef<HTMLInputElement>(null);
    const copy = () => { navigator.clipboard.writeText(prompt).catch(() => { }); setCopied(true); setTimeout(() => setCopied(false), 2500); };
    const handlePaste = (e: React.ClipboardEvent) => { const i = Array.from(e.clipboardData.items).find(x => x.type.startsWith('image/')); if (!i) { setHint('Tidak ada gambar'); return; } const b = i.getAsFile(); if (!b) return; const r = new FileReader(); r.onload = () => { onImageResult(r.result as string); onClose(); }; r.readAsDataURL(b); };
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { onImageResult(r.result as string); onClose(); }; r.readAsDataURL(f); };
    const clickPaste = async () => { try { const items = await navigator.clipboard.read(); for (const item of items) { const t = item.types.find(x => x.startsWith('image/')); if (t) { const b = await item.getType(t); const r = new FileReader(); r.onload = () => { onImageResult(r.result as string); onClose(); }; r.readAsDataURL(b); return; } } setHint('Tidak ada gambar di clipboard'); } catch { setHint('Akses clipboard ditolak - coba Ctrl+V'); } };
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#18181B', borderRadius: 24, width: '100%', maxWidth: 520, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#4285F4,#34A853)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✦</div>
                        <div><div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Gemini AI — Magic Headline</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Generate efek teks via Gemini, paste hasilnya di sini</div></div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#4285F4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Langkah 1 — Copy Prompt & Buka Gemini</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 10, fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, maxHeight: 72, overflow: 'auto', wordBreak: 'break-word' }}>{prompt}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={copy} style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: copied ? '#22C55E' : 'rgba(255,255,255,0.08)', border: `1px solid ${copied ? '#22C55E' : 'rgba(255,255,255,0.1)'}`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{copied ? '✅ Copied!' : '📋 Copy Prompt'}</button>
                            <button onClick={() => window.open('https://gemini.google.com', '_blank')} style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: 'linear-gradient(135deg,#4285F4,#34A853)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🔗 Buka Gemini →</button>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#D4AF37', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Langkah 2 — Paste Hasil Gambar</div>
                        <div tabIndex={0} onPaste={handlePaste} onClick={clickPaste} style={{ width: '100%', minHeight: 90, borderRadius: 10, border: '2px dashed rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 5, outline: 'none' }}>
                            <div style={{ fontSize: 26 }}>📋</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Klik di sini lalu Ctrl+V</div>
                        </div>
                        {hint && <div style={{ marginTop: 7, fontSize: 11, color: '#f59e0b' }}>{hint}</div>}
                        <input ref={fRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                        <button onClick={() => fRef.current?.click()} style={{ marginTop: 9, width: '100%', padding: '7px 0', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📁 Upload file gambar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// === BG ERASER MODAL ===
interface BgEraserModalProps { onClose: () => void; onResult: (url: string) => void; initialUrl?: string; }
function BgEraserModal({ onClose, onResult, initialUrl }: BgEraserModalProps) {
    const [imgUrl, setImgUrl] = useState(initialUrl || '');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fRef = useRef<HTMLInputElement>(null);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setFile(f); setImgUrl(URL.createObjectURL(f)); setResult(''); };
    const erase = async () => { if (!imgUrl && !file) return; setProcessing(true); setError(''); try { const fd = new FormData(); if (file) fd.append('image_file', file); else fd.append('image_url', imgUrl); fd.append('size', 'auto'); const r = await fetch('https://api.remove.bg/v1.0/removebg', { method: 'POST', headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || 'DEMO' }, body: fd }); if (!r.ok) throw new Error('API error ' + r.status + ' — Tambahkan NEXT_PUBLIC_REMOVE_BG_API_KEY di .env.local'); const b = await r.blob(); const rd = new FileReader(); rd.onload = () => setResult(rd.result as string); rd.readAsDataURL(b); } catch (e: any) { setError(e.message); } finally { setProcessing(false); } };
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#18181B', borderRadius: 24, width: '100%', maxWidth: 540, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✂️</div>
                        <div><div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Background Eraser</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Hapus background foto otomatis dengan AI</div></div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
                        <input ref={fRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                        <button onClick={() => fRef.current?.click()} style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'rgba(124,58,237,0.1)', border: '1.5px dashed rgba(124,58,237,0.4)', color: '#A78BFA', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>📁 Upload Foto</button>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: 10 }}>— atau —</div>
                        <input type="text" value={imgUrl} placeholder="Paste URL gambar..." onChange={e => { setImgUrl(e.target.value); setFile(null); setResult(''); }} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '8px 12px', fontSize: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    {imgUrl && (
                        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 12 }}>
                            <div style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={imgUrl} alt="Original" style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }} /></div>
                            {result && <div style={{ borderRadius: 12, background: 'repeating-conic-gradient(#2a2a2a 0% 25%,#1a1a1a 0% 50%) 0 0/16px 16px', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={result} alt="Result" style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }} /></div>}
                        </div>
                    )}
                    {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>{error}</div>}
                    <div style={{ display: 'flex', gap: 10 }}>
                        {!result ? (
                            <button onClick={erase} disabled={processing || (!imgUrl && !file)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', opacity: processing ? 0.7 : 1 }}>
                                {processing ? '⏳ Memproses...' : '✂️ Hapus Background'}
                            </button>
                        ) : (
                            <>
                                <button onClick={() => setResult('')} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>↺ Ulangi</button>
                                <button onClick={() => { onResult(result); onClose(); }} style={{ flex: 2, padding: '11px 0', borderRadius: 12, background: 'linear-gradient(135deg,#22C55E,#16A34A)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>✅ Gunakan Gambar Ini</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// === MAIN FLYER KIT ===
interface FlyerKitProps { data: ItineraryPayload; }

export default function FlyerKit({ data }: FlyerKitProps) {
    const { brand, meta, days, highlights } = data;
    const primaryColor = brand.primaryColor || '#B8860B';
    const itineraryContext = `${meta.title}, ${meta.durationDays} hari ${meta.durationNights} malam, mulai ${meta.price}`;

    const [ratio, setRatio] = useState<FlyerRatio>(data.assets_config?.flyer_maker?.ratio || '4:5');
    const [schema, setSchema] = useState<DesignSchema | null>(data.assets_config?.flyer_maker?.schema || null);
    const [analyzing, setAnalyzing] = useState(false);
    const [referenceUrl, setReferenceUrl] = useState(data.assets_config?.flyer_maker?.referenceUrl || '');
    const [analyzeError, setAnalyzeError] = useState('');
    const [editedTexts, setEditedTexts] = useState<Record<string, string>>(data.assets_config?.flyer_maker?.editedTexts || {});
    const [editedImages, setEditedImages] = useState<Record<string, string>>(data.assets_config?.flyer_maker?.editedImages || {});
    const [sidebarTab, setSidebarTab] = useState<'style-transfer' | 'images' | 'texts' | 'brand'>('style-transfer');
    const [downloading, setDownloading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [magicHeadlineText, setMagicHeadlineText] = useState('');
    const [magicImageSrc, setMagicImageSrc] = useState('');
    const [headlineStyle] = useState<any>(null);
    const [showGeminiModal, setShowGeminiModal] = useState(false);
    const [showBgEraser, setShowBgEraser] = useState(false);
    const [bgEraserSlotId, setBgEraserSlotId] = useState('img-hero');
    const canvasRef = useRef<HTMLDivElement>(null);

    const geminiPrompt = `Ubah teks dalam gambar ini menjadi: "${magicHeadlineText || meta.title}". Pertahankan SEMUA gaya visual: warna, efek 3D, bayangan, stroke, dan tipografi IDENTIK. Hanya teks yang berubah.`;

    const { w, h } = FLYER_DIMS[ratio];
    const SCALE = Math.min(560 / h, 360 / w, 1);

    const S = {
        sL: { fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: 8, display: 'block' },
        inp: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px', fontSize: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' as const },
        card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, marginBottom: 12 } as React.CSSProperties,
        pill: (a: boolean) => ({ padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: a ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)', color: a ? '#D4AF37' : 'rgba(255,255,255,0.45)', marginBottom: 5, width: '100%', textAlign: 'left' as const, outline: a ? '1.5px solid rgba(212,175,55,0.4)' : 'none' }),
    };

    const applyAutoTexts = (ns: DesignSchema) => {
        const t: Record<string, string> = {};
        ns.textElements.forEach(el => {
            switch (el.role) {
                case 'headline': t[el.id] = meta.title; break;
                case 'subheadline': t[el.id] = meta.subtitle || `${meta.durationDays}H${meta.durationNights}M · All Inclusive`; break;
                case 'price': t[el.id] = `Mulai ${meta.price}`; break;
                case 'badge': t[el.id] = `${meta.durationDays}H${meta.durationNights}M`; break;
                case 'cta': t[el.id] = 'Hubungi Kami Sekarang!'; break;
                case 'brand': t[el.id] = brand.name; break;
                case 'body': t[el.id] = highlights.slice(0, 2).map(h => `✦ ${h.label}: ${h.value}`).join('  '); break;
            }
        });
        setEditedTexts(t);
    };
    const applyAutoImages = (ns: DesignSchema) => {
        const imgs: Record<string, string> = {};
        const hero = ns.imageSlots.find(s => s.role === 'hero');
        if (hero && (meta.coverImage || days[0]?.heroImage)) imgs[hero.id] = meta.coverImage || days[0]?.heroImage;
        ns.imageSlots.filter(s => s.role === 'secondary').forEach((slot, i) => { if (days[i + 1]?.heroImage) imgs[slot.id] = days[i + 1].heroImage; });
        setEditedImages(imgs);
    };

    const handleAnalyze = async () => {
        if (!referenceUrl.trim()) return;
        setAnalyzing(true); setAnalyzeError('');
        try {
            const res = await fetch('/api/flyer/analyze-design', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: referenceUrl, itineraryContext }) });
            const r = await res.json();
            if (r.schema) { setSchema(r.schema); applyAutoTexts(r.schema); applyAutoImages(r.schema); setSidebarTab('images'); if (r.error) setAnalyzeError(`AI fallback: ${r.error}`); }
            else setAnalyzeError('Gagal mendapatkan schema dari AI.');
        } catch (e: any) { setAnalyzeError(e.message); } finally { setAnalyzing(false); }
    };

    const useDefaultTemplate = () => {
        const ds: DesignSchema = {
            layoutType: 'full-bleed', colorPalette: { primary: primaryColor, secondary: '#1a1a1a', accent: '#D4AF37', background: '#0a0a0f', text: '#ffffff' },
            overlayStyle: 'gradient-bottom', overlayOpacity: 68, borderRadius: 'md', fontStyle: 'sans-serif',
            typography: { headingFont: 'Montserrat', bodyFont: 'Inter' },
            imageSlots: [
                { id: 'img-hero', role: 'hero', label: 'Hero Background', position: { area: 'full' }, aspectRatio: '4/5' },
                { id: 'img-2', role: 'secondary', label: 'Gambar 2', position: { area: 'bottom-left-third' }, aspectRatio: '1/1' },
                { id: 'img-3', role: 'secondary', label: 'Gambar 3', position: { area: 'bottom-center-third' }, aspectRatio: '1/1' },
                { id: 'img-4', role: 'secondary', label: 'Gambar 4', position: { area: 'bottom-right-third' }, aspectRatio: '1/1' },
            ],
            textElements: [
                { id: 'text-badge', role: 'badge', defaultText: `${meta.durationDays}H${meta.durationNights}M`, style: { fontSize: 'sm', fontWeight: 'extrabold', color: '#fff', align: 'left', position: 'top-left' } },
                { id: 'text-headline', role: 'headline', defaultText: meta.title, style: { fontSize: '3xl', fontWeight: 'black', color: '#ffffff', align: 'center', position: 'center' } },
                { id: 'text-sub', role: 'subheadline', defaultText: 'Paket All Inclusive', style: { fontSize: 'md', fontWeight: 'normal', color: 'rgba(255,255,255,0.8)', align: 'center', position: 'center-below-headline' } },
                { id: 'text-price', role: 'price', defaultText: `Mulai ${meta.price}`, style: { fontSize: 'xl', fontWeight: 'bold', color: primaryColor, align: 'center', position: 'bottom-center' } },
                { id: 'text-cta', role: 'cta', defaultText: 'Hubungi Kami Sekarang!', style: { fontSize: 'sm', fontWeight: 'bold', color: '#000', align: 'center', position: 'bottom-center' } },
            ],
            brandPosition: 'bottom-left', backgroundStyle: 'image', analysisConfidence: 100, description: 'Default template',
        };
        setSchema(ds); applyAutoTexts(ds); applyAutoImages(ds); setSidebarTab('images');
    };

    const handleSave = async () => {
        setSaving(true); setSaveStatus('idle');
        try {
            const r = await updateItineraryContent(data.id, { assets_config: { ...data.assets_config, flyer_maker: { ratio, schema, referenceUrl, editedTexts, editedImages } } });
            setSaveStatus(r.success ? 'success' : 'error');
            if (r.success) setTimeout(() => setSaveStatus('idle'), 3000);
        } catch { setSaveStatus('error'); } finally { setSaving(false); }
    };

    const handleDownload = async () => {
        if (!canvasRef.current || !schema) return;
        setDownloading(true);
        try {
            const h2c = (await import('html2canvas')).default;
            const el = canvasRef.current.querySelector('div') as HTMLElement;
            const canvas = await h2c(el, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: null });
            const a = document.createElement('a'); a.href = canvas.toDataURL('image/png');
            a.download = `${brand.name.replace(/\s+/g, '_')}_flyer_${ratio.replace(':', 'x')}.png`; a.click();
        } catch { alert('Download gagal.'); } finally { setDownloading(false); }
    };

    const TABS = [
        { id: 'style-transfer', icon: '🪄', label: 'Style' },
        { id: 'images', icon: '🖼️', label: 'Foto' },
        { id: 'texts', icon: '✏️', label: 'Teks' },
        { id: 'brand', icon: '✦', label: 'Brand' },
    ] as const;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#111113', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>

            {showGeminiModal && <GeminiModal prompt={geminiPrompt} onClose={() => setShowGeminiModal(false)} onImageResult={(src) => { setMagicImageSrc(src); setShowGeminiModal(false); }} />}
            {showBgEraser && <BgEraserModal initialUrl={editedImages[bgEraserSlotId] || ''} onClose={() => setShowBgEraser(false)} onResult={(url) => setEditedImages(p => ({ ...p, [bgEraserSlotId]: url }))} />}

            {/* Topbar */}
            <div style={{ background: '#1C1C1F', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#B8860B,#D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Flyer Studio</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37', background: 'rgba(212,175,55,0.12)', padding: '2px 8px', borderRadius: 5 }}>PRO</span>
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2 }}>
                    {(['4:5', '9:16'] as FlyerRatio[]).map(r => (
                        <button key={r} onClick={() => setRatio(r)} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', color: ratio === r ? '#1a1a1a' : 'rgba(255,255,255,0.4)', background: ratio === r ? '#D4AF37' : 'transparent' }}>
                            {r === '4:5' ? '▭ Feed' : '▯ Story'}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 9, border: `1px solid ${saveStatus === 'success' ? '#22C55E' : 'rgba(255,255,255,0.12)'}`, background: saveStatus === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', color: saveStatus === 'success' ? '#22C55E' : 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {saving ? <Loader2 size={13} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 size={13} /> : <Save size={13} />}
                    {saving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save'}
                </button>
                {schema && (
                    <button onClick={handleDownload} disabled={downloading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                        {downloading ? '⏳' : '⬇'} Export PNG
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Canvas Area */}
                <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 32px', gap: 20, background: 'repeating-conic-gradient(rgba(255,255,255,0.025) 0% 25%, transparent 0% 50%) 0 0/24px 24px' }}>
                    {!schema ? (
                        <div style={{ maxWidth: 460, width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                            <div style={{ textAlign: 'center', marginBottom: 4 }}>
                                <div style={{ fontSize: 34, marginBottom: 6 }}>🎨</div>
                                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Flyer Studio Pro</h2>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 5 }}>Pilih cara memulai desain</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#B8860B,#D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🪄</div>
                                    <div><div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>AI Style Transfer</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Paste URL referensi — AI clone design-nya</div></div>
                                </div>
                                <input type="text" value={referenceUrl} placeholder="https://i.pinimg.com/... atau URL gambar" style={{ ...S.inp, marginBottom: 10 }} onChange={e => setReferenceUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
                                <button onClick={handleAnalyze} disabled={analyzing || !referenceUrl.trim()} style={{ width: '100%', padding: '10px 0', borderRadius: 10, background: 'linear-gradient(135deg,#B8860B,#D4AF37)', border: 'none', color: '#000', fontSize: 13, fontWeight: 800, cursor: 'pointer', opacity: analyzing ? 0.7 : 1 }}>
                                    {analyzing ? '🤖 Menganalisa...' : '🪄 Analisa & Clone Style'}
                                </button>
                                {analyzeError && <div style={{ marginTop: 8, fontSize: 11, color: '#f87171', background: 'rgba(248,113,113,0.1)', borderRadius: 7, padding: '6px 10px' }}>⚠️ {analyzeError}</div>}
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🗂</div>
                                    <div><div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Template Cepat</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Mulai dari template siap pakai</div></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                                    {[{ label: 'Full Bleed', icon: '🌅' }, { label: 'Grid', icon: '⊞' }, { label: 'Minimal', icon: '◻' }].map(t => (
                                        <button key={t.label} onClick={useDefaultTemplate} style={{ padding: '12px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                            <span style={{ fontSize: 20 }}>{t.icon}</span><span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={useDefaultTemplate} style={{ width: '100%', padding: '11px 0', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Blank Canvas</button>
                        </div>
                    ) : (
                        <>
                            <div ref={canvasRef} style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.6))' }}>
                                <FlyerCanvas schema={schema} brand={brand} ratio={ratio} editedTexts={editedTexts} editedImages={editedImages} scale={SCALE} headlineStyle={headlineStyle} magicImageSrc={magicImageSrc} />
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', borderRadius: 7, padding: '4px 12px' }}>{FLYER_DIMS[ratio].label}</span>
                                {schema.analysisConfidence > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', borderRadius: 7, padding: '4px 12px' }}>🤖 AI {schema.analysisConfidence}%</span>}
                                <button onClick={() => { setSchema(null); setReferenceUrl(''); }} style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Ganti Desain</button>
                            </div>
                        </>
                    )}
                </div>

                {/* Dark Sidebar */}
                <aside style={{ width: 300, flexShrink: 0, background: '#1C1C1F', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', background: '#111113', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setSidebarTab(t.id)} style={{ flex: 1, padding: '11px 4px 9px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 10, fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, borderBottom: `2px solid ${sidebarTab === t.id ? '#D4AF37' : 'transparent'}`, color: sidebarTab === t.id ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}>
                                <span style={{ fontSize: 15 }}>{t.icon}</span>{t.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

                        {/* Style Tab */}
                        {sidebarTab === 'style-transfer' && (
                            <>
                                <div style={S.card}>
                                    <span style={S.sL}>🔗 URL Referensi</span>
                                    <input type="text" value={referenceUrl} placeholder="Paste URL..." style={{ ...S.inp, marginBottom: 8 }} onChange={e => setReferenceUrl(e.target.value)} />
                                    <button onClick={handleAnalyze} disabled={analyzing || !referenceUrl.trim()} style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>
                                        {analyzing ? '🤖 Menganalisa...' : '🪄 Analisa Style'}
                                    </button>
                                </div>
                                <button onClick={useDefaultTemplate} style={{ width: '100%', padding: '8px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>Gunakan Template Default</button>
                                {schema && (
                                    <>
                                        <div style={S.card}>
                                            <span style={S.sL}>🎨 Palet Warna</span>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {Object.entries(schema.colorPalette).map(([k, v]) => (
                                                    <div key={k} title={`${k}: ${v}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                                        <div style={{ width: 34, height: 34, borderRadius: 9, background: v, border: '1.5px solid rgba(255,255,255,0.1)' }} />
                                                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>{k}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={S.card}>
                                            <span style={S.sL}>🔲 Overlay — {schema.overlayOpacity}%</span>
                                            <input type="range" min={0} max={95} step={5} value={schema.overlayOpacity} onChange={e => setSchema({ ...schema, overlayOpacity: +e.target.value })} style={{ width: '100%', accentColor: '#D4AF37', marginTop: 4 }} />
                                        </div>
                                        <div style={S.card}>
                                            <span style={S.sL}>🔤 Font Style</span>
                                            {(['serif', 'sans-serif', 'display', 'mono'] as const).map(fs => (
                                                <button key={fs} onClick={() => setSchema({ ...schema, fontStyle: fs })} style={S.pill(schema.fontStyle === fs)}>
                                                    {fs === 'serif' ? 'Serif — Elegan' : fs === 'sans-serif' ? 'Sans-Serif — Modern' : fs === 'display' ? 'Display — Impactful' : 'Mono — Tech'}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Images Tab */}
                        {sidebarTab === 'images' && schema && (
                            <>
                                <button onClick={() => { setBgEraserSlotId('img-hero'); setShowBgEraser(true); }} style={{ width: '100%', padding: '10px', borderRadius: 11, background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(236,72,153,0.2))', border: '1px solid rgba(124,58,237,0.3)', color: '#C4B5FD', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
                                    ✂️ Background Eraser
                                </button>
                                {schema.imageSlots.map(slot => (
                                    <div key={slot.id} style={S.card}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <div style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: `1.5px dashed ${editedImages[slot.id] ? '#D4AF37' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {editedImages[slot.id] ? <img src={editedImages[slot.id]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🖼️</span>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{slot.role === 'hero' ? '⭐ ' : ''}{slot.label}</div>
                                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{editedImages[slot.id] ? '✓ Dipilih' : 'Belum ada'}</div>
                                            </div>
                                            {editedImages[slot.id] && (
                                                <button onClick={() => { setBgEraserSlotId(slot.id); setShowBgEraser(true); }} style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', fontSize: 12, cursor: 'pointer' }}>✂</button>
                                            )}
                                        </div>
                                        <ImageSlotEditor slot={slot} currentUrl={editedImages[slot.id] || ''} onUpdate={url => setEditedImages(p => ({ ...p, [slot.id]: url }))} primaryColor={primaryColor} />
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Texts Tab */}
                        {sidebarTab === 'texts' && schema && (
                            <>
                                <div style={{ ...S.card, background: 'linear-gradient(135deg,rgba(66,133,244,0.08),rgba(52,168,83,0.06))', border: '1px solid rgba(66,133,244,0.2)' }}>
                                    <span style={{ ...S.sL, color: '#60A5FA' }}>🪄 Magic Headline (Gemini)</span>
                                    <input type="text" value={magicHeadlineText || (editedTexts['text-headline'] ?? meta.title)} placeholder={meta.title} style={{ ...S.inp, marginBottom: 8 }} onChange={e => setMagicHeadlineText(e.target.value)} />
                                    <button onClick={() => setShowGeminiModal(true)} style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: 'linear-gradient(135deg,#4285F4,#34A853)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 6 }}>✦ Buka Gemini AI Modal</button>
                                    {magicImageSrc && (
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <img src={magicImageSrc} alt="magic" style={{ width: 48, height: 28, objectFit: 'contain', borderRadius: 5, background: '#000' }} />
                                            <button onClick={() => setMagicImageSrc('')} style={{ fontSize: 10, color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕ Hapus</button>
                                        </div>
                                    )}
                                </div>
                                {schema.textElements.map(el => (
                                    <div key={el.id} style={S.card}>
                                        <span style={S.sL}>{el.role === 'headline' ? '🔤' : el.role === 'price' ? '💰' : el.role === 'badge' ? '🏷️' : el.role === 'cta' ? '🎯' : '✏️'} {el.role}</span>
                                        {el.role === 'body'
                                            ? <textarea value={editedTexts[el.id] ?? el.defaultText} rows={3} style={{ ...S.inp, resize: 'vertical', lineHeight: 1.5 }} onChange={e => setEditedTexts(p => ({ ...p, [el.id]: e.target.value }))} />
                                            : <input type="text" value={editedTexts[el.id] ?? el.defaultText} style={S.inp} onChange={e => setEditedTexts(p => ({ ...p, [el.id]: e.target.value }))} />}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Brand Tab */}
                        {sidebarTab === 'brand' && (
                            <>
                                <div style={S.card}>
                                    <span style={S.sL}>✦ Brand Profile</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                        {brand.logoUrl && <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={brand.logoUrl} alt={brand.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} /></div>}
                                        <div><div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{brand.name}</div>{brand.tagline && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{brand.tagline}</div>}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: brand.primaryColor || '#B8860B', border: '1.5px solid rgba(255,255,255,0.15)' }} />
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: brand.secondaryColor || '#1a1a1a', border: '1.5px solid rgba(255,255,255,0.15)' }} />
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginLeft: 4 }}>{brand.primaryColor}</div>
                                    </div>
                                </div>
                                <div style={S.card}>
                                    <span style={S.sL}>ℹ️ Itinerary</span>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.9 }}>
                                        <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>Judul:</span> {meta.title}</div>
                                        <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>Durasi:</span> {meta.durationDays}H {meta.durationNights}M</div>
                                        <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>Harga:</span> {meta.price}</div>
                                        {brand.whatsapp && <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>WA:</span> {brand.whatsapp}</div>}
                                    </div>
                                </div>
                            </>
                        )}

                        {sidebarTab !== 'style-transfer' && sidebarTab !== 'brand' && !schema && (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Analisa design dulu di tab Style 🪄</div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

