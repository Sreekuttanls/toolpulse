import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = Object.fromEntries(
    envFile.split('\n').filter(Boolean).map(line => line.split('='))
);

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function checkLatestTool() {
    console.log("Checking for latest tool...");
    const { data, error } = await supabase
        .from('tools')
        .select('name, website_url, created_at, embedding')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        if (data.length > 0) {
            console.log("Latest Tool Found:");
            console.log(data[0]);
            console.log("Has Embedding:", !!data[0].embedding && data[0].embedding.length > 0);
        } else {
            console.log("No tools found in database.");
        }
    }
}

checkLatestTool();
