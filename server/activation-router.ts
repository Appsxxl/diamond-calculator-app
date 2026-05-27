import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createWhitelistCode,
  getWhitelistCode,
  getUserStatus,
  listUsersWithStatus,
  listWhitelistCodes,
  markCodeUsed,
  upsertUserStatus,
} from "./db";

export const activationRouter = router({
  redeemCode: protectedProcedure
    .input(z.object({ code: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const existingStatus = await getUserStatus(ctx.user.id);
      if (existingStatus?.status === "team") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Your account already has Team Access." });
      }

      const record = await getWhitelistCode(input.code);
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid activation code." });
      }
      if (record.usedBy !== null && record.usedBy !== undefined) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This code has already been redeemed." });
      }

      await markCodeUsed(record.id, ctx.user.id);
      await upsertUserStatus(ctx.user.id, {
        status: "team",
        activationCode: record.code,
        activatedAt: new Date(),
      });

      return { success: true };
    }),

  getMyStatus: protectedProcedure.query(async ({ ctx }) => {
    const status = await getUserStatus(ctx.user.id);
    return {
      status: status?.status ?? "trial",
      activatedAt: status?.activatedAt ?? null,
      trialStartedAt: status?.trialStartedAt ?? ctx.user.createdAt,
    };
  }),

  setPaidStatus: protectedProcedure.mutation(async ({ ctx }) => {
    await upsertUserStatus(ctx.user.id, {
      status: "paid",
      activatedAt: new Date(),
    });
    return { success: true };
  }),

  createCode: adminProcedure
    .input(z.object({ code: z.string().min(1).max(64), description: z.string().max(256).optional() }))
    .mutation(async ({ input }) => {
      const existing = await getWhitelistCode(input.code);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "A code with that name already exists." });
      }
      await createWhitelistCode(input.code, input.description);
      return { success: true };
    }),

  listCodes: adminProcedure.query(async () => {
    return listWhitelistCodes();
  }),

  listUsers: adminProcedure.query(async () => {
    return listUsersWithStatus();
  }),
});
