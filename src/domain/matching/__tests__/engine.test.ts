import { describe, it, expect } from "vitest";
import { computeCreatorScore, computeScoreBreakdown, rankCreatorsForCampaign } from "../engine";
import type { Campaign, Creator } from "@/domain/schemas";

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "c1",
    brand: "X",
    objective: "Awareness",
    targetCountry: "NL",
    targetGender: "all",
    targetAgeRange: "18-24",
    niches: ["fitness"],
    preferredHookTypes: ["POV"],
    minAvgWatchTime: 7,
    budgetRange: { minFollowers: 50_000, maxFollowers: 250_000 },
    tone: "energetic",
    doNotUseWords: [],
    ...overrides,
  };
}

function creator(id: string, overrides: Partial<Creator> = {}): Creator {
  return {
    id,
    username: `u${id}`,
    country: "NL",
    niches: ["fitness"],
    followers: 100_000,
    engagementRate: 0.08,
    avgWatchTime: 8,
    contentStyle: "pov",
    primaryHookType: "POV",
    brandSafetyFlags: [],
    audience: { topCountries: ["NL"], genderSplit: { female: 0.7, male: 0.3 }, topAgeRange: "18-24" },
    lastPosts: [],
    ...overrides,
  };
}

describe("computeScoreBreakdown", () => {
  it("returns all factor keys with numeric values", () => {
    const c = campaign();
    const cr = creator("cr_1");
    const b = computeScoreBreakdown(c, cr);
    expect(b).toHaveProperty("nicheMatch");
    expect(b).toHaveProperty("audienceCountryMatch");
    expect(b).toHaveProperty("engagementScore");
    expect(b).toHaveProperty("watchTimeScore");
    expect(b).toHaveProperty("followerFitScore");
    expect(b).toHaveProperty("hookMatch");
    expect(b).toHaveProperty("brandSafetyPenalty");
    expect(typeof b.nicheMatch).toBe("number");
    expect(typeof b.brandSafetyPenalty).toBe("number");
  });
});

describe("computeCreatorScore", () => {
  it("returns creatorId, creator, totalScore, scoreBreakdown", () => {
    const c = campaign();
    const cr = creator("cr_1");
    const result = computeCreatorScore(c, cr);
    expect(result.creatorId).toBe("cr_1");
    expect(result.creator).toBe(cr);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.scoreBreakdown).toEqual(computeScoreBreakdown(c, cr));
  });

  it("normalizes totalScore to 0-100", () => {
    const c = campaign();
    const cr = creator("cr_1", { niches: [], brandSafetyFlags: ["x"], audience: { topCountries: [], genderSplit: { female: 0, male: 0 }, topAgeRange: "18-24" } });
    const result = computeCreatorScore(c, cr);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});

describe("rankCreatorsForCampaign", () => {
  it("returns at most limit creators", () => {
    const c = campaign();
    const creators = [creator("a"), creator("b"), creator("c")];
    expect(rankCreatorsForCampaign(c, creators, 2)).toHaveLength(2);
    expect(rankCreatorsForCampaign(c, creators, 10)).toHaveLength(3);
  });

  it("sorts by totalScore descending", () => {
    const c = campaign();
    const low = creator("low", { engagementRate: 0.02, avgWatchTime: 3 });
    const high = creator("high", { engagementRate: 0.12, avgWatchTime: 12 });
    const ranked = rankCreatorsForCampaign(c, [low, high], 10);
    expect(ranked[0].creatorId).toBe("high");
    expect(ranked[1].creatorId).toBe("low");
  });

  it("tie-breaks by engagementScore then watchTimeScore then creatorId", () => {
    const c = campaign();
    const sameScore = [
      creator("cr_b", { engagementRate: 0.05, avgWatchTime: 7 }),
      creator("cr_a", { engagementRate: 0.05, avgWatchTime: 7 }),
      creator("cr_c", { engagementRate: 0.05, avgWatchTime: 8 }),
    ];
    const ranked = rankCreatorsForCampaign(c, sameScore, 10);
    expect(ranked[0].creatorId).toBe("cr_c");
    expect(ranked[1].creatorId).toBe("cr_a");
    expect(ranked[2].creatorId).toBe("cr_b");
  });

  it("is deterministic for same input", () => {
    const c = campaign();
    const creators = [creator("x"), creator("y"), creator("z")];
    const first = rankCreatorsForCampaign(c, creators, 20);
    const second = rankCreatorsForCampaign(c, creators, 20);
    expect(first.map((r) => r.creatorId)).toEqual(second.map((r) => r.creatorId));
  });
});
