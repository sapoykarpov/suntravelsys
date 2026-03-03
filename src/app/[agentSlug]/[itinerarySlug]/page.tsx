import { notFound } from 'next/navigation';
import { getPublishedItinerary } from '@/lib/supabase/queries';
import DMIViewer from '@/components/DMIViewer';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        agentSlug: string;
        itinerarySlug: string;
    }>;
}

/**
 * Dynamic metadata for SEO — each DMI gets its own title/description.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { agentSlug, itinerarySlug } = await params;
    const data = await getPublishedItinerary(agentSlug, itinerarySlug);

    if (!data) {
        return { title: 'Itinerary Not Found' };
    }

    return {
        title: `${data.meta.title} — ${data.brand.name}`,
        description: `${data.meta.subtitle}. ${data.meta.durationDays} Days curated by ${data.brand.name}.`,
        openGraph: {
            title: `${data.meta.title} — ${data.brand.name}`,
            description: data.meta.subtitle,
            images: data.days[0]?.heroImage ? [data.days[0].heroImage] : [],
        },
    };
}

/**
 * Public DMI Viewer Page
 * URL: /luxetravel/kyoto-zen-experience
 */
export default async function ItineraryPage({ params }: PageProps) {
    const { agentSlug, itinerarySlug } = await params;
    const data = await getPublishedItinerary(agentSlug, itinerarySlug);

    if (!data) {
        notFound();
    }

    return <DMIViewer data={data} />;
}
