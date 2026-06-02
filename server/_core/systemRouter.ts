import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

const SERVER_START = Date.now();

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      }),
    )
    .query(() => ({
      ok: true,
    })),

  diagnostics: publicProcedure.query(() => {
    const uptimeMs = Date.now() - SERVER_START;
    const uptimeMin = Math.floor(uptimeMs / 60_000);
    return {
      ok: true,
      serverTime: new Date().toISOString(),
      uptimeMinutes: uptimeMin,
      nodeVersion: process.version,
      env: process.env.NODE_ENV ?? "unknown",
    };
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
