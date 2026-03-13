# Step 7: Dashboard

## What we're doing

Building the main dashboard where users see all their QR codes, search/filter them, and access actions (edit, analytics, share, delete).

## How it works

```
User visits /dashboard
        ↓
useQRCodes() hook:
  1. Gets current user via supabase.auth.getUser()
  2. Queries qr_codes with scan counts (aggregation)
  3. Filters by search term (client-side)
        ↓
Renders:
  - Stats cards (totals at a glance)
  - Searchable table with actions
```

## Files to create

### 7.1 useQRCodes hook

**`src/hooks/use-qr-codes.ts`**

Client-side hook that:
- Fetches all QR codes for the current user with scan counts
- Uses Supabase's relation query: `.select("*, qr_scans(count)")`
- Provides client-side search filtering (by name or URL)
- Provides a delete function
- Returns `{ qrCodes, loading, search, setSearch, deleteQRCode, refetch }`

### 7.2 Stats cards

**`src/components/dashboard/stats-cards.tsx`**

Four summary cards at the top:

| Card | Calculation |
|------|------------|
| Total QR Codes | `qrCodes.length` |
| Total Scans | Sum of all `scan_count` values |
| Active QR Codes | Count where `is_active = true` |
| Avg. Scans/QR | `totalScans / totalQRs` |

### 7.3 QR table

**`src/components/dashboard/qr-table.tsx`**

Full-featured data table:

| Column | Content |
|--------|---------|
| Name | QR name + slug below it |
| Destination | URL with external link icon (hidden on mobile) |
| Scans | Badge with scan count |
| Created | Formatted date (hidden on small screens) |
| Actions | Dropdown menu |

**Actions dropdown menu**:
- Edit → navigates to `/edit/:id`
- Analytics → navigates to `/analytics/:id`
- Copy Link → copies `/qr/:slug` to clipboard
- Share → opens `/share/:slug` in new tab
- Delete → confirmation dialog, then deletes

**Other features**:
- Search bar with search icon
- Loading skeletons (5 rows) while fetching
- Empty state message when no QR codes exist
- Delete confirmation dialog to prevent accidents

### 7.4 Dashboard page

**`src/app/(app)/dashboard/page.tsx`**

Client component that:
1. Uses the `useQRCodes` hook
2. Renders `<StatsCards />` and `<QRTable />`
3. Has a "Create QR Code" button linking to `/create`

### 7.5 App layout

**`src/app/(app)/layout.tsx`**

Wraps all protected pages with:
- `<Navbar />` at the top
- Container with padding for the content

### 7.6 Navbar

**`src/components/shared/navbar.tsx`**

Sticky top navigation bar with:
- Logo/brand linking to dashboard
- "Create QR" button
- Dark mode toggle (Sun/Moon icon)
- User dropdown (email, dashboard link, sign out)

## Verify

1. Visit http://localhost:3000/dashboard
2. If you have QR codes, they should appear in the table
3. Stats cards should show correct totals
4. Search for a QR code by name — table filters
5. Click the actions dropdown — all links should work
6. Click Delete → confirmation dialog → confirm → QR disappears
7. Toggle dark mode — entire app should switch

## Next Step

→ [Step 8: Sharing & Embedding](./08-sharing.md)
