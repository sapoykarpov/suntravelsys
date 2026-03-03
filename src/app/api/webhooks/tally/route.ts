import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseItinerary } from '@/lib/ai/itinerary-parser';
import { generateSlug } from '@/lib/utils/slug';

/**
 * Tally.so Webhook Field Mapping
 *
 * Tally sends form submissions as JSON with this structure:
 * {
 *   "eventId": "...",
 *   "eventType": "FORM_RESPONSE",
 *   "createdAt": "...",
 *   "data": {
 *     "responseId": "...",
 *     "submissionId": "...",
 *     "formId": "...",
 *     "formName": "...",
 *     "fields": [
 *       { "key": "question_xxx", "label": "Field Label", "type": "...", "value": "..." }
 *     ]
 *   }
 *   ...
 * }
 *
 * We map Tally field labels to our internal data model.
 */

interface TallyField {
    key: string;
    label: string;
    type: string;
    value: string | string[] | null;
    options?: { id: string; text: string }[];
}

interface TallyPayload {
    eventId: string;
    eventType: string;
    createdAt: string;
    data: {
        responseId: string;
        submissionId: string;
        formId: string;
        formName: string;
        fields: TallyField[];
    };
}

/**
 * Helper: Extract a field value from Tally fields by label (case-insensitive)
 */
function getFieldValue(fields: TallyField[], label: string): string {
    const field = fields.find(
        (f) => f.label.toLowerCase().includes(label.toLowerCase())
    );
    if (!field || !field.value) return '';
    return Array.isArray(field.value) ? field.value.join(', ') : String(field.value);
}

/**
 * POST /api/webhooks/tally
 *
 * Receives a Tally.so form submission, resolves the client (agent),
 * parses the itinerary using Gemini AI, and saves it to Supabase.
 */
