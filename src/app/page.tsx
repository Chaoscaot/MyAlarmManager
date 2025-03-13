import { auth } from "~/server/auth";
import {HydrateClient} from "~/trpc/server";
import {redirect} from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <HydrateClient>
      <h1>Logged In!</h1>
    </HydrateClient>
  );
}
