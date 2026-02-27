import type { inferAsyncReturnType } from "@trpc/server";
import { supabaseServerClient } from "@/server/supabaseClient";

export async function createTRPCContext() {
  return {
    supabase: supabaseServerClient,
  };
}

export type TRPCContext = inferAsyncReturnType<typeof createTRPCContext>;

