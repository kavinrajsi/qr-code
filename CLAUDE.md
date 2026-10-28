# CLAUDE.md

Claude Code reads this file at the start of every session. The main project rules live in `AGENTS.md`, so they are shared with other AI tools:

@AGENTS.md

## Quick notes for Claude

- **What this is:** QR Studio, a web app for making QR codes that can be changed after printing.
- **Stack:** Next.js 16, Neon Postgres with Drizzle, Google sign-in via Auth.js, Razorpay test mode.
- **Common commands:** `npm run dev`, `npm test`, `npm run typecheck`, `npm run build`.
- **Don't touch:** the auto-generated `nextjs-agent-rules` block in `AGENTS.md`.
- **Secrets:** never read, print, or commit `.env.local`.
