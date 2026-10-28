<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## About this project

QR Studio creates vCard, URL and map QR codes. Dynamic codes go through `/q/<code>`, so their target can change after printing. Every scan is logged.

See `README.md` for the full picture, roles, and setup steps.

## Where things live

| Path | What's there |
| --- | --- |
| `src/app/` | Pages and routes (Next.js App Router) |
| `src/app/actions/` | Server actions: admin, stores, codes, billing, auth |
| `src/app/q/[code]/` | The short link that redirects scans |
| `src/app/api/` | Auth.js and Razorpay webhook routes |
| `src/lib/auth/` | Role rules and permission checks |
| `src/lib/qr/` | Builds QR code content |
| `src/lib/billing/` | Credits, pricing, Razorpay |
| `src/database/` | Database schema and SQL guard rules |
| `scripts/` | Database migration and super admin seed scripts |
| `drizzle/` | Generated migration files. Do not hand-edit. |

## Rules for AI agents

1. Read the Next.js guide in `node_modules/next/dist/docs/` before writing code. This version has breaking changes.
2. Keep the auto-generated Next.js block above as it is. `next dev` rewrites it.
3. Never commit `.env.local` or real secrets. Use the dummy values in `.env.example`.
4. Never put the super admin's email in code, logs, docs, or client code. It lives only in `SUPER_ADMIN_EMAIL`.
5. Store users by keyed hash (`HASH_PEPPER`), not by raw email. Scan logs keep only a hashed IP.
6. Payments are Razorpay **test mode** only.
7. Before you say a task is done, run `npm test` and `npm run typecheck`.
8. Keep changes small and match the style of the code around them.
