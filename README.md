# AEO Platform (MVP)

Answer Engine Optimization diagnostics: multi-model probes (Claude by default; ChatGPT, Perplexity, Gemini on Pro/Agency), five signal scores, 30-point checklist, 30/60/90 plan generation, fix agents, and suggestion cards for Phase 2+ agents.

## LLM backends for agents and analysis

Configure **which API runs fix agents** and (optionally) **scan analysis** (scoring JSON, synthesis, plans, chat, deep dives):

| Provider | Environment | Notes |
|----------|-------------|--------|
| **Claude** (default) | `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL` | Anthropic Messages API |
| **DeepSeek** | `DEEPSEEK_API_KEY`, optional `DEEPSEEK_MODEL` | OpenAI-compatible at `https://api.deepseek.com` |
| **Kimi (Moonshot)** | `MOONSHOT_API_KEY`, optional `MOONSHOT_BASE_URL`, `MOONSHOT_MODEL` | Default base URL `https://api.moonshot.cn/v1` |

- **`AGENT_LLM_PROVIDER`**: `claude` \| `deepseek` \| `kimi` (alias `moonshot`). Chooses the backend for **MVP agents**.
- **`ANALYSIS_LLM_PROVIDER`**: same values; if set, **scan analysis / synthesis / plan regen / chat / deep dive** use this backend. If unset, analysis follows `AGENT_LLM_PROVIDER`, then defaults to **Claude**.

Probe calls to OpenAI, Perplexity, and Gemini are unchanged and still use `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, and `GEMINI_API_KEY` where enabled by plan.

## Stack

Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma (PostgreSQL), NextAuth.js v5, Anthropic / DeepSeek / Moonshot / OpenAI / Perplexity / Gemini, Stripe and Resend stubs, Inngest endpoint stub.

## Setup

1. Create a PostgreSQL database and set `DATABASE_URL` (and `DIRECT_URL`) in `.env`.  
   **Using Supabase?** Follow [docs/SUPABASE.md](./docs/SUPABASE.md) for pooled vs direct URLs and `prisma migrate deploy`.  
   **Deploying to Vercel?** See [docs/VERCEL.md](./docs/VERCEL.md) for env vars and Prisma install/build notes.

2. Copy environment variables from `.env.example`, including:

   - `DATABASE_URL`, `DIRECT_URL`
   - `AUTH_SECRET` and **`AUTH_URL`** (your site origin, e.g. `https://….vercel.app`) for magic links
   - **SMTP** for passwordless email: `EMAIL_SERVER_HOST`, `EMAIL_FROM`, and `EMAIL_SERVER_USER` / `EMAIL_SERVER_PASSWORD` if required by your provider
   - At least one LLM key path: e.g. **`ANTHROPIC_API_KEY`** for Claude-only, or **`DEEPSEEK_API_KEY`** / **`MOONSHOT_API_KEY`** with **`AGENT_LLM_PROVIDER`** set to `deepseek` or `kimi`
   - Optional: `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `GEMINI_API_KEY` for full multi-model probes on paid tiers

3. Apply the schema:

```bash
npx prisma migrate dev --name init
```

4. **Sign-in:** Passwordless **magic link** via email when SMTP env vars are set. In development only, you can use **Dev email** (instant sign-in) if SMTP is not configured.

5. Run the app:

```bash
npm run dev
```

## Deploy (Vercel)

Set the same env vars in the Vercel project. Run migrations against your production database (`prisma migrate deploy`). Configure Stripe price IDs for subscription checkout when enabling billing.
