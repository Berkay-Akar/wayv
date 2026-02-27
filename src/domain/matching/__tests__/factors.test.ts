import { describe, it, expect } from "vitest";
import {
  scoreNicheMatch,
  scoreAudienceCountryMatch,
  scoreEngagement,
  scoreWatchTime,
  scoreFollowerFit,
  scoreHookMatch,
  scoreBrandSafety,
} from "../factors";
import type { Campaign, Creator } from "@/domain/schemas";

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "c1",
    brand: "X",
    objective: "Awareness",
    targetCountry: "NL",
    targetGender: "all",
    targetAgeRange: "18-24",
    niches: ["fitness", "lifestyle"],
    preferredHookTypes: ["POV", "Relatable"],
    minAvgWatchTime: 7,
    budgetRange: { minFollowers: 50_000, maxFollowers: 250_000 },
    tone: "energetic",
    doNotUseWords: ["spam"],
    ...overrides,
  };
}

function creator(overrides: Partial<Creator> = {}): Creator {
  return {
    id: "cr_1",
    username: "u1",
    country: "NL",
    niches: ["fitness"],
    followers: 100_000,
    engagementRate: 0.08,
    avgWatchTime: 8,
    contentStyle: "pov",
    primaryHookType: "POV",
    brandSafetyFlags: [],
    audience: {
      topCountries: ["NL", "DE"],
      genderSplit: { female: 0.7, male: 0.3 },
      topAgeRange: "18-24",
    },
    lastPosts: [{ caption: "Hello world", views: 10_000, likes: 500 }],
    ...overrides,
  };
}

describe("scoreNicheMatch", () => {
  it("returns 1 when all campaign niches are covered", () => {
    expect(scoreNicheMatch(campaign({ niches: ["fitness"] }), creator({ niches: ["fitness", "lifestyle"] }))).toBe(1);
  });

  it("returns partial score for partial overlap", () => {
    expect(scoreNicheMatch(campaign({ niches: ["fitness", "lifestyle"] }), creator({ niches: ["fitness"] }))).toBe(0.5);
  });

  it("returns 0 when no overlap", () => {
    expect(scoreNicheMatch(campaign({ niches: ["comedy"] }), creator({ niches: ["fitness"] }))).toBe(0);
  });

  it("returns 0 when campaign has no niches", () => {
    expect(scoreNicheMatch(campaign({ niches: [] }), creator())).toBe(0);
  });
});

describe("scoreAudienceCountryMatch", () => {
  it("returns 1 when target is first in topCountries", () => {
    expect(scoreAudienceCountryMatch(campaign({ targetCountry: "NL" }), creator({ audience: { topCountries: ["NL", "DE"], genderSplit: { female: 0.5, male: 0.5 }, topAgeRange: "18-24" } }))).toBe(1);
  });

  it("returns 0.6 when target is in list but not first", () => {
    expect(scoreAudienceCountryMatch(campaign({ targetCountry: "DE" }), creator({ audience: { topCountries: ["NL", "DE"], genderSplit: { female: 0.5, male: 0.5 }, topAgeRange: "18-24" } }))).toBe(0.6);
  });

  it("returns 0 when target not in list", () => {
    expect(scoreAudienceCountryMatch(campaign({ targetCountry: "FR" }), creator())).toBe(0);
  });

  it("returns 0 when audience has no topCountries", () => {
    expect(scoreAudienceCountryMatch(campaign({ targetCountry: "NL" }), creator({ audience: { topCountries: [], genderSplit: { female: 0.5, male: 0.5 }, topAgeRange: "18-24" } }))).toBe(0);
  });
});

describe("scoreEngagement", () => {
  it("returns value in 0..1 for rate within range", () => {
    const c = creator({ engagementRate: 0.08 });
    expect(scoreEngagement(c)).toBeGreaterThan(0);
    expect(scoreEngagement(c)).toBeLessThanOrEqual(1);
  });

  it("clamps very high engagement to 1", () => {
    expect(scoreEngagement(creator({ engagementRate: 0.2 }))).toBe(1);
  });

  it("clamps very low engagement to 0", () => {
    expect(scoreEngagement(creator({ engagementRate: 0.01 }))).toBe(0);
  });
});

describe("scoreWatchTime", () => {
  it("returns high score when creator meets or exceeds campaign min", () => {
    expect(scoreWatchTime(campaign({ minAvgWatchTime: 7 }), creator({ avgWatchTime: 10 }))).toBeGreaterThan(0.6);
  });

  it("returns lower score when creator below min", () => {
    expect(scoreWatchTime(campaign({ minAvgWatchTime: 10 }), creator({ avgWatchTime: 5 }))).toBeLessThan(0.6);
  });
});

describe("scoreFollowerFit", () => {
  it("returns 1 when followers in range", () => {
    expect(scoreFollowerFit(campaign(), creator({ followers: 100_000 }))).toBe(1);
  });

  it("returns 0 when min >= max", () => {
    expect(scoreFollowerFit(campaign({ budgetRange: { minFollowers: 100, maxFollowers: 100 } }), creator({ followers: 100 }))).toBe(0);
  });

  it("returns partial score when below min", () => {
    const s = scoreFollowerFit(campaign({ budgetRange: { minFollowers: 100_000, maxFollowers: 200_000 } }), creator({ followers: 60_000 }));
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });

  it("returns partial score when above max", () => {
    const s = scoreFollowerFit(campaign({ budgetRange: { minFollowers: 100_000, maxFollowers: 200_000 } }), creator({ followers: 280_000 }));
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });
});

describe("scoreHookMatch", () => {
  it("returns 1 when primaryHookType in preferredHookTypes", () => {
    expect(scoreHookMatch(campaign({ preferredHookTypes: ["POV"] }), creator({ primaryHookType: "POV" }))).toBe(1);
  });

  it("returns 0 when no match", () => {
    expect(scoreHookMatch(campaign({ preferredHookTypes: ["POV"] }), creator({ primaryHookType: "Fact" }))).toBe(0);
  });

  it("returns 0 when campaign has no preferred types", () => {
    expect(scoreHookMatch(campaign({ preferredHookTypes: [] }), creator())).toBe(0);
  });
});

describe("scoreBrandSafety", () => {
  it("returns 0 when no flags and no blocked words in captions", () => {
    expect(scoreBrandSafety(campaign({ doNotUseWords: [] }), creator({ brandSafetyFlags: [], lastPosts: [] }))).toBe(0);
  });

  it("returns negative when creator has brandSafetyFlags", () => {
    expect(scoreBrandSafety(campaign(), creator({ brandSafetyFlags: ["supplement_claim"] }))).toBeLessThan(0);
  });

  it("returns more negative when caption contains doNotUseWords", () => {
    const c = creator({ brandSafetyFlags: [], lastPosts: [{ caption: "this is spam content", views: 1, likes: 0 }] });
    expect(scoreBrandSafety(campaign({ doNotUseWords: ["spam"] }), c)).toBeLessThan(0);
  });

  it("clamps to -1 at worst", () => {
    const c = creator({
      brandSafetyFlags: ["a", "b"],
      lastPosts: [{ caption: "spam spam", views: 1, likes: 0 }],
    });
    expect(scoreBrandSafety(campaign({ doNotUseWords: ["spam"] }), c)).toBeGreaterThanOrEqual(-1);
  });
});
