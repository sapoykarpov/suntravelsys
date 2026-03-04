'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas-pro';
import { ItineraryPayload } from '@/types/itinerary';

type FlyerRatio = '4:5' | '9:16';

interface CanvasElementBase {
    id: string;
    type: 'text' | 'image' | 'shape';
    x: number;
    y: number;
    w: number;
    h: number;
    zIndex: number;
}
interface TextElement extends CanvasElementBase {
    type: 'text';
    text: string;
    fontSize: number;
    color: string;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
    fontFamily: string;
}
interface ImageElement extends CanvasElementBase {
    type: 'image';
    src: string;
    borderRadius: number;
    objectFit: 'cover' | 'contain';
}
interface ShapeElement extends CanvasElementBase {
    type: 'shape';
    bgColor: string;
    borderRadius: number;
}
type CanvasElement = TextElement | ImageElement | ShapeElement;

interface FlyerStudioProps {
    data: ItineraryPayload;
}

const DIMS = {
    '4:5': { width: 1080, height: 1350, label: 'Feed (4:5)' },
    '9:16': { width: 1080, height: 1920, label: 'Story (9:16)' }
};

export default function FlyerStudio({ data }: FlyerStudioProps) {
    const { brand, meta } = data;
    const canvasRef = useRef<HTMLDivElement>(null);
    const [ratio, setRatio] = useState<FlyerRatio>('4:5');
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [screenScale, setScreenScale] = useState(1);
    const [downloading, setDownloading] = useState(false);

    // Initial Load Elements (Hanya run SEKALI saat mount, jadi tidak keput saat ubah rasio)
    const initRef = useRef(false);
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const initialElements: CanvasElement[] = [];
        let curZ = 1;
        const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        // Hero Image
        const heroImg = (brand as any).heroImage || meta.coverImage;
        if (heroImg) {
            initialElements.push({ id: genId('img-hero'), type: 'image', x: 0, y: 0, w: 1080, h: 1080, zIndex: curZ++, src: heroImg, borderRadius: 0, objectFit: 'cover' });
        }

        // Brand Logo
        if (brand.logoUrl) {
            initialElements.push({ id: genId('img-logo'), type: 'image', x: 40, y: 40, w: 140, h: 140, zIndex: curZ++, src: brand.logoUrl, borderRadius: 20, objectFit: 'contain' });
        }

        // Brand Bar background (Shape)
        initialElements.push({ id: genId('shape-bar'), type: 'shape', x: 0, y: 1080, w: 1080, h: 270, zIndex: curZ++, bgColor: brand.primaryColor || '#000', borderRadius: 0 });

        // Title
        initialElements.push({ id: genId('text-title'), type: 'text', x: 60, y: 1120, w: 900, h: 200, zIndex: curZ++, text: meta.title.toUpperCase(), fontSize: 72, color: '#FFFFFF', fontWeight: '800', textAlign: 'left', fontFamily: 'Inter' });

        // Price Tag
        if (meta.price) {
            initialElements.push({ id: genId('shape-pricebg'), type: 'shape', x: 60, y: 920, w: 400, h: 100, zIndex: curZ++, bgColor: '#FFD700', borderRadius: 16 });
            initialElements.push({ id: genId('text-price'), type: 'text', x: 80, y: 935, w: 360, h: 80, zIndex: curZ++, text: `Mulai ${meta.price}`, fontSize: 42, color: '#000000', fontWeight: '900', textAlign: 'center', fontFamily: 'Inter' });
        }

        // Contact Info (Auto-fill)
        const contactText = [brand.website, brand.phone].filter(Boolean).join('  •  ');
        if (contactText) {
            initialElements.push({ id: genId('text-contact'), type: 'text', x: 0, y: 1290, w: 1080, h: 60, zIndex: curZ++, text: contactText, fontSize: 24, color: '#FFFFFF', fontWeight: '400', textAlign: 'center', fontFamily: 'Inter' });
        }

        setElements(initialElements);
    }, [brand, meta]);

    // Handle Keyboard Delete
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
                setElements(prev => prev.filter(el => el.id !== selectedId));
                setSelectedId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId]);

    // Handle Global Paste for Images
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        setElements(prev => {
                            const newZ = Math.max(0, ...prev.map(p => p.zIndex)) + 1;
                            return [...prev, {
                                id: `img-paste-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, type: 'image',
                                x: Math.random() * 200 + 100, y: Math.random() * 200 + 100, w: 400, h: 400,
                                zIndex: newZ,
                                src: url, borderRadius: 0, objectFit: 'cover'
                            }];
                        });
                        e.preventDefault();
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const updateElement = (id: string, updates: Partial<CanvasElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } as any : el));
    };

    const getNewId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const getNextZ = () => Math.max(0, ...elements.map(p => p.zIndex)) + 1;

    const addText = () => {
        setElements(prev => [...prev, {
            id: getNewId('text'), type: 'text', x: 100, y: 100, w: 400, h: 100,
            zIndex: getNextZ(),
            text: 'Teks Baru', fontSize: 64, color: '#000000', fontWeight: '700', textAlign: 'center', fontFamily: 'Inter'
        }]);
    };

    const addShape = () => {
        setElements(prev => [...prev, {
            id: getNewId('shape'), type: 'shape', x: 100, y: 100, w: 200, h: 200,
            zIndex: getNextZ(),
            bgColor: '#B8860B', borderRadius: 20
        }]);
    };

    const addStickerCTA = () => {
        const shapeZ = getNextZ();
        setElements(prev => [...prev,
        { id: getNewId('shape-cta'), type: 'shape', x: 100, y: 300, w: 300, h: 80, zIndex: shapeZ, bgColor: '#E63946', borderRadius: 40 },
        { id: getNewId('text-cta'), type: 'text', x: 100, y: 315, w: 300, h: 50, zIndex: shapeZ + 1, text: 'BOOK NOW', fontSize: 32, color: '#FFFFFF', fontWeight: '900', textAlign: 'center', fontFamily: 'Inter' }
        ]);
    };

    const handleDownload = async () => {
        if (!canvasRef.current) return;
        setDownloading(true);
        setSelectedId(null); // Unselect to remove borders

        // Tunggu state React update selection
        await new Promise(r => setTimeout(r, 100));

        try {
            const canvas = await html2canvas(canvasRef.current, {
                scale: 2, // High-res
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            const url = canvas.toDataURL('image/png', 1.0);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FlyerStudio_${brand.name.replace(/\s+/g, '_')}.png`;
            a.click();
        } catch (e) {
            console.error('Download failed', e);
            alert('Gagal mendownload gambar. Coba lagi.');
        } finally {
            setDownloading(false);
        }
    };

    const selectedEl = elements.find(el => el.id === selectedId);

    // Dynamic Scaling Calculation based on screen width/height
    const wrapperRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const recalcScale = () => {
            if (!wrapperRef.current) return;
            const pw = wrapperRef.current.clientWidth;
            const ph = wrapperRef.current.clientHeight;
            const targetW = DIMS[ratio].width;
            const targetH = DIMS[ratio].height;

            const scaleW = (pw - 80) / targetW;
            const scaleH = (ph - 80) / targetH;
            setScreenScale(Math.min(scaleW, scaleH));
        };
        recalcScale();
        window.addEventListener('resize', recalcScale);
        return () => window.removeEventListener('resize', recalcScale);
    }, [ratio]);


    return (
        <div style={{ height: 'calc(100vh - 61px)', display: 'flex', flexDirection: 'column', background: '#F0F0F3', fontFamily: 'Inter' }}>
            {/* Topbar */}
            <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 16 }}>✨</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Flyer Studio <span style={{ fontSize: 10, background: '#B8860B', color: '#fff', padding: '2px 6px', borderRadius: 4, marginLeft: 6 }}>PRO</span></span>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {(['4:5', '9:16'] as FlyerRatio[]).map(r => (
                        <button key={r} onClick={() => setRatio(r)} style={{ padding: '6px 12px', background: ratio === r ? '#1a1a1a' : '#f0f0f0', color: ratio === r ? '#fff' : '#666', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            {DIMS[r].label}
                        </button>
                    ))}
                </div>

                <div style={{ fontSize: 11, color: '#888' }}>
                    💡 <b>Tip</b>: Ctrl+V untuk Paste Gambar & Text
                </div>

                <button onClick={handleDownload} disabled={downloading} style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #1a1a1a, #333)', color: '#fff', borderRadius: 6, fontWeight: 700, fontSize: 12, border: 'none', cursor: downloading ? 'wait' : 'pointer' }}>
                    {downloading ? '⏳ Rendering...' : '⬇️ Download PNG'}
                </button>
            </div>

            {/* Workspace */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Canvas Area */}
                <div ref={wrapperRef} style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                    onClick={() => setSelectedId(null)}> {/* Click outside unselects */}

                    <div
                        ref={canvasRef}
                        style={{
                            width: DIMS[ratio].width,
                            height: DIMS[ratio].height,
                            background: '#fff',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                            transform: `scale(${screenScale})`,
                            transformOrigin: 'center center',
                            transition: 'width 0.3s, height 0.3s'
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent unselect when clicking canvas bg
                    >
                        {elements.map((el) => {
                            const isSelected = selectedId === el.id;

                            return (
                                <Rnd
                                    key={el.id}
                                    bounds="parent"
                                    position={{ x: el.x, y: el.y }}
                                    size={{ width: el.w, height: el.h }}
                                    onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                                    onResizeStop={(e, direction, ref, delta, position) => {
                                        updateElement(el.id, { w: parseFloat(ref.style.width), h: parseFloat(ref.style.height), ...position });
                                    }}
                                    onClick={(e: any) => { e.stopPropagation(); setSelectedId(el.id); }}
                                    style={{
                                        zIndex: el.zIndex,
                                        outline: isSelected ? '3px solid #00BFFF' : 'none',
                                        outlineOffset: isSelected ? 2 : 0,
                                        cursor: isSelected ? 'move' : 'pointer',
                                    }}
                                    disableDragging={!isSelected && selectedId !== null} // Optimize dragging
                                >
                                    {el.type === 'image' && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={el.src} style={{ width: '100%', height: '100%', objectFit: el.objectFit, borderRadius: el.borderRadius, pointerEvents: 'none' }} alt="element" />
                                    )}
                                    {el.type === 'shape' && (
                                        <div style={{ width: '100%', height: '100%', background: el.bgColor, borderRadius: el.borderRadius, pointerEvents: 'none' }} />
                                    )}
                                    {el.type === 'text' && (
                                        <div style={{
                                            width: '100%', height: '100%',
                                            color: el.color, fontSize: el.fontSize, fontWeight: el.fontWeight,
                                            fontFamily: el.fontFamily, textAlign: el.textAlign,
                                            display: 'flex', alignItems: 'flex-start', justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                            padding: 4, lineHeight: 1.2
                                        }}>
                                            {el.text}
                                        </div>
                                    )}
                                </Rnd>
                            );
                        })}
                    </div>
                </div>

                {/* Right Sidebar - Properties */}
                <div style={{ width: 340, background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.08)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', zIndex: 10 }}>

                    {/* Add Buttons */}
                    <div>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888' }}>Tambahkan Elemen</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                            <button onClick={addText} style={{ padding: '10px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🔤 Teks</button>
                            <button onClick={addShape} style={{ padding: '10px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🟦 Persegi</button>
                            <button onClick={addStickerCTA} style={{ padding: '10px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, gridColumn: '1 / -1' }}>🔴 Stiker "BOOK NOW"</button>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

                    {/* Properties Editor */}
                    {selectedEl ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, fontWeight: 800, color: '#00BFFF' }}>⚙️ Edit {selectedEl.type.toUpperCase()}</span>
                                <button onClick={() => { setElements(prev => prev.filter(e => e.id !== selectedEl.id)); setSelectedId(null); }} style={{ background: '#FF4D4D', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>🗑️ Hapus (Del)</button>
                            </div>

                            {/* Z-Index Controls */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => updateElement(selectedEl.id, { zIndex: selectedEl.zIndex + 1 })} style={{ flex: 1, padding: 6, fontSize: 11, background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>🔼 Bawa ke Depan</button>
                                <button onClick={() => updateElement(selectedEl.id, { zIndex: Math.max(0, selectedEl.zIndex - 1) })} style={{ flex: 1, padding: 6, fontSize: 11, background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>🔽 Pindah ke Belakang</button>
                            </div>

                            {/* Specific Properties */}
                            {selectedEl.type === 'text' && (
                                <>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>Teks Isi</label>
                                    <textarea value={selectedEl.text} onChange={e => updateElement(selectedEl.id, { text: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', minHeight: 80, fontSize: 13 }} />

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div>
                                            <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Ukuran (px)</label>
                                            <input type="number" value={selectedEl.fontSize} onChange={e => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })} style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Warna Teks</label>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <input type="color" value={selectedEl.color} onChange={e => updateElement(selectedEl.id, { color: e.target.value })} style={{ width: 30, height: 30, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                                                <input type="text" value={selectedEl.color} onChange={e => updateElement(selectedEl.id, { color: e.target.value })} style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 11 }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div>
                                            <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Ketebalan (Weight)</label>
                                            <select value={selectedEl.fontWeight} onChange={e => updateElement(selectedEl.id, { fontWeight: e.target.value })} style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}>
                                                <option value="400">Normal (400)</option>
                                                <option value="600">Semi Bold (600)</option>
                                                <option value="800">Extra Bold (800)</option>
                                                <option value="900">Black (900)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Align</label>
                                            <select value={selectedEl.textAlign} onChange={e => updateElement(selectedEl.id, { textAlign: e.target.value as any })} style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}>
                                                <option value="left">Kiri</option>
                                                <option value="center">Tengah</option>
                                                <option value="right">Kanan</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedEl.type === 'shape' && (
                                <>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Warna Bentuk</label>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <input type="color" value={selectedEl.bgColor} onChange={e => updateElement(selectedEl.id, { bgColor: e.target.value })} style={{ width: 36, height: 36, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                                        <input type="text" value={selectedEl.bgColor} onChange={e => updateElement(selectedEl.id, { bgColor: e.target.value })} style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />
                                    </div>

                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginTop: 10, marginBottom: 4 }}>Radius Sudut</label>
                                    <input type="number" value={selectedEl.borderRadius} onChange={e => updateElement(selectedEl.id, { borderRadius: Number(e.target.value) })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                                </>
                            )}

                            {selectedEl.type === 'image' && (
                                <>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Object Fit (Potong/Penuh)</label>
                                    <select value={selectedEl.objectFit} onChange={e => updateElement(selectedEl.id, { objectFit: e.target.value as any })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}>
                                        <option value="cover">Penuhi Area (Cover)</option>
                                        <option value="contain">Jangan Terpotong (Contain)</option>
                                    </select>

                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginTop: 10, marginBottom: 4 }}>Radius Sudut</label>
                                    <input type="number" value={selectedEl.borderRadius} onChange={e => updateElement(selectedEl.id, { borderRadius: Number(e.target.value) })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />

                                    <div style={{ fontSize: 10, color: '#888', marginTop: 10, padding: 8, background: '#f9f9f9', borderRadius: 6 }}>
                                        💡 <b>Ganti Gambar:</b> Klik area kanvas kosong, lalu tekan Ctrl+V untuk mem-paste gambar baru. Hapus gambar lama menggunakan tombol merah di atas.
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 10px', fontSize: 12, lineHeight: 1.6 }}>
                            Pilih elemen di canvas<br />untuk mulai mengedit ukurannya.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
