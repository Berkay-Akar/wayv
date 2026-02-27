import type { SupabaseClient } from "@supabase/supabase-js";
import type { AIBriefResponse } from "@/domain/schemas";
import { buildBriefPrompt } from "@/domain/briefs/prompt";
import { getCampaignById } from "@/services/campaignRepository";
import { getAllCreators } from "@/services/creatorRepository";
import { parseBriefFromRaw } from "@/domain/briefs/parse";
import { findBrief, insertBrief } from "@/services/briefRepository";
import type { LLMProvider } from "@/services/llm/LLMProvider";
import { GroqProvider } from "@/services/llm/GroqProvider";

const MAX_ATTEMPTS = 2;

export class BriefGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BriefGenerationError";
  }
}

async function resolveCreatorById(supabase: SupabaseClient, creatorId: string) {
  const creators = await getAllCreators(supabase);
  return creators.find((c) => c.id === creatorId) ?? null;
}

export async function generateBrief(
  supabase: SupabaseClient,
  campaignId: string,
  creatorId: string,
  provider: LLMProvider = new GroqProvider(),
): Promise<AIBriefResponse> {
  const cached = await findBrief(supabase, campaignId, creatorId);
  if (cached) {
    return cached.responseJson;
  }

  const campaign = await getCampaignById(supabase, campaignId);
  if (!campaign) {
    throw new BriefGenerationError(`Campaign ${campaignId} not found`);
  }

  const creator = await resolveCreatorById(supabase, creatorId);
  if (!creator) {
    throw new BriefGenerationError(`Creator ${creatorId} not found`);
  }

  const prompt = buildBriefPrompt(campaign, creator);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const raw = await provider.generate(prompt);
      const parsed = parseBriefFromRaw(raw);
      if (!parsed) {
        throw new Error("Validation failed");
      }

      await insertBrief(supabase, campaignId, creatorId, parsed);
      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
    }
  }

  throw new BriefGenerationError(lastError?.message ?? "Failed to generate brief");
}

