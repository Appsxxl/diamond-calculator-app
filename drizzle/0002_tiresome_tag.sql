PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_advisor_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`adviserName` text,
	`companyName` text,
	`mobile` text,
	`contactInfo` text,
	`logoKey` text,
	`logoUrl` text,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_advisor_profiles`("id", "userId", "adviserName", "companyName", "mobile", "contactInfo", "logoKey", "logoUrl", "createdAt", "updatedAt") SELECT "id", "userId", "adviserName", "companyName", "mobile", "contactInfo", "logoKey", "logoUrl", "createdAt", "updatedAt" FROM `advisor_profiles`;--> statement-breakpoint
DROP TABLE `advisor_profiles`;--> statement-breakpoint
ALTER TABLE `__new_advisor_profiles` RENAME TO `advisor_profiles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `advisor_profiles_userId_unique` ON `advisor_profiles` (`userId`);--> statement-breakpoint
CREATE TABLE `__new_magic_link_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`otp` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`usedAt` integer,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_magic_link_tokens`("id", "email", "token", "otp", "expiresAt", "usedAt", "createdAt") SELECT "id", "email", "token", "otp", "expiresAt", "usedAt", "createdAt" FROM `magic_link_tokens`;--> statement-breakpoint
DROP TABLE `magic_link_tokens`;--> statement-breakpoint
ALTER TABLE `__new_magic_link_tokens` RENAME TO `magic_link_tokens`;--> statement-breakpoint
CREATE UNIQUE INDEX `magic_link_tokens_token_unique` ON `magic_link_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `__new_user_statuses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`status` text DEFAULT 'trial' NOT NULL,
	`activationCode` text,
	`activatedAt` integer,
	`trialStartedAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_statuses`("id", "userId", "status", "activationCode", "activatedAt", "trialStartedAt", "createdAt", "updatedAt") SELECT "id", "userId", "status", "activationCode", "activatedAt", "trialStartedAt", "createdAt", "updatedAt" FROM `user_statuses`;--> statement-breakpoint
DROP TABLE `user_statuses`;--> statement-breakpoint
ALTER TABLE `__new_user_statuses` RENAME TO `user_statuses`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_statuses_userId_unique` ON `user_statuses` (`userId`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`lastSignedIn` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn") SELECT "id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE TABLE `__new_whitelist_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`usedBy` integer,
	`usedAt` integer,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_whitelist_codes`("id", "code", "description", "usedBy", "usedAt", "createdAt") SELECT "id", "code", "description", "usedBy", "usedAt", "createdAt" FROM `whitelist_codes`;--> statement-breakpoint
DROP TABLE `whitelist_codes`;--> statement-breakpoint
ALTER TABLE `__new_whitelist_codes` RENAME TO `whitelist_codes`;--> statement-breakpoint
CREATE UNIQUE INDEX `whitelist_codes_code_unique` ON `whitelist_codes` (`code`);