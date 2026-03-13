# Step 4: QR Code Generator

## What we're doing

Building the core QR code generator with live preview, full customization options, and save-to-database functionality.

## How it works

```
User fills form (URL, name, styles)
        ↓
Live preview updates in real-time (qr-code-styling)
        ↓
User clicks "Save"
        ↓
Generate unique slug (nanoid)
Upload logo to Supabase Storage (if any)
Insert QR code record into database
        ↓
Redirect to dashboard
```

## Files to create

### 4.1 Types

**`src/types/index.ts`**

Defines TypeScript interfaces:
- `QRCode` — database row shape
- `QRScan` — scan record shape
- `QRCodeFormData` — form state shape
- `DotStyle` / `CornerStyle` — union types for styling options

### 4.2 QR generation library

**`src/lib/qr.ts`**

Wraps `qr-code-styling` with our options interface:

```typescript
import QRCodeStyling from "qr-code-styling";

export function createQRCode(options: QRGenerateOptions): QRCodeStyling {
  return new QRCodeStyling({
    width: options.width,
    height: options.height,
    data: options.data,
    dotsOptions: { color: options.qrColor, type: dotStyleMap[options.dotStyle] },
    backgroundOptions: { color: options.bgColor },
    cornersSquareOptions: { type: cornerStyleMap[options.cornerStyle] },
    imageOptions: { imageSize: options.logoSize },
    image: options.logoUrl,
    qrOptions: { errorCorrectionLevel: options.logoUrl ? "H" : "M" },
  });
}
```

> **Why "H" error correction for logos?** QR codes with center logos need higher error correction so the logo doesn't make the code unreadable. "H" can survive ~30% damage, "M" only ~15%.

### 4.3 Slug generator

**`src/lib/slug.ts`**

```typescript
import { nanoid } from "nanoid";
export function generateSlug(length = 8): string {
  return nanoid(length);
}
```

8-character nanoid gives 2.8 trillion possible slugs — collision-safe at scale.

### 4.4 QR Preview component

**`src/components/qr/qr-preview.tsx`**

- Takes `QRGenerateOptions` as props
- Creates a new `QRCodeStyling` instance on every options change
- Appends the generated canvas/SVG to a ref div
- Shows a placeholder when no URL is entered

### 4.5 Color Picker component

**`src/components/qr/color-picker.tsx`**

Combines a native `<input type="color">` with a text input showing the hex value.

### 4.6 Download Panel component

**`src/components/qr/download-panel.tsx`**

- Format selector: PNG, JPG, SVG
- Resolution selector: 512px, 1024px, 2048px
- Creates a fresh QR code at the selected size and triggers download

### 4.7 QR Form (main component)

**`src/components/qr/qr-form.tsx`**

This is the largest component. It includes:

| Section | Fields |
|---------|--------|
| **Basic Info** | Name, Destination URL, Description, Dynamic toggle |
| **Customization** | QR color, background color, dot style (6 options), corner style (3 options), logo upload, logo size slider |
| **Advanced** | Password protection, expiration date, folder |
| **Preview** (sidebar) | Live QR preview, download panel, save button |

**Layout**: Two columns on desktop — settings on the left, sticky preview on the right.

**Save flow**:
1. Validate required fields (name, URL)
2. Upload logo to Supabase Storage (if new file)
3. Insert/update record in `qr_codes` table
4. Redirect to dashboard

### 4.8 Create page

**`src/app/(app)/create/page.tsx`**

Renders the QR form with tabs:
- **Single** tab — the QR form
- **Bulk (CSV)** tab — CSV upload for bulk generation

### 4.9 Edit page

**`src/app/(app)/edit/[id]/page.tsx`**

Server Component that:
1. Fetches the QR code by ID from Supabase
2. Returns 404 if not found
3. Passes the data to `<QRForm existingQR={data} />`

## Customization options explained

### Dot styles
| Style | Look |
|-------|------|
| `square` | Standard square dots |
| `dots` | Circular dots |
| `rounded` | Rounded square dots |
| `extra-rounded` | Very rounded dots |
| `classy` | Diamond-like dots |
| `classy-rounded` | Rounded diamond dots |

### Corner styles
| Style | Look |
|-------|------|
| `square` | Standard square corners |
| `dot` | Circular corner markers |
| `extra-rounded` | Rounded corner markers |

## Verify

1. Navigate to http://localhost:3000/create
2. Enter a URL — the preview should update live
3. Change colors, dot style, corner style — preview updates
4. Upload a logo — it appears in the center of the QR code
5. Adjust the logo size slider
6. Click "Download" — file downloads in selected format/size
7. Click "Save QR Code" — redirects to dashboard with the new QR code listed

## Next Step

→ [Step 5: Dynamic QR Codes & Redirects](./05-dynamic-qr-redirects.md)
