import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { getTopCreatorsByCampaignId, CampaignNotFoundError } from "@/services/matchingService";

export const matchingRouter = router({
  getTopCreatorsByCampaign: publicProcedure
    .input(
      z.object({
        campaignId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const ranked = await getTopCreatorsByCampaignId(ctx.supabase, input.campaignId);
        return ranked;
      } catch (error) {
        if (error instanceof CampaignNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to rank creators",
        });
      }
    }),
});