export async function POST(request: NextRequest) {
    try {
        const payload: TallyPayload = await request.json();

        // ── Validate event type ─────────────────────────────────
        if (payload.eventType !== 'FORM_RESPONSE') {
            return NextResponse.json(
                { message: 'Ignored: not a form response event' },
                { status: 200 }
            );
        }

        const fields = payload.data.fields;
        const supabase = createServerClient();

        // ── 1. Resolve or create the client (agent/reseller) ────
        const brandName = getFieldValue(fields, 'brand name') ||
            getFieldValue(fields, 'agency name') ||
            getFieldValue(fields, 'company name') ||
            'Unknown Agent';

        const clientSlug = generateSlug(brandName);

        // Check if client already exists
        const { data: existingClient } = await supabase
            .from('clients')
            .select('id')
            .eq('slug', clientSlug)
            .single<{ id: string }>();

        let clientId: string;

        if (existingClient) {
            clientId = existingClient.id;
        } else {
            // Create new client with submitted data
            const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert({
                    slug: clientSlug,
                    brand_name: brandName,
                    primary_color: getFieldValue(fields, 'primary color') || '#D4AF37',
                    secondary_color: getFieldValue(fields, 'secondary color') || '#1A1A1A',
                    whatsapp: getFieldValue(fields, 'whatsapp'),
                    instagram: getFieldValue(fields, 'instagram'),
                    email: getFieldValue(fields, 'email'),
                    website: getFieldValue(fields, 'website'),
                    phone: getFieldValue(fields, 'phone'),
                    facebook: getFieldValue(fields, 'facebook'),
                    tiktok: getFieldValue(fields, 'tiktok'),
                })
                .select('id')
                .single();

            if (clientError || !newClient) {
                console.error('[Webhook] Failed to create client:', clientError);
                return NextResponse.json(
                    { error: 'Failed to create client record', details: clientError },
                    { status: 500 }
                );
            }
            clientId = newClient.id;
        }

        // ── 2. Extract raw itinerary text ───────────────────────
        // Combine all text-like field values into a single string for AI parsing
        const rawItineraryText = fields
            .filter((f) => f.type === 'TEXTAREA' || f.type === 'INPUT_TEXT' || f.type === 'LONG_TEXT')
            .map((f) => `${f.label}: ${f.value}`)
            .join('\n\n');

        if (!rawItineraryText.trim()) {
            return NextResponse.json(
                { error: 'No itinerary text found in submission' },
                { status: 400 }
            );
        }

        // ── 3. Extract Language & Style ─────────────────────────
        const languageRaw = getFieldValue(fields, 'language').toLowerCase();
        const language = languageRaw.includes('english') ? 'en' : 'id';

        const styleRaw = getFieldValue(fields, 'style').toLowerCase();
        let style: 'original' | 'friendly' | 'persuasive' | 'energetic' = 'original';
        if (styleRaw.includes('friendly')) style = 'friendly';
        if (styleRaw.includes('persuasive')) style = 'persuasive';
        if (styleRaw.includes('energetic')) style = 'energetic';

        // ── 4. Parse with Gemini AI (Dual Step) ───────────────────
        console.log(`[Webhook] Parsing itinerary for client: ${brandName}`);

        // 1. Original style (As Is)
        console.log(`[Webhook] -> Step 1: Original style`);
        const parsedOriginal = await parseItinerary(rawItineraryText, brandName, language, 'original');

        // 2. Personalized style (as requested by user)
        console.log(`[Webhook] -> Step 2: Personalized style (${style})`);
        const parsedPersonalized = await parseItinerary(rawItineraryText, brandName, language, style);

        // ── 5. Generate itinerary slug ──────────────────────────
        const itinerarySlug = generateSlug(parsedOriginal.title || 'untitled-trip');

        // Choose which one to use for the main legacy columns (compatibility)
        const primaryContent = style === 'original' ? parsedOriginal : parsedPersonalized;

        // ── 6. Save to Supabase ─────────────────────────────────
        const { data: itinerary, error: itineraryError } = await supabase
            .from('itineraries')
            .upsert({
                client_id: clientId,
                status: 'pending',
                theme: getFieldValue(fields, 'theme') || 'amazing-black',
                slug: itinerarySlug,
                language,
                style,
                active_version: 'personalized', // Default to personalized

                // Legacy columns for compatibility
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
                },
                highlights: primaryContent.highlights,
                itinerary_summary: primaryContent.itinerarySummary,
                inclusions: primaryContent.inclusions,
                exclusions: primaryContent.exclusions,
                days: primaryContent.days.map((day) => ({
                    ...day,
                    heroImage: '', // Will be filled later
                })),
                hotels: primaryContent.hotels.map((hotel) => ({
                    ...hotel,
                    imageUrl: '', // Will be filled later
                })),

                // New dual-content columns
                content_original: parsedOriginal,
                content_personalized: parsedPersonalized,

                original_submission: payload as unknown as Record<string, unknown>,
            }, {
                onConflict: 'client_id, slug'
            })
            .select('id, slug')
            .single<{ id: string; slug: string }>();

        if (itineraryError || !itinerary) {
            console.error('[Webhook] Failed to save itinerary:', JSON.stringify(itineraryError, null, 2));
            return NextResponse.json(
                { error: 'Failed to save itinerary', dbError: itineraryError },
                { status: 500 }
            );
        }

        console.log('[Webhook] ✓ Itinerary saved:', itinerary.id);

        // ── 7. Return success ───────────────────────────────────
        return NextResponse.json({
            success: true,
            message: 'Itinerary received and parsed successfully',
            data: {
                itineraryId: itinerary.id,
                clientSlug,
                itinerarySlug: itinerary.slug,
                previewUrl: `/${clientSlug}/${itinerary.slug}`,
                status: 'pending',
            },
        }, { status: 201 });

    } catch (error) {
        console.error('[Webhook] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/webhooks/tally — Health check
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Tally webhook endpoint is active',
        timestamp: new Date().toISOString(),
    });
}
