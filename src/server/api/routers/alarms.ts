import {createTRPCRouter, protectedProcedure} from "~/server/api/trpc";
import {alarms, vehicles} from "~/server/db/schema";
import {and, eq} from "drizzle-orm";
import { z } from "zod";

export const alarmsRouter = createTRPCRouter({
    all: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.select().from(alarms).leftJoin(vehicles, eq(alarms.vehicle, vehicles.id)).where(eq(alarms.userId, ctx.session.user.id));
    }),
    add: protectedProcedure.input(z.object({
        keyword: z.string(),
        address: z.string().nullable(),
        date: z.date().nullable(),
        gone: z.boolean().nullable(),
        vehicle: z.string().uuid().nullable(),
        seat: z.number().max(16, "So viele Sitze gibt es nicht").nullable(),
    })).mutation(async ({ ctx, input }) => {
        await ctx.db.insert(alarms).values({
            userId: ctx.session.user.id,
            units: "",
            keyword: input.keyword,
            address: input.address,
            date: input.date ? new Date(input.date) : null,
            gone: input.gone,
            vehicle: input.vehicle,
            seat: input.seat,
        });
    }),
    del: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        await ctx.db.delete(alarms).where(and(eq(alarms.userId, ctx.session.user.id), eq(alarms.id, input)));
    }),
    edit: protectedProcedure.input(z.object({
        id: z.string(),
        keyword: z.string(),
        address: z.string().nullable(),
        date: z.date().nullable(),
        gone: z.boolean().nullable(),
        vehicle: z.string().uuid().nullable(),
        seat: z.number().max(16, "So viele Sitze gibt es nicht").nullable(),
    })).mutation(async ({ ctx, input }) => ctx.db.update(alarms).set({
        ...input,
        id: undefined,
    }).where(and(eq(alarms.userId, ctx.session.user.id), eq(alarms.id, input.id))))
});