# Step 11: Deployment

## What we're doing

Deploying the app to production. This guide covers Vercel (recommended), but the app works on any platform that supports Next.js.

## Pre-deployment checklist

- [ ] Supabase project created and schema applied
- [ ] Google OAuth configured (if using)
- [ ] All features tested locally
- [ ] Environment variables ready

## Option A: Deploy to Vercel (recommended)

Vercel is the creators of Next.js — zero-config deployment.

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Deploy

```bash
vercel
```

Follow the prompts:
- Link to existing project or create new
- Choose your team/scope
- Confirm settings

### Step 3: Set environment variables

In the Vercel dashboard → your project → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

### Step 4: Redeploy

```bash
vercel --prod
```

### Step 5: Update Supabase redirect URLs

Go to Supabase Dashboard → Authentication → URL Configuration:

1. Set **Site URL** to your Vercel domain: `https://your-app.vercel.app`
2. Add to **Redirect URLs**:
   ```
   https://your-app.vercel.app/callback
   https://your-app.vercel.app/**
   ```

### Step 6: Update Google OAuth (if using)

In Google Cloud Console → Credentials → your OAuth Client:

Add authorized redirect URI:
```
https://your-project-ref.supabase.co/auth/v1/callback
```

(This should already be set from Step 2, but verify it's there.)

## Option B: Deploy to other platforms

### Build the app

```bash
npm run build
```

### Start the production server

```bash
npm start
```

The app runs on port 3000 by default. Set `PORT` environment variable to change it.

### Platforms that support Next.js

| Platform | Notes |
|----------|-------|
| **Vercel** | Zero config, best Next.js support |
| **Netlify** | Supports Next.js via adapter |
| **Railway** | Docker-based, set start command to `npm start` |
| **Fly.io** | Dockerfile needed |
| **AWS Amplify** | Built-in Next.js support |
| **Docker** | Use the official Next.js Dockerfile |

### Docker deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Add to `next.config.ts` for standalone output:
```typescript
const nextConfig = {
  output: "standalone",
};
```

## Post-deployment

### Custom domain

**Vercel**: Settings → Domains → Add your domain → Update DNS records.

**Supabase**: Update Site URL and redirect URLs to your custom domain.

### Analytics geo-data

Once deployed to Vercel, scan analytics will automatically capture:
- **Country** via `x-vercel-ip-country` header
- **City** via `x-vercel-ip-city` header

On Cloudflare: `cf-ipcountry` header is used instead.

### Monitor

- **Vercel**: Built-in analytics dashboard
- **Supabase**: Dashboard shows database usage, auth metrics, and storage usage

## Verify

1. Visit your deployed URL
2. Sign up / log in
3. Create a QR code
4. Scan it with your phone — should redirect correctly
5. Check analytics — device should show "mobile", country should be detected
6. Share the share link with someone — they should see the public page

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Login redirects to localhost | Update Supabase Site URL and redirect URLs |
| Google OAuth doesn't work | Verify redirect URI in Google Cloud Console |
| QR codes don't redirect | Check `qr_codes` table has data and `is_active = true` |
| Analytics show "Unknown" country | Only works when deployed behind a CDN (Vercel/Cloudflare) |
| Build fails with env error | Make sure env vars are set in deployment platform |
