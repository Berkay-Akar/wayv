const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const campaignsPath = path.join(root, "data", "campaigns.json");
const creatorsPath = path.join(root, "data", "creators.json");
const outPath = path.join(root, "supabase", "seed.sql");

const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));
const creators = JSON.parse(fs.readFileSync(creatorsPath, "utf8"));

function esc(s) {
  if (s === null || s === undefined) return "NULL";
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function jsonEsc(obj) {
  return esc(JSON.stringify(obj));
}

const tableSql = `-- Tables
create table if not exists public.campaigns (
  id text primary key,
  brand text not null,
  objective text not null,
  target_country text not null,
  target_gender text not null,
  target_age_range text not null,
  niches jsonb not null default '[]'::jsonb,
  preferred_hook_types jsonb not null default '[]'::jsonb,
  min_avg_watch_time numeric not null,
  min_followers integer not null,
  max_followers integer not null,
  tone text not null,
  do_not_use_words jsonb not null default '[]'::jsonb
);
create index if not exists campaigns_target_country_idx on public.campaigns (target_country);

create table if not exists public.creators (
  id text primary key,
  username text not null,
  country text not null,
  niches jsonb not null default '[]'::jsonb,
  followers integer not null,
  engagement_rate numeric not null,
  avg_watch_time numeric not null,
  content_style text not null,
  primary_hook_type text not null,
  brand_safety_flags jsonb not null default '[]'::jsonb,
  audience jsonb not null,
  last_posts jsonb not null default '[]'::jsonb
);
create index if not exists creators_country_idx on public.creators (country);
create index if not exists creators_followers_idx on public.creators (followers);

create table if not exists public.ai_briefs (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null,
  creator_id text not null,
  response_json jsonb not null,
  created_at timestamptz not null default now(),
  constraint ai_briefs_campaign_creator_unique unique (campaign_id, creator_id)
);
create index if not exists ai_briefs_campaign_idx on public.ai_briefs (campaign_id);
create index if not exists ai_briefs_creator_idx on public.ai_briefs (creator_id);
`;

const campaignRows = campaigns.map(
  (c) =>
    `(${esc(c.id)}, ${esc(c.brand)}, ${esc(c.objective)}, ${esc(c.targetCountry)}, ${esc(c.targetGender)}, ${esc(c.targetAgeRange)}, ${jsonEsc(c.niches)}, ${jsonEsc(c.preferredHookTypes)}, ${c.minAvgWatchTime}, ${c.budgetRange.minFollowers}, ${c.budgetRange.maxFollowers}, ${esc(c.tone)}, ${jsonEsc(c.doNotUseWords || [])})`
);

const creatorRows = creators.map(
  (c) =>
    `(${esc(c.id)}, ${esc(c.username)}, ${esc(c.country)}, ${jsonEsc(c.niches)}, ${c.followers}, ${c.engagementRate}, ${c.avgWatchTime}, ${esc(c.contentStyle)}, ${esc(c.primaryHookType)}, ${jsonEsc(c.brandSafetyFlags || [])}, ${jsonEsc(c.audience)}::jsonb, ${jsonEsc(c.lastPosts || [])}::jsonb)`
);

const insertCampaigns = `\n-- Campaigns\ninsert into public.campaigns (id, brand, objective, target_country, target_gender, target_age_range, niches, preferred_hook_types, min_avg_watch_time, min_followers, max_followers, tone, do_not_use_words)\nvalues\n${campaignRows.join(",\n")}\non conflict (id) do nothing;\n`;

const insertCreators = `\n-- Creators\ninsert into public.creators (id, username, country, niches, followers, engagement_rate, avg_watch_time, content_style, primary_hook_type, brand_safety_flags, audience, last_posts)\nvalues\n${creatorRows.join(",\n")}\non conflict (id) do nothing;\n`;

const full = tableSql + insertCampaigns + insertCreators;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, full, "utf8");
console.log("Written", outPath, "-", campaigns.length, "campaigns,", creators.length, "creators");
