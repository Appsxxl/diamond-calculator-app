import { int, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role").default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const advisorProfiles = sqliteTable("advisor_profiles", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().unique(),
  adviserName: text("adviserName"),
  companyName: text("companyName"),
  mobile: text("mobile"),
  contactInfo: text("contactInfo"),
  logoKey: text("logoKey"),
  logoUrl: text("logoUrl"),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type AdvisorProfile = typeof advisorProfiles.$inferSelect;
export type InsertAdvisorProfile = typeof advisorProfiles.$inferInsert;

export const whitelistCodes = sqliteTable("whitelist_codes", {
  id: int("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  description: text("description"),
  usedBy: int("usedBy"),
  usedAt: integer("usedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type WhitelistCode = typeof whitelistCodes.$inferSelect;

export const userStatuses = sqliteTable("user_statuses", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().unique(),
  status: text("status").default("trial").notNull(),
  activationCode: text("activationCode"),
  activatedAt: integer("activatedAt", { mode: "timestamp" }),
  trialStartedAt: integer("trialStartedAt", { mode: "timestamp" }).defaultNow().notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type UserStatus = typeof userStatuses.$inferSelect;

export const magicLinkTokens = sqliteTable("magic_link_tokens", {
  id: int("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  otp: text("otp").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  usedAt: integer("usedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;
