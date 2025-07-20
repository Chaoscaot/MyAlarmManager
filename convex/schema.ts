import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // other "users" fields...
    wehrName: v.optional(v.string()),
    showEmail: v.optional(v.boolean()),
  }).index("email", ["email"]),
  webhooks: defineTable({
    userId: v.id("users"),
    token: v.string(),
    name: v.string(),
  }),
  vehicles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    callSign: v.string(),
    crew: v.union(
      v.literal("GRUPPE"),
      v.literal("STAFFEL"),
      v.literal("TRUPP"),
      v.literal("MTW"),
    ),
    staffelBenchSeats: v.boolean(),
  }),
  alarms: defineTable({
    userId: v.id("users"),
    keyword: v.string(),
    date: v.string(),
    gone: v.boolean(),
    vehicleId: v.optional(v.id("vehicles")),
    seat: v.number(),
    address: v.string(),
  }),
  agtChecks: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("G26"),
      v.literal("STRECKE"),
      v.literal("UNTERWEISUNG"),
      v.literal("UEBUNG"),
    ),
    year: v.number(),
    month: v.number(),
    validity: v.number(),
  }),
});
