# QR Code Generator — Step-by-Step Guide

A complete walkthrough for building and deploying this QR code generator application.

## Guides

| Step | Topic | What you'll do |
|------|-------|---------------|
| [01](./01-project-setup.md) | **Project Setup** | Scaffold Next.js, install dependencies, set up shadcn/ui, create folder structure |
| [02](./02-supabase-setup.md) | **Supabase Setup** | Create Supabase project, run database schema, configure storage & auth providers |
| [03](./03-authentication.md) | **Authentication** | Build login/signup pages, set up middleware, protect routes, handle OAuth callback |
| [04](./04-qr-generator.md) | **QR Code Generator** | Build the QR form with live preview, customization options, logo upload, and save logic |
| [05](./05-dynamic-qr-redirects.md) | **Dynamic QR & Redirects** | Implement slug-based redirects, scan logging, password protection, and expiration |
| [06](./06-analytics.md) | **Analytics Dashboard** | Build scan analytics with timeline charts, device/country breakdowns, and stat cards |
| [07](./07-dashboard.md) | **Dashboard** | Build the main dashboard with QR table, search, stats cards, and action menus |
| [08](./08-sharing.md) | **Sharing & Embedding** | Create public share pages, social buttons, embeddable iframe, and copy-to-clipboard |
| [09](./09-bulk-and-api.md) | **Bulk Generation & API** | Add CSV upload for bulk creation and a REST API for programmatic QR code generation |
| [10](./10-ui-polish.md) | **UI Polish & Dark Mode** | Add dark mode, toasts, loading skeletons, responsive design, and layout wrappers |
| [11](./11-deployment.md) | **Deployment** | Deploy to Vercel (or other platforms), configure production URLs, and verify everything |

## Quick start

If you just want to run the app (not build from scratch), see the [main README](../README.md).

## Architecture overview

```
Browser                          Server                         Database
───────                          ──────                         ────────
Landing Page          ──→  Static HTML
Login/Signup          ──→  Supabase Auth             ──→  auth.users
Dashboard (client)    ──→  Supabase JS (RLS)         ──→  qr_codes
Create/Edit (client)  ──→  Supabase JS + Storage     ──→  qr_codes + qr-logos bucket
QR Scan (/qr/:slug)   ──→  Route Handler             ──→  qr_codes (read) + qr_scans (write)
Analytics (server)    ──→  Server Component           ──→  qr_codes + qr_scans (read)
Share Page (server)   ──→  Server Component           ──→  qr_codes (read)
API (/api/qr/*)       ──→  Route Handlers             ──→  qr_codes (write) + qr_scans (write)
```
