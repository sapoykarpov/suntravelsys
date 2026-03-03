'use client';

import React from 'react';
import { ItineraryPayload } from '@/types/itinerary';
import ThemeAmazingBlack from './themes/ThemeAmazingBlack';
import ThemeBento from './themes/ThemeBento';
import ThemeViralTiktok from './themes/ThemeViralTiktok';
import ThemeInteractiveMap from './themes/ThemeInteractiveMap';
import ThemeCondeNast from './themes/ThemeCondeNast';
import ThemeJapanEditorial from './themes/ThemeJapanEditorial';
import ThemeScrapbook from './themes/ThemeScrapbook';
import ThemeBaliAndi from './themes/ThemeBaliAndi';
import ThemeUmrahMature from './themes/ThemeUmrahMature';
import ThemeUmrahYouth from './themes/ThemeUmrahYouth';
import ThemeUmrohEvent from './themes/ThemeUmrohEvent';
import FloatingButtons from './shared/FloatingButtons';
import BrandFooter from './shared/BrandFooter';

interface Props {
    data: ItineraryPayload;
    /** If true, hide floating buttons (used in admin preview) */
    isPreview?: boolean;
}

// Map themes to whether they use dark mode
const DARK_THEMES = new Set([
    'amazing-black', 'bali-andi', 'viral-tiktok',
    'umrah-mature', 'umroh-event',
]);

export default function DMIViewer({ data, isPreview = false }: Props) {
    const isDark = DARK_THEMES.has(data.theme);
    const [isCoverVisible, setIsCoverVisible] = React.useState(true);
    const [showFloating, setShowFloating] = React.useState(false);
    const observerRef = React.useRef<IntersectionObserver | null>(null);

    React.useEffect(() => {
        const marker = document.getElementById('hero-marker');
        if (marker) {
            observerRef.current = new IntersectionObserver(([entry]) => {
                // If marker is intersecting, we are at the top (cover visible)
                setIsCoverVisible(entry.isIntersecting);
                setShowFloating(!entry.isIntersecting);
            }, {
                threshold: 0,
                // Optional: add a bit of margin if we want it to show/hide later
                rootMargin: '0px 0px -10px 0px'
            });
            observerRef.current.observe(marker);
        } else {
            setShowFloating(true);
            setIsCoverVisible(false);
        }

        return () => observerRef.current?.disconnect();
    }, [data.theme]);

    const renderTheme = () => {
        const themeProps = {
            data,
            isCoverVisible: !showFloating, // Complementary to showFloating logic
            scrollProgress: 0 // Placeholder if needed
        };

        switch (data.theme) {
            case 'amazing-black': return <ThemeAmazingBlack {...themeProps} />;
            case 'bento': return <ThemeBento {...themeProps} />;
            case 'viral-tiktok': return <ThemeViralTiktok {...themeProps} />;
            case 'interactive-map': return <ThemeInteractiveMap {...themeProps} />;
            case 'conde-nast': return <ThemeCondeNast {...themeProps} />;
            case 'japan-editorial': return <ThemeJapanEditorial {...themeProps} />;
            case 'scrapbook': return <ThemeScrapbook {...themeProps} />;
            case 'bali-andi': return <ThemeBaliAndi {...themeProps} />;
            case 'umrah-mature': return <ThemeUmrahMature {...themeProps} />;
            case 'umrah-youth': return <ThemeUmrahYouth {...themeProps} />;
            case 'umroh-event': return <ThemeUmrohEvent {...themeProps} />;
            default: return <ThemeAmazingBlack {...themeProps} />;
        }
    };

    return (
        <div className="dmi-viewer-root" style={{ position: 'relative' }}>
            <div id="hero-marker" style={{ position: 'absolute', top: 0, height: '10px', width: '100%', pointerEvents: 'none', zIndex: -1 }} />
            <div className="dmi-theme-wrapper">
                {renderTheme()}
            </div>

            {/* Brand Profile & Footer — appended to every theme */}
            <BrandFooter
                brand={data.brand}
                accentColor={data.brand.primaryColor}
                darkMode={isDark}
            />

            {/* Floating Share + WhatsApp — ALWAYS shown but contained in frame */}
            <FloatingButtons
                brand={data.brand}
                title={data.meta.title}
                show={showFloating}
            />
        </div>
    );
}
