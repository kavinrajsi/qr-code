-- ============================================
-- QR Code Generator - Supabase Database Schema
-- ============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- QR Codes table
-- ============================================
create table public.qr_codes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  qr_type text default 'url' not null,
  destination_url text not null,
  content_data jsonb,
  description text,
  qr_color text default '#000000' not null,
  bg_color text default '#FFFFFF' not null,
  logo_url text,
  dot_style text default 'square' not null,
  corner_style text default 'square' not null,
  logo_size numeric default 0.3 not null,
  is_dynamic boolean default true not null,
  is_active boolean default true not null,
  password text,
  expires_at timestamptz,
  folder text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast slug lookups (redirect route)
create index idx_qr_codes_slug on public.qr_codes(slug);
create index idx_qr_codes_user_id on public.qr_codes(user_id);

-- ============================================
-- QR Scans table (analytics)
-- ============================================
create table public.qr_scans (
  id uuid default uuid_generate_v4() primary key,
  qr_id uuid references public.qr_codes(id) on delete cascade not null,
  scanned_at timestamptz default now() not null,
  country text,
  city text,
  device text,
  browser text,
  os text,
  ip text,
  referrer text,
  is_unique boolean default false not null
);

create index idx_qr_scans_qr_id on public.qr_scans(qr_id);
create index idx_qr_scans_scanned_at on public.qr_scans(scanned_at);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table public.qr_codes enable row level security;
alter table public.qr_scans enable row level security;

-- QR Codes: users can only access their own
create policy "Users can view own QR codes"
  on public.qr_codes for select
  using (auth.uid() = user_id);

create policy "Users can create QR codes"
  on public.qr_codes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own QR codes"
  on public.qr_codes for update
  using (auth.uid() = user_id);

create policy "Users can delete own QR codes"
  on public.qr_codes for delete
  using (auth.uid() = user_id);

-- Public read access for slug lookups (needed for redirects)
create policy "Public can read QR codes by slug"
  on public.qr_codes for select
  using (true);

-- QR Scans: users can read scans for their QR codes
create policy "Users can view scans for own QR codes"
  on public.qr_scans for select
  using (
    exists (
      select 1 from public.qr_codes
      where public.qr_codes.id = qr_id
      and public.qr_codes.user_id = auth.uid()
    )
  );

-- Allow anonymous inserts for scan tracking
create policy "Anyone can insert scans"
  on public.qr_scans for insert
  with check (true);

-- ============================================
-- Functions
-- ============================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_qr_code_updated
  before update on public.qr_codes
  for each row execute function public.handle_updated_at();

-- ============================================
-- Storage bucket for QR logos
-- ============================================
insert into storage.buckets (id, name, public)
values ('qr-logos', 'qr-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('qr-pdfs', 'qr-pdfs', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload logos"
  on storage.objects for insert
  with check (bucket_id = 'qr-logos' and auth.role() = 'authenticated');

create policy "Anyone can view logos"
  on storage.objects for select
  using (bucket_id = 'qr-logos');

create policy "Users can delete own logos"
  on storage.objects for delete
  using (bucket_id = 'qr-logos' and auth.uid()::text = (storage.foldername(name))[1]);

-- PDF storage policies
create policy "Users can upload PDFs"
  on storage.objects for insert
  with check (bucket_id = 'qr-pdfs' and auth.role() = 'authenticated');

create policy "Anyone can view PDFs"
  on storage.objects for select
  using (bucket_id = 'qr-pdfs');

create policy "Users can delete own PDFs"
  on storage.objects for delete
  using (bucket_id = 'qr-pdfs' and auth.uid()::text = (storage.foldername(name))[1]);
