import type { SupabaseClient } from "@supabase/supabase-js";
import { CreatorSchema, type Creator } from "@/domain/schemas";

export async function getAllCreators(supabase: SupabaseClient): Promise<Creator[]> {
  const { data, error } = await supabase.from("creators").select("*");

  if (error || !data) {
    return [];
  }

  const creators: Creator[] = [];

  for (const row of data) {
    const parsed = CreatorSchema.safeParse({
      id: row.id,
      username: row.username,
      country: row.country,
      niches: row.niches ?? [],
      followers: row.followers,
      engagementRate: row.engagement_rate,
      avgWatchTime: row.avg_watch_time,
      contentStyle: row.content_style,
      primaryHookType: row.primary_hook_type,
      brandSafetyFlags: row.brand_safety_flags ?? [],
      audience: row.audience,
      lastPosts: row.last_posts ?? [],
    });

    if (parsed.success) {
      creators.push(parsed.data);
    }
  }

  return creators;
}

