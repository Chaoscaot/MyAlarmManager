import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { vehicles } from "~/server/db/schema";
import {eq} from "drizzle-orm";

export const vehiclesRouter = createTRPCRouter({
  all: protectedProcedure.query(
    async ({ ctx }) => await ctx.db.select().from(vehicles).where(eq(vehicles.userId, ctx.session.user.id)),
  ),
});
