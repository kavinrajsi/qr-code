# Step 6: Analytics Dashboard

## What we're doing

Building an analytics dashboard that visualizes scan data for each QR code — timeline charts, device/country breakdowns, and key metrics.

## How it works

```
User visits /analytics/:id
        ↓
Server Component fetches:
  1. QR code record (name, slug, URL)
  2. All scan records for that QR code
        ↓
computeAnalytics() processes raw scans into:
  - Total scans / unique scans / scans today
  - Daily scan counts (last 30 days)
  - Device type breakdown
  - Browser breakdown
  - Country breakdown (top 10)
        ↓
Rendered as charts + stat cards
```

## Files to create

### 6.1 Analytics computation

**`src/lib/analytics.ts`**

Pure function that takes an array of `QRScan` records and returns computed `QRAnalytics`:

```typescript
export function computeAnalytics(scans: QRScan[]): QRAnalytics {
  // Total scans = scans.length
  // Unique scans = scans where is_unique = true
  // Scans today = scans where scanned_at is today
  // Daily scans = count per day for last 30 days (zero-filled)
  // Device breakdown = group by device, count each
  // Browser breakdown = group by browser, count each
  // Top countries = group by country, count, sort desc, take 10
}
```

**Zero-filling**: The daily scans array always has 30 entries (one per day), even for days with zero scans. This makes the chart look correct with no gaps.

### 6.2 Scan timeline chart

**`src/components/analytics/scan-chart.tsx`**

Uses Recharts `AreaChart`:
- X-axis: dates (formatted as "MMM d")
- Y-axis: scan count
- Gradient fill under the line
- Tooltip showing exact date and count

### 6.3 Breakdown pie charts

**`src/components/analytics/breakdown-chart.tsx`**

Uses Recharts `PieChart`:
- Takes a title and data array of `{ name, value }`
- Color-coded pie slices
- Labels showing percentage
- Legend
- Empty state when no data

Used for both **device breakdown** and **country breakdown**.

### 6.4 Analytics view

**`src/components/analytics/analytics-view.tsx`**

Combines everything into a full page layout:

```
┌──────────────────────────────────┐
│ QR Code Name                     │
│ destination URL         /slug    │
├──────────┬──────────┬────────────┤
│ Total    │ Unique   │ Today  │Top│
│ Scans    │ Scans    │ Scans  │Cty│
├──────────┴──────────┴────────────┤
│ Scan Timeline Chart (30 days)    │
│ ██▁▃█▅▂▇▃▁▅██▃▁▂▅█▇▃▅▂▁▃██▅▃▂ │
├────────────────┬─────────────────┤
│ Device         │ Country         │
│ Pie Chart      │ Pie Chart       │
├────────────────┴─────────────────┤
│ Top Countries List               │
│ United States          42 scans  │
│ Germany                18 scans  │
│ Japan                  12 scans  │
└──────────────────────────────────┘
```

### 6.5 Analytics page

**`src/app/(app)/analytics/[id]/page.tsx`**

Server Component that:
1. Fetches the QR code by ID
2. Fetches all scans for that QR code
3. Runs `computeAnalytics()` server-side
4. Passes data to `<AnalyticsView />`

## What gets tracked per scan

| Field | Source | Example |
|-------|--------|---------|
| `device` | User-Agent parsing | `mobile`, `tablet`, `desktop` |
| `browser` | User-Agent parsing | `Chrome`, `Safari`, `Firefox` |
| `os` | User-Agent parsing | `iOS`, `Android`, `Windows` |
| `country` | CDN header (`x-vercel-ip-country`) | `US`, `DE`, `JP` |
| `city` | CDN header (`x-vercel-ip-city`) | `San Francisco` |
| `ip` | `x-forwarded-for` header | `203.0.113.1` |
| `referrer` | `Referer` header | `https://twitter.com` |
| `is_unique` | Same IP + QR in 24h check | `true` / `false` |
| `scanned_at` | Auto-set by database | `2024-01-15T10:30:00Z` |

> **Note on country/city**: These headers are automatically set by Vercel and Cloudflare. In local development, they'll be `null`. You'll see real data once deployed.

## Verify

1. Create a QR code and scan it a few times (visit `/qr/your-slug` in different browsers)
2. Go to the dashboard → click the "Analytics" button on that QR code
3. You should see:
   - Stat cards with scan counts
   - A timeline chart (spikes on today)
   - Device breakdown (desktop in dev)
   - Country might show "Unknown" locally

## Next Step

→ [Step 7: Dashboard](./07-dashboard.md)
