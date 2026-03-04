'use client';

import { useState, useCallback } from 'react';
import type { ItineraryPayload } from '@/types/itinerary';

interface CopywritingKitProps {
    data: ItineraryPayload;
}

// ─── Generator Functions ───────────────────────────────────────────────────────

function generateWhatsAppBlast(data: ItineraryPayload): string {
    const { meta, highlights, inclusions, brand } = data;
    const topHighlights = highlights.slice(0, 3).map(h => `   ✅ ${h.label}: ${h.value}`).join('\n');
    const topInclusions = inclusions.slice(0, 4).map(inc => `   ✔️ ${inc}`).join('\n');
    const whatsapp = brand.contact?.whatsapp || brand.whatsapp || '';
    const phone = whatsapp || brand.contact?.phone || brand.phone || '';

    return `✈️ *${meta.title.toUpperCase()}*
🗓️ _${meta.durationDays} Hari ${meta.durationNights} Malam_

Hai Kak! 👋 Mau liburan yang berkesan dan anti-ribet? Kami punya paket spesial untuk kamu! 🌟

📌 *Highlight Perjalanan:*
${topHighlights}

💰 *Harga Mulai dari:*
*${meta.price}* ${meta.priceNote ? `_(${meta.priceNote})_` : ''}

📦 *Sudah Termasuk:*
${topInclusions}

Paket ini cocok untuk kamu yang ingin liburan berkualitas tanpa pusing mikirin detail! Semua sudah kami atur, kamu tinggal nikmati 😊

⚡ *Seat terbatas!* Hubungi kami sekarang untuk info lebih lanjut & booking:

📱 WhatsApp: ${phone}
${brand.contact?.instagram || brand.instagram ? `📸 Instagram: ${brand.contact?.instagram || brand.instagram}` : ''}

━━━━━━━━━━━━━━━━
🏢 *${brand.name}* ${brand.tagline ? `\n_${brand.tagline}_` : ''}`;
}

function generateIGCaption(data: ItineraryPayload): string {
    const { meta, days, brand } = data;
    const dayHighlights = days.slice(0, 3).map(d => `📍 ${d.title}`).join('\n');

    return `✨ ${meta.title} ✨

${meta.subtitle}

${meta.durationDays} hari penuh petualangan yang tak terlupakan! 🗺️ Mulai dari:
${dayHighlights}
...dan masih banyak lagi!

💼 Paket all-inclusive mulai *${meta.price}*
🎯 Cocok untuk keluarga, pasangan, dan grup

Tertarik? Tap link di bio atau langsung DM kami! 💌
Terbatas hanya untuk ${meta.groupSize || 'peserta terpilih'} ya! ⏳

.
.
.`;
}

function generateHashtags(data: ItineraryPayload): string {
    const { meta, days, brand } = data;

    // Extract destination words from day locations
    const locations = [...new Set(days.map(d => d.location.split(',')[0].trim()))];
    const locationTags = locations
        .slice(0, 4)
        .map(l => `#Tour${l.replace(/\s+/g, '')}`)
        .join(' ');

    const destinationClean = meta.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '');
    const brandTag = `#${brand.name.replace(/\s+/g, '')}`;

    return `${brandTag} #TravelIndonesia #TravelAgent #PaketWisata #LiburanAntiribet #TourPackage ${locationTags} #Tour${destinationClean} #WisataBersama #TourMurah #HolidayVibes #TravelGoals #PackageTour #JelajahDunia #LiburanSeru`;
}

function generateFOMOCaption(data: ItineraryPayload): string {
    const { meta, brand } = data;
    const phone = brand.contact?.whatsapp || brand.whatsapp || brand.contact?.phone || brand.phone || '';

    return `⚠️ PERHATIAN untuk yang sudah lama nunda-nunda liburan!

Paket *${meta.title}* — ${meta.durationDays}H${meta.durationNights}M — _hampir habis!_

Harga: *${meta.price}*${meta.priceNote ? ` (${meta.priceNote})` : ''}

Kami bisa bantu urus SEMUA: tiket, hotel, transportasi, tour guide. Kamu tinggal dateng bawa koper! 🧳

${phone ? `📲 Hubungi sekarang: ${phone}` : '📲 DM / Hubungi kami sekarang!'}

Jangan sampai nyesel lihat orang lain berangkat duluan! 🏃‍♂️💨

— ${brand.name}`;
}

