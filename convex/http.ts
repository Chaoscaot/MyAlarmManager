import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  pathPrefix: "/webhook/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    if (pathParts.length < 3) {
      return new Response(
        "Missing token path suffix, URL path should be in the form /webhook/[token]",
        {
          status: 400,
        },
      );
    }
    const token = pathParts[pathParts.length - 1];
    const webhook = await ctx.runQuery(internal.webhooks.get, { token });

    if (!webhook) {
      return new Response("Webhook not found", { status: 404 });
    }

    const user = await ctx.runQuery(internal.user.get, {
      userId: webhook.userId,
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const searchParams = url.searchParams;

    await ctx.runMutation(internal.alarms.create, {
      userId: webhook.userId,
      keyword: searchParams.get("keyword") || "",
      address: "",
      date: new Date().toISOString(),
      gone: false,
      vehicle: undefined,
      seat: 0,
    });

    return new Response();
  }),
});

export default http;
