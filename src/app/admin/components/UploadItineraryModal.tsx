'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, FileText } from 'lucide-react';

interface Props {
    onClose: () => void;
    onSuccess: (itineraryId: string) => void;
}

export default function UploadItineraryModal({ onClose, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [brandName, setBrandName] = useState('');
    const [theme, setTheme] = useState('amazing-black');
    const [style, setStyle] = useState('original');
    const [language, setLanguage] = useState('id');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const THEMES = [
        { id: 'amazing-black', name: 'Amazing Black' },
        { id: 'bento', name: 'Bento' },
        { id: 'viral-tiktok', name: 'Viral Tiktok' },
        { id: 'interactive-map', name: 'Interactive Map' },
        { id: 'conde-nast', name: 'Conde Nast' },
        { id: 'japan-editorial', name: 'Japan Editorial' },
        { id: 'scrapbook', name: 'Scrapbook' },
        { id: 'bali-andi', name: 'Bali Andi' },
        { id: 'umrah-mature', name: 'Umrah Mature' },
        { id: 'umrah-youth', name: 'Umrah Youth' },
        { id: 'umroh-event', name: 'Umroh Event' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !brandName.trim()) {
            setError('Please provide both an itinerary file and a brand name.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('brandName', brandName);
        formData.append('theme', theme);
        formData.append('style', style);
        formData.append('language', language);

        try {
            const res = await fetch('/api/upload-itinerary', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload document');
            }

            onSuccess(data.data.itineraryId);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">Upload Itinerary</h2>
                        <p className="text-sm text-white/50 mt-1">Let AI parse your document into a digital magazine.</p>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-2 -mr-2" disabled={loading}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* File Upload Area */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Itinerary File (PDF, DOCX, TXT, Image)</label>
                        <div
                            onClick={() => !loading && fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                                ${file ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-white/20 hover:border-white/40 hover:bg-white/5 bg-black/20'}
                                ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt,image/*"
                            />

                            {file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="text-[#D4AF37]" size={32} />
                                    <div>
                                        <p className="text-sm font-medium text-[#D4AF37]">{file.name}</p>
                                        <p className="text-xs text-white/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="text-xs text-white/50 hover:text-white underline mt-2"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-white/50">
                                    <Upload size={32} className="mb-2" />
                                    <p className="text-sm text-white/70">Click to browse or drag and drop</p>
                                    <p className="text-xs">Supports PDF, Word, TXT, and Images</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-white/70 mb-1">Brand / Agency Name *</label>
                            <input
                                type="text"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                placeholder="e.g. LuxeTravel Architect"
                                disabled={loading}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Target Theme</label>
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                disabled={loading}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none"
                            >
                                {THEMES.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                disabled={loading}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none"
                            >
                                <option value="id">Indonesian</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-white/70 mb-1">Writing Style</label>
                            <div className="flex gap-2">
                                {['original', 'friendly', 'persuasive', 'energetic'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStyle(s)}
                                        disabled={loading}
                                        className={`flex-1 capitalize text-xs py-2 rounded-lg border transition-colors ${style === s
                                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                                                : 'bg-black/50 border-white/10 text-white/50 hover:border-white/30'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-white/10 mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${loading
                                    ? 'bg-[#D4AF37]/50 text-black/50 cursor-wait'
                                    : 'bg-[#D4AF37] text-black hover:bg-[#F4E8C1]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Parsing with AI...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Generate Itinerary
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
