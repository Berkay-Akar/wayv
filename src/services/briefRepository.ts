import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AIBriefResponseSchema,
  type AIBriefResponse,
  type AIBriefRecord,
} from "@/domain/schemas";

export async function findBrief(
  supabase: SupabaseClient,
  campaignId: string,
  creatorId: string,
): Promise<AIBriefRecord | null> {
  const { data, error } = await supabase
    .from("ai_briefs")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("creator_id", creatorId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const parsed = AIBriefResponseSchema.safeParse(data.response_json);
  if (!parsed.success) {
    return null;
  }

  const record: AIBriefRecord = {
    id: data.id,
    campaignId: data.campaign_id,
    creatorId: data.creator_id,
    responseJson: parsed.data,
    createdAt: data.created_at,
  };

  return record;
}

export async function insertBrief(
  supabase: SupabaseClient,
  campaignId: string,
  creatorId: string,
  payload: AIBriefResponse,
): Promise<void> {
  const { error } = await supabase.from("ai_briefs").insert({
    campaign_id: campaignId,
    creator_id: creatorId,
    response_json: payload,
  });

  if (error) {
    throw new Error("Failed to persist brief");
  }
}

