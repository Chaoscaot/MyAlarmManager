import {createTRPCRouter, protectedProcedure} from "~/server/api/trpc";
import {alarms} from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const alarmsRouter = createTRPCRouter({
    all: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.select().from(alarms).where(eq(alarms.userId, ctx.session.user.id));
    }),
    add: protectedProcedure.input(z.object({
        keyword: z.string(),
        address: z.string().optional(),
        date: z.date(),
        gone: z.boolean(),
    })).mutation(async ({ ctx, input }) => {
        await ctx.db.insert(alarms).values({
            userId: ctx.session.user.id,
            units: "",
            keyword: input.keyword,
            address: input.address,
            date: new Date(input.date),
        });
    })
});