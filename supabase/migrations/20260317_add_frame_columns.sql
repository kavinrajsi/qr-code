-- Add frame columns to qr_codes table
alter table public.qr_codes
  add column if not exists outer_frame text default 'none' not null,
  add column if not exists frame_label text default 'SCAN ME' not null,
  add column if not exists label_font text default 'Arial, Helvetica, sans-serif' not null,
  add column if not exists frame_color text default '#000000' not null;
