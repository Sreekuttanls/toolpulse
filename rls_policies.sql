-- Enable RLS just in case (good practice)
alter table tools enable row level security;
alter table alternatives enable row level security;

-- Allow anonymous access (Public Read)
create policy "Allow public read access on tools"
on tools for select
to anon
using (true);

create policy "Allow public read access on alternatives"
on alternatives for select
to anon
using (true);
