import { getAuthUserId } from "@convex-dev/auth/server";
import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return ctx.db
      .query("webhooks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});

export const get = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("webhooks")
      .filter((q) => q.eq(q.field("token"), args.token))
      .first();
  },
});

export const remove = mutation({
  args: {
    id: v.id("webhooks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const webhook = await ctx.db.get(args.id);
    if (!webhook || webhook.userId !== userId) {
      throw new Error("Webhook not found or access denied");
    }
    return ctx.db.delete(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const webhook = {
      userId,
      name: args.name,
      token: crypto.randomUUID(),
    };
    return ctx.db.insert("webhooks", webhook);
  },
});
