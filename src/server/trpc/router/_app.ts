import { router } from "../trpc";
import { matchingRouter } from "./matching";
import { briefsRouter } from "./briefs";
import { campaignRouter } from "./campaign";

export const appRouter = router({
  matching: matchingRouter,
  briefs: briefsRouter,
  campaign: campaignRouter,
});

export type AppRouter = typeof appRouter;



