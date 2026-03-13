# Step 1: Project Setup

## What we're doing

Setting up the Next.js project with all required dependencies and tooling.

## Prerequisites

- **Node.js 18+** installed ([download](https://nodejs.org))
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)
- A terminal

## Steps

### 1.1 Create the Next.js project

```bash
npx create-next-app@latest qr-code --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --turbopack
cd qr-code
```

This scaffolds a Next.js project with:
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- App Router (the modern Next.js routing system)
- `src/` directory for cleaner structure
- `@/*` import alias for absolute imports

### 1.2 Install core dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr qr-code-styling recharts date-fns lucide-react class-variance-authority clsx tailwind-merge nanoid papaparse ua-parser-js
```

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Supabase client SDK |
| `@supabase/ssr` | Server-side rendering support for Supabase auth |
| `qr-code-styling` | QR code generation with customization |
| `recharts` | Charts for analytics dashboard |
| `date-fns` | Date formatting and manipulation |
| `lucide-react` | Icon library |
| `class-variance-authority` | Component variant styling |
| `clsx` + `tailwind-merge` | Conditional CSS class merging |
| `nanoid` | Unique slug generation |
| `papaparse` | CSV parsing for bulk upload |
| `ua-parser-js` | User agent parsing for analytics |

### 1.3 Install dev dependencies

```bash
npm install -D @types/papaparse @types/ua-parser-js
```

### 1.4 Initialize shadcn/ui

```bash
npx shadcn@latest init -d --defaults
```

Then add the UI components we need:

```bash
npx shadcn@latest add card input label dialog dropdown-menu table tabs select slider switch separator avatar badge skeleton sheet popover command sonner textarea tooltip
```

### 1.5 Create the folder structure

```bash
mkdir -p src/lib/supabase
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/components/{qr,dashboard,analytics,auth,shared}
mkdir -p src/app/\(auth\)/{login,signup,callback}
mkdir -p src/app/\(app\)/{dashboard,create}
mkdir -p src/app/\(app\)/edit/\[id\]
mkdir -p src/app/\(app\)/analytics/\[id\]
mkdir -p src/app/qr/\[slug\]
mkdir -p src/app/embed/qr/\[slug\]
mkdir -p src/app/share/\[slug\]
mkdir -p src/app/api/qr/{scan,generate}
```

### 1.6 Create environment file

```bash
cp .env.local.example .env.local
```

Edit `.env.local` — leave values as placeholders for now. We'll fill them in Step 2 after creating the Supabase project.

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Verify

Run the dev server to make sure the scaffolding works:

```bash
npm run dev
```

Open http://localhost:3000 — you should see the default Next.js page.

## Next Step

→ [Step 2: Supabase Setup](./02-supabase-setup.md)
