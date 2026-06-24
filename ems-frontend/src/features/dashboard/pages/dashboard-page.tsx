import {
  Users, CheckCircle2, CalendarDays, Wallet, UserPlus, Building2,
  Cake, PartyPopper, Megaphone,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, timeAgo } from "@/lib/utils";
import {
  useDashboardStats, useAttendanceChart, useGrowthChart,
  useDeptDistribution, useLeaveChart, useActivities,
  useBirthdays, useHolidays, useAnnouncements,
} from "@/hooks";

const tooltipStyle = {
  borderRadius: "12px", border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))",
  fontSize: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
};
const axisStyle = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };

const FALLBACK_ATTENDANCE = [
  { day:"Mon", present:0, absent:0, late:0 }, { day:"Tue", present:0, absent:0, late:0 },
  { day:"Wed", present:0, absent:0, late:0 }, { day:"Thu", present:0, absent:0, late:0 },
  { day:"Fri", present:0, absent:0, late:0 },
];
const FALLBACK_GROWTH = Array.from({ length: 8 }, (_, i) => ({
  month: new Date(Date.now() - (7 - i) * 30 * 86400000).toLocaleDateString("en-US", { month: "short" }),
  employees: 0,
}));
const FALLBACK_DEPT = [{ name: "No data", value: 1, color: "#e2e8f0" }];
const FALLBACK_LEAVE = Array.from({ length: 6 }, (_, i) => ({
  month: new Date(Date.now() - (5 - i) * 30 * 86400000).toLocaleDateString("en-US", { month: "short" }),
  casual: 0, sick: 0, earned: 0,
}));

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: stats }        = useDashboardStats();
  const { data: attendanceRaw } = useAttendanceChart();
  const { data: growthRaw }     = useGrowthChart();
  const { data: deptRaw }       = useDeptDistribution();
  const { data: leaveRaw }      = useLeaveChart();
  const { data: activitiesRaw } = useActivities();
  const { data: birthdaysRaw }  = useBirthdays();
  const { data: holidaysRaw }   = useHolidays();
  const { data: announcementsRaw } = useAnnouncements();

  const attendanceData  = (attendanceRaw  as any[]) ?? FALLBACK_ATTENDANCE;
  const growthData      = (growthRaw      as any[]) ?? FALLBACK_GROWTH;
  const deptData        = (deptRaw        as any[]) ?? FALLBACK_DEPT;
  const leaveData       = (leaveRaw       as any[]) ?? FALLBACK_LEAVE;
  const activities      = (activitiesRaw  as any[]) ?? [];
  const birthdays       = (birthdaysRaw   as any[]) ?? [];
  const holidays        = (holidaysRaw    as any[]) ?? [];
  const announcements   = (announcementsRaw as any[]) ?? [];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening across your organization today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Employees"  value={String(stats?.totalEmployees ?? 0)}   delta={stats?.totalEmployeesDelta ? `+${stats.totalEmployeesDelta}` : undefined} deltaLabel="vs last month" icon={Users}        iconBgClassName="bg-primary/10" iconClassName="text-primary" />
        <StatCard label="Present Today"    value={String(stats?.presentToday ?? 0)}      delta={stats?.attendanceRate ? `${stats.attendanceRate}%` : undefined}             deltaLabel="attendance"    icon={CheckCircle2} iconBgClassName="bg-emerald-50 dark:bg-emerald-900/20" iconClassName="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="On Leave"         value={String(stats?.onLeave ?? 0)}            positive={false} icon={CalendarDays} iconBgClassName="bg-amber-50 dark:bg-amber-900/20" iconClassName="text-amber-600 dark:text-amber-400" />
        <StatCard label="Monthly Payroll"  value={formatCurrency(stats?.monthlyPayroll ?? 0)} icon={Wallet} iconBgClassName="bg-slate-100 dark:bg-slate-800" iconClassName="text-slate-600 dark:text-slate-400" />
        <StatCard label="New Hires"        value={String(stats?.newHires ?? 0)}           delta={stats?.newHires ? `+${stats.newHires}` : undefined} deltaLabel="this month" icon={UserPlus} iconBgClassName="bg-violet-50 dark:bg-violet-900/20" iconClassName="text-violet-600 dark:text-violet-400" />
        <StatCard label="Departments"      value={String(stats?.totalDepartments ?? 0)}   icon={Building2} iconBgClassName="bg-sky-50 dark:bg-sky-900/20" iconClassName="text-sky-600 dark:text-sky-400" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Attendance Overview</CardTitle><CardDescription>Last 7 days breakdown</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={attendanceData} margin={{ left:-20, right:8 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#4f46e5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day"  tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis               tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill:"hsl(var(--muted))", radius:6 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize:12 }} />
                <Bar dataKey="present" fill="url(#presentGrad)" radius={[6,6,0,0]} name="Present" maxBarSize={40} />
                <Bar dataKey="absent"  fill="#fca5a5"           radius={[6,6,0,0]} name="Absent"  maxBarSize={40} />
                <Bar dataKey="late"    fill="#fcd34d"           radius={[6,6,0,0]} name="Late"    maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Department Distribution</CardTitle><CardDescription>Headcount by team</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deptData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>
                  {deptData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {deptData.map((d: any) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Employee Growth</CardTitle><CardDescription>Total headcount over time</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growthData} margin={{ left:-20, right:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={["dataMin - 1","dataMax + 1"]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="employees" stroke="#4f46e5" strokeWidth={2.5} dot={{ r:4, fill:"#4f46e5" }} activeDot={{ r:6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leave Statistics</CardTitle><CardDescription>Monthly leave by type</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={leaveData} margin={{ left:-20, right:8 }}>
                <defs>
                  {(["casual","#4f46e5"],["sick","#f59e0b"],["earned","#10b981"]) && [["casual","#4f46e5"],["sick","#f59e0b"],["earned","#10b981"]].map(([k,c]) => (
                    <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="casual" stroke="#4f46e5" fill="url(#grad-casual)" strokeWidth={2} name="Casual" />
                <Area type="monotone" dataKey="sick"   stroke="#f59e0b" fill="url(#grad-sick)"   strokeWidth={2} name="Sick" />
                <Area type="monotone" dataKey="earned" stroke="#10b981" fill="url(#grad-earned)" strokeWidth={2} name="Earned" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {/* Activities */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
            ) : (
              <ul className="space-y-4">
                {activities.slice(0, 5).map((a: any) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="text-sm leading-snug">
                      <p className="text-foreground"><span className="font-semibold">{a.user}</span> {a.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.time)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Birthdays */}
        <Card>
          <CardHeader><CardTitle>Upcoming Birthdays</CardTitle></CardHeader>
          <CardContent>
            {birthdays.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming birthdays</p>
            ) : (
              <ul className="space-y-4">
                {birthdays.slice(0, 4).map((b: any) => (
                  <li key={b.employeeId} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-500">
                      <Cake className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.department}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-foreground">{b.date}</p>
                      {b.daysUntil === 0 && <p className="text-[10px] text-success">Today!</p>}
                      {b.daysUntil > 0  && <p className="text-[10px] text-muted-foreground">in {b.daysUntil}d</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Holidays */}
        <Card>
          <CardHeader><CardTitle>Upcoming Holidays</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {holidays.slice(0, 4).map((h: any) => (
                <li key={h.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PartyPopper className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.day}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground shrink-0">{h.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Announcements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No announcements</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {announcements.slice(0, 3).map((a: any) => (
                <div key={a.id} className="group rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                  <div className="mb-2 flex items-center gap-2">
                    <Megaphone className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{a.tag}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">{a.title}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{timeAgo(a.postedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
