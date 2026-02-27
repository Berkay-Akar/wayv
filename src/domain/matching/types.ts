import type { Campaign, Creator } from "@/domain/schemas";

export type MatchingFactorKey =
  | "nicheMatch"
  | "audienceCountryMatch"
  | "engagementScore"
  | "watchTimeScore"
  | "followerFitScore"
  | "hookMatch"
  | "brandSafetyPenalty";

export type ScoreBreakdown = Record<MatchingFactorKey, number>;

export interface RankedCreatorScore {
  creatorId: string;
  creator: Creator;
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface FactorInput {
  campaign: Campaign;
  creator: Creator;
}

