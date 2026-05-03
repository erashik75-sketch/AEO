# AEO Platform (MVP)

Answer Engine Optimization diagnostics: multi-model probes (Claude by default; ChatGPT, Perplexity, Gemini on Pro/Agency), five signal scores, 30-point checklist, 30/60/90 plan generation, fix agents, and suggestion cards for Phase 2+ agents.

## Stack

Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma (PostgreSQL), NextAuth.js v5, Anthropic / OpenAI / Perplexity / Gemini for probes and analysis, Stripe and Resend stubs, Inngest endpoint stub.

## Setup

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env`.

2. Copy environment variables (see `.env.example`) including:

   - `DATABASE_URL`
   - `AUTH_SECRET` (e.g. `openssl rand -base64 32`)
   - `ANTHROPIC_API_KEY` (required for scans and most AI features)
   - Optional: `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `GEMINI_API_KEY` for full multi-model on paid tiers
   - Optional: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` for Google sign-in
   - Optional: SMTP / Resend for magic link email provider

3. Apply the schema:

```bash
npx prisma migrate dev --name init
```

4. **Development sign-in:** With `NODE_ENV=development`, the login page includes a **Dev email** provider that upserts a user by email (no password). Use `npm run dev` and sign in with any valid email.

5. Run the app:

```bash
npm run dev
```

## Deploy (Vercel)

Set the same env vars in the Vercel project. Run migrations against your production database (`prisma migrate deploy`). Configure Stripe price IDs for subscription checkout when enabling billing.
