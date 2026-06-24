import { useState } from "react";
import { Plus, Download, FileText, Filter, Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { UserAvatar } from "@/components/ui/avatar";
import { useEmployees, useDeleteEmployee, useDebounce } from "@/hooks";
import { formatDate, formatCurrency } from "@/lib/utils";
import { EMPLOYEE_STATUS_LABELS } from "@/constants";
import type { Employee, EmployeeStatus } from "@/types";

const LIMIT = 10;

const STATUS_VARIANT: Record<EmployeeStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  ACTIVE:     "success",
  ON_LEAVE:   "warning",
  INACTIVE:   "muted",
  TERMINATED: "destructive",
};

function exportCSV(employees: Employee[]) {
  const headers = ["Employee ID", "Name", "Department", "Designation", "Email", "Salary", "Status", "Joining Date"];
  const rows = employees.map((e) => [e.employeeId, e.name, e.department?.name ?? "", e.designation, e.email, String(e.salary), e.status, e.joiningDate]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "employees.csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(employees: Employee[]) {
  const rows = employees.map((e) => `<tr><td>${e.employeeId}</td><td>${e.name}</td><td>${e.department?.name ?? ""}</td><td>${e.designation}</td><td>${e.status}</td><td>${e.joiningDate}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><title>Employee Report</title><style>body{font-family:sans-serif;padding:24px}h2{margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#4f46e5;color:#fff;padding:8px 12px;text-align:left}td{padding:8px 12px;border-bottom:1px solid #e5e7eb}tr:nth-child(even) td{background:#f9fafb}</style></head><body><h2>Employee Report</h2><table><thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Status</th><th>Joining Date</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`;
  const w = window.open("", "_blank"); if (w) { w.document.write(html); w.document.close(); }
}

export default function EmployeeListPage() {
  const navigate    = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const debouncedSearch     = useDebounce(search);
  const deleteEmployee      = useDeleteEmployee();

  const { data, isLoading } = useEmployees({ page, limit: LIMIT, search: debouncedSearch });
  const employees = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Employees"
        description={data ? `${data.meta?.total ?? 0} total employees` : "Employees"}
        breadcrumbs={[{ label: "Employees" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportCSV(employees)}><Download className="h-4 w-4" />CSV</Button>
            <Button variant="outline" size="sm" onClick={() => exportPDF(employees)}><FileText className="h-4 w-4" />PDF</Button>
            <Button size="sm" onClick={() => navigate("/employees/new")}><Plus className="h-4 w-4" />Add Employee</Button>
          </>
        }
      />

      <Card>
        <CardContent className="pt-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, ID, department…" className="sm:max-w-xs" />
            <div className="flex items-center gap-2 sm:ml-auto">
              <Button variant="outline" size="sm"><Filter className="h-4 w-4" />Filters</Button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/40">
                  {["Employee", "Department", "Designation", "Joined", "Salary", "Status", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 w-full animate-pulse rounded bg-muted" /></td></tr>
                  ))
                ) : employees.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">No employees found</td></tr>
                ) : employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={emp.name} src={emp.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{emp.department?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{emp.designation}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(emp.joiningDate)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatCurrency(emp.salary)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={STATUS_VARIANT[emp.status]} dot>{EMPLOYEE_STATUS_LABELS[emp.status]}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/employees/${emp.id}`)} title="View"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/employees/${emp.id}/edit`)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete"
                          onClick={() => { if (confirm("Delete this employee?")) deleteEmployee.mutate(emp.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={data?.meta?.totalPages ?? 1} total={data?.meta?.total ?? 0} limit={LIMIT} onPageChange={setPage} />
        </CardContent>
      </Card>
    </>
  );
}
