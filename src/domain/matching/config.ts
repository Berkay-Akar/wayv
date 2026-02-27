import type { MatchingFactorKey } from "./types";

export const MATCHING_WEIGHT_TOTAL = 100;

export const MATCHING_WEIGHTS: Record<MatchingFactorKey, number> = {
  nicheMatch: 25,
  audienceCountryMatch: 20,
  engagementScore: 15,
  watchTimeScore: 15,
  followerFitScore: 15,
  hookMatch: 10,
  brandSafetyPenalty: 10,
};

