"use client";

import { use, useState, Fragment } from "react";
import { api } from "@/utils/trpc";

export default function CampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = use(params);
  const { data: campaign } = api.campaign.getCampaign.useQuery(
    { campaignId },
    { enabled: !!campaignId, retry: false },
  );
  const { data, isLoading, isError } = api.matching.getTopCreatorsByCampaign.useQuery(
    { campaignId },
    { enabled: !!campaignId },
  );

  const [expandedCreatorId, setExpandedCreatorId] = useState<string | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);

  const briefMutation = api.briefs.generateBrief.useMutation();

  const selectedCreator =
    data?.find((item) => item.creatorId === selectedCreatorId)?.creator ?? null;

  if (!campaignId) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-800" />
        <p className="mt-4 text-sm text-gray-400">Loading ranked creators…</p>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <h1 className="text-2xl font-semibold text-white">
          {campaign ? campaign.brand : `Campaign ${campaignId}`}
        </h1>
        <p className="mt-4 text-sm text-red-400">Unable to load ranked creators.</p>
      </main>
    );
  }

  const titleBrand = campaign?.brand ?? `Campaign ${campaignId}`;
  const titleMeta = campaign
    ? `${campaign.objective} · ${campaign.targetCountry}`
    : null;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      <div className="mb-10 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 px-6 py-6 ring-1 ring-gray-800/80">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {titleBrand}
        </h1>
        {titleMeta && (
          <p className="mt-2 text-base text-gray-400">{titleMeta}</p>
        )}
      </div>

      <section className="rounded-xl border border-gray-800/80 bg-gray-900/50 p-6 shadow-sm md:p-8">
        <h2 className="text-base font-semibold text-gray-200">Top 20 creators</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/60 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="py-3.5 pl-1 pr-3">#</th>
                <th className="py-3.5 px-3">Creator</th>
                <th className="py-3.5 px-3">Country</th>
                <th className="py-3.5 px-3">Followers</th>
                <th className="py-3.5 px-3">Engagement</th>
                <th className="py-3.5 px-3">Total score</th>
                <th className="py-3.5 px-3">Breakdown</th>
                <th className="py-3.5 px-3">Brief</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const isExpanded = expandedCreatorId === item.creatorId;
                const score = item.totalScore;
                const b = item.scoreBreakdown;

                return (
                  <Fragment key={item.creatorId}>
                    <tr
                      className="border-b border-gray-800/60 align-top transition last:border-0 hover:bg-gray-800/40"
                    >
                      <td className="py-3.5 pl-1 pr-3 text-xs text-gray-500">{index + 1}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-white">@{item.creator.username}</div>
                      </td>
                      <td className="py-3.5 px-3 text-gray-300">{item.creator.country}</td>
                      <td className="py-3.5 px-3 text-gray-300">
                        {item.creator.followers.toLocaleString("en-US")}
                      </td>
                      <td className="py-3.5 px-3 text-gray-300">
                        {(item.creator.engagementRate * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={
                            score >= 70
                              ? "font-semibold text-emerald-400"
                              : score >= 40
                                ? "font-semibold text-gray-200"
                                : "font-semibold text-rose-400/90"
                          }
                        >
                          {score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          className="rounded-lg border border-gray-600 bg-gray-800/60 px-3 py-2 text-xs font-medium text-gray-200 transition hover:border-gray-500 hover:bg-gray-700/60"
                          onClick={() =>
                            setExpandedCreatorId(isExpanded ? null : item.creatorId)
                          }
                        >
                          {isExpanded ? "Hide" : "View"}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={briefMutation.isLoading && selectedCreatorId === item.creatorId}
                          onClick={() => {
                            setSelectedCreatorId(item.creatorId);
                            briefMutation.mutate({
                              campaignId,
                              creatorId: item.creatorId,
                            });
                          }}
                        >
                          {selectedCreatorId === item.creatorId && briefMutation.isLoading
                            ? "Generating…"
                            : "Generate brief"}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${item.creatorId}-breakdown`}>
                        <td colSpan={8} className="bg-gray-800/40 p-4 align-top">
                          <div className="rounded-lg border border-gray-700/60 bg-gray-800/50 p-4 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-200">Score breakdown</span>
                              <span className="font-mono font-semibold text-white">
                                Total {item.totalScore.toFixed(1)}
                              </span>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                              <BreakdownRow label="Niche match" value={b.nicheMatch} />
                              <BreakdownRow label="Audience country" value={b.audienceCountryMatch} />
                              <BreakdownRow label="Engagement" value={b.engagementScore} />
                              <BreakdownRow label="Watch time" value={b.watchTimeScore} />
                              <BreakdownRow label="Follower fit" value={b.followerFitScore} />
                              <BreakdownRow label="Hook match" value={b.hookMatch} />
                              <BreakdownRow label="Brand safety penalty" value={b.brandSafetyPenalty} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {briefMutation.isError && selectedCreatorId && (
        <section className="mt-6 rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-4">
          <p className="text-sm text-red-300">
            {briefMutation.error?.message ?? "Brief generation failed."}
          </p>
          <p className="mt-1 text-xs text-red-400/80">
            Check GROQ_API_KEY in .env.local and try again.
          </p>
        </section>
      )}

      {selectedCreator && briefMutation.data && (
        <section className="mt-8 rounded-xl border border-gray-800/80 bg-gray-900/50 p-6 shadow-sm md:p-8">
          <div className="border-b border-gray-800 pb-5">
            <h2 className="text-lg font-semibold text-white">AI brief</h2>
            <p className="mt-1 text-sm text-gray-400">
              @{selectedCreator.username} · {campaign?.brand ?? campaignId}
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Outreach message
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-200">
                {briefMutation.data.outreachMessage}
              </p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Content ideas
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-200">
                {briefMutation.data.contentIdeas.map((idea, index) => (
                  <li key={index}>{idea}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Hook suggestions
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-200">
                {briefMutation.data.hookSuggestions.map((hook, index) => (
                  <li key={index}>{hook}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded bg-gray-800/60 px-2 py-1.5">
      <span className="text-gray-300">{label}</span>
      <span className="font-mono text-gray-100">{value.toFixed(1)}</span>
    </div>
  );
}

