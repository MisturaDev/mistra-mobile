-- Run this in Supabase Dashboard → SQL Editor → New query

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tasks
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text default '',
  category text default 'general' not null,
  priority text default 'medium' not null,
  due_date text,
  subtasks jsonb default '[]'::jsonb not null,
  completed boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.tasks enable row level security;

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

create policy "Users can manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notes
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

create policy "Users can manage own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_user_pinned on public.notes(user_id, is_pinned desc, updated_at desc);
