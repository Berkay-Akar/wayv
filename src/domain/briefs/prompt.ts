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
    `Write a detailed, actionable brief. Outreach message: 2-3 sentences. Content ideas: specific and varied. Hook suggestions: ready to use.`,
    ``,
    `Respond with strict JSON only (no markdown, no comments, no extra text). Shape:`,
    `{"outreachMessage": string, "contentIdeas": string[7], "hookSuggestions": string[5], "keyTalkingPoints": string[3-5], "suggestedPostingSchedule": string}`,
  ]
    .filter(Boolean)
    .join("\n");
}

