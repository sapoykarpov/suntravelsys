'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { searchUnsplashPhotos } from '@/lib/utils/unsplash';

/**
 * Server action: Update itinerary status
 */
export async function updateStatus(id: string, status: string) {
    const supabase = createServerClient();

    const { error } = await supabase
        .from('itineraries')
        .update({ status })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/${id}`);
    return { success: true };
}

/**
 * Server action: Update itinerary content (inline editing)
 */
export async function updateItineraryContent(
    id: string,
    updates: Record<string, unknown>
) {
    const supabase = createServerClient();

    const { error } = await supabase
        .from('itineraries')
        .update(updates)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/${id}`);
    return { success: true };
}
import { parseItinerary } from '@/lib/ai/itinerary-parser';

/**
 * Server action: Re-stylize itinerary using AI
 */
export async function reStyleItinerary(
    id: string,
    language: 'id' | 'en',
    style: 'original' | 'friendly' | 'persuasive' | 'energetic'
) {
    const supabase = createServerClient();

    // 1. Fetch the original submission
    const { data: itinerary, error: fetchError } = await supabase
        .from('itineraries')
        .select('original_submission, client_id')
        .eq('id', id)
        .single();

    if (fetchError || !itinerary || !itinerary.original_submission) {
        return { success: false, error: 'Original submission data not found' };
    }

    // 2. Resolve client name for branding
    const { data: client } = await supabase
        .from('clients')
        .select('brand_name')
        .eq('id', itinerary.client_id)
        .single();

    const brandName = client?.brand_name || 'Our Agency';

    // 3. Re-examine the tally fields to build raw text
    const submission = itinerary.original_submission as any;
    const fields = submission.data?.fields || [];
    const rawItineraryText = fields
        .filter((f: any) => f.type === 'TEXTAREA' || f.type === 'INPUT_TEXT' || f.type === 'LONG_TEXT')
        .map((f: any) => `${f.label}: ${f.value}`)
        .join('\n\n');

    if (!rawItineraryText) {
        return { success: false, error: 'Could not extract itinerary text from original submission' };
    }

    // 4. Parse with Gemini
    try {
        const parsed = await parseItinerary(rawItineraryText, brandName, language, style);

        // 5. Fetch images from Unsplash for each day
        const daysWithImages = await Promise.all(parsed.days.map(async (day) => {
            const search = await searchUnsplashPhotos(day.location.split(',')[0] || day.title, 1);
            return {
                ...day,
                heroImage: search.photos[0]?.url || ''
            };
        }));

        const updatedParsed = {
            ...parsed,
            days: daysWithImages,
            meta: {
                ...parsed, // In case parseItinerary already returned some meta fields
                title: parsed.title,
                subtitle: parsed.subtitle,
                durationDays: parsed.durationDays,
                durationNights: parsed.durationNights,
                startDate: parsed.startDate,
                endDate: parsed.endDate,
                groupSize: parsed.groupSize,
                price: parsed.price,
                priceNote: parsed.priceNote || '',
                coverImage: (await searchUnsplashPhotos(parsed.days[0]?.location.split(',')[0] || 'travel', 1)).photos[0]?.url || '',
            }
        };

        // 6. Update the personalized content in DB
        const { error: updateError } = await supabase
            .from('itineraries')
            .update({
                content_personalized: updatedParsed,
                language,
                style,
                active_version: 'personalized'
            })
            .eq('id', id);

        if (updateError) throw updateError;

        revalidatePath(`/admin/${id}`);
        return { success: true, data: updatedParsed };
    } catch (err: any) {
        console.error('[AI Re-Style] Error:', err);
        return { success: false, error: err.message || 'AI parsing failed' };
    }
}

/**
 * Server action: Upsert a brand/client profile
 */
export async function upsertClient(clientData: any) {
    const supabase = createServerClient();

    // If id is provided, it's an update, otherwise it's an insert
    const { data, error } = await supabase
        .from('clients')
        .upsert({
            ...clientData,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true, data };
}

/**
 * Server action: Get all brand profiles
 */
export async function getClients() {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('brand_name', { ascending: true });

    if (error) {
        console.error('[getClients] Error:', error);
        return [];
    }

    return data || [];
}

/**
 * Server action: Save a theme preset configuration
 */
export async function saveThemePreset(presetData: {
    name: string;
    theme: string;
    coverTextSettings: any;
    fontPairing: string;
    primaryColor: string;
    secondaryColor: string;
}) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('theme_presets')
        .insert({
            name: presetData.name,
            theme: presetData.theme,
            cover_text_settings: presetData.coverTextSettings,
            font_pairing: presetData.fontPairing,
            primary_color: presetData.primaryColor,
            secondary_color: presetData.secondaryColor,
        })
        .select()
        .single();

    if (error) {
        console.error('[saveThemePreset] Error:', error);
        return { success: false, error: error.message };
    }
    return { success: true, data };
}

/**
 * Server action: Get all saved theme presets
 */
export async function getThemePresets() {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('theme_presets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getThemePresets] Error:', error);
        return [];
    }
    return data || [];
}
