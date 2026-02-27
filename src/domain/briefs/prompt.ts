import type { Campaign, Creator } from "@/domain/schemas";

export function buildBriefPrompt(campaign: Campaign, creator: Creator): string {
  const blocked = campaign.doNotUseWords.join(", ");

  return [
    `You are helping the brand ${campaign.brand} run a ${campaign.objective} campaign.`,
    `Campaign details:`,
    `- Target country: ${campaign.targetCountry}`,
    `- Target gender: ${campaign.targetGender}`,
    `- Target age range: ${campaign.targetAgeRange}`,
    `- Niches: ${campaign.niches.join(", ")}`,
    `- Preferred hook types: ${campaign.preferredHookTypes.join(", ")}`,
    `- Tone: ${campaign.tone}`,
    blocked ? `- Do not use words: ${blocked}` : "",
    ``,
    `Creator details:`,
    `- Handle: @${creator.username}`,
    `- Country: ${creator.country}`,
    `- Niches: ${creator.niches.join(", ")}`,
    `- Followers: ${creator.followers}`,
    `- Engagement rate: ${(creator.engagementRate * 100).toFixed(1)}%`,
    `- Avg watch time: ${creator.avgWatchTime.toFixed(1)}s`,
    `- Primary hook type: ${creator.primaryHookType}`,
    ``,
    `Generate a structured brief as strict JSON with the following shape (no markdown, no comments, no extra text):`,
    `{"outreachMessage": string, "contentIdeas": string[5], "hookSuggestions": string[3]}`,
  ]
    .filter(Boolean)
    .join("\n");
}

