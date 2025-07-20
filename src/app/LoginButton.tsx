"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export function LoginButton() {
  const { signIn } = useAuthActions();
  return <button onClick={() => signIn("google")}>Sign in with Google</button>;
}
