# QR Code Generator

A modern, full-featured QR code generator web application with dynamic QR codes, real-time customization, scan analytics, and sharing capabilities.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **QR Generation**: qr-code-styling
- **Charts**: Recharts
- **Auth**: Supabase Auth (Email/Password + Google OAuth)

## Features

- **QR Code Generator** — Custom colors, dot styles (6 options), corner styles, logo upload with size control, live preview
- **Dynamic QR Codes** — Editable destination URLs without changing the QR code
- **Download** — PNG, JPG, SVG at 512px / 1024px / 2048px
- **Analytics Dashboard** — Total/unique scans, daily timeline chart, device/country/browser breakdowns
- **Share** — Public share page, social buttons (Twitter, LinkedIn, Facebook), embeddable iframe snippet
- **Bulk Generation** — CSV upload to create many QR codes at once
- **REST API** — `POST /api/qr/generate` for programmatic creation
- **Password Protection** — Optional password gate on QR codes
- **Expiration Dates** — Auto-expire QR codes after a set date
- **Folder Organization** — Group QR codes into folders
- **Dark Mode** — System-aware with manual toggle

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected routes (navbar layout)
│   │   ├── dashboard/      # QR codes table + stats
│   │   ├── create/         # Single + bulk CSV creation
│   │   ├── edit/[id]/      # Edit existing QR code
│   │   └── analytics/[id]/ # Per-QR scan analytics
│   ├── (auth)/             # Auth routes (minimal layout)
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/       # OAuth callback
│   ├── api/qr/
│   │   ├── scan/           # Scan logging endpoint
│   │   └── generate/       # QR creation API
│   ├── qr/[slug]/          # Dynamic redirect (scan → log → redirect)
│   ├── share/[slug]/       # Public share page
│   └── embed/qr/[slug]/    # Embeddable iframe
├── components/
│   ├── qr/                 # QR preview, form, color picker, download, bulk
│   ├── dashboard/          # Stats cards, QR table
│   ├── analytics/          # Charts (area, pie)
│   ├── auth/               # Login/signup forms
│   └── shared/             # Navbar, theme provider, share page
├── hooks/                  # useUser, useQRCodes
├── lib/
│   ├── supabase/           # Client, server, middleware
│   ├── qr.ts               # QR generation logic
│   ├── analytics.ts        # Analytics computation
│   └── slug.ts             # Slug generation (nanoid)
└── types/                  # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy the contents of supabase/schema.sql and execute in:
# Supabase Dashboard → SQL Editor → New Query → Paste → Run
```

This creates:
- `qr_codes` table with RLS policies
- `qr_scans` table for analytics
- `qr-logos` storage bucket
- Auto-update triggers

### 4. Configure authentication

In your Supabase Dashboard:

1. **Email/Password**: Enabled by default
2. **Google OAuth**: Go to Authentication → Providers → Google, and add your Google OAuth credentials
3. **Redirect URLs**: Add `http://localhost:3000/callback` to the allowed redirect URLs

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Usage

### Create QR Code(s)

```bash
# Single
curl -X POST /api/qr/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "My QR", "destination_url": "https://example.com"}'

# Bulk
curl -X POST /api/qr/generate \
  -H "Content-Type: application/json" \
  -d '[{"name": "QR 1", "destination_url": "https://example.com"}, ...]'
```

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in your Vercel project settings.

### Other platforms

```bash
npm run build
npm start
```

## Database Schema

See [`supabase/schema.sql`](./supabase/schema.sql) for the complete schema including:
- Tables: `qr_codes`, `qr_scans`
- Row Level Security policies
- Storage bucket configuration
- Auto-update triggers
