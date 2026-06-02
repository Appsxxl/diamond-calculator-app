import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { advisorRouter } from "./advisor-router";
import { activationRouter } from "./activation-router";
import { authRouter } from "./auth-router";
import { feedRouter } from "./feed-router";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  advisor: advisorRouter,
  activation: activationRouter,
  feed: feedRouter,
});

export type AppRouter = typeof appRouter;
