# Hosting Requirements

What server and database infrastructure you need to run this app in production.

## Server

### Runtime: Node.js (Next.js 16)

This is a **Next.js 16 App Router** application. It requires a hosting platform that supports:

- **Node.js 20+** runtime for server-side rendering and API routes
- **Serverless functions** for 3 API endpoints (`/api/qr/generate`, `/api/qr/scan`, `/api/qr/verify`)
- **Dynamic routing** for QR redirects (`/qr/[slug]`), share pages, and embeds
- **Edge-compatible middleware** for auth route protection

There are no background workers, cron jobs, or WebSocket connections — all processing is synchronous within request/response cycles. This makes the app fully serverless.

### Recommended: Vercel

The app uses Vercel-specific geo headers (`x-vercel-ip-country`, `x-vercel-ip-city`) for scan location analytics. It falls back to Cloudflare headers (`cf-ipcountry`) if Vercel headers are unavailable.

| Platform | Compatibility | Notes |
|----------|--------------|-------|
| **Vercel** | Full | Zero-config, geo headers work out of the box |
| **Netlify** | Good | Next.js adapter required |
| **AWS Amplify** | Good | Built-in Next.js support |
| **Railway** | Good | Set start command to `npm start` |
| **Fly.io** | Good | Requires Dockerfile ([example](./11-deployment.md#docker-deployment)) |
| **Docker / self-hosted** | Good | Requires `output: "standalone"` in next.config.ts |

### Compute requirements

The app is lightweight — QR code images are generated **client-side** via `qr-code-styling`, so the server never renders or stores QR images.

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | Shared / serverless | 1 vCPU |
| Memory | 512 MB | 1 GB |
| Disk | Not needed (no local storage) | — |
| Bandwidth | Depends on traffic | 100 GB/mo for moderate use |

---

## Database

### PostgreSQL 17 (via Supabase)

The app uses **Supabase** as a Backend-as-a-Service, which provides the database, auth, and file storage in one platform.

#### Tables

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `qr_codes` | QR code metadata and customization | `slug` (unique), `user_id`, `destination_url`, `content_data` (JSONB), `customization`, `password`, `expires_at`, `folder` |
| `qr_scans` | Scan analytics | `qr_id`, `scanned_at`, `country`, `city`, `device`, `browser`, `os`, `ip`, `is_unique` |

#### Indexes

- `qr_codes.slug` — fast public redirect lookups
- `qr_codes.user_id` — dashboard queries
- `qr_scans.qr_id` — analytics per QR code
- `qr_scans.scanned_at` — time-range analytics

#### Row Level Security (RLS)

RLS is enabled on both tables:

- Users can only read/write/delete **their own** QR codes
- Anyone can read a QR code **by slug** (for public redirects)
- Anyone can **insert** scan records (anonymous analytics logging)
- Users can read scans **for their own** QR codes

#### Storage requirements

| Use case | Expected size |
|----------|--------------|
| QR codes table | ~1 KB per record |
| Scans table | ~200 bytes per scan |
| 1,000 QR codes + 100K scans | ~25 MB |

---

## Authentication

### Supabase Auth (JWT-based)

| Feature | Configuration |
|---------|--------------|
| **Methods** | Email/password, Google OAuth |
| **JWT expiry** | 3600 seconds (1 hour) |
| **Refresh token rotation** | Enabled |
| **Session management** | Cookie-based via `@supabase/ssr` |
| **Rate limits** | 30 signups/logins per IP per 5 min |

No external auth provider (Auth0, Clerk, etc.) is needed — Supabase Auth handles everything.

---

## File Storage

### Supabase Storage (S3-compatible)

Two public buckets:

| Bucket | Purpose | Max file size |
|--------|---------|---------------|
| `qr-logos` | Logo images uploaded for QR customization | 50 MB |
| `qr-pdfs` | PDF files for PDF-type QR codes | 50 MB |

Storage policies enforce user-based access: authenticated uploads, public reads, owner-only deletes.

Generated QR code images are **not stored server-side** — they're rendered in the browser and downloaded directly.

---

## Environment Variables

All required environment variables are client-side (`NEXT_PUBLIC_*`). No server-side secrets are needed — the app uses Supabase's publishable (anon) key with RLS for security.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Yes | Supabase anon/publishable key |
| `NEXT_PUBLIC_APP_URL` | Yes | Application base URL (used for QR redirect links) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics measurement ID |

---

## External Services

| Service | Required | Free tier | Purpose |
|---------|----------|-----------|---------|
| **Supabase** | Yes | 500 MB database, 1 GB storage, 50K auth users | Database, auth, file storage |
| **Google OAuth** | No | Free | Social login via Supabase |
| **Google Analytics** | No | Free | Site-level analytics |

No paid third-party APIs are required. Geolocation data comes from hosting platform headers (Vercel/Cloudflare), not a separate geo API.

---

## Cost Estimates

### Free tier (hobby / side project)

| Component | Provider | Cost |
|-----------|----------|------|
| App hosting | Vercel Hobby | $0 |
| Database + auth + storage | Supabase Free | $0 |
| Domain | Vercel subdomain | $0 |
| **Total** | | **$0/mo** |

### Production (moderate traffic)

| Component | Provider | Cost |
|-----------|----------|------|
| App hosting | Vercel Pro | $20/mo |
| Database + auth + storage | Supabase Pro | $25/mo |
| Custom domain | Any registrar | ~$1/mo |
| **Total** | | **~$46/mo** |

Supabase Pro adds: 8 GB database, 100 GB storage, daily backups, and 7-day log retention.

---

## Architecture Summary

```
Browser                        Vercel (Node.js)               Supabase
───────                        ────────────────               ────────
React SPA (CSR)       ──→  SSR + API Routes          ──→  PostgreSQL 17
qr-code-styling       ──→  Middleware (auth)          ──→  Auth (JWT)
(client-side render)       Route Handlers             ──→  Storage (S3)
                           /qr/[slug] redirect
                           /api/qr/* endpoints
```

For step-by-step deployment instructions, see [Step 11: Deployment](./11-deployment.md).
