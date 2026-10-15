"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import NavUser from "~/app/_components/nav-user";
import NavMain from "~/app/_components/nav-main";
import BrandMark from "~/app/_components/brand-mark";
import type { Doc } from "#/_generated/dataModel";

export default function AppSidebar({
  session,
}: Readonly<{ session: Doc<"users"> }>) {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-5 pb-4">
        <Link
          href="/dashboard"
          className="focus-visible:ring-sidebar-ring flex items-center gap-3 rounded-md outline-none focus-visible:ring-2"
        >
          <BrandMark />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold tracking-wide uppercase">
              MyAlarm
            </span>
            {session.wehrName ? (
              <span className="text-muted-foreground mt-1 text-xs">
                FF {session.wehrName}
              </span>
            ) : null}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session} />
      </SidebarFooter>
    </Sidebar>
  );
}
