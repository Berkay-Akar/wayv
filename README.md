# wayv-agency

Campaign–creator matching and AI brief generation for influencer campaigns. Pick a campaign, see the top 20 ranked creators, and generate outreach briefs per creator.

**Live:** [https://wayv-agencyy.vercel.app/](https://wayv-agencyy.vercel.app/)

## Run locally

- Node 20.x
- Clone, then:

```bash
npm install
```

Copy `.env.example` to `.env.local` and set:

- `SUPABASE_URL` – Supabase project URL  
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key  
- `GROQ_API_KEY` – Groq API key (used for brief generation)

Then:

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` – dev server  
- `npm run build` – production build  
- `npm run start` – run production build  
- `npm run lint` – ESLint  
- `npm run test` – run tests (watch)  
- `npm run test:run` – run tests once  

## Tests

Tests live under `src/domain/` next to the code they cover:

- `src/domain/briefs/__tests__/parse.test.ts` – brief JSON parsing  
- `src/domain/matching/__tests__/factors.test.ts` – scoring factors  
- `src/domain/matching/__tests__/engine.test.ts` – matching engine  

Stack: Vitest. Run with `npm run test` or `npm run test:run`.

## Tech

- Next.js 16 (App Router), React 19  
- tRPC, TanStack Query, Supabase (Postgres)  
- Tailwind CSS  
- Brief generation via Groq (LLM); responses cached per campaign+creator in Supabase  
