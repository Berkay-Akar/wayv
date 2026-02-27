"use client";

import Link from "next/link";
import { api } from "@/utils/trpc";

type CampaignItem = { id: string; brand: string; objective: string; targetCountry: string };

function normalizeCampaigns(data: unknown): CampaignItem[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "json" in data && Array.isArray((data as { json: CampaignItem[] }).json)) {
    return (data as { json: CampaignItem[] }).json;
  }
  return [];
}

export default function HomePage() {
  const { data: rawData, isLoading, isError } = api.campaign.getCampaigns.useQuery();
  const campaigns = normalizeCampaigns(rawData);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-gray-400">
        Choose a campaign to view top creators and generate AI briefs.
      </p>

      {isLoading && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-gray-800 bg-gray-800/40"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-8 text-sm text-red-400">Failed to load campaigns.</p>
      )}

      {!isLoading && !isError && campaigns.length === 0 && (
        <p className="mt-8 text-sm text-gray-500">No campaigns yet.</p>
      )}

      {!isLoading && !isError && campaigns.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="rounded-lg border border-gray-800 bg-gray-900/60 p-5 transition hover:border-gray-600 hover:bg-gray-900/80 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-white">{c.brand}</h2>
              <p className="mt-1 text-sm text-gray-400">{c.objective}</p>
              <p className="mt-2 text-xs text-gray-500">Target: {c.targetCountry}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
