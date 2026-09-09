-- Goals Table Migration for Mistra Mobile
-- Run this in Supabase Dashboard → SQL Editor → New query

create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text default '',
  category text default 'personal' not null,
  target_date text,
  current_value numeric default 0 not null,
  target_value numeric default 100 not null,
  unit text default '%' not null,
  status text default 'in_progress' not null,
  color text default '#7C3AED' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.goals enable row level security;

create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_goals_status on public.goals(user_id, status);
