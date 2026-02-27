-- Tables
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

-- Campaigns
insert into public.campaigns (id, brand, objective, target_country, target_gender, target_age_range, niches, preferred_hook_types, min_avg_watch_time, min_followers, max_followers, tone, do_not_use_words)
values
('cmp_001', 'EnergyBoost', 'Brand Awareness', 'NL', 'female', '18-24', '["fitness"]', '["POV","Transformation"]', 7, 50000, 250000, 'energetic, motivational', '["supplement","miracle","fat burner"]'),
('cmp_002', 'LaughLab', 'Engagement', 'NL', 'all', '18-24', '["comedy"]', '["Relatable"]', 8, 100000, 300000, 'light, relatable', '["dark","explicit"]'),
('cmp_003', 'UrbanBeats', 'Song Launch', 'NL', 'all', '18-24', '["music","lifestyle"]', '["Sound-driven"]', 5, 200000, 600000, 'trendy, energetic', '[]')
on conflict (id) do nothing;

-- Creators
insert into public.creators (id, username, country, niches, followers, engagement_rate, avg_watch_time, content_style, primary_hook_type, brand_safety_flags, audience, last_posts)
values
('cr_001', 'user1', 'DE', '["music","education"]', 382742, 0.113, 13.1, 'educational', 'Fact', '["supplement_claim"]', '{"topCountries":["BE","DE"],"genderSplit":{"female":0.86,"male":0.11},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 1 A","views":429794,"likes":8432},{"caption":"Sample caption 1 B","views":502518,"likes":71709}]'::jsonb),
('cr_002', 'user2', 'NL', '["fitness","lifestyle"]', 551304, 0.101, 7.1, 'storytelling', 'Relatable', '["explicit_language"]', '{"topCountries":["DE"],"genderSplit":{"female":0.86,"male":0.63},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 2 A","views":353046,"likes":26411},{"caption":"Sample caption 2 B","views":379173,"likes":11995}]'::jsonb),
('cr_003', 'user3', 'NL', '["education","lifestyle"]', 483429, 0.045, 12.6, 'pov', 'Relatable', '[]', '{"topCountries":["DE"],"genderSplit":{"female":0.81,"male":0.5},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 3 A","views":354466,"likes":16884},{"caption":"Sample caption 3 B","views":317062,"likes":29101}]'::jsonb),
('cr_004', 'user4', 'FR', '["music","education"]', 585246, 0.101, 7.9, 'pov', 'Transformation', '[]', '{"topCountries":["DE"],"genderSplit":{"female":0.87,"male":0.59},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 4 A","views":499297,"likes":49828},{"caption":"Sample caption 4 B","views":587160,"likes":78674}]'::jsonb),
('cr_005', 'user5', 'DE', '["comedy","lifestyle"]', 365937, 0.052, 5.7, 'text-heavy', 'Fact', '["supplement_claim"]', '{"topCountries":["DE","NL"],"genderSplit":{"female":0.69,"male":0.23},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 5 A","views":143836,"likes":32904},{"caption":"Sample caption 5 B","views":224148,"likes":5485}]'::jsonb),
('cr_006', 'user6', 'DE', '["lifestyle"]', 463474, 0.055, 3.4, 'pov', 'Sound-driven', '[]', '{"topCountries":["NL","FR"],"genderSplit":{"female":0.86,"male":0.23},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 6 A","views":567272,"likes":55047},{"caption":"Sample caption 6 B","views":581683,"likes":65250}]'::jsonb),
('cr_007', 'user7', 'FR', '["education"]', 492418, 0.101, 11.3, 'pov', 'Visual', '[]', '{"topCountries":["NL","BE"],"genderSplit":{"female":0.82,"male":0.41},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 7 A","views":181292,"likes":66366},{"caption":"Sample caption 7 B","views":148528,"likes":46710}]'::jsonb),
('cr_008', 'user8', 'NL', '["music","lifestyle"]', 225727, 0.099, 10.3, 'dark-humor', 'Shock', '[]', '{"topCountries":["FR"],"genderSplit":{"female":0.68,"male":0.19},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 8 A","views":318842,"likes":17591},{"caption":"Sample caption 8 B","views":407931,"likes":46336}]'::jsonb),
('cr_009', 'user9', 'NL', '["music","education"]', 47770, 0.137, 11.6, 'aesthetic', 'Fact', '[]', '{"topCountries":["DE"],"genderSplit":{"female":0.45,"male":0.42},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 9 A","views":550309,"likes":73026},{"caption":"Sample caption 9 B","views":59751,"likes":23506}]'::jsonb),
('cr_010', 'user10', 'BE', '["education"]', 155094, 0.031, 4, 'educational', 'Visual', '["explicit_language"]', '{"topCountries":["DE","BE"],"genderSplit":{"female":0.79,"male":0.42},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 10 A","views":153191,"likes":35253},{"caption":"Sample caption 10 B","views":431379,"likes":58177}]'::jsonb),
('cr_011', 'user11', 'NL', '["music","lifestyle"]', 418516, 0.147, 4.5, 'dark-humor', 'POV', '["supplement_claim"]', '{"topCountries":["NL"],"genderSplit":{"female":0.8,"male":0.59},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 11 A","views":259996,"likes":15139},{"caption":"Sample caption 11 B","views":571256,"likes":73341}]'::jsonb),
('cr_012', 'user12', 'FR', '["music","education"]', 123230, 0.089, 14.7, 'pov', 'POV', '[]', '{"topCountries":["NL","DE"],"genderSplit":{"female":0.39,"male":0.51},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 12 A","views":258198,"likes":63430},{"caption":"Sample caption 12 B","views":520180,"likes":69600}]'::jsonb),
('cr_013', 'user13', 'NL', '["comedy","education"]', 494960, 0.114, 8.6, 'trend-based', 'POV', '[]', '{"topCountries":["DE","BE"],"genderSplit":{"female":0.58,"male":0.58},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 13 A","views":183071,"likes":2746},{"caption":"Sample caption 13 B","views":570116,"likes":61567}]'::jsonb),
('cr_014', 'user14', 'NL', '["education","fitness"]', 564761, 0.076, 8, 'text-heavy', 'Sound-driven', '["supplement_claim"]', '{"topCountries":["DE","FR"],"genderSplit":{"female":0.65,"male":0.27},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 14 A","views":377122,"likes":27494},{"caption":"Sample caption 14 B","views":201766,"likes":62831}]'::jsonb),
('cr_015', 'user15', 'NL', '["lifestyle","fitness"]', 273975, 0.087, 3.1, 'trend-based', 'Sound-driven', '["supplement_claim"]', '{"topCountries":["BE"],"genderSplit":{"female":0.32,"male":0.59},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 15 A","views":594073,"likes":62023},{"caption":"Sample caption 15 B","views":31109,"likes":24863}]'::jsonb),
('cr_016', 'user16', 'FR', '["music"]', 107742, 0.034, 5.8, 'pov', 'Shock', '[]', '{"topCountries":["BE","DE"],"genderSplit":{"female":0.62,"male":0.34},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 16 A","views":359640,"likes":66638},{"caption":"Sample caption 16 B","views":267512,"likes":72595}]'::jsonb),
('cr_017', 'user17', 'FR', '["comedy","music"]', 289421, 0.067, 9.9, 'pov', 'Fact', '["supplement_claim"]', '{"topCountries":["FR","BE"],"genderSplit":{"female":0.37,"male":0.16},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 17 A","views":109142,"likes":79072},{"caption":"Sample caption 17 B","views":36786,"likes":20190}]'::jsonb),
('cr_018', 'user18', 'FR', '["comedy","lifestyle"]', 546850, 0.117, 14.8, 'educational', 'Relatable', '[]', '{"topCountries":["DE","BE"],"genderSplit":{"female":0.37,"male":0.32},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 18 A","views":534779,"likes":68558},{"caption":"Sample caption 18 B","views":500619,"likes":73548}]'::jsonb),
('cr_019', 'user19', 'DE', '["lifestyle"]', 56493, 0.033, 12, 'pov', 'Visual', '[]', '{"topCountries":["DE"],"genderSplit":{"female":0.62,"male":0.69},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 19 A","views":363341,"likes":9905},{"caption":"Sample caption 19 B","views":450153,"likes":48348}]'::jsonb),
('cr_020', 'user20', 'NL', '["comedy","education"]', 191697, 0.108, 3.7, 'text-heavy', 'Transformation', '["supplement_claim"]', '{"topCountries":["BE"],"genderSplit":{"female":0.33,"male":0.53},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 20 A","views":371122,"likes":14510},{"caption":"Sample caption 20 B","views":242165,"likes":53629}]'::jsonb),
('cr_021', 'user21', 'NL', '["music","lifestyle"]', 444594, 0.075, 11.5, 'educational', 'Sound-driven', '[]', '{"topCountries":["DE"],"genderSplit":{"female":0.65,"male":0.43},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 21 A","views":244412,"likes":31796},{"caption":"Sample caption 21 B","views":581500,"likes":29367}]'::jsonb),
('cr_022', 'user22', 'NL', '["music","education"]', 559017, 0.028, 9.3, 'text-heavy', 'Fact', '["explicit_language"]', '{"topCountries":["DE"],"genderSplit":{"female":0.88,"male":0.2},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 22 A","views":219929,"likes":60112},{"caption":"Sample caption 22 B","views":482660,"likes":22706}]'::jsonb),
('cr_023', 'user23', 'BE', '["comedy","lifestyle"]', 493004, 0.029, 12.8, 'pov', 'Fact', '[]', '{"topCountries":["BE","NL"],"genderSplit":{"female":0.75,"male":0.67},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 23 A","views":533832,"likes":65074},{"caption":"Sample caption 23 B","views":578537,"likes":40888}]'::jsonb),
('cr_024', 'user24', 'NL', '["comedy","education"]', 586613, 0.138, 10.8, 'pov', 'Fact', '[]', '{"topCountries":["BE"],"genderSplit":{"female":0.6,"male":0.31},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 24 A","views":46968,"likes":3578},{"caption":"Sample caption 24 B","views":56227,"likes":30811}]'::jsonb),
('cr_025', 'user25', 'BE', '["fitness","education"]', 524949, 0.031, 7.8, 'pov', 'Transformation', '["explicit_language"]', '{"topCountries":["DE","BE"],"genderSplit":{"female":0.65,"male":0.59},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 25 A","views":592742,"likes":42753},{"caption":"Sample caption 25 B","views":501551,"likes":44668}]'::jsonb),
('cr_026', 'user26', 'DE', '["music","fitness"]', 348717, 0.114, 10, 'aesthetic', 'Shock', '["supplement_claim"]', '{"topCountries":["DE","FR"],"genderSplit":{"female":0.5,"male":0.61},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 26 A","views":508420,"likes":31583},{"caption":"Sample caption 26 B","views":381995,"likes":66804}]'::jsonb),
('cr_027', 'user27', 'NL', '["fitness"]', 94885, 0.024, 7, 'text-heavy', 'Shock', '[]', '{"topCountries":["NL"],"genderSplit":{"female":0.51,"male":0.31},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 27 A","views":179262,"likes":70532},{"caption":"Sample caption 27 B","views":556636,"likes":64219}]'::jsonb),
('cr_028', 'user28', 'FR', '["music","lifestyle"]', 55982, 0.077, 5.2, 'aesthetic', 'Visual', '[]', '{"topCountries":["DE"],"genderSplit":{"female":0.66,"male":0.11},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 28 A","views":167912,"likes":69614},{"caption":"Sample caption 28 B","views":594270,"likes":10842}]'::jsonb),
('cr_029', 'user29', 'BE', '["comedy","lifestyle"]', 289293, 0.069, 9.4, 'storytelling', 'Fact', '[]', '{"topCountries":["DE","NL"],"genderSplit":{"female":0.84,"male":0.53},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 29 A","views":307795,"likes":66520},{"caption":"Sample caption 29 B","views":376316,"likes":52012}]'::jsonb),
('cr_030', 'user30', 'DE', '["comedy"]', 436024, 0.038, 4.8, 'aesthetic', 'Transformation', '[]', '{"topCountries":["FR","BE"],"genderSplit":{"female":0.76,"male":0.58},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 30 A","views":548459,"likes":32604},{"caption":"Sample caption 30 B","views":57552,"likes":15090}]'::jsonb),
('cr_031', 'user31', 'BE', '["fitness"]', 316032, 0.068, 11.5, 'pov', 'Visual', '[]', '{"topCountries":["FR","NL"],"genderSplit":{"female":0.4,"male":0.55},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 31 A","views":487166,"likes":16714},{"caption":"Sample caption 31 B","views":355871,"likes":78257}]'::jsonb),
('cr_032', 'user32', 'DE', '["comedy","fitness"]', 500321, 0.039, 11.7, 'dark-humor', 'Visual', '[]', '{"topCountries":["FR"],"genderSplit":{"female":0.47,"male":0.25},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 32 A","views":368161,"likes":62644},{"caption":"Sample caption 32 B","views":267739,"likes":57985}]'::jsonb),
('cr_033', 'user33', 'DE', '["fitness"]', 304681, 0.069, 8.9, 'dark-humor', 'Visual', '["supplement_claim"]', '{"topCountries":["DE","BE"],"genderSplit":{"female":0.53,"male":0.35},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 33 A","views":52362,"likes":7634},{"caption":"Sample caption 33 B","views":441587,"likes":18841}]'::jsonb),
('cr_034', 'user34', 'BE', '["fitness"]', 496547, 0.077, 4.6, 'pov', 'Sound-driven', '[]', '{"topCountries":["FR","BE"],"genderSplit":{"female":0.64,"male":0.64},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 34 A","views":252245,"likes":23311},{"caption":"Sample caption 34 B","views":397619,"likes":61344}]'::jsonb),
('cr_035', 'user35', 'NL', '["lifestyle"]', 230019, 0.062, 10.5, 'aesthetic', 'Shock', '["explicit_language"]', '{"topCountries":["BE"],"genderSplit":{"female":0.8,"male":0.24},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 35 A","views":90236,"likes":63787},{"caption":"Sample caption 35 B","views":496980,"likes":18432}]'::jsonb),
('cr_036', 'user36', 'FR', '["fitness","lifestyle"]', 589825, 0.082, 12, 'aesthetic', 'Sound-driven', '[]', '{"topCountries":["DE","FR"],"genderSplit":{"female":0.38,"male":0.55},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 36 A","views":542989,"likes":39580},{"caption":"Sample caption 36 B","views":167781,"likes":10465}]'::jsonb),
('cr_037', 'user37', 'DE', '["comedy","music"]', 357039, 0.028, 10.3, 'educational', 'Transformation', '[]', '{"topCountries":["FR","BE"],"genderSplit":{"female":0.57,"male":0.63},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 37 A","views":162881,"likes":5750},{"caption":"Sample caption 37 B","views":344311,"likes":38247}]'::jsonb),
('cr_038', 'user38', 'NL', '["fitness"]', 42708, 0.139, 10.9, 'educational', 'POV', '[]', '{"topCountries":["FR","DE"],"genderSplit":{"female":0.58,"male":0.23},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 38 A","views":553532,"likes":45969},{"caption":"Sample caption 38 B","views":424949,"likes":43852}]'::jsonb),
('cr_039', 'user39', 'FR', '["education","fitness"]', 54776, 0.116, 11, 'trend-based', 'Relatable', '["explicit_language"]', '{"topCountries":["FR","BE"],"genderSplit":{"female":0.89,"male":0.42},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 39 A","views":79346,"likes":41937},{"caption":"Sample caption 39 B","views":579806,"likes":57354}]'::jsonb),
('cr_040', 'user40', 'DE', '["comedy","lifestyle"]', 390202, 0.101, 8.7, 'text-heavy', 'Relatable', '["explicit_language"]', '{"topCountries":["BE","FR"],"genderSplit":{"female":0.38,"male":0.61},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 40 A","views":84153,"likes":51081},{"caption":"Sample caption 40 B","views":46895,"likes":41690}]'::jsonb),
('cr_041', 'user41', 'DE', '["fitness","education"]', 188401, 0.089, 13.3, 'aesthetic', 'Relatable', '[]', '{"topCountries":["FR"],"genderSplit":{"female":0.69,"male":0.46},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 41 A","views":203256,"likes":34480},{"caption":"Sample caption 41 B","views":519281,"likes":54147}]'::jsonb),
('cr_042', 'user42', 'NL', '["fitness","education"]', 136932, 0.023, 3.6, 'dark-humor', 'Relatable', '[]', '{"topCountries":["DE"],"genderSplit":{"female":0.56,"male":0.28},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 42 A","views":343619,"likes":48826},{"caption":"Sample caption 42 B","views":586985,"likes":15913}]'::jsonb),
('cr_043', 'user43', 'DE', '["education","lifestyle"]', 144218, 0.038, 7, 'trend-based', 'Transformation', '["explicit_language"]', '{"topCountries":["FR","NL"],"genderSplit":{"female":0.31,"male":0.14},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 43 A","views":529740,"likes":71226},{"caption":"Sample caption 43 B","views":22511,"likes":72519}]'::jsonb),
('cr_044', 'user44', 'BE', '["comedy"]', 393283, 0.117, 12.8, 'storytelling', 'Sound-driven', '[]', '{"topCountries":["FR","NL"],"genderSplit":{"female":0.88,"male":0.66},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 44 A","views":162896,"likes":72459},{"caption":"Sample caption 44 B","views":277848,"likes":18984}]'::jsonb),
('cr_045', 'user45', 'DE', '["comedy","lifestyle"]', 485162, 0.129, 4.8, 'storytelling', 'Transformation', '[]', '{"topCountries":["NL","DE"],"genderSplit":{"female":0.76,"male":0.33},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 45 A","views":596595,"likes":21650},{"caption":"Sample caption 45 B","views":78512,"likes":63658}]'::jsonb),
('cr_046', 'user46', 'NL', '["music","lifestyle"]', 233458, 0.039, 4.1, 'trend-based', 'POV', '[]', '{"topCountries":["DE","BE"],"genderSplit":{"female":0.56,"male":0.66},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 46 A","views":437602,"likes":12329},{"caption":"Sample caption 46 B","views":111333,"likes":38890}]'::jsonb),
('cr_047', 'user47', 'NL', '["education"]', 239279, 0.092, 11.8, 'trend-based', 'Sound-driven', '[]', '{"topCountries":["DE"],"genderSplit":{"female":0.35,"male":0.55},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 47 A","views":479083,"likes":74623},{"caption":"Sample caption 47 B","views":544855,"likes":15024}]'::jsonb),
('cr_048', 'user48', 'NL', '["education","fitness"]', 562875, 0.032, 10, 'dark-humor', 'Visual', '[]', '{"topCountries":["DE","BE"],"genderSplit":{"female":0.68,"male":0.56},"topAgeRange":"25-34"}'::jsonb, '[{"caption":"Sample caption 48 A","views":272045,"likes":73746},{"caption":"Sample caption 48 B","views":241493,"likes":47374}]'::jsonb),
('cr_049', 'user49', 'BE', '["comedy"]', 394414, 0.087, 7, 'dark-humor', 'Visual', '[]', '{"topCountries":["FR","BE"],"genderSplit":{"female":0.48,"male":0.29},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 49 A","views":494500,"likes":44632},{"caption":"Sample caption 49 B","views":74686,"likes":60666}]'::jsonb),
('cr_050', 'user50', 'NL', '["education"]', 177566, 0.126, 14.6, 'educational', 'Visual', '[]', '{"topCountries":["FR","NL"],"genderSplit":{"female":0.52,"male":0.64},"topAgeRange":"18-24"}'::jsonb, '[{"caption":"Sample caption 50 A","views":270704,"likes":31818},{"caption":"Sample caption 50 B","views":247154,"likes":63598}]'::jsonb)
on conflict (id) do nothing;
