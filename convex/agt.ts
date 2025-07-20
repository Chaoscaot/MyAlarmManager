import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

export const latest = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const checks = await ctx.db
      .query("agtChecks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();

    const latestChecks = new Map<string, Doc<"agtChecks">>();
    for (const check of checks) {
      if (!latestChecks.has(check.type)) {
        latestChecks.set(check.type, check);
      }
    }

    return Array.from(latestChecks.values());
  },
});

export const add = mutation({
  args: {
    type: v.union(
      v.literal("G26"),
      v.literal("STRECKE"),
      v.literal("UNTERWEISUNG"),
      v.literal("UEBUNG"),
    ),
    year: v.number(),
    month: v.number(),
    validity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const check = {
      userId,
      type: args.type,
      year: args.year,
      month: args.month,
      validity: args.validity,
    };

    return ctx.db.insert("agtChecks", check);
  },
});
