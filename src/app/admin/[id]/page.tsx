import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getItineraryById } from '@/lib/supabase/queries';
import AdminEditorWrapper from '../components/AdminEditorWrapper';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Admin — Edit Itinerary',
};

export const dynamic = 'force-dynamic';

export default async function AdminDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getItineraryById(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="admin-detail">
      <style dangerouslySetInnerHTML={{
        __html: `
        .admin-detail {
          font-family: var(--font-inter), system-ui, sans-serif;
          background: #F5F5F7;
          color: #1a1a1a;
          min-height: 100vh;
        }

        .admin-toolbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          padding: 16px 24px;
        }

        .toolbar-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-link {
          color: rgba(0,0,0,0.5);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }

        .back-link:hover {
          color: #D4AF37;
        }

        .toolbar-title {
          font-size: 16px;
          font-weight: 600;
        }

        .toolbar-subtitle {
          font-size: 12px;
          color: rgba(0,0,0,0.4);
        }
      `}} />

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="toolbar-inner">
          <div className="toolbar-left">
            <Link href="/admin" className="back-link">← Dashboard</Link>
            <div>
              <div className="toolbar-title">{data.meta.title}</div>
              <div className="toolbar-subtitle">{data.brand.name} • {data.meta.durationDays} Days</div>
            </div>
          </div>
        </div>
      </div>

      <AdminEditorWrapper initialData={data} />
    </div>
  );
}
