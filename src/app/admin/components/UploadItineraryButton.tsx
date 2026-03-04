'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import UploadItineraryModal from './UploadItineraryModal';
import { useRouter } from 'next/navigation';

export default function UploadItineraryButton() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = (itineraryId: string) => {
        setIsOpen(false);
        // Refresh the server component to show the new itinerary in the list
        router.refresh();
        // Could optionally navigate directly to the new itinerary:
        // router.push(`/admin/${itineraryId}`);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#F4E8C1] transition-all shadow-lg hover:shadow-[#D4AF37]/20 active:scale-95 text-base"
            >
                <Upload size={20} />
                Upload Document
            </button>

            {isOpen && (
                <UploadItineraryModal
                    onClose={() => setIsOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}
