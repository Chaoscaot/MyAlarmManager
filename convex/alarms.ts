import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const all = query({
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
    return Promise.all(
      alarms.map(async (alarm) => {
        const vehicle = alarm.vehicleId
          ? await ctx.db.get(alarm.vehicleId)
          : null;
        return {
          alarms: alarm,
          vehicles: vehicle ? vehicle : null,
        };
      }),
    );
  },
});

export const create = internalMutation({
  args: {
    userId: v.id("users"),
    keyword: v.string(),
    address: v.string(),
    date: v.string(),
    gone: v.boolean(),
    vehicle: v.optional(v.id("vehicles")),
    seat: v.number(),
  },
  handler: async (ctx, args) => await ctx.db.insert("alarms", args),
});

export const add = mutation({
  args: {
    keyword: v.string(),
    address: v.optional(v.string()),
    date: v.optional(v.string()),
    gone: v.boolean(),
    vehicle: v.optional(v.id("vehicles")),
    seat: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const alarm = {
      userId,
      keyword: args.keyword,
      address: args.address ?? "",
      date: args.date ?? new Date().toISOString(),
      gone: args.gone,
      vehicleId: args.vehicle ?? undefined,
      seat: args.seat ?? 0,
    };
    ctx.runMutation(internal.alarms.create, alarm);
  },
});

export const update = mutation({
  args: {
    id: v.id("alarms"),
    keyword: v.string(),
    address: v.optional(v.string()),
    date: v.optional(v.string()),
    gone: v.boolean(),
    vehicle: v.optional(v.id("vehicles")),
    seat: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const alarm = await ctx.db.get(args.id);
    if (!alarm || alarm.userId !== userId) {
      throw new Error("Alarm not found or not authorized");
    }
    const up = {
      keyword: args.keyword,
      address: args.address ?? "",
      date: args.date ?? new Date().toISOString(),
      gone: args.gone,
      vehicleId: args.vehicle ?? undefined,
      seat: args.seat ?? 0,
    };
    return ctx.db.patch(args.id, up);
  },
});

export const remove = mutation({
  args: {
    id: v.id("alarms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const alarm = await ctx.db.get(args.id);
    if (!alarm || alarm.userId !== userId) {
      throw new Error("Alarm not found or not authorized");
    }
    return ctx.db.delete(args.id);
  },
});
