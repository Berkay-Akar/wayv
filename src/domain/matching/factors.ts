import type { Campaign, Creator } from "@/domain/schemas";

const MAX_ENGAGEMENT_RATE = 0.15;
const MIN_ENGAGEMENT_RATE = 0.02;

const MAX_WATCH_TIME = 15;
const MIN_WATCH_TIME = 3;

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function scoreNicheMatch(campaign: Campaign, creator: Creator): number {
  if (campaign.niches.length === 0) return 0;
  const overlap = campaign.niches.filter((n) => creator.niches.includes(n)).length;
  return overlap / campaign.niches.length;
}

export function scoreAudienceCountryMatch(campaign: Campaign, creator: Creator): number {
  const target = campaign.targetCountry;
  if (!target) return 0;

  const topCountries = creator.audience.topCountries;
  if (topCountries.length === 0) return 0;

  if (topCountries[0] === target) return 1;
  if (topCountries.includes(target)) return 0.6;
  return 0;
}

export function scoreEngagement(creator: Creator): number {
  const rate = clamp(creator.engagementRate, MIN_ENGAGEMENT_RATE, MAX_ENGAGEMENT_RATE);
  return (rate - MIN_ENGAGEMENT_RATE) / (MAX_ENGAGEMENT_RATE - MIN_ENGAGEMENT_RATE);
}

export function scoreWatchTime(campaign: Campaign, creator: Creator): number {
  const target = clamp(campaign.minAvgWatchTime, MIN_WATCH_TIME, MAX_WATCH_TIME);
  const watch = clamp(creator.avgWatchTime, MIN_WATCH_TIME, MAX_WATCH_TIME);

  if (watch >= target) {
    const over = clamp(watch - target, 0, 5);
    return 0.6 + (over / 5) * 0.4;
  }

  const under = clamp(target - watch, 0, 5);
  return 0.6 - (under / 5) * 0.6;
}

export function scoreFollowerFit(campaign: Campaign, creator: Creator): number {
  const min = campaign.budgetRange.minFollowers;
  const max = campaign.budgetRange.maxFollowers;
  const followers = creator.followers;

  if (min >= max || followers <= 0) return 0;

  if (followers >= min && followers <= max) return 1;

  if (followers < min) {
    const distance = min - followers;
    const tolerance = min * 0.5;
    const ratio = clamp(1 - distance / tolerance, 0, 1);
    return ratio * 0.7;
  }

  const distance = followers - max;
  const tolerance = max * 0.5;
  const ratio = clamp(1 - distance / tolerance, 0, 1);
  return ratio * 0.7;
}

export function scoreHookMatch(campaign: Campaign, creator: Creator): number {
  if (campaign.preferredHookTypes.length === 0) return 0;
  if (campaign.preferredHookTypes.includes(creator.primaryHookType)) return 1;
  return 0;
}

export function scoreBrandSafety(campaign: Campaign, creator: Creator): number {
  let penalty = 0;

  if (creator.brandSafetyFlags.length > 0) {
    penalty -= 0.4;
  }

  if (campaign.doNotUseWords.length > 0 && creator.lastPosts.length > 0) {
    const blocked = new Set(
      campaign.doNotUseWords.map((w) => w.toLowerCase().trim()).filter((w) => w.length > 0),
    );

    const text = creator.lastPosts
      .map((p) => p.caption.toLowerCase())
      .join(" ");

    for (const term of blocked) {
      if (text.includes(term)) {
        penalty -= 0.3;
        break;
      }
    }
  }

  return clamp(penalty, -1, 0);
}

