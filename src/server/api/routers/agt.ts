import {
  AgtChecks,
  agtChecks,
  CheckType,
  CheckTypeValue,
} from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { desc, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { year } from "drizzle-orm/mysql-core";

export const agtRouter = createTRPCRouter({
  latest: protectedProcedure.query(async ({ ctx }) => {
    // Use a window function to get the latest check of each type in a single SQL query
    const latestChecks = await ctx.db.execute<AgtChecks>(sql`
        WITH UserChecks AS (SELECT * FROM ${agtChecks} WHERE ${agtChecks.userId} = ${ctx.session.user.id}),
        RankedChecks AS (SELECT *,
                ROW_NUMBER()
                OVER (PARTITION BY type ORDER BY year DESC, month DESC) as rn
        FROM UserChecks)
        SELECT *
        FROM RankedChecks
        WHERE rn = 1
    `);

    return latestChecks.map((check) => check);
  }),
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(CheckTypeValue),
        year: z.number().min(2000).max(2100),
        month: z.number().min(1).max(12),
        validity: z.number().min(1).max(3),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db.insert(agtChecks).values({
        userId: ctx.session.user.id,
        type: input.type,
        year: input.year,
        month: input.month,
        validity: input.validity,
      }),
    ),
});
