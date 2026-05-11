import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const alarms = await ctx.db
      .query("alarms")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    alarms.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return alarms;
  },
});
