import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {crewEnum, vehicles} from "~/server/db/schema";
import {eq} from "drizzle-orm";
import {z} from "zod";

export const vehiclesRouter = createTRPCRouter({
  all: protectedProcedure.query(
    async ({ ctx }) => await ctx.db.select().from(vehicles).where(eq(vehicles.userId, ctx.session.user.id)),
  ),
  create: protectedProcedure.input(z.object({
    name: z.string(),
    callSign: z.string(),
    crew: z.enum(crewEnum.enumValues)
  })).mutation(async ({ ctx, input }) => {
    await ctx.db.insert(vehicles).values({
      ...input,
      userId: ctx.session.user.id,
    })
  })
});
