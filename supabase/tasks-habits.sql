-- Run this if schema.sql failed because profiles already exist.
-- Supabase Dashboard → SQL Editor → New query

-- Tasks
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  completed boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.tasks enable row level security;

drop policy if exists "Users can manage own tasks" on public.tasks;
create policy "Users can manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Habits
create table if not exists public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  streak integer default 0 not null,
  completed_today boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.habits enable row level security;

drop policy if exists "Users can manage own habits" on public.habits;
create policy "Users can manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
