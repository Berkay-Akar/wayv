"use client";

export type BriefData = {
  outreachMessage: string;
  contentIdeas: string[];
  hookSuggestions: string[];
  keyTalkingPoints?: string[];
  suggestedPostingSchedule?: string;
};

export function BriefResultCard({
  data,
  creator,
  campaignBrand,
  className = "",
}: {
  data: BriefData;
  creator?: { username: string } | null;
  campaignBrand?: string | null;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-700/50 bg-[var(--card)] p-6 shadow-lg ${className}`}
    >
      <div className="border-b border-gray-700/60 pb-5">
        <h2 className="text-lg font-semibold text-white">AI Brief</h2>
        {(creator || campaignBrand) && (
          <p className="mt-1 text-sm text-gray-400">
            {creator ? `@${creator.username}` : ""}
            {creator && campaignBrand ? " · " : ""}
            {campaignBrand ?? ""}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Outreach message
          </h3>
          <div className="mt-2 rounded-lg bg-slate-800/60 p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-200">
              {data.outreachMessage}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Content ideas
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-200">
            {data.contentIdeas.map((idea, i) => (
              <li key={i}>{idea}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Hook suggestions
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.hookSuggestions.map((hook, i) => (
              <span
                key={i}
                className="rounded-lg bg-gray-700/60 px-3 py-1.5 text-sm text-gray-200"
              >
                {hook}
              </span>
            ))}
          </div>
        </div>

        {data.keyTalkingPoints && data.keyTalkingPoints.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Key talking points
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-200">
              {data.keyTalkingPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {data.suggestedPostingSchedule && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Suggested posting schedule
            </h3>
            <p className="mt-2 text-sm text-gray-200">
              {data.suggestedPostingSchedule}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
