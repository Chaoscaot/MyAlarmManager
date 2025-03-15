"use client";

import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu} from "~/components/ui/sidebar";
import NavUser from "~/app/_components/nav-user";
import {type Session} from "next-auth";
import NavMain from "~/app/_components/nav-main";

export default function AppSidebar({ session }: Readonly<{ session: Session }>) {

  return <Sidebar>
    <SidebarHeader>
      <SidebarMenu>
        <h1 className="font-bold pl-1 py-2">MyAlarm Manager</h1>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain />
    </SidebarContent>
    <SidebarFooter>
      <NavUser session={session} />
    </SidebarFooter>
  </Sidebar>;
}