// ─── Copy Text Variants ────────────────────────────────────────────────────────
const COPY_VARIANTS = (data: ItineraryPayload) => [
    {
        id: 'wa-blast',
        icon: '💬',
        label: 'WhatsApp Blast',
        sublabel: 'Pesan promosi lengkap untuk broadcast',
        color: '#25D366',
        generate: () => generateWhatsAppBlast(data),
    },
    {
        id: 'ig-caption',
        icon: '📸',
        label: 'Instagram Caption',
        sublabel: 'Caption menarik untuk feed IG',
        color: '#E1306C',
        generate: () => generateIGCaption(data),
    },
    {
        id: 'hashtags',
        icon: '#️⃣',
        label: 'Hashtag Bundle',
        sublabel: 'Hashtag relevan untuk visibilitas',
        color: '#0095F6',
        generate: () => generateHashtags(data),
    },
    {
        id: 'fomo',
        icon: '⚡',
        label: 'FOMO / Flash Sale',
        sublabel: 'Teks urgensi untuk closing cepat',
        color: '#FF6B35',
        generate: () => generateFOMOCaption(data),
    },
];

export default function CopywritingKit({ data }: CopywritingKitProps) {
    const variants = COPY_VARIANTS(data);
    const [activeVariant, setActiveVariant] = useState(variants[0].id);
    const [texts, setTexts] = useState<Record<string, string>>(() =>
        Object.fromEntries(variants.map(v => [v.id, v.generate()]))
    );
    const [copied, setCopied] = useState<string | null>(null);

    const current = variants.find(v => v.id === activeVariant)!;

    const handleCopy = async (variantId: string) => {
        await navigator.clipboard.writeText(texts[variantId]);
        setCopied(variantId);
        setTimeout(() => setCopied(null), 2500);
    };

    const handleCopyAll = async () => {
        const allText = variants
            .map(v => `═══ ${v.label.toUpperCase()} ═══\n${texts[v.id]}`)
            .join('\n\n');
        await navigator.clipboard.writeText(allText);
        setCopied('all');
        setTimeout(() => setCopied(null), 2500);
    };

    const handleRegenerate = () => {
        setTexts(prev => ({
            ...prev,
            [activeVariant]: current.generate(),
        }));
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .cw-header { margin-bottom: 28px; }
                .cw-title { font-size: 22px; font-weight: 800; color: #1a1a1a; }
                .cw-subtitle { font-size: 13px; color: rgba(0,0,0,0.45); margin-top: 4px; }

                .cw-grid { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }

                .cw-sidebar { display: flex; flex-direction: column; gap: 8px; }

                .cw-variant-btn {
                    display: flex; align-items: center; gap: 12px;
                    padding: 14px 16px; border-radius: 14px;
                    background: #fff; border: 1.5px solid rgba(0,0,0,0.07);
                    cursor: pointer; text-align: left; transition: all 0.2s;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                }
                .cw-variant-btn:hover { border-color: rgba(184,134,11,0.3); transform: translateX(2px); }
                .cw-variant-btn.active {
                    border-color: #B8860B;
                    background: rgba(184,134,11,0.05);
                    transform: translateX(4px);
                    box-shadow: 0 4px 16px rgba(184,134,11,0.12);
                }

                .cw-variant-icon {
                    width: 40px; height: 40px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 18px; flex-shrink: 0;
                }

                .cw-variant-label { font-size: 13px; font-weight: 700; color: #1a1a1a; }
                .cw-variant-sublabel { font-size: 11px; color: rgba(0,0,0,0.4); margin-top: 2px; }

                .cw-main { display: flex; flex-direction: column; gap: 16px; }

                .cw-toolbar {
                    display: flex; align-items: center; gap: 10px;
                    padding: 0 0 16px 0; border-bottom: 1px solid rgba(0,0,0,0.06);
                }

                .cw-toolbar-label {
                    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
                    text-transform: uppercase; color: rgba(0,0,0,0.3);
                    margin-right: auto;
                }

                .cw-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 8px 16px; border-radius: 10px;
                    font-size: 12px; font-weight: 600;
                    cursor: pointer; border: none; transition: all 0.2s;
                }

                .cw-btn-primary {
                    background: linear-gradient(135deg, #B8860B, #D4AF37);
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(184,134,11,0.25);
                }
                .cw-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

                .cw-btn-secondary {
                    background: #fff; color: rgba(0,0,0,0.6);
                    border: 1px solid rgba(0,0,0,0.1) !important;
                }
                .cw-btn-secondary:hover { background: #F5F5F7; }

                .cw-btn-ghost {
                    background: transparent; color: rgba(0,0,0,0.4);
                    border: 1px dashed rgba(0,0,0,0.2) !important;
                    padding: 8px 12px;
                }
                .cw-btn-ghost:hover { border-color: #B8860B !important; color: #B8860B; }

                .cw-textarea {
                    width: 100%; min-height: 360px; padding: 20px;
                    background: #fff; border: 1.5px solid rgba(0,0,0,0.08);
                    border-radius: 16px; font-size: 14px; line-height: 1.75;
                    color: #1a1a1a; font-family: inherit; resize: vertical;
                    outline: none; transition: border-color 0.2s;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }
                .cw-textarea:focus { border-color: #B8860B; }

                .cw-copy-all-bar {
                    display: flex; align-items: center; justify-content: space-between;
                    background: rgba(184,134,11,0.06); border: 1px solid rgba(184,134,11,0.2);
                    border-radius: 12px; padding: 14px 18px;
                }

                .cw-copy-all-label { font-size: 12px; color: rgba(0,0,0,0.55); }
                .cw-copy-all-label strong { color: #1a1a1a; font-weight: 700; }

                @media (max-width: 768px) {
                    .cw-grid { grid-template-columns: 1fr; }
                    .cw-sidebar { display: grid; grid-template-columns: 1fr 1fr; }
                }
            ` }} />

            {/* Header */}
            <div className="cw-header">
                <div className="cw-title">✍️ Copywriting Kit</div>
                <div className="cw-subtitle">
                    Teks promosi siap pakai • Auto-generated dari data itinerary {data.brand.name}
                </div>
            </div>

            <div className="cw-grid">
                {/* Sidebar: Variant Selector */}
                <div className="cw-sidebar">
                    {variants.map(v => (
                        <button
                            key={v.id}
                            className={`cw-variant-btn ${activeVariant === v.id ? 'active' : ''}`}
                            onClick={() => setActiveVariant(v.id)}
                        >
                            <div
                                className="cw-variant-icon"
                                style={{ background: `${v.color}18` }}
                            >
                                {v.icon}
                            </div>
                            <div>
                                <div className="cw-variant-label">{v.label}</div>
                                <div className="cw-variant-sublabel">{v.sublabel}</div>
                            </div>
                        </button>
                    ))}

                    {/* Copy All */}
                    <div
                        className="cw-copy-all-bar"
                        style={{ marginTop: 8, flexDirection: 'column', gap: 10 }}
                    >
                        <div className="cw-copy-all-label">
                            Salin <strong>semua varian</strong> sekaligus
                        </div>
                        <button
                            className="cw-btn cw-btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={handleCopyAll}
                        >
                            {copied === 'all' ? '✓ Tersalin!' : '📋 Copy All (4 Varian)'}
                        </button>
                    </div>
                </div>

                {/* Main: Text Editor */}
                <div className="cw-main">
                    {/* Toolbar */}
                    <div className="cw-toolbar">
                        <div className="cw-toolbar-label">Editing: {current.label}</div>

                        <button className="cw-btn cw-btn-ghost" onClick={handleRegenerate}
                            title="Reset ke teks otomatis">
                            ↺ Reset
                        </button>

                        <button
                            className={`cw-btn ${copied === activeVariant ? 'cw-btn-secondary' : 'cw-btn-primary'}`}
                            onClick={() => handleCopy(activeVariant)}
                        >
                            {copied === activeVariant
                                ? '✓ Tersalin ke Clipboard!'
                                : '📋 Copy Teks Ini'}
                        </button>
                    </div>

                    {/* Editable Textarea */}
                    <textarea
                        className="cw-textarea"
                        value={texts[activeVariant]}
                        onChange={(e) => setTexts(prev => ({ ...prev, [activeVariant]: e.target.value }))}
                        spellCheck={false}
                    />

                    {/* Char counter */}
                    <div style={{
                        display: 'flex', justifyContent: 'flex-end',
                        fontSize: 11, color: 'rgba(0,0,0,0.35)',
                    }}>
                        {texts[activeVariant].length} karakter
                        {activeVariant === 'ig-caption' && texts[activeVariant].length > 2200 && (
                            <span style={{ color: '#ef4444', marginLeft: 8 }}>
                                ⚠️ Melebihi batas IG (2200 karakter)
                            </span>
                        )}
                    </div>

                    {/* Tips */}
                    <div style={{
                        background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)',
                        borderRadius: 12, padding: '12px 16px',
                        fontSize: 12, color: 'rgba(0,0,0,0.45)', lineHeight: 1.6,
                    }}>
                        💡 <strong style={{ color: 'rgba(0,0,0,0.6)' }}>Tips:</strong>{' '}
                        {activeVariant === 'wa-blast' && 'Gunakan untuk WhatsApp Broadcast ke daftar kontak. Pastikan nomor penerima sudah menyimpan nomor Anda.'}
                        {activeVariant === 'ig-caption' && 'Tambahkan 3-5 baris titik di bawah untuk mendorong pengguna menekan "...more". Lalu taruh hashtag terpisah di komentar pertama.'}
                        {activeVariant === 'hashtags' && 'Taruh hashtag ini di komentar pertama postingan (bukan di caption) untuk jangkauan lebih luas tanpa terlihat spammy.'}
                        {activeVariant === 'fomo' && 'Cocok digunakan sebagai status WhatsApp Business atau story IG. Perbarui tanggal/seat secara berkala untuk menjaga relevansi.'}
                    </div>
                </div>
            </div>
        </div>
    );
}
