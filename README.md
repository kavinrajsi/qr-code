# QR Code Generator

A modern, full-featured QR code generator web application with multi-type QR codes, real-time customization, scan analytics with world map visualization, and sharing capabilities.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Font**: IBM Plex Sans
- **Styling**: Tailwind CSS v4 + shadcn/ui (Base UI)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **QR Generation**: qr-code-styling
- **Charts**: Recharts
- **Maps**: MapLibre GL (@mapcn/analytics-map)
- **Auth**: Supabase Auth (Email/Password + Google OAuth)

## Features

- **9 QR Code Types** — Website URL, PDF, Multiple Links, Profile Card (vCard), Plain Text, App, SMS, Email, Phone
- **3-Step Wizard** — Choose Type → Additional Information → QR Design, with stepper navigation
- **Profile Card with Photo** — Upload profile image, auto-generates vCard with PHOTO field for instant contact save on scan
- **vCard Auto-Save** — Contact QR codes serve `.vcf` files directly so phones prompt "Add Contact" automatically
- **Full Customization** — QR/background colors, 6 dot styles, 3 corner styles, logo upload with size control, frame styles with labels
- **Dynamic QR Codes** — Update destination URLs anytime without changing the QR code
- **Download** — PNG, JPG, SVG at 512px / 1024px / 2048px with optional frames
- **Analytics Dashboard** — Total/unique scans, daily timeline chart, device/country/browser breakdowns
- **Analytics Map** — World map with scan location markers, overview card with sparkline and device donut chart, breakdown cards
- **Share** — Public share page, social buttons (Twitter, LinkedIn, Facebook), embeddable iframe snippet
- **Bulk Generation** — CSV upload to create many QR codes at once
- **REST API** — `POST /api/qr/generate` for programmatic creation
- **Password Protection** — Optional password gate on QR codes
- **Expiration Dates** — Auto-expire QR codes after a set date
- **Folder Organization** — Group QR codes into folders with sidebar navigation
- **Dark Mode** — Light/Dark toggle
- **Sidebar Layout** — Branded top bar, left sidebar with QR Codes, Folders, Account navigation
- **Mobile Responsive** — Optimized for all screen sizes with mobile hamburger menu

## Project Structure

```
src/
├── app/
│   ├── (app)/                # Protected routes (sidebar + navbar layout)
│   │   ├── dashboard/        # QR codes table + stats view with analytics map
│   │   ├── create/           # 3-step wizard (single + bulk CSV)
│   │   ├── edit/[id]/        # Edit existing QR code
│   │   ├── analytics/[id]/   # Per-QR scan analytics
│   │   ├── account/          # Profile, password, appearance, QR defaults, notifications
│   │   └── folders/[name]/   # Folder-specific QR code list
│   ├── (auth)/               # Auth routes (minimal layout)
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/         # OAuth callback
│   ├── api/qr/
│   │   ├── scan/             # Scan logging endpoint
│   │   ├── verify/           # Password verification
│   │   └── generate/         # QR creation API
│   ├── qr/[slug]/            # Dynamic redirect (scan → log → redirect/vCard)
│   ├── view/[slug]/           # Landing pages (multi-URL, text, app)
│   ├── share/[slug]/         # Public share page
│   └── embed/qr/[slug]/      # Embeddable iframe
├── components/
│   ├── qr/                   # QR preview, form wizard, color picker, download, type fields, bulk, frame
│   ├── dashboard/            # Stats cards, QR table, stats view, analytics map, breakdown cards
│   ├── analytics/            # Charts (area, pie)
│   ├── auth/                 # Login/signup forms
│   ├── shared/               # Navbar, sidebar, theme provider, share page
│   └── ui/                   # shadcn/ui components + map
├── hooks/                    # useUser, useQRCodes, useFolders, useScanStats
├── lib/
│   ├── supabase/             # Client, server, middleware
│   ├── qr.ts                 # QR generation logic
│   ├── qr-content.ts         # Content encoding, vCard builder, type helpers
│   ├── analytics.ts          # Analytics computation
│   ├── scan-logger.ts        # Scan logging with geo/device detection
│   └── slug.ts               # Slug generation (nanoid)
└── types/                    # TypeScript interfaces (QR types, content data, frames)
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

Fill in your Supabase project URL and publishable key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy the contents of supabase/schema.sql and execute in:
# Supabase Dashboard → SQL Editor → New Query → Paste → Run
```

This creates:
- `qr_codes` table with RLS policies (includes `qr_type`, `content_data` JSONB, frame fields)
- `qr_scans` table for analytics
- Storage buckets: `qr-logos`, `qr-pdfs`, `profile-images`
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

## QR Code Types

| Type | Description | Dynamic | Output |
|------|-------------|---------|--------|
| Website URL | Link to any URL | Optional | Redirect |
| PDF | Share PDF document | Optional | Redirect to file |
| Multiple Links | Share multiple links | Always | Landing page |
| Profile Card | Contact vCard with photo | Optional | Auto-save .vcf |
| Plain Text | Share text content | Always | Landing page |
| App | iOS + Android app links | Always | Landing page |
| SMS | Pre-filled SMS message | Optional | `sms:` URI |
| Email | Pre-filled email | Optional | `mailto:` URI |
| Phone | Phone call | Optional | `tel:` URI |

## Storage Buckets

| Bucket | Purpose | Public |
|--------|---------|--------|
| `qr-logos` | QR code center logos | Yes |
| `qr-pdfs` | PDF file uploads | Yes |
| `profile-images` | Contact profile photos | Yes |

## API Usage

### Create QR Code(s)

```bash
# Single
curl -X POST /api/qr/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "My QR", "destination_url": "https://example.com"}'

# With type and content data
curl -X POST /api/qr/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "Contact", "qr_type": "contact", "content_data": {"first_name": "John", "last_name": "Doe", "phone": "+1234567890"}}'

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
- Tables: `qr_codes` (with `qr_type`, `content_data` JSONB, frame fields), `qr_scans`
- Row Level Security policies
- Storage bucket configuration (`qr-logos`, `qr-pdfs`, `profile-images`)
- Auto-update triggers
