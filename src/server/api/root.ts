import { createTRPCRouter } from "./trpc";
import { habit_router } from "./routers/habitRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  habit: habit_router,
});

// export type definition of API
export type AppRouter = typeof appRouter;
