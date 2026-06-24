import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Clock, CalendarDays,
  Wallet, BarChart3, Bell, FileText, ShieldCheck, Settings,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar, usePermissions, useUnreadCount } from "@/hooks";

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard",     label: "Dashboard",          icon: LayoutDashboard },
  { to: "/employees",     label: "Employees",           icon: Users,          roles: ["ADMIN", "HR"] },
  { to: "/departments",   label: "Departments",         icon: Building2,      roles: ["ADMIN", "HR"] },
  { to: "/attendance",    label: "Attendance",          icon: Clock },
  { to: "/leave",         label: "Leave Management",    icon: CalendarDays },
  { to: "/payroll",       label: "Payroll",             icon: Wallet,         roles: ["ADMIN"] },
  { to: "/reports",       label: "Reports",             icon: BarChart3,      roles: ["ADMIN", "HR"] },
  { to: "/notifications", label: "Notifications",       icon: Bell },
  { to: "/documents",     label: "Documents",           icon: FileText },
  { to: "/audit",         label: "Audit Logs",          icon: ShieldCheck,    roles: ["ADMIN"] },
  { to: "/settings",      label: "Settings",            icon: Settings },
];

export function Sidebar() {
  const { collapsed, mobileOpen, toggle, setMobileOpen } = useSidebar();
  const { can } = usePermissions();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const visibleItems = NAV_ITEMS.filter((item) =>
    !item.roles || can(item.roles)
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-[76px]" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4 shrink-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            N
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">WorkSphere</p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate">Enterprise Suite</p>
            </div>
          )}
          <button
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4">
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/dashboard"}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors relative",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.to === "/notifications" && unreadCount > 0 && (
                          <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground leading-none">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.to === "/notifications" && unreadCount > 0 && (
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse button */}
        <div className="border-t border-sidebar-border p-3 shrink-0">
          <button
            onClick={toggle}
            className="hidden lg:flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
          >
            {collapsed
              ? <ChevronRight className="h-4 w-4" />
              : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
