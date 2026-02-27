"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/utils/trpc";

type CampaignItem = { id: string; brand: string; objective: string; targetCountry: string };

function normalizeCampaigns(data: unknown): CampaignItem[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    "json" in data &&
    Array.isArray((data as { json: CampaignItem[] }).json)
  ) {
    return (data as { json: CampaignItem[] }).json;
  }
  return [];
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: rawData } = api.campaign.getCampaigns.useQuery();
  const campaigns = normalizeCampaigns(rawData);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-800 bg-[#111827]">
        <div className="sticky top-0 flex flex-col gap-1 p-4">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-lg font-semibold text-white hover:bg-gray-800/60 hover:no-underline"
          >
            Wayv
          </Link>
          <nav className="mt-4 flex flex-col gap-0.5">
            <span className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
              Campaigns
            </span>
            {campaigns.map((c) => {
              const isActive = pathname === `/campaigns/${c.id}`;
              return (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.id}`}
                  className={`rounded-lg px-3 py-2 text-sm transition hover:no-underline ${
                    isActive
                      ? "bg-gray-800/80 font-medium text-white"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  }`}
                >
                  {c.brand}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto bg-[var(--background)]">
        {children}
      </main>
    </div>
  );
}
