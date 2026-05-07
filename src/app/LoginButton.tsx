"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "~/components/ui/button";

export function LoginButton() {
  const { signIn } = useAuthActions();
  return <Button onClick={() => signIn("google")}>Sign in with Google</Button>;
}
