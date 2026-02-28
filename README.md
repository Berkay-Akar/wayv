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

- `src/domain/briefs/__tests__/parse.test.ts` – brief JSON parsing, markdown strip, and repair (trailing commas, BOM)  
- `src/domain/matching/__tests__/factors.test.ts` – scoring factors  
- `src/domain/matching/__tests__/engine.test.ts` – matching engine  

Stack: Vitest. Run with `npm run test` or `npm run test:run`.

## Scoring

Creators are ranked by a weighted score (0–100). Seven factors, each normalized to a 0–1 unit score, are weighted and summed; the total is then scaled to 0–100. Weights are in `src/domain/matching/config.ts` (total weight 100):

- **Niche match** – overlap between campaign niches and creator niches  
- **Audience country** – whether the campaign’s target country is in the creator’s top audience countries  
- **Engagement** – engagement rate (clamped and normalized)  
- **Watch time** – creator’s avg watch time vs campaign minimum  
- **Follower fit** – whether followers fall in the campaign’s budget range  
- **Hook match** – campaign’s preferred hook types vs creator’s primary hook type  
- **Brand safety penalty** – penalty for brand-safety flags or use of campaign’s blocked words in recent posts  

Sort order: by total score descending; ties broken by engagement score, then watch time score, then creator id.

## Tech

- Next.js 16 (App Router), React 19  
- tRPC, TanStack Query, Supabase (Postgres)  
- Tailwind CSS  
- Brief generation via Groq (LLM); responses cached per campaign+creator in Supabase  

## Trade-offs & notes

- **LLM:** Groq is used for cost and latency; the provider is behind an interface so it can be swapped (e.g. OpenAI, Anthropic) without changing callers.  
- **Cache:** Briefs are cached in Supabase per (campaign_id, creator_id). Same pair never triggers a second LLM call.  
- **JSON from LLM:** We ask for strict JSON and validate with Zod. We strip markdown wrappers, then apply a repair step (trailing commas, BOM) if parse fails; the service retries up to 2 times. Deeper repair (e.g. single-quoted keys) could be added if needed.  
- **Matching:** All creators are loaded and scored in memory; top 20 are returned. For very large creator sets, batching or DB-side filtering would be the next step.  
