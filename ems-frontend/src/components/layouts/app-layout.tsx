import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useSidebar } from "@/hooks";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { collapsed } = useSidebar();
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "flex flex-1 flex-col min-w-0 transition-all duration-200",
        collapsed ? "lg:pl-[76px]" : "lg:pl-64"
      )}>
        <Topbar />
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
