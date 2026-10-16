import { getAuthUserId } from "@convex-dev/auth/server";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { FORECAST_VERSION, fitModel, projectForecast } from "./forecastModel";

/*
 * The forecast is stored, not computed per request:
 * - every alarm write refits the model from the user's alarms (`refreshForecast`),
 * - an hourly cron moves the forecast along with the clock using the stored
 *   model only, without reading alarms (`refreshAll`),
 * - the dashboard just reads the stored row (`get`).
 */

function findRow(ctx: QueryCtx, userId: Id<"users">) {
  return ctx.db
    .query("forecasts")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

/** Refit from all of the user's alarms. Call after every alarm write. */
export async function refreshForecast(ctx: MutationCtx, userId: Id<"users">) {
  const alarms = await ctx.db
    .query("alarms")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();
  const now = Date.now();
  const model = fitModel(alarms, now);
  const row = {
    userId,
    version: FORECAST_VERSION,
    model,
    forecast: model ? projectForecast(model, now) : null,
  };

  const existing = await findRow(ctx, userId);
  if (existing) {
    await ctx.db.replace(existing._id, row);
  } else {
    await ctx.db.insert("forecasts", row);
  }
}

/** The stored forecast, or `null` if none has been computed for this user yet. */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const row = await findRow(ctx, userId);
    if (row?.version !== FORECAST_VERSION) return null;

    return {
      forecast: row.forecast,
      keyword: row.model?.keyword ?? null,
      address: row.model?.address ?? null,
    };
  },
});

/** Computes the forecast once for accounts that have none yet (or an outdated one). */
export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const row = await findRow(ctx, userId);
    if (row?.version === FORECAST_VERSION) return;

    await refreshForecast(ctx, userId);
  },
});

/** Hourly: shift every stored forecast to the current time. */
export const refreshAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    for (const row of await ctx.db.query("forecasts").collect()) {
      if (row.version !== FORECAST_VERSION) {
        await refreshForecast(ctx, row.userId);
      } else if (row.model) {
        await ctx.db.patch(row._id, {
          forecast: projectForecast(row.model, now),
        });
      }
    }
  },
});
