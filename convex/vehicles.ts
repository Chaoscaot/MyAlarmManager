import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const all = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    callSign: v.string(),
    crew: v.union(
      v.literal("GRUPPE"),
      v.literal("STAFFEL"),
      v.literal("TRUPP"),
      v.literal("MTW"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const vehicle = {
      userId,
      name: args.name,
      callSign: args.callSign,
      crew: args.crew,
      staffelBenchSeats: false,
    };
    return ctx.db.insert("vehicles", vehicle);
  },
});

export const remove = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const vehicle = await ctx.db.get(args.id);
    if (!vehicle || vehicle.userId !== userId) {
      throw new Error("Vehicle not found or access denied");
    }
    return ctx.db.delete(args.id);
  },
});
