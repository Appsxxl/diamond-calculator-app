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
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#0f172a;margin-bottom:8px">Sign in to Plan B</h2>
      <p style="color:#475569">Click the button below — this link expires in 15 minutes.</p>
      <a href="${verifyUrl}"
         style="display:inline-block;background:#c9a84c;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;margin:24px 0">
        Sign in to Plan B
      </a>
      <p style="color:#64748b;font-size:14px;margin-top:32px">
        Or enter this 6-digit code in the app:
      </p>
      <p style="font-size:36px;font-weight:700;letter-spacing:10px;color:#0f172a;margin:8px 0">
        ${otp}
      </p>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>`;

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
