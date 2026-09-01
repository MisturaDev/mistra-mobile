-- Run this in Supabase Dashboard → SQL Editor → New query

-- Add priority and due_date to tasks table
alter table public.tasks 
  add column if not exists priority text default 'medium' not null,
  add column if not exists due_date timestamptz;
