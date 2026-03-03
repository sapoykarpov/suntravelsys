'use client';

import { useState } from 'react';
import type { ItineraryPayload } from '@/types/itinerary';
import EditorSidebar from './EditorSidebar';
import DMIViewer from '@/components/DMIViewer';

interface AdminEditorWrapperProps {
    initialData: ItineraryPayload;
}

export default function AdminEditorWrapper({ initialData }: AdminEditorWrapperProps) {
    const [data, setData] = useState<ItineraryPayload>(initialData);

    const previewUrl = `/${data.brand.name.toLowerCase().replace(/\s+/g, '-')}/${data.id}`;

    const handleUpdate = (updatedData: ItineraryPayload) => {
        setData(updatedData);
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-editor-grid {
                    display: grid;
                    grid-template-columns: 1fr 420px;
                    gap: 0;
                    height: calc(100vh - 73px);
                    background: #F0F0F2;
                }

                @media (max-width: 1200px) {
                    .admin-editor-grid {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                }

                .preview-pane {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(145deg, #E8E8EC 0%, #F0F0F2 50%, #E8E8EC 100%);
                    display: flex;
                    flex-direction: column;
                }

                .preview-scroll-area {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 40px 20px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.08) transparent;
                }

                .preview-device-frame {
                    width: 100%;
                    max-width: 430px;
                    background: #000;
                    border-radius: 40px;
                    border: 8px solid #2a2a2a;
                    box-shadow:
                        0 0 0 1px rgba(0,0,0,0.1),
                        0 25px 80px rgba(0,0,0,0.25),
                        inset 0 0 0 1px rgba(255,255,255,0.03);
                    overflow: hidden;
                    min-height: 750px;
                    display: flex;
                    flex-direction: column;
                    transform: translateZ(0);
                }

                /* Notch */
                .preview-device-frame::before {
                    content: '';
                    display: block;
                    width: 120px;
                    height: 28px;
                    background: #2a2a2a;
                    border-radius: 0 0 16px 16px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 10;
                }

                .preview-badge {
                    position: absolute;
                    top: 16px;
                    right: 20px;
                    z-index: 50;
                    background: rgba(212, 175, 55, 0.95);
                    color: #000;
                    padding: 5px 14px;
                    border-radius: 20px;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    box-shadow: 0 4px 16px rgba(212,175,55,0.3);
                }
                `
            }} />

            <div className="admin-editor-grid">
                {/* Main Preview */}
                <div className="preview-pane">
                    <div className="preview-badge">Live Preview</div>
                    <div className="preview-scroll-area">
                        <div className="preview-device-frame">
                            <div className="@container w-full h-full">
                                <DMIViewer data={data} key={data.theme} isPreview={true} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <EditorSidebar
                    itinerary={data}
                    previewUrl={previewUrl}
                    onUpdate={handleUpdate}
                />
            </div>
        </>
    );
}
