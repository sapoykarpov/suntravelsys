'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type HubTab = 'dmi' | 'microblog' | 'copywriting' | 'flyer';

interface ContentHubNavProps {
    activeTab: HubTab;
    itineraryId: string;
    title: string;
    brandName: string;
    durationDays: number;
}

const TABS: { id: HubTab; label: string; icon: string; badge?: string }[] = [
    { id: 'dmi', label: 'Website DMI', icon: '🌐' },
    { id: 'microblog', label: 'Micro-Blog', icon: '📱', badge: 'New' },
    { id: 'copywriting', label: 'Copywriting', icon: '✍️', badge: 'New' },
    { id: 'flyer', label: 'Flyer Maker', icon: '✦', badge: 'Beta' },
];

export default function ContentHubNav({
    activeTab,
    itineraryId,
    title,
    brandName,
    durationDays,
}: ContentHubNavProps) {
    const router = useRouter();

    const handleTabChange = (tab: HubTab) => {
        const url = tab === 'dmi'
            ? `/admin/${itineraryId}`
            : `/admin/${itineraryId}?tab=${tab}`;
        router.push(url);
    };

    return (
        <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .hub-nav-inner {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    align-items: stretch;
                    gap: 0;
                }

                .hub-nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 24px 14px 0;
                    border-right: 1px solid rgba(0,0,0,0.07);
                    margin-right: 24px;
                    flex-shrink: 0;
                }

                .hub-back-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: rgba(0,0,0,0.4);
                    font-size: 13px;
                    text-decoration: none;
                    padding: 6px 10px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    border: none;
                    background: none;
                    cursor: pointer;
                }
                .hub-back-btn:hover { color: #B8860B; background: rgba(184,134,11,0.06); }

                .hub-title-group { display: flex; flex-direction: column; }
                .hub-title { font-size: 15px; font-weight: 700; color: #1a1a1a; line-height: 1.2; }
                .hub-subtitle { font-size: 11px; color: rgba(0,0,0,0.4); margin-top: 2px; }

                .hub-tabs {
                    display: flex;
                    align-items: stretch;
                    gap: 2px;
                    flex: 1;
                }

                .hub-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 0 20px;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                    white-space: nowrap;
                    border-bottom: 2.5px solid transparent;
                    color: rgba(0,0,0,0.45);
                    height: 56px;
                }

                .hub-tab-btn:hover {
                    color: #B8860B;
                    background: rgba(184,134,11,0.04);
                }

                .hub-tab-btn.active {
                    color: #B8860B;
                    border-bottom-color: #B8860B;
                    background: rgba(184,134,11,0.04);
                }

                .hub-tab-icon { font-size: 15px; line-height: 1; }

                .hub-tab-badge {
                    background: linear-gradient(135deg, #B8860B, #D4AF37);
                    color: #fff;
                    font-size: 8px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    padding: 2px 6px;
                    border-radius: 6px;
                    text-transform: uppercase;
                }

                .hub-kit-label {
                    margin-left: auto;
                    padding: 0 0 0 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: rgba(0,0,0,0.3);
                    text-transform: uppercase;
                    flex-shrink: 0;
                    border-left: 1px solid rgba(0,0,0,0.06);
                    padding-left: 24px;
                }
            ` }} />

            <div className="hub-nav-inner">
                {/* Left: Back + Title */}
                <div className="hub-nav-brand">
                    <button onClick={() => router.push('/admin')} className="hub-back-btn">
                        ← Dashboard
                    </button>
                    <div className="hub-title-group">
                        <div className="hub-title" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {title}
                        </div>
                        <div className="hub-subtitle">{brandName} · {durationDays} Days</div>
                    </div>
                </div>

                {/* Center: Tabs */}
                <div className="hub-tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`hub-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            <span className="hub-tab-icon">{tab.icon}</span>
                            {tab.label}
                            {tab.badge && <span className="hub-tab-badge">{tab.badge}</span>}
                        </button>
                    ))}
                </div>

                {/* Right: Label */}
                <div className="hub-kit-label">
                    ✦ Promo Kit
                </div>
            </div>
        </div>
    );
}
