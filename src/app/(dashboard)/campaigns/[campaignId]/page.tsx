"use client";

import { use, useState, useCallback } from "react";
import { api } from "@/utils/trpc";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { BriefResultCard, type BriefData } from "@/components/BriefResultCard";
import { Modal } from "@/components/Modal";

type RankedItem = {
  creatorId: string;
  creator: { username: string; country: string; followers: number; engagementRate: number };
  totalScore: number;
  scoreBreakdown: {
    nicheMatch: number;
    audienceCountryMatch: number;
    engagementScore: number;
    watchTimeScore: number;
    followerFitScore: number;
    hookMatch: number;
    brandSafetyPenalty: number;
  };
};

function normalizeBriefPayload(raw: unknown): BriefData | null {
  if (!raw || typeof raw !== "object") return null;
  const nested = (raw as { result?: { data?: { json?: unknown } } }).result?.data?.json;
  const payload = nested ?? raw;
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (
    typeof p.outreachMessage !== "string" ||
    !Array.isArray(p.contentIdeas) ||
    !Array.isArray(p.hookSuggestions)
  ) {
    return null;
  }
  const brief: BriefData = {
    outreachMessage: p.outreachMessage,
    contentIdeas: p.contentIdeas as string[],
    hookSuggestions: p.hookSuggestions as string[],
  };
  if (Array.isArray(p.keyTalkingPoints)) {
    brief.keyTalkingPoints = p.keyTalkingPoints as string[];
  }
  if (typeof p.suggestedPostingSchedule === "string") {
    brief.suggestedPostingSchedule = p.suggestedPostingSchedule;
  }
  return brief;
}

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

  const [breakdownModalItem, setBreakdownModalItem] = useState<RankedItem | null>(null);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);

  const briefMutation = api.briefs.generateBrief.useMutation({
    onSuccess(raw) {
      const brief = normalizeBriefPayload(raw);
      setBriefData(brief);
      setBriefError(null);
    },
    onError(err) {
      setBriefData(null);
      setBriefError(err.message ?? "Brief generation failed.");
    },
  });

  const briefLoading = briefMutation.isPending;
  const handleGenerateBrief = useCallback(
    (creatorId: string) => {
      setSelectedCreatorId(creatorId);
      setBriefModalOpen(true);
      setBriefError(null);
      setBriefData(null);
      briefMutation.mutate({ campaignId, creatorId });
    },
    [campaignId, briefMutation],
  );

  const selectedCreator =
    data?.find((item) => item.creatorId === selectedCreatorId)?.creator ?? null;

  if (!campaignId) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-800" />
        <p className="mt-4 text-sm text-gray-400">Loading ranked creators…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white">
          {campaign ? campaign.brand : `Campaign ${campaignId}`}
        </h1>
        <p className="mt-4 text-sm text-red-400">Unable to load ranked creators.</p>
      </div>
    );
  }

  const titleBrand = campaign?.brand ?? `Campaign ${campaignId}`;
  const titleMeta = campaign
    ? `${campaign.objective} · ${campaign.targetCountry}`
    : null;

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border border-gray-700/60 bg-[var(--card)] px-6 py-6 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {titleBrand}
        </h1>
        {titleMeta && (
          <p className="mt-2 text-base text-gray-400">{titleMeta}</p>
        )}
      </div>

      <section className="rounded-xl border border-gray-700/60 bg-[var(--card)] p-6 shadow-lg">
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
                const score = item.totalScore;
                const b = item.scoreBreakdown;
                return (
                  <tr
                    key={item.creatorId}
                    className="border-b border-gray-800/60 align-top transition last:border-0 even:bg-gray-800/20 hover:bg-gray-800/40"
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
                      <Button
                        variant="secondary"
                        onClick={() => setBreakdownModalItem(item)}
                      >
                        View
                      </Button>
                    </td>
                    <td className="py-3.5 px-3">
                      <Button
                        variant="primary"
                        loading={briefLoading && selectedCreatorId === item.creatorId}
                        disabled={briefLoading && selectedCreatorId === item.creatorId}
                        onClick={() => handleGenerateBrief(item.creatorId)}
                      >
                        {briefLoading && selectedCreatorId === item.creatorId
                          ? "Generating…"
                          : "Generate brief"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={breakdownModalItem !== null}
        onClose={() => setBreakdownModalItem(null)}
        title={
          breakdownModalItem
            ? `Score breakdown · @${breakdownModalItem.creator.username}`
            : "Score breakdown"
        }
      >
        {breakdownModalItem && (
          <div className="rounded-lg border border-gray-700/60 bg-gray-800/50 p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-200">Score breakdown</span>
              <span className="font-mono font-semibold text-white">
                Total {breakdownModalItem.totalScore.toFixed(1)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              <BreakdownRow label="Niche match" value={breakdownModalItem.scoreBreakdown.nicheMatch} />
              <BreakdownRow label="Audience country" value={breakdownModalItem.scoreBreakdown.audienceCountryMatch} />
              <BreakdownRow label="Engagement" value={breakdownModalItem.scoreBreakdown.engagementScore} />
              <BreakdownRow label="Watch time" value={breakdownModalItem.scoreBreakdown.watchTimeScore} />
              <BreakdownRow label="Follower fit" value={breakdownModalItem.scoreBreakdown.followerFitScore} />
              <BreakdownRow label="Hook match" value={breakdownModalItem.scoreBreakdown.hookMatch} />
              <BreakdownRow label="Brand safety penalty" value={breakdownModalItem.scoreBreakdown.brandSafetyPenalty} />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={briefModalOpen}
        onClose={() => {
          setBriefModalOpen(false);
          setBriefError(null);
        }}
        title={selectedCreator ? `AI Brief · @${selectedCreator.username}` : "AI Brief"}
      >
        {briefLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-gray-700/50 bg-[var(--card)] p-6">
            <Spinner className="h-6 w-6 text-indigo-400" />
            <p className="text-sm text-gray-400">Generating brief…</p>
          </div>
        )}
        {!briefLoading && briefError && (
          <ErrorBanner
            message={briefError}
            onRetry={() => {
              setBriefError(null);
              if (selectedCreatorId) handleGenerateBrief(selectedCreatorId);
            }}
          />
        )}
        {!briefLoading && briefData && (
          <BriefResultCard
            data={briefData}
            creator={selectedCreator}
            campaignBrand={campaign?.brand ?? campaignId}
          />
        )}
        {!briefLoading && !briefData && !briefError && (
          <p className="text-sm text-gray-500">Generating brief…</p>
        )}
      </Modal>
    </div>
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
