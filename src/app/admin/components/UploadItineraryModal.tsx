'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, FileText, ChevronDown } from 'lucide-react';

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
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-6 md:p-8 lg:p-12 overflow-y-auto">
            {/* Modal Container - dengan spacing lebih longgar */}
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300 my-8 mx-4 md:mx-8">

                {/* Header */}
                <div className="px-8 md:px-12 pt-10 pb-6 flex items-center justify-between border-b border-slate-100">
                    <div className="space-y-1 pr-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Create Itinerary</h2>
                        <p className="text-base md:text-lg text-slate-500 font-medium">Design a premium digital magazine with AI.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all shrink-0"
                        disabled={loading}
                    >
                        <X size={24} strokeWidth={2} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto custom-scrollbar px-8 md:px-12 pb-10 md:pb-12 max-h-[calc(90vh-200px)]">
                    <form onSubmit={handleSubmit} className="space-y-10 mt-6">

                        {error && (
                            <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-4 animate-in slide-in-from-top-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <X size={18} strokeWidth={3} />
                                </div>
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        {/* Section 1: File Upload */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold">1</span>
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Document Source</label>
                            </div>

                            <div
                                onClick={() => !loading && fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); }}
                                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                        setFile(e.dataTransfer.files[0]);
                                        setError('');
                                    }
                                }}
                                className={`relative group border-2 border-dashed rounded-3xl p-10 md:p-16 text-center transition-all cursor-pointer
                                    ${file
                                        ? 'border-emerald-500 bg-emerald-50/50'
                                        : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
                                    }
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
                                    <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in-95">
                                        <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                            <FileText size={48} strokeWidth={1.5} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xl font-bold text-slate-800 truncate max-w-md">{file.name}</p>
                                            <p className="text-base text-slate-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="mt-2 text-sm font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                                        >
                                            Remove File
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-5 group-hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                            <Upload size={32} strokeWidth={1.5} className="text-slate-400 group-hover:text-blue-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xl font-bold text-slate-700">Drop itinerary here</p>
                                            <p className="text-base text-slate-400">PDF, Word, or Images</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Brand Name */}
                            <div className="space-y-3 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold">2</span>
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Brand Identity</label>
                                </div>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    placeholder="e.g. Luxury Travel Co."
                                    disabled={loading}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                />
                            </div>

                            {/* Theme */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold">3</span>
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Visual Theme</label>
                                </div>
                                <div className="relative group">
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        disabled={loading}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all"
                                    >
                                        {THEMES.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Language */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold">4</span>
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Language</label>
                                </div>
                                <div className="relative group">
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        disabled={loading}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="id">Indonesian (🇮🇩)</option>
                                        <option value="en">English (🇺🇸)</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Style Narrative */}
                            <div className="space-y-3 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold">5</span>
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Writing Narrative</label>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {['original', 'friendly', 'persuasive', 'energetic'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStyle(s)}
                                            disabled={loading}
                                            className={`px-6 py-4 rounded-2xl text-base font-bold capitalize transition-all duration-200 border
                                                ${style === s
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-8 border-t border-slate-100 mt-10">
                            <button
                                type="submit"
                                disabled={loading || !file || !brandName}
                                className={`w-full py-6 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
                                    ${loading
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : (!file || !brandName)
                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                            : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-blue-900/20 hover:-translate-y-1'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={28} strokeWidth={2} />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Generate Itinerary</span>
                                        <Upload size={24} strokeWidth={2} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}