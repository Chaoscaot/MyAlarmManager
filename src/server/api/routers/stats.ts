import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import { alarms } from "~/server/db/schema";

export const statsRouter = createTRPCRouter({
  load: protectedProcedure.query(async ({ ctx }) => {
    const all = await ctx.db
      .select()
      .from(alarms)
      .where(eq(alarms.userId, ctx.session.user.id))
      .orderBy(alarms.date);

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

    const positions = await ctx.db
      .select({
        vehicle: alarms.vehicle,
        seat: alarms.seat,
        count: count(),
      })
      .from(alarms)
      .where(
        and(
          eq(alarms.userId, ctx.session.user.id),
          isNotNull(alarms.vehicle),
          isNotNull(alarms.seat),
        ),
      )
      .groupBy(alarms.vehicle, alarms.seat)
      .orderBy(desc(count()))
      .limit(10);

    const locations = await ctx.db
      .select({
        location: alarms.address,
        count: count(),
      })
      .from(alarms)
      .where(eq(alarms.userId, ctx.session.user.id))
      .groupBy(alarms.address)
      .orderBy(desc(count()))
      .limit(10);

    const keywords = await ctx.db
      .select({
        keyword: alarms.keyword,
        count: count(),
      })
      .from(alarms)
      .where(eq(alarms.userId, ctx.session.user.id))
      .groupBy(alarms.keyword)
      .orderBy(desc(count()))
      .limit(10);

    const timeOfDay = (
      await ctx.db
        .select({
          time: sql<string>`extract(hour from date) as time`,
          count: count(),
        })
        .from(alarms)
        .where(eq(alarms.userId, ctx.session.user.id))
        .groupBy(sql`time`)
    ).map((v) => ({
      time: (
        (Number(v.time) + new Date().getTimezoneOffset() - 1) %
        24
      ).toString(),
      count: v.count,
    }));

    return {
      avgTime,
      minTime,
      maxTime,
      times: result,
      positions,
      locations,
      keywords,
      timeOfDay,
    };
  }),
});
