'use client';

import { useState, useEffect } from 'react';
import type { ItineraryPayload } from '@/types/itinerary';
import StatusControl from './StatusControl';
import {
    Settings, LayoutTemplate, Wand2, Type, Palette, Video, PenTool,
    Save, CheckCircle2, AlertCircle, Loader2, ChevronDown, Plus, Trash2, BookMarked,
    Users2, Image as ImageIcon, Star
} from 'lucide-react';
import { updateItineraryContent, reStyleItinerary, saveThemePreset, getThemePresets } from '../actions';

interface EditorSidebarProps {
    itinerary: ItineraryPayload;
    previewUrl: string;
    onUpdate: (updatedData: ItineraryPayload) => void;
}

type TabType = 'qc' | 'content' | 'theme' | 'ai';

const FONT_PAIRINGS = [
    { name: 'Classic Luxury', fonts: 'Playfair Display & Lato', heading: 'Playfair Display', body: 'Lato' },
    { name: 'Editorial', fonts: 'Cormorant & Montserrat', heading: 'Cormorant Garamond', body: 'Montserrat' },
    { name: 'Modern Minimal', fonts: 'Inter & Inter', heading: 'Inter', body: 'Inter' },
    { name: 'Boutique', fonts: 'Bodoni Moda & Space Grotesk', heading: 'Bodoni Moda', body: 'Space Grotesk' },
    { name: 'Heritage', fonts: 'Libre Baskerville & Source Sans', heading: 'Libre Baskerville', body: 'Source Sans 3' },
    { name: 'Contemporary', fonts: 'DM Serif & DM Sans', heading: 'DM Serif Display', body: 'DM Sans' },
    { name: 'Cinematic', fonts: 'Bebas Neue & Nunito', heading: 'Bebas Neue', body: 'Nunito' },
    { name: 'Romantic', fonts: 'Great Vibes & Lora', heading: 'Great Vibes', body: 'Lora' },
    { name: 'Geometric', fonts: 'Oswald & Open Sans', heading: 'Oswald', body: 'Open Sans' },
    { name: 'Prestige', fonts: 'Yeseva One & Josefin Sans', heading: 'Yeseva One', body: 'Josefin Sans' },
    { name: 'Urban', fonts: 'Anton & Roboto', heading: 'Anton', body: 'Roboto' },
    { name: 'Soft Luxury', fonts: 'Didact Gothic & Raleway', heading: 'Didact Gothic', body: 'Raleway' },
    { name: 'Nature', fonts: 'Merriweather & Lato', heading: 'Merriweather', body: 'Lato' },
    { name: 'Tech', fonts: 'Exo 2 & IBM Plex Sans', heading: 'Exo 2', body: 'IBM Plex Sans' },
    { name: 'Umroh Classic', fonts: 'Amiri & Noto Sans', heading: 'Amiri', body: 'Noto Sans' },
];

const COLOR_VIBES = [
    { name: 'Midnight Gold', primary: '#D4AF37', secondary: '#000000' },
    { name: 'Ocean Mist', primary: '#38BDF8', secondary: '#0F172A' },
    { name: 'Desert Sand', primary: '#D97706', secondary: '#FDFBF7' },
    { name: 'Forest Noir', primary: '#34D399', secondary: '#022C22' },
    { name: 'Rose Pearl', primary: '#F472B6', secondary: '#1F0F14' },
    { name: 'Royal Indigo', primary: '#818CF8', secondary: '#0F0A2E' },
    { name: 'Ember', primary: '#F97316', secondary: '#1C0A00' },
    { name: 'Arctic', primary: '#67E8F9', secondary: '#F0FAFA' },
];

