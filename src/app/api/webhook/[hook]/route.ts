import {type NextRequest} from "next/server";
import {db} from "~/server/db";
import {alarms} from "~/server/db/schema";

export async function GET(request: NextRequest, { params }: { params: Promise<{ hook: string }> }) {
    const { hook } = await params;

    const webhook = await db.query.webhooks.findFirst({
        where: ((webhooks, { eq }) => eq(webhooks.token, hook))
    });

    if (!webhook) {
        return new Response("Invalid webhook token", { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    await db.insert(alarms).values({
        userId: webhook.userId,
        date: new Date(),
        keyword: searchParams.get("keyword")!,
        units: searchParams.get("unit")!
    });

    return new Response("", {
        status: 200,
    })
}