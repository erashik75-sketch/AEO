# Deploy on Vercel

## Prerequisites

- GitHub repo connected to Vercel with production branch **`main`**.
- Environment variables set under **Project → Settings → Environment Variables** (Production minimum).

## Fixes applied for `npm install` / Prisma

1. **`prisma.config.ts` removed** — Prisma uses only `prisma/schema.prisma`. Client generation does not require a live DB connection string format beyond schema parsing.

2. **`postinstall` removed** — `prisma generate` runs only during **`npm run build`** (`prisma generate && next build`), when Vercel injects env vars. That avoids `npm install` failing during `postinstall`.

You still need **`DATABASE_URL`** and **`DIRECT_URL`** for:

- **`prisma generate`** during build (schema references these env vars).
- **Runtime** Prisma queries.

## Minimum env vars

See `.env.example`. For production:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled Supabase URL (or direct) — app + build |
| `DIRECT_URL` | Direct Postgres (port 5432) — migrations from your machine |
| `AUTH_SECRET` | NextAuth |
| `AUTH_URL` | `https://your-project.vercel.app` (or custom domain) |
| AI / OAuth | As needed |

## After first deploy

Run once from your machine (same `DATABASE_URL` / `DIRECT_URL` as production):

```bash
npx prisma migrate deploy
```

## Redeploy checklist

If builds use an old commit, confirm **Deployments** shows latest **`main`** SHA. Use **Redeploy** without stale branch pinning.
