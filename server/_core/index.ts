import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { getMagicLinkByToken, markMagicLinkUsed } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.get("/", (_req, res) => {
    res.sendStatus(200);
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.get("/auth/verify", async (req, res) => {
    const token = typeof req.query.token === "string" ? req.query.token : null;
    const html = (title: string, msg: string, ok: boolean) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Plan B</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.card{background:#1e293b;border:1px solid #1e3a5f;border-radius:16px;padding:40px 32px;max-width:420px;width:90%;text-align:center}
h1{color:#f1f5f9;font-size:22px;margin:0 0 12px}p{color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px}
.badge{display:inline-block;padding:6px 16px;border-radius:8px;font-size:13px;font-weight:700}
.ok{background:rgba(16,185,129,0.15);color:#10b981}.err{background:rgba(239,68,68,0.15);color:#ef4444}</style>
</head><body><div class="card">
<p style="color:#64748b;font-size:13px;margin-bottom:16px">PLAN B</p>
<h1>${title}</h1><p>${msg}</p>
<span class="badge ${ok ? "ok" : "err"}">${ok ? "✓ Verified" : "✗ Invalid"}</span>
</div></body></html>`;

    if (!token) {
      res.status(400).send(html("Invalid Link", "No token was provided. Please request a new sign-in link.", false));
      return;
    }
    try {
      const record = await getMagicLinkByToken(token);
      if (!record || record.usedAt || record.expiresAt < new Date()) {
        res.status(400).send(html("Link Expired", "This sign-in link has already been used or has expired. Open the Plan B app and request a new one.", false));
        return;
      }
      await markMagicLinkUsed(record.id);
      res.send(html("Link Verified", "Your link is valid. Return to the Plan B app and enter the 6-digit code from your email to complete sign-in.", true));
    } catch {
      res.status(500).send(html("Error", "Something went wrong. Please try again.", false));
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const port = parseInt(process.env.PORT ?? "3000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`[api] server listening on 0.0.0.0:${port} (PORT env: ${process.env.PORT})`);
  });
}

startServer().catch(console.error);
