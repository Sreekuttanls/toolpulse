-- Enable pgvector extension to work with embeddings
create extension if not exists vector;

-- Reset Schema (CAUTION: Deletes existing data)
drop table if exists alternatives;
drop table if exists tools;

-- Tools Table
create table tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  description text, -- Rich description for AI matching
  pricing_model text, -- 'Freemium', 'Paid', 'Open Source', 'Free'
  website_url text,
  logo_url text,
  categories text[],
  embedding vector(384), -- 384 dimensions for all-MiniLM-L6-v2 (Local Embedding)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contextual Alternatives Table
create table alternatives (
  tool_id uuid references tools(id) on delete cascade,
  alternative_tool_id uuid references tools(id) on delete cascade,
  context_label text, -- e.g. "Cheaper", "Better for Enterprise"
  reasoning text, -- "Choose X over Y because..."
  primary key (tool_id, alternative_tool_id)
);

-- Search Function (Cosine Similarity)
create or replace function match_tools (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  tagline text,
  description text,
  website_url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    tools.id,
    tools.name,
    tools.tagline,
    tools.description,
    tools.website_url,
    1 - (tools.embedding <=> query_embedding) as similarity
  from tools
  where 1 - (tools.embedding <=> query_embedding) > match_threshold
  order by tools.embedding <=> query_embedding
  limit match_count;
end;
$$;
