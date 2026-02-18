import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="lg:hidden flex items-center p-3 border-b bg-card">
            <SidebarTrigger>
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
          </div>
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}

