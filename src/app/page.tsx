import { redirect } from "next/navigation";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { LoginButton } from "./LoginButton";
import BrandMark from "./_components/brand-mark";
import {
  PagerCursor,
  PagerDisplay,
  PagerLine,
} from "./_components/pager-display";

export default async function Home() {
  if (await isAuthenticatedNextjs()) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex items-center gap-3">
          <BrandMark />
          <span className="font-display text-2xl font-bold tracking-wide uppercase">
            MyAlarm
          </span>
        </div>

        <PagerDisplay label="Melder" status="bereit">
          <PagerLine line={0} className="text-xl">
            MYALARM MANAGER
          </PagerLine>
          <PagerLine line={1} className="mt-1 text-base opacity-80">
            Bitte anmelden
            <PagerCursor />
          </PagerLine>
        </PagerDisplay>

        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl leading-tight font-semibold tracking-wide uppercase">
            Ihr Einsatzbuch
          </h1>
          <p className="text-muted-foreground">
            Alarmierungen kommen per Webhook von Alamos an. Hier ergänzen Sie
            Fahrzeug und Position, sehen Ihre Statistik und behalten die
            AGT-Tauglichkeit im Blick.
          </p>
        </div>

        <LoginButton />
      </div>
    </main>
  );
}
