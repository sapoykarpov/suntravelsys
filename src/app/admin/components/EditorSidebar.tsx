'use client';

import { useState } from 'react';
import type { ItineraryPayload } from '@/types/itinerary';
import StatusControl from './StatusControl';
import { Settings, LayoutTemplate, Wand2, Type, Palette, Video, PenTool, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { updateItineraryContent, reStyleItinerary } from '../actions';

interface EditorSidebarProps {
    itinerary: ItineraryPayload;
    previewUrl: string;
    onUpdate: (updatedData: ItineraryPayload) => void;
}

type TabType = 'qc' | 'content' | 'theme' | 'ai';

export default function EditorSidebar({ itinerary: data, previewUrl, onUpdate }: EditorSidebarProps) {
    const [activeTab, setActiveTab] = useState<TabType>('qc');
    const [saving, setSaving] = useState(false);
    const [restyling, setRestyling] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleReStyle = async () => {
        setRestyling(true);
        try {
            const result = await reStyleItinerary(data.id, data.language, data.style);
            if (result.success && result.data) {
                const updatedPayload: ItineraryPayload = {
                    ...data,
                    ...result.data,
                    active_version: 'personalized',
                    days: result.data.days.map((day: any, i: number) => ({
                        ...day,
                        heroImage: data.days[i]?.heroImage || '',
                        activities: day.activities.map((act: any) => ({
                            ...act,
                            iconCategory: act.iconCategory || 'activity'
                        }))
                    })),
                    hotels: result.data.hotels?.map((h: any, i: number) => ({
                        ...h,
                        imageUrl: data.hotels?.[i]?.imageUrl || ''
                    })) || []
                };
                onUpdate(updatedPayload);
            } else {
                alert('AI re-styling failed: ' + result.error);
            }
        } catch (err) {
            alert('An error occurred during re-styling.');
        } finally {
            setRestyling(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus('idle');
        try {
            const result = await updateItineraryContent(data.id, {
                theme: data.theme,
                meta: data.meta,
                highlights: data.highlights,
                itinerary_summary: data.itinerarySummary,
                inclusions: data.inclusions,
                exclusions: data.exclusions,
                days: data.days,
                hotels: data.hotels,
                brand: data.brand,
                language: data.language,
                style: data.style,
                active_version: data.active_version,
                content_original: data.content_original,
                content_personalized: data.content_personalized
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

    const tabStyle = (isActive: boolean) => ({
        flex: 1,
        padding: '14px 0',
        fontSize: 11,
        fontWeight: 700 as const,
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        color: isActive ? '#B8860B' : 'rgba(0,0,0,0.35)',
        borderBottom: isActive ? '2px solid #B8860B' : '2px solid transparent',
        transition: 'all 0.2s',
    });

    const cardStyle = {
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    };

    const labelStyle = {
        fontSize: 10,
        color: 'rgba(0,0,0,0.4)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.15em',
        marginBottom: 8,
        display: 'block',
    };

    const inputStyle = {
        width: '100%',
        background: '#F5F5F7',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 10,
        padding: '10px 12px',
        fontSize: 13,
        color: '#1a1a1a',
        outline: 'none',
    };

    return (
        <aside style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: 'calc(100vh - 73px)',
            position: 'sticky',
            top: 73,
            background: '#FAFAFA',
            borderLeft: '1px solid rgba(0,0,0,0.08)',
            zIndex: 40,
        }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <button onClick={() => setActiveTab('qc')} style={tabStyle(activeTab === 'qc')}>
                    <Settings size={13} /> QC
                </button>
                <button onClick={() => setActiveTab('content')} style={tabStyle(activeTab === 'content')}>
                    <PenTool size={13} /> Content
                </button>
                <button onClick={() => setActiveTab('theme')} style={tabStyle(activeTab === 'theme')}>
                    <LayoutTemplate size={13} /> Theme
                </button>
                <button onClick={() => setActiveTab('ai')} style={tabStyle(activeTab === 'ai')}>
                    <Wand2 size={13} /> AI
                </button>
            </div>

            {/* Scrollable Tab Content */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* ─── QC TAB ─── */}
                {activeTab === 'qc' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <StatusControl
                            itineraryId={data.id}
                            currentStatus="pending"
                            previewUrl={previewUrl}
                        />

                        {/* Trip Details */}
                        <div style={cardStyle}>
                            <div style={labelStyle}>Trip Details</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <div style={{ ...labelStyle, marginBottom: 4 }}>Duration</div>
                                    <div style={{ fontSize: 15, color: '#1a1a1a', fontWeight: 600 }}>{data.meta.durationDays}D / {data.meta.durationNights}N</div>
                                </div>
                                <div>
                                    <div style={{ ...labelStyle, marginBottom: 4 }}>Group Size</div>
                                    <div style={{ fontSize: 15, color: '#1a1a1a' }}>{data.meta.groupSize}</div>
                                </div>
                                <div>
                                    <div style={{ ...labelStyle, marginBottom: 4 }}>Price</div>
                                    <div style={{ fontSize: 15, color: '#D4AF37', fontWeight: 700 }}>{data.meta.price}</div>
                                </div>
                                <div>
                                    <div style={{ ...labelStyle, marginBottom: 4 }}>Theme</div>
                                    <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', background: 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: 8, display: 'inline-block' }}>{data.theme}</div>
                                </div>
                            </div>
                        </div>

                        {/* Brand Profile - Editable */}
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Palette size={11} style={{ color: '#B8860B' }} /> Brand Profile
                            </div>

                            {/* Logo Upload */}
                            <div style={{ marginBottom: 12 }}>
                                <div style={labelStyle}>Logo URL</div>
                                <input type="text" placeholder="Paste image URL"
                                    value={data.brand.logoUrl || ''}
                                    style={{ ...inputStyle, marginBottom: 8 }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                    onChange={(e) => onUpdate({
                                        ...data,
                                        brand: { ...data.brand, logoUrl: e.target.value }
                                    })}
                                />
                                {data.brand.logoUrl && (
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: '#F5F5F7',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden',
                                    }}>
                                        <img src={data.brand.logoUrl} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            {/* WhatsApp */}
                            <div style={{ marginBottom: 12 }}>
                                <div style={labelStyle}>WhatsApp Number</div>
                                <input type="text" placeholder="e.g., +1 234 567 8900"
                                    value={data.brand.whatsapp || ''}
                                    style={inputStyle}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                    onChange={(e) => onUpdate({
                                        ...data,
                                        brand: { ...data.brand, whatsapp: e.target.value }
                                    })}
                                />
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: 12 }}>
                                <div style={labelStyle}>Email</div>
                                <input type="email" placeholder="contact@example.com"
                                    value={data.brand.email || ''}
                                    style={inputStyle}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                    onChange={(e) => onUpdate({
                                        ...data,
                                        brand: { ...data.brand, email: e.target.value }
                                    })}
                                />
                            </div>

                            {/* Colors */}
                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={labelStyle}>Brand Colors</div>

                                <div style={{ marginBottom: 12 }}>
                                    <label style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 20, height: 20, borderRadius: 6, background: data.brand.primaryColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                                        Primary
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input type="color" value={data.brand.primaryColor || '#D4AF37'}
                                            style={{ width: 50, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer' }}
                                            onChange={(e) => onUpdate({
                                                ...data,
                                                brand: { ...data.brand, primaryColor: e.target.value }
                                            })}
                                        />
                                        <input type="text" value={data.brand.primaryColor || '#D4AF37'}
                                            style={{ ...inputStyle, flex: 1, fontSize: 11, fontFamily: 'monospace' }}
                                            onChange={(e) => onUpdate({
                                                ...data,
                                                brand: { ...data.brand, primaryColor: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 12 }}>
                                    <label style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 20, height: 20, borderRadius: 6, background: data.brand.secondaryColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                                        Secondary
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input type="color" value={data.brand.secondaryColor || '#0a0a0a'}
                                            style={{ width: 50, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer' }}
                                            onChange={(e) => onUpdate({
                                                ...data,
                                                brand: { ...data.brand, secondaryColor: e.target.value }
                                            })}
                                        />
                                        <input type="text" value={data.brand.secondaryColor || '#0a0a0a'}
                                            style={{ ...inputStyle, flex: 1, fontSize: 11, fontFamily: 'monospace' }}
                                            onChange={(e) => onUpdate({
                                                ...data,
                                                brand: { ...data.brand, secondaryColor: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={labelStyle}>Social Links</div>

                                <div style={{ marginBottom: 10 }}>
                                    <label style={{ ...labelStyle, marginBottom: 4 }}>Instagram</label>
                                    <input type="text" placeholder="https://instagram.com/yourhandle"
                                        value={data.brand.instagram || ''}
                                        style={{ ...inputStyle, fontSize: 11 }}
                                        onChange={(e) => onUpdate({
                                            ...data,
                                            brand: { ...data.brand, instagram: e.target.value }
                                        })}
                                    />
                                </div>

                                <div style={{ marginBottom: 10 }}>
                                    <label style={{ ...labelStyle, marginBottom: 4 }}>TikTok</label>
                                    <input type="text" placeholder="https://tiktok.com/@yourhandle"
                                        value={data.brand.tiktok || ''}
                                        style={{ ...inputStyle, fontSize: 11 }}
                                        onChange={(e) => onUpdate({
                                            ...data,
                                            brand: { ...data.brand, tiktok: e.target.value }
                                        })}
                                    />
                                </div>

                                <div style={{ marginBottom: 10 }}>
                                    <label style={{ ...labelStyle, marginBottom: 4 }}>Facebook</label>
                                    <input type="text" placeholder="https://facebook.com/yourpage"
                                        value={data.brand.facebook || ''}
                                        style={{ ...inputStyle, fontSize: 11 }}
                                        onChange={(e) => onUpdate({
                                            ...data,
                                            brand: { ...data.brand, facebook: e.target.value }
                                        })}
                                    />
                                </div>

                                <div>
                                    <label style={{ ...labelStyle, marginBottom: 4 }}>Website</label>
                                    <input type="text" placeholder="https://yourwebsite.com"
                                        value={data.brand.website || ''}
                                        style={{ ...inputStyle, fontSize: 11 }}
                                        onChange={(e) => onUpdate({
                                            ...data,
                                            brand: { ...data.brand, website: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── CONTENT TAB ─── */}
                {activeTab === 'content' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>
                            Edit content below. All changes update the live preview instantly.
                        </div>

                        {/* Cover Image */}
                        <div style={cardStyle}>
                            <div style={{ fontSize: 12, color: '#D4AF37', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ background: 'rgba(212,175,55,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 10 }}>COVER</span>
                                Itinerary Cover Image
                            </div>
                            <div style={labelStyle}>Cover Image URL</div>
                            <div style={{ position: 'relative' }}>
                                <Video size={14} style={{ position: 'absolute', left: 12, top: 11, color: 'rgba(0,0,0,0.25)' }} />
                                <input type="text" placeholder="Paste image URL"
                                    value={data.meta.coverImage || ''}
                                    style={{ ...inputStyle, paddingLeft: 36 }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                    onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, coverImage: e.target.value } })}
                                />
                            </div>
                            {data.meta.coverImage && (
                                <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', position: 'relative', aspectRatio: '16/9', background: '#E8E8EC' }}>
                                    <img
                                        src={data.meta.coverImage}
                                        alt="Cover preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Meta Title & Subtitle */}
                        <div style={cardStyle}>
                            <div style={{ fontSize: 12, color: '#D4AF37', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ background: 'rgba(212,175,55,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 10 }}>META</span>
                                Trip Info
                            </div>
                            <div style={labelStyle}>Title</div>
                            <input type="text" value={data.meta.title} style={inputStyle}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, title: e.target.value } })}
                            />
                            <div style={{ ...labelStyle, marginTop: 12 }}>Subtitle</div>
                            <input type="text" value={data.meta.subtitle} style={inputStyle}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                onChange={(e) => onUpdate({ ...data, meta: { ...data.meta, subtitle: e.target.value } })}
                            />
                        </div>

                        {data.days.map((day, i) => (
                            <div key={i} style={cardStyle}>
                                <div style={{ fontSize: 12, color: '#D4AF37', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ background: 'rgba(212,175,55,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 10 }}>DAY {day.dayNumber}</span>
                                    {day.location}
                                </div>

                                {/* Hero Image */}
                                <div style={{ marginBottom: 12 }}>
                                    <div style={labelStyle}>Hero Image URL</div>
                                    <input type="text" placeholder="Paste image URL"
                                        value={day.heroImage || ''}
                                        style={inputStyle}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                        onChange={(e) => {
                                            const newDays = [...data.days];
                                            newDays[i] = { ...day, heroImage: e.target.value };
                                            onUpdate({ ...data, days: newDays });
                                        }}
                                    />
                                    {day.heroImage && (
                                        <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', position: 'relative', aspectRatio: '16/9', background: '#E8E8EC' }}>
                                            <img
                                                src={day.heroImage}
                                                alt="Hero preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={labelStyle}>Day Title</div>
                                <input type="text" value={day.title} style={inputStyle}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                    onChange={(e) => {
                                        const newDays = [...data.days];
                                        newDays[i] = { ...day, title: e.target.value };
                                        onUpdate({ ...data, days: newDays });
                                    }}
                                />

                                <div style={{ ...labelStyle, marginTop: 12 }}>Summary</div>
                                <textarea value={day.summary} rows={3}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                    onChange={(e) => {
                                        const newDays = [...data.days];
                                        newDays[i] = { ...day, summary: e.target.value };
                                        onUpdate({ ...data, days: newDays });
                                    }}
                                />

                                {/* YouTube Video ID */}
                                <div style={{ ...labelStyle, marginTop: 12 }}>YouTube Video URL / ID</div>
                                <div style={{ position: 'relative' }}>
                                    <Video size={14} style={{ position: 'absolute', left: 12, top: 11, color: 'rgba(0,0,0,0.25)' }} />
                                    <input type="text" placeholder="Paste YouTube URL or video ID"
                                        value={day.videoUrl || ''} style={{ ...inputStyle, paddingLeft: 36 }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            // Extract video ID from full URL
                                            const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
                                            if (match) val = match[1];
                                            const newDays = [...data.days];
                                            newDays[i] = { ...day, videoUrl: val };
                                            onUpdate({ ...data, days: newDays });
                                        }}
                                    />
                                </div>
                                {/* YouTube Thumbnail Preview */}
                                {day.videoUrl && day.videoUrl.length >= 11 && (
                                    <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', position: 'relative', aspectRatio: '16/9', background: '#111' }}>
                                        <img
                                            src={`https://img.youtube.com/vi/${day.videoUrl}/hqdefault.jpg`}
                                            alt="Video thumbnail"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '14px solid #fff', marginLeft: 3 }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Activities */}
                                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                    <div style={{ ...labelStyle, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Activities ({day.activities.length})</span>
                                        <button onClick={() => {
                                            const newDays = [...data.days];
                                            newDays[i] = {
                                                ...day, activities: [...day.activities, { time: '', title: 'New Activity', description: '', iconCategory: 'activity' }]
                                            };
                                            onUpdate({ ...data, days: newDays });
                                        }} style={{ background: 'rgba(184,134,11,0.12)', border: '1px solid rgba(184,134,11,0.3)', color: '#B8860B', fontSize: 10, padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>
                                            + Add
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {day.activities.map((act, j) => (
                                            <div key={j} style={{ background: '#F0F0F2', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                    <input type="text" value={act.time} placeholder="Time" style={{ ...inputStyle, width: 80, padding: '4px 8px', fontSize: 11, color: '#B8860B', background: 'transparent', border: '1px solid rgba(184,134,11,0.25)' }}
                                                        onChange={(e) => {
                                                            const newDays = [...data.days];
                                                            const newActs = [...day.activities];
                                                            newActs[j] = { ...act, time: e.target.value };
                                                            newDays[i] = { ...day, activities: newActs };
                                                            onUpdate({ ...data, days: newDays });
                                                        }}
                                                    />
                                                    <button onClick={() => {
                                                        const newDays = [...data.days];
                                                        const newActs = day.activities.filter((_, idx) => idx !== j);
                                                        newDays[i] = { ...day, activities: newActs };
                                                        onUpdate({ ...data, days: newDays });
                                                    }} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 9, padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}>
                                                        ✕
                                                    </button>
                                                </div>
                                                <input type="text" value={act.title} placeholder="Activity title" style={{ ...inputStyle, marginBottom: 6, padding: '6px 8px', fontSize: 12 }}
                                                    onFocus={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                                                    onChange={(e) => {
                                                        const newDays = [...data.days];
                                                        const newActs = [...day.activities];
                                                        newActs[j] = { ...act, title: e.target.value };
                                                        newDays[i] = { ...day, activities: newActs };
                                                        onUpdate({ ...data, days: newDays });
                                                    }}
                                                />
                                                <textarea value={act.description} placeholder="Description..." rows={2}
                                                    style={{ ...inputStyle, padding: '6px 8px', fontSize: 11, resize: 'vertical', lineHeight: 1.5, color: 'rgba(0,0,0,0.55)' }}
                                                    onChange={(e) => {
                                                        const newDays = [...data.days];
                                                        const newActs = [...day.activities];
                                                        newActs[j] = { ...act, description: e.target.value };
                                                        newDays[i] = { ...day, activities: newActs };
                                                        onUpdate({ ...data, days: newDays });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── THEME TAB ─── */}
                {activeTab === 'theme' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Layout Template */}
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <LayoutTemplate size={11} /> Layout Template
                            </div>
                            <select
                                value={data.theme}
                                onChange={(e) => onUpdate({ ...data, theme: e.target.value as any })}
                                style={{
                                    ...inputStyle,
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23D4AF37' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                }}
                            >
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
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Type size={11} /> Cover Text Settings
                            </div>

                            {/* Font Size */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Font Size</span>
                                    <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.7)' }}>{data.coverTextSettings?.fontSize || 48}px</span>
                                </div>
                                <input type="range" min={20} max={80} step={1}
                                    value={data.coverTextSettings?.fontSize || 48}
                                    onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, fontSize: Number(e.target.value) } })}
                                    style={{ width: '100%', accentColor: '#B8860B' }}
                                />
                            </div>

                            {/* Position */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6 }}>Position</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                                        <button key={pos} onClick={() => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, position: pos } })}
                                            style={{
                                                flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
                                                fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                                                border: (data.coverTextSettings?.position || 'center') === pos ? '1px solid #B8860B' : '1px solid rgba(0,0,0,0.1)',
                                                background: (data.coverTextSettings?.position || 'center') === pos ? 'rgba(184,134,11,0.08)' : '#fff',
                                                color: (data.coverTextSettings?.position || 'center') === pos ? '#B8860B' : 'rgba(0,0,0,0.5)',
                                                transition: 'all 0.2s',
                                            }}
                                        >{pos}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Color */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6 }}>Text Color</div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input type="color"
                                        value={data.coverTextSettings?.color || '#ffffff'}
                                        onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, color: e.target.value } })}
                                        style={{ width: 32, height: 32, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, cursor: 'pointer', padding: 2 }}
                                    />
                                    <input type="text"
                                        value={data.coverTextSettings?.color || '#ffffff'}
                                        onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, color: e.target.value } })}
                                        style={{ ...inputStyle, flex: 1, fontSize: 11, padding: '6px 10px' }}
                                    />
                                </div>
                            </div>

                            {/* Stroke */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Text Stroke</span>
                                    <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.7)' }}>{data.coverTextSettings?.strokeWidth || 0}px</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input type="color"
                                        value={data.coverTextSettings?.strokeColor || '#000000'}
                                        onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, strokeColor: e.target.value } })}
                                        style={{ width: 32, height: 32, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, cursor: 'pointer', padding: 2 }}
                                    />
                                    <input type="range" min={0} max={4} step={0.5}
                                        value={data.coverTextSettings?.strokeWidth || 0}
                                        onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, strokeWidth: Number(e.target.value) } })}
                                        style={{ flex: 1, accentColor: '#B8860B' }}
                                    />
                                </div>
                            </div>

                            {/* Shadow */}
                            <div>
                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Text Shadow</span>
                                    <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.7)' }}>{data.coverTextSettings?.shadowBlur || 0}px</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input type="color"
                                        value={data.coverTextSettings?.shadowColor || '#000000'}
                                        onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, shadowColor: e.target.value } })}
                                        style={{ width: 32, height: 32, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, cursor: 'pointer', padding: 2 }}
                                    />
                                    <input type="range" min={0} max={20} step={1}
                                        value={data.coverTextSettings?.shadowBlur || 0}
                                        onChange={(e) => onUpdate({ ...data, coverTextSettings: { ...data.coverTextSettings, shadowBlur: Number(e.target.value) } })}
                                        style={{ flex: 1, accentColor: '#B8860B' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Font Pairings */}
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Type size={11} /> Typography Pairings
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { name: 'Classic Luxury', fonts: 'Playfair Display & Lato', current: true },
                                    { name: 'Editorial', fonts: 'Cormorant & Montserrat', current: false },
                                    { name: 'Modern Minimal', fonts: 'Inter & Inter', current: false },
                                    { name: 'Boutique', fonts: 'Bodoni Moda & Space Grotesk', current: false },
                                ].map((p, i) => (
                                    <button key={i} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                        padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                                        border: p.current ? '1px solid #B8860B' : '1px solid rgba(0,0,0,0.08)',
                                        background: p.current ? 'rgba(184,134,11,0.06)' : '#fff',
                                        textAlign: 'left', transition: 'all 0.2s',
                                    }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: p.current ? '#B8860B' : 'rgba(0,0,0,0.75)' }}>{p.name}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', marginTop: 2 }}>{p.fonts}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Vibes */}
                        <div style={cardStyle}>
                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Palette size={11} /> Color Vibes
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {[
                                    { name: 'Midnight Gold', bg: '#000', accent: '#D4AF37', current: true },
                                    { name: 'Ocean Mist', bg: '#0F172A', accent: '#38BDF8', current: false },
                                    { name: 'Desert Sand', bg: '#FDFBF7', accent: '#D97706', current: false },
                                    { name: 'Forest Noir', bg: '#022C22', accent: '#34D399', current: false },
                                ].map((c, i) => (
                                    <button key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                                        border: c.current ? '1px solid #B8860B' : '1px solid rgba(0,0,0,0.08)',
                                        background: c.current ? 'rgba(184,134,11,0.06)' : '#fff',
                                        textAlign: 'left', transition: 'all 0.2s',
                                    }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', display: 'flex', border: '1px solid rgba(0,0,0,0.1)' }}>
                                            <div style={{ width: '50%', height: '100%', background: c.bg }} />
                                            <div style={{ width: '50%', height: '100%', background: c.accent }} />
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>{c.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button style={{
                            width: '100%', padding: '12px 0', borderRadius: 12, cursor: 'pointer',
                            background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)',
                            color: 'rgba(0,0,0,0.6)', fontSize: 13, fontWeight: 500,
                            transition: 'all 0.2s',
                        }}>
                            Save as Preset Configuration
                        </button>
                    </div>
                )}

                {/* ─── AI TAB ─── */}
                {activeTab === 'ai' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Version Switcher */}
                        <div style={cardStyle}>
                            <div style={labelStyle}>Output Mode</div>
                            <div style={{ display: 'flex', padding: 4, background: 'rgba(0,0,0,0.04)', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
                                <button
                                    onClick={() => {
                                        if (data.content_original) {
                                            onUpdate({ ...data, ...data.content_original, active_version: 'original' });
                                        }
                                    }}
                                    style={{
                                        flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                                        fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                                        border: 'none', transition: 'all 0.2s',
                                        background: data.active_version === 'original' ? '#B8860B' : 'transparent',
                                        color: data.active_version === 'original' ? '#fff' : 'rgba(0,0,0,0.35)',
                                        boxShadow: data.active_version === 'original' ? '0 2px 10px rgba(184,134,11,0.2)' : 'none',
                                    }}
                                >
                                    As Is (Original)
                                </button>
                                <button
                                    onClick={() => {
                                        if (data.content_personalized) {
                                            onUpdate({ ...data, ...data.content_personalized, active_version: 'personalized' });
                                        }
                                    }}
                                    style={{
                                        flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                                        fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                                        border: 'none', transition: 'all 0.2s',
                                        background: data.active_version === 'personalized' ? '#B8860B' : 'transparent',
                                        color: data.active_version === 'personalized' ? '#fff' : 'rgba(0,0,0,0.35)',
                                        boxShadow: data.active_version === 'personalized' ? '0 2px 10px rgba(184,134,11,0.2)' : 'none',
                                    }}
                                >
                                    Personalized
                                </button>
                            </div>
                            <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>
                                {data.active_version === 'original'
                                    ? 'Showing raw text from document (Brand names replaced).'
                                    : `Showing AI-stylized content with ${data.style} tone.`}
                            </div>
                        </div>

                        {/* AI Stylizer */}
                        <div style={{
                            padding: 20, borderRadius: 16,
                            background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.15)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                                <Wand2 size={16} /> AI Stylizer
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.5)', marginBottom: 16, lineHeight: 1.6 }}>
                                Automatically rewrite summaries & descriptions into a specific tone.
                            </div>

                            <div style={labelStyle}>Rewrite Tone</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                                {['Friendly', 'Persuasive', 'Energetic', 'Professional'].map((tone) => (
                                    <button
                                        key={tone}
                                        onClick={() => onUpdate({ ...data, style: tone.toLowerCase() as any })}
                                        style={{
                                            padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                                            fontSize: 12, border: '1px solid',
                                            borderColor: data.style === tone.toLowerCase() ? '#a78bfa' : 'rgba(0,0,0,0.1)',
                                            background: data.style === tone.toLowerCase() ? 'rgba(147,51,234,0.1)' : '#fff',
                                            color: data.style === tone.toLowerCase() ? '#7c3aed' : 'rgba(0,0,0,0.55)',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>

                            <div style={{ ...labelStyle, marginTop: 8 }}>Translate</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {[
                                    { code: 'id' as const, label: '🇮🇩 Bahasa' },
                                    { code: 'en' as const, label: '🇬🇧 English' },
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => onUpdate({ ...data, language: lang.code })}
                                        style={{
                                            flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                                            fontSize: 12, border: '1px solid',
                                            borderColor: data.language === lang.code ? '#3B82F6' : 'rgba(0,0,0,0.1)',
                                            background: data.language === lang.code ? 'rgba(59,130,246,0.1)' : '#fff',
                                            color: data.language === lang.code ? '#2563EB' : 'rgba(0,0,0,0.55)',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleReStyle}
                                disabled={restyling}
                                style={{
                                    width: '100%', marginTop: 20, padding: '12px 0', borderRadius: 12,
                                    cursor: restyling ? 'not-allowed' : 'pointer',
                                    background: restyling ? 'rgba(147,51,234,0.3)' : '#7c3aed',
                                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: '0 0 30px rgba(147,51,234,0.25)',
                                    opacity: restyling ? 0.6 : 1,
                                    transition: 'all 0.2s',
                                }}
                            >
                                {restyling ? (
                                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                                ) : (
                                    <><Wand2 size={16} /> Apply AI Transformation</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Save Bar */}
            <div style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.6)',
            }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        width: '100%',
                        padding: '14px 0',
                        borderRadius: 12,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        border: 'none',
                        transition: 'all 0.2s',
                        opacity: saving ? 0.6 : 1,
                        background: saveStatus === 'success' ? '#16a34a' : saveStatus === 'error' ? '#dc2626' : '#D4AF37',
                        color: saveStatus === 'success' || saveStatus === 'error' ? '#fff' : '#000',
                        boxShadow: saveStatus === 'success'
                            ? '0 0 20px rgba(22,163,74,0.3)'
                            : saveStatus === 'error'
                                ? '0 0 20px rgba(220,38,38,0.3)'
                                : '0 0 20px rgba(212,175,55,0.3)',
                    }}
                >
                    {saving ? (
                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : saveStatus === 'success' ? (
                        <><CheckCircle2 size={16} /> Changes Saved</>
                    ) : saveStatus === 'error' ? (
                        <><AlertCircle size={16} /> Retry Save</>
                    ) : (
                        <><Save size={16} /> Save Changes</>
                    )}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.08);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.15);
                }
                select option {
                    background: #fff;
                    color: #1a1a1a;
                }
            `}} />
        </aside>
    );
}
