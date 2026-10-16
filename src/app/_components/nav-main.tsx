import React from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Car, FireExtinguisher, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "~/hooks/use-mobile";

const items = [
  { href: "/dashboard", label: "Statistiken", icon: LayoutDashboard },
  { href: "/alarms", label: "Einsätze", icon: FireExtinguisher },
  { href: "/vehicles", label: "Fahrzeuge", icon: Car },
  { href: "/agt", label: "Tauglichkeit", icon: Activity },
];

function NavMain() {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu
        className="gap-0.5"
        onClick={() => isMobile && toggleSidebar()}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className="data-[active=true]:before:bg-feuerrot relative h-9 text-[15px] data-[active=true]:before:absolute data-[active=true]:before:inset-y-1.5 data-[active=true]:before:left-0 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-full"
              >
                <Link href={href} aria-current={isActive ? "page" : undefined}>
                  <Icon />
                  {label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavMain;