export default function EditorSidebar({ itinerary: data, previewUrl, onUpdate }: EditorSidebarProps) {
    const [activeTab, setActiveTab] = useState<TabType>('qc');
    const [saving, setSaving] = useState(false);
    const [restyling, setRestyling] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [openSection, setOpenSection] = useState<string | number>('meta');
    const [presets, setPresets] = useState<any[]>([]);
    const [savingPreset, setSavingPreset] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [showPresetInput, setShowPresetInput] = useState(false);
    const [showPresets, setShowPresets] = useState(false);

    useEffect(() => { getThemePresets().then(setPresets); }, []);

    const toggleSection = (key: string | number) => setOpenSection(prev => prev === key ? '' : key);

    const handleReStyle = async () => {
        setRestyling(true);
        try {
            const result = await reStyleItinerary(data.id, data.language, data.style);
            if (result.success && result.data) {
                onUpdate({
                    ...data, ...result.data, active_version: 'personalized',
                    days: result.data.days.map((day: any, i: number) => ({
                        ...day,
                        heroImage: data.days[i]?.heroImage || day.heroImage || '',
                        activities: day.activities.map((act: any) => ({ ...act, iconCategory: act.iconCategory || 'activity' }))
                    })),
                    hotels: result.data.hotels?.map((h: any, i: number) => ({ ...h, imageUrl: data.hotels?.[i]?.imageUrl || '' })) || []
                });
            } else { alert('AI re-styling failed: ' + result.error); }
        } catch { alert('An error occurred during re-styling.'); } finally { setRestyling(false); }
    };

    const handleSave = async () => {
        setSaving(true); setSaveStatus('idle');
        try {
            const result = await updateItineraryContent(data.id, {
                theme: data.theme, meta: data.meta, highlights: data.highlights,
                itinerary_summary: data.itinerarySummary, inclusions: data.inclusions,
                exclusions: data.exclusions, terms_and_conditions: data.termsAndConditions,
                days: data.days, hotels: data.hotels, brand: data.brand,
                language: data.language, style: data.style, active_version: data.active_version,
                content_original: data.content_original, content_personalized: data.content_personalized,
                font_pairing: data.fontPairing,
                testimonials: data.testimonials,
                gallery: data.gallery,
                departure_periods: data.departurePeriods,
                whatsapp_config: data.whatsappConfig,
            });
            if (result.success) { setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); }
            else setSaveStatus('error');
        } catch { setSaveStatus('error'); } finally { setSaving(false); }
    };

    const handleSavePreset = async () => {
        if (!presetName.trim()) return;
        setSavingPreset(true);
        try {
            const result = await saveThemePreset({
                name: presetName, theme: data.theme,
                coverTextSettings: data.coverTextSettings || {},
                fontPairing: data.fontPairing || 'Classic Luxury',
                primaryColor: data.brand.primaryColor,
                secondaryColor: data.brand.secondaryColor,
            });
            if (result.success) {
                setPresets(await getThemePresets());
                setPresetName(''); setShowPresetInput(false);
            }
        } finally { setSavingPreset(false); }
    };

    const handleApplyPreset = (preset: any) => {
        onUpdate({
            ...data, theme: preset.theme, fontPairing: preset.font_pairing,
            coverTextSettings: preset.cover_text_settings || data.coverTextSettings,
            brand: { ...data.brand, primaryColor: preset.primary_color, secondaryColor: preset.secondary_color },
        });
        setShowPresets(false);
    };

    const tabStyle = (isActive: boolean) => ({
        flex: 1, padding: '14px 0', fontSize: 11, fontWeight: 700 as const,
        letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        cursor: 'pointer', border: 'none', background: 'transparent',
        color: isActive ? '#B8860B' : 'rgba(0,0,0,0.35)',
        borderBottom: isActive ? '2px solid #B8860B' : '2px solid transparent',
        transition: 'all 0.2s',
    });

    const cardStyle = {
        background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    };

    const labelStyle = {
        fontSize: 10, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' as const,
        letterSpacing: '0.15em', marginBottom: 8, display: 'block',
    };

    const inputStyle = {
        width: '100%', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1a1a1a', outline: 'none',
    };

    // --- Sub-components for Content Tab ---
    const AccordionHeader = ({ sectionKey, label, badge }: { sectionKey: string | number, label: string, badge?: string }) => (
        <button onClick={() => toggleSection(sectionKey)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: openSection === sectionKey ? 'rgba(184,134,11,0.06)' : '#fff',
            border: `1px solid ${openSection === sectionKey ? 'rgba(184,134,11,0.3)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {badge && <span style={{ background: 'rgba(184,134,11,0.15)', color: '#B8860B', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.1em' }}>{badge}</span>}
                <span style={{ fontSize: 12, fontWeight: 700, color: openSection === sectionKey ? '#B8860B' : 'rgba(0,0,0,0.75)' }}>{label}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'rgba(0,0,0,0.35)', transform: openSection === sectionKey ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>
    );

    const ListEditor = ({ items, onChange }: { items: string[], onChange: (v: string[]) => void }) => (
        <div>
            {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <input type="text" value={item} style={{ ...inputStyle, flex: 1, fontSize: 12 }}
                        onChange={e => { const n = [...items]; n[idx] = e.target.value; onChange(n); }} />
                    <button onClick={() => onChange(items.filter((_, i) => i !== idx))}
                        style={{ padding: '0 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={12} />
                    </button>
                </div>
            ))}
            <button onClick={() => onChange([...items, ''])}
                style={{ width: '100%', padding: '7px 0', borderRadius: 8, cursor: 'pointer', border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', color: 'rgba(0,0,0,0.4)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Plus size={12} /> Add Item
            </button>
        </div>
    );

    return (
        <aside style={{
            display: 'flex', flexDirection: 'column', height: '100%',
            maxHeight: 'calc(100vh - 73px)', position: 'sticky', top: 73,
            background: '#FAFAFA', borderLeft: '1px solid rgba(0,0,0,0.08)', zIndex: 40,
        }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <button onClick={() => setActiveTab('qc')} style={tabStyle(activeTab === 'qc')}><Settings size={13} /> QC</button>
                <button onClick={() => setActiveTab('content')} style={tabStyle(activeTab === 'content')}><PenTool size={13} /> Content</button>
                <button onClick={() => setActiveTab('theme')} style={tabStyle(activeTab === 'theme')}><LayoutTemplate size={13} /> Theme</button>
                <button onClick={() => setActiveTab('ai')} style={tabStyle(activeTab === 'ai')}><Wand2 size={13} /> AI</button>
            </div>

            {/* Scrollable Tab Content */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* ─── QC TAB ─── */}
                {activeTab === 'qc' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <StatusControl itineraryId={data.id} currentStatus="pending" previewUrl={previewUrl} />
                        <div style={cardStyle}>
                            <div style={labelStyle}>Trip Details</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div><div style={{ ...labelStyle, marginBottom: 4 }}>Duration</div><div style={{ fontSize: 15, fontWeight: 600 }}>{data.meta.durationDays}D / {data.meta.durationNights}N</div></div>
                                <div><div style={{ ...labelStyle, marginBottom: 4 }}>Group Size</div><div style={{ fontSize: 15 }}>{data.meta.groupSize}</div></div>
                                <div><div style={{ ...labelStyle, marginBottom: 4 }}>Price</div><div style={{ fontSize: 15, color: '#D4AF37', fontWeight: 700 }}>{data.meta.price}</div></div>
                                <div><div style={{ ...labelStyle, marginBottom: 4 }}>Theme</div><div style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', background: 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: 8, display: 'inline-block' }}>{data.theme}</div></div>
                            </div>
                        </div>
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}><Palette size={11} style={{ color: '#B8860B' }} /> Brand Profile</div>
                            <div style={{ marginBottom: 12 }}>
                                <div style={labelStyle}>Logo URL</div>
                                <input type="text" value={data.brand.logoUrl || ''} style={{ ...inputStyle, marginBottom: 8 }} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, logoUrl: e.target.value } })} />
                                {data.brand.logoUrl && <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}><img src={data.brand.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                            </div>
                            <div style={{ marginBottom: 10 }}><div style={labelStyle}>WhatsApp</div><input type="text" value={data.brand.whatsapp || ''} style={inputStyle} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, whatsapp: e.target.value } })} /></div>
                            <div style={{ marginBottom: 10 }}><div style={labelStyle}>Email</div><input type="email" value={data.brand.email || ''} style={inputStyle} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, email: e.target.value } })} /></div>
                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={labelStyle}>Brand Colors</div>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ ...labelStyle, marginBottom: 8 }}>Primary</div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input type="color" value={data.brand.primaryColor || '#D4AF37'} style={{ width: 50, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer' }} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, primaryColor: e.target.value } })} />
                                        <input type="text" value={data.brand.primaryColor || '#D4AF37'} style={{ ...inputStyle, flex: 1, fontSize: 11, fontFamily: 'monospace' }} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, primaryColor: e.target.value } })} />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ ...labelStyle, marginBottom: 8 }}>Secondary</div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input type="color" value={data.brand.secondaryColor || '#0a0a0a'} style={{ width: 50, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer' }} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, secondaryColor: e.target.value } })} />
                                        <input type="text" value={data.brand.secondaryColor || '#0a0a0a'} style={{ ...inputStyle, flex: 1, fontSize: 11, fontFamily: 'monospace' }} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, secondaryColor: e.target.value } })} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={labelStyle}>Social Links</div>
                                <div style={{ marginBottom: 10 }}><div style={labelStyle}>Instagram</div><input type="text" value={data.brand.instagram || ''} style={{ ...inputStyle, fontSize: 11 }} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, instagram: e.target.value } })} /></div>
                                <div style={{ marginBottom: 10 }}><div style={labelStyle}>TikTok</div><input type="text" value={data.brand.tiktok || ''} style={{ ...inputStyle, fontSize: 11 }} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, tiktok: e.target.value } })} /></div>
                                <div style={{ marginBottom: 10 }}><div style={labelStyle}>Facebook</div><input type="text" value={data.brand.facebook || ''} style={{ ...inputStyle, fontSize: 11 }} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, facebook: e.target.value } })} /></div>
                                <div style={{ marginBottom: 10 }}><div style={labelStyle}>Website</div><input type="text" value={data.brand.website || ''} style={{ ...inputStyle, fontSize: 11 }} onChange={(e) => onUpdate({ ...data, brand: { ...data.brand, website: e.target.value } })} /></div>
                            </div>

                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Multiple WhatsApp</span>
                                    <button onClick={() => onUpdate({ ...data, whatsappConfig: { ...data.whatsappConfig, enabled: !data.whatsappConfig?.enabled, numbers: data.whatsappConfig?.numbers || [] } })}
                                        style={{ padding: '2px 8px', borderRadius: 12, fontSize: 9, fontWeight: 700, border: 'none', cursor: 'pointer', background: data.whatsappConfig?.enabled ? '#16a34a' : 'rgba(0,0,0,0.1)', color: '#fff' }}>
                                        {data.whatsappConfig?.enabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                {data.whatsappConfig?.enabled && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                        {(data.whatsappConfig.numbers || []).map((num, idx) => (
                                            <div key={idx} style={{ background: '#F5F5F7', padding: 8, borderRadius: 10, border: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
                                                <button onClick={() => onUpdate({ ...data, whatsappConfig: { ...data.whatsappConfig!, numbers: data.whatsappConfig!.numbers.filter((_, i) => i !== idx) } })}
                                                    style={{ position: 'absolute', top: 6, right: 6, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={10} /></button>
                                                <input type="text" value={num.label} placeholder="Label (e.g. Sales)" style={{ ...inputStyle, fontSize: 11, marginBottom: 4, padding: '4px 8px' }} onChange={e => {
                                                    const numbers = [...data.whatsappConfig!.numbers]; numbers[idx] = { ...num, label: e.target.value };
                                                    onUpdate({ ...data, whatsappConfig: { ...data.whatsappConfig!, numbers } });
                                                }} />
                                                <input type="text" value={num.number} placeholder="62812..." style={{ ...inputStyle, fontSize: 11, padding: '4px 8px' }} onChange={e => {
                                                    const numbers = [...data.whatsappConfig!.numbers]; numbers[idx] = { ...num, number: e.target.value };
                                                    onUpdate({ ...data, whatsappConfig: { ...data.whatsappConfig!, numbers } });
                                                }} />
                                            </div>
                                        ))}
                                        <button onClick={() => onUpdate({ ...data, whatsappConfig: { enabled: true, numbers: [...(data.whatsappConfig?.numbers || []), { label: '', number: '' }] } })}
                                            style={{ width: '100%', padding: '6px 0', borderRadius: 8, cursor: 'pointer', border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', color: 'rgba(0,0,0,0.4)', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                            <Plus size={12} /> Add WhatsApp Number
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── CONTENT TAB ─── */}
                {activeTab === 'content' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* 1. Cover & Trip */}
                        <AccordionHeader sectionKey="meta" label="Cover & Trip Info" badge="COVER" />
                        {openSection === 'meta' && (
                            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={labelStyle}>Cover Image URL</div>
                                    <input type="text" value={data.meta.coverImage || ''} style={inputStyle} onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, coverImage: e.target.value } })} />
                                    {data.meta.coverImage && <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', background: '#E8E8EC' }}><img src={data.meta.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>}
                                </div>
                                <div><div style={labelStyle}>Title</div><input type="text" value={data.meta.title} style={inputStyle} onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, title: e.target.value } })} /></div>
                                <div><div style={labelStyle}>Subtitle</div><input type="text" value={data.meta.subtitle} style={inputStyle} onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, subtitle: e.target.value } })} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div><div style={labelStyle}>Days</div><input type="number" value={data.meta.durationDays} style={inputStyle} onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, durationDays: Number(e.target.value) } })} /></div>
                                    <div><div style={labelStyle}>Nights</div><input type="number" value={data.meta.durationNights} style={inputStyle} onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, durationNights: Number(e.target.value) } })} /></div>
                                    <div><div style={labelStyle}>Start Date</div><input type="text" value={data.meta.startDate || ''} style={inputStyle} onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, startDate: e.target.value } })} /></div>
                                    <div><div style={labelStyle}>End Date</div><input type="text" value={data.meta.endDate || ''} style={inputStyle} onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, endDate: e.target.value } })} /></div>
                                    <div><div style={labelStyle}>Group Size</div><input type="text" value={data.meta.groupSize || ''} style={inputStyle} onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, groupSize: e.target.value } })} /></div>
                                </div>
                            </div>
                        )}

                        {/* 2. Itin */}
                        {data.days.map((day, i) => (
                            <div key={i}>
                                <AccordionHeader sectionKey={i} label={day.location || `Day ${day.dayNumber}`} badge={`DAY ${day.dayNumber}`} />
                                {openSection === i && (
                                    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div>
                                            <div style={labelStyle}>Hero Image URL</div>
                                            <input type="text" value={day.heroImage || ''} style={inputStyle} onChange={(e) => { const n = [...data.days]; n[i] = { ...day, heroImage: e.target.value }; onUpdate({ ...data, days: n }); }} />
                                            {day.heroImage && <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9' }}><img src={day.heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                                        </div>
                                        <div><div style={labelStyle}>Title</div><input type="text" value={day.title} style={inputStyle} onChange={(e) => { const n = [...data.days]; n[i] = { ...day, title: e.target.value }; onUpdate({ ...data, days: n }); }} /></div>
                                        <div><div style={labelStyle}>Location</div><input type="text" value={day.location} style={inputStyle} onChange={(e) => { const n = [...data.days]; n[i] = { ...day, location: e.target.value }; onUpdate({ ...data, days: n }); }} /></div>
                                        <div><div style={labelStyle}>Summary</div><textarea value={day.summary} rows={3} style={{ ...inputStyle, resize: 'vertical' }} onChange={(e) => { const n = [...data.days]; n[i] = { ...day, summary: e.target.value }; onUpdate({ ...data, days: n }); }} /></div>
                                        <div>
                                            <div style={labelStyle}>YouTube Video URL / ID</div>
                                            <div style={{ position: 'relative' }}>
                                                <Video size={13} style={{ position: 'absolute', left: 12, top: 12, color: 'rgba(0,0,0,0.25)', pointerEvents: 'none' }} />
                                                <input type="text" value={day.videoUrl || ''} placeholder="Paste YouTube URL or ID" style={{ ...inputStyle, paddingLeft: 34 }} onChange={(e) => {
                                                    let val = e.target.value;
                                                    const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
                                                    if (match) val = match[1];
                                                    const n = [...data.days]; n[i] = { ...day, videoUrl: val }; onUpdate({ ...data, days: n });
                                                }} />
                                            </div>
                                            {day.videoUrl && day.videoUrl.length >= 11 && (
                                                <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', background: '#111' }}>
                                                    <img src={`https://img.youtube.com/vi/${day.videoUrl}/hqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <span>Activities ({day.activities.length})</span>
                                                <button onClick={() => { const n = [...data.days]; n[i] = { ...day, activities: [...day.activities, { time: '', title: 'New Activity', description: '', iconCategory: 'activity' as const }] }; onUpdate({ ...data, days: n }); }}
                                                    style={{ background: 'rgba(184,134,11,0.12)', border: '1px solid rgba(184,134,11,0.3)', color: '#B8860B', fontSize: 10, padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}>+ Add</button>
                                            </div>
                                            {day.activities.map((act, j) => (
                                                <div key={j} style={{ background: '#F0F0F2', padding: '10px 12px', borderRadius: 10, marginBottom: 6, border: '1px solid rgba(0,0,0,0.06)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                        <input type="text" value={act.time} placeholder="Time" style={{ ...inputStyle, width: 80, padding: '4px 8px', fontSize: 11, color: '#B8860B', background: 'transparent', border: '1px solid rgba(184,134,11,0.25)' }}
                                                            onChange={(e) => { const nd = [...data.days]; const na = [...day.activities]; na[j] = { ...act, time: e.target.value }; nd[i] = { ...day, activities: na }; onUpdate({ ...data, days: nd }); }} />
                                                        <button onClick={() => { const nd = [...data.days]; nd[i] = { ...day, activities: day.activities.filter((_, idx) => idx !== j) }; onUpdate({ ...data, days: nd }); }}
                                                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 9, padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}>✕</button>
                                                    </div>
                                                    <input type="text" value={act.title} placeholder="Activity title" style={{ ...inputStyle, marginBottom: 6, padding: '6px 8px', fontSize: 12 }}
                                                        onChange={(e) => { const nd = [...data.days]; const na = [...day.activities]; na[j] = { ...act, title: e.target.value }; nd[i] = { ...day, activities: na }; onUpdate({ ...data, days: nd }); }} />
                                                    <textarea value={act.description} placeholder="Description..." rows={2} style={{ ...inputStyle, padding: '6px 8px', fontSize: 11, resize: 'vertical' }}
                                                        onChange={(e) => { const nd = [...data.days]; const na = [...day.activities]; na[j] = { ...act, description: e.target.value }; nd[i] = { ...day, activities: na }; onUpdate({ ...data, days: nd }); }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* 3. Periode Keberangkatan */}
                        <AccordionHeader sectionKey="periods" label="Periode Keberangkatan" badge="NEW" />
                        {openSection === 'periods' && (
                            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={labelStyle}>Enable Section</span>
                                    <button onClick={() => onUpdate({ ...data, departurePeriods: { ...data.departurePeriods, enabled: !data.departurePeriods?.enabled, items: data.departurePeriods?.items || [] } })}
                                        style={{ padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', background: data.departurePeriods?.enabled ? '#16a34a' : 'rgba(0,0,0,0.1)', color: '#fff' }}>
                                        {data.departurePeriods?.enabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                {(data.departurePeriods?.items || []).map((p, idx) => (
                                    <div key={idx} style={{ background: '#F5F5F7', padding: 10, borderRadius: 10, border: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
                                        <button onClick={() => onUpdate({ ...data, departurePeriods: { ...data.departurePeriods!, items: data.departurePeriods!.items.filter((_, i) => i !== idx) } })}
                                            style={{ position: 'absolute', top: 6, right: 6, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                            <div>
                                                <div style={labelStyle}>Date</div>
                                                <input type="text" value={p.date} placeholder="e.g. 12-20 Okt" style={{ ...inputStyle, fontSize: 11 }} onChange={e => {
                                                    const items = [...data.departurePeriods!.items]; items[idx] = { ...p, date: e.target.value };
                                                    onUpdate({ ...data, departurePeriods: { ...data.departurePeriods!, items } });
                                                }} />
                                            </div>
                                            <div>
                                                <div style={labelStyle}>Price (Opt)</div>
                                                <input type="text" value={p.price || ''} placeholder="e.g. 25jt" style={{ ...inputStyle, fontSize: 11 }} onChange={e => {
                                                    const items = [...data.departurePeriods!.items]; items[idx] = { ...p, price: e.target.value };
                                                    onUpdate({ ...data, departurePeriods: { ...data.departurePeriods!, items } });
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => onUpdate({ ...data, departurePeriods: { enabled: true, items: [...(data.departurePeriods?.items || []), { date: '' }] } })}
                                    style={{ width: '100%', padding: '8px 0', borderRadius: 10, cursor: 'pointer', border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', color: 'rgba(0,0,0,0.4)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <Plus size={14} /> Add Period
                                </button>
                            </div>
                        )}

                        {/* 4. Harga */}
                        <AccordionHeader sectionKey="price" label="Harga & Catatan" badge="PRICE" />
                        {openSection === 'price' && (
                            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div><div style={labelStyle}>Harga Paket</div><input type="text" value={data.meta.price || ''} style={inputStyle} placeholder="e.g. IDR 25.000.000" onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, price: e.target.value } })} /></div>
                                <div><div style={labelStyle}>Catatan Harga</div><input type="text" value={data.meta.priceNote || ''} style={inputStyle} placeholder="e.g. per orang, twin sharing" onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, priceNote: e.target.value } })} /></div>
                            </div>
                        )}

                        {/* 5. Include */}
                        <AccordionHeader sectionKey="inclusions" label="Apa saja yang termasuk" badge="IN" />
                        {openSection === 'inclusions' && <div style={cardStyle}><ListEditor items={data.inclusions || []} onChange={(v) => onUpdate({ ...data, inclusions: v })} /></div>}

                        {/* 6. Exclude */}
                        <AccordionHeader sectionKey="exclusions" label="Apa saja yang tidak termasuk" badge="OUT" />
                        {openSection === 'exclusions' && <div style={cardStyle}><ListEditor items={data.exclusions || []} onChange={(v) => onUpdate({ ...data, exclusions: v })} /></div>}

                        {/* 7. Syarat Ketentuan */}
                        <AccordionHeader sectionKey="tnc" label="Syarat & Ketentuan" badge="T&C" />
                        {openSection === 'tnc' && <div style={cardStyle}><ListEditor items={data.termsAndConditions || []} onChange={(v) => onUpdate({ ...data, termsAndConditions: v })} /></div>}

                        {/* 8. Testimonials */}
                        <AccordionHeader sectionKey="testimonials" label="Testimonials" badge="OPT" />
                        {openSection === 'testimonials' && (
                            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={labelStyle}>Enable Section</span>
                                    <button onClick={() => onUpdate({ ...data, testimonials: { ...data.testimonials, enabled: !data.testimonials?.enabled, items: data.testimonials?.items || [] } })}
                                        style={{ padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', background: data.testimonials?.enabled ? '#16a34a' : 'rgba(0,0,0,0.1)', color: '#fff' }}>
                                        {data.testimonials?.enabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                {(data.testimonials?.items || []).map((t, idx) => (
                                    <div key={idx} style={{ background: '#F5F5F7', padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
                                        <button onClick={() => onUpdate({ ...data, testimonials: { ...data.testimonials!, items: data.testimonials!.items.filter((_, i) => i !== idx) } })}
                                            style={{ position: 'absolute', top: 8, right: 8, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                        <div style={{ marginBottom: 8 }}>
                                            <div style={labelStyle}>Name</div>
                                            <input type="text" value={t.name} style={{ ...inputStyle, fontSize: 12 }} onChange={e => {
                                                const items = [...data.testimonials!.items]; items[idx] = { ...t, name: e.target.value };
                                                onUpdate({ ...data, testimonials: { ...data.testimonials!, items } });
                                            }} />
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}>Foto / Avatar <ImageIcon size={10} /></div>
                                            <input type="text" value={t.avatar || ''} placeholder="Image URL / Upload" style={{ ...inputStyle, fontSize: 11 }} onChange={e => {
                                                const items = [...data.testimonials!.items]; items[idx] = { ...t, avatar: e.target.value };
                                                onUpdate({ ...data, testimonials: { ...data.testimonials!, items } });
                                            }} />
                                        </div>
                                        <div>
                                            <div style={labelStyle}>Testimonial Text</div>
                                            <textarea value={t.text} style={{ ...inputStyle, fontSize: 12, height: 60 }} onChange={e => {
                                                const items = [...data.testimonials!.items]; items[idx] = { ...t, text: e.target.value };
                                                onUpdate({ ...data, testimonials: { ...data.testimonials!, items } });
                                            }} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => onUpdate({ ...data, testimonials: { enabled: true, items: [...(data.testimonials?.items || []), { name: 'Customer Name', text: 'Love this trip!', rating: 5 }] } })}
                                    style={{ width: '100%', padding: '10px 0', borderRadius: 10, cursor: 'pointer', border: '1px dashed rgba(0,0,0,0.2)', background: 'transparent', color: 'rgba(0,0,0,0.5)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <Plus size={14} /> Add Testimonial
                                </button>
                            </div>
                        )}

                        {/* 9. Gallery */}
                        <AccordionHeader sectionKey="gallery" label="Photo & Video Gallery" badge="OPT" />
                        {openSection === 'gallery' && (
                            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={labelStyle}>Enable Section</span>
                                    <button onClick={() => onUpdate({ ...data, gallery: { ...data.gallery, enabled: !data.gallery?.enabled, items: data.gallery?.items || [] } })}
                                        style={{ padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', background: data.gallery?.enabled ? '#16a34a' : 'rgba(0,0,0,0.1)', color: '#fff' }}>
                                        {data.gallery?.enabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {(data.gallery?.items || []).map((item, idx) => (
                                        <div key={idx} style={{ background: '#F5F5F7', padding: 8, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
                                            <button onClick={() => onUpdate({ ...data, gallery: { ...data.gallery!, items: data.gallery!.items.filter((_, i) => i !== idx) } })}
                                                style={{ position: 'absolute', top: 4, right: 4, color: '#ef4444', background: 'rgba(255,255,255,0.8)', padding: 4, borderRadius: '50%', border: 'none', cursor: 'pointer', zIndex: 10 }}><Trash2 size={10} /></button>
                                            <div style={{ aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', background: '#E8E8EC', marginBottom: 4 }}>
                                                <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <input type="text" value={item.url} style={{ ...inputStyle, fontSize: 9, padding: '4px 6px' }} onChange={e => {
                                                const items = [...data.gallery!.items]; items[idx] = { ...item, url: e.target.value };
                                                onUpdate({ ...data, gallery: { ...data.gallery!, items } });
                                            }} />
                                        </div>
                                    ))}
                                    <button onClick={() => onUpdate({ ...data, gallery: { enabled: true, items: [...(data.gallery?.items || []), { type: 'image', url: '', caption: '' }] } })}
                                        style={{ aspectRatio: '1/1', borderRadius: 12, cursor: 'pointer', border: '1px dashed rgba(0,0,0,0.2)', background: 'transparent', color: 'rgba(0,0,0,0.4)', fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        <Plus size={16} /> Add Photo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── THEME TAB ─── */}
                {activeTab === 'theme' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Layout Template */}
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}><LayoutTemplate size={11} /> Layout Template</div>
                            <select value={data.theme} onChange={(e) => onUpdate({ ...data, theme: e.target.value as any })}
                                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23D4AF37' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                                <option value="amazing-black">Amazing Black (Luxury)</option>
                                <option value="bento">Bento (Modern Apple)</option>
                                <option value="conde-nast">Condé Nast (Editorial)</option>
                                <option value="interactive-map">Interactive Map (Dynamic)</option>
                                <option value="japan-editorial">Japan Editorial (Clean)</option>
                                <option value="scrapbook">Scrapbook (Journal)</option>
                                <option value="umrah-mature">Umrah Mature (Classic)</option>
                                <option value="umrah-youth">Umrah Youth (Modern)</option>
                                <option value="umroh-event">Umroh Event (Community)</option>
                                <option value="bali-andi">Bali Andi (Dark Mobile)</option>
                                <option value="viral-tiktok">Viral TikTok (Vertical Video)</option>
                            </select>
                        </div>

                        {/* Cover Text Settings */}
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}><Type size={11} /> Cover Text Settings</div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Font Size</span><span style={{ fontWeight: 600 }}>{data.coverTextSettings?.fontSize || 48}px</span>
                                </div>
                                <input type="range" min={20} max={80} step={1} value={data.coverTextSettings?.fontSize || 48}
                                    onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, fontSize: Number(e.target.value) } })}
                                    style={{ width: '100%', accentColor: '#B8860B' }} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6 }}>Position</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                                        <button key={pos} onClick={() => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, position: pos } })}
                                            style={{
                                                flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
                                                fontSize: 11, fontWeight: 600, textTransform: 'capitalize', border: '1px solid',
                                                borderColor: (data.coverTextSettings?.position || 'center') === pos ? '#B8860B' : 'rgba(0,0,0,0.1)',
                                                background: (data.coverTextSettings?.position || 'center') === pos ? 'rgba(184,134,11,0.08)' : '#fff',
                                                color: (data.coverTextSettings?.position || 'center') === pos ? '#B8860B' : 'rgba(0,0,0,0.5)',
                                                transition: 'all 0.2s',
                                            }}>{pos}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6 }}>Text Color</div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input type="color" value={data.coverTextSettings?.color || '#ffffff'} onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, color: e.target.value } })} style={{ width: 32, height: 32, borderRadius: 8, cursor: 'pointer', padding: 2, border: '1px solid rgba(0,0,0,0.1)' }} />
                                    <input type="text" value={data.coverTextSettings?.color || '#ffffff'} onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, color: e.target.value } })} style={{ ...inputStyle, flex: 1, fontSize: 11, padding: '6px 10px' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Text Stroke</span><span style={{ fontWeight: 600 }}>{data.coverTextSettings?.strokeWidth || 0}px</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input type="color" value={data.coverTextSettings?.strokeColor || '#000000'} onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, strokeColor: e.target.value } })} style={{ width: 32, height: 32, borderRadius: 8, cursor: 'pointer', padding: 2, border: '1px solid rgba(0,0,0,0.1)' }} />
                                    <input type="range" min={0} max={4} step={0.5} value={data.coverTextSettings?.strokeWidth || 0} onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, strokeWidth: Number(e.target.value) } })} style={{ flex: 1, accentColor: '#B8860B' }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Text Shadow</span><span style={{ fontWeight: 600 }}>{data.coverTextSettings?.shadowBlur || 0}px</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input type="color" value={data.coverTextSettings?.shadowColor || '#000000'} onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, shadowColor: e.target.value } })} style={{ width: 32, height: 32, borderRadius: 8, cursor: 'pointer', padding: 2, border: '1px solid rgba(0,0,0,0.1)' }} />
                                    <input type="range" min={0} max={20} step={1} value={data.coverTextSettings?.shadowBlur || 0} onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, shadowBlur: Number(e.target.value) } })} style={{ flex: 1, accentColor: '#B8860B' }} />
                                </div>
                            </div>
                        </div>

                        {/* Font Pairings */}
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}><Type size={11} /> Typography Pairings</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {FONT_PAIRINGS.map((p) => {
                                    const isActive = (data.fontPairing || 'Classic Luxury') === p.name;
                                    return (
                                        <button key={p.name} onClick={() => onUpdate({ ...data, fontPairing: p.name })}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${isActive ? '#B8860B' : 'rgba(0,0,0,0.08)'}`, background: isActive ? 'rgba(184,134,11,0.06)' : '#fff', textAlign: 'left', transition: 'all 0.15s' }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#B8860B' : 'rgba(0,0,0,0.75)' }}>{p.name}</div>
                                            <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 2 }}>{p.fonts}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Color Vibes */}
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}><Palette size={11} /> Color Vibes</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {COLOR_VIBES.map((c) => {
                                    const isActive = data.brand.primaryColor === c.primary && data.brand.secondaryColor === c.secondary;
                                    return (
                                        <button key={c.name} onClick={() => onUpdate({ ...data, brand: { ...data.brand, primaryColor: c.primary, secondaryColor: c.secondary } })}
                                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${isActive ? '#B8860B' : 'rgba(0,0,0,0.08)'}`, background: isActive ? 'rgba(184,134,11,0.06)' : '#fff', textAlign: 'left', transition: 'all 0.15s' }}>
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', display: 'flex', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}>
                                                <div style={{ width: '50%', height: '100%', background: c.secondary }} />
                                                <div style={{ width: '50%', height: '100%', background: c.primary }} />
                                            </div>
                                            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(0,0,0,0.75)', lineHeight: 1.2 }}>{c.name}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Preset Save / Load */}
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}><BookMarked size={11} /> Preset Configuration</div>

                            {/* Saved presets list */}
                            {presets.length > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                    <button onClick={() => setShowPresets(p => !p)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)', background: '#F5F5F7', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
                                        <span>Recall Preset ({presets.length})</span>
                                        <ChevronDown size={13} style={{ transform: showPresets ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </button>
                                    {showPresets && (
                                        <div style={{ marginTop: 6, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                                            {presets.map((preset, idx) => (
                                                <button key={idx} onClick={() => handleApplyPreset(preset)}
                                                    style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: 'none', borderBottom: idx < presets.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', background: '#fff', transition: 'background 0.15s' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>{preset.name}</div>
                                                        <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 2 }}>{preset.theme}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: preset.primary_color, border: '1px solid rgba(0,0,0,0.1)' }} />
                                                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: preset.secondary_color, border: '1px solid rgba(0,0,0,0.1)' }} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Save new preset */}
                            {showPresetInput ? (
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <input type="text" value={presetName} placeholder="Preset name..." style={{ ...inputStyle, flex: 1 }} onChange={(e) => setPresetName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()} autoFocus />
                                    <button onClick={handleSavePreset} disabled={savingPreset || !presetName.trim()}
                                        style={{ padding: '0 14px', borderRadius: 10, cursor: 'pointer', background: '#B8860B', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {savingPreset ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                    </button>
                                    <button onClick={() => setShowPresetInput(false)} style={{ padding: '0 10px', borderRadius: 10, cursor: 'pointer', background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.5)', fontSize: 12 }}>✕</button>
                                </div>
                            ) : (
                                <button onClick={() => setShowPresetInput(true)}
                                    style={{ width: '100%', padding: '11px 0', borderRadius: 10, cursor: 'pointer', border: '1px dashed rgba(184,134,11,0.4)', background: 'rgba(184,134,11,0.04)', color: '#B8860B', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
                                    <Save size={13} /> Save Current as Preset
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── AI TAB ─── */}
                {activeTab === 'ai' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={cardStyle}>
                            <div style={labelStyle}>Output Mode</div>
                            <div style={{ display: 'flex', padding: 4, background: 'rgba(0,0,0,0.04)', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
                                <button onClick={() => { if (data.content_original) onUpdate({ ...data, ...data.content_original, active_version: 'original' }); }}
                                    style={{ flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', border: 'none', transition: 'all 0.2s', background: data.active_version === 'original' ? '#B8860B' : 'transparent', color: data.active_version === 'original' ? '#fff' : 'rgba(0,0,0,0.35)' }}>
                                    As Is (Original)
                                </button>
                                <button onClick={() => { if (data.content_personalized) onUpdate({ ...data, ...data.content_personalized, active_version: 'personalized' }); }}
                                    style={{ flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', border: 'none', transition: 'all 0.2s', background: data.active_version === 'personalized' ? '#B8860B' : 'transparent', color: data.active_version === 'personalized' ? '#fff' : 'rgba(0,0,0,0.35)' }}>
                                    Personalized
                                </button>
                            </div>
                            <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>
                                {data.active_version === 'original' ? 'Showing raw text from document.' : `Showing AI-stylized content with ${data.style} tone.`}
                            </div>
                        </div>

                        <div style={{ padding: 20, borderRadius: 16, background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', fontWeight: 600, fontSize: 13, marginBottom: 8 }}><Wand2 size={16} /> AI Stylizer</div>
                            <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.5)', marginBottom: 16, lineHeight: 1.6 }}>Automatically rewrite summaries & descriptions into a specific tone.</div>

                            <div style={labelStyle}>Rewrite Tone</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                                {['Friendly', 'Persuasive', 'Energetic', 'Professional'].map((tone) => (
                                    <button key={tone} onClick={() => onUpdate({ ...data, style: tone.toLowerCase() as any })}
                                        style={{ padding: '8px 0', borderRadius: 10, cursor: 'pointer', fontSize: 12, border: '1px solid', borderColor: data.style === tone.toLowerCase() ? '#a78bfa' : 'rgba(0,0,0,0.1)', background: data.style === tone.toLowerCase() ? 'rgba(147,51,234,0.1)' : '#fff', color: data.style === tone.toLowerCase() ? '#7c3aed' : 'rgba(0,0,0,0.55)', transition: 'all 0.2s' }}>
                                        {tone}
                                    </button>
                                ))}
                            </div>

                            <div style={{ ...labelStyle, marginTop: 8 }}>Translate</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {[{ code: 'id' as const, label: '🇮🇩 Bahasa' }, { code: 'en' as const, label: '🇬🇧 English' }].map((lang) => (
                                    <button key={lang.code} onClick={() => onUpdate({ ...data, language: lang.code })}
                                        style={{ flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer', fontSize: 12, border: '1px solid', borderColor: data.language === lang.code ? '#3B82F6' : 'rgba(0,0,0,0.1)', background: data.language === lang.code ? 'rgba(59,130,246,0.1)' : '#fff', color: data.language === lang.code ? '#2563EB' : 'rgba(0,0,0,0.55)', transition: 'all 0.2s' }}>
                                        {lang.label}
                                    </button>
                                ))}
                            </div>

                            <button onClick={handleReStyle} disabled={restyling}
                                style={{ width: '100%', marginTop: 20, padding: '12px 0', borderRadius: 12, cursor: restyling ? 'not-allowed' : 'pointer', background: restyling ? 'rgba(147,51,234,0.3)' : '#7c3aed', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 30px rgba(147,51,234,0.25)', opacity: restyling ? 0.6 : 1, transition: 'all 0.2s' }}>
                                {restyling ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><Wand2 size={16} /> Apply AI Transformation</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Save Bar */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.6)' }}>
                <button onClick={handleSave} disabled={saving}
                    style={{ width: '100%', padding: '14px 0', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontWeight: 800, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', transition: 'all 0.2s', opacity: saving ? 0.6 : 1, background: saveStatus === 'success' ? '#16a34a' : saveStatus === 'error' ? '#dc2626' : '#D4AF37', color: saveStatus === 'success' || saveStatus === 'error' ? '#fff' : '#000', boxShadow: saveStatus === 'success' ? '0 0 20px rgba(22,163,74,0.3)' : saveStatus === 'error' ? '0 0 20px rgba(220,38,38,0.3)' : '0 0 20px rgba(212,175,55,0.3)' }}>
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : saveStatus === 'success' ? <><CheckCircle2 size={16} /> Changes Saved</> : saveStatus === 'error' ? <><AlertCircle size={16} /> Retry Save</> : <><Save size={16} /> Save Changes</>}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.08);border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.15)}select option{background:#fff;color:#1a1a1a}` }} />
        </aside>
    );
}
