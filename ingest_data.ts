import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = Object.fromEntries(
    envFile.split('\n').filter(Boolean).map(line => line.split('='))
);

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables. Please check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path to the markdown file
const MARKDOWN_PATH = path.join(__dirname, '../notion_data/Private & Shared/Tools and softwares 71be2b15fb1e4898b9c1d19a8ff80c4e.md');

// Singleton for the extractor pipeline to avoid reloading logic
let generateEmbedding: any = null;

async function initModel() {
    console.log('Loading local embedding model (all-MiniLM-L6-v2)...');
    const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    generateEmbedding = async (text: string) => {
        const output = await pipe(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    };
    console.log('Model loaded!');
}

async function parseAndIngest() {
    await initModel();

    console.log('Reading markdown file...');
    const content = fs.readFileSync(MARKDOWN_PATH, 'utf8');
    const lines = content.split('\n');

    let currentCategory = 'General';
    let processedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect Category Layout "### Category Name"
        if (line.startsWith('### ')) {
            currentCategory = line.replace('### ', '').trim();
            continue;
        }

        if (line.startsWith('http') || line.startsWith('[http')) {
            let url = '';
            let name = '';
            let description = '';

            if (line.startsWith('[')) {
                const match = line.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    name = match[1];
                    url = match[2];
                    const afterLink = line.replace(/\[.*?\]\(.*?\)/, '').trim();
                    if (afterLink.startsWith('-')) {
                        description = afterLink.substring(1).trim();
                    }
                }
            } else {
                const parts = line.split(' ');
                url = parts[0];
                description = parts.slice(1).join(' ').replace(/^-/, '').trim();
                name = new URL(url).hostname.replace('www.', '');
            }

            if (!description) {
                description = `${name} is a tool in the ${currentCategory} category.`;
            } else {
                description = `${description} (${currentCategory})`;
            }

            console.log(`Processing: ${name} (${url})`);

            try {
                const embedding = await generateEmbedding(description);

                const { error } = await supabase.from('tools').insert({
                    name: name,
                    website_url: url,
                    description: description,
                    categories: [currentCategory],
                    embedding: embedding
                });

                if (error) {
                    console.error(`Error inserting ${name}:`, error.message);
                } else {
                    processedCount++;
                }
            } catch (err) {
                console.error(`Failed to process ${name}:`, err);
            }
        }
    }

    console.log(`✅ Ingestion Complete! Processed ${processedCount} tools.`);
}

parseAndIngest();
