'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, FileText, ChevronDown, Check, Search } from 'lucide-react';
import { getClients } from '../actions';

interface Props {
    onClose: () => void;
    onSuccess: (itineraryId: string) => void;
}

export default function UploadItineraryModal({ onClose, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [brandName, setBrandName] = useState('');
    const [clientId, setClientId] = useState('');
    const [theme, setTheme] = useState('amazing-black');
    const [style, setStyle] = useState('original');
    const [language, setLanguage] = useState('id');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Brand Dropdown State
    const [clients, setClients] = useState<any[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const STYLES = [
        { id: 'original', label: 'Original', icon: '📄' },
        { id: 'friendly', label: 'Friendly', icon: '😊' },
        { id: 'persuasive', label: 'Persuasive', icon: '🔥' },
        { id: 'energetic', label: 'Energetic', icon: '⚡' },
    ];

    useEffect(() => {
        const fetchClients = async () => {
            const data = await getClients();
            setClients(data);
        };
        fetchClients();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredClients = clients.filter(c =>
        c.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        // Fallback for brand name if manually typed or selected
        const finalBrandName = brandName || (clientId ? clients.find(c => c.id === clientId)?.brand_name : '');

        if (!file || !finalBrandName) {
            setError('Please provide both an itinerary file and select a brand.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('brandName', finalBrandName);
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
        <div className="fixed inset-0 bg-[#0F0F12]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            {/* Modal Container */}
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-[0_0_80px_rgba(0,0,0,0.3)] border border-white/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Container */}
                <div className="px-10 pt-10 pb-6 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Create Itinerary</h2>
                            <p className="text-sm font-medium text-black/40">Design a premium digital magazine with AI.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-black/5 text-black/40 hover:text-black hover:bg-black/10 transition-all shrink-0"
                            disabled={loading}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto px-10 pb-10 flex-1 custom-scrollbar">
                    <form id="upload-form" onSubmit={handleSubmit} className="space-y-8 mt-2">

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
                                <X size={16} strokeWidth={3} className="shrink-0" />
                                <span className="font-bold">{error}</span>
                            </div>
                        )}

                        {/* Step 1: File Upload */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-[10px] font-black">1</span>
                                <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Itinerary Document</label>
                            </div>

                            <div
                                onClick={() => !loading && fileInputRef.current?.click()}
                                className={`relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                                    ${file
                                        ? 'border-emerald-500/50 bg-emerald-50/30'
                                        : 'border-black/5 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30'
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
                                    <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                            <FileText size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-800 line-clamp-1 max-w-[300px]">{file.name}</p>
                                            <p className="text-xs text-slate-500 font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-[10px] font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest mt-2"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 group-hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                                            <Upload size={20} strokeWidth={2} className="text-black/30 group-hover:text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-700">Drop itinerary here</p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, Word, or Images</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Brand Dropdown */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-[10px] font-black">2</span>
                                <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Select Brand Profile</label>
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <div
                                    onClick={() => !loading && setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full bg-gray-50/50 border rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all
                                        ${isDropdownOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-black/5 hover:border-black/10'}
                                        ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <span className={`text-sm font-bold ${brandName ? 'text-black' : 'text-black/30'}`}>
                                        {brandName || 'Choose or type a brand name...'}
                                    </span>
                                    <ChevronDown size={18} className={`text-black/30 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/10 rounded-2xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="p-3 border-b border-black/5 bg-gray-50/50 flex items-center gap-2">
                                            <Search size={14} className="text-black/40" />
                                            <input
                                                autoFocus
                                                type="text"
                                                className="bg-transparent border-none outline-none text-xs font-bold w-full p-1"
                                                placeholder="Search or type brand name..."
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setBrandName(e.target.value);
                                                }}
                                            />
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto">
                                            {filteredClients.map((c) => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => {
                                                        setBrandName(c.brand_name);
                                                        setClientId(c.id);
                                                        setIsDropdownOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="px-5 py-3 hover:bg-black/5 flex items-center justify-between cursor-pointer transition-all border-b border-black/5 last:border-none"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {c.logo_url ? (
                                                            <img src={c.logo_url} className="w-6 h-6 rounded bg-gray-100 object-contain" />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded bg-black/5 flex items-center justify-center text-[10px] font-black text-black/20">
                                                                {c.brand_name[0]}
                                                            </div>
                                                        )}
                                                        <span className="text-xs font-bold text-black">{c.brand_name}</span>
                                                    </div>
                                                    {brandName === c.brand_name && <Check size={14} className="text-emerald-500" />}
                                                </div>
                                            ))}
                                            {filteredClients.length === 0 && searchQuery && (
                                                <div className="px-5 py-4 text-xs font-medium text-black/40 italic">
                                                    Hit Enter to use "{searchQuery}" as new brand
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 3 & 4: Theme & Language */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-[10px] font-black">3</span>
                                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Visual Theme</label>
                                </div>
                                <div className="relative">
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        disabled={loading}
                                        className="w-full bg-gray-50/50 border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold text-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer"
                                    >
                                        {THEMES.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black/30" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-[10px] font-black">4</span>
                                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Language</label>
                                </div>
                                <div className="relative">
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        disabled={loading}
                                        className="w-full bg-gray-50/50 border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold text-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer"
                                    >
                                        <option value="id">🇮🇩 Indonesian</option>
                                        <option value="en">🇺🇸 English</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black/30" />
                                </div>
                            </div>
                        </div>

                        {/* Step 5: Writing Narrative */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-[10px] font-black">5</span>
                                <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Writing Narrative Style</label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {STYLES.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setStyle(s.id)}
                                        disabled={loading}
                                        className={`px-6 py-4 rounded-2xl text-xs font-black flex items-center gap-2 transition-all
                                            ${style === s.id
                                                ? 'bg-[#1A1A1A] text-white shadow-xl shadow-black/10 scale-[1.03]'
                                                : 'bg-gray-50 text-black/40 hover:bg-gray-100 hover:text-black hover:scale-[1.01]'
                                            }`}
                                    >
                                        <span className="text-base">{s.icon}</span>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer Container */}
                <div className="px-10 py-6 border-t border-black/5 shrink-0 bg-gray-50/30">
                    <button
                        type="submit"
                        form="upload-form"
                        disabled={loading || !file || !brandName}
                        className={`w-full py-5 rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all transform active:scale-95 z-20 relative
                            ${loading
                                ? 'bg-black/5 text-black/20 cursor-wait'
                                : (!file || !brandName)
                                    ? 'bg-black/5 text-black/10 cursor-not-allowed'
                                    : 'bg-[#1A1A1A] text-white hover:bg-blue-600 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-blue-500/20 hover:-translate-y-1'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} strokeWidth={3} />
                                <span>PROCESSING AI...</span>
                            </>
                        ) : (
                            <>
                                <span>GENERATE ITINERARY</span>
                                <Check size={18} strokeWidth={3} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
