/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agt from "../agt.js";
import type * as alarms from "../alarms.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as stats from "../stats.js";
import type * as user from "../user.js";
import type * as vehicles from "../vehicles.js";
import type * as webhooks from "../webhooks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agt: typeof agt;
  alarms: typeof alarms;
  auth: typeof auth;
  http: typeof http;
  stats: typeof stats;
  user: typeof user;
  vehicles: typeof vehicles;
  webhooks: typeof webhooks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
