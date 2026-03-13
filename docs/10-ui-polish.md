# Step 10: UI Polish & Dark Mode

## What we're doing

Adding the finishing touches — dark mode, toast notifications, loading skeletons, responsive design, and layout wrappers.

## Dark mode

### How it works

```
App loads → check localStorage for saved theme
        ↓
If no saved theme → check system preference (prefers-color-scheme)
        ↓
Apply "dark" class to <html> element
        ↓
Tailwind's dark: variants activate
        ↓
User toggles → save to localStorage, update class
```

### Files

**`src/components/shared/theme-provider.tsx`**

- React context providing `{ theme, setTheme }`
- Reads from `localStorage` on mount
- Falls back to system preference (`prefers-color-scheme: dark`)
- Toggles `dark` class on `<html>` element
- Persists choice to `localStorage`

**Toggle button** in the navbar switches between Sun and Moon icons.

### Important

The root `<html>` tag needs `suppressHydrationWarning` since the theme is set client-side:
```tsx
<html lang="en" suppressHydrationWarning>
```

## Toast notifications

Using `sonner` (via shadcn/ui's `<Toaster />`):

```tsx
// In root layout
<Toaster richColors position="top-right" />

// Usage anywhere
import { toast } from "sonner";
toast.success("QR code created!");
toast.error("Something went wrong");
toast.warning("3 QR codes created, 1 failed");
```

Toasts are used for:
- Login/signup success/error
- QR code save/update/delete
- Link/embed code copied
- Bulk upload results
- Password verification

## Loading skeletons

The QR table shows skeleton rows while data is loading:

```tsx
{loading ? (
  Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
      ...
    </TableRow>
  ))
) : ( /* actual data */ )}
```

## Responsive design

The app is fully responsive:

| Breakpoint | Layout |
|-----------|--------|
| Mobile (<640px) | Single column, hidden table columns, stacked forms |
| Tablet (640-1024px) | Two-column stats, visible dates |
| Desktop (>1024px) | Full table, side-by-side form + preview |

Key responsive patterns:
- QR form: `grid lg:grid-cols-[1fr_380px]` (stacks on mobile)
- Stats cards: `grid sm:grid-cols-2 lg:grid-cols-4`
- Table columns: `hidden md:table-cell` for less important data
- Feature grid: `grid sm:grid-cols-2 lg:grid-cols-4`

## Root layout

**`src/app/layout.tsx`**

Wraps the entire app with:
1. `<ThemeProvider>` — dark mode context
2. `<TooltipProvider>` — required by shadcn tooltips
3. `<Toaster />` — toast notification container
4. Geist font (loaded via `next/font`)

## Route groups

| Group | Layout | Purpose |
|-------|--------|---------|
| `(auth)` | None (minimal) | Login, signup, callback — no navbar |
| `(app)` | `<Navbar />` + container | Dashboard, create, edit, analytics |
| Root | None | Landing page, share page, QR redirect, embed |

Route groups with `()` don't affect the URL — `/dashboard` not `/(app)/dashboard`.

## Verify

1. Toggle dark mode — all pages should look good in both modes
2. Resize browser to mobile width — layout should stack properly
3. Create/delete a QR code — toast should appear
4. Visit dashboard while loading — skeletons should show briefly
5. Check all pages work on mobile-sized viewport

## Next Step

→ [Step 11: Deployment](./11-deployment.md)
