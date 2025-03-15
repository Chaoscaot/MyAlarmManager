import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { auth } from "~/server/auth";
import {Separator} from "~/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList,
} from "~/components/ui/breadcrumb";
import AppSidebar from "~/app/_components/app-sidebar";
import {redirect} from "next/navigation";

export default async function RootLayout({
  children,
    modal
}: Readonly<{ children: React.ReactNode, modal: React.ReactNode }>) {
  const session = await auth();

  if (!session) {
      redirect("/")
  }

  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                      <BreadcrumbList>
                          <BreadcrumbItem className="hidden md:block">
                              <BreadcrumbLink href="/dashboard">
                                  MyAlarm-Manager
                              </BreadcrumbLink>
                          </BreadcrumbItem>
                      </BreadcrumbList>
                  </Breadcrumb>
              </div>
          </header>
          {children}
          {modal}
      </SidebarInset>
    </SidebarProvider>
  );
}
