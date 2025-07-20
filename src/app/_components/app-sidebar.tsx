"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "~/components/ui/sidebar";
import NavUser from "~/app/_components/nav-user";
import NavMain from "~/app/_components/nav-main";
import { Doc } from "#/_generated/dataModel";

export default function AppSidebar({
  session,
}: Readonly<{ session: Doc<"users"> }>) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <h1 className="py-2 pl-1 font-bold">MyAlarm Manager</h1>
        </SidebarMenu>
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
