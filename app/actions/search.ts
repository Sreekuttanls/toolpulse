'use server';

import { pipeline } from '@huggingface/transformers';
import { supabase } from '@/utils/supabase/client';

// Singleton for the model to avoid reloading on every request
let generateEmbedding: any = null;

async function getEmbedding(text: string) {
    if (!generateEmbedding) {
        console.log('Initializing Embedding Model on Server...');
        // Ensure "sharp" is available in "next.config.ts" external packages
        const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        generateEmbedding = async (t: string) => {
            const output = await pipe(t, { pooling: 'mean', normalize: true });
            return Array.from(output.data);
        };
    }
    return await generateEmbedding(text);
}

export interface Tool {
    id: string;
    name: string;
    tagline: string | null;
    description: string;
    website_url: string;
    similarity?: number;
}

// Broad Category Mapping
const CATEGORY_GROUPS: Record<string, string[]> = {
    "Video & Audio": [
        "AI Avatar for video generation", "AI Product Video", "AI Video",
        "Ai Video and Motion Design", "Film Making", "Screen Recording for Demos",
        "Video Creation", "Voice to text"
    ],
    "Sales & CRM": [
        "AI CRM", "AI Native GTM", "AI Recruiting Agent", "Email Sending",
        "Free Scrapers", "Hiring GTM", "Sales", "Monitoring Web for our name mentions",
        "Pricing API", "Reddit Marketing", "pitch simulation", "Pitch simulation"
    ],
    "Development": [
        "AI Internal tools builder", "AI Web Scraping", "AI Website builder",
        "AI internal tool developer", "API for all LLMs", "Build LLM Apps fast",
        "Coding tools", "Making App enterprise ready", "No code tool for building internal tools",
        "Open source softwares to start building om", "Serverless Database",
        "Website Integrations", "Add search across website and platform easily"
    ],
    "Productivity": [
        "AI Document editor", "AI Meetings APP", "AI Presentation", "AI Report Document creation",
        "AI Workflow builder", "AI agent in gsheets and excel", "AI for work automation",
        "Advanced Form builder", "Document Signing", "Document signing free( docusign Alternative)",
        "Note Taking App", "Project managhment and Mindmap", "Slack Alternative",
        "Virtual Office", "Workflow Automation", "Workflow automation"
    ],
    "Marketing & SEO": [
        "AI SEO- GEO", "Make peronalised ads and landing page", "Perzonalize website for each website visitor",
        "Reddit Marketing", "Monitoring Web for our name mentions"
    ],
    "Finance & HR": [
        "Ai ACCOUNTING", "Finance", "For Invoicing and collecting payments",
        "Global Payroll", "HR", "Payment gateway above stripe for ai startups",
        "Payments", "Intelligent forms for hiring"
    ],
    "Support": [
        "AI agents for complaince", "Best Chatbot for customer support",
        "Customer Support AI", "Customer Support and ticket resulution",
        "AI powered assistance to customers"
    ]
};

export async function searchTools(query: string): Promise<Tool[]> {
    if (!query.trim()) return [];

    try {
        const embedding = await getEmbedding(query);

        const { data, error } = await supabase.rpc('match_tools', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 10
        });

        if (error) {
            console.error('Supabase RPC Error:', error);
            throw new Error(error.message);
        }

        return data || [];
    } catch (err) {
        console.error('Search Action Error:', err);
        return [];
    }
}

export async function getCategories(): Promise<string[]> {
    // Return fixed broad categories
    return Object.keys(CATEGORY_GROUPS).sort();
}

export async function getTools(category?: string): Promise<Tool[]> {
    console.log('Fetching tools for category:', category);
    let query = supabase.from('tools').select('*');

    if (category && category !== 'All') {
        // If it's a Broad Category, look for overlap
        const specificTags = CATEGORY_GROUPS[category];
        if (specificTags) {
            query = query.overlaps('categories', specificTags);
        } else {
            // Fallback
            query = query.contains('categories', [category]);
        }
    }

    const { data, error } = await query.limit(50);

    if (error) {
        console.error('Error fetching tools:', error);
        return [];
    }

    console.log(`Fetched ${data?.length} tools`);
    return data as Tool[];
}
