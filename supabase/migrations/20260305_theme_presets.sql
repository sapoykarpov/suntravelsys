-- Create theme_presets table for saving Editor Sidebar preset configurations
create table if not exists public.theme_presets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  theme text not null,
  font_pairing text,
  primary_color text,
  secondary_color text,
  cover_text_settings jsonb default '{}',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.theme_presets enable row level security;

-- Allow all authenticated users to read and write presets
create policy "Allow all" on public.theme_presets
  for all using (true) with check (true);
