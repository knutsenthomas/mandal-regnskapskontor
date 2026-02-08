-- Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  address text,
  phone text,
  birthdate date,
  avatar_url text
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Allow public read access (optional, depending on needs currently admin only so strict is better)
create policy "Profiles are viewable by users who created them."
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Optional: Create a trigger to automatically create a profile entry when a new user signs up
-- but for now, we can handle creation in the UI if it doesn't exist.
