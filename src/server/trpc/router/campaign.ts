import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { getCampaignById, getCampaigns } from "@/services/campaignRepository";

export const campaignRouter = router({
  getCampaigns: publicProcedure.query(async ({ ctx }) => {
    return getCampaigns(ctx.supabase);
  }),

  getCampaign: publicProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const campaign = await getCampaignById(ctx.supabase, input.campaignId);
      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }
      return campaign;
    }),
});
