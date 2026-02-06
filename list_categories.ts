import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = Object.fromEntries(
    envFile.split('\n').filter(Boolean).map(line => line.split('='))
);

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function listCategories() {
    const { data, error } = await supabase.from('tools').select('categories');
    if (error) {
        console.error(error);
        return;
    }

    const allTags = data.flatMap(d => d.categories || []);
    const uniqueTags = Array.from(new Set(allTags)).sort();
    console.log(JSON.stringify(uniqueTags, null, 2));
}

listCategories();
