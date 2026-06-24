import { useState } from "react";
import { Search, User, Settings, FileText, LogIn, LogOut, Trash2, Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { formatDate, timeAgo } from "@/lib/utils";
import { useAuditLogs } from "@/hooks";

type AuditAction = "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "SETTINGS";

interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: AuditAction;
  entity: string;
  description: string;
  ip: string;
  timestamp: string;
}

const ACTION_VARIANT: Record<AuditAction, React.ComponentProps<typeof Badge>["variant"]> = {
  LOGIN:    "success",
  LOGOUT:   "muted",
  CREATE:   "default",
  UPDATE:   "warning",
  DELETE:   "destructive",
  SETTINGS: "muted",
};

const ACTION_ICON: Record<AuditAction, React.ReactNode> = {
  LOGIN:    <LogIn    className="h-3.5 w-3.5" />,
  LOGOUT:   <LogOut   className="h-3.5 w-3.5" />,
  CREATE:   <Plus     className="h-3.5 w-3.5" />,
  UPDATE:   <Pencil   className="h-3.5 w-3.5" />,
  DELETE:   <Trash2   className="h-3.5 w-3.5" />,
  SETTINGS: <Settings className="h-3.5 w-3.5" />,
};

const MOCK_LOGS: AuditLog[] = [
  { id:"1",  user:"System Administrator", role:"ADMIN",    action:"LOGIN",    entity:"Auth",       description:"Logged in successfully",                          ip:"192.168.1.10", timestamp: new Date(Date.now() - 5   * 60000).toISOString() },
  { id:"2",  user:"System Administrator", role:"ADMIN",    action:"CREATE",   entity:"Employee",   description:"Created employee Lamia Sultana (EMP-1048)",        ip:"192.168.1.10", timestamp: new Date(Date.now() - 18  * 60000).toISOString() },
  { id:"3",  user:"Tasnim Jahan",         role:"HR",       action:"UPDATE",   entity:"Employee",   description:"Updated salary for Rakibul Hasan",                ip:"192.168.1.22", timestamp: new Date(Date.now() - 45  * 60000).toISOString() },
  { id:"4",  user:"System Administrator", role:"ADMIN",    action:"CREATE",   entity:"Department", description:"Created department Operations (OPS)",              ip:"192.168.1.10", timestamp: new Date(Date.now() - 2   * 3600000).toISOString() },
  { id:"5",  user:"Tasnim Jahan",         role:"HR",       action:"UPDATE",   entity:"Leave",      description:"Approved leave request for Farhana Akter",        ip:"192.168.1.22", timestamp: new Date(Date.now() - 3   * 3600000).toISOString() },
  { id:"6",  user:"System Administrator", role:"ADMIN",    action:"DELETE",   entity:"Employee",   description:"Deleted employee record EMP-1040",                ip:"192.168.1.10", timestamp: new Date(Date.now() - 5   * 3600000).toISOString() },
  { id:"7",  user:"Tasnim Jahan",         role:"HR",       action:"LOGIN",    entity:"Auth",       description:"Logged in successfully",                          ip:"192.168.1.22", timestamp: new Date(Date.now() - 6   * 3600000).toISOString() },
  { id:"8",  user:"System Administrator", role:"ADMIN",    action:"SETTINGS", entity:"System",     description:"Updated JWT token expiry settings",               ip:"192.168.1.10", timestamp: new Date(Date.now() - 24  * 3600000).toISOString() },
  { id:"9",  user:"System Administrator", role:"ADMIN",    action:"CREATE",   entity:"Payroll",    description:"Processed payroll for January 2025",              ip:"192.168.1.10", timestamp: new Date(Date.now() - 26  * 3600000).toISOString() },
  { id:"10", user:"Tasnim Jahan",         role:"HR",       action:"UPDATE",   entity:"Department", description:"Updated Engineering department head",             ip:"192.168.1.22", timestamp: new Date(Date.now() - 48  * 3600000).toISOString() },
  { id:"11", user:"Rakibul Hasan",        role:"EMPLOYEE", action:"LOGIN",    entity:"Auth",       description:"Logged in successfully",                          ip:"192.168.1.55", timestamp: new Date(Date.now() - 50  * 3600000).toISOString() },
  { id:"12", user:"System Administrator", role:"ADMIN",    action:"DELETE",   entity:"Document",   description:"Deleted expired document NID_Old_2020.pdf",       ip:"192.168.1.10", timestamp: new Date(Date.now() - 72  * 3600000).toISOString() },
];

const LIMIT = 8;

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useAuditLogs({ page, limit: LIMIT, search: search || undefined, entity: action !== "ALL" ? action : undefined });
  const logs      = data?.data ?? MOCK_LOGS;
  const totalPages = data?.meta?.totalPages ?? Math.ceil(MOCK_LOGS.length / LIMIT);
  const total      = data?.meta?.total ?? MOCK_LOGS.length;

  const filtered  = data ? logs : MOCK_LOGS.filter((l) => {
    const matchSearch = `${l.user} ${l.entity} ${l.description}`.toLowerCase().includes(search.toLowerCase());
    const matchAction = action === "ALL" || l.action === action;
    return matchSearch && matchAction;
  });
  const paginated = data ? logs : filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Track all system activity, user actions, and security events"
        breadcrumbs={[{ label: "Audit Logs" }]}
      />

      {/* Summary chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { label:"All",      value:"ALL",      count: MOCK_LOGS.length },
          { label:"Logins",   value:"LOGIN",    count: MOCK_LOGS.filter((l) => l.action === "LOGIN").length },
          { label:"Creates",  value:"CREATE",   count: MOCK_LOGS.filter((l) => l.action === "CREATE").length },
          { label:"Updates",  value:"UPDATE",   count: MOCK_LOGS.filter((l) => l.action === "UPDATE").length },
          { label:"Deletes",  value:"DELETE",   count: MOCK_LOGS.filter((l) => l.action === "DELETE").length },
        ].map((chip) => (
          <button
            key={chip.value}
            onClick={() => { setAction(chip.value); setPage(1); }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors border ${
              action === chip.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
            }`}
          >
            {chip.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${action === chip.value ? "bg-white/20" : "bg-muted"}`}>
              {chip.count}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          {/* Search */}
          <div className="mb-5 relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by user, entity, description…"
              className="h-9 w-full rounded-xl border border-input bg-secondary/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[780px] text-sm text-left">
              <thead>
                <tr className="border-y border-border bg-muted/40">
                  {["User", "Action", "Entity", "Description", "IP Address", "Time"].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">No audit logs found</td></tr>
                ) : paginated.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-xs">{(log as any).userName ?? (log as any).user}</p>
                          <p className="text-[11px] text-muted-foreground">{(log as any).userRole ?? (log as any).role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={ACTION_VARIANT[(log.action as AuditAction)] ?? "muted"} className="gap-1">
                        {ACTION_ICON[(log.action as AuditAction)]}
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />{log.entity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-[260px] truncate">{log.description}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{(log as any).ipAddress ?? (log as any).ip}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-foreground">{timeAgo((log as any).createdAt ?? (log as any).timestamp)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate((log as any).createdAt ?? (log as any).timestamp)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </CardContent>
      </Card>
    </>
  );
}
