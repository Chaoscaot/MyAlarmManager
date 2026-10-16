import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "move forecasts to the current hour",
  { minuteUTC: 0 },
  internal.forecast.refreshAll,
);

export default crons;
