-- Run this in Supabase Dashboard → SQL Editor → New query

-- Add category, description, due_date, and subtasks to tasks table
alter table public.tasks 
  add column if not exists category text default 'general' not null,
  add column if not exists description text default '',
  add column if not exists due_date text,
  add column if not exists subtasks jsonb default '[]'::jsonb not null,
  add column if not exists updated_at timestamptz default now() not null;

create index if not exists idx_tasks_user_category on public.tasks(user_id, category);
create index if not exists idx_tasks_user_due on public.tasks(user_id, due_date);
