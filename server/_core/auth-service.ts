import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
import type { Request } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";
import { ENV } from "./env";
import { getUserByOpenId } from "../db";
import type { User } from "../../drizzle/schema";

function getSecret(): Uint8Array {
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function signSession(openId: string, name = ""): Promise<string> {
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ openId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<{ openId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.openId !== "string") return null;
    return { openId: payload.openId };
  } catch {
    return null;
  }
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    const cookies = parseCookies(req.headers.cookie ?? "");
    token = cookies[COOKIE_NAME];
  }

  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  return (await getUserByOpenId(session.openId)) ?? null;
}
