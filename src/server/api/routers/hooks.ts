import {createTRPCRouter, protectedProcedure} from "~/server/api/trpc";
import {webhooks} from "~/server/db/schema";
import {and, eq} from "drizzle-orm";
import { z } from "zod";

export const hooksRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) =>
        ctx.db.select().from(webhooks).where(eq(webhooks.userId, ctx.session.user.id))),
    create: protectedProcedure.input(z.string()).output(z.string()).mutation(async ({ ctx, input }) => {
        const rng = new Uint8Array(32);
        crypto.getRandomValues(rng);
        const base64Rng = Buffer.from(rng).toString("hex");

        await ctx.db.insert(webhooks).values({
            name: input,
            token: base64Rng,
            userId: ctx.session.user.id,
        });

        return base64Rng;
    }),
    delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
        const tokens = await ctx.db.select().from(webhooks).where(and(eq(webhooks.id, input), eq(webhooks.userId, ctx.session.user.id)));

        if (!tokens) {
            throw new Error()
        }

        for (const token of tokens) {
            await ctx.db.delete(webhooks).where(eq(webhooks.id, token.id));
        }
    })
})