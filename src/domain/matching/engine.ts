import type { Campaign, Creator } from "@/domain/schemas";
import { MATCHING_WEIGHTS, MATCHING_WEIGHT_TOTAL } from "./config";
import {
  scoreAudienceCountryMatch,
  scoreBrandSafety,
  scoreEngagement,
  scoreFollowerFit,
  scoreHookMatch,
  scoreNicheMatch,
  scoreWatchTime,
} from "./factors";
import type { RankedCreatorScore, ScoreBreakdown } from "./types";

function clampScore(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function toContribution(unitScore: number, weight: number): number {
  return unitScore * weight;
}

export function computeScoreBreakdown(campaign: Campaign, creator: Creator): ScoreBreakdown {
  const niche = scoreNicheMatch(campaign, creator);
  const audience = scoreAudienceCountryMatch(campaign, creator);
  const engagement = scoreEngagement(creator);
  const watchTime = scoreWatchTime(campaign, creator);
  const followerFit = scoreFollowerFit(campaign, creator);
  const hook = scoreHookMatch(campaign, creator);
  const brandPenalty = scoreBrandSafety(campaign, creator);

  const breakdown: ScoreBreakdown = {
    nicheMatch: toContribution(niche, MATCHING_WEIGHTS.nicheMatch),
    audienceCountryMatch: toContribution(audience, MATCHING_WEIGHTS.audienceCountryMatch),
    engagementScore: toContribution(engagement, MATCHING_WEIGHTS.engagementScore),
    watchTimeScore: toContribution(watchTime, MATCHING_WEIGHTS.watchTimeScore),
    followerFitScore: toContribution(followerFit, MATCHING_WEIGHTS.followerFitScore),
    hookMatch: toContribution(hook, MATCHING_WEIGHTS.hookMatch),
    brandSafetyPenalty: toContribution(brandPenalty, MATCHING_WEIGHTS.brandSafetyPenalty),
  };

  return breakdown;
}

export function computeCreatorScore(campaign: Campaign, creator: Creator): RankedCreatorScore {
  const breakdown = computeScoreBreakdown(campaign, creator);

  const rawTotal =
    breakdown.nicheMatch +
    breakdown.audienceCountryMatch +
    breakdown.engagementScore +
    breakdown.watchTimeScore +
    breakdown.followerFitScore +
    breakdown.hookMatch +
    breakdown.brandSafetyPenalty;

  const normalized = clampScore((rawTotal / MATCHING_WEIGHT_TOTAL) * 100);

  return {
    creatorId: creator.id,
    creator,
    totalScore: normalized,
    scoreBreakdown: breakdown,
  };
}

export function rankCreatorsForCampaign(
  campaign: Campaign,
  creators: Creator[],
  limit = 20,
): RankedCreatorScore[] {
  const scored = creators.map((creator) => computeCreatorScore(campaign, creator));

  scored.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    if (b.scoreBreakdown.engagementScore !== a.scoreBreakdown.engagementScore) {
      return b.scoreBreakdown.engagementScore - a.scoreBreakdown.engagementScore;
    }

    if (b.scoreBreakdown.watchTimeScore !== a.scoreBreakdown.watchTimeScore) {
      return b.scoreBreakdown.watchTimeScore - a.scoreBreakdown.watchTimeScore;
    }

    if (a.creatorId < b.creatorId) return -1;
    if (a.creatorId > b.creatorId) return 1;
    return 0;
  });

  return scored.slice(0, limit);
}

