import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
    envContent.split('\n')
        .filter(line => line.includes('='))
        .map(line => line.split('=').map(s => s.trim().replace(/^"|"$/g, '')))
);

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || envVars['SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase
        .from('itineraries')
        .select('id, assets_config')
        .limit(1);

    if (error) {
        console.log('Column assets_config probably does NOT exist:', error.message);
    } else {
        console.log('Column assets_config exists!');
    }
}

checkColumns();
