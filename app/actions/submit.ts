'use server';

import { pipeline } from '@xenova/transformers';
import { supabase } from '@/utils/supabase/client';
import { revalidatePath } from 'next/cache';

// Singleton for the embedding model
let generateEmbedding: any = null;

async function getEmbedding(text: string) {
    if (!generateEmbedding) {
        console.log('Initializing Embedding Model for Submission...');
        const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        generateEmbedding = async (t: string) => {
            const output = await pipe(t, { pooling: 'mean', normalize: true });
            return Array.from(output.data);
        };
    }
    return await generateEmbedding(text);
}

export type SubmitState = {
    message?: string;
    error?: string;
    success?: boolean;
};

export async function submitTool(prevState: SubmitState, formData: FormData): Promise<SubmitState> {
    const name = formData.get('name') as string;
    const url = formData.get('url') as string;
    const description = formData.get('description') as string;
    const tagline = formData.get('tagline') as string;
    const categoryStr = formData.get('categories') as string;

    // 1. Validate Mandatory Fields
    if (!url || !description) {
        return { error: 'URL and Description are required.' };
    }

    try {
        // 2. Generate Embedding
        const embedding = await getEmbedding(description);

        // 3. Process Categories
        // Split by comma if provided, else default to 'Uncategorized'
        const categories = categoryStr
            ? categoryStr.split(',').map(c => c.trim()).filter(c => c.length > 0)
            : [];

        // 4. Insert into Supabase
        const { error } = await supabase.from('tools').insert({
            name,
            website_url: url,
            description,
            tagline: tagline || description.substring(0, 100), // Fallback tagline
            categories: categories,
            embedding: embedding, // Vector data
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('Submission DB Error:', error);
            return { error: 'Failed to save tool. Please try again.' };
        }

        revalidatePath('/'); // Refresh home page data
        return { success: true, message: 'Tool submitted successfully! It is now searchable via AI.' };

    } catch (err) {
        console.error('Submission Error:', err);
        return { error: 'An unexpected error occurred.' };
    }
}
