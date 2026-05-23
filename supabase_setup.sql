-- ==========================================
-- ASKLY DATABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Clean up existing triggers and functions (if any)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.reports cascade;
drop table if exists public.messages cascade;
drop table if exists public.users cascade;

-- 1. Create PUBLIC.USERS Table
-- Extends the core auth.users table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null check (char_length(username) >= 3),
  avatar_url text,
  bio text default 'Ask me anything anonymously! 🤫',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create PUBLIC.MESSAGES Table
-- Stores the received anonymous questions
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  receiver_id uuid references public.users(id) on delete cascade not null,
  content text not null check (char_length(content) <= 300),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false not null,
  is_deleted boolean default false not null
);

-- 3. Create PUBLIC.REPORTS Table
-- Stores user reports for moderation/spam
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.messages(id) on delete cascade not null,
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================
create index idx_users_username on public.users(username);
create index idx_messages_receiver_id on public.messages(receiver_id);
create index idx_messages_is_deleted on public.messages(is_deleted);
create index idx_messages_receiver_unread on public.messages(receiver_id, is_read) where is_deleted = false;
create index idx_reports_message_id on public.reports(message_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS for all tables
alter table public.users enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- USERS POLICIES
create policy "Allow public read access to profiles" on public.users
  for select using (true);

create policy "Allow users to update their own profile" on public.users
  for update using (auth.uid() = id);

-- MESSAGES POLICIES
create policy "Allow anonymous insertion (anyone can send a message)" on public.messages
  for insert with check (true);

create policy "Allow receivers to read their own messages" on public.messages
  for select using (auth.uid() = receiver_id and is_deleted = false);

create policy "Allow receivers to update their own messages" on public.messages
  for update using (auth.uid() = receiver_id);

create policy "Allow receivers to soft delete their own messages" on public.messages
  for delete using (auth.uid() = receiver_id);

-- REPORTS POLICIES
create policy "Allow anonymous insertion of reports" on public.reports
  for insert with check (true);

create policy "Allow receivers to view reports on their messages" on public.reports
  for select using (
    exists (
      select 1 from public.messages m
      where m.id = reports.message_id and m.receiver_id = auth.uid()
    )
  );

-- ==========================================
-- AUTOMATION TRIGGERS FOR USER SIGNUP
-- ==========================================

-- Trigger function to automatically insert new profile in public.users on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_username text;
begin
  -- Try to extract username from user metadata, fallback to placeholder
  raw_username := coalesce(
    new.raw_user_meta_data->>'username',
    'asker_' || lower(substr(new.id::text, 1, 8))
  );

  -- Ensure username is unique; if collision, append suffix
  while exists (select 1 from public.users where username = raw_username) loop
    raw_username := 'asker_' || lower(substr(md5(random()::text), 1, 6));
  end loop;

  insert into public.users (id, username, avatar_url, bio)
  values (
    new.id,
    raw_username,
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/7.x/bottts/svg?seed=' || replace(replace(replace(replace(raw_username, ' ', ''), '%', ''), '&', ''), '=', '')
    ),
    'Ask me anything anonymously! 🤫'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
