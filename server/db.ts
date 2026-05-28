import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  AdvisorProfile,
  advisorProfiles,
  InsertAdvisorProfile,
  InsertUser,
  MagicLinkToken,
  magicLinkTokens,
  UserStatus,
  userStatuses,
  WhitelistCode,
  whitelistCodes,
  users,
  User,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

function findD1SqlitePath(): string | null {
  const d1Dir = path.resolve(".wrangler/state/v3/d1");
  try {
    const entries = fs.readdirSync(d1Dir, { recursive: true }) as string[];
    for (const entry of entries) {
      if (entry.endsWith(".sqlite") && !entry.includes("metadata")) {
        return path.join(d1Dir, entry);
      }
    }
  } catch {
    return null;
  }
  return null;
}

type DrizzleDb = ReturnType<typeof drizzle>;
let _db: DrizzleDb | null = null;

function getDb(): DrizzleDb | null {
  if (!_db) {
    const dbPath = findD1SqlitePath();
    if (!dbPath) {
      console.warn("[Database] Cannot find D1 SQLite file — run db:push first");
      return null;
    }
    try {
      const sqlite = new Database(dbPath);
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Cannot connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAdvisorProfile(userId: number): Promise<AdvisorProfile | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(advisorProfiles).where(eq(advisorProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertAdvisorProfile(
  userId: number,
  data: Partial<Omit<InsertAdvisorProfile, "id" | "userId" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .insert(advisorProfiles)
    .values({ userId, ...data })
    .onConflictDoUpdate({ target: advisorProfiles.userId, set: { ...data, updatedAt: new Date() } });
}

export async function getWhitelistCode(code: string): Promise<WhitelistCode | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(whitelistCodes)
    .where(eq(whitelistCodes.code, code.toUpperCase()))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function markCodeUsed(codeId: number, userId: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(whitelistCodes)
    .set({ usedBy: userId, usedAt: new Date() })
    .where(eq(whitelistCodes.id, codeId));
}

export async function createWhitelistCode(code: string, description?: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.insert(whitelistCodes).values({ code: code.toUpperCase(), description });
}

export async function listWhitelistCodes(): Promise<WhitelistCode[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(whitelistCodes).orderBy(whitelistCodes.createdAt);
}

export async function getUserStatus(userId: number): Promise<UserStatus | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(userStatuses).where(eq(userStatuses.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export type UserWithStatus = Pick<User, "id" | "name" | "email" | "role" | "createdAt"> & {
  status: UserStatus["status"] | null;
  activationCode: string | null;
  activatedAt: Date | null;
  trialStartedAt: Date | null;
};

export async function listUsersWithStatus(): Promise<UserWithStatus[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      status: userStatuses.status,
      activationCode: userStatuses.activationCode,
      activatedAt: userStatuses.activatedAt,
      trialStartedAt: userStatuses.trialStartedAt,
    })
    .from(users)
    .leftJoin(userStatuses, eq(userStatuses.userId, users.id))
    .orderBy(users.createdAt);
}

export async function upsertUserStatus(
  userId: number,
  data: Partial<Omit<UserStatus, "id" | "userId" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .insert(userStatuses)
    .values({ userId, ...data })
    .onConflictDoUpdate({ target: userStatuses.userId, set: { ...data, updatedAt: new Date() } });
}

// ── Magic link tokens ──────────────────────────────────────────────────────────

export async function createMagicLinkToken(
  email: string,
  token: string,
  otp: string,
  expiresAt: Date,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.insert(magicLinkTokens).values({ email, token, otp, expiresAt });
}

export async function getMagicLinkByToken(token: string): Promise<MagicLinkToken | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(magicLinkTokens)
    .where(eq(magicLinkTokens.token, token))
    .limit(1);
  return result[0];
}

export async function getMagicLinkByOtp(
  email: string,
  otp: string,
): Promise<MagicLinkToken | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(magicLinkTokens)
    .where(eq(magicLinkTokens.email, email))
    .orderBy(magicLinkTokens.createdAt)
    .all();
  // Find the latest unused matching OTP
  return result.reverse().find((r) => r.otp === otp && !r.usedAt);
}

export async function markMagicLinkUsed(id: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(magicLinkTokens)
    .set({ usedAt: new Date() })
    .where(eq(magicLinkTokens.id, id));
}
