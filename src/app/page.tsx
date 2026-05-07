import { redirect } from "next/navigation";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { LoginButton } from "./LoginButton";

export default async function Home() {
  if (await isAuthenticatedNextjs()) {
    redirect("/dashboard");
  }

  return (
    <div className="grid h-screen place-items-center">
      <LoginButton />
    </div>
  );
}
