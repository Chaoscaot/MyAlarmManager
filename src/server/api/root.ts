import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import {alarmsRouter} from "~/server/api/routers/alarms";
import {hooksRouter} from "~/server/api/routers/hooks";
import {vehiclesRouter} from "~/server/api/routers/vehicles";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  alarms: alarmsRouter,
  hooks: hooksRouter,
  vehicles: vehiclesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
