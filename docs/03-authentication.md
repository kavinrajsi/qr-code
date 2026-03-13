# Step 3: Authentication

## What we're doing

Setting up Supabase Auth with server/client helpers, middleware for route protection, login/signup pages, and OAuth callback handling.

## How it works

```
User visits /dashboard (protected)
        ↓
Middleware checks session via cookies
        ↓
No session? → Redirect to /login
Has session? → Allow access
        ↓
User logs in (email/password or Google)
        ↓
Supabase sets auth cookies
        ↓
Redirect to /dashboard
```

## Files to create

### 3.1 Supabase client helpers

We need **three** Supabase clients for different contexts:

**`src/lib/supabase/client.ts`** — Browser client (used in `"use client"` components)
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`src/lib/supabase/server.ts`** — Server client (used in Server Components and API routes)
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* called from Server Component — safe to ignore */ }
        },
      },
    }
  );
}
```

**`src/lib/supabase/middleware.ts`** — Middleware client (refreshes sessions + protects routes)

This file:
- Refreshes the auth session on every request
- Redirects unauthenticated users from `/dashboard`, `/create`, `/edit`, `/analytics` to `/login`
- Redirects authenticated users from `/login`, `/signup` to `/dashboard`

### 3.2 Middleware

**`src/middleware.ts`** — Runs on every request (except static files)

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 3.3 OAuth callback route

**`src/app/(auth)/callback/route.ts`**

When Google OAuth completes, Supabase redirects here with a `code` parameter. We exchange it for a session.

### 3.4 Login page

**`src/app/(auth)/login/page.tsx`** + **`src/components/auth/login-form.tsx`**

The login form handles:
- Email/password login via `supabase.auth.signInWithPassword()`
- Google OAuth via `supabase.auth.signInWithOAuth({ provider: "google" })`
- Redirect to the page the user originally tried to visit

### 3.5 Signup page

**`src/app/(auth)/signup/page.tsx`** + **`src/components/auth/signup-form.tsx`**

The signup form handles:
- Email/password registration via `supabase.auth.signUp()`
- Google OAuth (same as login — Supabase auto-creates the account)
- Email confirmation toast

### 3.6 useUser hook

**`src/hooks/use-user.ts`**

A client-side hook that:
- Fetches the current user on mount
- Subscribes to auth state changes (login/logout)
- Returns `{ user, loading }`

## Key concepts

| Concept | Explanation |
|---------|-------------|
| **Browser client** | Used in client components. Reads cookies from the browser automatically. |
| **Server client** | Used in Server Components and API routes. Reads cookies via `next/headers`. |
| **Middleware** | Runs before every page load. Refreshes expired tokens and enforces route protection. |
| **RLS** | Row Level Security in Supabase. Even if someone bypasses the frontend, the database enforces that users can only access their own data. |

## Verify

1. Run `npm run dev`
2. Visit http://localhost:3000/dashboard — you should be redirected to `/login`
3. Create an account on `/signup`
4. Log in on `/login` — you should be redirected to `/dashboard`
5. Check Supabase Dashboard → Authentication → Users — your new user should appear

## Next Step

→ [Step 4: QR Code Generator](./04-qr-generator.md)
