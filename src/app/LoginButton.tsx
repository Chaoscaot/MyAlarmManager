"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "~/components/ui/button";

export function LoginButton() {
  const { signIn } = useAuthActions();
  return (
    <Button size="lg" className="w-full" onClick={() => signIn("google")}>
      Mit Google anmelden
    </Button>
  );
}
