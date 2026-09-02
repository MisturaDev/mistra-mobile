-- Run this in Supabase Dashboard → SQL Editor → New query

create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text default '',
  event_date text not null, -- ISO format YYYY-MM-DD
  start_time text,          -- e.g. "09:30 AM"
  end_time text,            -- e.g. "10:30 AM"
  category text default 'general' not null,
  color text default '#7C3AED' not null,
  is_all_day boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.events enable row level security;

create policy "Users can manage own events"
  on public.events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_events_user_date on public.events(user_id, event_date);
