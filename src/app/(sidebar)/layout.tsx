import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import Link from "next/link";
import BrandMark from "~/app/_components/brand-mark";
import AppSidebar from "~/app/_components/app-sidebar";
import { redirect } from "next/navigation";
import {
  convexAuthNextjsToken,
  isAuthenticatedNextjs,
} from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "#/_generated/api";

export default async function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  const session = await fetchQuery(
    api.user.currentuser,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  if (!(await isAuthenticatedNextjs()) || !session) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 md:hidden"
            aria-label="MyAlarm, zu den Statistiken"
          >
            <BrandMark className="size-5" />
            <span className="font-display text-lg font-bold tracking-wide uppercase">
              MyAlarm
            </span>
          </Link>
        </header>
        <div className="pb-10">{children}</div>
        {modal}
      </SidebarInset>
    </SidebarProvider>
  );
}
