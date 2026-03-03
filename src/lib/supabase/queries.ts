import { createServerClient } from './server';
import type { ItineraryPayload, BrandProfile } from '@/types/itinerary';

/**
 * Fetches a published itinerary by client slug + itinerary slug.
 * Used by the public-facing DMI viewer page.
 */
export async function getPublishedItinerary(
    agentSlug: string,
    itinerarySlug: string
): Promise<ItineraryPayload | null> {
    const supabase = createServerClient();

    // 1. Find the client by slug
    const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('slug', agentSlug)
        .single<ClientRow>();

    if (!client) return null;

    // 2. Find the itinerary
    const { data: itinerary } = await supabase
        .from('itineraries')
        .select('*')
        .eq('client_id', client.id)
        .eq('slug', itinerarySlug)
        .eq('status', 'published')
        .single<ItineraryRow>();

    if (!itinerary) return null;

    // 3. Convert DB rows → ItineraryPayload
    return toItineraryPayload(client, itinerary);
}

/**
 * Fetches ALL itineraries for admin dashboard (any status).
 */
export async function getAllItineraries(): Promise<AdminItineraryItem[]> {
    const supabase = createServerClient();

    // Fetch all itineraries
    const { data: itineraries, error } = await supabase
        .from('itineraries')
        .select('id, client_id, slug, status, theme, meta, created_at, updated_at')
        .order('created_at', { ascending: false });

    if (error || !itineraries) {
        console.error('[Queries] Failed to fetch itineraries:', error);
        return [];
    }

    // Get unique client IDs and batch-fetch clients
    const clientIds = [...new Set((itineraries as ItineraryRow[]).map((i) => i.client_id))];
    const { data: clients } = await supabase
        .from('clients')
        .select('id, slug, brand_name, logo_url, primary_color')
        .in('id', clientIds);

    const clientMap = new Map(
        ((clients || []) as ClientRow[]).map((c) => [c.id, c])
    );

    return (itineraries as ItineraryRow[]).map((row) => {
        const client = clientMap.get(row.client_id);
        return {
            id: row.id,
            slug: row.slug,
            status: row.status,
            theme: row.theme,
            title: row.meta?.title || 'Untitled',
            subtitle: row.meta?.subtitle || '',
            durationDays: row.meta?.durationDays || 0,
            clientName: client?.brand_name || 'Unknown',
            clientSlug: client?.slug || '',
            clientLogo: client?.logo_url || null,
            clientColor: client?.primary_color || '#D4AF37',
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    });
}

/**
 * Fetches a single itinerary by ID (any status, for admin editing).
 */
export async function getItineraryById(id: string): Promise<ItineraryPayload | null> {
    const supabase = createServerClient();

    const { data: itinerary } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .single<ItineraryRow>();

    if (!itinerary) return null;

    const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', itinerary.client_id)
        .single<ClientRow>();

    if (!client) return null;

    return toItineraryPayload(client, itinerary);
}

/**
 * Updates the status of an itinerary.
 */
export async function updateItineraryStatus(
    id: string,
    status: 'pending' | 'draft' | 'published' | 'archived'
): Promise<boolean> {
    const supabase = createServerClient();

    const { error } = await supabase
        .from('itineraries')
        .update({ status })
        .eq('id', id);

    return !error;
}

// ═══════════════════════════════════════════════════
// Internal Types & Converters
// ═══════════════════════════════════════════════════

interface ClientRow {
    id: string;
    slug: string;
    brand_name: string;
    tagline: string | null;
    primary_color: string;
    secondary_color: string;
    logo_url: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    twitter_x: string | null;
    youtube: string | null;
    linkedin: string | null;
}

interface ItineraryRow {
    id: string;
    client_id: string;
    status: string;
    theme: string;
    version: string;
    meta: {
        title: string;
        subtitle: string;
        durationDays: number;
        durationNights: number;
        startDate: string;
        endDate: string;
        groupSize: string;
        price: string;
        priceNote?: string;
    };
    highlights: { label: string; value: string; icon?: string }[];
    itinerary_summary: string[];
    inclusions: string[];
    exclusions: string[];
    days: {
        dayNumber: number;
        date?: string;
        title: string;
        location: string;
        summary: string;
        heroImage: string;
        videoUrl?: string;
        activities: {
            time: string;
            title: string;
            description: string;
            image?: string;
            icon?: string;
        }[];
    }[];
    hotels: {
        name: string;
        rating: string;
        location: string;
        description: string;
        imageUrl: string;
    }[];
    original_submission: Record<string, unknown> | null;
    slug: string;
    content_original?: any;
    content_personalized?: any;
    active_version?: 'original' | 'personalized';
    language?: string;
    style?: string;
    created_at: string;
    updated_at: string;
}

interface AdminItineraryRaw {
    id: string;
    slug: string;
    status: string;
    theme: string;
    meta: { title?: string; subtitle?: string; durationDays?: number };
    created_at: string;
    updated_at: string;
    clients: {
        id: string;
        slug: string;
        brand_name: string;
        logo_url: string | null;
        primary_color: string;
    } | null;
}

export interface AdminItineraryItem {
    id: string;
    slug: string;
    status: string;
    theme: string;
    title: string;
    subtitle: string;
    durationDays: number;
    clientName: string;
    clientSlug: string;
    clientLogo: string | null;
    clientColor: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Converts a DB client row + itinerary row → ItineraryPayload
 * that the theme components expect.
 */
function toItineraryPayload(client: ClientRow, itinerary: ItineraryRow): ItineraryPayload {
    const brand: BrandProfile = {
        id: client.id,
        name: client.brand_name,
        tagline: client.tagline || undefined,
        primaryColor: client.primary_color,
        secondaryColor: client.secondary_color,
        logoUrl: client.logo_url || '',
        contact: {
            phone: client.phone || undefined,
            whatsapp: client.whatsapp || undefined,
            instagram: client.instagram || undefined,
            website: client.website || undefined,
            email: client.email || undefined,
        },
        socialLinks: [
            client.facebook && { platform: 'Facebook', url: client.facebook },
            client.tiktok && { platform: 'TikTok', url: client.tiktok },
            client.twitter_x && { platform: 'X', url: client.twitter_x },
            client.youtube && { platform: 'YouTube', url: client.youtube },
            client.linkedin && { platform: 'LinkedIn', url: client.linkedin },
        ].filter(Boolean) as { platform: string; url: string }[],
    };

    return {
        id: itinerary.id,
        version: itinerary.version,
        theme: itinerary.theme as ItineraryPayload['theme'],
        meta: itinerary.meta,
        highlights: itinerary.highlights || [],
        itinerarySummary: itinerary.itinerary_summary || [],
        inclusions: itinerary.inclusions || [],
        exclusions: itinerary.exclusions || [],
        days: itinerary.days || [],
        hotels: itinerary.hotels || [],
        brand,
        content_original: itinerary.content_original,
        content_personalized: itinerary.content_personalized,
        active_version: (itinerary.active_version as any) || 'personalized',
        language: (itinerary.language as any) || 'id',
        style: (itinerary.style as any) || 'original',
    };
}
