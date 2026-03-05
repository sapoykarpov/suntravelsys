'use client';

import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import BrandManagerModal from './BrandManagerModal';

export default function BrandManagerButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all shadow-sm active:scale-95 text-base"
            >
                <Palette size={20} />
                Manage Brands
            </button>

            {isOpen && (
                <BrandManagerModal
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
