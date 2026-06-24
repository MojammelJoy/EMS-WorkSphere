import { Bell, Check, CheckCheck, CalendarDays, Wallet, Megaphone, Cake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useNotifications, useMarkRead, useMarkAllRead, useUnreadCount } from "@/hooks";
import type { NotificationType } from "@/types";

const TYPE_ICON: Record<NotificationType, React.FC<{ className?: string }>> = {
  LEAVE_REQUEST:     CalendarDays,
  LEAVE_APPROVED:    CalendarDays,
  LEAVE_REJECTED:    CalendarDays,
  PAYSLIP_GENERATED: Wallet,
  ANNOUNCEMENT:      Megaphone,
  BIRTHDAY:          Cake,
  SYSTEM:            Bell,
};
const TYPE_COLOR: Record<NotificationType, string> = {
  LEAVE_REQUEST:     "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  LEAVE_APPROVED:    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
  LEAVE_REJECTED:    "bg-red-50 text-red-600 dark:bg-red-900/20",
  PAYSLIP_GENERATED: "bg-violet-50 text-violet-600 dark:bg-violet-900/20",
  ANNOUNCEMENT:      "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
  BIRTHDAY:          "bg-pink-50 text-pink-600 dark:bg-pink-900/20",
  SYSTEM:            "bg-slate-100 text-slate-600 dark:bg-slate-800",
};

export default function NotificationsPage() {
  const { data, isLoading }  = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markRead    = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.data ?? [];
  const unreadCount   = unreadData?.count ?? 0;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        breadcrumbs={[{ label: "Notifications" }]}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" loading={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
              <CheckCheck className="h-4 w-4" />Mark all as read
            </Button>
          ) : undefined
        }
      />
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <CardTitle>All Notifications</CardTitle>
            {unreadCount > 0 && <Badge variant="default">{unreadCount} new</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">No new notifications</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notif) => {
                const Icon = TYPE_ICON[notif.type] ?? Bell;
                return (
                  <li key={notif.id} className={cn("flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/30 cursor-pointer", !notif.isRead && "bg-primary/[0.02]")}>
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5", TYPE_COLOR[notif.type])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm leading-snug", !notif.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                          {notif.title}
                        </p>
                        {!notif.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">{timeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.isRead && (
                      <button
                        className="shrink-0 mt-1 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Mark as read"
                        onClick={() => markRead.mutate(notif.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
