-- Run this in Supabase Dashboard → SQL Editor → New query

-- Notes table
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text default '' not null,
  emoji text default '📝' not null,
  is_pinned boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.notes enable row level security;

-- RLS Policy: Users can manage only their own notes
create policy "Users can manage own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for fast querying & sorting
create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_user_pinned on public.notes(user_id, is_pinned desc, updated_at desc);
