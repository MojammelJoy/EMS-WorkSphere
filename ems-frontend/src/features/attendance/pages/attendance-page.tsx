import { useState } from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { UserAvatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { useAttendanceList, useTodayAttendance, useClockIn, useClockOut } from "@/hooks";
import type { AttendanceStatus } from "@/types";
import { ATTENDANCE_STATUS_LABELS } from "@/constants";

const STATUS_VARIANT: Record<AttendanceStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  PRESENT:  "success",
  LATE:     "warning",
  HALF_DAY: "warning",
  ABSENT:   "destructive",
  HOLIDAY:  "muted",
  WEEKEND:  "muted",
};

export default function AttendancePage() {
  const [search, setSearch] = useState("");

  const { data: today }         = useTodayAttendance();
  const { data: attendanceData, isLoading } = useAttendanceList();
  const clockIn  = useClockIn();
  const clockOut = useClockOut();

  const isClockedIn = !!today?.checkIn && !today?.checkOut;
  const records = (attendanceData?.data ?? []).filter((a) =>
    a.employee.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    present:  (attendanceData?.data ?? []).filter((a) => a.status === "PRESENT").length,
    absent:   (attendanceData?.data ?? []).filter((a) => a.status === "ABSENT").length,
    late:     (attendanceData?.data ?? []).filter((a) => a.status === "LATE").length,
    halfDay:  (attendanceData?.data ?? []).filter((a) => a.status === "HALF_DAY").length,
  };

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Track daily attendance, check-in/out times, and analytics"
        breadcrumbs={[{ label: "Attendance" }]}
      />

      <div className="space-y-5">
        {/* Clock in widget */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {isClockedIn ? "You're clocked in" : "Not clocked in yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isClockedIn
                    ? `Started at ${today?.checkIn} · ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`
                    : `Today is ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`}
                </p>
              </div>
              <Button
                onClick={() => isClockedIn ? clockOut.mutate({}) : clockIn.mutate({})}
                loading={clockIn.isPending || clockOut.isPending}
                variant={isClockedIn ? "outline" : "default"}
                size="lg"
                className="shrink-0"
              >
                {isClockedIn ? <><Timer className="h-4 w-4" /> Clock Out</> : <><CheckCircle2 className="h-4 w-4" /> Clock In</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Present",  value: stats.present,  icon: CheckCircle2, color: "text-success",     bg: "bg-success/10"     },
            { label: "Absent",   value: stats.absent,   icon: XCircle,      color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Late",     value: stats.late,     icon: AlertCircle,  color: "text-warning",     bg: "bg-warning/10"     },
            { label: "Half Day", value: stats.halfDay,  icon: Clock,        color: "text-primary",     bg: "bg-primary/10"     },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 py-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-4.5 w-4.5 ${color}`} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Tabs defaultValue="daily">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <TabsList>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            <SearchInput value={search} onChange={setSearch} placeholder="Search employee…" className="sm:max-w-xs" />
          </div>

          <TabsContent value="daily">
            <Card>
              <CardContent className="pt-5">
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full min-w-[700px] text-sm text-left">
                    <thead>
                      <tr className="border-y border-border bg-muted/40">
                        {["Employee", "Date", "Check In", "Check Out", "Hours", "Status"].map((h) => (
                          <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-muted" /></td></tr>
                        ))
                      ) : records.length === 0 ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">No records found</td></tr>
                      ) : records.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={a.employee.name} size="sm" />
                              <div>
                                <p className="font-medium text-foreground">{a.employee.name}</p>
                                <p className="text-xs text-muted-foreground">{a.employee.department.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">{formatDate(a.date)}</td>
                          <td className="px-5 py-3.5 font-medium text-foreground">{a.checkIn ?? <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-5 py-3.5 font-medium text-foreground">{a.checkOut ?? <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{a.workingHours ? `${a.workingHours}h` : "—"}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant={STATUS_VARIANT[a.status]} dot>{ATTENDANCE_STATUS_LABELS[a.status]}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                Calendar view coming soon — will show monthly attendance heatmap per employee.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
