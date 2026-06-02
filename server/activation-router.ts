import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { sendMail } from "./_core/mailer";
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

  sendCodeEmail: adminProcedure
    .input(z.object({
      email: z.string().email(),
      code: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const record = await getWhitelistCode(input.code);
      if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Code not found." });
      if (record.usedBy) throw new TRPCError({ code: "BAD_REQUEST", message: "That code is already redeemed." });

      const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
        <tr><td style="padding:32px;background:#1e293b;border-radius:16px;border:1px solid #334155">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#f59e0b;letter-spacing:1px;text-transform:uppercase">Plan B — Activation</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#f1f5f9">You have been granted Team Access</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:24px">
            Your activation code is ready. Enter it in the Plan B app under <strong style="color:#e2e8f0">Settings → Activate</strong> to unlock lifetime access.
          </p>
          <div style="background:#0f172a;border:2px solid #f59e0b;border-radius:12px;padding:20px;text-align:center;margin-bottom:28px">
            <p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px">Your Code</p>
            <p style="margin:0;font-size:28px;font-weight:900;color:#f59e0b;letter-spacing:4px">${input.code}</p>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:20px">
            1. Open the Plan B app<br>
            2. Go to <strong style="color:#e2e8f0">Settings</strong><br>
            3. Tap <strong style="color:#e2e8f0">★ Team Access → Activate</strong><br>
            4. Enter the code above and tap Activate
          </p>
          <p style="margin:24px 0 0;font-size:12px;color:#334155">This code is personal — do not share it. One-time use only.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      await sendMail({ to: input.email, subject: "Your Plan B activation code", html });
      return { success: true };
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
