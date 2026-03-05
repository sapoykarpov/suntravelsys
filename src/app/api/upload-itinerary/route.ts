import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseItinerary, FileData } from '@/lib/ai/itinerary-parser';
import { generateSlug } from '@/lib/utils/slug';
import { searchUnsplashPhotos } from '@/lib/utils/unsplash';

export const maxDuration = 60; // Allow more time for AI parsing

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get('file') as File | null;
        const brandName = (formData.get('brandName') as string) || 'Unknown Agent';
        const theme = (formData.get('theme') as string) || 'amazing-black';
        const languageRaw = (formData.get('language') as string) || 'id';
        const language = languageRaw.toLowerCase().includes('en') ? 'en' : 'id';
        const styleRaw = (formData.get('style') as string) || 'original';

        let style: 'original' | 'friendly' | 'persuasive' | 'energetic' = 'original';
        if (styleRaw.toLowerCase().includes('friendly')) style = 'friendly';
        if (styleRaw.toLowerCase().includes('persuasive')) style = 'persuasive';
        if (styleRaw.toLowerCase().includes('energetic')) style = 'energetic';

        // Additional defaults
        const primaryColor = (formData.get('primaryColor') as string) || '#D4AF37';
        const secondaryColor = (formData.get('secondaryColor') as string) || '#1A1A1A';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to base64 for Gemini
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const fileData: FileData = {
            mimeType: file.type,
            data: base64Data,
        };

        const supabase = createServerClient();

        // 1. Resolve or Create Client
        const clientSlug = generateSlug(brandName);
        const { data: existingClient } = await supabase
            .from('clients')
            .select('id')
            .eq('slug', clientSlug)
            .single<{ id: string }>();

        let clientId: string;

        if (existingClient) {
            clientId = existingClient.id;
        } else {
            const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert({
                    slug: clientSlug,
                    brand_name: brandName,
                    primary_color: primaryColor,
                    secondary_color: secondaryColor,
                })
                .select('id')
                .single();

            if (clientError || !newClient) {
                console.error('[Upload API] Failed to create client:', clientError);
                return NextResponse.json({ error: 'Failed to create client record' }, { status: 500 });
            }
            clientId = newClient.id;
        }

        // 2. Dual Generation via Gemini
        console.log(`[Upload API] Parsing file for client: ${brandName}`);
        console.log(`[Upload API] -> Step 1: Original style`);
        const parsedOriginal = await parseItinerary('', brandName, language, 'original', fileData);

        console.log(`[Upload API] -> Step 2: Personalized style (${style})`);
        const parsedPersonalized = await parseItinerary('', brandName, language, style, fileData);

        // 3. Save to Supabase
        const itinerarySlug = generateSlug(parsedOriginal.title || 'untitled-trip');
        const primaryContent = style === 'original' ? parsedOriginal : parsedPersonalized;

        const { data: itinerary, error: itineraryError } = await supabase
            .from('itineraries')
            .upsert({
                client_id: clientId,
                status: 'pending',
                theme,
                slug: itinerarySlug,
                language,
                style,
                active_version: 'personalized',

                // Legacy metadata mappings
                meta: {
                    title: primaryContent.title,
                    subtitle: primaryContent.subtitle,
                    durationDays: primaryContent.durationDays,
                    durationNights: primaryContent.durationNights,
                    startDate: primaryContent.startDate,
                    endDate: primaryContent.endDate,
                    groupSize: primaryContent.groupSize,
                    price: primaryContent.price,
                    priceNote: primaryContent.priceNote || '',
                    coverImage: (await searchUnsplashPhotos(parsedOriginal.days[0]?.location.split(',')[0] || 'travel', 1)).photos[0]?.url || '',
                },
                highlights: primaryContent.highlights,
                itinerary_summary: primaryContent.itinerarySummary,
                inclusions: primaryContent.inclusions,
                exclusions: primaryContent.exclusions,
                days: await Promise.all(primaryContent.days.map(async (day) => {
                    const search = await searchUnsplashPhotos(day.location.split(',')[0], 1);
                    return {
                        ...day,
                        heroImage: search.photos[0]?.url || '',
                    };
                })),
                hotels: primaryContent.hotels.map((hotel) => ({
                    ...hotel,
                    imageUrl: '',
                })),

                // Dual versions
                content_original: parsedOriginal,
                content_personalized: parsedPersonalized,
                original_submission: { uploadedFileName: file.name, fileSize: file.size, mimeType: file.type },
            }, {
                onConflict: 'client_id, slug'
            })
            .select('id, slug')
            .single<{ id: string; slug: string }>();

        if (itineraryError || !itinerary) {
            console.error('[Upload API] Failed to save itinerary:', JSON.stringify(itineraryError, null, 2));
            return NextResponse.json({ error: 'Failed to save itinerary', dbError: itineraryError }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: {
                itineraryId: itinerary.id,
                previewUrl: `/${clientSlug}/${itinerary.slug}`,
            }
        });

    } catch (error: any) {
        console.error('[Upload API] Unexpected error:', error);
        return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
    }
}
