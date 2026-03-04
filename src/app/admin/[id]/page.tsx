import { notFound } from 'next/navigation';
import { getItineraryById } from '@/lib/supabase/queries';
import AdminEditorWrapper from '../components/AdminEditorWrapper';
import ContentHubNav from '../components/ContentHubNav';
import MicroblogKit from '../components/MicroblogKit';
import CopywritingKit from '../components/CopywritingKit';
import FlyerKit from '../components/FlyerKit';
import FlyerStudio from '../components/FlyerStudio';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export const metadata: Metadata = {
  title: 'Admin — Content Hub',
};

export const dynamic = 'force-dynamic';

type HubTab = 'dmi' | 'microblog' | 'copywriting' | 'flyer' | 'flyer-studio';

export default async function AdminDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab: HubTab = (tab as HubTab) || 'dmi';

  const data = await getItineraryById(id);

  if (!data) {
    notFound();
  }

  return (
    <div style={{
      fontFamily: 'var(--font-inter), system-ui, sans-serif',
      background: '#F5F5F7',
      color: '#1a1a1a',
      minHeight: '100vh',
    }}>
      {/* Unified Tab Navigation — replaces old toolbar */}
      <ContentHubNav
        activeTab={activeTab}
        itineraryId={id}
        title={data.meta.title}
        brandName={data.brand.name}
        durationDays={data.meta.durationDays}
      />

      {/* Tab: Website DMI — original editor, untouched */}
      {activeTab === 'dmi' && (
        <AdminEditorWrapper initialData={data} />
      )}

      {/* Tab: Micro-Blog Carousel Kit */}
      {activeTab === 'microblog' && (
        <MicroblogKit data={data} />
      )}

      {/* Tab: Copywriting Kit */}
      {activeTab === 'copywriting' && (
        <CopywritingKit data={data} />
      )}

      {/* Tab: Flyer Maker */}
      {activeTab === 'flyer' && (
        <FlyerKit data={data} />
      )}

      {/* Tab: Flyer Studio (Inline Editor) */}
      {activeTab === 'flyer-studio' && (
        <FlyerStudio data={data} />
      )}
    </div>
  );
}
