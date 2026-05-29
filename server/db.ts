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

const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS \`users\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`openId\` text NOT NULL, \`name\` text, \`email\` text, \`loginMethod\` text, \`role\` text DEFAULT 'user' NOT NULL, \`createdAt\` integer DEFAULT (strftime('%s','now')) NOT NULL, \`updatedAt\` integer DEFAULT (strftime('%s','now')) NOT NULL, \`lastSignedIn\` integer DEFAULT (strftime('%s','now')) NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS \`users_openId_unique\` ON \`users\` (\`openId\`);
CREATE TABLE IF NOT EXISTS \`user_statuses\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`userId\` integer NOT NULL, \`status\` text DEFAULT 'trial' NOT NULL, \`activationCode\` text, \`activatedAt\` integer, \`trialStartedAt\` integer DEFAULT (strftime('%s','now')) NOT NULL, \`createdAt\` integer DEFAULT (strftime('%s','now')) NOT NULL, \`updatedAt\` integer DEFAULT (strftime('%s','now')) NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS \`user_statuses_userId_unique\` ON \`user_statuses\` (\`userId\`);
CREATE TABLE IF NOT EXISTS \`whitelist_codes\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`code\` text NOT NULL, \`description\` text, \`usedBy\` integer, \`usedAt\` integer, \`createdAt\` integer DEFAULT (strftime('%s','now')) NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS \`whitelist_codes_code_unique\` ON \`whitelist_codes\` (\`code\`);
CREATE TABLE IF NOT EXISTS \`magic_link_tokens\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`email\` text NOT NULL, \`token\` text NOT NULL, \`otp\` text NOT NULL, \`expiresAt\` integer NOT NULL, \`usedAt\` integer, \`createdAt\` integer DEFAULT (strftime('%s','now')) NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS \`magic_link_tokens_token_unique\` ON \`magic_link_tokens\` (\`token\`);
CREATE TABLE IF NOT EXISTS \`advisor_profiles\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`userId\` integer NOT NULL, \`adviserName\` text, \`companyName\` text, \`mobile\` text, \`contactInfo\` text, \`logoKey\` text, \`logoUrl\` text, \`createdAt\` integer DEFAULT (strftime('%s','now')) NOT NULL, \`updatedAt\` integer DEFAULT (strftime('%s','now')) NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS \`advisor_profiles_userId_unique\` ON \`advisor_profiles\` (\`userId\`);
`;

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

function resolveDbPath(): string {
  if (ENV.databasePath) return ENV.databasePath;
  const d1Path = findD1SqlitePath();
  if (d1Path) return d1Path;
  return path.resolve("./app.db");
}

type DrizzleDb = ReturnType<typeof drizzle>;
let _db: DrizzleDb | null = null;

function getDb(): DrizzleDb | null {
  if (!_db) {
    const dbPath = resolveDbPath();
    try {
      const isNew = !fs.existsSync(dbPath);
      const sqlite = new Database(dbPath);
      if (isNew) {
        console.log("[Database] New database — running schema bootstrap");
        sqlite.exec(BOOTSTRAP_SQL);
      }
      _db = drizzle(sqlite);
      console.log(`[Database] Connected: ${dbPath}`);
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
    const now = new Date();
    const values: InsertUser = {
      openId: user.openId,
      createdAt: now,  // explicit so Drizzle encode (÷1000) runs — not the raw SQL default
      updatedAt: now,
    };
    const updateSet: Record<string, unknown> = { updatedAt: now };

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
      values.lastSignedIn = now;
      updateSet.lastSignedIn = now;
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
  const now = new Date();
  await db
    .insert(advisorProfiles)
    .values({ userId, ...data, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: advisorProfiles.userId, set: { ...data, updatedAt: now } });
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
  await db.insert(whitelistCodes).values({ code: code.toUpperCase(), description, createdAt: new Date() });
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
  const now = new Date();
  await db
    .insert(userStatuses)
    .values({ userId, ...data, createdAt: now, updatedAt: now, trialStartedAt: data.trialStartedAt ?? now })
    .onConflictDoUpdate({ target: userStatuses.userId, set: { ...data, updatedAt: now } });
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
  await db.insert(magicLinkTokens).values({ email, token, otp, expiresAt, createdAt: new Date() });
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
