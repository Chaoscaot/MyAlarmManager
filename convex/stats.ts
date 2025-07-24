import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const all = await ctx.db
      .query("alarms")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const result = all
      .map((alarm, index) => {
        if (index === 0 || !alarm.date) return null; // Skip invalid entries
        const prevAlarm = all[index - 1];
        if (!prevAlarm?.date) return null; // Skip if previous alarm's date is invalid
        return (
          (new Date(alarm.date).getTime() -
            new Date(prevAlarm.date).getTime()) /
          1000 /
          60 /
          60 /
          24
        );
      })
      .filter((time): time is number => time !== null); // Filter out null values

    const avgTime =
      result.reduce((acc, time) => acc + time, 0) / result.length || 0;
    const minTime = result.length > 0 ? Math.min(...result) : 0;
    const maxTime = result.length > 0 ? Math.max(...result) : 0;

    const positions = Object.values(
      all
        .filter((alarm) => alarm.vehicleId && alarm.seat)
        .map((alarm) => ({
          vehicle: alarm.vehicleId!,
          seat: alarm.seat,
        }))
        .reduce(
          (acc, curr) => {
            const key = `${curr.vehicle}-${curr.seat}`;
            if (!acc[key]) {
              acc[key] = { ...curr, count: 0 };
            }
            acc[key].count++;
            return acc;
          },
          {} as Record<
            string,
            { vehicle: Id<"vehicles">; seat: number; count: number }
          >,
        ),
    );

    positions.sort((a, b) => b.count - a.count);

    const locations = Object.entries(
      all
        .map((alarm) => alarm.address)
        .filter((address) => address)
        .reduce(
          (acc, address) => {
            acc[address] = (acc[address] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
    ).map(([address, count]) => ({ address, count }));

    locations.sort((a, b) => b.count - a.count);

    const keywords = Object.entries(
      all
        .map((alarm) => alarm.keyword)
        .filter((keyword) => keyword)
        .reduce(
          (acc, keyword) => {
            acc[keyword] = (acc[keyword] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
    ).map(([keyword, count]) => ({ keyword, count }));

    keywords.sort((a, b) => b.count - a.count);

    const times = all
      .map((alarm) => alarm.date)
      .filter((date) => date !== null);

    return {
      avgTime,
      minTime,
      maxTime,
      times: result,
      positions,
      locations,
      keywords,
      timesOfAlarms: times,
    };
  },
});
