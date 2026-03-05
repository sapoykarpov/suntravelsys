'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Plus, Edit2, Globe, Phone, Instagram, Facebook, Youtube, Linkedin, Mail, Twitter, ChevronRight } from 'lucide-react';
import { upsertClient, getClients } from '../actions';

interface BrandManagerModalProps {
    onClose: () => void;
}

const INITIAL_CLIENT = {
    slug: '',
    brand_name: '',
    tagline: '',
    primary_color: '#D4AF37',
    secondary_color: '#1A1A1A',
    logo_url: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    twitter_x: '',
    youtube: '',
    linkedin: '',
};

export default function BrandManagerModal({ onClose }: BrandManagerModalProps) {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [selectedClient, setSelectedClient] = useState<any>(INITIAL_CLIENT);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        const data = await getClients();
        setClients(data);
        setLoading(false);
    };

    const handleEdit = (client: any) => {
        setSelectedClient(client);
        setView('edit');
        setError(null);
    };

    const handleAddNew = () => {
        setSelectedClient(INITIAL_CLIENT);
        setView('edit');
        setError(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const result = await upsertClient(selectedClient);
            if (result.success) {
                await fetchClients();
                setView('list');
            } else {
                setError(result.error || 'Failed to save client');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSelectedClient((prev: any) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-[28px] shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="px-10 pt-10 pb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
                                {view === 'list' ? 'Brand Profiles' : (selectedClient.id ? 'Edit Brand' : 'New Brand')}
                            </h2>
                            <p className="text-[#64748B] text-sm mt-1.5 font-medium">
                                {view === 'list'
                                    ? 'Manage your travel agency profiles and visual identities'
                                    : 'Complete the profile details below to update your brand kit.'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="shrink-0 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content — consistent horizontal padding */}
                <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
                            <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Synchronizing...</p>
                        </div>
                    ) : view === 'list' ? (
                        <div className="space-y-4">
                            {clients.map((client) => (
                                <div
                                    key={client.id}
                                    onClick={() => handleEdit(client)}
                                    className="group relative bg-white border border-slate-100 rounded-2xl pl-10 pr-6 py-5 flex items-center gap-5 hover:shadow-lg hover:border-[#D4AF37]/40 transition-all cursor-pointer overflow-hidden"
                                >
                                    {/* Left Accent */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D4AF37]/30 group-hover:bg-[#D4AF37] transition-all duration-300 rounded-l-2xl" />

                                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {client.logo_url ? (
                                            <img src={client.logo_url} alt={client.brand_name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <span className="text-2xl font-black text-slate-200">{client.brand_name[0]}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#D4AF37] transition-colors truncate">{client.brand_name}</h3>
                                        <p className="text-slate-400 font-mono text-xs mt-0.5">slug: {client.slug}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {client.whatsapp && <span className="text-[9px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full">WhatsApp</span>}
                                            {client.instagram && <span className="text-[9px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">Instagram</span>}
                                        </div>
                                    </div>

                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                            ))}

                            <button
                                onClick={handleAddNew}
                                className="w-full border-2 border-dashed border-slate-100 rounded-2xl py-8 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-amber-50/30 transition-all group"
                            >
                                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span className="font-bold text-sm">Add New Brand</span>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-12 pb-10">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl flex items-center gap-3 animate-shake font-bold">
                                    <div className="w-1.5 h-6 bg-rose-400 rounded-full" />
                                    {error}
                                </div>
                            )}

                            {/* Section: Core Profile */}
                            <div className="space-y-8">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em]">Identity Profile</label>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <span className="text-[15px] font-bold text-slate-700 ml-1">Brand Name</span>
                                        <input
                                            required
                                            name="brand_name"
                                            value={selectedClient.brand_name}
                                            onChange={handleChange}
                                            placeholder="Enter agency name"
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-[18px] px-6 py-4 outline-none focus:ring-4 focus:ring-[#D4AF37]/5 focus:border-[#D4AF37] transition-all text-[#0F172A] font-semibold text-lg"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-2">
                                        <div className="space-y-3">
                                            <span className="text-[15px] font-bold text-slate-700 ml-1">Slug</span>
                                            <input
                                                required
                                                name="slug"
                                                value={selectedClient.slug}
                                                onChange={handleChange}
                                                placeholder="agency-id"
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-[18px] px-6 py-4 outline-none focus:border-[#D4AF37] transition-all font-mono text-slate-500"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <span className="text-[15px] font-bold text-slate-700 ml-1">Color Theme</span>
                                            <div className="flex gap-4">
                                                <div className="relative w-14 h-14 rounded-2xl border border-slate-100 overflow-hidden shadow-sm shrink-0">
                                                    <input
                                                        type="color"
                                                        name="primary_color"
                                                        value={selectedClient.primary_color || '#D4AF37'}
                                                        onChange={handleChange}
                                                        className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer"
                                                    />
                                                </div>
                                                <input
                                                    name="primary_color"
                                                    value={selectedClient.primary_color || '#D4AF37'}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-[18px] px-4 py-4 outline-none text-xs font-mono uppercase tracking-widest text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Assets & Contact */}
                            <div className="space-y-8 pt-4">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em]">Assets & Connection</label>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <span className="text-[15px] font-bold text-slate-700 ml-1">Logo URL</span>
                                        <input
                                            name="logo_url"
                                            value={selectedClient.logo_url || ''}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-[18px] px-6 py-4 outline-none focus:border-[#D4AF37] transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <span className="text-[15px] font-bold text-slate-700 ml-1">WhatsApp</span>
                                            <input
                                                name="whatsapp"
                                                value={selectedClient.whatsapp || ''}
                                                onChange={handleChange}
                                                placeholder="+62..."
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-[18px] px-6 py-4 outline-none focus:border-[#D4AF37] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <span className="text-[15px] font-bold text-slate-700 ml-1">Instagram</span>
                                            <input
                                                name="instagram"
                                                value={selectedClient.instagram || ''}
                                                onChange={handleChange}
                                                placeholder="@username"
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-[18px] px-6 py-4 outline-none focus:border-[#D4AF37] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer — only in edit view */}
                {view === 'edit' && (
                    <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setView('list')}
                            className="text-slate-400 hover:text-slate-700 font-semibold text-sm transition-all flex items-center gap-1.5"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#0F172A] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-black transition-all shadow-md flex items-center gap-2.5 disabled:opacity-50 active:scale-95 text-sm"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin text-[#D4AF37]" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
