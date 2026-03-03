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
                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#F4E8C1] transition-colors text-sm"
            >
                <Upload size={16} />
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
