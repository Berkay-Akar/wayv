import type { SupabaseClient } from "@supabase/supabase-js";
import { CampaignSchema, CampaignListItemSchema, type Campaign, type CampaignListItem } from "@/domain/schemas";

export async function getCampaigns(supabase: SupabaseClient): Promise<CampaignListItem[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, brand, objective, target_country");

  if (error || !data) return [];

  const result: CampaignListItem[] = [];
  for (const row of data) {
    const parsed = CampaignListItemSchema.safeParse({
      id: row.id,
      brand: row.brand,
      objective: row.objective,
      targetCountry: row.target_country,
    });
    if (parsed.success) result.push(parsed.data);
  }
  return result;
}

export async function getCampaignById(
  supabase: SupabaseClient,
  id: string,
): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  if (!data) return null;

  const parsed = CampaignSchema.safeParse({
    id: data.id,
    brand: data.brand,
    objective: data.objective,
    targetCountry: data.target_country,
    targetGender: data.target_gender,
    targetAgeRange: data.target_age_range,
    niches: data.niches ?? [],
    preferredHookTypes: data.preferred_hook_types ?? [],
    minAvgWatchTime: data.min_avg_watch_time,
    budgetRange: {
      minFollowers: data.min_followers,
      maxFollowers: data.max_followers,
    },
    tone: data.tone,
    doNotUseWords: data.do_not_use_words ?? [],
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

