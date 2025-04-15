import { api, HydrateClient } from "~/trpc/server";
import AgtPage from "./tables";

export default async function Page() {
  await api.agt.latest.prefetch();

  return (
    <HydrateClient>
      <AgtPage />
    </HydrateClient>
  );
}
