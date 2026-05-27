import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";


/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const advisorProfiles = mysqlTable("advisor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  adviserName: varchar("adviserName", { length: 256 }),
  companyName: varchar("companyName", { length: 256 }),
  mobile: varchar("mobile", { length: 64 }),
  contactInfo: varchar("contactInfo", { length: 256 }),
  logoKey: varchar("logoKey", { length: 512 }),
  logoUrl: text("logoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdvisorProfile = typeof advisorProfiles.$inferSelect;
export type InsertAdvisorProfile = typeof advisorProfiles.$inferInsert;

export const whitelistCodes = mysqlTable("whitelist_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  description: varchar("description", { length: 256 }),
  usedBy: int("usedBy"),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhitelistCode = typeof whitelistCodes.$inferSelect;

export const userStatuses = mysqlTable("user_statuses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  status: mysqlEnum("status", ["team", "trial", "paid", "expired"]).default("trial").notNull(),
  activationCode: varchar("activationCode", { length: 64 }),
  activatedAt: timestamp("activatedAt"),
  trialStartedAt: timestamp("trialStartedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStatus = typeof userStatuses.$inferSelect;
