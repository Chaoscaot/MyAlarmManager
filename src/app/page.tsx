import { redirect } from "next/navigation";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { LoginButton } from "./LoginButton";

export default async function Home() {
  if (!(await isAuthenticatedNextjs())) {
    return <LoginButton />;
  } else {
    redirect("/dashboard");
  }
}
