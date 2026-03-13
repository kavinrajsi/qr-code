# Step 5: Dynamic QR Codes & Redirects

## What we're doing

Making QR codes "dynamic" — the QR code itself never changes, but the destination URL can be updated anytime. This works by encoding a redirect URL (`/qr/abc123`) instead of the final destination.

## How it works

```
QR Code encodes → https://your-app.com/qr/abc123
                        ↓
User scans QR code
                        ↓
Browser hits GET /qr/abc123
                        ↓
Route handler:
  1. Looks up slug "abc123" in qr_codes table
  2. Checks if QR is active
  3. Checks expiration date
  4. Checks password protection
  5. Fires async scan log (non-blocking)
  6. Redirects (302) to destination_url
                        ↓
User lands on the actual destination
```

## Why dynamic QR codes matter

| Static QR | Dynamic QR |
|-----------|-----------|
| URL is baked into the QR pattern | QR points to your redirect route |
| Change URL = need a new QR code | Change URL in database, same QR code |
| No analytics possible | Every scan passes through your server |
| Free, no backend needed | Requires your app to be running |

## Files to create

### 5.1 Redirect route handler

**`src/app/qr/[slug]/route.ts`**

This is a **Route Handler** (not a page) — it runs server-side and returns a redirect.

```
GET /qr/:slug
  → Query: SELECT * FROM qr_codes WHERE slug = :slug AND is_active = true
  → If not found: redirect to /
  → If expired: return 410 Gone
  → If password protected: redirect to /share/:slug?verify=true
  → Fire scan log (async, non-blocking)
  → Redirect to destination_url
```

Key implementation details:

1. **Non-blocking scan logging**: We fire a `fetch()` to `/api/qr/scan` without `await`ing it. The user gets redirected immediately; analytics are logged in the background.

2. **Header forwarding**: We pass through `User-Agent`, `X-Forwarded-For`, `X-Vercel-IP-Country`, and other headers to the scan API so analytics have accurate device/location data.

3. **Password protection**: Instead of blocking the redirect, we send the user to the public share page with a `?verify=true` parameter, which shows a password prompt.

### 5.2 Scan logging API

**`src/app/api/qr/scan/route.ts`**

```
POST /api/qr/scan
Body: { qr_id, referrer }
Headers: User-Agent, X-Forwarded-For, X-Vercel-IP-Country, etc.

  → Parse user agent (ua-parser-js) → device, browser, OS
  → Extract IP from headers
  → Extract country from CDN headers (Vercel/Cloudflare)
  → Check uniqueness (same IP + QR in last 24h)
  → Insert into qr_scans table
```

**Uniqueness logic**: A scan is marked `is_unique = true` if no scan from the same IP address for the same QR code exists in the last 24 hours. This is a privacy-friendly heuristic — no cookies or fingerprinting needed.

### 5.3 Slug generation

When a new QR code is created, `generateSlug()` creates an 8-character nanoid like `abc12XYz`. This becomes the redirect path: `/qr/abc12XYz`.

The slug is stored in `qr_codes.slug` (unique index) and never changes, even when the destination URL is updated.

## Flow diagram

```
┌─────────────────────────────┐
│  QR Code (printed/shared)   │
│  Encodes: app.com/qr/abc123 │
└─────────────┬───────────────┘
              │ scan
              ▼
┌─────────────────────────────┐
│  GET /qr/abc123             │
│  Route Handler              │
│  ┌─────────────────────┐    │
│  │ Lookup slug in DB   │    │
│  │ Check active/expiry │    │
│  │ Fire scan log async │    │
│  │ Return 302 redirect │    │
│  └─────────────────────┘    │
└─────────────┬───────────────┘
              │ redirect
              ▼
┌─────────────────────────────┐
│  https://actual-website.com │
│  (destination_url)          │
└─────────────────────────────┘
```

## Verify

1. Create a QR code pointing to `https://google.com`
2. Note the slug in the dashboard (e.g., `/abc123`)
3. Visit `http://localhost:3000/qr/abc123` in your browser
4. You should be redirected to Google
5. Check `qr_scans` table in Supabase — a new row should appear
6. Edit the QR code → change destination to `https://github.com`
7. Visit the same `/qr/abc123` URL — now redirects to GitHub
8. The QR code image itself didn't change!

## Next Step

→ [Step 6: Analytics Dashboard](./06-analytics.md)
