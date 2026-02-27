import { z } from "zod";

export const CampaignSchema = z.object({
  id: z.string(),
  brand: z.string(),
  objective: z.string(),
  targetCountry: z.string(),
  targetGender: z.string(),
  targetAgeRange: z.string(),
  niches: z.array(z.string()),
  preferredHookTypes: z.array(z.string()),
  minAvgWatchTime: z.number(),
  budgetRange: z.object({
    minFollowers: z.number(),
    maxFollowers: z.number(),
  }),
  tone: z.string(),
  doNotUseWords: z.array(z.string()),
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const CampaignListItemSchema = z.object({
  id: z.string(),
  brand: z.string(),
  objective: z.string(),
  targetCountry: z.string(),
});

export type CampaignListItem = z.infer<typeof CampaignListItemSchema>;

export const CreatorAudienceSchema = z.object({
  topCountries: z.array(z.string()),
  genderSplit: z.object({
    female: z.number(),
    male: z.number(),
  }),
  topAgeRange: z.string(),
});

export const CreatorPostSchema = z.object({
  caption: z.string(),
  views: z.number(),
  likes: z.number(),
});

export const CreatorSchema = z.object({
  id: z.string(),
  username: z.string(),
  country: z.string(),
  niches: z.array(z.string()),
  followers: z.number(),
  engagementRate: z.number(),
  avgWatchTime: z.number(),
  contentStyle: z.string(),
  primaryHookType: z.string(),
  brandSafetyFlags: z.array(z.string()),
  audience: CreatorAudienceSchema,
  lastPosts: z.array(CreatorPostSchema),
});

export type Creator = z.infer<typeof CreatorSchema>;

export const AIBriefResponseSchema = z.object({
  outreachMessage: z.string(),
  contentIdeas: z.array(z.string()).min(5),
  hookSuggestions: z.array(z.string()).min(3),
  keyTalkingPoints: z.array(z.string()).optional(),
  suggestedPostingSchedule: z.string().optional(),
});

export type AIBriefResponse = z.infer<typeof AIBriefResponseSchema>;

export const AIBriefRecordSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  creatorId: z.string(),
  responseJson: AIBriefResponseSchema,
  createdAt: z.string(),
});

export type AIBriefRecord = z.infer<typeof AIBriefRecordSchema>;

