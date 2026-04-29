import React from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import Link from "next/link";
import { Activity, Car, FireExtinguisher, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "~/hooks/use-mobile";

function NavMain() {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <SidebarGroup>
      <SidebarMenu onClick={() => isMobile && toggleSidebar()}>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/dashboard"}>
              <LayoutDashboard />
              Statistiken
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/alarms"}>
              <FireExtinguisher />
              Einsätze
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/vehicles"}>
              <Car />
              Fahrzeuge
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/agt"}>
              <Activity />
              Tauglichkeit
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavMain;
