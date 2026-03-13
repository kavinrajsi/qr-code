# Step 9: Bulk Generation & API

## What we're doing

Adding the ability to create many QR codes at once via CSV upload, and a REST API for programmatic QR code creation.

## Bulk CSV upload

### How it works

```
User uploads CSV file
        ↓
papaparse parses CSV → array of { name, destination_url }
        ↓
Preview table shows the parsed rows
        ↓
User clicks "Create X QR Codes"
        ↓
POST /api/qr/generate with array of items
        ↓
API creates each QR code with a unique slug
        ↓
Redirect to dashboard
```

### CSV format

The CSV file must have these columns (header row required):

```csv
name,destination_url
My Website,https://example.com
Blog Post,https://blog.example.com/post-1
Product Page,https://shop.example.com/product-123
```

Optional columns that will be used if present:
```csv
name,destination_url,description,qr_color,bg_color,dot_style,corner_style,folder
```

### Files

**`src/components/qr/bulk-upload.tsx`**

Client component with:
- File upload input (accepts `.csv` only)
- CSV parsing via `papaparse`
- Preview table (first 10 rows + "...and X more")
- Validation (skip rows without name or URL)
- Create button with loading state
- Success/error/warning toasts

**`src/app/(app)/create/page.tsx`**

Updated to use tabs:
- **Single** tab → `<QRForm />`
- **Bulk (CSV)** tab → `<BulkUpload />`

## REST API

### Endpoint

```
POST /api/qr/generate
```

### Authentication

Requires a valid Supabase session (cookie-based). The API reads the user from the session cookies.

### Single creation

**Request:**
```json
{
  "name": "My QR Code",
  "destination_url": "https://example.com",
  "description": "Optional description",
  "qr_color": "#000000",
  "bg_color": "#FFFFFF",
  "dot_style": "rounded",
  "corner_style": "dot",
  "is_dynamic": true,
  "folder": "Marketing"
}
```

**Response (201):**
```json
{
  "id": "uuid-here",
  "slug": "abc12XYz",
  "name": "My QR Code",
  "destination_url": "https://example.com",
  "qr_url": "/qr/abc12XYz",
  ...
}
```

### Bulk creation

**Request:** Send an array of objects:
```json
[
  { "name": "QR 1", "destination_url": "https://example.com" },
  { "name": "QR 2", "destination_url": "https://other.com" }
]
```

**Response (201):** Array of results (each either a QR code object or an error):
```json
[
  { "id": "...", "slug": "abc123", "qr_url": "/qr/abc123", ... },
  { "id": "...", "slug": "def456", "qr_url": "/qr/def456", ... }
]
```

### Error handling

| Status | Meaning |
|--------|---------|
| 201 | Created successfully |
| 400 | Missing required fields |
| 401 | Not authenticated |
| 500 | Server error |

For bulk requests, partial failures are possible — check each item in the response array for an `error` field.

### Files

**`src/app/api/qr/generate/route.ts`**

- Validates authentication
- Accepts single object or array
- Generates a unique slug for each
- Inserts into database
- Returns created records with `qr_url`

## Verify

### Bulk upload
1. Create a CSV file:
   ```csv
   name,destination_url
   Google,https://google.com
   GitHub,https://github.com
   Twitter,https://twitter.com
   ```
2. Go to /create → click "Bulk (CSV)" tab
3. Upload the CSV
4. Preview table should show 3 rows
5. Click "Create 3 QR Codes"
6. Dashboard should show 3 new QR codes

### API
1. Open browser dev tools → Console
2. Run:
   ```javascript
   fetch("/api/qr/generate", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ name: "API Test", destination_url: "https://example.com" })
   }).then(r => r.json()).then(console.log)
   ```
3. Check the response has an `id` and `slug`
4. Visit `/qr/{slug}` — should redirect to example.com

## Next Step

→ [Step 10: UI Polish & Dark Mode](./10-ui-polish.md)
