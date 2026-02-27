import type { SupabaseClient } from "@supabase/supabase-js";
import type { RankedCreatorScore } from "@/domain/matching/types";
import { rankCreatorsForCampaign } from "@/domain/matching/engine";
import { getCampaignById } from "@/services/campaignRepository";
import { getAllCreators } from "@/services/creatorRepository";

export class CampaignNotFoundError extends Error {
  constructor(campaignId: string) {
    super(`Campaign ${campaignId} not found`);
    this.name = "CampaignNotFoundError";
  }
}

export async function getTopCreatorsByCampaignId(
  supabase: SupabaseClient,
  campaignId: string,
): Promise<RankedCreatorScore[]> {
  const campaign = await getCampaignById(supabase, campaignId);
  if (!campaign) {
    throw new CampaignNotFoundError(campaignId);
  }

  const creators = await getAllCreators(supabase);

  return rankCreatorsForCampaign(campaign, creators, 20);
}

