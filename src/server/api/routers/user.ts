import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  saveSettings: protectedProcedure
    .input(
      z.object({
        wehrName: z.string().nullable().optional(),
        showEmail: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(users)
        .set({
          wehrName: input.wehrName,
          showEmail: input.showEmail,
        })
        .where(eq(users.id, ctx.session.user.id)),
    ),
});
