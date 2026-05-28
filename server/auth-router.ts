import crypto from "crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const.js";
import { publicProcedure, router } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import { signSession } from "./_core/auth-service";
import { ENV } from "./_core/env";
import {
  createMagicLinkToken,
  getMagicLinkByToken,
  getMagicLinkByOtp,
  markMagicLinkUsed,
  getUserByOpenId,
  upsertUser,
} from "./db";

const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generateOtp(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
}

async function sendEmail(to: string, token: string, otp: string): Promise<void> {
  if (!ENV.resendApiKey) {
    // Dev mode: log instead of sending
    const url = `${ENV.appUrl}/auth/verify?token=${token}`;
    console.log(`\n[Auth] Magic link for ${to}:\n  URL: ${url}\n  OTP: ${otp}\n`);
    return;
  }

  const verifyUrl = `${ENV.appUrl}/auth/verify?token=${token}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">

        <!-- Header -->
        <tr><td style="padding-bottom:32px;text-align:center">
          <p style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;letter-spacing:-0.3px">Plan B</p>
          <p style="margin:6px 0 0;font-size:13px;color:#64748b;letter-spacing:0.3px">STRATEGIC WEALTH OPTIMISATION</p>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#1e293b;border-radius:16px;border:1px solid #1e3a5f;padding:36px 32px">

          <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#f1f5f9">Your sign-in link</p>
          <p style="margin:0 0 28px;font-size:15px;color:#94a3b8;line-height:1.5">
            Click the button below to sign in to Plan B. This link expires in <strong style="color:#e2e8f0">15 minutes</strong>.
          </p>

          <!-- CTA button -->
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px">
            <tr><td align="center">
              <a href="${verifyUrl}"
                 style="display:inline-block;background:#0ea5e9;color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:0.2px">
                Sign in to Plan B
              </a>
            </td></tr>
          </table>

          <!-- Divider -->
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px">
            <tr>
              <td style="border-top:1px solid #1e3a5f"></td>
              <td style="padding:0 12px;white-space:nowrap;font-size:12px;color:#475569">or use the code</td>
              <td style="border-top:1px solid #1e3a5f"></td>
            </tr>
          </table>

          <!-- OTP -->
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;text-align:center">Enter this 6-digit code in the app:</p>
          <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:14px;color:#0ea5e9;text-align:center;padding:12px 0">${otp}</p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center">
          <p style="margin:0;font-size:12px;color:#334155">If you didn't request this, you can safely ignore this email.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${ENV.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: ENV.fromEmail, to, subject: "Your Plan B sign-in link", html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error: ${body}`);
  }
}

function buildUser(user: Awaited<ReturnType<typeof getUserByOpenId>>) {
  return {
    id: user?.id ?? 0,
    openId: user?.openId ?? "",
    name: user?.name ?? null,
    email: user?.email ?? null,
    loginMethod: "magic-link" as const,
    lastSignedIn: (user?.lastSignedIn ?? new Date()).toISOString(),
    role: user?.role ?? "user",
  };
}

async function issueSession(
  email: string,
  ctx: { res: import("express").Response; req: import("express").Request },
) {
  await upsertUser({ openId: email, email, loginMethod: "magic-link", lastSignedIn: new Date() });
  const user = await getUserByOpenId(email);
  const sessionToken = await signSession(email, user?.name ?? "");

  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

  return { sessionToken, user: buildUser(user) };
}

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  logout: publicProcedure.mutation(({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...opts, maxAge: -1 });
    return { success: true } as const;
  }),

  requestMagicLink: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const email = input.email.toLowerCase().trim();
      const token = generateToken();
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + EXPIRY_MS);

      await createMagicLinkToken(email, token, otp, expiresAt);
      await sendEmail(email, token, otp);

      return { sent: true };
    }),

  verifyToken: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const record = await getMagicLinkByToken(input.token);

      if (!record || record.usedAt || record.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired link" });
      }

      await markMagicLinkUsed(record.id);
      return issueSession(record.email, ctx);
    }),

  verifyOtp: publicProcedure
    .input(z.object({ email: z.string().email(), otp: z.string().length(6) }))
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase().trim();
      const record = await getMagicLinkByOtp(email, input.otp);

      if (!record || record.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired code" });
      }

      await markMagicLinkUsed(record.id);
      return issueSession(email, ctx);
    }),
});
