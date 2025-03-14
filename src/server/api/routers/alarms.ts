import {createTRPCRouter, protectedProcedure} from "~/server/api/trpc";
import {alarms} from "~/server/db/schema";
import {eq} from "drizzle-orm";

export const alarmsRouter = createTRPCRouter({
    all: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.select().from(alarms).where(eq(alarms.userId, ctx.session.user.id));
    }),
});