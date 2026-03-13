# Step 2: Supabase Setup

## What we're doing

Creating a Supabase project, setting up the database schema, storage bucket, and authentication providers.

## Steps

### 2.1 Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose an organization (or create one)
4. Fill in:
   - **Project name**: `qr-code-generator`
   - **Database password**: Choose a strong password (save it somewhere safe)
   - **Region**: Pick the closest to your users
5. Click **Create new project** and wait for it to provision (~2 minutes)

### 2.2 Get your API keys

1. Go to **Project Settings** → **API**
2. Copy these values into your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...your-anon-key
```

> **Important**: The anon key is safe to expose in the browser. It works with Row Level Security (RLS) to limit what users can access.

### 2.3 Run the database schema

1. Go to **SQL Editor** in the Supabase Dashboard
2. Click **New Query**
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run**

This creates:

| Item | What it does |
|------|-------------|
| `qr_codes` table | Stores QR code data (name, slug, URL, styles) |
| `qr_scans` table | Stores scan analytics (device, country, browser, IP) |
| RLS policies on `qr_codes` | Users can only CRUD their own QR codes; anyone can read by slug |
| RLS policies on `qr_scans` | Users can view scans for their QR codes; anyone can insert scans |
| `handle_updated_at()` trigger | Auto-updates `updated_at` column on edits |
| `qr-logos` storage bucket | Public bucket for logo image uploads |
| Storage policies | Authenticated users can upload; anyone can view |

### 2.4 Verify tables were created

1. Go to **Table Editor** in the sidebar
2. You should see two tables:
   - `qr_codes` — with columns: id, user_id, name, slug, destination_url, qr_color, bg_color, etc.
   - `qr_scans` — with columns: id, qr_id, scanned_at, country, device, browser, etc.

### 2.5 Verify storage bucket

1. Go to **Storage** in the sidebar
2. You should see a `qr-logos` bucket listed
3. It should be marked as **Public**

### 2.6 Set up Email/Password auth

This is enabled by default. Verify:

1. Go to **Authentication** → **Providers**
2. Confirm **Email** provider is enabled
3. Optionally disable **Confirm email** for easier development:
   - Authentication → **Settings** → Toggle off "Enable email confirmations"

### 2.7 Set up Google OAuth (optional but recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**
8. Back in Supabase:
   - Go to **Authentication** → **Providers** → **Google**
   - Toggle it **ON**
   - Paste in Client ID and Client Secret
   - Save

### 2.8 Set redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000`
3. Add to **Redirect URLs**:
   ```
   http://localhost:3000/callback
   http://localhost:3000/**
   ```
4. For production, add your deployed URL too:
   ```
   https://your-domain.com/callback
   https://your-domain.com/**
   ```

## Verify

Run this in the SQL Editor to confirm everything is set up:

```sql
-- Should return the qr_codes table structure
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'qr_codes' ORDER BY ordinal_position;

-- Should return the qr_scans table structure
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'qr_scans' ORDER BY ordinal_position;

-- Should return RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('qr_codes', 'qr_scans');
```

## Next Step

→ [Step 3: Authentication](./03-authentication.md)
