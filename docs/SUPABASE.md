# Connect AEO Platform to Supabase Postgres

This app uses **Prisma** with a normal Postgres URL. Supabase is Postgres with a connection pooler—use **two** URLs so migrations and runtime both work.

## 1. Create the project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. **New project** → pick org, name, database password (save it), region.
3. Wait until the project is **healthy**.

## 2. Get connection strings

1. Open your project → **Project Settings** (gear) → **Database**.
2. Under **Connection string**:
   - **URI** (direct) — host like `db.<project-ref>.supabase.co`, port **5432**.  
     This is your **`DIRECT_URL`** (used by `prisma migrate`).
   - **Connection pooling** → mode **Transaction** — port **6543**, often includes `?pgbouncer=true`.  
     This is your **`DATABASE_URL`** for the Next.js app (fewer connection issues on serverless).

Example shapes (replace placeholders):

```env
# Pooled (app runtime) — from "Transaction pooler" in dashboard
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<YOUR_PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Direct (migrations) — "Direct connection" / URI on port 5432
DIRECT_URL="postgresql://postgres:<YOUR_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"
```

If the dashboard shows a single **URI** only, use port **5432** for both `DATABASE_URL` and `DIRECT_URL` while developing; add the pooler URL for production `DATABASE_URL` when you deploy.

**IPv4:** If `prisma migrate` fails with network errors from your network, enable **IPv4 add-on** or use Supabase’s pooler (often helps).

## 3. Configure your app

1. Copy `.env.example` to `.env` (if you have not already).
2. Set `DATABASE_URL` and `DIRECT_URL` as above.
3. Set `AUTH_SECRET` and any other vars from `.env.example`.

## 4. Apply the schema

From the **project root** (where `package.json` lives):

```bash
npx prisma migrate deploy
```

For a new empty database, that applies everything under `prisma/migrations/`.

Local development against a fresh DB:

```bash
npx prisma migrate dev
```

## 5. Supabase Auth vs this app’s auth

This repo uses **NextAuth + Prisma** (`User`, `Session`, etc.) in the **public** schema. It does **not** use Supabase Auth by default.

- **Recommended:** Keep using NextAuth; only use Supabase as **Postgres hosting**.
- If you later use **Supabase Auth** and expose tables to the Data API, enable **RLS** on every table and write policies—Supabase’s PostgREST bypasses your Next.js server.

## 6. Optional: Supabase Studio

In the Supabase dashboard, **Table Editor** shows tables after migration (`User`, `Brand`, `Scan`, …). Use **SQL Editor** for ad-hoc queries.

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| `P1001` connection | Check password, `sslmode=require`, firewall; try pooler URL for `DATABASE_URL`. |
| Migrate errors with pooler | Ensure `DIRECT_URL` uses port **5432** (direct), not 6543. |
| “Too many connections” | Use pooled `DATABASE_URL` in production; lower Prisma pool if you customize it. |

Prisma docs: [Use Supabase with Prisma](https://www.prisma.io/docs/orm/overview/databases/supabase).
