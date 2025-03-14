import { auth } from "~/server/auth";
import {api, HydrateClient} from "~/trpc/server";
import {redirect} from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const alarms = await api.alarms.all();

  return (
    <HydrateClient>
      <h1>Logged In!</h1>
      {alarms?.map(alarm => (
          <h2>{alarm.keyword}</h2>
      ))}
    </HydrateClient>
  );
}
