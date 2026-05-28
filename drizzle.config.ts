import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

function findD1SqlitePath(): string {
  const d1Dir = path.resolve(".wrangler/state/v3/d1");
  try {
    const entries = fs.readdirSync(d1Dir, { recursive: true }) as string[];
    for (const entry of entries) {
      if (entry.endsWith(".sqlite") && !entry.includes("metadata")) {
        return `file:${path.join(d1Dir, entry)}`;
      }
    }
  } catch {
    // fall through
  }
  return "file:./.wrangler/state/v3/d1/miniflare-D1Database.sqlite";
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: findD1SqlitePath(),
  },
});
