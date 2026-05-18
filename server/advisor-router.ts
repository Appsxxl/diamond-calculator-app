import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getAdvisorProfile, upsertAdvisorProfile } from "./db";
import { storageGet, storagePut } from "./storage";

export const advisorRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getAdvisorProfile(ctx.user.id);
    if (!profile) return null;

    let logoUrl: string | null = profile.logoUrl ?? null;
    if (profile.logoKey) {
      try {
        const fresh = await storageGet(profile.logoKey);
        logoUrl = fresh.url;
        await upsertAdvisorProfile(ctx.user.id, { logoUrl: fresh.url });
      } catch {
        // keep cached URL on failure
      }
    }

    return { ...profile, logoUrl };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        adviserName: z.string().max(256).optional(),
        companyName: z.string().max(256).optional(),
        mobile: z.string().max(64).optional(),
        contactInfo: z.string().max(256).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await upsertAdvisorProfile(ctx.user.id, input);
      return { success: true };
    }),

  uploadLogo: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        mimeType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ext = input.mimeType.split("/")[1] ?? "jpg";
      const key = `logos/${ctx.user.id}/logo.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");
      const { url } = await storagePut(key, buffer, input.mimeType);
      await upsertAdvisorProfile(ctx.user.id, { logoKey: key, logoUrl: url });
      return { logoUrl: url };
    }),

  removeLogo: protectedProcedure.mutation(async ({ ctx }) => {
    await upsertAdvisorProfile(ctx.user.id, { logoKey: null, logoUrl: null });
    return { success: true };
  }),
});
