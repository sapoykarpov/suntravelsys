'use client';

import React, { useState } from 'react';
import type { BrandProfile } from '@/types/itinerary';

interface FloatingButtonsProps {
    brand: BrandProfile;
    title?: string;
    show?: boolean;
}

export default function FloatingButtons({ brand, title = '', show = true }: FloatingButtonsProps) {
    const [showShare, setShowShare] = useState(false);

    const whatsappNumber = (brand.whatsapp || brand.contact?.whatsapp || '').replace(/[^0-9]/g, '');
    const whatsappUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi ${brand.name}, I'm interested in: ${title}`)}`
        : null;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title || 'Travel Itinerary',
                    text: `Check out this amazing trip by ${brand.name}`,
                    url: window.location.href,
                });
            } catch { /* user cancelled */ }
        } else {
            // Fallback: copy URL
            navigator.clipboard.writeText(window.location.href);
            setShowShare(true);
            setTimeout(() => setShowShare(false), 2000);
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .floating-actions {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    width: 100%;
                    max-width: 430px;
                    transform: translateX(-50%);
                    z-index: 999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    align-items: flex-end;
                    padding-right: 20px;
                    pointer-events: none;
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    opacity: ${show ? 1 : 0};
                }
                .floating-actions > * { pointer-events: auto; }
                
                .fab-btn {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none;
                }
                .fab-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 30px rgba(0,0,0,0.4);
                }
                .fab-btn:active {
                    transform: scale(0.95);
                }
                .fab-whatsapp {
                    background: #25D366;
                    color: #fff;
                }
                .fab-share {
                    background: rgba(255,255,255,0.95);
                    color: #333;
                    width: 48px;
                    height: 48px;
                }
                .fab-toast {
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    background: #333;
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-size: 13px;
                    z-index: 1000;
                    animation: fabSlideUp 0.3s ease-out;
                }
                @keyframes fabSlideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />

            <div className="floating-actions">
                {/* Share Button */}
                <button onClick={handleShare} className="fab-btn fab-share" aria-label="Share">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                </button>

                {/* WhatsApp Button */}
                {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="fab-btn fab-whatsapp" aria-label="WhatsApp">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </a>
                )}
            </div>

            {/* Toast */}
            {showShare && <div className="fab-toast">Link copied! 📋</div>}
        </>
    );
}
