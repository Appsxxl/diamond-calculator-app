import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import {
  createWhitelistCode,
  getWhitelistCode,
  getUserStatus,
  listUsersWithStatus,
  listWhitelistCodes,
  markCodeUsed,
  upsertUser,
  upsertUserStatus,
  createEvent,
  deleteEvent,
  listAllEvents,
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
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
    };
  }),

  claimAdmin: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ENV.ownerOpenId || ctx.user.openId !== ENV.ownerOpenId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Not the owner account." });
    }
    if (ctx.user.role === "admin") return { already: true };
    await upsertUser({ openId: ctx.user.openId, role: "admin" });
    return { promoted: true };
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

  listEvents: adminProcedure.query(async () => {
    const rows = await listAllEvents();
    return rows.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description ?? "",
      eventDate: e.eventDate.toISOString(),
      timezone: e.timezone,
      link: e.link ?? "",
      type: e.type,
    }));
  }),

  createEvent: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
      eventDate: z.string(), // ISO string
      timezone: z.string().default("UTC"),
      link: z.string().url().optional(),
      type: z.enum(["zoom", "webinar", "event"]).default("zoom"),
    }))
    .mutation(async ({ input }) => {
      await createEvent({
        title: input.title,
        description: input.description ?? null,
        eventDate: new Date(input.eventDate),
        timezone: input.timezone,
        link: input.link ?? null,
        type: input.type,
      });
      return { success: true };
    }),

  deleteEvent: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteEvent(input.id);
      return { success: true };
    }),
});
