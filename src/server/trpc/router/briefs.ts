import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { BriefGenerationError, generateBrief } from "@/services/briefService";

export const briefsRouter = router({
  generateBrief: publicProcedure
    .input(
      z.object({
        campaignId: z.string().min(1),
        creatorId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await generateBrief(ctx.supabase, input.campaignId, input.creatorId);
        return result;
      } catch (error) {
        if (error instanceof BriefGenerationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate brief",
        });
      }
    }),
});

