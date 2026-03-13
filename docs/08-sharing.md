# Step 8: Sharing & Embedding

## What we're doing

Building public share pages, social share buttons, and embeddable iframe support so users can distribute their QR codes anywhere.

## Share page flow

```
QR code owner gets share link → /share/abc123
        ↓
Anyone visits that link
        ↓
If password protected:
  → Show password prompt
  → Verify password → show QR page
If not protected:
  → Show QR code + download + share options
```

## Files to create

### 8.1 Share page (server)

**`src/app/share/[slug]/page.tsx`**

Server Component that:
1. Fetches QR code by slug
2. Returns 404 if not found
3. Passes data to `<SharePageClient />`

### 8.2 Share page client

**`src/components/shared/share-page-client.tsx`**

The share page displays:

```
┌─────────────────────────────┐
│         QR Code Name        │
│        Description          │
├─────────────────────────────┤
│                             │
│     ██████████████████      │
│     █ QR CODE PREVIEW █     │
│     ██████████████████      │
│                             │
│     destination-url.com     │
├─────────────────────────────┤
│  Download                   │
│  [Format ▾] [Resolution ▾] │
│  [  Download QR Code  ]    │
├─────────────────────────────┤
│  Share                      │
│  [share-url............][📋]│
│  [Twitter] [LinkedIn] [FB] │
├─────────────────────────────┤
│  Embed                      │
│  [<iframe src="...">...][📋]│
└─────────────────────────────┘
```

**Features**:
- Full download panel (same as create page)
- Copy share URL button
- Social share buttons (Twitter/X, LinkedIn, Facebook)
- Embeddable iframe code with copy button
- Password gate (if `qr.password` is set)

**Password protection flow**:
1. If QR code has a password, show a password input
2. User enters password → compare with `qr.password`
3. If correct, reveal the full share page
4. If incorrect, show error toast

### 8.3 Embed page

**`src/app/embed/qr/[slug]/page.tsx`** + **`embed-client.tsx`**

Minimal page designed for iframe embedding:
- No navigation, no chrome
- Just the QR code centered on the page
- Uses the same `<QRPreview />` component

**Usage**: Users copy the embed code and paste it into their website:

```html
<iframe src="https://your-app.com/embed/qr/abc123" width="300" height="300" frameborder="0"></iframe>
```

### 8.4 Social share URLs

The share buttons open these URLs in a new window:

| Platform | URL Pattern |
|----------|------------|
| Twitter/X | `https://twitter.com/intent/tweet?url={shareUrl}&text={text}` |
| LinkedIn | `https://www.linkedin.com/sharing/share-offsite/?url={shareUrl}` |
| Facebook | `https://www.facebook.com/sharer/sharer.php?u={shareUrl}` |

## Verify

1. Create a QR code from the dashboard
2. Click the "Share" action in the dropdown
3. The share page should open in a new tab showing:
   - QR code preview with correct styling
   - Download options
   - Share URL with copy button
   - Social buttons (clicking them should open share dialogs)
   - Embed code with copy button
4. Copy the embed iframe code → paste in an HTML file → open it → QR code should render
5. Create a password-protected QR code → visit its share page → password prompt should appear

## Next Step

→ [Step 9: Bulk Generation & API](./09-bulk-and-api.md)
