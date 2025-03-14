import {type NextRequest} from "next/server";
import {db} from "~/server/db";
import {webhooks} from "~/server/db/schema";
import {eq} from "drizzle-orm";

export async function POST(request: NextRequest, { params }: { params: Promise<{ hook: string }> }) {
    const { hook } = await params;

    const webhook = await db.query.webhooks.findFirst({

    });

    if (!webhook) {
        return new Response("Invalid webhook token", { status: 401 });
    }


}