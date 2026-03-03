'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

        // 5. Update the personalized content in DB
        const { error: updateError } = await supabase
            .from('itineraries')
            .update({
                content_personalized: parsed,
                language,
                style,
                active_version: 'personalized'
            })
            .eq('id', id);

        if (updateError) throw updateError;

        revalidatePath(`/admin/${id}`);
        return { success: true, data: parsed };
    } catch (err: any) {
        console.error('[AI Re-Style] Error:', err);
        return { success: false, error: err.message || 'AI parsing failed' };
    }
}
