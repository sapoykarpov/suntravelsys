'use client';

import React from 'react';
import type { BrandProfile } from '@/types/itinerary';

interface BrandFooterProps {
    brand: BrandProfile;
    accentColor?: string;
    darkMode?: boolean;
}

export default function BrandFooter({ brand, accentColor, darkMode = true }: BrandFooterProps) {
    const accent = accentColor || brand.primaryColor || '#D4AF37';
    const bg = darkMode ? '#0a0a0a' : '#f5f5f5';
    const textPrimary = darkMode ? '#fff' : '#1a1a1a';
    const textSecondary = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    const socials = [
        { key: 'instagram', url: brand.instagram || brand.contact?.instagram, icon: '📸' },
        { key: 'whatsapp', url: brand.whatsapp || brand.contact?.whatsapp, icon: '💬', prefix: 'https://wa.me/' },
        { key: 'email', url: brand.email || brand.contact?.email, icon: '✉️', prefix: 'mailto:' },
        { key: 'website', url: brand.website || brand.contact?.website, icon: '🌐' },
        { key: 'facebook', url: brand.facebook, icon: '👤' },
        { key: 'tiktok', url: brand.tiktok, icon: '🎵' },
    ].filter(s => s.url);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .brand-footer-section {
                    background: ${bg};
                    padding: 80px 24px 40px;
                    text-align: center;
                    border-top: 1px solid ${borderColor};
                }
                .brand-footer-logo {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    object-fit: cover;
                    margin: 0 auto 20px;
                    border: 2px solid ${accent};
                }
                .brand-footer-initial {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: 300;
                    color: ${accent};
                    border: 2px solid ${accent};
                    background: ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'};
                    font-family: serif;
                }
                .brand-footer-name {
                    font-size: 28px;
                    font-weight: 300;
                    color: ${textPrimary};
                    margin-bottom: 6px;
                    font-family: var(--font-cormorant, serif), serif;
                }
                .brand-footer-tagline {
                    font-size: 13px;
                    color: ${textSecondary};
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 30px;
                }
                .brand-footer-socials {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-bottom: 30px;
                }
                .brand-footer-social-link {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 30px;
                    font-size: 12px;
                    color: ${textSecondary};
                    text-decoration: none;
                    border: 1px solid ${borderColor};
                    transition: all 0.3s;
                }
                .brand-footer-social-link:hover {
                    border-color: ${accent};
                    color: ${accent};
                }
                .brand-footer-contact {
                    font-size: 13px;
                    color: ${textSecondary};
                    line-height: 2;
                }
                .brand-footer-contact a {
                    color: ${accent};
                    text-decoration: none;
                }
                .powered-by {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid ${borderColor};
                    font-size: 11px;
                    color: ${darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'};
                    letter-spacing: 1px;
                }
                .powered-by span {
                    color: ${accent};
                    font-weight: 600;
                }
            `}} />

            <footer className="brand-footer-section">
                {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="brand-footer-logo" />
                ) : (
                    <div className="brand-footer-initial">{brand.name.charAt(0)}</div>
                )}

                <div className="brand-footer-name">{brand.name}</div>
                {brand.tagline && <div className="brand-footer-tagline">{brand.tagline}</div>}

                {socials.length > 0 && (
                    <div className="brand-footer-socials">
                        {socials.map(s => {
                            let href = s.url!;
                            if (s.prefix && !href.startsWith('http') && !href.startsWith('mailto:')) {
                                href = s.prefix + href.replace(/[^0-9a-zA-Z@.]/g, '');
                            }
                            return (
                                <a key={s.key} href={href} target="_blank" rel="noreferrer" className="brand-footer-social-link">
                                    <span>{s.icon}</span> {s.key}
                                </a>
                            );
                        })}
                    </div>
                )}

                {(brand.phone || brand.contact?.phone) && (
                    <div className="brand-footer-contact">
                        📞 <a href={`tel:${brand.phone || brand.contact?.phone}`}>{brand.phone || brand.contact?.phone}</a>
                    </div>
                )}

                <div className="powered-by">
                    Powered by <span>SunTravelSys</span>
                </div>
            </footer>
        </>
    );
}
