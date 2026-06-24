import { useState } from "react";
import { Bell, MessageSquare, Sun, Moon, Search, ChevronDown, LogOut, User, Settings, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useLogout, useTheme, useSidebar, useUnreadCount } from "@/hooks";
import { UserAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/dashboard":     "Dashboard",
  "/employees":     "Employees",
  "/departments":   "Departments",
  "/attendance":    "Attendance",
  "/leave":         "Leave Management",
  "/payroll":       "Payroll",
  "/reports":       "Reports & Analytics",
  "/notifications": "Notifications",
  "/documents":     "Documents",
  "/audit":         "Audit Logs",
  "/settings":      "Settings",
};

export function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();
  const { setMobileOpen } = useSidebar();
  const { data: unread } = useUnreadCount();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [msgOpen, setMsgOpen]         = useState(false);

  const pageTitle = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? "WorkSphere";
  const unreadCount = unread?.count ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 lg:px-6 shrink-0">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden rounded-xl p-2 text-muted-foreground hover:bg-accent"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="hidden text-base font-semibold text-foreground sm:block">{pageTitle}</h1>

      {/* Search */}
      <div className="relative ml-2 hidden flex-1 max-w-xs md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search employees, documents…"
          className="h-9 w-full rounded-xl border border-input bg-secondary/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        {/* Messages */}
        <div className="relative">
          <button
            onClick={() => { setMsgOpen(!msgOpen); setNotifOpen(false); setProfileOpen(false); }}
            className="rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-[18px] w-[18px]" />
          </button>
          {msgOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMsgOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-border bg-popover shadow-elevated">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-sm font-semibold text-foreground">Messages</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Internal messaging coming soon</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setMsgOpen(false); setProfileOpen(false); }}
            className="relative rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
            )}
          </button>
          {notifOpen && (
            <NotificationsDropdown onClose={() => setNotifOpen(false)} count={unreadCount} />
          )}
        </div>

        <div className="mx-2 h-6 w-px bg-border" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-accent transition-colors"
          >
            {user && <UserAvatar name={user.name} src={user.avatar} size="sm" />}
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{user?.role.toLowerCase()}</p>
            </div>
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-border bg-popover py-1.5 shadow-elevated">
                <div className="border-b border-border px-3.5 pb-2.5 pt-2">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  {[
                    { icon: User, label: "My Profile", to: "/settings" },
                    { icon: Settings, label: "Settings", to: "/settings" },
                  ].map(({ icon: Icon, label, to }) => (
                    <Link key={label} to={to} onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground" />{label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-border pt-1">
                  <button
                    onClick={() => logout.mutate()}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NotificationsDropdown({ onClose, count }: { onClose: () => void; count: number }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-border bg-popover shadow-elevated">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {count > 0 && <span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>}
        </div>
        <div className="py-2 max-h-72 overflow-y-auto">
          {count === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No new notifications</p>
          ) : (
            Array.from({ length: Math.min(count, 3) }).map((_, i) => (
              <div key={i} className={cn("flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer", i === 0 && "bg-primary/5")}>
                <div className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-primary" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Leave request pending</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Farhana Akter requested 3 days off — 5 min ago</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border p-2">
          <Link to="/notifications" onClick={onClose} className="flex w-full items-center justify-center rounded-xl py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
            View all notifications
          </Link>
        </div>
      </div>
    </>
  );
}
