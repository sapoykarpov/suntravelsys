import { createClient } from '@supabase/supabase-js';

// ── Server Client (uses service-role key, bypasses RLS) ───────
// Use this ONLY in API routes, webhooks, and server actions.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createServerClient() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
    });
}
