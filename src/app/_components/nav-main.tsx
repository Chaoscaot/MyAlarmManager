import React from 'react';
import {
    SidebarGroup, SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "~/components/ui/sidebar";
import Link from "next/link";
import {FireExtinguisher, LayoutDashboard} from "lucide-react";

function NavMain() {
    return (
        <SidebarGroup>
            <SidebarMenu>
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
            </SidebarMenu>
        </SidebarGroup>
    );
}

export default NavMain;