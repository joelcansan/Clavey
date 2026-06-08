-- ============================================================
-- NoteVault — Esquema Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- TABLA: profiles
-- ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ──────────────────────────────────────────────
-- TABLA: notes
-- ──────────────────────────────────────────────
create table if not exists public.notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'Sin título',
  content     text,
  bg_color    text default '#ffffff',
  tags        text[] default '{}',
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists notes_created_at_idx on public.notes(created_at desc);
create index if not exists notes_updated_at_idx on public.notes(updated_at desc);

create trigger notes_updated_at
  before update on public.notes
  for each row execute procedure public.update_updated_at();

-- ──────────────────────────────────────────────
-- TABLA: password_entries
-- ──────────────────────────────────────────────
create table if not exists public.password_entries (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  service_name    text not null,
  service_icon    text,
  username        text not null,
  encrypted_pass  text not null,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

create index if not exists password_entries_user_id_idx on public.password_entries(user_id);
create index if not exists password_entries_created_at_idx on public.password_entries(created_at desc);

create trigger password_entries_updated_at
  before update on public.password_entries
  for each row execute procedure public.update_updated_at();

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────
alter table public.profiles enable row level security;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

alter table public.notes enable row level security;
create policy "Users can view their own notes" on public.notes for select using (auth.uid() = user_id);
create policy "Users can insert their own notes" on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can update their own notes" on public.notes for update using (auth.uid() = user_id);
create policy "Users can delete their own notes" on public.notes for delete using (auth.uid() = user_id);

alter table public.password_entries enable row level security;
create policy "Users can view their own passwords" on public.password_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own passwords" on public.password_entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own passwords" on public.password_entries for update using (auth.uid() = user_id);
create policy "Users can delete their own passwords" on public.password_entries for delete using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- STORAGE BUCKETS
-- ──────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('note-images', 'note-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;

create policy "Users can upload note images" on storage.objects for insert with check (bucket_id = 'note-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Anyone can view note images" on storage.objects for select using (bucket_id = 'note-images');
create policy "Users can delete their note images" on storage.objects for delete using (bucket_id = 'note-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can upload their avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Anyone can view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can update their avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
