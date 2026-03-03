
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    console.log('--- Inspecting Itineraries ---');
    const { data: itineraries, error } = await supabase
        .from('itineraries')
        .select('id, slug, status, theme, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching itineraries:', error);
    } else {
        console.table(itineraries);
    }

    console.log('\n--- Inspecting Clients ---');
    const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, slug, brand_name')
        .limit(5);

    if (clientError) {
        console.error('Error fetching clients:', clientError);
    } else {
        console.table(clients);
    }
}

inspect();
