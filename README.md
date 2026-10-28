# QR Studio

QR Studio makes QR codes for business cards, websites and map locations.

The big idea: a **dynamic QR code** goes through a short link first (`/q/<code>`). So you can print it once and change where it points later. Every scan is also recorded.

Built with Next.js, a Neon Postgres database, Google sign-in, and Razorpay (test mode) for payments.

## Who can do what

| Role | What they can do |
| --- | --- |
| **Super admin** | Adds or suspends platform admins. This account is protected and cannot be deleted, demoted, or suspended. |
| **Admin** | Creates stores. Has full control over the stores they own. |
| **Store manager** | Buys credits, views invoices, invites or removes team members, and edits codes. |
| **Store employee** | Creates and views codes for their store. |

## Getting it running

You need Node.js, a Neon database, and a Google sign-in app.

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run db:migrate           # set up the database tables
npm run db:seed-super-admin  # create the super admin from SUPER_ADMIN_EMAIL
npm run dev                  # start the app at http://localhost:3000
```

- Never commit `.env.local`. It holds secrets.
- Payments use Razorpay **test mode**. For local work, the dummy values in `.env.example` are fine.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the app for development |
| `npm run build` | Builds the app for production |
| `npm start` | Runs the production build |
| `npm test` | Runs the unit tests (QR content and role rules) |
| `npm run typecheck` | Checks the TypeScript types |
| `npm run lint` | Checks the code style |
| `npm run db:migrate` | Applies database changes |
| `npm run db:seed-super-admin` | Creates the protected super admin account |

## Privacy

- The super admin's email is kept only in the `SUPER_ADMIN_EMAIL` setting. It is never saved in plain text, written to logs, or sent to the browser.
- Users are saved as a scrambled code, not as their email address.
- Scan logs keep only a scrambled version of the visitor's IP address.
