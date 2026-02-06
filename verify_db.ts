import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = Object.fromEntries(
    envFile.split('\n').filter(Boolean).map(line => line.split('='))
);

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function verify() {
    console.log('Verifying DB connection...');
    const { data, error } = await supabase.from('tools').select('count', { count: 'exact' });

    if (error) {
        console.error('❌ DB Error:', error.message);
        console.error('Hint: If this is an RLS error, you need to add policies.');
    } else {
        console.log(`✅ Success! Found ${data[0]?.count ?? 'unknown'} rows (count via select).`);
    }

    // Try actual Select
    const { data: tools, error: err2 } = await supabase.from('tools').select('name').limit(3);
    if (err2) {
        console.error('❌ Select Error:', err2.message);
    } else {
        console.log('Sample Tools:', tools);
        if (tools && tools.length === 0) {
            console.warn('⚠️ Query returned 0 rows. RLS might be hiding them!');
        }
    }
}

verify();
